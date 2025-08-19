import React, { memo, useEffect, useState } from "react";
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
import { InputTextarea } from "primereact/inputtextarea";


const WorkOrderDialogBox = ({
  header,
  // title,
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
  // STATUS_CODE,
  getOptionDetails,
  currentStatus,
  // op,
  isReopen,
  errors,
  singnature,
  isSubmitting
}: any) => {
  //const sigCanvas = useRef<any | null>({});
  const navigate: any = useNavigate();
  const [visible, setVisible] = useState<boolean>(false);
  const [signature, setSignature] = useState<boolean>(false);
  //const [checkRemarks, setRemarks] = useState<boolean>(false);
  // const [checkVerifyBy, setVerifyBy] = useState<boolean>(false);
  const [isShowTextbox, setisShowTextbox] = useState<boolean>(false);
  const[rectifiedStatus, setRecitifedStatus] = useState<any | null>(false);
  const [error, setError] = useState(false);
  const [options, setOptions] = useState<any | null>([]);
  // const [DocList, setDocList] = useState<any | null>([]);
  const [Descriptionlength, setDescriptionlength] = useState(0);
  const [technician, setTechnician] = useState<any | null>([]);
  const { clearErrors } = useForm();
  const [IsSubmit, setIsSubmit] = useState<any | null>(false);
  const [event, setEvent] = useState<any | null>(null)
  const [IsCancel, setIsCancel] = useState<any | null>(false);
  const [loader, setloader] = useState<any | null>(false)
  const setInputDialogVisible = () => {
    setSignature(false)
    setEvent(null)
    // setRemarks(false)
    setIsCancel(true)
    setisShowTextbox(false)
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
    setloader(false)
    setIsSubmit(false)
    clearErrors();
    setRecitifedStatus(false)
  };
  const { t } = useTranslation();
  const [sigPad, setSigpad] = useState<any | null>(singnature);

  const status: any = ['0', 'Reassign', 'Collaborate', "External_Vendor", "Cancel_WorkOrder", "Put On Hold"]
  const statusId: any = ['0', 'Reassign', 'Collaborate', "External_Vendor", "Cancel_WorkOrder", "Put_On_Hold"]
  const watch1: any = watch("ASSIGN_TEAM_ID");
  const watch2: any = watch("TECH_ID");
  const statusCode: any = watch("STATUS_CODE");
  const REMARK: any = watch("REMARK");
  const verify: any = watch("VERIFY");
  const rectID: any = watch("RECT_ID");
  const clearSign = () => {
    sigPad.clear();
  };


  const woDocumentUpload: any = [
    {
      key: 1,
      status: "B",
      label: "Upload Before Files"
    },
    {
      key: 2,
      status: "A",
      label: "Upload After Files"
    }
  ]

  const watchRemark = watch("REMARK");
  const watchVerify = watch("VERIFY");

  const getDocmentList = async (WO_ID: any) => {
    setloader(true)
    try {

      const res = await callPostAPI(ENDPOINTS.GET_DOCLIST, {
        WO_ID: WO_ID
      }, "HD001");
      if (res?.FLAG === 1) {

        //setDocList(res?.WORKORDERDOCLIST)
        setValue("DOC_LIST", res?.WORKORDERDOCLIST)

      }
    } catch (error: any) {
      setloader(false)

    } finally {
      setloader(false)
    
    }
  }

  useEffect(() => {
    (async function () {
      await getDocmentList(localStorage.getItem("WO_ID"))
    })();

  }, [visible])

  const handlerSave = (e: any) => {
    setIsSubmit(true)
   debugger
    if (watchRemark !== undefined && currentStatus === 4 && (!signature || signature)) {
      let type: any = currentStatus === 4 ? 'Complete' : 'RCT'
      if (type === "Complete") {
        if (sigPad?.isEmpty() === true) {
          toast.error("Please fill the required fields");
          setIsSubmit(false)
          setError(true)
          return true
        }

        handlingStatus(true, e, REMARK, statusCode?.STATUS_CODE, type, "", sigPad?.toDataURL(), verify)
      } else {
        toast.error("Please fill the required fields ");
        setIsSubmit(false)
        setError(true);
      }
    } else if (watchRemark !== undefined || statusCode !== undefined || signature) {
      let type: any = currentStatus === 4 ? 'Complete' : 'RCT'
      if (type === "RCT") {
           setRecitifedStatus(true)
            setIsSubmit(false)
        handlingStatus(true, e, watchRemark, statusCode?.STATUS_CODE, type, "", sigPad?.toDataURL(), verify, rectID.RECT_ID)
        setRecitifedStatus(false)
        setVisible(false);
        setError(false);
      }
    }
    else {
      toast.error("Please fill the required fields");
      setIsSubmit(false)
      setError(true);
    }
  }

  const onsubmitHnadler = async () => {
    if (IsSubmit) return true
    setIsSubmit(true)
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
        setIsSubmit(false)
        toast.error(res?.MSG);
      }
    } catch (error: any) {
      toast(error);
    } finally {
      setIsSubmit(false)
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
    if (visible) {
      (async function () {
        await getOptions();
      })();
      setValue("REMARK", "");
    }
  }, [visible]);

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
    } else if (event) {
      setisShowTextbox(false);
    } else {
      setisShowTextbox(false);
    }

  }

  const handlerWorkOrderStatus = (status: any) => {
    setVisible(status)
  }

  const handleInputChange = (event: any) => {
    const value = event.target.value;
    setDescriptionlength(value.length);
  };

  return (
    <>
      <Button
        type="button"
        label={label}
        className="Primary_Button mr-2 "
        disabled={rectifiedStatus}
        onClick={() => {

          setInputDialogVisible()
          if(header === "Rectified"){
          setRecitifedStatus(true)
          // op?.current?.hide()
          }
        }}
      />
      <Dialog
      // blockScroll={true}
        className="complete-dialog"
        header={header}
        visible={visible}
        style={{ width: "40vw" }}
        onHide={() => {setInputDialogVisible()
         setRecitifedStatus(false)}
        }
      >
        <form>
          {header === "Redirect" ?
            <>
              <Field
                controller={{
                  name: "ASSIGN_TEAM_ID",
                  control: control,
                  render: ({ field }: any) => {
                    if (
                      decryptData(localStorage.getItem("ROLE_NAME")) === "Technician"
                    ) {

                    } else {
                      // const singleTeam =
                      //   options?.teamList?.length === 1
                      //     ? options?.teamList[0]
                      //     : null;

                    }
                    return (
                      <Select
                        options={options?.teamList}
                        {...register("ASSIGN_TEAM_ID", {
                          required: "Please fill the required fields",
                          onChange: ((e: any) => {
                            (async function () {
                              await getTechnicianList(e?.target?.value?.TEAM_ID)
                            })();

                            setError(false)
                          })
                        })}
                        label={"Team"}
                        optionLabel="TEAM_NAME"
                        findKey={"TEAM_ID"}
                        require={true}
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

<div className=" grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-2 lg:grid-cols-2">
<div className={`${event && watchRemark === "" ? "errorBorder" : ""}`}>
<label className="Text_Secondary Helper_Text  ">
Remarks <span className="text-red-600"> *</span></label>
                <Field
                  controller={{
                    name: "REMARK",
                    control: control,
                    render: ({ field }: any) => {
                      return (<InputTextarea
                        label="Remarks"
                        {...register("REMARK", {
                          required: "Please fill the required fields",
                        })}
                                          rows={3}
                                          maxlength={250}
                                          setValue={setValue}
                                          require={true}
                                          invalid={errors.REMARK}
                                          {...field}
                                        />
                                        );
                    },
                  }}
                />
              </div>
              <div>
              <Field
                  controller={{
                    name: "SIG",
                    control: control,
                    render: ({ field }: any) => {
                      return (
                        <div>
                          <div className="flex justify-between">
                            <label className="Text_Secondary Input_Label">
                              {("Digital Signature")}
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
                              {("Clear")}
                            </button>
                          </div>
                          <div className={`${event && !signature ? "errorBorder" : ""}` }>
                            <ReactSignatureCanvas
                              {...field}
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
              </div>
              <div className={`${event && watchVerify === '' ? "errorBorder" : ""}`}>
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
            </div>
</div>
             
            </> :
              <></>}</>
          }

         

          {header === 'Rectified'
            ?
            <>
              <div className={`${header === 'Rectified' && event && rectID === '' ? "errorBorder" : ""} mb-2` }>
               
                <Field
  controller={{
    name: "RECT_ID",
    control: control,
    render: ({ field }: any) => {
      return (
        <div className="w-full"> {/* Ensure the container takes full width */}
          <Select
            options={options?.rectList}
            {...register("RECT_ID", {
              required: "Please fill the required fields",
              onChange: ((e: any) => {
                (async function () {
                  await ReasonDetails(e?.target?.value?.RECT_ID);
                })();

                setError(false);
              }),
            })}
            label={"Reason"}
            optionLabel="COMMENT_DESC"
            optionValue="RECT_ID"
            findKey={"USER_ID"}
            require={true}
            setValue={setValue}
            invalid={errors.RECT_ID}
            {...field}
            className="w-full text-left" // Full width and left-aligned text
          />
        </div>
      );
    },
  }}
/>

              </div>

              <>{(header === 'Rectified' && event && watchRemark === '' && isShowTextbox)}</>
              {isShowTextbox &&
                <div className={`${header === 'Rectified' && event && watchRemark === '' && isShowTextbox ? "errorBorder" : ""}`}>
                  <Field
                    controller={{
                      name: "REMARK",
                      control: control,
                      render: ({ field }: any) => {
                        return (
                          <InputField
                            label="Remarks (max 250 characters)"
                           
                            {...register("REMARK", {
                              required: isShowTextbox ? "Please fill the required field" : "",
                              onChange: (e: any) => handleInputChange(e)
                            })}
                            setValue={setValue}
                            maxLength={250}
                            require={true}
                            invalid={errors.REMARK}
                            {...field}
                          />
                        );
                      },
                    }}
                  />
                    <label
                          className={`${Descriptionlength === 250
                            ? "text-red-600"
                            : "Text_Secondary"
                            } Helper_Text`}
                        >
                          {(` ${Descriptionlength}/250 characters.`)}
                        </label>
                </div>
              }
              {/* <Field
                controller={{
                  name: "DOC",
                  control: control,
                  render: ({ field }: any) => {
                    return (<div>
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
                          uploadLabel="Upload Before Files"
                          setIsSubmit={setIsSubmit}
                          IsCancel={IsCancel}
                        />
                      </div>
                    </div>
                    )
                  }
                }}

              /> */}
              {woDocumentUpload?.map((doc: any) => {

                return (

                  <div className="col-span-2" key={doc?.key} >
                    <WoDocumentUpload
                      loader={loader}
                      register={register}
                      control={control}
                      setValue={setValue}
                      watch={watch}
                      getValues={getValues}
                      errors={errors}
                      uploadtype={doc?.status}
                      uploadLabel={doc?.label}
                      setIsSubmit={setIsSubmit}
                      IsCancel={IsCancel}
                      Docstatus={doc}
                      isReopen={isReopen}
                    />
                  </div>
                )
              })}

              <hr className="mt-2 mb-2"></hr>
              {/* <Field
                controller={{
                  name: "DOC",
                  control: control,
                  render: ({ field }: any) => {
                    return (<div>
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
                          uploadLabel="Upload After Files"
                          setIsSubmit={setIsSubmit}
                          IsCancel={IsCancel}
                        />
                      </div>
                    </div>)
                  },
                }}

              /> */}
            </>
            : <></>
          }

          <div className="flex justify-end mt-5">

            <Button
              className="Cancel_Button "
              type="button"
              label={"Cancel"}
              onClick={setInputDialogVisible}
            />

            {header === "Redirect" ?
              <>
                <Button
                  name={name}
                  type="button"
                  className="Primary_Button me-2"
                  disabled={IsSubmit}
                  id={name}
                  label={"Save"}
                  onClick={() =>
                    onsubmitHnadler()
                  }
                >

                </Button></> :

              <>
                {header === 'Rectified' || header === 'Complete' ? <Button
                  className="Primary_Button"
                  type="button"
                  disabled={IsSubmit}
                  label={"Submit"}
                  onClick={(e: any) => {
                    if (IsSubmit) return true
                    setEvent(e)

                    if (label === 'Rectified' && (watchRemark === "" && isShowTextbox)) {

                      toast.error("Please fill the required fields")
                      setIsSubmit(false)
                      return
                    }
                    else if (label === 'Rectified' && (!isShowTextbox && rectID === "")) {
                      toast.error("Please fill the required fields")
                      setIsSubmit(false)
                      return
                    }
                    else if (label === 'Rectified' && ((isShowTextbox && watchRemark !== "") || (!isShowTextbox && rectID !== ""))) {
                      handlerSave(e)
                      return
                    } else if (label === 'Complete' && watchRemark === "") {
                      toast.error("Please fill the required fields")
                      setIsSubmit(false)
                      return
                    } else if (label === 'Complete' && verify === "") {
                      toast.error("Please fill the required fields")
                      setIsSubmit(false)
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

          </div>
        </form>
      </Dialog>
    </>
  );
};

export default memo(WorkOrderDialogBox);