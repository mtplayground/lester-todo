import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";

import { apiRequest } from "./client";

export type Todo = {
  id: number;
  title: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
};

export type CreateTodoInput = {
  title: string;
};

export type UpdateTodoInput = {
  title?: string;
  completed?: boolean;
};

export const todoQueryKeys = {
  all: ["todos"] as const,
};

export function useTodosQuery(): UseQueryResult<Todo[], Error> {
  return useQuery({
    queryKey: todoQueryKeys.all,
    queryFn: () => apiRequest<Todo[]>("/api/todos"),
  });
}

export function useCreateTodoMutation(): UseMutationResult<
  Todo,
  Error,
  CreateTodoInput
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input) =>
      apiRequest<Todo, CreateTodoInput>("/api/todos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: input,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: todoQueryKeys.all });
    },
  });
}

export function useUpdateTodoMutation(): UseMutationResult<
  Todo,
  Error,
  { id: number; changes: UpdateTodoInput }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, changes }) =>
      apiRequest<Todo, UpdateTodoInput>(`/api/todos/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: changes,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: todoQueryKeys.all });
    },
  });
}

export function useDeleteTodoMutation(): UseMutationResult<
  void,
  Error,
  { id: number }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }) => {
      await apiRequest<void>(`/api/todos/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: todoQueryKeys.all });
    },
  });
}
