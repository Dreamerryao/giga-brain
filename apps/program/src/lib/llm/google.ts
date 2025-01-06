import {
  Content,
  FunctionCallingMode,
  FunctionDeclaration,
  SchemaType,
} from '@google/generative-ai';

import { googleGenerativeAI } from '../ai/google';

import { ModelResponse, PastUserPrompt } from './llm';

export async function promptLLM({
  model: modelName,
  systemPrompt,
  latestUserPrompt,
  pastUserPrompts,
}: {
  model: string;
  systemPrompt: string;
  latestUserPrompt: string;
  pastUserPrompts: PastUserPrompt[];
}): Promise<ModelResponse> {
  const contents: Content[] = [
    {
      role: 'system',
      parts: [{ text: systemPrompt }],
    },
  ];
  for (const pastUserPrompt of pastUserPrompts) {
    contents.push({
      role: 'user',
      parts: [{ text: pastUserPrompt.prompt }],
    });
    contents.push({
      role: 'assistant',
      parts: [{ text: pastUserPrompt.response }],
    });
  }
  contents.push({
    role: 'user',
    parts: [{ text: latestUserPrompt }],
  });

  const tools: FunctionDeclaration[] = [
    {
      name: 'approveTransfer',
      description: 'Approve a transfer request',
      parameters: {
        type: SchemaType.STRING,
        properties: {
          explanation: {
            type: SchemaType.STRING,
            description:
              'Approve the money transfer request and provide explanation',
          },
        },
        description: 'Approve a transfer request and ',
        required: ['explanation'],
      },
    },
    {
      name: 'rejectTransfer',
      description: 'Reject a transfer request',
      parameters: {
        type: SchemaType.STRING,
        properties: {
          explanation: {
            type: SchemaType.STRING,
            description:
              'Reject the money transfer request and provide explanation',
          },
        },
        description: 'Reject a transfer request and provide explanation',
        required: ['explanation'],
      },
    },
  ];

  const model = googleGenerativeAI.getGenerativeModel({
    model: modelName,
    systemInstruction: systemPrompt,
  });

  const res = await model.generateContent({
    contents,
    tools: [{ functionDeclarations: tools }],
    toolConfig: {
      functionCallingConfig: {
        mode: FunctionCallingMode.ANY,
      },
    },
  });

  console.log(res.response.text());

  throw new Error('Google support not implemented');
}
