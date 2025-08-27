
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import "https://deno.land/x/xhr@0.1.0/mod.ts"

interface StyleBuildRequest {
  samples: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid authentication' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const { samples }: StyleBuildRequest = await req.json()
    
    if (!samples || samples.trim().length < 50) {
      return new Response(JSON.stringify({ error: 'Please provide at least 50 characters of sample content' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openAIApiKey) {
      return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Call OpenAI to analyze the style
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
            content: `Analyze the provided social media content samples and create a comprehensive style profile. Return a JSON object with these exact keys:
            {
              "tone": "casual/professional/playful/authoritative/etc",
              "sentence_length": "short/medium/long/mixed",
              "emoji_usage": "none/minimal/moderate/heavy",
              "structure": ["intro", "main_point", "call_to_action"],
              "hashtag_strategy": "minimal/focused/extensive/trending",
              "cta_patterns": ["ask questions", "encourage sharing", "direct action"],
              "language_mix": "formal/informal/technical/conversational",
              "do_nots": ["avoid excessive caps", "no overuse of emojis", "etc"]
            }
            Be specific and actionable in your analysis.`
          },
          {
            role: 'user',
            content: `Analyze these social media posts and create a style profile:\n\n${samples}`
          }
        ],
        max_tokens: 800,
        temperature: 0.3
      }),
    })

    if (!openAIResponse.ok) {
      console.error('OpenAI API error:', await openAIResponse.text())
      return new Response(JSON.stringify({ error: 'Failed to analyze style with OpenAI' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const openAIData = await openAIResponse.json()
    let styleProfile

    try {
      styleProfile = JSON.parse(openAIData.choices[0].message.content)
    } catch (error) {
      console.error('Failed to parse OpenAI response:', error)
      return new Response(JSON.stringify({ error: 'Invalid response from style analysis' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Add metadata to the profile
    const finalProfile = {
      ...styleProfile,
      status: 'analyzed',
      source: 'manual_samples',
      analyzed_at: new Date().toISOString(),
      sample_count: samples.split('\n').filter(line => line.trim().length > 10).length
    }

    // Update user's profile with the new style profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ style_profile: finalProfile })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error updating profile:', updateError)
      return new Response(JSON.stringify({ error: 'Failed to save style profile' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Log the event
    await supabase
      .from('events')
      .insert({
        owner: user.id,
        kind: 'style.built',
        payload: { sample_count: finalProfile.sample_count, tone: finalProfile.tone }
      })

    console.log(`Style profile built for user ${user.id}`)
    
    return new Response(JSON.stringify({ 
      ok: true, 
      profile: finalProfile 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error in style-build:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
