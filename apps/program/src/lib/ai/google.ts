import { GoogleGenerativeAI } from '@google/generative-ai';

export const googleGenerativeAI = new GoogleGenerativeAI(
  process.env.GOOGLE_API_KEY!
);
