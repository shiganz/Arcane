"use client";

import { SWAP_TOKENS, type SwapToken } from "@/lib/swap-config";

type TokenSelectProps = {
  label: string;
  value: SwapToken;
  onChange: (token: SwapToken) => void;
  disabled?: boolean;
};

export function TokenSelect({
  label,
  value,
  onChange,
  disabled = false,
}: TokenSelectProps) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
        {label}
      </span>
      <select
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value as SwapToken)}
        className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-base font-medium text-zinc-900 outline-none transition-colors focus:border-zinc-400 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-600"
      >
        {SWAP_TOKENS.map((token) => (
          <option key={token} value={token}>
            {token}
          </option>
        ))}
      </select>
    </label>
  );
}
