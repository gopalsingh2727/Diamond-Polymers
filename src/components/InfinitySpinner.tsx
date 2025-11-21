interface InfinitySpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function InfinitySpinner({ size = "md", className = "" }: InfinitySpinnerProps) {
  const sizes = {
    sm: { width: 24, height: 12, dotSize: 2, strokeWidth: 2 },
    md: { width: 40, height: 20, dotSize: 3, strokeWidth: 3 },
    lg: { width: 80, height: 40, dotSize: 6, strokeWidth: 5 },
  };

  const { width, height, dotSize, strokeWidth } = sizes[size];

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 160 80"
      className={`inline-block ${className}`}
    >
      {/* Background infinity path */}
      <path
        d="M80 40c-8.5 6-16 10-24 10-13.3 0-24-10.7-24-24s10.7-24 24-24c8 0 15.5 4 24 10 8.5-6 16-10 24-10 13.3 0 24 10.7 24 24s-10.7 24-24 24c-8 0-15.5-4-24-10z"
        fill="none"
        stroke="#FF6B35"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        opacity="0.2"
      />
      {/* Glowing dot */}
      <circle
        r={dotSize}
        fill="#FF6B35"
        style={{ filter: 'drop-shadow(0 0 4px #FF6B35) drop-shadow(0 0 8px #FFA500)' }}
      >
        <animateMotion
          dur="1.5s"
          repeatCount="indefinite"
          path="M80 40c-8.5 6-16 10-24 10-13.3 0-24-10.7-24-24s10.7-24 24-24c8 0 15.5 4 24 10 8.5-6 16-10 24-10 13.3 0 24 10.7 24 24s-10.7 24-24 24c-8 0-15.5-4-24-10z"
        />
      </circle>
    </svg>
  );
}
