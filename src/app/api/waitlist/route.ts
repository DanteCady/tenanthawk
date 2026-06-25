import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const runtime = "nodejs";

type Signup = {
  email: string;
  segment?: string;
  tenants?: string;
  createdAt: string;
};

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "waitlist.json");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function readSignups(): Promise<Signup[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    return JSON.parse(raw) as Signup[];
  } catch {
    return [];
  }
}

async function writeSignups(signups: Signup[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(signups, null, 2), "utf8");
}

export async function POST(request: Request) {
  let body: { email?: unknown; segment?: unknown; tenants?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const segment = typeof body.segment === "string" ? body.segment.trim() : undefined;
  const tenants = typeof body.tenants === "string" ? body.tenants.trim() : undefined;

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "Please enter a valid work email address." },
      { status: 400 },
    );
  }

  const signups = await readSignups();

  const existingIndex = signups.findIndex((s) => s.email === email);
  if (existingIndex !== -1) {
    return NextResponse.json({
      ok: true,
      alreadyJoined: true,
      position: existingIndex + 1,
      total: signups.length,
    });
  }

  signups.push({ email, segment, tenants, createdAt: new Date().toISOString() });
  await writeSignups(signups);

  return NextResponse.json({
    ok: true,
    alreadyJoined: false,
    position: signups.length,
    total: signups.length,
  });
}

export async function GET() {
  const signups = await readSignups();
  return NextResponse.json({ total: signups.length });
}
