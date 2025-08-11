import React, { useEffect, useState } from "react";
import Button from "../../../../components/Button/Button";
import { Dialog } from "primereact/dialog";
import { InputTextarea } from "primereact/inputtextarea";
import Field from "../../../../components/Field";
import SuccessDialog from "./SuccessDialog";
import Select from "../../../../components/Dropdown/Dropdown";
import { onChange } from "react-toastify/dist/core/store";
import { get } from "http";
var payload: any;
var redirectdata: any = [];
var getindex: number = 0;
var reasonID: number;
//let indexgetStatus: any;
const RedirectWoDialog = ({
  header,
  control,
  setValue,
  register,
  paragraph,
  watch,
  errors,
  getOptions,
  updateWOStatusInfra,
  MapButtons,
  reasonList
}: any) => {

  // let headerText: any = "";
  const [headerText, setheaderText] = useState<string>("");
  const [visible, setVisible] = useState<boolean>(false);
  const [visibleOther, setVisibleOther] = useState<boolean>(false);
  const [indexgetStatus, setIndexgetStatus] = useState<any | null>({});
  const [reasonids, setreasonids] = useState<any | null>();
  const statusList: any = [
    {
      code: "1",
      header: "Reassign",
      description: "Transfer work order to another technician ",
      Mapindex: 104
    },
    {
      code: "2",
      header: "Awaiting Spares",
      description: "Work order on hold pending spare parts ",
      Mapindex: 108
    },
    {
      code: "3",
      header: "Awaiting Shutdown",
      description: "Work order pending scheduled shutdown",
      Mapindex: 109
    },
    {
      code: "4", header: "Awaiting Others", description: "Work order awaiting external dependencies",
      Mapindex: 110
    },
    {
      code: "5",
      header: "Awaiting Contractor",
      description: "Work order pending contractor availability",
      Mapindex: 111
    },
    {
      code: "6",
      header: "To Be Resumed",
      description: "Work order to be resumed at a later time",
      Mapindex: 116
    },
    {
      code: "7",
      header: "Others",
      description: "Other reasons for redirecting the work order",
      Mapindex: 117
    },
    {
      code: "8",
      header: "Awaiting Spares",
      description: "Work order on hold pending spare parts ",
      Mapindex: 135
    },
    {
      code: "9",
      header: "Awaiting Shutdown",
      description: "Work order pending scheduled shutdown",
      Mapindex: 136
    },
    {
      code: "10", header: "Awaiting Others", description: "Work order awaiting external dependencies",
      Mapindex: 137
    },
    {
      code: "11",
      header: "Awaiting Contractor",
      description: "Work order pending contractor availability",
      Mapindex: 138
    },
  ];
  const resetFields = () => {
    setValue("REMARKS", "");
    setValue("AWAIT_REMARKS", "");
    setValue("REASON_ID", "");
  }

  const [visibleReassign, setVisibleReassign] = useState<boolean>(false);
  const [reasonId, setreasonId] = useState<boolean>();
  const REMARKS = watch("REMARKS");
  const AWAIT_REMARKS = watch("AWAIT_REMARKS");
  const REASON_ID = watch("REASON_ID");
  

  const [Remarklength, setRemrksCount] = useState<number>(0);
  const [error, setError] = useState<any>(false)
  // const [selectedDetails, setSelectedDetails] = useState<any>([]);

  useEffect(() => {
    if (REASON_ID !== undefined && REASON_ID !== "") {
      setreasonId(REASON_ID?.REASON_ID);
    }
  }, [(REASON_ID !== undefined && REASON_ID !== "")])
  const OpenRedirectPopUp = () => {
    setVisible(!visible);
  };
  // const watchAll: any = watch();
  const CloseRedirectPopUp = () => {
    setVisible(false);
    setIndexgetStatus(((prev: any) => ({
      ...prev,
      REMARKS: ""
    }))

    )
    // indexgetStatus = { ...indexgetStatus, REMARKS: "" }
    setValue("AWAIT_REMARKS", "");
    setError(false)

  };
  const CloseRedirectOtherPopUp = () => {
    setVisibleOther(false);
    setIndexgetStatus(((prev: any) => ({
      ...prev,
      REMARKS: ""
    }))
    )
    setValue("AWAIT_REMARKS", "");
    setError(false)
    setVisible(true)
    //   indexgetStatus = { ...indexgetStatus, REMARKS: "" }
  };

  const setRedirectDialogVisible = (
    e: any,
    header_Text: any,
    index: any,
    Status_Code: any
  ) => {

    if (e.header === "Reassign" && e.code === "1") {


      getindex = e?.Mapindex;
      payload = {
        ACTION_ID: e?.Mapindex,
        REMARKS: AWAIT_REMARKS,
        REASONID_INFRA: REASON_ID
      }
      setIndexgetStatus(payload);
      setVisibleReassign(!visibleReassign);

    } else {
      getindex = e?.Mapindex;

      payload = {
        ACTION_ID: getindex,
        REMARKS: AWAIT_REMARKS,
      }

      setIndexgetStatus(payload);
      setVisibleOther(!visibleOther);
      setheaderText(header_Text);
    }
    setVisible(false);

  };


  useEffect(() => {

    redirectdata = []
    MapButtons?.map((i: any, index: any) => {
      statusList?.map((s: any, index1: any) => {
        if (MapButtons[index] == statusList[index1]?.Mapindex) {
          redirectdata.push(statusList[index1])
        }
      })
    })
  }, [MapButtons]);
  const handleInputChange = (event: any) => {
    const charLenth = event?.target?.value;

    if (event?.target?.value.length !== 0) {
      setError(false)
    }
    setRemrksCount(charLenth.length);

    setIndexgetStatus(((prev: any) => ({
      ...prev,
      REMARKS: charLenth,
      REASONID_INFRA: REASON_ID?.REASON_ID
    }))
    )

  };

  useEffect(() => {
    setRemrksCount(0)
  }, [visible, visibleOther, visibleReassign])
  const CancelWorkorder = async () => {
    setVisibleOther(!visibleOther);
    setIndexgetStatus(((prev: any) => ({
      ...prev,
      REMARKS: ""
    }))
    )
    setValue("AWAIT_REMARKS", "");
    setError(false)
  };

  const CloseReassignPopUp = () => {
    setVisibleReassign(!visibleReassign);
    setValue("REMARKS", "");
    setValue("AWAIT_REMARKS", "");
    setValue("REASON_ID", "");
  
  };
  

  return (
    <>
      <Button
        type="button"
        label={header}
        className="Secondary_Button mr-2 "
        onClick={() => OpenRedirectPopUp()}
      />
      <Dialog
        // header={header}
        visible={visible}
        style={{ width: "550px" }}
        className="dialogBoxStyle"
        onHide={() => CloseRedirectPopUp()}
      >

        <>
          <h6 className="Text_Primary text-center  w-full mb-6">
            Redirect
          </h6>
          {


            // MapButtons?.map((i: any, index: any) => {
            redirectdata?.map((s: any, index: any) => {

              return (
                <div
                  onClick={() =>

                    setRedirectDialogVisible(s, s?.header, index, s?.code)
                  }
                  className="flex  justify-between w-full px-4 py-3  border-2
                          border-gray-200 border rounded-lg mb-3 redirectContainer"
                >
                  <div>
                    <p className=" Text_Primary Header_Text" >
                      {s?.header}
                    </p>
                    <p className="Text_Secondary Helper_Text">{s?.description} </p>
                  </div>
                  <div>
                    <i className="pi pi-angle-right mt-3"></i>
                  </div>
                </div>
              );

              // }
              // )
            }

            )}
        </>

      </Dialog>

      <Dialog
        // header={headerText}
        visible={visibleOther}
        className="dialogBoxStyle"
        style={{ width: "550px" }}
        onHide={() => CloseRedirectOtherPopUp()}
      >
        <div className=" flex flex-col gap-6">
          <h6 className="Text_Primary ">
            {headerText}
          </h6>
          <div>
            <p className="Text_Secondary Input_Label">
              Remarks (Max 250 characters)
              {header !== "Request Reassign" ? <span className="text-red-600"> *</span> : <></>}
            </p>

            <div className={`${error && header !== "Request Reassign" ? "errorBorder" : ""}`}>
              <Field
                controller={{
                  name: "AWAIT_REMARKS",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <InputTextarea
                        {...register("AWAIT_REMARKS", {
                          required: header !== "Request Reassign" ? "Please fill the requried fields" : "",
                          onChange: (e: any) => handleInputChange(e),
                        })
                        }
                        maxLength={250}
                        placeholder="Provide additional details"
                        // invalid={error? error:false
                        // }
                        rows={7}
                        setValue={setValue}
                        {...field}


                      />
                    );
                  },
                }}
              />
            </div>
            <label className={` ${Remarklength === 250 ? "text-red-600" : "Text_Secondary"} Helper_Text`}>
              {(`${Remarklength}/250 characters`)}
            </label>

          </div>
          <div className="flex justify-end gap-3">
            <Button
              name="Cancel"
              className="Cancel_Button"
              type="button"
              label={"Cancel"}
              onClick={() => CancelWorkorder()}
            />
            <SuccessDialog
              header={"Submit"}
              control={control}
              setValue={setValue}
              register={register}
              paragraph={"Your request has been successfully submitted."}
              watch={watch}
              errors={errors}
              payload={indexgetStatus}
              updateWOStatusInfra={updateWOStatusInfra}
              Actioncode={getindex}
              CloseRedirectPopUp={CloseRedirectPopUp}
              CloseRedirectOtherPopUp={CloseRedirectOtherPopUp}
              setError={setError}
            />
          </div>
        </div>
      </Dialog>

      <Dialog
        // header="Request Reassign"
        visible={visibleReassign}
        style={{ width: "550px" }}
        className="dialogBoxStyle"
        onHide={() => CloseReassignPopUp()}
      >
        <form>


          <div className="grid grid-cols-1 gap-6">
            <h6 className="Text_Primary ">
              Request Reassign
            </h6>
            <div>
              <Field
                controller={{
                  name: "REASON_ID",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <Select
                        options={reasonList}
                        {...register("REASON_ID",

                          {
                            required: "Please fill the requried fields.",

                            onChange: (e: any) => {
                              setIndexgetStatus(((prev: any) => ({
                                ...prev,

                                REASONID_INFRA: e?.target?.value?.REASON_ID
                              }))
                              )
                              //  REASON_ID = e?.value;

                            }

                          }

                        )}
                        filter={true}
                        label="Reason"
                        optionLabel="REASON_DESCRIPTION"
                        findKey={"REASON_ID"}
                        // selectedData={selectedDetails?.REASON_ID}
                        setValue={setValue}
                        invalid={errors.REASON_ID}
                        require={true}
                        {...field}
                      />
                    );
                  },
                }}
              />
            </div>
            <div>
              <p className="Text_Secondary Input_Label">
                Remarks (Max 250 characters)
                {/* <span className="text-red-600"> *</span> */}
              </p>

              <Field
                controller={{
                  name: "REMARKS",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <InputTextarea
                        {...register("REMARKS", {
                          // required: "Please fill the requried fields",
                          onChange: (e: any) => handleInputChange(e),
                        })}
                        // invalid={errors?.REMARKS}
                        rows={7}
                           maxLength={250}
                        setValue={setValue}
                        placeholder="Provide additional details (Optional)"
                        {...field}
                      />
                    );
                  },
                }}
              />

              <label className={` ${Remarklength === 250 ? "text-red-600" : "Text_Secondary"} Helper_Text`}>
                {(`${Remarklength}/250 characters`)}
              </label>
              {/* <label className="Text_Secondary Helper_Text">
                Up to 0/250 characters
              </label> */}
            </div>
            <div className="flex justify-end gap-3">
              <Button
                name="Cancel"
                className="Cancel_Button"
                type="button"
                label={"Cancel"}
                onClick={() => CloseReassignPopUp()}
              />
              <SuccessDialog
                // indexgetStatus={"abc"}
                header={"Submit"}
                control={control}
                setValue={setValue}
                register={register}
                paragraph={"Your request has been successfully submitted."}
                watch={watch}
                errors={errors}
                payload={indexgetStatus}
                updateWOStatusInfra={updateWOStatusInfra}
                Actioncode={getindex}
                CloseReassignPopUp={CloseReassignPopUp}
                CloseRedirectPopUp={CloseRedirectPopUp}
                CloseRedirectOtherPopUp={CloseRedirectOtherPopUp}
                resetFields={resetFields}
                setError={setError}
              />
            </div>
          </div>
        </form>
      </Dialog>
    </>
  );
};

export default RedirectWoDialog;
