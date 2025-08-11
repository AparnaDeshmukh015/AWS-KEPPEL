import React, { useCallback, useEffect, useState } from "react";
import InputField from "../../../components/Input/Input";
import Buttons from "../../../components/Button/Button";
import { Card } from "primereact/card";
import { useFieldArray, useForm} from "react-hook-form";
import Field from "../../../components/Field";
import Checkboxs from "../../../components/Checkbox/Checkbox";
import Select from "../../../components/Dropdown/Dropdown";
import MultiSelects from "../../../components/MultiSelects/MultiSelects";
import { useTranslation } from "react-i18next";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import Button from "../../../components/Button/Button";
import { toast } from "react-toastify";
import { ENDPOINTS } from "../../../utils/APIEndpoints";
import { callPostAPI } from "../../../services/apis";
import { Link, useLocation, useOutletContext } from "react-router-dom";
import FormHeader from "../../../components/FormHeader/FormHeader";
import { eventNotification, helperEventNotification } from "../../../utils/eventNotificationParameter";
import { saveTracker } from "../../../utils/constants";
import { decryptData } from "../../../utils/encryption_decryption";
import { appName } from "../../../utils/pagePath";
import { Checkbox } from "primereact/checkbox";

interface EVENTTYPE {
  ESC_LEVEL: any;
  TIME: any;
  EVENT: any;
}
interface FormValues {
  MODE: string;
  PARA: { para1: string; para2: string };
  STORE: string;
  OBJ_ID: any;
  EVENT_ID: string;
  DOC_DATE: string;
  BILL_DATE: string;
  REMARKS: string;
  ACTIVE: number;
  VENDOR: string;
  SLA_NAME: string;
  WO_TYPE: any,
  SEVERITY_CODE: any,
  STATUS_FROM: any,
  STATUS_TO: any,
  ALL_ASSETTYPE: any,
  SELECTED_ASSET_LIST: any,
  ESC_DETAILS: EVENTTYPE[],
  ASSET_D: [],
}
type FormErrors = {
  ESC_DETAILS?: {
    [key: number]: {
      TIME?: {
        type: string;
        message: string;
      };

      EVENT?: {
        type: string;
        message: string;
      };
    };
  };
};
const EscalationMatrixForm = (props: any) => {
  const localData: any = localStorage.getItem('ALL_ASSETTYPE')
  const { t } = useTranslation();
  const [selectedDetails, setSelectedDetails] = useState<any>([]);
  const [options, setOptions] = useState<any | null>([]);
  const [statusTo, setStatusTo] = useState<any | null>([]);
  const { search }: any = useLocation();
  const [assetTypeList, setAssetTypeList] = useState<any | null>([])
  const location: any = useLocation();
  const [IsSubmit, setIsSubmit] = useState<any | null>(false);
  let { pathname } = useLocation();
  const [, menuList]: any = useOutletContext();
  const getId: any = localStorage.getItem("Id");
    const dataId = JSON.parse(getId);
  const [checked, setChecked] = useState(localData ? localData : false);
  const currentMenu = menuList
    ?.flatMap((menu: any) => menu?.DETAIL)
    .filter((detail: any) => detail.URL === pathname)[0];
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues, FormErrors>({
    defaultValues: {
      OBJ_ID: 0,
      // location?.state !== null
      //   ?location?.state?.data?.OBJ_ID 
      //   : props?.selectedData
      //     ? props?.selectedData?.OBJ_ID
      //     : 0,
      EVENT_ID: search === "?edit=" ? dataId?.EVENT_ID : 0,
      PARA:
        location?.state && location?.state?.OBJ_ID
          ? { para1: `${props?.headerName}`, para2: t("Updated") }
          : props?.selectedData
            ? { para1: `${props?.headerName}`, para2: t("Updated") }
            : { para1: `${props?.headerName}`, para2: t("Added") },
      MODE:
        location?.state && location?.state?.OBJ_ID
          ? "E"
          : props?.selectedData
            ? "E"
            : "A",
      SLA_NAME: "",
      WO_TYPE: "",
      SEVERITY_CODE: "",
      STATUS_FROM: "",
      STATUS_TO: "",
      ACTIVE: search === "?edit="? dataId?.ACTIVE: true,
      ALL_ASSETTYPE: false,
      SELECTED_ASSET_LIST: "",
      ESC_DETAILS: [],
      ASSET_D: [],
    },
    mode: "all",
  });

  const { fields, append, remove } = useFieldArray({
    name: "ESC_DETAILS",
    control,
  });

  // const allAssetTypeCheckWatch: any = watch("ALL_ASSETTYPE");
  const watchField: any = watch("ESC_DETAILS")
  const watchAll: any = watch();
  const User_Name = decryptData((localStorage.getItem("USER_NAME")))

  const onSubmit = useCallback(async (payload: any) => {
    if (IsSubmit) return;
    setIsSubmit(true);

    const updated_EventDetails = payload?.ESC_DETAILS.map((event: any, index: any) => ({
      ESC_LEVEL: index + 1,
      TIME: parseInt(event?.TIME, 10),
      EVENT_ID: event?.EVENT?.EVENT_ID
    }));

    const updatedAssetTypeList: any =
      payload?.SELECTED_ASSET_LIST?.length > 0
        ? payload?.SELECTED_ASSET_LIST?.map(({ ASSETTYPE_ID }: any) => ({
          ASSETTYPE_ID,
        }))
        : [];
    payload.WO_TYPE = payload?.WO_TYPE?.WO_TYPE_CODE;
    payload.STATUS_FROM = payload.STATUS_FROM?.STATUS_CODE;
    payload.STATUS_TO = payload.STATUS_TO?.STATUS_CODE;
    payload.SEVERITY_CODE = payload.SEVERITY_CODE.SEVERITY_ID;
    payload.ESC_DETAILS = updated_EventDetails;
    payload.ASSET_D = checked === false ? updatedAssetTypeList : [];
    payload.ALL_ASSETTYPE = checked;
    payload.OBJ_ID = search === '?edit=' ? selectedDetails?.OBJ_ID
      : 0;
    delete payload?.SELECTED_ASSET_LIST;
    if (updated_EventDetails?.length > 0) {
      try {

        const res = await callPostAPI(
          ENDPOINTS?.SAVE_EVENT_Escalation,
          payload
        );
        if (res?.FLAG === true) {
          toast?.success(res?.MSG);
          const notifcation: any = {
            FUNCTION_CODE: currentMenu?.FUNCTION_CODE,
            EVENT_TYPE: "S",
            STATUS_CODE: search === '?edit=' ? 2 : 1,
            "PARA1": search === "?edit=" ? User_Name : User_Name,
            // PARA2: "workorder_no",
            // PARA3: "workorder_date",
            // PARA4: "raised_by",
            // PARA5: "location",
            // PARA6: "asset",
            // PARA7: "request_description",
            // PARA8: "severity",
            // PARA9: "raised_on",
            // PARA10: "acknowledged_on",
            // PARA11: "attednded_on",
            // PARA12: "rectified_on",
            // PARA13: "completed_on",
            // PARA14: "cancelled_on",
            // PARA15: "modified_on"


          };

          const eventPayload = { ...eventNotification, ...notifcation };
          await helperEventNotification(eventPayload);
          props?.getAPI();
          props?.isClick();
        }
        else {
          toast.error(res?.MSG)
        }
      } catch (error: any) {
        toast?.error(error);
        setIsSubmit(false)
      }
      finally {
        setIsSubmit(false)
      }
    } else {
      toast?.error(t("Please fill at least one escalation details"));
    }

  }, [IsSubmit, setIsSubmit, checked, search, selectedDetails, toast, currentMenu, User_Name, eventNotification, helperEventNotification, props]);

  useEffect(() => {

  }, [selectedDetails?.ALL_ASSETTYPE])

  const watchFieldArray: any = watch("ESC_DETAILS");


  const handlerAdd = () => {
    const isLastRowFilled = watchFieldArray.every(
      (entry: any) => entry.TIME !== "" && entry.EVENT !== null
    );

    if (isLastRowFilled) {
      const newField: any = {
        ESC_LEVEL: `Level${watchFieldArray.length + 1}`,
        TIME: "",
        EVENT: null,
        id: new Date().getTime().toString(),
      };
      append(newField);
    } else {
      toast.error(t("Please fill in the current row before adding a new one."));
    }
  };

  const getOptionDetails = async () => {
    const res = await callPostAPI(
      ENDPOINTS.GET_EVENT_Escalation_OPTIONS_DETAILS,
      {
        OBJ_ID:
          location?.state !== null
            ? location?.state?.OBJ_ID
            : dataId?.OBJ_ID,
      }
    );
    if (res?.FLAG === 1) {
      setSelectedDetails(res?.ESCALATIONLIST[0]);
      setValue("SLA_NAME", res?.ESCALATIONLIST[0]?.SLA_NAME);
      setChecked(res?.ESCALATIONLIST[0]?.ALL_ASSETTYPE === true ? true : false)
      //setValue("ALL_ASSETTYPE", res?.ESCALATIONLIST[0]?.ALL_ASSETTYPE);
      setAssetTypeList(res?.ASSETTYPELIST)
      // const mappedResponse = res?.ESCALATIONMATRIXLIST?.map((item: any) => {
      //   const matchedEscalation = options?.escalationList?.find(
      //     (escalation: any) => escalation.ESC_LEVEL === item.ESC_LEVEL
      //   );

      //   return {
      //     ...item,
      //     EVENT: {
      //       ESC_LEVEL: matchedEscalation?.ESC_LEVEL,
      //       ESC_LEVEL_DESC: matchedEscalation?.ESC_LEVEL_DESC,
      //     },
      //   };
      // });

      setValue("ESC_DETAILS", res?.ESCALATIONMATRIXLIST);

    }
  };


  const getOptions = async () => {
    try {
      const res = await callPostAPI(ENDPOINTS.GET_EVENT_Escalation_OPTIONS, {
        ASSETTYPE: "N",
      });
      const res1 = await callPostAPI(ENDPOINTS.GET_EVENTMASTER_STATUS, {
        EVENT_TYPE: "E",
      });
      if (res?.FLAG === 1) {
        setOptions({
          assetTypeList: res?.ASSETTYPELIST,
          escalationList: res?.ESCALATIONLIST,
          eventList: res?.EVENTLIST,
          severityList: res?.SEVERITYLIST,
          woStatusList: res?.WOSTATUSLIST,
          statusFrom: res1?.STATUSLIST,
          statusTo: res1?.STATUSLIST,
        });
        const selectedIndex = res1?.STATUSLIST.findIndex(
          (status: any) => status.STATUS_CODE === 1
        );
        const tolist: any = res1?.STATUSLIST?.slice(selectedIndex + 1);
        setStatusTo(tolist);

        if (props?.selectedData !== undefined || search === "?edit=") {
          await getOptionDetails();
        }

        if (location?.state?.data?.OBJ_ID === 0) {

          setSelectedDetails({
            WO_TYPE: location?.state?.data?.watchField?.WO_TYPE?.WO_TYPE_CODE,
            STATUS_FROM: location?.state?.data?.watchField?.STATUS_FROM?.STATUS_CODE,
            STATUS_TO: location?.state?.data?.watchField?.STATUS_TO?.STATUS_CODE,
            SEVERITY_CODE: location?.state?.data?.watchField?.SEVERITY_CODE?.SEVERITY_ID,
            ALL_ASSETTYPE: location?.state?.data?.watchField?.ALL_ASSETTYPE === true ? true : false,
          })
          setChecked(localData === "true" ? true : false)
          setValue('SLA_NAME', location?.state?.data?.watchField?.SLA_NAME)
          setValue("ESC_DETAILS", location?.state?.data?.watchField?.ESC_DETAILS)
          setAssetTypeList(location?.state?.data?.watchField?.SELECTED_ASSET_LIST)

        } else {
          localStorage.removeItem("ALL_ASSETTYPE")
        }
      }
    } catch (error: any) {
      toast.error(error);
    }
  };


  const statusFromSelectWatch: any = watch("STATUS_FROM");
  useEffect(() => {
    const selectedIndex = options?.statusFrom?.findIndex(
      (status: any) => status.STATUS_CODE === statusFromSelectWatch?.STATUS_CODE
    );
    const tolist: any = options?.statusFrom?.slice(selectedIndex + 1);
    setStatusTo(tolist);
  }, [statusFromSelectWatch]);

  useEffect(() => {
    (async function () {
      await getOptions();
    await saveTracker(currentMenu)})()
  }, []);

  useEffect(() => {
    const nestedErrors: any = errors?.ESC_DETAILS || {};
    const firstError: any = Object?.values(nestedErrors)[0];
    if (!isSubmitting && Object?.values(errors)[0]?.type === "required") {
      const check: any = Object?.values(errors)[0]?.message;
      toast?.error(t(check));
    } else if (!isSubmitting && (firstError?.TIME?.type === "required" || firstError?.EVENT?.type === "required")) {
      const check: any = firstError?.TIME?.message || firstError?.EVENT?.message;
      toast?.error(t(check));
    }
  }, [isSubmitting]);


  useEffect(() => {
    
  }, [])



  return (
    <>
      <section className="w-full">
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormHeader
            headerName={props?.headerName}
            isSelected={props?.selectedData ? true : false}
            isClick={props?.isClick}
            IsSubmit={IsSubmit}
          />
          <Card className="mt-2">
            <div className="headingConainer">
              <p>{t("Master Details")}</p>
            </div>
            <div className="mt-1 grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-3 lg:grid-cols-3">
              <Field
                controller={{
                  name: "SLA_NAME",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <InputField
                        {...register("SLA_NAME", {
                          required: t("Please fill the required fields"),
                        })}
                        label="SLA Name"
                        require={true}
                        setValue={setValue}
                        invalid={errors.SLA_NAME}
                        {...field}
                      />
                    );
                  },
                }}
              />
              <Field
                controller={{
                  name: "WO_TYPE",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <Select
                        options={options?.woStatusList}
                        {...register("WO_TYPE", {
                          required: t("Please fill the required fields"),
                        })}
                        label="Work Order Type"
                        require={true}
                        optionLabel="WO_TYPE_NAME"
                        findKey={"WO_TYPE_CODE"}
                        selectedData={selectedDetails?.WO_TYPE}
                        setValue={setValue}
                        invalid={errors.WO_TYPE}
                        {...field}
                      />
                    );
                  },
                }}
              />
              <Field
                controller={{
                  name: "SEVERITY_CODE",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <Select
                        options={options?.severityList}
                        {...register("SEVERITY_CODE", {
                          required: t("Please fill the required fields"),
                        })}
                        label="Severity"
                        require={true}
                        optionLabel="SEVERITY"
                        findKey={"SEVERITY_ID"}
                        selectedData={selectedDetails?.SEVERITY_CODE}
                        setValue={setValue}
                        invalid={errors.SEVERITY_CODE}
                        {...field}
                      />
                    );
                  },
                }}
              />
              <Field
                controller={{
                  name: "STATUS_FROM",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <Select
                        options={options?.statusFrom}
                        {...register("STATUS_FROM", {
                          required: t("Please fill the required fields"),
                        })}
                        label="Status From"
                        require={true}
                        optionLabel="STATUS_DESC"
                        findKey={"STATUS_CODE"}
                        selectedData={selectedDetails?.STATUS_FROM}
                        setValue={setValue}
                        invalid={errors.STATUS_FROM}
                        {...field}
                      />
                    );
                  },
                }}
              />
              <Field
                controller={{
                  name: "STATUS_TO",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <Select
                        options={statusTo}
                        {...register("STATUS_TO", {
                          required: t("Please fill the required fields"),
                        })}
                        label="Status To"
                        require={true}
                        optionLabel="STATUS_DESC"
                        findKey={"STATUS_CODE"}
                        selectedData={selectedDetails?.STATUS_TO}
                        setValue={setValue}
                        invalid={errors.STATUS_TO}
                        {...field}
                      />
                    );
                  },
                }}
              />
              <div className="flex align-items-center">
                <>{checked}</>

                {/* <Field
                  controller={{
                    name: "ALL_ASSETTYPE",
                    control: control,
                    
                    render: ({ field }: any) => {
                     
                      return ( */}
                {/* // <Checkboxs
                        //   {...register("ALL_ASSETTYPE")}
                        //   checked={selectedDetails?.ALL_ASSETTYPE}

                        //   className="md:mt-7"
                        //   label="All Equipment Type"
                        //   setValue={setValue}
                        //   {...field}
                        // /> */}
                <Checkbox
                  // {...register("ALL_ASSETTYPE")}
                  // value={category.TASK_ID}
                  onChange={(e: any) => setChecked(e?.target?.checked)}
                  className="md:mt-7"

                  checked={checked}
                />
                <label htmlFor="Active" className="ml-2 md:mt-7 Text_Secondary Input_Label">{t("All Equipment Type")}</label>
                {/* );
                    },
                  }} */}


                {/* /> */}
              </div>
              {!checked && (
                <Field
                  controller={{
                    name: "SELECTED_ASSET_LIST",
                    control: control,
                    render: ({ field }: any) => {
                      return (
                        <MultiSelects
                          options={options?.assetTypeList}
                          {...register("SELECTED_ASSET_LIST", {
                            required: checked === false ? t("Please fill the required fields..") : "",
                          })}
                          label="Equipment Type"
                          //
                          optionLabel="ASSETTYPE_NAME"
                          setValue={setValue}
                          selectedData={assetTypeList}
                          findKey={"ASSETTYPE_ID"}
                          require={checked === false ? true : false}
                          invalid={checked === false ? errors.SELECTED_ASSET_LIST : ""}
                          {...field}
                        />
                      );
                    },
                  }}
                />
              )}
              <div className="flex align-items-center">
                <Field
                  controller={{
                    name: "ACTIVE",
                    control: control,
                    render: ({ field }: any) => {
                      return (
                        <Checkboxs
                          {...register("ACTIVE")}
                          checked={
                            props?.selectedData?.ACTIVE === true
                              ? true
                              : false
                          }
                          className={`${!checked && "md:mt-7"}`}
                          label="Active"
                          setValue={setValue}
                          {...field}
                        />
                      );
                    },
                  }}
                  error={errors?.ACTIVE?.message}
                />
              </div>
            </div>
          </Card>
          <Card className="mt-2">
            <div className="headingConainer flex justify-between">
              <p>{t("Escalation Details")}</p>
              <div>
                <Buttons
                  className="Primary_Button"
                  label={t("Add Level")}
                  icon="pi pi-plus"
                  type={"button"}
                  onClick={() => handlerAdd()}
                />
              </div>
            </div>

            <div>
              <div>
                <DataTable
                  key={fields?.length - 1}
                  value={fields}
                  showGridlines
                >
                  <Column
                    header={t("Index")}
                    body={(rowData, { rowIndex }) => {
                      return (
                        <>
                          {/* {rowIndex + 1} */}
                          <Field
                            controller={{
                              name: `ESC_DETAILS.[${rowIndex}].ESC_LEVEL`,
                              control: control,
                              render: ({ field }: any) => {
                                return (
                                  <InputField
                                    {...register(
                                      `ESC_DETAILS.${rowIndex}.ESC_LEVEL` as any
                                    )}
                                    placeholder={t("Please Enter")}
                                    require={true}
                                    disabled={true}
                                    setValue={setValue}
                                    {...field}
                                    value={`Level${rowIndex + 1}`}
                                  />
                                );
                              },
                            }}
                          />
                        </>
                      );
                    }}
                  ></Column>

                  <Column
                    field="Time"
                    header={<>{t("Time (in Minutes)")}
                      <span className="text-red-500">*</span>
                    </>}

                    className="w-60"
                    body={(rowData: any, { rowIndex }) => {
                      return (
                        <>
                          <Field
                            controller={{
                              name: `ESC_DETAILS.[${rowIndex}].TIME`,
                              control: control,
                              render: ({ field }: any) => {
                                return (
                                  <InputField
                                    {...register(
                                      `ESC_DETAILS.${rowIndex}.TIME` as any, {
                                      required: t("Please fill the required fields.."),

                                      validate: (value) => {

                                        const sanitizedValue = value?.toString()?.replace(/[^0-9]/g, "");
                                        setValue(`ESC_DETAILS.[${rowIndex}].TIME` as any, sanitizedValue);
                                        if (sanitizedValue === '') {
                                          return t('Please enter a valid number.');
                                        } else {
                                          return true;
                                        }


                                      },
                                    })}
                                    placeholder={t("Please Enter")}
                                    require={true}
                                    setValue={setValue}
                                    invalid={errors?.ESC_DETAILS?.[rowIndex]?.TIME}
                                    invalidMessage={
                                      errors?.ESC_DETAILS?.[rowIndex]?.TIME?.type === "validate" ? errors?.ESC_DETAILS?.[rowIndex]?.TIME?.message : ""
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
                  <Column
                    field="Event"
                    header={<>{t("Event")}
                      <span className="text-red-500">*</span>
                    </>}
                    body={(rowData, { rowIndex }) => {
                      return (

                        <Field
                          controller={{
                            name: `ESC_DETAILS.[${rowIndex}].EVENT` as any,
                            control: control,
                            render: ({ field }: any) => {
                              const Id: any = watchField[rowIndex]?.EVENT?.EVENT_ID
                              return (
                                <Select
                                  options={options?.eventList}
                                  {...register(`ESC_DETAILS.${rowIndex}.EVENT`, {

                                    required: t("Please fill the required fields.")

                                  })}
                                  optionLabel="EVENT_NAME"
                                  className="sm:w-full mt-1"
                                  findKey={"EVENT_ID"}
                                  selectedData={rowData?.EVENT_ID}
                                  setValue={setValue}
                                  invalid={errors?.ESC_DETAILS?.[rowIndex]?.EVENT}
                                  {...field}
                                  value={options?.eventList?.filter((f: any) => f.EVENT_ID === Id)[0]}
                                />
                              );
                            }
                          }}
                        />
                      );
                    }}
                  ></Column>


                  <Column
                    field="Action"
                    header={t("Action")}
                    className="w-60"
                    body={(rowData, { rowIndex }) => {
                      if (rowIndex === fields.length - 1) {
                        // Only render buttons for the last row
                        return (
                          <>
                            <div className="flex flex-wrap">
                              <Link
                                to={`${appName}/eventmasterlist?add=`}
                                state={{
                                  EVENT_TYPE: "E",
                                  OBJ_ID: search === '?edit=' ? selectedDetails?.OBJ_ID : 0,
                                  watchField: watchAll,
                                  ALL_ASSETTYPE: checked
                                }}
                              >
                                <p
                                  style={{
                                    padding: "4px 8px",
                                    background: "#eff1f2",
                                    borderRadius: "6px",
                                  }}
                                >
                                  Add Event
                                </p>
                              </Link>
                              <Button
                                type="button"
                                label=""
                                icon="pi pi-trash"
                                className="deleteButton ml-2"
                                onClick={() => remove(rowIndex)}
                              />
                            </div>
                          </>
                        );
                      } else {
                        return null;
                      }
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

export default EscalationMatrixForm;

