import {
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from 'react';

export function useCachedState<T>(
  cache: (v?: T | null | undefined) => T | null | undefined,
  defaultValue: T | null
): [T | null, Dispatch<SetStateAction<T | null>>] {
  const [value, setValue] = useState<T | null>(() => cache() ?? defaultValue);

  type FnArg = (oldVal: T | null) => T | null;
  type ValArg = T | null;

  const _setValue = useCallback(
    (arg: FnArg | ValArg) => {
      if (typeof arg === 'function') {
        setValue((oldVal) => {
          const newVal = (arg as FnArg)(oldVal);
          cache(newVal);
          return newVal;
        });
      } else {
        setValue(arg as ValArg);
        cache(arg as ValArg);
      }
    },
    [cache]
  );

  return useMemo(() => [value, _setValue], [value, _setValue]);
}
