# Next.js Frontend Skill

## Stack
- Next.js 16 (App Router), TypeScript
- Tailwind CSS v4
- TanStack Query v5 (server state)
- Zustand + persist (client/auth state)
- React Hook Form + Zod (forms)
- Axios (HTTP) at `lib/api.ts`
- Sonner (toasts)
- Lucide React (icons)

## CRITICAL: Next.js 16 breaking changes

- Middleware file is `proxy.ts` with `export function proxy()`, NOT `middleware.ts`
- Read `node_modules/next/dist/docs/` before using any routing or middleware API

## Folder structure

```
app/
  (app)/           ← authenticated layout group
    layout.tsx     ← auth guard + AppShell
    dashboard/page.tsx
  login/page.tsx
  layout.tsx       ← root layout (Providers, bg orbs)
  globals.css

components/
  layout/AppShell.tsx   ← glass sidebar, blue + yellow theme
  layout/PageHeader.tsx
  ui/               ← glass-themed design system
  common/Field.tsx

lib/api.ts          ← Axios, Bearer interceptor, 401 handler
stores/authStore.ts ← Zustand persist
services/
  auth.ts / crud.ts / index.ts
hooks/useAuth.ts
types/index.ts
proxy.ts            ← route protection
```

## Auth flow

1. POST /api/auth/login → `{ user, token }`
2. `useAuthStore.setAuth()` → Zustand + `ems_token` cookie
3. `proxy.ts` reads `ems_token` to protect routes
4. Axios: `Authorization: Bearer <token>`
5. 401 → clear store → redirect `/login`

## Zod + React Hook Form

When using `z.coerce.number()`, cast the resolver:
```ts
resolver: zodResolver(schema) as unknown as Resolver<FormValues>
```
Mutation payload with numeric fields: `Record<string, unknown>`

## TanStack Query pattern

```ts
// list
useQuery({ queryKey: ["employees", params], queryFn: () => services.employees.list(params) })
// mutate
useMutation({
  mutationFn: services.employees.create,
  onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["employees"] }); toast.success("Created"); },
  onError: (err) => toast.error(apiErrorMessage(err)),
})
```

## Page template

```tsx
export default function ModulePage() {
  const [params, setParams] = useState({ page: 1, search: "" });
  const [open, setOpen] = useState<"create" | "edit" | null>(null);
  const [selected, setSelected] = useState<Item | null>(null);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery(...)
  return (
    <>
      <PageHeader title="..." action={<Button onClick={() => setOpen("create")}>Add</Button>} />
      {/* search + table + pagination */}
      <Dialog open={open === "create"} onClose={() => setOpen(null)} title="Add ...">
        <Form onSubmit={...} />
      </Dialog>
    </>
  );
}
```
