# Employee Module Skill

## Entities

### Employee (`employees` table)
Core domain object — one per `User` (nullable; super-admin has no Employee record).

| Column | Type | Notes |
|---|---|---|
| id | bigint PK | |
| user_id | FK nullable | links to users table |
| department_id | FK | cascadeOnDelete |
| position_id | FK nullable | |
| employee_code | string unique | EMP-00001 format |
| first_name / last_name | string | |
| email | string unique | |
| phone | string nullable | |
| hire_date | date | |
| salary | decimal(12,2) | annual |
| status | enum | active \| inactive \| terminated |
| deleted_at / timestamps | | SoftDeletes |

### EmployeeProfile (`employee_profiles` table)
Extended personal data (1:1 with Employee, created alongside).

| Column | Notes |
|---|---|
| employee_id | FK unique |
| date_of_birth | date nullable |
| gender | male \| female \| other nullable |
| address / city / state / country / postal_code | nullable |
| emergency_contact_name / phone / relation | nullable |

## Model

```php
class Employee extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id','department_id','position_id','employee_code',
        'first_name','last_name','email','phone','hire_date','salary','status',
    ];

    protected function casts(): array
    {
        return ['hire_date' => 'date', 'salary' => 'decimal:2', 'deleted_at' => 'datetime'];
    }

    // Accessor used in Resource + seeder display
    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }

    // Relations
    public function user(): BelongsTo           { return $this->belongsTo(User::class); }
    public function department(): BelongsTo     { return $this->belongsTo(Department::class); }
    public function position(): BelongsTo       { return $this->belongsTo(Position::class); }
    public function profile(): HasOne           { return $this->hasOne(EmployeeProfile::class); }
    public function attendanceRecords(): HasMany { return $this->hasMany(AttendanceRecord::class); }
    public function leaveRequests(): HasMany    { return $this->hasMany(LeaveRequest::class); }
    public function payrolls(): HasMany         { return $this->hasMany(Payroll::class); }

    public function scopeActive($q) { return $q->where('status', 'active'); }
}
```

## Repository

```php
class EmployeeRepository extends BaseRepository
{
    protected array $searchable = ['first_name', 'last_name', 'email', 'employee_code', 'phone'];
    protected array $filterable = ['status', 'department_id', 'position_id'];
    protected array $sortable   = ['first_name', 'last_name', 'hire_date', 'salary', 'created_at'];
    protected string $defaultSort = 'first_name';

    protected function model(): Model { return new Employee; }

    protected function query(): Builder
    {
        return parent::query()->with(['department', 'position', 'user']);
    }
}
```

## Service — key patterns

```php
// create: wraps Employee + EmployeeProfile in a transaction
public function create(array $data): Employee
{
    return DB::transaction(function () use ($data) {
        $profile = $data['profile'] ?? null;
        unset($data['profile']);

        $employee = Employee::create($data);
        if ($profile) $employee->profile()->create($profile);

        return $employee->load('department', 'position', 'profile');
    });
}
```

## Employee code generation

```php
// Generate next code (in EmployeeService or EmployeeDTO)
$next = (Employee::withTrashed()->max('id') ?? 0) + 1;
$code = 'EMP-' . str_pad($next, 5, '0', STR_PAD_LEFT); // EMP-00001
```

## Resource

```php
public function toArray(Request $request): array
{
    return [
        'id'            => $this->id,
        'employee_code' => $this->employee_code,
        'full_name'     => $this->full_name,      // accessor
        'first_name'    => $this->first_name,
        'last_name'     => $this->last_name,
        'email'         => $this->email,
        'phone'         => $this->phone,
        'hire_date'     => $this->hire_date?->toDateString(),
        'salary'        => (float) $this->salary,
        'status'        => $this->status,
        'department'    => $this->whenLoaded('department', fn () => [
            'id' => $this->department->id, 'name' => $this->department->name,
        ]),
        'position'      => $this->whenLoaded('position', fn () => [
            'id' => $this->position->id, 'name' => $this->position->name,
        ]),
        'profile'       => $this->whenLoaded('profile', fn () =>
            new EmployeeProfileResource($this->profile)
        ),
        'created_at'    => $this->created_at?->toISOString(),
    ];
}
```

## Routes

```
GET    /api/employees              paginated list (search/filter/sort)
POST   /api/employees              create (with optional profile)
GET    /api/employees/{id}         show (dept + position + profile)
PUT    /api/employees/{id}         update
DELETE /api/employees/{id}         soft delete

GET    /api/me/employee            employee-role portal (own record only)
```

## Permissions

```
viewAny employee → index, show
create employee  → store
update employee  → update
delete employee  → destroy
```

Employee role accesses own data via `/me/employee` — no permissions required there.

## Frontend TypeScript type

```ts
export interface Employee {
  id: number;
  employee_code: string;
  full_name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  hire_date?: string | null;
  salary: number;
  status: 'active' | 'inactive' | 'terminated';
  department?: { id: number; name: string } | null;
  position?: { id: number; name: string } | null;
  profile?: EmployeeProfile | null;
  created_at: string;
}

export interface EmployeeProfile {
  date_of_birth?: string | null;
  gender?: 'male' | 'female' | 'other' | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  emergency_contact_relation?: string | null;
}
```

## Seeder

`UserEmployeeSeeder` creates 36 users with linked employees and profiles.
Manager assignment uses department **CODES** (`IT`, `SLS`, `MKT`) not names.
