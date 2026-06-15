<?php

namespace App\Modules\Payroll\Controllers;

use App\Http\Controllers\Controller;
use App\Models\PayrollPeriod;
use App\Modules\Payroll\Requests\StorePayrollPeriodRequest;
use App\Modules\Payroll\Requests\UpdatePayrollPeriodRequest;
use App\Modules\Payroll\Resources\PayrollPeriodResource;
use App\Modules\Payroll\Services\PayrollPeriodService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PayrollPeriodController extends Controller
{
    public function __construct(private readonly PayrollPeriodService $service) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', PayrollPeriod::class);

        return PayrollPeriodResource::collection($this->service->list($request->query()));
    }

    public function store(StorePayrollPeriodRequest $request): JsonResponse
    {
        $this->authorize('create', PayrollPeriod::class);

        $period = $this->service->create($request->validated());

        return PayrollPeriodResource::make($period)->response()->setStatusCode(201);
    }

    public function show(PayrollPeriod $payrollPeriod): PayrollPeriodResource
    {
        $this->authorize('view', $payrollPeriod);

        return PayrollPeriodResource::make($payrollPeriod->loadCount('payrolls'));
    }

    public function update(UpdatePayrollPeriodRequest $request, PayrollPeriod $payrollPeriod): PayrollPeriodResource
    {
        $this->authorize('update', $payrollPeriod);

        $period = $this->service->update($payrollPeriod, $request->validated());

        return PayrollPeriodResource::make($period);
    }

    public function destroy(PayrollPeriod $payrollPeriod): JsonResponse
    {
        $this->authorize('delete', $payrollPeriod);

        $this->service->delete($payrollPeriod);

        return response()->json(['message' => 'Payroll period deleted successfully.']);
    }
}
