
import "./Loader.css";

export default function LoaderFileUpload({ IsScannig }: any) {
  return (
  
    <div className="flex flex-col justify-center w-full flex-1 items-center mt-7">
      <div className="w-6 h-6  animate-spin  size-6 border-[3px] border-current border-t-transparent text-[#8E724A] rounded-full " role="status" aria-label="loading">
        <span className="sr-only">Loading...</span>
      </div>
      {IsScannig === true ? <p> Scanning files</p> : <p> Loading...</p>}
    </div>
  );
}