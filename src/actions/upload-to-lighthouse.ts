"use server";

import lighthouse from "@lighthouse-web3/sdk";
import fs from "fs";
import path from "path";

export const uploadToLighthouse = async (file: File) => {
  // Convert File object to ArrayBuffer for server-side upload
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const uploadResponse = await lighthouse.uploadBuffer(
    buffer,
    process.env.LIGHTHOUSE_API_KEY!
  );

  return uploadResponse.data.Hash;
};

export const uploadMultipleToLighthouse = async (files: File[]) => {
  let tempDir: string | null = null;

  try {
    // Use /tmp directory which is available in serverless environments
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    tempDir = path.join("/tmp", `lighthouse-upload-${timestamp}-${randomStr}`);

    // Create the temporary directory
    fs.mkdirSync(tempDir, { recursive: true });

    // Write all files to the temporary directory
    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const filePath = path.join(tempDir, file.name);

      fs.writeFileSync(filePath, buffer);
    }

    // Upload the entire directory using Lighthouse - this returns ONE hash for all files
    const uploadResponse = await lighthouse.upload(
      tempDir,
      process.env.LIGHTHOUSE_API_KEY!
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
      } catch (cleanupError) {
        console.warn(`Failed to clean up temporary directory: ${cleanupError}`);
      }
    }
  }
};
