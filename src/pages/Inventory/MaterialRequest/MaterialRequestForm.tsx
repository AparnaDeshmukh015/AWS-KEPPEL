import React, { useCallback, useEffect, useState } from "react";
import InputField from "../../../components/Input/Input";
import Buttons from "../../../components/Button/Button";
import { Card } from "primereact/card";
import { useFieldArray, useForm } from "react-hook-form";
import Field from "../../../components/Field";
import Radio from "../../../components/Radio/Radio";
import Select from "../../../components/Dropdown/Dropdown";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { useTranslation } from "react-i18next";
import PartDetailsDialogBox from "../../../components/DialogBox/PartDetailsDialogBox";
import { toast } from "react-toastify";
import { callPostAPI } from "../../../services/apis";
import { ENDPOINTS } from "../../../utils/APIEndpoints";
import moment from "moment";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import CancelDialogBox from "../../../components/DialogBox/CancelDialogBox";
import { saveTracker } from "../../../utils/constants";
import { eventNotification, helperEventNotification } from "../../../utils/eventNotificationParameter";
import { PATH } from "../../../utils/pagePath";
import { decryptData } from "../../../utils/encryption_decryption";
 
type FormValues = {
  MATREQTYPE: string;
  MATREQ_DATE: string;
  RAISED_BY: string | null;
  WORKORDER: string;
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
 
const MaterialRequestForm = (props: any) => {
  const { t } = useTranslation();
  const { search } = useLocation();
  const navigate: any = useNavigate();
  const [selectedParts, setSelectedParts] = useState<any>([]);
  const [options, setOptions] = useState<any | null>([]);
// const [workorderId, setWorkorderId] = useState<any | null>();
 // const [rowClick] = useState<boolean>(true);
  const location: any = useLocation();
  const [marQueType, setMarQueType] = useState<any | null>(false);
  const [selectedDetails, setSelectedDetails] = useState<any | null>();
 // const [showLoader, setShowLoader] = useState<boolean>(false);
  const assestTypeLabel: any = [
    { name: "Self", key: "S" },
    { name: "Against Work Order", key: "A" },
  ];
  let { pathname } = useLocation();
  const [, menuList]: any = useOutletContext();
  const currentMenu = menuList
    ?.flatMap((menu: any) => menu?.DETAIL)
    .filter((detail: any) => detail.URL === pathname)[0];
  let [partOptions, setPartOptions] = useState([]);
  const [IsSubmit, setIsSubmit] = useState<any | null>(false);
  const getId: any = localStorage.getItem("Id")
  const dataId = JSON.parse(getId)
 
 
  const {
    register,
    handleSubmit,
    control,
    getValues,
    setValue,
    watch,
    // reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues, FormErrors>({
    defaultValues: {
      MATREQTYPE: "",
      MATREQ_DATE: moment(new Date()).format('DD-MM-YYYY'),
      RAISED_BY: search === "?add=" ? search === "?add=" ? decryptData((localStorage.getItem("USER_NAME"))) : search === "?edit=" ? dataId?.USER_NAME : "" : search === "?edit=" ? dataId?.USER_NAME : "",
      WORKORDER: "",
      REMARKS: "",
      STORE_ID: "",
 
      PART_LIST: [],
      MODE: search === "?edit=" ? "E" : "A",
      PARA: search === "?edit="
        ? { para1: t('Material Requisition'), para2: "Updated" }
        : { para1: t('Material Requisition'), para2: "Added" },
      MATREQ_ID: search === "?edit=" ? dataId.MATREQ_ID : 0,
    },
    mode: "all",
  });
  const User_Name = decryptData((localStorage.getItem("USER_NAME")))
  const _MAT_REQ_TYPE: any = watch("MATREQTYPE");
  let { fields, remove, append} = useFieldArray({
    name: "PART_LIST",
    control,
  });
 
  const storeWatch: any = watch("STORE_ID");
  const PART_LIST: any = watch("PART_LIST");
  const getpartlist = async () => {
    const payload = {
      STORE_ID: storeWatch?.STORE_ID,
    };
 
    const res = await callPostAPI(ENDPOINTS.GET_INVENTORY_PARTLIST, payload);
    const PartMasterList: any = res?.STORELIST.map((element: any) => {
      return {
        ...element,
        REQUESTED_QUANTITY: ""
      }
    })
 
    setPartOptions(PartMasterList);
  };
 
  function getSelec(data: any) {
    setSelectedParts(data);
  }
 
  const getOptionDetails = async () => {
    const payload: any = {
      MATREQ_ID: dataId?.MATREQ_ID,
      MATREQ_NO: dataId?.MATREQ_NO,
    };
    
    const res = await callPostAPI(
      ENDPOINTS.GET_MATERIAL_REQUISITION_DETAILS,
      payload
    );
 
    if (res.FLAG === 1) {
      setSelectedDetails(res?.MATREQUISITIONDETAILS[0]);
      setValue("WORKORDER", res?.MATREQUISITIONDETAILS[0]?.WO_ID);
      if (res?.MATREQUISITIONDETAILS[0]?.SELF_WO === "A") {
        setMarQueType(true);
      }
      setValue("REMARKS", res?.MATREQUISITIONDETAILS[0]?.REMARKS);
      const upDatedPartList: any = res?.PARTLIST?.map(
        (part: any) => {
          return {
            PART_ID: part?.PART_ID,
            PART_CODE: part?.PART_CODE,
            PART_NAME: part?.PART_NAME,
            UOM_NAME: part?.UOM_NAME,
            REQUESTED_QUANTITY: part?.QTY,
            STOCK: part?.STOCK,
          };
        }
      );
 
      append(upDatedPartList);
      setSelectedParts(upDatedPartList);
    }
  };
 
  //const [partListState, setPartListState] = useState(PART_LIST);
 
  // useEffect(() => {
  //   setPartListState(PART_LIST);
  // }, [PART_LIST]);
 
  const saveFuc = () => {
  
    if (PART_LIST?.length < selectedParts?.length) {
      const data: any = [];
      const partListIds = new Set(PART_LIST.map((part: any) => part.PART_ID));
      selectedParts.forEach((part: any) => {
        if (!partListIds.has(part.PART_ID)) {
          data.push(part);
        }
      });
      if (data?.length === 0) {
        setValue("PART_LIST", selectedParts);
      } else {
        append(data)
      }
    } else {
     
      const selectedPartIds = new Set(selectedParts.map((part: any) => part.PART_ID));
      const matchingParts = selectedParts.filter((part: any) => selectedPartIds.has(part.PART_ID));
        const updatedMatchingParts = matchingParts.map((part:any) => {
          const matchedPart = PART_LIST.find((listPart:any) => listPart.PART_ID === part.PART_ID);
        if (matchedPart) {
            return { ...part, REQUESTED_QUANTITY: matchedPart.REQUESTED_QUANTITY };
          }
    
          return { ...part, REQUESTED_QUANTITY: "" };
        });
      //replace(updatedMatchingParts)
      setValue("PART_LIST", updatedMatchingParts);
    }
 
  };


  const onSubmit = useCallback(async (payload: any, e: any) => {
    if (IsSubmit) return true
    setIsSubmit(true)
    const buttonMode: any = e?.nativeEvent?.submitter?.name;
    try {
      const partList: any = payload?.PART_LIST?.map((part: any) => {
        if (part?.PART_ID !== "") {
          return {
            PART_ID: part?.PART_ID,
            UOM_ID: "1",
            QTY: part?.REQUESTED_QUANTITY,
            REQUESTED_QUANTITY: part?.REQUESTED_QUANTITY,
            STOCK: part?.STOCK,
          };
        }
      });
 
      payload.RAISED_BY = decryptData(localStorage.getItem("USER_ID"));
 
      payload.MATREQTYPE =
        location?.state !== null
          ? "A"
          : _MAT_REQ_TYPE.key
            ? _MAT_REQ_TYPE.key
            : _MAT_REQ_TYPE;
 
      payload.WO_NO =
        _MAT_REQ_TYPE?.key === "A" || props?.selectedData?.SELF_WO
          ? payload?.WORKORDER?.WO_NO
          : "0";
 
      payload.WO_ID =
        _MAT_REQ_TYPE?.key === "A" ||
          props?.selectedData?.SELF_WO ||
          payload?.WO_ID !== undefined
          ? payload?.WORKORDER?.WO_ID
          : location?.state !== null
            ? location?.state?.wo_ID
            : "0";
 
      payload.STORE_ID = payload?.STORE_ID?.STORE_ID;
 
      payload.PART_LIST = partList;
      payload.MODE =
        buttonMode === "APPROVE"
          ? "AP"
          : buttonMode === "CANCEL"
            ? "C"
            : props?.selectedData
              ? "E"
              : "A";
      payload.PARA = payload.MODE =
        buttonMode === "APPROVE"
          ? "AP"
          : buttonMode === "CANCEL"
            ? "C"
            : props?.selectedData
              ? "E"
              : "A";
      payload.PARA =
        buttonMode === "CANCEL"
          ? { para1: `${props?.headerName}`, para2: "Cancel" }
          : buttonMode === "CONVERT"
            ? { para1: `${props?.headerName}`, para2: "Approved" }
            : search === "?edit="
              ? { para1: t('Material Requisition'), para2: "Updated" }
              : { para1: t('Material Requisition'), para2: "Added" };
      delete payload.WORKORDER;
      payload.ISAPPROVED = payload.MODE === "AP" ? true : false;
 
      if (fields?.length > 0) {
        try {
          const res = await callPostAPI(
            ENDPOINTS.SAVE_INVENTORY_MATERIAL_REQUISITION,
            payload
          );
          if (res?.FLAG === true) {
            const notifcation: any = {
              FUNCTION_CODE: currentMenu?.FUNCTION_CODE,
              EVENT_TYPE: "I",
              STATUS_CODE: buttonMode === "CANCEL" ? 8 : search === "?edit=" ? 2 : 1,
              PARA1: search === "?edit=" ? User_Name : User_Name,
              PARA2: payload?.MATREQTYPE,
              PARA3: 'req_no',
              PARA4: storeWatch?.STORE_NAME,
              PARA5: payload?.MATREQ_DATE,
              PARA6: payload?.RAISED_BY,
              PARA7: payload?.WO_ID,
              PARA8: 'equipment_name',
            };
            const eventPayload = { ...eventNotification, ...notifcation };
            await helperEventNotification(eventPayload);
            setIsSubmit(false)
            if (
              buttonMode === "APPROVE" &&
              props?.selectedData?.ISAPPROVED === true
            ) {
              // navigate("/issuemateriallist?add=",  {state: payload?.STORE_ID,
              // })
            } else if (
              buttonMode === "APPROVE" &&
              props?.selectedData?.ISAPPROVED === false
            ) {
              localStorage.setItem("STORE_ID", payload?.STORE_ID);
              localStorage.setItem("MATREQ_ID", props?.selectedData?.MATREQ_ID);
              localStorage.setItem("MATREQ_NO", props?.selectedData?.MATREQ_NO);
              navigate(PATH.ADD_ISSUEMATERIAL);
            }
            if (location?.state === null) {
              toast?.success(res?.MSG);
              props?.getAPI();
              props?.isClick();
            } else {
              toast?.success(res?.MSG);
              navigate(PATH.EDIT_WORKORDERMASTER, { state: location?.state?.wo_ID });
            }
          } else {
            setIsSubmit(false)
            toast?.error(res?.MSG);
          }
 
        } catch (error) {
 
        }
 
 
      } else {
        setIsSubmit(false)
        toast.error("please select part list ");
      }
    } catch (error: any) {
      toast.error(error)
    } finally {
      setIsSubmit(false)
    }
  },[
    IsSubmit,
    decryptData,
    _MAT_REQ_TYPE,
    props?.selectedData,
    props?.headerName,
    props?.getAPI,
    props?.isClick,
    navigate,
    callPostAPI,
    helperEventNotification,
    eventNotification,
    fields,
    location?.state,
    storeWatch?.STORE_NAME,
    search,
    t,
    User_Name,
    currentMenu?.FUNCTION_CODE,
  ]);
  useEffect(() => {
    if (storeWatch !== "") {
      (async function () {
        await   getpartlist();
       
       })();
     
    }
  }, [storeWatch]);

  useEffect(() => {
  }, [getValues("PART_LIST")]);
 
  useEffect(() => {
    if (_MAT_REQ_TYPE?.key === "S" || _MAT_REQ_TYPE === "S") {
      const data: any = {};
      setValue("WORKORDER", data);
      setMarQueType(false);
    } else {
      setMarQueType(true);
    }
  }, [_MAT_REQ_TYPE]);
 
  const getOptions = async () => {
    try {
      // we are accessing data from workorder using MODE :E
      const payload = {
        WO_ID: search === '?add=' && location?.state !== null ? location?.state?.wo_ID : search === '?add=' ? 0 : dataId?.WO_ID,
        MATREQ_ID: search === '?add=' && location?.state !== null ? location?.state?.MATREQ_ID : search === '?add=' ? 0 : dataId?.MATREQ_ID,
        MODE: search === '?add=' && location?.state !== null ? "E" : search === '?add=' ? "A" : "E"
 
      }
 
      const res = await callPostAPI(ENDPOINTS.GET_INVENTORY_MASTER_OPTIONS, payload);
 
      if (res?.FLAG === 1) {
        setOptions({
          woList: res?.WOLIST,
          storeList: res?.STORELIST,
        });
 
        setOptions({ woList: res?.WOLIST, storeList: res?.STORELIST });
        if (location?.state === null && search === "?add=") {
          setValue("MATREQTYPE", "S");
        }
        if (props?.selectedData !== undefined) {
          await getOptionDetails();
        }
      }
    } catch (error: any) {
      toast.error(error);
    }
  };


  useEffect(() => {
    (async function () {
      await  getOptions();
      await saveTracker(currentMenu)
     })();
  }, []);
 
 
  useEffect(() => {
    const nestedErrors: any = errors?.PART_LIST || {};
    const firstError: any = Object?.values(nestedErrors)[0];
    if ((!isSubmitting && Object?.values(errors)[0]?.type === "required") || (!isSubmitting && Object?.values(errors)[0]?.type === "validate")) {
      const check: any = Object?.values(errors)[0]?.message;
      toast?.error(t(check));
    } else if (!isSubmitting && (firstError?.REQUESTED_QUANTITY?.type === "required")) {
      const check: any = firstError?.REQUESTED_QUANTITY?.message
      toast?.error(t(check));
    }
  }, [isSubmitting]);
 
  useEffect(() => {
    if (location?.state) {
      setValue("MATREQTYPE", "A");
      setValue("WORKORDER", location?.state?.wo_ID);
      setSelectedDetails({ SELF_WO: "A", WO_ID: location?.state?.wo_ID });
      setMarQueType(true);
      // setWorkorderId(location?.state);
    }
  }, [location?.state]);
 
  const handlerShow = (index: any, rowData: any) => {
    remove(index);
    const data: any = selectedParts?.filter((f: any) => f?.PART_ID !== rowData?.PART_ID)
    setSelectedParts(data);
  }
  
  return (
    <>
      <section className="w-full">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-wrap justify-between mt-1">
            <div>
              <h6 className="Text_Primary">
                {props?.headerName === "Material Request Approve" ? (
                  ""
                ) : (
                  <>{t(`${search === "?edit=" ? "Edit" : "Add"}`)}</>
                )}{" "}
                {props?.headerName}{" "}
              </h6>
            </div>
            <div>
              {" "}
              {props?.selectedData ? props?.selectedData?.MATREQ_NO : ""}
            </div>
            <div className="flex">
              {search === "?add=" && (
                <Buttons
                  type="submit"
                  className="Primary_Button  w-20 me-2"
                  label={"Save"}
                  IsSubmit={IsSubmit}
                />
              )}
 
              {/* )} */}
              {search === "?edit=" && location?.state === null &&
                (decryptData(localStorage.getItem("ROLETYPECODE")) === "SA" ||
                  decryptData(localStorage.getItem("ROLETYPECODE")) === "S")
              
                && (
                  <Buttons
                    name="APPROVE"
                    type="submit"
                    className="Primary_Button  w-20 me-2"
                    label={"Approve"}
                    IsSubmit={IsSubmit}
                  />
                )}
              {(search === "?edit=" && location?.state === null) && (
                <CancelDialogBox
                  header={"Reject Material Request"}
                  control={control}
                  setValue={setValue}
                  register={register}
                  paragraph={
                    t("Are you sure you want to reject the material request?")
                  }
                  watch={watch}
                  REMARK={"REMARK"}
                  errors={errors}
                  IsSubmit={IsSubmit} 
                  setIsSubmit={setIsSubmit}
                />
              )}
              {location?.state === null ? <><Buttons
                className="Secondary_Button w-20 "
                label={"List"}
                onClick={props?.isClick}
              /></> :
                <><Buttons
                  className="Secondary_Button w-20 "
                  label={"Back"}
                  onClick={() => {
                    navigate(PATH.EDIT_WORKORDERMASTER, { state: location?.state?.wo_ID });
                  }}
                /></>}
            </div>
          </div>
          <Card className="mt-2">
            <div className=" grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-3 lg:grid-cols-3">
              <Field
                controller={{
                  name: "MATREQTYPE",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <>
                        <Radio
                          {...register("MATREQTYPE", {})}
                          labelHead="Type"
                          disabled={
                            search === "?edit=" || location?.state !== null
                              ? true
                              : false
                          }
                          options={assestTypeLabel}
                          selectedData={
                            location?.state !== null
                              ? "A"
                              : search === "?add="
                                ? "S"
                                : selectedDetails?.SELF_WO
                          }
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
                  name: "MATREQ_DATE",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <InputField
                        {...register("MATREQ_DATE", {
                          required:
                            props?.headerName === "Material Request Approve"
                              ? ""
                              : t("Please fill the required fields."),
                        })}
                        label="Request Date"
                        require={true}
                        disabled={
                          props?.headerName === "Material Request Approve"
                            ? true
                            : location?.state !== null
                              ? true
                              : props?.selectedData !== undefined
                                ? true
                                : false
                        }
                        invalid={errors.MATREQ_DATE?.message}
                        {...field}
                      />
                    );
                  },
                }}
              />
 
              {(_MAT_REQ_TYPE?.key === "A" || _MAT_REQ_TYPE === "A") && (
                <div>
                  <Field
                    controller={{
                      name: "RAISED_BY",
                      control: control,
                      render: ({ field }: any) => {
                        return (
                          <InputField
                            {...register("RAISED_BY", {
                              required:
                                props?.headerName === "Material Request Approve"
                                  ? ""
                                  : props?.selectedData !== undefined
                                    ? ""
                                    : t("Please fill the required fields."),
                            })}
                            label="Raised By"
                            require={true}
                            disabled={true}
                            selectedData={search === "?edit=" ? selectedDetails?.MATREQ_RAISEDBY : ""}
                            invalid={errors.RAISED_BY?.message}
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
                  name: "STORE_ID",
                  control: control,
                  render: ({ field }: any) => {
                    const SelectedStore =
                      options?.storeList?.length >= 1
                        ? options?.storeList[0]
                        : null;
 
 
                    return (
                      <Select
                        options={options?.storeList}
                        {...register("STORE_ID", {
                          required: t("Please fill the required fields."),
                        })}
                        label="Store Name"
                        require={true}
                        findKey={"STORE_ID"}
                        selected={"STORE_ID"}
                        optionLabel="STORE_NAME"
                        disabled={search === "?edit=" ? true : false}
                        selectedData={props?.selectedData ? props?.selectedData?.STORE_ID : SelectedStore?.STORE_ID}
                        setValue={setValue}
                        onChange={getpartlist}
                        invalid={errors.STORE_ID
                        }
                        {...field}
                      />
                    );
                  },
                }}
              />
 
              {marQueType === true &&
                (dataId?.WO_NO !== "" ||
                  dataId?.WO_NO !== undefined) ? (
                <div>
                  <Field
                    controller={{
                      name: "WORKORDER",
                      control: control,
                      render: ({ field }: any) => {
                        return (
                          <Select
                            options={options?.woList}
                            {...register("WORKORDER", {
                              required: location?.state !== null ? t("Please fill the required fields.") : "",
                            })}
                            label="Work Order No."
                            optionLabel="WO_NO"
                            require={
                              _MAT_REQ_TYPE?.key === "A" ||
                                _MAT_REQ_TYPE === "A"
                                ? true
                                : ""
                            }
                            disabled={search === "?edit=" || location?.state !== null ? true : false}
                            findKey={"WO_ID"}
                            selectedData={selectedDetails?.WO_ID}
                            setValue={setValue}
                            {...field}
                          />
                        );
                      },
                    }}
                  />
                </div>
              ) : (
                <></>
              )}
             
              <Field
                controller={{
                  name: "REMARKS",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <InputField
                        {...register("REMARKS", {
                        })}
                        label="Remarks"
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
                {search === "?add=" && (
                  <PartDetailsDialogBox
                    getpartlist={getpartlist}
                    partList={partOptions}
                    saveFuc={saveFuc}
                    getSelec={getSelec}
                    selectedParts={selectedParts}
                    setSelectedParts={setSelectedParts}
                  />
                )}
              </div>
            </div>
            <div>
              <DataTable
                value={PART_LIST}
                key={fields?.length - 1}
                showGridlines
                disabled={
                  props?.headerName === "Material Request Approve"
                    ? true
                    : false
                }
 
              >
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
                <Column field="STOCK" header={t("Stock")} className=""></Column>
 
                <Column
                  field="REQ_QTY"
                  header={t("Quantity")}
                  className="w-40"
                  body={(rowData, { rowIndex }) => {
                  setValue(`PART_LIST.[${rowIndex}].REQUESTED_QUANTITY` as any, rowData?.REQUESTED_QUANTITY);
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
                                      required: t("Please fill the required fields."),
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
                                  // value={field.value} 
 
                                  disabled={
                                    props?.headerName ===
                                      "Material Request Approve" ||
                                      search === "?edit="
                                      ? true
                                      : false
                                  }
                                  invalid={
                                    errors?.PART_LIST?.[rowIndex]
                                      ?.REQUESTED_QUANTITY
                                      ? true
                                      : false
                                  }
                                  setValue={setValue}
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
                  className="w-40"
                ></Column>
                {search === "?add=" && (
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
            </div>
          </Card>
        </form>
      </section>
    </>
  );
};
 
export default MaterialRequestForm;
 
