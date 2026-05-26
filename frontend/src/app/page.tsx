import { SwapCard } from "@/components/swap/SwapCard";

export default function Home() {
  return (
    <div className="arcane-bg relative flex min-h-full flex-1 flex-col">
      <main className="relative mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-8 sm:py-12 justify-center items-center">
        <SwapCard />
      </main>

      <a
        href="https://x.com/SawadaTataro88"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed right-4 bottom-4 z-10 flex items-center gap-2 rounded-full border border-[#2a3548] bg-[#141c28]/90 px-4 py-2 text-sm text-[#8b95a8] backdrop-blur-sm transition-colors hover:border-orange-500/40 hover:text-orange-300"
      >
        <span aria-hidden>𝕏</span>
        <span>@SawadaTataro88</span>
      </a>
    </div>
  );
}
