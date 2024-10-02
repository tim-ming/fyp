import { useHydration } from "@/state/state";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect } from "react";

export const useHydratedEffect = (callback: () => void, dependencies: any) => {
  const isHydrated = useHydration();

  useEffect(() => {
    if (isHydrated) {
      callback();
    }
  }, [isHydrated, ...dependencies]);
};

export const useHydratedFocusEffect = (
  callback: () => void,
  dependencies: any
) => {
  const isHydrated = useHydration();

  useFocusEffect(
    useCallback(() => {
      if (isHydrated) {
        callback();
      }
    }, [isHydrated, ...dependencies])
  );
};
