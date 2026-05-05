<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class RenewalFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id'       => User::factory(),
            'name'          => $this->faker->word(),
            'vendor'        => $this->faker->company(),
            'amount'        => $this->faker->randomFloat(2, 5, 500),
            'billing_cycle' => $this->faker->randomElement(['monthly', 'yearly']),
            'renewal_date'  => $this->faker->dateTimeBetween('+1 month', '+1 year')->format('Y-m-d'),
            'reminder_days' => 7,
        ];
    }
}
