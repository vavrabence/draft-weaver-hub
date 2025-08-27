
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

    if (renderPath) {
      // Follow-up call with render path - set back to draft status
      const { error: updateError } = await supabase
        .from('drafts')
        .update({
          status: 'draft',
          metadata: {
            ...draft.metadata,
            render_path: renderPath,
            edit_preset: preset || null,
            edited_at: new Date().toISOString()
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', draftId)

      if (updateError) {
        console.error('Error updating draft:', updateError)
        return new Response(JSON.stringify({ error: 'Failed to update draft' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Log edit ready event
      await supabase
        .from('events')
        .insert({
          owner: draft.owner,
          kind: 'edit.ready',
          ref_id: draftId,
          payload: { render_path: renderPath, preset }
        })

      console.log(`Edit completed for draft ${draftId}, renderPath: ${renderPath}`)
    } else {
      // Initial edit request - set to editing status and simulate processing
      await supabase
        .from('drafts')
        .update({
          status: 'editing',
          metadata: {
            ...draft.metadata,
            edit_preset: preset || 'silence-cut+captions',
            edit_started_at: new Date().toISOString()
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', draftId)

      // Log edit request event
      await supabase
        .from('events')
        .insert({
          owner: draft.owner,
          kind: 'edit.request',
          ref_id: draftId,
          payload: { preset: preset || 'silence-cut+captions' }
        })

      // Simulate video editing with a background task
      EdgeRuntime.waitUntil(
        (async () => {
          // Wait 15-30 seconds to simulate processing
          const processingTime = 15000 + Math.random() * 15000
          await new Promise(resolve => setTimeout(resolve, processingTime))
          
          // Generate a simulated render path
          const simulatedRenderPath = `renders/${draftId}_edited_${Date.now()}.mp4`
          
          // Update the draft with the completed edit
          await supabase
            .from('drafts')
            .update({
              status: 'draft',
              metadata: {
                ...draft.metadata,
                render_path: simulatedRenderPath,
                edit_preset: preset || 'silence-cut+captions',
                edited_at: new Date().toISOString(),
                simulated: true
              },
              updated_at: new Date().toISOString()
            })
            .eq('id', draftId)

          // Log edit completion
          await supabase
            .from('events')
            .insert({
              owner: draft.owner,
              kind: 'edit.ready',
              ref_id: draftId,
              payload: { 
                render_path: simulatedRenderPath, 
                preset: preset || 'silence-cut+captions',
                simulated: true,
                processing_time_ms: processingTime
              }
            })

          console.log(`Simulated edit completed for draft ${draftId}`)
        })()
      )

      console.log(`Edit request initiated for draft ${draftId}, preset: ${preset}`)
    }
    
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
