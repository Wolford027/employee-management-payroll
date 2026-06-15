<?php

namespace App\Modules\Payroll\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Payroll;
use App\Models\Payslip;
use App\Modules\Payroll\Resources\PayslipResource;
use App\Modules\Payroll\Services\PayslipService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Symfony\Component\HttpFoundation\Response;

class PayslipController extends Controller
{
    public function __construct(private readonly PayslipService $service) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Payslip::class);

        $query = Payslip::with(['employee', 'payroll.period']);

        if ($employeeId = $request->query('employee_id')) {
            $query->where('employee_id', $employeeId);
        }

        $perPage = min(max((int) $request->query('per_page', 15), 1), 100);

        return PayslipResource::collection($query->latest()->paginate($perPage)->withQueryString());
    }

    public function show(Payslip $payslip): PayslipResource
    {
        $this->authorize('view', $payslip);

        return PayslipResource::make($payslip->load('employee', 'payroll.period'));
    }

    /** Generate (or regenerate) the payslip PDF for a payroll. */
    public function generate(Payroll $payroll): JsonResponse
    {
        $this->authorize('create', Payslip::class);

        $payslip = $this->service->generate($payroll);

        return PayslipResource::make($payslip->load('employee', 'payroll.period'))
            ->response()
            ->setStatusCode(201);
    }

    public function download(Payslip $payslip): Response
    {
        $this->authorize('view', $payslip);

        return $this->service->render($payslip)->download($this->service->fileName($payslip));
    }

    public function preview(Payslip $payslip): Response
    {
        $this->authorize('view', $payslip);

        return $this->service->render($payslip)->stream($this->service->fileName($payslip));
    }
}
