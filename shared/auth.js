/**
 * Duke OIDC Authentication Module
 */

const CONFIG = {
  clientId: 'interactiveai',
  authEndpoint: 'https://oauth.oit.duke.edu/oidc/authorize',
  tokenEndpoint: 'https://oauth.oit.duke.edu/oidc/token',
  userInfoEndpoint: 'https://oauth.oit.duke.edu/oidc/userinfo',
  scopes: 'openid profile email'
};

const STORAGE_KEYS = {
  accessToken: 'auth_access_token',
  user: 'auth_user',
  state: 'auth_oauth_state',
  verifier: 'auth_pkce_verifier'
};

// PKCE helpers
function generateRandomString(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, b => chars[b % chars.length]).join('');
}

async function sha256(plain) {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(hash)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function safeParseJSON(json) {
  if (!json) return null;
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * Get current user from localStorage
 */
export function getUser() {
  return safeParseJSON(localStorage.getItem(STORAGE_KEYS.user));
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated() {
  return !!localStorage.getItem(STORAGE_KEYS.accessToken) && !!getUser();
}

/**
 * Start login flow
 */
export async function login(redirectUri) {
  const state = generateRandomString(32);
  const verifier = generateRandomString(128);
  const challenge = await sha256(verifier);

  sessionStorage.setItem(STORAGE_KEYS.state, state);
  sessionStorage.setItem(STORAGE_KEYS.verifier, verifier);

  const authUrl = new URL(CONFIG.authEndpoint);
  authUrl.searchParams.set('client_id', CONFIG.clientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', CONFIG.scopes);
  authUrl.searchParams.set('state', state);
  authUrl.searchParams.set('code_challenge', challenge);
  authUrl.searchParams.set('code_challenge_method', 'S256');

  window.location.href = authUrl.toString();
}

/**
 * Handle OAuth callback
 */
export async function handleCallback(redirectUri) {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  const state = params.get('state');
  const error = params.get('error');

  if (error) {
    throw new Error(`Auth error: ${error} - ${params.get('error_description') || ''}`);
  }

  if (!code) {
    return null;
  }

  const savedState = sessionStorage.getItem(STORAGE_KEYS.state);
  if (state !== savedState) {
    throw new Error('State mismatch - possible CSRF attack');
  }

  const verifier = sessionStorage.getItem(STORAGE_KEYS.verifier);
  if (!verifier) {
    throw new Error('PKCE verifier not found');
  }

  // Exchange code for tokens
  const tokenResponse = await fetch(CONFIG.tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json'
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: CONFIG.clientId,
      code,
      redirect_uri: redirectUri,
      code_verifier: verifier
    })
  });

  const data = await tokenResponse.json();

  if (data.error) {
    throw new Error(`Token error: ${data.error} - ${data.error_description || ''}`);
  }

  const accessToken = data.access_token;
  localStorage.setItem(STORAGE_KEYS.accessToken, accessToken);

  // Clean up session
  sessionStorage.removeItem(STORAGE_KEYS.state);
  sessionStorage.removeItem(STORAGE_KEYS.verifier);

  // Fetch user info
  const userResponse = await fetch(CONFIG.userInfoEndpoint, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });

  if (!userResponse.ok) {
    throw new Error(`UserInfo error: ${userResponse.status}`);
  }

  const rawUser = await userResponse.json();
  const user = {
    ...rawUser,
    id: rawUser.dukeNetID,
    displayName: rawUser.name || rawUser.dukeNetID
  };
  localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));

  // Clean URL
  window.history.replaceState(null, '', window.location.pathname);

  return user;
}

/**
 * Logout - clear local state
 */
export function logout() {
  localStorage.removeItem(STORAGE_KEYS.accessToken);
  localStorage.removeItem(STORAGE_KEYS.user);
  sessionStorage.removeItem(STORAGE_KEYS.state);
  sessionStorage.removeItem(STORAGE_KEYS.verifier);
}

// Preferences stored in localStorage with user prefix
function getPrefixForUser(user) {
  return user ? `pref_duke_${user.id}_` : 'pref_anon_';
}

/**
 * Get user preference
 */
export function getPreference(key, defaultValue = null) {
  const value = localStorage.getItem(getPrefixForUser(getUser()) + key);
  if (value === null) return defaultValue;
  return safeParseJSON(value) ?? value;
}

/**
 * Set user preference
 */
export function setPreference(key, value) {
  localStorage.setItem(getPrefixForUser(getUser()) + key, JSON.stringify(value));
}

/**
 * Subscribe to auth state changes
 */
export function onAuthStateChange(callback) {
  const handler = (e) => {
    if (e.key === STORAGE_KEYS.user) {
      callback(e.newValue ? JSON.parse(e.newValue) : null);
    }
  };
  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
}

export default {
  getUser,
  isAuthenticated,
  login,
  handleCallback,
  logout,
  getPreference,
  setPreference,
  onAuthStateChange
};
