# Template: Add API Endpoint

Use this when you need a custom action endpoint (not standard CRUD).

## Backend pattern

```php
// routes/api/{module}.php — add the route
Route::middleware('auth:sanctum')
    ->middleware('permission:create payroll')
    ->post('/payrolls/generate', [PayrollController::class, 'generate']);
```

```php
// Controller method
public function generate(GeneratePayrollRequest $request): JsonResponse
{
    $this->authorize('create', Payroll::class);
    $result = $this->service->generate($request->validated());
    return response()->json([
        'message' => 'Payrolls generated.',
        ...$result, // generated: int, skipped: int
    ]);
}
```

```php
// FormRequest
class GeneratePayrollRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'payroll_period_id' => ['required', 'integer', 'exists:payroll_periods,id'],
            'scope'             => ['required', 'in:all,employee,department'],
            'employee_id'       => ['required_if:scope,employee', 'integer', 'exists:employees,id'],
            'department_id'     => ['required_if:scope,department', 'integer', 'exists:departments,id'],
        ];
    }
}
```

## Frontend pattern

```ts
// services/index.ts — add the call
export const generatePayroll = (data: Record<string, unknown>) =>
  api.post<{ message: string; generated: number; skipped: number }>('/payrolls/generate', data)
    .then((r) => r.data);
```

```tsx
// In component
const generate = useMutation({
  mutationFn: generatePayroll,
  onSuccess: (res) => {
    queryClient.invalidateQueries({ queryKey: ['payrolls'] });
    toast.success(`${res.message} Generated: ${res.generated}, Skipped: ${res.skipped}`);
    setOpen(false);
  },
  onError: (e) => toast.error(apiErrorMessage(e)),
});
```

## File/blob endpoint

```ts
// services/index.ts
export const downloadPayslip = async (id: number): Promise<void> => {
  const res = await api.get(`/payslips/${id}/download`, { responseType: 'blob' });
  const url = URL.createObjectURL(res.data as Blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `payslip-${id}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
};

export const previewPayslip = async (id: number): Promise<void> => {
  const res = await api.get(`/payslips/${id}/preview`, { responseType: 'blob' });
  window.open(URL.createObjectURL(res.data as Blob));
};
```
