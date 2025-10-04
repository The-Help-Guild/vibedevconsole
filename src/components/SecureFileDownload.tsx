import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface SecureFileDownloadProps {
  bucketName: string;
  filePath: string;
  fileName: string;
  applicationId?: string; // Optional: for APK download tracking
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
}

export function SecureFileDownload({
  bucketName,
  filePath,
  fileName,
  applicationId,
  variant = "default",
  size = "default",
  className,
}: SecureFileDownloadProps) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("You must be logged in to download files");
      }

      // Verify access by attempting to generate signed URL
      // RLS policies on storage.objects will enforce access control
      const { data, error } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(filePath, 3600);

      if (error) {
        console.error("Access denied:", error);
        throw new Error("Access denied. You don't have permission to download this file.");
      }
      if (!data?.signedUrl) throw new Error("Failed to generate download link");

      // Log APK downloads for audit trail
      if (bucketName === "apk-files" && applicationId) {
        const { error: logError } = await supabase
          .from("apk_downloads")
          .insert({
            user_id: user.id,
            application_id: applicationId,
            apk_file_path: filePath,
            user_agent: navigator.userAgent,
          });

        if (logError) {
          console.warn("Failed to log download:", logError);
          // Don't block download if logging fails
        }
      }

      // Create temporary link and trigger download
      const link = document.createElement("a");
      link.href = data.signedUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Download started");
    } catch (error: any) {
      console.error("Download error:", error);
      toast.error(error.message || "Failed to download file");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleDownload}
      disabled={loading}
      variant={variant}
      size={size}
      className={className}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Preparing...
        </>
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" />
          Download {fileName}
        </>
      )}
    </Button>
  );
}
