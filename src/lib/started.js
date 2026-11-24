import { createContext, useContext } from 'react';

// True once the intro loader has finished (page heroes wait for it).
export const StartedContext = createContext(false);
export const useStarted = () => useContext(StartedContext);
