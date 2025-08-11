import React,{useState} from "react";
import { Dialog } from "primereact/dialog";
import pdfIcon from "../../../assest/images/pdfIcon.jpg";
import excelIcon from "../../../assest/images/excelIcon.png";
import wordDocIcon from "../../../assest/images/wordDocIcon.png";
const ImageGalleryComponent = ({uploadType, docOption, Title}:any) => {
    const [visibleImage, setVisibleImage] = useState<boolean>(false);
    const [showImage, setShowImage] = useState<any>([]);
    const [docName, setdocName] = useState<any | null>();
    const [DocTitle, setDocTitle] = useState<any | null>("")
    const setHandelImage = (item: any, docname?: any, docTitle?: any) => {
        setVisibleImage(true);
        setShowImage(item);
        setdocName(docname)
        setDocTitle(docTitle)
      };
   
    const calFileSize = (base64: string) => `${((4 * Math.ceil((base64.length / 3)) * 0.5624896334383812) / 1000).toFixed(1).toString()} kb`;
   function getShortenedFileName(fileName: any) {
        let baseName = fileName.split('.')[0]; 
        let extension = fileName.includes('.') ? '.' + fileName.split('.').pop() : null; 
        let firstSixChars = baseName.slice(0, 6);
        let newFileName = `${firstSixChars}${extension !== undefined || extension !== null ? '...' + extension : ""}`;
       return newFileName;
      }
    return ( 
    <>
     <div className="flex flex-wrap gap-4">
                                           
                                            {docOption?.map((doc: any, index: any) => {
    
                                              if (doc.UPLOAD_TYPE === uploadType) {
    
                                                const getExtension = (str: any) => str.slice(str.lastIndexOf("."));
                                                const fileExtension = getExtension(doc?.DOC_NAME);
                                                let shortenedFileName = getShortenedFileName(doc?.DOC_NAME);
                                                let FileSize = calFileSize(doc?.DOC_DATA)
    
    
    
                                                var docData: string;
                                                if (fileExtension === ".pdf") {
                                                  docData = "data:application/pdf;base64," + doc?.DOC_DATA;
                                                  return (
                                                    <div key={index} >
                                                      <a
                                                        href={docData}
                                                        download={doc?.DOC_NAME}
                                                        className="flex flex-col  "
                                                        title={doc?.DOC_NAME}
                                                      >  <img src={pdfIcon} alt="" className="w-[120px] h-[120px] rounded-xl cursor-pointer" />
    
    
    
                                                      </a>
                                                      <div className="flex flex-col ">
                                                        <div className="Service_Image_Title">{shortenedFileName}</div >
                                                        <div className="Text_Secondary Helper_Text">{FileSize}</div >
                                                      </div>
    
                                                    </div>
                                                  );
                                                }
                                                else if (fileExtension === ".doc" || fileExtension === ".docx") {
                                                  docData = 'data:application/msword;base64,' + doc?.DOC_DATA;
                                                  // Word icon
                                                  return (
                                                    <div key={index}>
                                                      <a
                                                        href={docData}
                                                        download={doc?.DOC_NAME}
                                                        className="text-blue-500"
                                                        title={doc?.DOC_NAME}
                                                      >
                                                        <img src={wordDocIcon} alt="" className="w-[120px] h-[120px] rounded-xl cursor-pointer" />
    
                                                      </a>
                                                      <div className="flex flex-col ">
                                                        <div className="Service_Image_Title">{shortenedFileName}</div >
                                                        <div className="Text_Secondary Helper_Text">{FileSize}</div >
                                                      </div>
                                                    </div>
                                                  );
                                                } else if (fileExtension === ".xls" || fileExtension === ".xlsx") {
                                                  docData = "data:application/excel;base64," + doc?.DOC_DATA;
                                                  // Word icon
                                                  return (
                                                    <div key={index}>
                                                      <a
                                                        href={docData}
                                                        download={doc?.DOC_NAME}
                                                        className="text-blue-500"
                                                        title={doc?.DOC_NAME}
                                                      >
                                                        <img src={excelIcon} alt="" className="w-[120px] h-[120px] rounded-xl cursor-pointer" />
    
                                                      </a>
                                                      <div className="flex flex-col ">
                                                        <div className="Service_Image_Title">{shortenedFileName}</div >
                                                        <div className="Text_Secondary Helper_Text">{FileSize}</div >
                                                      </div>
                                                    </div>
                                                  );
                                                }
    
                                                // else {
                                                //   // Otherwise, treat it as an image (e.g., PNG) and show a thumbnail
                                                //   docData = "data:image/png;base64," + doc?.DOC_DATA;
    
                                                //   return (
                                                //     <div
                                                //       key={index}
                                                //       onClick={() => {
                                                //         setHandelImage(docData); // Assuming this function sets the image for preview
                                                //       }}
                                                //     >
                                                //       <img
                                                //         src={docData}
                                                //         alt=""
                                                //         className="w-[120px] h-[120px] rounded-xl cursor-pointer"
                                                //       />
                                                //       <div className="flex flex-col ">
                                                //         <div className="Text_Secondary Helper_Text">{shortenedFileName}</div >
                                                //         <div className="Text_Secondary Helper_Text">{FileSize}</div >
                                                //       </div>
                                                //     </div>
                                                //   );
                                                // }
                                                else {
                                                  // Otherwise, treat it as an image (e.g., PNG) and show a thumbnail
                                                  docData = "data:image/png;base64," + doc?.DOC_DATA;
                                                  return (
                                                    <div
                                                      key={index}
                                                      onClick={() => {
                                                        setHandelImage(docData, doc?.DOC_NAME, Title);
    
                                                        // Assuming this function sets the image for preview
                                                      }}
                                                      className="w-auto bg-cover"
                                                    >
                                                      <img
                                                        src={docData}
                                                        alt=""
                                                        className="w-[120px] h-[120px] rounded-xl cursor-pointer"
    
                                                      />
    
                                                      <div className="flex flex-col ">
                                                        <div className="Service_Image_Title">{shortenedFileName}</div >
                                                        <div className="Text_Secondary Helper_Text">{FileSize}</div >
                                                      </div>
                                                    </div>
                                                  );
                                                }
                                              }
                                            })}
                                          </div>
    
                                        
                                        <Dialog
                                          visible={visibleImage}
                                          style={{ width: "50vw", height: "auto" }}
                                          onHide={() => {
                                            setVisibleImage(false);
                                          }}
                                        >
                                          <a
                                            href={showImage}
                                            download={docName}
                                            className="flex flex-col"
                                            title={`Download ${docName}`}
                                          >
                                            <i className="pi pi-download" style={{ fontSize: '24px', marginBottom: '8px', display: "flex", justifyContent: "end" }}></i>
                                          </a>
                                          <img
                                            src={showImage}
                                            alt=""
                                            className="w-full h-auto"
                                          />
    
                                          <h5>{docName}</h5>
                                          <h6>{DocTitle}</h6>
                                        </Dialog>
    </>  )
}

export default ImageGalleryComponent;