<?php

namespace App\Repositories;

use App\Models\Position;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class PositionRepository extends BaseRepository
{
    protected array $searchable = ['title'];

    protected array $filterable = ['status', 'level', 'department_id'];

    protected array $with = ['department'];

    protected array $sortable = ['id', 'title', 'level', 'base_salary', 'created_at'];

    protected string $defaultSort = 'title';

    protected string $defaultDirection = 'asc';

    protected function model(): Model
    {
        return new Position;
    }

    protected function query(): Builder
    {
        return parent::query()->withCount('employees');
    }
}
