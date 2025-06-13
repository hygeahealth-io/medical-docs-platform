import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import AdminLayout from "@/components/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Search, Plus, Edit, Trash2, Download, Upload } from "lucide-react";

interface KeyBinding {
  id: number;
  shortcut: string;
  template: string;
  category: string;
  isEnabled: boolean;
}

export default function AdminTools() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
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

  const { data: keyBindings = [], isLoading: keyBindingsLoading } = useQuery<KeyBinding[]>({
    queryKey: ["/api/key-bindings"],
    retry: false,
    enabled: !!user,
  });

  const createKeyBindingMutation = useMutation({
    mutationFn: async (keyBinding: Omit<KeyBinding, "id">) => {
      await apiRequest("POST", "/api/key-bindings", keyBinding);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/key-bindings"] });
      toast({
        title: "Success",
        description: "Key binding created successfully",
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
        description: "Failed to create key binding",
        variant: "destructive",
      });
    },
  });

  const updateKeyBindingMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<KeyBinding> }) => {
      await apiRequest("PUT", `/api/key-bindings/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/key-bindings"] });
      toast({
        title: "Success",
        description: "Key binding updated successfully",
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
        description: "Failed to update key binding",
        variant: "destructive",
      });
    },
  });

  const deleteKeyBindingMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/key-bindings/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/key-bindings"] });
      toast({
        title: "Success",
        description: "Key binding deleted successfully",
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
        description: "Failed to delete key binding",
        variant: "destructive",
      });
    },
  });

  const handleToggleKeyBinding = (id: number, enabled: boolean) => {
    updateKeyBindingMutation.mutate({ id, updates: { isEnabled: enabled } });
  };

  const handleDeleteKeyBinding = (id: number) => {
    if (window.confirm("Are you sure you want to delete this key binding?")) {
      deleteKeyBindingMutation.mutate(id);
    }
  };

  const getCategoryBadge = (category: string) => {
    const variants = {
      "CLINICAL NOTES": "bg-blue-100 text-blue-800",
      "ASSESSMENTS": "bg-green-100 text-green-800",
      "PRESCRIPTIONS": "bg-purple-100 text-purple-800",
    };
    
    return (
      <Badge className={variants[category as keyof typeof variants] || "bg-gray-100 text-gray-800"}>
        {category}
      </Badge>
    );
  };

  const filteredKeyBindings = keyBindings.filter(kb => {
    const matchesSearch = kb.shortcut.toLowerCase().includes(search.toLowerCase()) ||
                         kb.template.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !categoryFilter || kb.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (isLoading || !isAuthenticated) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Custom Keys</h2>
            <p className="text-gray-600">Create and manage your custom keyboard shortcuts for quick text insertion</p>
          </div>
          <Button className="bg-medical-teal text-white hover:bg-medical-teal-dark">
            <Plus className="w-5 h-5 mr-2" />
            Add New Key Binding
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Key Bindings Table */}
          <div className="lg:col-span-2">
            <Card>
              {/* Search and Filter */}
              <CardHeader className="border-b">
                <div className="flex items-center space-x-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <Input
                      placeholder="Search key bindings..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Categories</SelectItem>
                      <SelectItem value="CLINICAL NOTES">Clinical Notes</SelectItem>
                      <SelectItem value="ASSESSMENTS">Assessments</SelectItem>
                      <SelectItem value="PRESCRIPTIONS">Prescriptions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>

              {/* Table */}
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
                    {keyBindingsLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-teal mx-auto"></div>
                        </TableCell>
                      </TableRow>
                    ) : filteredKeyBindings.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                          No key bindings found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredKeyBindings.map((keyBinding) => (
                        <TableRow key={keyBinding.id}>
                          <TableCell>
                            <Badge variant="outline" className="font-mono text-xs">
                              {keyBinding.shortcut}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <div className="text-sm text-gray-900 truncate">
                              {keyBinding.template}
                            </div>
                          </TableCell>
                          <TableCell>
                            {getCategoryBadge(keyBinding.category)}
                          </TableCell>
                          <TableCell>
                            <Switch
                              checked={keyBinding.isEnabled}
                              onCheckedChange={(checked) => handleToggleKeyBinding(keyBinding.id, checked)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="text-medical-teal hover:text-medical-teal-dark"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => handleDeleteKeyBinding(keyBinding.id)}
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

          {/* Test and Import/Export Panel */}
          <div className="space-y-6">
            {/* Test Your Key Bindings */}
            <Card>
              <CardHeader>
                <CardTitle>Test Your Key Bindings</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Start typing to test your key bindings..."
                  value={testText}
                  onChange={(e) => setTestText(e.target.value)}
                  className="h-32 resize-none"
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3"
                  onClick={() => setTestText("")}
                >
                  Clear
                </Button>
              </CardContent>
            </Card>

            {/* Import/Export */}
            <Card>
              <CardHeader>
                <CardTitle>Import/Export</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-center">
                    <Upload className="w-4 h-4 mr-2" />
                    Import
                  </Button>
                  <Button variant="outline" className="w-full justify-center">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
