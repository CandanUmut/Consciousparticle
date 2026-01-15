import * as THREE from "three";
import { randRange, randChoice } from "../utils/Math.js";

export const ENTITY_TYPES = {
  MOTE: "mote",
  ASTEROID: "asteroid",
  PLANET: "planet",
  STAR: "star",
  BLACK_HOLE: "blackHole",
  HUNTER: "hunter",
};

const COLORS = {
  mote: 0x68d6ff,
  asteroid: 0x8f8f99,
  planet: 0x3a6cff,
  star: 0xffb357,
  blackHole: 0x552266,
  hunter: 0xff6b6b,
};

const geometryCache = {
  sphere: new THREE.SphereGeometry(1, 24, 24),
  icosa: new THREE.IcosahedronGeometry(1, 1),
  ring: new THREE.RingGeometry(1.2, 2, 24),
};

export const createEntityMesh = (type, radius) => {
  const material = new THREE.MeshStandardMaterial({
    color: COLORS[type] ?? 0xffffff,
    emissive: new THREE.Color(COLORS[type] ?? 0xffffff).multiplyScalar(0.35),
    roughness: 0.4,
    metalness: 0.2,
  });
  const geometry = type === ENTITY_TYPES.ASTEROID ? geometryCache.icosa : geometryCache.sphere;
  const mesh = new THREE.Mesh(geometry, material);
  mesh.scale.setScalar(radius);
  if (type === ENTITY_TYPES.STAR) {
    const glow = new THREE.Mesh(
      geometryCache.sphere,
      new THREE.MeshBasicMaterial({
        color: COLORS.star,
        transparent: true,
        opacity: 0.25,
      })
    );
    glow.scale.setScalar(radius * 2.4);
    mesh.add(glow);
  }
  if (type === ENTITY_TYPES.BLACK_HOLE) {
    const ring = new THREE.Mesh(
      geometryCache.ring,
      new THREE.MeshBasicMaterial({
        color: COLORS.blackHole,
        transparent: true,
        opacity: 0.4,
        side: THREE.DoubleSide,
      })
    );
    ring.rotation.x = Math.PI / 2;
    ring.scale.setScalar(radius * 2.2);
    mesh.add(ring);
  }
  return mesh;
};

export const spawnEntity = (type, bounds) => {
  const position = new THREE.Vector3(
    randRange(-bounds, bounds),
    randRange(-bounds, bounds),
    randRange(-bounds * 0.6, bounds * 0.6)
  );
  const velocity = new THREE.Vector3(randRange(-0.2, 0.2), randRange(-0.2, 0.2), randRange(-0.2, 0.2));
  const sizes = {
    mote: randRange(0.5, 1.3),
    asteroid: randRange(2, 4),
    planet: randRange(7, 12),
    star: randRange(12, 18),
    blackHole: randRange(10, 14),
    hunter: randRange(2, 3.5),
  };
  const radius = sizes[type] ?? 2;
  const densityFactor = type === ENTITY_TYPES.STAR ? 35 : type === ENTITY_TYPES.BLACK_HOLE ? 45 : 8;
  const mass = radius * radius * densityFactor;
  const density = mass / Math.pow(radius, 3);
  const mesh = createEntityMesh(type, radius);
  mesh.position.copy(position);
  return {
    id: crypto.randomUUID(),
    type,
    position,
    velocity,
    radius,
    mass,
    density,
    mesh,
    hp: type === ENTITY_TYPES.HUNTER ? 20 : 1,
    tags: [randChoice(["rift", "core", "halo"])],
  };
};
