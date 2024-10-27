import { useHydration } from "@/state/state";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect } from "react";

/**
 *  Use hydrated effect for components that need to wait for the hydration to complete because of the server-side rendering in global state
 * @param callback  Callback function
 * @param dependencies  Dependencies
 */
export const useHydratedEffect = (callback: () => void, dependencies: any) => {
  const isHydrated = useHydration();

  useEffect(() => {
    if (isHydrated) {
      callback();
    }
  }, [isHydrated, ...dependencies]);
};

/**
 *  Use hydrated focus effect for components that need to wait for the hydration to complete because of the server-side rendering in global state
 * @param callback  Callback function
 * @param dependencies  Dependencies
 */
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
