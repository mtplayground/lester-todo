type TodoFilter = "all" | "active" | "completed";

type FilterTabsProps = {
  activeFilter: TodoFilter;
  counts: Record<TodoFilter, number>;
  onChange: (filter: TodoFilter) => void;
};

const FILTER_OPTIONS: { label: string; value: TodoFilter }[] = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Completed", value: "completed" },
];

function FilterTabs({ activeFilter, counts, onChange }: FilterTabsProps) {
  return (
    <section className="rounded-3xl border border-slate-800/80 bg-slate-900/70 p-4 shadow-lg shadow-slate-950/20">
      <div className="mb-3 px-2">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-300">
          Filters
        </p>
        <h2 className="mt-2 text-xl font-semibold text-slate-100">
          Status view
        </h2>
      </div>
      <div className="flex flex-wrap gap-3">
        {FILTER_OPTIONS.map((option) => {
          const isActive = option.value === activeFilter;

          return (
            <button
              className={`inline-flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                isActive
                  ? "border-cyan-400/70 bg-cyan-400/10 text-cyan-100"
                  : "border-slate-700 bg-slate-950/60 text-slate-300 hover:border-slate-500 hover:text-slate-100"
              }`}
              key={option.value}
              onClick={() => onChange(option.value)}
              type="button"
            >
              <span>{option.label}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  isActive
                    ? "bg-cyan-300 text-slate-950"
                    : "bg-slate-800 text-slate-300"
                }`}
              >
                {counts[option.value]}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export type { TodoFilter };
export default FilterTabs;
