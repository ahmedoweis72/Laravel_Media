import { useState, useEffect } from "react";
import { usePage } from "@inertiajs/react";
import { Inertia } from "@inertiajs/inertia";
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameDay,
    parseISO,
    isToday,
} from "date-fns";
import {
    Calendar as CalendarIcon,
    List,
    CheckCircle,
    Clock,
    XCircle,
    Sliders,
    ChevronLeft,
    ChevronRight,
    Filter,
    Eye,
} from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/Components/ui/alert-dialog";
import { Skeleton } from "@/Components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { cn } from "@/lib/utils";

export default function Dashboard({ initialPosts = [], platforms = [] }) {
    const { auth } = usePage().props;
    const [posts, setPosts] = useState(initialPosts);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [viewMode, setViewMode] = useState("calendar");
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        status: "all",
        platform: "all",
    });
    const [calendarPosts, setCalendarPosts] = useState({});
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [postToDelete, setPostToDelete] = useState(null);
    const { toast } = useToast();

    // Function to get posts from API
    const fetchPosts = async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/posts");
            const data = await response.json();
            setPosts(data);
            organizePostsByDate(data);
        } catch (error) {
            console.error("Error fetching posts:", error);
            toast({
                title: "Error",
                description: "Failed to load posts",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    // Organize posts by date for calendar view
    const organizePostsByDate = (postsData) => {
        const postsByDate = {};

        postsData.forEach((post) => {
            const date = post.scheduled_time
                ? format(new Date(post.scheduled_time), "yyyy-MM-dd")
                : format(new Date(post.created_at), "yyyy-MM-dd");

            if (!postsByDate[date]) {
                postsByDate[date] = [];
            }

            postsByDate[date].push(post);
        });

        setCalendarPosts(postsByDate);
    };

    // Filter posts based on current filters
    const getFilteredPosts = () => {
        return posts.filter((post) => {
            // Filter by status
            if (filters.status !== "all" && post.status !== filters.status) {
                return false;
            }

            // Filter by platform
            if (filters.platform !== "all") {
                const hasPlatform = post.platforms.some(
                    (platform) => platform.id === parseInt(filters.platform)
                );
                if (!hasPlatform) return false;
            }

            return true;
        });
    };

    // Get posts for a specific day
    const getPostsForDay = (day) => {
        const dateString = format(day, "yyyy-MM-dd");
        return calendarPosts[dateString] || [];
    };

    // Handle month navigation
    const prevMonth = () => {
        setCurrentMonth((prev) => {
            const newMonth = new Date(prev);
            newMonth.setMonth(newMonth.getMonth() - 1);
            return newMonth;
        });
    };

    const nextMonth = () => {
        setCurrentMonth((prev) => {
            const newMonth = new Date(prev);
            newMonth.setMonth(newMonth.getMonth() + 1);
            return newMonth;
        });
    };

    // Delete post handler
    const handleDeletePost = async (postId) => {
        try {
            await fetch(`/api/posts/${postId}`, {
                method: "DELETE",
                headers: {
                    "X-CSRF-Token": document
                        .querySelector('meta[name="csrf-token"]')
                        .getAttribute("content"),
                },
            });

            setPosts(posts.filter((post) => post.id !== postId));
            organizePostsByDate(posts.filter((post) => post.id !== postId));

            toast({
                title: "Success",
                description: "Post deleted successfully",
            });

            setDeleteDialogOpen(false);
        } catch (error) {
            console.error("Error deleting post:", error);
            toast({
                title: "Error",
                description: "Failed to delete post",
                variant: "destructive",
            });
        }
    };

    // Status badge component
    const StatusBadge = ({ status }) => {
        const statusConfig = {
            draft: {
                icon: <Clock className="w-3 h-3 mr-1" />,
                className:
                    "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-600/30",
            },
            scheduled: {
                icon: <CalendarIcon className="w-3 h-3 mr-1" />,
                className:
                    "bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-600/30",
            },
            published: {
                icon: <CheckCircle className="w-3 h-3 mr-1" />,
                className:
                    "bg-green-500/20 text-green-700 dark:text-green-400 border-green-600/30",
            },
            failed: {
                icon: <XCircle className="w-3 h-3 mr-1" />,
                className:
                    "bg-red-500/20 text-red-700 dark:text-red-400 border-red-600/30",
            },
        };

        const config = statusConfig[status] || statusConfig.draft;

        return (
            <Badge className={`flex items-center ${config.className}`}>
                {config.icon}
                <span className="capitalize">{status}</span>
            </Badge>
        );
    };

    // Load posts on component mount
    useEffect(() => {
        fetchPosts();
    }, []);

    // Re-organize posts when posts change
    useEffect(() => {
        organizePostsByDate(posts);
    }, [posts]);

    // Calculate days for the current month view
    const days = eachDayOfInterval({
        start: startOfMonth(currentMonth),
        end: endOfMonth(currentMonth),
    });

    // Render calendar view
    const renderCalendarView = () => {
        return (
            <div className="p-4 w-10/12 mx-auto">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex space-x-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={prevMonth}
                            title="Previous Month"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="text-lg font-bold">
                            {format(currentMonth, "MMMM yyyy")}
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={nextMonth}
                            title="Next Month"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                    <Button
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={() => setCurrentMonth(new Date())}
                    >
                        Today
                    </Button>
                </div>

                <div className="grid grid-cols-7 gap-px bg-border border border-border rounded-lg overflow-hidden">
                    {/* Day headers */}
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                        (day, i) => (
                            <div
                                key={day}
                                className="p-2 text-center bg-muted text-sm font-medium text-muted-foreground"
                            >
                                {day}
                            </div>
                        )
                    )}

                    {/* Calendar days */}
                    {days.map((day, i) => {
                        const dayPosts = getPostsForDay(day);
                        const isCurrentDay = isToday(day);
                        const isSelected = isSameDay(day, selectedDate);

                        return (
                            <div
                                key={i}
                                className={cn(
                                    "min-h-24 p-2 bg-card border-t border-l first:border-l-0 cursor-pointer",
                                    isCurrentDay && "bg-primary/10",
                                    isSelected &&
                                        "ring-2 ring-primary ring-inset"
                                )}
                                onClick={() => setSelectedDate(day)}
                            >
                                <div className="flex justify-between">
                                    <span
                                        className={cn(
                                            "text-sm font-medium",
                                            isCurrentDay && "text-primary"
                                        )}
                                    >
                                        {format(day, "d")}
                                    </span>

                                    {dayPosts.length > 0 && (
                                        <Badge
                                            variant="outline"
                                            className="text-xs"
                                        >
                                            {dayPosts.length}
                                        </Badge>
                                    )}
                                </div>

                                <div className="mt-1 space-y-1 max-h-20 overflow-y-auto">
                                    {dayPosts.slice(0, 3).map((post) => (
                                        <div
                                            key={post.id}
                                            className="text-xs p-1 rounded bg-muted/50 truncate cursor-pointer hover:bg-muted"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                Inertia.get(
                                                    route("posts.show", post.id)
                                                );
                                            }}
                                        >
                                            {post.title}
                                        </div>
                                    ))}

                                    {dayPosts.length > 3 && (
                                        <div className="text-xs text-muted-foreground italic">
                                            +{dayPosts.length - 3} more
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Selected day posts */}
                {getPostsForDay(selectedDate).length > 0 && (
                    <div className="mt-6">
                        <h3 className="text-lg font-medium mb-2">
                            Posts for {format(selectedDate, "MMMM d, yyyy")}
                        </h3>
                        <div className="space-y-2">
                            {getPostsForDay(selectedDate).map((post) => (
                                <Card key={post.id} className="overflow-hidden">
                                    <CardHeader className="py-3">
                                        <div className="flex justify-between items-start">
                                            <CardTitle className="text-base font-medium">
                                                {post.title}
                                            </CardTitle>
                                            <StatusBadge status={post.status} />
                                        </div>
                                    </CardHeader>
                                    <CardContent className="py-2">
                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                            {post.content}
                                        </p>
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {post.platforms.map((platform) => (
                                                <Badge
                                                    key={platform.id}
                                                    variant="outline"
                                                    className="text-xs"
                                                >
                                                    {platform.name}
                                                </Badge>
                                            ))}
                                        </div>
                                    </CardContent>
                                    <CardFooter className="pt-0 pb-3 flex justify-end gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                Inertia.get(
                                                    route("posts.show", post.id)
                                                )
                                            }
                                        >
                                            <Eye className="w-4 h-4 mr-1" />
                                            View
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                Inertia.get(
                                                    route("posts.edit", post.id)
                                                )
                                            }
                                        >
                                            Edit
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // Render list view
    // const renderListView = () => {
    //   const filteredPosts = getFilteredPosts();

    //   return (
    //     <div className="p-4 w-10/12 mx-auto">
    //       <div className="flex flex-col sm:flex-row justify-between mb-4 gap-2">
    //         <h2 className="text-xl font-bold">All Posts</h2>

    //         <div className="flex flex-wrap gap-2">
    //           <Select
    //             value={filters.status}
    //             onValueChange={(value) => setFilters({ ...filters, status: value })}
    //           >
    //             <SelectTrigger className="w-[120px]">
    //               <div className="flex items-center gap-2">
    //                 <Filter className="w-4 h-4" />
    //                 <span>Status</span>
    //               </div>
    //             </SelectTrigger>
    //             <SelectContent>
    //               <SelectItem value="all">All Status</SelectItem>
    //               <SelectItem value="draft">Draft</SelectItem>
    //               <SelectItem value="scheduled">Scheduled</SelectItem>
    //               <SelectItem value="published">Published</SelectItem>
    //             </SelectContent>
    //           </Select>

    //           <Select
    //             value={filters.platform}
    //             onValueChange={(value) => setFilters({ ...filters, platform: value })}
    //           >
    //             <SelectTrigger className="w-[150px]">
    //               <div className="flex items-center gap-2">
    //                 <Sliders className="w-4 h-4" />
    //                 <span>Platform</span>
    //               </div>
    //             </SelectTrigger>
    //             <SelectContent>
    //               <SelectItem value="all">All Platforms</SelectItem>
    //               {platforms.map(platform => (
    //                 <SelectItem key={platform.id} value={platform.id.toString()}>
    //                   {platform.name}
    //                 </SelectItem>
    //               ))}
    //             </SelectContent>
    //           </Select>
    //         </div>
    //       </div>

    //       {loading ? (
    //         <div className="space-y-4">
    //           {[1, 2, 3].map(i => (
    //             <Card key={i}>
    //               <CardHeader>
    //                 <Skeleton className="h-6 w-40" />
    //               </CardHeader>
    //               <CardContent>
    //                 <Skeleton className="h-4 w-full mb-2" />
    //                 <Skeleton className="h-4 w-3/4" />
    //               </CardContent>
    //             </Card>
    //           ))}
    //         </div>
    //       ) : filteredPosts.length === 0 ? (
    //         <div className="text-center py-12">
    //           <p className="text-muted-foreground">No posts match your filters</p>
    //         </div>
    //       ) : (
    //         <div className="space-y-4">
    //           {filteredPosts.map(post => (
    //             <Card key={post.id}>
    //               <CardHeader className="py-3">
    //                 <div className="flex justify-between items-start">
    //                   <div>
    //                     <CardTitle className="text-lg font-medium">{post.title}</CardTitle>
    //                     <CardDescription>
    //                       {post.scheduled_time ? (
    //                         <span className="text-sm">
    //                           Scheduled for {format(parseISO(post.scheduled_time), "PPp")}
    //                         </span>
    //                       ) : (
    //                         <span className="text-sm">
    //                           Created on {format(parseISO(post.created_at), "PP")}
    //                         </span>
    //                       )}
    //                     </CardDescription>
    //                   </div>
    //                   <StatusBadge status={post.status} />
    //                 </div>
    //               </CardHeader>
    //               <CardContent className="py-2">
    //                 <p className="text-sm text-muted-foreground line-clamp-3">{post.content}</p>
    //                 <div className="flex flex-wrap gap-1 mt-3">
    //                   {post.platforms.map(platform => (
    //                     <Badge key={platform.id} variant="outline">
    //                       {platform.name}
    //                     </Badge>
    //                   ))}
    //                 </div>
    //               </CardContent>
    //               <CardFooter className="flex justify-end gap-2 pt-0 pb-3">
    //                 <Button
    //                   variant="outline"
    //                   size="sm"
    //                   onClick={() => Inertia.get(route("posts.show", post.id))}
    //                 >
    //                   <Eye className="w-4 h-4 mr-1" />
    //                   View
    //                 </Button>
    //                 <Button
    //                   variant="outline"
    //                   size="sm"
    //                   onClick={() => Inertia.get(route("posts.edit", post.id))}
    //                 >
    //                   Edit
    //                 </Button>
    //                 <AlertDialogTrigger asChild>
    //                   <Button
    //                     variant="destructive"
    //                     size="sm"
    //                     onClick={() => {
    //                       setPostToDelete(post.id);
    //                       setDeleteDialogOpen(true);
    //                     }}
    //                   >
    //                     Delete
    //                   </Button>
    //                 </AlertDialogTrigger>
    //               </CardFooter>
    //             </Card>
    //           ))}
    //         </div>
    //       )}
    //     </div>
    //   );
    // };

    const DashboardContent = () => (
        <div className="space-y-6">
            {/* Filter and view toggle section */}
            <div className="flex flex-col sm:flex-row sm:justify-between space-y-4 sm:space-y-0 sm:items-center">
                <div className="flex items-center space-x-2">
                    <h2 className="text-2xl font-bold">Posts</h2>
                    <Badge variant="outline" className="ml-2">
                        {posts.length} {posts.length === 1 ? "post" : "posts"}
                    </Badge>
                </div>

                <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-3 sm:space-y-0">
                    <div className="flex space-x-2 items-center">
                        <Select
                            value={filters.status}
                            onValueChange={(value) =>
                                setFilters({ ...filters, status: value })
                            }
                        >
                            <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    All Statuses
                                </SelectItem>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="scheduled">
                                    Scheduled
                                </SelectItem>
                                <SelectItem value="published">
                                    Published
                                </SelectItem>
                                <SelectItem value="failed">Failed</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select
                            value={filters.platform}
                            onValueChange={(value) =>
                                setFilters({ ...filters, platform: value })
                            }
                        >
                            <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Platform" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    All Platforms
                                </SelectItem>
                                {platforms.map((platform) => (
                                    <SelectItem
                                        key={platform.id}
                                        value={platform.id.toString()}
                                    >
                                        {platform.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Tabs
                        value={viewMode}
                        onValueChange={setViewMode}
                        className="w-[200px]"
                    >
                        <TabsList className="w-full flex justify-center">
                            <TabsTrigger
                                value="calendar"
                                className="flex items-center gap-2 w-full justify-center"
                            >
                                <CalendarIcon className="h-4 w-4" />
                                <span>Calendar</span>
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </div>

            {/* Content based on selected view */}
            {viewMode === "calendar" ? renderCalendarView() : renderListView()}
        </div>
    );

    return (
        <DashboardLayout title="Dashboard">
            <DashboardContent />

            <AlertDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete the post.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => handleDeletePost(postToDelete)}
                            className="bg-red-500 hover:bg-red-600"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </DashboardLayout>
    );
}
