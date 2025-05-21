<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\Pivot;

class PostPlatform extends Pivot
{
    protected $table = 'post_platform';

    protected $fillable = [
        'post_id',
        'platform_id',
        'platform_status',
    ];

    public $timestamps = true;
}
