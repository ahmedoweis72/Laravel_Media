import GuestLayout from "@/Layouts/GuestLayout";
import Posts from "./Posts";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";

export default function Home({ posts, authUser }) {
    return authUser ? (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Home
                </h2>
            }
        >
            <Head title="Home" />
            <div className="py-12">
                <Posts posts={posts} />
            </div>
        </AuthenticatedLayout>
    ) : (
        <GuestLayout>
            <Head title="Home" />
            <Posts posts={posts} />
        </GuestLayout>
    );
}
