import crypto from "node:crypto";
import { getEnv } from "./env.server";

export const CLOUDINARY_FLEET_FOLDER = "m3-rental-fleet";
export const CLOUDINARY_PROOF_FOLDER = "m3-rental-payment-proofs";
export const CLOUDINARY_SELL_FOLDER = "m3-rental-sell-listings";
export const CLOUDINARY_BLOG_FOLDER = "m3-rental-blog";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB

export function isDataUrl(value: unknown): value is string {
  return typeof value === "string" && value.startsWith("data:image/");
}

export function isCloudinaryUrl(value: unknown): value is string {
  return typeof value === "string" && value.startsWith("https://res.cloudinary.com/");
}

async function getCredentials() {
  const cloudName = await getEnv("CLOUDINARY_CLOUD_NAME");
  const apiKey = await getEnv("CLOUDINARY_API_KEY");
  const apiSecret = await getEnv("CLOUDINARY_API_SECRET");
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET."
    );
  }
  return { cloudName, apiKey, apiSecret };
}

function sign(params: Record<string, string>, apiSecret: string) {
  const payload = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  return crypto.createHash("sha1").update(payload + apiSecret).digest("hex");
}

/** Uploads a base64 data URL to Cloudinary and returns the permanent https URL. */
export async function uploadToCloudinary(
  dataUrl: string,
  folder: string = CLOUDINARY_FLEET_FOLDER
): Promise<{ url: string; publicId: string }> {
  if (!isDataUrl(dataUrl)) throw new Error("Only image data URLs can be uploaded.");
  const approxBytes = Math.floor((dataUrl.length * 3) / 4);
  if (approxBytes > MAX_UPLOAD_BYTES) throw new Error("Image is larger than 10 MB.");

  const { cloudName, apiKey, apiSecret } = await getCredentials();
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = sign({ folder, timestamp }, apiSecret);

  const form = new FormData();
  form.append("file", dataUrl);
  form.append("api_key", apiKey);
  form.append("timestamp", timestamp);
  form.append("folder", folder);
  form.append("signature", signature);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) {
    throw new Error(`Cloudinary upload failed (${res.status}): ${await res.text()}`);
  }
  const json = (await res.json()) as { secure_url: string; public_id: string };
  return { url: json.secure_url, publicId: json.public_id };
}

/** Extracts "folder/name" public id from a Cloudinary delivery URL. */
export function publicIdFromUrl(url: string): string | null {
  if (!isCloudinaryUrl(url)) return null;
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-zA-Z0-9]+)?$/);
  return match?.[1] ?? null;
}

/** Best-effort removal of an asset (never throws). */
export async function deleteFromCloudinary(url: string): Promise<boolean> {
  try {
    const publicId = publicIdFromUrl(url);
    if (!publicId) return false;
    const { cloudName, apiKey, apiSecret } = await getCredentials();
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signature = sign({ public_id: publicId, timestamp }, apiSecret);
    const form = new FormData();
    form.append("public_id", publicId);
    form.append("api_key", apiKey);
    form.append("timestamp", timestamp);
    form.append("signature", signature);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
      method: "POST",
      body: form,
    });
    return res.ok;
  } catch (err) {
    console.warn("[CLOUDINARY] Could not delete old asset:", err);
    return false;
  }
}
