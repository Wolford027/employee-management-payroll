<?php

namespace App\Modules\Employee\Services;

use App\Models\Employee;
use App\Models\User;
use App\Repositories\EmployeeRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class EmployeeService
{
    public function __construct(private readonly EmployeeRepository $repository) {}

    /** @param  array<string,mixed>  $params */
    public function list(array $params): LengthAwarePaginator
    {
        return $this->repository->paginate($params);
    }

    /**
     * Create an employee and automatically provision a user account.
     *
     * @param  array<string,mixed>  $data
     * @return array{employee: Employee, temp_password: string}
     */
    public function create(array $data): array
    {
        return DB::transaction(function () use ($data) {
            $profile  = $data['profile'] ?? null;
            $password = $data['password'] ?? '12345678';
            unset($data['profile'], $data['password']);

            // Bail if a user account already exists for this email.
            if (User::where('email', $data['email'])->exists()) {
                throw ValidationException::withMessages([
                    'email' => ['A user account with this email already exists.'],
                ]);
            }

            $user = User::create([
                'name'                  => trim("{$data['first_name']} {$data['last_name']}"),
                'email'                 => $data['email'],
                'password'              => Hash::make($password),
                'status'                => 'active',
                'force_password_change' => true,
            ]);
            $user->assignRole('employee');

            $data['user_id'] = $user->id;

            /** @var Employee $employee */
            $employee = $this->repository->create($data);

            if ($profile) {
                $employee->profile()->create($profile);
            }

            return [
                'employee'      => $employee->load('department', 'position', 'profile', 'user'),
                'temp_password' => $password,
            ];
        });
    }

    /** @param  array<string,mixed>  $data */
    public function update(Employee $employee, array $data): Employee
    {
        return DB::transaction(function () use ($employee, $data) {
            $profile = $data['profile'] ?? null;
            unset($data['profile'], $data['password']);

            // Keep the linked user in sync when name or email changes.
            if ($employee->user) {
                $userPatch = [];
                if (isset($data['email']) && $data['email'] !== $employee->email) {
                    $userPatch['email'] = $data['email'];
                }
                if (isset($data['first_name']) || isset($data['last_name'])) {
                    $first = $data['first_name'] ?? $employee->first_name;
                    $last  = $data['last_name']  ?? $employee->last_name;
                    $userPatch['name'] = trim("{$first} {$last}");
                }
                if ($userPatch) {
                    $employee->user->update($userPatch);
                }
            }

            $this->repository->update($employee, $data);

            if ($profile) {
                $employee->profile()->updateOrCreate(['employee_id' => $employee->id], $profile);
            }

            return $employee->fresh(['department', 'position', 'profile', 'user']);
        });
    }

    public function delete(Employee $employee): void
    {
        $this->repository->delete($employee);
    }

    /** Archive (soft state change) instead of deleting. */
    public function archive(Employee $employee): Employee
    {
        $employee->update(['status' => 'archived']);

        return $employee->fresh(['department', 'position']);
    }

    /**
     * Provision a user account for an existing employee who doesn't have one.
     *
     * @return array{employee: Employee, temp_password: string}
     */
    public function createAccount(Employee $employee): array
    {
        if ($employee->user_id) {
            throw ValidationException::withMessages([
                'account' => ['This employee already has a user account.'],
            ]);
        }

        return DB::transaction(function () use ($employee) {
            if (User::where('email', $employee->email)->exists()) {
                throw ValidationException::withMessages([
                    'email' => ['A user account with this email already exists.'],
                ]);
            }

            $password = '12345678';

            $user = User::create([
                'name'                  => $employee->full_name,
                'email'                 => $employee->email,
                'password'              => Hash::make($password),
                'status'                => 'active',
                'force_password_change' => true,
            ]);
            $user->assignRole('employee');

            $employee->update(['user_id' => $user->id]);

            return [
                'employee'      => $employee->fresh(['department', 'position', 'profile', 'user']),
                'temp_password' => $password,
            ];
        });
    }
}
