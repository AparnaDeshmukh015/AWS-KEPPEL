import React, { useCallback, useEffect, useState } from "react";
import InputField from "../../../components/Input/Input";
import Buttons from "../../../components/Button/Button";
import { Card } from "primereact/card";
import {useFieldArray, useForm } from "react-hook-form";
import Field from "../../../components/Field";
import Radio from "../../../components/Radio/Radio";
import Select from "../../../components/Dropdown/Dropdown";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { callPostAPI } from "../../../services/apis";
import { ENDPOINTS } from "../../../utils/APIEndpoints";
import { useLocation, useOutletContext } from "react-router-dom";
import DateCalendar from "../../../components/Calendar/Calendar";
import moment from "moment";
import { saveTracker } from "../../../utils/constants";
import { eventNotification, helperEventNotification } from "../../../utils/eventNotificationParameter";
import { decryptData } from "../../../utils/encryption_decryption";

type FormValues = {
  RETURN_TYPE: string;
  RETURN_DATE: string;
  WO_ID: string | null;
  REMARKS: string;
  STORE_ID: string;
  PART_LIST: {
    PART_CODE: string;
    PART_NAME: string;
    UOM_NAME: string;
    RETURN_QTY: string;
  }[];
  MODE: string;
  PARA: { para1: string; para2: string };
  USER_ID: string;
};

type FormErrors = {
  PART_LIST?: {
    [key: number]: {
      RETURN_QTY?: {
        type: string;
        message: string;
      };
    };
  };
};


const ReturnMaterialForm = (props: any) => {
  let localStoragedata: any = localStorage.getItem("Id");
  let returnFormLocalStorage: any = JSON.parse(localStoragedata)

  const { search } = useLocation();
  const { t } = useTranslation();
  let { pathname } = useLocation();
  const [options, setOptions] = useState<any | null>([]);
  const [redioOption, setRadioOption] = useState<any | null>(false)
  const [selectedDetails, setSelectedDetails] = useState<any>([]);
  const [ ,menuList]: any = useOutletContext();
  const currentMenu = menuList
    ?.flatMap((menu: any) => menu?.DETAIL)
    .filter((detail: any) => detail.URL === pathname)[0];
  const getId: any = localStorage.getItem("Id")
  const dataId = JSON.parse(getId)
  const assestTypeLabel: any = [
    { name: "Against Technician", key: "S" },

    { name: "Against Work Order", key: "A" },
  ];
  const {
    register,
    handleSubmit,
    control,
    setValue,
    resetField,
    watch,

    formState: { errors, isSubmitting },
  } = useForm<FormValues, FormErrors>({
    defaultValues: {
      MODE: props?.selectedData ? "E" : "A",
      PARA: props?.selectedData
        ? { para1: `${props?.headerName}`, para2: "Cancelled" }
        : { para1: `${props?.headerName}`, para2: "Added" },
      RETURN_TYPE: "",
      RETURN_DATE: "",
      // RAISED_BY: "",
      STORE_ID: "",
      WO_ID: search === '?edit=' ? props?.selectedData?.WO_ID : 0,
      REMARKS: "",
      USER_ID: decryptData((localStorage.getItem("USER_NAME"))),
      PART_LIST: [],
    },
    mode: "all"
  })
  const User_Name = decryptData((localStorage.getItem("USER_NAME")))
  const [IsSubmit, setIsSubmit] = useState<any | null>(false);

  // const STORE_NAMEwatch: any = watch("STORE_ID");
  const _RETURN_TYPE: any = watch("RETURN_TYPE");
  const _TechnicianWatch: any = watch("USER_ID");
  const _woid: any = watch("WO_ID");

  const PART_LIST: any = watch("PART_LIST");

  const { fields } = useFieldArray({
    name: "PART_LIST",
    control,
  });

  const getOptions = async () => {
    try {
      const payload = {
        MODE: search === '?add=' ? "A" : "E",
        RAISED_BY: decryptData((localStorage.getItem("USER_ID"))),
        WO_ID: search === '?edit=' ? props?.selectedData?.WO_ID : 0
      }

      const res = await callPostAPI(
        ENDPOINTS.GET_INVENTORY_MASTER_OPTIONS,
        payload,
        currentMenu?.FUNCTION_CODE
      );
      if (res?.FLAG === 1) {
        setOptions({
          woList: res?.WOLIST,
          technicianList: res?.VENDORLIST,
          storeList: res?.STORELIST,
        });
        if (search === "?edit=") {
          await getinventorypartdetails();

        }
      }
    } catch (error: any) {
      toast.error(error);
    }
  };
  const getOptionDetails = async () => {
    try {
      const payload: any = {
        MODE: search === '?add=' ? "A" : "E",
        RAISED_BY: decryptData((localStorage.getItem("USER_ID"))),
        WO_ID: _RETURN_TYPE?.key === "A" ? _woid?.WO_ID : 0,
        RETURN_TYPE: _RETURN_TYPE?.key,
      };

      const res = await callPostAPI(
        ENDPOINTS.GET_RETURN_MATERIAL_DETAILS,
        payload
      );
      if (res?.FLAG === 1) {

        setValue("PART_LIST", res?.PARTDETAILS);

      }
    } catch (error: any) {
      toast.error(error);
    }
  };

  const getinventorypartdetails = async () => {
    
    
    const payload = {
      DOC_NO: search === "?edit=" ? dataId?.DOC_NO : "",
      DOC_ID: search === "?edit=" ? dataId?.DOC_ID : 0,
    };

    

    const res = await callPostAPI(
      ENDPOINTS.GETADDINVENTORYMASTERSDETAILS,
      payload,
      currentMenu?.FUNCTION_CODE
    );

    if (res.FLAG === 1) {
      setSelectedDetails(res?.INVENTORYDETAILS[0]);
      const returnDate: any = new Date(res?.INVENTORYDETAILS[0]?.DOC_DATE);
      setValue("RETURN_DATE", returnDate);
      setValue("REMARKS", res?.INVENTORYDETAILS[0]?.REMARKS);
      setValue("USER_ID", decryptData((localStorage.getItem("USER_NAME"))));
      setValue("RETURN_TYPE", res?.INVENTORYDETAILS[0]?.SELF_WO === "A" ? "A" : "S")
      setValue("PART_LIST", res?.PARTLIST);

      if (res?.INVENTORYDETAILS[0]?.SELF_WO === "A") {

        setRadioOption(true)
      }
    }
  };

  const onSubmit = useCallback(async (payload: any, e: any) => {
    if (IsSubmit) return true
    setIsSubmit(true)

    try {
      const buttonMode: any = e?.nativeEvent?.submitter?.name;

      payload.MODE =
        buttonMode === "CANCEL" ? "C" : props?.selectedData ? "E" : "A";
      payload.CNCL_IND = buttonMode === "CANCEL" ? 1 : 0;

      payload.DOC_DATE = payload.RETURN_DATE = payload.RETURN_DATE
        ? moment(payload.RETURN_DATE).format("DD-MM-YYYY")
        : "";
      payload.RETURN_TYPE = _RETURN_TYPE?.key;
      payload.RETURN_BY = decryptData((localStorage.getItem("USER_ID")));
      payload.STORE_ID = payload?.STORE_ID?.STORE_ID;
      payload.DOC_ID =
        payload.MODE === "C" ? props?.selectedData?.DOC_ID ?? "" : "0";
      payload.USER_ID = decryptData((localStorage.getItem("USER_ID")));
      payload.WO_ID = _RETURN_TYPE?.key === "A" ? payload?.WO_ID?.WO_ID : 0;
      payload.REMARKS = payload.REMARKS !== undefined ? payload.REMARKS : "";


      payload.PART_LIST = PART_LIST;

      const res = await callPostAPI(
        ENDPOINTS.SAVE_RETURN_MATERIAL_DETAILS,
        payload
      );
      if (res?.FLAG === true) {
        toast?.success(res?.MSG);
        const notifcation: any = {
          FUNCTION_CODE: props?.functionCode,
          EVENT_TYPE: "I",
          STATUS_CODE: props?.selectedData ? 2 : 1,
          PARA1: search === "?edit=" ? User_Name : User_Name,
          PARA2: '',
          PARA3: 'return_no',
          PARA4: payload?.RETURN_DATE,
          PARA5: 'return_by',
          PARA6: _RETURN_TYPE?.name,
          PARA7: payload?.WO_ID,
        };
        const eventPayload = { ...eventNotification, ...notifcation };
        await helperEventNotification(eventPayload);
        props?.getAPI();

        props?.isClick();

      } else {
        setIsSubmit(false)
        toast?.error(res?.MSG);
      }
    } catch (error: any) {

      toast.error(error);
    } finally {
      setIsSubmit(false)
    }
  }, [IsSubmit, props.selectedData, props.functionCode, props.getAPI, props.isClick, callPostAPI, toast, decryptData, moment, _RETURN_TYPE, PART_LIST, eventNotification, search, User_Name]);

  useEffect(() => {
    
   
    (async function () {
      const returnDate: any = new Date();
    setValue("RETURN_DATE", returnDate);
      await  getOptions();
      await saveTracker(currentMenu)
     })();
  }, []);

  useEffect(() => {

    if (search === '?add=') {

      if (_RETURN_TYPE.key === "S") {
        setRadioOption(false)
        resetField("WO_ID");
      } else if (_RETURN_TYPE.key === "A") {
        setRadioOption(true)
        resetField("USER_ID");

      }
      resetField("REMARKS");
      resetField("PART_LIST");
    }
  }, [_RETURN_TYPE]);


  useEffect(() => {
    if (_TechnicianWatch !== undefined || _TechnicianWatch !== "" || _woid !== undefined || _woid !== "") {
      if (search === '?add=') {
        
        (async function () {
          await getOptionDetails();
         })();
   
      }
    }
  }, [_TechnicianWatch, _woid]);

  useEffect(() => {
    if ((!isSubmitting && Object?.values(errors)[0]?.type === "required") || (!isSubmitting && Object?.values(errors)[0]?.type === "validate")) {
      const check: any = Object?.values(errors)[0]?.message;
      toast?.error(t(check));
    }
  }, [isSubmitting]);


  return (
    <>
      <section className="w-full">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-wrap justify-between mt-1">
            <div>
              <h6 className="Text_Primary">
                {search === "?edit="? "Cancel" : "Add"} {props?.headerName}-
                {search === "?edit=" ? dataId?.DOC_NO : ""}
              </h6>
            </div>

            <div className="flex">
              {search === '?add=' ? (
                <Buttons
                  type="submit"
                  className="Primary_Button  w-20 me-2"
                  label={"Save"}
                  disabled={IsSubmit}
                />
              ) : (
                <>
                  {(returnFormLocalStorage?.CNCL_IND === false && search === '?edit=') && (
                    <>
                      <Buttons
                        type="submit"
                        className="Primary_Button me-2"
                        label={"Cancel"}
                        name="CANCEL"
                      />
                    </>
                  )}
                </>
              )}
              <Buttons
                className="Secondary_Button w-20 "
                label={"List"}
                onClick={props?.isClick}
              />
            </div>
          </div>

          <Card className="mt-2">
            <div className=" grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-3 lg:grid-cols-3">
              <Field
                controller={{
                  name: "RETURN_TYPE",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <>
                        <Radio
                          {...register("RETURN_TYPE", {
                            required: "Please fill the required fields",

                          })}
                          labelHead="Type"
                          require={true}
                          options={assestTypeLabel}
                          disabled={props.selectedData ? true : false}
                          selectedData={selectedDetails.SELF_WO === "A" ? "A" : "S"}
                          setValue={setValue}
                          {...field}
                        />
                      </>
                    );
                  },
                }}
              />
              <Field
                controller={{
                  name: "RETURN_DATE",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <DateCalendar
                        {...register("RETURN_DATE", {
                          required: "Please fill the required fields",
                        })}
                        label="Return Date"
                        setValue={setValue}
                        disabled={true}
                        require={true}
                        invalid={errors.RETURN_DATE}
                        showIcon
                        {...field}
                      />
                    );
                  },
                }}
              />
              <Field
                controller={{
                  name: "STORE_ID",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <Select
                        options={options?.storeList}
                        {...register("STORE_ID", {
                          required: "Please fill the required fields.",
                        })}
                        label="Store Name"
                        require={true}
                        findKey={"STORE_ID"}
                        optionLabel="STORE_NAME"
                        selectedData={selectedDetails?.STORE_ID}
                        disabled={search === '?edit=' ? true : false}
                        setValue={setValue}
                        invalid={errors.STORE_ID}
                        {...field}
                      />
                    );
                  },
                }}
              />

              <div>

                <Field
                  controller={{
                    name: "USER_ID",
                    control: control,
                    render: ({ field }: any) => {
                      return (
                        <InputField
                          {...register("USER_ID", {

                          })}
                          label="Technician Name"
                          disabled={true}
                          setValue={setValue}

                          {...field}
                        />
                      );
                    },
                  }}
                />
              </div>


              {_RETURN_TYPE?.key === "A" ?

                <Field
                  controller={{
                    name: "WO_ID",
                    control: control,
                    render: ({ field }: any) => {
                      return (
                        <Select
                          options={options?.woList}
                          {...register("WO_ID", {
                            required: _RETURN_TYPE === "A" && search === "?add=" ? "Please fill the required fields" : "",

                          })}
                          label="Work Order No"
                          optionLabel="WO_NO"
                          disabled={search === "?edit=" ? true : false}
                          require={_RETURN_TYPE === "A" && search === "?add=" ? true : false}
                          findKey={"WO_ID"}
                          selectedData={selectedDetails?.WO_ID}
                          setValue={setValue}
                          invalid={_RETURN_TYPE === "A" ? errors.WO_ID : ""}

                          {...field}
                        />
                      );
                    },
                  }}
                />

                : <> {search === "?edit=" || _woid !== 0 ? <><Field
                  controller={{
                    name: "WO_ID",
                    control: control,
                    render: ({ field }: any) => {
                      return (
                        <Select
                          options={options?.woList}
                          {...register("WO_ID", {
                            //  required: "Please fill the required fields",

                          })}
                          label="Work Order No"
                          optionLabel="WO_NO"
                          disabled={search === "?edit=" ? true : false}
                          //  require={true}
                          findKey={"WO_ID"}
                          selectedData={selectedDetails?.WO_ID}
                          setValue={setValue}
                          //  invalid={errors.WO_ID}

                          {...field}
                        />
                      );
                    },
                  }}
                /></> : ""}</>}

              <Field
                controller={{
                  name: "REMARKS",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <InputField
                        {...register("REMARKS", {
                          required: "Please fill the required fields.",
                          validate: value => value.trim() !== "" || "Please fill the required fields."
                        })}
                        label="Remarks"

                        require={true}
                        disabled={props?.selectedData ? true : false}
                        invalid={errors.REMARKS}
                        {...field}
                      />
                    );
                  },
                }}
              />
            </div>
          </Card>
          <Card className="mt-2">
            <div className="headingConainer">
              <p>{t("Part Details")}</p>
            </div>
            <div>
              <div>
                <DataTable value={fields} showGridlines>
                  <Column
                    field="SR_NO"
                    header={t("Sr No")}
                    className="w-20"
                    body={(rowData, { rowIndex }) => {
                      return <>{rowIndex + 1}</>;
                    }}
                  ></Column>
                  <Column
                    field="PART_CODE"
                    header={t("Part Code")}
                    className="w-40"
                  ></Column>
                  <Column
                    field="PART_NAME"
                    header={t("Part Name")}
                    className=""
                  ></Column>
                  <Column
                    field="UOM_NAME"
                    header={t("UOM")}
                    className=""
                  ></Column>
                  <Column
                    field={search === '?add=' ? "ISSUED_QTY" : "STOCK"}
                    header={t("Stock Available")}
                    className="w-40"
                  ></Column>
                  <Column
                    field="RETURN_QTY"
                    header={t("Return Quantity")}
                    className="w-40"
                    body={(rowData, { rowIndex }) => {
                      if (search === '?add=') {
                        setValue(`PART_LIST[${rowIndex}].RETURN_QTY` as any, rowData?.ISSUED_QTY);
                      } else {
                        setValue(`PART_LIST[${rowIndex}].RETURN_QTY` as any, rowData?.QTY);
                      }

                      return (
                        <>
                          <Field
                            controller={{
                              name: `PART_LIST.[${rowIndex}].RETURN_QTY`,
                              control: control,
                              render: ({ field }: any) => {

                                return (
                                  <InputField
                                    {...register(
                                      `PART_LIST.[${rowIndex}].RETURN_QTY` as any,
                                      {
                                        validate: (value: any) => {
                                          if (parseInt(value, 10) > parseInt(rowData?.ISSUED_QTY, 10)) {
                                            return (t("Should be less than stock avialalble"));
                                          } else {
                                            const sanitizedValue = value?.toString()?.replace(/[^0-9]/g, "");
                                            setValue(`PART_LIST.[${rowIndex}].RETURN_QTY` as any, sanitizedValue);
                                            return true;

                                          }
                                        }

                                      }
                                    )}
                                    setValue={setValue}
                                    disabled={props.selectedData ? true : false}
                                    invalid={
                                      errors?.PART_LIST?.[rowIndex]?.RETURN_QTY
                                        ? true
                                        : false
                                    }
                                    invalidMessage={
                                      errors?.PART_LIST?.[rowIndex]?.RETURN_QTY
                                        ?.message
                                    }
                                    {...field}
                                  />
                                );
                              },
                            }}
                          />
                        </>
                      );
                    }}
                  ></Column>

                </DataTable>
              </div>
            </div>
          </Card>
        </form>
      </section>
    </>
  );
};

export default ReturnMaterialForm;
