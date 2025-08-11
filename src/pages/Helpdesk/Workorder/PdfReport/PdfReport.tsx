import React,{useState} from "react";
import { PDFDownloadLink,PDFViewer } from "@react-pdf/renderer"; // Make sure you have this installed
import WorkOrderReport from "./WorkOrderReport"; // Assuming this is the path to your WorkOrderReport component
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
type Props = {
  fileName: string;
};

const PdfReport = () => {
  const navigate=useNavigate();
  const [showPDF, setShowPDF] = useState(true);
 
  const onClose = () => {
 
   // navigate(PATH?.WORKORDERMASTER + "?edit=");
  }
  return (
    <div>
        
        <div style={{ position: "relative", width: "100%", height: "100vh", margin: "auto", maxHeight: "calc(100vh - 170px)" }}>
      {/* Close Button (Overlay) */}
      {/* <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          background: "red",
          color: "white",
          border: "none",
          padding: "8px 12px",
          fontSize: "16px",
          cursor: "pointer",
          borderRadius: "4px",
          zIndex: 10,
        }}
      >
        ✖ 
      </button> */}

     <PDFViewer style={{ width: '100%', height: '100%', }}
    
     >
        <WorkOrderReport
        // onClose={onClose}
        />
      </PDFViewer>
            </div>
      
    </div>
  );
};

export default PdfReport;
