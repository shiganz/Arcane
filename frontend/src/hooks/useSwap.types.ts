import type { SwapEstimate, SwapResult } from "@circle-fin/app-kit";
import type { ViemAdapter } from "@circle-fin/adapter-viem-v2";
import type { SwapToken } from "@/lib/swap-config";

export type UseSwapReturn = {
  /** Connected wallet address, or null if disconnected */
  address: `0x${string}` | null;
  /** Circle App Kit viem adapter for the connected wallet */
  adapter: ViemAdapter | null;
  /** True when wallet is connected but not on Arc Testnet */
  wrongNetwork: boolean;
  tokenIn: SwapToken;
  tokenOut: SwapToken;
  amountIn: string;
  slippageBps: number;
  /** Latest quote from `kit.estimateSwap`, or null */
  estimate: SwapEstimate | null;
  /** Result from a completed `kit.swap`, or null */
  result: SwapResult | null;
  isSwitchingChain: boolean;
  /** True while a quote is being fetched (includes debounce window) */
  isEstimating: boolean;
  /** True while a swap transaction is in progress */
  isSwapping: boolean;
  /** True when estimating, swapping, or switching chain */
  isBusy: boolean;
  error: string | null;
  isConnected: boolean;
  kitKeyConfigured: boolean;
  setTokenIn: (token: SwapToken) => void;
  setTokenOut: (token: SwapToken) => void;
  setAmountIn: (value: string) => void;
  setSlippageBps: (value: number) => void;
  switchNetwork: () => Promise<void>;
  flipTokens: () => void;
  swap: () => Promise<void>;
  clearResult: () => void;
};
