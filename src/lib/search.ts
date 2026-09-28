/** Drops undefined/empty values so search params satisfy exactOptionalPropertyTypes. */
export function cleanSearch<T extends Record<string, string | undefined>>(
  input: T,
): { [K in keyof T]?: string } {
  const output: Record<string, string> = {};
  for (const [key, value] of Object.entries(input)) {
    if (typeof value === "string" && value !== "") output[key] = value;
  }
  return output as { [K in keyof T]?: string };
}

export function readString(
  search: Record<string, unknown>,
  key: string,
): string | undefined {
  const value = search[key];
  return typeof value === "string" && value ? value : undefined;
}
