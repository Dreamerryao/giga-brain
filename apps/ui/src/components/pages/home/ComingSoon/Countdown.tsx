import { cn } from '@/lib/utils';
import { useUI } from '@/providers/ui';

export function CountdownTimer() {
  const {
    release: { timeLeft },
  } = useUI();

  if (!timeLeft) return null;

  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((timeLeft / 1000 / 60) % 60);
  const seconds = Math.floor((timeLeft / 1000) % 60);

  return (
    <div
      className={cn(
        'flex items-center justify-center gap-2 lg:gap-6',
        'animate-in slide-in-from-bottom duration-700'
      )}
    >
      <CountdownUnit value={days} label='Days' />
      <CountdownUnit value={hours} label='Hours' />
      <CountdownUnit value={minutes} label='Minutes' />
      <CountdownUnit value={seconds} label='Seconds' />
    </div>
  );
}

interface CountdownUnitProps {
  value: number;
  label: string;
}

function CountdownUnit({ value, label }: CountdownUnitProps) {
  return (
    <div className='flex flex-col items-center'>
      <div className='relative'>
        <div className='absolute inset-0 bg-rose-500/20 rounded-xl blur-xl' />
        <div className='relative bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-4 w-[72px] lg:w-24 text-center'>
          <span className='text-xl lg:text-4xl font-bold text-white'>
            {value.toString().padStart(2, '0')}
          </span>
        </div>
      </div>
      <span className='mt-2 text-sm text-zinc-400'>{label}</span>
    </div>
  );
}
