<?php

namespace App\Modules\Leave\Controllers;

use App\Http\Controllers\Controller;
use App\Models\LeaveRequest;
use App\Modules\Leave\Requests\StoreLeaveRequest;
use App\Modules\Leave\Requests\UpdateLeaveRequest;
use App\Modules\Leave\Resources\LeaveRequestResource;
use App\Modules\Leave\Services\LeaveService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class LeaveController extends Controller
{
    public function __construct(private readonly LeaveService $service) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', LeaveRequest::class);

        $params = $request->query();

        // Employees may only see their own leave requests.
        if (auth()->user()->hasRole('employee')) {
            $params['employee_id'] = auth()->user()->employee?->id ?? 0;
        }

        return LeaveRequestResource::collection($this->service->list($params));
    }

    public function store(StoreLeaveRequest $request): JsonResponse
    {
        $this->authorize('create', LeaveRequest::class);

        $leave = $this->service->create($request->validated());

        return LeaveRequestResource::make($leave->load('employee', 'leaveType'))->response()->setStatusCode(201);
    }

    public function show(LeaveRequest $leave): LeaveRequestResource
    {
        $this->authorize('view', $leave);

        return LeaveRequestResource::make($leave->load('employee', 'leaveType'));
    }

    public function update(UpdateLeaveRequest $request, LeaveRequest $leave): LeaveRequestResource
    {
        $this->authorize('update', $leave);

        $leave = $this->service->update($leave, $request->validated());

        return LeaveRequestResource::make($leave->load('employee', 'leaveType'));
    }

    public function destroy(LeaveRequest $leave): JsonResponse
    {
        $this->authorize('delete', $leave);

        $this->service->delete($leave);

        return response()->json(['message' => 'Leave request deleted successfully.']);
    }
}
