
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { verifyAutomationSignature } from '../_shared/auth.ts'

interface SchedulePostRequest {
  draftId: string
  platforms: string[]
  scheduledFor: string
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

    const { draftId, platforms, scheduledFor }: SchedulePostRequest = JSON.parse(body)
    
    if (!draftId || !platforms || !platforms.length || !scheduledFor) {
      return new Response(JSON.stringify({ error: 'draftId, platforms, and scheduledFor are required' }), {
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

    // Create scheduled posts for each platform
    const scheduledPosts = platforms.map(platform => ({
      draft_id: draftId,
      platform,
      scheduled_for: scheduledFor,
      status: 'scheduled'
    }))

    const { error: insertError } = await supabase
      .from('scheduled_posts')
      .insert(scheduledPosts)

    if (insertError) {
      console.error('Error creating scheduled posts:', insertError)
      return new Response(JSON.stringify({ error: 'Failed to create scheduled posts' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Update draft status to scheduled
    const { error: updateError } = await supabase
      .from('drafts')
      .update({ 
        status: 'scheduled',
        updated_at: new Date().toISOString()
      })
      .eq('id', draftId)

    if (updateError) {
      console.error('Error updating draft status:', updateError)
      return new Response(JSON.stringify({ error: 'Failed to update draft status' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log(`Post scheduled for draft ${draftId} on platforms: ${platforms.join(', ')}`)
    
    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error in schedule-post:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
