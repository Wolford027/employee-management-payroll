<?php

namespace App\Repositories;

use App\Models\Employee;
use Illuminate\Database\Eloquent\Model;

class EmployeeRepository extends BaseRepository
{
    protected array $searchable = ['first_name', 'last_name', 'email', 'employee_code', 'phone'];

    protected array $filterable = ['status', 'department_id', 'position_id', 'employment_type'];

    protected array $with = ['department', 'position'];

    protected array $sortable = ['id', 'employee_code', 'first_name', 'last_name', 'salary', 'date_hired', 'created_at'];

    protected string $defaultSort = 'created_at';

    protected function model(): Model
    {
        return new Employee;
    }
}
