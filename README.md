# Conscious Particle

Conscious Particle is a cosmic-evolution prototype inspired by **Spore**, built with Three.js and designed to run entirely as a static site (GitHub Pages ready). Drift through gravity wells, absorb energy motes, evolve into new forms, and survive against hunters and stellar hazards.

## ✨ Gameplay Overview

- **Core loop:** absorb smaller entities, harvest energy near stars, avoid larger masses.
- **Gravity-first gameplay:** planets, stars, and black holes bend your trajectory.
- **Progression:** level up to unlock upgrades and evolution forms.
- **Abilities:** pulse shockwave, gravity well, warp dash, phase shift, solar siphon, echo drones.

## 🕹️ Controls

**Desktop**
- **WASD / Arrow Keys**: thrust
- **Space**: boost
- **Shift**: brake/stabilize
- **E**: primary ability
- **Q**: secondary ability
- **Esc**: pause

**Mobile**
- On-screen buttons appear for joystick + abilities.

## 🔁 Progression & Upgrades

Each level presents three randomized upgrades (rarity-based). Every 5 levels, you unlock a **new form**:

1. Photon Drifter
2. Grav Weaver
3. Void Leech
4. Titan Seed
5. Nova Sprinter

Upgrades can increase energy, shield, gravity resistance, magnet pickup, and more.

## 🎵 Optional Assets

The game runs without any assets. If you add optional audio files, place them here:

```
assets/sfx/pickup.mp3
assets/sfx/boost.mp3
assets/sfx/upgrade.mp3
assets/sfx/hit.mp3
assets/sfx/death.mp3
```

Textures can be placed under `assets/textures/` (procedural visuals will still work if missing).

## 🧪 Debug Keys (optional)

- **Not enabled by default**, but you can easily add them inside `src/game/Game.js`.

## 🧰 Local Development

```bash
npm install
npm run dev
```

## 📦 Build & Deploy (GitHub Pages)

1. Ensure `vite.config.js` has `base: "/Consciousparticle/"` (replace with your repo name if forked).
2. Commit and push to `main`.
3. GitHub Actions will build and deploy automatically to Pages.

Manual build:

```bash
npm run build
```

Preview locally:

```bash
npm run preview
```

The workflow publishes the `dist/` folder to GitHub Pages on each push to `main`.

## 📝 License

MIT — see [LICENSE](./LICENSE).
