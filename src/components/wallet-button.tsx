"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import React from "react";
import { HiWallet } from "react-icons/hi2";

function WalletButton() {
  return (
    <div className="relative inline-block wallet-button-container">
      {/* Wallet button with responsive styling */}
      <WalletMultiButton className="wallet-multi-button" />
      {/* Mobile icon overlay - only visible on screens smaller than sm */}
      <div className="wallet-icon-mobile">
        <HiWallet className="w-5 h-5 text-white" />
      </div>
    </div>
  );
}

export default WalletButton;
