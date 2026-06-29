# Social Content Engine — Setup

**Outbound** flow that drips your content calendar to social on a schedule via a
third-party scheduler (Buffer/Publer/etc.). Built live in n8n via the MCP.

- **Workflow ID:** `XHAKJ5FzyXOXX0AC` — http://localhost:5678/workflow/XHAKJ5FzyXOXX0AC
- **Calendar table:** `Content Calendar` (data table id `1BhmdfRQftmaUxQe`)

## How it flows

```
Tue/Wed/Thu 8am  →  Get next approved post  →  Publish to scheduler  →  Mark posted
   (schedule)        (status=approved,           (HTTP POST to your        (status=posted,
                      oldest scheduled_for,        Buffer/Publer API)        posted_at=now)
                      limit 1)
```

One post per scheduled run (Tue/Wed/Thu mornings). It always takes the oldest
`approved` post, so it drains your queue in order. If nothing is `approved`, the
run does nothing and waits for the next.

## The calendar table

Columns: `post_body`, `post_type`, `channel`, `status`, `scheduled_for`,
`posted_at`, `notes`. **Already seeded with 8 posts** from your LinkedIn bank,
all as `status = draft`.

- **`draft`** — ignored by the engine. Your staging area.
- **`approved`** — eligible to post. Flip a row to `approved` when you're happy
  with it; the engine will pick the oldest `scheduled_for` first.
- **`posted`** — done (set automatically, with `posted_at`).

`scheduled_for` is used only for ordering (oldest first). To control which goes
out next, set its date earlier.

## Finish setup (inactive until you do)

1. **Pick a scheduler** (Buffer, Publer, Hypefury, etc.) and get its API
   create-post endpoint + token.
2. **Configure the `Publish to scheduler` node:**
   - Set the **URL** (placeholder is shown; e.g. Buffer's
     `https://api.bufferapp.com/1/updates/create.json`).
   - Create the **`Scheduler API`** credential (header auth) with your token.
   - Adjust the body fields to match your scheduler's API. Right now it sends
     `text` and `channel`; Buffer wants `text` + `profile_ids[]`, Publer differs.
     Map `post_body` → the scheduler's text field, `channel` → the profile/channel.
3. **Review the drafts**, flip the ones you want to `approved`.
4. **Activate** the workflow.

> Tip: test with one approved post and the workflow run-once button before
> activating, so you can confirm the API payload is shaped right.

## Important: channels & guardrails

- **Reddit stays manual.** Do not wire Reddit auto-posting — it will get you
  banned, and r/msp is your best MSP channel. Post there by hand using
  `../content/launch-posts.md`.
- **LinkedIn** auto-posting via a scheduler works for a Company Page; personal
  profile posting through APIs is restricted, which is exactly why we route
  through a scheduler instead of the LinkedIn API directly.
- **Always reply to comments** within the first hour — automation handles the
  post, not the engagement. The engagement is what actually drives reach.

## Next enhancements

- **AI refill:** add an LLM node (OpenAI/Anthropic) that, when the `approved`
  queue runs low, drafts new posts from your messaging pillars and inserts them
  as `draft` for your review. Needs a model credential in n8n.
- **Queue-low alert:** a weekly check that emails you if fewer than N approved
  posts remain.
- Edit this workflow via the n8n MCP (`update_workflow` with the ID above).
