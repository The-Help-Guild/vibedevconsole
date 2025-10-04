import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface StatusUpdateEmailRequest {
  email: string;
  appName: string;
  status: "published" | "rejected";
  reviewNotes?: string;
  reviewedAt: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, appName, status, reviewNotes, reviewedAt }: StatusUpdateEmailRequest = await req.json();

    console.log(`Sending ${status} notification to:`, email);

    const isApproved = status === "published";
    const subject = isApproved 
      ? `✅ Your App "${appName}" Has Been Approved!` 
      : `⚠️ App Review Update: "${appName}"`;

    const emailResponse = await resend.emails.send({
      from: "DevConsole <onboarding@resend.dev>",
      to: [email],
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: ${isApproved ? '#22c55e' : '#ef4444'};">
            ${isApproved ? '🎉 Congratulations!' : 'Review Update'}
          </h1>
          <p>Hi Developer,</p>
          <p>Your app <strong>${appName}</strong> has been reviewed.</p>
          
          <div style="background: ${isApproved ? '#f0fdf4' : '#fef2f2'}; 
                      border-left: 4px solid ${isApproved ? '#22c55e' : '#ef4444'}; 
                      padding: 20px; 
                      margin: 20px 0;">
            <h3 style="margin-top: 0; color: ${isApproved ? '#15803d' : '#dc2626'};">
              Status: ${isApproved ? 'APPROVED ✅' : 'REQUIRES ATTENTION ⚠️'}
            </h3>
            <p><strong>Reviewed:</strong> ${new Date(reviewedAt).toLocaleString()}</p>
          </div>

          ${isApproved ? `
            <p><strong>Your app is now live!</strong></p>
            <p>Users can now discover and download your app from the store. Here's what you can do next:</p>
            <ul>
              <li>Monitor your app's performance in the dashboard</li>
              <li>Respond to user reviews and feedback</li>
              <li>Prepare updates with new features</li>
            </ul>
          ` : `
            <p><strong>Review Feedback:</strong></p>
            <div style="background: #fff; padding: 15px; border-radius: 4px; border: 1px solid #e5e7eb;">
              ${reviewNotes || 'No specific notes provided. Please contact support for more details.'}
            </div>
            <p><strong>What to do next:</strong></p>
            <ul>
              <li>Review the feedback carefully</li>
              <li>Make necessary changes to your app</li>
              <li>Resubmit your app when ready</li>
            </ul>
            <p>We're here to help! If you have questions about the review, please reach out to our support team.</p>
          `}

          <p>Thank you for being part of our developer community!</p>
          
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            DevConsole Team<br>
            This is an automated email. Please do not reply.
          </p>
        </div>
      `,
    });

    console.log("Status update email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-status-update:", error);
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
