
# N8N Integration Plan

> **Status**: Not Active - Local processing is currently used for all features
> 
> This document describes the planned n8n webhook integration for automating content processing workflows.

## Overview

The app is designed to integrate with n8n for advanced automation workflows while maintaining local fallbacks. Currently, all processing happens locally with real OpenAI integration.

## Planned Webhook Endpoints

All webhooks will require HMAC SHA-256 signature verification using the `N8N_WEBHOOK_SECRET`.

### Authentication

Each request to n8n will include:
- Header: `x-n8n-signature` = HMAC_SHA256(rawBody, N8N_WEBHOOK_SECRET)
- Content-Type: `application/json`

### 1. Generate Caption

**Endpoint**: `POST ${N8N_WEBHOOK_BASE}/generate-caption`

**Payload**:
```json
{
  "draftId": "uuid",
  "title": "optional title",
  "mediaType": "image|video",
  "hashtags": "optional existing hashtags",
  "styleProfile": { "tone": "casual", "..." }
}
```

**Expected Flow**:
1. n8n receives webhook
2. Processes content using AI/OpenAI
3. Returns generated caption
4. Calls back: `POST ${APP_BASE}/functions/v1/mark-posted` with caption

**Current Implementation**: Local OpenAI processing in `generate-caption` edge function

---

### 2. Request Edit

**Endpoint**: `POST ${N8N_WEBHOOK_BASE}/request-edit`

**Payload**:
```json
{
  "draftId": "uuid",
  "preset": "silence-cut+captions",
  "mediaPath": "path/to/raw/video.mp4"
}
```

**Expected Flow**:
1. n8n receives edit request
2. Processes video (silence cutting, captions, etc.)
3. Uploads edited video to storage
4. Calls back with render path

**Current Implementation**: Simulated processing with random delay in `request-edit` edge function

---

### 3. Schedule Post

**Endpoint**: `POST ${N8N_WEBHOOK_BASE}/schedule-post`

**Payload**:
```json
{
  "draftId": "uuid",
  "platforms": ["instagram", "tiktok"],
  "scheduledFor": "2024-01-01T10:00:00Z",
  "content": {
    "caption": "...",
    "hashtags": "...",
    "mediaPath": "..."
  }
}
```

**Expected Flow**:
1. n8n receives schedule request
2. Waits until scheduled time
3. Posts to respective platforms
4. Calls back with posting results

**Current Implementation**: Local scheduling with background cron simulation in `process-scheduled-posts`

---

### 4. Analyze Style

**Endpoint**: `POST ${N8N_WEBHOOK_BASE}/analyze-style`

**Payload**:
```json
{
  "samples": "Past post content...",
  "source": "instagram|tiktok|manual"
}
```

**Expected Flow**:
1. n8n receives content samples
2. Analyzes with AI to extract style patterns
3. Returns structured style profile
4. Updates user profile

**Current Implementation**: Local OpenAI processing in `style-build` edge function

---

## App Callback Endpoint

**Endpoint**: `POST ${APP_BASE}/functions/v1/mark-posted`

This endpoint receives completion notifications from n8n workflows.

**Authentication**: HMAC signature using `AUTOMATION_WEBHOOK_SECRET`

**Payload Examples**:

Caption completion:
```json
{
  "type": "caption_ready",
  "draftId": "uuid",
  "caption": "Generated caption text..."
}
```

Edit completion:
```json
{
  "type": "edit_ready", 
  "draftId": "uuid",
  "renderPath": "renders/edited_video.mp4"
}
```

Post completion:
```json
{
  "type": "posted",
  "scheduledPostId": "uuid",
  "externalPostId": "platform_post_id",
  "platform": "instagram"
}
```

## Environment Variables

### Required for n8n Integration
- `N8N_WEBHOOK_BASE` - Base URL for n8n webhooks
- `N8N_WEBHOOK_SECRET` - Secret for signing outbound requests
- `INTEGRATIONS_USE_N8N` - Feature flag (false = local processing)

### Already Configured
- `AUTOMATION_WEBHOOK_SECRET` - For verifying inbound signatures
- `WEB_APP_BASE_URL` - For callback URLs
- `OPENAI_API_KEY` - For AI processing

## Security

1. **HMAC Verification**: All requests verified with SHA-256 signatures
2. **Authentication**: User context maintained through Supabase auth
3. **Validation**: All payloads validated before processing
4. **Rate Limiting**: Built into Supabase edge functions

## Testing

### Example cURL for Testing n8n Webhook

```bash
# Generate caption (when n8n is ready)
curl -X POST "${N8N_WEBHOOK_BASE}/generate-caption" \
  -H "Content-Type: application/json" \
  -H "x-n8n-signature: $(echo -n '{"draftId":"test"}' | openssl dgst -sha256 -hmac "${N8N_WEBHOOK_SECRET}" -binary | xxd -p)" \
  -d '{"draftId":"test-draft-id"}'
```

### App Callback Test

```bash
# Test callback (current implementation)
curl -X POST "${APP_BASE}/functions/v1/mark-posted" \
  -H "Content-Type: application/json" \
  -H "x-signature: $(echo -n '{"scheduledPostId":"test"}' | openssl dgst -sha256 -hmac "${AUTOMATION_WEBHOOK_SECRET}" -binary | xxd -p)" \
  -d '{"scheduledPostId":"test-id","externalPostId":"test-post"}'
```

## Migration Plan

1. **Phase 1** (Current): Local processing with real OpenAI
2. **Phase 2**: n8n integration for non-critical workflows (style analysis)  
3. **Phase 3**: Full n8n integration with local fallbacks
4. **Phase 4**: Platform integrations (Instagram, TikTok APIs)

## Notes

- All current features work locally without n8n
- Feature flag `INTEGRATIONS_USE_N8N` controls integration
- Local implementations provide immediate value
- n8n integration adds advanced automation capabilities
- Platform posting currently simulated (no real API calls)
