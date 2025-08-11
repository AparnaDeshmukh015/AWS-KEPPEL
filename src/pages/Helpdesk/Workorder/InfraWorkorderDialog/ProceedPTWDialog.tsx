import { Dialog } from "primereact/dialog";
import React, { useState } from "react";
import Button from "../../../../components/Button/Button";
import SuccessDialog from "./SuccessDialog";
import lock from "../../../../assest/images/lock.png";
import unlock from "../../../../assest/images/unlock.png";
const ProceedPTWDialog = ({
  header,
  control,
  setValue,
  register,
  paragraph,
  watch,
  errors,
  getOptions,
  selectedDetails,
  Actioncode,
  updateWOStatusInfra
}: any) => {
  const [visible, setVisible] = useState<boolean>(false);
  const [visibleConfirmPTW, setVisibleConfirmPTW] = useState<boolean>(false);

  const [visibleMainHeader, setVisibleMainHeader] = useState<string>("");
  const [visibleSubHeader, setVisibleSubHeader] = useState<string>("");
  const [visibleBtnText, setVisibleBtnText] = useState<string>("");

  const OpenProceedPTWPopUp = () => {
    setVisible(!visible);
  };
  const CloseProceedPTWPopUp = () => {
    setVisible(!visible);
  };
  const CloseConfirmPTWPopUp = () => {
    setVisibleConfirmPTW(!visibleConfirmPTW);
  };
  const OpenVisibleConfirmPTW = (
    headerText: any,
    value: any,
    para: any,
    btntext: any
  ) => {
    setVisibleMainHeader(headerText);
    setVisibleSubHeader(para);
    setVisibleBtnText(btntext);
    setVisibleConfirmPTW(!visibleConfirmPTW);
  };

  return (
    <>
      <Button
        type="button"
        label={header}
        className="Primary_Button mr-2 "
        onClick={() => OpenProceedPTWPopUp()}
      />
      <Dialog
        header=""
        visible={visible}
        style={{ width: "600px" }}
        className="dialogBoxStyle"
        onHide={() => CloseProceedPTWPopUp()}
      >
        <form>
          <div className="grid justify-items-center">
            <div className="">
              <h6 className="Text_Primary text-center mb-3">
                Proceed with PTW Approval
              </h6>
              <p className="Input_Text text-center">
                Please select how you want to proceed with this PTW approval:
              </p>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-x-6 gap-y-6 md:grid-cols-2 lg:grid-cols-2">
              <div
                className="border-2 p-6
                        border-gray-200 border rounded-lg  redirectContainer"
                onClick={() => {
                  OpenVisibleConfirmPTW(
                    "Isolation Required",
                    "IR",
                    "Are you sure isolation is required for this work order?",
                    "Confirm Isolation"
                  );
                  setVisible(false);
                }
                }
              >
                <div>
                  <div className="flex justify-center mb-2">
                    <img src={lock} alt="" style={{ width: "40px", height: "40px" }} />
                  </div>
                  <p
                    className=" Text_Primary Header_Text text-center mb-2"
                  >
                    With Isolation
                  </p>
                  <p className="Text_Secondary Helper_Text text-center">
                    Requires system/equipment isolation before work begins.
                  </p>
                </div>
              </div>
              <div
                className=" border-2 p-6
                        border-gray-200 border rounded-lg  redirectContainer "
                onClick={() => {
                  OpenVisibleConfirmPTW(
                    "Isolation Not Required",
                    "INR",
                    "Are you sure isolation is not required for this work order?",
                    "Confirm No Isolation"
                  );
                  setVisible(false);
                }
                }
              >
                <div>
                  <div className="flex justify-center  mb-2">
                    <img src={unlock} alt="" style={{ width: "40px", height: "40px" }} />
                  </div>
                  <h6
                    className=" Text_Primary text-center Header_Text mb-2"
                  >
                    Isolation Not Required
                  </h6>
                  <p className="Text_Secondary Helper_Text text-center">
                    Work can proceed without isolation.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-[35px]">
              <label className="Text_Secondary Helper_Text">
                <i className="pi pi-exclamation-triangle mr-2"></i>
                Ensure all safety measures are met before approval.
              </label>
            </div>
          </div>
        </form>
      </Dialog>

      {/*Confirm Approval - Isolation Not Required --Or--Isolation Required  */}
      {/* <Dialog
        header=""
        visible={visibleConfirmPTW}
        style={{ width: "30vw" }}
        onHide={() => CloseConfirmPTWPopUp()}
      >
        <form>
          <div className="grid justify-items-center">
            
            <div className="mt-2 ">
              <h6 className="Text_Primary text-center mb-2">
                Confirm Approval - {visibleMainHeader}
              </h6>

              <p className="Input_Text text-center">{visibleSubHeader}</p>
            </div>
            <div className="flex justify-end mt-3 gap-3">
              <Button
                name="Cancel"
                className="Secondary_Button w-28 "
                type="button"
                label={"Cancel"}
                onClick={() => CloseConfirmPTWPopUp()}
              />
              <SuccessDialog
                header={visibleBtnText}
                control={control}
                setValue={setValue}
                register={register}
                paragraph={"Your approval has been updated successfully."}
                watch={watch}
                errors={errors}
                Actioncode={visibleMainHeader == "Isolation Not Required" ? 114 : 115}
                updateWOStatusInfra={updateWOStatusInfra}
                payload={visibleMainHeader == "Isolation Not Required" ? { ACTION_ID: 114 } : { ACTION_ID: 115 }}

              />
            </div>
          </div>
        </form>
      </Dialog> */}

      <Dialog
        header=""
        visible={visibleConfirmPTW}
        style={{ width: "550px" }}
        className="dialogBoxStyle"
        onHide={() => CloseConfirmPTWPopUp()}
      >
        <form>
          <div className="grid justify-items-center">
            <div className="">
              <h6 className="Text_Primary text-center mb-3">
                {visibleMainHeader == "Isolation Required" && Actioncode == 114 ? " Confirm Approval : Isolation  Required " : visibleMainHeader == "Isolation Not Required" && Actioncode == 114 ? " Confirm Approval : Isolation Not Required " : " Confirm Submission for PTW Approval"}
              </h6>

              <p className="Input_Text text-center">
                {visibleMainHeader == "Isolation Required" && Actioncode == 114 ? "Are you sure isolation is  required for this work order?" : visibleMainHeader == "Isolation Not Required" && Actioncode == 114 ? "Are you sure isolation is not required for this work order?" : "Are you sure you want to submit this Permit to Work for  approval?"}
              </p>
            </div>
            <div className="flex justify-end mt-[35px] gap-3">
              <Button
                name="Cancel"
                className="Cancel_Button"
                type="button"
                label={"Cancel"}
                onClick={() => CloseConfirmPTWPopUp()}
              />
              <SuccessDialog
                header={visibleMainHeader == "Isolation Required" && Actioncode == 114 ? "Confirm  Isolation" : visibleMainHeader == "Isolation Not Required" && Actioncode == 114 ? "Confirm No Isolation" : "Submit for Approval"}
                control={control}
                setValue={setValue}
                register={register}
                paragraph={visibleMainHeader == "Isolation Required" && Actioncode == 114 ? "Your approval has been updated successfully." : visibleMainHeader == "Isolation Not Required" && Actioncode == 114 ? "Your approval has been updated successfully." : "Your request for PTW approval has been successfully submitted."}
                watch={watch}
                errors={errors}
                Actioncode={
                  112//"Isolation Not Required" ? 114 :
                }
                selectedDetails={selectedDetails}
                updateWOStatusInfra={updateWOStatusInfra}
                payload={
                  visibleMainHeader == "Isolation Not Required" && Actioncode == 114 ?
                    { ACTION_ID: 114 }
                    : visibleMainHeader == "Isolation Required" && Actioncode == 114 ?
                      { ACTION_ID: 115 }
                      : visibleMainHeader == "Isolation Not Required"
                        ? { ACTION_ID: 112, IS_ISOLATION_REQUIRED: 0 }
                        : { ACTION_ID: 112, IS_ISOLATION_REQUIRED: 1 }
                }
              />
            </div>
          </div>
        </form>
      </Dialog>
    </>
  );
};

export default ProceedPTWDialog;
