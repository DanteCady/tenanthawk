import { NextResponse } from "next/server";
import { createEnterpriseOrganization } from "@/lib/enterprise/bootstrap";
import { requireSession } from "@/lib/session";
import { getUserAccountType } from "@/lib/onboarding/user-account";

export async function POST(req: Request) {
  let session;
  try {
    session = await requireSession();
  } catch {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const accountType = await getUserAccountType(session.user.id);

  if (accountType !== "msp") {
    return NextResponse.json(
      { error: "Only MSP accounts can create a workspace." },
      { status: 403 },
    );
  }

  let body: { name?: string; slug?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const name = body.name?.trim();
  const slug = body.slug?.trim();
  if (!name || !slug) {
    return NextResponse.json(
      { error: "Workspace name and slug are required." },
      { status: 400 },
    );
  }

  const result = await createEnterpriseOrganization(
    session.user.id,
    session.user.email,
    name,
    slug,
  );

  if (!result.org) {
    return NextResponse.json(
      { error: result.error ?? "Could not create workspace." },
      { status: 400 },
    );
  }

  return NextResponse.json({
    ok: true,
    organization: {
      id: result.org.id,
      name: result.org.name,
      slug: result.org.slug,
    },
  });
}
