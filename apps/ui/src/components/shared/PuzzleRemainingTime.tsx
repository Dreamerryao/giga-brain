import { useMemo } from 'react';

import { formatTimeRemaining } from '@/lib/time';
import { IPuzzleETA, usePuzzleETA } from '@/hooks/usePuzzleETA';

export function PuzzleRemainingTime({ agent }: { agent: IPuzzleETA }) {
  const { eta, status } = usePuzzleETA(agent);

  const formattedTime = useMemo(() => {
    return formatTimeRemaining(eta);
  }, [eta]);

  const statusEl = useMemo(() => {
    switch (status) {
      case 'Completed':
        return 'Completed';
      case 'TimedOut':
        return 'Timed Out';
      case 'Created':
        return 'Created';
      default:
        return formattedTime;
    }
  }, [status, formattedTime]);

  return <div className='text-nowrap'>{statusEl}</div>;
}
