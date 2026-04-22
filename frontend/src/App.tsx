import TodoForm from "./components/TodoForm";
import TodoList from "./components/TodoList";
import { useCreateTodoMutation, useTodosQuery } from "./api/todos";

function App() {
  const todosQuery = useTodosQuery();
  const createTodoMutation = useCreateTodoMutation();
  const todos = todosQuery.data ?? [];

  async function handleCreateTodo(title: string) {
    await createTodoMutation.mutateAsync({ title });
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.16),_transparent_35%),linear-gradient(180deg,_#020617_0%,_#0f172a_100%)] px-6 py-12 text-slate-100">
      <section className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <header className="rounded-[2rem] border border-slate-800/80 bg-slate-900/70 p-8 shadow-2xl shadow-slate-950/30 backdrop-blur">
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-cyan-300">
            Lester Todo
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-50">
            Capture work before it slips.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
            A focused todo workspace backed by the live API. Add an item,
            review what is pending, and use the checkbox state as a quick read
            on what is already complete.
          </p>
        </header>

        <TodoForm
          isSubmitting={createTodoMutation.isPending}
          onSubmit={handleCreateTodo}
        />

        {todosQuery.isLoading ? (
          <section className="rounded-3xl border border-slate-800/80 bg-slate-900/70 p-10 text-center text-slate-300">
            Loading todos...
          </section>
        ) : (
          <TodoList todos={todos} />
        )}
      </section>
    </main>
  );
}

export default App;
