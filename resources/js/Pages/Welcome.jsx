import { useEffect, useState } from "react";
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
import { Calendar, Clock as ClockIcon, Globe, CheckCircle, AlertCircle } from "lucide-react";
import axios from "axios";

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

export default function Welcome() {
  const [posts, setPosts] = useState([]);

  const getPosts = async () => {
    try {
      const { data } = await axios.get("http://127.0.0.1:8000/api/posts");
      setPosts(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getPosts();
  }, []);

  return (
    <div className="w-10/12 mx-auto grid gap-4 p-10">
      {posts.map((post) => (
        <Card key={post.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                {post.title}
              </CardTitle>
              <CardDescription className="line-clamp-2">{post.content}</CardDescription>
            </div>
            <Avatar className="h-10 w-10">
              <AvatarImage src={`https://i.pravatar.cc/150?u=${post.user.email}`} />
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
                  <span>{new Date(post.scheduled_time).toLocaleString()}</span>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-wrap gap-2">
            {post.platforms.map((platform) => (
              <Badge key={`${post.id}-${platform.id}`} variant="outline">
                <div className="flex items-center gap-2">
                  {getPlatformStatusIcon(platform.pivot.platform_status)}
                  <Globe className="h-3 w-3" />
                  {platform.name}
                </div>
              </Badge>
            ))}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
