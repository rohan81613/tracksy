<?php

namespace App\Policies;

use App\Models\Renewal;
use App\Models\User;

class RenewalPolicy
{
    public function view(User $user, Renewal $renewal): bool
    {
        return $user->id === $renewal->user_id;
    }

    public function update(User $user, Renewal $renewal): bool
    {
        return $user->id === $renewal->user_id;
    }

    public function delete(User $user, Renewal $renewal): bool
    {
        return $user->id === $renewal->user_id;
    }
}
