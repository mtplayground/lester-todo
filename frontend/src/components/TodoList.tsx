import { useUpdateTodoMutation, type Todo } from "../api/todos";

type TodoListProps = {
  todos: Todo[];
};

function TodoList({ todos }: TodoListProps) {
  const updateTodoMutation = useUpdateTodoMutation();
  const pendingTodoId = updateTodoMutation.isPending
    ? updateTodoMutation.variables?.id
    : undefined;

  return (
    <section className="rounded-3xl border border-slate-800/80 bg-slate-900/70 p-4 shadow-lg shadow-slate-950/20">
      <div className="mb-4 flex items-center justify-between gap-4 border-b border-slate-800 px-2 pb-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-300">
            Todo List
          </p>
          <h2 className="mt-2 text-xl font-semibold text-slate-100">
            Current items
          </h2>
        </div>
        <span className="rounded-full border border-slate-700 px-3 py-1 text-sm text-slate-300">
          {todos.length} item{todos.length === 1 ? "" : "s"}
        </span>
      </div>
      <ul className="flex flex-col gap-3">
        {todos.map((todo) => (
          <li
            className="flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3"
            key={todo.id}
          >
            <input
              checked={todo.completed}
              className="h-5 w-5 rounded border-slate-600 bg-slate-900 text-cyan-300 accent-cyan-300"
              disabled={pendingTodoId === todo.id}
              onChange={() =>
                updateTodoMutation.mutate({
                  id: todo.id,
                  changes: {
                    completed: !todo.completed,
                  },
                })
              }
              type="checkbox"
            />
            <div className="min-w-0 flex-1">
              <p
                className={`truncate text-base ${
                  todo.completed
                    ? "text-slate-500 line-through"
                    : "text-slate-100"
                }`}
              >
                {todo.title}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default TodoList;
