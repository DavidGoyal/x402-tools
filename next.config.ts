import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ["@lighthouse-web3/sdk", "bls-eth-wasm"],
  turbopack: {
    resolveAlias: {
      // Ensure proper resolution of WebAssembly modules
      "bls-eth-wasm": "bls-eth-wasm",
    },
  },
};

export default nextConfig;
