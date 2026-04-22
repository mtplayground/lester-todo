import type { Todo } from "../api/todos";
import TodoItem from "./TodoItem";

type TodoListProps = {
  emptyMessage: string;
  emptyTitle: string;
  todos: Todo[];
};

function TodoList({ emptyMessage, emptyTitle, todos }: TodoListProps) {
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
      {todos.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-700/80 bg-slate-950/40 px-5 py-10 text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-300">
            {emptyTitle}
          </p>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-400">
            {emptyMessage}
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {todos.map((todo) => (
            <TodoItem key={todo.id} todo={todo} />
          ))}
        </ul>
      )}
    </section>
  );
}

export default TodoList;
