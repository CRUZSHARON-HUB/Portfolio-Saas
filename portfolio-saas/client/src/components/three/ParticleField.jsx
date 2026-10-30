import { useEffect, useRef } from 'react';

/**
 * Canvas-based 3D particle field.
 * Particles live in a real Z space, are rotated by the pointer and projected
 * with a perspective divide — then drawn with depth-scaled size and alpha.
 */
export default function ParticleField({ density = 100, className = '', interactive = true }) {
  const canvasRef = useRef(null);
  const pointer = useRef({ x: 0, y: 0 });
  const smoothed = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext('2d');
    let frame = 0;
    let width = 0;
    let height = 0;
    let particles = [];
    const palette = ['139,92,246', '34,211,238', '167,139,250', '251,191,36'];

    const build = () => {
      const area = (width * height) / 16000;
      const count = Math.max(45, Math.min(220, Math.round(area * (density / 100))));
      particles = Array.from({ length: count }, () => ({
        x: (Math.random() - 0.5) * width * 1.7,
        y: (Math.random() - 0.5) * height * 1.7,
        z: Math.random() * 1500,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        vz: 0.35 + Math.random() * 0.85,
        color: palette[Math.floor(Math.random() * palette.length)],
      }));
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    };

    const rotate = (p, angleX, angleY) => {
      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);
      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);

      const x1 = p.x * cosY - p.z * sinY;
      const z1 = p.x * sinY + p.z * cosY;
      const y2 = p.y * cosX - z1 * sinX;
      const z2 = p.y * sinX + z1 * cosX;

      return { x: x1, y: y2, z: z2 };
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      smoothed.current.x += (pointer.current.x - smoothed.current.x) * 0.06;
      smoothed.current.y += (pointer.current.y - smoothed.current.y) * 0.06;

      const angleY = smoothed.current.x * 0.6;
      const angleX = -smoothed.current.y * 0.45;
      const focal = 520;

      const projected = particles.map((p) => {
        const rotated = rotate(p, angleX, angleY);
        const scale = focal / (focal + rotated.z);
        return {
          sx: width / 2 + rotated.x * scale,
          sy: height / 2 + rotated.y * scale,
          scale,
          color: p.color,
        };
      });

      ctx.lineWidth = 0.6;
      for (let i = 0; i < projected.length; i += 1) {
        const a = projected[i];
        for (let j = i + 1; j < projected.length; j += 1) {
          const b = projected[j];
          const dx = a.sx - b.sx;
          const dy = a.sy - b.sy;
          const distance = Math.hypot(dx, dy);
          if (distance > 108) continue;
          ctx.strokeStyle = `rgba(139,92,246,${(1 - distance / 108) * 0.22})`;
          ctx.beginPath();
          ctx.moveTo(a.sx, a.sy);
          ctx.lineTo(b.sx, b.sy);
          ctx.stroke();
        }
      }

      for (const point of projected) {
        if (point.sx < -60 || point.sx > width + 60) continue;
        if (point.sy < -60 || point.sy > height + 60) continue;
        const radius = Math.max(0.4, 2.7 * point.scale);
        ctx.fillStyle = `rgba(${point.color},${Math.min(0.9, 0.22 + point.scale * 0.7)})`;
        ctx.beginPath();
        ctx.arc(point.sx, point.sy, radius, 0, Math.PI * 2);
        ctx.fill();

        if (point.scale > 0.86) {
          ctx.fillStyle = `rgba(${point.color},0.14)`;
          ctx.beginPath();
          ctx.arc(point.sx, point.sy, radius * 4.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.z -= p.vz;
        if (p.z < -60) {
          p.z = 1500;
          p.x = (Math.random() - 0.5) * width * 1.7;
          p.y = (Math.random() - 0.5) * height * 1.7;
        }
        if (Math.abs(p.x) > width) p.vx *= -1;
        if (Math.abs(p.y) > height) p.vy *= -1;
      }

      frame = requestAnimationFrame(draw);
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    frame = requestAnimationFrame(draw);

    const onPointerMove = (event) => {
      if (!interactive) return;
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (event.clientY / window.innerHeight) * 2 - 1;
    };

    const onPointerLeave = () => {
      pointer.current.x = 0;
      pointer.current.y = 0;
    };

    if (interactive) {
      window.addEventListener('pointermove', onPointerMove, { passive: true });
      window.addEventListener('pointerleave', onPointerLeave);
    }

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
    };
  }, [density, interactive]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
