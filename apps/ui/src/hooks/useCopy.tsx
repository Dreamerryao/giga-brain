import { useCallback, useMemo } from 'react';
import { CheckIcon } from 'lucide-react';

import { useProgress } from './useProgress';

export function useCopy() {
  const { done, isDone } = useProgress();

  const copy = useCallback(
    async (text: string) => {
      await done(() => navigator.clipboard.writeText(text));
    },
    [done]
  );

  const el = useMemo(
    () =>
      isDone ? (
        <div className='flex gap-2 items-center'>
          Copied <CheckIcon size={16} />
        </div>
      ) : null,
    [isDone]
  );

  return {
    el,
    copy,
  };
}
