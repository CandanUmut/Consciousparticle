import { HUD } from "./HUD.js";
import { UpgradeMenu } from "./UpgradeMenu.js";

export class UI {
  constructor(root) {
    this.root = root;
    this.hud = new HUD(root);
    this.upgradeMenu = new UpgradeMenu(root);
    this.mainMenu = this.createMainMenu();
    this.pauseMenu = this.createPauseMenu();
    this.gameOverMenu = this.createGameOverMenu();
    this.mobileControls = this.createMobileControls();
  }

  createMainMenu() {
    const overlay = document.createElement("div");
    overlay.className = "overlay active";
    overlay.innerHTML = `
      <div class="menu ui-panel">
        <h2>Conscious Particle</h2>
        <p>Drift, absorb, and evolve across cosmic gravity fields.</p>
        <button data-action="start">Start Journey</button>
        <button data-action="how">Controls</button>
      </div>
    `;
    this.root.append(overlay);
    return overlay;
  }

  createPauseMenu() {
    const overlay = document.createElement("div");
    overlay.className = "overlay";
    overlay.innerHTML = `
      <div class="menu ui-panel">
        <h2>Paused</h2>
        <div class="settings"></div>
        <button data-action="resume">Resume</button>
        <button data-action="quit">Quit</button>
      </div>
    `;
    this.root.append(overlay);
    return overlay;
  }

  createGameOverMenu() {
    const overlay = document.createElement("div");
    overlay.className = "overlay";
    overlay.innerHTML = `
      <div class="menu ui-panel">
        <h2>Signal Lost</h2>
        <div class="summary"></div>
        <button data-action="restart">Restart</button>
      </div>
    `;
    this.root.append(overlay);
    return overlay;
  }

  createMobileControls() {
    const controls = document.createElement("div");
    controls.className = "mobile-controls";
    controls.innerHTML = `
      <div class="joystick">
        <button data-action="left">◀</button>
        <button data-action="up">▲</button>
        <button data-action="down">▼</button>
        <button data-action="right">▶</button>
      </div>
      <div class="mobile-actions">
        <button data-action="boost">Boost</button>
        <button data-action="ability">Ability</button>
        <button data-action="secondary">Alt</button>
      </div>
    `;
    this.root.append(controls);
    return controls;
  }

  updateHUD(player, state, entities) {
    this.hud.update(player, state);
    if (state === "Playing") {
      this.hud.renderRadar(player, entities);
    }
  }

  showPause(settings) {
    this.pauseMenu.classList.add("active");
    const settingsRoot = this.pauseMenu.querySelector(".settings");
    settingsRoot.innerHTML = "";
    settingsRoot.append(...settings);
  }

  hidePause() {
    this.pauseMenu.classList.remove("active");
  }

  showGameOver(stats) {
    this.gameOverMenu.classList.add("active");
    this.gameOverMenu.querySelector(".summary").innerHTML = `
      <p>Time Survived: ${stats.time.toFixed(1)}s</p>
      <p>Max Mass: ${stats.maxMass.toFixed(1)}</p>
      <p>Level: ${stats.level}</p>
      <p>Kills: ${stats.kills}</p>
    `;
  }

  hideGameOver() {
    this.gameOverMenu.classList.remove("active");
  }
}
