import { useEffect, useState } from 'react';

import { Tables } from '@/lib/db-types';

import { useGameQuery } from './queries/useGameQuery';

export interface IPuzzleETA {
  last_resolved_at: Tables<'puzzle'>['last_resolved_at'];
  final_timer_start_at: Tables<'puzzle'>['final_timer_start_at'];
  solved_at: Tables<'puzzle'>['solved_at'];
  status: Tables<'puzzle'>['status'];
  attempt_timeout_seconds: Tables<'puzzle'>['attempt_timeout_seconds'];
  attempt_final_timeout_seconds: Tables<'puzzle'>['attempt_final_timeout_seconds'];
}

type PuzzleStatus = 'Completed' | 'TimedOut' | 'Created' | 'Active';
export function usePuzzleETA(agent: IPuzzleETA) {
  const { data: game } = useGameQuery();

  const [eta, setEta] = useState(0);
  const [status, setStatus] = useState<PuzzleStatus>('Created');
  const [isInFinalTimer, setIsInFinalTimer] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const { eta, status, isInFinalTimer } = getPuzzleETA(agent);
      setStatus(status);
      setIsInFinalTimer(isInFinalTimer);

      if (eta <= 0) {
        setEta(0);
        clearInterval(interval);
      } else {
        setEta(eta);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [agent, game]);

  return { eta, status, isInFinalTimer };
}

export function getPuzzleETA(agent: IPuzzleETA) {
  let eta = 0;
  let isInFinalTimer = false;
  if (agent.final_timer_start_at) {
    isInFinalTimer = true;
    const targetTime =
      agent.final_timer_start_at + agent.attempt_final_timeout_seconds;
    const now = Math.floor(Date.now() / 1000);
    eta = targetTime - now;
  } else if (agent.last_resolved_at) {
    const targetTime = agent.last_resolved_at + agent.attempt_timeout_seconds;
    const now = Math.floor(Date.now() / 1000);
    eta = targetTime - now;
  }
  return {
    eta,
    status: getPuzzleStatus(agent, eta),
    isInFinalTimer,
  };
}

function getPuzzleStatus(agent: IPuzzleETA, eta: number): PuzzleStatus {
  // console.log('agent', agent);
  if (agent.solved_at) return 'Completed';
  if (!agent.last_resolved_at) return 'Created';
  if (eta > -10) return 'Active'; // Fake agent is transitioning to final timer
  return 'TimedOut';
}
