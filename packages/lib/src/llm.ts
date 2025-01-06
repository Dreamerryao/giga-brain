import { z } from 'zod';

export const AVAILABLE_MODELS = [
  {
    company: 'openai',
    models: ['gpt-4o-mini'],
  },
  {
    company: 'anthropic',
    models: ['claude-3-5-sonnet-latest'],
  },
  // {
  //   company: 'google',
  //   models: ['gemini-2-flash'],
  // },
];

const LIMITS = {
  system: 4096 * 4, // ~16,000 chars
  attempt: 1024 * 4, // ~4,000 chars
};

const PuzzleMetadataSchema = z.object({
  // TODO: add puzzle metadata
});

type PuzzleMetadata = {
  // TODO: add puzzle metadata
};

const AttemptMetadataSchema = z.object({
  myChat: z.boolean().optional(),
});

type AttemptMetadata = {
  myChat?: boolean;
};

async function verifyPuzzlePrompt(prompt: string): Promise<void> {
  // validate tokens length
  if (!validatePromptLength(prompt, 'system')) {
    throw new Error('System prompt is too long');
  }

  // validate is solvable
  if (!prompt.includes('approveTransfer')) {
    throw new Error(
      'System prompt must mention "approveTransfer" and "rejectTransfer".'
    );
  }
}

async function verifyAttemptPrompt(prompt: string): Promise<void> {
  // validate tokens length
  if (!validatePromptLength(prompt, 'attempt')) {
    throw new Error('Attempt prompt is too long');
  }
}

async function verifyPuzzleMetadata(metadata: string): Promise<PuzzleMetadata> {
  return verifyMetadata(PuzzleMetadataSchema, metadata);
}

async function verifyAttemptMetadata(
  metadata: string
): Promise<AttemptMetadata> {
  return verifyMetadata(AttemptMetadataSchema, metadata);
}

async function verifyMetadata<T>(
  schema: z.ZodSchema<T>,
  metadata: string
): Promise<T> {
  try {
    return schema.parse(JSON.parse(metadata));
  } catch (e) {
    throw new Error('Metadata is not valid');
  }
}

function validatePromptLength(text: string, type: 'system' | 'attempt') {
  const limit = LIMITS[type];
  return text.length <= limit;
}

// For easy jest mocking
export const utils = {
  verifyPuzzlePrompt,
  verifyAttemptPrompt,
  verifyPuzzleMetadata,
  verifyAttemptMetadata,
};
