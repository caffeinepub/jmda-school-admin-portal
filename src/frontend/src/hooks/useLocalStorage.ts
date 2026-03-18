import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_EVENT = "jmda_storage_update";

function broadcastUpdate(key: string) {
  try {
    window.dispatchEvent(new CustomEvent(STORAGE_EVENT, { detail: { key } }));
  } catch {}
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((prev: T) => T)) => void] {
  const keyRef = useRef(key);
  useEffect(() => {
    keyRef.current = key;
  });

  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  // Sync when key changes (navigating back to a page with a remounted component)
  const prevKeyRef = useRef(key);
  useEffect(() => {
    if (prevKeyRef.current !== key) {
      prevKeyRef.current = key;
      try {
        const item = window.localStorage.getItem(key);
        setStoredValue(item ? (JSON.parse(item) as T) : initialValue);
      } catch {}
    }
  });

  // Sync when another instance of the hook writes to the same key (same tab)
  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const ce = e as CustomEvent<{ key: string }>;
      if (ce.detail?.key === keyRef.current) {
        try {
          const item = window.localStorage.getItem(keyRef.current);
          if (item) setStoredValue(JSON.parse(item) as T);
        } catch {}
      }
    };
    window.addEventListener(STORAGE_EVENT, handleUpdate);
    return () => window.removeEventListener(STORAGE_EVENT, handleUpdate);
  }, []);

  // Sync on tab focus (multi-tab support)
  useEffect(() => {
    const handleFocus = () => {
      try {
        const item = window.localStorage.getItem(keyRef.current);
        if (item) setStoredValue(JSON.parse(item) as T);
      } catch {}
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const next =
          typeof value === "function" ? (value as (p: T) => T)(prev) : value;
        try {
          window.localStorage.setItem(key, JSON.stringify(next));
          broadcastUpdate(key);
        } catch {}
        return next;
      });
    },
    [key],
  );

  return [storedValue, setValue];
}
