# Interactive AI

Educational AI/ML visualizations. React + Tailwind CSS.

Note: blue/purple Tailwind colors are intentional for educational clarity — overrides global Anti-AI-Slop color rules.

## Commands

- `make dev` — start all dev servers
- `make build` — build all projects
- `make build-rl` — build just reinforcement-learning

## Tailwind dynamic classes

Never use dynamic class names — Tailwind purges them at build time:

```jsx
// BAD
className={`bg-${color}-500`}

// GOOD — inline style for dynamic values
style={{ backgroundColor: '#3b82f6' }}

// GOOD — static conditional
className={isActive ? 'bg-blue-500' : 'bg-slate-700'}
```

## Module quality reference

New modules should match the bar of:
- `tier1/rl-loop-explorer.jsx` — animation and state transitions
- `tier1/mdp-playground.jsx` — interactive grid controls
- `tier1/discount-factor.jsx` — parameter controls with keyboard support

Each module needs: keyboard controls (arrow keys), hover states, explanation panel, mobile-responsive layout (`grid-cols-1 lg:grid-cols-2`).

## Structure

```
reinforcement-learning/
  tier1/    # Core RL concepts — highest quality, use as reference
  tier2/    # Value-based methods
  tier3/    # Policy-based methods
  tier4/    # Advanced topics
neural-networks/
convolutional-networks/
```
