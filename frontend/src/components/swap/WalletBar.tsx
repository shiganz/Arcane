"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { formatBalance, truncateAddress, TOKEN_META } from "@/lib/tokens";

type WalletBarProps = {
  address: string | null;
  usdcBalance?: bigint;
  isLoadingUsdc?: boolean;
};

export function WalletBar({
  address,
  usdcBalance,
  isLoadingUsdc,
}: WalletBarProps) {
  if (!address) {
    return <ConnectButton showBalance={false} chainStatus="icon" />;
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2.5 rounded-xl border border-[#2a3548] bg-[#141c28]/90 px-3 py-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500/20 text-xs font-bold text-blue-400">
          $
        </span>
        <div>
          <p className="text-sm font-semibold leading-tight text-white tabular-nums">
            {isLoadingUsdc
              ? "…"
              : formatBalance(usdcBalance, TOKEN_META.USDC.decimals)}
          </p>
          <p className="text-[10px] leading-tight text-[#5c6478]">USDC</p>
        </div>
      </div>
      <div className="flex items-center gap-2 rounded-xl border border-[#2a3548] bg-[#141c28]/90 py-1 pr-1 pl-3">
        <p className="font-mono text-xs text-[#c5cdd9] sm:text-sm">
          {truncateAddress(address)}
        </p>
        <ConnectButton
          showBalance={false}
          chainStatus="none"
          accountStatus="avatar"
        />
      </div>
    </div>
  );
}
