interface ConnectionLike {
  tenant_domain?: string | null;
  display_name?: string | null;
  mode?: string;
}

/** Human-readable label for a client tenant connection. */
export function connectionLabel(conn: ConnectionLike): string {
  return (
    conn.tenant_domain ??
    conn.display_name ??
    (conn.mode === "demo" ? "Contoso (demo)" : "Microsoft 365")
  );
}
