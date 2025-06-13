import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Layout from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { 
  User, 
  Shield, 
  CreditCard, 
  Bell, 
  Smartphone,
  Globe,
  Eye,
  EyeOff,
  CheckCircle,
  ArrowLeft,
  Save
} from "lucide-react";

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

export default function Settings() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
    },
  });

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Reset form when user data loads
  useEffect(() => {
    if (user) {
      profileForm.reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
      });
    }
  }, [user, profileForm]);

  const { data: extensionSettings } = useQuery({
    queryKey: ["/api/extension-settings"],
    retry: false,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileForm) => {
      // In a real implementation, this would update the user profile
      console.log("Updating profile:", data);
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive",
      });
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: async (data: PasswordForm) => {
      // In a real implementation, this would update the password
      console.log("Updating password");
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Password Updated",
        description: "Your password has been updated successfully.",
      });
      passwordForm.reset();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update password.",
        variant: "destructive",
      });
    },
  });

  const updateExtensionSettingsMutation = useMutation({
    mutationFn: async (settings: any) => {
      await apiRequest("POST", "/api/extension-settings", settings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/extension-settings"] });
      toast({
        title: "Settings Updated",
        description: "Extension settings have been updated successfully.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update extension settings.",
        variant: "destructive",
      });
    },
  });

  const onProfileSubmit = (data: ProfileForm) => {
    updateProfileMutation.mutate(data);
  };

  const onPasswordSubmit = (data: PasswordForm) => {
    updatePasswordMutation.mutate(data);
  };

  const handleExtensionToggle = (enabled: boolean) => {
    updateExtensionSettingsMutation.mutate({
      isEnabled: enabled,
      settings: extensionSettings?.settings || {},
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-teal"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-6">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.location.href = '/'}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600">Manage your account preferences and security settings</p>
          </div>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>Security</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center space-x-2">
              <Bell className="w-4 h-4" />
              <span>Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center space-x-2">
              <CreditCard className="w-4 h-4" />
              <span>Billing</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Update your personal details and profile information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={profileForm.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={profileForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} />
                          </FormControl>
                          <FormDescription>
                            Your email address is used for login and notifications
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end pt-4">
                      <Button 
                        type="submit" 
                        className="bg-medical-teal hover:bg-medical-teal/90"
                        disabled={updateProfileMutation.isPending}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Account Status */}
            <Card>
              <CardHeader>
                <CardTitle>Account Status</CardTitle>
                <CardDescription>
                  Your current account information and membership details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Account Status</Label>
                    <p className="text-sm text-gray-500">Your account is currently active</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    ACTIVE
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Membership Tier</Label>
                    <p className="text-sm text-gray-500">Current subscription level</p>
                  </div>
                  <Badge className={`${
                    user?.tier === 'platinum' ? 'bg-purple-100 text-purple-800' :
                    user?.tier === 'gold' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {user?.tier?.toUpperCase()}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Account Role</Label>
                    <p className="text-sm text-gray-500">Your permission level</p>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {user?.role}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                  Update your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                    <FormField
                      control={passwordForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                type={showCurrentPassword ? "text" : "password"}
                                {...field} 
                              />
                              <button
                                type="button"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                              >
                                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={passwordForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                type={showNewPassword ? "text" : "password"}
                                {...field} 
                              />
                              <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                              >
                                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </FormControl>
                          <FormDescription>
                            Password must be at least 8 characters long
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={passwordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm New Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                type={showConfirmPassword ? "text" : "password"}
                                {...field} 
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                              >
                                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end pt-4">
                      <Button 
                        type="submit" 
                        className="bg-medical-teal hover:bg-medical-teal/90"
                        disabled={updatePasswordMutation.isPending}
                      >
                        {updatePasswordMutation.isPending ? "Updating..." : "Update Password"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Two-Factor Authentication</CardTitle>
                <CardDescription>
                  Add an extra layer of security to your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center space-x-3">
                    <Smartphone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">SMS Authentication</p>
                      <p className="text-xs text-gray-500">Receive codes via text message</p>
                    </div>
                  </div>
                  <Switch />
                </div>
                
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center space-x-3">
                    <Smartphone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Authenticator App</p>
                      <p className="text-xs text-gray-500">Use an authenticator app for codes</p>
                    </div>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Email Notifications</CardTitle>
                <CardDescription>
                  Manage what email notifications you receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Account Updates</p>
                    <p className="text-xs text-gray-500">Receive notifications about account changes and security alerts</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Feature Updates</p>
                    <p className="text-xs text-gray-500">Get notified when new features are available</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Billing Notifications</p>
                    <p className="text-xs text-gray-500">Payment confirmations and billing reminders</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Marketing Communications</p>
                    <p className="text-xs text-gray-500">Tips, surveys, and promotional content</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Chrome Extension</CardTitle>
                <CardDescription>
                  Configure your browser extension settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center space-x-3">
                    <Globe className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Browser Extension</p>
                      <p className="text-xs text-gray-500">Enable Chrome extension integration</p>
                    </div>
                  </div>
                  <Switch 
                    checked={extensionSettings?.isEnabled || false}
                    onCheckedChange={handleExtensionToggle}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Billing Information</CardTitle>
                <CardDescription>
                  View and manage your subscription and payment details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-3">
                  <div>
                    <Label className="text-base">Current Plan</Label>
                    <p className="text-sm text-gray-500">Your active subscription</p>
                  </div>
                  <div className="text-right">
                    <Badge className={`${
                      user?.tier === 'platinum' ? 'bg-purple-100 text-purple-800' :
                      user?.tier === 'gold' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {user?.tier?.toUpperCase()}
                    </Badge>
                    <p className="text-sm text-gray-500 mt-1">
                      ${user?.tier === 'platinum' ? '79' : user?.tier === 'gold' ? '49' : '29'}/month
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between py-3">
                  <div>
                    <Label className="text-base">Next Billing Date</Label>
                    <p className="text-sm text-gray-500">When your next payment is due</p>
                  </div>
                  <p className="text-sm font-medium">
                    {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="flex items-center justify-between py-3">
                  <div>
                    <Label className="text-base">Payment Method</Label>
                    <p className="text-sm text-gray-500">Your default payment method</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">•••• •••• •••• 4242</p>
                    <p className="text-xs text-gray-500">Expires 12/25</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Billing Actions</CardTitle>
                <CardDescription>
                  Manage your subscription and payment settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => window.location.href = '/membership'}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Change Plan
                </Button>
                
                <Button variant="outline" className="w-full justify-start">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Update Payment Method
                </Button>
                
                <Button variant="outline" className="w-full justify-start">
                  <Bell className="w-4 h-4 mr-2" />
                  Download Invoice
                </Button>
                
                <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
                  Cancel Subscription
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
