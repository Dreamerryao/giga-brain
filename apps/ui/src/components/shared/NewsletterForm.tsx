'use client';

import React, { PropsWithChildren } from 'react';
import { CheckCircle2 } from 'lucide-react';

import { useNewsletterSignupMutation } from '@/hooks/mutations/useNewsletterSignupMutation';

export function NewsletterForm({
  className,
  children,
}: PropsWithChildren<{
  className?: string;
}>) {
  const mutation = useNewsletterSignupMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);
      const email = formData.get('email') as string;
      if (!email) {
        throw new Error('No email provided');
      }

      await mutation.mutateAsync(email);

      form.reset();
    } catch (error) {
      alert('Failed to subscribe: ' + (error as Error).message);
    }
  };

  return (
    <>
      {mutation.isSuccess ? (
        <div className='flex items-center justify-center space-x-2 text-emerald-400'>
          <CheckCircle2 className='w-5 h-5' />
          <span>
            You&apos;re on the list! Verify your email to get notified when we
            launch.
          </span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className={className}>
          {children}
        </form>
      )}
    </>
  );
}
