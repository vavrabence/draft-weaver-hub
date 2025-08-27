
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { verifyAutomationSignature } from '../_shared/auth.ts'

interface AnalyzeStyleRequest {
  source?: 'instagram' | 'tiktok'
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const body = await req.text()
    const signature = req.headers.get('x-signature')
    
    if (!verifyAutomationSignature(body, signature)) {
      return new Response(JSON.stringify({ error: 'Invalid signature' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const { source }: AnalyzeStyleRequest = JSON.parse(body)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // For now, create a placeholder style profile
    const styleProfile = {
      status: 'placeholder',
      source: source || 'manual',
      analyzed_at: new Date().toISOString(),
      insights: {
        posting_frequency: 'Weekly',
        common_themes: ['Content Creation', 'Technology'],
        engagement_patterns: 'Placeholder data',
        best_posting_times: ['18:00', '20:00']
      }
    }

    // Get user from auth context (this would be set by auth middleware)
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    if (!token) {
      return new Response(JSON.stringify({ error: 'Authentication required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid authentication' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Upsert the style profile
    const { error: upsertError } = await supabase
      .from('profiles')
      .update({ style_profile: styleProfile })
      .eq('id', user.id)

    if (upsertError) {
      console.error('Error updating style profile:', upsertError)
      return new Response(JSON.stringify({ error: 'Failed to update style profile' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log(`Style analysis completed for user ${user.id}, source: ${source}`)
    
    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error in analyze-style:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
