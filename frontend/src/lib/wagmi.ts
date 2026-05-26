import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { arcTestnet } from "@/lib/chains";

const walletConnectProjectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "";

export const wagmiConfig = getDefaultConfig({
  appName: "Arcane",
  projectId: walletConnectProjectId || "00000000000000000000000000000000",
  chains: [arcTestnet],
  ssr: true,
});

export function isWalletConnectConfigured(): boolean {
  return (
    walletConnectProjectId.length > 0 &&
    walletConnectProjectId !== "YOUR_WALLETCONNECT_PROJECT_ID"
  );
}
