"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SwapEstimate, SwapResult } from "@circle-fin/app-kit";
import type { ViemAdapter } from "@circle-fin/adapter-viem-v2";
import {
  useAccount,
  useChainId,
  useSwitchChain,
} from "wagmi";
import { kit } from "@/lib/app-kit";
import { arcTestnet } from "@/lib/chains";
import type { UseSwapReturn } from "@/hooks/useSwap.types";

export type { UseSwapReturn } from "@/hooks/useSwap.types";
import {
  DEFAULT_SLIPPAGE_BPS,
  isKitKeyConfigured,
  KIT_KEY,
  SWAP_CHAIN,
  type SwapToken,
} from "@/lib/swap-config";
import { createAdapterFromProvider } from "@/lib/wallet";
import type { EIP1193Provider } from "viem";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Something went wrong. Please try again.";
}

function shouldFetchEstimate(
  adapter: ViemAdapter | null,
  address: string | undefined,
  amountIn: string,
  tokenIn: SwapToken,
  tokenOut: SwapToken,
  wrongNetwork: boolean,
): boolean {
  if (!adapter || !address || !isKitKeyConfigured() || wrongNetwork) {
    return false;
  }
  const parsedAmount = Number.parseFloat(amountIn);
  if (!amountIn || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
    return false;
  }
  if (tokenIn === tokenOut) return false;
  return true;
}

export function useSwap(): UseSwapReturn {
  const { address, isConnected, connector } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync, isPending: isSwitchingChain } = useSwitchChain();

  const [adapter, setAdapter] = useState<ViemAdapter | null>(null);
  const [tokenIn, setTokenIn] = useState<SwapToken>("USDC");
  const [tokenOut, setTokenOut] = useState<SwapToken>("EURC");
  const [amountIn, setAmountIn] = useState("");
  const [slippageBps, setSlippageBps] = useState(DEFAULT_SLIPPAGE_BPS);
  const [estimate, setEstimate] = useState<SwapEstimate | null>(null);
  const [result, setResult] = useState<SwapResult | null>(null);
  const [isEstimating, setIsEstimating] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const estimateRequestId = useRef(0);

  const wrongNetwork = isConnected && chainId !== arcTestnet.id;

  const isBusy = isEstimating || isSwapping || isSwitchingChain;

  useEffect(() => {
    let cancelled = false;

    async function initAdapter() {
      if (!isConnected || !connector) {
        setAdapter(null);
        return;
      }

      try {
        const provider = (await connector.getProvider()) as EIP1193Provider;
        const nextAdapter = await createAdapterFromProvider(provider);
        if (!cancelled) {
          setAdapter(nextAdapter);
        }
      } catch {
        if (!cancelled) {
          setAdapter(null);
        }
      }
    }

    void initAdapter();

    return () => {
      cancelled = true;
    };
  }, [connector, isConnected]);

  const switchNetwork = useCallback(async () => {
    setError(null);
    try {
      await switchChainAsync({ chainId: arcTestnet.id });
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }, [switchChainAsync]);

  const flipTokens = useCallback(() => {
    setTokenIn(tokenOut);
    setTokenOut(tokenIn);
    setAmountIn("");
    setEstimate(null);
    setResult(null);
    setError(null);
    setIsEstimating(false);
  }, [tokenIn, tokenOut]);

  const updateAmountIn = useCallback((value: string) => {
    setAmountIn(value);
    const parsedAmount = Number.parseFloat(value);
    if (!value || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setEstimate(null);
      setIsEstimating(false);
    }
  }, []);

  const updateTokenIn = useCallback((token: SwapToken) => {
    setTokenIn(token);
    if (token === tokenOut) {
      setEstimate(null);
      setIsEstimating(false);
    }
  }, [tokenOut]);

  const updateTokenOut = useCallback((token: SwapToken) => {
    setTokenOut(token);
    if (token === tokenIn) {
      setEstimate(null);
      setIsEstimating(false);
    }
  }, [tokenIn]);

  useEffect(() => {
    const canEstimate = shouldFetchEstimate(
      adapter,
      address,
      amountIn,
      tokenIn,
      tokenOut,
      wrongNetwork,
    );

    if (!canEstimate) {
      setIsEstimating(false);
      return;
    }

    setIsEstimating(true);
    setError(null);

    const requestId = ++estimateRequestId.current;
    const timer = window.setTimeout(async () => {
      try {
        const nextEstimate = await kit.estimateSwap({
          from: { adapter: adapter!, chain: SWAP_CHAIN },
          tokenIn,
          tokenOut,
          amountIn,
          config: {
            kitKey: KIT_KEY,
            slippageBps,
          },
        });

        if (requestId !== estimateRequestId.current) return;
        setEstimate(nextEstimate);
      } catch (err) {
        if (requestId !== estimateRequestId.current) return;
        setEstimate(null);
        setError(getErrorMessage(err));
      } finally {
        if (requestId === estimateRequestId.current) {
          setIsEstimating(false);
        }
      }
    }, 400);

    return () => {
      window.clearTimeout(timer);
      estimateRequestId.current += 1;
    };
  }, [adapter, address, amountIn, slippageBps, tokenIn, tokenOut, wrongNetwork]);

  const swap = useCallback(async () => {
    if (!adapter || !address) {
      setError("Connect your wallet to swap.");
      return;
    }

    if (!isKitKeyConfigured()) {
      setError("Set KIT_KEY (or NEXT_PUBLIC_KIT_KEY) in .env.local.");
      return;
    }

    if (wrongNetwork) {
      setError("Switch to Arc Testnet to continue.");
      return;
    }

    if (isEstimating) {
      setError("Wait for the quote to finish.");
      return;
    }

    const parsedAmount = Number.parseFloat(amountIn);
    if (!amountIn || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Enter a valid amount.");
      return;
    }

    if (tokenIn === tokenOut) {
      setError("Select two different tokens.");
      return;
    }

    setIsSwapping(true);
    setError(null);
    setResult(null);

    try {
      const swapResult: SwapResult = await kit.swap({
        from: { adapter, chain: SWAP_CHAIN },
        tokenIn,
        tokenOut,
        amountIn,
        config: {
          kitKey: KIT_KEY,
          slippageBps,
        },
      });
      setResult(swapResult);
      setAmountIn("");
      setEstimate(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSwapping(false);
    }
  }, [
    adapter,
    address,
    amountIn,
    isEstimating,
    slippageBps,
    tokenIn,
    tokenOut,
    wrongNetwork,
  ]);

  const clearResult = useCallback(() => {
    setResult(null);
  }, []);

  return useMemo(
    (): UseSwapReturn => ({
      address: (address as `0x${string}` | undefined) ?? null,
      adapter,
      wrongNetwork,
      tokenIn,
      tokenOut,
      amountIn,
      slippageBps,
      estimate,
      result,
      isSwitchingChain,
      isEstimating,
      isSwapping,
      isBusy,
      error,
      isConnected,
      kitKeyConfigured: isKitKeyConfigured(),
      setTokenIn: updateTokenIn,
      setTokenOut: updateTokenOut,
      setAmountIn: updateAmountIn,
      setSlippageBps,
      switchNetwork,
      flipTokens,
      swap,
      clearResult,
    }),
    [
      address,
      adapter,
      wrongNetwork,
      tokenIn,
      tokenOut,
      amountIn,
      slippageBps,
      estimate,
      result,
      isSwitchingChain,
      isEstimating,
      isSwapping,
      isBusy,
      error,
      isConnected,
      updateTokenIn,
      updateTokenOut,
      updateAmountIn,
      switchNetwork,
      flipTokens,
      swap,
      clearResult,
    ],
  );
}
