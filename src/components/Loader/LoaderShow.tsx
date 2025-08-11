import "./Loader.css";
import LoaderGif from "../../assest/images/Loader.gif";
export default function LoaderShow() {
  return (
    <div className="flex flex-col justify-center w-full flex-1 items-center mt-7">
      <img src={LoaderGif} className="w-[40px] h-[40px]" />
      <p>Loading...</p>
    </div>
  );
}
