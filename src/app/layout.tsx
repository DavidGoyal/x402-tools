import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import LayoutClient from "@/components/layout-client";
import NextTopLoader from "nextjs-toploader";
import Providers from "@/providers/wallet-provider";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "x402 Hub",
  description: "Web3 tools and services powered by x402 protocol. Pay per use with seamless micropayments.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <div className="min-h-screen w-screen flex flex-col overflow-hidden">
            <NextTopLoader
              color="rgba(6, 182, 212, 0.5)"
              showSpinner={false}
              zIndex={10001}
              height={3}
            />
            <LayoutClient>{children}</LayoutClient>
          </div>
          <Toaster position="bottom-right" />
        </Providers>
      </body>
    </html>
  );
}
