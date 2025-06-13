import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Folder, Plus, Trash2, Edit, Save, Crown, ChevronDown, ChevronRight, Users, Settings } from "lucide-react";
import Layout from "@/components/layout";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface KeyBinding {
  id: number;
  userId: string;
  groupId?: number;
  shortcut: string;
  template: string;
  category: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  group?: KeyBindingGroup;
}

interface KeyBindingGroup {
  id: number;
  userId?: string;
  name: string;
  description?: string;
  isSystem: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MODIFIER_KEYS = [
  { value: "ctrl", label: "Ctrl", macLabel: "Cmd" },
  { value: "alt", label: "Alt", macLabel: "Option" },
  { value: "shift", label: "Shift", macLabel: "Shift" }
];

const REGULAR_KEYS = [
  ...Array.from({ length: 26 }, (_, i) => ({ value: String.fromCharCode(65 + i), label: String.fromCharCode(65 + i) })),
  ...Array.from({ length: 10 }, (_, i) => ({ value: i.toString(), label: i.toString() })),
  ...Array.from({ length: 12 }, (_, i) => ({ value: `F${i + 1}`, label: `F${i + 1}` })),
];

export default function CustomKeys() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [groupDialog, setGroupDialog] = useState({ open: false, mode: 'create' as 'create' | 'edit', group: null as KeyBindingGroup | null });
  const [groupForm, setGroupForm] = useState({ name: '', description: '', isActive: true });
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());
  
  const [bindingDialog, setBindingDialog] = useState({ open: false, mode: 'create' as 'create' | 'edit', binding: null as KeyBinding | null });
  const [bindingForm, setBindingForm] = useState({
    shortcut: '',
    template: '',
    category: '',
    groupId: undefined as number | undefined,
    modifiers: [] as string[],
    key: '',
    isActive: true
  });

  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;

  // Queries
  const { data: groups, isLoading: groupsLoading } = useQuery({
    queryKey: ['/api/key-binding-groups'],
    enabled: !!user
  });

  const { data: keyBindings, isLoading: bindingsLoading } = useQuery({
    queryKey: ['/api/key-bindings'],
    enabled: !!user
  });

  // Auto-expand groups with active bindings
  useEffect(() => {
    if (groups && keyBindings && !groupsLoading && !bindingsLoading) {
      const groupsArray = Array.isArray(groups) ? groups : [];
      const bindingsArray = Array.isArray(keyBindings) ? keyBindings : [];
      
      const groupsWithActiveBindings = new Set<number>();
      
      groupsArray.forEach((group: KeyBindingGroup) => {
        const groupBindings = bindingsArray.filter((binding: KeyBinding) => 
          binding.groupId === group.id && binding.isActive
        );
        if (groupBindings.length > 0) {
          groupsWithActiveBindings.add(group.id);
        }
      });
      
      setExpandedGroups(groupsWithActiveBindings);
    }
  }, [groups, keyBindings, groupsLoading, bindingsLoading]);

  const saveGroupMutation = useMutation({
    mutationFn: async (data: any) => {
      const url = groupDialog.mode === 'create' ? '/api/key-binding-groups' : `/api/key-binding-groups/${groupDialog.group?.id}`;
      const method = groupDialog.mode === 'create' ? 'POST' : 'PATCH';
      return fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/key-binding-groups'] });
      setGroupDialog({ open: false, mode: 'create', group: null });
      setGroupForm({ name: '', description: '', isActive: true });
      toast({
        title: groupDialog.mode === 'create' ? "Group Created" : "Group Updated",
        description: `Group has been ${groupDialog.mode === 'create' ? 'created' : 'updated'} successfully.`,
      });
    }
  });

  const deleteGroupMutation = useMutation({
    mutationFn: async (groupId: number) => {
      return fetch(`/api/key-binding-groups/${groupId}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/key-binding-groups'] });
      queryClient.invalidateQueries({ queryKey: ['/api/key-bindings'] });
      toast({
        title: "Group Deleted",
        description: "Group and all its bindings have been deleted successfully.",
      });
    }
  });

  const saveBindingMutation = useMutation({
    mutationFn: async (data: any) => {
      const url = bindingDialog.mode === 'create' ? '/api/key-bindings' : `/api/key-bindings/${bindingDialog.binding?.id}`;
      const method = bindingDialog.mode === 'create' ? 'POST' : 'PATCH';
      return fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/key-bindings'] });
      setBindingDialog({ open: false, mode: 'create', binding: null });
      resetBindingForm();
      toast({
        title: bindingDialog.mode === 'create' ? "Binding Created" : "Binding Updated",
        description: `Key binding has been ${bindingDialog.mode === 'create' ? 'created' : 'updated'} successfully.`,
      });
    }
  });

  const deleteBindingMutation = useMutation({
    mutationFn: async (bindingId: number) => {
      return fetch(`/api/key-bindings/${bindingId}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/key-bindings'] });
      toast({
        title: "Binding Deleted",
        description: "Key binding has been deleted successfully.",
      });
    }
  });

  // Update shortcut when modifiers or key changes
  useEffect(() => {
    if (bindingForm.modifiers.length > 0 && bindingForm.key) {
      const modifierString = bindingForm.modifiers
        .map(mod => isMac && mod === 'ctrl' ? 'Cmd' : (isMac && mod === 'alt' ? 'Option' : mod.charAt(0).toUpperCase() + mod.slice(1)))
        .join('+');
      setBindingForm(prev => ({ ...prev, shortcut: `${modifierString}+${bindingForm.key}` }));
    } else {
      setBindingForm(prev => ({ ...prev, shortcut: '' }));
    }
  }, [bindingForm.modifiers, bindingForm.key, isMac]);

  const resetBindingForm = () => {
    setBindingForm({
      shortcut: '',
      template: '',
      category: '',
      groupId: undefined,
      modifiers: [],
      key: '',
      isActive: true
    });
  };

  const openGroupDialog = (mode: 'create' | 'edit', group?: KeyBindingGroup) => {
    setGroupDialog({ open: true, mode, group: group || null });
    if (mode === 'edit' && group) {
      setGroupForm({
        name: group.name,
        description: group.description || '',
        isActive: group.isActive
      });
    } else {
      setGroupForm({ name: '', description: '', isActive: true });
    }
  };

  const openBindingDialog = (mode: 'create' | 'edit', binding?: KeyBinding, groupId?: number) => {
    setBindingDialog({ open: true, mode, binding: binding || null });
    if (mode === 'edit' && binding) {
      // Parse shortcut to extract modifiers and key
      const shortcutParts = binding.shortcut.split('+');
      const key = shortcutParts[shortcutParts.length - 1];
      const modifiers = shortcutParts.slice(0, -1).map(mod => {
        // Convert display names back to internal values
        if (mod === 'Cmd') return 'ctrl';
        if (mod === 'Option') return 'alt';
        return mod.toLowerCase();
      });

      setBindingForm({
        shortcut: binding.shortcut,
        template: binding.template,
        category: binding.category,
        groupId: binding.groupId,
        modifiers: modifiers,
        key: key,
        isActive: binding.isActive
      });
    } else {
      resetBindingForm();
      if (groupId) {
        setBindingForm(prev => ({ ...prev, groupId }));
      }
    }
  };

  const toggleGroupExpansion = (groupId: number) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  const getBindingsForGroup = (groupId: number | null) => {
    if (!Array.isArray(keyBindings)) return [];
    return keyBindings.filter(binding => binding.groupId === groupId);
  };

  const getUngroupedBindings = () => {
    if (!Array.isArray(keyBindings)) return [];
    return keyBindings.filter(binding => !binding.groupId);
  };

  if (groupsLoading || bindingsLoading) {
    return (
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Custom Key Bindings</h1>
            <p className="text-gray-600 mt-2">Loading your key bindings...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const groupsArray = Array.isArray(groups) ? groups : [];
  const bindingsArray = Array.isArray(keyBindings) ? keyBindings : [];
  const ungroupedBindings = getUngroupedBindings();

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Custom Key Bindings</h1>
          <p className="text-gray-600 mt-2">Organize your keyboard shortcuts into groups for better workflow management</p>
        </div>

        {/* Control Bar */}
        <div className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg border">
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              {groupsArray.length} groups • {bindingsArray.length} total bindings
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => openBindingDialog('create')}
              variant="outline"
              className="h-8 px-3 text-sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              Quick Binding
            </Button>
            <Button
              onClick={() => openGroupDialog('create')}
              className="bg-gray-900 hover:bg-gray-800 text-white h-8 px-3 text-sm"
            >
              <Folder className="h-4 w-4 mr-1" />
              New Group
            </Button>
          </div>
        </div>

        {/* Groups Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {groupsArray.length === 0 ? (
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                    <Folder className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Start organizing with groups</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Create themed groups like "Assessment", "Treatment", or "Documentation" to organize your key bindings.
                  </p>
                  <Button
                    onClick={() => openGroupDialog('create')}
                    className="bg-gray-900 hover:bg-gray-800"
                  >
                    <Folder className="w-4 h-4 mr-2" />
                    Create Your First Group
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            <>
              {groupsArray.map((group: KeyBindingGroup) => {
                const groupBindings = getBindingsForGroup(group.id);
                const isExpanded = expandedGroups.has(group.id);
                
                return (
                  <Card key={group.id} className="h-fit">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Folder className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{group.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {groupBindings.length} bindings
                              </Badge>
                              <Badge 
                                variant={group.isActive ? "default" : "secondary"} 
                                className="text-xs"
                              >
                                {group.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleGroupExpansion(group.id)}
                            className="h-8 w-8 p-0"
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openGroupDialog('edit', group)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {group.description && (
                        <p className="text-sm text-gray-600 mt-2">{group.description}</p>
                      )}
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <div className="space-y-2 mb-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openBindingDialog('create', undefined, group.id)}
                          className="w-full h-8 text-sm"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Binding to {group.name}
                        </Button>
                      </div>
                      
                      {isExpanded && (
                        <div className="space-y-2">
                          {groupBindings.length === 0 ? (
                            <div className="text-center py-6 text-gray-500 text-sm">
                              No bindings in this group yet
                            </div>
                          ) : (
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                              {groupBindings.map((binding: KeyBinding) => (
                                <div key={binding.id} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline" className="font-mono text-xs">
                                        {binding.shortcut}
                                      </Badge>
                                      <Badge 
                                        variant={binding.isActive ? "default" : "secondary"} 
                                        className="text-xs"
                                      >
                                        {binding.isActive ? "Active" : "Inactive"}
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-gray-900 mt-1 truncate">
                                      {binding.template.length > 40 
                                        ? `${binding.template.substring(0, 40)}...` 
                                        : binding.template
                                      }
                                    </p>
                                    <p className="text-xs text-gray-500">{binding.category}</p>
                                  </div>
                                  
                                  <div className="flex items-center gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => openBindingDialog('edit', binding)}
                                      className="h-6 w-6 p-0"
                                    >
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => deleteBindingMutation.mutate(binding.id)}
                                      className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between mt-4 pt-3 border-t">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteGroupMutation.mutate(group.id)}
                          className="text-red-600 hover:text-red-700 text-xs"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete Group
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleGroupExpansion(group.id)}
                          className="text-xs"
                        >
                          {isExpanded ? "Collapse" : "View Bindings"}
                          {isExpanded ? (
                            <ChevronDown className="h-3 w-3 ml-1" />
                          ) : (
                            <ChevronRight className="h-3 w-3 ml-1" />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </>
          )}
        </div>

        {/* Ungrouped Bindings */}
        {ungroupedBindings.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">Ungrouped Key Bindings</CardTitle>
                  <CardDescription>Key bindings that haven't been assigned to a group yet</CardDescription>
                </div>
                <Button
                  onClick={() => openBindingDialog('create')}
                  className="bg-gray-900 hover:bg-gray-800 text-white h-8 px-4 text-sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Binding
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {ungroupedBindings.map((binding: KeyBinding) => (
                  <div key={binding.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className="font-mono text-sm">
                        {binding.shortcut}
                      </Badge>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {binding.template.length > 80 
                            ? `${binding.template.substring(0, 80)}...` 
                            : binding.template
                          }
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-sm text-gray-500">{binding.category}</p>
                          <Badge 
                            variant={binding.isActive ? "default" : "secondary"} 
                            className="text-xs"
                          >
                            {binding.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openBindingDialog('edit', binding)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteBindingMutation.mutate(binding.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Group Dialog */}
        <Dialog open={groupDialog.open} onOpenChange={(open) => setGroupDialog({ ...groupDialog, open })}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base">{groupDialog.mode === 'create' ? 'Create Group' : 'Edit Group'}</DialogTitle>
              <DialogDescription>
                {groupDialog.mode === 'create' ? 'Create a new group to organize your key bindings' : 'Update group details'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label htmlFor="group-name" className="text-sm">Group Name</Label>
                <Input
                  id="group-name"
                  value={groupForm.name}
                  onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                  placeholder="e.g., Assessment Templates"
                  className="h-8"
                />
              </div>
              <div>
                <Label htmlFor="group-description" className="text-sm">Description (Optional)</Label>
                <Textarea
                  id="group-description"
                  value={groupForm.description}
                  onChange={(e) => setGroupForm({ ...groupForm, description: e.target.value })}
                  placeholder="Brief description of this group's purpose"
                  rows={2}
                  className="text-sm"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Status</Label>
                <div className="flex items-center gap-2">
                  <span className={`text-xs ${groupForm.isActive ? 'text-green-600' : 'text-gray-500'}`}>
                    {groupForm.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <Switch
                    checked={groupForm.isActive}
                    onCheckedChange={(checked) => setGroupForm({ ...groupForm, isActive: checked })}
                    className="scale-75"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setGroupDialog({ ...groupDialog, open: false })}>
                Cancel
              </Button>
              <Button
                onClick={() => saveGroupMutation.mutate(groupForm)}
                disabled={!groupForm.name.trim()}
              >
                {groupDialog.mode === 'create' ? 'Create' : 'Update'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Binding Dialog */}
        <Dialog open={bindingDialog.open} onOpenChange={(open) => setBindingDialog({ ...bindingDialog, open })}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-base">{bindingDialog.mode === 'create' ? 'Create Key Binding' : 'Edit Key Binding'}</DialogTitle>
              <DialogDescription>
                {bindingDialog.mode === 'create' ? 'Create a new keyboard shortcut for quick text insertion' : 'Update the keyboard shortcut settings'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              {/* Row 1: Group and Category */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="binding-group" className="text-sm">Group</Label>
                  <Select
                    value={bindingForm.groupId?.toString() || 'none'}
                    onValueChange={(value) => setBindingForm({ ...bindingForm, groupId: value === 'none' ? undefined : parseInt(value) })}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Select group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Group</SelectItem>
                      {groupsArray.map((group: KeyBindingGroup) => (
                        <SelectItem key={group.id} value={group.id.toString()}>
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="binding-category" className="text-sm">Category</Label>
                  <Input
                    id="binding-category"
                    value={bindingForm.category}
                    onChange={(e) => setBindingForm({ ...bindingForm, category: e.target.value })}
                    placeholder="e.g., Assessment"
                    className="h-8"
                  />
                </div>
              </div>

              {/* Row 2: Compact Keyboard Shortcut */}
              <div>
                <Label className="text-sm">Keyboard Shortcut</Label>
                <div className="flex gap-2 items-center mt-1">
                  {/* Modifier buttons - compact */}
                  <div className="flex gap-1">
                    {MODIFIER_KEYS.map((mod) => (
                      <Button
                        key={mod.value}
                        type="button"
                        variant={bindingForm.modifiers.includes(mod.value) ? "default" : "outline"}
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={() => {
                          const newModifiers = bindingForm.modifiers.includes(mod.value)
                            ? bindingForm.modifiers.filter(m => m !== mod.value)
                            : [...bindingForm.modifiers, mod.value];
                          setBindingForm({ ...bindingForm, modifiers: newModifiers });
                        }}
                      >
                        {isMac ? mod.macLabel : mod.label}
                      </Button>
                    ))}
                  </div>
                  
                  <span className="text-sm text-gray-400">+</span>
                  
                  {/* Key selector - compact */}
                  <Select
                    value={bindingForm.key}
                    onValueChange={(value) => setBindingForm({ ...bindingForm, key: value })}
                  >
                    <SelectTrigger className="w-24 h-7">
                      <SelectValue placeholder="Key" />
                    </SelectTrigger>
                    <SelectContent>
                      <div className="max-h-40 overflow-y-auto">
                        {REGULAR_KEYS.map((key) => (
                          <SelectItem key={key.value} value={key.value}>
                            {key.label}
                          </SelectItem>
                        ))}
                      </div>
                    </SelectContent>
                  </Select>
                  
                  {/* Live preview */}
                  {bindingForm.shortcut && (
                    <div className="ml-2 px-2 py-1 bg-gray-100 rounded text-xs font-mono">
                      {bindingForm.shortcut}
                    </div>
                  )}
                </div>
              </div>

              {/* Row 3: Status Toggle - Inline */}
              <div className="flex items-center justify-between">
                <Label className="text-sm">Status</Label>
                <div className="flex items-center gap-2">
                  <span className={`text-xs ${bindingForm.isActive ? 'text-green-600' : 'text-gray-500'}`}>
                    {bindingForm.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <Switch
                    checked={bindingForm.isActive}
                    onCheckedChange={(checked) => setBindingForm({ ...bindingForm, isActive: checked })}
                    className="scale-75"
                  />
                </div>
              </div>

              {/* Row 4: Template Text - Compact */}
              <div>
                <Label htmlFor="binding-template" className="text-sm">Template Text</Label>
                <Textarea
                  id="binding-template"
                  value={bindingForm.template}
                  onChange={(e) => setBindingForm({ ...bindingForm, template: e.target.value })}
                  placeholder="Text that will be inserted when the shortcut is pressed"
                  rows={3}
                  className="text-sm"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setBindingDialog({ ...bindingDialog, open: false })}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  const data = {
                    shortcut: bindingForm.shortcut,
                    template: bindingForm.template,
                    category: bindingForm.category,
                    groupId: bindingForm.groupId === undefined ? null : bindingForm.groupId,
                    isActive: bindingForm.isActive
                  };
                  saveBindingMutation.mutate(data);
                }}
                disabled={!bindingForm.shortcut || !bindingForm.template || !bindingForm.category}
              >
                {bindingDialog.mode === 'create' ? 'Create' : 'Update'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}