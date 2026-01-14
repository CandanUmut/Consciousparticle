export class UpgradeMenu {
  constructor(root) {
    this.root = root;
    this.overlay = document.createElement("div");
    this.overlay.className = "overlay";
    this.menu = document.createElement("div");
    this.menu.className = "menu ui-panel";
    this.overlay.append(this.menu);
    this.root.append(this.overlay);
    this.onSelect = null;
  }

  show(upgrades) {
    this.overlay.classList.add("active");
    this.menu.innerHTML = `
      <h2>Evolution Options</h2>
      <p>Select one upgrade to continue your cosmic journey.</p>
      <div class="upgrade-cards"></div>
    `;
    const container = this.menu.querySelector(".upgrade-cards");
    upgrades.forEach((upgrade) => {
      const card = document.createElement("button");
      card.className = `upgrade-card ${upgrade.rarity}`;
      card.innerHTML = `
        <span class="tag">${upgrade.rarity}</span>
        <strong>${upgrade.name}</strong>
        <span>${upgrade.description}</span>
        <small>${upgrade.tags.join(" / ")}</small>
      `;
      card.addEventListener("click", () => this.selectUpgrade(upgrade));
      container.append(card);
    });
  }

  showFormChoice(upgrade) {
    this.overlay.classList.add("active");
    this.menu.innerHTML = `
      <h2>Choose Your Form</h2>
      <p>Milestone reached. Pick a new cosmic class.</p>
      <div class="upgrade-cards"></div>
    `;
    const container = this.menu.querySelector(".upgrade-cards");
    upgrade.forms.forEach((form) => {
      const card = document.createElement("button");
      card.className = "upgrade-card epic";
      card.innerHTML = `
        <span class="tag">Form</span>
        <strong>${form}</strong>
        <span>Shift into ${form} traits.</span>
      `;
      card.addEventListener("click", () => this.selectUpgrade({ ...upgrade, form }));
      container.append(card);
    });
  }

  hide() {
    this.overlay.classList.remove("active");
  }

  selectUpgrade(upgrade) {
    this.hide();
    if (this.onSelect) {
      this.onSelect(upgrade);
    }
  }
}
