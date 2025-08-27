
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const now = new Date().toISOString()
    
    // Find scheduled posts that are due
    const { data: duePosts, error: fetchError } = await supabase
      .from('scheduled_posts')
      .select('*, drafts!inner(owner)')
      .eq('status', 'scheduled')
      .lte('scheduled_for', now)

    if (fetchError) {
      console.error('Error fetching due posts:', fetchError)
      return new Response(JSON.stringify({ error: 'Failed to fetch scheduled posts' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    let processedCount = 0

    if (duePosts && duePosts.length > 0) {
      // Mark posts as posted (simulating the posting process)
      for (const post of duePosts) {
        const { error: updateError } = await supabase
          .from('scheduled_posts')
          .update({ 
            status: 'posted',
            external_post_id: `sim_${post.platform}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          })
          .eq('id', post.id)

        if (updateError) {
          console.error(`Error updating post ${post.id}:`, updateError)
          continue
        }

        // Log posted event
        await supabase
          .from('events')
          .insert({
            owner: post.drafts.owner,
            kind: 'posted',
            ref_id: post.draft_id,
            payload: { 
              platform: post.platform,
              scheduled_post_id: post.id,
              simulated: true
            }
          })

        processedCount++
      }

      // Check for drafts where all scheduled posts are now posted
      const draftIds = [...new Set(duePosts.map(p => p.draft_id))]
      
      for (const draftId of draftIds) {
        const { data: remainingPosts } = await supabase
          .from('scheduled_posts')
          .select('id')
          .eq('draft_id', draftId)
          .neq('status', 'posted')

        // If no remaining posts, mark draft as posted
        if (!remainingPosts || remainingPosts.length === 0) {
          await supabase
            .from('drafts')
            .update({ 
              status: 'posted',
              updated_at: new Date().toISOString()
            })
            .eq('id', draftId)
        }
      }
    }

    console.log(`Processed ${processedCount} scheduled posts`)
    
    return new Response(JSON.stringify({ 
      ok: true, 
      processed: processedCount,
      timestamp: now
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error in process-scheduled-posts:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
