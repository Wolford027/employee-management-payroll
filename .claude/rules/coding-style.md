# Coding Style Rules

## PHP (Laravel)

- PHP 8.5+ syntax: readonly properties, match expressions, enums, named args
- Type-hint everything: parameters, return types, property types
- No `var_dump`, no `dd()` in committed code
- Use `array<KeyType, ValueType>` PHPDoc for complex arrays
- Run `./vendor/bin/pint` before considering PHP complete
- Imports: alphabetical, no unused imports
- Max method length: ~30 lines; extract private helpers if longer
- `DB::transaction()` for any multi-step write
- No `->get()` without pagination on potentially large tables

```php
// ✓
public function store(CreateEmployeeRequest $request): JsonResponse
{
    $employee = $this->service->create(EmployeeDTO::fromRequest($request));
    return EmployeeResource::make($employee)->response()->setStatusCode(201);
}

// ✗ — no type hints, raw request data, no resource
public function store(Request $request)
{
    $emp = Employee::create($request->all());
    return response()->json($emp);
}
```

## TypeScript (Next.js)

- Strict mode is on — no `any`, prefer `unknown` if type is truly unknown
- Always type component props explicitly (no implicit `React.FC`)
- `"use client"` at the TOP of files that use hooks/events
- No console.log in committed code
- Prefer named exports over default exports for components (except pages — Next.js requires default)
- Avoid deep nesting; extract sub-components if JSX exceeds ~80 lines
- Form payload types: use `Record<string, unknown>` when Zod coerce is involved

```ts
// ✓
export function EmployeeForm({ onSubmit, isPending }: Props) { ... }

// ✗
const EmployeeForm: React.FC<any> = (props) => { ... }
```

## CSS / Tailwind

- Tailwind for layout, spacing, flex/grid, typography scale
- Inline `style` prop for glass colors (they use rgba — Tailwind v4 can't JIT arbitrary rgba reliably)
- Never hardcode `#ffffff` or `#000000` directly — use brand tokens from `globals.css`
- Responsive: `md:` prefix for desktop-only elements (sidebar)
- No `!important`
