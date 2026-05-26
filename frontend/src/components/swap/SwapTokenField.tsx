"use client";

import { useState } from "react";
import type { SwapToken } from "@/lib/swap-config";
import { TokenIcon } from "@/components/swap/TokenIcon";
import { TokenPickerModal } from "@/components/swap/TokenPickerModal";
import { formatUnits } from "viem";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { formatBalance, TOKEN_META } from "@/lib/tokens";

type SwapTokenFieldProps = {
  label: string;
  token: SwapToken;
  onTokenChange: (token: SwapToken) => void;
  amount?: string;
  onAmountChange?: (value: string) => void;
  displayAmount?: string;
  readOnlyAmount?: boolean;
  balance?: bigint;
  isLoadingBalance?: boolean;
  disabled?: boolean;
  excludeToken?: SwapToken;
  balances: Record<SwapToken, bigint | undefined>;
  isLoadingBalances: boolean;
  showPercentShortcuts?: boolean;
  isLoadingQuote?: boolean;
};

const PERCENTAGES = [10, 25, 50, 75] as const;

export function SwapTokenField({
  label,
  token,
  onTokenChange,
  amount = "",
  onAmountChange,
  displayAmount,
  readOnlyAmount = false,
  balance,
  isLoadingBalance,
  disabled,
  excludeToken,
  balances,
  isLoadingBalances,
  showPercentShortcuts = false,
  isLoadingQuote = false,
}: SwapTokenFieldProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const meta = TOKEN_META[token];
  const formattedBalance = formatBalance(balance, meta.decimals);

  const setPercent = (pct: number) => {
    if (!onAmountChange || balance === undefined) return;
    const portion = (balance * BigInt(pct)) / BigInt(100);
    onAmountChange(formatUnits(portion, meta.decimals));
  };

  const setMax = () => {
    if (!onAmountChange || balance === undefined) return;
    onAmountChange(formatBalance(balance, meta.decimals, 6));
  };

  return (
    <>
      <section className="rounded-2xl border border-[#2a3548]/80 bg-[#141c28]/90 p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-[#8b95a8]">{label}</p>
          {showPercentShortcuts && !disabled && balance !== undefined && (
            <div className="flex gap-1">
              {PERCENTAGES.map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setPercent(pct)}
                  className="cursor-pointer rounded-md px-2 py-0.5 text-xs font-medium text-[#8b95a8] transition-colors hover:bg-[#1e2836] hover:text-orange-300"
                >
                  {pct}%
                </button>
              ))}
              <button
                type="button"
                onClick={setMax}
                className="cursor-pointer rounded-md px-2 py-0.5 text-xs font-medium text-orange-400 transition-colors hover:bg-orange-500/10"
              >
                Max
              </button>
            </div>
          )}
        </div>

        <div className="flex items-start gap-3">
          <button
            type="button"
            disabled={disabled}
            onClick={() => setPickerOpen(true)}
            className="token-select-trigger flex shrink-0 cursor-pointer items-center gap-2 rounded-xl border border-[#2a3548] bg-[#0d1219] py-2 pr-3 pl-2 transition-colors hover:border-[#3d4d66] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <TokenIcon token={token} size="md" />
            <div className="text-left">
              <span className="block text-sm font-semibold text-white">
                {token}
              </span>
              <span className="block text-xs text-[#5c6478]">▼</span>
            </div>
          </button>

          <div className="min-w-0 flex-1">
            {readOnlyAmount ? (
              isLoadingQuote ? (
                <div className="flex items-center justify-end gap-2 py-1">
                  <LoadingSpinner size="sm" />
                  <span className="arcane-shimmer inline-block h-9 w-28 rounded-lg" />
                </div>
              ) : (
                <p className="text-right text-3xl font-semibold text-white tabular-nums">
                  {displayAmount ?? "0.00"}
                </p>
              )
            ) : (
              <input
                type="text"
                inputMode="decimal"
                placeholder="0.00"
                value={amount}
                disabled={disabled}
                onChange={(e) => onAmountChange?.(e.target.value)}
                className="w-full bg-transparent text-right text-3xl font-semibold text-white placeholder:text-[#3d4d66] outline-none disabled:cursor-not-allowed disabled:opacity-40"
              />
            )}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-end gap-1.5 text-xs text-[#5c6478]">
          <span aria-hidden>💼</span>
          <span>
            {isLoadingBalance ? (
              "Loading…"
            ) : (
              <>
                <span className="text-[#8b95a8]">{formattedBalance}</span>
                <span className="text-[#5c6478]"> {token}</span>
              </>
            )}
          </span>
        </div>
      </section>

      <TokenPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={onTokenChange}
        selected={token}
        balances={balances}
        isLoadingBalances={isLoadingBalances}
        exclude={excludeToken}
      />
    </>
  );
}
