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
import { Card, CardHeader, CardTitle, CardContent } from "@/Components/ui/card";

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
    scheduled_time: Yup.date().when('status', {
        is: 'scheduled',
        then: () => Yup.date().required("Scheduled time is required").min(new Date(), "Scheduled time must be in the future"),
        otherwise: () => Yup.date().nullable()
    })
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
    const [imagePreview, setImagePreview] = useState(post?.image_url || null);

    // Helper function to check if a post meets platform requirements
    const validateForPlatform = (content, imageUrl, platformType) => {
        switch (platformType?.toLowerCase()) {
            case 'twitter':
                return content.length <= 280;
            case 'instagram':
                return !!imageUrl;
            case 'linkedin':
                return content.length <= 3000;
            case 'facebook':
                return content.length <= 63206;
            default:
                return true;
        }
    };

    const initialValues = {
        title: post?.title || "",
        content: post?.content || "",
        status: post?.status || "draft",
        platform_ids: post?.platforms?.map((p) => p.id) || [],
        image_url: post?.image_url || "",
        scheduled_time: post?.scheduled_time ? new Date(post.scheduled_time).toISOString().slice(0, 16) : "",
    };

    const handleSubmit = (values, { setErrors }) => {
        setSubmitting(true);
        
        const formData = new FormData();
        formData.append('title', values.title);
        formData.append('content', values.content);
        formData.append('status', values.status);
        values.platform_ids.forEach(id => {
            formData.append('platform_ids[]', id);
        });
        
        if (values.image_url instanceof File) {
            formData.append('image_url', values.image_url);
        }
        
        if (values.status === 'scheduled' && values.scheduled_time) {
            formData.append('scheduled_time', values.scheduled_time);
        }

        const request = post
            ? Inertia.post(route("posts.update", post.id), {
                _method: 'PUT',
                ...formData
              })
            : Inertia.post(route("posts.store"), formData);

        request
            .then(() => {
                setSubmitting(false);
                toast({
                    title: post ? "Post Updated" : "Post Created",
                    description: post ? "Your post has been updated successfully." : "Your post has been created successfully.",
                });
            })
            .catch((err) => {
                setErrors(err);
                setSubmitting(false);
                toast({
                    title: "Error",
                    description: "There was an error processing your request.",
                    variant: "destructive",
                });
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
            <div className="max-w-5xl mx-auto p-6 mt-6 bg-card rounded-lg shadow">
                <h1 className="text-2xl font-bold mb-6 text-foreground">
                    {post ? "Edit Post" : "Create New Post"}
                </h1>

                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    enableReinitialize
                    onSubmit={handleSubmit}
                >
                    {({ values, errors, touched, setFieldValue }) => (
                        <Form noValidate className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-6">
                                    {/* Left column: Form fields */}
                                    <div className="mb-5">
                                        <label
                                            htmlFor="title"
                                            className="block font-semibold mb-2 text-foreground"
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
                                            className="bg-background text-foreground"
                                        />
                                        <InputError
                                            message={errors.title}
                                            className="mt-1"
                                        />
                                    </div>

                                    <div className="mb-5">
                                        <label
                                            htmlFor="content"
                                            className="block font-semibold mb-2 text-foreground"
                                        >
                                            Content
                                        </label>
                                        <Field
                                            as={Textarea}
                                            id="content"
                                            name="content"
                                            rows={5}
                                            disabled={submitting}
                                            className="bg-background text-foreground"
                                        />
                                        <InputError
                                            message={errors.content}
                                            className="mt-1"
                                        />
                                    </div>

                                    <div className="mb-5">
                                        <label
                                            htmlFor="image_url"
                                            className="block font-semibold mb-2 text-foreground"
                                        >
                                            Image Upload
                                        </label>
                                        <Input
                                            id="image_url"
                                            name="image_url"
                                            type="file"
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    setFieldValue('image_url', file);
                                                    setImagePreview(URL.createObjectURL(file));
                                                }
                                            }}
                                            accept="image/*"
                                            disabled={submitting}
                                            className="bg-background text-foreground"
                                        />
                                        {imagePreview && (
                                            <div className="mt-2">
                                                <img 
                                                    src={imagePreview} 
                                                    alt="Preview" 
                                                    className="w-32 h-32 object-cover rounded" 
                                                />
                                                <button 
                                                    type="button"
                                                    className="text-sm text-red-500 mt-1 hover:text-red-700"
                                                    onClick={() => {
                                                        setImagePreview(null);
                                                        setFieldValue('image_url', '');
                                                    }}
                                                >
                                                    Remove image
                                                </button>
                                            </div>
                                        )}
                                        <InputError message={errors.image_url} className="mt-1" />
                                    </div>

                                    <div className="mb-5">
                                        <label
                                            htmlFor="status"
                                            className="block font-semibold mb-2 text-foreground"
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
                                                    <SelectTrigger className="bg-background text-foreground">
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
                                    
                                    {values.status === 'scheduled' && (
                                        <div className="mb-5">
                                            <label
                                                htmlFor="scheduled_time"
                                                className="block font-semibold mb-2 text-foreground"
                                            >
                                                Schedule For
                                            </label>
                                            <Input
                                                id="scheduled_time"
                                                name="scheduled_time"
                                                type="datetime-local"
                                                value={values.scheduled_time}
                                                onChange={(e) => setFieldValue("scheduled_time", e.target.value)}
                                                min={new Date().toISOString().slice(0, 16)}
                                                disabled={submitting}
                                                className="bg-background text-foreground"
                                            />
                                            <InputError message={errors.scheduled_time} className="mt-1" />
                                        </div>
                                    )}

                                    {/* Platforms section */}
                                    <div className="mb-6">
                                        <p className="block font-semibold mb-2 text-foreground">
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
                                            <div className="mb-4 border rounded-lg p-4 bg-muted">
                                                <div className="mb-3">
                                                    <label className="block font-medium mb-1 text-foreground">
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
                                                        className="bg-background text-foreground"
                                                    />
                                                </div>
                                                <div className="mb-3">
                                                    <label className="block font-medium mb-1 text-foreground">
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
                                                        className="bg-background text-foreground"
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
                                                const isValid = validateForPlatform(
                                                    values.content,
                                                    imagePreview,
                                                    platform.type
                                                );
                                                const validationMessage = isChecked && !isValid ? (
                                                    platform.type?.toLowerCase() === 'twitter' ? (
                                                        <div className="text-red-500 text-xs mt-1">Content exceeds 280 characters ({values.content.length})</div>
                                                    ) : platform.type?.toLowerCase() === 'instagram' ? (
                                                        <div className="text-red-500 text-xs mt-1">Image required for Instagram</div>
                                                    ) : platform.type?.toLowerCase() === 'linkedin' ? (
                                                        <div className="text-red-500 text-xs mt-1">Content exceeds 3000 characters ({values.content.length})</div>
                                                    ) : null
                                                ) : null;

                                                return (
                                                    <div
                                                        key={platform.id}
                                                        className={`border rounded-lg px-4 py-2 flex items-center gap-3 ${
                                                            isChecked
                                                                ? isValid 
                                                                    ? "bg-primary/10 border-primary" 
                                                                    : "bg-red-100 dark:bg-red-900/20 border-red-500"
                                                                : "border-muted"
                                                        } transition-all flex-col`}
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
                                                                    className="w-32 bg-background text-foreground"
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
                                                                    className="w-24 bg-background text-foreground"
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
                                                                <div className="flex w-full">
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
                                                                        className="flex-1 cursor-pointer select-none text-foreground"
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
                                                                </div>
                                                                {validationMessage}
                                                                {isChecked && platform.type?.toLowerCase() === 'twitter' && (
                                                                    <div className={`text-xs mt-1 ${values.content.length > 280 ? 'text-red-500' : 'text-green-500'}`}>
                                                                        {values.content.length}/280 characters
                                                                    </div>
                                                                )}
                                                                {isChecked && platform.type?.toLowerCase() === 'linkedin' && (
                                                                    <div className={`text-xs mt-1 ${values.content.length > 3000 ? 'text-red-500' : 'text-green-500'}`}>
                                                                        {values.content.length}/3000 characters
                                                                    </div>
                                                                )}
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
                                </div>
                                
                                {/* Right column: Preview */}
                                <div>
                                    <Card className="bg-card text-card-foreground">
                                        <CardHeader>
                                            <CardTitle>Post Preview</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                <div className="font-bold text-lg text-foreground">
                                                    {values.title || "Your Post Title"}
                                                </div>
                                                <div className="whitespace-pre-wrap text-foreground">
                                                    {values.content || "Your content will appear here..."}
                                                </div>
                                                {imagePreview && (
                                                    <img 
                                                        src={imagePreview} 
                                                        alt="Post image" 
                                                        className="max-h-48 rounded mt-2 object-contain" 
                                                    />
                                                )}
                                                <div className="text-sm text-muted-foreground">
                                                    {values.status === "draft" && (
                                                        <span className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded text-xs">
                                                            Draft
                                                        </span>
                                                    )}
                                                    {values.status === "published" && (
                                                        <span className="bg-green-200 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded text-xs">
                                                            Published
                                                        </span>
                                                    )}
                                                    {values.status === "scheduled" && values.scheduled_time && (
                                                        <div className="flex flex-col space-y-1">
                                                            <span className="bg-blue-200 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-xs">
                                                                Scheduled
                                                            </span>
                                                            <span>
                                                                Scheduled for: {new Date(values.scheduled_time).toLocaleString()}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                {values.platform_ids.length > 0 && (
                                                    <div className="border-t border-border pt-3 mt-3">
                                                        <h4 className="text-sm font-semibold mb-2">Selected Platforms:</h4>
                                                        <div className="flex flex-wrap gap-1">
                                                            {values.platform_ids.map(id => {
                                                                const platform = platforms.find(p => p.id === id);
                                                                if (!platform) return null;
                                                                
                                                                const isValid = validateForPlatform(
                                                                    values.content,
                                                                    imagePreview,
                                                                    platform.type
                                                                );
                                                                
                                                                return (
                                                                    <span 
                                                                        key={platform.id}
                                                                        className={`px-2 py-1 rounded-full text-xs ${
                                                                            isValid 
                                                                              ? "bg-primary/20 text-primary" 
                                                                              : "bg-red-200 dark:bg-red-900 text-red-800 dark:text-red-200"
                                                                        }`}
                                                                    >
                                                                        {platform.name}
                                                                    </span>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                            
                            <div className="pt-4">
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
                            </div>
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
                            <AlertDialogTitle className="text-foreground">
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
