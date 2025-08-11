import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import "../Button/Button.css";
import { InputTextarea } from "primereact/inputtextarea";
import Field from "../../components/Field";
import { useForm } from "react-hook-form";
import { callPostAPI } from "../../services/apis";
import { ENDPOINTS } from "../../utils/APIEndpoints";
import { toast } from "react-toastify";
import Select from "../Dropdown/Dropdown";
import { useTranslation } from "react-i18next";
import { helperEventNotification } from "../../utils/eventNotificationParameter";
import { decryptData } from "../../utils/encryption_decryption";
import { dateFormat, formateDate } from "../../utils/constants";

// eslint-disable-next-line react-hooks/rules-of-hooks

const WorkorderRedirectDialogBox = ({
  header,
  REMARK,
  handlingStatus,
  getOptionDetails,
  statusCode,
  technicianList,
  currentStatus,
  resonList,
  subStatus,
  redirectStatus,
  setRedirecStatus,
  setVisible1,
  eventNotification,

}: any) => {
  const { t } = useTranslation();
  const [visible, setVisible] = useState<boolean>();
  const [DuplicateBy, setDuplicateBy] = useState<boolean>(false);

  const [options, setOptions] = useState<any | null>([])
  const [technician, setTechnician] = useState<any | null>([]);
  const [DuplicateList, setDuplicateList] = useState<any | null>([]);
  const [Remarklength, setRemarkLength] = useState(0);
  const WO_ID = sessionStorage.getItem('WO_ID');
  const { clearErrors } = useForm();
  const setInputDialogVisible = (e: any) => {
    setRedirecStatus(false)
    setVisible1(false)
    setVisible(false);
    setValue("WO_REMARKS", "");
    setValue("WO_REASON", "");
    setValue("WO_NO", "");
    setValue("ASSIGN_TEAM_ID", "");
    setValue("TECH_ID", "");
  };
  const handleInputChange = (event: any) => {
    const value = event.target.value;
    setRemarkLength(value.length);
  };

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      ASSIGN_TEAM_ID: "",
      TECH_ID: "",
      WO_REMARKS: "",
      WO_REASON: "",
      WO_NO: ""
    },

    mode: "onSubmit",
  });

  const ASSIGN_TEAM_ID1: any = watch("ASSIGN_TEAM_ID");
  const technicianID: any = watch("TECH_ID");
  const Remark: any = watch("WO_REMARKS");
  const Reason: any = watch("WO_REASON");
  const WO_NO: any = watch("WO_NO");
  let REASSIGN_TYPE: any = "";
  const getTechnicianListCollbroate = async (teamId: any) => {
    setTechnician([])
    const setColab = options.technicianList?.filter((e: any) => e.TEAM_ID === teamId) ?? []
    setTechnician(setColab);
  };


  const getOptionDetail = async (WO_ID: any) => {
    const payload: any = { WO_ID: WO_ID };
    try {
      const res: any = await callPostAPI(
        ENDPOINTS.GET_WORKORDER_DETAILS,
        payload
      );

      if (res?.FLAG === 1) {

        if (res?.WORKORDERDETAILS[0]?.CURRENT_STATUS !== 1 || res?.WORKORDERDETAILS[0]?.CURRENT_STATUS !== "1") {
          const notifcation: any = {
            FUNCTION_CODE: "HD001",
            WO_NO: res?.WORKORDERDETAILS[0]?.WO_NO,

            EVENT_TYPE: "W",
            STATUS_CODE: res?.WORKORDERDETAILS[0]?.CURRENT_STATUS,
            PARA1: decryptData(localStorage.getItem("USER_NAME")),
            PARA2: res?.WORKORDERDETAILS[0]?.WO_NO,
            PARA3:
              res?.WORKORDERDETAILS[0]?.WO_DATE === null ? ""
                : formateDate(res?.WORKORDERDETAILS[0]?.WO_DATE),
            // : "",
            // res?.WORKORDERDETAILS[0]?.WO_DATE,
            PARA4: res?.WORKORDERDETAILS[0]?.USER_NAME,
            PARA5: res?.WORKORDERDETAILS[0]?.LOCATION_NAME,
            PARA6: res?.WORKORDERDETAILS[0]?.ASSET_NAME,
            PARA7: res?.WORKORDERDETAILS[0]?.WO_REMARKS,
            PARA8: res?.WORKORDERDETAILS[0]?.SEVERITY_DESC,
            PARA9: res?.WORKORDERDETAILS[0]?.REPORTED_AT !== null
              ? formateDate(res?.WORKORDERDETAILS[0]?.REPORTED_AT) : "",
            PARA10:
              res?.WORKORDERDETAILS[0]?.ACKNOWLEDGED_AT !== null
                ? formateDate(res?.WORKORDERDETAILS[0]?.ATTEND_AT)
                : "",
            PARA11: res?.WORKORDERDETAILS[0]?.ATTEND_AT !== null
              ? formateDate(res?.WORKORDERDETAILS[0]?.ATTEND_AT)
              : "",
            PARA12: res?.WORKORDERDETAILS[0]?.RECTIFIED_AT !== null
              ? formateDate(res?.WORKORDERDETAILS[0]?.RECTIFIED_AT) : "",
            PARA13: res?.WORKORDERDETAILS[0]?.COMPLETED_AT !== null
              ? formateDate(res?.WORKORDERDETAILS[0]?.COMPLETED_AT) : "",
            PARA14: res?.WORKORDERDETAILS[0]?.CANCELLED_AT !== null
              ? formateDate(res?.WORKORDERDETAILS[0]?.CANCELLED_AT)
              : "",
            PARA15: "", //updated
            PARA16: res?.WORKORDERDETAILS[0]?.ACKNOWLEDGED_BY_NAME,
            PARA17: "", //attendBy
            PARA18: res?.WORKORDERDETAILS[0]?.RECTIFIED_BY_NAME,
            PARA19: res?.WORKORDERDETAILS[0]?.COMPLETED_BY_NAME,
            PARA20: res?.WORKORDERDETAILS[0]?.CANCELLED_BY_NAME, //cancelled BY
            PARA21: "", //approve on
            PARA22: "", //approve by,
            PARA23: "", //denied on,
            PARA24: "", //denied by
          };

          const eventPayload = { ...eventNotification, ...notifcation };
          helperEventNotification(eventPayload);
        }
      }
    } catch (error: any) {
      console.log(error)
    }
  }

  const onSubmit = async (e: any) => {

    if (currentStatus === 1) {
      REASSIGN_TYPE = "B";
    }

    if (
      header === "Collaborate" ||
      header === "External Vendor Required" ||
      header === "Reassign" ||
      header === "Cancel Work Order" ||
      header === "Put On Hold"
    ) {

      const payload: any = {
        WO_ID: WO_ID,
        MODE:
          header === "Collaborate"
            ? "COLAB"
            : header === "External Vendor Required"
              ? "VENDOR"
              : header === "Reassign"
                ? "REDT"
                : header === "Cancel Work Order"
                  ? "CANCEL"
                  : header === "Put On Hold"
                    ? "HOLD"
                    : "",
        TEAM_ID:
          ASSIGN_TEAM_ID1?.TEAM_ID !== undefined
            ? ASSIGN_TEAM_ID1?.TEAM_ID
            : "",
        TECH_ID: [technicianID],
        REASON_ID: Reason?.REASON_ID,
        REMARKS: Remark,
        REASSIGN_TYPE: REASSIGN_TYPE,
        DUPLICATE_BY: WO_NO.WO_NO ? WO_NO.WO_NO
          : null,
        SUB_STATUS: subStatus,
        PARA:
          header === "Collaborate"
            ? { para1: `Collaborator`, para2: "added" }
            : header === "External Vendor Required"
              ? { para1: `External Vednor`, para2: "added" }
              : header === "Reassign"
                ? { para1: `Reassign`, para2: "added" }
                : header === "Cancel Work Order"
                  ? { para1: `CANCEL`, para2: "added" }
                  : header === "Put On Hold"
                    ? { para1: `HOLD`, para2: "added" }
                    : "",
      };

      if (
        Object.keys(errors).length === 0 ||
        payload?.TEAM_ID !== "" ||
        payload?.WORK_FROCE_ID !== ""
      ) {

        try {
          const res = await callPostAPI(ENDPOINTS?.REDIRECT_WO, payload);
          if (res?.FLAG === true) {
            getOptionDetail(WO_ID)
            getOptionDetails(WO_ID);
            setInputDialogVisible(false);
            if (header !== "Reassign" && header !== "Collaborate" && header !== "External Vendor Required" && header !== "Cancel Work Order" && header !== "Put On Hold") {
              handlingStatus(
                e,
                REMARK ?? '',
                statusCode,
                "HOLD",
                payload?.REASON_ID
              );
            } else if (header === "Reassign" && header === "Collaborate" && header === "External Vendor Required" && header === "Cancel Work Order" && header === "Put On Hold") {
              toast.success(res?.MSG);
            }

          } else {
            toast.error(res?.MSG);
          }
        } catch (error: any) {
          toast.error(error);
        }
      }
    } else {
      if (+statusCode === 4) {
        handlingStatus(
          e,
          REMARK,
          statusCode,
          "CANCEL",
          Reason?.REASON_ID
        );
        getOptionDetails(WO_ID);
        setInputDialogVisible(false);

      }
      if (statusCode === 3) {
        getOptionDetails(WO_ID);

        handlingStatus(e, REMARK, 5, "HOLD");
        setInputDialogVisible(false);
      }
    }
  };

  useEffect(() => {
    if (
      !isSubmitting &&
      (Object?.values(errors)[0] as any)?.type === "required"
    ) {
      const check: any = (Object?.values(errors)[0] as any)?.message;
      toast?.error(t(check));
    }
  }, [isSubmitting]);

  useEffect(() => {
    setVisible(redirectStatus)
  }, [])

  const getOptions = async () => {
    try {
      const res = await callPostAPI(ENDPOINTS.GET_SERVICEREQUST_MASTERLIST, { WO_ID: WO_ID });
      if (res?.FLAG === 1) {
        setOptions({
          reason: res?.REASONLIST?.filter((f: any) => f?.STATUS_CODE === +statusCode),
          teamlist: res?.TEAMLIST,
          technicianList: res?.USERLIST,
          vendorList: res?.VENDORLISTLIST
        })
      }
    } catch (error: any) {
      toast.error(error);
    }
  };

  useEffect(() => {
    getOptions();
  }, [ASSIGN_TEAM_ID1, statusCode])

  const getViewWorkOrderList = (data: any) => {
    if (data.REASON_ID === 0) {
      getAPI()
      setValue("WO_NO", "");
      setDuplicateBy(true)
    } else {
      setDuplicateBy(false)
    }
  }

  const getAPI = async () => {
    const res = await callPostAPI(ENDPOINTS.GET_EVENTMASTER, null, 'HD001');
    setDuplicateList([])
    const DUPLICATE_LIST = res.HELPDESKMASTERSLIST.map((element: any) => ({
      REQ_DESC: element.WO_NO + " - " + element.REQ_DESC,
      WO_NO: element.WO_NO
    }))
    setDuplicateList(DUPLICATE_LIST)
  }

  return (
    <>
      <Dialog
        header={header}
        visible={redirectStatus}
        style={{ width: "30vw" }}
        onHide={() => setInputDialogVisible(false)}
      >
        <form onSubmit={handleSubmit(onSubmit)}>

          {header === "Collaborate" && (
            <>
              <div className=" grid grid-cols-1 gap-x-3 gap-y-3">
                <Field
                  controller={{
                    name: "ASSIGN_TEAM_ID",
                    control: control,
                    render: ({ field }: any) => {
                      return (
                        <Select
                          options={options?.teamlist}
                          {...register("ASSIGN_TEAM_ID", {
                            required:
                              header === "Collaborate"
                                ? "Please fill the required fields"
                                : "",
                            onChange:
                              async (e: any) => {
                                await getTechnicianListCollbroate(e?.target?.value?.TEAM_ID)
                              }
                          })}
                          label={"Team"}
                          optionLabel="TEAM_NAME"
                          require={true}
                          invalid={
                            header === "Collaborate"
                              ? errors.ASSIGN_TEAM_ID
                              : ""
                          }
                          setValue={setValue}
                          {...field}
                        />
                      );
                    },
                  }}
                />
                <Field
                  controller={{
                    name: "TECH_ID",
                    control: control,
                    render: ({ field }: any) => {
                      return (
                        <Select
                          options={technician}
                          {...register("TECH_ID", {
                            required:
                              header === "Collaborate"
                                ? "Please fill the required fields"
                                : "",
                          })}
                          label={"Collaborate With "}
                          optionLabel="USER_NAME"
                          findKey={"USER_ID"}
                          require={true}
                          invalid={
                            header === "Collaborate" ? errors.TECH_ID : ""
                          }
                          setValue={setValue}
                          {...field}
                        />
                      );
                    },
                  }}
                />
              </div>
            </>
          )}

          {header === "Reassign" && (
            <>
              <div className=" grid grid-cols-1 gap-x-3 gap-y-3">
                <Field
                  controller={{
                    name: "TECH_ID",
                    control: control,
                    render: ({ field }: any) => {
                      return (
                        <Select
                          options={options?.technicianList}
                          {...register("TECH_ID", {
                            required:
                              header === "Reassign"
                                ? "Please fill the required fields"
                                : "",
                          })}
                          label={"Assign To"}
                          optionLabel="USER_NAME"
                          findKey={"USER_ID"}
                          require={true}
                          setValue={setValue}
                          invalid={header === "Reassign" ? errors.TECH_ID : ""}
                          {...field}
                        />
                      );
                    },
                  }}
                />
                <Field
                  controller={{
                    name: "WO_REASON",
                    control: control,
                    render: ({ field }: any) => {
                      return (
                        <Select
                          options={options?.reason}
                          {...register("WO_REASON", {
                            required:
                              header === "Reassign"
                                ? "Please fill the required fields"
                                : "",
                          })}
                          label={"Reason"}
                          optionLabel="REASON_DESC"
                          findKey={"USER_ID"}
                          require={true}
                          setValue={setValue}
                          invalid={
                            header === "Reassign" ? errors.WO_REASON : ""
                          }
                          {...field}
                        />
                      );
                    },
                  }}
                />
              </div>
            </>
          )}

          {header === "External Vendor Required" && (
            <Field
              controller={{
                name: "TECH_ID",
                control: control,
                render: ({ field }: any) => {
                  return (
                    <Select
                      options={options?.vendorList}
                      {...register("TECH_ID", {
                        required:
                          header === "External Vendor Required"
                            ? "Please fill the required fields"
                            : "",
                      })}
                      label={"Vendor"}
                      optionLabel="USER_NAME"
                      findKey={"USER_ID"}
                      require={true}
                      setValue={setValue}
                      invalid={
                        header === "External Vendor Required" ? errors?.TECH_ID : ""
                      }
                      {...field}
                    />
                  );
                },
              }}
            />
          )}

          {header === "Cancel Work Order" && (
            <>
              <Field
                controller={{
                  name: "WO_REASON",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <Select
                        options={options?.reason}
                        {...register("WO_REASON", {
                          required:
                            header === "Cancel Work Order"
                              ? "Please fill the required fields"
                              : "",
                          onChange: ((e: any) => {
                            getViewWorkOrderList(e?.target?.value);
                          })
                        })}
                        label={"Reason"}
                        optionLabel="REASON_DESC"
                        findKey={"USER_ID"}
                        filter={true}
                        require={true}
                        invalid={
                          header === "Cancel Work Order" ? errors?.WO_REASON : ""
                        }
                        setValue={setValue}
                        {...field}
                      />
                    );
                  },
                }}
              />
              {DuplicateBy === true &&
                <Field
                  controller={{
                    name: "WO_NO",
                    control: control,
                    render: ({ field }: any) => {
                      return (
                        <Select
                          options={DuplicateList}
                          {...register("WO_NO", {
                            required:
                              header === "Cancel Work Order"
                                ? "Please fill the required fields"
                                : "",
                          })}
                          label={"Duplicate By"}
                          optionLabel="REQ_DESC"
                          findKey={"WO_NO"}
                          require={true}
                          invalid={
                            header === "Cancel Work Order" ? errors?.WO_NO : ""
                          }
                          setValue={setValue}
                          {...field}
                        />
                      );
                    },
                  }}
                />}

            </>
          )}

          <div className="mt-2">
            <label className="Text_Secondary Input_Label ">
              Remarks (max 250 characters){" "}
              {header === "Put On Hold" ?
                " "
                // <span className="text-red-600"> *</span>
                : " "}
            </label>
            <Field
              controller={{
                name: "WO_REMARKS",
                control: control,
                render: ({ field }: any) => {
                  return (<InputTextarea
                    {...register("WO_REMARKS",
                      {
                        onChange: (e: any) => handleInputChange(e)
                      }
                    )}
                    rows={4}
                    require={true}
                    maxlength={250}
                    placeholder="Provide additional details (Optional)"
                    setValue={setValue}
                    {...field}
                  />
                  );
                },
              }}
            />
            <label className={` ${Remarklength === 250 ? "text-red-600" : "Text_Secondary"} Helper_Text`}>
              {t(`Up to ${Remarklength}/250 characters.`)}
            </label>

          </div>

          <div className="flex justify-end mt-5">
            <Button
              className="Cancel_Button  me-2"
              type="button"
              label={"Cancel"}
              onClick={() => {
                setVisible(false);
                clearErrors();
                setRedirecStatus(false)
                setVisible1(true)
              }}
            />
            <Button
              id="onHold"
              name="Save"
              className="Primary_Button"
              label={"Submit"}
            />
          </div>
        </form>
      </Dialog>
    </>
  );
};

export default WorkorderRedirectDialogBox;
