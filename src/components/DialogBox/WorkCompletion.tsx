import React, { useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import "../Button/Button.css";
import "./DialogBox.css";
import Reopen_Logo from "../../assest/images/a.png";
import { callPostAPI } from "../../services/apis";
import { ENDPOINTS } from "../../utils/APIEndpoints";
import { toast } from "react-toastify";
import { InputTextarea } from "primereact/inputtextarea";
import Field from "../Field";
import InputField from "../Input/Input";

const WorkCompletion = ({
  header,
  control,

  setValue,
  register,
  paragraph,
  watch,
  errors,

  getOptions,
}: any) => {
  const [visible, setVisible] = useState<boolean>(false);

  const [RemrksCount, setRemrksCount] = useState(0);
  const ReamrksWatch = watch("REMARKS");
  const OpenCancelServiceRequestPopUp = () => {
    setValue("REMARKS", null);
    setVisible(!visible);
  };

  const CloseCancelServiceRequestPopUp = () => {
    setVisible(!visible);
  };

  const RejectServiceRequest = () => {
    setVisible(!visible);
    setRemrksCount(0)
  };

  const handleInputChange = (event: any) => {
    const charLenth = event.target.value;
    setRemrksCount(charLenth.length);
  };

  const AcceptServiceRequest = async () => {
    // if (REMARKS === '' || REMARKS === null || REMARKS === undefined) {
    //   return
    // }
    let payload = {
      WO_ID: localStorage.getItem("WO_ID"),
      MODE: "ACCEPT",
      REMARKS: ReamrksWatch,
      PARA: { para1: `Service Request`, para2: "Accepted" },
    };

    const res = await callPostAPI(ENDPOINTS.REDIRECT_WO, payload);
    if (res.FLAG) {
      toast.success(res.MSG);
      setVisible(!visible);
      setValue("REMARKS", "");
      getOptions();
    } else {
      toast.error(res.MSG);
    }
  };

  return (
    <>
      <Button
        type="button"
        label={header}
        className="Primary_Button mr-2 "
        onClick={() => OpenCancelServiceRequestPopUp()}
      />
      <Dialog
        // blockScroll={true}
        // blockScroll={true}
        header=""
        visible={visible}
        style={{ width: "900px" }}
        onHide={() => CloseCancelServiceRequestPopUp()}
      >
        <form>
          <div className=" grid grid-cols-1 gap-3 md:grid-cols-4 lg:grid-cols-4">
            <div className="leftConatiner col-span-2 FFFBF6">
              <img src={Reopen_Logo} alt="" />
              <div>
                <h4>Accept Work Completion</h4>
                <p>Are you satisfied with the completed work?</p>
              </div>
            </div>
            <div className="col-span-2">
              <div className="flex flex-col gap-3">
                <h6>
                  Provide a Reason
                  {/* <span className="text-red-600"> *</span> */}
                </h6>
                <p className="flex"> Max 250 character</p>
              </div>
              <div className="">
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
                          // invalid={errors?.REMARKS}
                          rows={5}
                          placeholder="Provide additional details (Optional)"
                          setValue={setValue}
                          maxLength={250}
                          {...field}
                        />
                      );
                    },
                  }}
                />
              </div>
              <p className="flex">
                <span
                  className={` ${RemrksCount === 250 ? "text-red-600 " : ""} `}
                >
                  {`${RemrksCount}`}
                </span>
                /250 characters
              </p>
              <div className="flex justify-end gap-3">
                <Button
                  name="Reject"
                  className="Secondary_Button "
                  type="button"
                  label={"Cancel"}
                  onClick={() => RejectServiceRequest()}
                />
                <Button
                  name="Accept"
                  className="Primary_Button"
                  label={"Accept"}
                  onClick={() => AcceptServiceRequest()}
                />
              </div>
            </div>
          </div>
        </form>
      </Dialog>
    </>
  );
};

export default WorkCompletion;
