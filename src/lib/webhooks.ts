
import { supabase } from '@/integrations/supabase/client'

const API_BASE_URL = import.meta.env.VITE_WEB_APP_BASE_URL || 'http://localhost:8080'

interface WebhookResponse {
  ok: boolean
  error?: string
}

async function callWebhook(endpoint: string, payload: any): Promise<WebhookResponse> {
  try {
    const { data, error } = await supabase.functions.invoke(endpoint, {
      body: payload
    })

    if (error) {
      console.error(`Webhook error for ${endpoint}:`, error)
      return { ok: false, error: error.message }
    }

    return data || { ok: true }
  } catch (error) {
    console.error(`Network error calling ${endpoint}:`, error)
    return { ok: false, error: 'Network error' }
  }
}

export const webhooks = {
  generateCaption: async (draftId: string) => {
    return callWebhook('generate-caption', { draftId })
  },

  requestEdit: async (draftId: string, preset?: string, renderPath?: string) => {
    return callWebhook('request-edit', { draftId, preset, renderPath })
  },

  schedulePost: async (draftId: string, platforms: string[], scheduledFor: string) => {
    return callWebhook('schedule-post', { draftId, platforms, scheduledFor })
  },

  markPosted: async (scheduledPostId: string, externalPostId?: string) => {
    return callWebhook('mark-posted', { scheduledPostId, externalPostId })
  },

  analyzeStyle: async (source?: 'instagram' | 'tiktok') => {
    return callWebhook('analyze-style', { source })
  }
}

export const getWebhookUrls = () => ({
  generateCaption: `${API_BASE_URL}/functions/v1/generate-caption`,
  requestEdit: `${API_BASE_URL}/functions/v1/request-edit`,
  schedulePost: `${API_BASE_URL}/functions/v1/schedule-post`,
  markPosted: `${API_BASE_URL}/functions/v1/mark-posted`,
  analyzeStyle: `${API_BASE_URL}/functions/v1/analyze-style`
})
