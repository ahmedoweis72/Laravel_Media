import ApplicationLogo from "@/Components/ApplicationLogo";
import Dropdown from "@/Components/Dropdown";
import NavLink from "@/Components/NavLink";
import ResponsiveNavLink from "@/Components/ResponsiveNavLink";
import { Link, usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { Toaster, toast } from "sonner";
import { ThemeToggle } from "@/Components/ThemeToggle";

export default function AuthenticatedLayout({ header, children }) {
    // Safe access to user, fallback to null
    const { auth, flash } = usePage().props;
const user = auth?.user;

    useEffect(() => {
        if (flash.success) {
            toast.success(flash.success);
        } else if (flash.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    return (
        <>
            <Toaster position="top-right" />
            <div className="min-h-screen bg-background text-foreground">
                <nav className="border-b border-border bg-card">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 justify-between">
                            <div className="flex">
                                <div className="flex shrink-0 items-center">
                                    <Link href="/">
                                        <ApplicationLogo className="block h-9 w-auto fill-current text-foreground" />
                                    </Link>
                                </div>

                                {/* Navigation links for authenticated users */}
                                {user && (
                                    <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                                        <NavLink
                                            href={route("newFeed")}
                                            active={route().current("newFeed")}
                                        >
                                            New Feed
                                        </NavLink>
                                        <NavLink
                                            href={route("posts.create")}
                                            active={route().current(
                                                "posts.create"
                                            )}
                                        >
                                            Create Post
                                        </NavLink>
                                    </div>
                                )}
                            </div>

                            {/* Authenticated user dropdown */}
                            {user ? (
                                <div className="hidden sm:ms-6 sm:flex sm:items-center gap-2">
                                    <ThemeToggle />
                                    <div className="relative ms-3">
                                        <Dropdown>
                                            <Dropdown.Trigger>
                                                <span className="inline-flex rounded-md">
                                                    <button
                                                        type="button"
                                                        className="inline-flex items-center rounded-md border border-transparent bg-muted/50 px-3 py-2 text-sm font-medium leading-4 text-foreground transition duration-150 ease-in-out hover:bg-muted focus:outline-none"
                                                    >
                                                        {user.name}

                                                        <svg
                                                            className="-me-0.5 ms-2 h-4 w-4"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            viewBox="0 0 20 20"
                                                            fill="currentColor"
                                                        >
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                                clipRule="evenodd"
                                                            />
                                                        </svg>
                                                    </button>
                                                </span>
                                            </Dropdown.Trigger>

                                            <Dropdown.Content>
                                                <Dropdown.Link
                                                    href={route("profile.edit")}
                                                >
                                                    Profile
                                                </Dropdown.Link>
                                                <Dropdown.Link
                                                    href={route("logout")}
                                                    method="post"
                                                    as="button"
                                                >
                                                    Log Out
                                                </Dropdown.Link>
                                            </Dropdown.Content>
                                        </Dropdown>
                                    </div>
                                </div>
                            ) : (
                                // If no user (guest), show login/register links
                                <div className="hidden sm:flex sm:items-center sm:space-x-4">
                                    <ThemeToggle />
                                    <Link
                                        href={route("login")}
                                        className="text-sm text-foreground hover:text-foreground/80"
                                    >
                                        Log In
                                    </Link>
                                    <Link
                                        href={route("register")}
                                        className="text-sm text-foreground hover:text-foreground/80"
                                    >
                                        Register
                                    </Link>
                                </div>
                            )}

                            {/* Mobile menu button */}
                            <div className="-me-2 flex items-center sm:hidden">
                                <ThemeToggle />
                                <button
                                    onClick={() =>
                                        setShowingNavigationDropdown(
                                            (previousState) => !previousState
                                        )
                                    }
                                    className="inline-flex items-center justify-center rounded-md p-2 text-foreground/60 transition duration-150 ease-in-out hover:bg-muted hover:text-foreground focus:bg-muted focus:text-foreground focus:outline-none"
                                >
                                    <svg
                                        className="h-6 w-6"
                                        stroke="currentColor"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            className={
                                                !showingNavigationDropdown
                                                    ? "inline-flex"
                                                    : "hidden"
                                            }
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M4 6h16M4 12h16M4 18h16"
                                        />
                                        <path
                                            className={
                                                showingNavigationDropdown
                                                    ? "inline-flex"
                                                    : "hidden"
                                            }
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Mobile dropdown */}
                    <div
                        className={
                            (showingNavigationDropdown ? "block" : "hidden") +
                            " sm:hidden"
                        }
                    >
                        <div className="space-y-1 pb-3 pt-2">
                            {user ? (
                                <>
                                    <ResponsiveNavLink
                                        href={route("newFeed")}
                                        active={route().current("newFeed")}
                                    >
                                        New Feed
                                    </ResponsiveNavLink>
                                    <ResponsiveNavLink
                                        href={route("posts.create")}
                                        active={route().current("posts.create")}
                                    >
                                        Create Post
                                    </ResponsiveNavLink>
                                </>
                            ) : (
                                <>
                                    <ResponsiveNavLink href={route("login")}>
                                        Log In
                                    </ResponsiveNavLink>
                                    <ResponsiveNavLink href={route("register")}>
                                        Register
                                    </ResponsiveNavLink>
                                </>
                            )}
                        </div>

                        {user && (
                            <div className="border-t border-border pb-1 pt-4">
                                <div className="px-4">
                                    <div className="text-base font-medium text-foreground">
                                        {user.name}
                                    </div>
                                    <div className="text-sm font-medium text-muted-foreground">
                                        {user.email}
                                    </div>
                                </div>

                                <div className="mt-3 space-y-1">
                                    <ResponsiveNavLink
                                        href={route("profile.edit")}
                                    >
                                        Profile
                                    </ResponsiveNavLink>
                                    <ResponsiveNavLink
                                        method="post"
                                        href={route("logout")}
                                        as="button"
                                    >
                                        Log Out
                                    </ResponsiveNavLink>
                                </div>
                            </div>
                        )}
                    </div>
                </nav>

                {header && (
                    <header className="bg-card shadow">
                        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                            {header}
                        </div>
                    </header>
                )}

                <main className="py-12">{children}</main>
            </div>
        </>
    );
}
