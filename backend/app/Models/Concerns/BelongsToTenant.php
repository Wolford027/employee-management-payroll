<?php

namespace App\Models\Concerns;

use Illuminate\Database\Eloquent\Builder;

trait BelongsToTenant
{
    public static function bootBelongsToTenant(): void
    {
        static::addGlobalScope('tenant', function (Builder $builder) {
            if (auth()->check() && ! is_null(auth()->user()->tenant_id)) {
                $builder->where(
                    $builder->getModel()->getTable().'.tenant_id',
                    auth()->user()->tenant_id,
                );
            }
        });

        static::creating(function (self $model) {
            if (is_null($model->tenant_id)
                && auth()->check()
                && ! is_null(auth()->user()->tenant_id)) {
                $model->tenant_id = auth()->user()->tenant_id;
            }
        });
    }
}
