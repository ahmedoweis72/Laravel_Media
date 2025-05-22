import { useState } from "react";
import { Inertia } from "@inertiajs/inertia";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import InputError from "@/Components/InputError";

// ShadCN Components
import { Button } from "@/Components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/Components/ui/alert-dialog";
// import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/Components/ui/input";
import { Textarea } from "@/Components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { Checkbox } from "@/Components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

const validationSchema = Yup.object({
    title: Yup.string()
        .max(255, "Title must be at most 255 characters")
        .required("Title is required"),
    content: Yup.string().required("Content is required"),
    status: Yup.string()
        .oneOf(["draft", "published","scheduled"])
        .required("Status is required"),
    platform_ids: Yup.array()
        .min(1, "Select at least one platform")
        .of(Yup.number())
        .required("Platforms selection is required"),
});

export default function PostForm({ post = null, platforms }) {
    const [submitting, setSubmitting] = useState(false);
    const [showAddPlatform, setShowAddPlatform] = useState(false);
    const [newPlatform, setNewPlatform] = useState({ name: "", type: "" });
    const [editingPlatform, setEditingPlatform] = useState(null);
    const [editPlatformData, setEditPlatformData] = useState({
        name: "",
        type: "",
    });
    const [deletingPlatformId, setDeletingPlatformId] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [platformToDelete, setPlatformToDelete] = useState(null);
    const { toast } = useToast();

    const initialValues = {
        title: post?.title || "",
        content: post?.content || "",
        status: post?.status || "",
        platform_ids: post?.platforms?.map((p) => p.id) || [],
    };

    const handleSubmit = (values, { setErrors }) => {
        setSubmitting(true);

        const request = post
            ? Inertia.put(route("posts.update", post.id), values)
            : Inertia.post(route("posts.store"), values);

        request
            .then(() => {
                setSubmitting(false);
            })
            .catch((err) => {
                setErrors(err);
                setSubmitting(false);
            });
    };

    // Create new platform
    const handleAddPlatform = () => {
        if (!newPlatform.name.trim()) return;

        Inertia.post(route("platforms.store"), newPlatform, {
            onSuccess: () => {
                setNewPlatform({ name: "", type: "" });
                setShowAddPlatform(false);
                toast({
                    title: "Platform added",
                    description: "The new platform has been created.",
                });
                Inertia.reload({ only: ["platforms"] });
            },
            onError: () => {
                toast({
                    title: "Error",
                    description: "Failed to create the platform.",
                    variant: "destructive",
                });
            },
        });
    };

    // Start editing platform (fill form)
    const startEditPlatform = (platform) => {
        setEditingPlatform(platform.id);
        setEditPlatformData({ name: platform.name, type: platform.type || "" });
    };

    // Cancel editing platform
    const cancelEditPlatform = () => {
        setEditingPlatform(null);
        setEditPlatformData({ name: "", type: "" });
    };

    // Save edited platform
    const saveEditPlatform = () => {
        if (!editPlatformData.name.trim()) return;

        Inertia.put(
            route("platforms.update", editingPlatform),
            editPlatformData,
            {
                onSuccess: () => {
                    setEditingPlatform(null);
                    setEditPlatformData({ name: "", type: "" });
                    toast({
                        title: "Platform updated",
                        description:
                            "The platform has been successfully modified.",
                    });
                    Inertia.reload({ only: ["platforms"] });
                },
                onError: () => {
                    toast({
                        title: "Error",
                        description: "Failed to update the platform.",
                        variant: "destructive",
                    });
                },
            }
        );
    };

    // Delete platform with confirmation
    const handleDeletePlatform = (platformId) => {
        setPlatformToDelete(platformId);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (!platformToDelete) return;

        setDeletingPlatformId(platformToDelete);
        setDeleteDialogOpen(false);

        Inertia.delete(route("platforms.destroy", platformToDelete), {
            onSuccess: () => {
                toast({
                    title: "Platform deleted",
                    description: "The platform has been successfully removed.",
                });
                setDeletingPlatformId(null);
                setPlatformToDelete(null);
                Inertia.reload({ only: ["platforms"] });
            },
            onError: () => {
                toast({
                    title: "Error",
                    description: "Failed to delete the platform.",
                    variant: "destructive",
                });
                setDeletingPlatformId(null);
            },
        });
    };

    return (
        <AuthenticatedLayout>
            <div className="max-w-2xl mx-auto p-6 mt-6 bg-white rounded-lg shadow">
                <h1 className="text-2xl font-bold mb-6">
                    {post ? "Edit Post" : "Create New Post"}
                </h1>

                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    enableReinitialize
                    onSubmit={handleSubmit}
                >
                    {({ values, errors, setFieldValue }) => (
                        <Form noValidate>
                            {/* Post fields: title, content, status */}
                            <div className="mb-5">
                                <label
                                    htmlFor="title"
                                    className="block font-semibold mb-2"
                                >
                                    Title
                                </label>
                                <Field
                                    as={Input}
                                    id="title"
                                    name="title"
                                    type="text"
                                    disabled={submitting}
                                    autoFocus
                                />
                                <InputError
                                    message={errors.title}
                                    className="mt-1"
                                />
                            </div>

                            <div className="mb-5">
                                <label
                                    htmlFor="content"
                                    className="block font-semibold mb-2"
                                >
                                    Content
                                </label>
                                <Field
                                    as={Textarea}
                                    id="content"
                                    name="content"
                                    rows={5}
                                    disabled={submitting}
                                />
                                <InputError
                                    message={errors.content}
                                    className="mt-1"
                                />
                            </div>

                            <div className="mb-5">
                                <label
                                    htmlFor="status"
                                    className="block font-semibold mb-2"
                                >
                                    Status
                                </label>
                                <Field name="status">
                                    {({ field, form }) => (
                                        <Select
                                            value={field.value}
                                            onValueChange={(value) =>
                                                form.setFieldValue(
                                                    "status",
                                                    value
                                                )
                                            }
                                            disabled={submitting}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="draft">
                                                    Draft
                                                </SelectItem>
                                                <SelectItem value="published">
                                                    Published
                                                </SelectItem>
                                                <SelectItem value="scheduled">
                                                    Scheduled
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                </Field>

                                <InputError
                                    message={errors.status}
                                    className="mt-1"
                                />
                            </div>

                            {/* Platforms section */}
                            <div className="mb-6">
                                <p className="block font-semibold mb-2">
                                    Select Platforms
                                </p>

                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowAddPlatform(true)}
                                    className="mb-3"
                                    disabled={submitting}
                                >
                                    + Add New Platform
                                </Button>

                                {/* Add new platform form */}
                                {showAddPlatform && (
                                    <div className="mb-4 border rounded-lg p-4 bg-gray-50">
                                        <div className="mb-3">
                                            <label className="block font-medium mb-1">
                                                Platform Name
                                            </label>
                                            <Input
                                                type="text"
                                                value={newPlatform.name}
                                                onChange={(e) =>
                                                    setNewPlatform({
                                                        ...newPlatform,
                                                        name: e.target.value,
                                                    })
                                                }
                                                placeholder="Enter platform name"
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="block font-medium mb-1">
                                                Platform Type (optional)
                                            </label>
                                            <Input
                                                type="text"
                                                value={newPlatform.type}
                                                onChange={(e) =>
                                                    setNewPlatform({
                                                        ...newPlatform,
                                                        type: e.target.value,
                                                    })
                                                }
                                                placeholder="Enter platform type"
                                            />
                                        </div>
                                        <div className="flex gap-3 mt-3">
                                            <Button
                                                type="button"
                                                onClick={handleAddPlatform}
                                                disabled={
                                                    !newPlatform.name.trim()
                                                }
                                            >
                                                Save Platform
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => {
                                                    setShowAddPlatform(false);
                                                    setNewPlatform({
                                                        name: "",
                                                        type: "",
                                                    });
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* Platforms list with edit/delete and checkboxes */}
                                <div className="flex flex-wrap gap-3">
                                    {platforms.map((platform) => {
                                        const isChecked =
                                            values.platform_ids.includes(
                                                platform.id
                                            );
                                        const isEditing =
                                            editingPlatform === platform.id;

                                        return (
                                            <div
                                                key={platform.id}
                                                className={`border rounded-lg px-4 py-2 flex items-center gap-3 ${
                                                    isChecked
                                                        ? "bg-primary/10 border-primary"
                                                        : "border-gray-200"
                                                }`}
                                            >
                                                {isEditing ? (
                                                    <>
                                                        <Input
                                                            type="text"
                                                            value={
                                                                editPlatformData.name
                                                            }
                                                            onChange={(e) =>
                                                                setEditPlatformData(
                                                                    (d) => ({
                                                                        ...d,
                                                                        name: e
                                                                            .target
                                                                            .value,
                                                                    })
                                                                )
                                                            }
                                                            disabled={
                                                                submitting
                                                            }
                                                            className="w-32"
                                                        />
                                                        <Input
                                                            type="text"
                                                            value={
                                                                editPlatformData.type
                                                            }
                                                            onChange={(e) =>
                                                                setEditPlatformData(
                                                                    (d) => ({
                                                                        ...d,
                                                                        type: e
                                                                            .target
                                                                            .value,
                                                                    })
                                                                )
                                                            }
                                                            placeholder="Type (optional)"
                                                            disabled={
                                                                submitting
                                                            }
                                                            className="w-24"
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={
                                                                saveEditPlatform
                                                            }
                                                            disabled={
                                                                !editPlatformData.name.trim() ||
                                                                submitting
                                                            }
                                                            title="Save"
                                                        >
                                                            ✓
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={
                                                                cancelEditPlatform
                                                            }
                                                            disabled={
                                                                submitting
                                                            }
                                                            title="Cancel"
                                                        >
                                                            ✕
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Checkbox
                                                            id={`platform-${platform.id}`}
                                                            checked={isChecked}
                                                            onCheckedChange={(
                                                                checked
                                                            ) => {
                                                                const next =
                                                                    checked
                                                                        ? [
                                                                              ...values.platform_ids,
                                                                              platform.id,
                                                                          ]
                                                                        : values.platform_ids.filter(
                                                                              (
                                                                                  id
                                                                              ) =>
                                                                                  id !==
                                                                                  platform.id
                                                                          );
                                                                setFieldValue(
                                                                    "platform_ids",
                                                                    next
                                                                );
                                                            }}
                                                            disabled={
                                                                submitting
                                                            }
                                                            className="mr-2"
                                                        />
                                                        <label
                                                            htmlFor={`platform-${platform.id}`}
                                                            className="flex-1 cursor-pointer select-none"
                                                        >
                                                            {platform.name}{" "}
                                                            {platform.type
                                                                ? `(${platform.type})`
                                                                : ""}
                                                        </label>

                                                        {/* Edit button */}
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() =>
                                                                startEditPlatform(
                                                                    platform
                                                                )
                                                            }
                                                            disabled={
                                                                submitting
                                                            }
                                                            title="Edit Platform"
                                                        >
                                                            ✎
                                                        </Button>

                                                        {/* Delete button */}
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() =>
                                                                handleDeletePlatform(
                                                                    platform.id
                                                                )
                                                            }
                                                            disabled={
                                                                deletingPlatformId ===
                                                                platform.id
                                                            }
                                                            className="text-red-600 hover:text-red-800"
                                                            title="Delete Platform"
                                                        >
                                                            🗑
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                <InputError
                                    message={errors.platform_ids}
                                    className="mt-2"
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={submitting}
                                className="w-full"
                            >
                                {submitting ? (
                                    <span className="flex items-center justify-center">
                                        <svg
                                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            ></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            ></path>
                                        </svg>
                                        {post ? "Updating..." : "Creating..."}
                                    </span>
                                ) : post ? (
                                    "Update Post"
                                ) : (
                                    "Create Post"
                                )}
                            </Button>
                        </Form>
                    )}
                </Formik>

                {/* Delete Confirmation Dialog */}
                <AlertDialog
                    open={deleteDialogOpen}
                    onOpenChange={setDeleteDialogOpen}
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                Are you absolutely sure?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will
                                permanently delete the platform and remove it
                                from any associated posts.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={confirmDelete}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                disabled={
                                    deletingPlatformId === platformToDelete
                                }
                            >
                                {deletingPlatformId === platformToDelete
                                    ? "Deleting..."
                                    : "Delete"}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </AuthenticatedLayout>
    );
}
