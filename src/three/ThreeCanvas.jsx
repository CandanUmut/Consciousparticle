import { useEffect, useRef } from "react";
import { Game } from "../game/Game.js";
import { InputManager } from "../game/InputManager.js";

export default function ThreeCanvas({ onReady, onJoystickChange }) {
  const wrapperRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!wrapperRef.current || !canvasRef.current) return undefined;

    const game = new Game({ canvas: canvasRef.current });
    const inputManager = new InputManager({
      element: wrapperRef.current,
      onMove: (vector) => game.setMovementVector(vector),
      onAim: (pointer) => game.setPointer(pointer),
      onJoystick: onJoystickChange,
      isEnabled: () => game.state === "PLAYING",
    });

    game.start();
    onReady?.(game);

    return () => {
      inputManager.dispose();
      game.dispose();
      onReady?.(null);
    };
  }, [onJoystickChange, onReady]);

  return (
    <div className="sceneLayer canvas-layer" ref={wrapperRef}>
      <canvas ref={canvasRef} className="game-canvas" />
    </div>
  );
}
