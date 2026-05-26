"use client";

import { useState } from "react";
import type { SwapToken } from "@/lib/swap-config";
import { SWAP_TOKENS } from "@/lib/swap-config";
import { TokenIcon } from "@/components/swap/TokenIcon";
import {
  formatBalance,
  TOKEN_META,
  truncateAddress,
} from "@/lib/tokens";

type TokenPickerModalProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (token: SwapToken) => void;
  selected: SwapToken;
  balances: Record<SwapToken, bigint | undefined>;
  isLoadingBalances: boolean;
  exclude?: SwapToken;
};

export function TokenPickerModal({
  open,
  onClose,
  onSelect,
  selected,
  balances,
  isLoadingBalances,
  exclude,
}: TokenPickerModalProps) {
  const [query, setQuery] = useState("");

  if (!open) return null;

  const filtered = SWAP_TOKENS.filter((token) => {
    if (token === exclude) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    const meta = TOKEN_META[token];
    return (
      token.toLowerCase().includes(q) ||
      meta.name.toLowerCase().includes(q) ||
      meta.address.toLowerCase().includes(q)
    );
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Select a token"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-pointer bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close"
      />
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-[#2a3548] bg-[#121b24] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#2a3548] px-5 py-4">
          <h2 className="text-lg font-semibold text-white">Select a token</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-[#8b95a8] transition-colors hover:bg-[#1e2836] hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="p-4">
          <div className="relative">
            <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[#5c6478]">
              ⌕
            </span>
            <input
              type="text"
              placeholder="Search by token name or address"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-xl border border-[#2a3548] bg-[#0d1219] py-3 pr-4 pl-9 text-sm text-white placeholder:text-[#5c6478] outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30"
            />
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {SWAP_TOKENS.filter((t) => t !== exclude).map((token) => (
              <button
                key={token}
                type="button"
                onClick={() => {
                  onSelect(token);
                  onClose();
                }}
                className="cursor-pointer rounded-full border border-[#2a3548] bg-[#1e2836] px-3 py-1 text-xs font-medium text-[#c5cdd9] transition-colors hover:border-orange-500/40 hover:text-orange-300"
              >
                {token}
              </button>
            ))}
          </div>
        </div>

        <div className="max-h-[320px] overflow-y-auto border-t border-[#2a3548] px-2 py-2">
          {filtered.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-[#5c6478]">
              No tokens found
            </p>
          ) : (
            filtered.map((token) => {
              const meta = TOKEN_META[token];
              const balance = balances[token];
              const isSelected = token === selected;

              return (
                <button
                  key={token}
                  type="button"
                  onClick={() => {
                    onSelect(token);
                    onClose();
                  }}
                  className={`token-list-item flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors ${
                    isSelected
                      ? "bg-[#1e2836] ring-1 ring-orange-500/30"
                      : "hover:bg-[#1a222e]"
                  }`}
                >
                  <TokenIcon token={token} size="lg" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">{token}</span>
                      <span className="truncate text-xs text-[#5c6478]">
                        {meta.name}
                      </span>
                    </div>
                    <p className="mt-0.5 font-mono text-xs text-[#5c6478]">
                      {truncateAddress(meta.address)}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-medium text-white tabular-nums">
                      {isLoadingBalances
                        ? "…"
                        : formatBalance(balance, meta.decimals)}
                    </p>
                    <p className="text-xs text-[#5c6478]">{token}</p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
