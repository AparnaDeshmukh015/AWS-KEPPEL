/* eslint-disable @typescript-eslint/no-unused-expressions */
import React, { useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import "../Button/Button.css";
import { InputTextarea } from "primereact/inputtextarea";
import Field from "../../components/Field";
import { toast } from "react-toastify";
import { callPostAPI } from "../../services/apis";
import { ENDPOINTS } from "../../utils/APIEndpoints";

const CancelDialogBox = ({
  header,
  control,
  setValue,
  register,
  paragraph,
  watch,
  errors,
  getOptions,
  IsSubmit,
  setIsSubmit
}: any) => {
  const [visible, setVisible] = useState<boolean>(false);

  const REMARKS = watch('REMARKS');
  const OpenCancelServiceRequestPopUp = () => {
    setVisible(!visible);
  }

  const CloseCancelServiceRequestPopUp = () => {
    setVisible(!visible);
    setValue("REMARKS", "");
    setIsSubmit(false)
  }

  const SaveCancelServiceRequest = () => {
    if (IsSubmit === true)
      return true
    setIsSubmit(true)
    if (REMARKS === '' || REMARKS === null || REMARKS === undefined) {
      setIsSubmit(false)
      return
    }
    setIsSubmit(false)
  }
  const ReOpenServiceRequest = async () => {
    if (REMARKS === '' || REMARKS === null || REMARKS === undefined) {
      setIsSubmit(false)
      return
    }
    let payload = {
      "WO_ID": localStorage.getItem("WO_ID"),
      "MODE": "REOPEN",
      "REMARKS": REMARKS,
      "PARA": { para1: `Service Request`, para2: "Re-opened" }
    }

    const res = await callPostAPI(ENDPOINTS.REDIRECT_WO, payload);
    if (res.FLAG) {
      setVisible(!visible);
      toast.success(res.MSG);
      setValue("REMARKS", "");
      getOptions();
      setIsSubmit(false)
    } else {
      toast.error(res.MSG);
      setIsSubmit(false)
    }
  }

  const AcceptServiceRequest = async () => {
    if (IsSubmit === true)
      return true
    setIsSubmit(true)
    if (REMARKS === '' || REMARKS === null || REMARKS === undefined) {
      setIsSubmit(false)
      return
    }
    let payload = {
      "WO_ID": localStorage.getItem("WO_ID"),
      "MODE": "ACCEPT",
      "REMARKS": REMARKS,
      "PARA": { para1: `Service Request`, para2: "Accepted" }
    }

    const res = await callPostAPI(ENDPOINTS.REDIRECT_WO, payload);
    if (res.FLAG) {
      toast.success(res.MSG);
      setVisible(!visible);
      setValue("REMARKS", "");
      getOptions();
      setIsSubmit(false)
    } else {
      toast.error(res.MSG);
      setIsSubmit(false)
    }
  }

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
        header={header}
        visible={visible}
        style={{ width: "550px" }}
        onHide={() => CloseCancelServiceRequestPopUp()}
      >
        <form>
          <div>
            <p>{paragraph}</p>
            <p>
              Remarks<span className="text-red-600"> *</span>
            </p>
            <div className={`${errors?.REMARKS ? "errorBorder" : ""}`}>
              <Field
                controller={{
                  name: "REMARKS",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <InputTextarea
                        {...register("REMARKS", {
                          required: "Please fill the requried fields",
                        })}

                        invalid={errors?.REMARKS}
                        rows={3}
                        setValue={setValue}
                        {...field}
                      />
                    );
                  },
                }}
              />
            </div>
          </div>
          <div className="flex justify-end mt-3 gap-3">
            {header !== "Review" ? (
              <>
                <Button
                  name="CANCEL"
                  className="Primary_Button w-28"
                  disabled={IsSubmit}
                  label={"Yes"}
                  onClick={SaveCancelServiceRequest}
                />
                <Button
                  className="Secondary_Button w-28 "
                  type="button"
                  label={"Cancel"}
                  onClick={() => CloseCancelServiceRequestPopUp()}
                /></>
            ) : (
              <>
                <Button
                  name="Reopen"
                  className="Secondary_Button w-28 "
                  type="button"
                  label={"Re-open"}
                  onClick={() => ReOpenServiceRequest()}
                />
                <Button
                  name="Accept"
                  className="Primary_Button  w-28"
                  label={"Accept"}
                  onClick={() => AcceptServiceRequest()}
                />

              </>
            )}

          </div>
        </form>
      </Dialog>
    </>
  );
};

export default CancelDialogBox;
