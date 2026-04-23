import { useState } from "react";

import { getApiErrorMessage } from "../api/client";
import {
  useAdminStatsQuery,
  useClearCompletedTodosMutation,
  useDeleteAllTodosMutation,
} from "../api/admin";
import ErrorBanner from "../components/ErrorBanner";
import LoadingPanel from "../components/LoadingPanel";

const STAT_CARDS = [
  {
    description: "All todos currently stored in the workspace.",
    key: "total",
    label: "Total",
  },
  {
    description: "Todos that still need attention.",
    key: "active",
    label: "Active",
  },
  {
    description: "Todos already marked as done.",
    key: "completed",
    label: "Completed",
  },
] as const;

type AdminAction = "clear-completed" | "delete-all";

function formatTimestamp(timestamp: string | null): string {
  if (!timestamp) {
    return "No todos yet";
  }

  const date = new Date(`${timestamp}Z`);

  if (Number.isNaN(date.getTime())) {
    return timestamp;
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function AdminPage() {
  const adminStatsQuery = useAdminStatsQuery();
  const clearCompletedMutation = useClearCompletedTodosMutation();
  const deleteAllMutation = useDeleteAllTodosMutation();
  const [pendingAction, setPendingAction] = useState<AdminAction | null>(null);
  const actionError = clearCompletedMutation.error ?? deleteAllMutation.error;
  const actionSummary =
    clearCompletedMutation.data ?? deleteAllMutation.data ?? null;
  const isSubmittingAction =
    clearCompletedMutation.isPending || deleteAllMutation.isPending;

  async function confirmAction() {
    if (pendingAction === "clear-completed") {
      await clearCompletedMutation.mutateAsync();
      setPendingAction(null);
      return;
    }

    if (pendingAction === "delete-all") {
      await deleteAllMutation.mutateAsync();
      setPendingAction(null);
    }
  }

  if (adminStatsQuery.isLoading) {
    return <LoadingPanel label="Loading admin stats" />;
  }

  if (adminStatsQuery.error) {
    return <ErrorBanner message={getApiErrorMessage(adminStatsQuery.error)} />;
  }

  const stats = adminStatsQuery.data;

  if (!stats) {
    return <ErrorBanner message="Admin stats are unavailable right now." />;
  }

  return (
    <section className="flex flex-col gap-6">
      {actionError ? (
        <ErrorBanner message={getApiErrorMessage(actionError)} />
      ) : null}

      <section className="rounded-[2rem] border border-slate-800/80 bg-slate-900/70 p-8 shadow-2xl shadow-slate-950/30 backdrop-blur">
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-cyan-300">
          Admin
        </p>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-50">
          Workspace stats
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
          Review the current todo volume and the time range covered by the
          existing records.
        </p>
      </section>

      <section className="rounded-3xl border border-slate-800/80 bg-slate-900/70 p-5 shadow-lg shadow-slate-950/20">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-300">
              Bulk Actions
            </p>
            <h3 className="mt-2 text-xl font-semibold text-slate-100">
              Apply admin cleanup actions
            </h3>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
              Clear only completed todos or remove every todo in the workspace.
              Each action requires confirmation before it runs.
            </p>
            {actionSummary ? (
              <p className="mt-4 text-sm text-emerald-300">
                Deleted {actionSummary.deleted} todo
                {actionSummary.deleted === 1 ? "" : "s"}.
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              className="rounded-2xl border border-amber-400/50 bg-amber-500/10 px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-amber-100 transition hover:border-amber-300 hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:border-amber-900 disabled:text-amber-700"
              disabled={isSubmittingAction}
              onClick={() => setPendingAction("clear-completed")}
              type="button"
            >
              Clear Completed
            </button>
            <button
              className="rounded-2xl border border-rose-400/50 bg-rose-500/10 px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-rose-100 transition hover:border-rose-300 hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:border-rose-950 disabled:text-rose-900"
              disabled={isSubmittingAction}
              onClick={() => setPendingAction("delete-all")}
              type="button"
            >
              Delete All
            </button>
          </div>
        </div>

        {pendingAction ? (
          <div className="mt-5 rounded-2xl border border-slate-700 bg-slate-950/70 p-4">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">
              Confirm Action
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              {pendingAction === "clear-completed"
                ? "Delete every completed todo and keep active items?"
                : "Delete every todo in the workspace? This cannot be undone."}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-slate-300 transition hover:border-slate-500 hover:text-slate-100 disabled:cursor-not-allowed disabled:border-slate-800 disabled:text-slate-600"
                disabled={isSubmittingAction}
                onClick={() => setPendingAction(null)}
                type="button"
              >
                Cancel
              </button>
              <button
                className={`rounded-xl border px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em] transition disabled:cursor-not-allowed ${
                  pendingAction === "clear-completed"
                    ? "border-amber-400/50 bg-amber-500/10 text-amber-100 hover:border-amber-300 hover:bg-amber-500/20 disabled:border-amber-900 disabled:text-amber-700"
                    : "border-rose-400/50 bg-rose-500/10 text-rose-100 hover:border-rose-300 hover:bg-rose-500/20 disabled:border-rose-950 disabled:text-rose-900"
                }`}
                disabled={isSubmittingAction}
                onClick={() => void confirmAction()}
                type="button"
              >
                {isSubmittingAction ? "Working..." : "Confirm"}
              </button>
            </div>
          </div>
        ) : null}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {STAT_CARDS.map((card) => (
          <article
            className="rounded-3xl border border-slate-800/80 bg-slate-900/70 p-5 shadow-lg shadow-slate-950/20"
            key={card.key}
          >
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-300">
              {card.label}
            </p>
            <p className="mt-4 text-4xl font-semibold tracking-tight text-slate-50">
              {stats[card.key]}
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              {card.description}
            </p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-3xl border border-slate-800/80 bg-slate-900/70 p-5 shadow-lg shadow-slate-950/20">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-300">
            Oldest Todo
          </p>
          <p className="mt-4 text-2xl font-semibold tracking-tight text-slate-50">
            {formatTimestamp(stats.oldest_created_at)}
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            The earliest `created_at` value currently in the todos table.
          </p>
        </article>

        <article className="rounded-3xl border border-slate-800/80 bg-slate-900/70 p-5 shadow-lg shadow-slate-950/20">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-300">
            Newest Todo
          </p>
          <p className="mt-4 text-2xl font-semibold tracking-tight text-slate-50">
            {formatTimestamp(stats.newest_created_at)}
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            The most recent `created_at` value currently in the todos table.
          </p>
        </article>
      </section>
    </section>
  );
}

export default AdminPage;
