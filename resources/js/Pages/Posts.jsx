import { useState } from "react";
import { usePage } from "@inertiajs/react";
import { Inertia } from "@inertiajs/inertia";
import { Badge } from "../Components/ui/badge";
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from "../Components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../Components/ui/avatar";
import {
  Calendar,
  Clock as ClockIcon,
  Globe,
  CheckCircle,
  AlertCircle,
  Edit2,
  Trash,
} from "lucide-react";

function getPlatformStatusIcon(status) {
  switch (status) {
    case "pending":
      return <ClockIcon className="text-yellow-500" />;
    case "scheduled":
      return <ClockIcon className="text-blue-500" />;
    case "published":
      return <CheckCircle className="text-green-500" />;
    default:
      return <AlertCircle className="text-red-500" />;
  }
}

export default function Posts({ posts }) {
  const { auth } = usePage().props;
  const authUser = auth?.user;
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = (id) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    setDeletingId(id);

    Inertia.delete(route("posts.destroy", id), {
      onFinish: () => setDeletingId(null),
    });
  };

  return (
    <div className="w-full p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="hidden md:block">
        <Card className="sticky top-6 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-700 text-sm">Laravel-Media</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600 space-y-2">
            <p>👥 Friends Suggestions</p>
            <p>📅 Upcoming Events</p>
            <p>🎮 Games & Marketplace</p>
          </CardContent>
        </Card>
      </div>

      {/* Center: Main post feed */}
      <div className="col-span-1 md:col-span-1 space-y-4">
        {posts.map((post) => (
          <Card key={post.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div className="space-y-1">
                <CardTitle>
                  <button
                    onClick={() => Inertia.get(route("posts.show", post.id))}
                    className="text-blue-600 hover:underline cursor-pointer"
                    type="button"
                  >
                    {post.title}
                  </button>
                </CardTitle>
                <CardDescription className="line-clamp-2">
                  {post.content}
                </CardDescription>
              </div>
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={`https://i.pravatar.cc/150?u=${post.user.email}`}
                />
                <AvatarFallback>{post.user.name.charAt(0)}</AvatarFallback>
              </Avatar>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(post.created_at).toLocaleDateString()}</span>
                </div>
                {post.scheduled_time && (
                  <div className="flex items-center gap-1">
                    <ClockIcon className="h-4 w-4" />
                    <span>
                      {new Date(post.scheduled_time).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-wrap items-center gap-2 justify-between">
              <div className="flex flex-wrap gap-2">
                {post.platforms.map((platform) => (
                  <Badge key={`${post.id}-${platform.id}`} variant="outline">
                    <div className="flex items-center gap-2">
                      {getPlatformStatusIcon(platform.pivot.platform_status)}
                      <Globe className="h-3 w-3" />
                      {platform.name}
                    </div>
                  </Badge>
                ))}
              </div>

              {authUser && authUser.id === post.user.id && (
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => Inertia.get(route("posts.edit", post.id))}
                    title="Edit Post"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit2 size={20} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(post.id)}
                    disabled={deletingId === post.id}
                    title="Delete Post"
                    className={`text-red-600 hover:text-red-800 ${
                      deletingId === post.id
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    <Trash size={20} />
                  </button>
                </div>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
      <div className="hidden md:block">
        <Card className="sticky top-6 bg-gray-50">
          <CardHeader>
            <CardTitle className="text-gray-700 text-sm">Laravel-Media</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600 space-y-2">
            <p>📢 Trending News</p>
            <p>💼 Job Opportunities</p>
            <p>💬 Networking Events</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}