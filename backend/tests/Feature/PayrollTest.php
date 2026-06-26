<?php

use App\Models\Allowance;
use App\Models\Deduction;
use App\Models\Employee;
use App\Models\Payroll;
use App\Models\PayrollPeriod;
use App\Models\Payslip;

it('generates payroll for all active employees', function () {
    actingAsSuperAdmin();

    Employee::factory()->count(3)->create(['status' => 'active', 'salary' => 60000]);
    Allowance::factory()->create(['amount' => 100, 'status' => 'active']);
    Deduction::factory()->create(['amount' => 50, 'status' => 'active']);
    $period = PayrollPeriod::factory()->create(['cycle' => 'monthly']);

    $this->postJson('/api/payrolls/generate', [
        'payroll_period_id' => $period->id,
        'scope' => 'all',
    ])->assertOk()->assertJsonPath('generated', 3);

    expect(Payroll::where('payroll_period_id', $period->id)->count())->toBe(3);
});

it('does not duplicate payrolls on a second generate run', function () {
    actingAsSuperAdmin();

    Employee::factory()->count(2)->create(['status' => 'active']);
    $period = PayrollPeriod::factory()->create();

    $this->postJson('/api/payrolls/generate', ['payroll_period_id' => $period->id, 'scope' => 'all'])->assertOk();
    $this->postJson('/api/payrolls/generate', ['payroll_period_id' => $period->id, 'scope' => 'all'])
        ->assertOk()
        ->assertJsonPath('generated', 0)
        ->assertJsonPath('skipped', 2);
});

it('computes gross and net for a manual payroll', function () {
    actingAsSuperAdmin();

    $employee = Employee::factory()->create();
    $period = PayrollPeriod::factory()->create();

    $this->postJson('/api/payrolls', [
        'payroll_period_id' => $period->id,
        'employee_id' => $employee->id,
        'basic_salary' => 4000,
        'items' => [
            ['type' => 'allowance', 'label' => 'Transport', 'amount' => 200],
            ['type' => 'deduction', 'label' => 'Tax', 'amount' => 350],
        ],
    ])->assertCreated()
        ->assertJsonPath('data.gross_pay', '4200.00')
        ->assertJsonPath('data.net_pay', '3850.00');
});

it('generates a payslip PDF for a payroll', function () {
    actingAsSuperAdmin();

    $employee = Employee::factory()->create();
    $period = PayrollPeriod::factory()->create();
    $payroll = Payroll::factory()->create([
        'employee_id' => $employee->id,
        'payroll_period_id' => $period->id,
    ]);

    $this->postJson("/api/payrolls/{$payroll->id}/payslip")
        ->assertCreated()
        ->assertJsonPath('data.payroll_id', $payroll->id);

    $this->assertDatabaseHas('payslips', ['payroll_id' => $payroll->id]);
});

it('downloads a payslip as a PDF', function () {
    actingAsSuperAdmin();

    $employee = Employee::factory()->create();
    $payroll = Payroll::factory()->create(['employee_id' => $employee->id]);
    $this->postJson("/api/payrolls/{$payroll->id}/payslip")->assertCreated();

    $payslipId = Payslip::where('payroll_id', $payroll->id)->value('id');

    $response = $this->get("/api/payslips/{$payslipId}/download");
    $response->assertOk();
    expect($response->headers->get('content-type'))->toContain('application/pdf');
});
