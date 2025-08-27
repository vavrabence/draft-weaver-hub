
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { verifyAutomationSignature } from '../_shared/auth.ts'

interface RequestEditRequest {
  draftId: string
  preset?: 'silence-cut+captions'
  renderPath?: string
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

    const { draftId, preset, renderPath }: RequestEditRequest = JSON.parse(body)
    
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

    // Get the draft and verify it exists
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

    // Prepare updates
    const updates: any = {
      updated_at: new Date().toISOString()
    }

    if (renderPath) {
      // Follow-up call with render path - set back to draft status
      updates.status = 'draft'
      updates.metadata = {
        ...draft.metadata,
        render_path: renderPath,
        edit_preset: preset || null
      }
    } else {
      // Initial edit request - set to editing status
      updates.status = 'editing'
      if (preset) {
        updates.metadata = {
          ...draft.metadata,
          edit_preset: preset
        }
      }
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

    console.log(`Edit requested for draft ${draftId}, preset: ${preset}, renderPath: ${renderPath}`)
    
    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error in request-edit:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
