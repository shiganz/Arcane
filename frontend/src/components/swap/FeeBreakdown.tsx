"use client";

import type { SwapEstimate } from "@circle-fin/app-kit";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
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
    <div
      className={`space-y-2 rounded-xl border px-4 py-3 text-sm transition-colors ${
        isEstimating
          ? "border-orange-500/20 bg-[#0d1219]/80"
          : "border-[#2a3548]/60 bg-[#0d1219]/80"
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <span className="text-[#8b95a8]">Estimated receive</span>
        <span className="font-medium text-white tabular-nums">
          {isEstimating ? (
            <span className="inline-flex items-center gap-2">
              <LoadingSpinner size="sm" />
              <span className="arcane-shimmer inline-block h-4 w-16 rounded" />
            </span>
          ) : estimate ? (
            `${estimate.estimatedOutput.amount} ${tokenOut}`
          ) : (
            <span className="text-[#5c6478]">—</span>
          )}
        </span>
      </div>
      <div className="flex items-center justify-between gap-4">
        <span className="text-[#8b95a8]">Network fee</span>
        <span className="text-[#c5cdd9] tabular-nums">
          {providerFee
            ? `${providerFee.amount} ${providerFee.token}`
            : `~${PROVIDER_FEE_BPS / 100}%`}
        </span>
      </div>
      {estimate?.stopLimit && (
        <div className="flex items-center justify-between gap-4 border-t border-[#2a3548]/60 pt-2">
          <span className="text-[#8b95a8]">Minimum receive</span>
          <span className="text-[#c5cdd9] tabular-nums">
            {estimate.stopLimit.amount} {estimate.stopLimit.token}
          </span>
        </div>
      )}
    </div>
  );
}
