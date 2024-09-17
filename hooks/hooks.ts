import { useHydration } from "@/state/state";
import { useEffect } from "react";

export const useHydratedEffect = (callback: () => void, dependencies: any) => {
  const isHydrated = useHydration();

  useEffect(() => {
    if (isHydrated) {
      callback();
    }
  }, [isHydrated, ...dependencies]);
};
