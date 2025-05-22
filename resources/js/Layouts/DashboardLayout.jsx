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
import { H1, H2, P, Small } from "@/Components/Typography";

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
                    <div className="flex items-center justify-between px-4 py-2 dark-border">
                        <Link href="/" className="flex items-center">
                            <ApplicationLogo className="h-8 w-auto" />
                        </Link>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSidebarOpen(false)}
                            className="dark-hover"
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
                                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium mb-1 dark-hover",
                                    item.current
                                        ? "bg-primary text-primary-foreground"
                                        : "dark-text-secondary hover:bg-muted"
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
            <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col dark-border">
                <div className="flex min-h-0 flex-1 flex-col bg-card">
                    <div className="flex items-center justify-center h-16 dark-border">
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
                                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium mb-1 dark-hover",
                                    item.current
                                        ? "bg-primary text-primary-foreground"
                                        : "dark-text-secondary hover:bg-muted"
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
                <header className="sticky top-0 z-10 flex h-16 items-center bg-card dark-border px-4 shadow-sm">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden dark-hover"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu className="h-6 w-6" />
                        <span className="sr-only">Open sidebar</span>
                    </Button>

                    <div className="flex flex-1 items-center justify-between">
                        <H1 className="text-xl font-semibold">{title}</H1>

                        <div className="flex items-center gap-3">
                            <ThemeToggle />

                            {/* Notifications dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="dark-hover">
                                        <Bell className="h-5 w-5" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="w-64"
                                >
                                    <DropdownMenuLabel className="dark-text-primary">
                                        Notifications
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator className="dark-border" />
                                    <Small className="py-2 px-3">
                                        No new notifications
                                    </Small>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* User dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="flex items-center gap-2 relative dark-hover"
                                    >
                                        <P className="hidden md:inline-block">
                                            {user?.name}
                                        </P>
                                        <ChevronDown className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel className="dark-text-primary">
                                        My Account
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator className="dark-border" />
                                    <DropdownMenuItem className="dark-hover">
                                        <User className="mr-2 h-4 w-4" />
                                        <span>Profile</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="dark-hover">
                                        <Settings className="mr-2 h-4 w-4" />
                                        <span>Settings</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="dark-border" />
                                    <DropdownMenuItem className="dark-hover">
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Log out</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="py-6 px-4 sm:px-6 lg:px-8">{children}</main>
            </div>
        </div>
    );
}
