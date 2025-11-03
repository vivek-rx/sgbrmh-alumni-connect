import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    // Check if API key is set
    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not set')
      return new Response(
        JSON.stringify({ error: 'Email service not configured. Please set RESEND_API_KEY environment variable.' }),
        {
          status: 500,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      )
    }

    const { to, invitedName, inviterName, batchYear, inviteLink } = await req.json()

    console.log('Received request:', { to, invitedName, inviterName, batchYear })

    // Validate required fields
    if (!to || !invitedName || !inviterName || !inviteLink) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      )
    }

    // Send email using Resend
    console.log('Sending email via Resend...')
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'SGBRMH Alumni <onboarding@resend.dev>', // Using Resend's test domain
        to: [to],
        subject: `${inviterName} invited you to join SGBRMH Alumni Connect`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Join SGBRMH Alumni Connect</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">SGBRMH Alumni Connect</h1>
              </div>
              
              <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                <h2 style="color: #667eea; margin-top: 0;">Hi ${invitedName}! 👋</h2>
                
                <p style="font-size: 16px; color: #555;">
                  <strong>${inviterName}</strong> from Batch ${batchYear} has invited you to join the 
                  <strong>SGBRMH Alumni Connect</strong> platform!
                </p>
                
                <p style="font-size: 16px; color: #555;">
                  Connect with fellow alumni, discover career opportunities, stay updated on events, 
                  and be part of our thriving alumni community.
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${inviteLink}" 
                     style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                            color: white; 
                            padding: 15px 40px; 
                            text-decoration: none; 
                            border-radius: 5px; 
                            font-size: 18px; 
                            font-weight: bold;
                            display: inline-block;">
                    Accept Invitation & Register
                  </a>
                </div>
                
                <p style="font-size: 14px; color: #777; text-align: center;">
                  Or copy and paste this link into your browser:<br>
                  <a href="${inviteLink}" style="color: #667eea; word-break: break-all;">${inviteLink}</a>
                </p>
                
                <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                
                <p style="font-size: 12px; color: #999; text-align: center;">
                  This invitation was sent by ${inviterName}. If you didn't expect this invitation, 
                  you can safely ignore this email.
                </p>
              </div>
            </body>
          </html>
        `,
      }),
    })

    if (!res.ok) {
      const errorText = await res.text()
      console.error('Resend API error:', errorText)
      throw new Error(`Resend API error: ${errorText}`)
    }

    const data = await res.json()
    console.log('Email sent successfully:', data)

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    console.error('Function error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  }
})
