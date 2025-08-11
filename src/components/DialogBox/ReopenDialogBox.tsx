/* eslint-disable @typescript-eslint/no-unused-expressions */
import React, { useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import "../Button/Button.css";
import "../DialogBox/DialogBox.css";
import { InputTextarea } from "primereact/inputtextarea";
import Field from "../../components/Field";
import Reopen_Logo from "../../assest/images/FreepikIcons.png";
import { toast } from "react-toastify";
import { callPostAPI } from "../../services/apis";
import { ENDPOINTS } from "../../utils/APIEndpoints";
import { useNavigate } from "react-router-dom";

const ReopenDialogBox = ({
  header,
  control,
  setValue,
  register,
  // paragraph,
  watch,
  errors,
  // getOptions,
  getList,
  reopentype,
  formType,
  functionCode,
}: any) => {
  const [visible, setVisible] = useState<boolean>(false);
  const [RemrksCount, setRemrksCount] = useState(0);
  const [IsSubmit, setIsSubmit] = useState<any | null>(false);
  const [events, setevents] = useState<any | null>(null);
  const navigate: any = useNavigate();
  const REMARKS = watch("REMARKS");
  const OpenCancelServiceRequestPopUp = () => {
    setValue("REMARKS", null);
    setVisible(!visible);
  };

  const handleInputChange = (event: any) => {
    const charLenth = event.target.value;
    setRemrksCount(charLenth.length);
  };
  const RejectServiceRequest = () => {
    setVisible(!visible);

    setValue("REMARKS", null);
    setevents(null);
    setRemrksCount(0);
  };

  const ReOpenServiceRequest = async (e: any) => {
    setevents(e);

    if (!REMARKS || REMARKS.trim() === "") {
      toast.error("Please fill the required fields");
      setIsSubmit(false);
      return;
    }

    let payload = {
      WO_ID: localStorage.getItem("WO_ID"),
      MODE: "REOPEN",
      REMARKS: REMARKS,
      PARA:
        reopentype === "1"
          ? { para1: `Work Order`, para2: "Re-opened" }
          : { para1: `Service Request`, para2: "Re-opened" },
    };
    setIsSubmit(true);
    const res = await callPostAPI(ENDPOINTS.REDIRECT_WO, payload, functionCode);
    if (res.FLAG) {
      setevents(null);
      setIsSubmit(true);
      setVisible(!visible);
      toast.success(res.MSG);
      setValue("REMARKS", "");
      // getOptions();
      // getList();
      if (reopentype === "1") {
        navigate("/workorderlist");
      } else {
        navigate("/servicerequestlist");
      }
    } else {
      toast.error(res.MSG);
      setIsSubmit(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        label={header}
        className="Secondary_Button mr-2 "
        onClick={() => OpenCancelServiceRequestPopUp()}
      />
      <Dialog
        // blockScroll={true}
        header=""
        visible={visible}
        style={{ width: "60vw" }}
        onHide={() => {
          setValue("REMARKS", null);
          if (!visible) return;
          setVisible(false);
        }}
      >
        <form>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3 lg:grid-cols-3 w-full">
            <div className="leftConatiner FFFBF6">
              <img src={Reopen_Logo} alt="" />
              <h4>Re-open {formType}</h4>
              {/* <p>
                Notify the contractor or architect of the required
                rectifications.
              </p> */}
            </div>
            <div className="col-span-2 ">
              <div className="flex flex-col gap-3">
                <div>
                  <h6>
                    Provide a Reason<span className="text-red-600"> *</span>
                  </h6>
                  <p> Max 250 character</p>
                </div>

                <div
                  className={`${
                    events &&
                    (REMARKS === null ||
                      REMARKS === undefined ||
                      REMARKS.trim() === "")
                      ? "errorBorder"
                      : ""
                  }`}
                >
                  <Field
                    controller={{
                      name: "REMARKS",
                      control: control,
                      render: ({ field }: any) => {
                        return (
                          <InputTextarea
                            {...register("REMARKS", {
                              onChange: (e: any) => handleInputChange(e),
                            })}
                            invalid={errors?.REMARKS}
                            rows={5}
                            setValue={setValue}
                            maxLength={250}
                            {...field}
                          />
                        );
                      },
                    }}
                  />
                </div>
                <p>
                  {/* <span className="text-red-600">250</span>/250 characters */}
                  <span
                    className={` ${RemrksCount === 250 ? "text-red-600" : ""} `}
                  >
                    {`${RemrksCount}`}
                  </span>
                  /250 characters
                </p>
              </div>
              <div className="flex justify-end mt-2 gap-3">
                <Button
                  name="Reject"
                  className="Cancel_Button "
                  type="button"
                  label={"Cancel"}
                  onClick={() => RejectServiceRequest()}
                />
                <Button
                  name="Accept"
                  className="Primary_Button  w-28"
                  label={"Re-open"}
                  onClick={(e) => ReOpenServiceRequest(e)}
                  disabled={IsSubmit}
                />
              </div>
            </div>
          </div>
        </form>
      </Dialog>

      {/* new dialog */}
      {/* <Dialog
        visible={visible}
        modal
        onHide={() => {
          if (!visible) return;
          setVisible(false);
        }}
        content={({ hide }) => (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3 lg:grid-cols-3">
            <div className="leftConatiner">
              <h4>Re-open Service Reques</h4>
            </div>
            <div className="col-span-2"></div>
          </div>
        )}
      ></Dialog> */}
    </>
  );
};

export default ReopenDialogBox;
