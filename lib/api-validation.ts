const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/;

export async function readJsonBody(req: Request): Promise<Record<string, unknown> | null> {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  return body as Record<string, unknown>;
}

export function cleanString(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const cleaned = value.trim();
  if (!cleaned) return null;
  return cleaned.slice(0, maxLength);
}

export function cleanOptionalString(value: unknown, maxLength: number): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== "string") return undefined;
  const cleaned = value.trim();
  return cleaned ? cleaned.slice(0, maxLength) : null;
}

export function cleanPositiveNumber(
  value: unknown,
  options: { min?: number; max?: number } = {}
): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  const min = options.min ?? 0;
  if (value <= min) return null;
  if (options.max !== undefined && value > options.max) return null;
  return value;
}

export function cleanHexColor(value: unknown, fallback = "#00e5ff"): string {
  if (typeof value !== "string" || !HEX_COLOR_RE.test(value)) return fallback;
  return value;
}

export function parseOptionalDate(value: unknown): Date | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  if (typeof value !== "string" && !(value instanceof Date)) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date;
}
