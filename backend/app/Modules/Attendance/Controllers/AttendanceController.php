<?php

namespace App\Modules\Attendance\Controllers;

use App\Http\Controllers\Controller;
use App\Models\AttendanceRecord;
use App\Modules\Attendance\Requests\StoreAttendanceRequest;
use App\Modules\Attendance\Requests\UpdateAttendanceRequest;
use App\Modules\Attendance\Resources\AttendanceResource;
use App\Modules\Attendance\Services\AttendanceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AttendanceController extends Controller
{
    public function __construct(private readonly AttendanceService $service) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', AttendanceRecord::class);

        $params = $request->query();

        // Employees may only see their own attendance records.
        if (auth()->user()->hasRole('employee')) {
            $params['employee_id'] = auth()->user()->employee?->id ?? 0;
        }

        return AttendanceResource::collection($this->service->list($params));
    }

    public function store(StoreAttendanceRequest $request): JsonResponse
    {
        $this->authorize('create', AttendanceRecord::class);

        $record = $this->service->create($request->validated());

        return AttendanceResource::make($record->load('employee'))->response()->setStatusCode(201);
    }

    public function show(AttendanceRecord $attendance): AttendanceResource
    {
        $this->authorize('view', $attendance);

        return AttendanceResource::make($attendance->load('employee'));
    }

    public function update(UpdateAttendanceRequest $request, AttendanceRecord $attendance): AttendanceResource
    {
        $this->authorize('update', $attendance);

        $record = $this->service->update($attendance, $request->validated());

        return AttendanceResource::make($record->load('employee'));
    }

    public function destroy(AttendanceRecord $attendance): JsonResponse
    {
        $this->authorize('delete', $attendance);

        $this->service->delete($attendance);

        return response()->json(['message' => 'Attendance record deleted successfully.']);
    }
}
