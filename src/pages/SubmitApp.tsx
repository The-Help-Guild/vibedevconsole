import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Code2, ArrowLeft, ArrowRight, Check, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SubmitApp = () => {
  const [step, setStep] = useState(1);
  const [appName, setAppName] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [longDescription, setLongDescription] = useState("");
  const [category, setCategory] = useState("");
  const [screenshots, setScreenshots] = useState<File[]>([]);
  const [apkFile, setApkFile] = useState<File | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleNext = () => {
    if (step === 1) {
      if (!appName || !shortDescription || !longDescription || !category) {
        toast({
          title: "Required fields missing",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        return;
      }
    }
    if (step === 2) {
      if (!apkFile) {
        toast({
          title: "APK file required",
          description: "Please upload your APK file.",
          variant: "destructive",
        });
        return;
      }
    }
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    if (!agreedToTerms) {
      toast({
        title: "Agreement required",
        description: "Please agree to the terms and conditions.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "App submitted!",
      description: "Your app has been submitted for review.",
    });
    navigate("/dashboard");
  };

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + screenshots.length > 5) {
      toast({
        title: "Too many screenshots",
        description: "You can upload a maximum of 5 screenshots.",
        variant: "destructive",
      });
      return;
    }
    setScreenshots([...screenshots, ...files]);
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
                  placeholder="My Awesome App"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={category} onValueChange={setCategory}>
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

              <div className="space-y-2">
                <Label htmlFor="shortDescription">Short Description * (Max 80 characters)</Label>
                <Input
                  id="shortDescription"
                  placeholder="A brief description of your app"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  maxLength={80}
                  required
                />
                <p className="text-xs text-muted-foreground">{shortDescription.length}/80</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="longDescription">Long Description * (Max 4000 characters)</Label>
                <Textarea
                  id="longDescription"
                  placeholder="Detailed description of your app's features and functionality"
                  value={longDescription}
                  onChange={(e) => setLongDescription(e.target.value)}
                  rows={6}
                  maxLength={4000}
                  required
                />
                <p className="text-xs text-muted-foreground">{longDescription.length}/4000</p>
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
                          if (file) setApkFile(file);
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
                  <li>• Maximum file size: 100 MB</li>
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
                  <p className="text-lg">{appName}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">Category</p>
                  <p className="text-lg capitalize">{category}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">Short Description</p>
                  <p>{shortDescription}</p>
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
                    , does not contain malicious code, and I have the right to distribute this application. I
                    understand that this submission may be reviewed and could be rejected if it violates our
                    policies.
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <Button variant="outline" onClick={handleBack} disabled={step === 1}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            {step < 3 ? (
              <Button variant="hero" onClick={handleNext}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button variant="hero" onClick={handleSubmit}>
                Submit App
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
