"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import React, { useEffect, useState } from "react";
import { HiWallet } from "react-icons/hi2";

function WalletButton() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (loading) {
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  }, [loading]);

  return loading ? (
    <div className="relative inline-block wallet-button-container">
      <div className="w-5 h-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
    </div>
  ) : (
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
