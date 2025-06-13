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
    mutationFn: async (data: any) => {
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

  const handleSaveSettings = (toolType: string, settings: any) => {
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
function ReportGeneratorSettings({ settings, onSave, isLoading }: any) {
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
function VitalsGeneratorSettings({ settings, onSave, isLoading }: any) {
  const [vitalsSettings, setVitalsSettings] = useState({
    vitalSigns: settings?.vitalSigns || [
      {
        name: "Systolic Blood Pressure",
        min: 90,
        max: 160,
        unit: "mmHg"
      },
      {
        name: "Diastolic Blood Pressure", 
        min: 60,
        max: 90,
        unit: "mmHg"
      },
      {
        name: "Heart Rate",
        min: 60,
        max: 100,
        unit: "bpm"
      },
      {
        name: "Temperature",
        min: 96,
        max: 101,
        unit: "°F"
      },
      {
        name: "Respirations",
        min: 12,
        max: 22,
        unit: "/min"
      },
      {
        name: "Oxygen Saturation",
        min: 90,
        max: 100,
        unit: "% to room air"
      }
    ],
    ...settings,
  });

  const addVitalSign = () => {
    const newVital = prompt("Enter new vital sign name:");
    if (newVital) {
      const newVitalSign = {
        name: newVital,
        min: 0,
        max: 100,
        unit: ""
      };
      setVitalsSettings({
        ...vitalsSettings,
        vitalSigns: [...vitalsSettings.vitalSigns, newVitalSign]
      });
    }
  };

  const removeVitalSign = (index: number) => {
    const newVitals = vitalsSettings.vitalSigns.filter((_: any, i: number) => i !== index);
    setVitalsSettings({
      ...vitalsSettings,
      vitalSigns: newVitals
    });
  };

  const updateVitalSign = (index: number, field: string, value: any) => {
    const updatedVitals = vitalsSettings.vitalSigns.map((vital: any, i: number) => {
      if (i === index) {
        return { ...vital, [field]: value };
      }
      return vital;
    });
    setVitalsSettings({
      ...vitalsSettings,
      vitalSigns: updatedVitals
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

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Vital Signs Configuration</Label>
            <Button onClick={addVitalSign} size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add Vital Sign
            </Button>
          </div>
          
          <div className="space-y-4">
            {vitalsSettings.vitalSigns.map((vital: any, index: number) => (
              <div key={index} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">{vital.name}</h4>
                  <Button 
                    onClick={() => removeVitalSign(index)} 
                    size="sm" 
                    variant="ghost"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Minimum</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={vital.min}
                      onChange={(e) => updateVitalSign(index, 'min', parseFloat(e.target.value))}
                      className="h-8"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Maximum</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={vital.max}
                      onChange={(e) => updateVitalSign(index, 'max', parseFloat(e.target.value))}
                      className="h-8"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Unit</Label>
                    <Input
                      value={vital.unit}
                      onChange={(e) => updateVitalSign(index, 'unit', e.target.value)}
                      className="h-8"
                      placeholder="e.g., bpm"
                    />
                  </div>
                </div>
                
                <div className="text-xs text-gray-500">
                  Normal range: {vital.min} - {vital.max} {vital.unit}
                </div>
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
function QualityCheckSettings({ settings, onSave, isLoading }: any) {
  const [qualitySettings, setQualitySettings] = useState({
    pdfFieldsToMonitor: settings?.pdfFieldsToMonitor || [
      {
        name: "Foley catheter",
        keywords: ["foley catheter size", "catheter type", "catheter care"]
      },
      {
        name: "Wound",
        keywords: ["wound type", "wound location", "wound treatment", "procedure done", "supplies used"]
      },
      {
        name: "Ostomy",
        keywords: ["ostomy type", "ostomy care", "ostomy supplies"]
      },
      {
        name: "IV/PICC line",
        keywords: ["IV access", "PICC line", "central line", "feed rate", "formula used"]
      },
      {
        name: "Antibiotics",
        keywords: ["antibiotic name", "dosage", "frequency", "route", "start date"]
      },
      {
        name: "Insulin",
        keywords: ["insulin administration", "dosage", "frequency", "blood sugar documented"]
      }
    ],
    toleranceLevel: settings?.toleranceLevel || "medium",
    ...settings,
  });

  const addPdfField = () => {
    const newField = {
      name: "",
      keywords: [""]
    };
    setQualitySettings({
      ...qualitySettings,
      pdfFieldsToMonitor: [...qualitySettings.pdfFieldsToMonitor, newField]
    });
  };

  const updatePdfField = (index: number, field: string, value: any) => {
    const updatedFields = qualitySettings.pdfFieldsToMonitor.map((item: any, i: number) => {
      if (i === index) {
        return { ...item, [field]: value };
      }
      return item;
    });
    setQualitySettings({
      ...qualitySettings,
      pdfFieldsToMonitor: updatedFields
    });
  };

  const addKeyword = (fieldIndex: number) => {
    const updatedFields = [...qualitySettings.pdfFieldsToMonitor];
    updatedFields[fieldIndex].keywords.push("");
    setQualitySettings({
      ...qualitySettings,
      pdfFieldsToMonitor: updatedFields
    });
  };

  const updateKeyword = (fieldIndex: number, keywordIndex: number, value: string) => {
    const updatedFields = [...qualitySettings.pdfFieldsToMonitor];
    updatedFields[fieldIndex].keywords[keywordIndex] = value;
    setQualitySettings({
      ...qualitySettings,
      pdfFieldsToMonitor: updatedFields
    });
  };

  const removeKeyword = (fieldIndex: number, keywordIndex: number) => {
    const updatedFields = [...qualitySettings.pdfFieldsToMonitor];
    updatedFields[fieldIndex].keywords = updatedFields[fieldIndex].keywords.filter((_: any, i: number) => i !== keywordIndex);
    setQualitySettings({
      ...qualitySettings,
      pdfFieldsToMonitor: updatedFields
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CheckCircle className="w-5 h-5 text-medical-teal" />
          <span>Quality Check Configuration</span>
        </CardTitle>
        <CardDescription>
          Configure PDF fields to monitor and keywords to match in automation summaries
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>PDF Fields to Monitor</Label>
            <Button onClick={addPdfField} size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add PDF Field
            </Button>
          </div>
          
          <div className="space-y-4">
            {qualitySettings.pdfFieldsToMonitor.map((field: any, fieldIndex: number) => (
              <div key={fieldIndex} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <Input
                    value={field.name}
                    onChange={(e) => updatePdfField(fieldIndex, 'name', e.target.value)}
                    placeholder="PDF Field Name (e.g., Foley catheter)"
                    className="flex-1 mr-2"
                  />
                  <Button 
                    onClick={() => {
                      const newFields = qualitySettings.pdfFieldsToMonitor.filter((_: any, i: number) => i !== fieldIndex);
                      setQualitySettings({...qualitySettings, pdfFieldsToMonitor: newFields});
                    }}
                    size="sm" 
                    variant="ghost"
                    className="text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Keywords to match in automation summary:</Label>
                    <Button 
                      onClick={() => addKeyword(fieldIndex)} 
                      size="sm" 
                      variant="ghost"
                      className="text-medical-teal"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Keyword
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {field.keywords.map((keyword: string, keywordIndex: number) => (
                      <div key={keywordIndex} className="flex items-center space-x-2">
                        <Input
                          value={keyword}
                          onChange={(e) => updateKeyword(fieldIndex, keywordIndex, e.target.value)}
                          placeholder="keyword to search"
                          className="flex-1 text-sm"
                        />
                        <Button 
                          onClick={() => removeKeyword(fieldIndex, keywordIndex)}
                          size="sm" 
                          variant="ghost"
                          className="text-red-600"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
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
            Monitor PDF fields in automation summaries
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
function CustomKeysSettings({ settings, onSave, isLoading }: any) {
  const [keyBindingSets, setKeyBindingSets] = useState(settings?.keyBindingSets || [
    {
      id: 1,
      name: "Wounds",
      keyBindings: [
        { id: 101, shortcut: "ALT+W1", content: "Wound assessment completed", type: "text", description: "Basic wound assessment" },
        { id: 102, shortcut: "ALT+W2", content: "Dressing change performed using sterile technique", type: "text", description: "Dressing change" }
      ]
    },
    {
      id: 2,
      name: "Medications",
      keyBindings: [
        { id: 201, shortcut: "ALT+M1", content: "Medications administered as prescribed", type: "text", description: "Med administration" },
        { id: 202, shortcut: "ALT+M2", content: "Patient education provided regarding medication compliance", type: "text", description: "Med education" }
      ]
    },
    {
      id: 3,
      name: "IV/PICC",
      keyBindings: [
        { id: 301, shortcut: "ALT+I1", content: "IV site assessed - no signs of infiltration or infection", type: "text", description: "IV assessment" },
        { id: 302, shortcut: "ALT+I2", content: "PICC line flushed with saline per protocol", type: "text", description: "PICC flush" }
      ]
    },
    {
      id: 4,
      name: "Diabetes",
      keyBindings: [
        { id: 401, shortcut: "ALT+D1", content: "Blood glucose checked and documented", type: "text", description: "Blood glucose check" },
        { id: 402, shortcut: "ALT+D2", content: "Insulin administered per sliding scale protocol", type: "text", description: "Insulin administration" }
      ]
    },
    {
      id: 5,
      name: "Gtube",
      keyBindings: [
        { id: 501, shortcut: "ALT+G1", content: "G-tube site assessed - clean and dry", type: "text", description: "G-tube assessment" },
        { id: 502, shortcut: "ALT+G2", content: "Feeding administered via G-tube without complications", type: "text", description: "G-tube feeding" }
      ]
    }
  ]);

  const [selectedSetId, setSelectedSetId] = useState(keyBindingSets[0]?.id || null);

  const addKeyBindingSet = () => {
    const setName = prompt("Enter key binding set name:");
    if (setName) {
      const newSet = {
        id: Date.now(),
        name: setName,
        keyBindings: []
      };
      setKeyBindingSets([...keyBindingSets, newSet]);
      setSelectedSetId(newSet.id);
    }
  };

  const removeKeyBindingSet = (setId: number) => {
    const updatedSets = keyBindingSets.filter((set: any) => set.id !== setId);
    setKeyBindingSets(updatedSets);
    if (selectedSetId === setId) {
      setSelectedSetId(updatedSets[0]?.id || null);
    }
  };

  const addKeyBinding = () => {
    if (!selectedSetId) return;
    
    const newKeyBinding = {
      id: Date.now(),
      shortcut: "",
      content: "",
      type: "text",
      description: ""
    };

    const updatedSets = keyBindingSets.map((set: any) => 
      set.id === selectedSetId 
        ? { ...set, keyBindings: [...set.keyBindings, newKeyBinding] }
        : set
    );
    setKeyBindingSets(updatedSets);
  };

  const updateKeyBinding = (keyBindingId: number, field: string, value: string) => {
    const updatedSets = keyBindingSets.map((set: any) => ({
      ...set,
      keyBindings: set.keyBindings.map((kb: any) => 
        kb.id === keyBindingId ? { ...kb, [field]: value } : kb
      )
    }));
    setKeyBindingSets(updatedSets);
  };

  const removeKeyBinding = (keyBindingId: number) => {
    const updatedSets = keyBindingSets.map((set: any) => ({
      ...set,
      keyBindings: set.keyBindings.filter((kb: any) => kb.id !== keyBindingId)
    }));
    setKeyBindingSets(updatedSets);
  };

  const selectedSet = keyBindingSets.find((set: any) => set.id === selectedSetId);
  const currentKeyBindings = selectedSet?.keyBindings || [];

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
          {keyBindings.map((binding: any) => (
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