import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import crypto from "node:crypto";

/**
 * Uploads an image to Cloudinary for M3 Rental Fleet & Equipment
 * Supports secure signed upload using CLOUDINARY_API_KEY & CLOUDINARY_API_SECRET
 */
export const uploadImage = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      filename: z.string(),
      base64: z.string(),
      folder: z.string().optional(),
    })
  )
  .handler(async ({ data }) => {
    try {
      const cloudName = process.env["CLOUDINARY_CLOUD_NAME"] || "j44njcfx";
      const apiKey = process.env["CLOUDINARY_API_KEY"] || "691866567862756";
      const apiSecret = process.env["CLOUDINARY_API_SECRET"] || "DFUes_WecteWDpoMoAV5BYbKUjQ";

      if (!cloudName || !apiKey || !apiSecret) {
        throw new Error("Missing Cloudinary configuration credentials in environment.");
      }

      // Ensure base64 format has proper prefix
      const base64Data = data.base64.startsWith("data:")
        ? data.base64
        : `data:image/jpeg;base64,${data.base64}`;

      const timestamp = Math.floor(Date.now() / 1000);
      const folder = data.folder || "m3-rental-fleet";

      // Generate Cloudinary SHA-1 signature for secure signed upload
      const signaturePayload = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
      const signature = crypto.createHash("sha1").update(signaturePayload).digest("hex");

      const formData = new FormData();
      formData.append("file", base64Data);
      formData.append("api_key", apiKey);
      formData.append("timestamp", timestamp.toString());
      formData.append("signature", signature);
      formData.append("folder", folder);

      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errBody = await response.text();
        throw new Error(`Cloudinary upload error (${response.status}): ${errBody}`);
      }

      const result = (await response.json()) as { secure_url: string; public_id: string };

      return {
        success: true,
        url: result.secure_url,
        publicId: result.public_id,
      };
    } catch (e: any) {
      console.error("[CLOUDINARY] Failed to upload image:", e);
      return {
        success: false,
        error: e.message || "Failed to process image upload.",
      };
    }
  });
