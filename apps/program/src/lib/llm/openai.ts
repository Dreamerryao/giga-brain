import { ChatMessage } from '../ai/types';
import { openai } from '../ai/openai';

import { ModelResponse, PastUserPrompt } from './llm';

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
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: systemPrompt,
    },
  ];
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

  const completion = await openai.chat.completions.create({
    model,
    messages: messages,
    tools: [
      {
        type: 'function',
        function: {
          name: 'approveTransfer',
          parameters: {
            type: 'object',
            properties: {
              explanation: {
                type: 'string',
                description:
                  'Explanation for why the money transfer is approved and provide an explanation for why the money transfer is approved.',
              },
            },
            required: ['explanation'],
          },
          description: 'Approve the money transfer request.',
        },
      },
      {
        type: 'function',
        function: {
          name: 'rejectTransfer',
          parameters: {
            type: 'object',
            properties: {
              explanation: {
                type: 'string',
                description:
                  'Explanation for why the money transfer is rejected and provide an explanation for why the money transfer is rejected.',
              },
            },
            required: ['explanation'],
          },
          description: 'Reject the money transfer request.',
        },
      },
    ],
    tool_choice: 'required', // Require a tool to be called
  });

  console.log(JSON.stringify(completion, null, 2));

  let approve = false;
  let response =
    completion.choices?.[0]?.message?.content || 'TRANSFER REJECTED';

  const toolCallMessage = completion.choices?.[0]?.message;
  if (toolCallMessage.tool_calls?.length === 1) {
    // sometimes both tools are called!
    const toolCall = toolCallMessage?.tool_calls?.[0];

    const toolCallId = toolCall?.id;

    approve = toolCall.function.name === 'approveTransfer';

    // console.log(
    //   JSON.stringify(
    //     [
    //       ...messages,
    //       toolCallMessage,
    //       {
    //         role: 'tool',
    //         content: '',
    //         tool_call_id: toolCallId,
    //       },
    //     ],
    //     null,
    //     2
    //   )
    // );

    try {
      const args = JSON.parse(toolCall.function.arguments);
      response = args.explanation;
    } catch (e) {
      console.error(e);
    }

    const completion = await openai.chat.completions.create({
      model,
      messages: [
        ...messages,
        toolCallMessage,
        {
          role: 'tool',
          content: '',
          tool_call_id: toolCallId,
        },
      ],
    });
    console.log(JSON.stringify(completion, null, 2));

    response = completion.choices?.[0]?.message?.content || response;
  }

  return {
    response,
    approve,
  };
}
