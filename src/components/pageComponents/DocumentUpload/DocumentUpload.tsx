import React, { useState } from "react";
import Table from "../../Table/Table";
import Field from "../../Field";
import { v4 as uuidv4 } from "uuid";
import { useTranslation } from "react-i18next";
import { useFieldArray } from "react-hook-form";
import FileUploads from "../../../assest/images/FileUpload.jpg";
import { toast } from "react-toastify";
import { decryptData } from "../../../utils/encryption_decryption";
import { scanfileAPI } from "../../../utils/constants";
import LoaderFileUpload from "../../Loader/LoaderFileUpload";

const DocumentUpload = ({
  register,
  control,
  setValue,
  watch,
  getValues,
  errors,
  woMasterForm,
  ...props
}: any) => {
  const { append, remove, update } = useFieldArray({
    control,
    name: "DOC_LIST",
  });
  const { t } = useTranslation();
  const [loading, setLoading] = useState<any | null>(false);
  const DOC_LIST_VALUE = getValues("DOC_LIST");
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
    var ext = e.target.files[0].name.split(".").pop();
    if (
      ext === "docx" ||
      ext === "PDF" ||
      ext === "pdf" ||
      ext === "xlsx" ||
      ext === "doc" ||
      ext === "xls" ||
      ext === "csv" ||
      ext === "jpg" ||
      ext === "png" ||
      ext === "jpeg" ||
      ext === "JPG" ||
      ext === "JPEG"
    ) {
      const file = e.target.files[0];
      getBase64(file)
        .then(async (result: any) => {
          file["base64"] = result;
          const check = file?.name?.split(".");
          const sameFileName: any = DOC_LIST_VALUE?.filter(
            (doc: any) => doc?.DOC_NAME === file?.name
          );
          setLoading(true);
          const fileScanStatus: any = await scanfileAPI(
            file?.base64,
            file.name
          );

          if (fileScanStatus === true) {
            if (sameFileName?.length === 0) {
              if (DOC_LIST_VALUE?.length < 5) {
                append({
                  DOC_SRNO: DOC_LIST_VALUE?.length + 1,
                  DOC_NAME: file?.name,
                  DOC_DATA: (file?.base64).split("base64,")[1],
                  DOC_EXTENTION: check[check?.length - 1],
                  DOC_SYS_NAME: uuidv4(),
                  ISDELETE: false,
                  DOC_TYPE: "",
                  UPLOADEDBY: decryptData(localStorage.getItem("USER_NAME")),
                  // FILE: file
                });
                e.target.value = null;
              } else {
                toast.error(t("Upload only 5 files"));
              }
              setLoading(false);
            } else {
              toast.error(t("Same file name can not upload"));
            }
          } else {
            setLoading(false);
          }
        })
        .catch((err: any) => {
          setLoading(false);
          toast.error(err);
        });
    } else {
      toast.error(t("Can not upload this file "));
      setLoading(false);
    }
  };

  const handleFileDelete = (selectedData: any, index: any) => {
    if (selectedData?.ISNEW === false) {
      update(index, { ...selectedData, ISDELETE: true });
    } else {
      remove(index);
    }
  };

  return (
    <div>
      <div className="headingConainer">
        <p>{t("Document Upload")}</p>
      </div>
      <div className="mt-2">
        {loading ? (
          <LoaderFileUpload IsScannig={true} />
        ) : (
          <>
            {" "}
            <Table
              columnTitle={["DOC_NAME", "UPLOADEDBY", "ACTION"]}
              customHeader={["Document Name", "Uploaded By", "Action"]}
              columnData={DOC_LIST_VALUE?.filter(
                (data: any) => data?.ISDELETE === false
              )}
              downloadColumnHeader={"DOC_NAME"}
              isClick={props?.isForm}
              handleFileDelete={handleFileDelete}
              isDocumentDelete={true}
            />
          </>
        )}
      </div>
      <div className="mt-1 grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-3 lg:grid-cols-3">
        <div className="col-span-2">
          <div className="flex items-center mt-2 justify-center w-full">
            <label
              htmlFor="dropzone-file"
              className="flex flex-col items-center justify-center w-full h-54 border-2
               border-gray-300 border rounded-lg  "
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <img src={FileUploads} alt="" className="w-40" />
                <p className="mb-2 text-sm text-gray-500 cursor-pointer dark:text-gray-400">
                  <span className="Text_Primary Input_Label">
                    {t("Upload your file")}{" "}
                  </span>
                </p>
                <label className="Text_Secondary Helper_Text">
                  {t("Document Format")}
                </label>
              </div>

              <Field
                controller={{
                  name: "DOC",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <input
                        {...register("DOC", {})}
                        id="dropzone-file"
                        className="hidden"
                        type={"file"}
                        multiple
                        invalidMessage={errors.DOC?.message}
                        {...field}
                        onChange={handleFileInputChange}
                      />
                    );
                  },
                }}
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentUpload;
