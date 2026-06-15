<?php

namespace App\Modules\Department\Services;

use App\Models\Department;
use App\Repositories\DepartmentRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class DepartmentService
{
    public function __construct(private readonly DepartmentRepository $repository) {}

    /** @param  array<string,mixed>  $params */
    public function list(array $params): LengthAwarePaginator
    {
        return $this->repository->paginate($params);
    }

    /** @param  array<string,mixed>  $data */
    public function create(array $data): Department
    {
        /** @var Department */
        return $this->repository->create($data);
    }

    /** @param  array<string,mixed>  $data */
    public function update(Department $department, array $data): Department
    {
        /** @var Department */
        return $this->repository->update($department, $data);
    }

    public function delete(Department $department): void
    {
        $this->repository->delete($department);
    }
}
