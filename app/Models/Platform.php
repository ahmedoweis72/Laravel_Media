<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Platform extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'type', 'is_active', 'api_key', 'api_secret', 'access_token'];

    public function posts()
    {
        return $this->belongsToMany(Post::class, 'post_platform')
                    ->withPivot('platform_status')
                    ->withTimestamps();
    }
}