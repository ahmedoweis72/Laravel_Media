import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import axios from "axios";
import { useEffect } from "react";
import Home from "./Home";
import Posts from "./Posts";

export default function NewFeed({posts}) {
    return (
        <AuthenticatedLayout

            header={
                <h2 className="text-xl font-semibold leading-tight dark:text-gray-50 text-gray-800">
                    New Feed
                </h2>
            }
        >
            
            <Head title="New-Feed" />

            <div className="py-12">
                <Posts posts={posts}/>
            </div>
        </AuthenticatedLayout>
    );
}
