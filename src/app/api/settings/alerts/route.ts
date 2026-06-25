import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { isPro } from "@/lib/entitlements";
import {
  getAlertPreferences,
  upsertAlertPreferences,
} from "@/lib/alerts/preferences";
import type { InstantAlertMode } from "@/db/types";

export const runtime = "nodejs";

const MODES: InstantAlertMode[] = ["high", "any", "off"];

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const prefs = await getAlertPreferences(session.user.id);
  return NextResponse.json({ ...prefs, isPro: await isPro(session.user.id) });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await isPro(session.user.id))) {
    return NextResponse.json({ error: "Pro plan required" }, { status: 403 });
  }

  let body: {
    instantAlerts?: unknown;
    weeklyDigest?: unknown;
    expiryAlerts?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const instantAlerts = body.instantAlerts;
  const weeklyDigest = body.weeklyDigest;
  const expiryAlerts = body.expiryAlerts;

  if (typeof instantAlerts !== "string" || !MODES.includes(instantAlerts as InstantAlertMode)) {
    return NextResponse.json({ error: "Invalid instantAlerts" }, { status: 400 });
  }

  if (typeof weeklyDigest !== "boolean") {
    return NextResponse.json({ error: "Invalid weeklyDigest" }, { status: 400 });
  }

  if (typeof expiryAlerts !== "boolean") {
    return NextResponse.json({ error: "Invalid expiryAlerts" }, { status: 400 });
  }

  await upsertAlertPreferences(session.user.id, {
    instantAlerts: instantAlerts as InstantAlertMode,
    weeklyDigest,
    expiryAlerts,
  });

  return NextResponse.json({ ok: true });
}
