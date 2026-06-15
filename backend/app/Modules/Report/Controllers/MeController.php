<?php

namespace App\Modules\Report\Controllers;

use App\Http\Controllers\Controller;
use App\Models\AttendanceRecord;
use App\Models\LeaveRequest;
use App\Models\Payroll;
use App\Models\Payslip;
use App\Modules\Attendance\Resources\AttendanceResource;
use App\Modules\Employee\Resources\EmployeeResource;
use App\Modules\Leave\Resources\LeaveRequestResource;
use App\Modules\Payroll\Resources\PayrollResource;
use App\Modules\Payroll\Resources\PayslipResource;
use App\Modules\Report\Requests\UpdateMeRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Self-service "portal" endpoints. Any authenticated user may read their own
 * employee records here without needing module-wide view permissions.
 */
class MeController extends Controller
{
    public function employee(Request $request): JsonResponse
    {
        $employee = $request->user()->employee;

        if (! $employee) {
            return response()->json(['data' => null]);
        }

        return EmployeeResource::make($employee->load('department', 'position', 'profile'))->response();
    }

    public function updateEmployee(UpdateMeRequest $request): JsonResponse
    {
        $employee = $request->user()->employee;

        if (! $employee) {
            return response()->json(['message' => 'No employee record linked to your account.'], 422);
        }

        $data = $request->validated();

        // Update fields that live on the employee row itself.
        $employeeFields = array_intersect_key($data, array_flip(['phone']));
        if ($employeeFields) {
            $employee->update($employeeFields);
        }

        // Update (or create) the profile row.
        $profileFields = array_diff_key($data, array_flip(['phone']));
        if ($profileFields) {
            $employee->profile()->updateOrCreate(
                ['employee_id' => $employee->id],
                $profileFields
            );
        }

        return EmployeeResource::make($employee->fresh(['department', 'position', 'profile']))->response();
    }

    public function payrolls(Request $request): JsonResponse
    {
        $id = $request->user()->employee?->id;

        $payrolls = Payroll::with('period', 'payslip')
            ->where('employee_id', $id)
            ->latest()
            ->get();

        return response()->json(['data' => PayrollResource::collection($payrolls)]);
    }

    public function payslips(Request $request): JsonResponse
    {
        $id = $request->user()->employee?->id;

        $payslips = Payslip::with('payroll.period')
            ->where('employee_id', $id)
            ->latest()
            ->get();

        return response()->json(['data' => PayslipResource::collection($payslips)]);
    }

    public function leaves(Request $request): JsonResponse
    {
        $id = $request->user()->employee?->id;

        $leaves = LeaveRequest::with('leaveType')
            ->where('employee_id', $id)
            ->latest('start_date')
            ->get();

        return response()->json(['data' => LeaveRequestResource::collection($leaves)]);
    }

    public function attendance(Request $request): JsonResponse
    {
        $id = $request->user()->employee?->id;

        $records = AttendanceRecord::where('employee_id', $id)
            ->latest('date')
            ->limit(60)
            ->get();

        return response()->json(['data' => AttendanceResource::collection($records)]);
    }
}
