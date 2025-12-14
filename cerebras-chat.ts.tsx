import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const CEREBRAS_API_KEY = process.env.CEREBRAS_API_KEY;

  try {
    const { message, systemPrompt, conversationHistory } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!CEREBRAS_API_KEY) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    interface Message {
      role: 'user' | 'assistant';
      content: string;
    }

    const messages: Message[] = [
      { role: 'user', content: systemPrompt }
    ];

    if (conversationHistory && Array.isArray(conversationHistory)) {
      (conversationHistory as Message[]).forEach((msg: Message) => {
        messages.push({
          role: msg.role,
          content: msg.content,
        });
      });
    }

    messages.push({
      role: 'user',
      content: message,
    });

    const response = await fetch('https://api.cerebras.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CEREBRAS_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b',
        messages: messages,
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`Cerebras API error: ${response.statusText}`);
    }

    const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    const reply = data.choices?.[0]?.message?.content || 'No response';

    return res.status(200).json({ reply });
  } catch (error) {
    console.error('Cerebras chat error:', error);
    return res.status(500).json({
      error: 'Failed to process request',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}