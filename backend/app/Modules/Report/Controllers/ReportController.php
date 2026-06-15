<?php

namespace App\Modules\Report\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Report\Services\ReportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function __construct(private readonly ReportService $service) {}

    public function dashboard(Request $request): JsonResponse
    {
        abort_unless($request->user()->can('viewAny report'), 403);

        return response()->json(['data' => $this->service->dashboard()]);
    }
}
