"use server";

import { api } from "@/lib/api/client";
import type { Page } from "@/lib/api/types";
import { withSession } from "@/lib/auth/session";

/**
 * The visitor's notifications (the API keeps them per app): "New offer from <shop>" for the shops they follow.
 * They live on the account, so a guest has none.
 */

export interface SiteNotification {
  id: string;
  type: string | null;
  title: string;
  body: string;
  /** Where a tap goes: a same-site path, or null when there is nothing to open. */
  href: string | null;
  read: boolean;
  createdAt: string;
}

export type NotificationsResult =
  | { status: "guest" }
  | { status: "error" }
  | { status: "member"; items: SiteNotification[]; unread: number; hasMore: boolean };

interface ApiNotification {
  id: string;
  type: string | null;
  title: string | null;
  body: string | null;
  action: { type?: string; resource?: string; arguments?: { id?: string } } | null;
  read_at: string | null;
  created_at: string;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PER_PAGE = 30;

/** Only an offer opens from a notification; the site sends "/offers/<anything>-<id>" to the offer's own address. */
function hrefOf(action: ApiNotification["action"]) {
  const id = action?.arguments?.id;
  return action?.type === "screen" && action.resource === "promotion" && typeof id === "string" && UUID.test(id) ? `/offers/offer-${id}` : null;
}

function toNotification(n: ApiNotification): SiteNotification {
  return { id: n.id, type: n.type, title: n.title ?? "", body: n.body ?? "", href: hrefOf(n.action), read: Boolean(n.read_at), createdAt: n.created_at };
}

/** The latest notifications and the unread count, or "guest" when nobody is signed in. */
export async function loadNotificationsAction(): Promise<NotificationsResult> {
  try {
    const result = await withSession(async (token) => {
      const page = await api<Page<ApiNotification> & { stats?: { unread_count?: number } }>("/notifications", { query: { per_page: PER_PAGE }, token, client: null });
      return { items: page.data.map(toNotification), unread: page.stats?.unread_count ?? 0, hasMore: page.meta.last_page > 1 };
    });
    return result === "signed-out" ? { status: "guest" } : { status: "member", ...result };
  } catch (error) {
    console.error("[notifications]", error);
    return { status: "error" };
  }
}

/** The unread count for the header bell; 0 for a guest or when the API can't be reached. */
export async function unreadCountAction(): Promise<number> {
  try {
    const result = await withSession((token) => api<{ data: { unread_count: number } }>("/notifications/unread-count", { token, client: null }));
    return result === "signed-out" ? 0 : (result.data.unread_count ?? 0);
  } catch {
    return 0;
  }
}

/** Marks one notification read (`id` omitted: all of them). */
export async function markReadAction(id?: string): Promise<boolean> {
  if (id !== undefined && !UUID.test(id)) return false;
  try {
    const result = await withSession((token) => api(id ? `/notifications/${id}/read` : "/notifications/read-all", { method: "PUT", token, client: null }));
    return result !== "signed-out";
  } catch (error) {
    console.error("[notifications]", error);
    return false;
  }
}
