
import { createHmac } from 'crypto';

// N8N webhook utilities (prepared but not used yet)
const N8N_WEBHOOK_BASE = import.meta.env.VITE_N8N_WEBHOOK_BASE || '';
const N8N_WEBHOOK_SECRET = import.meta.env.VITE_N8N_WEBHOOK_SECRET || '';
const INTEGRATIONS_USE_N8N = import.meta.env.VITE_INTEGRATIONS_USE_N8N === 'true';

export function signForN8N(body: string, secret: string): string {
  return createHmac('sha256', secret)
    .update(body)
    .digest('hex');
}

export function verifyAutomationSignature(body: string, signature: string | null, secret: string): boolean {
  if (!signature) {
    return false;
  }

  try {
    const expectedSignature = signForN8N(body, secret);
    return signature === expectedSignature;
  } catch (error) {
    console.error('Error verifying signature:', error);
    return false;
  }
}

export const n8nEndpoints = {
  generateCaption: `${N8N_WEBHOOK_BASE}/generate-caption`,
  requestEdit: `${N8N_WEBHOOK_BASE}/request-edit`,
  schedulePost: `${N8N_WEBHOOK_BASE}/schedule-post`,
  analyzeStyle: `${N8N_WEBHOOK_BASE}/analyze-style`,
};

// Feature flag to control n8n integration
export const useN8N = () => INTEGRATIONS_USE_N8N;

// Placeholder functions for future n8n integration
export const n8nWebhooks = {
  generateCaption: async (draftId: string) => {
    if (!useN8N()) {
      throw new Error('N8N integration not enabled');
    }
    // Will be implemented when n8n is ready
    console.log('N8N generate caption not implemented yet:', draftId);
  },

  requestEdit: async (draftId: string, preset?: string) => {
    if (!useN8N()) {
      throw new Error('N8N integration not enabled');
    }
    // Will be implemented when n8n is ready
    console.log('N8N request edit not implemented yet:', draftId, preset);
  },

  schedulePost: async (draftId: string, platforms: string[], scheduledFor: string) => {
    if (!useN8N()) {
      throw new Error('N8N integration not enabled');
    }
    // Will be implemented when n8n is ready
    console.log('N8N schedule post not implemented yet:', draftId, platforms, scheduledFor);
  },

  analyzeStyle: async (samples: string) => {
    if (!useN8N()) {
      throw new Error('N8N integration not enabled');
    }
    // Will be implemented when n8n is ready
    console.log('N8N analyze style not implemented yet:', samples);
  }
};
