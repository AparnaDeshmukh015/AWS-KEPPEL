import React, { useState } from "react";
import { FileUpload } from "primereact/fileupload";
import "./DocumentUpload.css";
import { useTranslation } from "react-i18next";
import noDataIcon from "../../../assest/images/DocumentUpload.png";
import Field from "../../Field";
import { Button } from "primereact/button";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";
import { useFieldArray } from "react-hook-form";
import { decryptData } from "../../../utils/encryption_decryption";
import { scanfileAPI } from "../../../utils/constants";
import LoaderS from "../../Loader/Loader";

const WoDocumentUpload = ({
  register,
  control,
  setValue,
  watch,
  getValues,
  errors,
  woMasterForm,
  uploadtype,
  uploadLabel,
  setIsSubmit,
  ...props }: any) => {
  const { append, } = useFieldArray({
    control,
    name: "DOC_LIST",
  });
  const DOC_LIST = watch("DOC_LIST")
  const [loading, setLoading] = useState<any | null>(false)
  const { t } = useTranslation();
  const doclistWatch = watch("DOC_LIST")
  const DOC_LIST_VALUE = getValues("DOC_LIST");
  const CurrDocData = doclistWatch?.filter(
    (doc: any) => doc.UPLOAD_TYPE == uploadtype
  );
  const getBase64 = (file: any) => {
    return new Promise((resolve) => {
      let baseURL: any = "";
      let reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        baseURL = reader.result;
        resolve(baseURL);
      };
    });
  };



  const handleFileInputChange = async (e: any) => {
    // const selectedFiles: any[] = Array.from(e?.target?.files);
    // const validExtensions = ["jpg", "png", "jpeg", "JPG", "JPEG"];
    // if (selectedFiles.length > 5) {
    //   toast.error('Only 5 images are allowed')
    //   return
    // }
    // // setLoading(true)
    // try {
    //   const newFiles: any = [];
    //   for (const file of selectedFiles) {
    //     const ext = file.name.split(".").pop();
    //     if (validExtensions.includes(ext)) {

    //       const base64: any = await getBase64(file);
    //       const fileScanStatus: any = await scanfileAPI(base64);
    //       file.base64 = base64;

    //       const check = file.name.split(".");
    //       const sameFileName = DOC_LIST_VALUE?.filter(
    //         (doc: any) => doc?.DOC_NAME === file?.name && doc.UPLOAD_TYPE === uploadtype
    //       );
    //        if (fileScanStatus === true) {
    //         if (sameFileName.length === 0) {
    //           if (CurrDocData?.length < 5) {
    //             if (file?.size < 2097152) {
    //               newFiles.push({
    //                 DOC_SRNO: DOC_LIST_VALUE.length + newFiles.length + 1,
    //                 DOC_NAME: file.name,
    //                 DOC_DATA: base64.split("base64,")[1],
    //                 DOC_EXTENTION: check[check.length - 1],
    //                 DOC_SYS_NAME: uuidv4(),
    //                 ISDELETE: false,
    //                 DOC_TYPE: "",
    //                 UPLOADEDBY: decryptData(localStorage.getItem("USER_NAME")),
    //                 UPLOAD_TYPE: uploadtype,
    //                 DOC_SIZE: (file.size / 1024).toFixed(2),
    //                 // FILE: file
    //               });
    //             }
    //             else {
    //               toast.error(t("The max file size is 2 Mb"));
    //               e.target.value = null;
    //               setLoading(false)
    //             }

    //           } else {
    //             toast.error(t("Only 5 images are allowed"));
    //             setLoading(false)
    //             return;
    //           }
    //         } else {
    //           toast.error(t("This file already exists"));
    //           e.target.value = null;
    //           setLoading(false)
    //           return;
    //         }
    //        }
    //     } else {
    //       toast.error(t("You can upload only JPG & PNG files."));
    //       e.target.value = null;
    //       setLoading(false)
    //       return;
    //     }
    //   }
    //   append(newFiles)
    //   e.target.value = null;
    //   // setLoading(false)
    // } catch (error) {
    //   toast.error("Error processing files");
    //   // setLoading(false)
    // }
    setIsSubmit(true)
    const selectedFiles: any[] = Array.from(e?.target?.files);
    const validExtensions = ["jpg", "png", "jpeg", "JPG", "JPEG"];
    if (selectedFiles.length > 5) {
      toast.error('Only 5 images are allowed');
      return;
    }

    try {
      const newFiles: any = [];
      const fileScanPromises: any = selectedFiles.map(async (file) => {
        const ext = file.name.split(".").pop();
        if (validExtensions.includes(ext)) {
          const base64: any = await getBase64(file);
          const fileScanStatus: any = await scanfileAPI(base64);
          file.base64 = base64;
          return { file, fileScanStatus, base64 };
        } else {
          //  throw new Error("You can upload only JPG & PNG files.");
          // toast.error(t("You can upload only JPG & PNG files."));
        }
      });

      const results = await Promise.allSettled(fileScanPromises);

      for (const result of results) {
        if (result.status === "fulfilled") {
          const { file, fileScanStatus, base64 } = result.value;
          const check = file.name.split(".");
          const sameFileName = DOC_LIST_VALUE?.filter(
            (doc: any) => doc?.DOC_NAME === file?.name && doc.UPLOAD_TYPE === uploadtype
          );

          if (fileScanStatus === true) {
            if (sameFileName.length === 0) {
              if (CurrDocData?.length < 5) {
                if (file?.size < 2097152) {
                  newFiles.push({
                    DOC_SRNO: DOC_LIST_VALUE.length + newFiles.length + 1,
                    DOC_NAME: file.name,
                    DOC_DATA: base64.split("base64,")[1],
                    DOC_EXTENTION: check[check.length - 1],
                    DOC_SYS_NAME: uuidv4(),
                    ISDELETE: false,
                    DOC_TYPE: "",
                    UPLOADEDBY: decryptData(localStorage.getItem("USER_NAME")),
                    UPLOAD_TYPE: uploadtype,
                    DOC_SIZE: (file.size / 1024).toFixed(2),
                  });
                } else {
                  toast.error(t("The max file size is 2 Mb"));
                  e.target.value = null;
                  return;
                }
              } else {
                toast.error(t("Only 5 images are allowed"));
                return;
              }
            } else {
              toast.error(t("This file already exists"));
              e.target.value = null;
              return;
            }
          }
        } else {
          toast.error(t("You can upload only JPG & PNG files."));
        }
      }

      append(newFiles);
      setIsSubmit(false)
      e.target.value = null;
    } catch (error) {
      setIsSubmit(false)
      toast.error("You can upload only JPG & PNG files.");
    }

  };

  const [fileBase64, setFileBase64] = useState<any | null>(null);
  // const onFileSelect = async (e: any) => {
  //   setIsSubmit(true)
  //   var ext = e?.files[0]?.name?.split(".")?.pop();
  //   const validExtensions = ["jpg", "png", "jpeg", "JPG", "JPEG"];

  //   if (validExtensions.includes(ext)) {
  //     const file = e.files[0];
  //     const reader: any = new FileReader();
  //     reader.onloadend = async () => {
  //       const check = file?.name?.split(".");
  //       const sameFileName: any = DOC_LIST_VALUE?.filter(
  //         (doc: any) => doc?.DOC_NAME === file?.name && doc.UPLOAD_TYPE == uploadtype
  //       );
  //       const base64String: any = reader?.result?.split(',')[1];
  //       // const fileScanStatus: any = await scanfileAPI(base64String);
  //       setFileBase64(base64String);
  //       // if (fileScanStatus === true) {
  //       if (sameFileName?.length === 0) {
  //         if (CurrDocData?.length < 5) {
  //           if (file?.size < 2097152) {
  //             // setLoading(true)

  //             append({
  //               DOC_SRNO: DOC_LIST_VALUE?.length + 1,
  //               DOC_NAME: file?.name,
  //               DOC_DATA: base64String,
  //               DOC_EXTENTION: check[check?.length - 1],
  //               DOC_SYS_NAME: uuidv4(),
  //               ISDELETE: false,
  //               DOC_TYPE: "",
  //               UPLOADEDBY: decryptData((localStorage.getItem("USER_NAME"))),
  //               UPLOAD_TYPE: uploadtype,
  //               DOC_SIZE: (file?.size / 1024).toFixed(2)
  //               // FILE: file
  //             });
  //             setIsSubmit(false)
  //             // setLoading(false)
  //           } else {
  //             toast.error("The max file size is 2 Mb")
  //           }
  //         } else {
  //           toast.error(t("Only 5 images are allowed"));
  //           e = null
  //         }
  //       } else {
  //         toast.error(t("This file already exist"));
  //         e = null
  //       }
  //     };

  //     reader.readAsDataURL(file);
  //   } else {
  //     setIsSubmit(false)
  //     toast.error(t("You can upload only JPG & PNG files."));

  //   }
  // };
  const onFileSelect = async (e: any) => {
    setIsSubmit(true);
    const selectedFiles = e?.files;
    console.log(CurrDocData?.length, 'length')
  // Check if the current document count exceeds the limit (5 files)
  if (selectedFiles?.length + CurrDocData?.length > 5) {
    toast.error(t("Only 5 images are allowed"));
    setIsSubmit(false);
    return true; // Prevent further processing if the document limit is reached
  }
    // Loop through each selected file
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const ext = file?.name?.split(".")?.pop();
      const validExtensions = ["jpg", "png", "jpeg", "JPG", "JPEG"];
  
      if (validExtensions.includes(ext)) {
        const reader: any = new FileReader();
        reader.onloadend = async () => {
          const check = file?.name?.split(".");
          const sameFileName: any = DOC_LIST_VALUE?.filter(
            (doc: any) => doc?.DOC_NAME === file?.name && doc.UPLOAD_TYPE == uploadtype
          );
          const base64String: any = reader?.result?.split(',')[1];
  
          // const fileScanStatus: any = await scanfileAPI(base64String);
          setFileBase64(base64String);
          
          if (sameFileName?.length === 0) {
            if (CurrDocData?.length < 5) {
              if (file?.size < 2097152) {
                append({
                  DOC_SRNO: (CurrDocData?.length+1) +i,
                  DOC_NAME: file?.name,
                  DOC_DATA: base64String,
                  DOC_EXTENTION: check[check?.length - 1],
                  DOC_SYS_NAME: uuidv4(),
                  ISDELETE: false,
                  DOC_TYPE: "",
                  UPLOADEDBY: decryptData((localStorage.getItem("USER_NAME"))),
                  UPLOAD_TYPE: uploadtype,
                  DOC_SIZE: (file?.size / 1024).toFixed(2)
                });
              } else {
                toast.error("The max file size is 2 Mb");
              }
            } else {
              toast.error(t("Only 5 images are allowed"));
              // break;  // Stop the loop if the limit is reached
            }
          } else {
            toast.error(t("This file already exists"));
          }
        };
  
        reader.readAsDataURL(file);
      } else {
        toast.error(t("You can upload only JPG & PNG files."));
        break;  // Stop processing if invalid file is encountered
      }
    }
  
    setIsSubmit(false);
  };

  const handlerChange = (e: any, id: any, i: any) => {
    e.preventDefault();
    const fileData = doclistWatch?.filter((f: any, index: any) => index !== i)
    setValue("DOC_LIST", fileData)
  }
  if (loading) {
    return <LoaderS />
  }

  return (
    <>

      <div className="">
        {CurrDocData?.length > 0 && CurrDocData?.length < 5 ? (
          <>
            <p className="Text_Secondary Input_Label"> {t("Body Images")}</p></>
        ) : (<>
        </>)}
        {CurrDocData?.length === 0 ? (
          <><p className="Text_Secondary Input_Label"> {t(uploadLabel)}</p></>
        ) : (<> </>)}
        {CurrDocData?.length === 5 ? (
          <>
            <p className="Text_Secondary Input_Label"> {t("Supporting Images")}</p></>
        ) : (<> </>)}

        <div className="flex items-center mt-2 justify-center w-full">
          <label
            htmlFor="dropzone-file"
            className={`flex flex-col items-center justify-center w-full h-54  ${CurrDocData?.length <= 0
              ? "border-2 border-gray-200 border rounded-lg"
              : ""
              }`}
          >
            {CurrDocData?.length <= 0 ?
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <img src={noDataIcon} alt="" className="w-10" />

                <p className="mb-2 mt-2 text-sm text-gray-500 cursor-pointer dark:text-gray-400">
                  <span className="Text_Primary Input_Label">
                    {t("Upload your file")}{" "}
                  </span>
                </p>
                <label className="Text_Secondary Helper_Text mb-4">
                  {t("PNG, JPG formats Maximum file size of 2MB")}
                </label>
              </div>
              : <></>
            }
            {CurrDocData?.length <= 0 ? <Field
              controller={{
                name: "DOC",
                control: control,
                render: ({ field }: any) => {
                  return (
                    <input
                      {...register("DOC", {
                      })}
                      id="dropzone-file"
                      multiple
                      className="hidden"
                      type={"file"}
                      invalidMessage={errors.DOC?.message}
                      {...field}
                      onChange={handleFileInputChange}
                    />
                  );
                },
              }}
            /> : <></>}
          </label>
        </div>

        {CurrDocData?.length <= 0 ? (
          <>
            <label className="Text_Secondary Helper_Text">
              {t("Up to 5 images are allowed.")}
            </label></>
        ) : (<> </>)}


      </div>

      <div className="flex flex-wrap gap-3">

        {DOC_LIST?.map((doc: any, index: any) => {

          if (doc.UPLOAD_TYPE === uploadtype) {
            const docData: any =
              "data:image/png;base64," + doc?.DOC_DATA;
            return (
              <>
                <div className="imageContainer">
                  <img src={docData} alt="" style={{ height: "100px", width: "100px", borderRadius: "8px" }} />
                  <Button className="closeBtn"
                    type="button"
                    icon="pi pi-times" onClick={(e) => handlerChange(e, doc?.DOC_SRNO, index)} />
                  {/* className="w-24 h-24 border-slate-300" /> */}
                  <div>
                    <span className="Text-Secondary" >{
                      doc.DOC_NAME.length > 15 ? doc.DOC_NAME.substring(0, 10) + '...' : doc.DOC_NAME
                        ? doc.DOC_NAME : doc.DOC_NAME
                    }{doc.DOC_NAME.length > 15 ? doc.DOC_EXTENTION : ''}</span>
                  </div>


                  <span className="Text-Secondary" style={{ fontSize: "12px" }}>{doc.DOC_SIZE}kb</span>
                </div>
              </>
            )
          }

        })}
        <div className="imageContainer">
          {CurrDocData?.length > 0 && CurrDocData?.length !== 5 && (<>
            <FileUpload
              mode="basic"
              name="DOC[]"
              multiple
              maxFileSize={1000000}
              onSelect={onFileSelect}
              auto
              className="Secondary_Button"
            />
          </>)}
        </div>
      </div>
    </>
  );
};

export default WoDocumentUpload;
