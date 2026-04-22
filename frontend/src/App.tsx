import { useState } from "react";

import { getApiErrorMessage } from "./api/client";
import TodoForm from "./components/TodoForm";
import ErrorBanner from "./components/ErrorBanner";
import FilterTabs, { type TodoFilter } from "./components/FilterTabs";
import LoadingPanel from "./components/LoadingPanel";
import TodoList from "./components/TodoList";
import { useCreateTodoMutation, useTodosQuery } from "./api/todos";

function App() {
  const todosQuery = useTodosQuery();
  const createTodoMutation = useCreateTodoMutation();
  const todos = todosQuery.data ?? [];
  const [activeFilter, setActiveFilter] = useState<TodoFilter>("all");
  const counts = {
    all: todos.length,
    active: todos.filter((todo) => !todo.completed).length,
    completed: todos.filter((todo) => todo.completed).length,
  };
  const emptyStates = {
    all: {
      title: "No todos yet",
      message: "Add your first task above to start building your list.",
    },
    active: {
      title: "No active todos",
      message: "Everything is complete right now. Flip a task back on or add a new one.",
    },
    completed: {
      title: "Nothing completed yet",
      message: "Finish a task to see it appear in the completed view.",
    },
  };
  const filteredTodos = todos.filter((todo) => {
    if (activeFilter === "active") {
      return !todo.completed;
    }

    if (activeFilter === "completed") {
      return todo.completed;
    }

    return true;
  });

  async function handleCreateTodo(title: string) {
    await createTodoMutation.mutateAsync({ title });
  }

  const bannerMessages = [
    todosQuery.error ? getApiErrorMessage(todosQuery.error) : null,
    createTodoMutation.error ? getApiErrorMessage(createTodoMutation.error) : null,
  ].filter((message): message is string => Boolean(message));

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

        {bannerMessages.map((message) => (
          <ErrorBanner key={message} message={message} />
        ))}

        <TodoForm
          errorMessage={
            createTodoMutation.error
              ? getApiErrorMessage(createTodoMutation.error)
              : undefined
          }
          isSubmitting={createTodoMutation.isPending}
          onSubmit={handleCreateTodo}
        />

        <FilterTabs
          activeFilter={activeFilter}
          counts={counts}
          onChange={setActiveFilter}
        />

        {todosQuery.isLoading ? (
          <LoadingPanel label="Loading todos" />
        ) : (
          <TodoList
            emptyMessage={emptyStates[activeFilter].message}
            emptyTitle={emptyStates[activeFilter].title}
            todos={filteredTodos}
          />
        )}
      </section>
    </main>
  );
}

export default App;
