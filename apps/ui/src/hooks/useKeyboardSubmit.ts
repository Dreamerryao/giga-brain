import { KeyboardEvent } from 'react';

interface UseKeyboardSubmitProps {
  onSubmit: () => void;
}

export function useKeyboardSubmit({ onSubmit }: UseKeyboardSubmitProps) {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Submit on Enter (but not with Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
    // Allow new line with Shift + Enter
    // No need to handle this case as it's the default textarea behavior
  };

  return { handleKeyDown };
}
