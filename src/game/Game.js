import * as THREE from "three";
import { World } from "./World.js";
import { Player } from "./Player.js";
import { applyGravity, applyDrag, integrate, collisionDamage } from "./Physics.js";
import { rollUpgrades } from "./Upgrades.js";
import { AudioManager } from "./Audio.js";
import { Effects } from "./Effects.js";
import { clamp, normalizeVec, randRange } from "../utils/Math.js";
import { loadFromStorage, saveToStorage } from "../utils/Storage.js";
import { ENTITY_TYPES } from "./Entities.js";

export class Game {
  constructor({ canvas, ui }) {
    this.canvas = canvas;
    this.ui = ui;
    this.state = "MainMenu";
    this.clock = new THREE.Clock();
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x05070f, 90, 420);
    this.camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 900);
    this.camera.position.set(0, 20, 30);
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x030408, 1);

    this.settings = loadFromStorage("settings", {
      orbitAssist: false,
      screenShake: true,
      quality: "high",
      volume: 0.6,
      muted: false,
      cinematic: false,
    });
    this.stats = loadFromStorage("best", { time: 0, maxMass: 0, level: 1, kills: 0 });

    this.player = new Player();
    this.world = new World(this.scene);
    this.effects = new Effects(this.scene);
    this.audio = new AudioManager();

    this.scene.add(this.player.mesh);
    this.createLighting();
    this.createStarfield();

    this.inputs = { forward: false, backward: false, left: false, right: false, boost: false, brake: false, ability: false, secondary: false };
    this.pointer = new THREE.Vector2();
    this.audio.setVolume(this.settings.volume);
    this.audio.setMuted(this.settings.muted);

    this.shake = 0;
    this.bindEvents();
    this.setupMenus();
    this.lastBiome = "cool";
  }

  bindEvents() {
    window.addEventListener("resize", () => this.onResize());
    window.addEventListener("keydown", (event) => this.onKey(event, true));
    window.addEventListener("keyup", (event) => this.onKey(event, false));
    window.addEventListener("pointermove", (event) => {
      this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    });
    this.canvas.addEventListener("click", () => {
      this.audio.ensureContext();
      if (this.state === "MainMenu") {
        this.startGame();
      }
    });
    this.bindMobileControls();
  }

  bindMobileControls() {
    const bindButton = (action, key) => {
      const button = this.ui.mobileControls.querySelector(`[data-action='${action}']`);
      if (!button) return;
      button.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        this.inputs[key] = true;
      });
      button.addEventListener("pointerup", (event) => {
        event.preventDefault();
        this.inputs[key] = false;
      });
      button.addEventListener("pointerleave", () => {
        this.inputs[key] = false;
      });
    };
    bindButton("left", "left");
    bindButton("right", "right");
    bindButton("up", "forward");
    bindButton("down", "backward");
    bindButton("boost", "boost");
    bindButton("ability", "ability");
    bindButton("secondary", "secondary");
  }

  setupMenus() {
    this.ui.mainMenu.querySelector("[data-action='start']").addEventListener("click", () => this.startGame());
    this.ui.mainMenu.querySelector("[data-action='how']").addEventListener("click", () => {
      alert("Controls: WASD / arrows to thrust, Space to boost, Shift to brake, E/Q abilities, Esc pause.");
    });
    this.ui.pauseMenu.querySelector("[data-action='resume']").addEventListener("click", () => this.resume());
    this.ui.pauseMenu.querySelector("[data-action='quit']").addEventListener("click", () => this.reset());
    this.ui.gameOverMenu.querySelector("[data-action='restart']").addEventListener("click", () => this.reset());

    this.ui.upgradeMenu.onSelect = (upgrade) => {
      if (upgrade.isForm) {
        this.player.setForm(upgrade.form);
      } else {
        this.player.applyUpgrade(upgrade);
      }
      this.state = "Playing";
    };
  }

  createLighting() {
    const ambient = new THREE.AmbientLight(0x4e73ff, 0.35);
    const key = new THREE.DirectionalLight(0xffffff, 0.8);
    key.position.set(10, 20, 10);
    this.scene.add(ambient, key);
  }

  createStarfield() {
    const stars = new THREE.BufferGeometry();
    const starCount = this.settings.quality === "low" ? 700 : this.settings.quality === "med" ? 1100 : 1600;
    const positions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i += 1) {
      positions[i * 3] = randRange(-500, 500);
      positions[i * 3 + 1] = randRange(-500, 500);
      positions[i * 3 + 2] = randRange(-500, 500);
    }
    stars.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({ color: 0xffffff, size: 1.2, sizeAttenuation: true });
    const points = new THREE.Points(stars, material);
    this.scene.add(points);
  }

  startGame() {
    this.state = "Playing";
    this.ui.mainMenu.classList.remove("active");
    this.clock.start();
    this.audio.ensureContext();
    this.audio.load();
    this.player.position.set(0, 0, 0);
    this.player.velocity.set(0, 0, 0);
  }

  pause() {
    this.state = "Paused";
    this.clock.stop();
    this.ui.showPause(this.createSettingsControls());
  }

  resume() {
    this.state = "Playing";
    this.clock.start();
    this.ui.hidePause();
  }

  reset() {
    saveToStorage("best", this.stats);
    window.location.reload();
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  onKey(event, pressed) {
    const key = event.key.toLowerCase();
    if (key === "escape" && pressed) {
      if (this.state === "Playing") this.pause();
      else if (this.state === "Paused") this.resume();
      return;
    }
    if (this.state !== "Playing") return;
    if (["w", "arrowup"].includes(key)) this.inputs.forward = pressed;
    if (["s", "arrowdown"].includes(key)) this.inputs.backward = pressed;
    if (["a", "arrowleft"].includes(key)) this.inputs.left = pressed;
    if (["d", "arrowright"].includes(key)) this.inputs.right = pressed;
    if (key === " ") this.inputs.boost = pressed;
    if (key === "shift") this.inputs.brake = pressed;
    if (key === "e") this.inputs.ability = pressed;
    if (key === "q") this.inputs.secondary = pressed;
  }

  createSettingsControls() {
    const toggles = [];
    const addToggle = (label, key) => {
      const wrapper = document.createElement("label");
      const input = document.createElement("input");
      input.type = "checkbox";
      input.checked = this.settings[key];
      input.addEventListener("change", () => {
        this.settings[key] = input.checked;
        saveToStorage("settings", this.settings);
      });
      wrapper.append(label, input);
      toggles.push(wrapper);
    };
    addToggle("Orbit Assist", "orbitAssist");
    addToggle("Screen Shake", "screenShake");
    addToggle("Cinematic Orbit", "cinematic");

    const volume = document.createElement("label");
    volume.textContent = "Volume";
    const slider = document.createElement("input");
    slider.type = "range";
    slider.min = "0";
    slider.max = "1";
    slider.step = "0.05";
    slider.value = this.settings.volume;
    slider.addEventListener("input", () => {
      this.settings.volume = Number(slider.value);
      this.audio.setVolume(this.settings.volume);
      saveToStorage("settings", this.settings);
    });
    volume.append(slider);
    toggles.push(volume);

    const mute = document.createElement("label");
    mute.textContent = "Mute";
    const muteCheck = document.createElement("input");
    muteCheck.type = "checkbox";
    muteCheck.checked = this.settings.muted;
    muteCheck.addEventListener("change", () => {
      this.settings.muted = muteCheck.checked;
      this.audio.setMuted(this.settings.muted);
      saveToStorage("settings", this.settings);
    });
    mute.append(muteCheck);
    toggles.push(mute);

    const quality = document.createElement("label");
    quality.textContent = "Graphics Quality";
    const qualitySelect = document.createElement("select");
    ["low", "med", "high"].forEach((level) => {
      const option = document.createElement("option");
      option.value = level;
      option.textContent = level;
      if (this.settings.quality === level) option.selected = true;
      qualitySelect.append(option);
    });
    qualitySelect.addEventListener("change", () => {
      this.settings.quality = qualitySelect.value;
      saveToStorage("settings", this.settings);
    });
    quality.append(qualitySelect);
    toggles.push(quality);

    return toggles;
  }

  updateControls(delta) {
    const thrust = new THREE.Vector3();
    if (this.inputs.forward) thrust.y += 1;
    if (this.inputs.backward) thrust.y -= 1;
    if (this.inputs.left) thrust.x -= 1;
    if (this.inputs.right) thrust.x += 1;
    if (thrust.length() > 0) {
      thrust.normalize();
      const energyCost = delta * 8;
      if (this.player.energy > energyCost) {
        this.player.energy -= energyCost;
        this.player.velocity.addScaledVector(thrust, delta * this.player.speed);
      }
    }

    if (this.inputs.boost && this.player.energy > 5) {
      const [dirX, dirY] = normalizeVec(this.pointer.x, this.pointer.y);
      const boostVector = new THREE.Vector3(dirX, dirY, 0).multiplyScalar(delta * this.player.speed * 3.5);
      this.player.velocity.add(boostVector);
      this.player.energy = clamp(this.player.energy - delta * 25 * (this.player.boostEfficiency ?? 1), 0, this.player.maxEnergy);
      if (Math.random() > 0.7) this.audio.play("boost");
    }

    if (this.inputs.brake && this.player.energy > 2) {
      applyDrag(this.player, delta, 0.8);
      this.player.energy = clamp(this.player.energy - delta * 12, 0, this.player.maxEnergy);
    }

    if (this.inputs.ability) this.activateAbility("primary");
    if (this.inputs.secondary) this.activateAbility("secondary");
  }

  activateAbility(slot) {
    const ability = this.player.abilities[slot];
    if (!ability || ability.cooldown > 0 || this.player.energy < ability.energyCost) return;
    this.player.energy -= ability.energyCost;
    ability.cooldown = ability.maxCooldown;
    if (ability.name === "Pulse Shockwave") {
      this.effects.spawnImpact(this.player.position, 0x68d6ff, 24);
      this.shake = 0.3;
    }
    if (ability.name === "Gravity Well") {
      this.world.addEntity(ENTITY_TYPES.PLANET);
    }
    if (ability.name === "Warp Dash") {
      this.player.position.add(new THREE.Vector3(randRange(-4, 4), randRange(-4, 4), 0));
      this.effects.spawnImpact(this.player.position, 0x68d6ff, 18);
    }
    if (ability.name === "Phase Shift") {
      this.player.phase = 1.5;
    }
    if (ability.name === "Echo Drones") {
      this.player.drones = 3;
    }
    if (ability.name === "Solar Siphon") {
      this.player.siphon = 4;
    }
    this.audio.play("upgrade");
  }

  updateCamera(delta) {
    const zoom = clamp(this.player.radius * 1.6, 18, 60);
    const desired = new THREE.Vector3(this.player.position.x, this.player.position.y + zoom * 0.6, this.player.position.z + zoom);
    this.camera.position.lerp(desired, delta * 2.2);
    if (this.settings.cinematic) {
      this.camera.position.x += Math.sin(this.player.stats.time * 0.2) * 2;
      this.camera.position.z += Math.cos(this.player.stats.time * 0.2) * 2;
    }
    if (this.settings.screenShake && this.shake > 0) {
      this.camera.position.add(new THREE.Vector3(randRange(-1, 1), randRange(-1, 1), randRange(-1, 1)).multiplyScalar(this.shake));
      this.shake -= delta * 0.8;
    }
    this.camera.lookAt(this.player.position);
  }

  updateBiome() {
    const nearStar = this.world.gravitySources.some(
      (source) => source.type === ENTITY_TYPES.STAR && source.position.distanceTo(this.player.position) < source.radius * 6
    );
    const nearHole = this.world.gravitySources.some(
      (source) => source.type === ENTITY_TYPES.BLACK_HOLE && source.position.distanceTo(this.player.position) < source.radius * 5
    );
    let biome = "cool";
    if (nearStar) biome = "warm";
    if (nearHole) biome = "void";
    if (biome !== this.lastBiome) {
      this.lastBiome = biome;
      const colors = { cool: 0x05070f, warm: 0x1a0d05, void: 0x13061f };
      this.renderer.setClearColor(colors[biome], 1);
    }
  }

  updateGameplay(delta) {
    this.updateControls(delta);

    applyGravity(this.player, this.world.gravitySources, delta, this.player.gravityResistance);
    if (this.settings.orbitAssist || this.player.orbitAssist) {
      applyDrag(this.player, delta, 0.12);
    }
    integrate(this.player, delta);

    this.player.mesh.position.copy(this.player.position);

    const difficulty = clamp(this.player.mass / 40, 0, 4);
    this.world.update(delta, difficulty);

    const nearStar = this.world.gravitySources.find(
      (source) => source.type === ENTITY_TYPES.STAR && source.position.distanceTo(this.player.position) < source.radius * 6
    );
    if (this.player.siphon && nearStar) {
      const harvest = delta * 18 * (1 + this.player.harvestBonus);
      this.player.energy = clamp(this.player.energy + harvest, 0, this.player.maxEnergy);
      this.player.xp += delta * 4;
      if (nearStar.position.distanceTo(this.player.position) < nearStar.radius * 2.4) {
        this.player.takeDamage(delta * 8);
        this.shake = 0.2;
      }
      this.player.siphon -= delta;
    }
    if (this.player.drones) {
      this.player.drones -= delta * 0.4;
      if (this.player.drones <= 0) this.player.drones = 0;
    }

    for (const hunter of this.world.hunters) {
      const toPlayer = new THREE.Vector3().subVectors(this.player.position, hunter.position);
      const distance = toPlayer.length();
      if (distance < 140) {
        toPlayer.normalize();
        hunter.velocity.addScaledVector(toPlayer, delta * 0.6);
      }
      hunter.mesh.position.copy(hunter.position);
    }

    const toRemove = [];
    for (const entity of this.world.entities) {
      const distance = entity.position.distanceTo(this.player.position);
      const dronesBonus = this.player.drones ? 6 : 0;
      const magnetRange = this.player.radius + 4 + this.player.magnetRadius + dronesBonus;
      if (entity.type === ENTITY_TYPES.MOTE && distance < magnetRange) {
        entity.position.lerp(this.player.position, delta * 6);
      }
      if (distance < entity.radius + this.player.radius && !this.player.phase) {
        if (entity.mass < this.player.mass * 0.85) {
          this.player.absorb(entity);
          const leveled = this.player.gainXp(entity.mass * 1.4);
          toRemove.push(entity);
          this.effects.spawnImpact(entity.position, 0x68d6ff, 16);
          this.audio.play("pickup");
          if (leveled) {
            this.state = "UpgradeSelection";
            const upgrades = rollUpgrades(this.player.level);
            const formChoice = upgrades.find((upgrade) => upgrade.isForm);
            if (formChoice) {
              this.ui.upgradeMenu.showFormChoice(formChoice);
            } else {
              this.ui.upgradeMenu.show(upgrades);
            }
          }
        } else {
          const damage = collisionDamage(this.player, entity);
          this.player.takeDamage(damage);
          this.effects.spawnImpact(this.player.position, 0xff6b6b, 10);
          this.audio.play("hit");
          this.shake = 0.4;
        }
      }
    }

    toRemove.forEach((entity) => this.world.removeEntity(entity));

    if (this.player.phase) {
      this.player.phase -= delta;
    }

    this.player.update(delta);

    if (this.player.integrity <= 0) {
      this.state = "GameOver";
      this.stats = {
        time: Math.max(this.stats.time, this.player.stats.time),
        maxMass: Math.max(this.stats.maxMass, this.player.stats.maxMass),
        level: Math.max(this.stats.level, this.player.level),
        kills: Math.max(this.stats.kills, this.player.stats.kills),
      };
      saveToStorage("best", this.stats);
      this.ui.showGameOver({ ...this.player.stats, level: this.player.level });
      this.audio.play("death");
    }
  }

  update() {
    const delta = Math.min(this.clock.getDelta(), 0.04);
    if (this.state === "Playing") {
      this.updateGameplay(delta);
    }
    this.updateCamera(delta);
    this.effects.update(delta);
    this.updateBiome();
    this.ui.updateHUD(this.player, this.state, this.world.entities);
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(() => this.update());
  }
}
