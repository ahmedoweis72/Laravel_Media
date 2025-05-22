import ApplicationLogo from "@/Components/ApplicationLogo";
import NavLink from "@/Components/NavLink";
import { Link } from "@inertiajs/react";

export default function GuestLayout({ children }) {
    return (
        <>
            <div className="flex justify-between px-10 ">
                <div className="flex shrink-0 items-center">
                    <Link href="/">
                        <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800" />
                    </Link>
                </div>
                <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                    <NavLink
                        href={route("login")}
                        active={route().current("login")}
                    >
                        LogIn
                    </NavLink>
                    <NavLink
                        href={route("register")}
                        active={route().current("register")}
                    >
                        Register
                    </NavLink>
                </div>
            </div>
            <div className="flex min-h-screen flex-col items-center text-xl border-l bg-gray-100 pt-6 sm:justify-center ">
                <div>
                    <Link href="/">
                        <ApplicationLogo className="h-20 w-20 fill-current text-gray-500" />
                    </Link>
                </div>

                
                    {children}
                </div>
        </>
    );
}
