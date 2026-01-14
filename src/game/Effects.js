import * as THREE from "three";
import { randRange } from "../utils/Math.js";

export class Effects {
  constructor(scene) {
    this.scene = scene;
    this.particles = [];
    this.geometry = new THREE.SphereGeometry(0.1, 6, 6);
  }

  spawnImpact(position, color, count = 12) {
    for (let i = 0; i < count; i += 1) {
      const material = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.8 });
      const mesh = new THREE.Mesh(this.geometry, material);
      mesh.position.copy(position);
      const velocity = new THREE.Vector3(randRange(-1, 1), randRange(-1, 1), randRange(-1, 1));
      this.scene.add(mesh);
      this.particles.push({ mesh, velocity, life: randRange(0.5, 1.1) });
    }
  }

  update(delta) {
    this.particles = this.particles.filter((particle) => {
      particle.mesh.position.addScaledVector(particle.velocity, delta);
      particle.mesh.material.opacity -= delta * 1.2;
      particle.life -= delta;
      if (particle.life <= 0) {
        this.scene.remove(particle.mesh);
        return false;
      }
      return true;
    });
  }
}
