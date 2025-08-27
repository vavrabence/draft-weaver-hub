
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { verifyAutomationSignature } from '../_shared/auth.ts'
import "https://deno.land/x/xhr@0.1.0/mod.ts"

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

    // Get the draft and user profile
    const { data: draft, error: draftError } = await supabase
      .from('drafts')
      .select(`
        *,
        profiles!inner(style_profile)
      `)
      .eq('id', draftId)
      .single()

    if (draftError || !draft) {
      return new Response(JSON.stringify({ error: 'Draft not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Log caption request event
    await supabase
      .from('events')
      .insert({
        owner: draft.owner,
        kind: 'caption.request',
        ref_id: draftId,
        payload: { media_type: draft.media_type, has_style_profile: !!draft.profiles?.style_profile }
      })

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openAIApiKey) {
      console.error('OpenAI API key not configured')
      return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Build prompt based on available data
    let prompt = `Create a compelling social media caption for a ${draft.media_type} post.`
    
    if (draft.title) {
      prompt += `\n\nTitle/Topic: ${draft.title}`
    }
    
    if (draft.hashtags) {
      prompt += `\n\nExisting hashtags to incorporate: ${draft.hashtags}`
    }

    // Use style profile if available
    const styleProfile = draft.profiles?.style_profile
    if (styleProfile && typeof styleProfile === 'object') {
      prompt += `\n\nStyle Guidelines:
      - Tone: ${styleProfile.tone || 'engaging'}
      - Sentence length: ${styleProfile.sentence_length || 'mixed'}
      - Emoji usage: ${styleProfile.emoji_usage || 'moderate'}
      - Language style: ${styleProfile.language_mix || 'conversational'}`
      
      if (styleProfile.cta_patterns && Array.isArray(styleProfile.cta_patterns)) {
        prompt += `\n- Call-to-action patterns: ${styleProfile.cta_patterns.join(', ')}`
      }
      
      if (styleProfile.do_nots && Array.isArray(styleProfile.do_nots)) {
        prompt += `\n- Avoid: ${styleProfile.do_nots.join(', ')}`
      }
    }

    prompt += `\n\nCreate an engaging caption that fits this style and encourages interaction. Keep it authentic and platform-appropriate.`

    // Call OpenAI to generate caption
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a skilled social media content creator. Generate engaging, authentic captions that drive engagement while staying true to the user\'s style.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.7
      }),
    })

    if (!openAIResponse.ok) {
      console.error('OpenAI API error:', await openAIResponse.text())
      // Fallback to a simple caption
      const fallbackCaption = draft.title ? 
        `${draft.title}\n\nWhat do you think? Let me know in the comments! 👇` :
        'Check this out! What are your thoughts? 💭'
        
      await supabase
        .from('drafts')
        .update({
          caption: fallbackCaption,
          status: 'caption_ready',
          updated_at: new Date().toISOString()
        })
        .eq('id', draftId)

      return new Response(JSON.stringify({ ok: true, fallback: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const openAIData = await openAIResponse.json()
    const generatedCaption = openAIData.choices[0].message.content.trim()

    // Update draft with generated caption
    const { error: updateError } = await supabase
      .from('drafts')
      .update({
        caption: generatedCaption,
        status: 'caption_ready',
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

    // Log caption ready event
    await supabase
      .from('events')
      .insert({
        owner: draft.owner,
        kind: 'caption.ready',
        ref_id: draftId,
        payload: { caption_length: generatedCaption.length, ai_generated: true }
      })

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
