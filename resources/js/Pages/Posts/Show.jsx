import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Inertia } from "@inertiajs/inertia";
import {
  Globe,
  Clock as ClockIcon,
  CheckCircle,
  AlertCircle,
  Pencil,
  Trash2,
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
// import { Card } from "@/Components/ui/card";

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
          <p className="text-gray-700 leading-relaxed">{post.content}</p>

          <div>
            <span className="font-semibold">Status:</span>{" "}
            <Badge variant="outline" className="capitalize">
              {post.status}
            </Badge>
          </div>

          {post.scheduled_time && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ClockIcon className="w-4 h-4" />
              <span>{new Date(post.scheduled_time).toLocaleString()}</span>
            </div>
          )}

          <div className="text-sm text-muted-foreground">
            <strong>Author:</strong> {post.user.name} ({post.user.email})
          </div>

          <div className="flex flex-wrap gap-3">
            {post.platforms.map((platform) => (
              <Badge
                key={platform.id}
                variant="secondary"
                className="flex items-center gap-2 px-3 py-1 text-sm"
              >
                {getPlatformStatusIcon(platform.pivot.platform_status)}
                <Globe className="w-3 h-3" />
                {platform.name}
              </Badge>
            ))}
          </div>

          {authUser?.id === post.user_id && (
            <div className="flex gap-4 mt-6">
              <Button
                variant="default"
                onClick={() => Inertia.visit(route("posts.edit", post.id))}
              >
                <Pencil className="w-4 h-4 mr-2" />
                Edit
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </AlertDialogTrigger>

                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete the post and cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>
                      Yes, Delete
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
