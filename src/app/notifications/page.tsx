"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { FaBars, FaTimes } from "react-icons/fa";
import { firebaseAuth, allowedAdminEmail } from "@/lib/firebase-client";
import { api } from "@/lib/client-api";
import { money } from "@/lib/money";

type NotificationStatus = "sent" | "failed";

type NotificationItem = {
  _id: string;
  entryId?: string;
  client: string;
  phone: string;
  event: string;
  templateName: string;
  status: NotificationStatus;
  message?: string;
  amount?: number;
  createdAt: string;
};

// আপনার whatsapp.ts-এর event নামের সাথে মিলিয়ে সুন্দর লেবেল
const EVENT_LABELS: Record<string, string> = {
  document_pending: "Document pending",
  work_started: "Work started",
  payment_received: "Payment received",
  work_finished: "Work finished (due later)",
  completed: "Project completed",
};

const NOTIFICATIONS_CACHE_KEY = "/api/notifications";
const EMPTY: NotificationItem[] = [];
const fetchNotifications = () => api<NotificationItem[]>("/notifications");

function formatDateTime(value: string) {
  try {
    return new Date(value).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
}

function StatusBadge({ status }: { status: NotificationStatus }) {
  return (
    <span
      className={status === "sent" ? "badge badge-complete" : "badge badge-cancelled"}
    >
      {status === "sent" ? "Sent" : "Failed"}
    </span>
  );
}

export default function NotificationsPage() {
  const [authorized, setAuthorized] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const {
    data: cached,
    error,
    isLoading: loading,
    mutate,
  } = useSWR<NotificationItem[]>(
    authorized ? NOTIFICATIONS_CACHE_KEY : null,
    fetchNotifications,
    { dedupingInterval: 15_000, revalidateOnFocus: false, keepPreviousData: true },
  );
  const notifications = cached ?? EMPTY;
  const [statusFilter, setStatusFilter] = useState<"all" | NotificationStatus>("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<NotificationItem | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 15;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
      if (!user || !allowedAdminEmail(user.email)) window.location.replace("/login");
      else setAuthorized(true);
    });
    return unsubscribe;
  }, []);

  const filtered = useMemo(() => {
    return notifications.filter((item) => {
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      const haystack = [item.client, item.phone, item.event, item.templateName, item.message]
        .join(" ")
        .toLowerCase();
      const matchesQuery = !query || haystack.includes(query.toLowerCase());
      return matchesStatus && matchesQuery;
    });
  }, [notifications, statusFilter, query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageItems = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const removeOne = async (id: string) => {
    if (!confirm("Delete this notification?")) return;
    await api(`/notifications/${id}`, { method: "DELETE" });
    await mutate((current = []) => current.filter((item) => item._id !== id), {
      revalidate: false,
    });
    setSelected(null);
  };

  const removeAll = async () => {
    if (!notifications.length) return;
    if (!confirm(`Delete all ${notifications.length} notifications? This cannot be undone.`)) return;
    await api("/notifications", { method: "DELETE" });
    await mutate([], { revalidate: false });
  };

  if (!authorized || loading) {
    return (
      <div className="app-shell">
        <main className="content">
          <p className="muted" style={{ padding: 40 }}>
            Loading notifications...
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      {menuOpen && (
        <button
          className="sidebar-scrim"
          aria-label="Close navigation menu"
          onClick={() => setMenuOpen(false)}
        />
      )}
      <aside className={`sidebar${menuOpen ? " sidebar-open" : ""}`} id="app-sidebar">
        <div className="brand">
          <div>
            <b>EASY TECH LONDON LTD</b>
            <small>Client & payment ledger</small>
          </div>
          <button
            className="mobile-sidebar-close"
            aria-label="Close navigation menu"
            onClick={() => setMenuOpen(false)}
          >
            <FaTimes />
          </button>
        </div>
        <nav>
          <Link href="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</Link>
          <Link href="/ledger" onClick={() => setMenuOpen(false)}>All entries</Link>
          <Link className="active" href="/notifications" onClick={() => setMenuOpen(false)}>
            Notifications
          </Link>
        </nav>
        <div className="sidebar-bottom">
          <button className="signout" onClick={() => signOut(firebaseAuth)}>
            Sign out
          </button>
        </div>
      </aside>
      <main className="content">
        <div className="mobile-topbar">
          <button
            className="menu-toggle"
            aria-label="Open navigation menu"
            aria-expanded={menuOpen}
            aria-controls="app-sidebar"
            onClick={() => setMenuOpen(true)}
          >
            <FaBars />
          </button>
          <strong>EASY TECH LONDON LTD</strong>
        </div>
        <header>
          <div>
            <p className="eyebrow">EASY TECH LONDON LTD / NOTIFICATIONS</p>
            <h1>WhatsApp notification history</h1>
            <p className="muted">
              {notifications.length} notifications logged · auto-deletes after 30 days
            </p>
          </div>
          {notifications.length > 0 && (
            <button className="danger" onClick={removeAll}>
              Delete all
            </button>
          )}
        </header>

        {error && (
          <div className="error banner">
            {error instanceof Error ? error.message : "Could not load notifications"}
          </div>
        )}

        <section className="stack">
          <div className="toolbar">
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              placeholder="Search client, phone, event or message"
            />
            <div className="toolbar-filters">
              <select
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value as "all" | NotificationStatus);
                  setPage(1);
                }}
              >
                <option value="all">All statuses</option>
                <option value="sent">Sent</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date & time</th>
                  <th>Client</th>
                  <th>Phone</th>
                  <th>Event</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {pageItems.map((item) => (
                  <tr key={item._id}>
                    <td>{formatDateTime(item.createdAt)}</td>
                    <td>
                      <b>{item.client}</b>
                    </td>
                    <td>{item.phone}</td>
                    <td>{EVENT_LABELS[item.event] || item.event}</td>
                    <td>
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="actions">
                      <button onClick={() => setSelected(item)}>Details</button>
                      <button className="danger" onClick={() => removeOne(item._id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mobile-notification-list">
              {pageItems.map((item) => (
                <article className="mobile-notification" key={item._id}>
                  <div className="mobile-notification-heading">
                    <b>{item.client}</b>
                    <StatusBadge status={item.status} />
                  </div>
                  <dl className="mobile-notification-meta">
                    <div>
                      <dt>Date & time</dt>
                      <dd>{formatDateTime(item.createdAt)}</dd>
                    </div>
                    <div>
                      <dt>Phone</dt>
                      <dd>{item.phone}</dd>
                    </div>
                    <div>
                      <dt>Event</dt>
                      <dd>{EVENT_LABELS[item.event] || item.event}</dd>
                    </div>
                  </dl>
                  <div className="mobile-notification-actions">
                    <button onClick={() => setSelected(item)}>Details</button>
                    <button className="danger" onClick={() => removeOne(item._id)}>
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
            {!filtered.length && <p className="empty">No notifications match this search.</p>}
            <div className="pagination">
              <span>
                Showing {filtered.length ? (currentPage - 1) * pageSize + 1 : 0}-
                {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length}
              </span>
              <div>
                <button disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>
                  Previous
                </button>
                <b>
                  Page {currentPage} of {pageCount}
                </b>
                <button
                  disabled={currentPage === pageCount}
                  onClick={() => setPage(currentPage + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {selected && (
        <div className="modal-backdrop">
          <section className="modal narrow">
            <div className="modal-heading">
              <div>
                <h2>{selected.client}</h2>
                <p className="muted">{EVENT_LABELS[selected.event] || selected.event}</p>
              </div>
              <button onClick={() => setSelected(null)}>Close</button>
            </div>
            <StatusBadge status={selected.status} />
            <dl className="details">
              <div>
                <dt>Sent at</dt>
                <dd>{formatDateTime(selected.createdAt)}</dd>
              </div>
              <div>
                <dt>Phone</dt>
                <dd>{selected.phone}</dd>
              </div>
              <div>
                <dt>Template</dt>
                <dd>{selected.templateName}</dd>
              </div>
              {typeof selected.amount === "number" && (
                <div>
                  <dt>Amount</dt>
                  <dd>{money(selected.amount)}</dd>
                </div>
              )}
              {selected.message && (
                <div>
                  <dt>{selected.status === "failed" ? "Error" : "Note"}</dt>
                  <dd>{selected.message}</dd>
                </div>
              )}
              {selected.entryId && (
                <div>
                  <dt>Linked entry ID</dt>
                  <dd>{selected.entryId}</dd>
                </div>
              )}
            </dl>
            <div className="modal-actions">
              <button className="danger" onClick={() => removeOne(selected._id)}>
                Delete this notification
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}