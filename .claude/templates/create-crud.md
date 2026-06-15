# Template: Quick CRUD Reference

## Minimum viable backend CRUD

### 1. Migration
```php
Schema::create('{names}', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('code')->unique()->nullable();
    $table->text('description')->nullable();
    $table->string('status')->default('active');
    $table->softDeletes();
    $table->timestamps();
});
```

### 2. Model
```php
class {Name} extends Model {
    use SoftDeletes;
    protected $fillable = ['name', 'code', 'description', 'status'];
}
```

### 3. Repository
```php
class {Name}Repository extends BaseRepository {
    protected array $searchable = ['name', 'code'];
    protected array $filterable = ['status'];
    protected array $sortable   = ['name', 'created_at'];
    protected function model(): Model { return new {Name}; }
}
```

### 4. Resource
```php
class {Name}Resource extends JsonResource {
    public function toArray(Request $request): array {
        return [
            'id'          => $this->id,
            'name'        => $this->name,
            'code'        => $this->code,
            'description' => $this->description,
            'status'      => $this->status,
            'created_at'  => $this->created_at?->toISOString(),
        ];
    }
}
```

### 5. Requests
```php
// Create{Name}Request
public function rules(): array {
    return [
        'name'   => ['required', 'string', 'max:255'],
        'code'   => ['nullable', 'string', 'max:20', 'unique:{names},code'],
        'status' => ['sometimes', 'in:active,inactive'],
    ];
}

// Update{Name}Request
public function rules(): array {
    return [
        'name'   => ['sometimes', 'string', 'max:255'],
        'code'   => ['nullable', 'string', 'max:20', Rule::unique('{names}', 'code')->ignore($this->route('{name}'))],
        'status' => ['sometimes', 'in:active,inactive'],
    ];
}
```

### 6. Controller (thin)
```php
class {Name}Controller extends Controller {
    public function __construct(private {Name}Service $service) {}

    public function index(Request $r): AnonymousResourceCollection {
        $this->authorize('viewAny', {Name}::class);
        return {Name}Resource::collection($this->service->list($r->all()));
    }
    public function store(Create{Name}Request $r): JsonResponse {
        $this->authorize('create', {Name}::class);
        return {Name}Resource::make($this->service->create($r->validated()))->response()->setStatusCode(201);
    }
    public function show({Name} $item): JsonResponse {
        $this->authorize('view', $item);
        return {Name}Resource::make($item)->response();
    }
    public function update(Update{Name}Request $r, {Name} $item): JsonResponse {
        $this->authorize('update', $item);
        return {Name}Resource::make($this->service->update($item, $r->validated()))->response();
    }
    public function destroy({Name} $item): Response {
        $this->authorize('delete', $item);
        $this->service->delete($item);
        return response()->noContent();
    }
}
```

## Minimum viable frontend CRUD

### TypeScript type
```ts
// types/index.ts
export interface {Name} {
  id: number;
  name: string;
  code?: string | null;
  status: string;
  created_at: string;
}
```

### Service registration
```ts
// services/index.ts
export const {names} = createResource<{Name}>('/{names}');
```

### Key queries/mutations
```ts
// list (paginated)
useQuery({ queryKey: ['{names}', params], queryFn: () => {names}.list(params) })

// create
useMutation({ mutationFn: (d: Record<string,unknown>) => {names}.create(d) })

// update
useMutation({ mutationFn: ({id, data}: {id:number, data:Record<string,unknown>}) => {names}.update(id, data) })

// delete
useMutation({ mutationFn: (id: number) => {names}.remove(id) })
```
