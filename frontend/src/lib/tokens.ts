import { formatUnits } from "viem";
import type { SwapToken } from "@/lib/swap-config";

export type TokenMeta = {
  symbol: SwapToken;
  name: string;
  address: `0x${string}`;
  decimals: number;
  color: string;
  iconBg: string;
};

export const TOKEN_META: Record<SwapToken, TokenMeta> = {
  USDC: {
    symbol: "USDC",
    name: "USD Coin",
    address: "0x3600000000000000000000000000000000000000",
    decimals: 6,
    color: "#3b82f6",
    iconBg: "bg-blue-500/20",
  },
  EURC: {
    symbol: "EURC",
    name: "Euro Coin",
    address: "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a",
    decimals: 6,
    color: "#8b5cf6",
    iconBg: "bg-violet-500/20",
  },
  cirBTC: {
    symbol: "cirBTC",
    name: "Circle BTC",
    address: "0xf0C4a4CE82A5746AbAAd9425360Ab04fbBA432BF",
    decimals: 8,
    color: "#f59e0b",
    iconBg: "bg-amber-500/20",
  },
};

export function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function formatBalance(
  value: bigint | undefined,
  decimals: number,
  maxFractionDigits = 4,
): string {
  if (value === undefined) return "—";
  const formatted = Number(formatUnits(value, decimals));
  if (!Number.isFinite(formatted)) return "0";
  if (formatted === 0) return "0";
  if (formatted < 0.0001) return "<0.0001";
  return formatted.toLocaleString(undefined, {
    maximumFractionDigits: maxFractionDigits,
  });
}
