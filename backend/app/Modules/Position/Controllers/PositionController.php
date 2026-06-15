<?php

namespace App\Modules\Position\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Position;
use App\Modules\Position\Requests\StorePositionRequest;
use App\Modules\Position\Requests\UpdatePositionRequest;
use App\Modules\Position\Resources\PositionResource;
use App\Modules\Position\Services\PositionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PositionController extends Controller
{
    public function __construct(private readonly PositionService $service) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Position::class);

        return PositionResource::collection($this->service->list($request->query()));
    }

    public function store(StorePositionRequest $request): JsonResponse
    {
        $this->authorize('create', Position::class);

        $position = $this->service->create($request->validated());

        return PositionResource::make($position->load('department'))->response()->setStatusCode(201);
    }

    public function show(Position $position): PositionResource
    {
        $this->authorize('view', $position);

        return PositionResource::make($position->load('department')->loadCount('employees'));
    }

    public function update(UpdatePositionRequest $request, Position $position): PositionResource
    {
        $this->authorize('update', $position);

        $position = $this->service->update($position, $request->validated());

        return PositionResource::make($position->load('department'));
    }

    public function destroy(Position $position): JsonResponse
    {
        $this->authorize('delete', $position);

        $this->service->delete($position);

        return response()->json(['message' => 'Position deleted successfully.']);
    }
}
