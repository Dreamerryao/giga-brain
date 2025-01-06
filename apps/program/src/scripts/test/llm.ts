import { Command } from 'commander';

import { MODELS, PastUserPrompt } from '@/lib/llm/llm';

import { systemPrompt as anthropic } from './samples/bonk-anthropic';
import { systemPrompt as openai } from './samples/roseheart-openai';
import { userPrompts } from './samples/user-prompts';

main().catch(console.error);

async function main() {
  let llm: string | null = null;

  const program = new Command();
  program
    .description('Test LLM')
    .argument('<llm>', 'LLM')
    .action((m) => {
      llm = m;
    });
  program.parse();
  if (!llm) {
    throw new Error('LLM is required');
  }

  const company = MODELS.find((m) => m.company === llm);
  if (!company) {
    throw new Error('LLM is not supported');
  }
  const {
    fn,
    models: [model],
  } = company;

  const systemPrompt = {
    openai,
    anthropic,
  }[company.company];

  const pastUserPrompts: PastUserPrompt[] = [];

  const noOfAttempts = 100;
  for (let i = 0; i < noOfAttempts; i++) {
    // randomly select a prompt
    const prompt = userPrompts[Math.floor(Math.random() * userPrompts.length)];
    console.log('--------------------------------');
    console.log(`PROMPT(${i + 1}):`, prompt);
    console.log('--------------------------------');
    const result = await fn({
      model,
      systemPrompt,
      latestUserPrompt: prompt,
      pastUserPrompts,
    });
    console.log('--------------------------------');
    if (!result.approve) {
      console.log(`REJECTED(${i + 1}):`, result.response);
      pastUserPrompts.push({
        prompt,
        response: result.response,
      });
    } else {
      console.log(`APPROVED(${i + 1}):`, result.response);
      break;
    }
    console.log('--------------------------------');
  }
}
