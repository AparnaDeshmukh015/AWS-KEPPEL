import React from "react";
import {PDFViewer } from "@react-pdf/renderer"; 
import WorkOrderReport from "./WorkOrderReport"; 
import { useNavigate } from "react-router-dom";
import { PATH } from "../../../utils/pagePath";


const PdfReport = () => {
  const navigate=useNavigate();
 
  const onClose = () => {
 
    navigate(PATH?.WORKORDERMASTER + "?edit=");
  }
  return (
    <div>
        
        <div style={{ position: "relative", width: "80%", height: "90vh", margin: "auto" }}>
      {/* Close Button (Overlay) */}
      <button
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
      </button>

     <PDFViewer style={{ width: '100%', height: '100%', paddingBottom: '200px', marginBottom: '200px' }}
     >
        <WorkOrderReport
        onClose={onClose}
        />
      </PDFViewer>
            </div>
      
    </div>
  );
};

export default PdfReport;
