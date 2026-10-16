import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { CLOUDINARY_FLEET_FOLDER, uploadToCloudinary } from "../cloudinary.server";

/**
 * Uploads an image to Cloudinary for M3 Rental Fleet & Equipment.
 * Signed server-side upload — credentials come from CLOUDINARY_* environment variables only.
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
      // Ensure base64 format has proper prefix
      const base64Data = data.base64.startsWith("data:")
        ? data.base64
        : `data:image/jpeg;base64,${data.base64}`;

      const { url, publicId } = await uploadToCloudinary(
        base64Data,
        data.folder || CLOUDINARY_FLEET_FOLDER
      );

      return {
        success: true,
        url,
        publicId,
      };
    } catch (e: any) {
      console.error("[CLOUDINARY] Failed to upload image:", e);
      return {
        success: false,
        error: e.message || "Failed to process image upload.",
      };
    }
  });
