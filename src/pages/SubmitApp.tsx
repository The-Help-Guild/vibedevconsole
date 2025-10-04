import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Code2, ArrowLeft, ArrowRight, Check, Upload } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const packageNameSchema = z.string()
  .regex(/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/, "Invalid package name format (e.g., com.example.app)");

const versionNameSchema = z.string()
  .regex(/^\d+\.\d+\.\d+$/, "Version must follow semantic versioning (e.g., 1.0.0)");

const appMetadataSchema = z.object({
  appName: z.string().min(1, "App name is required").max(100, "App name must be less than 100 characters"),
  packageName: packageNameSchema,
  shortDescription: z.string().min(1, "Short description is required").max(80, "Short description must be 80 characters or less"),
  longDescription: z.string().min(10, "Long description must be at least 10 characters").max(4000, "Long description must be 4000 characters or less"),
  category: z.string().min(1, "Category is required"),
  versionName: versionNameSchema,
  versionCode: z.number().int().positive("Version code must be a positive integer"),
});

interface FormData {
  appName: string;
  packageName: string;
  shortDescription: string;
  longDescription: string;
  category: string;
  versionName: string;
  versionCode: number;
}

const SubmitApp = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    appName: "",
    packageName: "",
    shortDescription: "",
    longDescription: "",
    category: "",
    versionName: "1.0.0",
    versionCode: 1,
  });
  
  const [screenshots, setScreenshots] = useState<File[]>([]);
  const [apkFile, setApkFile] = useState<File | null>(null);

  const handleNext = () => {
    if (step === 1) {
      // Validate app metadata with Zod
      const validation = appMetadataSchema.safeParse(formData);
      if (!validation.success) {
        toast.error(validation.error.errors[0].message);
        return;
      }
    }
    if (step === 2) {
      if (!apkFile) {
        toast.error("Please upload your APK file");
        return;
      }
      // Validate APK file type
      if (!apkFile.name.endsWith('.apk') && !apkFile.name.endsWith('.aab')) {
        toast.error("File must be .apk or .aab format");
        return;
      }
    }
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate file count
    if (files.length + screenshots.length > 5) {
      toast.error("You can upload a maximum of 5 screenshots");
      return;
    }
    
    // Validate file types and sizes
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not a valid image file`);
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} exceeds maximum size of 10MB`);
        return;
      }
    }
    
    setScreenshots([...screenshots, ...files]);
  };

  const handleSubmit = async () => {
    if (!agreedToTerms) {
      toast.error("Please agree to the terms and conditions");
      return;
    }

    if (!user) {
      toast.error("You must be logged in to submit an app");
      navigate("/auth");
      return;
    }

    setLoading(true);

    try {
      // Upload APK file
      let apkPath = null;
      if (apkFile) {
        const apkFileName = `${user.id}/${Date.now()}_${apkFile.name}`;
        const { error: apkError } = await supabase.storage
          .from("apk-files")
          .upload(apkFileName, apkFile);

        if (apkError) throw apkError;
        apkPath = apkFileName;
      }

      // Upload screenshots
      const screenshotUrls: string[] = [];
      for (const screenshot of screenshots) {
        const fileName = `${user.id}/${Date.now()}_${screenshot.name}`;
        const { error: uploadError } = await supabase.storage
          .from("app-screenshots")
          .upload(fileName, screenshot);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("app-screenshots")
          .getPublicUrl(fileName);
        
        screenshotUrls.push(urlData.publicUrl);
      }

      // Create application record
      const { data, error } = await supabase
        .from("applications")
        .insert([{
          app_name: formData.appName,
          package_name: formData.packageName,
          short_description: formData.shortDescription,
          long_description: formData.longDescription,
          category: formData.category as "games" | "social" | "productivity" | "entertainment" | "education" | "lifestyle" | "business" | "utilities" | "other",
          version_name: formData.versionName,
          version_code: formData.versionCode,
          developer_id: user.id,
          apk_file_path: apkPath,
          screenshots: screenshotUrls,
          status: "pending" as "pending",
        }])
        .select()
        .single();

      if (error) throw error;

      // Create submission history record
      const { error: historyError } = await supabase
        .from("submission_history")
        .insert({
          application_id: data.id,
          version_code: formData.versionCode,
          version_name: formData.versionName,
          status: "pending",
          submitted_by: user.id,
          apk_file_path: apkPath,
        });

      if (historyError) throw historyError;

      // Send submission confirmation email
      try {
        await supabase.functions.invoke("send-submission-confirmation", {
          body: {
            email: user.email,
            appName: formData.appName,
            versionName: formData.versionName,
            submittedAt: new Date().toISOString(),
          },
        });
      } catch (emailError) {
        console.error("Failed to send confirmation email:", emailError);
        // Don't fail the submission if email fails
      }

      toast.success("Application submitted successfully!");
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Submission error:", error);
      toast.error(error.message || "Failed to submit application");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <Code2 className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">DevConsole</span>
          </Link>
          <Link to="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Submit New App</h1>
          <p className="text-muted-foreground">Complete the following steps to publish your app</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center flex-1">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  s <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                } transition-colors`}
              >
                {s < step ? <Check className="h-5 w-5" /> : s}
              </div>
              {s < 3 && <div className={`flex-1 h-1 mx-2 ${s < step ? "bg-primary" : "bg-muted"}`} />}
            </div>
          ))}
        </div>

        <Card className="p-6 shadow-elegant">
          {/* Step 1: Metadata */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-4">App Metadata</h2>
                <p className="text-muted-foreground mb-6">Provide basic information about your app</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="appName">App Name *</Label>
                <Input
                  id="appName"
                  value={formData.appName}
                  onChange={(e) => setFormData({ ...formData, appName: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="packageName">Package Name *</Label>
                <Input
                  id="packageName"
                  placeholder="com.example.app"
                  value={formData.packageName}
                  onChange={(e) => setFormData({ ...formData, packageName: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(val) => setFormData({ ...formData, category: val })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="games">Games</SelectItem>
                    <SelectItem value="productivity">Productivity</SelectItem>
                    <SelectItem value="social">Social</SelectItem>
                    <SelectItem value="entertainment">Entertainment</SelectItem>
                    <SelectItem value="utilities">Utilities</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="versionName">Version Name *</Label>
                  <Input
                    id="versionName"
                    value={formData.versionName}
                    onChange={(e) => setFormData({ ...formData, versionName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="versionCode">Version Code *</Label>
                  <Input
                    id="versionCode"
                    type="number"
                    value={formData.versionCode}
                    onChange={(e) => setFormData({ ...formData, versionCode: parseInt(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="shortDescription">Short Description * (Max 80 characters)</Label>
                <Input
                  id="shortDescription"
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  maxLength={80}
                  required
                />
                <p className="text-xs text-muted-foreground">{formData.shortDescription.length}/80</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="longDescription">Long Description * (Max 4000 characters)</Label>
                <Textarea
                  id="longDescription"
                  value={formData.longDescription}
                  onChange={(e) => setFormData({ ...formData, longDescription: e.target.value })}
                  rows={6}
                  maxLength={4000}
                  required
                />
                <p className="text-xs text-muted-foreground">{formData.longDescription.length}/4000</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="screenshots">Screenshots (Up to 5)</Label>
                <Input
                  id="screenshots"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleScreenshotChange}
                />
                {screenshots.length > 0 && (
                  <p className="text-sm text-muted-foreground">{screenshots.length} file(s) selected</p>
                )}
              </div>
            </div>
          )}

          {/* Step 2: APK Upload */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-4">Upload APK</h2>
                <p className="text-muted-foreground mb-6">Upload your Android application package</p>
              </div>

              <div className="border-2 border-dashed border-border rounded-lg p-12 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="p-4 bg-primary/10 rounded-full">
                    <Upload className="h-12 w-12 text-primary" />
                  </div>
                  {apkFile ? (
                    <>
                      <p className="text-lg font-semibold">{apkFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(apkFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <Button variant="outline" onClick={() => setApkFile(null)}>
                        Remove File
                      </Button>
                    </>
                  ) : (
                    <>
                      <p className="text-lg font-semibold">Drop your APK file here</p>
                      <p className="text-sm text-muted-foreground">or click to browse</p>
                      <Input
                        type="file"
                        accept=".apk,.aab"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 500 * 1024 * 1024) {
                              toast.error("File size must be less than 500MB");
                              return;
                            }
                            setApkFile(file);
                          }
                        }}
                        className="max-w-xs"
                      />
                    </>
                  )}
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Requirements</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• File format: .apk or .aab</li>
                  <li>• Maximum file size: 500 MB</li>
                  <li>• Must be signed with your keystore</li>
                </ul>
              </div>
            </div>
          )}

          {/* Step 3: Review & Submit */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-4">Review & Submit</h2>
                <p className="text-muted-foreground mb-6">Please review your submission</p>
              </div>

              <div className="space-y-4 border-t pt-4">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">App Name</p>
                  <p className="text-lg">{formData.appName}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">Package Name</p>
                  <p className="text-lg">{formData.packageName}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">Category</p>
                  <p className="text-lg capitalize">{formData.category}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">Version</p>
                  <p className="text-lg">{formData.versionName} ({formData.versionCode})</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">Short Description</p>
                  <p>{formData.shortDescription}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">APK File</p>
                  <p>{apkFile?.name}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">Screenshots</p>
                  <p>{screenshots.length} file(s)</p>
                </div>
              </div>

              <div className="border-t pt-6 space-y-4">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={agreedToTerms}
                    onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
                  />
                  <label htmlFor="terms" className="text-sm leading-relaxed">
                    I confirm that this app complies with all{" "}
                    <Link to="/terms" className="text-primary hover:underline" target="_blank">
                      Terms of Service
                    </Link>
                    , does not contain malicious code, and I have the right to distribute this application.
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <Button variant="outline" onClick={handleBack} disabled={step === 1 || loading}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            {step < 3 ? (
              <Button onClick={handleNext} disabled={loading}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? "Submitting..." : "Submit App"}
                <Check className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </Card>
      </main>
    </div>
  );
};

export default SubmitApp;
