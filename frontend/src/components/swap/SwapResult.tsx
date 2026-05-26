"use client";

import type { SwapResult } from "@circle-fin/app-kit";

type SwapResultProps = {
  result: SwapResult;
  onDismiss: () => void;
};

export function SwapResultPanel({ result, onDismiss }: SwapResultProps) {
  return (
    <div className="rounded-xl border border-emerald-900/50 bg-emerald-950/40 px-4 py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-900/50 text-emerald-400">
            ✓
          </span>
          <div>
            <p className="font-medium text-emerald-400">Swap complete</p>
            <p className="mt-0.5 text-sm text-emerald-500/80">
              {result.amountOut
                ? `Received ${result.amountOut} ${result.tokenOut}`
                : `Swapped for ${result.tokenOut}`}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 text-sm text-emerald-600 transition-colors hover:text-emerald-400"
        >
          Close
        </button>
      </div>
      {result.explorerUrl && (
        <a
          href={result.explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-500 transition-colors hover:text-emerald-400"
        >
          View transaction
          <span aria-hidden>→</span>
        </a>
      )}
    </div>
  );
}
