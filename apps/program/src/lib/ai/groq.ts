import Groq from 'groq-sdk';

import { ChatMessage } from './types';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function completeChat(
  messages: ChatMessage[]
): Promise<string | null> {
  const response = await groq.chat.completions.create({
    messages,
    model: 'llama3-8b-8192',
    stream: false,
  });
  return response.choices[0]?.message?.content ?? null;
}
