import { randChoice } from "../utils/Math.js";
import { FORMS_LIST } from "./Player.js";

const rarityRoll = () => {
  const roll = Math.random();
  if (roll > 0.92) return "epic";
  if (roll > 0.72) return "rare";
  return "common";
};

const upgradePool = [
  {
    id: "mass-gain",
    name: "Assimilation Boost",
    description: "+20% mass gain from absorption.",
    tags: ["growth"],
    apply: (player) => {
      player.absorption += 0.2;
    },
  },
  {
    id: "max-energy",
    name: "Expanded Core",
    description: "+25 max energy.",
    tags: ["energy"],
    apply: (player) => {
      player.maxEnergy += 25;
      player.energy += 25;
    },
  },
  {
    id: "boost-efficiency",
    name: "Ion Spars",
    description: "Boost costs 20% less energy.",
    tags: ["mobility"],
    apply: (player) => {
      player.boostEfficiency = (player.boostEfficiency ?? 1) * 0.8;
    },
  },
  {
    id: "shield-regen",
    name: "Radiant Plating",
    description: "+15 max shield.",
    tags: ["defense"],
    apply: (player) => {
      player.maxShield += 15;
      player.shield += 15;
    },
  },
  {
    id: "gravity-resistance",
    name: "Grav Insulation",
    description: "Reduce gravity pull by 15%.",
    tags: ["gravity"],
    apply: (player) => {
      player.gravityResistance += 0.15;
    },
  },
  {
    id: "harvest-efficiency",
    name: "Solar Lattice",
    description: "+30% harvest efficiency near stars.",
    tags: ["harvest"],
    apply: (player) => {
      player.harvestBonus += 0.3;
    },
  },
  {
    id: "magnet-radius",
    name: "Magnet Halo",
    description: "+6 pickup radius for motes.",
    tags: ["utility"],
    apply: (player) => {
      player.magnetRadius += 6;
    },
  },
  {
    id: "cooldown-reduction",
    name: "Quantum Focus",
    description: "+15% ability cooldown reduction.",
    tags: ["ability"],
    apply: (player) => {
      player.cooldownReduction += 0.15;
    },
  },
  {
    id: "orbit-stability",
    name: "Orbit Stabilizers",
    description: "Unlock orbit assist toggle.",
    tags: ["gravity"],
    apply: (player) => {
      player.orbitAssist = true;
    },
  },
];

const formUpgrade = () => ({
  id: "form-choice",
  name: "Evolution Shift",
  description: "Choose a new cosmic form.",
  tags: ["form"],
  isForm: true,
  forms: [...FORMS_LIST],
  apply: () => {},
});

export const rollUpgrades = (level) => {
  const upgrades = [];
  const pool = [...upgradePool];
  if (level % 5 === 0) {
    upgrades.push({ ...formUpgrade(), rarity: "epic" });
  }
  while (upgrades.length < 3) {
    const pick = randChoice(pool);
    const rarity = rarityRoll();
    upgrades.push({ ...pick, rarity });
  }
  return upgrades;
};
