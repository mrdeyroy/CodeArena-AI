import { useQuery } from "@tanstack/react-query";
import { fetchProblems, fetchProblemBySlug } from "@/lib/api";

export function useProblems(filters?: {
  difficulty?: string;
  topic?: string;
  company?: string;
  status?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ["problems", filters],
    queryFn: () => fetchProblems(filters),
    staleTime: 30_000,
  });
}

export function useProblem(slug: string) {
  return useQuery({
    queryKey: ["problem", slug],
    queryFn: () => fetchProblemBySlug(slug),
    enabled: !!slug,
    staleTime: 60_000,
  });
}
