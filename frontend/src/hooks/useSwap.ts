"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { SwapEstimate, SwapResult } from "@circle-fin/app-kit";
import type { ViemAdapter } from "@circle-fin/adapter-viem-v2";
import {
  useAccount,
  useChainId,
  useSwitchChain,
} from "wagmi";
import { kit } from "@/lib/app-kit";
import { arcTestnet } from "@/lib/chains";
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

export function useSwap() {
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
  }, [tokenIn, tokenOut]);

  const updateAmountIn = useCallback((value: string) => {
    setAmountIn(value);
    const parsedAmount = Number.parseFloat(value);
    if (!value || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setEstimate(null);
    }
  }, []);

  const updateTokenIn = useCallback((token: SwapToken) => {
    setTokenIn(token);
    if (token === tokenOut) setEstimate(null);
  }, [tokenOut]);

  const updateTokenOut = useCallback((token: SwapToken) => {
    setTokenOut(token);
    if (token === tokenIn) setEstimate(null);
  }, [tokenIn]);

  useEffect(() => {
    if (!adapter || !address || !isKitKeyConfigured() || wrongNetwork) {
      return;
    }

    const parsedAmount = Number.parseFloat(amountIn);
    if (!amountIn || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      return;
    }

    if (tokenIn === tokenOut) {
      return;
    }

    const requestId = ++estimateRequestId.current;
    const timer = window.setTimeout(async () => {
      setIsEstimating(true);
      setError(null);

      try {
        const nextEstimate = await kit.estimateSwap({
          from: { adapter, chain: SWAP_CHAIN },
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

    return () => window.clearTimeout(timer);
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
      const swapResult = await kit.swap({
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
    slippageBps,
    tokenIn,
    tokenOut,
    wrongNetwork,
  ]);

  const clearResult = useCallback(() => {
    setResult(null);
  }, []);

  return {
    address: address ?? null,
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
  };
}
