<?php

namespace App\Modules\Payroll\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Payroll;
use App\Modules\Payroll\Requests\GeneratePayrollRequest;
use App\Modules\Payroll\Requests\StorePayrollRequest;
use App\Modules\Payroll\Requests\UpdatePayrollRequest;
use App\Modules\Payroll\Resources\PayrollResource;
use App\Modules\Payroll\Services\PayrollService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PayrollController extends Controller
{
    public function __construct(private readonly PayrollService $service) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Payroll::class);

        return PayrollResource::collection($this->service->list($request->query()));
    }

    public function store(StorePayrollRequest $request): JsonResponse
    {
        $this->authorize('create', Payroll::class);

        $payroll = $this->service->create($request->validated());

        return PayrollResource::make($payroll)->response()->setStatusCode(201);
    }

    public function show(Payroll $payroll): PayrollResource
    {
        $this->authorize('view', $payroll);

        return PayrollResource::make($payroll->load('employee', 'period', 'items', 'payslip'));
    }

    public function update(UpdatePayrollRequest $request, Payroll $payroll): PayrollResource
    {
        $this->authorize('update', $payroll);

        $payroll = $this->service->update($payroll, $request->validated());

        return PayrollResource::make($payroll);
    }

    public function destroy(Payroll $payroll): JsonResponse
    {
        $this->authorize('delete', $payroll);

        $this->service->delete($payroll);

        return response()->json(['message' => 'Payroll deleted successfully.']);
    }

    public function generate(GeneratePayrollRequest $request): JsonResponse
    {
        $this->authorize('generate', Payroll::class);

        $result = $this->service->generate($request->validated());

        return response()->json([
            'message' => "Generated {$result['generated']} payroll(s); skipped {$result['skipped']} existing.",
            ...$result,
        ]);
    }
}
