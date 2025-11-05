import Link from "next/link";
import WalletButton from "./wallet-button";

export default function Header() {
  return (
    <header className="w-full bg-[#141414] border-b border-cyan-600/30 shadow-lg">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-linear-to-br from-cyan-400 to-cyan-600 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-2xl font-bold text-white">W</span>
            </div>
            <h1 className="text-2xl font-bold bg-linear-to-r from-cyan-300 to-cyan-100 bg-clip-text text-transparent">
              Web3 Tools
            </h1>
          </Link>

          <WalletButton />
        </div>
      </div>
    </header>
  );
}
