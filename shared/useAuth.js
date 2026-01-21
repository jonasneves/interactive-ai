/**
 * React hook for authentication
 * Import from '../shared/useAuth.js' in sub-projects
 */

import { useState, useEffect } from 'react';

const STORAGE_KEYS = {
  user: 'auth_user'
};

function safeParseJSON(json) {
  if (!json) return null;
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function getPrefixForUser(user) {
  return user ? `pref_duke_${user.id}_` : 'pref_anon_';
}

/**
 * Hook to get current authenticated user and preferences
 */
export function useAuth() {
  const [user, setUser] = useState(() => {
    return safeParseJSON(localStorage.getItem(STORAGE_KEYS.user));
  });

  useEffect(() => {
    function handler(e) {
      if (e.key === STORAGE_KEYS.user) {
        setUser(safeParseJSON(e.newValue));
      }
    }
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  function getPreference(key, defaultValue = null) {
    const value = localStorage.getItem(getPrefixForUser(user) + key);
    if (value === null) return defaultValue;
    return safeParseJSON(value) ?? value;
  }

  function setPreference(key, value) {
    localStorage.setItem(getPrefixForUser(user) + key, JSON.stringify(value));
  }

  return {
    user,
    isAuthenticated: !!user,
    getPreference,
    setPreference
  };
}

export default useAuth;
