<?php

namespace App\Repositories;

use App\Models\Department;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class DepartmentRepository extends BaseRepository
{
    protected array $searchable = ['name', 'code', 'description'];

    protected array $filterable = ['status'];

    protected array $with = [];

    protected array $sortable = ['id', 'name', 'code', 'created_at'];

    protected string $defaultSort = 'name';

    protected string $defaultDirection = 'asc';

    protected function model(): Model
    {
        return new Department;
    }

    protected function query(): Builder
    {
        return parent::query()->withCount(['employees', 'positions']);
    }
}
