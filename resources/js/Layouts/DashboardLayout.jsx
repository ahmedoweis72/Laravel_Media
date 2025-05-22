import { useState, useEffect } from "react";
import { Link, usePage } from "@inertiajs/react";
import {
    LayoutDashboard,
    Settings,
    PlusCircle,
    Menu,
    X,
    ChevronDown,
    LogOut,
    User,
    Bell,
} from "lucide-react";
import ApplicationLogo from "@/Components/ApplicationLogo";
import { ThemeToggle } from "@/Components/ThemeToggle";
import { Button } from "@/Components/ui/button";
import { Toaster, toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/Components/dropdown-menu";


export default function DashboardLayout({ title, children }) {
    const { auth, flash } = usePage().props;
    const user = auth?.user;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (flash.success) {
            toast.success(flash.success);
        } else if (flash.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    const navigation = [
        {
            name: "Dashboard",
            href: route("dashboard"),
            icon: LayoutDashboard,
            current: route().current("dashboard"),
        },
        {
            name: "Create Post",
            href: route("posts.create"),
            icon: PlusCircle,
            current: route().current("posts.create"),
        },
        {
            name: "Settings",
            href: route("settings"),
            icon: Settings,
            current: route().current("settings"),
        },
    ];

    return (
        <div className="min-h-screen bg-background">
            <Toaster position="top-right" />

            {/* Mobile sidebar */}
            <div
                className={`fixed inset-0 z-40 lg:hidden ${
                    sidebarOpen ? "block" : "hidden"
                }`}
            >
                {/* Sidebar overlay */}
                <div
                    className="fixed inset-0 bg-muted/80"
                    onClick={() => setSidebarOpen(false)}
                ></div>

                {/* Sidebar panel */}
                <div className="fixed inset-y-0 left-0 flex w-full max-w-xs flex-col bg-card">
                    <div className="flex items-center justify-between px-4 py-2 border-b border-border">
                        <Link href="/" className="flex items-center">
                            <ApplicationLogo className="h-8 w-auto" />
                        </Link>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSidebarOpen(false)}
                        >
                            <X className="h-5 w-5" />
                            <span className="sr-only">Close sidebar</span>
                        </Button>
                    </div>

                    {/* Mobile navigation */}
                    <nav className="flex-1 overflow-y-auto px-2 py-4">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium mb-1",
                                    item.current
                                        ? "bg-primary text-primary-foreground"
                                        : "text-foreground hover:bg-muted"
                                )}
                            >
                                <item.icon className="h-5 w-5 flex-shrink-0" />
                                {item.name}
                            </Link>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Static sidebar for desktop */}
            <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col border-r border-border">
                <div className="flex min-h-0 flex-1 flex-col bg-card">
                    <div className="flex items-center justify-center h-16 border-b border-border">
                        <Link href="/" className="flex items-center">
                            <ApplicationLogo className="h-8 w-auto" />
                        </Link>
                    </div>

                    {/* Desktop navigation */}
                    <nav className="flex-1 overflow-y-auto px-3 py-4">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium mb-1",
                                    item.current
                                        ? "bg-primary text-primary-foreground"
                                        : "text-foreground hover:bg-muted"
                                )}
                            >
                                <item.icon className="h-5 w-5 flex-shrink-0" />
                                {item.name}
                            </Link>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Main content */}
            <div className="lg:pl-64">
                {/* Top navigation bar */}
                <header className="sticky top-0 z-10 flex h-16 items-center bg-card border-b border-border px-4 shadow-sm">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu className="h-6 w-6" />
                        <span className="sr-only">Open sidebar</span>
                    </Button>

                    <div className="flex flex-1 items-center justify-between">
                        <h1 className="text-xl font-semibold">{title}</h1>

                        <div className="flex items-center gap-3">
                            <ThemeToggle />

                            {/* Notifications dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <Bell className="h-5 w-5" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="w-64"
                                >
                                    <DropdownMenuLabel>
                                        Notifications
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <div className="py-2 px-3 text-sm text-muted-foreground">
                                        No new notifications
                                    </div>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* User dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="flex items-center gap-2 relative"
                                    >
                                        <span className="hidden md:inline-block">
                                            {user?.name}
                                        </span>
                                        <ChevronDown className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>
                                        My Account
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link
                                            href={route("profile.edit")}
                                            className="cursor-pointer"
                                        >
                                            <User className="h-4 w-4 mr-2" />
                                            Profile
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link
                                            href={route("logout")}
                                            method="post"
                                            as="button"
                                            className="w-full cursor-pointer"
                                        >
                                            <LogOut className="h-4 w-4 mr-2" />
                                            Log Out
                                        </Link>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </header>

                {/* Main content area */}
                <main className="py-6 px-4 sm:px-6 lg:px-8">{children}</main>
            </div>
        </div>
    );
}
