import React from 'react';
import { Brain, MessageSquare, GithubIcon, BookOpen, Send } from 'lucide-react';
import Link from 'next/link';

import {
  getFaqsRoute,
  getHomeRoute,
  getHowItWorksRoute,
  getLeaderboardRoute,
  getLoreRoute,
  getPrivacyPolicyRoute,
  getPromptingGuideRoute,
  getRoadmapRoute,
  getTermsOfUseRoute,
  getTokenomicsRoute,
} from '@/lib/routes';

import { NewsletterForm } from './NewsletterForm';

const LINKS = [
  {
    name: 'Home',
    href: getHomeRoute(),
  },
  {
    name: 'Leaderboard',
    href: getLeaderboardRoute(),
  },
  {
    icon: <BookOpen className='w-4 h-4' />,
    name: 'Game Lore',
    href: getLoreRoute(),
  },
  {
    name: 'FAQs',
    href: getFaqsRoute(),
  },
  {
    name: 'How it works',
    href: getHowItWorksRoute(),
  },
  {
    name: 'Prompting Guide',
    href: getPromptingGuideRoute(),
  },
  {
    name: 'Tokenomics',
    href: getTokenomicsRoute(),
  },
  {
    name: 'Roadmap',
    href: getRoadmapRoute(),
  },
];

const SOCIALS = [
  {
    name: 'Telegram',
    icon: <Send className='w-4 h-4' />,
    href: 'https://t.me/GigaBrainDotSo',
    enabled: true,
  },
  {
    name: 'Discord',
    icon: <MessageSquare className='w-4 h-4' />,
    href: 'https://discord.gg/zxtMWFJSNf',
    enabled: true,
  },
  {
    name: 'X',
    icon: (
      <svg className='w-4 h-4' viewBox='0 0 24 24' fill='currentColor'>
        <path d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' />
      </svg>
    ),
    href: 'https://x.com/GigaBrainDotSo',
    enabled: true,
  },
  {
    name: 'GitHub',
    icon: <GithubIcon className='w-4 h-4' />,
    href: 'https://github.com/giga-brain',
    enabled: false,
  },
];

export function Footer() {
  return (
    <footer className='border-t border-zinc-800/50 mt-16'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
          <div className='space-y-4'>
            <Link
              href={getHomeRoute()}
              className='flex items-center space-x-3 group'
            >
              <div className='relative'>
                <div className='absolute inset-0 bg-rose-500/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300' />
                <Brain className='w-8 h-8 text-rose-500 relative z-10' />
              </div>
              <span className='text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-rose-500 to-rose-400'>
                GigaBrain
              </span>
            </Link>
            <p className='text-zinc-400'>
              The ultimate AI vs Human crypto game. Built with 🧠 and ❤️ by
              degens.
            </p>
          </div>

          <div>
            <h3 className='font-semibold text-white mb-4'>Quick Links</h3>
            <ul className='space-y-2'>
              {LINKS.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className='flex items-center space-x-2 text-zinc-400 hover:text-rose-400 transition-colors'
                  >
                    <span>{link.name}</span>
                    {link.icon}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className='font-semibold text-white mb-4'>Community</h3>
            <ul className='space-y-2'>
              {SOCIALS.map((social) =>
                !social.enabled ? null : (
                  <li key={social.name}>
                    <a
                      href={social.href}
                      className='flex items-center space-x-2 text-zinc-400 hover:text-rose-400 transition-colors'
                      target='_blank'
                      rel='noreferrer'
                    >
                      {social.icon}
                      <span>{social.name}</span>
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>

          <div>
            <h3 className='font-semibold text-white mb-4'>Newsletter</h3>
            <p className='text-zinc-400 mb-4'>
              Stay updated with the latest AI puzzles and rewards
            </p>
            <NewsletterForm className='space-y-2'>
              <input
                name='email'
                type='email'
                placeholder='Enter your email'
                className='w-full px-4 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-xl 
                         text-white placeholder-zinc-500 focus:outline-none focus:ring-2 
                         focus:ring-rose-500 focus:border-transparent'
                required
              />
              <button
                type='submit'
                className='w-full px-4 py-2 bg-rose-500 hover:bg-rose-600 rounded-xl text-white 
                         font-medium transition-colors duration-200'
              >
                Subscribe
              </button>
            </NewsletterForm>
          </div>
        </div>

        <div className='mt-12 pt-8 border-t border-zinc-800/50 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0'>
          <p className='text-zinc-400 text-sm'>
            © 2024 GigaBrain. All rights reserved. Powered by 🧠
          </p>
          <div className='flex space-x-6'>
            <Link
              href={getPrivacyPolicyRoute()}
              className='text-zinc-400 hover:text-rose-400 text-sm'
            >
              Privacy Policy
            </Link>
            <Link
              href={getTermsOfUseRoute()}
              className='text-zinc-400 hover:text-rose-400 text-sm'
            >
              Terms of Use
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
