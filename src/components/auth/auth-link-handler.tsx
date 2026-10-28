"use client";

import { useEffect } from "react";
import { page } from "@/lib/site";

// Links in Supabase emails come back with "#access_token=…&type=recovery" (or an
// error) appended. If Supabase sent the visitor to the wrong page, for example the
// home page because the redirect URL isn't allow-listed, forward the link to the
// page that handles it, keeping the hash so the session can be picked up there.
export function AuthLinkHandler() {
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.length < 2) return;
    const params = new URLSearchParams(hash.slice(1));
    const type = params.get("type");
    const path = window.location.pathname;
    const at = (p: string) => path === p || path === page(p) || path.endsWith(`/${page(p)}`);

    let target: string | null = null;
    if (type === "recovery" && params.get("access_token")) target = "/reset-password";
    else if (params.get("access_token") && ["signup", "invite", "magiclink", "email_change"].includes(type ?? "")) target = "/dashboard";
    // The reset page shows its own "link expired" state, so leave errors there.
    else if ((params.get("error_code") || params.get("error_description")) && !at("/reset-password")) target = "/login";

    if (target && !at(target)) window.location.replace(page(target) + hash);
  }, []);
  return null;
}
