
import { useTranslation } from "react-i18next";

const TemplateUploadDialogBox = () => {
  const { t } = useTranslation();
  return (
    <>
      <div className="flex items-center mt-2 justify-center w-full">
        <label
          htmlFor="dropzone-file"
          className="flex flex-col items-center justify-center w-full h-54 border-2
               border-gray-300 border rounded-lg  "
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg
              className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 16"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
              />
            </svg>
            <p className="mb-2 text-sm text-gray-500 cursor-pointer dark:text-gray-400">
              <span className="Text_Primary Input_Text">
                {t("Upload your file")}{" "}
              </span>
            </p>
            <label className="Text_Secondary Helper_Text">
              {t("Document Format")}
            </label>
          </div>
        
        </label>
      </div>
    </>
  );
};

export default TemplateUploadDialogBox;
