<?php

namespace App\Modules\Team\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Modules\Team\Requests\CreateTeamMemberRequest;
use App\Modules\Team\Resources\TeamMemberResource;
use App\Modules\Team\Services\TeamMemberService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class TeamMemberController extends Controller
{
    public function __construct(private readonly TeamMemberService $service) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', User::class);

        return TeamMemberResource::collection($this->service->list($request->query()));
    }

    public function store(CreateTeamMemberRequest $request): JsonResponse
    {
        $this->authorize('create', User::class);

        $member = $this->service->create($request->validated());

        return TeamMemberResource::make($member)->response()->setStatusCode(201);
    }

    public function destroy(User $teamMember): JsonResponse
    {
        if ($teamMember->tenant_id !== auth()->user()->tenant_id) {
            abort(404);
        }

        $this->authorize('delete', $teamMember);

        $this->service->delete($teamMember);

        return response()->json(['message' => 'Team member removed.']);
    }
}
