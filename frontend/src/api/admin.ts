import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";

import { apiRequest } from "./client";
import { todoQueryKeys } from "./todos";

export type AdminStats = {
  total: number;
  active: number;
  completed: number;
  oldest_created_at: string | null;
  newest_created_at: string | null;
};

export type BulkDeleteResult = {
  deleted: number;
};

export const adminQueryKeys = {
  stats: ["admin", "stats"] as const,
};

export function useAdminStatsQuery(): UseQueryResult<AdminStats, Error> {
  return useQuery({
    queryKey: adminQueryKeys.stats,
    queryFn: () => apiRequest<AdminStats>("/api/admin/stats"),
  });
}

export function useClearCompletedTodosMutation(): UseMutationResult<
  BulkDeleteResult,
  Error,
  void
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiRequest<BulkDeleteResult>("/api/admin/todos/completed", {
        method: "DELETE",
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.stats }),
        queryClient.invalidateQueries({ queryKey: todoQueryKeys.all }),
      ]);
    },
  });
}

export function useDeleteAllTodosMutation(): UseMutationResult<
  BulkDeleteResult,
  Error,
  void
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiRequest<BulkDeleteResult>("/api/admin/todos", {
        method: "DELETE",
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.stats }),
        queryClient.invalidateQueries({ queryKey: todoQueryKeys.all }),
      ]);
    },
  });
}
