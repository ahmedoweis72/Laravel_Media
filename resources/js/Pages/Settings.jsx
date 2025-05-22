import { useState, useEffect } from "react";
import { Inertia } from "@inertiajs/inertia";
import { usePage } from "@inertiajs/react";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/Components/ui/dialog";
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
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/Components/ui/tabs";
import { Checkbox } from "@/Components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Edit, Trash2, Facebook, Twitter, Linkedin, Instagram, Globe, User, Lock, Bell, UserCog } from "lucide-react";
import DashboardLayout from "@/Layouts/DashboardLayout";

export default function Settings({ initialPlatforms = [] }) {
    const { toast } = useToast();
    const { auth } = usePage().props;
    const [platforms, setPlatforms] = useState(initialPlatforms);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [newPlatform, setNewPlatform] = useState({
        name: "",
        type: "other",
        is_active: true,
        api_key: "",
        api_secret: "",
        access_token: "",
    });
    const [selectedPlatform, setSelectedPlatform] = useState(null);
    const [editPlatform, setEditPlatform] = useState({
        name: "",
        type: "",
        is_active: true,
        api_key: "",
        api_secret: "",
        access_token: "",
    });
    const [activeTab, setActiveTab] = useState("social-platforms");

    // Load platforms from API if needed
    useEffect(() => {
        if (initialPlatforms.length === 0) {
            fetchPlatforms();
        }
    }, [initialPlatforms]);

    const fetchPlatforms = async () => {
        // Use Inertia reload to refresh the page data
        Inertia.reload({ only: ['initialPlatforms'] })
            .then(() => {
                // Update platforms from the new props when they arrive
                const { initialPlatforms: newPlatforms } = usePage().props;
                setPlatforms(newPlatforms);
            })
            .catch(error => {
                console.error("Error fetching platforms:", error);
                toast({
                    title: "Error",
                    description: "Failed to load platforms",
                    variant: "destructive",
                });
            });
    };

    const handleAddPlatform = async () => {
        if (!newPlatform.name.trim()) {
            toast({
                title: "Error",
                description: "Platform name is required",
                variant: "destructive",
            });
            return;
        }

        try {
            // Use Inertia to make the API call
            Inertia.post(route("platforms.store"), newPlatform, {
                onSuccess: () => {
                    setNewPlatform({
                        name: "",
                        type: "other",
                        is_active: true,
                        api_key: "",
                        api_secret: "",
                        access_token: "",
                    });
                    setIsAddDialogOpen(false);
                    toast({
                        title: "Success",
                        description: "Platform created successfully",
                    });
                    // Reload the platforms list
                    fetchPlatforms();
                },
                onError: (errors) => {
                    console.error("Error creating platform:", errors);
                    toast({
                        title: "Error",
                        description: "Failed to create platform",
                        variant: "destructive",
                    });
                }
            });
        } catch (error) {
            console.error("Error creating platform:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to create platform",
                variant: "destructive",
            });
        }
    };

    const handleEditPlatform = async () => {
        if (!editPlatform.name.trim()) {
            toast({
                title: "Error",
                description: "Platform name is required",
                variant: "destructive",
            });
            return;
        }

        try {
            // Use Inertia to make the API call
            Inertia.put(route("platforms.update", selectedPlatform.id), editPlatform, {
                onSuccess: () => {
                    setIsEditDialogOpen(false);
                    toast({
                        title: "Success",
                        description: "Platform updated successfully",
                    });
                    // Reload the platforms list
                    fetchPlatforms();
                },
                onError: (errors) => {
                    console.error("Error updating platform:", errors);
                    toast({
                        title: "Error",
                        description: "Failed to update platform",
                        variant: "destructive",
                    });
                }
            });
        } catch (error) {
            console.error("Error updating platform:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to update platform",
                variant: "destructive",
            });
        }
    };

    const handleDeletePlatform = async () => {
        try {
            // Use Inertia to make the API call
            Inertia.delete(route("platforms.destroy", selectedPlatform.id), {
                onSuccess: () => {
                    setIsDeleteDialogOpen(false);
                    toast({
                        title: "Success",
                        description: "Platform deleted successfully",
                    });
                    // Reload the platforms list
                    fetchPlatforms();
                },
                onError: (errors) => {
                    console.error("Error deleting platform:", errors);
                    toast({
                        title: "Error",
                        description: "Failed to delete platform",
                        variant: "destructive",
                    });
                }
            });
        } catch (error) {
            console.error("Error deleting platform:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to delete platform",
                variant: "destructive",
            });
        }
    };

    const handleEditClick = (platform) => {
        setSelectedPlatform(platform);
        setEditPlatform({
            name: platform.name,
            type: platform.type || "other",
            is_active: platform.is_active || true,
            api_key: platform.api_key || "",
            api_secret: platform.api_secret || "",
            access_token: platform.access_token || "",
        });
        setIsEditDialogOpen(true);
    };

    const handleDeleteClick = (platform) => {
        setSelectedPlatform(platform);
        setIsDeleteDialogOpen(true);
    };

    // Helper function to render platform icons
    const renderPlatformIcon = (type) => {
        switch (type?.toLowerCase()) {
            case "facebook":
                return <Facebook className="h-5 w-5 text-blue-600" />;
            case "twitter":
                return <Twitter className="h-5 w-5 text-blue-400" />;
            case "linkedin":
                return <Linkedin className="h-5 w-5 text-blue-700" />;
            case "instagram":
                return <Instagram className="h-5 w-5 text-pink-600" />;
            default:
                return <Globe className="h-5 w-5 text-gray-500" />;
        }
    };

    const platformTypes = [
        { value: "facebook", label: "Facebook" },
        { value: "twitter", label: "Twitter" },
        { value: "instagram", label: "Instagram" },
        { value: "linkedin", label: "LinkedIn" },
        { value: "other", label: "Other" },
    ];

    const SettingsContent = () => (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold mb-6">Account Settings</h2>
                
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                        <TabsTrigger value="social-platforms" className="flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            Social Platforms
                        </TabsTrigger>
                        <TabsTrigger value="profile" className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Profile
                        </TabsTrigger>
                        <TabsTrigger value="security" className="flex items-center gap-2">
                            <Lock className="h-4 w-4" />
                            Security
                        </TabsTrigger>
                        <TabsTrigger value="notifications" className="flex items-center gap-2">
                            <Bell className="h-4 w-4" />
                            Notifications
                        </TabsTrigger>
                    </TabsList>

                    {/* Social Platforms Tab */}
                    <TabsContent value="social-platforms">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Social Media Platforms</CardTitle>
                                    <CardDescription>
                                        Connect your social media accounts for scheduling posts.
                                    </CardDescription>
                                </div>
                                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button className="flex gap-1 items-center">
                                            <PlusCircle className="h-4 w-4" />
                                            Add Platform
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Add New Platform</DialogTitle>
                                            <DialogDescription>
                                                Enter details for the new social media platform.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4 py-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="name">Platform Name</Label>
                                                <Input
                                                    id="name"
                                                    placeholder="e.g. My Facebook Page"
                                                    value={newPlatform.name}
                                                    onChange={(e) => setNewPlatform({ ...newPlatform, name: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="type">Platform Type</Label>
                                                <Select
                                                    value={newPlatform.type}
                                                    onValueChange={(value) => setNewPlatform({ ...newPlatform, type: value })}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select platform type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="facebook">Facebook</SelectItem>
                                                        <SelectItem value="twitter">Twitter</SelectItem>
                                                        <SelectItem value="instagram">Instagram</SelectItem>
                                                        <SelectItem value="linkedin">LinkedIn</SelectItem>
                                                        <SelectItem value="other">Other</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="api_key">API Key</Label>
                                                <Input
                                                    id="api_key"
                                                    type="text"
                                                    placeholder="API Key"
                                                    value={newPlatform.api_key}
                                                    onChange={(e) => setNewPlatform({ ...newPlatform, api_key: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="api_secret">API Secret</Label>
                                                <Input
                                                    id="api_secret"
                                                    type="password"
                                                    placeholder="API Secret"
                                                    value={newPlatform.api_secret}
                                                    onChange={(e) => setNewPlatform({ ...newPlatform, api_secret: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="access_token">Access Token</Label>
                                                <Input
                                                    id="access_token"
                                                    type="text"
                                                    placeholder="Access Token (optional)"
                                                    value={newPlatform.access_token}
                                                    onChange={(e) => setNewPlatform({ ...newPlatform, access_token: e.target.value })}
                                                />
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="is_active"
                                                    checked={newPlatform.is_active}
                                                    onCheckedChange={(checked) => setNewPlatform({ ...newPlatform, is_active: checked })}
                                                />
                                                <label
                                                    htmlFor="is_active"
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                    Active
                                                </label>
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                                                Cancel
                                            </Button>
                                            <Button onClick={handleAddPlatform}>Add Platform</Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {platforms.length > 0 ? (
                                        platforms.map((platform) => (
                                            <div
                                                key={platform.id}
                                                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg"
                                            >
                                                <div className="flex items-center gap-3 mb-3 sm:mb-0">
                                                    <div className="bg-primary/10 p-2 rounded-full">
                                                        {renderPlatformIcon(platform.type)}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-medium">{platform.name}</h3>
                                                        <p className="text-sm text-muted-foreground capitalize">
                                                            {platform.type}
                                                            <span className={`ml-2 inline-block w-2 h-2 rounded-full ${platform.is_active ? "bg-green-500" : "bg-red-500"}`}></span>
                                                            <span className="ml-1 text-xs">{platform.is_active ? "Active" : "Inactive"}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleEditClick(platform)}
                                                    >
                                                        <Edit className="h-4 w-4 mr-1" />
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => handleDeleteClick(platform)}
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-1" />
                                                        Delete
                                                    </Button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center p-6 border border-dashed rounded-lg">
                                            <Globe className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                                            <h3 className="font-medium mb-1">No platforms added yet</h3>
                                            <p className="text-muted-foreground mb-4">Add social media platforms to start scheduling posts</p>
                                            <Button
                                                onClick={() => setIsAddDialogOpen(true)}
                                                className="flex items-center gap-1 mx-auto"
                                            >
                                                <PlusCircle className="h-4 w-4" />
                                                Add Your First Platform
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Profile Tab */}
                    <TabsContent value="profile">
                        <Card>
                            <CardHeader>
                                <CardTitle>Profile Settings</CardTitle>
                                <CardDescription>
                                    Update your account profile information.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="display-name">Display Name</Label>
                                    <Input id="display-name" defaultValue={auth?.user?.name} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" defaultValue={auth?.user?.email} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="bio">Bio</Label>
                                    <textarea 
                                        id="bio" 
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="Tell us a bit about yourself"
                                    />
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button>Save Changes</Button>
                            </CardFooter>
                        </Card>
                    </TabsContent>

                    {/* Security Tab */}
                    <TabsContent value="security">
                        <Card>
                            <CardHeader>
                                <CardTitle>Security Settings</CardTitle>
                                <CardDescription>
                                    Update your password and security preferences.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="current-password">Current Password</Label>
                                    <Input id="current-password" type="password" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="new-password">New Password</Label>
                                    <Input id="new-password" type="password" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                                    <Input id="confirm-password" type="password" />
                                </div>
                                <div className="flex items-center space-x-2 pt-2">
                                    <Checkbox id="two-factor" />
                                    <Label htmlFor="two-factor">Enable two-factor authentication</Label>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button>Update Password</Button>
                            </CardFooter>
                        </Card>
                    </TabsContent>

                    {/* Notifications Tab */}
                    <TabsContent value="notifications">
                        <Card>
                            <CardHeader>
                                <CardTitle>Notification Settings</CardTitle>
                                <CardDescription>
                                    Configure how and when you want to be notified.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center border-b pb-3">
                                        <div>
                                            <Label className="text-base">Email Notifications</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Receive notifications via email
                                            </p>
                                        </div>
                                        <Checkbox id="email-notifications" defaultChecked />
                                    </div>
                                    <div className="flex justify-between items-center border-b pb-3">
                                        <div>
                                            <Label className="text-base">Post Published</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Get notified when your posts are published
                                            </p>
                                        </div>
                                        <Checkbox id="post-published" defaultChecked />
                                    </div>
                                    <div className="flex justify-between items-center border-b pb-3">
                                        <div>
                                            <Label className="text-base">Post Failed</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Get notified when posts fail to publish
                                            </p>
                                        </div>
                                        <Checkbox id="post-failed" defaultChecked />
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <Label className="text-base">Marketing Updates</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Receive news and product updates
                                            </p>
                                        </div>
                                        <Checkbox id="marketing" />
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button>Save Preferences</Button>
                            </CardFooter>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );

    return (
        <DashboardLayout title="Settings">
            <SettingsContent />
            
            {/* Edit Platform Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Platform</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">Platform Name</Label>
                            <Input
                                id="edit-name"
                                value={editPlatform.name}
                                onChange={(e) => setEditPlatform({ ...editPlatform, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-type">Platform Type</Label>
                            <Select
                                value={editPlatform.type}
                                onValueChange={(value) => setEditPlatform({ ...editPlatform, type: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select platform type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="facebook">Facebook</SelectItem>
                                    <SelectItem value="twitter">Twitter</SelectItem>
                                    <SelectItem value="instagram">Instagram</SelectItem>
                                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-api-key">API Key</Label>
                            <Input
                                id="edit-api-key"
                                type="text"
                                value={editPlatform.api_key}
                                onChange={(e) => setEditPlatform({ ...editPlatform, api_key: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-api-secret">API Secret</Label>
                            <Input
                                id="edit-api-secret"
                                type="password"
                                value={editPlatform.api_secret}
                                onChange={(e) => setEditPlatform({ ...editPlatform, api_secret: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-access-token">Access Token</Label>
                            <Input
                                id="edit-access-token"
                                type="text"
                                value={editPlatform.access_token}
                                onChange={(e) => setEditPlatform({ ...editPlatform, access_token: e.target.value })}
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="edit-is-active"
                                checked={editPlatform.is_active}
                                onCheckedChange={(checked) => setEditPlatform({ ...editPlatform, is_active: checked })}
                            />
                            <label
                                htmlFor="edit-is-active"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Active
                            </label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleEditPlatform}>Update Platform</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Platform Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the platform {selectedPlatform?.name} and remove all its data.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeletePlatform}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </DashboardLayout>
    );
} 