import React, { useCallback, useEffect, useState } from "react";
import InputField from "../../../components/Input/Input";
import Buttons from "../../../components/Button/Button";
import { Card } from "primereact/card";
import { useFieldArray, useForm } from "react-hook-form";
import Field from "../../../components/Field";
import Select from "../../../components/Dropdown/Dropdown";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { useTranslation } from "react-i18next";
import DateCalendar from "../../../components/Calendar/Calendar";
import PartDetailsDialogBox from "../../../components/DialogBox/PartDetailsDialogBox";
import { toast } from "react-toastify";
import { ENDPOINTS } from "../../../utils/APIEndpoints";
import { callPostAPI } from "../../../services/apis";
import { useLocation, useOutletContext } from "react-router-dom";
import moment from "moment";
import { saveTracker } from "../../../utils/constants";
import CancelDialogBox from "../../../components/DialogBox/CancelDialogBox";
import { eventNotification, helperEventNotification } from "../../../utils/eventNotificationParameter";
import { decryptData } from "../../../utils/encryption_decryption";

type FormValues = {
  FROM_STORE: string;
  TO_STORE: string;
  DOC_DATE: string;
  REMARKS: string;
  STORE_ID: string;
  PART_LIST: {
    PART_ID: string;
    PART_NAME: string;

    UOM_ID: string;
    REQUESTED_QUANTITY: string;
  }[];
  MODE: string;
  PARA: { para1: string; para2: string };
  MATREQ_ID: number;
};

type FormErrors = {
  PART_LIST?: {
    [key: number]: {
      REQUESTED_QUANTITY?: {
        type: string;
        message: string;
      };
    };
  };
};

const StoreToStoreMasterForm = (props: any) => {
  const { t } = useTranslation();
  const [IsSubmit, setIsSubmit] = useState<any | null>(false);
  const [storeList, setStoreList] = useState<any>([]);
  const [SampelStoreList, setSampelStoreList] = useState<any>([]);
  const [selectedParts, setSelectedParts] = useState<any>([]);
  const [, menuList]: any = useOutletContext();
  const [TostoreList, setTostoreList] = useState<any>([]);
  let [partOptions, setPartOptions] = useState([]);
  let { pathname } = useLocation();
  const getId: any = localStorage.getItem("Id")
  const dataId = JSON.parse(getId)
  const currentMenu = menuList
    ?.flatMap((menu: any) => menu?.DETAIL)
    .filter((detail: any) => detail.URL === pathname)[0];

  const { search } = useLocation();
  const {
    register,
    handleSubmit,
    control,
    getValues,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues, FormErrors>({
    defaultValues: {
      FROM_STORE: "",
      TO_STORE: "",
      DOC_DATE: "",
      REMARKS: "",
      STORE_ID: "",
      PART_LIST: [],
      MODE: props?.selectedData ? "E" : "A",

    },
    mode: "all",
  });
  const User_Name = decryptData((localStorage.getItem("USER_NAME")))
  const { fields, append, remove } = useFieldArray({
    name: "PART_LIST",
    control,
  });

  const FROM_STOREwatch: any = watch('FROM_STORE')
  const TO_STOREwatch: any = watch('TO_STORE')
  //const storeWatch: any = watch("STORE_ID");
  const PART_LIST: any = watch("PART_LIST");

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



  function getSelec(data: any) {
    setSelectedParts(data);
  }

  const onSubmit = useCallback(async (payload: any, e: any) => {
    if (IsSubmit) return true
    setIsSubmit(true)
    const buttonMode: any = e?.nativeEvent?.submitter?.name;
    try {
      const partList: any = PART_LIST?.map((part: any) => {
        if (part?.PART_ID !== '') {
          return {

            PART_ID: part?.PART_ID,
            UOM_ID: "1",
            QTY: part?.REQUESTED_QUANTITY,

          };
        }
      });

      const isAnyQTYUndefined = PART_LIST.some(

        (item: any) => item.REQUESTED_QUANTITY === undefined
      );

      payload.TO_STORE_ID = payload?.TO_STORE?.STORE_ID;
      payload.FROM_STORE_ID = payload?.FROM_STORE?.STORE_ID;
      payload.PART_LIST = partList

      payload.DOC_DATE = payload.DOC_DATE = payload.DOC_DATE
        ? moment(payload.DOC_DATE).format("DD-MM-YYYY")
        : "";
      payload.MODE = buttonMode === "CANCEL" ? "C" : props?.selectedData ? "E" : "A";
      payload.PARA = buttonMode === "CANCEL" ? { para1: `${props?.headerName}`, para2: "Cancelled" } : props?.selectedData
        ? { para1: `${props?.headerName}`, para2: "Updated" }
        : { para1: `${props?.headerName}`, para2: "Added" }
      payload.DOC_ID = props?.selectedData ? props?.selectedData?.DOC_ID : 0;
      delete payload?.FROM_STORE;
      delete payload?.TO_STORE;

      if (fields?.length > 0) {
        if (isAnyQTYUndefined === false) {

          const res = await callPostAPI(ENDPOINTS?.SAVE_STORETOSTORE, payload, currentMenu?.FUNCTION_CODE);
          if (res?.FLAG === true) {
            toast?.success(res?.MSG);
            const notifcation: any = {
              "FUNCTION_CODE": props?.functionCode,
              "EVENT_TYPE": "I",
              "STATUS_CODE": buttonMode === "CANCEL" ? 8 : search === "?edit=" ? 2 : 1,
              "PARA1": search === "?edit=" ? User_Name : User_Name,
              PARA2: FROM_STOREwatch?.STORE_NAME,
              PARA3: TO_STOREwatch?.STORE_NAME,
              PARA4: payload?.DOC_DATE


            };
            const eventPayload = { ...eventNotification, ...notifcation };
            await helperEventNotification(eventPayload);

            props?.getAPI();
            // setIsSubmit(false)
            props?.isClick();
          } else {

            toast?.error(res?.MSG);
          }
        } else {
          toast.error(t("Please fill the quantity"));
          setIsSubmit(false)
        }
      } else {
        toast.error(t("Please select atleast one part list"));
        setIsSubmit(false)

      }
    } catch (error: any) {
      toast.error(error)
    } finally {
      setIsSubmit(false)
    }
  }, [IsSubmit,
    PART_LIST,
    props?.selectedData,
    props?.functionCode,
    props?.getAPI,
    props?.isClick,
    currentMenu?.FUNCTION_CODE,
    fields,
    search,
    FROM_STOREwatch?.STORE_NAME,
    TO_STOREwatch?.STORE_NAME,
    eventNotification,
    toast, t]);

  const getpartlist = async () => {

    const payload = {
      STORE_ID: FROM_STOREwatch?.STORE_ID,
    };

    const res = await callPostAPI(ENDPOINTS.GET_INVENTORY_PARTLIST, payload);
    setPartOptions(res?.STORELIST);
  };

  useEffect(() => {
    if (FROM_STOREwatch !== '') {
      (async function () {
        await getpartlist()
       })();
      
      const data: any = SampelStoreList?.filter((f: any) => f?.STORE_ID !== FROM_STOREwatch.STORE_ID)
      if (data?.length > 0) {
        setTostoreList(data);
      } else {
        setTostoreList([]);
      }
    }

  }, [FROM_STOREwatch])

  const getinventorypartdetails = async () => {
    const payload = {
      DOC_NO: dataId?.DOC_NO,
      DOC_ID: dataId?.DOC_ID,
    };
    try {
      const res = await callPostAPI(
        ENDPOINTS.GETADDINVENTORYMASTERSDETAILS,
        payload,
        currentMenu?.FUNCTION_CODE
      );
      if (res?.FLAG === 1) {
        setValue("REMARKS", res?.INVENTORYDETAILS[0]?.REMARKS)
        const upDatedPartList: any = res?.PARTLIST?.map(
          (part: any) => {
            return {
              PART_ID: part?.PART_CODE,
              PART_NAME: part?.PART_NAME,
              UOM_NAME: part?.UOM_NAME,
              REQUESTED_QUANTITY: part?.QTY,
              PART_CODE: part?.PART_CODE,
              STOCK: part?.STOCK,
            };
          }
        );

        append(upDatedPartList);
        setSelectedParts(upDatedPartList);
      }
    } catch (error: any) {
      toast.error(error)
    }

  }


  const getOptions = async () => {
    const payload = {
      WO_ID: search === '?add=' ? 0 : dataId?.WO_ID,
      MATREQ_ID: search === '?add=' ? 0 : dataId?.MATREQ_ID,
      MODE: search === '?add=' ? "A" : "E"
    }
    try {
      const res = await callPostAPI(ENDPOINTS.GETINVENTORYMASTERLIST, payload, currentMenu?.FUNCTION_CODE);
      setStoreList(res?.STORELIST)
      setSampelStoreList(res?.STORELIST)
      setTostoreList(res?.STORELIST)
      if (search === '?edit=') {
       await getinventorypartdetails();
      }

    } catch (error: any) {
      toast.error(error);

    }
  }

  useEffect(() => {
    const DOC_DATE: any = new Date();
    setValue("DOC_DATE", DOC_DATE);

    const nestedErrors: any = errors?.PART_LIST || {};
    const firstError: any = Object?.values(nestedErrors)[0];
    if ((!isSubmitting && Object?.values(errors)[0]?.type === "required") || (!isSubmitting && Object?.values(errors)[0]?.type === "validate")) {
      const check: any = Object?.values(errors)[0]?.message;
      toast?.error(t(check));
    } else if (!isSubmitting && (firstError?.REQUESTED_QUANTITY?.type === "required" || firstError?.REQUESTED_QUANTITY?.type === "validate")) {
      const check: any = firstError?.REQUESTED_QUANTITY?.message
      toast?.error(t(check));
    }
  }, [isSubmitting]);

  const handlerShow = (index: any, rowData: any) => {
    remove(index);
    const data: any = selectedParts?.filter((f: any) => f?.PART_ID !== rowData?.PART_ID)
    setSelectedParts(data);
  };

  useEffect(() => {
    (async function () {
      await  getOptions();
      await saveTracker(currentMenu)
     })();
  }, [])

  return (
    <>
      <section className="w-full">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex justify-between mt-1">
            <div>
              <h6 className="Text_Primary">
                {t(`${search === "?edit=" ? "Cancel" : "Add"}`)} {t(`${props?.headerName}`)}-
                {search === "?edit=" ? dataId?.DOC_NO : ""}
              </h6>
            </div>

            <div className="flex">
              {props?.selectedData === null || props?.selectedData === undefined ? (
                <Buttons
                  type="submit"
                  className="Primary_Button  w-20 me-2"
                  label={"Save"}
                  disabled={IsSubmit}
                />
              ) : (
                <>
                  {(dataId?.CNCL_IND === false) && (
                    <CancelDialogBox
                      header={"Cancel Store to store"}
                      control={control}
                      setValue={setValue}
                      register={register}
                      paragraph={
                        "Are you sure you want to  cancel store to store?"
                      }
                      watch={watch}
                      REMARK={"REMARK"}
                      errors={errors}
                      IsSubmit={IsSubmit} 
                      setIsSubmit={setIsSubmit}
                    />
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
                  name: "FROM_STORE",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <Select
                        options={storeList}
                        {...register("FROM_STORE", {
                          required: search === '?add=' ? "Please fill the required fields" : "",
                          //   validate: validateStores,
                        })}
                        label="From Store"
                        optionLabel="STORE_NAME"
                        findKey={"STORE_ID"}
                        require={search === '?add=' ? true : false}
                        disabled={search === '?edit=' ? true : false}
                        selectedData={search === "?edit=" ? dataId?.STORE_ID : props?.selectedData?.STORE_ID}
                        setValue={setValue}
                        invalid={search === '?add=' ? errors.FROM_STORE : ""}
                        invalidMessage={search === '?add=' ? errors.FROM_STORE : ""}
                        {...field}
                      />
                    );
                  },
                }}
              />

              <Field
                controller={{
                  name: "TO_STORE",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <Select
                        options={TostoreList}
                        {...register("TO_STORE", {
                          required: search === '?add=' ? "Please fill the required fields" : "",
                          validate: (match: any) => {
                            if (search === '?add=') {
                              const password: any = getValues("FROM_STORE")

                              return match?.STORE_ID !== password?.STORE_ID || "From store name cannot be the same as to store name"
                            }
                          }
                        })}
                        label="To Store"
                        optionLabel="STORE_NAME"
                        findKey={"STORE_ID"}
                        require={search === '?add=' ? true : false}
                        disabled={search === '?edit=' ? true : false}
                        selectedData={search === "?edit=" ? dataId?.TO_STORE_ID : props?.selectedData?.TO_STORE_ID}

                        setValue={setValue}
                        invalid={search === '?add=' ? errors.TO_STORE : ""}
                        invalidMessage={search === '?add=' ? errors.TO_STORE?.message : ""}
                        {...field}
                      />
                    );
                  },
                }}
              />
              <Field
                controller={{
                  name: "DOC_DATE",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <DateCalendar
                        {...register("DOC_DATE", { required: "Please fill the required fields" })}
                        label="Doc Date"
                        showIcon
                        disabled={search === '?edit=' ? true : false}
                        invalid={errors.DOC_DATE?.message}
                        setValue={setValue}
                        value="DOC_DATE"
                        {...field}
                      />
                    );
                  },
                }}
              />
              <Field
                controller={{
                  name: "REMARKS",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <InputField
                        {...register("REMARKS", {
                          required: t("Please fill the required fields."),
                          validate: value => value.trim() !== "" || t("Please fill the required fields."),
                        })}
                        disabled={search === '?edit=' ? true : false}
                        label="Remarks"
                        require={true}

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
            <div className="headingConainer flex justify-between">
              <p>{t("Part Details")}</p>
              <div>
                {search === '?add=' && (<PartDetailsDialogBox
                  getpartlist={getpartlist}
                  partList={partOptions}
                  saveFuc={saveFuc}
                  getSelec={getSelec}
                  selectedParts={selectedParts}
                  setSelectedParts={setSelectedParts} />)}
              </div>
            </div>
            <div>
              <div>
                <DataTable value={fields} key={fields?.length - 1} showGridlines>
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
                    header={t("Requested Quantity")}
                    className="w-40"
                    body={(rowData, { rowIndex }) => {
                      return (
                        <>
                          <Field
                            controller={{
                              name: `PART_LIST.[${rowIndex}].REQUESTED_QUANTITY`,
                              control: control,
                              render: ({ field }: any) => {
                                return (
                                  <InputField
                                    {...register(
                                      `PART_LIST.[${rowIndex}].REQUESTED_QUANTITY` as any,
                                      {
                                        required: "Please fill the Required fields",
                                        validate: (value) => {
                                          if (parseInt(value, 10) < 0 || parseInt(value, 10) === 0) {
                                            return (t("Should be greater than 0"));
                                          } else if (parseInt(value, 10) === 0) {
                                            return (t("Please enter the number"))
                                          } else {
                                            const sanitizedValue = value?.toString()?.replace(/[^0-9]/g, "");
                                            setValue(`PART_LIST.[${rowIndex}].REQUESTED_QUANTITY` as any, sanitizedValue);
                                            return true;

                                          }
                                        },
                                      }
                                    )}
                                    disabled={search === '?add=' ? false : true}
                                    setValue={setValue}

                                    invalid={
                                      errors?.PART_LIST?.[rowIndex]
                                        ?.REQUESTED_QUANTITY
                                        ? true
                                        : false
                                    }
                                    invalidMessage={
                                      errors?.PART_LIST?.[rowIndex]?.REQUESTED_QUANTITY?.type === "validate" ? errors?.PART_LIST?.[rowIndex]?.REQUESTED_QUANTITY?.message : ""
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
                    className="w-40">
                  </Column>

                  {search === '?add=' && (<Column
                    field="Action"
                    header="Action"
                    className="w-40"
                    body={(rowData: any, { rowIndex }) => {
                      //
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
                  ></Column>)}
                </DataTable>
              </div>
            </div>
          </Card>
        </form>
      </section>
    </>
  );
};

export default StoreToStoreMasterForm;
