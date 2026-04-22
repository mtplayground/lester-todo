import { useState } from "react";

type TodoFormProps = {
  isSubmitting?: boolean;
  onSubmit: (title: string) => Promise<void> | void;
};

function TodoForm({ isSubmitting = false, onSubmit }: TodoFormProps) {
  const [title, setTitle] = useState("");
  const [validationError, setValidationError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setValidationError("Enter a todo title before adding it.");
      return;
    }

    setValidationError("");
    await onSubmit(trimmedTitle);
    setTitle("");
  }

  return (
    <form
      className="flex flex-col gap-3 rounded-3xl border border-slate-800/80 bg-slate-900/80 p-5 shadow-lg shadow-slate-950/30"
      onSubmit={handleSubmit}
    >
      <label className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-300">
        New Todo
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          className="min-w-0 flex-1 rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-base text-slate-100 outline-none transition focus:border-cyan-400"
          name="title"
          onChange={(event) => setTitle(event.target.value)}
          placeholder="What needs to get done?"
          value={title}
        />
        <button
          className="rounded-2xl bg-cyan-300 px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "Adding..." : "Add Todo"}
        </button>
      </div>
      {validationError ? (
        <p className="text-sm text-amber-300">{validationError}</p>
      ) : null}
    </form>
  );
}

export default TodoForm;
