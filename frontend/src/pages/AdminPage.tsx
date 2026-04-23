import { getApiErrorMessage } from "../api/client";
import { useAdminStatsQuery } from "../api/admin";
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
