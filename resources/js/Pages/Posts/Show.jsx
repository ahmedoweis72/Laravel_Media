import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Inertia } from "@inertiajs/inertia";
import {
  Globe,
  Clock as ClockIcon,
  CheckCircle,
  AlertCircle,
  Pencil,
  Trash2,
  Image as ImageIcon,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/Components/ui/alert-dialog";
import { useState } from "react";

function getPlatformStatusIcon(status) {
  switch (status) {
    case "pending":
      return <ClockIcon className="text-yellow-500 h-4 w-4" />;
    case "scheduled":
      return <ClockIcon className="text-blue-500 h-4 w-4" />;
    case "published":
      return <CheckCircle className="text-green-500 h-4 w-4" />;
    default:
      return <AlertCircle className="text-red-500 h-4 w-4" />;
  }
}

export default function Show({ post, authUser }) {
  const [imageError, setImageError] = useState(false);
  
  console.log('Post data:', post);
  console.log('Image URL:', post?.image_url);

  const handleDelete = () => {
    Inertia.delete(route("posts.destroy", post.id));
  };

  return (
    <AuthenticatedLayout>
      <Card className="max-w-3xl mx-auto mt-10">
        <CardHeader>
          <CardTitle className="text-3xl">{post.title}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Image Section */}
          {post?.image_url ? (
            <div className="relative rounded-lg overflow-hidden bg-muted">
              <img
                src={post.image_url}
                alt={post.title}
                className="w-full h-auto object-cover rounded-lg"
                onError={(e) => {
                  console.error('Image failed to load:', e);
                  console.error('Image URL was:', post.image_url);
                  setImageError(true);
                }}
                style={{ maxHeight: "400px" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
            </div>
          ) : (
            <div className="rounded-lg bg-muted p-8 flex flex-col items-center justify-center text-muted-foreground">
              <ImageIcon className="h-12 w-12 mb-2" />
              <p>No image available</p>
            </div>
          )}

          {/* Content Section */}
          <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none">
            <p className="text-foreground leading-relaxed whitespace-pre-wrap">
              {post.content}
            </p>
          </div>

          {/* Status Section */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">Status:</span>
              <Badge 
                variant={
                  post.status === "published" 
                    ? "success" 
                    : post.status === "scheduled" 
                    ? "warning" 
                    : "secondary"
                } 
                className="capitalize"
              >
                {post.status}
              </Badge>
            </div>

            {post.scheduled_time && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ClockIcon className="w-4 h-4" />
                <span>{new Date(post.scheduled_time).toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* Author Section */}
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium text-foreground">Author:</span>
            <span className="text-muted-foreground">
              {post.user.name} ({post.user.email})
            </span>
          </div>

          {/* Platforms Section */}
          {post.platforms.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-foreground">Platforms</h3>
              <div className="flex flex-wrap gap-2">
                {post.platforms.map((platform) => (
                  <Badge
                    key={platform.id}
                    variant="secondary"
                    className="flex items-center gap-2 px-3 py-1.5 text-sm"
                  >
                    {getPlatformStatusIcon(platform.pivot.platform_status)}
                    <Globe className="w-3 h-3" />
                    {platform.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Actions Section */}
          {authUser?.id === post.user_id && (
            <div className="flex gap-4 pt-4 border-t border-border">
              <Button
                variant="outline"
                onClick={() => Inertia.visit(route("posts.edit", post.id))}
                className="text-foreground hover:text-accent-foreground"
              >
                <Pencil className="w-4 h-4 mr-2" />
                Edit Post
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Post
                  </Button>
                </AlertDialogTrigger>

                <AlertDialogContent className="bg-background border-border">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-foreground">
                      Are you sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-muted-foreground">
                      This will permanently delete the post and cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-background text-foreground border-input">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Yes, Delete Post
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </CardContent>
      </Card>
    </AuthenticatedLayout>
  );
}
