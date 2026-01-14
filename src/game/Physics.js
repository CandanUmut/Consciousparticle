import { clamp, vecLength } from "../utils/Math.js";

export const GRAVITY_CONSTANT = 0.15;
const SOFTENING = 6;
const MAX_ACCEL = 2.5;

export const applyGravity = (body, sources, delta, resistance = 0) => {
  const ax = 0;
  const ay = 0;
  const az = 0;
  let totalAx = ax;
  let totalAy = ay;
  let totalAz = az;
  for (const source of sources) {
    const dx = source.position.x - body.position.x;
    const dy = source.position.y - body.position.y;
    const dz = source.position.z - body.position.z;
    const distSq = dx * dx + dy * dy + dz * dz + SOFTENING;
    const dist = Math.sqrt(distSq);
    const accel = clamp((GRAVITY_CONSTANT * source.mass) / distSq, 0, MAX_ACCEL);
    totalAx += (dx / dist) * accel;
    totalAy += (dy / dist) * accel;
    totalAz += (dz / dist) * accel;
  }
  const damp = 1 - clamp(resistance, 0, 0.7);
  body.velocity.x += totalAx * delta * damp;
  body.velocity.y += totalAy * delta * damp;
  body.velocity.z += totalAz * delta * damp;
};

export const integrate = (body, delta) => {
  body.position.x += body.velocity.x * delta;
  body.position.y += body.velocity.y * delta;
  body.position.z += body.velocity.z * delta;
};

export const applyDrag = (body, delta, strength) => {
  body.velocity.x -= body.velocity.x * strength * delta;
  body.velocity.y -= body.velocity.y * strength * delta;
  body.velocity.z -= body.velocity.z * strength * delta;
};

export const collisionDamage = (body, other) => {
  const relVx = body.velocity.x - other.velocity.x;
  const relVy = body.velocity.y - other.velocity.y;
  const relVz = body.velocity.z - other.velocity.z;
  const relSpeed = vecLength(relVx, relVy, relVz);
  const massFactor = other.mass / Math.max(body.mass, 1);
  return relSpeed * massFactor;
};
