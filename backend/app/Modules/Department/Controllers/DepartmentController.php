<?php

namespace App\Modules\Department\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Modules\Department\Requests\StoreDepartmentRequest;
use App\Modules\Department\Requests\UpdateDepartmentRequest;
use App\Modules\Department\Resources\DepartmentResource;
use App\Modules\Department\Services\DepartmentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class DepartmentController extends Controller
{
    public function __construct(private readonly DepartmentService $service) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Department::class);

        return DepartmentResource::collection(
            $this->service->list($request->query())
        );
    }

    public function store(StoreDepartmentRequest $request): JsonResponse
    {
        $this->authorize('create', Department::class);

        $department = $this->service->create($request->validated());

        return DepartmentResource::make($department)
            ->response()
            ->setStatusCode(201);
    }

    public function show(Department $department): DepartmentResource
    {
        $this->authorize('view', $department);

        $department->loadCount(['employees', 'positions']);

        return DepartmentResource::make($department);
    }

    public function update(UpdateDepartmentRequest $request, Department $department): DepartmentResource
    {
        $this->authorize('update', $department);

        $department = $this->service->update($department, $request->validated());

        return DepartmentResource::make($department);
    }

    public function destroy(Department $department): JsonResponse
    {
        $this->authorize('delete', $department);

        $this->service->delete($department);

        return response()->json(['message' => 'Department deleted successfully.']);
    }
}
