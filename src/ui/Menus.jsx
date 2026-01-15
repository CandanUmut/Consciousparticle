const QUALITY_OPTIONS = ["low", "med", "high"];

export default function Menus({ game, snapshot }) {
  const state = snapshot.state;
  const settings = snapshot.settings || {};
  const pending = snapshot.pendingUpgrades;
  const gameOver = snapshot.gameOver;

  const handlePointerActivate = (handler) => (event) => {
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    event.currentTarget.dataset.pointerActivated = "true";
    handler(event);
  };

  const handleClick = (handler) => (event) => {
    if (event.currentTarget.dataset.pointerActivated === "true") {
      delete event.currentTarget.dataset.pointerActivated;
      return;
    }
    handler(event);
  };

  const handleStart = () => {
    if (!game || game.state === "PLAYING") return;
    if (import.meta.env.DEV) {
      console.log("Start clicked");
    }
    game.ensureAudio();
    game.startNewRun();
  };

  const updateSetting = (key, value) => {
    if (!game) return;
    game.updateSetting(key, value);
  };

  return (
    <>
      <div className={`overlay uiInteractive ${state === "MENU" ? "active" : ""}`} data-ui-button="true">
        <div className="menu ui-panel">
          <h2>Conscious Particle</h2>
          <p>Drift, absorb, and evolve across cosmic gravity fields.</p>
          <button
            data-ui-button="true"
            onClick={handleClick(handleStart)}
            onPointerUp={handlePointerActivate(handleStart)}
          >
            Start Journey
          </button>
          <button
            data-ui-button="true"
            onClick={handleClick(() =>
              window.alert("Controls: WASD / arrows to thrust, Space to boost, Shift to brake, E/Q abilities, Esc pause.")
            )}
            onPointerUp={handlePointerActivate(() =>
              window.alert("Controls: WASD / arrows to thrust, Space to boost, Shift to brake, E/Q abilities, Esc pause.")
            )}
          >
            Controls
          </button>
        </div>
      </div>

      <div className={`overlay uiInteractive ${state === "PAUSED" ? "active" : ""}`} data-ui-button="true">
        <div className="menu ui-panel">
          <h2>Paused</h2>
          <div className="settings">
            <label>
              Orbit Assist
              <input
                data-ui-button="true"
                type="checkbox"
                checked={Boolean(settings.orbitAssist)}
                onChange={(event) => updateSetting("orbitAssist", event.target.checked)}
              />
            </label>
            <label>
              Screen Shake
              <input
                data-ui-button="true"
                type="checkbox"
                checked={Boolean(settings.screenShake)}
                onChange={(event) => updateSetting("screenShake", event.target.checked)}
              />
            </label>
            <label>
              Cinematic Orbit
              <input
                data-ui-button="true"
                type="checkbox"
                checked={Boolean(settings.cinematic)}
                onChange={(event) => updateSetting("cinematic", event.target.checked)}
              />
            </label>
            <label>
              Volume
              <input
                data-ui-button="true"
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.volume ?? 0.6}
                onChange={(event) => updateSetting("volume", Number(event.target.value))}
              />
            </label>
            <label>
              Mute
              <input
                data-ui-button="true"
                type="checkbox"
                checked={Boolean(settings.muted)}
                onChange={(event) => updateSetting("muted", event.target.checked)}
              />
            </label>
            <label>
              Graphics Quality
              <select
                data-ui-button="true"
                value={settings.quality || "high"}
                onChange={(event) => updateSetting("quality", event.target.value)}
              >
                {QUALITY_OPTIONS.map((option) => (
                  <option value={option} key={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <button
            data-ui-button="true"
            onClick={handleClick(() => game?.resume())}
            onPointerUp={handlePointerActivate(() => game?.resume())}
          >
            Resume
          </button>
          <button
            data-ui-button="true"
            onClick={handleClick(() => game?.reset())}
            onPointerUp={handlePointerActivate(() => game?.reset())}
          >
            Quit
          </button>
        </div>
      </div>

      <div className={`overlay uiInteractive ${state === "GAME_OVER" ? "active" : ""}`} data-ui-button="true">
        <div className="menu ui-panel">
          <h2>Signal Lost</h2>
          {gameOver ? (
            <div className="summary">
              <p>Time Survived: {gameOver.time.toFixed(1)}s</p>
              <p>Max Mass: {gameOver.maxMass.toFixed(1)}</p>
              <p>Level: {gameOver.level}</p>
              <p>Kills: {gameOver.kills}</p>
              <p>Cause: {gameOver.reason}</p>
            </div>
          ) : null}
          <button
            data-ui-button="true"
            onClick={handleClick(() => game?.startNewRun())}
            onPointerUp={handlePointerActivate(() => game?.startNewRun())}
          >
            Restart
          </button>
          <button
            data-ui-button="true"
            onClick={handleClick(() => game?.reset())}
            onPointerUp={handlePointerActivate(() => game?.reset())}
          >
            Main Menu
          </button>
        </div>
      </div>

      <div className={`overlay uiInteractive ${state === "EVOLVE_PICK" ? "active" : ""}`} data-ui-button="true">
        <div className="menu ui-panel">
          <h2>{pending?.type === "form" ? "Choose Your Form" : "Evolution Options"}</h2>
          <p>{pending?.type === "form" ? "Milestone reached. Pick a new cosmic class." : "Select one upgrade to continue your cosmic journey."}</p>
          <div className="upgrade-cards">
            {pending?.options?.map((upgrade) => (
              <button
                key={`${upgrade.name}-${upgrade.form ?? "base"}`}
                data-ui-button="true"
                className={`upgrade-card ${upgrade.rarity}`}
                onClick={handleClick(() => game?.applyUpgrade(upgrade))}
                onPointerUp={handlePointerActivate(() => game?.applyUpgrade(upgrade))}
              >
                <span className="tag">{upgrade.isForm ? "Form" : upgrade.rarity}</span>
                <strong>{upgrade.form ?? upgrade.name}</strong>
                <span>{upgrade.isForm ? `Shift into ${upgrade.form} traits.` : upgrade.description}</span>
                {!upgrade.isForm ? <small>{upgrade.tags?.join(" / ")}</small> : null}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
