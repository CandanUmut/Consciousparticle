import Radar from "./Radar.jsx";

export default function HUD({ snapshot }) {
  const player = snapshot.player;
  const abilities = snapshot.abilities || [];
  const hidden = snapshot.state !== "Playing";

  if (!player) return null;

  return (
    <div className={`hud ${hidden ? "hidden" : ""}`}>
      <div className="hud-panel left ui-panel">
        <div className="stat"><span>Mass</span><strong>{player.mass.toFixed(1)}</strong></div>
        <div className="stat"><span>Level</span><strong>{player.level}</strong></div>
        <div className="stat"><span>Form</span><strong>{player.form}</strong></div>
        <div className="stat"><span>XP</span><strong>{player.xp.toFixed(0)} / {player.nextLevel}</strong></div>
        <div className="bar"><span style={{ width: `${(player.xp / player.nextLevel) * 100}%` }} /></div>
      </div>
      <div className="hud-panel right ui-panel">
        <div className="stat"><span>Energy</span><strong>{player.energy.toFixed(0)}</strong></div>
        <div className="bar"><span style={{ width: `${(player.energy / player.maxEnergy) * 100}%` }} /></div>
        <div className="stat"><span>Shield</span><strong>{player.shield.toFixed(0)}</strong></div>
        <div className="bar"><span style={{ width: `${(player.shield / player.maxShield) * 100}%` }} /></div>
        <div className="stat"><span>Integrity</span><strong>{player.integrity.toFixed(0)}</strong></div>
      </div>
      <div className="hud-bottom">
        {abilities.map((ability, index) => (
          <div className="ability" key={`${ability.name}-${index}`}>
            <div className="name">{ability.name}</div>
            {ability.cooldown > 0 ? (
              <div className="cooldown">{ability.cooldown.toFixed(1)}</div>
            ) : null}
          </div>
        ))}
      </div>
      <Radar snapshot={snapshot} />
    </div>
  );
}
