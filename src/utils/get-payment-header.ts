import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  createTransferCheckedInstruction,
  getAssociatedTokenAddress,
  getMint,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  ComputeBudgetProgram,
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";

export const getPaymentHeader = async ({
  url,
  init,
  connection,
  publicKey,
  signTransaction,
}: {
  url: string;
  init: RequestInit;
  connection: Connection;
  publicKey: PublicKey;
  signTransaction:
    | (<T extends VersionedTransaction | Transaction>(
        transaction: T
      ) => Promise<T>)
    | undefined;
}) => {
  const res = await fetch(url, init);

  if (res.status !== 402) {
    throw new Error("Expected payment request");
  }

  const rawResponse = await res.json();

  const x402Version: number = rawResponse.x402Version;
  const parsedPaymentRequirements = rawResponse.accepts || [];

  // Select first suitable payment requirement for Solana
  const selectedRequirements = parsedPaymentRequirements.find(
    (req: { scheme: string; network: string }) =>
      req.scheme === "exact" &&
      (req.network === "solana-devnet" || req.network === "solana")
  );

  if (!selectedRequirements) {
    console.error(
      "❌ No suitable Solana payment requirements found. Available networks:",
      parsedPaymentRequirements.map((req: { network: string }) => req.network)
    );
    throw new Error("No suitable Solana payment requirements found");
  }

  // Extract fee payer from payment requirements
  const feePayer = (selectedRequirements as { extra?: { feePayer?: string } })
    ?.extra?.feePayer;
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
  const mintInfo = await connection.getAccountInfo(mintPubkey, "confirmed");
  const programId =
    mintInfo?.owner?.toBase58() === TOKEN_2022_PROGRAM_ID.toBase58()
      ? TOKEN_2022_PROGRAM_ID
      : TOKEN_PROGRAM_ID;

  // Fetch mint to get decimals
  const mint = await getMint(connection, mintPubkey, "confirmed", programId);

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
  const sourceAtaInfo = await connection.getAccountInfo(sourceAta, "confirmed");
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

  const serializedTransaction = Buffer.from(userSignedTx.serialize()).toString(
    "base64"
  );

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
  const paymentHeader = Buffer.from(JSON.stringify(paymentPayload)).toString(
    "base64"
  );

  return paymentHeader;
};
