"use client";

import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  createTransferCheckedInstruction,
  getAssociatedTokenAddress,
  getMint,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  ComputeBudgetProgram,
  PublicKey,
  SystemProgram,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import { AxiosError } from "axios";
import Link from "next/link";
import { useRef, useState } from "react";
import { FaExternalLinkAlt } from "react-icons/fa";
import { toast } from "sonner";

export default function Home() {
  const [selectedFiles, setSelectedFiles] = useState<File[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [ipfsHash, setIpfsHash] = useState<string>("");
  const { connection } = useConnection();
  const { publicKey, signTransaction } = useWallet();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setSelectedFiles(Array.from(files));
    }
  };

  const handleUpload = async () => {
    if (!publicKey) {
      toast.error("Please connect your wallet", {
        description: "Please connect your wallet to upload",
      });
      return;
    }

    if (!selectedFiles || selectedFiles.length === 0) {
      toast.error("Please select a file", {
        description: "Please select a file to upload",
      });
      return;
    }

    setLoading(true);
    try {
      if (selectedFiles.length === 1) {
        const endpointPath = "/api/v1/uploadToIpfs/single";
        // Step 1: Request payment quote (will get 402)
        const formData = new FormData();
        formData.append("file", selectedFiles[0]);

        let res = await fetch(endpointPath, {
          method: "POST",
          body: formData,
        });

        if (res.status !== 402) {
          throw new Error("Expected payment request");
        }

        const rawResponse = await res.json();

        const x402Version: number = rawResponse.x402Version;
        const parsedPaymentRequirements = rawResponse.accepts || [];

        // Select first suitable payment requirement for Solana
        const selectedRequirements = parsedPaymentRequirements.find(
          (req: any) =>
            req.scheme === "exact" &&
            (req.network === "solana-devnet" || req.network === "solana")
        );

        if (!selectedRequirements) {
          console.error(
            "❌ No suitable Solana payment requirements found. Available networks:",
            parsedPaymentRequirements.map((req: any) => req.network)
          );
          throw new Error("No suitable Solana payment requirements found");
        }

        // Extract fee payer from payment requirements
        const feePayer = (
          selectedRequirements as { extra?: { feePayer?: string } }
        )?.extra?.feePayer;
        if (typeof feePayer !== "string" || !feePayer) {
          throw new Error(
            "Missing facilitator feePayer in payment requirements (extra.feePayer)."
          );
        }
        const feePayerPubkey = new PublicKey(feePayer);
        if (!selectedRequirements?.payTo) {
          throw new Error("Missing payTo in payment requirements");
        }
        const destination = new PublicKey(selectedRequirements.payTo);

        const instructions: TransactionInstruction[] = [];

        // The facilitator REQUIRES ComputeBudget instructions in positions 0 and 1
        instructions.push(
          ComputeBudgetProgram.setComputeUnitLimit({
            units: 27_044, // Sufficient for SPL token transfer + ATA creation
          })
        );

        instructions.push(
          ComputeBudgetProgram.setComputeUnitPrice({
            microLamports: 1, // Minimal price
          })
        );

        // SPL token or Token-2022
        if (!selectedRequirements.asset) {
          throw new Error("Missing token mint for SPL transfer");
        }
        const mintPubkey = new PublicKey(selectedRequirements.asset as string);

        // Determine program (token vs token-2022) by reading mint owner
        const mintInfo = await connection.getAccountInfo(
          mintPubkey,
          "confirmed"
        );
        const programId =
          mintInfo?.owner?.toBase58() === TOKEN_2022_PROGRAM_ID.toBase58()
            ? TOKEN_2022_PROGRAM_ID
            : TOKEN_PROGRAM_ID;

        // Fetch mint to get decimals
        const mint = await getMint(
          connection,
          mintPubkey,
          "confirmed",
          programId
        );

        // Derive source and destination ATAs
        const sourceAta = await getAssociatedTokenAddress(
          mintPubkey,
          publicKey,
          false,
          programId,
          ASSOCIATED_TOKEN_PROGRAM_ID
        );
        const destinationAta = await getAssociatedTokenAddress(
          mintPubkey,
          destination,
          false,
          programId,
          ASSOCIATED_TOKEN_PROGRAM_ID
        );

        // Check if source ATA exists (user must already have token account)
        const sourceAtaInfo = await connection.getAccountInfo(
          sourceAta,
          "confirmed"
        );
        if (!sourceAtaInfo) {
          throw new Error(
            `User does not have an Associated Token Account for ${selectedRequirements.asset}. Please create one first or ensure you have the required token.`
          );
        }

        // Create ATA for destination if missing (payer = facilitator)
        const destAtaInfo = await connection.getAccountInfo(
          destinationAta,
          "confirmed"
        );
        if (!destAtaInfo) {
          instructions.push(
            createAssociatedTokenAccountInstruction(
              feePayerPubkey,
              destinationAta,
              destination,
              mintPubkey,
              programId
            )
          );
        }

        // TransferChecked instruction
        const amount = BigInt(selectedRequirements.maxAmountRequired);

        instructions.push(
          createTransferCheckedInstruction(
            sourceAta,
            mintPubkey,
            destinationAta,
            publicKey,
            amount,
            mint.decimals,
            [],
            programId
          )
        );

        // Get recent blockhash
        const { blockhash } = await connection.getLatestBlockhash("confirmed");

        const message = new TransactionMessage({
          payerKey: feePayerPubkey,
          recentBlockhash: blockhash,
          instructions,
        }).compileToV0Message();

        // Create transaction
        const transaction = new VersionedTransaction(message);

        // Sign with user's wallet
        if (typeof signTransaction !== "function") {
          throw new Error("Connected wallet does not support signTransaction");
        }

        const userSignedTx = await signTransaction(transaction);

        const serializedTransaction = Buffer.from(
          userSignedTx.serialize()
        ).toString("base64");

        // Create payment payload matching x402 spec
        const paymentPayload = {
          x402Version: x402Version,
          scheme: selectedRequirements.scheme,
          network: selectedRequirements.network,
          payload: {
            transaction: serializedTransaction,
          },
        };

        // Encode payment payload as base64 for X-PAYMENT header
        const paymentHeader = Buffer.from(
          JSON.stringify(paymentPayload)
        ).toString("base64");

        // Step 7: Retry post with X-Payment header
        const formDataWithPayment = new FormData();
        formDataWithPayment.append("file", selectedFiles[0]);

        res = await fetch(endpointPath, {
          method: "POST",
          headers: {
            "X-PAYMENT": paymentHeader,
            "Access-Control-Expose-Headers": "X-PAYMENT-RESPONSE",
          },
          body: formDataWithPayment,
        });

        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || "Failed to upload file");
        }

        const result = await res.json();
        setIpfsHash(result.ipfsHash);
      } else {
        const endpointPath = "/api/v1/uploadToIpfs/multiple";
        // Step 1: Request payment quote (will get 402)
        const formData = new FormData();
        selectedFiles.forEach((file) => {
          formData.append("files", file);
        });

        let res = await fetch(endpointPath, {
          method: "POST",
          body: formData,
        });

        if (res.status !== 402) {
          throw new Error("Expected payment request");
        }

        const rawResponse = await res.json();

        const x402Version: number = rawResponse.x402Version;
        const parsedPaymentRequirements = rawResponse.accepts || [];

        // Select first suitable payment requirement for Solana
        const selectedRequirements = parsedPaymentRequirements.find(
          (req: any) =>
            req.scheme === "exact" &&
            (req.network === "solana-devnet" || req.network === "solana")
        );

        if (!selectedRequirements) {
          console.error(
            "❌ No suitable Solana payment requirements found. Available networks:",
            parsedPaymentRequirements.map((req: any) => req.network)
          );
          throw new Error("No suitable Solana payment requirements found");
        }

        // Extract fee payer from payment requirements
        const feePayer = (
          selectedRequirements as { extra?: { feePayer?: string } }
        )?.extra?.feePayer;
        if (typeof feePayer !== "string" || !feePayer) {
          throw new Error(
            "Missing facilitator feePayer in payment requirements (extra.feePayer)."
          );
        }
        const feePayerPubkey = new PublicKey(feePayer);
        if (!selectedRequirements?.payTo) {
          throw new Error("Missing payTo in payment requirements");
        }
        const destination = new PublicKey(selectedRequirements.payTo);

        const instructions: TransactionInstruction[] = [];

        // The facilitator REQUIRES ComputeBudget instructions in positions 0 and 1
        instructions.push(
          ComputeBudgetProgram.setComputeUnitLimit({
            units: 40_000, // Sufficient for SPL token transfer + ATA creation
          })
        );

        instructions.push(
          ComputeBudgetProgram.setComputeUnitPrice({
            microLamports: 1, // Minimal price
          })
        );

        // SPL token or Token-2022
        if (!selectedRequirements.asset) {
          throw new Error("Missing token mint for SPL transfer");
        }
        const mintPubkey = new PublicKey(selectedRequirements.asset as string);

        // Determine program (token vs token-2022) by reading mint owner
        const mintInfo = await connection.getAccountInfo(
          mintPubkey,
          "confirmed"
        );
        const programId =
          mintInfo?.owner?.toBase58() === TOKEN_2022_PROGRAM_ID.toBase58()
            ? TOKEN_2022_PROGRAM_ID
            : TOKEN_PROGRAM_ID;

        // Fetch mint to get decimals
        const mint = await getMint(
          connection,
          mintPubkey,
          undefined,
          programId
        );

        // Derive source and destination ATAs
        const sourceAta = await getAssociatedTokenAddress(
          mintPubkey,
          publicKey,
          false,
          programId
        );
        const destinationAta = await getAssociatedTokenAddress(
          mintPubkey,
          destination,
          false,
          programId
        );

        // Check if source ATA exists (user must already have token account)
        const sourceAtaInfo = await connection.getAccountInfo(
          sourceAta,
          "confirmed"
        );
        if (!sourceAtaInfo) {
          throw new Error(
            `User does not have an Associated Token Account for ${selectedRequirements.asset}. Please create one first or ensure you have the required token.`
          );
        }

        // Create ATA for destination if missing (payer = facilitator)
        const destAtaInfo = await connection.getAccountInfo(
          destinationAta,
          "confirmed"
        );
        if (!destAtaInfo) {
          const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey(
            "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
          );

          const createAtaInstruction = new TransactionInstruction({
            keys: [
              { pubkey: feePayerPubkey, isSigner: true, isWritable: true },
              { pubkey: destinationAta, isSigner: false, isWritable: true },
              { pubkey: destination, isSigner: false, isWritable: false },
              { pubkey: mintPubkey, isSigner: false, isWritable: false },
              {
                pubkey: SystemProgram.programId,
                isSigner: false,
                isWritable: false,
              },
              { pubkey: programId, isSigner: false, isWritable: false },
            ],
            programId: ASSOCIATED_TOKEN_PROGRAM_ID,
            data: Buffer.from([0]), // CreateATA discriminator
          });

          instructions.push(createAtaInstruction);
        }

        // TransferChecked instruction
        const amount = BigInt(selectedRequirements.maxAmountRequired);

        instructions.push(
          createTransferCheckedInstruction(
            sourceAta,
            mintPubkey,
            destinationAta,
            publicKey,
            amount,
            mint.decimals,
            [],
            programId
          )
        );

        // Get recent blockhash
        const { blockhash } = await connection.getLatestBlockhash("confirmed");

        const message = new TransactionMessage({
          payerKey: feePayerPubkey,
          recentBlockhash: blockhash,
          instructions,
        }).compileToV0Message();

        // Create transaction
        const transaction = new VersionedTransaction(message);

        // Sign with user's wallet
        if (typeof signTransaction !== "function") {
          throw new Error("Connected wallet does not support signTransaction");
        }

        const userSignedTx = await signTransaction(transaction);

        const serializedTransaction = Buffer.from(
          userSignedTx.serialize()
        ).toString("base64");

        // Create payment payload matching x402 spec
        const paymentPayload = {
          x402Version: x402Version,
          scheme: selectedRequirements.scheme,
          network: selectedRequirements.network,
          payload: {
            transaction: serializedTransaction,
          },
        };

        // Encode payment payload as base64 for X-PAYMENT header
        const paymentHeader = Buffer.from(
          JSON.stringify(paymentPayload)
        ).toString("base64");

        // Step 7: Retry post with X-Payment header
        const formDataWithPayment = new FormData();
        selectedFiles.forEach((file) => {
          formDataWithPayment.append("files", file);
        });

        res = await fetch(endpointPath, {
          method: "POST",
          headers: {
            "X-PAYMENT": paymentHeader,
            "Access-Control-Expose-Headers": "X-PAYMENT-RESPONSE",
          },
          body: formDataWithPayment,
        });

        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || "Failed to upload file");
        }

        const result = await res.json();
        setIpfsHash(result.ipfsHash);
      }

      toast.success("Upload successful");
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof AxiosError
          ? error.status === 429
            ? "You are being rate limited. Please try again later."
            : (error.response?.data as { error: string }).error
          : "Failed to upload"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClear = (index: number) => {
    setSelectedFiles(selectedFiles?.filter((_, i) => i !== index) || null);
    setIpfsHash("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <main className="bg-[#141414] h-full flex flex-col w-full overflow-y-auto">
      <div className="p-4 sm:p-6 border-b border-cyan-600/30">
        <h2 className="text-xl sm:text-2xl font-bold bg-linear-to-r from-cyan-300 to-cyan-100 bg-clip-text text-transparent mb-2">
          IPFS Tool
        </h2>
        <p className="text-cyan-300 text-xs sm:text-sm">
          Upload your files (PDF or images) to IPFS decentralized storage
        </p>
      </div>

      <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
        <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6 w-full">
          {/* File Upload Area */}
          <div className="bg-[#1a1a1a] rounded-xl p-4 sm:p-8 border border-cyan-600/30 shadow-xl">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="*"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />

            <label
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center w-full h-40 sm:h-48 border-2 border-dashed border-cyan-500/50 rounded-lg cursor-pointer hover:border-cyan-400 hover:bg-[#1f1f1f] transition-all duration-200"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4">
                <svg
                  className="w-10 h-10 sm:w-12 sm:h-12 mb-3 sm:mb-4 text-cyan-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <p className="mb-2 text-xs sm:text-sm text-cyan-300 text-center">
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </p>
                <p className="text-xs text-cyan-400 text-center">
                  PDF, PNG, JPG, GIF or WEBP (MAX. 10MB)
                </p>
              </div>
            </label>

            {selectedFiles && selectedFiles.length > 0 && (
              <div className="mt-4 bg-[#1f1f1f] rounded-lg border border-cyan-600/30">
                {selectedFiles.map((file, index) => (
                  <div
                    className="flex items-center justify-between p-3 sm:p-4"
                    style={{
                      borderBottom:
                        index === selectedFiles.length - 1
                          ? "none"
                          : "1px solid #2a2a2a",
                    }}
                    key={index}
                  >
                    <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-cyan-600 rounded-lg flex items-center justify-center shrink-0">
                        <span className="text-lg sm:text-xl">
                          {file.type.includes("pdf") ? "📄" : "🖼️"}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-sm sm:text-base truncate">
                          {file.name}
                        </p>
                        <p className="text-cyan-300 text-xs sm:text-sm">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleClear(index)}
                      className="text-cyan-400 hover:text-red-400 transition-colors cursor-pointer shrink-0 ml-2 text-lg sm:text-xl"
                      aria-label="Remove file"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upload Button */}
          <div className="flex justify-center">
            <button
              onClick={handleUpload}
              disabled={
                !selectedFiles ||
                selectedFiles.length === 0 ||
                loading ||
                !publicKey
              }
              className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-linear-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 disabled:from-cyan-800 disabled:to-cyan-900 cursor-pointer disabled:cursor-not-allowed text-white font-semibold text-sm sm:text-base rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95"
            >
              {loading ? (
                <span className="flex items-center justify-center space-x-2">
                  <svg
                    className="animate-spin h-4 w-4 sm:h-5 sm:w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Uploading...</span>
                </span>
              ) : publicKey ? (
                "Upload to IPFS"
              ) : (
                "Connect Wallet"
              )}
            </button>
          </div>

          {/* Success Message */}
          {!loading && ipfsHash && (
            <div className="bg-[#1a1a1a] rounded-xl p-4 sm:p-6 border border-green-700/50 shadow-xl">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-600 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-lg sm:text-xl">✓</span>
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-green-200">
                  Upload Successful!
                </h3>
              </div>
              <div className="bg-black/30 rounded-lg p-3 sm:p-4">
                <p className="text-cyan-300 text-xs sm:text-sm mb-2">
                  IPFS Link:
                </p>
                <Link
                  href={`https://gateway.lighthouse.storage/ipfs/${ipfsHash}`}
                  className="text-white font-mono text-xs sm:text-sm break-all mb-3"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaExternalLinkAlt className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
