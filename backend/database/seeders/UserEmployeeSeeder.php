<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\Employee;
use App\Models\EmployeeProfile;
use App\Models\Position;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserEmployeeSeeder extends Seeder
{
    private int $sequence = 0;

    public function run(): void
    {
        $departments = Department::pluck('id', 'code'); // ['IT' => 1, ...]
        $deptCodes = $departments->keys()->all();

        // 1. Super Admin (also an IT employee so the portal works for them).
        $this->makeUserWithEmployee(
            name: 'System Administrator',
            email: 'admin@example.com',
            role: 'super-admin',
            deptCode: 'IT',
            level: 'Senior',
        );

        // 2. Two HR users.
        for ($i = 1; $i <= 2; $i++) {
            $this->makeUserWithEmployee(
                name: fake()->name(),
                email: "hr{$i}@example.com",
                role: 'hr',
                deptCode: 'HR',
                level: $i === 1 ? 'Senior' : 'Mid',
            );
        }

        // 3. Three Managers (across operational departments — using department codes).
        $managerDepts = ['IT', 'SLS', 'MKT'];
        for ($i = 1; $i <= 3; $i++) {
            $this->makeUserWithEmployee(
                name: fake()->name(),
                email: "manager{$i}@example.com",
                role: 'manager',
                deptCode: $managerDepts[$i - 1],
                level: 'Senior',
            );
        }

        // 4. Thirty employees — the first one is the documented demo login.
        $this->makeUserWithEmployee(
            name: 'Demo Employee',
            email: 'employee@example.com',
            role: 'employee',
            deptCode: 'IT',
            level: 'Junior',
        );

        for ($i = 1; $i <= 29; $i++) {
            $this->makeUserWithEmployee(
                name: fake()->name(),
                email: "employee{$i}@example.com",
                role: 'employee',
                deptCode: fake()->randomElement($deptCodes),
                level: fake()->randomElement(['Junior', 'Junior', 'Mid', 'Senior']),
            );
        }
    }

    private function makeUserWithEmployee(string $name, string $email, string $role, string $deptCode, string $level): void
    {
        $this->sequence++;

        $department = Department::where('code', $deptCode)->first();
        $position = Position::where('department_id', $department->id)->where('level', $level)->first();

        $user = User::firstOrCreate(
            ['email' => $email],
            [
                'name' => $name,
                'password' => Hash::make('password'),
                'status' => 'active',
                'email_verified_at' => now(),
            ]
        );
        $user->syncRoles([$role]);

        [$first, $last] = $this->splitName($name);
        $salary = (float) $position->base_salary + fake()->numberBetween(0, 8000);

        $employee = Employee::firstOrCreate(
            ['user_id' => $user->id],
            [
                'employee_code' => 'EMP-'.str_pad((string) $this->sequence, 5, '0', STR_PAD_LEFT),
                'department_id' => $department->id,
                'position_id' => $position->id,
                'first_name' => $first,
                'last_name' => $last,
                'email' => $email,
                'phone' => fake()->numerify('+1-###-###-####'),
                'salary' => $salary,
                'date_hired' => fake()->dateTimeBetween('-6 years', '-1 month')->format('Y-m-d'),
                'employment_type' => 'full_time',
                'status' => 'active',
            ]
        );

        EmployeeProfile::firstOrCreate(
            ['employee_id' => $employee->id],
            [
                'birth_date' => fake()->dateTimeBetween('-55 years', '-22 years')->format('Y-m-d'),
                'gender' => fake()->randomElement(['male', 'female']),
                'marital_status' => fake()->randomElement(['single', 'married']),
                'address' => fake()->streetAddress(),
                'city' => fake()->city(),
                'country' => fake()->country(),
                'emergency_contact_name' => fake()->name(),
                'emergency_contact_phone' => fake()->numerify('+1-###-###-####'),
                'bank_name' => fake()->randomElement(['First National', 'Metro Bank', 'Union Savings']),
                'bank_account_number' => fake()->numerify('##########'),
                'tax_id' => fake()->numerify('TIN-#########'),
            ]
        );
    }

    /** @return array{0:string,1:string} */
    private function splitName(string $name): array
    {
        $parts = explode(' ', trim($name), 2);

        return [$parts[0], $parts[1] ?? Str::title(fake()->lastName())];
    }
}
