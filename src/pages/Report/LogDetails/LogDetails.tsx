import InputField from "../../../components/Input/Input";
import { Card } from "primereact/card";
import { useForm } from "react-hook-form";
import Field from "../../../components/Field";
import { callPostAPI } from "../../../services/apis";
import { ENDPOINTS } from "../../../utils/APIEndpoints";
import { toast } from "react-toastify";
import { useCallback, useEffect, useState } from "react";

import {
  helperEventNotification,
} from "../../../utils/eventNotificationParameter";
import Select from "../../../components/Dropdown/Dropdown";
import { useLocation } from "react-router-dom";
import { decryptData } from "../../../utils/encryption_decryption";
import DateCalendar from "../../../components/Calendar/Calendar";
import Buttons from "../../../components/Button/Button";
import moment from "moment";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { dateFormat } from "../../../utils/constants";

const ServiceTypeMasterForm = (props: any) => {

  const [show, setShow] = useState<any | null>(false)
  let head: any = []
  let rows: any = []
  const [logsList, setLogsList] = useState([]);
  const [masterList, setmasterList] = useState([]);
  const [IsSubmit, setIsSubmit] = useState<any | null>(false);
  const { search } = useLocation();
  const [masterId, setMasterId] = useState<any | null>(null)


  const {
    register,
    handleSubmit,
    control,
    setValue,

    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      LOGS_DETAILS: "",
      MASTER_DETAILS: "",
      FROM_DATE: "",
      TO_DATE: "",
      ASSETTYPE_ID: "",

      ASSETTYPE: "N",
      ASSETTYPE_NAME: "",
      ACTIVE:
        props?.selectedData?.ACTIVE !== undefined
          ? props.selectedData.ACTIVE
          : true,
      ASSETGROUP_ID: "",
    },
    mode: "onSubmit",
  });


  const User_Name = decryptData((localStorage.getItem("USER_NAME")));

  const GETLOGSLIST = async () => {
    try {
      const res = await callPostAPI(ENDPOINTS.GETLOGSLIST, null);
      if (res?.FLAG === 1) {
        setLogsList(res?.LOGLIST);
        setmasterList(res?.FUNCTIONLIST)
      } else {
        setLogsList([])
      }
    } catch (error: any) {
      toast.error(error)
      setShow(false)
    }
  };

  const onSubmit = useCallback(async (payload: any) => {

    // if (payload.FROM_DATE == undefined || payload.TO_DATE == undefined || payload.LOGS_DETAILS == "" || payload.MASTER_DETAILS?.FUNCTION_CODE === "" || payload.MASTER_DETAILS?.FUNCTION_CODE === undefined) {
    //   toast?.error("Please Select Required Fields");
    //   return;
    // }

    if (IsSubmit) return true
    setIsSubmit(true)
    try {

      head = [];
      payload.FROM_DATE = payload.FROM_DATE = payload.FROM_DATE
        ? moment(payload.FROM_DATE).format("YYYY-MM-DD")
        : "";
      payload.TO_DATE = payload.TO_DATE
        ? moment(payload.TO_DATE).format("YYYY-MM-DD")
        : "";
      payload.LOG_ID = payload.LOGS_DETAILS.ID
      payload.FUNCTION_CODE = payload?.MASTER_DETAILS?.FUNCTION_CODE
      delete payload?.MASTER_DETAILS
      delete payload?.ASSETTYPE_ID
      delete payload?.ASSETTYPE
      delete payload?.ASSETTYPE_NAME
      delete payload?.ACTIVE
      delete payload?.ASSETGROUP_ID


      const res = await callPostAPI(ENDPOINTS.GETLOGSDETAILS, payload);



      if (res?.FLAG === 1) {

        for (let i = 0; i < res.COLLIST.length; i++) {
          head.push(res.COLLIST[i].Col_Filed)
        }


        rows = res.LOGDETAILSLIST
        await downloadExcel(payload.LOGS_DETAILS.LOG_NAME)
        toast?.success(res?.MSG);
      } else {
        setIsSubmit(false)
        toast?.error(res?.MSG);
      }
    } catch (error: any) {
      setIsSubmit(false)
      toast.error(error);
    } finally {
      setIsSubmit(false)
    }
  }, [IsSubmit, props.selectedData, props.functionCode, props.getAPI, props.isClick, callPostAPI, toast, helperEventNotification, dateFormat, search, User_Name,]);


  const prepareDataForExcel = () => {
    const sheetData = [head];

    rows.forEach((row: any) => {
      const rowData = head.map((header: any) => row[header] || '');
      sheetData.push(rowData);
    });

    return sheetData;
  };

  // Function to handle the Excel download
  const downloadExcel = (filename: any) => {
    const sheetData = prepareDataForExcel();
    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const excelFile = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(excelFile, filename + '.xlsx');
  };

  useEffect(() => {
    (async function () { await GETLOGSLIST() })();
  }, []);


  useEffect(() => {
    if ((!isSubmitting && Object?.values(errors)[0]?.type === "required") || (!isSubmitting && Object?.values(errors)[0]?.type === "validate")) {

      const check: any = Object?.values(errors)[0]?.message;
      toast?.error(check);
    } else {
    }
  }, [isSubmitting]);






  return (
    <section className="w-full">
      <h6>Log Details</h6>
      <form onSubmit={handleSubmit(onSubmit)}>

        <Card className="mt-2">
          <div className="mt-1 grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-4 lg:grid-cols-4">

            <Field
              controller={{
                name: "LOGS_DETAILS",
                control: control,
                render: ({ field }: any) => {
                  return (
                    <Select
                      options={logsList}
                      {...register("LOGS_DETAILS", {
                        required: ("Please fill the required fields."),
                        onChange: (e: any) => {

                          setMasterId(e.target.value?.ID)
                        }
                      })
                      }
                      label="Logs Details List"
                      require={true}
                      findKey={"ID"}
                      optionLabel="LOG_NAME"
                      // selectedData={logsList}
                      // disabled={search === "?edit=" ? true : false}
                      setValue={setValue}
                      //onChange={getpartlist}
                      invalid={errors.LOGS_DETAILS}
                      {...field}
                    />
                  );
                },
              }}
            />
            {/* {LOGS_DETAILSwatch && LOGS_DETAILSwatch?.ID === 4 &&   */}
            {masterId === 4 &&
              <Field
                controller={{
                  name: "MASTER_DETAILS",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <Select
                        options={masterList}
                        {...register("MASTER_DETAILS",
                          {
                            required: masterId === 4 ? "Please fill the required fields." : ""

                          }
                        )}
                        label="Masters"
                        require={masterId === 4 ? true : false}
                        findKey={"FUNCTION_CODE"}
                        optionLabel="FUNCTION_DESC"
                        selectedData={masterList}
                        disabled={search === "?edit=" ? true : false}
                        setValue={setValue}
                        filter
                        invalid={masterId === 4 ? errors.MASTER_DETAILS : ""}
                        {...field}
                      />
                    );
                  },
                }}
              />
            }
            <Field
              controller={{
                name: "FROM_DATE",
                control: control,
                rules: {
                  validate: (value: any) => {
                    return value && value !== '' ? true : "Please fill the required fields.";
                  },
                },
                render: ({ field, fieldState }: any) => {
                  return (
                    <DateCalendar
                      {...register("FROM_DATE")}
                      label="From  Date"
                      setValue={setValue}
                      require={true}
                      showIcon
                      invalid={fieldState?.error}
                      {...field}
                    />
                  );
                },
              }}
            />
            <Field
              controller={{
                name: "TO_DATE",
                control: control,
                rules: {
                  validate: (value: any) => {
                    return value && value !== '' ? true : "Please fill the required fields.";
                  },
                },
                render: ({ field, fieldState }: any) => {
                  return (
                    <DateCalendar
                      {...register("TO_DATE")}
                      label="To Date"
                      setValue={setValue}
                      require={true}

                      showIcon
                      invalid={fieldState?.error}
                      {...field
                      }
                    />
                  );
                },
              }}
            />
            {show && (<Field
              controller={{
                name: "ASSETTYPE_NAME",
                control: control,
                render: ({ field }: any) => {
                  return (
                    <InputField
                      {...register("ASSETTYPE_NAME", {
                        // required: t("Please fill the required fields."),
                      })}
                      label="Service Type Name"
                      // require={true}
                      // invalid={errors.ASSETTYPE_NAME}
                      {...field}
                    />
                  );
                },
              }}
              error={errors?.ASSETTYPE_NAME?.message}
            />)}

            <div className="flex align-items-center">
              <Buttons
                type="submit"
                className="Primary_Button md:mt-5"
                label={"Download"}
                name="Download"
              />
            </div>
          </div>
        </Card>
      </form>
    </section>
  );
};

export default ServiceTypeMasterForm;
