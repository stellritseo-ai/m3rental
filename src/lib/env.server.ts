/**
 * Server-only environment reader.
 * Production (Vercel etc.): values come from process.env.
 * Development: if a value is missing from process.env we read it from the local .env file,
 * so no secret ever has to be hard-coded in source.
 */

let dotenvCache: Record<string, string> | null = null;

async function readDotEnv(): Promise<Record<string, string>> {
  if (dotenvCache) return dotenvCache;
  dotenvCache = {};
  try {
    if (process.env["NODE_ENV"] === "production") return dotenvCache;
    const fs = await import("node:fs/promises");
    const path = await import("node:path");
    const raw = await fs.readFile(path.join(process.cwd(), ".env"), "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed
        .slice(eq + 1)
        .trim()
        .replace(/^["']|["']$/g, "");
      dotenvCache[key] = value;
    }
  } catch {
    // no .env file available — rely on process.env only
  }
  return dotenvCache;
}

export async function getEnv(name: string): Promise<string | undefined> {
  const fromProcess = process.env[name];
  if (typeof fromProcess === "string" && fromProcess.trim()) return fromProcess.trim();
  const dotenv = await readDotEnv();
  const fromFile = dotenv[name];
  return typeof fromFile === "string" && fromFile.trim() ? fromFile.trim() : undefined;
}
