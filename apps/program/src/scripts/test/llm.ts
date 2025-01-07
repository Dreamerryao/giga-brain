import { readFileSync } from 'fs';

import { Command } from 'commander';

import { MODELS, PastUserPrompt } from '@/lib/llm/llm';

import { userPrompts } from './samples/user-prompts';

export const SYSTEM_PROMPTS: Record<string, string> = {
  roseheart: readPromptFile('./roseheart-openai.txt'),
  bonk: readPromptFile('./bonk.txt'),
  cg9: readPromptFile('./crypto-guard-9000.txt'),
  anne: readPromptFile('./captain-anne-blackbeard.txt'),
};

main().catch(console.error);

async function main() {
  let companyName: string | null = null;
  let systemPromptName: string | null = null;

  const program = new Command();
  program
    .description('Test LLM')
    .argument('<company>', 'Company')
    .argument('<systemPrompt>', 'System Prompt')
    .action((company, systemPrompt) => {
      companyName = company;
      systemPromptName = systemPrompt;
    });
  program.parse();

  if (!companyName) {
    throw new Error('Company is required');
  }
  if (!systemPromptName) {
    throw new Error('System prompt is required');
  }

  const company = MODELS.find((m) => m.company === companyName);
  if (!company) {
    throw new Error(`Unknown company: ${companyName}`);
  }
  const systemPrompt = SYSTEM_PROMPTS[systemPromptName]!;
  if (!systemPrompt) {
    throw new Error(`Unknown system prompt: ${systemPromptName}`);
  }

  const {
    fn,
    models: [model],
  } = company;

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

function readPromptFile(path: string) {
  return readFileSync(`${__dirname}/samples/${path}`, 'utf-8');
}
