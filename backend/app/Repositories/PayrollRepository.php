<?php

namespace App\Repositories;

use App\Models\Payroll;
use Illuminate\Database\Eloquent\Model;

class PayrollRepository extends BaseRepository
{
    protected array $filterable = ['status', 'payroll_period_id', 'employee_id'];

    protected array $with = ['employee', 'period'];

    protected array $sortable = ['id', 'net_pay', 'gross_pay', 'status', 'created_at'];

    protected string $defaultSort = 'created_at';

    protected function model(): Model
    {
        return new Payroll;
    }
}
