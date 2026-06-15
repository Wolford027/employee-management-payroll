<?php

namespace App\Repositories;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

/**
 * Generic CRUD repository with search, filtering, sorting and pagination.
 * Module repositories extend this and declare their searchable/filterable columns.
 */
abstract class BaseRepository
{
    /** Columns that the `search` query param matches against (LIKE). */
    protected array $searchable = [];

    /** Columns that can be filtered by exact match via query params. */
    protected array $filterable = [];

    /** Relations eager-loaded on list/detail. */
    protected array $with = [];

    /** Columns allowed for sorting. */
    protected array $sortable = ['id', 'created_at', 'updated_at'];

    protected string $defaultSort = 'id';

    protected string $defaultDirection = 'desc';

    abstract protected function model(): Model;

    protected function query(): Builder
    {
        return $this->model()->newQuery()->with($this->with);
    }

    /**
     * Paginated, searchable, filterable listing.
     *
     * @param  array<string,mixed>  $params
     */
    public function paginate(array $params = []): LengthAwarePaginator
    {
        $query = $this->query();

        $this->applySearch($query, $params['search'] ?? null);
        $this->applyFilters($query, $params);
        $this->applySort($query, $params);

        $perPage = (int) ($params['per_page'] ?? 15);
        $perPage = max(1, min($perPage, 100));

        return $query->paginate($perPage)->withQueryString();
    }

    public function find(int $id): ?Model
    {
        return $this->query()->find($id);
    }

    public function findOrFail(int $id): Model
    {
        return $this->query()->findOrFail($id);
    }

    /** @param  array<string,mixed>  $data */
    public function create(array $data): Model
    {
        return $this->model()->newQuery()->create($data);
    }

    /** @param  array<string,mixed>  $data */
    public function update(Model $model, array $data): Model
    {
        $model->update($data);

        return $model->fresh($this->with);
    }

    public function delete(Model $model): bool
    {
        return (bool) $model->delete();
    }

    protected function applySearch(Builder $query, ?string $term): void
    {
        if (! $term || empty($this->searchable)) {
            return;
        }

        $query->where(function (Builder $q) use ($term) {
            foreach ($this->searchable as $column) {
                $q->orWhere($column, 'like', "%{$term}%");
            }
        });
    }

    /** @param  array<string,mixed>  $params */
    protected function applyFilters(Builder $query, array $params): void
    {
        foreach ($this->filterable as $column) {
            if (array_key_exists($column, $params) && $params[$column] !== null && $params[$column] !== '') {
                $query->where($column, $params[$column]);
            }
        }
    }

    /** @param  array<string,mixed>  $params */
    protected function applySort(Builder $query, array $params): void
    {
        $sort = $params['sort'] ?? $this->defaultSort;
        $direction = strtolower($params['direction'] ?? $this->defaultDirection) === 'asc' ? 'asc' : 'desc';

        if (! in_array($sort, $this->sortable, true)) {
            $sort = $this->defaultSort;
        }

        $query->orderBy($sort, $direction);
    }
}
