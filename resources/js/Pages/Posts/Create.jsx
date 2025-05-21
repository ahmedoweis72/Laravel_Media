import { useState } from "react";
import { Inertia } from "@inertiajs/inertia";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

export default function Create({ platforms }) {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [status, setStatus] = useState("draft");
    const [selectedPlatforms, setSelectedPlatforms] = useState([]);
    const [errors, setErrors] = useState({});

    const togglePlatform = (id) => {
        if (selectedPlatforms.includes(id)) {
            setSelectedPlatforms(selectedPlatforms.filter((p) => p !== id));
        } else {
            setSelectedPlatforms([...selectedPlatforms, id]);
        }
    };

    const submit = (e) => {
        e.preventDefault();

        Inertia.post(
            route("posts.store"),
            {
                title,
                content,
                status,
                platform_ids: selectedPlatforms,
            },
            {
                onError: (errs) => setErrors(errs),
            }
        );
    };

    return (
        <AuthenticatedLayout>
            <div className="max-w-2xl mx-auto p-6 mt-6 bg-white rounded shadow">
                <h1 className="text-xl font-bold mb-4">Create New Post</h1>
                <form onSubmit={submit}>
                    <div className="mb-4">
                        <label className="block font-semibold mb-1">
                            Title
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full border border-gray-300 rounded px-3 py-2"
                        />
                        {errors.title && (
                            <div className="text-red-600 mt-1">
                                {errors.title}
                            </div>
                        )}
                    </div>

                    <div className="mb-4">
                        <label className="block font-semibold mb-1">
                            Content
                        </label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={5}
                            className="w-full border border-gray-300 rounded px-3 py-2"
                        />
                        {errors.content && (
                            <div className="text-red-600 mt-1">
                                {errors.content}
                            </div>
                        )}
                    </div>

                    <div className="mb-4">
                        <label className="block font-semibold mb-1">
                            Status
                        </label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full border border-gray-300 rounded px-3 py-2"
                        >
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                        </select>
                        {errors.status && (
                            <div className="text-red-600 mt-1">
                                {errors.status}
                            </div>
                        )}
                    </div>

                    <div className="mb-4">
                        <label className="block font-semibold mb-2">
                            Select Platforms
                        </label>
                        <div className="flex flex-wrap gap-3">
                            {platforms.map((platform) => (
                                <label
                                    key={platform.id}
                                    className={`cursor-pointer select-none rounded border px-3 py-1 ${
                                        selectedPlatforms.includes(platform.id)
                                            ? "bg-blue-500 text-white"
                                            : "border-gray-300"
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        value={platform.id}
                                        checked={selectedPlatforms.includes(
                                            platform.id
                                        )}
                                        onChange={() =>
                                            togglePlatform(platform.id)
                                        }
                                    />
                                    {platform.name}
                                </label>
                            ))}
                        </div>
                        {errors.platform_ids && (
                            <div className="text-red-600 mt-1">
                                {errors.platform_ids}
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Create Post
                    </button>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
