import { useEffect, useRef, useState } from "react";

import { useUpdateTodoMutation, type Todo } from "../api/todos";

type TodoItemProps = {
  todo: Todo;
};

function TodoItem({ todo }: TodoItemProps) {
  const updateTodoMutation = useUpdateTodoMutation();
  const inputRef = useRef<HTMLInputElement>(null);
  const ignoreBlurRef = useRef(false);
  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(todo.title);

  useEffect(() => {
    if (!isEditing) {
      setDraftTitle(todo.title);
    }
  }, [isEditing, todo.title]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  async function submitTitle() {
    const trimmedTitle = draftTitle.trim();

    if (!trimmedTitle || trimmedTitle === todo.title) {
      setDraftTitle(todo.title);
      setIsEditing(false);
      return;
    }

    await updateTodoMutation.mutateAsync({
      id: todo.id,
      changes: {
        title: trimmedTitle,
      },
    });

    setIsEditing(false);
  }

  function cancelEditing() {
    ignoreBlurRef.current = true;
    setDraftTitle(todo.title);
    setIsEditing(false);
  }

  return (
    <li className="flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3">
      <input
        checked={todo.completed}
        className="h-5 w-5 rounded border-slate-600 bg-slate-900 text-cyan-300 accent-cyan-300"
        disabled={updateTodoMutation.isPending}
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
        {isEditing ? (
          <input
            className="w-full rounded-xl border border-cyan-400/70 bg-slate-900 px-3 py-2 text-base text-slate-100 outline-none transition"
            disabled={updateTodoMutation.isPending}
            onBlur={() => {
              if (ignoreBlurRef.current) {
                ignoreBlurRef.current = false;
                return;
              }

              void submitTitle();
            }}
            onChange={(event) => setDraftTitle(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void submitTitle();
              }

              if (event.key === "Escape") {
                event.preventDefault();
                cancelEditing();
              }
            }}
            ref={inputRef}
            value={draftTitle}
          />
        ) : (
          <button
            className={`w-full truncate text-left text-base transition ${
              todo.completed
                ? "text-slate-500 line-through"
                : "text-slate-100 hover:text-cyan-200"
            }`}
            disabled={updateTodoMutation.isPending}
            onDoubleClick={() => setIsEditing(true)}
            type="button"
          >
            {todo.title}
          </button>
        )}
      </div>
      <button
        className="rounded-xl border border-slate-700 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300 transition hover:border-cyan-400 hover:text-cyan-200 disabled:cursor-not-allowed disabled:border-slate-800 disabled:text-slate-600"
        disabled={updateTodoMutation.isPending}
        onClick={() => setIsEditing(true)}
        type="button"
      >
        Edit
      </button>
    </li>
  );
}

export default TodoItem;
