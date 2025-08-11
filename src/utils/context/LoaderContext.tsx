// LoaderContext.tsx
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import LoaderManager from './LoaderManager'; // Adjust the path as needed
import LoaderGif from "../../assest/images/Loader.gif";
import "../../components/Loader/Loader.css"
interface LoaderContextProps {
    loading: boolean;
}

const LoaderContext = createContext<LoaderContextProps | undefined>(undefined);

export const LoaderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        const handleLoaderChange = (isLoading: boolean) => setLoading(isLoading);
        LoaderManager.addListener(handleLoaderChange);

        return () => {
            // Cleanup listeners if needed
        };
    }, []);

    return (
        <LoaderContext.Provider value={{ loading }}>
            {children}
            {loading &&<div className="background">
      <img src={LoaderGif} alt="Keppel" className="content" />
    </div>}
        </LoaderContext.Provider>
    );
};

export const useLoader = (): LoaderContextProps => {
    const context = useContext(LoaderContext);
    if (!context) {
        throw new Error('useLoader must be used within a LoaderProvider');
    }
    return context;
};
