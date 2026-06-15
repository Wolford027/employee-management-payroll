import { api } from "@/lib/api";
import type { Paginated } from "@/types";

export type ListParams = Record<string, string | number | undefined>;

/** Generic CRUD client for a Laravel apiResource endpoint. */
export function createResource<T, Payload = Record<string, unknown>>(path: string) {
  return {
    list: (params: ListParams = {}) =>
      api.get<Paginated<T>>(`/${path}`, { params }).then((r) => r.data),

    get: (id: number | string) =>
      api.get<{ data: T }>(`/${path}/${id}`).then((r) => r.data.data),

    create: (payload: Payload) =>
      api.post<{ data: T }>(`/${path}`, payload).then((r) => r.data.data),

    // Returns the full response body — use when the endpoint wraps extra fields (e.g. account, message).
    createRaw: <R = unknown>(payload: Payload) =>
      api.post<R>(`/${path}`, payload).then((r) => r.data),

    update: (id: number | string, payload: Payload) =>
      api.put<{ data: T }>(`/${path}/${id}`, payload).then((r) => r.data.data),

    remove: (id: number | string) =>
      api.delete<{ message: string }>(`/${path}/${id}`).then((r) => r.data),
  };
}
