const GRAPH = "https://graph.microsoft.com/v1.0";

export interface GraphReportFetchOptions {
  /** When true, append `$format=application/json` if not already present. */
  preferJson?: boolean;
}

/**
 * Fetch a Microsoft Graph usage report (302 → CSV, or inline JSON when requested).
 * Used for Teams activity, SharePoint usage, Copilot usage, etc.
 */
export async function fetchGraphReport<T extends Record<string, unknown>>(
  token: string,
  path: string,
  options?: GraphReportFetchOptions,
): Promise<T[]> {
  let url = path.startsWith("http") ? path : `${GRAPH}${path}`;
  if (options?.preferJson && !url.includes("$format=")) {
    url += url.includes("?") ? "&" : "?";
    url += "$format=application/json";
  }

  const first = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      ConsistencyLevel: "eventual",
    },
    redirect: "manual",
  });

  if (first.status === 302 || first.status === 303) {
    const location = first.headers.get("location");
    if (!location) throw new Error(`Graph report redirect missing Location for ${path}`);
    const csvRes = await fetch(location);
    if (!csvRes.ok) throw new Error(`Graph report download failed (${csvRes.status})`);
    const text = await csvRes.text();
    return parseReportCsv<T>(text);
  }

  if (!first.ok) {
    throw new Error(`Graph report ${first.status} for ${path}`);
  }

  const data = (await first.json()) as { value?: T[] };
  if (Array.isArray(data.value)) return data.value;
  return [];
}

/** Parse Graph report CSV (handles UTF-8 BOM). */
export function parseReportCsv<T extends Record<string, unknown>>(text: string): T[] {
  const cleaned = text.replace(/^\uFEFF/, "").trim();
  if (!cleaned) return [];

  const lines = cleaned.split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]);
  const rows: T[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]?.trim();
    if (!line) continue;
    const values = parseCsvLine(line);
    const row: Record<string, unknown> = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j] ?? `col${j}`] = values[j] ?? "";
    }
    rows.push(row as T);
  }

  return rows;
}

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === "," && !inQuotes) {
      out.push(current);
      current = "";
      continue;
    }
    current += ch;
  }
  out.push(current);
  return out;
}
