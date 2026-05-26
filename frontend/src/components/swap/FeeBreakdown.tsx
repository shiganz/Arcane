"use client";

import type { SwapEstimate } from "@circle-fin/app-kit";
import { PROVIDER_FEE_BPS } from "@/lib/swap-config";

type FeeBreakdownProps = {
  estimate: SwapEstimate | null;
  isEstimating: boolean;
  tokenOut: string;
};

export function FeeBreakdown({
  estimate,
  isEstimating,
  tokenOut,
}: FeeBreakdownProps) {
  const providerFee = estimate?.fees?.find((fee) => fee.type === "provider");

  return (
    <div className="space-y-2 rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3 text-sm dark:border-zinc-800 dark:bg-zinc-900/50">
      <div className="flex items-center justify-between gap-4">
        <span className="text-zinc-500 dark:text-zinc-400">Estimated receive</span>
        <span className="font-medium text-zinc-900 dark:text-zinc-100">
          {isEstimating
            ? "Fetching…"
            : estimate
              ? `${estimate.estimatedOutput.amount} ${tokenOut}`
              : "—"}
        </span>
      </div>
      <div className="flex items-center justify-between gap-4">
        <span className="text-zinc-500 dark:text-zinc-400">Provider fee</span>
        <span className="text-zinc-700 dark:text-zinc-300">
          {providerFee
            ? `${providerFee.amount} ${providerFee.token}`
            : `${PROVIDER_FEE_BPS / 100}% of swap amount`}
        </span>
      </div>
      {estimate?.stopLimit && (
        <div className="flex items-center justify-between gap-4">
          <span className="text-zinc-500 dark:text-zinc-400">Minimum receive</span>
          <span className="text-zinc-700 dark:text-zinc-300">
            {estimate.stopLimit.amount} {estimate.stopLimit.token}
          </span>
        </div>
      )}
    </div>
  );
}
