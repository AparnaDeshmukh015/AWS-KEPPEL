import React, { useCallback, useEffect, useState } from "react";
import InputField from "../../../components/Input/Input";
import Buttons from "../../../components/Button/Button";
import { Card } from "primereact/card";
import { useForm } from "react-hook-form";
import Field from "../../../components/Field";
import Radio from "../../../components/Radio/Radio";
import Select from "../../../components/Dropdown/Dropdown";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { useTranslation } from "react-i18next";
import { callPostAPI } from "../../../services/apis";
import { ENDPOINTS } from "../../../utils/APIEndpoints";
import { toast } from "react-toastify";
import DateCalendar from "../../../components/Calendar/Calendar";
import Checkboxs from "../../../components/Checkbox/Checkbox";
import moment from "moment";
import { eventNotification, helperEventNotification } from "../../../utils/eventNotificationParameter";
import { useLocation, useOutletContext } from "react-router-dom";
import { dateFormat, saveTracker } from "../../../utils/constants";
import { decryptData } from "../../../utils/encryption_decryption";

type FormValues = {
  MATREQTYPE: string;
  ISSUE_DATE: string;
  MATREQ_RAISEDBY: string;
  WO_NO: string | null;
  ASSET_NAME: string;
  MATREQ_DATE: string;
  MATREQ_ID: string;
  WO_ID: string | null;
  REMARKS: string;
  STORE_ID: string;
  PART_LIST: {
    PART_CODE: string;
    PART_NAME: string;
    UOM_NAME: string;
    ISSUED_QTY: string;
    QTY: string;
    STOCK: string;
    UOM_CODE: string;
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

const IssueMaterialForm = (props: any) => {
  const { search } = useLocation();
  const { t } = useTranslation();
  const [options, setOptions] = useState<any | null>([]);
  const [selectedDetails, setSelectedDetails] = useState<any>([]);
  const [materialNo, setMaterialNO] = useState<[] | null>([]);
  const [disableFields] = useState<boolean>(true);
  const assestTypeLabel: any = [
    { name: "Self", key: "S" },
    { name: "Against Work Order", key: "A" },
  ];
  const [IsSubmit, setIsSubmit] = useState<any | null>(false);
  let { pathname } = useLocation();
  const [, menuList]: any = useOutletContext();
  const getId: any = localStorage.getItem("Id")
  const dataId = JSON.parse(getId)

  const currentMenu = menuList
    ?.flatMap((menu: any) => menu?.DETAIL)
    .filter((detail: any) => detail.URL === pathname)[0];
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
      MATREQTYPE: "",
      ISSUE_DATE: "",
      MATREQ_RAISEDBY: "",
      WO_NO: "",
      ASSET_NAME: "",
      MATREQ_DATE: "",
      MATREQ_ID: "",
      STORE_ID: "",
      REMARKS: "",
      PART_LIST: [],

    },
    mode: "all",
  });
  const User_Name = decryptData((localStorage.getItem("USER_NAME")))
  const storeWatch: any = watch("STORE_ID");

  const materialWatch: any = watch("MATREQ_ID");
  const PART_LIST: any = watch("PART_LIST");
  const _ISSUE_TYPE: any = watch("MATREQTYPE");

  const getpartlist = async () => {
    const l = options?.materialList?.filter(
      (f: any) => f.STORE_ID === storeWatch?.STORE_ID
    );
    setMaterialNO(l);
  };


  const getOptions = async () => {
    try {
      const payload = {
        WO_ID: search === '?add=' ? 0 : dataId?.WO_ID,
        MATREQ_ID: search === '?add=' ? 0 : dataId?.MATREQ_ID,
        MODE: search === '?add=' ? "A" : "E"
      }
      const res = await callPostAPI(ENDPOINTS.GET_INVENTORY_MASTER_OPTIONS, payload);
      if (res?.FLAG === 1) {
        setOptions({
          woList: res?.WOLIST,
          storeList: res?.STORELIST,
          materialList: res?.MRREQLIST,
        });
        if (search === '?edit=') {
          await getOptionDetails();
        }
      }
    } catch (error: any) {
      toast.error(error);
    }
  };

  const getOptionDetails = async () => {
    const payload: any = {
      MATREQ_ID: search === "?edit=" ? dataId?.MATREQ_ID : selectedDetails?.MATREQ_ID,
      MATREQ_NO: search === "?edit=" ? dataId?.MATREQ_NO : selectedDetails?.MATREQ_NO,
    };

    if (payload.MATREQ_ID !== "") {
      const res = await callPostAPI(
        ENDPOINTS.GET_MATERIAL_REQUISITION_DETAILS,
        payload
      );
      if (res.FLAG === 1) {
        setSelectedDetails(res?.MATREQUISITIONDETAILS[0]);
        setValue("MATREQTYPE", res?.MATREQUISITIONDETAILS[0]?.SELF_WO);

        const matReqDate: any = new Date(
          res?.MATREQUISITIONDETAILS[0].MATREQ_DATE
        );
        setValue("MATREQ_DATE", matReqDate);
        setValue("MATREQ_RAISEDBY", res?.MATREQUISITIONDETAILS[0]?.USER_NAME);
        setValue("ASSET_NAME", res?.MATREQUISITIONDETAILS[0]?.ASSET_NAME);
        setValue("REMARKS", res?.MATREQUISITIONDETAILS[0]?.REMARKS);
        setValue("WO_NO", res?.MATREQUISITIONDETAILS[0]?.WO_NO);
        setValue("PART_LIST", res?.PARTLIST);

      }
    }
  };



  const onSubmit = useCallback(async (payload: any, e: any) => {
    if (IsSubmit) return true
    setIsSubmit(true)
    try {
      localStorage.removeItem("STORE_ID")
      localStorage.removeItem("MATREQ_NO")
      localStorage.removeItem("MATREQ_ID")
      const buttonMode: any = e?.nativeEvent?.submitter?.name;

      payload.MODE =
        buttonMode === "CANCEL" ? "C" : props?.selectedData ? "E" : "A";
      payload.CNC_IND = buttonMode === "CANCEL" ? 1 : 0;

      payload.ISSUE_DATE = payload.ISSUE_DATE = payload.ISSUE_DATE
        ? moment(payload.ISSUE_DATE).format(dateFormat())
        : "";
      payload.MATREQ_DATE = payload.MATREQ_DATE
        ? moment(payload.MATREQ_DATE).format(dateFormat())
        : "";
      payload.STORE_ID = payload?.STORE_ID?.STORE_ID;
      payload.MATREQ_ID = materialWatch?.MATREQ_ID;
      payload.RAISED_BY = selectedDetails?.MATREQ_RAISEDBY;
      payload.MATREQTYPE = selectedDetails?.SELF_WO;

      payload.DOC_ID =
        payload.MODE === "C" ? props?.selectedData?.DOC_ID ?? "" : "0";
      payload.REMARKS = payload.REMARKS !== undefined ? payload.REMARKS : "";
      payload.WO_ID = selectedDetails?.WO_ID;
      // payload.PART_LIST = PART_LIST;

      const partList: any = PART_LIST?.map((part: any) => {
        if (part?.PART_ID !== "") {

          return {
            CLOSE_IND: part?.CLOSE_IND === undefined ? false : true,
            ISSUED_QTY: part?.ISSUED_QTY,
            ITEM_NO: part?.ITEM_NO,
            PART_CODE: part?.PART_CODE,
            PART_ID: part?.PART_ID,
            PART_NAME: part?.PART_NAME,
            QTY: part?.QTY,
            STOCK: part?.STOCK,
            UOM_CODE: part?.UOM_CODE,
          };
        }
      });
      payload.PART_LIST = partList;

      const res = await callPostAPI(ENDPOINTS.SAVEISSUEMATERIAL, payload);
      if (res?.FLAG === true) {
        toast?.success(res?.MSG);
        const notifcation: any = {
          FUNCTION_CODE: props?.functionCode,
          EVENT_TYPE: "I",
          STATUS_CODE: props?.selectedData ? 2 : 1,
          PARA1: search === "?edit=" ? User_Name : User_Name,
          PARA2: storeWatch?.STORE_NAME,
          PARA3: "issue_no",
          PARA4: payload?.ISSUE_DATE,
          PARA5: materialWatch?.MATREQ_NO,
          PARA6: "part_code",
          PARA7: "part_name",
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
      setIsSubmit(false)
      toast.error(error);
    } finally {
      setIsSubmit(false)
    }
  }, [IsSubmit, PART_LIST, materialWatch, selectedDetails, props.selectedData, props.functionCode, props.getAPI, props.isClick, callPostAPI, toast, helperEventNotification, dateFormat, search, User_Name,]);

  const checkValidateQty = (e: any, rowData: any, rowIndex: number) => {

    const pending_Qty =
      PART_LIST[rowIndex]?.QTY - PART_LIST[rowIndex]?.ISSUED_QTY;
    PART_LIST[rowIndex].PENDING_QTY = pending_Qty;

  };

  useEffect(() => {
    (async function () {
      await  getOptionDetails();
     })();
    
  }, [materialWatch.MATREQ_ID]);

  useEffect(() => {
    if (storeWatch !== null) {
      (async function () {
        await  getpartlist();
       })();
    }
  }, [storeWatch]);

  useEffect(() => {
    const issueDate: any = new Date();
    setValue("ISSUE_DATE", issueDate);
    (async function () {
      await  getOptions();
      await saveTracker(currentMenu)
     })();
    //getOptions();
  }, []);



  useEffect(() => {
    if (storeWatch !== "" || storeWatch !== undefined) {
      resetField("REMARKS");
      resetField("PART_LIST");
      resetField("MATREQ_DATE");
      resetField("ASSET_NAME");
      resetField("MATREQ_RAISEDBY");
      resetField("WO_NO");
      resetField("MATREQTYPE");
    }
  }, [storeWatch]);

  useEffect(() => {
    let STORE_ID: any = localStorage.getItem("STORE_ID")
    let MATREQ_ID: any = localStorage.getItem("MATREQ_ID")
    setSelectedDetails({
      STORE_ID: parseInt(STORE_ID),
      MATREQ_ID: parseInt(MATREQ_ID)
    });

  }, [localStorage.getItem("STORE_ID")])

  useEffect(() => {
    if (!isSubmitting && Object?.values(errors)[0]?.type === "required") {
      const check: any = Object?.values(errors)[0]?.message;
      toast?.error(t(check));
    }
  }, [isSubmitting]);

  useEffect(() => {
    (async function () {
     
      await saveTracker(currentMenu)
     })();
  }, [])

  return (
    <>
      <section className="w-full">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-wrap justify-between mt-1">
            <div>
              <h6 className="Text_Primary">
                {search === "?edit=" ? "Cancel" : "Add"} {props?.headerName}-
                {search === "?edit=" ? dataId?.DOC_NO : ""}
              </h6>
            </div>

            <div className="flex flex-wrap">
              {search === "?add=" ? (
                <Buttons
                  type="submit"
                  className="Primary_Button  w-20 me-2"
                  label={"Save"}
                  IsSubmit={IsSubmit}
                />
              ) : (
                <>
                  {dataId?.CNCL_IND === false && (
                    <>
                      <Buttons
                        type="submit"
                        className="Primary_Button  w-20 me-2"
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
                  name: "ISSUE_DATE",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <DateCalendar
                        {...register("ISSUE_DATE", {
                          required: "Please fill the required fields",
                        })}
                        label="Issue Date"
                        setValue={setValue}
                        disabled={disableFields}
                        require={true}
                        invalid={errors.ISSUE_DATE}
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
                          required: t("Please fill the required fields."),
                        })}
                        label="Store Name"
                        require={true}
                        findKey={"STORE_ID"}
                        optionLabel="STORE_NAME"
                        selectedData={selectedDetails?.STORE_ID}
                        disabled={search === "?edit=" ? true : false}
                        setValue={setValue}
                        //onChange={getpartlist}
                        invalid={errors.STORE_ID}
                        {...field}
                      />
                    );
                  },
                }}
              />
              <Field
                controller={{
                  name: "MATREQ_ID",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <Select
                        options={materialNo}
                        {...register("MATREQ_ID", {
                        })}
                        label="MR No"
                        findKey={"MATREQ_ID"}
                        optionLabel="MATREQ_NO"
                        selectedData={selectedDetails?.MATREQ_ID}
                        disabled={props.selectedData ? true : false}
                        setValue={setValue}
                        invalid={errors.MATREQ_ID}
                        {...field}
                      />
                    );
                  },
                }}
              />

              <Field
                controller={{
                  name: "MATREQ_DATE",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <DateCalendar
                        {...register("MATREQ_DATE", {
                          required: "Please fill the required fields",
                        })}
                        label="MR Date"
                        setValue={setValue}
                        disabled={disableFields}
                        showIcon
                        {...field}
                      />
                    );
                  },
                }}
              />
              <Field
                controller={{
                  name: "MATREQTYPE",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <>
                        <Radio
                          {...register("MATREQTYPE", {
                            required: "Please fill the required fields",
                          })}
                          labelHead="Type"
                          options={assestTypeLabel}
                          selectedData={selectedDetails?.SELF_WO || "S"}
                          disabled={
                            materialWatch !== "" || materialWatch !== undefined
                              ? true
                              : false
                          }
                          setValue={setValue}
                          {...field}
                        />
                      </>
                    );
                  },
                }}
              />

              {(_ISSUE_TYPE?.key === "A" ||
                selectedDetails?.SELF_WO === "A") && (
                  <div>
                    <Field
                      controller={{
                        name: "MATREQ_RAISEDBY",
                        control: control,
                        render: ({ field }: any) => {
                          return (
                            <InputField
                              {...register("MATREQ_RAISEDBY", {
                                required: "Please fill the required fields.",
                              })}
                              label="Raised By"
                              setValue={setValue}
                              disabled={disableFields}
                              {...field}
                            />
                          );
                        },
                      }}
                    />
                  </div>
                )}
              {(_ISSUE_TYPE?.key === "A" ||
                selectedDetails?.SELF_WO === "A") && (
                  <div>
                    <Field
                      controller={{
                        name: "WO_NO",
                        control: control,
                        render: ({ field }: any) => {
                          return (
                            <InputField
                              {...register("WO_NO", {
                                required: t("Please fill the required fields."),
                              })}
                              label="Work Order No"
                              setValue={setValue}
                              disabled={disableFields}
                              {...field}
                            />
                          );
                        },
                      }}
                    />
                  </div>
                )}
              {(_ISSUE_TYPE?.key === "A" ||
                selectedDetails?.SELF_WO === "A") && (
                  <div>
                    <Field
                      controller={{
                        name: "ASSET_NAME",
                        control: control,
                        render: ({ field }: any) => {
                          return (
                            <InputField
                              {...register("ASSET_NAME", {
                                required: t("Please fill the required fields."),
                              })}
                              label="Equipment Name"
                              setValue={setValue}
                              disabled={disableFields}
                              {...field}
                            />
                          );
                        },
                      }}
                    />
                  </div>
                )}
              <Field
                controller={{
                  name: "REMARKS",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <InputField
                        {...register("REMARKS", {})}
                        label="Remarks"
                        disabled={props.selectedData ? true : false}
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
                <DataTable value={PART_LIST} showGridlines>
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
                    field="STOCK"
                    header={t("Stock Available")}
                    className="w-40"
                  ></Column>
                  <Column
                    field="QTY"
                    header={t("Requested Quantity")}
                    className="w-40"
                  ></Column>
                  <Column
                    field="PENDING_QTY"
                    header={t("Pending Quantity")}
                    className="w-40"
                    body={(rowData: any) => {
                      return (
                        <>
                          <p>{rowData?.PENDING_QTY}</p>
                        </>
                      );
                    }}
                  ></Column>
                  <Column
                    field="ISSUED_QTY"
                    header={t("Issue Quantity")}
                    className="w-40"
                    body={(rowData, { rowIndex }) => {
                      return (
                        <>
                          <Field
                            controller={{
                              name: `PART_LIST[${rowIndex}].ISSUED_QTY`,
                              control: control,
                              render: ({ field }: any) => {
                                return (
                                  <InputField
                                    {...register(
                                      `PART_LIST[${rowIndex}].ISSUED_QTY` as any,
                                      {
                                        onChange: (e: any) => {
                                          checkValidateQty(
                                            e,
                                            rowData,
                                            rowIndex
                                          );
                                        },
                                        validate: (value) =>
                                          parseInt(value, 10) <=
                                          parseInt(rowData.QTY, 10) ||
                                          "Should be less than Requested Quantity",
                                      }
                                    )}
                                    setValue={setValue}
                                    disabled={search === "?edit="? true : false}
                                    invalid={
                                      errors?.PART_LIST?.[rowIndex]?.ISSUED_QTY
                                        ? true
                                        : false
                                    }
                                    invalidMessage={
                                      errors?.PART_LIST?.[rowIndex]?.ISSUED_QTY
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
                  <Column
                    field="CLOSE_IND"
                    header={t("Close")}
                    className="w-40"
                    body={(rowData: any, { rowIndex }) => {
                      return (
                        <>
                          <Field
                            controller={{
                              name: `PART_LIST[${rowIndex}].CLOSE_IND`,
                              control: control,
                              render: ({ field }: any) => {
                                return (
                                  <Checkboxs
                                    {...register(
                                      `PART_LIST[${rowIndex}].CLOSE_IND` as any
                                    )}
                                    setValue={setValue}
                                    disabled={search === "?edit=" ? true : false}
                                    label=""
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

export default IssueMaterialForm;
