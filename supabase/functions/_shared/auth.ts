
import { createHmac } from 'https://deno.land/std@0.177.0/crypto/mod.ts'

export function verifyAutomationSignature(body: string, signature: string | null): boolean {
  if (!signature) {
    return false
  }

  const secret = Deno.env.get('AUTOMATION_WEBHOOK_SECRET')
  if (!secret) {
    console.error('AUTOMATION_WEBHOOK_SECRET not configured')
    return false
  }

  try {
    const encoder = new TextEncoder()
    const key = encoder.encode(secret)
    const data = encoder.encode(body)
    
    const hmac = createHmac('sha256', key)
    hmac.update(data)
    const expectedSignature = Array.from(hmac.digest())
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    return signature === expectedSignature
  } catch (error) {
    console.error('Error verifying signature:', error)
    return false
  }
}
