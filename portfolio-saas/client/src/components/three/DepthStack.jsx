import { useEffect, useRef } from 'react';

/**
 * Layered panels floating at different depths inside a perspective stage.
 * Layers drift apart on scroll and swing with the pointer.
 */
export default function DepthStack({ children, className = '', spread = 1 }) {
  const stageRef = useRef(null);
  const pointer = useRef({ x: 0, y: 0 });
  const smoothed = useRef({ x: 0, y: 0 });

  useEffect(() => {
    let frame = 0;
    const loop = () => {
      smoothed.current.x += (pointer.current.x - smoothed.current.x) * 0.05;
      smoothed.current.y += (pointer.current.y - smoothed.current.y) * 0.05;

      const stage = stageRef.current;
      if (stage) {
        stage.style.transform = `rotateX(${(-smoothed.current.y * 7).toFixed(
          2
        )}deg) rotateY(${(smoothed.current.x * 9).toFixed(2)}deg)`;
      }
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);

    const onMove = (event) => {
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (event.clientY / window.innerHeight) * 2 - 1;
    };
    const onLeave = () => {
      pointer.current.x = 0;
      pointer.current.y = 0;
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
    <div ref={stageRef} className={`stage ${className}`} style={{ transition: 'transform 0.25s linear' }}>
      <div className="depth-layer z-1" style={{ transform: `translateZ(${40 * spread}px)` }}>
        {children?.[0]}
      </div>
      <div className="depth-layer z-2" style={{ transform: `translateZ(${90 * spread}px)` }}>
        {children?.[1]}
      </div>
      <div className="depth-layer z-3" style={{ transform: `translateZ(${150 * spread}px)` }}>
        {children?.[2]}
      </div>
    </div>
  );
}
