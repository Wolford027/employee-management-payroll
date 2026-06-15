<?php

namespace App\Modules\Leave\Services;

use App\Models\LeaveRequest;
use App\Repositories\LeaveRequestRepository;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class LeaveService
{
    public function __construct(private readonly LeaveRequestRepository $repository) {}

    /** @param  array<string,mixed>  $params */
    public function list(array $params): LengthAwarePaginator
    {
        return $this->repository->paginate($params);
    }

    /** @param  array<string,mixed>  $data */
    public function create(array $data): LeaveRequest
    {
        $data['days'] = $data['days'] ?? $this->computeDays($data['start_date'], $data['end_date']);

        /** @var LeaveRequest */
        return $this->repository->create($data);
    }

    /** @param  array<string,mixed>  $data */
    public function update(LeaveRequest $leave, array $data): LeaveRequest
    {
        if (isset($data['start_date']) || isset($data['end_date'])) {
            $data['days'] = $data['days'] ?? $this->computeDays(
                $data['start_date'] ?? $leave->start_date->toDateString(),
                $data['end_date'] ?? $leave->end_date->toDateString(),
            );
        }

        /** @var LeaveRequest */
        return $this->repository->update($leave, $data);
    }

    public function delete(LeaveRequest $leave): void
    {
        $this->repository->delete($leave);
    }

    private function computeDays(string $start, string $end): int
    {
        return Carbon::parse($start)->diffInDays(Carbon::parse($end)) + 1;
    }
}
