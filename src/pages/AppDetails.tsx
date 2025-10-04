import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Download, Star, Calendar, Package } from "lucide-react";
import { SecureFileDownload } from "@/components/SecureFileDownload";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useToast } from "@/hooks/use-toast";

type Application = {
  id: string;
  app_name: string;
  package_name: string;
  short_description: string;
  long_description: string | null;
  icon_url: string | null;
  screenshots: string[] | null;
  category: string;
  version_name: string;
  version_code: number;
  downloads: number;
  rating: number | null;
  apk_file_path: string | null;
  published_at: string | null;
};

export default function AppDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [app, setApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchAppDetails(id);
    }
  }, [id]);

  const fetchAppDetails = async (appId: string) => {
    try {
      const { data, error } = await supabase
        .from("applications")
        .select("*")
        .eq("id", appId)
        .eq("status", "published")
        .single();

      if (error) throw error;
      setApp(data);
    } catch (error) {
      console.error("Error fetching app details:", error);
      toast({
        title: "Error",
        description: "Failed to load application details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <h1 className="text-2xl font-bold cursor-pointer" onClick={() => navigate("/")}>
                VibeDevConsole
              </h1>
            </div>
            <ThemeToggle />
          </div>
        </header>
        <div className="container mx-auto px-4 py-8">
          <Card className="animate-pulse">
            <CardHeader>
              <div className="h-8 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-40 bg-muted rounded"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <h1 className="text-2xl font-bold cursor-pointer" onClick={() => navigate("/")}>
                VibeDevConsole
              </h1>
            </div>
            <ThemeToggle />
          </div>
        </header>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">Application not found</p>
              <Button onClick={() => navigate("/store")}>Back to Store</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-bold cursor-pointer" onClick={() => navigate("/")}>
              VibeDevConsole
            </h1>
            <nav className="flex gap-4">
              <Button variant="ghost" onClick={() => navigate("/")}>
                Home
              </Button>
              <Button variant="ghost" onClick={() => navigate("/store")}>
                Store
              </Button>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button onClick={() => navigate("/auth")}>Sign In</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate("/store")} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Store
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* App Header */}
            <Card>
              <CardHeader>
                <div className="flex items-start gap-4">
                  {app.icon_url && (
                    <img
                      src={app.icon_url}
                      alt={app.app_name}
                      className="w-24 h-24 rounded-xl object-cover shadow-md"
                    />
                  )}
                  <div className="flex-1">
                    <CardTitle className="text-3xl mb-2">{app.app_name}</CardTitle>
                    <CardDescription className="text-base">
                      {app.short_description}
                    </CardDescription>
                    <div className="flex items-center gap-2 mt-3">
                      <Badge variant="secondary">{app.category}</Badge>
                      <span className="text-sm text-muted-foreground">v{app.version_name}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Screenshots */}
            {app.screenshots && app.screenshots.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Screenshots</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {app.screenshots.map((screenshot, index) => (
                      <img
                        key={index}
                        src={screenshot}
                        alt={`${app.app_name} screenshot ${index + 1}`}
                        className="w-full rounded-lg border object-cover aspect-video"
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>About This App</CardTitle>
              </CardHeader>
              <CardContent>
                {app.long_description ? (
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <p className="whitespace-pre-wrap text-foreground leading-relaxed">
                      {app.long_description}
                    </p>
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">
                    No detailed description available.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Download Card */}
            <Card>
              <CardHeader>
                <CardTitle>Download</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {app.apk_file_path ? (
                  <SecureFileDownload
                    bucketName="apk-files"
                    filePath={app.apk_file_path}
                    fileName={`${app.package_name}_v${app.version_name}.apk`}
                    applicationId={app.id}
                    className="w-full"
                  />
                ) : (
                  <Button disabled className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Download Unavailable
                  </Button>
                )}
                <p className="text-xs text-muted-foreground">
                  By downloading, you agree to our Terms of Service and Privacy Policy
                </p>
              </CardContent>
            </Card>

            {/* App Info */}
            <Card>
              <CardHeader>
                <CardTitle>App Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Star className="w-4 h-4 fill-current text-yellow-500" />
                    <span>Rating</span>
                  </div>
                  <span className="font-medium">{app.rating?.toFixed(1) || "N/A"}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Download className="w-4 h-4" />
                    <span>Downloads</span>
                  </div>
                  <span className="font-medium">{app.downloads.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Package className="w-4 h-4" />
                    <span>Version</span>
                  </div>
                  <span className="font-medium">{app.version_name}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Published</span>
                  </div>
                  <span className="font-medium">
                    {app.published_at
                      ? new Date(app.published_at).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Package Info */}
            <Card>
              <CardHeader>
                <CardTitle>Package Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Package Name:</span>
                    <p className="font-mono text-xs mt-1 break-all">{app.package_name}</p>
                  </div>
                  <Separator />
                  <div className="text-sm">
                    <span className="text-muted-foreground">Version Code:</span>
                    <p className="font-mono text-xs mt-1">{app.version_code}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
