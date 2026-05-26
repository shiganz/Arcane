import { createViemAdapterFromProvider } from "@circle-fin/adapter-viem-v2";
import type { ViemAdapter } from "@circle-fin/adapter-viem-v2";
import type { EIP1193Provider } from "viem";

export async function createAdapterFromProvider(
  provider: EIP1193Provider,
): Promise<ViemAdapter> {
  return createViemAdapterFromProvider({ provider });
}
