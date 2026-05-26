export const SWAP_CHAIN = "Arc_Testnet" as const;

export const SWAP_TOKENS = ["USDC", "EURC", "cirBTC"] as const;

export type SwapToken = (typeof SWAP_TOKENS)[number];

export const DEFAULT_SLIPPAGE_BPS = 300;

export const SLIPPAGE_PRESETS = [
  { label: "0.5%", bps: 50 },
  { label: "1%", bps: 100 },
  { label: "3%", bps: 300 },
] as const;

export const PROVIDER_FEE_BPS = 2;

export const KIT_KEY =
  process.env.NEXT_PUBLIC_KIT_KEY ?? process.env.KIT_KEY ?? "";

export function isKitKeyConfigured(): boolean {
  return KIT_KEY.length > 0 && KIT_KEY !== "YOUR_KIT_KEY";
}
