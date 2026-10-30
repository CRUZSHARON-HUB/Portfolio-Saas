import { useRef } from 'react';

/**
 * Card that reacts to the pointer with a real 3D tilt.
 * Inner content is pushed forward on Z so the depth reads as parallax.
 */
export default function TiltCard({
  children,
  className = '',
  maxTilt = 9,
  scale = 1.015,
  perspective = 900,
  depth = 34,
  style,
}) {
  const ref = useRef(null);

  const handleMove = (event) => {
    const node = ref.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;

    node.style.transform = `perspective(${perspective}px) rotateX(${(-py * maxTilt).toFixed(
      2
    )}deg) rotateY(${(px * maxTilt).toFixed(2)}deg) scale(${scale})`;
    node.style.setProperty('--tilt-depth', `${depth}px`);
  };

  const handleLeave = () => {
    const node = ref.current;
    if (!node) return;
    node.style.transform = `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale(1)`;
  };

  return (
    <div
      ref={ref}
      className={`tilt ${className}`}
      style={style}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
    >
      {children}
    </div>
  );
}
