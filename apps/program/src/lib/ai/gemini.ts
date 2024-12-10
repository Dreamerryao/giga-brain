import { GoogleGenerativeAI } from '@google/generative-ai';

import { ChatMessage } from './types';

export const googleGenerativeAI = new GoogleGenerativeAI(
  process.env.GOOGLE_API_KEY!
);

export async function completeChat(
  messages: ChatMessage[]
): Promise<string | null> {
  const model = googleGenerativeAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction: messages.find((m) => m.role === 'system')?.content,
  });

  const res = await model.generateContent([
    messages.find((m) => m.role === 'user')?.content ?? '',
  ]);
  return res.response.text();
}
