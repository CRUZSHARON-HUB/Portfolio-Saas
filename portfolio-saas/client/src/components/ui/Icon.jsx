const PATHS = {
  trash: 'M4 7h16M9.5 7V5.2A1.2 1.2 0 0 1 10.7 4h2.6a1.2 1.2 0 0 1 1.2 1.2V7M6.5 7l.8 12.1A1.9 1.9 0 0 0 9.2 21h5.6a1.9 1.9 0 0 0 1.9-1.9L17.5 7',
  edit: 'M4 20.2h4.2L19.4 9a2.4 2.4 0 0 0-3.4-3.4L4.8 16.8 4 20.2z',
  star: 'M12 3.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.6 9.7l5.8-.8L12 3.6z',
  external: 'M14 4h6v6M20 4l-8.5 8.5M18 14.5V19a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 19V8a1.5 1.5 0 0 1 1.5-1.5H10',
  plus: 'M12 5.5v13M5.5 12h13',
  check: 'M5 12.5l4.5 4.5L19 7.5',
};

export default function Icon({ name, size = 16, strokeWidth = 1.7, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path d={PATHS[name] ?? ''} />
    </svg>
  );
}
