const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export default function MobileControls({ game, joystick, snapshot }) {
  const isActive = snapshot.state === "PLAYING";

  const handlePress = (key, pressed) => {
    if (!game) return;
    if (pressed) {
      game.ensureAudio();
    }
    game.setInput(key, pressed);
  };

  const baseStyle = joystick.active
    ? {
        transform: `translate(${clamp(joystick.start.x - joystick.radius, 0, window.innerWidth)}px, ${clamp(
          joystick.start.y - joystick.radius,
          0,
          window.innerHeight
        )}px)`,
      }
    : {};

  const stickStyle = joystick.active
    ? {
        transform: `translate(${clamp(joystick.current.x - 20, 0, window.innerWidth)}px, ${clamp(
          joystick.current.y - 20,
          0,
          window.innerHeight
        )}px)`,
      }
    : {};

  return (
    <div className={`mobile-controls ${isActive ? "active" : ""}`}>
      <div className="joystick-visual" aria-hidden="true">
        {joystick.active ? (
          <>
            <div className="joystick-base" style={baseStyle} />
            <div className="joystick-stick" style={stickStyle} />
          </>
        ) : null}
      </div>
      <div className="action-buttons uiInteractive">
        <button
          className="action-button"
          data-ui-button="true"
          onPointerDown={() => handlePress("boost", true)}
          onPointerUp={() => handlePress("boost", false)}
          onPointerLeave={() => handlePress("boost", false)}
          onPointerCancel={() => handlePress("boost", false)}
        >
          Boost
        </button>
        <button
          className="action-button"
          data-ui-button="true"
          onPointerDown={() => handlePress("ability", true)}
          onPointerUp={() => handlePress("ability", false)}
          onPointerLeave={() => handlePress("ability", false)}
          onPointerCancel={() => handlePress("ability", false)}
        >
          Ability (E)
        </button>
        <button
          className="action-button secondary"
          data-ui-button="true"
          onPointerDown={() => handlePress("secondary", true)}
          onPointerUp={() => handlePress("secondary", false)}
          onPointerLeave={() => handlePress("secondary", false)}
          onPointerCancel={() => handlePress("secondary", false)}
        >
          Alt (Q)
        </button>
      </div>
    </div>
  );
}
