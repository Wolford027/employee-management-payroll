# Template: Create Full Module (Backend + Frontend)

Replace `{Name}` / `{name}` / `{names}` throughout.

## Checklist

### Backend
- [ ] Migration: `php artisan make:migration create_{names}_table`
- [ ] Model: `app/Models/{Name}.php`
- [ ] Factory: `database/factories/{Name}Factory.php`
- [ ] Seeder: `database/seeders/{Name}Seeder.php` + add to DatabaseSeeder
- [ ] DTO: `app/DTOs/{Name}DTO.php`
- [ ] Repository: `app/Repositories/{Name}Repository.php`
- [ ] Requests: `app/Modules/{Name}/Requests/Create{Name}Request.php` + Update
- [ ] Resource: `app/Modules/{Name}/Resources/{Name}Resource.php`
- [ ] Service: `app/Modules/{Name}/Services/{Name}Service.php`
- [ ] Controller: `app/Modules/{Name}/Controllers/{Name}Controller.php`
- [ ] Routes: `routes/api/{name}.php` → include in `routes/api.php`
- [ ] Permissions: add to RolePermissionSeeder
- [ ] Test: `tests/Feature/{Name}Test.php`

### Frontend
- [ ] Type in `types/index.ts`
- [ ] Service: add to `services/index.ts`
- [ ] Hook: `hooks/modules/use{Names}.ts`
- [ ] Form: `app/(app)/{names}/_components/{Name}Form.tsx`
- [ ] Page: `app/(app)/{names}/page.tsx`
- [ ] Nav: add to `components/layout/AppShell.tsx` NAV array

## Migration template

```php
Schema::create('{names}', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('status')->default('active');
    $table->softDeletes();
    $table->timestamps();
    // FK example:
    // $table->foreignId('department_id')->constrained()->cascadeOnDelete();
});
```

## Model template

```php
class {Name} extends Model
{
    use SoftDeletes;

    protected $fillable = ['name', 'status'];

    protected function casts(): array
    {
        return ['deleted_at' => 'datetime'];
    }
}
```

## Repository template

```php
class {Name}Repository extends BaseRepository
{
    protected array $searchable = ['name'];
    protected array $filterable = ['status'];
    protected array $sortable   = ['name', 'created_at'];

    protected function model(): Model { return new {Name}; }
}
```

## Service template

```php
class {Name}Service
{
    public function __construct(private readonly {Name}Repository $repository) {}

    public function list(array $params): LengthAwarePaginator
    {
        return $this->repository->paginate($params);
    }

    public function create(array $data): {Name}
    {
        return {Name}::create($data);
    }

    public function update({Name} ${name}, array $data): {Name}
    {
        ${name}->update($data);
        return ${name}->fresh();
    }

    public function delete({Name} ${name}): void
    {
        ${name}->delete();
    }
}
```

## Controller template

```php
class {Name}Controller extends Controller
{
    public function __construct(private readonly {Name}Service $service) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', {Name}::class);
        return {Name}Resource::collection($this->service->list($request->all()));
    }

    public function store(Create{Name}Request $request): JsonResponse
    {
        $this->authorize('create', {Name}::class);
        ${name} = $this->service->create($request->validated());
        return {Name}Resource::make(${name})->response()->setStatusCode(201);
    }

    public function show({Name} ${name}): JsonResponse
    {
        $this->authorize('view', ${name});
        return {Name}Resource::make(${name})->response();
    }

    public function update(Update{Name}Request $request, {Name} ${name}): JsonResponse
    {
        $this->authorize('update', ${name});
        return {Name}Resource::make($this->service->update(${name}, $request->validated()))->response();
    }

    public function destroy({Name} ${name}): Response
    {
        $this->authorize('delete', ${name});
        $this->service->delete(${name});
        return response()->noContent();
    }
}
```

## Route template

```php
// routes/api/{name}.php
Route::middleware('auth:sanctum')->group(function () {
    Route::middleware('permission:viewAny {name}')->group(function () {
        Route::get('/{names}', [{Name}Controller::class, 'index']);
        Route::get('/{names}/{name}', [{Name}Controller::class, 'show']);
    });
    Route::middleware('permission:create {name}')->post('/{names}', [{Name}Controller::class, 'store']);
    Route::middleware('permission:update {name}')->put('/{names}/{name}', [{Name}Controller::class, 'update']);
    Route::middleware('permission:delete {name}')->delete('/{names}/{name}', [{Name}Controller::class, 'destroy']);
});
```

## Pest test template

```php
// tests/Feature/{Name}Test.php
use App\Models\{Name};

beforeEach(fn () => actingAsSuperAdmin());

it('lists {names}', function () {
    {Name}::factory()->count(3)->create();
    getJson('/api/{names}')->assertOk()->assertJsonCount(3, 'data');
});

it('creates a {name}', function () {
    postJson('/api/{names}', ['name' => 'Test {Name}', 'status' => 'active'])
        ->assertCreated()
        ->assertJsonPath('data.name', 'Test {Name}');
});

it('updates a {name}', function () {
    ${name} = {Name}::factory()->create();
    putJson("/api/{names}/${name}->id", ['name' => 'Updated'])
        ->assertOk()
        ->assertJsonPath('data.name', 'Updated');
});

it('deletes a {name}', function () {
    ${name} = {Name}::factory()->create();
    deleteJson("/api/{names}/${name}->id")->assertNoContent();
    assertSoftDeleted('{names}', ['id' => ${name}->id]);
});
```
