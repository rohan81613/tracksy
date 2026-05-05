<?php

namespace App\Providers;

use App\Models\VendorEntry;
use App\Policies\VendorEntryPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Gate::policy(VendorEntry::class, VendorEntryPolicy::class);
    }
}
