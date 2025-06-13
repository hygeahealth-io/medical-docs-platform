import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import AdminLayout from "@/components/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ArrowLeft, Upload, Mail, Phone, User } from "lucide-react";
import { Link, useLocation } from "wouter";

const createUserSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phoneNumber: z.string().optional(),
  role: z.enum(["admin", "user"]),
  tier: z.enum(["standard", "gold", "platinum"]),
  password: z.string().min(8, "Password must be at least 8 characters"),
  viewAnalytics: z.boolean().default(false),
  manageUsers: z.boolean().default(false),
  editSettings: z.boolean().default(false),
  accountStatus: z.boolean().default(true),
  ipAccessRestrictions: z.string().optional(),
  twoFactorAuth: z.boolean().default(false),
});

type CreateUserForm = z.infer<typeof createUserSchema>;

export default function AdminCreateUser() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

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

  const form = useForm<CreateUserForm>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      role: "user",
      tier: "standard",
      password: "",
      viewAnalytics: false,
      manageUsers: false,
      editSettings: false,
      accountStatus: true,
      ipAccessRestrictions: "",
      twoFactorAuth: false,
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (userData: CreateUserForm) => {
      await apiRequest("POST", "/api/admin/users", userData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User created successfully",
      });
      setLocation("/admin/member-management");
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
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
        description: "Failed to create user",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateUserForm) => {
    createUserMutation.mutate(data);
  };

  const generatePassword = () => {
    const password = Math.random().toString(36).slice(-12);
    form.setValue("password", password);
  };

  if (isLoading || !isAuthenticated) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
            <Link href="/admin/member-management" className="flex items-center hover:text-gray-700">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Link>
            <span>Admin</span>
            <span>></span>
            <span>Member Management</span>
            <span>></span>
            <span>Create User</span>
          </nav>
          <h2 className="text-2xl font-bold text-gray-900">Create New User</h2>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                            <Input placeholder="Enter email address" className="pl-10" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                            <Input placeholder="Enter phone number" className="pl-10" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div>
                    <Label>Profile Picture</Label>
                    <div className="mt-2 flex items-center justify-center border-2 border-gray-300 border-dashed rounded-lg h-24">
                      <div className="text-center">
                        <Upload className="mx-auto h-6 w-6 text-gray-400" />
                        <span className="text-sm text-gray-500">Upload Photo</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Access Control */}
            <Card>
              <CardHeader>
                <CardTitle>Access Control</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="user">User</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tier"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Membership Tier *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select tier" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="standard">Standard</SelectItem>
                            <SelectItem value="gold">Gold</SelectItem>
                            <SelectItem value="platinum">Platinum</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div>
                  <Label className="text-base font-medium">Access Permissions</Label>
                  <div className="mt-4 space-y-4">
                    <FormField
                      control={form.control}
                      name="viewAnalytics"
                      render={({ field }) => (
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="viewAnalytics"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <label htmlFor="viewAnalytics" className="text-sm font-medium">
                            View Analytics
                          </label>
                        </div>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="manageUsers"
                      render={({ field }) => (
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="manageUsers"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <label htmlFor="manageUsers" className="text-sm font-medium">
                            Manage Users
                          </label>
                        </div>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="editSettings"
                      render={({ field }) => (
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="editSettings"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <label htmlFor="editSettings" className="text-sm font-medium">
                            Edit Settings
                          </label>
                        </div>
                      )}
                    />
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="accountStatus"
                  render={({ field }) => (
                    <div className="flex items-center space-x-3">
                      <Label htmlFor="accountStatus" className="text-sm font-medium">
                        Account Status
                      </Label>
                      <Switch
                        id="accountStatus"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </div>
                  )}
                />
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="space-y-2">
                            <Input
                              type="password"
                              placeholder="Enter password"
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={generatePassword}
                            >
                              Generate
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="ipAccessRestrictions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>IP Access Restrictions</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter IP addresses (optional)"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="twoFactorAuth"
                  render={({ field }) => (
                    <div className="flex items-center space-x-3">
                      <Label htmlFor="twoFactorAuth" className="text-sm font-medium">
                        Two-factor Authentication
                      </Label>
                      <Switch
                        id="twoFactorAuth"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </div>
                  )}
                />
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation("/admin/member-management")}
              >
                Cancel
              </Button>
              <Button type="button" variant="outline">
                Save as Draft
              </Button>
              <Button
                type="submit"
                className="bg-medical-teal hover:bg-medical-teal-dark"
                disabled={createUserMutation.isPending}
              >
                {createUserMutation.isPending ? "Creating..." : "Create User"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </AdminLayout>
  );
}
