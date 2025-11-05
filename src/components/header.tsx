"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HiBars3 } from "react-icons/hi2";
import WalletButton from "./wallet-button";

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const showHamburger = onMenuClick && !isHomePage;

  return (
    <header className="w-full bg-[#141414] border-b border-cyan-600/30 shadow-lg">
      <div className=" w-full px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Hamburger menu and Logo */}
          <div className="flex items-center space-x-3">
            {showHamburger && (
              <button
                onClick={onMenuClick}
                className="lg:hidden text-cyan-400 hover:text-white transition-colors"
                aria-label="Open menu"
              >
                <HiBars3 className="w-6 h-6" />
              </button>
            )}
            <Link href="/" className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-linear-to-br from-cyan-400 to-cyan-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-xl sm:text-2xl font-bold text-white">
                  W
                </span>
              </div>
              <h1 className="text-lg sm:text-2xl font-bold bg-linear-to-r from-cyan-300 to-cyan-100 bg-clip-text text-transparent">
                x402 Hub
              </h1>
            </Link>
          </div>

          {/* Right side - Wallet button */}
          <div className="flex items-center">
            <WalletButton />
          </div>
        </div>
      </div>
    </header>
  );
}
