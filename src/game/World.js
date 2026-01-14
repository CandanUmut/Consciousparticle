import * as THREE from "three";
import { ENTITY_TYPES, spawnEntity } from "./Entities.js";
import { randRange } from "../utils/Math.js";

const LIMITS = {
  mote: 240,
  asteroid: 26,
  planet: 6,
  star: 2,
  blackHole: 1,
  hunter: 6,
};

export class World {
  constructor(scene) {
    this.scene = scene;
    this.bounds = 180;
    this.entities = [];
    this.hunters = [];
    this.gravitySources = [];
    this.spawnInitial();
  }

  spawnInitial() {
    Object.keys(LIMITS).forEach((type) => {
      const count = LIMITS[type];
      for (let i = 0; i < count; i += 1) {
        this.addEntity(type);
      }
    });
  }

  addEntity(type) {
    const entity = spawnEntity(type, this.bounds);
    if (type === ENTITY_TYPES.PLANET || type === ENTITY_TYPES.STAR || type === ENTITY_TYPES.BLACK_HOLE) {
      entity.velocity.set(0, 0, 0);
      this.gravitySources.push(entity);
    }
    if (type === ENTITY_TYPES.HUNTER) {
      this.hunters.push(entity);
    }
    this.entities.push(entity);
    this.scene.add(entity.mesh);
    return entity;
  }

  update(delta, difficulty) {
    const targetCounts = {
      mote: LIMITS.mote + Math.floor(difficulty * 40),
      asteroid: LIMITS.asteroid + Math.floor(difficulty * 6),
      hunter: LIMITS.hunter + Math.floor(difficulty * 2),
    };

    for (const entity of this.entities) {
      if (entity.type === ENTITY_TYPES.MOTE) {
        entity.mesh.rotation.y += delta * 0.3;
      }
      entity.position.addScaledVector(entity.velocity, delta);
      entity.mesh.position.copy(entity.position);
      if (entity.position.length() > this.bounds * 1.6) {
        entity.position.set(randRange(-this.bounds, this.bounds), randRange(-this.bounds, this.bounds), randRange(-this.bounds * 0.6, this.bounds * 0.6));
      }
    }

    for (const [type, count] of Object.entries(targetCounts)) {
      const existing = this.entities.filter((entity) => entity.type === type).length;
      const spawnCount = count - existing;
      for (let i = 0; i < spawnCount; i += 1) {
        this.addEntity(type);
      }
    }
  }

  removeEntity(entity) {
    this.scene.remove(entity.mesh);
    this.entities = this.entities.filter((item) => item.id !== entity.id);
    this.gravitySources = this.gravitySources.filter((item) => item.id !== entity.id);
    this.hunters = this.hunters.filter((item) => item.id !== entity.id);
  }
}
