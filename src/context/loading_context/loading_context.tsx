import { createContext, PropsWithChildren, useState } from "react";
import { LoadingContextState } from "./loading_context_types.ts";

export const LoadingContext = createContext<LoadingContextState>({
  isLoading: false,
  setIsLoading: (_) => {},
});

export const LoadingProvider = ({ children }: PropsWithChildren) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
      {children}
    </LoadingContext.Provider>
  );
};
