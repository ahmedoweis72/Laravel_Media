<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('platforms', function (Blueprint $table) {
            $table->boolean('is_active')->default(true)->after('type');
            $table->string('api_key')->nullable()->after('is_active');
            $table->string('api_secret')->nullable()->after('api_key');
            $table->string('access_token')->nullable()->after('api_secret');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('platforms', function (Blueprint $table) {
            $table->dropColumn(['is_active', 'api_key', 'api_secret', 'access_token']);
        });
    }
};
