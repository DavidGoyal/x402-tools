"use server";

import lighthouse from "@lighthouse-web3/sdk";
import axios from "axios";
import FormData from "form-data";

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
  try {
    const formData = new FormData();

    // Convert each File to Buffer and append to FormData
    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Append buffer with filename and content type
      formData.append("file", buffer, {
        filename: file.name,
        contentType: file.type || "application/octet-stream",
      });
    }

    // Upload using the direct Lighthouse API endpoint with wrapWithDirectory parameter
    const response = await axios.post(
      "https://upload.lighthouse.storage/api/v0/add?wrap-with-directory=true",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${process.env.LIGHTHOUSE_API_KEY}`,
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );

    return response.data.Hash;
  } catch (error) {
    console.error("Error in multiple upload:", error);
    throw new Error(
      `Failed to upload files: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};
