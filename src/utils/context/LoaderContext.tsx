
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import LoaderManager from './LoaderManager';
import LoaderGif from "../../assest/images/Loader.gif";
import "../../components/Loader/Loader.css"
import ErrorPage from '../../pages/ErrorComponenet/ErrorPage';
interface LoaderContextProps {
    loading: any;
}

const LoaderContext = createContext<LoaderContextProps | undefined>(undefined);

export const LoaderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [loading, setLoading] = useState<any|null>(false);
     const [loader, setLoader]=useState<any|null>(false)
      const[statusCode ,setStatusCode]=useState()
       
    //    const navigate=useNavigate()
    useEffect(() => {
        const handleLoaderChange = (isLoading: any) => setLoading(isLoading);
        LoaderManager.addListener(handleLoaderChange);
            
        return () => {
            // Cleanup listeners if needed
        };
        // const handllechange
    }, []);

    useEffect(()=>{
        if(loading === "404"){
            // navigate("/error")
            setLoader(true)
            setStatusCode(loading)
          

         }
         else if(loading === "403"){
            setStatusCode(loading)
            
         }
       else if(loading === "501"){
            setStatusCode(loading)
           
         }
         else if(loading === "502"){
           
         }else if(loading === "500"){
           setStatusCode(loading)
          
        }else {
           let loader:any="404"
            setStatusCode(loader)
            
         }
    
    },[loading])
  
    return (
        <LoaderContext.Provider value={{ loading }}>
            {children}
             {loading === true &&<div className="background">
      <img src={LoaderGif} alt="Keppel" className="content" />
    </div>}
    {loader === true &&  
     <div className="backgrounderror mt-8 w-full">
         <ErrorPage code={statusCode}/>
        
       
     </div>
    }
    
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
