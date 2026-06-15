<?php

namespace App\Repositories;

use App\Models\PayrollPeriod;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class PayrollPeriodRepository extends BaseRepository
{
    protected array $searchable = ['name'];

    protected array $filterable = ['status', 'cycle'];

    protected array $sortable = ['id', 'name', 'start_date', 'end_date', 'pay_date', 'created_at'];

    protected string $defaultSort = 'start_date';

    protected string $defaultDirection = 'desc';

    protected function model(): Model
    {
        return new PayrollPeriod;
    }

    protected function query(): Builder
    {
        return parent::query()->withCount('payrolls');
    }
}
