import { useEffect, useRef, useState } from "react";

import {
  useDeleteTodoMutation,
  useUpdateTodoMutation,
  type Todo,
} from "../api/todos";

type TodoItemProps = {
  todo: Todo;
};

function TodoItem({ todo }: TodoItemProps) {
  const updateTodoMutation = useUpdateTodoMutation();
  const deleteTodoMutation = useDeleteTodoMutation();
  const inputRef = useRef<HTMLInputElement>(null);
  const ignoreBlurRef = useRef(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [draftTitle, setDraftTitle] = useState(todo.title);
  const isMutating = updateTodoMutation.isPending || deleteTodoMutation.isPending;

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

  async function confirmDelete() {
    await deleteTodoMutation.mutateAsync({ id: todo.id });
    setIsConfirmingDelete(false);
  }

  return (
    <li className="flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3">
      {isConfirmingDelete ? (
        <div className="flex w-full items-center justify-between gap-4 rounded-2xl border border-rose-500/30 bg-rose-950/40 px-4 py-3">
          <p className="text-sm text-rose-100">Delete this todo?</p>
          <div className="flex items-center gap-2">
            <button
              className="rounded-xl border border-slate-700 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300 transition hover:border-slate-500 hover:text-slate-100 disabled:cursor-not-allowed disabled:border-slate-800 disabled:text-slate-600"
              disabled={isMutating}
              onClick={() => setIsConfirmingDelete(false)}
              type="button"
            >
              Cancel
            </button>
            <button
              className="rounded-xl border border-rose-400/50 bg-rose-500/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-rose-100 transition hover:border-rose-300 hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:border-rose-900 disabled:text-rose-700"
              disabled={isMutating}
              onClick={() => void confirmDelete()}
              type="button"
            >
              {deleteTodoMutation.isPending ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      ) : (
        <>
          <input
            checked={todo.completed}
            className="h-5 w-5 rounded border-slate-600 bg-slate-900 text-cyan-300 accent-cyan-300"
            disabled={isMutating}
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
                disabled={isMutating}
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
                disabled={isMutating}
                onDoubleClick={() => setIsEditing(true)}
                type="button"
              >
                {todo.title}
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              className="rounded-xl border border-slate-700 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300 transition hover:border-cyan-400 hover:text-cyan-200 disabled:cursor-not-allowed disabled:border-slate-800 disabled:text-slate-600"
              disabled={isMutating}
              onClick={() => setIsEditing(true)}
              type="button"
            >
              Edit
            </button>
            <button
              className="rounded-xl border border-rose-500/40 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-rose-200 transition hover:border-rose-300 hover:text-rose-100 disabled:cursor-not-allowed disabled:border-rose-950 disabled:text-rose-900"
              disabled={isMutating}
              onClick={() => setIsConfirmingDelete(true)}
              type="button"
            >
              Delete
            </button>
          </div>
        </>
      )}
    </li>
  );
}

export default TodoItem;
