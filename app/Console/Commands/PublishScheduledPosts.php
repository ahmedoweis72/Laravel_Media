<?php

namespace App\Console\Commands;

use App\Jobs\ProcessScheduledPosts;
use Illuminate\Console\Command;

class PublishScheduledPosts extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'posts:publish-scheduled';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Publish posts that are scheduled to be posted now or in the past';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting to process scheduled posts...');
        
        // Dispatch the job to process scheduled posts
        ProcessScheduledPosts::dispatch();
        
        $this->info('Processing job has been dispatched!');
        
        return Command::SUCCESS;
    }
} 