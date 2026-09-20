import { createContext, useContext } from 'react';

// Holds the currently active provider object + a setter. Consumed by pages
// (Home/Browse/Search/Video) so the whole app follows the Settings choice.
export const ProviderContext = createContext({
  provider: null,
  providers: [],
  setProvider: () => {}
});

export function useProvider() {
  return useContext(ProviderContext);
}
