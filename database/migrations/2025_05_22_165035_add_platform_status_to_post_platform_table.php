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
            $table->string('platform_status')->default('pending')->after('platform_id');
        });
    }

    public function down()
    {
        Schema::table('post_platform', function (Blueprint $table) {
            $table->dropColumn('platform_status');
        });
    }
};
