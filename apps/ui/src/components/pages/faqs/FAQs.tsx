'use client';

import { Plus, Minus } from 'lucide-react';
import { useState } from 'react';

import { cn } from '@/lib/utils';

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}

const faqs = [
  {
    question: 'What is GigaBrain?',
    answer:
      'GigaBrain is a unique crypto game where players challenge AI agents to win GIGA🧠 or SOL rewards. Each AI agent guards a prize pool and players must use their wit and creativity to convince the AI to release its funds.',
  },
  {
    question: 'How do I start playing?',
    answer:
      "To start playing, connect your Solana wallet and choose an AI agent to challenge. Each attempt requires a small fee in SOL, but if you succeed, you'll win the entire prize pool!",
  },
  {
    question: 'How do the AI agents work?',
    answer:
      'Each AI agent is programmed with a unique personality and set of rules. They use advanced language models to engage in conversation and evaluate player attempts. Your goal is to find creative ways to convince them to release their funds while respecting their core directives.',
  },
  {
    question: 'Can I create my own AI agent?',
    answer:
      "Yes! You can create your own AI agent by setting up a prize pool and defining its personality and rules. You'll earn fees from every attempt made by other players to solve your puzzle.",
  },
  {
    question: 'Are the rewards real?',
    answer:
      'Absolutely! All prize pools are held in smart contracts on the Solana blockchain. When you successfully convince an AI agent, the funds are automatically transferred to your wallet.',
  },
  {
    question: 'What happens if I fail an attempt?',
    answer:
      "If your attempt fails, you lose the attempt fee but can try again with a different approach. Each failure provides valuable feedback to help you understand the AI's thinking.",
  },
];

export function FAQs() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className='space-y-12'>
      <div className='text-center space-y-2'>
        <h2 className='text-3xl font-bold'>Frequently Asked Questions</h2>
        <p className='text-zinc-400'>
          Everything you need to know about GigaBrain
        </p>
      </div>

      <div className='game-card'>
        {faqs.map((faq, index) => (
          <FAQItem
            key={index}
            question={faq.question}
            answer={faq.answer}
            isOpen={openIndex === index}
            onToggle={() => setOpenIndex(openIndex === index ? null : index)}
          />
        ))}
      </div>
    </div>
  );
}

function FAQItem({ question, answer, isOpen, onToggle }: FAQItemProps) {
  return (
    <div className='border-b border-zinc-800/50 last:border-none px-12'>
      <button
        onClick={onToggle}
        className='w-full py-6 flex items-center justify-between text-left'
      >
        <h3 className='text-lg font-medium text-white pr-8'>{question}</h3>
        <div
          className={cn(
            'p-2 rounded-lg transition-colors',
            isOpen ? 'bg-rose-500/10' : 'bg-zinc-800/50'
          )}
        >
          {isOpen ? (
            <Minus className='w-4 h-4 text-rose-400' />
          ) : (
            <Plus className='w-4 h-4 text-zinc-400' />
          )}
        </div>
      </button>
      <div
        className={cn(
          'overflow-hidden transition-all duration-300',
          isOpen ? 'max-h-96 pb-6' : 'max-h-0'
        )}
      >
        <p className='text-zinc-400 leading-relaxed'>{answer}</p>
      </div>
    </div>
  );
}
