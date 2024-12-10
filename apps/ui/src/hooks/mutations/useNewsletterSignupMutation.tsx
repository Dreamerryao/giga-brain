import { supabase } from '@repo/lib/src/supabase';
import { useMutation } from '@tanstack/react-query';

export function useNewsletterSignupMutation() {
  return useMutation({
    mutationFn: async (email: string) => {
      const { error } = await supabase.auth.signUp({
        email,
        password: generateSecurePassword(),
      });

      if (error) {
        throw error;
      }
    },
  });
}

function generateSecurePassword(length = 16) {
  const charset =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
  return Array.from(crypto.getRandomValues(new Uint32Array(length)))
    .map((x) => charset[x % charset.length])
    .join('');
}
