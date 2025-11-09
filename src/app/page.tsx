"use client";

import Link from "next/link";
import {
  HiArrowRight,
  HiCloudArrowUp,
  HiLockClosed,
  HiGlobeAlt,
  HiCurrencyDollar,
  HiBolt,
} from "react-icons/hi2";

export default function Home() {
  return (
    <main className="bg-[#141414] h-full flex flex-col w-full overflow-y-auto">
      <div className="flex-1 p-6 sm:p-12">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12 sm:mb-16">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
              <span className="bg-linear-to-r from-cyan-300 to-cyan-100 bg-clip-text text-transparent">
                x402 Hub
              </span>
            </h1>
            <p className="text-cyan-300 text-lg sm:text-xl max-w-2xl mx-auto mb-2">
              Powered by{" "}
              <span className="text-cyan-400 font-semibold">x402</span> Protocol
            </p>
            <p className="text-cyan-300 text-base sm:text-lg max-w-2xl mx-auto mb-6 sm:mb-8">
              Access premium Web3 tools and services with seamless
              micropayments. Pay only for what you use, powered by blockchain
              payments.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/ipfs"
                className="inline-flex items-center justify-center px-6 py-3 bg-linear-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 text-white font-semibold rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95"
              >
                Explore Tools
                <HiArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mt-12">
            {/* x402 Protocol */}
            <div className="bg-[#1a1a1a] rounded-xl p-6 sm:p-8 border border-cyan-600/30 shadow-xl">
              <div className="w-12 h-12 bg-cyan-600/20 rounded-lg flex items-center justify-center mb-4">
                <HiCurrencyDollar className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                x402 Protocol
              </h3>
              <p className="text-cyan-300 text-sm sm:text-base">
                Micropayment-powered API access. Pay per use with Solana-based
                transactions. No subscriptions, no commitments.
              </p>
            </div>

            {/* IPFS Tool */}
            <Link
              href="/ipfs"
              className="bg-[#1a1a1a] rounded-xl p-6 sm:p-8 border border-cyan-600/30 hover:border-cyan-500/50 shadow-xl transition-all duration-200 hover:transform hover:scale-105 group"
            >
              <div className="w-12 h-12 bg-cyan-600/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-cyan-600/30 transition-colors">
                <HiCloudArrowUp className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                IPFS Storage
              </h3>
              <p className="text-cyan-300 text-sm sm:text-base">
                Upload files to decentralized IPFS storage. Secure, permanent,
                and accessible from anywhere.
              </p>
            </Link>

            {/* Fast & Reliable */}
            <div className="bg-[#1a1a1a] rounded-xl p-6 sm:p-8 border border-cyan-600/30 shadow-xl">
              <div className="w-12 h-12 bg-cyan-600/20 rounded-lg flex items-center justify-center mb-4">
                <HiBolt className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Fast & Reliable
              </h3>
              <p className="text-cyan-300 text-sm sm:text-base">
                Built on Solana blockchain for instant transactions. Access
                tools instantly with wallet-based authentication.
              </p>
            </div>

            {/* Security Feature */}
            <div className="bg-[#1a1a1a] rounded-xl p-6 sm:p-8 border border-cyan-600/30 shadow-xl">
              <div className="w-12 h-12 bg-cyan-600/20 rounded-lg flex items-center justify-center mb-4">
                <HiLockClosed className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Secure & Private
              </h3>
              <p className="text-cyan-300 text-sm sm:text-base">
                Your data stays private. Transactions are secured by blockchain
                technology. No central authority, no data harvesting.
              </p>
            </div>

            {/* Decentralized Feature */}
            <div className="bg-[#1a1a1a] rounded-xl p-6 sm:p-8 border border-cyan-600/30 shadow-xl">
              <div className="w-12 h-12 bg-cyan-600/20 rounded-lg flex items-center justify-center mb-4">
                <HiGlobeAlt className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Decentralized
              </h3>
              <p className="text-cyan-300 text-sm sm:text-base">
                No central servers. Built on distributed networks ensuring
                censorship resistance and true ownership of your data.
              </p>
            </div>

            {/* More Tools Coming */}
            <div className="bg-[#1a1a1a] rounded-xl p-6 sm:p-8 border border-cyan-600/30 shadow-xl opacity-75">
              <div className="w-12 h-12 bg-cyan-600/20 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🚀</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                More Tools Coming
              </h3>
              <p className="text-cyan-300 text-sm sm:text-base">
                We&apos; re constantly expanding our toolkit. More Web3
                utilities powered by x402 protocol coming soon.
              </p>
            </div>
          </div>

          {/* How It Works Section */}
          <div className="mt-16 sm:mt-20">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">
              <span className="bg-linear-to-r from-cyan-300 to-cyan-100 bg-clip-text text-transparent">
                How It Works
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-cyan-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-cyan-400">1</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Connect Wallet
                </h3>
                <p className="text-cyan-300 text-sm">
                  Connect your Solana wallet to authenticate and enable
                  micropayments
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-cyan-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-cyan-400">2</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Use Tools
                </h3>
                <p className="text-cyan-300 text-sm">
                  Access any tool from our platform. Pay automatically via x402
                  protocol
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-cyan-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-cyan-400">3</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Pay Per Use
                </h3>
                <p className="text-cyan-300 text-sm">
                  Only pay for what you use. No subscriptions, no hidden fees.
                  Simple micropayments.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-16 sm:mt-20 text-center bg-[#1a1a1a] rounded-xl p-8 sm:p-12 border border-cyan-600/30">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-white">
              Ready to Get Started?
            </h2>
            <p className="text-cyan-300 mb-2 max-w-xl mx-auto">
              Explore our tools powered by the x402 protocol.
            </p>
            <p className="text-cyan-400 text-sm mb-6 sm:mb-8 max-w-xl mx-auto">
              Pay only for what you use. No subscriptions required.
            </p>
            <Link
              href="/ipfs"
              className="inline-flex items-center justify-center px-8 py-3 bg-linear-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 text-white font-semibold rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95"
            >
              Browse Tools
              <HiArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
