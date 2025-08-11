/* eslint-disable @typescript-eslint/no-unused-expressions */
import React, { useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import "../Button/Button.css";
import { InputTextarea } from "primereact/inputtextarea";
import Field from "../../components/Field";
import { toast } from "react-toastify";
const CancelDialogBox = ({
  header,
  control,
  setValue,
  register,
  paragraph,
  watch,
  errors,
}: any) => {
  const [visible, setVisible] = useState<boolean>(false);
  const REMARKS = watch('REMARKS');
  const OpenCancelServiceRequestPopUp = () => {
    setVisible(!visible);
  }

  const CloseCancelServiceRequestPopUp = () => {
    setVisible(!visible);
    setValue("REMARKS", "");
  }


  const SaveCancelServiceRequest = () => {
    if (REMARKS === undefined || REMARKS === " " || REMARKS === null) {
      return false;
    }
  }

  return (
    <>
      <Button
        type="button"
        label={header}
        className="Secondary_Button mr-2 "
        onClick={() => OpenCancelServiceRequestPopUp()}
      />
      <Dialog
        header={header}
        visible={visible}
        style={{ width: "40vw" }}
        onHide={() => CloseCancelServiceRequestPopUp()}
      >
        <form>
          <div>
            <p>{paragraph}</p>
            <p>
              Remarks<span className="text-red-600"> *</span>
            </p>
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
                      // label={props?.inputName}
                      // invalid={errors?.REMARKS} 
                      rows={3}
                      setValue={setValue}
                      {...field}
                    />
                  );
                },
              }}
            />
          </div>
          <div className="flex justify-center mt-2">
            <Button
              //  type="submit"
              name="CANCEL"
              className="Primary_Button  w-28 me-2"
              label={"Yes"}
              // onSubmit={props?.handleSubmit(props?.onSubmit)}
              onClick={() => SaveCancelServiceRequest()}
            />
            <Button
              className="Secondary_Button w-28 "
              type="button"
              label={"Cancel"}
              onClick={() => CloseCancelServiceRequestPopUp()}
            />
          </div>
        </form>
      </Dialog>
    </>
  );
};

export default CancelDialogBox;
