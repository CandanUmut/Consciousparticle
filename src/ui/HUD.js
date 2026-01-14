export class HUD {
  constructor(root) {
    this.root = root;
    this.container = document.createElement("div");
    this.container.className = "hud";
    this.left = document.createElement("div");
    this.left.className = "left ui-panel";
    this.right = document.createElement("div");
    this.right.className = "right ui-panel";
    this.bottom = document.createElement("div");
    this.bottom.className = "bottom";
    this.container.append(this.left, this.right, this.bottom);
    this.root.append(this.container);

    this.radar = document.createElement("div");
    this.radar.className = "radar";
    this.radarCanvas = document.createElement("canvas");
    this.radar.append(this.radarCanvas);
    this.root.append(this.radar);

    this.abilitySlots = [this.createAbilitySlot(), this.createAbilitySlot()];
    this.abilitySlots.forEach((slot) => this.bottom.append(slot));
  }

  createAbilitySlot() {
    const slot = document.createElement("div");
    slot.className = "ability";
    slot.innerHTML = `<div class="name"></div><div class="cooldown" style="display:none"></div>`;
    return slot;
  }

  update(player, gameState) {
    this.left.innerHTML = `
      <div class="stat"><span>Mass</span><strong>${player.mass.toFixed(1)}</strong></div>
      <div class="stat"><span>Level</span><strong>${player.level}</strong></div>
      <div class="stat"><span>Form</span><strong>${player.form}</strong></div>
      <div class="stat"><span>XP</span><strong>${player.xp.toFixed(0)} / ${player.nextLevel}</strong></div>
      <div class="bar"><span style="width:${(player.xp / player.nextLevel) * 100}%"></span></div>
    `;
    this.right.innerHTML = `
      <div class="stat"><span>Energy</span><strong>${player.energy.toFixed(0)}</strong></div>
      <div class="bar"><span style="width:${(player.energy / player.maxEnergy) * 100}%"></span></div>
      <div class="stat"><span>Shield</span><strong>${player.shield.toFixed(0)}</strong></div>
      <div class="bar"><span style="width:${(player.shield / player.maxShield) * 100}%"></span></div>
      <div class="stat"><span>Integrity</span><strong>${player.integrity.toFixed(0)}</strong></div>
    `;
    const abilities = Object.values(player.abilities);
    abilities.forEach((ability, index) => {
      const slot = this.abilitySlots[index];
      slot.querySelector(".name").textContent = ability.name;
      const cooldownNode = slot.querySelector(".cooldown");
      if (ability.cooldown > 0) {
        cooldownNode.style.display = "flex";
        cooldownNode.textContent = ability.cooldown.toFixed(1);
      } else {
        cooldownNode.style.display = "none";
      }
    });
    const hidden = gameState !== "Playing";
    this.container.style.opacity = hidden ? "0" : "1";
  }

  renderRadar(player, entities) {
    const ctx = this.radarCanvas.getContext("2d");
    const size = this.radarCanvas.width = this.radarCanvas.offsetWidth * devicePixelRatio;
    this.radarCanvas.height = size;
    ctx.clearRect(0, 0, size, size);
    ctx.save();
    ctx.translate(size / 2, size / 2);
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.beginPath();
    ctx.arc(0, 0, size / 2.2, 0, Math.PI * 2);
    ctx.stroke();
    entities.forEach((entity) => {
      const dx = (entity.position.x - player.position.x) * 0.2;
      const dy = (entity.position.y - player.position.y) * 0.2;
      if (Math.abs(dx) > size / 2 || Math.abs(dy) > size / 2) return;
      ctx.fillStyle = entity.type === "star" ? "#ffb357" : entity.type === "blackHole" ? "#b684ff" : "#68d6ff";
      ctx.fillRect(dx - 2, dy - 2, 4, 4);
    });
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
