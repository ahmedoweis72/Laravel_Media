<?php

namespace App\Jobs;

use App\Models\Post;
use App\Services\SocialMediaPublisher;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessScheduledPosts implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $now = Carbon::now();
        
        // Find all scheduled posts due for publishing
        $duePosts = Post::where('status', 'scheduled')
                        ->where('scheduled_time', '<=', $now)
                        ->get();
        
        if ($duePosts->count() === 0) {
            Log::info('No scheduled posts due for publishing.');
            return;
        }
        
        Log::info('Processing ' . $duePosts->count() . ' scheduled posts.');
        
        foreach ($duePosts as $post) {
            try {
                // Get all platforms for this post
                $postPlatforms = $post->platforms;
                
                foreach ($postPlatforms as $platform) {
                    // Use the publisher service to publish to each platform
                    $publisher = new SocialMediaPublisher();
                    $result = $publisher->publish($post, $platform);
                    
                    // Update the pivot table with the platform status
                    $post->platforms()->updateExistingPivot(
                        $platform->id,
                        ['platform_status' => $result ? 'published' : 'failed']
                    );
                }
                
                // Update the post status
                $post->status = 'published';
                $post->save();
                
                Log::info("Published post ID {$post->id}: {$post->title}");
            } catch (\Exception $e) {
                Log::error("Error publishing post ID {$post->id}: " . $e->getMessage());
            }
        }
    }
} 