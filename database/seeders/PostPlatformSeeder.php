<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PostPlatformSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
   public function run(): void
    {
        DB::table('post_platform')->insert([
            [
                'post_id' => 1,
                'platform_id' => 1,
                'platform_status' => 'pending',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'post_id' => 1,
                'platform_id' => 2,
                'platform_status' => 'scheduled',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'post_id' => 2,
                'platform_id' => 1,
                'platform_status' => 'published',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
