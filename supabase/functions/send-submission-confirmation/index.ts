import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SubmissionEmailRequest {
  email: string;
  appName: string;
  versionName: string;
  submittedAt: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify the requesting user is authenticated
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      console.error("Authentication error:", userError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const { email, appName, versionName, submittedAt }: SubmissionEmailRequest = await req.json();

    console.log("Sending submission confirmation to:", email);

    const emailResponse = await resend.emails.send({
      from: "DevConsole <onboarding@resend.dev>",
      to: [email],
      subject: `App Submission Received: ${appName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Submission Confirmation</h1>
          <p>Hi Developer,</p>
          <p>We've successfully received your app submission:</p>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>App Name:</strong> ${appName}</p>
            <p><strong>Version:</strong> ${versionName}</p>
            <p><strong>Submitted:</strong> ${new Date(submittedAt).toLocaleString()}</p>
          </div>
          <p>Your app is now in the review queue. Our team will review it and you'll receive an email notification once the review is complete.</p>
          <p><strong>What happens next?</strong></p>
          <ul>
            <li>Our team will review your app for compliance with our guidelines</li>
            <li>Review typically takes 1-3 business days</li>
            <li>You'll receive an email with the review decision</li>
          </ul>
          <p>Thank you for submitting your app!</p>
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            DevConsole Team<br>
            This is an automated email. Please do not reply.
          </p>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-submission-confirmation:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
