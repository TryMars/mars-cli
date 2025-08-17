import { createContext, PropsWithChildren, useState } from "react";
import { LoadingContextType } from "./loading_context_types.ts";

export const LoadingContext = createContext<LoadingContextType>({
  isLoading: false,
  setIsLoading: (_: boolean) => {},
});

export const LoadingProvider = ({ children }: PropsWithChildren) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
      {children}
    </LoadingContext.Provider>
  );
};
