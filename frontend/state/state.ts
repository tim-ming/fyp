// Custom Hooks for state
import { useState, useEffect } from "react";
import { useAuth } from "./auth";
import { useData } from "./data";

/**
 *  Use hydration for components that need to wait for the hydration to complete because of the server-side rendering in global state
 * @returns boolean
 */
export const useHydration = () => {
  const stores = [useAuth, useData];
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const unsubHydrate = stores.map((store) =>
      store.persist.onHydrate(() => setHydrated(false))
    );

    const unsubFinishHydration = stores.map((store) =>
      store.persist.onFinishHydration(() => setHydrated(true))
    );

    setHydrated(stores.every((store) => store.persist.hasHydrated()));

    return () => {
      unsubHydrate.forEach((unsub) => unsub());
      unsubFinishHydration.forEach((unsub) => unsub());
    };
  }, []);

  return hydrated;
};

// export const useHydration = () => {
//   const [hydrated, setHydrated] = useState(false);

//   useEffect(() => {
//     // Note: This is just in case you want to take into account manual rehydration.
//     // You can remove the following line if you don't need it.
//     const unsubHydrate = useAuth.persist.onHydrate(() => setHydrated(false));

//     const unsubFinishHydration = useAuth.persist.onFinishHydration(() =>
//       setHydrated(true)
//     );

//     setHydrated(useAuth.persist.hasHydrated());

//     return () => {
//       unsubHydrate();
//       unsubFinishHydration();
//     };
//   }, []);

//   return hydrated;
// };
