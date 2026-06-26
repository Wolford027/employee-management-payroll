"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { teamApi } from "@/services";
import { apiErrorMessage } from "@/lib/api";

export function useTeamMembers(page = 1) {
  return useQuery({
    queryKey: ["team-members", page],
    queryFn: () => teamApi.list({ page, per_page: 15 }),
  });
}

export function useInviteTeamMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: teamApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["team-members"] });
      toast.success("Team member invited.");
    },
    onError: (e) => toast.error(apiErrorMessage(e)),
  });
}

export function useRemoveTeamMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: teamApi.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["team-members"] });
      toast.success("Team member removed.");
    },
    onError: (e) => toast.error(apiErrorMessage(e)),
  });
}
