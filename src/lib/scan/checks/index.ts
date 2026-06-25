import type { Check } from "../types";
import { expiringSecrets } from "./reliability";
import { unusedLicenses } from "./cost";
import { conditionalAccess, guestSprawl } from "./security";
import { emptyGroups } from "./hygiene";

export const checks: Check[] = [
  expiringSecrets,
  unusedLicenses,
  conditionalAccess,
  guestSprawl,
  emptyGroups,
];
