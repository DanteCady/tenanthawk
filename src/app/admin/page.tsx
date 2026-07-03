import { pool } from "@/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getTenantHawkAdminUserIds } from "@/lib/platform/admin";
import { PlatformAdminUsers } from "@/components/platform/PlatformAdminUsers";

export default async function PlatformAdminPage() {
  const adminIds = getTenantHawkAdminUserIds();

  const [usersResult, orgCount, connectionCount] = await Promise.all([
    adminIds.length > 0
      ? auth.api.listUsers({
          query: { limit: 100, sortBy: "createdAt", sortDirection: "desc" },
          headers: await headers(),
        })
      : Promise.resolve(null),
    pool.query<{ count: string }>(`SELECT COUNT(*)::text AS count FROM organization`),
    pool.query<{ count: string }>(`SELECT COUNT(*)::text AS count FROM connection`),
  ]);

  const users = usersResult?.users ?? [];

  const subs = await pool.query<{ referenceId: string; plan: string; status: string }>(
    `SELECT "referenceId", plan, status FROM subscription WHERE status IN ('active', 'trialing')`,
  );
  const planByUser = new Map(
    subs.rows.map((s) => [s.referenceId, s.plan] as const),
  );

  if (adminIds.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--th-text)]">
          Platform console
        </h1>
        <div className="surface-card border-amber-500/30 bg-amber-500/10 p-6">
          <p className="text-sm text-[var(--th-text)]">
            Set <code className="font-mono text-xs">TENANT_HAWK_ADMIN_USER_ID</code> in{" "}
            <code className="font-mono text-xs">.env</code> to your user id, then restart the
            dev server.
          </p>
          <p className="mt-2 text-sm text-[var(--th-text-muted)]">
            Find it:{" "}
            <code className="font-mono text-xs">
              SELECT id, email FROM &quot;user&quot; WHERE email = &apos;you@example.com&apos;;
            </code>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--th-text)]">
          Platform console
        </h1>
        <p className="mt-1 text-sm text-[var(--th-text-muted)]">
          Tenant Hawk operator tools - users, plans, and impersonation.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Users" value={String(users.length)} />
        <StatCard label="Organizations" value={orgCount.rows[0]?.count ?? "0"} />
        <StatCard label="Connections" value={connectionCount.rows[0]?.count ?? "0"} />
      </div>

      <PlatformAdminUsers
        users={users.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          createdAt: u.createdAt.toISOString(),
          plan: planByUser.get(u.id) ?? "free",
          banned: Boolean((u as { banned?: boolean }).banned),
        }))}
      />
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="surface-card p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--th-text-faint)]">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold text-[var(--th-text)]">{value}</p>
    </div>
  );
}
