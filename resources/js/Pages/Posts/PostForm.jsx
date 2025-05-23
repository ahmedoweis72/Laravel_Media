import { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
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
import {
    Calendar,
    Globe,
    CheckCircle,
    AlertCircle,
    Image as ImageIcon,
    Plus,
    Pencil,
    Trash2,
    Loader2,
} from "lucide-react";

const validationSchema = Yup.object({
    title: Yup.string()
        .max(255, "Title must be at most 255 characters")
        .required("Title is required"),
    content: Yup.string().required("Content is required"),
    status: Yup.string()
        .oneOf(["draft", "published", "scheduled"])
        .required("Status is required"),
    platform_ids: Yup.array()
        .of(Yup.number())
        .nullable(),
    scheduled_time: Yup.date().when("status", {
        is: "scheduled",
        then: () =>
            Yup.date()
                .required("Scheduled time is required")
                .min(new Date(), "Scheduled time must be in the future"),
        otherwise: () => Yup.date().nullable(),
    }),
});

// Platform character limits for different social media platforms
const PLATFORM_LIMITS = {
    twitter: 280,
    instagram: 2200,
    linkedin: 3000,
    facebook: 63206,
};

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
    const [contentLength, setContentLength] = useState(
        post?.content?.length || 0
    );
    const [selectedPlatformTypes, setSelectedPlatformTypes] = useState([]);
    const [dailyPostCount, setDailyPostCount] = useState(0);
    const [reachedPostLimit, setReachedPostLimit] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [imageUploading, setImageUploading] = useState(false);
    const IMAGEBB_API_KEY = '7ac5609083bd93dd479b9fb37038190e'; // Replace with your ImageBB API key

    // Check daily post limit (max 10 per day)
    useEffect(() => {
        // Fetch daily post count from API
        fetch(
            "/api/posts/filter/date/" + new Date().toISOString().split("T")[0]
        )
            .then((response) => response.json())
            .then((data) => {
                const count = data.length;
                setDailyPostCount(count);
                setReachedPostLimit(count >= 10);
            })
            .catch((error) => {
                console.error("Error fetching daily post count:", error);
            });
    }, []);

    // Update selected platform types when platform_ids change
    useEffect(() => {
        if (platforms) {
            const updateSelectedTypes = (platformIds) => {
                const types = platforms
                    .filter((p) => platformIds.includes(p.id))
                    .map((p) => p.type?.toLowerCase());
                setSelectedPlatformTypes(types);
            };

            if (post?.platforms) {
                updateSelectedTypes(post.platforms.map((p) => p.id));
            }
        }
    }, [platforms, post]);

    // Helper function to check if a post meets platform requirements
    const validateForPlatform = (content, imageUrl, platformType) => {
        switch (platformType?.toLowerCase()) {
            case "twitter":
                return content.length <= 280;
            case "instagram":
                return !!imageUrl;
            case "linkedin":
                return content.length <= 3000;
            case "facebook":
                return content.length <= 63206;
            default:
                return true;
        }
    };

    // Get the most restrictive character limit from selected platforms
    const getCharacterLimit = (platformTypes) => {
        if (!platformTypes || platformTypes.length === 0) return Infinity;

        return platformTypes.reduce((limit, type) => {
            const platformLimit =
                PLATFORM_LIMITS[type?.toLowerCase()] || Infinity;
            return Math.min(limit, platformLimit);
        }, Infinity);
    };

    const initialValues = {
        title: post?.title || "",
        content: post?.content || "",
        status: post?.status || "draft",
        platform_ids: post?.platforms?.map((p) => p.id) || [],
        image_url: "",
        scheduled_time: post?.scheduled_time
            ? new Date(post.scheduled_time).toISOString().slice(0, 16)
            : "",
    };

    useEffect(() => {
        if (post?.image_url) {
            setImagePreview(post.image_url);
        }
    }, [post]);

    // Add image upload function
    const uploadImageToImageBB = async (file) => {
        try {
            setImageUploading(true);
            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMAGEBB_API_KEY}`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (data.success) {
                return data.data.url;
            } else {
                throw new Error('Image upload failed');
            }
        } catch (error) {
            console.error('Image upload error:', error);
            toast({
                title: "Error",
                description: "Failed to upload image. Please try again.",
                variant: "destructive",
            });
            return null;
        } finally {
            setImageUploading(false);
        }
    };

    // Update handleSubmit function
    const handleSubmit = async (values, { setErrors }) => {
        if (values.status === "scheduled" && dailyPostCount >= 10 && !post) {
            toast({
                title: "Daily Limit Reached",
                description: "You can only schedule up to 10 posts per day.",
                variant: "destructive",
            });
            return;
        }

        setSubmitting(true);

        try {
            // Handle image URL
            let imageUrl = null;
            
            // Keep existing image if no new one is uploaded
            if (post?.image_url && !values.image_url) {
                imageUrl = post.image_url;
            }
            
            // Upload new image if selected
            if (values.image_url instanceof File) {
                const uploadedImageUrl = await uploadImageToImageBB(values.image_url);
                if (!uploadedImageUrl) {
                    setSubmitting(false);
                    return;
                }
                imageUrl = uploadedImageUrl;
            }

            // Create the request payload
            const payload = {
                title: values.title,
                content: values.content,
                status: values.status,
                image_url: imageUrl,
                platform_ids: values.platform_ids,
            };

            // Add scheduled_time if needed
            if (values.status === "scheduled" && values.scheduled_time) {
                payload.scheduled_time = values.scheduled_time;
            }

            // Add method if editing
            if (post) {
                payload._method = 'PUT';
            }

            console.log('Submitting payload:', payload); // Debug log

            // Make the request
            await router.post(
                post ? route("posts.update", post.id) : route("posts.store"),
                payload,
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setSubmitting(false);
                        toast({
                            title: post ? "Post Updated" : "Post Created",
                            description: post 
                                ? "Your post has been updated successfully."
                                : "Your post has been created successfully.",
                        });
                        // Redirect to posts index
                        router.get(route("posts.index"));
                    },
                    onError: (errors) => {
                        setSubmitting(false);
                        setErrors(errors);
                        console.error("Submission errors:", errors);
                        toast({
                            title: "Error",
                            description: Object.values(errors).flat().join('\n'),
                            variant: "destructive",
                        });
                    },
                }
            );
        } catch (error) {
            console.error("Form submission error:", error);
            setSubmitting(false);
            toast({
                title: "Error",
                description: "An unexpected error occurred. Please try again.",
                variant: "destructive",
            });
        }
    };

    // Create new platform
    const handleAddPlatform = async () => {
        if (!newPlatform.name.trim()) return;

        try {
            await router.post(route("platforms.store"), newPlatform, {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    setNewPlatform({ name: "", type: "" });
                    setShowAddPlatform(false);
                    toast({
                        title: "Platform added",
                        description: "The new platform has been created.",
                    });
                },
                onError: () => {
                    toast({
                        title: "Error",
                        description: "Failed to create the platform.",
                        variant: "destructive",
                    });
                }
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "An unexpected error occurred.",
                variant: "destructive",
            });
        }
    };

    // Start editing platform
    const startEditPlatform = (platform) => {
        setEditMode(true);
        setEditingPlatform(platform.id);
        setEditPlatformData({
            name: platform.name,
            type: platform.type || "",
        });
    };

    // Cancel editing platform
    const cancelEditPlatform = () => {
        setEditMode(false);
        setEditingPlatform(null);
        setEditPlatformData({ name: "", type: "" });
    };

    // Save edited platform
    const saveEditPlatform = async () => {
        if (!editPlatformData.name.trim()) return;

        try {
            await router.put(route("platforms.update", editingPlatform), editPlatformData, {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    setEditMode(false);
                    setEditingPlatform(null);
                    setEditPlatformData({ name: "", type: "" });
                    toast({
                        title: "Success",
                        description: "Platform updated successfully",
                    });
                },
                onError: (errors) => {
                    toast({
                        title: "Error",
                        description: "Failed to update platform",
                        variant: "destructive",
                    });
                    console.error("Update error:", errors);
                },
            });
        } catch (error) {
            console.error("Platform update error:", error);
            toast({
                title: "Error",
                description: "An unexpected error occurred",
                variant: "destructive",
            });
        }
    };

    // Delete platform with confirmation
    const handleDeletePlatform = (platformId) => {
        setPlatformToDelete(platformId);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!platformToDelete) return;

        setDeletingPlatformId(platformToDelete);
        setDeleteDialogOpen(false);

        try {
            await router.delete(route("platforms.destroy", platformToDelete), {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    toast({
                        title: "Platform deleted",
                        description: "The platform has been successfully removed.",
                    });
                    setDeletingPlatformId(null);
                    setPlatformToDelete(null);
                },
                onError: () => {
                    toast({
                        title: "Error",
                        description: "Failed to delete the platform.",
                        variant: "destructive",
                    });
                    setDeletingPlatformId(null);
                }
            });
        } catch (error) {
            setDeletingPlatformId(null);
            toast({
                title: "Error",
                description: "An unexpected error occurred.",
                variant: "destructive",
            });
        }
    };

    function PlatformTypeIcon({ type }) {
        const lowerType = type?.toLowerCase();

        switch (lowerType) {
            case "twitter":
                return (
                    <svg
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                    >
                        <path d="M21.543 7.104c.015.211.015.423.015.636 0 6.507-4.954 14.01-14.01 14.01v-.003A13.94 13.94 0 0 1 1 19.539a9.88 9.88 0 0 0 7.287-2.041 4.93 4.93 0 0 1-4.6-3.42 4.916 4.916 0 0 0 2.223-.084A4.926 4.926 0 0 1 1.999 9.17v-.062a4.887 4.887 0 0 0 2.235.616A4.928 4.928 0 0 1 2.46 3.44a13.979 13.979 0 0 0 10.15 5.147 4.929 4.929 0 0 1 8.391-4.491 9.868 9.868 0 0 0 3.128-1.196 4.941 4.941 0 0 1-2.165 2.724A9.828 9.828 0 0 0 24 4.89a10.019 10.019 0 0 1-2.457 2.549v-.001z" />
                    </svg>
                );
            case "facebook":
                return (
                    <svg
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                    >
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                );
            case "instagram":
                return (
                    <svg
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                    >
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                    </svg>
                );
            case "linkedin":
                return (
                    <svg
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                    >
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                );
            default:
                return <Globe className="h-4 w-4" />;
        }
    }

    return (
        <AuthenticatedLayout>
            <div className="max-w-5xl mx-auto p-6 mt-6">
                <div className="bg-card rounded-lg shadow-lg border border-border p-6">
                    <h1 className="text-2xl font-bold mb-6 text-card-foreground">
                        {post ? "Edit Post" : "Create New Post"}
                    </h1>

                    <Formik
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        enableReinitialize
                        onSubmit={handleSubmit}
                    >
                        {({ values, errors, touched, setFieldValue, isValid }) => (
                            <Form noValidate className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-6">
                                        {/* Title Input */}
                                        <div className="space-y-2">
                                            <label
                                                htmlFor="title"
                                                className="block font-medium text-foreground"
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
                                                className={`w-full ${
                                                    errors.title && touched.title
                                                        ? "border-destructive focus-visible:ring-destructive"
                                                        : "border-input"
                                                } bg-background text-foreground placeholder:text-muted-foreground`}
                                            />
                                            {errors.title && touched.title && (
                                                <InputError
                                                    message={errors.title}
                                                    className="mt-1"
                                                />
                                            )}
                                        </div>

                                        {/* Content Textarea */}
                                        <div className="space-y-2">
                                            <label
                                                htmlFor="content"
                                                className="block font-medium text-foreground"
                                            >
                                                Content
                                            </label>
                                            <div className="flex justify-between items-center">
                                                <span
                                                    className={`text-sm ${
                                                        contentLength >
                                                        getCharacterLimit(
                                                            selectedPlatformTypes
                                                        )
                                                            ? "text-destructive"
                                                            : contentLength >
                                                              getCharacterLimit(
                                                                  selectedPlatformTypes
                                                              ) * 0.9
                                                            ? "text-warning"
                                                            : "text-muted-foreground"
                                                    }`}
                                                >
                                                    {contentLength} /{" "}
                                                    {getCharacterLimit(
                                                        selectedPlatformTypes
                                                    ) === Infinity
                                                        ? "∞"
                                                        : getCharacterLimit(
                                                              selectedPlatformTypes
                                                          )}
                                                </span>
                                            </div>
                                            <Field
                                                as={Textarea}
                                                id="content"
                                                name="content"
                                                rows={5}
                                                disabled={submitting}
                                                className={`w-full min-h-[150px] ${
                                                    errors.content && touched.content
                                                        ? "border-destructive focus-visible:ring-destructive"
                                                        : "border-input"
                                                } bg-background text-foreground placeholder:text-muted-foreground resize-none`}
                                                onChange={(e) => {
                                                    setFieldValue(
                                                        "content",
                                                        e.target.value
                                                    );
                                                    setContentLength(
                                                        e.target.value.length
                                                    );
                                                }}
                                            />
                                            {errors.content && touched.content && (
                                                <InputError
                                                    message={errors.content}
                                                    className="mt-1"
                                                />
                                            )}
                                        </div>

                                        {/* Status Select */}
                                        <div className="space-y-2">
                                            <label
                                                htmlFor="status"
                                                className="block font-medium text-foreground"
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
                                                        <SelectTrigger className="w-full bg-background text-foreground border-input">
                                                            <SelectValue placeholder="Select status" />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-popover border-border">
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

                                        {/* Scheduled Time Input */}
                                        {values.status === "scheduled" && (
                                            <div className="space-y-2">
                                                <label
                                                    htmlFor="scheduled_time"
                                                    className="block font-medium text-foreground"
                                                >
                                                    Schedule For
                                                </label>
                                                <Input
                                                    id="scheduled_time"
                                                    name="scheduled_time"
                                                    type="datetime-local"
                                                    value={values.scheduled_time}
                                                    onChange={(e) =>
                                                        setFieldValue(
                                                            "scheduled_time",
                                                            e.target.value
                                                        )
                                                    }
                                                    min={new Date()
                                                        .toISOString()
                                                        .slice(0, 16)}
                                                    disabled={submitting}
                                                    className={`w-full ${
                                                        errors.scheduled_time &&
                                                        touched.scheduled_time
                                                            ? "border-destructive focus-visible:ring-destructive"
                                                            : "border-input"
                                                    } bg-background text-foreground`}
                                                />
                                                {errors.scheduled_time &&
                                                    touched.scheduled_time && (
                                                        <InputError
                                                            message={
                                                                errors.scheduled_time
                                                            }
                                                            className="mt-1"
                                                        />
                                                    )}
                                                {reachedPostLimit && !post && (
                                                    <p className="text-destructive text-sm">
                                                        You've reached the daily
                                                        limit of 10 scheduled posts.
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {/* Image Upload */}
                                        <div className="mb-5">
                                            <label
                                                htmlFor="image_url"
                                                className="block font-medium text-foreground mb-2"
                                            >
                                                Image Upload
                                            </label>
                                            <div className="flex items-center space-x-4">
                                                <div
                                                    className="relative border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 rounded-lg p-4 flex items-center justify-center cursor-pointer transition-colors bg-muted/50"
                                                    onClick={() => document.getElementById("image_url").click()}
                                                    style={{ height: "120px", width: "120px" }}
                                                >
                                                    {imageUploading ? (
                                                        <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                                                            <Loader2 className="h-6 w-6 animate-spin text-white" />
                                                        </div>
                                                    ) : imagePreview ? (
                                                        <img
                                                            src={typeof imagePreview === "string"
                                                                ? imagePreview
                                                                : URL.createObjectURL(imagePreview)
                                                            }
                                                            alt="Preview"
                                                            className="h-full w-full object-cover rounded-lg"
                                                        />
                                                    ) : (
                                                        <div className="text-center">
                                                            <ImageIcon className="mx-auto h-10 w-10 text-muted-foreground" />
                                                            <p className="mt-1 text-xs text-muted-foreground">
                                                                Click to upload
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                                <input
                                                    id="image_url"
                                                    name="image_url"
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        const file = e.target.files[0];
                                                        if (file) {
                                                            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                                                                toast({
                                                                    title: "Error",
                                                                    description: "Image size should be less than 5MB",
                                                                    variant: "destructive",
                                                                });
                                                                return;
                                                            }
                                                            setFieldValue("image_url", file);
                                                            setImagePreview(file);
                                                        }
                                                    }}
                                                />
                                                {imagePreview && (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            setFieldValue("image_url", "");
                                                            setImagePreview(null);
                                                        }}
                                                        className="text-destructive hover:text-destructive-foreground hover:bg-destructive/10"
                                                        disabled={imageUploading}
                                                    >
                                                        Remove
                                                    </Button>
                                                )}
                                            </div>
                                            {errors.image_url && touched.image_url && (
                                                <InputError message={errors.image_url} className="mt-1" />
                                            )}
                                        </div>
                                    </div>

                                    {/* Right column: Preview */}
                                    <div>
                                        <Card className="bg-card border-border">
                                            <CardHeader className="space-y-1">
                                                <CardTitle className="text-xl font-semibold text-card-foreground">
                                                    Post Preview
                                                </CardTitle>
                                                <p className="text-sm text-muted-foreground">
                                                    Preview how your post will look
                                                </p>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div className="rounded-md bg-background p-4 border border-border">
                                                    <h3 className="font-semibold text-lg text-foreground mb-2">
                                                        {values.title || "Your Post Title"}
                                                    </h3>
                                                    <div className="prose prose-sm dark:prose-invert max-w-none">
                                                        <div className="whitespace-pre-wrap text-muted-foreground">
                                                            {values.content || "Your content will appear here..."}
                                                        </div>
                                                    </div>
                                                    {imagePreview && (
                                                        <div className="mt-4 rounded-md overflow-hidden border border-border">
                                                            <img
                                                                src={
                                                                    typeof imagePreview === "string"
                                                                        ? imagePreview
                                                                        : URL.createObjectURL(imagePreview)
                                                                }
                                                                alt="Post preview"
                                                                className="w-full h-auto object-cover"
                                                            />
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex flex-wrap gap-2">
                                                    {values.status === "draft" && (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                                                            Draft
                                                        </span>
                                                    )}
                                                    {values.status === "published" && (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                                            Published
                                                        </span>
                                                    )}
                                                    {values.status === "scheduled" && (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary/10 text-secondary-foreground">
                                                            Scheduled for{" "}
                                                            {values.scheduled_time
                                                                ? new Date(
                                                                      values.scheduled_time
                                                                  ).toLocaleString()
                                                                : "Not set"}
                                                        </span>
                                                    )}
                                                </div>

                                                {values.platform_ids.length > 0 && (
                                                    <div className="border-t border-border pt-4 mt-4">
                                                        <h4 className="text-sm font-medium text-card-foreground mb-2">
                                                            Selected Platforms
                                                        </h4>
                                                        <div className="flex flex-wrap gap-2">
                                                            {values.platform_ids.map((id) => {
                                                                const platform = platforms.find(
                                                                    (p) => p.id === id
                                                                );
                                                                if (!platform) return null;

                                                                const isValid = validateForPlatform(
                                                                    values.content,
                                                                    imagePreview,
                                                                    platform.type
                                                                );

                                                                return (
                                                                    <span
                                                                        key={platform.id}
                                                                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                                            isValid
                                                                                ? "bg-primary/10 text-primary"
                                                                                : "bg-destructive/10 text-destructive"
                                                                        }`}
                                                                    >
                                                                        <PlatformTypeIcon
                                                                            type={platform.type}
                                                                        />
                                                                        {platform.name}
                                                                    </span>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>

                                <div className="mt-6 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold text-foreground">
                                            Platform Management
                                        </h3>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setShowAddPlatform(true)}
                                            className="text-foreground hover:text-accent-foreground"
                                        >
                                            <Plus className="h-4 w-4 mr-1" />
                                            Add Platform
                                        </Button>
                                    </div>

                                    {showAddPlatform && (
                                        <Card className="border-border">
                                            <CardHeader>
                                                <CardTitle className="text-base">
                                                    Add New Platform
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-foreground">
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
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-foreground">
                                                        Platform Type
                                                    </label>
                                                    <Select
                                                        value={newPlatform.type}
                                                        onValueChange={(value) =>
                                                            setNewPlatform({
                                                                ...newPlatform,
                                                                type: value,
                                                            })
                                                        }
                                                    >
                                                        <SelectTrigger className="bg-background text-foreground">
                                                            <SelectValue placeholder="Select platform type" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="twitter">
                                                                Twitter
                                                            </SelectItem>
                                                            <SelectItem value="facebook">
                                                                Facebook
                                                            </SelectItem>
                                                            <SelectItem value="instagram">
                                                                Instagram
                                                            </SelectItem>
                                                            <SelectItem value="linkedin">
                                                                LinkedIn
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() => {
                                                            setShowAddPlatform(false);
                                                            setNewPlatform({ name: "", type: "" });
                                                        }}
                                                    >
                                                        Cancel
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        onClick={handleAddPlatform}
                                                        disabled={!newPlatform.name.trim()}
                                                    >
                                                        Add Platform
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {platforms.map((platform) => (
                                            <Card
                                                key={platform.id}
                                                className={`border-border ${
                                                    values.platform_ids.includes(platform.id)
                                                        ? "bg-primary/5"
                                                        : "bg-card"
                                                }`}
                                            >
                                                <CardHeader className="p-4">
                                                    {editMode && editingPlatform === platform.id ? (
                                                        <div className="space-y-4">
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium text-foreground">
                                                                    Platform Name
                                                                </label>
                                                                <Input
                                                                    type="text"
                                                                    value={editPlatformData.name}
                                                                    onChange={(e) =>
                                                                        setEditPlatformData((prev) => ({
                                                                            ...prev,
                                                                            name: e.target.value,
                                                                        }))
                                                                    }
                                                                    placeholder="Enter platform name"
                                                                    className="bg-background text-foreground"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium text-foreground">
                                                                    Platform Type
                                                                </label>
                                                                <Select
                                                                    value={editPlatformData.type}
                                                                    onValueChange={(value) =>
                                                                        setEditPlatformData((prev) => ({
                                                                            ...prev,
                                                                            type: value,
                                                                        }))
                                                                    }
                                                                >
                                                                    <SelectTrigger className="bg-background text-foreground">
                                                                        <SelectValue placeholder="Select platform type" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="twitter">Twitter</SelectItem>
                                                                        <SelectItem value="facebook">Facebook</SelectItem>
                                                                        <SelectItem value="instagram">Instagram</SelectItem>
                                                                        <SelectItem value="linkedin">LinkedIn</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                            <div className="flex justify-end gap-2">
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    onClick={cancelEditPlatform}
                                                                    size="sm"
                                                                >
                                                                    Cancel
                                                                </Button>
                                                                <Button
                                                                    type="button"
                                                                    onClick={saveEditPlatform}
                                                                    disabled={!editPlatformData.name.trim()}
                                                                    size="sm"
                                                                >
                                                                    Save Changes
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <Checkbox
                                                                    id={`platform-${platform.id}`}
                                                                    checked={values.platform_ids.includes(platform.id)}
                                                                    onCheckedChange={(checked) => {
                                                                        const next = checked
                                                                            ? [...values.platform_ids, platform.id]
                                                                            : values.platform_ids.filter(
                                                                                  (id) => id !== platform.id
                                                                              );
                                                                        setFieldValue("platform_ids", next);
                                                                    }}
                                                                    disabled={submitting}
                                                                />
                                                                <div className="flex items-center gap-1.5">
                                                                    <PlatformTypeIcon type={platform.type} />
                                                                    <span className="font-medium text-foreground">
                                                                        {platform.name}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => startEditPlatform(platform)}
                                                                    className="text-muted-foreground hover:text-foreground"
                                                                >
                                                                    <Pencil className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => handleDeletePlatform(platform.id)}
                                                                    className="text-destructive hover:text-destructive-foreground"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </CardHeader>
                                            </Card>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <Button
                                        type="submit"
                                        disabled={
                                            submitting ||
                                            !isValid ||
                                            (reachedPostLimit &&
                                                values.status === "scheduled" &&
                                                !post)
                                        }
                                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                                    >
                                        {submitting ? (
                                            <div className="flex items-center justify-center">
                                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                {post ? "Updating..." : "Creating..."}
                                            </div>
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
                        <AlertDialogContent className="bg-background border-border">
                            <AlertDialogHeader>
                                <AlertDialogTitle className="text-foreground">
                                    Are you absolutely sure?
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-muted-foreground">
                                    This action cannot be undone. This will
                                    permanently delete the platform and remove it
                                    from any associated posts.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel className="bg-background text-foreground border-input hover:bg-accent hover:text-accent-foreground">
                                    Cancel
                                </AlertDialogCancel>
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
            </div>
        </AuthenticatedLayout>
    );
}
