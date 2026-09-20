import { useEffect, useState } from "react";

/**
 * Keep the last non-null modal record available while the modal plays its
 * controlled close animation. The current value still wins immediately when
 * a different record is opened.
 */
export const useRetainedModalData = <T,>(value: T | null | undefined): T | null => {
  const [retainedValue, setRetainedValue] = useState<T | null>(() => value ?? null);

  useEffect(() => {
    if (value != null) {
      setRetainedValue(value);
    }
  }, [value]);

  return value ?? retainedValue;
};
