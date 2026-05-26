import type { SwapToken } from "@/lib/swap-config";
import { TOKEN_META } from "@/lib/tokens";

type TokenIconProps = {
  token: SwapToken;
  size?: "sm" | "md" | "lg";
};

const SIZES = {
  sm: "h-6 w-6 text-[10px]",
  md: "h-8 w-8 text-xs",
  lg: "h-10 w-10 text-sm",
};

export function TokenIcon({ token, size = "md" }: TokenIconProps) {
  const meta = TOKEN_META[token];
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full font-bold ${meta.iconBg} ${SIZES[size]}`}
      style={{ color: meta.color }}
    >
      {token === "cirBTC" ? "₿" : token.slice(0, 1)}
    </span>
  );
}
