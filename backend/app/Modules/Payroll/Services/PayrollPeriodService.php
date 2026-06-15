<?php

namespace App\Modules\Payroll\Services;

use App\Models\PayrollPeriod;
use App\Repositories\PayrollPeriodRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class PayrollPeriodService
{
    public function __construct(private readonly PayrollPeriodRepository $repository) {}

    /** @param  array<string,mixed>  $params */
    public function list(array $params): LengthAwarePaginator
    {
        return $this->repository->paginate($params);
    }

    /** @param  array<string,mixed>  $data */
    public function create(array $data): PayrollPeriod
    {
        /** @var PayrollPeriod */
        return $this->repository->create($data);
    }

    /** @param  array<string,mixed>  $data */
    public function update(PayrollPeriod $period, array $data): PayrollPeriod
    {
        /** @var PayrollPeriod */
        return $this->repository->update($period, $data);
    }

    public function delete(PayrollPeriod $period): void
    {
        $this->repository->delete($period);
    }
}
