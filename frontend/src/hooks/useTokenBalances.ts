"use client";

import { useMemo } from "react";
import { useAccount, useReadContracts } from "wagmi";
import { erc20Abi } from "viem";
import { arcTestnet } from "@/lib/chains";
import type { SwapToken } from "@/lib/swap-config";
import { TOKEN_META } from "@/lib/tokens";
import { SWAP_TOKENS } from "@/lib/swap-config";

export function useTokenBalances() {
  const { address, isConnected } = useAccount();

  const contracts = useMemo(
    () =>
      SWAP_TOKENS.map((token) => ({
        address: TOKEN_META[token].address,
        abi: erc20Abi,
        functionName: "balanceOf" as const,
        args: [address!] as const,
        chainId: arcTestnet.id,
      })),
    [address],
  );

  const { data, isLoading, refetch } = useReadContracts({
    contracts: address ? contracts : [],
    query: {
      enabled: Boolean(address && isConnected),
      refetchInterval: 12_000,
    },
  });

  const balances = useMemo(() => {
    const map = {} as Record<SwapToken, bigint | undefined>;
    SWAP_TOKENS.forEach((token, index) => {
      const result = data?.[index];
      map[token] =
        result?.status === "success" ? (result.result as bigint) : undefined;
    });
    return map;
  }, [data]);

  return {
    balances,
    isLoading: isConnected && isLoading,
    refetch,
  };
}
