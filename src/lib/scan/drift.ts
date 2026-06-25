export interface DriftFindingKey {
  check_id: string;
  entity_ref: string | null;
  title: string;
  severity: string;
}

function key(f: DriftFindingKey): string {
  return `${f.check_id}::${f.entity_ref ?? ""}`;
}

export interface ScanDrift {
  newCount: number;
  resolvedCount: number;
  changedCount: number;
  newTitles: string[];
  resolvedTitles: string[];
  newHighCount: number;
  newHighTitles: string[];
}

/** Compare findings between two scans (previous → current). */
export function diffScans(
  previous: DriftFindingKey[],
  current: DriftFindingKey[],
): ScanDrift {
  const prevMap = new Map(previous.map((f) => [key(f), f]));
  const currMap = new Map(current.map((f) => [key(f), f]));

  const newTitles: string[] = [];
  const newHighTitles: string[] = [];
  const resolvedTitles: string[] = [];
  let changedCount = 0;

  for (const [k, f] of currMap) {
    const prev = prevMap.get(k);
    if (!prev) {
      newTitles.push(f.title);
      if (f.severity === "high") newHighTitles.push(f.title);
    } else if (prev.severity !== f.severity) {
      changedCount++;
    }
  }

  for (const [k, f] of prevMap) {
    if (!currMap.has(k)) resolvedTitles.push(f.title);
  }

  return {
    newCount: newTitles.length,
    resolvedCount: resolvedTitles.length,
    changedCount,
    newTitles: newTitles.slice(0, 5),
    resolvedTitles: resolvedTitles.slice(0, 5),
    newHighCount: newHighTitles.length,
    newHighTitles: newHighTitles.slice(0, 5),
  };
}
