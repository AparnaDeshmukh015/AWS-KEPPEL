import React, { useEffect, useRef, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import "../Button/Button.css";
import "../DialogBox/DialogBox.css";
import Field from "../../components/Field";
import { toast } from "react-toastify";
import { callPostAPI } from "../../services/apis";
import { ENDPOINTS } from "../../utils/APIEndpoints";
import Select from "../Dropdown/Dropdown";
import { useNavigate } from "react-router-dom";
import WorkorderRedirectDialogBox from "./WorkorderRedirectDialog";
import InputField from "../Input/Input";
import { useForm } from "react-hook-form";
import ReactSignatureCanvas from "react-signature-canvas";
import { useTranslation } from "react-i18next";
import WoDocumentUpload from "../pageComponents/DocumentUpload/WoDocumentUpload";
import { appName } from "../../utils/pagePath";
import { decryptData } from "../../utils/encryption_decryption";

type workDialog = {
  header: string;
  title: string;
  control: any;
  setValue: any;
  register: any;
  name?: string;
  REMARK?: string;
  handlingStatus?: any;
  watch: any;
  label: any;
  ASSIGN_TEAM_ID?: string;
};

const WorkOrderDialogBox = ({
  header,
  title,
  control,
  setValue,
  getValues,
  register,
  name,
  handlingStatus,
  watch,
  label,
  ASSIGN_TEAM_ID,
  WO_ID,
  getAPI,
  STATUS_CODE,
  getOptionDetails,
  currentStatus,
  op,
  errors,
  isSubmitting
}: any) => {
  const sigCanvas = useRef<any | null>({});
  const navigate: any = useNavigate();
  const [visible, setVisible] = useState<boolean>(false);
  const [signature, setSignature] = useState<boolean>(false);
  const [checkRemarks, setRemarks] = useState<boolean>(false);
  const [checkVerifyBy, setVerifyBy] = useState<boolean>(false);
  const [isShowTextbox, setisShowTextbox] = useState<boolean>(false);
  const [error, setError] = useState(false);
  const [options, setOptions] = useState<any | null>([]);
  const [technician, setTechnician] = useState<any | null>([]);
  const { clearErrors } = useForm();
  const [IsSubmit, setIsSubmit] = useState<any | null>(false);
  const setInputDialogVisible = (e: any) => {
    setRemarks(false)
    setVisible(!visible);
    setValue("REMARK", "");
    setValue("STATUS_CODE", "")
    setValue("WO_REMARKS", "")
    setValue("VERIFY_BY", "")
    setValue("VERIFY", "")
    setValue("WO_REASON", "")
    setValue("ASSIGN_TEAM_ID", "")
    setValue("TECH_ID", "")
    setValue("RECT_ID", "")
    clearErrors();
  };
  const { t } = useTranslation();
  const [
    sigPad, setSigpad] = useState<any | null>();
  const status: any = ['0', 'Reassign', 'Collaborate', "External_Vendor", "Cancel_WorkOrder", "Put On Hold"]
  const statusId: any = ['0', 'Reassign', 'Collaborate', "External_Vendor", "Cancel_WorkOrder", "Put_On_Hold"]
  const watch1: any = watch("ASSIGN_TEAM_ID");
  const watch2: any = watch("TECH_ID");
  const statusCode: any = watch("STATUS_CODE");
  const REMARK: any = watch("REMARK");
  const WO_REMARKS: any = watch("WO_REMARKS");
  const VERIFY_BY: any = watch("VERIFY_BY");
  const verify: any = watch("VERIFY");
  const rectID: any = watch("RECT_ID");

  let rectList: any = [];

  const clearSign = () => {
    sigPad.clear();
  };
  const watchRemark = watch("REMARK");
  const handlerSave = (e: any) => {

    setRemarks(false)
    if (WO_REMARKS === "" || WO_REMARKS === null) {
      setRemarks(true)
    }
    else if (VERIFY_BY === "" || VERIFY_BY === null) {
      setVerifyBy(true)
    }

    if (watchRemark !== undefined && currentStatus === 4 && (signature === false || signature === true)) {
      let type: any = currentStatus === 4 ? 'Complete' : 'RCT'
      if (type == "Complete") {
        if (sigPad?.isEmpty() === true) {
          toast.error("Please enter the signature ");
          setError(true)
          return true
        }

        handlingStatus(e, REMARK, statusCode?.STATUS_CODE, type, "", sigPad?.toDataURL(), verify)
      } else {
        toast.error("Please fill the required fields ");
        setError(true);
      }
    } else if (watchRemark !== undefined || statusCode !== undefined || signature === true) {
      let type: any = currentStatus === 4 ? 'Complete' : 'RCT'
      if (type == "RCT") {
        handlingStatus(e, watchRemark, statusCode?.STATUS_CODE, type, "", sigPad?.toDataURL(), verify, rectID.RECT_ID)
        setVisible(false);
        setError(false);
      }
    }
    else {
      toast.error("Please fill the required fields ");
      setError(true);
    }
  }

  const onsubmitHnadler = async () => {
    const payload: any = {
      WO_ID: WO_ID,
      MODE: "REDT",
      TEAM_ID: watch1?.TEAM_ID,
      WORK_FROCE_ID: watch2?.USER_ID,
      REMARK: REMARK,
      PARA: { para1: `Work order`, para2: "redirect" }
    };

    try {
      const res = await callPostAPI(ENDPOINTS?.REDIRECT_WO, payload);
      if (res?.FLAG === true) {
        toast.success(res?.MSG);
        if (header !== "Collaborate") {
          getAPI();
          navigate(`${appName}/workorderlist`);
          setVisible(false);
          setError(false);
        } else {
          navigate(`${appName}/workorderlist?edit=`);
          getOptionDetails(WO_ID);
          setVisible(false);
          setError(false);
        }
      } else {
        toast.error(res?.MSG);
      }
    } catch (error: any) {
      toast(error);
    }
  };
  const getOptions = async () => {
    try {
      const res = await callPostAPI(ENDPOINTS.GET_SERVICEREQUST_MASTERLIST, {});

      if (res?.FLAG === 1) {
        setOptions({
          teamList: res?.TEAMLIST,
          statusList: res?.STATUSLIST,
          vendorList: res?.VENDORLISTLIST,
          technicianList: res?.USERLIST?.filter((f: any) => f?.ROLETYPECODE === "T" || f?.ROLETYPECODE === "TL"),
          resonList: res?.REASONLIST,
          rectList: res?.RECTCMTLIST

        });
      }
    } catch (error: any) {
      toast.error(error);
    }
  };
  useEffect(() => {
    getOptions();
    setValue("REMARK", "");
  }, []);

  //const ASSIGN_TEAM_ID1: any = watch("ASSIGN_TEAM_ID");
  const getTechnicianList = async (teamId: any) => {
    const res = await callPostAPI(ENDPOINTS?.GET_TECHNICIANLIST, {
      TEAM_ID: teamId,
    });

    if (res?.FLAG === 1) {
      setTechnician(res?.TECHLIST);
    }
  };

  const ReasonDetails = async (rectid: any) => {
    if (rectid === 0) {
      setisShowTextbox(true);
    } else {
      setisShowTextbox(false);
    }

  }

  const handlerWorkOrderStatus = (status: any) => {
    setVisible(status)
  }

  // useEffect(() => {
  //   if (ASSIGN_TEAM_ID1) {
  //     getTechnicianList();
  //   }
  // }, [ASSIGN_TEAM_ID1]);
  return (
    <>
      <Button
        type="button"
        label={label}
        className="Primary_Button mr-2 "
        onClick={() => {
          setInputDialogVisible(true)
          // op?.current?.hide()
        }}
      />
      <Dialog
        header={header}
        visible={visible}
        style={{ width: "40vw" }}
        onHide={() => setInputDialogVisible(false)}
      >
        <form>


          {header === "Redirect" ?
            <>
              <Field
                controller={{
                  name: "ASSIGN_TEAM_ID",
                  control: control,
                  render: ({ field }: any) => {
                    let teamId: any = "";
                    if (
                      decryptData(localStorage.getItem("ROLE_NAME")) === "Technician"
                    ) {
                      let teamId: any = localStorage.getItem("TEMA_ID");
                    } else {
                      const singleTeam =
                        options?.teamList?.length === 1
                          ? options?.teamList[0]
                          : null;
                      let teamId = singleTeam?.TEAM_ID;
                    }
                    return (
                      <Select
                        options={options?.teamList}
                        {...register("ASSIGN_TEAM_ID", {
                          required: "Please fill the required fields",
                          onChange: ((e: any) => {

                            getTechnicianList(e?.target?.value?.TEAM_ID)
                            setError(false)
                          })
                        })}
                        label={"Team"}
                        optionLabel="TEAM_NAME"
                        // invalid={errors.ASSIGN_TEAM_ID}
                        findKey={"TEAM_ID"}
                        require={true}
                        // selectedData={
                        //   selectedDetails?.ASSIGN_TEAM_ID || parseInt(teamId)
                        // }
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
                    let userId: any = decryptData(localStorage.getItem("USER_ID"));
                    return (
                      <Select
                        options={technician}
                        {...register("TECH_ID", {

                        })}
                        label={"Assign To"}
                        optionLabel="USER_NAME"
                        findKey={"USER_ID"}
                        require={true}

                        setValue={setValue}

                        {...field}
                      />
                    );
                  },
                }}
              />{" "}
            </>
            :
            <>{header === 'Complete' ? <>
              <Field
                controller={{
                  name: "REMARK",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <InputField
                        label="Remarks"
                        {...register("REMARK", {
                          required: "Please fill the required fields",
                        })}

                        setValue={setValue}
                        require={true}
                        invalid={errors.BILL_DATE}
                        {...field}
                      />
                    );
                  },
                }}
              />

              {header === 'Complete'
                ?
                <Field
                  controller={{
                    name: "SIG",
                    control: control,
                    render: ({ field }: any) => {
                      return (
                        <div>
                          <div className="flex justify-between mt-2">
                            <label className="Text_Secondary Input_Label">
                              {t("Digital Signature")}
                              <span className="text-red-600"> *</span>
                            </label>
                            <button
                              className="ClearButton"
                              type="button"
                              onClick={() => {
                                clearSign();
                                setSignature(false);
                              }}
                            >
                              {t("Clear")}
                            </button>
                          </div>
                          <div className={`${error === true ? "errorBorder " : ""}`}>
                            <ReactSignatureCanvas
                              {...field}
                              //  ref={sigCanvas}
                              backgroundColor="#fff"
                              penColor="#7E8083"
                              canvasProps={{ className: "signatureStyle" }}
                              style={{ border: "2px solid black" }}
                              ref={(ref) => setSigpad(ref)}
                              onBegin={() => {
                                setSignature(true);
                              }}
                            />
                          </div>
                        </div>
                      );
                    },
                  }}
                />
                : <></>
              }

            </> :
              <>
                {/* <Field
                  controller={{
                    name: "STATUS_CODE",
                    control: control,
                    render: ({ field }: any) => {
                      return (
                        <Select
                          options={options?.statusList}
                          {...register("STATUS_CODE", {
                            required: "Please fill the required fields",
                            onChange: (() => {
                              setError(false)
                            })
                          })}
                          label={"Sub Status"}
                          optionLabel="STATUS_DESC"
                          findKey={"TEAM_ID"}
                          invalid={error}
                          require={true}
                          setValue={setValue}
                          {...field}
                        />
                      );
                    },
                  }}
                /> */}
              </>}</>
          }

          {header === 'Complete' ?
            <Field
              controller={{
                name: "VERIFY",
                control: control,
                render: ({ field }: any) => {
                  return (
                    <InputField
                      label="Verify By"
                      {...register("VERIFY", {
                        required: "Please fill the required fields",
                      })}

                      setValue={setValue}
                      require={true}
                      invalid={errors.VERIFY}
                      {...field}
                    />
                  );
                },
              }}
            />
            : <></>
          }

          {header === 'Rectified'
            ?
            <>
              <Field
                controller={{
                  name: "RECT_ID",
                  control: control,
                  render: ({ field }: any) => {
                    let userId: any = localStorage.getItem("USER_ID");
                    return (
                      <Select
                        options={options?.rectList}
                        {...register("RECT_ID", {
                          required: "Please fill the required fields",
                          onChange: ((e: any) => {
                            ReasonDetails(e?.target?.value?.RECT_ID)
                            setError(false)
                          })
                        })}
                        label={"Reason"}
                        optionLabel="COMMENT_DESC"
                        optionValue="RECT_ID"
                        findKey={"USER_ID"}
                        require={true}
                        // selectedData={selectedDetails?.TECH_ID || parseInt(userId)}
                        setValue={setValue}
                        invalid={errors.RECT_ID}
                        // invalid={props.selectedData !== undefined ? errors.TECH_ID:""}
                        {...field}
                      />
                    );
                  },
                }}
              />
              {isShowTextbox && <Field
                controller={{
                  name: "REMARK",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <InputField
                        label="Remarks"
                        {...register("REMARK", {
                          required: isShowTextbox ? "Please fill the required fields" : "",
                        })}
                        // invalid={WO_REMARKS==""||WO_REMARKS==null?true:false}
                        // invalid={checkRemarks === true && WO_REMARKS==""}
                        // require={true}
                        setValue={setValue}
                        require={true}
                        invalid={errors.REMARK}
                        {...field}
                      />
                    );
                  },
                }}
              />
              }
              <Field
                controller={{
                  name: "DOC",
                  control: control,
                  render: ({ field }: any) => {
                    return <div>
                      <div className="col-span-2">
                        <WoDocumentUpload
                          {...field}
                          register={register}
                          control={control}
                          setValue={setValue}
                          watch={watch}
                          getValues={getValues}
                          errors={errors}
                          uploadtype="B"
                          uploadLabel="Upload Before Images"
                          setIsSubmit={setIsSubmit}
                        />
                      </div>
                    </div>
                  },
                }}

              />
              <hr className="mt-2 mb-2"></hr>
              <Field
                controller={{
                  name: "DOC",
                  control: control,
                  render: ({ field }: any) => {
                    return <div>
                      <div className="col-span-2">
                        <WoDocumentUpload
                          {...field}
                          register={register}
                          control={control}
                          setValue={setValue}
                          watch={watch}
                          getValues={getValues}
                          errors={errors}
                          uploadtype="A"
                          uploadLabel="Upload After Images"
                          setIsSubmit={setIsSubmit}
                        />
                      </div>
                    </div>
                  },
                }}

              />
            </>
            : <></>
          }

          <div className="flex justify-end mt-5">
            {header === "Redirect" ?
              <>
                <Button
                  name={name}
                  type="button"
                  className="Primary_Button me-2"
                  id={name}
                  label={"Save"}
                  onClick={(e) =>
                    onsubmitHnadler()
                  }
                >

                </Button></> :
              <>{header === 'Rectified' || header === 'Complete' ? <Button
                className="Primary_Button"
                type="button"
                label={"Submit"}
                onClick={(e: any) => {
                  if (label === 'Rectified' && (watchRemark === "" && isShowTextbox)) {
                    toast.error("Please Enter Remarks")
                    return
                  }
                  else if (label === 'Rectified' && (isShowTextbox === false && rectID === "")) {
                    toast.error("Please Enter Reason")
                    return
                  }
                  else if (label === 'Rectified' && ((isShowTextbox && watchRemark !== "") || (isShowTextbox === false && rectID != ""))) {
                    handlerSave(e)
                    return
                  } else if (label === 'Complete' && watchRemark === "") {
                    toast.error("Please Enter Remarks")
                    return
                  } else if (label === 'Complete' && verify === "") {
                    toast.error("Please Enter Verify By")
                    return;
                  } else if (label === 'Complete' && watchRemark != "" && verify != "") {
                    handlerSave(e)
                    return;
                  }
                }
                }

              >
              </Button> :
                <>
                  {statusCode !== "" ? <WorkorderRedirectDialogBox
                    header={status[parseInt(statusCode?.STATUS_CODE)]}
                    control={control}
                    setValue={setValue}
                    register={register}
                    name={statusId[parseInt(statusCode?.STATUS_CODE)]}
                    REMARK={"REMARK"}
                    handlingStatus={handlingStatus}
                    watch={watch}
                    label={"Yes"}
                    handlerWorkOrderStatus={handlerWorkOrderStatus}
                    ASSIGN_TEAM_ID={ASSIGN_TEAM_ID}
                    WO_ID={WO_ID}
                    getOptionDetails={getOptionDetails}
                    teamList={options?.teamList}
                    vendorList={options?.vendorList}
                    statusCode={statusCode}
                    technicianList={options?.technicianList}
                    resonList={options?.resonList}
                    errors={errors}
                    isSubmitting={isSubmitting}
                  /> : <> <Button
                    name={name}
                    type="button"
                    className="Primary_Button me-2"
                    id={name}
                    label={"Submit"}
                    onClick={() => {
                      toast.error("Please select sub status")
                      setError(true)
                    }}
                  >
                  </Button>
                  </>}
                </>}
              </>
            }
            <Button
              className="Cancel_Button "
              type="button"
              label={"Cancel"}
              onClick={setInputDialogVisible}
            />
          </div>
        </form>
      </Dialog>
    </>
  );
};

export default WorkOrderDialogBox;