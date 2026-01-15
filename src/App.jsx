import { useEffect, useState } from "react";
import ThreeCanvas from "./three/ThreeCanvas.jsx";
import HUD from "./ui/HUD.jsx";
import Menus from "./ui/Menus.jsx";
import MobileControls from "./ui/MobileControls.jsx";

const SNAPSHOT_INTERVAL = 80;

const EMPTY_SNAPSHOT = {
  state: "Loading",
  player: null,
  abilities: [],
  radar: null,
  settings: null,
  stats: null,
  pendingUpgrades: null,
  gameOver: null,
};

export default function App() {
  const [game, setGame] = useState(null);
  const [snapshot, setSnapshot] = useState(EMPTY_SNAPSHOT);
  const [joystick, setJoystick] = useState({
    active: false,
    start: { x: 0, y: 0 },
    current: { x: 0, y: 0 },
    vector: { x: 0, y: 0 },
    radius: 64,
  });

  useEffect(() => {
    if (!game) return undefined;
    setSnapshot(game.getSnapshot());
    const interval = window.setInterval(() => {
      setSnapshot(game.getSnapshot());
    }, SNAPSHOT_INTERVAL);
    return () => window.clearInterval(interval);
  }, [game]);

  return (
    <div className="app">
      <ThreeCanvas
        onReady={setGame}
        onJoystickChange={setJoystick}
      />
      <div className="ui-layer">
        <HUD snapshot={snapshot} />
        <Menus game={game} snapshot={snapshot} />
        <MobileControls game={game} joystick={joystick} snapshot={snapshot} />
      </div>
    </div>
  );
}
