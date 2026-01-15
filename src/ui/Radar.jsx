import { useEffect, useRef } from "react";

export default function Radar({ snapshot }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!snapshot?.radar || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const size = canvas.offsetWidth * window.devicePixelRatio;
    canvas.width = size;
    canvas.height = size;

    ctx.clearRect(0, 0, size, size);
    ctx.save();
    ctx.translate(size / 2, size / 2);
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.beginPath();
    ctx.arc(0, 0, size / 2.2, 0, Math.PI * 2);
    ctx.stroke();

    snapshot.radar.entities.forEach((entity) => {
      const dx = (entity.x - snapshot.radar.player.x) * 0.2;
      const dy = (entity.y - snapshot.radar.player.y) * 0.2;
      if (Math.abs(dx) > size / 2 || Math.abs(dy) > size / 2) return;
      ctx.fillStyle = entity.type === "star" ? "#ffb357" : entity.type === "blackHole" ? "#b684ff" : "#68d6ff";
      ctx.fillRect(dx - 2, dy - 2, 4, 4);
    });

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }, [snapshot]);

  return (
    <div className="radar">
      <canvas ref={canvasRef} />
    </div>
  );
}
