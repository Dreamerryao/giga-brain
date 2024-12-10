import { sleep } from '@repo/lib/src/promise';
import { useCallback, useState } from 'react';

export function useProgress() {
  const [isDone, setIsDone] = useState(false);

  const done = useCallback(
    async (fn: () => Promise<void>) => {
      await fn();
      setIsDone(true);
      await sleep(2_000);
      setIsDone(false);
    },
    [setIsDone]
  );

  return {
    done,
    isDone,
  };
}
