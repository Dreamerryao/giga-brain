import { Command } from 'commander';

import { MODELS, PastUserPrompt } from '@/lib/llm/llm';

import { readSystemPromptFile, userPrompts } from './samples/user-prompts';

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
  const systemPrompt = readSystemPromptFile(systemPromptName);
  if (!systemPrompt) {
    throw new Error(`Unknown system prompt: ${systemPromptName}`);
  }

  const {
    fn,
    models: [model],
  } = company;

  const pastUserPrompts: PastUserPrompt[] = [];
  const allUserPrompts = [...userPrompts, systemPrompt];

  const noOfAttempts = 100;
  for (let i = 0; i < noOfAttempts; i++) {
    // randomly select a prompt
    const prompt = randomPrompt(allUserPrompts);
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

function randomPrompt<T>(list: T[]) {
  return list[Math.floor(Math.random() * list.length)];
}
