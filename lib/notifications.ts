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

export function formatOrderNotification(order: any): string {
  const items = order.items.map((item: any) => 
    `• ${item.name} x${item.quantity} = €${(item.price * item.quantity).toFixed(2)}`
  ).join('\n')

  return `
🛒 <b>Nieuwe bestelling!</b>

💰 <b>Totaal:</b> €${order.total.toFixed(2)}
👤 <b>Klant:</b> ${order.customerName || 'Onbekend'}
📧 <b>Email:</b> ${order.customerEmail || 'Geen'}
📍 <b>Adres:</b> ${order.address || 'Geen'}

<b>Producten:</b>
${items}

🔗 <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/admin/orders">Bekijk in admin</a>
  `.trim()
}
