<?php

namespace App\Modules\Employee\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Modules\Employee\Requests\StoreEmployeeRequest;
use App\Modules\Employee\Requests\UpdateEmployeeRequest;
use App\Modules\Employee\Resources\EmployeeResource;
use App\Modules\Employee\Services\EmployeeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class EmployeeController extends Controller
{
    public function __construct(private readonly EmployeeService $service) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Employee::class);

        return EmployeeResource::collection($this->service->list($request->query()));
    }

    public function store(StoreEmployeeRequest $request): JsonResponse
    {
        $this->authorize('create', Employee::class);

        $result = $this->service->create($request->validated());

        return response()->json([
            'data'    => EmployeeResource::make($result['employee']),
            'account' => [
                'email'         => $result['employee']->email,
                'temp_password' => $result['temp_password'],
            ],
            'message' => 'Employee created and account provisioned.',
        ], 201);
    }

    public function show(Employee $employee): EmployeeResource
    {
        $this->authorize('view', $employee);

        return EmployeeResource::make($employee->load('department', 'position', 'profile', 'user'));
    }

    public function update(UpdateEmployeeRequest $request, Employee $employee): EmployeeResource
    {
        $this->authorize('update', $employee);

        return EmployeeResource::make($this->service->update($employee, $request->validated()));
    }

    public function destroy(Employee $employee): JsonResponse
    {
        $this->authorize('delete', $employee);

        $this->service->delete($employee);

        return response()->json(['message' => 'Employee deleted successfully.']);
    }

    public function archive(Employee $employee): EmployeeResource
    {
        $this->authorize('archive', $employee);

        return EmployeeResource::make($this->service->archive($employee));
    }

    /** Provision a login account for an existing employee who doesn't have one. */
    public function createAccount(Employee $employee): JsonResponse
    {
        $this->authorize('update', $employee);

        $result = $this->service->createAccount($employee);

        return response()->json([
            'data'    => EmployeeResource::make($result['employee']),
            'account' => [
                'email'         => $result['employee']->email,
                'temp_password' => $result['temp_password'],
            ],
            'message' => 'Account created successfully.',
        ]);
    }
}
