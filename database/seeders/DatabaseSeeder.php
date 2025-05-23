<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
   public function run(): void
{
    \App\Models\User::factory()->create(); // creates user id=1

    DB::table('platforms')->insert([
    [
        'name' => 'Facebook',
        'type' => 'social',       // <-- Add this line
        'created_at' => now(),
        'updated_at' => now(),
    ],
    [
        'name' => 'Twitter',
        'type' => 'social',       // <-- Add this line
        'created_at' => now(),
        'updated_at' => now(),
    ],
]);

    DB::table('posts')->insert([
        [
            'title' => 'First Post',
            'content' => 'Content for the first post',
            'user_id' => 1,
            'status' => 'draft',
            'created_at' => now(),
            'updated_at' => now(),
        ],
        [
            'title' => 'Second Post',
            'content' => 'Content for the second post',
            'user_id' => 1,
            'status' => 'published',
            'created_at' => now(),
            'updated_at' => now(),
        ],
    ]);

    $this->call([
        PostPlatformSeeder::class,
        PostSeeder::class,
    ]);
}

}
