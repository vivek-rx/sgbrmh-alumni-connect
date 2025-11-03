import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
serve(async (req)=>{
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
      }
    });
  }
  try {
    // Get Supabase credentials from environment (automatically available)
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    // Create Supabase admin client
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    const { to, invitedName, inviterName, batchYear, inviteLink } = await req.json();
    console.log('Received invitation request:', {
      to,
      invitedName,
      inviterName,
      batchYear
    });
    // Validate required fields
    if (!to || !invitedName || !inviterName || !inviteLink) {
      return new Response(JSON.stringify({
        error: 'Missing required fields: to, invitedName, inviterName, inviteLink'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    // Extract token from invite link
    const token = inviteLink.includes('invite=') ? inviteLink.split('invite=')[1] : inviteLink;
    // Build the registration link
    const registrationLink = `https://sgbrmh-alumni-connect.netlify.app/auth/register?invite=${token}`;
    console.log('Registration link created:', registrationLink);
    // Use Supabase Auth Admin API to invite user
    console.log('Sending invitation via Supabase Auth...');
    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(to, {
      data: {
        invited_by: inviterName,
        invited_name: invitedName,
        batch_year: batchYear,
        invitation_type: 'alumni_connect'
      },
      redirectTo: registrationLink
    });
    if (error) {
      console.error('Supabase invitation error:', error);
      throw new Error(`Failed to send invitation: ${error.message}`);
    }
    console.log('Invitation sent successfully via Supabase:', data);
    return new Response(JSON.stringify({
      success: true,
      message: 'Invitation sent successfully',
      registrationLink,
      data
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    console.error('Function error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({
      error: errorMessage,
      details: 'Please check function logs for more information'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
});
