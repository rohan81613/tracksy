<?php

namespace App\Policies;

use App\Models\Renewal;
use App\Models\User;
use App\Models\VendorEntry;

class VendorEntryPolicy
{
    public function viewAny(User $user, Renewal $renewal): bool
    {
        return $user->id === $renewal->user_id;
    }

    public function store(User $user, Renewal $renewal): bool
    {
        return $user->id === $renewal->user_id;
    }

    public function view(User $user, VendorEntry $entry): bool
    {
        return $user->id === $entry->renewal->user_id;
    }

    public function update(User $user, VendorEntry $entry): bool
    {
        return $user->id === $entry->renewal->user_id;
    }

    public function delete(User $user, VendorEntry $entry): bool
    {
        return $user->id === $entry->renewal->user_id;
    }
}
