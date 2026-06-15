<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Allowance extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'calculation_type',
        'amount',
        'is_taxable',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'is_taxable' => 'boolean',
        ];
    }
}
