<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payroll_periods', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('cycle')->default('monthly')->index(); // weekly | biweekly | semi_monthly | monthly
            $table->date('start_date');
            $table->date('end_date');
            $table->date('pay_date')->nullable();
            $table->string('status')->default('draft')->index();  // draft | processing | completed | closed
            $table->timestamps();

            $table->index(['start_date', 'end_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payroll_periods');
    }
};
