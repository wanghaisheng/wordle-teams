import { processWebhookEvent, storeWebhookEvent } from '@/app/me/actions'
import { webhookHasMeta } from '@/lib/typeguards'
import { WebhookEvent } from '@/lib/types'
import { log } from 'next-axiom'

export async function POST(request: Request) {
  if (!process.env.LEMONSQUEEZY_WEBHOOK_SECRET) {
    return new Response('Lemon Squeezy Webhook Secret not set in .env', {
      status: 500,
    })
  }

  let rawBody: string

  try {
    // First, make sure the request is from Lemon Squeezy.
    rawBody = await request.text()
    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET

    // const hmac = crypto.createHmac('sha256', secret)
    // const digest = Buffer.from(hmac.update(rawBody).digest('hex'), 'utf8')
    // const signature = Buffer.from(request.headers.get('X-Signature') ?? '', 'utf8')
    const signature = request.headers.get('X-Signature') ?? ''

    if (secret !== signature) {
      return new Response('Invalid signature', { status: 400 })
    }
    // if (!crypto.timingSafeEqual(digest, signature)) {
    //   return new Response('Invalid signature', { status: 400 })
    // }
  } catch (error: any) {
    log.error(error)
    return new Response('Could not validate signature', { status: 500 })
  }

  const data = JSON.parse(rawBody) as unknown

  // Type guard to check if the object has a 'meta' property.
  if (webhookHasMeta(data)) {
    const webhookEventId = await storeWebhookEvent(data.meta.event_name, data)
    if (!webhookEventId) {
      return new Response('Failed to store webhook event', { status: 500 })
    }

    const webhookEvent = new WebhookEvent(
      webhookEventId,
      data.meta.custom_data.user_id,
      data.meta.event_name,
      data
    )
    // Non-blocking call to process the webhook event.
    void processWebhookEvent(webhookEvent)

    return new Response('OK', { status: 200 })
  }

  return new Response('Data invalid', { status: 400 })
}
