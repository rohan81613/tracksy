<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create demo account (idempotent — skip if already exists)
        User::firstOrCreate(
            ['email' => 'demo@tracksy.app'],
            [
                'name'     => 'Demo User',
                'password' => bcrypt('demo1234'),
            ]
        );
    }
}
