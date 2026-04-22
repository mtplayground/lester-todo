import type { Todo } from "../api/todos";
import TodoItem from "./TodoItem";

type TodoListProps = {
  todos: Todo[];
};

function TodoList({ todos }: TodoListProps) {
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
          <TodoItem key={todo.id} todo={todo} />
        ))}
      </ul>
    </section>
  );
}

export default TodoList;
