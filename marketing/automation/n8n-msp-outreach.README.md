# MSP Outreach Engine - Setup

**Outbound** flow that works through a list of MSP leads and sends a personalized
4-touch email sequence, advancing each lead automatically. Built live in n8n via
the MCP.

- **Workflow ID:** `y8FFDM1PliUdwfZP` - http://localhost:5678/workflow/y8FFDM1PliUdwfZP
- **Lead table:** `MSP Outreach Leads` (data table id `bvwzdw2rldI26UkA`)

## How it flows

```
Weekdays 9am  →  Get active leads  →  Due & personalized  →  By step
   (schedule)     (status = active)    (next_due <= today,     ├ 0 → Touch 1 - Intro ┐
                                        personalization set)    ├ 1 → Touch 2 - Value ┤
                                                                ├ 2 → Touch 3 - Case  ┼→ Advance lead
                                                                └ 3 → Touch 4 - Breakup┘   (step+1, next_due,
                                                                                            status=completed at end)
```

Cadence per lead: Touch 1 → +3 days → Touch 2 → +4 days → Touch 3 → +5 days →
Touch 4 → marked `completed`. The engine only ever touches rows with
`status = active`.

## The lead table (what you fill in)

Columns: `company`, `contact_name`, `email`, `linkedin`, `personalization`,
`status`, `step`, `next_due`, `notes`. An EXAMPLE row is already there showing
the shape - delete it once you get the idea.

**To start a real lead, each row needs:**
- `email` - the contact's address
- `personalization` - a specific first line (e.g. "Saw your r/msp post on QBR
  prep"). **Required** - the engine skips any row with this blank, on purpose.
  This gate is what keeps it personal, not spam.
- `status` = `active`
- `step` = `0`
- `next_due` = today's date (or a future date to schedule the first touch)

When someone replies, set their `status` to `replied` (or `won`) - that
immediately stops their sequence (the engine only processes `active`).

## Finish setup (inactive until you do)

1. **SMTP credential** - same `Tenant Hawk Marketing SMTP` credential the
   lifecycle workflow uses. The 4 touch nodes reference it by name.
   - Update `fromEmail` on each touch node (currently
     `Dante at Tenant Hawk <dante@tenanthawk.io>`).
2. **Add leads** to the table (see above). Sourcing criteria + the call script
   are in `../outreach/msp-outreach-kit.md`.
3. **Activate** the workflow.

## Guardrails (don't skip these)

- **Warm the domain / authenticate SPF+DKIM+DMARC** before volume. You're
  emailing IT pros - a misconfigured sender on a *security* product is fatal.
- **Volume control:** the engine sends to every *due* lead each morning. Control
  pace by how many leads you set `active` and by staggering `next_due`. Don't
  dump 200 active leads with today's date on day one - stage them.
- **CAN-SPAM:** include a real reply-to and a way to opt out; the breakup email
  is a natural close. Keep it genuinely personal.

## Known limitations / next enhancements

- **Reply detection is manual** (you flip `status` to `replied`). Auto-detection
  needs an IMAP Email Trigger watching your inbox → match sender to a lead row →
  set `status = replied`. Ask Claude to add it once your mailbox is connected.
- **No hard daily cap node** - staggering `next_due` is the control for now. A
  Limit node can be added if you want a strict ceiling.
- Edit this workflow via the n8n MCP (`update_workflow` with the ID above), not
  by hand.
