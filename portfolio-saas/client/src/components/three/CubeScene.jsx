import { useEffect, useRef } from 'react';

const FACES = ['Nebula', 'Prism', 'Atlas', 'Monolith', '3D', 'SaaS'];

/**
 * Pure CSS 3D cube. The whole cube is rotated by the pointer while it
 * keeps spinning on its own axis.
 */
export default function CubeScene({ className = '' }) {
  const cubeRef = useRef(null);
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const node = cubeRef.current;
    if (!node) return undefined;

    let frame = 0;
    let spin = 0;
    const loop = () => {
      spin += 0.28;
      current.current.x += (target.current.x - current.current.x) * 0.07;
      current.current.y += (target.current.y - current.current.y) * 0.07;
      node.style.transform = `rotateX(${(-22 + current.current.y * 26).toFixed(2)}deg) rotateY(${(
        spin +
        current.current.x * 32
      ).toFixed(2)}deg)`;
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);

    const onMove = (event) => {
      const rect = node.parentElement?.getBoundingClientRect();
      if (!rect) return;
      target.current.x = (event.clientX - rect.left) / rect.width - 0.5;
      target.current.y = (event.clientY - rect.top) / rect.height - 0.5;
    };

    const onLeave = () => {
      target.current.x = 0;
      target.current.y = 0;
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerleave', onLeave);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return (
    <div className={`cube-wrap scene ${className}`}>
      <div className="cube" ref={cubeRef}>
        {FACES.map((face, index) => (
          <div key={face} className={`cube-face ${['front', 'back', 'right', 'left', 'top', 'bottom'][index]}`}>
            <span>{face}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
