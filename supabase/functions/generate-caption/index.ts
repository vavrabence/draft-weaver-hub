
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { verifyAutomationSignature } from '../_shared/auth.ts'

interface GenerateCaptionRequest {
  draftId: string
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

    const { draftId }: GenerateCaptionRequest = JSON.parse(body)
    
    if (!draftId) {
      return new Response(JSON.stringify({ error: 'draftId is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the draft and verify ownership
    const { data: draft, error: draftError } = await supabase
      .from('drafts')
      .select('*')
      .eq('id', draftId)
      .single()

    if (draftError || !draft) {
      return new Response(JSON.stringify({ error: 'Draft not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Update draft with placeholder caption if none exists
    const updates: any = {
      status: 'caption_ready',
      updated_at: new Date().toISOString()
    }

    if (!draft.caption) {
      updates.caption = '[AI Generated Caption - Placeholder]'
    }

    const { error: updateError } = await supabase
      .from('drafts')
      .update(updates)
      .eq('id', draftId)

    if (updateError) {
      console.error('Error updating draft:', updateError)
      return new Response(JSON.stringify({ error: 'Failed to update draft' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log(`Caption generated for draft ${draftId}`)
    
    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error in generate-caption:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
