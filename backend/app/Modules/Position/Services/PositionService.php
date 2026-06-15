<?php

namespace App\Modules\Position\Services;

use App\Models\Position;
use App\Repositories\PositionRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class PositionService
{
    public function __construct(private readonly PositionRepository $repository) {}

    /** @param  array<string,mixed>  $params */
    public function list(array $params): LengthAwarePaginator
    {
        return $this->repository->paginate($params);
    }

    /** @param  array<string,mixed>  $data */
    public function create(array $data): Position
    {
        /** @var Position */
        return $this->repository->create($data);
    }

    /** @param  array<string,mixed>  $data */
    public function update(Position $position, array $data): Position
    {
        /** @var Position */
        return $this->repository->update($position, $data);
    }

    public function delete(Position $position): void
    {
        $this->repository->delete($position);
    }
}
