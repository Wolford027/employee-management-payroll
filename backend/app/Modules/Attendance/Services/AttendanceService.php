<?php

namespace App\Modules\Attendance\Services;

use App\Models\AttendanceRecord;
use App\Repositories\AttendanceRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class AttendanceService
{
    public function __construct(private readonly AttendanceRepository $repository) {}

    /** @param  array<string,mixed>  $params */
    public function list(array $params): LengthAwarePaginator
    {
        return $this->repository->paginate($params);
    }

    /** @param  array<string,mixed>  $data */
    public function create(array $data): AttendanceRecord
    {
        /** @var AttendanceRecord */
        return $this->repository->create($data);
    }

    /** @param  array<string,mixed>  $data */
    public function update(AttendanceRecord $record, array $data): AttendanceRecord
    {
        /** @var AttendanceRecord */
        return $this->repository->update($record, $data);
    }

    public function delete(AttendanceRecord $record): void
    {
        $this->repository->delete($record);
    }
}
