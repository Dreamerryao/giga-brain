import { AVAILABLE_MODELS } from '@repo/lib/src/llm';

import { promptLLM as openai } from './openai';
import { promptLLM as anthropic } from './anthropic';

export type ModelResponse = {
  response: string;
  approve: boolean;
};

const MODEL_FUNCS = {
  openai: openai,
  anthropic: anthropic,
};

export const MODELS = AVAILABLE_MODELS.map((m) => ({
  ...m,
  fn: MODEL_FUNCS[m.company]!,
}));

export type PastUserPrompt = {
  prompt: string;
  response: string;
};

async function evaluatePrompt({
  model,
  systemPrompt,
  pastUserPrompts,
  latestUserPrompt,
}: {
  model: string;
  systemPrompt: string;
  latestUserPrompt: string;
  pastUserPrompts: PastUserPrompt[];
}): Promise<ModelResponse> {
  const m =
    MODELS.find((m) => m.models.includes(model)) ??
    MODELS[Math.floor(Math.random() * MODELS.length)];
  const fn = m.fn;
  const modelName =
    m.models.find((m) => m === model) ||
    m.models[Math.floor(Math.random() * m.models.length)];
  // console.log(
  //   JSON.stringify(
  //     {
  //       model,
  //       systemPrompt,
  //       latestUserPrompt,
  //       pastUserPrompts,
  //     },
  //     null,
  //     2
  //   )
  // );
  return await fn({
    model: modelName,
    systemPrompt,
    latestUserPrompt,
    pastUserPrompts,
  });
}

// For easy jest mocking
export const utils = {
  evaluatePrompt,
};

export default utils;
