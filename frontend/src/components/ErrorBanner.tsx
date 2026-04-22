type ErrorBannerProps = {
  message: string;
};

function ErrorBanner({ message }: ErrorBannerProps) {
  return (
    <section className="rounded-3xl border border-rose-500/30 bg-rose-950/40 p-4 text-rose-100 shadow-lg shadow-rose-950/10">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-rose-300">
        API Error
      </p>
      <p className="mt-2 text-sm leading-6">{message}</p>
    </section>
  );
}

export default ErrorBanner;
