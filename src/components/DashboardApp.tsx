"use client";

import type React from "react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { firebaseAuth, allowedAdminEmail } from "@/lib/firebase-client";
import { api } from "@/lib/client-api";
import { Entry, EntryInput, EntryStatus, STATUSES } from "@/types";
import {
  money,
  monthKey,
  monthName,
  n,
  prettyDate,
  received,
  remaining,
  today,
} from "@/lib/money";

type Props = { view: "dashboard" | "ledger" };
const blank: EntryInput = {
  date: today(),
  client: "",
  service: "",
  status: "Pending",
  deal: 0,
  advance: 0,
  payments: [],
  commission: 0,
  reference: "",
  email: "",
  phone: "",
  notes: "",
};
const SERVICE_OPTIONS = [
  "Uber ID Recover",
  "Facebook ID Recover",
  "Gmail ID Recover",
  "Apple ID Recover",
  "Other",
];

function Badge({ status }: { status: EntryStatus }) {
  return (
    <span className={`badge badge-${status.toLowerCase().replace(" ", "-")}`}>
      {status}
    </span>
  );
}
function Field({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input {...props} />
    </label>
  );
}
export default function DashboardApp({ view }: Props) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilterState] = useState("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("date-desc");
  const [dashboardMonth, setDashboardMonth] = useState("all");
  const [modal, setModal] = useState<"add" | "edit" | "details" | "pay" | null>(
    null,
  );
  const [selected, setSelected] = useState<Entry | null>(null);
  const setFilter = (value: string) => {
    setFilterState(value);
    window.dispatchEvent(new CustomEvent("dashboard-filter", { detail: value }));
  };
  const [form, setForm] = useState<EntryInput>(blank);

  const refresh = async () => {
    setLoading(true);
    try {
      setEntries(await api<Entry[]>("/entries"));
      setError("");
    } catch (value) {
      setError(
        value instanceof Error ? value.message : "Could not load entries",
      );
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
      if (!user || !allowedAdminEmail(user.email))
        window.location.replace("/login");
      else void refresh();
    });
    return unsubscribe;
  }, []);

  const filtered = useMemo(() => {
    const result = entries.filter(
      (entry) =>
        (filter === "all" || entry.status === filter) &&
        (!query ||
          [
            entry.client,
            entry.service,
            entry.phone,
            entry.email,
            entry.reference,
            entry.notes,
            entry.status,
          ]
            .join(" ")
            .toLowerCase()
            .includes(query.toLowerCase())),
    );
    const sorters: Record<string, (a: Entry, b: Entry) => number> = {
      "date-desc": (a, b) => b.date.localeCompare(a.date),
      "date-asc": (a, b) => a.date.localeCompare(b.date),
      "due-desc": (a, b) => remaining(b) - remaining(a),
      "deal-desc": (a, b) => b.deal - a.deal,
      "name-asc": (a, b) => a.client.localeCompare(b.client),
    };
    return result.sort(sorters[sort]);
  }, [entries, filter, query, sort]);
  const active = entries.filter(
    (entry) => !["Pending", "Cancelled"].includes(entry.status),
  );
  const dueEntries = active.filter((entry) =>
    ["Progress", "Due Later"].includes(entry.status),
  );
  const totals = {
    deal: active.reduce((sum, entry) => sum + entry.deal, 0),
    received: active.reduce((sum, entry) => sum + received(entry), 0),
    due: dueEntries.reduce((sum, entry) => sum + remaining(entry), 0),
    complete: active.filter((entry) => entry.status === "Complete").length,
  };

  const openAdd = () => {
    setForm({ ...blank, date: today() });
    setSelected(null);
    setModal("add");
  };
  const openEdit = (entry: Entry) => {
    setForm({
      ...entry,
      payments: [...entry.payments],
      email: entry.email || "",
      phone: entry.phone || "",
      notes: entry.notes || "",
    });
    setSelected(entry);
    setModal("edit");
  };
  const save = async () => {
    if (!form.client.trim()) return;
    const data = { ...form, service: form.service.trim() || "Not set" };
    const result = selected
      ? await api<Entry>(`/entries/${selected._id}`, {
          method: "PUT",
          body: JSON.stringify(data),
        })
      : await api<Entry>("/entries", {
          method: "POST",
          body: JSON.stringify(data),
        });
    setEntries((current) =>
      selected
        ? current.map((entry) => (entry._id === result._id ? result : entry))
        : [result, ...current],
    );
    setModal(null);
  };
  const remove = async () => {
    if (!selected || !confirm("Delete this entry?")) return;
    await api(`/entries/${selected._id}`, { method: "DELETE" });
    setEntries((current) =>
      current.filter((entry) => entry._id !== selected._id),
    );
    setModal(null);
  };
  const start = async (entry: Entry) => {
    const result = await api<Entry>(`/entries/${entry._id}`, {
      method: "PUT",
      body: JSON.stringify({ status: "Progress" }),
    });
    setEntries((current) =>
      current.map((item) => (item._id === result._id ? result : item)),
    );
  };
  const pay = async (amount: number, date: string) => {
    if (!selected) return;
    const result = await api<Entry>(`/entries/${selected._id}/payments`, {
      method: "POST",
      body: JSON.stringify({ amount, date }),
    });
    setEntries((current) =>
      current.map((entry) => (entry._id === result._id ? result : entry)),
    );
    setModal(null);
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <Image className="sidebar-company-logo" src="/Easy Tech solution logo.png" alt="EASYTECH LONDON LTD logo" width={40} height={40} />
          <div>
            <b>EASYTECH LONDON LTD</b>
            <small>Client & payment ledger</small>
          </div>
        </div>
        <nav>
          <a className={view === "dashboard" ? "active" : ""} href="/dashboard">
            Dashboard
          </a>
          <a className={view === "ledger" ? "active" : ""} href="/ledger">
            All entries
          </a>
        </nav>
        {view === "ledger" && <><p className="nav-label">Filter by status</p>
          {["all", ...STATUSES].map((status) => (
            <button
              key={status}
              className={filter === status ? "filter active" : "filter"}
              onClick={() => setFilter(status)}
            >
              {status === "all" ? "All entries" : status}
              <span>
                {status === "all"
                  ? entries.length
                  : entries.filter((entry) => entry.status === status).length}
              </span>
            </button>
          ))}
        </>}
        <div className="sidebar-bottom">
          <p>Collected so far</p>
          <strong>{money(totals.received)}</strong>
          <div className="progress">
            <i
              style={{
                width: `${totals.deal ? Math.min(100, (totals.received / totals.deal) * 100) : 0}%`,
              }}
            />
          </div>
          <button className="signout" onClick={() => signOut(firebaseAuth)}>
            Sign out
          </button>
        </div>
      </aside>
      <main className="content">
        <header>
          <div>
            <p className="eyebrow">
              EASYTECH LONDON LTD /{" "}
              {view === "dashboard" ? "OVERVIEW" : "LEDGER"}
            </p>
            <h1>
              {view === "dashboard"
                ? "Good work, clearly seen."
                : "All client entries"}
            </h1>
            <p className="muted">
              {loading
                ? "Loading your ledger..."
                : `${entries.length} entries on the book`}
            </p>
          </div>
          <button className="primary" onClick={openAdd}>
            + Add entry
          </button>
        </header>
        {error && <div className="error banner">{error}</div>}
        {view === "dashboard" ? (
          <Overview
            entries={entries}
            month={dashboardMonth}
            setMonth={setDashboardMonth}
            onPay={(entry) => {
              setSelected(entry);
              setModal("pay");
            }}
          />
        ) : (
          <Ledger
            entries={filtered}
            query={query}
            filter={filter}
            sort={sort}
            setQuery={setQuery}
            setFilter={setFilterState}
            setSort={setSort}
            onDetails={(entry) => {
              setSelected(entry);
              setModal("details");
            }}
            onEdit={openEdit}
            onPay={(entry) => {
              setSelected(entry);
              setModal("pay");
            }}
            onStart={start}
          />
        )}
      </main>
      {modal === "add" || modal === "edit" ? (
        <Editor
          form={form}
          setForm={setForm}
          selected={selected}
          onSave={save}
          onDelete={remove}
          onClose={() => setModal(null)}
        />
      ) : null}
      {modal === "details" && selected ? (
        <Details
          entry={selected}
          onClose={() => setModal(null)}
          onEdit={() => openEdit(selected)}
          onPay={() => setModal("pay")}
          onStart={() => start(selected)}
        />
      ) : null}
      {modal === "pay" && selected ? (
        <Payment entry={selected} onClose={() => setModal(null)} onSave={pay} />
      ) : null}
    </div>
  );
}

function Overview({
  entries,
  month,
  setMonth,
  onPay,
}: {
  entries: Entry[];
  month: string;
  setMonth: (value: string) => void;
  onPay: (entry: Entry) => void;
}) {
  const [statusFilter, setStatusFilter] = useState("all");
  useEffect(() => {
    const handleFilter = (event: Event) => setStatusFilter((event as CustomEvent<string>).detail);
    window.addEventListener("dashboard-filter", handleFilter);
    return () => window.removeEventListener("dashboard-filter", handleFilter);
  }, []);
  if (statusFilter !== "all") entries = entries.filter((entry) => entry.status === statusFilter);
  const monthKeys = [
    ...new Set(
      entries
        .flatMap((entry) => [
          entry.date,
          ...entry.payments.map((payment) => payment.date),
        ])
        .map(monthKey)
        .filter(Boolean),
    ),
  ]
    .sort()
    .reverse();
  const scoped =
    month === "all"
      ? entries
      : entries.filter((entry) => monthKey(entry.date) === month);
  const active = scoped.filter(
    (entry) => !["Pending", "Cancelled"].includes(entry.status),
  );
  const dueEntries = active.filter((entry) =>
    ["Progress", "Due Later"].includes(entry.status),
  );
  const deal = active.reduce((sum, entry) => sum + n(entry.deal), 0);
  const commission = active.reduce(
    (sum, entry) => sum + n(entry.commission),
    0,
  );
  const receivedInMonth = entries
    .filter((entry) => !["Pending", "Cancelled"].includes(entry.status))
    .reduce(
      (sum, entry) =>
        sum +
        (month === "all" || monthKey(entry.date) === month
          ? n(entry.advance)
          : 0) +
        entry.payments.reduce(
          (paymentSum, payment) =>
            paymentSum +
            (month === "all" || monthKey(payment.date) === month
              ? n(payment.amount)
              : 0),
          0,
        ),
      0,
    );
  const netBalance = receivedInMonth - commission;
  const due = dueEntries.reduce((sum, entry) => sum + remaining(entry), 0);
  const owing = dueEntries
    .filter((entry) => remaining(entry) > 0)
    .sort((a, b) => remaining(b) - remaining(a))
    .slice(0, 6);
  const byMonth = monthKeys
    .map((key) => {
      const monthEntries = entries.filter(
        (entry) =>
          monthKey(entry.date) === key &&
          !["Pending", "Cancelled"].includes(entry.status),
      );
      const jobs = monthEntries.length;
      const done = monthEntries.filter(
        (entry) => entry.status === "Complete",
      ).length;
      const collected = entries.reduce(
        (sum, entry) =>
          sum +
          (monthKey(entry.date) === key ? n(entry.advance) : 0) +
          entry.payments
            .filter((payment) => monthKey(payment.date) === key)
            .reduce((paymentSum, payment) => paymentSum + n(payment.amount), 0),
        0,
      );
      const monthDeal = monthEntries.reduce(
        (sum, entry) => sum + n(entry.deal),
        0,
      );
      const monthDue = monthEntries
        .filter((entry) => ["Progress", "Due Later"].includes(entry.status))
        .reduce((sum, entry) => sum + remaining(entry), 0);
      return { key, jobs, done, collected, monthDeal, monthDue };
    })
    .slice(0, 6);
  const peak = Math.max(1, ...byMonth.map((item) => item.jobs));
  useEffect(() => {
    const summary = document.querySelector<HTMLElement>(".money-summary");
    if (!summary) return;
    let row = summary.querySelector<HTMLElement>("[data-net-balance]");
    if (!row) {
      row = document.createElement("div");
      row.dataset.netBalance = "true";
      summary.appendChild(row);
    }
    row.innerHTML = `<dt>Net balance</dt><dd class="${netBalance >= 0 ? "green-text" : "red-text"}">${money(netBalance)}</dd>`;
  }, [netBalance]);
  return (
    <section className="stack">
      <div className="month-filter">
        <label htmlFor="dashboard-month">Showing month</label>
        <select
          id="dashboard-month"
          value={month}
          onChange={(event) => setMonth(event.target.value)}
        >
          <option value="all">All months</option>
          {monthKeys.map((key) => (
            <option key={key} value={key}>
              {monthName(key)}
            </option>
          ))}
        </select>
      </div>
      <div className="stats">
        <article>
          <span>Active deal amount</span>
          <strong>{money(deal)}</strong>
          <small>{active.length} active jobs</small>
        </article>
        <article className="green">
          <span>Total received</span>
          <strong>{money(receivedInMonth)}</strong>
          <small>Advance + later payments</small>
        </article>
        <article className="red">
          <span>Remaining due</span>
          <strong>{money(due)}</strong>
          <small>{owing.length} clients owing</small>
        </article>
      </div>
      <div className="summary-grid">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Money summary</h2>
              <p className="muted">
                {month === "all" ? "All recorded work" : monthName(month)}
              </p>
            </div>
          </div>
          <dl className="money-summary">
            <div>
              <dt>Deal amount</dt>
              <dd>{money(deal)}</dd>
            </div>
            <div>
              <dt>Received</dt>
              <dd className="green-text">{money(receivedInMonth)}</dd>
            </div>
            <div>
              <dt>Agent commission</dt>
              <dd>− {money(commission)}</dd>
            </div>
            <div>
              <dt>Due to collect</dt>
              <dd className="red-text">{money(due)}</dd>
            </div>
          </dl>
        </section>
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Month by month</h2>
              <p className="muted">
                Jobs finished and money collected in each month.
              </p>
            </div>
          </div>
          <div className="month-list">
            {byMonth.length ? (
              byMonth.map((item) => (
                <div className="month-row" key={item.key}>
                  <div className="month-row-heading">
                    <b>{monthName(item.key)}</b>
                    <span>
                      {item.done}/{item.jobs} done · {money(item.collected)}{" "}
                      received
                    </span>
                  </div>
                  <div className="month-bar">
                    <i
                      style={{
                        width: `${Math.max(18, (item.jobs / peak) * 100)}%`,
                      }}
                    >
                      <em
                        style={{
                          width: `${item.jobs ? (item.done / item.jobs) * 100 : 0}%`,
                        }}
                      >
                        {item.jobs && item.done / item.jobs > 0.14
                          ? `${Math.round((item.done / item.jobs) * 100)}%`
                          : ""}
                      </em>
                    </i>
                  </div>
                  <small>
                    Deal {money(item.monthDeal)} · Due {money(item.monthDue)}
                  </small>
                </div>
              ))
            ) : (
              <p className="empty">No monthly records yet.</p>
            )}
          </div>
        </section>
      </div>
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Clients to follow up</h2>
            <p className="muted">The largest outstanding balances first.</p>
          </div>
          <a href="/ledger">View ledger</a>
        </div>
        {owing.length ? (
          <div className="followups">
            {owing.map((entry) => (
              <div className="followup" key={entry._id}>
                <div>
                  <b>{entry.client}</b>
                  <small>
                    {entry.service} · {prettyDate(entry.date)}
                  </small>
                </div>
                <strong>{money(remaining(entry))}</strong>
                <button className="success" onClick={() => onPay(entry)}>
                  Take money
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty">Everyone has paid in full.</p>
        )}
      </section>
    </section>
  );
}

function Ledger({
  entries,
  query,
  filter,
  sort,
  setQuery,
  setFilter,
  setSort,
  onDetails,
  onEdit,
  onPay,
  onStart,
}: {
  entries: Entry[];
  query: string;
  filter: string;
  sort: string;
  setQuery: (value: string) => void;
  setFilter: (value: string) => void;
  setSort: (value: string) => void;
  onDetails: (entry: Entry) => void;
  onEdit: (entry: Entry) => void;
  onPay: (entry: Entry) => void;
  onStart: (entry: Entry) => void;
}) {
  const printReport = () => {
    const rows = entries
      .map(
        (entry) =>
          `<tr><td>${prettyDate(entry.date)}</td><td>${entry.client}</td><td>${entry.service}</td><td>${entry.status}</td><td>${money(entry.deal)}</td><td>${entry.status === "Pending" ? "-" : money(remaining(entry))}</td><td>${entry.reference || "-"}</td><td>${entry.phone || "-"}</td></tr>`,
      )
      .join("");
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(
      `<html><head><title>EASYTECH LONDON LTD - Client Report</title><style>body{font-family:Arial,sans-serif;color:#18221f;padding:24px}h1{font-size:22px}p{color:#66716b}table{width:100%;border-collapse:collapse;font-size:12px;margin-top:18px}th,td{border:1px solid #cfd6d1;padding:8px;text-align:left}th{background:#e8eeeb}</style></head><body><h1>EASYTECH LONDON LTD - Client & Payment Report</h1><p>${entries.length} entries shown · Printed ${prettyDate(today())}</p><table><thead><tr><th>Date</th><th>Client</th><th>Service</th><th>Status</th><th>Deal</th><th>Remaining</th><th>Reference</th><th>Phone</th></tr></thead><tbody>${rows}</tbody></table></body></html>`,
    );
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };
  const importEntries = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const imported = await api<{ imported: number }>("/entries/import", {
        method: "POST",
        body: JSON.stringify(JSON.parse(await file.text())),
      });
      alert(`${imported.imported} entries imported successfully.`);
      window.location.reload();
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "Could not import entries",
      );
    }
  };
  const exportEntries = () => {
    const content = JSON.stringify(
      entries.map(({ _id, createdAt, updatedAt, ...entry }) => entry),
      null,
      2,
    );
    const url = URL.createObjectURL(
      new Blob([content], { type: "application/json" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `easytech-entries-${today()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };
  const activeEntries = entries.filter(
    (entry) => !["Pending", "Cancelled"].includes(entry.status),
  );
  const dueEntries = activeEntries.filter((entry) =>
    ["Progress", "Due Later"].includes(entry.status),
  );
  const visibleDeal = activeEntries.reduce(
    (sum, entry) => sum + n(entry.deal),
    0,
  );
  const visibleReceived = activeEntries.reduce(
    (sum, entry) => sum + received(entry),
    0,
  );
  const visibleDue = dueEntries.reduce(
    (sum, entry) => sum + remaining(entry),
    0,
  );
  const pendingDeal = entries
    .filter((entry) => entry.status === "Pending")
    .reduce((sum, entry) => sum + n(entry.deal), 0);
  const visibleComplete = activeEntries.filter(
    (entry) => entry.status === "Complete",
  ).length;
  const pageSize = 10;
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(entries.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageEntries = entries.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const totalDeal = entries.reduce((sum, entry) => sum + n(entry.deal), 0);
  const totalDue = entries.reduce(
    (sum, entry) => sum + (entry.status === "Pending" ? 0 : remaining(entry)),
    0,
  );
  return (
    <section className="stack">
      <div className="ledger-stats">
        <article>
          <span>Entries shown</span>
          <strong>{entries.length}</strong>
          <small>
            {visibleComplete} complete ·{" "}
            {dueEntries.filter((entry) => remaining(entry) > 0).length} still
            owing
          </small>
        </article>
        <article>
          <span>Active deal amount</span>
          <strong>{money(visibleDeal)}</strong>
          <small>Excludes pending deals</small>
        </article>
        <article className="green">
          <span>Total received</span>
          <strong>{money(visibleReceived)}</strong>
          <small>Advance + later payments</small>
        </article>
        <article className="red">
          <span>Remaining due</span>
          <strong>{money(visibleDue)}</strong>
          <small>
            {dueEntries.filter((entry) => remaining(entry) > 0).length} clients
            to follow up
          </small>
        </article>
        <article className="pending-card">
          <span>Pending discussions</span>
          <strong>{money(pendingDeal)}</strong>
          <small>
            {entries.filter((entry) => entry.status === "Pending").length}{" "}
            future/on-hold entries
          </small>
        </article>
      </div>
      <div className="toolbar">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search client, service, phone, reference or email"
        />
        <select
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
        >
          <option value="all">All statuses</option>
          {STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <select value={sort} onChange={(event) => setSort(event.target.value)}>
          <option value="date-desc">Newest first</option>
          <option value="date-asc">Oldest first</option>
          <option value="due-desc">Biggest due first</option>
          <option value="deal-desc">Biggest deal first</option>
          <option value="name-asc">Client A-Z</option>
        </select>
        <button className="print-button" onClick={printReport}>
          Save as PDF
        </button>
        <label className="print-button import-button">
          Import JSON
          <input
            type="file"
            accept=".json,application/json"
            onChange={importEntries}
          />
        </label>
        <button className="print-button" onClick={exportEntries}>
          Export JSON
        </button>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Client</th>
              <th>Service</th>
              <th>Status</th>
              <th>Deal</th>
              <th>Remaining</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {pageEntries.map((entry) => {
              const due = entry.status === "Pending" ? 0 : remaining(entry);
              return (
                <tr key={entry._id}>
                  <td>{prettyDate(entry.date)}</td>
                  <td>
                    <b>{entry.client}</b>
                  </td>
                  <td>{entry.service}</td>
                  <td>
                    <Badge status={entry.status} />
                  </td>
                  <td>{money(entry.deal)}</td>
                  <td className={due ? "red-text" : ""}>
                    {entry.status === "Pending" ? "—" : money(due)}
                  </td>
                  <td className="actions">
                    {entry.status === "Pending" ? (
                      <button onClick={() => onStart(entry)}>Start</button>
                    ) : due ? (
                      <button className="success" onClick={() => onPay(entry)}>
                        Add money
                      </button>
                    ) : null}
                    <button onClick={() => onDetails(entry)}>Details</button>
                    <button onClick={() => onEdit(entry)}>Edit</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <th colSpan={4}>Total</th>
              <th>{money(totalDeal)}</th>
              <th className="red-text">{money(totalDue)}</th>
              <th />
            </tr>
          </tfoot>
        </table>
        {!entries.length && (
          <p className="empty">No entry matches this search.</p>
        )}
        <div className="pagination">
          <span>
            Showing {entries.length ? (currentPage - 1) * pageSize + 1 : 0}-
            {Math.min(currentPage * pageSize, entries.length)} of{" "}
            {entries.length}
          </span>
          <div>
            <button
              disabled={currentPage === 1}
              onClick={() => setPage(currentPage - 1)}
            >
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
  );
}

function Editor({
  form,
  setForm,
  selected,
  onSave,
  onDelete,
  onClose,
}: {
  form: EntryInput;
  setForm: React.Dispatch<React.SetStateAction<EntryInput>>;
  selected: Entry | null;
  onSave: () => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const update = (key: keyof EntryInput, value: string | number) =>
    setForm((current) => ({ ...current, [key]: value }));
  const [serviceOptions, setServiceOptions] = useState<string[]>(() => {
    if (typeof window === "undefined") return SERVICE_OPTIONS;
    const saved = JSON.parse(
      localStorage.getItem("easytech-services") || "[]",
    ) as unknown;
    return Array.isArray(saved)
      ? [
          ...new Set([
            ...SERVICE_OPTIONS,
            ...saved.filter(
              (value): value is string => typeof value === "string",
            ),
          ]),
        ]
      : SERVICE_OPTIONS;
  });
  const rememberService = (value: string) => {
    const service = value.trim();
    if (!service || serviceOptions.includes(service)) return;
    const next = [...serviceOptions, service];
    setServiceOptions(next);
    localStorage.setItem("easytech-services", JSON.stringify(next));
  };
  return (
    <div className="modal-backdrop">
      <section className="modal">
        <div className="modal-heading">
          <h2>{selected ? "Edit entry" : "Add entry"}</h2>
          <button onClick={onClose}>Close</button>
        </div>
        <div className="form-grid">
          <Field
            label="Working date"
            type="date"
            value={form.date}
            onChange={(event) => update("date", event.target.value)}
          />
          <Field
            label="Client name"
            value={form.client}
            onChange={(event) => update("client", event.target.value)}
          />
          <label className="field">
            <span>Service type</span>
            <input
              list="service-options"
              value={form.service}
              placeholder="Type or select service"
              onChange={(event) => update("service", event.target.value)}
              onBlur={(event) => rememberService(event.target.value)}
            />
            <datalist id="service-options">
              {serviceOptions.map((service) => (
                <option key={service} value={service} />
              ))}
            </datalist>
          </label>
          <label className="field">
            <span>Status</span>
            <select
              value={form.status}
              onChange={(event) =>
                update("status", event.target.value as EntryStatus)
              }
            >
              {STATUSES.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </label>
          <Field
            label="Deal amount"
            type="number"
            value={form.deal || ""}
            onChange={(event) => update("deal", Number(event.target.value))}
          />
          <Field
            label="Advance paid"
            type="number"
            value={form.advance || ""}
            onChange={(event) => update("advance", Number(event.target.value))}
          />
          <Field
            label="Email"
            type="email"
            value={form.email || ""}
            onChange={(event) => update("email", event.target.value)}
          />
          <Field
            label="Phone number"
            value={form.phone || ""}
            onChange={(event) => update("phone", event.target.value)}
          />
          <Field
            label="Commission"
            type="number"
            value={form.commission || ""}
            onChange={(event) =>
              update("commission", Number(event.target.value))
            }
          />
          <Field
            label="Reference"
            value={form.reference || ""}
            onChange={(event) => update("reference", event.target.value)}
          />
          <label className="field wide">
            <span>Notes</span>
            <textarea
              rows={3}
              value={form.notes || ""}
              onChange={(event) => update("notes", event.target.value)}
            />
          </label>
        </div>
        <div className="modal-actions">
          {selected && (
            <button className="danger" onClick={onDelete}>
              Delete
            </button>
          )}
          <button onClick={onClose}>Cancel</button>
          <button className="primary" onClick={onSave}>
            Save entry
          </button>
        </div>
      </section>
    </div>
  );
}

function Details({
  entry,
  onClose,
  onEdit,
  onPay,
  onStart,
}: {
  entry: Entry;
  onClose: () => void;
  onEdit: () => void;
  onPay: () => void;
  onStart: () => void;
}) {
  return (
    <div className="modal-backdrop">
      <section className="modal narrow">
        <div className="modal-heading">
          <div>
            <h2>{entry.client}</h2>
            <p className="muted">{entry.service}</p>
          </div>
          <button onClick={onClose}>Close</button>
        </div>
        <Badge status={entry.status} />
        <div className="detail-money">
          <div>
            <small>Deal</small>
            <b>{money(entry.deal)}</b>
          </div>
          <div>
            <small>Received</small>
            <b className="green-text">{money(received(entry))}</b>
          </div>
          <div>
            <small>Remaining</small>
            <b className="red-text">{money(remaining(entry))}</b>
          </div>
        </div>
        <dl className="details">
          <div>
            <dt>Working date</dt>
            <dd>{prettyDate(entry.date)}</dd>
          </div>
          <div>
            <dt>Phone</dt>
            <dd>{entry.phone || "—"}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{entry.email || "—"}</dd>
          </div>
          <div>
            <dt>Reference</dt>
            <dd>{entry.reference || "—"}</dd>
          </div>
          <div>
            <dt>Notes</dt>
            <dd>{entry.notes || "—"}</dd>
          </div>
        </dl>
        <div className="modal-actions">
          {entry.status === "Pending" ? (
            <button className="success" onClick={onStart}>
              Start processing
            </button>
          ) : (
            remaining(entry) > 0 && (
              <button className="success" onClick={onPay}>
                Add money
              </button>
            )
          )}
          <button className="primary" onClick={onEdit}>
            Edit entry
          </button>
        </div>
      </section>
    </div>
  );
}

function Payment({
  entry,
  onClose,
  onSave,
}: {
  entry: Entry;
  onClose: () => void;
  onSave: (amount: number, date: string) => Promise<void>;
}) {
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(today());
  return (
    <div className="modal-backdrop">
      <section className="modal narrow">
        <div className="modal-heading">
          <div>
            <h2>Receive payment</h2>
            <p className="muted">
              {entry.client} · {entry.service}
            </p>
          </div>
          <button onClick={onClose}>Close</button>
        </div>
        <div className="due-box">
          Current due <b>{money(remaining(entry))}</b>
        </div>
        <Field
          label="Payment date"
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
        />
        <Field
          label="Amount received"
          type="number"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
        />
        <button
          className="link-button"
          onClick={() => setAmount(String(remaining(entry)))}
        >
          Fill full due amount
        </button>
        <div className="modal-actions">
          <button onClick={onClose}>Cancel</button>
          <button
            className="success"
            onClick={() => void onSave(Number(amount), date)}
          >
            Save payment
          </button>
        </div>
      </section>
    </div>
  );
}
