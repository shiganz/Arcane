"use client";

import type { SwapResult } from "@circle-fin/app-kit";

type SwapResultProps = {
  result: SwapResult;
  onDismiss: () => void;
};

export function SwapResultPanel({ result, onDismiss }: SwapResultProps) {
  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 dark:border-emerald-900/50 dark:bg-emerald-950/30">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-medium text-emerald-900 dark:text-emerald-100">
            Swap successful
          </p>
          <p className="mt-1 text-sm text-emerald-800 dark:text-emerald-200">
            {result.amountOut
              ? `Received ${result.amountOut} ${result.tokenOut}`
              : `Swapped for ${result.tokenOut}`}
          </p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="text-sm text-emerald-700 hover:text-emerald-900 dark:text-emerald-300 dark:hover:text-emerald-100"
        >
          Dismiss
        </button>
      </div>
      {result.explorerUrl && (
        <a
          href={result.explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block text-sm font-medium text-emerald-700 underline underline-offset-2 hover:text-emerald-900 dark:text-emerald-300 dark:hover:text-emerald-100"
        >
          View on Arcscan
        </a>
      )}
    </div>
  );
}
