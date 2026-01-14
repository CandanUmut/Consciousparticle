import * as THREE from "three";
import { clamp } from "../utils/Math.js";

const FORMS = {
  "Photon Drifter": {
    speed: 5,
    maxEnergy: 120,
    absorption: 1.2,
    shield: 30,
    passive: "Gains bonus energy near stars.",
    ability: "Warp Dash",
  },
  "Grav Weaver": {
    speed: 4.2,
    maxEnergy: 140,
    absorption: 1,
    shield: 45,
    passive: "Gravity resistance increases.",
    ability: "Gravity Well",
  },
  "Void Leech": {
    speed: 4,
    maxEnergy: 110,
    absorption: 1.3,
    shield: 35,
    passive: "Steals energy from hunters.",
    ability: "Phase Shift",
  },
  "Titan Seed": {
    speed: 3.2,
    maxEnergy: 160,
    absorption: 1.5,
    shield: 70,
    passive: "Growth multiplier on absorb.",
    ability: "Pulse Shockwave",
  },
  "Nova Sprinter": {
    speed: 5.5,
    maxEnergy: 100,
    absorption: 1,
    shield: 25,
    passive: "Chain boosts recharge faster.",
    ability: "Echo Drones",
  },
};

export const FORMS_LIST = Object.keys(FORMS);

export class Player {
  constructor() {
    this.form = "Photon Drifter";
    const base = FORMS[this.form];
    this.mass = 6;
    this.radius = 2.6;
    this.level = 1;
    this.xp = 0;
    this.nextLevel = 30;
    this.energy = base.maxEnergy;
    this.maxEnergy = base.maxEnergy;
    this.shield = base.shield;
    this.maxShield = base.shield;
    this.speed = base.speed;
    this.absorption = base.absorption;
    this.gravityResistance = 0;
    this.harvestBonus = 0;
    this.magnetRadius = 0;
    this.cooldownReduction = 0;
    this.orbitAssist = false;
    this.position = new THREE.Vector3();
    this.velocity = new THREE.Vector3();
    this.mesh = new THREE.Mesh(
      new THREE.SphereGeometry(1, 28, 28),
      new THREE.MeshStandardMaterial({ color: 0x68d6ff, emissive: 0x1f4c77 })
    );
    this.mesh.scale.setScalar(this.radius);
    this.abilities = {
      primary: { name: base.ability, cooldown: 0, maxCooldown: 8, energyCost: 25 },
      secondary: { name: "Solar Siphon", cooldown: 0, maxCooldown: 12, energyCost: 35 },
    };
    this.boosting = false;
    this.integrity = 100;
    this.maxIntegrity = 100;
    this.stats = {
      kills: 0,
      time: 0,
      maxMass: this.mass,
    };
  }

  applyUpgrade(upgrade) {
    upgrade.apply(this);
    if (upgrade.id === "form-choice" && upgrade.form) {
      this.setForm(upgrade.form);
    }
  }

  setForm(formName) {
    const base = FORMS[formName];
    if (!base) return;
    this.form = formName;
    this.speed = base.speed;
    this.maxEnergy = base.maxEnergy;
    this.energy = Math.min(this.energy, this.maxEnergy);
    this.maxShield = base.shield;
    this.shield = Math.min(this.shield, this.maxShield);
    this.absorption = base.absorption;
    this.abilities.primary.name = base.ability;
  }

  gainXp(amount) {
    this.xp += amount;
    if (this.xp >= this.nextLevel) {
      this.xp -= this.nextLevel;
      this.level += 1;
      this.nextLevel = Math.floor(this.nextLevel * 1.3);
      return true;
    }
    return false;
  }

  update(delta) {
    this.stats.time += delta;
    this.stats.maxMass = Math.max(this.stats.maxMass, this.mass);
    this.energy = clamp(this.energy + delta * 6, 0, this.maxEnergy);
    this.shield = clamp(this.shield + delta * 2, 0, this.maxShield);
    for (const ability of Object.values(this.abilities)) {
      ability.cooldown = clamp(ability.cooldown - delta * (1 + this.cooldownReduction), 0, ability.maxCooldown);
    }
  }

  takeDamage(amount) {
    const remaining = amount - this.shield;
    this.shield = clamp(this.shield - amount, 0, this.maxShield);
    if (remaining > 0) {
      this.integrity = clamp(this.integrity - remaining, 0, this.maxIntegrity);
    }
  }

  absorb(entity) {
    const gain = entity.mass * 0.2 * this.absorption;
    this.mass += gain;
    this.radius = Math.cbrt(this.mass) * 1.2;
    this.mesh.scale.setScalar(this.radius);
  }
}
