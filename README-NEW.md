# Social Media Post Scheduler

This Laravel application allows users to create, schedule, and manage posts for various social media platforms.

## Features

- User authentication with Laravel Sanctum
- Create, read, update, and delete posts
- Schedule posts for future publication
- Support for multiple social media platforms
- Filter posts by status and date
- Platform-specific content validation
- Automatic publishing of scheduled posts

## Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/social-media-scheduler.git
cd social-media-scheduler
```

2. Install PHP dependencies
```bash
composer install
```

3. Install JavaScript dependencies
```bash
npm install
```

4. Create a copy of the environment file
```bash
cp .env.example .env
```

5. Generate an application key
```bash
php artisan key:generate
```

6. Configure your database in the `.env` file
```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=your_database_name
DB_USERNAME=your_database_username
DB_PASSWORD=your_database_password
```

7. Run the migrations
```bash
php artisan migrate
```

8. Seed the database (optional)
```bash
php artisan db:seed
```

9. Build the frontend assets
```bash
npm run dev
```

10. Start the development server
```bash
php artisan serve
```

## Scheduled Posts

To process scheduled posts automatically, you need to set up Laravel's scheduler:

1. Add the following Cron entry to your server:
```bash
* * * * * cd /path-to-your-project && php artisan schedule:run >> /dev/null 2>&1
```

2. Alternatively, for testing, you can run the scheduler manually:
```bash
php artisan schedule:run
```

3. You can also trigger the publish command manually:
```bash
php artisan posts:publish-scheduled
```

## API Endpoints

### Authentication
- `POST /api/login` - Login and get token
- `POST /api/logout` - Logout and invalidate token

### Posts
- `GET /api/posts` - Get all posts for the authenticated user
- `GET /api/posts/{post}` - Get a specific post
- `POST /api/posts` - Create a new post
- `PUT /api/posts/{post}` - Update a post
- `DELETE /api/posts/{post}` - Delete a post
- `GET /api/posts/filter/status/{status}` - Filter posts by status
- `GET /api/posts/filter/date/{date}` - Filter posts by date

### Platforms
- `GET /api/platforms` - Get all available platforms
- `GET /api/user/platforms` - Get user's active platforms
- `POST /api/user/platforms/{platform}/toggle` - Toggle platform active status

## Platform Validation

The system validates content based on platform-specific requirements:

- Twitter: Content must be 280 characters or less
- Instagram: Requires an image
- LinkedIn: Content must be 3000 characters or less
- Facebook: Content must be 63,206 characters or less

## License

This project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT). 