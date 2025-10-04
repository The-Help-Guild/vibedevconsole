import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting: 5 attempts per 15 minutes per IP
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;

interface RateLimitRequest {
  identifier: string; // IP address or user identifier
  action: 'login' | 'signup';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { identifier, action } = await req.json() as RateLimitRequest;

    if (!identifier || !action) {
      return new Response(
        JSON.stringify({ allowed: false, error: 'Missing identifier or action' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check rate limit attempts in the last 15 minutes
    const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW).toISOString();
    
    const { data: attempts, error } = await supabase
      .from('auth_rate_limits')
      .select('*')
      .eq('identifier', identifier)
      .eq('action', action)
      .gte('attempted_at', windowStart);

    if (error) {
      console.error('Rate limit check error:', error);
      // Allow on error to prevent blocking legitimate users
      return new Response(
        JSON.stringify({ allowed: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const attemptCount = attempts?.length || 0;
    const allowed = attemptCount < MAX_ATTEMPTS;

    if (!allowed) {
      console.log(`Rate limit exceeded for ${identifier} on ${action}: ${attemptCount} attempts`);
      return new Response(
        JSON.stringify({ 
          allowed: false, 
          error: 'Too many attempts. Please try again in 15 minutes.',
          remainingTime: RATE_LIMIT_WINDOW 
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log this attempt
    await supabase
      .from('auth_rate_limits')
      .insert({
        identifier,
        action,
        attempted_at: new Date().toISOString()
      });

    return new Response(
      JSON.stringify({ allowed: true, remainingAttempts: MAX_ATTEMPTS - attemptCount - 1 }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Rate limit function error:', error);
    return new Response(
      JSON.stringify({ allowed: true }), // Allow on error
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
