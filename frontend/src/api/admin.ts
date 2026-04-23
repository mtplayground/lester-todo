import { useQuery, type UseQueryResult } from "@tanstack/react-query";

import { apiRequest } from "./client";

export type AdminStats = {
  total: number;
  active: number;
  completed: number;
  oldest_created_at: string | null;
  newest_created_at: string | null;
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
