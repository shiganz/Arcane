"use client";

import { ConnectButton, useConnectModal } from "@rainbow-me/rainbowkit";
import { FeeBreakdown } from "@/components/swap/FeeBreakdown";
import { SwapResultPanel } from "@/components/swap/SwapResult";
import { TokenSelect } from "@/components/swap/TokenSelect";
import { useSwap } from "@/hooks/useSwap";
import { isWalletConnectConfigured } from "@/lib/wagmi";
import { SLIPPAGE_PRESETS } from "@/lib/swap-config";

export function SwapCard() {
  const swap = useSwap();
  const { openConnectModal } = useConnectModal();

  const ctaLabel = (() => {
    if (!swap.kitKeyConfigured) return "Configure kit key";
    if (!swap.isConnected) return "Connect wallet";
    if (swap.wrongNetwork) return "Switch to Arc Testnet";
    if (!swap.amountIn) return "Enter amount";
    if (swap.tokenIn === swap.tokenOut) return "Select different tokens";
    if (swap.isSwapping) return "Swapping…";
    if (swap.isSwitchingChain) return "Switching network…";
    return "Swap";
  })();

  const isCtaDisabled =
    !swap.kitKeyConfigured ||
    swap.isSwapping ||
    swap.isSwitchingChain ||
    (swap.isConnected &&
      !swap.wrongNetwork &&
      (!swap.amountIn || swap.tokenIn === swap.tokenOut));

  const handlePrimaryAction = () => {
    if (!swap.kitKeyConfigured) return;
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
    <div className="w-full max-w-md space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Arc Swap
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Swap stablecoins on Arc Testnet
          </p>
        </div>
        <ConnectButton showBalance={false} chainStatus="icon" />
      </div>

      {!isWalletConnectConfigured() && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
          <p>
            Add a project ID to <code className="font-mono">.env.local</code> as{" "}
            <code className="font-mono">NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID</code>{" "}
            from{" "}
            <a
              href="https://cloud.reown.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2"
            >
              Reown Cloud
            </a>
            .
          </p>
        </div>
      )}

      {process.env.NODE_ENV === "development" && isWalletConnectConfigured() && (
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-300">
          <p className="font-medium text-zinc-800 dark:text-zinc-200">
            Seeing &quot;Origin not found on Allowlist&quot;?
          </p>
          <p className="mt-1">
            In{" "}
            <a
              href="https://cloud.reown.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2"
            >
              cloud.reown.com
            </a>
            , open your project → <strong>Domains</strong> and add:
          </p>
          <ul className="mt-2 list-inside list-disc font-mono text-xs">
            <li>http://localhost:3000</li>
            <li>http://127.0.0.1:3000</li>
          </ul>
          <p className="mt-2">Save, then restart <code className="font-mono">npm run dev</code>.</p>
        </div>
      )}

      {!swap.kitKeyConfigured && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
          Add your Circle kit key to <code className="font-mono">.env.local</code>{" "}
          as <code className="font-mono">KIT_KEY</code> (or{" "}
          <code className="font-mono">NEXT_PUBLIC_KIT_KEY</code>). Copy from{" "}
          <code className="font-mono">.env.example</code>.
        </div>
      )}

      {!swap.isConnected && swap.kitKeyConfigured && (
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-300">
          <p>Before swapping:</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>Connect your wallet with RainbowKit (top right)</li>
            <li>
              <a
                href="https://docs.arc.io/arc/references/connect-to-arc#wallet-setup"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2"
              >
                Add Arc Testnet to your wallet if needed
              </a>
            </li>
            <li>
              <a
                href="https://faucet.circle.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2"
              >
                Fund your wallet from the Circle faucet
              </a>
            </li>
          </ul>
        </div>
      )}

      {swap.wrongNetwork && swap.isConnected && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-100">
          Your wallet is not on Arc Testnet. Use the button below to switch
          networks.
        </div>
      )}

      <div className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <TokenSelect
          label="You pay"
          value={swap.tokenIn}
          onChange={swap.setTokenIn}
          disabled={!swap.isConnected}
        />

        <div className="flex justify-center">
          <button
            type="button"
            onClick={swap.flipTokens}
            disabled={!swap.isConnected}
            aria-label="Flip tokens"
            className="rounded-full border border-zinc-200 p-2 text-zinc-600 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-5 w-5"
            >
              <path
                fillRule="evenodd"
                d="M14.478 3.404a.75.75 0 0 1 0 1.06L12.94 6l1.54 1.54a.75.75 0 1 1-1.06 1.06L11 7.53l-1.54 1.54a.75.75 0 1 1-1.06-1.06L10.47 6 8.93 4.46a.75.75 0 0 1 1.06-1.06L11 5.47l1.54-1.54a.75.75 0 0 1 1.06 0ZM5.52 13.47l1.54 1.54a.75.75 0 1 1-1.06 1.06L5.47 14.53l-1.54 1.54a.75.75 0 0 1-1.06-1.06L5.47 13.47 3.93 11.93a.75.75 0 0 1 1.06-1.06l1.54 1.54 1.54-1.54a.75.75 0 1 1 1.06 1.06L5.52 13.47Z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        <TokenSelect
          label="You receive"
          value={swap.tokenOut}
          onChange={swap.setTokenOut}
          disabled={!swap.isConnected}
        />

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Amount
          </span>
          <input
            type="text"
            inputMode="decimal"
            placeholder="0.00"
            value={swap.amountIn}
            disabled={!swap.isConnected}
            onChange={(event) => swap.setAmountIn(event.target.value)}
            className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-base text-zinc-900 outline-none transition-colors focus:border-zinc-400 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-600"
          />
        </label>

        <div className="space-y-2">
          <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Slippage tolerance
          </span>
          <div className="flex gap-2">
            {SLIPPAGE_PRESETS.map((preset) => (
              <button
                key={preset.bps}
                type="button"
                disabled={!swap.isConnected}
                onClick={() => swap.setSlippageBps(preset.bps)}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                  swap.slippageBps === preset.bps
                    ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                    : "border-zinc-200 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <FeeBreakdown
          estimate={swap.estimate}
          isEstimating={swap.isEstimating}
          tokenOut={swap.tokenOut}
        />

        {swap.error && (
          <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-100">
            {swap.error}
          </p>
        )}

        {swap.result && (
          <SwapResultPanel
            result={swap.result}
            onDismiss={swap.clearResult}
          />
        )}

        <button
          type="button"
          onClick={handlePrimaryAction}
          disabled={isCtaDisabled}
          className="w-full rounded-xl bg-zinc-900 px-4 py-3.5 text-base font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          {ctaLabel}
        </button>
      </div>
    </div>
  );
}
