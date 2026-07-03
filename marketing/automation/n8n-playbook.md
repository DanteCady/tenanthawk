# n8n Automation Playbook

How to run the whole marketing kit hands-off. The app already has its own SMTP
sender (`src/lib/email/send.ts`, Purelymail), cron endpoints
(`/api/cron/digest`, `/api/cron/scan`), Stripe webhooks, and a waitlist endpoint
(`/api/waitlist`). n8n's job is the **marketing layer on top**: lifecycle
sequences, content scheduling, outreach, and lead enrichment - not to replace the
product's transactional email.

> Decision: keep **transactional/security emails** (auth, scan-complete alerts,
> monitoring digests) in the app. Put **marketing/lifecycle/outreach** in n8n so
> you can iterate on copy without deploying. Both can send from the same domain -
> just use a distinct subdomain/stream for marketing to protect deliverability.

---

## Prereqs / credentials to add in n8n

- **SMTP** (or Resend/Postmark) for marketing sends - ideally a `marketing.`
  subdomain or separate stream from the app's `alerts@` sender.
- **Airtable / Google Sheets / Notion** - the outreach + content datastore.
- **LinkedIn scheduling** - Buffer/Publer/Make-style node, or the LinkedIn API,
  or just generate drafts to a Sheet you post manually (safest for ToS).
- **Stripe** node - to know who converted (so sequences stop).
- **A shared secret** for the app→n8n webhook (header auth).

---

## Workflow 1 - Post-scan lifecycle (the revenue one)

**Goal:** run `lifecycle/post-scan-emails.md` Sequence A/B/C automatically.

**Trigger options (pick one):**
- *Preferred:* add a one-line webhook POST in the app when a scan completes →
  n8n Webhook node. Payload: `{ email, firstName, tenantName, score,
  topFinding, licenseWasteMonthly, expiringSoonCount, severityHighCount, plan,
  isLikelyMsp }`.
- *No-code-change fallback:* n8n **Postgres** node polls the scans table every
  15 min for new completed scans (same DB the app uses).

**Flow:**
1. Trigger → dedupe (one entry per user per sequence; store state in Airtable/DB).
2. **Branch:** `isLikelyMsp || multipleTenants` → Sequence B; else Sequence A.
3. **Wait** nodes for the day offsets (0/1/3/7/14).
4. Before each send, **check Stripe** - if the user is now Pro/MSP, exit the
   sequence (don't email a paying customer an upgrade nag).
5. Send via SMTP node, injecting only the tokens present in the payload.
6. Log sends + opens/clicks back to the datastore.

**Sequence C (dormant):** a daily Cron node queries "scanned >30d ago, no
upgrade, no login 30d" → sends C1/C2.

---

## Workflow 2 - Content scheduler (LinkedIn 3x/week)

**Goal:** never miss the cadence from `content/linkedin-series.md`.

1. **Airtable/Sheet** "Content calendar": columns = Post body, Type, Status
   (Draft/Approved/Scheduled/Posted), Date.
2. Seed it with the post bank (one-time import).
3. **Cron** Tue/Wed/Thu 8am → pull next `Approved` row → push to Buffer/Publer
   (or post via LinkedIn API). Mark `Posted`.
4. **Refill alert:** weekly Cron → if `<5` Approved rows remain, send yourself a
   Slack/email nudge to write more (or pipe the "recurring format ideas" into an
   LLM node to draft, then you approve).
5. *(Optional)* **Benchmark generator:** monthly Cron → query aggregate scan
   stats (median license waste, most common finding) → format into a "monthly
   benchmark" post draft → drop in the calendar as Draft for your review.

---

## Workflow 3 - MSP outreach engine

**Goal:** run `outreach/msp-outreach-kit.md` email sequence at controlled volume.

1. **Datastore:** Airtable "MSP targets" (Company, Contact, Email, LinkedIn,
   Personalization note, Channel, Status, Last touch, Sequence step).
2. **Daily Cron**, capped at ~20–30 sends/day to protect domain reputation:
   - Pull rows where `Status=Active` and `next-touch-due ≤ today`.
   - Require a non-empty **Personalization note** (skip + flag rows without one -
     never send a generic first line).
   - Send the correct step (Email 1–4) via SMTP.
   - Advance `Sequence step` + set next-touch date (Day 0/3/7/12).
3. **Reply detection:** IMAP node watches the inbox → on reply, set
   `Status=Replied` and **halt the sequence** (Slack/email you to take over).
4. **Stripe check:** if a target's email later appears as a customer, mark `Won`.

> Keep the **personalization-note gate** strict. Automation should send *your*
> personalized lines on a schedule - not spray a template. That gate is what
> keeps reply rates up and your domain off blocklists.

---

## Workflow 4 - Lead enrichment + routing

1. **Trigger:** new waitlist signup (`/api/waitlist`) or new free-scan user.
2. **Enrich:** domain → company size/industry (Clearbit-style node or simple
   MX/domain heuristics) to set `isLikelyMsp`.
3. **Route:** MSP-likely → add to Workflow 3 datastore as a *warm* lead (they
   already scanned - different, softer copy) and notify you for a personal touch.
   Else → ensure they're in Workflow 1 Sequence A.

---

## Workflow 5 - Referral loop from shared reports

The app has shareable report links (`/shared/[token]`). When one is opened:
1. App fires a webhook to n8n (small change) OR n8n polls share-view events.
2. n8n emails the **sharer**: "Glad that was worth sharing - want the people you
   sent it to to run their own free scan?" (see lifecycle one-offs).
3. Track shares as a growth metric - this is your cheapest acquisition channel.

---

## Weekly reporting workflow (so you actually steer)

**Cron, Monday 8am** → query + email yourself a one-line dashboard:
- Scans completed this week (the north-star) vs last week
- New Pro / MSP conversions
- Outreach: touches sent, reply rate, calls booked
- Top traffic source to tenanthawk.io (from your analytics)
- Content posted vs planned

Keep it to five numbers. If "scans completed" is flat, the problem is reach -
push more community/SEO/outreach. If scans are up but conversions are flat, the
problem is the lifecycle copy - A/B test Sequence A subject lines.

---

## Build order (don't boil the ocean)

1. **Workflow 1** (post-scan lifecycle) - converts traffic you already get.
2. **Workflow 3** (MSP outreach) - drives revenue-weighted pipeline.
3. **Workflow 2** (content scheduler) - keeps top-of-funnel alive on autopilot.
4. **Workflows 4 & 5** - optimize once 1–3 are running.
5. **Weekly report** - turn on early; it's how you know what to fix.
