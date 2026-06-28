import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { isPro } from "@/lib/entitlements";
import { getPrimaryConnection } from "@/lib/queries";
import {
  createReportShare,
  listReportShares,
  revokeReportShare,
  shareUrl,
} from "@/lib/report-share";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!(await isPro(session.user.id))) {
    return NextResponse.json({ error: "Pro plan required" }, { status: 403 });
  }

  const shares = await listReportShares(session.user.id);
  return NextResponse.json({
    shares: shares.map((s) => ({
      id: s.id,
      label: s.label,
      url: shareUrl(s.token),
      expiresAt: s.expires_at,
      createdAt: s.created_at,
    })),
  });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!(await isPro(session.user.id))) {
    return NextResponse.json({ error: "Pro plan required" }, { status: 403 });
  }

  const conn = await getPrimaryConnection(session.user.id);
  if (!conn) {
    return NextResponse.json({ error: "No tenant connected" }, { status: 404 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    label?: string;
    expiresInDays?: number | null;
  };

  const existing = await listReportShares(session.user.id);
  if (existing.length >= 5) {
    return NextResponse.json(
      { error: "Maximum 5 active share links. Revoke one to create another." },
      { status: 400 },
    );
  }

  const share = await createReportShare({
    userId: session.user.id,
    connectionId: conn.id,
    label: body.label?.trim() || undefined,
    expiresInDays: body.expiresInDays,
  });

  return NextResponse.json({
    share: {
      id: share.id,
      label: share.label,
      url: shareUrl(share.token),
      expiresAt: share.expires_at,
      createdAt: share.created_at,
    },
  });
}

export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!(await isPro(session.user.id))) {
    return NextResponse.json({ error: "Pro plan required" }, { status: 403 });
  }

  const id = new URL(req.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const ok = await revokeReportShare(session.user.id, id);
  if (!ok) {
    return NextResponse.json({ error: "Share link not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
