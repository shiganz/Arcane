"use client";

import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

type SwapStatusBannerProps = {
  message: string;
};

/** Compact inline status — not a full-card overlay */
export function SwapStatusBanner({ message }: SwapStatusBannerProps) {
  return (
    <div
      className="mt-4 flex items-center gap-2.5 rounded-xl border border-orange-500/25 bg-orange-500/10 px-3 py-2.5"
      role="status"
      aria-live="polite"
    >
      <LoadingSpinner size="sm" />
      <p className="text-sm text-orange-200/90">{message}</p>
    </div>
  );
}
