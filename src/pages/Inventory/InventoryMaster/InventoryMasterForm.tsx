import React, { useCallback, useState } from "react";
import Select from "../../../components/Dropdown/Dropdown";
import InputField from "../../../components/Input/Input";
import Buttons from "../../../components/Button/Button";
import { Card } from "primereact/card";
import { toast } from "react-toastify";
import { useEffect } from "react";
import { SubmitErrorHandler, useFieldArray, useForm } from "react-hook-form";
import Field from "../../../components/Field";
import { callPostAPI } from "../../../services/apis";
import { ENDPOINTS } from "../../../utils/APIEndpoints";
import { useTranslation } from "react-i18next";
import { useLocation, useOutletContext } from "react-router-dom";
import DateCalendar from "../../../components/Calendar/Calendar";
import moment from "moment";
import PartDetailsDialogBox from "../../../components/DialogBox/PartDetailsDialogBox";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import {
  eventNotification,
  helperEventNotification,
} from "../../../utils/eventNotificationParameter";
import { saveTracker } from "../../../utils/constants";
import { decryptData } from "../../../utils/encryption_decryption";
interface Part {
  PART_ID?: string;
  PART_CODE?: string;
  PART_NAME?: string;
  UOM_NAME?: string;
  QTY?: string;
  STOCK?: string;
  RATE?: string;
  UOM_ID?: string;
}

interface FormValues {
  MODE: string;
  PARA: { para1: string; para2: string };
  STORE: string;
  PART_ID: string;
  BILL_NO: string;
  DOC_DATE: string;
  BILL_DATE: string;
  REMARKS: string;
  ACTIVE: number;
  VENDOR: string;
  PART_LIST: Part[];
}

type FormErrors = {
  PART_LIST?: {
    [key: number]: {
      QTY?: {
        type: string;
        message: string;
      };

      RATE?: {
        type: string;
        message: string;
      };
    };
  };
};

const InventoryMasterForm = (props: any) => {
  const [selectedParts, setSelectedParts] = useState<any | null>([]);
  const [IsSubmit, setIsSubmit] = useState<any | null>(false);

  const { t } = useTranslation();
  let { pathname } = useLocation();
  const [, menuList]: any = useOutletContext();
  const currentMenu = menuList
    ?.flatMap((menu: any) => menu?.DETAIL)
    .filter((detail: any) => detail.URL === pathname)[0];
  let [storeOptions, setStoreOptions] = useState([]);
  let [vendorOptions, setVendorOptions] = useState([]);
  let [partOptions, setPartOptions] = useState([]);
  const { search } = useLocation();
  const getId: any = localStorage.getItem("Id");
  const dataId = JSON.parse(getId);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues, FormErrors>({
    defaultValues: {
      MODE: props?.selectedData || search === "?edit=" ? "E" : "A",
      PARA:
        props?.selectedData || search === "?edit="
          ? { para1: `${props?.headerName}`, para2: "Updated" }
          : { para1: `${props?.headerName}`, para2: "Added" },
      STORE:
        props?.selectedData === null
          ? dataId?.STORE_NAME
          : props?.selectedData?.STORE_NAME ?? "",
      PART_ID: "1",
      BILL_NO: props?.selectedData
        ? props?.selectedData?.BILL_NO
        : search === "?edit="
          ? dataId?.BILL_NO
          : "",
      DOC_DATE: "",
      BILL_DATE: "",
      REMARKS: "TEST",
      ACTIVE: 1, //props?.selectedData?.ACTIVE !== undefined ? props.selectedData.ACTIVE : true,
      VENDOR: props?.selectedData
        ? props?.selectedData?.VENDOR_NAME
        : search === "?edit="
          ? dataId?.VENDOR_NAME
          : "",
      PART_LIST: [],
    },
    mode: "all"
  })

  const { fields, remove} = useFieldArray({
    name: "PART_LIST",
    control,
  });

  function getSelec(data: any) {
    setSelectedParts(data);
  }
  const PART_LIST: any = watch("PART_LIST");
  const watchStoreId: any = watch("STORE");
  const GNR_dateWatch: any = watch("DOC_DATE");

  const gnr_date: any = moment(GNR_dateWatch).format("DD-MM-YYYY")

  const User_Name = decryptData((localStorage.getItem("USER_NAME")))

  const onSubmit = useCallback(async (payload: any) => {
    if (IsSubmit) return true
    setIsSubmit(true)
    try {
      const partList: any = PART_LIST?.map((part: any) => {
        return {
          PART_ID: part?.PART_ID,
          PART_CODE: part?.PART_CODE,
          PART_NAME: part?.PART_NAME,
          UOM_NAME: part?.UOM_NAME,
          QTY: part?.QTY,
          STOCK: part?.STOCK,
          RATE: part?.RATE,
          UOM_ID: part?.UOM_ID,
        };
      });

      const isAnyQTYUndefined = partList.some(
        (item: any) => item.QTY === undefined
      );


      payload.DOC_DATE = payload.DOC_DATE = payload.DOC_DATE
        ? moment(payload.DOC_DATE).format("DD-MM-YYYY")
        : "";
      payload.BILL_DATE = payload.BILL_DATE = payload.BILL_DATE
        ? moment(payload.BILL_DATE).format("DD-MM-YYYY")
        : "";
      payload.STORE_ID = payload?.STORE?.STORE_ID;
      // delete payload?.STORE;
      payload.VENDOR_ID = payload?.VENDOR?.VENDOR_ID;
      payload.PART_LIST = partList ;
      delete payload?.VENDOR;
      if (fields?.length > 0) {
        if (isAnyQTYUndefined === false) {
          const res = await callPostAPI(
            ENDPOINTS.SAVEADDINVENTORYMASTER,
            payload
          );
          if (res?.FLAG === true) {
            toast?.success(res?.MSG);
            const notifcation: any = {
              "FUNCTION_CODE": currentMenu?.FUNCTION_CODE,
              "EVENT_TYPE": "I",
              "STATUS_CODE": search === "?edit=" ? 2 : 1,
              "PARA1": search === "?edit=" ? User_Name : User_Name,
              "PARA2": 'req_for_type',
              "PARA3": 'req_no',
              "PARA4": watchStoreId?.STORE_NAME,
              "PARA5": payload?.DOC_DATE,
              "PARA6": User_Name,
              "PARA7": 'wo_no',
              "PARA8": 'asset_name',
            };

            const eventPayload = { ...eventNotification, ...notifcation };
            await helperEventNotification(eventPayload);
            props?.getAPI();

            props?.isClick();
            setIsSubmit(false)
          } else {
            setIsSubmit(false)
            toast?.error(res?.MSG);
          }
        } else {

          toast.error("Please fill quantity");
          setIsSubmit(false)
        }
      } else {
        toast.error("Please select at least one part list");
        setIsSubmit(false)
      }
    } catch (error: any) {
      toast.error(error);
    } finally {
      setIsSubmit(false)
    }
  }, [IsSubmit, PART_LIST, fields, toast, callPostAPI, currentMenu, search, helperEventNotification, props]);

  const handleCancel = async (e: any) => {
    e.preventDefault();
    const payload: any = {
      DOC_NO: props?.selectedData?.DOC_NO,
      CNC_IND: 1,
      DOC_ID: props?.selectedData?.DOC_ID,


    };

    const res = await callPostAPI(ENDPOINTS.CANCEL_INVENTORY, payload);
    if (res?.FLAG === true) {
      toast?.success("Inventory Cancelled" + res?.MSG);
      const notifcation: any = {
        "FUNCTION_CODE": currentMenu?.FUNCTION_CODE,
        "EVENT_TYPE": "I",
        "STATUS_CODE": 8,
        "PARA1": User_Name,
        "PARA2": 'req_for_type',
        "PARA3": 'req_no',
        "PARA4": watchStoreId?.STORE_NAME,
        "PARA5": gnr_date,
        "PARA6": User_Name,
        "PARA7": 'wo_no',
        "PARA8": 'asset_name',
      };
      const eventPayload = { ...eventNotification, ...notifcation };
      await helperEventNotification(eventPayload);
      props?.getAPI();
      props?.isClick();
    } else {
      toast?.error(res?.MSG);
    }
  };

  const getpartlist = async () => {
    // setValue("PART_LIST", []);
    const payload = {
      STORE_ID: 0,
      FUNCTION_CODE: currentMenu?.FUNCTION_CODE
    };
    const res = await callPostAPI(
      ENDPOINTS.GETINVENTORYMASTERPARTLIST,
      payload,
      currentMenu?.FUNCTION_CODE
    );
    setPartOptions(res?.STORELIST);
    // setSelectedParts(res?.STORELIST);
  };

  const getinventorypartdetails = async () => {
    const payload = {
      DOC_NO: search === "?edit=" ? dataId?.DOC_NO : props?.selectedData?.DOC_NO,
      DOC_ID: search === "?edit=" ? dataId?.DOC_ID : props?.selectedData?.DOC_ID,
    };

    const res = await callPostAPI(
      ENDPOINTS.GETADDINVENTORYMASTERSDETAILS,
      payload,
      currentMenu?.FUNCTION_CODE
    );

    setPartOptions(res?.PARTLIST);
    const billDate: any = new Date(res?.INVENTORYDETAILS[0]?.BILL_DATE);
    setValue("BILL_DATE", billDate);
    const grnDate: any = new Date(res?.INVENTORYDETAILS[0]?.DOC_DATE);
    setValue("DOC_DATE", grnDate);
    setValue("PART_LIST", res?.PARTLIST);
  };

  const setStore = async () => {
    const payload = {
      FORM_TYPE: "FORM",
    };
    const res = await callPostAPI(
      ENDPOINTS.GETINVENTORYMASTERLIST,
      payload,
      currentMenu?.FUNCTION_CODE
    );

    setStoreOptions(res?.STORELIST);
    setVendorOptions(res?.VENDORLIST);

    if (props?.selectedData !== undefined) {
      await getinventorypartdetails();
    }
  };

  const saveFuc = () => {
    if (PART_LIST?.length < selectedParts?.length) {
      if (PART_LIST?.length === 0) {
        setValue("PART_LIST", selectedParts);
      } else {
        const partListData: any = []
        const selectedPart: any = selectedParts.map((part: any) => part.PART_ID)
        const filteredPartList = PART_LIST.filter((part: any) => selectedPart.includes(part?.PART_ID));
        filteredPartList?.forEach((filtePart: any) => {
          partListData.push(filtePart)
        })
        const partData: any = PART_LIST.map((part: any) => part.PART_ID)
        const filteredParts = selectedParts.filter((part: any) => !partData.includes(part.PART_ID));

        filteredParts?.forEach((part: any) => {
          partListData.push(part)
        })

        setValue("PART_LIST", partListData);
      }
    } else {
      const selectedPartIds = new Set(selectedParts.map((part: any) => part.PART_ID));
      const matchingParts = PART_LIST.filter((part: any) => selectedPartIds.has(part.PART_ID));
      setValue("PART_LIST", matchingParts);
    }
  };

  const onError: SubmitErrorHandler<FormValues> = (errors:any, e) => {
   toast.error(errors)
  };

  useEffect(() => {
    (async function () { await setStore();
    const billDate: any = new Date();
    setValue("BILL_DATE", billDate);
    const grnDate: any = new Date();
    setValue("DOC_DATE", grnDate);
    })()
    // setVendor()
  }, []);

  useEffect(() => {
    const nestedErrors: any = errors?.PART_LIST || {};
    const firstError: any = Object?.values(nestedErrors)[0];
    if ((!isSubmitting && Object?.values(errors)[0]?.type === "required") || (!isSubmitting && Object?.values(errors)[0]?.type === "validate")) {
      const check: any = Object?.values(errors)[0]?.message;
      toast?.error(t(check));
    } else if (!isSubmitting && (firstError?.QTY?.type === "required" || firstError?.QTY?.type === "validate" || firstError?.RATE?.type === "required" || firstError?.RATE?.type === "validate")) {
      const check: any = firstError?.QTY?.message || firstError?.RATE?.message;
      toast?.error(t(check));
    }
  }, [isSubmitting]);

  useEffect(() => {   
     (async function () {
      await saveTracker(currentMenu)
      await getpartlist();
     })();
  }, []);


  const handlerShow = (index: any, rowData: any) => {
    remove(index);
    const data: any = selectedParts?.filter((f: any) => f?.PART_ID !== rowData?.PART_ID)
    setSelectedParts(data);

  };

  return (
    <section className="w-full">
      <form onSubmit={handleSubmit(onSubmit, onError)}>
        <div className="flex flex-wrap justify-between mt-1">
          <div>
            <h6 className="Text_Primary">
              {t(`${search === "?edit=" ? "Cancel" : "Add"}`)} {t(`${props?.headerName}`)}-
              {props?.selectedData ? props?.selectedData?.DOC_NO : ""}
            </h6>
          </div>

          <div className="flex">
            {search === '?add=' ? (
              <Buttons
                type="submit"
                className="Primary_Button  w-20 me-2"
                disabled={IsSubmit}
                label={"Save"}
              />
            ) : (
              <>
                {dataId?.CNCL_IND === false && (
                  <>
                    <Buttons
                      type="submit"
                      className="Primary_Button me-2"
                      label={"Cancel"}
                      onClick={async(e: any) => {
                        await handleCancel(e);
                      }}
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
          <div className="mt-1 grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-3 lg:grid-cols-3">
            <Field
              controller={{
                name: "DOC_DATE",
                control: control,
                render: ({ field }: any) => {
                  return (
                    <DateCalendar
                      {...register("DOC_DATE", {
                        required: "Please fill the required fields",
                      })}
                      label="GRN date"
                      setValue={setValue}
                      disabled={search === '?edit=' ? true : false}
                      require={true}
                      invalid={errors.DOC_DATE}
                      showIcon
                      {...field}
                    />
                  );
                },
              }}
            />
            <Field
              controller={{
                name: "STORE",
                control: control,
                render: ({ field }: any) => {
                  return (
                    <Select
                      options={storeOptions}
                      {...register("STORE", {
                        required: t("Please fill the required fields."),
                      })}
                      label="Store Name"
                      require={true}
                      findKey={"STORE_ID"}
                      optionLabel="STORE_NAME"
                      selectedData={search === "?edit=" ? dataId?.STORE_ID : props?.selectedData?.STORE_ID}
                      setValue={setValue}
                      disabled={search === '?edit=' ? true : false}
                      invalid={errors.STORE}
                      {...field}
                    />
                  );
                },
              }}
            />
            <Field
              controller={{
                name: "VENDOR",
                control: control,
                render: ({ field }: any) => {
                  return (
                    <Select
                      options={vendorOptions}
                      {...register("VENDOR", {
                        required: t("Please fill the required fields."),
                      })}
                      label="Vendor"
                      require={true}
                      findKey={"VENDOR_ID"}
                      optionLabel="VENDOR_NAME"
                      selectedData={search === "?edit=" ? dataId?.VENDOR_ID : props?.selectedData?.VENDOR_ID}
                      setValue={setValue}
                      disabled={search === '?edit=' ? true : false}
                      invalid={errors.VENDOR}
                      {...field}
                    />
                  );
                },
              }}
            />
            <Field
              controller={{
                name: "BILL_NO",
                control: control,
                render: ({ field }: any) => {
                  return (
                    <InputField
                      {...register("BILL_NO", {
                        required: t("Please fill the required fields."),
                        validate: value => value.trim() !== "" || t("Please fill the required fields.")

                      })}
                      label="Bill No"
                      require={true}
                      placeholder={t("Please_Enter")}
                      invalid={errors.BILL_NO}
                      disabled={search === '?edit=' ? true : false}
                      {...field}
                    />
                  );
                },
              }}
            />
            <Field
              controller={{
                name: "BILL_DATE",
                control: control,
                render: ({ field }: any) => {
                  return (
                    <DateCalendar
                      {...register("BILL_DATE", {
                        required: t("Please fill the required fields."),
                      })}
                      label="Bill Date"
                      setValue={setValue}
                      require={true}
                      invalid={errors.BILL_DATE}
                      disabled={search === '?edit=' ? true : false}
                      showIcon
                      {...field}
                    />
                  );
                },
              }}
            />
          </div>
        </Card>
        <Card className="mt-2">
          <div className="headingConainer flex justify-between">
            <p>{t("Part Details")}</p>
            {search === '?add=' && (
              <div>
                <PartDetailsDialogBox
                  getpartlist={getpartlist}
                  partList={partOptions}
                  saveFuc={saveFuc}
                  getSelec={getSelec}
                  selectedParts={selectedParts}
                  setSelectedParts={setSelectedParts}
                />
              </div>
            )}
          </div>

          <DataTable value={fields}
            key={fields?.length - 1}
            showGridlines>
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
              header={t("Current Stock")}
              className="w-40"
            ></Column>
            <Column
              field="REQ_QTY"
              header={<>{t("Quantity")}
                <span className="text-red-500"> *</span>
              </>}
              className="w-40"
              body={(rowData, { rowIndex }) => {
                return (
                  <>
                    <Field
                      controller={{
                        name: `PART_LIST.[${rowIndex}].QTY`,
                        control: control,
                        render: ({ field }: any) => {

                          return (
                            <InputField
                              {...register(
                                `PART_LIST.[${rowIndex}].QTY` as any,
                                {
                                  required: "Please fill the Required fields",
                                  validate: (value) => {
                                    if (parseInt(value, 10) < 0 || parseInt(value, 10) === 0) {
                                      return (t("Should be greater than 0"));
                                    } else if (parseInt(value, 10) === 0) {
                                      return (t("Please enter the number"))
                                    } else {
                                      const sanitizedValue = value?.toString()?.replace(/[^0-9]/g, "");
                                      setValue(`PART_LIST.[${rowIndex}].QTY` as any, sanitizedValue);
                                      return true;

                                    }
                                  },
                                }
                              )}
                              errors
                              require={true}
                              disabled={search === "?edit=" ? true : false}
                              setValue={setValue}
                              invalid={errors?.PART_LIST?.[rowIndex]?.QTY}
                              invalidMessage={
                                errors?.PART_LIST?.[rowIndex]?.QTY?.type === "validate" ? errors?.PART_LIST?.[rowIndex]?.QTY?.message : ""
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
              field="RATE"
              header={<>{t("Rate")}
                <span className="text-red-500"> *</span>
              </>}
              className="w-40"
              body={(rowData, { rowIndex }) => {
                return (
                  <>
                    <Field
                      controller={{
                        name: `PART_LIST.[${rowIndex}].RATE`,
                        control: control,
                        render: ({ field }: any) => {
                          return (
                            <InputField
                              {...register(
                                `PART_LIST.[${rowIndex}].RATE` as any,
                                {
                                  required: "Please fill the Required fields",
                                  validate: (value) => {
                                    if (parseFloat(value) < 0 || parseFloat(value) === 0) {
                                      return (t("Should be greater than 0"));
                                      // } else if (parseInt(value, 10) === 0) {
                                      //   return (t("Please enter the number"))
                                    } else {
                                      const sanitizedValue = value?.toString()?.replace(/[^0-9.]/g, "");
                                      setValue(`PART_LIST.[${rowIndex}].RATE` as any, sanitizedValue);
                                      return true;
                                    }
                                  },
                                }
                              )}
                              errors
                              disabled={search === "?edit=" ? true : false}
                              setValue={setValue}
                              require={true}
                              invalid={errors?.PART_LIST?.[rowIndex]?.RATE}
                              invalidMessage={
                                errors?.PART_LIST?.[rowIndex]?.RATE?.type === 'validate' ? errors?.PART_LIST?.[rowIndex]?.RATE?.message : ""
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
              field="UOM_NAME"
              header={t("UOM")}
              className="w-40"
            ></Column>
            {props?.selectedData === undefined && (
              <Column
                field="Action"
                header={t("Action")}
                className="w-40"
                body={(rowData: any, { rowIndex }) => {
                  return (
                    <>
                      <Buttons
                        type="button"
                        label=""
                        icon="pi pi-trash"
                        className="deleteButton"
                        onClick={() => {
                          handlerShow(rowIndex, rowData);
                        }}
                      />
                    </>
                  );
                }}
              ></Column>
            )}
          </DataTable>
        </Card>
      </form>
    </section>
  );
};

export default InventoryMasterForm;
