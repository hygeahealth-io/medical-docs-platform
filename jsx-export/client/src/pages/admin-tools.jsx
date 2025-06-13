import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Layout from "@/components/layout";
import RoleGuard from "@/components/role-guard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Activity, 
  CheckCircle, 
  Keyboard,
  Plus,
  Save,
  Trash2,
  Settings
} from "lucide-react";

export default function AdminTools() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("report-generator");

  // Fetch current tool settings
  const { data: toolSettings, isLoading } = useQuery({
    queryKey: ["/api/admin/tool-settings"],
    retry: false,
  });

  // Update tool settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (data) => {
      return await apiRequest("/api/admin/tool-settings", "PUT", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tool-settings"] });
      toast({
        title: "Settings updated",
        description: "Tool settings have been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSaveSettings = (toolType, settings) => {
    updateSettingsMutation.mutate({ toolType, settings });
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
    <RoleGuard requiredRole="admin">
      <Layout>
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Tools Configuration</h1>
            <p className="text-gray-600">Customize medical automation tools and system settings</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="report-generator" className="flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>Report Generator</span>
              </TabsTrigger>
              <TabsTrigger value="vitals-generator" className="flex items-center space-x-2">
                <Activity className="w-4 h-4" />
                <span>Vitals Generator</span>
              </TabsTrigger>
              <TabsTrigger value="quality-check" className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4" />
                <span>Quality Check</span>
              </TabsTrigger>
              <TabsTrigger value="custom-keys" className="flex items-center space-x-2">
                <Keyboard className="w-4 h-4" />
                <span>Custom Keys</span>
              </TabsTrigger>
            </TabsList>

            {/* Report Generator Settings */}
            <TabsContent value="report-generator">
              <ReportGeneratorSettings 
                settings={toolSettings?.reportGenerator}
                onSave={(settings) => handleSaveSettings("reportGenerator", settings)}
                isLoading={updateSettingsMutation.isPending}
              />
            </TabsContent>

            {/* Vitals Generator Settings */}
            <TabsContent value="vitals-generator">
              <VitalsGeneratorSettings 
                settings={toolSettings?.vitalsGenerator}
                onSave={(settings) => handleSaveSettings("vitalsGenerator", settings)}
                isLoading={updateSettingsMutation.isPending}
              />
            </TabsContent>

            {/* Quality Check Settings */}
            <TabsContent value="quality-check">
              <QualityCheckSettings 
                settings={toolSettings?.qualityCheck}
                onSave={(settings) => handleSaveSettings("qualityCheck", settings)}
                isLoading={updateSettingsMutation.isPending}
              />
            </TabsContent>

            {/* Custom Keys Settings */}
            <TabsContent value="custom-keys">
              <CustomKeysSettings 
                settings={toolSettings?.customKeys}
                onSave={(settings) => handleSaveSettings("customKeys", settings)}
                isLoading={updateSettingsMutation.isPending}
              />
            </TabsContent>
          </Tabs>
        </div>
      </Layout>
    </RoleGuard>
  );
}

// Report Generator Component
function ReportGeneratorSettings({ settings, onSave, isLoading }) {
  const [reportSettings, setReportSettings] = useState({
    outputFormat: settings?.outputFormat || "structured",
    llmModel: settings?.llmModel || "gpt-4",
    summaryTemplate: settings?.summaryTemplate || "",
    includeTimestamps: settings?.includeTimestamps || true,
    autoGenerateSummary: settings?.autoGenerateSummary || true,
    maxTokens: settings?.maxTokens || 2000,
    ...settings,
  });

  const handleSave = () => {
    onSave(reportSettings);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="w-5 h-5 text-medical-teal" />
          <span>Report Generator Configuration</span>
        </CardTitle>
        <CardDescription>
          Configure how medical reports are generated and formatted
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="output-format">Output Format</Label>
            <Select 
              value={reportSettings.outputFormat} 
              onValueChange={(value) => setReportSettings({...reportSettings, outputFormat: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="structured">Structured Text</SelectItem>
                <SelectItem value="narrative">Narrative Format</SelectItem>
                <SelectItem value="bullet-points">Bullet Points</SelectItem>
                <SelectItem value="soap">SOAP Note</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="llm-model">LLM Model</Label>
            <Select 
              value={reportSettings.llmModel} 
              onValueChange={(value) => setReportSettings({...reportSettings, llmModel: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select LLM model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-4">GPT-4</SelectItem>
                <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                <SelectItem value="claude-3">Claude 3</SelectItem>
                <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="max-tokens">Max Tokens</Label>
            <Input
              id="max-tokens"
              type="number"
              min="500"
              max="4000"
              value={reportSettings.maxTokens}
              onChange={(e) => setReportSettings({...reportSettings, maxTokens: parseInt(e.target.value)})}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="summary-template">Summary Template</Label>
          <Textarea
            id="summary-template"
            placeholder="Enter the template for report summaries..."
            value={reportSettings.summaryTemplate}
            onChange={(e) => setReportSettings({...reportSettings, summaryTemplate: e.target.value})}
            rows={4}
          />
        </div>

        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-medical-teal">
            Advanced AI-powered report generation
          </Badge>
          <Button onClick={handleSave} disabled={isLoading} className="bg-medical-teal hover:bg-teal-700">
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Vitals Generator Component
function VitalsGeneratorSettings({ settings, onSave, isLoading }) {
  const [vitalsSettings, setVitalsSettings] = useState({
    numberOfVitals: settings?.numberOfVitals || 8,
    vitalSigns: settings?.vitalSigns || [
      "Blood Pressure",
      "Heart Rate", 
      "Temperature",
      "Respiratory Rate",
      "Oxygen Saturation",
      "Weight",
      "Height",
      "BMI"
    ],
    autoCalculateBMI: settings?.autoCalculateBMI || true,
    normalRanges: settings?.normalRanges || {},
    alertThresholds: settings?.alertThresholds || {},
    ...settings,
  });

  const addVitalSign = () => {
    const newVital = prompt("Enter new vital sign name:");
    if (newVital) {
      setVitalsSettings({
        ...vitalsSettings,
        vitalSigns: [...vitalsSettings.vitalSigns, newVital],
        numberOfVitals: vitalsSettings.numberOfVitals + 1
      });
    }
  };

  const removeVitalSign = (index) => {
    const newVitals = vitalsSettings.vitalSigns.filter((_, i) => i !== index);
    setVitalsSettings({
      ...vitalsSettings,
      vitalSigns: newVitals,
      numberOfVitals: newVitals.length
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-medical-teal" />
          <span>Vitals Generator Configuration</span>
        </CardTitle>
        <CardDescription>
          Customize vital signs collection and monitoring
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="number-vitals">Number of Vital Signs</Label>
            <Input
              id="number-vitals"
              type="number"
              min="1"
              max="20"
              value={vitalsSettings.numberOfVitals}
              onChange={(e) => setVitalsSettings({...vitalsSettings, numberOfVitals: parseInt(e.target.value)})}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Vital Signs Configuration</Label>
            <Button onClick={addVitalSign} size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add Vital Sign
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vitalsSettings.vitalSigns.map((vital, index) => (
              <div key={index} className="flex items-center space-x-2 p-3 border rounded-lg">
                <span className="flex-1 text-sm font-medium">{vital}</span>
                <Button 
                  onClick={() => removeVitalSign(index)} 
                  size="sm" 
                  variant="ghost"
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-medical-teal">
            Customizable vital signs monitoring
          </Badge>
          <Button onClick={() => onSave(vitalsSettings)} disabled={isLoading} className="bg-medical-teal hover:bg-teal-700">
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Quality Check Component
function QualityCheckSettings({ settings, onSave, isLoading }) {
  const [qualitySettings, setQualitySettings] = useState({
    pdfComparisonFields: settings?.pdfComparisonFields || [
      "Patient Name",
      "Date of Birth", 
      "Medical Record Number",
      "Diagnosis",
      "Medication List",
      "Allergies"
    ],
    automationFields: settings?.automationFields || [
      "Vital Signs",
      "Chief Complaint",
      "History of Present Illness",
      "Assessment",
      "Plan"
    ],
    strictMatching: settings?.strictMatching || false,
    toleranceLevel: settings?.toleranceLevel || "medium",
    alertOnMismatch: settings?.alertOnMismatch || true,
    ...settings,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CheckCircle className="w-5 h-5 text-medical-teal" />
          <span>Quality Check Configuration</span>
        </CardTitle>
        <CardDescription>
          Configure validation between PDF files and automation app data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Label>PDF Comparison Fields</Label>
            <div className="space-y-2">
              {qualitySettings.pdfComparisonFields.map((field, index) => (
                <div key={index} className="flex items-center space-x-2 p-2 border rounded">
                  <Input 
                    value={field}
                    onChange={(e) => {
                      const newFields = [...qualitySettings.pdfComparisonFields];
                      newFields[index] = e.target.value;
                      setQualitySettings({...qualitySettings, pdfComparisonFields: newFields});
                    }}
                    className="flex-1"
                  />
                  <Button 
                    onClick={() => {
                      const newFields = qualitySettings.pdfComparisonFields.filter((_, i) => i !== index);
                      setQualitySettings({...qualitySettings, pdfComparisonFields: newFields});
                    }}
                    size="sm" 
                    variant="ghost"
                    className="text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <Label>Automation App Fields</Label>
            <div className="space-y-2">
              {qualitySettings.automationFields.map((field, index) => (
                <div key={index} className="flex items-center space-x-2 p-2 border rounded">
                  <Input 
                    value={field}
                    onChange={(e) => {
                      const newFields = [...qualitySettings.automationFields];
                      newFields[index] = e.target.value;
                      setQualitySettings({...qualitySettings, automationFields: newFields});
                    }}
                    className="flex-1"
                  />
                  <Button 
                    onClick={() => {
                      const newFields = qualitySettings.automationFields.filter((_, i) => i !== index);
                      setQualitySettings({...qualitySettings, automationFields: newFields});
                    }}
                    size="sm" 
                    variant="ghost"
                    className="text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="tolerance-level">Tolerance Level</Label>
            <Select 
              value={qualitySettings.toleranceLevel} 
              onValueChange={(value) => setQualitySettings({...qualitySettings, toleranceLevel: value})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="strict">Strict (100% match)</SelectItem>
                <SelectItem value="medium">Medium (90% match)</SelectItem>
                <SelectItem value="lenient">Lenient (80% match)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-medical-teal">
            Advanced document validation
          </Badge>
          <Button onClick={() => onSave(qualitySettings)} disabled={isLoading} className="bg-medical-teal hover:bg-teal-700">
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Custom Keys Component
function CustomKeysSettings({ settings, onSave, isLoading }) {
  const [keyBindings, setKeyBindings] = useState(settings?.keyBindings || []);

  const addKeyBinding = () => {
    setKeyBindings([
      ...keyBindings,
      {
        id: Date.now(),
        shortcut: "",
        content: "",
        type: "text", // text, paragraph
        description: ""
      }
    ]);
  };

  const updateKeyBinding = (id, field, value) => {
    setKeyBindings(keyBindings.map((kb) => 
      kb.id === id ? { ...kb, [field]: value } : kb
    ));
  };

  const removeKeyBinding = (id) => {
    setKeyBindings(keyBindings.filter((kb) => kb.id !== id));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Keyboard className="w-5 h-5 text-medical-teal" />
          <span>Custom Key Bindings</span>
        </CardTitle>
        <CardDescription>
          Configure keyboard shortcuts for sentences, paragraphs, and actions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Create custom keyboard shortcuts (e.g., ALT+4, CTRL+F5) for quick text insertion
          </p>
          <Button onClick={addKeyBinding} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add Key Binding
          </Button>
        </div>

        <div className="space-y-4">
          {keyBindings.map((binding) => (
            <div key={binding.id} className="p-4 border rounded-lg space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Keyboard Shortcut</Label>
                  <Input
                    placeholder="e.g., ALT+4, CTRL+F5"
                    value={binding.shortcut}
                    onChange={(e) => updateKeyBinding(binding.id, "shortcut", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Content Type</Label>
                  <Select 
                    value={binding.type} 
                    onValueChange={(value) => updateKeyBinding(binding.id, "type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Short Text/Sentence</SelectItem>
                      <SelectItem value="paragraph">Paragraph/Template</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    placeholder="Brief description"
                    value={binding.description}
                    onChange={(e) => updateKeyBinding(binding.id, "description", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea
                  placeholder="Enter the text or template that will be inserted..."
                  value={binding.content}
                  onChange={(e) => updateKeyBinding(binding.id, "content", e.target.value)}
                  rows={binding.type === "paragraph" ? 4 : 2}
                />
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={() => removeKeyBinding(binding.id)}
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove
                </Button>
              </div>
            </div>
          ))}

          {keyBindings.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No key bindings configured. Click "Add Key Binding" to create your first shortcut.
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-medical-teal">
            Total key bindings: {keyBindings.length}
          </Badge>
          <Button 
            onClick={() => onSave({ keyBindings })} 
            disabled={isLoading} 
            className="bg-medical-teal hover:bg-teal-700"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Key Bindings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}