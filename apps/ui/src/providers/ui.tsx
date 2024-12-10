'use client';

import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import confetti from 'canvas-confetti';

// import { useMediaQuery } from '@uidotdev/usehooks';

import { IS_LOCAL_WALLET_CACHE } from '@/lib/cache';
import { useCachedState } from '@/hooks/useCachedState';
import { IS_PROD } from '@/config';

const UIContext = createContext<{
  isLocalWallet: ReturnType<typeof useIsLocalWallet>;
  mediaQueries: ReturnType<typeof useMediaQueries>;
  connectModal: ReturnType<typeof useConnectModal>;
  faucetModal: ReturnType<typeof useFaucetModal>;
  release: ReturnType<typeof useRelease>;
} | null>(null);

export function UIProvider({ children }: { children: ReactNode }) {
  const isLocalWallet = useIsLocalWallet();
  const mediaQueries = useMediaQueries();
  const connectModal = useConnectModal();
  const faucetModal = useFaucetModal();
  const release = useRelease();
  return (
    <UIContext.Provider
      value={{
        isLocalWallet,
        mediaQueries,
        connectModal,
        faucetModal,
        release,
      }}
    >
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('Missing UI context');
  }
  return context;
}

function useMediaQueries() {
  // todo: lookup the actual breakpoints from tailwind config
  // for now use the default breakpoints
  const isXS = useMediaQuery('(min-width: 320px)');
  const isSM = useMediaQuery('(min-width: 640px)');
  const isMD = useMediaQuery('(min-width: 768px)');
  const isLG = useMediaQuery('(min-width: 1024px)');
  const isXL = useMediaQuery('(min-width: 1280px)');
  const is2XL = useMediaQuery('(min-width: 1536px)');
  return {
    isXS,
    isSM,
    isMD,
    isLG,
    isXL,
    is2XL,
  };
}

function useIsLocalWallet() {
  const state = useCachedState(IS_LOCAL_WALLET_CACHE, true);
  return {
    isLocal: false, // IS_PROD ? false : isLocal,
    setIsLocal: state[1],
  };
}

function useConnectModal() {
  const [isOpened, setIsOpened] = useState<boolean>(false);

  return {
    isOpened,
    setIsOpened,
  };
}

function useFaucetModal() {
  const [isOpened, setIsOpened] = useState<boolean>(false);

  return {
    isOpened,
    setIsOpened,
  };
}

function useMediaQuery(query: string) {
  const [value, setValue] = useState(false);

  useEffect(() => {
    function onChange(event: MediaQueryListEvent) {
      setValue(event.matches);
    }

    const result = matchMedia(query);
    result.addEventListener('change', onChange);
    setValue(result.matches);

    return () => result.removeEventListener('change', onChange);
  }, [query]);

  return value;
}

const LAUNCH_DATE = new Date('2025-01-07T10:00:00Z');
// const LAUNCH_DATE = new Date('2025-01-05T13:44:00Z'); // for testing
const CONFETTI_DURATION_SEC = 60;

let triggeredConfetti = false;

function useRelease() {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;

    const stopTimer = () => {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    };

    const calculateTimeLeft = () => {
      const difference = +LAUNCH_DATE - +new Date();
      if (difference > 0) {
        setTimeLeft(difference);
      } else {
        setTimeLeft(0);
        stopTimer();
      }

      if (
        !triggeredConfetti &&
        0 <= difference &&
        difference <= CONFETTI_DURATION_SEC * 1000
      ) {
        triggeredConfetti = true;
        triggerConfetti(CONFETTI_DURATION_SEC);
      }
    };

    calculateTimeLeft();
    timer = setInterval(calculateTimeLeft, 1000);

    return () => stopTimer();
  }, []);

  const isReleased =
    process.env.NEXT_PUBLIC_IS_RELEASED === 'true'
      ? true
      : !IS_PROD
        ? true
        : timeLeft <= 0;
  return {
    isReleased,
    timeLeft,
  };
}

function triggerConfetti(durationSec: number) {
  const duration = durationSec * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  const interval = setInterval(function () {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);

    // Since particles fall down, start a bit higher than random
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
    });
  }, 250);

  return () => clearInterval(interval);
}
