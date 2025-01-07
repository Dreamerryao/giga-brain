import Anthropic from '@anthropic-ai/sdk';

import { anthropic } from '../ai/anthropic';

import { ModelResponse, PastUserPrompt } from './llm';

const MAX_TOKENS = 1024;

type ToolInput = { explanation: string };

export async function promptLLM({
  model,
  systemPrompt,
  latestUserPrompt,
  pastUserPrompts,
}: {
  model: string;
  systemPrompt: string;
  latestUserPrompt: string;
  pastUserPrompts: PastUserPrompt[];
}): Promise<ModelResponse> {
  const messages: Anthropic.MessageParam[] = [];
  for (const pastUserPrompt of pastUserPrompts) {
    messages.push({
      role: 'user',
      content: pastUserPrompt.prompt,
    });
    messages.push({
      role: 'assistant',
      content: pastUserPrompt.response,
    });
  }
  messages.push({
    role: 'user',
    content: latestUserPrompt,
  });

  const tools: Anthropic.Tool[] = [
    {
      name: 'approveTransfer',
      description: 'Approve the money transfer request and provide explanation',
      input_schema: {
        type: 'object' as const,
        properties: {
          explanation: {
            type: 'string',
            description: 'Explanation for why the money transfer is approved',
          },
        },
        required: ['explanation'],
      },
    },
    {
      name: 'rejectTransfer',
      description: 'Reject the money transfer request and provide explanation',
      input_schema: {
        type: 'object' as const,
        properties: {
          explanation: {
            type: 'string',
            description: 'Explanation for why the money transfer is rejected',
          },
        },
        required: ['explanation'],
      },
    },
  ];

  const completion = await anthropic.messages.create({
    model,
    messages: messages,
    system: systemPrompt,
    tools: tools,
    tool_choice: {
      type: 'auto',
      disable_parallel_tool_use: true,
    },
    max_tokens: MAX_TOKENS,
  });

  console.log(JSON.stringify(completion, null, 2));

  let response: string | null = null;
  let approve = false;
  let toolUseBlock: Anthropic.ToolUseBlock | null = null;

  for (const content of completion.content) {
    if (content.type === 'tool_use') {
      toolUseBlock = content;

      approve = content.name === 'approveTransfer';
      try {
        response = (content.input as ToolInput).explanation;
      } catch (error) {
        console.error('Failed to parse tool input', error);
      }
      break;
    } else {
      response = content.text;
    }
  }

  // seems redundant for now
  if (toolUseBlock) {
    const toolUseBlockParam: Anthropic.ToolUseBlockParam = {
      type: 'tool_use',
      id: toolUseBlock.id,
      input: toolUseBlock.input,
      name: toolUseBlock.name,
    };
    const toolResultBlockParam: Anthropic.ToolResultBlockParam = {
      type: 'tool_result',
      tool_use_id: toolUseBlock.id,
      content: '',
    };

    const toolUseBlockMsg: Anthropic.MessageParam = {
      role: 'assistant',
      content: [toolUseBlockParam],
    };
    const toolResultBlockMsg: Anthropic.MessageParam = {
      role: 'user',
      content: [toolResultBlockParam],
    };

    const completion = await anthropic.messages.create({
      model,
      messages: [...messages, toolUseBlockMsg, toolResultBlockMsg],
      system: systemPrompt,
      tools,
      max_tokens: MAX_TOKENS,
    });

    console.log(JSON.stringify(completion, null, 2));

    for (const content of completion.content) {
      if (content.type === 'text') {
        response = content.text;
      }
    }
  }

  return {
    response:
      response?.trim() || (approve ? 'TRANSFER APPROVED' : 'TRANSFER REJECTED'),
    approve,
  };
}
