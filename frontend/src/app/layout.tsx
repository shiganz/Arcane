import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Web3Provider } from "@/components/providers/Web3Provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const siteDescription =
  "Swap USDC, EURC, and cirBTC on Arc Testnet. Arcane is a dark, minimal stablecoin DEX powered by Circle App Kit.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Arcane",
    template: "%s | Arcane",
  },
  description: siteDescription,
  applicationName: "Arcane",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Arcane",
    title: "Arcane",
    description: siteDescription,
    images: [
      {
        url: "/logo.png",
        alt: "Arcane logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Arcane",
    description: siteDescription,
    images: ["/logo.png"],
    creator: "@SawadaTataro88",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
      style={{ colorScheme: "dark" }}
    >
      <body className="flex min-h-full flex-col bg-[#030308] text-[#e8e4f5]">
        <Web3Provider>{children}</Web3Provider>
      </body>
    </html>
  );
}
