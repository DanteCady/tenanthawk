# MSP Outreach Kit

MSPs are the revenue-weighted segment: one win = many tenants on the volume tier
+ a case study. This is personalized outreach, **not** a blast. Quality over
volume — 20–30 great touches a week beats 500 sprayed emails.

---

## 1. Ideal MSP profile (who to target first)

- **Size:** 5–50 staff, managing ~20–200 client M365 tenants. Big enough to feel
  the pain of manual tenant reviews, small enough to buy without a committee.
- **Signals they're a fit:**
  - Microsoft Solutions Partner / CSP listings
  - Posts about M365, security, or QBRs on LinkedIn / r/msp
  - Active in MSP communities (r/msp, MSPGeek, Discord servers)
  - Job posts for "M365 engineer," "security analyst," "vCISO"
- **Trigger events (best time to reach out):** they just posted about a client
  breach/audit, license cost-cutting, a security framework (CIS, Essential 8,
  Cyber Essentials), or onboarding pain.

## 2. Where to source the list

| Source | How to use it |
|---|---|
| **Microsoft Partner finder** (appsource / partner directory) | Filter by region + M365 competency |
| **r/msp** | Note active, helpful members (not just lurkers). Warm them via genuine replies first |
| **LinkedIn Sales Nav** (or free search) | Title "Owner/CEO/CTO/Service Delivery Manager" + keyword "MSP" + "Microsoft 365" |
| **MSP directories** (Clutch, UpCity, local "managed IT" listings) | Good for SMB-focused regional MSPs |
| **MSPGeek / MSP Discords / Slack** | Participate first, pitch never — let the tool come up naturally |

> Capture into a sheet/Airtable/Notion with columns: Company, Contact, Title,
> Email, LinkedIn, Trigger/Personalization note, Channel, Status, Last touch.
> This sheet is the input to the n8n outreach automation.

## 3. The MSP offer (what makes them say yes)

- **Free multi-tenant trial:** scan up to N client tenants free so they can see
  value across their book of business.
- **Volume pricing** on the MSP tier (multi-tenant console + roll-ups).
- **The QBR hook:** a branded one-page health score they can put in front of
  clients every quarter — proves ongoing value and surfaces upsells (license
  cleanup, security remediation projects).
- **Founding lock-in:** `EARLYBIRD26` = 25% off, locked for life.
- **The bill-back angle:** the unused-license $ figure often funds the tool many
  times over — frame it as margin, not cost.

## 4. Cold email sequence (4 touches over ~12 days)

Keep it short, specific, one ask. Personalize the **first line** every time —
that's the whole game.

**Email 1 — the hook (Day 0)**
> Subject: a 2-minute health score for your clients' M365 tenants
>
> Hi {{FirstName}},
>
> {{personalized line — e.g. "Saw your r/msp post on QBR prep" / "Noticed
> {{Company}} focuses on M365-heavy SMBs"}}.
>
> Quick one: I built Tenant Hawk, a read-only scanner that gives any M365 tenant
> a health score + prioritized fix list in ~2 minutes — security, identity, cost
> and reliability — and puts a dollar figure on unused licenses. No agents,
> nothing stored but the tenant ID.
>
> For MSPs there's a multi-tenant console so you can roll it across your whole
> book and open every QBR with a score that's gone up.
>
> Want me to set you up to scan a few client tenants free? No pitch — just see
> what it surfaces.
>
> {{YourName}}

**Email 2 — value / proof (Day 3)**
> Subject: re: 2-minute health score
>
> Following up with the part MSPs react to most: the scan flags the boring stuff
> that turns into client-facing incidents — app secrets about to expire,
> Conditional Access stuck in report-only, legacy auth still on, never-signed-in
> licenses you're billing for.
>
> Happy to run one tenant with you on a 15-min call so you can judge it on a real
> environment. Worth a look?

**Email 3 — the QBR/business case (Day 7)**
> Subject: the QBR one-pager
>
> The reason I think this fits {{Company}}: it turns tenant hygiene into a
> recurring, *visible* deliverable. One page per client, score trending up,
> with a license-waste line you can bill against. It tends to pay for itself
> before you've remediated anything.
>
> Want the multi-tenant trial link?

**Email 4 — breakup (Day 12)**
> Subject: should I close the loop?
>
> Haven't heard back, so I'll assume the timing's off — totally fair. If it's
> ever useful, the free scan lives at https://tenanthawk.io and `EARLYBIRD26`
> locks 25% off for life for founding MSPs. Door's open.

## 5. LinkedIn DM sequence (warmer, shorter)

**Connect note:**
> Hi {{FirstName}} — fellow M365 person. Building a read-only tenant health
> scanner aimed at MSPs and would value your take. Mind connecting?

**After accept (wait 1 day):**
> Thanks for connecting! Quick context: Tenant Hawk scores any M365 tenant
> read-only in ~2 min and rolls up across all your clients in one console —
> security, cost, reliability. Want me to set you up to scan a couple of client
> tenants free? Curious what it surfaces in your environments.

**Follow-up (3 days, no reply):**
> No worries if it's not the moment. If you ever want a fast read on a client
> tenant before a QBR, free scan's here: https://tenanthawk.io 🦅

## 6. Discovery call → close (15-min structure)

1. **Their world (4 min):** How many client tenants? How do you do tenant
   reviews / QBRs today? What's the painful part?
2. **Live scan (5 min):** Run their own or a demo tenant. Let the score + the
   license-waste number do the talking. *Silence after the number.*
3. **The MSP fit (3 min):** Multi-tenant console, roll-ups, the QBR one-pager,
   bill-back angle.
4. **The ask (3 min):** "Want to roll it across your book on the founding rate?
   `EARLYBIRD26` locks 25% off for life." Set up the trial on the call.

## 7. Objection handling

| Objection | Response |
|---|---|
| "Security — I'm not connecting a tool to client tenants." | Read-only, admin-consented, **no agents, we store only the tenant ID** — tokens are minted on demand, nothing persisted. You can revoke consent anytime. This is the #1 question; lead with it. |
| "We already have [Lighthouse / native reports]." | Those are dashboards; we give a *prioritized, scored fix list* with dollar impact and remediation steps — built for a QBR conversation, not a console dive. |
| "Too busy to evaluate." | That's the point — it's a 2-minute read-only scan, not a deployment. I'll run the first one with you live. |
| "Price?" | Volume pricing per tenant; the unused-license figure usually covers it several times over. Founding lock is 25% off for life. |

## 8. Tracking targets

- 20–30 personalized touches / week
- ≥15% positive reply rate (if lower, your personalization line is weak)
- Goal: 3–5 discovery calls/week → 1+ MSP trial/week
- Every call ends with one ask: trial signup **or** a referral/quote.
