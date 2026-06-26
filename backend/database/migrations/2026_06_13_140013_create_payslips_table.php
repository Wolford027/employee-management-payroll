<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payslips', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignId('payroll_id')->constrained('payrolls')->cascadeOnDelete();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->string('payslip_number')->unique();
            $table->string('file_path')->nullable();   // stored PDF path (storage/app/public/payslips/...)
            $table->timestamp('generated_at')->nullable();
            $table->timestamps();

            $table->unique('payroll_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payslips');
    }
};
