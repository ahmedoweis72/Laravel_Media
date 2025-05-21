<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    use HasFactory;

    protected $fillable = ['title', 'content', 'image_url', 'scheduled_time', 'status', 'user_id'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function platforms()
    {
        return $this->belongsToMany(Platform::class, 'post_platform')
            ->using(PostPlatform::class)
            ->withPivot('platform_status')
            ->withTimestamps();
    }
}
