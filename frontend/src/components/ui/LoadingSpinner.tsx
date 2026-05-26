type LoadingSpinnerProps = {
  size?: "sm" | "md" | "lg";
  className?: string;
};

const SIZE_CLASS = {
  sm: "h-4 w-4 border-2",
  md: "h-5 w-5 border-2",
  lg: "h-8 w-8 border-[3px]",
} as const;

export function LoadingSpinner({
  size = "md",
  className = "",
}: LoadingSpinnerProps) {
  return (
    <span
      className={`arcane-spinner inline-block shrink-0 rounded-full border-[#2a3548] border-t-orange-400 ${SIZE_CLASS[size]} ${className}`}
      role="status"
      aria-hidden
    />
  );
}
