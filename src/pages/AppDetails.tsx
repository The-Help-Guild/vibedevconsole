import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Download, Star, Calendar, Package, MessageSquare, Maximize2 } from "lucide-react";
import { SecureFileDownload } from "@/components/SecureFileDownload";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

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

type Review = {
  id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
};

export default function AppDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [app, setApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchAppDetails(id);
      fetchReviews(id);
    }
  }, [id]);

  useEffect(() => {
    if (id && user) {
      fetchUserReview(id);
    }
  }, [id, user]);

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

  const fetchReviews = async (appId: string) => {
    try {
      const { data, error } = await supabase
        .from("app_reviews")
        .select("*")
        .eq("application_id", appId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const fetchUserReview = async (appId: string) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("app_reviews")
        .select("*")
        .eq("application_id", appId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setUserReview(data);
        setNewRating(data.rating);
        setNewComment(data.comment || "");
      }
    } catch (error) {
      console.error("Error fetching user review:", error);
    }
  };

  const handleSubmitReview = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to leave a review",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (newRating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a star rating",
        variant: "destructive",
      });
      return;
    }

    setSubmittingReview(true);
    try {
      const reviewData = {
        application_id: id!,
        user_id: user.id,
        rating: newRating,
        comment: newComment.trim() || null,
      };

      if (userReview) {
        const { error } = await supabase
          .from("app_reviews")
          .update(reviewData)
          .eq("id", userReview.id);

        if (error) throw error;
        toast({
          title: "Review Updated",
          description: "Your review has been updated successfully",
        });
      } else {
        const { error } = await supabase
          .from("app_reviews")
          .insert(reviewData);

        if (error) throw error;
        toast({
          title: "Review Submitted",
          description: "Thank you for your review!",
        });
      }

      await fetchReviews(id!);
      await fetchUserReview(id!);
      await fetchAppDetails(id!);
    } catch (error: any) {
      console.error("Error submitting review:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit review",
        variant: "destructive",
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  const renderStars = (rating: number, interactive: boolean = false, onRate?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating
                ? "fill-yellow-500 text-yellow-500"
                : "text-muted-foreground"
            } ${interactive ? "cursor-pointer hover:scale-110 transition-transform" : ""}`}
            onClick={() => interactive && onRate?.(star)}
          />
        ))}
      </div>
    );
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
                  <CardDescription>Click on any image to view full size</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {app.screenshots.map((screenshot, index) => (
                      <div
                        key={index}
                        className="relative group cursor-pointer overflow-hidden rounded-lg border"
                        onClick={() => setZoomedImage(screenshot)}
                      >
                        <img
                          src={screenshot}
                          alt={`${app.app_name} screenshot ${index + 1}`}
                          className="w-full object-cover aspect-video transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                          <Maximize2 className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
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

            {/* Reviews Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Reviews & Ratings
                </CardTitle>
                <CardDescription>
                  {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Write Review */}
                <div className="border rounded-lg p-4 bg-muted/30">
                  <h3 className="font-semibold mb-3">
                    {userReview ? "Update Your Review" : "Write a Review"}
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Your Rating</label>
                      {renderStars(newRating, true, setNewRating)}
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Your Comment (Optional)</label>
                      <Textarea
                        placeholder="Share your thoughts about this app..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        rows={4}
                        maxLength={1000}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {newComment.length}/1000 characters
                      </p>
                    </div>
                    <Button
                      onClick={handleSubmitReview}
                      disabled={submittingReview || newRating === 0}
                      className="w-full"
                    >
                      {submittingReview
                        ? "Submitting..."
                        : userReview
                        ? "Update Review"
                        : "Submit Review"}
                    </Button>
                  </div>
                </div>

                {/* Display Reviews */}
                <div className="space-y-4">
                  {reviews.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No reviews yet. Be the first to review this app!
                    </p>
                  ) : (
                    reviews.map((review) => (
                      <div
                        key={review.id}
                        className="border rounded-lg p-4 space-y-2 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-sm font-semibold text-primary">
                                {review.user_id.substring(0, 2).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                {renderStars(review.rating)}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(review.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          {user?.id === review.user_id && (
                            <Badge variant="secondary">Your Review</Badge>
                          )}
                        </div>
                        {review.comment && (
                          <p className="text-sm text-foreground leading-relaxed pl-13">
                            {review.comment}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
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

      {/* Image Zoom Dialog */}
      <Dialog open={!!zoomedImage} onOpenChange={() => setZoomedImage(null)}>
        <DialogContent className="max-w-4xl w-full p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>Screenshot</DialogTitle>
          </DialogHeader>
          {zoomedImage && (
            <div className="p-6 pt-4">
              <img
                src={zoomedImage}
                alt="Zoomed screenshot"
                className="w-full rounded-lg"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
