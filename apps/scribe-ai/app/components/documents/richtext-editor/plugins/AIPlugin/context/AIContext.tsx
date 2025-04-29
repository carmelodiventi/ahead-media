import {createContext, ReactElement, ReactNode, useContext, useMemo, useState} from "react";


interface AIContextType {
    aiState: typeof INITIAL_STATE;
    updateAIState: (state: typeof INITIAL_STATE) => void;
}

const INITIAL_STATE = {
    query: "",
    useSearchResults: false,
    showAIAssistant: false,
    isLoading: false,
    message: ''
}

const Context = createContext<AIContextType>({} as AIContextType);

export const AIContext = ({ children }: { children: ReactNode }): ReactElement => {
  const [aiState, updateAIState] = useState(INITIAL_STATE);

  const contextValue = useMemo(() => {
    return {
      aiState,
      updateAIState,
    };
  }, [aiState, updateAIState]);

  return <Context.Provider value={contextValue}>{children}</Context.Provider>;
};

export const useAIState = () => {
    const context = useContext(Context);

    if (context === undefined) {
        throw new Error("useAIContext must be used within a AIContextProvider");
    }

    return context;
}
