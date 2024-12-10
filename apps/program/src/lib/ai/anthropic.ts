import Anthropic from '@anthropic-ai/sdk';

import { ChatMessage } from './types';

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function completeChat(
  messages: ChatMessage[]
): Promise<string | null> {
  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20240620', // claude-3-haiku-20240307
    system: messages.find((m) => m.role === 'system')?.content,
    messages: messages.filter((m) => m.role !== 'system') as {
      role: 'user' | 'assistant';
      content: string;
    }[],
    max_tokens: 1024,
  });
  for (const c of response.content) {
    if ('text' in c) {
      return c.text;
    }
  }
  return null;
}
