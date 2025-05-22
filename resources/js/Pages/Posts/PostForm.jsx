import { useState, useEffect } from "react";
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
import { Calendar, Globe, CheckCircle, AlertCircle, Image as ImageIcon } from "lucide-react";

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

// Platform character limits for different social media platforms
const PLATFORM_LIMITS = {
    twitter: 280,
    instagram: 2200,
    linkedin: 3000,
    facebook: 63206
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
    const [contentLength, setContentLength] = useState(post?.content?.length || 0);
    const [selectedPlatformTypes, setSelectedPlatformTypes] = useState([]);
    const [dailyPostCount, setDailyPostCount] = useState(0);
    const [reachedPostLimit, setReachedPostLimit] = useState(false);

    // Check daily post limit (max 10 per day)
    useEffect(() => {
        // Fetch daily post count from API
        fetch('/api/posts/filter/date/' + new Date().toISOString().split('T')[0])
            .then(response => response.json())
            .then(data => {
                const count = data.length;
                setDailyPostCount(count);
                setReachedPostLimit(count >= 10);
            })
            .catch(error => {
                console.error('Error fetching daily post count:', error);
            });
    }, []);

    // Update selected platform types when platform_ids change
    useEffect(() => {
        if (platforms) {
            const updateSelectedTypes = (platformIds) => {
                const types = platforms
                    .filter(p => platformIds.includes(p.id))
                    .map(p => p.type?.toLowerCase());
                setSelectedPlatformTypes(types);
            };
            
            if (post?.platforms) {
                updateSelectedTypes(post.platforms.map(p => p.id));
            }
        }
    }, [platforms, post]);

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

    // Get the most restrictive character limit from selected platforms
    const getCharacterLimit = (platformTypes) => {
        if (!platformTypes || platformTypes.length === 0) return Infinity;
        
        return platformTypes.reduce((limit, type) => {
            const platformLimit = PLATFORM_LIMITS[type?.toLowerCase()] || Infinity;
            return Math.min(limit, platformLimit);
        }, Infinity);
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
        // Check daily post limit
        if (values.status === 'scheduled' && dailyPostCount >= 10 && !post) {
            toast({
                title: "Daily Limit Reached",
                description: "You can only schedule up to 10 posts per day.",
                variant: "destructive",
            });
            return;
        }
        
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

    function PlatformTypeIcon({ type }) {
        const lowerType = type?.toLowerCase();
        
        switch(lowerType) {
            case 'twitter':
                return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M21.543 7.104c.015.211.015.423.015.636 0 6.507-4.954 14.01-14.01 14.01v-.003A13.94 13.94 0 0 1 1 19.539a9.88 9.88 0 0 0 7.287-2.041 4.93 4.93 0 0 1-4.6-3.42 4.916 4.916 0 0 0 2.223-.084A4.926 4.926 0 0 1 1.999 9.17v-.062a4.887 4.887 0 0 0 2.235.616A4.928 4.928 0 0 1 2.46 3.44a13.979 13.979 0 0 0 10.15 5.147 4.929 4.929 0 0 1 8.391-4.491 9.868 9.868 0 0 0 3.128-1.196 4.941 4.941 0 0 1-2.165 2.724A9.828 9.828 0 0 0 24 4.89a10.019 10.019 0 0 1-2.457 2.549v-.001z"/></svg>;
            case 'facebook':
                return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>;
            case 'instagram':
                return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>;
            case 'linkedin':
                return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>;
            default:
                return <Globe className="h-4 w-4" />;
        }
    }

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
                    {({ values, errors, touched, setFieldValue, isValid }) => (
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
                                            className={`${errors.title && touched.title ? 'border-red-500' : ''}`}
                                        />
                                        {errors.title && touched.title && (
                                            <InputError message={errors.title} className="mt-1" />
                                        )}
                                    </div>

                                    <div className="mb-5">
                                        <label
                                            htmlFor="content"
                                            className="block font-semibold mb-2 text-foreground"
                                        >
                                            Content
                                        </label>
                                        <div className="flex justify-between mb-1">
                                            <span className={`text-sm ${
                                                contentLength > getCharacterLimit(selectedPlatformTypes) 
                                                    ? 'text-red-500' 
                                                    : contentLength > getCharacterLimit(selectedPlatformTypes) * 0.9 
                                                        ? 'text-amber-500' 
                                                        : 'text-gray-500'
                                            }`}>
                                                {contentLength} / {getCharacterLimit(selectedPlatformTypes) === Infinity 
                                                    ? '∞' 
                                                    : getCharacterLimit(selectedPlatformTypes)}
                                            </span>
                                        </div>
                                        <Field
                                            as={Textarea}
                                            id="content"
                                            name="content"
                                            rows={5}
                                            disabled={submitting}
                                            className={`${errors.content && touched.content ? 'border-red-500' : ''}`}
                                            onChange={(e) => {
                                                setFieldValue('content', e.target.value);
                                                setContentLength(e.target.value.length);
                                            }}
                                        />
                                        {errors.content && touched.content && (
                                            <InputError message={errors.content} className="mt-1" />
                                        )}
                                        {contentLength > getCharacterLimit(selectedPlatformTypes) && (
                                            <p className="text-red-500 text-sm mt-1">
                                                Content exceeds the character limit for selected platforms!
                                            </p>
                                        )}
                                    </div>

                                    <div className="mb-5">
                                        <label
                                            htmlFor="image_url"
                                            className="block font-semibold mb-2 text-foreground"
                                        >
                                            Image Upload
                                        </label>
                                        <div className="flex items-center space-x-4">
                                            <div 
                                                className="border border-dashed border-gray-300 rounded-lg p-4 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                                                onClick={() => document.getElementById('image_url').click()}
                                                style={{ height: '120px', width: '120px' }}
                                            >
                                                {imagePreview ? (
                                                    <img 
                                                        src={typeof imagePreview === 'string' ? imagePreview : URL.createObjectURL(imagePreview)} 
                                                        alt="Preview" 
                                                        className="h-full w-full object-cover rounded-lg"
                                                    />
                                                ) : (
                                                    <div className="text-center">
                                                        <ImageIcon className="mx-auto h-10 w-10 text-gray-400" />
                                                        <p className="mt-1 text-xs text-gray-500">Click to upload</p>
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
                                                        setFieldValue('image_url', file);
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
                                                        setFieldValue('image_url', '');
                                                        setImagePreview(null);
                                                    }}
                                                >
                                                    Remove
                                                </Button>
                                            )}
                                        </div>
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
                                                className={`${errors.scheduled_time && touched.scheduled_time ? 'border-red-500' : ''}`}
                                            />
                                            {errors.scheduled_time && touched.scheduled_time && (
                                                <InputError message={errors.scheduled_time} className="mt-1" />
                                            )}
                                            {reachedPostLimit && !post && (
                                                <p className="text-red-500 text-sm mt-1">
                                                    You've reached the daily limit of 10 scheduled posts.
                                                </p>
                                            )}
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
                                    disabled={submitting || !isValid || (reachedPostLimit && values.status === 'scheduled' && !post)}
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
