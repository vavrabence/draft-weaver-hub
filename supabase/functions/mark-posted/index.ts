
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { verifyAutomationSignature } from '../_shared/auth.ts'

interface MarkPostedRequest {
  scheduledPostId: string
  externalPostId?: string
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

    const { scheduledPostId, externalPostId }: MarkPostedRequest = JSON.parse(body)
    
    if (!scheduledPostId) {
      return new Response(JSON.stringify({ error: 'scheduledPostId is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the scheduled post and verify it exists
    const { data: scheduledPost, error: scheduledPostError } = await supabase
      .from('scheduled_posts')
      .select('*, drafts(*)')
      .eq('id', scheduledPostId)
      .single()

    if (scheduledPostError || !scheduledPost) {
      return new Response(JSON.stringify({ error: 'Scheduled post not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Update scheduled post status
    const updates: any = {
      status: 'posted'
    }
    
    if (externalPostId) {
      updates.external_post_id = externalPostId
    }

    const { error: updateError } = await supabase
      .from('scheduled_posts')
      .update(updates)
      .eq('id', scheduledPostId)

    if (updateError) {
      console.error('Error updating scheduled post:', updateError)
      return new Response(JSON.stringify({ error: 'Failed to update scheduled post' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Check if all scheduled posts for this draft are posted
    const { data: remainingPosts } = await supabase
      .from('scheduled_posts')
      .select('id')
      .eq('draft_id', scheduledPost.draft_id)
      .neq('status', 'posted')

    // If no remaining posts, mark draft as posted
    if (!remainingPosts || remainingPosts.length === 0) {
      await supabase
        .from('drafts')
        .update({ 
          status: 'posted',
          updated_at: new Date().toISOString()
        })
        .eq('id', scheduledPost.draft_id)
    }

    console.log(`Marked scheduled post ${scheduledPostId} as posted with external ID: ${externalPostId}`)
    
    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error in mark-posted:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
