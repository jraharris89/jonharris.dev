/**
 * A custom Download icon component where only the arrow
 * bounces on group-hover.
 */
export default function BouncingDownloadIcon({ size = 20, className = "" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      overflow="visible"
      className={className} // Passes any extra classes (like text-color)
    >
      {/* Part 1: The Tray (This part is static) */}
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />

      {/* Part 2: The Arrow (This group will bounce) */}
      <g className="group-hover:animate-bounce">
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </g>
    </svg>
  );
}
