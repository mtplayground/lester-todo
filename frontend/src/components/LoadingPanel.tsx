type LoadingPanelProps = {
  label: string;
};

function LoadingPanel({ label }: LoadingPanelProps) {
  return (
    <section className="rounded-3xl border border-slate-800/80 bg-slate-900/70 p-10 text-center text-slate-300 shadow-lg shadow-slate-950/20">
      <div className="flex flex-col items-center gap-4">
        <span className="h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-cyan-300" />
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-200">
          {label}
        </p>
      </div>
    </section>
  );
}

export default LoadingPanel;
