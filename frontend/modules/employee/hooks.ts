"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { archiveEmployee, createEmployeeAccount, employeesApi } from "@/services";
import type { AccountResult } from "@/services";
import type { ListParams } from "@/services/crud";

const KEY = "employees";

export function useEmployees(params: ListParams) {
  return useQuery({
    queryKey: [KEY, params],
    queryFn: () => employeesApi.list(params),
  });
}

export function useEmployee(id: number | string) {
  return useQuery({
    queryKey: [KEY, "detail", id],
    queryFn: () => employeesApi.get(id),
    enabled: !!id,
  });
}

export function useSaveEmployee(id?: number | string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>): Promise<AccountResult> =>
      id
        ? employeesApi.update(id, payload).then((data) => ({ data, account: null as never, message: "" }))
        : (employeesApi.createRaw(payload) as Promise<AccountResult>),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useDeleteEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => employeesApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useArchiveEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => archiveEmployee(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useCreateEmployeeAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => createEmployeeAccount(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}
