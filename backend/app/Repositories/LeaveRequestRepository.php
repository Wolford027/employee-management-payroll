<?php

namespace App\Repositories;

use App\Models\LeaveRequest;
use Illuminate\Database\Eloquent\Model;

class LeaveRequestRepository extends BaseRepository
{
    protected array $searchable = ['reason'];

    protected array $filterable = ['status', 'employee_id', 'leave_type_id'];

    protected array $with = ['employee', 'leaveType'];

    protected array $sortable = ['id', 'start_date', 'end_date', 'status', 'created_at'];

    protected string $defaultSort = 'start_date';

    protected string $defaultDirection = 'desc';

    protected function model(): Model
    {
        return new LeaveRequest;
    }
}
