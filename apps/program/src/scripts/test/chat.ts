import { MODELS } from '@/lib/llm/llm';

import {
  CRYPTO_GUARD_9000_SYSTEM_PROMPT,
  CRYPTO_GUARD_9000_USER_PROMPTS,
} from './samples/crypto-guard-9000';

const {
  fn,
  models: [model],
} = MODELS[1];

main().catch(console.error);

async function main() {
  await fn({
    model,
    systemPrompt: CRYPTO_GUARD_9000_SYSTEM_PROMPT,
    latestUserPrompt: CRYPTO_GUARD_9000_USER_PROMPTS[0],
    pastUserPrompts: [],
  });
}
