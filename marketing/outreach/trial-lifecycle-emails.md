# Trial lifecycle emails (n8n)

Three emails over the 14-day trial. Plain text, from Dante personally, one
thought per email, no HTML templates — these should read like a founder typed
them, because he did.

## Wiring (what n8n listens to)

The app fires `MARKETING_WEBHOOK_URL` (already configured) with:

| Event | When | Key payload fields |
|---|---|---|
| `user.signedup` | account created | `user.email`, `user.name`, `accountType`, `trialDaysLeft` |
| `scan.completed` | every scan | `plan` (`trial`/`free`/`pro`/`enterprise`), `trialDaysLeft`, `scan.score`, `scan.licenseWasteMonthly`, `scan.severityHighCount`, `scan.topFinding`, `isLikelyMsp` |

**Flow sketch:** `user.signedup` → store contact in n8n datastore/sheet with
`signup_date` → send Email 1 immediately → schedule node checks daily:
- Day 3: if no `scan.completed` received for this email → Email 2a (stuck);
  if scanned → Email 2b (results nudge, merge in their numbers).
- Day 12: if `plan` still `trial`/`free` → Email 3 (trial ending, their $ figure).
- Any `plan: "pro"|"enterprise"` event → remove from sequence.

---

## Email 1 — Day 0, right after signup

**Subject:** your Tenant Hawk scan

> Hi {{name — first name only, or "there"}},
>
> Dante here — I built Tenant Hawk. You've got the full product for 14 days:
> every check, the dollar figures on license waste, daily scans, all of it.
>
> The whole thing takes about 2 minutes: connect read-only, scan runs
> automatically. If anything about the consent screen gives you pause, the
> full permission list is at tenanthawk.io/security — every scope is
> read-only and you can verify that on the Microsoft consent screen itself.
>
> One ask: when your first scan finishes, hit reply and tell me the most
> surprising thing it found. I read every reply.
>
> Dante

## Email 2a — Day 3, signed up but never scanned

**Subject:** stuck on the connect step?

> Hi {{name}},
>
> Noticed you created a Tenant Hawk account but haven't connected a tenant.
> Usually that means one of two things:
>
> The consent screen looked scary — fair. It's read-only, here's exactly what
> each permission does: tenanthawk.io/security. Or you wanted to try it
> without touching a real tenant first — there's a demo tenant for that,
> one click from the dashboard.
>
> If it's something else, reply and tell me what blocked you. Genuinely
> useful to know, even if you never use the product.
>
> Dante

## Email 2b — Day 3, scanned (merge their numbers in)

**Subject:** your tenant scored {{scan.score}}

> Hi {{name}},
>
> Your scan came back: score {{scan.score}}, {{scan.severityHighCount}} high
> severity finding(s), and about ${{scan.licenseWasteMonthly}}/month in
> reclaimable license spend.
>
> {{if severityHighCount > 0}}The one I'd look at first: {{scan.topFinding}}.{{endif}}
>
> Quick sanity note on the license number: don't reclaim on inactivity alone —
> check leave status and get manager sign-off first. The finding details in
> the dashboard flag which ones are safest to act on.
>
> Anything in there surprise you? Reply — I read everything.
>
> Dante

## Email 3 — Day 12, trial ending, hasn't upgraded

**Subject:** {{if licenseWasteMonthly > 0}}the ${{scan.licenseWasteMonthly}}/mo doesn't expire, but your access does{{else}}your trial ends in 2 days{{endif}}

> Hi {{name}},
>
> Your full access ends in 2 days. After that you keep a weekly reliability
> scan (expiring secrets and certs) free forever, but the cost findings,
> daily scans, and alerts stop.
>
> {{if licenseWasteMonthly > 49}}Blunt math: your last scan found
> ${{scan.licenseWasteMonthly}}/mo in license waste. Pro is $49/mo. Even if
> you only reclaim half of it, you're ahead.{{endif}}
>
> Founding rate is 25% off for life with EARLYBIRD26 — first 20 customers.
>
> {{if isLikelyMsp}}You've connected more than one tenant, so Enterprise
> (flat $299/mo, up to 10 clients, one console) is probably the right shape —
> reply and I'll walk you through it on a real tenant.{{endif}}
>
> Either way, thanks for trying it. If it wasn't right, one line on why
> helps me more than a conversion would.
>
> Dante

---

## Rules

- **Never send 2a and 2b both.** Scan status decides.
- **Stop the sequence instantly on upgrade** — a paying customer getting a
  trial email is worse than no email.
- Replies go to Dante's real inbox, and get answered same-day. At this stage
  every reply is a discovery interview (see msp-outreach-kit.md §6).
- No em dashes in subjects, no "just checking in", no fake scarcity beyond
  the real EARLYBIRD26 cap.
