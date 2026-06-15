<?php

namespace App\Repositories;

use App\Models\AttendanceRecord;
use Illuminate\Database\Eloquent\Model;

class AttendanceRepository extends BaseRepository
{
    protected array $searchable = ['notes'];

    protected array $filterable = ['status', 'employee_id', 'date'];

    protected array $with = ['employee'];

    protected array $sortable = ['id', 'date', 'status', 'hours_worked', 'created_at'];

    protected string $defaultSort = 'date';

    protected string $defaultDirection = 'desc';

    protected function model(): Model
    {
        return new AttendanceRecord;
    }
}
