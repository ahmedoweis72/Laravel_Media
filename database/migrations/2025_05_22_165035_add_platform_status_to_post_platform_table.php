<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('post_platform', function (Blueprint $table) {
            // Since a previous migration added a status column,
            // rename that column first to avoid conflicts
            if (Schema::hasColumn('post_platform', 'status')) {
                $table->renameColumn('status', 'old_status');
            }
            
            // Add platform_status column with all possible statuses
            $table->enum('platform_status', [
                'pending',      // Initial status
                'scheduled',    // Scheduled for future publishing
                'published',    // Successfully published
                'failed',       // Failed to publish
                'validation_failed' // Failed validation for platform requirements
            ])->default('pending')->after('platform_id');
        });
    }

    public function down()
    {
        Schema::table('post_platform', function (Blueprint $table) {
            $table->dropColumn('platform_status');
            
            // Restore original column if it existed
            if (Schema::hasColumn('post_platform', 'old_status')) {
                $table->renameColumn('old_status', 'status');
            }
        });
    }
};
