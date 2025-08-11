import React, { useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import "../../../../components/Button/Button.css";
import { InputTextarea } from "primereact/inputtextarea";
import Field from "../../../../components/Field";
import { toast } from "react-toastify";
import { callPostAPI } from "../../../../services/apis";
import { ENDPOINTS } from "../../../../utils/APIEndpoints";
import Select from "../../../../components/Dropdown/Dropdown";
import SuccessDialog from "./SuccessDialog";
import { useForm } from "react-hook-form";
const CancelWoDialog = ({
  resetField,
  header,
  control,
  setValue,
  register,
  paragraph,
  watch,
  errors,
  getOptions,
  cancelReasonList,
  updateWOStatusInfra
}: any) => {
  const watchreason = watch("REASON_ID")

  const watchReamrks = watch("REMARKS")
  let payload = {
    ACTION_ID: 102,
    REASONID_INFRA: watchreason?.REASON_ID,
    REMARKS: watchReamrks
  }

  const [visible, setVisible] = useState<boolean>(false);
  const [descriptionlength, setDescriptionlength] = useState(0);

  const [selectedDetails, setSelectedDetails] = useState<any>([]);
  const OpenCancelWorkorderPopUp = () => {
    setVisible(!visible);
  };
  const { handleSubmit, } = useForm();

  const CloseCancelworkorderPopUp = () => {
    setVisible(!visible);
    setValue("REMARKS", "");
    setValue("REASON_ID", "")
    resetField("REMARKS")
    resetField("REASON_ID")
    setDescriptionlength(0)
  };
  const handleInputChange = (event: any) => {
    const value = event.target.value;
    setDescriptionlength(value.length);
  };
  // const SaveCancelReason = () => {
  //   if (watchreason === undefined) {
  //     return toast?.error("Please fill the required fields222.");
  //   }
  // };


  const SubmitWorkorder = async () => {

  };

  return (
    <>
      <Button
        type="button"
        label={header}
        className="Secondary_Button mr-2 "
        onClick={() => OpenCancelWorkorderPopUp()}
      />
      <Dialog
        // header={header}
        visible={visible}
        style={{ width: "550px" }}
        className="dialogBoxStyle"
        onHide={() => CloseCancelworkorderPopUp()}
      >
        <form >
          <div className="grid grid-cols-1  gap-6">
            <h6 className="Text_Primary">{header}</h6>
            <div className={`${errors?.REASON_ID ? "errorBorder" : ""}`}>
              <Field
                controller={{
                  name: "REASON_ID",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <Select
                        options={cancelReasonList}
                        {...register("REASON_ID", {
                          required: "Please fill the required fields",
                        })}

                        filter={true}
                        label="Reason"
                        optionLabel="REASON_DESCRIPTION"
                        findKey={"REASON_ID"}
                        selectedData={selectedDetails?.REASON_ID}
                        setValue={setValue}
                        require={true}
                        invalid={errors.REASON_ID}
                        {...field}
                      />
                    );
                  },
                }}
              />
            </div>
            <div>
              <p className="Text_Secondary Input_Label">
                Remarks (Max 250 character)
                {/* <span className="text-red-600"> *</span> */}
              </p>
              {/* <div className={`${errors?.REMARKS ? "errorBorder" : ""}`}> */}
              <Field
                controller={{
                  name: "REMARKS",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <InputTextarea
                        {...register("REMARKS", {
                          required: false
                          ,
                          onChange: (e: any) => handleInputChange(e),
                        })}
                        invalid={errors?.REMARKS}
                        maxLength={250}
                        rows={7}
                        setValue={setValue}
                        placeholder="Provide additional details (Optional) "
                        {...field}
                      />
                    );
                  },
                }}
              />
              {/* </div> */}
              <label className={` ${descriptionlength === 250 ? "text-red-600" : "Text_Secondary"} Helper_Text`}>
                {(`${descriptionlength}/250 characters`)}
              </label>
              {/* <label className="Text_Secondary Helper_Text">
                Up to 0/250 characters
              </label> */}
            </div>
            <div className="flex justify-end mt-4 gap-3">
              <Button
                name="Cancel"
                className="Cancel_Button"
                type="button"
                label={"Cancel"}
                onClick={() => CloseCancelworkorderPopUp()}
              />

              {(watchreason !== undefined) ?
                (<SuccessDialog
                  header={"Submit"}
                  control={control}
                  setValue={setValue}
                  register={register}
                  paragraph={"This work order has been cancelled successfully."}
                  watch={watch}
                  errors={errors}
                  payload={payload}
                  Actioncode={102}
                  updateWOStatusInfra={updateWOStatusInfra}
                />) :
                (<Button
                  name="submit"
                  className="Primary_Button "
                  type="submit"
                  label={"Submit"}
                // onClick={() => SaveCancelReason()}
                />
                )}
            </div>
          </div>
        </form>
      </Dialog>
    </>
  );
};

export default CancelWoDialog;
