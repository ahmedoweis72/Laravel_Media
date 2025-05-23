<?php

namespace Database\Seeders;

use App\Models\Post;
use App\Models\User;
use App\Models\Platform;
use Illuminate\Database\Seeder;

class PostSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::all();
        $platforms = Platform::all();
        $statuses = ['draft', 'published', 'scheduled'];
        $platformStatuses = ['pending', 'scheduled', 'published', 'failed', 'validation_failed'];
        
        // Sample image URLs
        $sampleImages = [
            'https://picsum.photos/800/600',
            'https://picsum.photos/800/500',
            'https://picsum.photos/700/600',
            'https://picsum.photos/900/600',
            'https://picsum.photos/800/700',
            null // Some posts without images
        ];

        for ($i = 1; $i <= 200; $i++) {
            $status = $statuses[array_rand($statuses)];
            $scheduledTime = $status === 'scheduled' ? now()->addDays(rand(1, 30)) : null;
            
            $post = Post::create([
                'title' => "Post #{$i} " . fake()->sentence(3),
                'content' => fake()->paragraphs(rand(2, 5), true),
                'status' => $status,
                'scheduled_time' => $scheduledTime,
                'image_url' => $sampleImages[array_rand($sampleImages)],
                'user_id' => $users->random()->id,
                'created_at' => now()->subDays(rand(0, 60)),
                'updated_at' => now()->subDays(rand(0, 60)),
            ]);

            // Attach random platforms (1 to 3) to each post
            $platformCount = rand(1, 3);
            $selectedPlatforms = $platforms->random($platformCount);
            
            foreach ($selectedPlatforms as $platform) {
                $post->platforms()->attach($platform->id, [
                    'platform_status' => $platformStatuses[array_rand($platformStatuses)],
                    'created_at' => $post->created_at,
                    'updated_at' => $post->updated_at,
                ]);
            }
        }
    }
}
