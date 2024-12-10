import OpenAI from 'openai';

import { ChatMessage } from './types';

export const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function completeChatText(
  messages: ChatMessage[],
  json?: boolean
): Promise<string | null> {
  const response = await completeChat(messages, json);
  return response.choices[0]?.message.content ?? null;
}

export async function completeChat(messages: ChatMessage[], json?: boolean) {
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo-1106',
    messages,
    response_format: {
      type: json ? 'json_object' : 'text',
    },
  });
  return response;
}
