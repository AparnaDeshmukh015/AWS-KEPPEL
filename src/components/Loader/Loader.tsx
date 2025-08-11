
import "./Loader.css";
import LoaderGif from "../../assest/images/Loader.gif";

export default function LoaderS() {
  return (
    <div className="background">
      <img src={LoaderGif} alt="Keppel" className="content" />
    </div>
  );
}
