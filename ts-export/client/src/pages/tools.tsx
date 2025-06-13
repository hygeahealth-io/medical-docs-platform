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
import TierGuard from "@/components/tier-guard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Download, 
  Upload,
  Keyboard,
  TestTube,
  RotateCcw
} from "lucide-react";

const keyBindingSchema = z.object({
  shortcut: z.string().min(1, "Shortcut is required"),
  template: z.string().min(1, "Template is required"),
  category: z.string().min(1, "Category is required"),
  isActive: z.boolean().default(true),
});

type KeyBindingForm = z.infer<typeof keyBindingSchema>;

export default function Tools() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBinding, setEditingBinding] = useState<any>(null);
  const [testText, setTestText] = useState("");

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

  const form = useForm<KeyBindingForm>({
    resolver: zodResolver(keyBindingSchema),
    defaultValues: {
      shortcut: "",
      template: "",
      category: "Clinical Notes",
      isActive: true,
    },
  });

  const { data: keyBindings, isLoading: bindingsLoading } = useQuery({
    queryKey: ["/api/key-bindings"],
    retry: false,
  });

  const createBindingMutation = useMutation({
    mutationFn: async (data: KeyBindingForm) => {
      await apiRequest("POST", "/api/key-bindings", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/key-bindings"] });
      toast({
        title: "Key Binding Created",
        description: "Your new key binding has been saved successfully.",
      });
      setDialogOpen(false);
      form.reset();
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
        description: "Failed to create key binding.",
        variant: "destructive",
      });
    },
  });

  const updateBindingMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<KeyBindingForm> }) => {
      await apiRequest("PUT", `/api/key-bindings/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/key-bindings"] });
      toast({
        title: "Key Binding Updated",
        description: "Key binding has been updated successfully.",
      });
      setEditingBinding(null);
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
        description: "Failed to update key binding.",
        variant: "destructive",
      });
    },
  });

  const deleteBindingMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/key-bindings/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/key-bindings"] });
      toast({
        title: "Key Binding Deleted",
        description: "Key binding has been deleted successfully.",
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
        description: "Failed to delete key binding.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: KeyBindingForm) => {
    if (editingBinding) {
      updateBindingMutation.mutate({ id: editingBinding.id, data });
    } else {
      createBindingMutation.mutate(data);
    }
  };

  const toggleBindingStatus = (id: number, isActive: boolean) => {
    updateBindingMutation.mutate({ id, data: { isActive: !isActive } });
  };

  const openEditDialog = (binding: any) => {
    setEditingBinding(binding);
    form.reset({
      shortcut: binding.shortcut,
      template: binding.template,
      category: binding.category,
      isActive: binding.isActive,
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingBinding(null);
    form.reset();
  };

  const clearTestArea = () => {
    setTestText("");
  };

  if (isLoading || bindingsLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-teal"></div>
        </div>
      </Layout>
    );
  }

  const filteredBindings = keyBindings?.filter((binding: any) => {
    const matchesSearch = binding.shortcut.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         binding.template.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || binding.category === categoryFilter;
    return matchesSearch && matchesCategory;
  }) || [];

  const categories = [...new Set(keyBindings?.map((binding: any) => binding.category) || [])];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Custom Keys</h2>
            <p className="text-gray-600">Create and manage your custom keyboard shortcuts for quick text insertion</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-medical-teal hover:bg-medical-teal/90">
                <Plus className="w-5 h-5 mr-2" />
                Add New Key Binding
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingBinding ? "Edit Key Binding" : "Create New Key Binding"}
                </DialogTitle>
                <DialogDescription>
                  {editingBinding ? "Update your key binding details" : "Create a new keyboard shortcut for quick text insertion"}
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="shortcut"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Keyboard Shortcut</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Ctrl+P" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="template"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Template Text</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter the text that will be inserted..."
                            className="min-h-20"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Clinical Notes">Clinical Notes</SelectItem>
                            <SelectItem value="Assessments">Assessments</SelectItem>
                            <SelectItem value="Prescriptions">Prescriptions</SelectItem>
                            <SelectItem value="Procedures">Procedures</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <div className="flex items-center justify-between">
                        <FormLabel>Active</FormLabel>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </div>
                    )}
                  />

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={closeDialog}>
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="bg-medical-teal hover:bg-medical-teal/90"
                      disabled={createBindingMutation.isPending || updateBindingMutation.isPending}
                    >
                      {editingBinding ? "Update" : "Create"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Key Bindings Table */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <Input
                      placeholder="Search key bindings..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Shortcut</TableHead>
                      <TableHead>Template</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBindings.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          <div className="text-gray-500">
                            <Keyboard className="w-8 h-8 mx-auto mb-2" />
                            <p>No key bindings found</p>
                            <p className="text-sm">Create your first key binding to get started</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredBindings.map((binding: any) => (
                        <TableRow key={binding.id}>
                          <TableCell>
                            <Badge variant="outline" className="font-mono">
                              {binding.shortcut}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs truncate text-sm">
                              {binding.template}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              className={
                                binding.category === 'Clinical Notes' ? 'bg-blue-100 text-blue-800' :
                                binding.category === 'Assessments' ? 'bg-green-100 text-green-800' :
                                binding.category === 'Prescriptions' ? 'bg-purple-100 text-purple-800' :
                                'bg-gray-100 text-gray-800'
                              }
                            >
                              {binding.category}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Switch
                              checked={binding.isActive}
                              onCheckedChange={() => toggleBindingStatus(binding.id, binding.isActive)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => openEditDialog(binding)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  if (confirm('Are you sure you want to delete this key binding?')) {
                                    deleteBindingMutation.mutate(binding.id);
                                  }
                                }}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Test Your Key Bindings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TestTube className="w-5 h-5" />
                  <span>Test Your Key Bindings</span>
                </CardTitle>
                <CardDescription>
                  Try out your keyboard shortcuts in this test area
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Start typing to test your key bindings..."
                  value={testText}
                  onChange={(e) => setTestText(e.target.value)}
                  className="min-h-32 resize-none"
                />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={clearTestArea}
                  className="w-full"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              </CardContent>
            </Card>

            {/* Import/Export */}
            <TierGuard requiredTier="gold" feature="Import/Export">
              <Card>
                <CardHeader>
                  <CardTitle>Import/Export</CardTitle>
                  <CardDescription>
                    Backup and restore your key bindings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full">
                    <Upload className="w-4 h-4 mr-2" />
                    Import Key Bindings
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Export Key Bindings
                  </Button>
                </CardContent>
              </Card>
            </TierGuard>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Key Bindings</span>
                  <span className="font-medium">{keyBindings?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Active</span>
                  <span className="font-medium text-green-600">
                    {keyBindings?.filter((kb: any) => kb.isActive).length || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Categories</span>
                  <span className="font-medium">{categories.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
