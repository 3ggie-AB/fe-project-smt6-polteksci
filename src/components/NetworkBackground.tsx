import { useEffect, useRef } from "react";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export function NetworkBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    const nodes: Node[] = [];
    const nodeCount = 60;
    const connectionDistance = 150;
    const mouseRadius = 200;
    const mouseAttraction = 0.02;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
      });
    }

    const isDark = () =>
      document.documentElement.classList.contains("dark") ||
      !document.documentElement.classList.contains("light");

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const dark = isDark();
      const nodeColor = dark ? "rgba(34, 197, 94, 0.6)" : "rgba(22, 163, 74, 0.5)";
      const lineColor = dark ? "rgba(34, 197, 94," : "rgba(22, 163, 74,";
      const mouseLineColor = dark ? "rgba(56, 189, 248," : "rgba(14, 165, 233,";
      const mouse = mouseRef.current;

      // Update positions with mouse interaction
      for (const node of nodes) {
        const dx = mouse.x - node.x;
        const dy = mouse.y - node.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouseRadius && dist > 0) {
          // Attract nodes gently toward cursor
          node.vx += (dx / dist) * mouseAttraction;
          node.vy += (dy / dist) * mouseAttraction;
        }

        // Dampen velocity
        node.vx *= 0.99;
        node.vy *= 0.99;

        // Minimum speed so nodes keep moving
        const speed = Math.sqrt(node.vx * node.vx + node.vy * node.vy);
        if (speed < 0.3) {
          node.vx *= 0.3 / speed;
          node.vy *= 0.3 / speed;
        }

        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;
      }

      // Draw connections between nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDistance) {
            const opacity = (1 - dist / connectionDistance) * 0.3;
            ctx.beginPath();
            ctx.strokeStyle = `${lineColor}${opacity})`;
            ctx.lineWidth = 1;
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw lines from mouse to nearby nodes
      for (const node of nodes) {
        const dx = mouse.x - node.x;
        const dy = mouse.y - node.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouseRadius) {
          const opacity = (1 - dist / mouseRadius) * 0.5;
          ctx.beginPath();
          ctx.strokeStyle = `${mouseLineColor}${opacity})`;
          ctx.lineWidth = 1.5;
          ctx.moveTo(mouse.x, mouse.y);
          ctx.lineTo(node.x, node.y);
          ctx.stroke();
        }
      }

      // Draw mouse glow
      const nearbyCount = nodes.filter(n => {
        const d = Math.sqrt((mouse.x - n.x) ** 2 + (mouse.y - n.y) ** 2);
        return d < mouseRadius;
      }).length;
      if (nearbyCount > 0) {
        const gradient = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 8);
        gradient.addColorStop(0, dark ? "rgba(56, 189, 248, 0.8)" : "rgba(14, 165, 233, 0.7)");
        gradient.addColorStop(1, "transparent");
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      // Draw nodes
      for (const node of nodes) {
        const dx = mouse.x - node.x;
        const dy = mouse.y - node.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const isNear = dist < mouseRadius;
        const radius = isNear ? 3.5 : 2.5;
        const color = isNear
          ? (dark ? "rgba(56, 189, 248, 0.9)" : "rgba(14, 165, 233, 0.8)")
          : nodeColor;

        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
    />
  );
}
