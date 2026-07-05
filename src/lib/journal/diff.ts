import { createHash } from "crypto";
import type { ConfigFieldDiff } from "@/db/types";

/** Keys that change on every read or carry no admin-facing meaning. */
const IGNORED_KEYS = new Set(["@odata.context", "@odata.etag", "modifiedDateTime"]);

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** Deterministic JSON serialization (sorted keys) for hashing. */
export function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }
  if (isPlainObject(value)) {
    const keys = Object.keys(value)
      .filter((k) => !IGNORED_KEYS.has(k))
      .sort();
    return `{${keys
      .map((k) => `${JSON.stringify(k)}:${stableStringify(value[k])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value) ?? "null";
}

export function contentHash(payload: unknown): string {
  return createHash("sha256").update(stableStringify(payload)).digest("hex");
}

function deepEqual(a: unknown, b: unknown): boolean {
  return stableStringify(a) === stableStringify(b);
}

/**
 * Field-level diff of two config objects.
 *
 * Objects are walked recursively (dot paths); arrays are treated as atomic
 * leaves - a changed array yields one entry with the full before/after, which
 * reads far better for things like ipRanges or includedGroups than index noise.
 */
export function diffObjects(
  before: Record<string, unknown>,
  after: Record<string, unknown>,
  basePath = "",
): ConfigFieldDiff[] {
  const out: ConfigFieldDiff[] = [];
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);

  for (const key of [...keys].sort()) {
    if (IGNORED_KEYS.has(key)) continue;
    const path = basePath ? `${basePath}.${key}` : key;
    const b = before[key];
    const a = after[key];

    if (deepEqual(b, a)) continue;

    if (isPlainObject(b) && isPlainObject(a)) {
      out.push(...diffObjects(b, a, path));
    } else {
      out.push({ path, before: b ?? null, after: a ?? null });
    }
  }

  return out;
}
