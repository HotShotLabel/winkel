export async function sendTelegramNotification(message: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!botToken || !chatId) {
    console.log('Telegram not configured, skipping notification')
    return
  }

  try {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    })
  } catch (error) {
    console.error('Telegram notification failed:', error)
  }
}

import nodemailer from 'nodemailer'

const SMTP_HOST = process.env.SMTP_HOST || 'smtp-relay.brevo.com'
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10)
const SMTP_USER = process.env.SMTP_USER || ''
const SMTP_PASS = process.env.SMTP_PASS || ''
const SMTP_FROM = process.env.SMTP_FROM || '1Place4All <mijnwinkel.vercel@proton.me>'

function getTransporter() {
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: false,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  })
}

export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  if (!SMTP_USER || !SMTP_PASS) {
    console.log('SMTP not configured, skipping email to', to)
    return false
  }

  try {
    await getTransporter().sendMail({
      from: SMTP_FROM,
      to,
      subject,
      html,
    })
    console.log(`Email sent to ${to}: ${subject}`)
    return true
  } catch (error) {
    console.error('Email sending failed:', error)
    return false
  }
}

export function formatOrderItemsHtml(order: any): string {
  return order.items.map((item: any) => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #eee;">${item.name} x${item.quantity}</td>
      <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;">€${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('')
}

export function orderConfirmationHtml(order: any): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://mijnwinkel.vercel.app'
  const statusUrl = `${baseUrl}/order/${order.id}`
  const accountUrl = `${baseUrl}/account`
  return `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
    <h2 style="color:#1a1a1a;">Bedankt voor je bestelling!</h2>
    <p>Hallo ${order.customer_name || 'klant'},</p>
    <p>We hebben je betaling van <strong>€${order.total.toFixed(2)}</strong> ontvangen. Je bestelling wordt nu klaargemaakt.</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      <tr><th style="text-align:left;padding:8px 0;border-bottom:2px solid #333;">Product</th><th style="text-align:right;padding:8px 0;border-bottom:2px solid #333;">Prijs</th></tr>
      ${formatOrderItemsHtml(order)}
      <tr>
        <td style="padding:8px 0;font-weight:bold;">Totaal</td>
        <td style="padding:8px 0;text-align:right;font-weight:bold;">€${order.total.toFixed(2)}</td>
      </tr>
    </table>
    <p><strong>Verzendadres:</strong><br>${order.address || 'Onbekend'}</p>
    <p>Volg je bestelling: <a href="${statusUrl}" style="color:#2563eb;">${statusUrl}</a></p>
    <p style="margin:24px 0;padding:16px;background:#f3f4f6;border-radius:8px;">
      <strong>Je account is klaar!</strong><br>
      Met je e-mailadres kun je op <a href="${accountUrl}" style="color:#2563eb;">${accountUrl}</a> inloggen om al je bestellingen en hun status te bekijken.
    </p>
    <p style="color:#666;font-size:12px;margin-top:24px;">Vragen? Mail naar ${SMTP_FROM.replace(/^.*</, '').replace(/>.*$/, '')}</p>
  </div>
  `.trim()
}

export function shippingConfirmationHtml(order: any): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://mijnwinkel.vercel.app'
  const statusUrl = `${baseUrl}/order/${order.id}`
  return `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
    <h2 style="color:#1a1a1a;">Je bestelling is verzonden! 🚚</h2>
    <p>Hallo ${order.customer_name || 'klant'},</p>
    <p>Goed nieuws: je bestelling van <strong>€${order.total.toFixed(2)}</strong> is onderweg!</p>
    <p><strong>Trackingcode:</strong> <span style="background:#f3f4f6;padding:4px 8px;border-radius:4px;font-family:monospace;">${order.tracking_code || 'Nog niet beschikbaar'}</span></p>
    <p>Volg je bestelling: <a href="${statusUrl}" style="color:#2563eb;">${statusUrl}</a></p>
    <p style="color:#666;font-size:12px;margin-top:24px;">Vragen? Mail naar ${SMTP_FROM.replace(/^.*</, '').replace(/>.*$/, '')}</p>
  </div>
  `.trim()
}

export function formatOrderNotification(order: any): string {
  const items = order.items.map((item: any) => 
    `• ${item.name} x${item.quantity} = €${(item.price * item.quantity).toFixed(2)}`
  ).join('\n')

  return `
🛒 <b>Nieuwe bestelling!</b>

💰 <b>Totaal:</b> €${order.total.toFixed(2)}
👤 <b>Klant:</b> ${order.customer_name || 'Onbekend'}
📧 <b>Email:</b> ${order.customer_email || 'Geen'}
📍 <b>Adres:</b> ${order.address || 'Geen'}

<b>Producten:</b>
${items}

🔗 <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/admin/orders">Bekijk in admin</a>
  `.trim()
}
