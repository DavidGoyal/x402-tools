"use server";

import lighthouse from "@lighthouse-web3/sdk";
import fs from "fs";
import path from "path";
import os from "os";

export const uploadToLighthouse = async (file: File) => {
  // Convert File object to ArrayBuffer for server-side upload
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const uploadResponse = await lighthouse.uploadBuffer(
    buffer,
    process.env.LIGHTHOUSE_API_KEY!
  );

  console.log(uploadResponse);
  return uploadResponse.data.Hash;
};

export const uploadMultipleToLighthouse = async (files: File[]) => {
  let tempDir: string | null = null;

  try {
    // Create a temporary directory
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "lighthouse-upload-"));
    console.log(`Created temporary directory: ${tempDir}`);

    // Write all files to the temporary directory
    const filePaths: string[] = [];
    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const filePath = path.join(tempDir, file.name.split(".")[0] ?? "");

      fs.writeFileSync(filePath, buffer);
      filePaths.push(filePath);
      console.log(`Saved file: ${file.name} to ${filePath}`);
    }

    // Upload the entire directory using Lighthouse
    const uploadResponse = await lighthouse.upload(
      tempDir,
      process.env.LIGHTHOUSE_API_KEY!
    );

    console.log(
      `Directory upload completed. Hash: ${uploadResponse.data.Hash}`
    );
    console.log(
      `Directory contains ${files.length} files:`,
      files.map((f) => f.name)
    );
    console.log(
      `Access files at: https://gateway.lighthouse.storage/ipfs/${uploadResponse.data.Hash}`
    );

    return uploadResponse.data.Hash;
  } catch (error) {
    console.error("Error in multiple upload:", error);
    throw new Error(
      `Failed to upload files: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  } finally {
    // Clean up the temporary directory
    if (tempDir && fs.existsSync(tempDir)) {
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
        console.log(`Cleaned up temporary directory: ${tempDir}`);
      } catch (cleanupError) {
        console.warn(`Failed to clean up temporary directory: ${cleanupError}`);
      }
    }
  }
};
