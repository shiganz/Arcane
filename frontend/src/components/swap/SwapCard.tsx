"use client";

import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useMemo } from "react";
import { parseUnits } from "viem";
import { FeeBreakdown } from "@/components/swap/FeeBreakdown";
import { SwapResultPanel } from "@/components/swap/SwapResult";
import { SwapStatusBanner } from "@/components/swap/SwapStatusBanner";
import { SwapTokenField } from "@/components/swap/SwapTokenField";
import { ArcaneLogo } from "@/components/ArcaneLogo";
import { WalletBar } from "@/components/swap/WalletBar";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useSwap } from "@/hooks/useSwap";
import { useTokenBalances } from "@/hooks/useTokenBalances";
import { SLIPPAGE_PRESETS } from "@/lib/swap-config";
import { TOKEN_META } from "@/lib/tokens";

function FlipIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4"
    >
      <path
        fillRule="evenodd"
        d="M14.478 3.404a.75.75 0 0 1 0 1.06L12.94 6l1.54 1.54a.75.75 0 1 1-1.06 1.06L11 7.53l-1.54 1.54a.75.75 0 1 1-1.06-1.06L10.47 6 8.93 4.46a.75.75 0 0 1 1.06-1.06L11 5.47l1.54-1.54a.75.75 0 0 1 1.06 0ZM5.52 13.47l1.54 1.54a.75.75 0 1 1-1.06 1.06L5.47 14.53l-1.54 1.54a.75.75 0 0 1-1.06-1.06L5.47 13.47 3.93 11.93a.75.75 0 0 1 1.06-1.06l1.54 1.54 1.54-1.54a.75.75 0 1 1 1.06 1.06L5.52 13.47Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function SwapCard() {
  const swap = useSwap();
  const { balances, isLoading: isLoadingBalances, refetch } = useTokenBalances();
  const { openConnectModal } = useConnectModal();

  const payBalance = balances[swap.tokenIn];
  const receiveBalance = balances[swap.tokenOut];
  const usdcBalance = balances.USDC;

  const insufficientBalance = useMemo(() => {
    if (!swap.amountIn || payBalance === undefined) return false;
    try {
      const decimals = TOKEN_META[swap.tokenIn].decimals;
      const needed = parseUnits(swap.amountIn, decimals);
      return needed > payBalance;
    } catch {
      return false;
    }
  }, [swap.amountIn, swap.tokenIn, payBalance]);

  const rateLabel = useMemo(() => {
    if (swap.isEstimating || !swap.estimate || !swap.amountIn) return null;
    const inAmt = Number.parseFloat(swap.amountIn);
    const outAmt = Number.parseFloat(swap.estimate.estimatedOutput.amount);
    if (!inAmt || !outAmt) return null;
    const rate = outAmt / inAmt;
    return `1 ${swap.tokenIn} ≈ ${rate.toLocaleString(undefined, { maximumFractionDigits: 4 })} ${swap.tokenOut}`;
  }, [swap.estimate, swap.amountIn, swap.tokenIn, swap.tokenOut, swap.isEstimating]);

  const ctaLabel = (() => {
    if (!swap.isConnected) return "Connect wallet";
    if (swap.wrongNetwork) return "Switch to Arc Testnet";
    if (swap.isSwapping) return "Swapping…";
    if (swap.isSwitchingChain) return "Switching network…";
    if (swap.isEstimating) return "Getting quote…";
    if (!swap.amountIn) return "Enter an amount";
    if (swap.tokenIn === swap.tokenOut) return "Choose different tokens";
    if (insufficientBalance) return "Insufficient balance";
    return "Swap";
  })();

  const hasValidSwapInput =
    swap.isConnected &&
    !swap.wrongNetwork &&
    Boolean(swap.amountIn) &&
    swap.tokenIn !== swap.tokenOut &&
    !insufficientBalance &&
    !swap.isEstimating;

  const isCtaDisabled =
    swap.isSwapping ||
    swap.isSwitchingChain ||
    swap.isEstimating ||
    insufficientBalance ||
    (swap.isConnected &&
      !swap.wrongNetwork &&
      (!swap.amountIn || swap.tokenIn === swap.tokenOut));

  const handlePrimaryAction = () => {
    if (!swap.isConnected) {
      openConnectModal?.();
      return;
    }
    if (swap.wrongNetwork) {
      void swap.switchNetwork();
      return;
    }
    void swap.swap();
  };

  return (
    <div className="w-full max-w-[480px]">
      <header className="mb-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <ArcaneLogo size={40} subtitle="Swap" />
          <WalletBar
            address={swap.address}
            usdcBalance={usdcBalance}
            isLoadingUsdc={isLoadingBalances}
          />
        </div>
      </header>

      <div className="swap-card rounded-2xl p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Swap</h2>
          <button
            type="button"
            onClick={() => void refetch()}
            disabled={swap.isSwapping}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-[#8b95a8] transition-colors hover:bg-[#1e2836] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Refresh balances"
            title="Refresh balances"
          >
            ↻
          </button>
        </div>

        <SwapTokenField
          label="You pay"
          token={swap.tokenIn}
          onTokenChange={swap.setTokenIn}
          amount={swap.amountIn}
          onAmountChange={swap.setAmountIn}
          balance={payBalance}
          isLoadingBalance={isLoadingBalances}
          disabled={!swap.isConnected || swap.isSwapping}
          excludeToken={swap.tokenOut}
          balances={balances}
          isLoadingBalances={isLoadingBalances}
          showPercentShortcuts
        />

        <div className="relative z-10 -my-2 flex justify-center">
          <button
            type="button"
            onClick={swap.flipTokens}
            disabled={!swap.isConnected || swap.isSwapping}
            aria-label="Flip tokens"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-[#2a3548] bg-[#121b24] text-[#8b95a8] shadow-lg transition-all hover:border-orange-500/40 hover:text-orange-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <FlipIcon />
          </button>
        </div>

        <SwapTokenField
          label="To get"
          token={swap.tokenOut}
          onTokenChange={swap.setTokenOut}
          readOnlyAmount
          isLoadingQuote={swap.isEstimating}
          displayAmount={
            swap.estimate
              ? swap.estimate.estimatedOutput.amount
              : "0.00"
          }
          balance={receiveBalance}
          isLoadingBalance={isLoadingBalances}
          disabled={!swap.isConnected || swap.isSwapping}
          excludeToken={swap.tokenIn}
          balances={balances}
          isLoadingBalances={isLoadingBalances}
        />

        <div className="mt-4">
          <p className="mb-2 text-xs font-medium text-[#8b95a8]">Slippage</p>
          <div className="flex gap-2">
            {SLIPPAGE_PRESETS.map((preset) => (
              <button
                key={preset.bps}
                type="button"
                disabled={!swap.isConnected || swap.isSwapping}
                onClick={() => swap.setSlippageBps(preset.bps)}
                className={`flex-1 cursor-pointer rounded-lg py-2 text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
                  swap.slippageBps === preset.bps
                    ? "bg-orange-500/15 text-orange-400 ring-1 ring-orange-500/40"
                    : "bg-[#0d1219] text-[#8b95a8] hover:bg-[#1e2836] hover:text-white"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <FeeBreakdown
            estimate={swap.estimate}
            isEstimating={swap.isEstimating}
            tokenOut={swap.tokenOut}
          />
        </div>

        {swap.isEstimating && (
          <p className="mt-3 flex items-center justify-center gap-2 text-xs text-[#8b95a8]">
            <LoadingSpinner size="sm" />
            Updating quote…
          </p>
        )}

        {rateLabel && !swap.isEstimating && (
          <p className="mt-3 text-center text-xs text-[#5c6478]">{rateLabel}</p>
        )}

        {swap.isSwapping && (
          <SwapStatusBanner message="Confirm the swap in your wallet…" />
        )}

        {swap.wrongNetwork && swap.isConnected && (
          <p className="mt-4 rounded-xl border border-amber-900/40 bg-amber-950/30 px-3 py-2.5 text-sm text-amber-400/90">
            Switch to Arc Testnet to continue.
          </p>
        )}

        {swap.error && (
          <p className="mt-4 rounded-xl border border-red-900/40 bg-red-950/30 px-3 py-2.5 text-sm text-red-400/90">
            {swap.error}
          </p>
        )}

        {swap.result && (
          <div className="mt-4">
            <SwapResultPanel result={swap.result} onDismiss={swap.clearResult} />
          </div>
        )}

        <button
          type="button"
          onClick={handlePrimaryAction}
          disabled={isCtaDisabled}
          aria-busy={swap.isEstimating || swap.isSwapping}
          className={`mt-5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl py-4 text-base font-semibold transition-all disabled:cursor-not-allowed ${
            hasValidSwapInput && !swap.isSwapping
              ? "swap-cta-primary"
              : "swap-cta"
          }`}
        >
          {swap.isSwapping && (
            <LoadingSpinner size="sm" className="border-[#3d4d66] border-t-white" />
          )}
          {ctaLabel}
        </button>
      </div>
    </div>
  );
}
