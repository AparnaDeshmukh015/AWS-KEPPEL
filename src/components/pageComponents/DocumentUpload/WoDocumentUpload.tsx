import React, { memo, useEffect, useState, useRef } from "react";
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

// import LoaderS from "../../Loader/Loader";
import pdfIcon from "../../../assest/images/pdfIcon.jpg";
import excelIcon from "../../../assest/images/excelIcon.png";
import wordDocIcon from "../../../assest/images/wordDocIcon.png";
import LoaderFileUpload from "../../Loader/LoaderFileUpload";
const validExtensions = ["jpg", "png", "jpeg", "JPG", "JPEG", "pdf", "doc", "docx", "xls", "xlsx", "heif", "heic", "heics", "heifc",];

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
  IsCancel,
  loader,
  Docstatus,
  isReopen,
  uploadError,
  uploadSupportMandatory,
  // onRemoveExistingDocument,
  ...props }: any) => {
  const { append, } = useFieldArray({
    control,
    name: "DOC_LIST",
  });
  const [doclist, setDoclist] = useState(watch("DOC_LIST"))
  const [fileStatus, setFileStatus] = useState<any | null>(false)

  var doclistWatch = watch("DOC_LIST")
  const inputRef = useRef<any | null>(null);
  const DOC_LIST = watch("DOC_LIST")
  const [loading, setLoading] = useState<any | null>(false)
  const { t } = useTranslation();
  const [isDropping, setIsDropping] = useState(false);
  const DOC_LIST_VALUE = getValues("DOC_LIST");
  const FACILITY: any = localStorage.getItem("FACILITYID");
  const FACILITYID: any = JSON.parse(FACILITY);

  if (FACILITYID) {
    var facility_type: any = FACILITYID?.FACILITY_TYPE;

  }
  const CurrDocData = doclistWatch?.filter(
    (doc: any) => doc.UPLOAD_TYPE == uploadtype
  );


  // cons
  useEffect(() => {
    if (doclistWatch?.length > 0) {
      setDoclist(doclistWatch)
    }

  }, [doclistWatch])
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

  useEffect(() => {
    doclistWatch = []
    if (IsCancel === true) {
      setValue("DOC_LIST", doclistWatch)
    }
  }, [IsCancel])



  const handleFileInputChange = async (e: any) => {
    e.preventDefault()
    if (isDropping === true) {

      return;
    }
    setIsSubmit(true)
    const selectedFiles: any[] = Array.from(e?.target?.files);
    // const validExtensions = ["jpg", "png", "jpeg", "JPG", "JPEG"];
    if (selectedFiles.length + CurrDocData?.length > 5) {
      toast.error('Only 5 files are allowed');
      setIsSubmit(false)
      return;
    }

    try {
      const newFiles: any = [];
      const fileScanPromises: any = selectedFiles.map(async (file) => {
        const ext = file.name.split(".").pop();
        if (validExtensions.includes(ext)) {
          const base64: any = await getBase64(file);
          setLoading(true)
          const fileScanStatus: any = await scanfileAPI(base64, file.name);

          file.base64 = base64;
          return { file, fileScanStatus, base64 };
        } else {
          setLoading(false)
          //  thro
          // w new Error("You can upload only JPG & PNG files.");
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
          if (sameFileName.length !== 0) {
            toast.error(t("This file already exists"));
            e.target.value = null;
            setLoading(false)
            setIsSubmit(false)
            return;
          }

          if (fileScanStatus === true) {
            setLoading(false)
            if (sameFileName.length === 0) {
              if (CurrDocData?.length < 5) {
                if (file?.size < 5242880) {
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
                  toast.error(t("The max file size is 5 Mb"));
                  e.target.value = null;
                  setIsSubmit(false)
                  setLoading(false)
                  return;
                }
              } else {
                toast.error(t("Only 5 files are allowed"));
                setIsSubmit(false)
                setLoading(false)
                return;
              }
            } else {
              toast.error(t("This file already exists"));
              e.target.value = null;
              setLoading(false)
              setIsSubmit(false)
              return;
            }
          }
          else {
            setLoading(false)
            setIsSubmit(false)
          }
        } else {

          toast.error(t("You can upload only JPG ,PNG ,Word ,Excel & Pdf files."));
          setLoading(false)
          setIsSubmit(false)
        }
      }

      append(newFiles);
      setIsSubmit(false)
      e.target.value = null;
    } catch (error) {
      setIsSubmit(false)

      toast.error("You can upload only JPG ,PNG ,Word ,Excel & Pdf files.");
      setLoading(false)

    }

  }


  const calFileSize = (base64: string) =>
    `${((4 * Math.ceil(base64?.length / 3) * 0.5624896334383812) / 1000)
      .toFixed(1)
      .toString()}`;

  const handlerChange = (e: any, id: any, i: any) => {
    e.preventDefault();
    // const fileToRemove = doclist[i];
    const fileData = doclist?.filter((f: any, index: any) => index !== i)
    // console.log(fileToRemove, fileData, "DELETE")
    const updatedDocuments = fileData?.map((doc: any, index: any) => ({
      ...doc,
      DOC_SRNO: index + 1 // Assigning sequential serial numbers starting from 1
    }));
    setValue("DOC_LIST", updatedDocuments)

    // if (!fileToRemove?.ISNEW && fileToRemove?.DOC_SYS_NAME && onRemoveExistingDocument) {
    //   onRemoveExistingDocument(fileToRemove);
    // }
  }

  const duplicateFileChecker = (fileList: any) => {
    const duplicateList: any = [];
    fileList.forEach((file: any) => {
      const item = DOC_LIST?.find(
        (doc: any) => doc?.DOC_NAME === file.name && doc.UPLOAD_TYPE === uploadtype
      );
      if (item) {
        duplicateList.push(item);
      }
    });
    return duplicateList;
  }
  const handleDrop = async (e: React.DragEvent) => {

    e.preventDefault();
    e.stopPropagation();
    if (isDropping === true) {
      toast.error(t("Please wait for the file to be scanned."));
      return;
    }
    if (fileStatus === true) {
      toast.error(t("Please wait for the file to be scanned."));
      return;
    }
    if (fileStatus === true) {
      toast.error(t("Please wait for the file to be scanned."));
      return;
    }
    setIsSubmit(true);
    setIsDropping(true);
    const droppedFiles = e.dataTransfer.files;
    const fakeEvent = { target: { files: droppedFiles } };
    const selectedFiles: any[] = Array.from(fakeEvent?.target?.files);
    // const validExtensions = ["jpg", "png", "jpeg", "JPG", "JPEG"];
    // const validExtensions = ["jpg", "png", "jpeg", "JPG", "JPEG", "pdf", "doc", "docx", "xls", "xlsx"];
    if (selectedFiles.length + CurrDocData?.length > 5) {
      toast.error('Only 5 files are allowed');
      setIsSubmit(false)
      setIsDropping(false)
      return;
    }
    const fileList = Array.from(fakeEvent?.target?.files);
    const duplicateList = duplicateFileChecker(fileList);

    if (duplicateList.length > 0) {
      //e.target.value = null;
      toast.error(t("This file already exists"));
      setLoading(false)
      setIsSubmit(false)
      setIsDropping(false)
    } else {

      try {
        const newFiles: any = [];

        const fileScanPromises: any = selectedFiles.map(async (file) => {
          const ext = file.name.split(".").pop();
          if (validExtensions.includes(ext)) {
            const base64: any = await getBase64(file);
            setLoading(true)
            const fileScanStatus: any = await scanfileAPI(base64, file.name);

            file.base64 = base64;
            return { file, fileScanStatus, base64 };
          } else {
            setLoading(false)

          }
        });

        const results = await Promise.allSettled(fileScanPromises);
        for (const result of results) {
          if (result.status === "fulfilled") {
            const { file, fileScanStatus, base64 } = result.value;
            const check = file.name.split(".");
            setFileStatus(fileScanStatus)

            if (fileScanStatus) {
              setLoading(false)
              // if (sameFileName.length === 0) {
              if (CurrDocData?.length < 5) {
                if (file?.size < 5242880) {
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
                  setIsDropping(false)
                } else {
                  toast.error(t("The max file size is 5 Mb"));
                  //  e.target.value = null;
                  setIsSubmit(false)
                  setLoading(false)
                  setIsDropping(false)
                  return;
                }
              } else {
                toast.error(t("Only 5 files are allowed"));
                setIsSubmit(false)
                setLoading(false)
                setIsDropping(false)
                return;
              }
              // } 
              //   else {
              // //    toast.error(t("This file already exists"));
              //     //e.target.value = null;
              //     setLoading(false)
              //     setIsSubmit(false)
              //     return;
              //   }
            }
            else {
              setLoading(false)
              setIsSubmit(false)
              setIsDropping(false)
            }
          } else {

            toast.error(t("You can upload only JPG ,PNG ,Word ,Excel & Pdf files."));
            setLoading(false)
            setIsSubmit(false)
            setIsDropping(false)
          }
        }

        append(newFiles);
        setIsSubmit(false)
        //  e.target.value = null;
      } catch (error) {
        setIsSubmit(false)

        toast.error("You can upload only JPG ,PNG ,Word ,Excel & Pdf files.");
        setLoading(false)
        setIsDropping(false)

      } finally {
        setFileStatus(false)
      }
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  console.log(doclist, 'docList')

  return (


    <>
      <div className="" >

        {CurrDocData?.length > 0 && CurrDocData?.length < 5 ? (
          <>

            {/* <p className="Text_Secondary Input_Label">{isReopen === true ? uploadLabel: "Supporting Files"}</p></> */}
            <p className="Text_Secondary Input_Label">{facility_type === "I" ? uploadLabel : "Supporting Files"}</p></>
        ) : (<>
        </>)}
        {CurrDocData?.length === 0 ? (
          <><p className="Text_Secondary Input_Label"> {t(uploadLabel)}{uploadSupportMandatory === true ? <span className="text-red-600"> *</span> : <></>}</p></>
        ) : (<> </>)}
        {CurrDocData?.length === 5 ? (
          <>
            {/* <p className="Text_Secondary Input_Label">{isReopen === true ? uploadLabel : "Supporting Files"}</p></> */}
            <p className="Text_Secondary Input_Label">{facility_type === "I" ? uploadLabel : "Supporting Files"}</p></>
        ) : (<> </>)}

        <div className="flex items-center mt-2 justify-center w-full" onDrop={handleDrop}
          onDragOver={handleDragOver}

        >
          <label
            // htmlFor="dropzone-file"
            className={`flex flex-col items-center justify-center w-full h-54  ${uploadError === true && DOC_LIST?.length === 0 ? "border-2 border-red-600" : CurrDocData?.length <= 0
              ? "border-2 border-gray-200 border rounded-lg"
              : ""
              }`}

          >
            {CurrDocData?.length <= 0 ?
              <div className="flex flex-col items-center justify-center pt-5 pb-6" >
                <img src={noDataIcon} alt="" className="w-10" />

                <p className="mb-2 mt-2 text-sm text-gray-500 cursor-pointer dark:text-gray-400">
                  <span className="Text_Primary Input_Label">
                    {t("Upload your file")}{" "}
                  </span>
                </p>
                <label className="Text_Secondary Helper_Text">
                  {t("JPG, PNG, Word, Excel & Pdf formats")}

                </label>
                <label className="Text_Secondary Helper_Text mb-4">
                  {t("")}
                  {t("Maximum file size of 5MB")}

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
                      ref={inputRef}
                      {...register("DOC", {
                      })}
                      id="dropzone-file"
                      multiple
                      className="invisible"
                      type={"file"}
                      disabled={loading}

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
              {t("Up to 5 files are allowed")}
            </label></>
        ) : (<> </>)}


      </div>

      <div className="flex flex-wrap gap-4"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <>
          {loader === true && isReopen === true ? <div className="imageContainer  flex justify-center items-center z-400">
            <>
              <LoaderFileUpload IsScannig={true} />
            </>
          </div> : DOC_LIST?.map((doc: any, index: any) => {

            const docsize = calFileSize(doc?.DOC_DATA)
            const getExtension = (str: any) => str.slice(str.lastIndexOf("."));
            const fileExtension = getExtension(doc?.DOC_NAME);
            if (doc.UPLOAD_TYPE === uploadtype) {
              console.log(doc.UPLOAD_TYPE)
              console.log(uploadtype, 'uploadtype')
              if (DOC_LIST[index]?.DOC_EXTENTION === 'pdf' || fileExtension === ".pdf") {

                var docData: any = pdfIcon
              } else if (DOC_LIST[index]?.DOC_EXTENTION === "xls" || DOC_LIST[index]?.DOC_EXTENTION === "xlsx" || fileExtension === ".xlsx" || fileExtension === ".xls") {
                docData = excelIcon
              }
              else if (DOC_LIST[index]?.DOC_EXTENTION === "doc" || DOC_LIST[index]?.DOC_EXTENTION === "docx" || fileExtension === ".doc" || fileExtension === ".docx") {
                docData = wordDocIcon
              }
              else if (
                fileExtension === ".heif" ||
                fileExtension === ".heic"
              ) {
                docData = `data:image/heif;base64,` + doc?.DOC_DATA;
              }
              else {
                docData =
                  // `data:image/${fileExtension.replace(".", "")};base64,` + doc?.DOC_DATA;
                  `data:image/jpeg;base64,` + doc?.DOC_DATA;
                // }
              }

              return (

                <>
                  <div className="imageContainer">
                    <img src={docData} alt="" className="w-[120px] h-[120px] rounded-xl cursor-pointer" />
                    <Button className="closeBtn"
                      tabIndex={doc?.DOC_SRNO}
                      type="button"
                      icon="pi pi-times" onClick={(e) => handlerChange(e, doc?.DOC_SRNO, index)} />
                    {/* className="w-24 h-24 border-slate-300" /> */}
                    <div className="flex flex-col ">
                      <div className="Service_Image_Title">
                        {
                          doc.DOC_NAME.length > 15 ? doc.DOC_NAME.substring(0, 6) + '...' : doc.DOC_NAME
                            ? doc.DOC_NAME : doc.DOC_NAME
                        }{doc.DOC_NAME.length > 15 ? doc.DOC_EXTENTION === '' ? fileExtension : doc.DOC_EXTENTION : ""}
                      </div >
                      <div className="Text_Secondary Helper_Text">{doc.DOC_SIZE === undefined ? docsize : doc.DOC_SIZE}kb</div >
                    </div>

                  </div>

                </>
              )
            }

          })}
        </>

        <div className="imageContainer"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        // className={`flex flex-col items-center justify-center w-full h-54 

        >
          {loading ? <div className="imageContainer  flex justify-center items-center">
            <>
              <LoaderFileUpload IsScannig={true} />

            </>
          </div> : CurrDocData?.length > 0 && CurrDocData?.length !== 5 && (<>


            <Field
              controller={{
                name: "DOC",
                control: control,
                render: ({ field }: any) => {
                  return (
                    <>
                      {/* The file input itself is invisible, but still clickable */}
                      <input
                        {...register("DOC", {})}
                        multiple
                        className="file-input"

                        type="file"
                        id="file-input"
                        style={{
                          opacity: 0,
                          width: '120px',
                          height: '120px',
                          position: 'absolute',
                          cursor: 'pointer',
                        }}
                        disabled={loading}

                        invalidMessage={errors.DOC?.message}
                        {...field}
                        onChange={handleFileInputChange}
                      />

                      {/* Plus Icon */}
                      <span
                        style={{
                          // display: 'inline-block',
                          width: '120px',
                          height: '120px',
                          backgroundColor: '#f0f0f0',
                          border: '2px solid #ccc',
                          borderRadius: '8px',
                          fontSize: '30px',
                          color: '#8E724A',
                          // fontWeight: 'bold',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          cursor: 'pointer',
                        }}

                      >
                        +
                      </span>
                    </>
                  );
                },
              }}
            />



          </>)}
        </div>
      </div>

    </>
  );
};

export default memo(WoDocumentUpload);
