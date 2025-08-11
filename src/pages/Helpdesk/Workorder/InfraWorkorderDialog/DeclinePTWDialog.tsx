import { Dialog } from "primereact/dialog";
import { InputTextarea } from "primereact/inputtextarea";
import React, { useEffect, useState } from "react";
import Button from "../../../../components/Button/Button";
import Field from "../../../../components/Field";
import { useForm } from "react-hook-form";
import SuccessDialog from "./SuccessDialog";
import { toast } from "react-toastify";
import { act } from "react-dom/test-utils";
// var payload: any;
var getindex: number = 0;
let indexgetStatus: any;
const DeclinePTWDialog = ({
  header,

  paragraph,

  getOptions,
  updateWOStatusInfra,
  Action_Code,
  setTestingOnHold,
  selectedComments,
}: any) => {
  const [visible, setVisible] = useState<boolean>(false);

  const [selectedDetails, setSelectedDetails] = useState<any>([]);
  const [remarkLength, setRemarkLength] = useState<any>(0);
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    resetField,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      REMARKS: "",
    },

    mode: "onSubmit",
  });

  const watchAll: any = watch();
  const OpenDeclinePTWApprovalPopUp = () => {
    setVisible(!visible);
    setValue("REMARKS", selectedComments);
    setRemarkLength(selectedComments?.length ?? 0);
  };

  const CloseDeclinePTWApprovalPopUp = () => {
    setVisible(!visible);
    setTestingOnHold(false);
    resetField("REMARKS");
  };
  const SavePTWApprovalPopUp = () => {
    if (
      watchAll?.REMARKS?.trim() === "" ||
      watchAll?.REMARKS === undefined ||
      watchAll?.REMARKS === null
    ) {
      toast?.error("Please fill the required fields");
    } else {
      let payload = {
        ACTION_ID:
          header === "Return For Edit"
            ? 131
            : header === "Edit Comments"
            ? 148
            : [113]?.some((num) => Action_Code?.includes(num)) == true
            ? 113
            : [121]?.some((num) => Action_Code?.includes(num)) == true
            ? 121
            : 121,
        REMARKS: watchAll?.REMARKS,
      };

      updateWOStatusInfra(payload, paragraph);
      setVisible(!visible);
    }
  };

  const onSubmit = (data: any) => {
    // SavePTWApprovalPopUp();
  };
  const handleInputChange = (event: any) => {
    const charLenth = event?.target?.value;
    indexgetStatus = {
      ACTION_ID:
        header === "Return For Edit"
          ? 131
          : header === "Edit Comments"
          ? 148
          : header === "Testing On Hold"
          ? 125
          : [121]?.some((num) => Action_Code?.includes(num)) == true
          ? 121
          : [113]?.some((num) => Action_Code?.includes(num)) == true
          ? 113
          : header === "Fail"
          ? [140]?.some((num) => Action_Code?.includes(num)) == true
            ? 140
            : [142]?.some((num) => Action_Code?.includes(num)) == true
            ? 142
            : 128
          : 125,
      REMARKS: charLenth,
    };

    if (charLenth?.length > 0) {
      setRemarkLength(charLenth.length);
    } else setRemarkLength(0);
  };

  useEffect(() => {
    if (header === "Testing On Hold") {
      setVisible(true);
    }
  }, [header === "Testing On Hold"]);
  useEffect(() => {
    if (header === "Edit Comments") {
      indexgetStatus = { ACTION_ID: 148, REMARKS: "" };
    }
  }, [header === "Edit Comments"]);

  useEffect(() => {
    if (header === "Testing On Hold") {
      indexgetStatus = { ACTION_ID: 125, REMARKS: "" };
    }
  }, [header === "Testing On Hold"]);
  useEffect(() => {
    if (header === "Fail") {
      indexgetStatus = { ACTION_ID: 140, REMARKS: "" };
    }
  }, [header === "Fail"]);

  useEffect(() => {
    if (header === "Decline" && Action_Code?.includes(113)) {
      indexgetStatus = { ACTION_ID: 113, REMARKS: "" };
    } else if (header === "Decline" && Action_Code?.includes(121)) {
      indexgetStatus = { ACTION_ID: 121, REMARKS: "" };
    }
  }, [header === "Decline"]);

  useEffect(() => {
    if (
      (!isSubmitting && Object?.values(errors)[0]?.type === "required") ||
      (!isSubmitting && Object?.values(errors)[0]?.type === "validate")
    ) {
      const check: any = Object?.values(errors)[0]?.message;
      toast?.error(check);
    }
  }, [isSubmitting]);

  return (
    <>
      {header === "Testing On Hold" ? (
        ""
      ) : (
        <>
          <Button
            type="button"
            label={header}
            className="Secondary_Button mr-2 "
            onClick={() => OpenDeclinePTWApprovalPopUp()}
          />
        </>
      )}

      <Dialog
        // header={header === "Fail" ? "Test Fail" : header}
        visible={visible}
        style={{ width: "550px" }}
        className="dialogBoxStyle"
        onHide={() => CloseDeclinePTWApprovalPopUp()}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 gap-6">
            <h6 className="Text_Primary">
              {header === "Fail" ? "Test Fail" : header}
            </h6>
            <div>
              <p className="Text_Secondary Input_Label">
                Remarks (Max 250 characters)
                {header !== "Decline" &&
                header !== "Fail" &&
                header !== "Testing On Hold" ? (
                  <span className="text-red-600"> *</span>
                ) : (
                  <></>
                )}
              </p>
              <div
                className={`${
                  header !== "Fail" && errors?.REMARKS ? "errorBorder" : ""
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
                            required:
                              header === "Decline" ||
                              header === "Fail" ||
                              header === "Testing On Hold"
                                ? ""
                                : "Please fill the requried fields",
                            onChange: (e: any) => handleInputChange(e),
                          })}
                          invalid={
                            header === "Decline" ||
                            header === "Fail" ||
                            header !== "Testing On Hold"
                              ? ""
                              : errors?.REMARKS
                          }
                          rows={7}
                          maxLength={250}
                          placeholder={
                            header === "Decline" ||
                            header === "Fail" ||
                            header == "Testing On Hold"
                              ? "Provide additional details (Optional)"
                              : "Provide additional details"
                          }
                          setValue={setValue}
                          {...field}
                        />
                      );
                    },
                  }}
                />
              </div>
              <label
                className={` ${
                  remarkLength === 250 ? "text-red-600" : "Text_Secondary"
                } Helper_Text`}
              >
                {`${remarkLength}/250 characters`}
              </label>
              {/* <label className="Text_Secondary Helper_Text">
                 {`${remarkLength}/250 characters`}
              </label> */}
            </div>
            <div className="flex justify-end gap-3">
              <Button
                name="Cancel"
                className="Cancel_Button"
                type="button"
                label={"Cancel"}
                onClick={() => CloseDeclinePTWApprovalPopUp()}
              />

              {header === "Testing On Hold" ? (
                <>
                  <SuccessDialog
                    header={"Submit"}
                    control={control}
                    setValue={setValue}
                    register={register}
                    paragraph="Your response has been updated successfully."
                    watch={watch}
                    errors={errors}
                    payload={indexgetStatus}
                    Actioncode={indexgetStatus?.ACTION_ID}
                    CloseDeclinePTWApprovalPopUp={CloseDeclinePTWApprovalPopUp}
                    updateWOStatusInfra={updateWOStatusInfra}
                  />
                </>
              ) : header === "Fail" ? (
                <>
                  <SuccessDialog
                    header={"Submit"}
                    control={control}
                    setValue={setValue}
                    register={register}
                    paragraph="The work order testing has been marked as failed."
                    watch={watch}
                    errors={errors}
                    payload={indexgetStatus}
                    Actioncode={indexgetStatus?.ACTION_ID}
                    CloseDeclinePTWApprovalPopUp={CloseDeclinePTWApprovalPopUp}
                    updateWOStatusInfra={updateWOStatusInfra}
                  />
                </>
              ) : header === "Decline" ? (
                <>
                  <SuccessDialog
                    header={"Submit"}
                    control={control}
                    setValue={setValue}
                    register={register}
                    paragraph="Your decline has been updated successfully."
                    watch={watch}
                    errors={errors}
                    payload={indexgetStatus}
                    Actioncode={indexgetStatus?.ACTION_ID}
                    CloseDeclinePTWApprovalPopUp={CloseDeclinePTWApprovalPopUp}
                    updateWOStatusInfra={updateWOStatusInfra}
                  />
                </>
              ) : (
                <>
                  <Button
                    name="Submit"
                    className="Primary_Button w-28 "
                    type="button"
                    label={"Submit"}
                    onClick={() => SavePTWApprovalPopUp()}
                    // payload={indexgetStatus}
                    // Actioncode={indexgetStatus?.ACTION_ID}
                    // CloseDeclinePTWApprovalPopUp={CloseDeclinePTWApprovalPopUp}
                  />
                </>
              )}
            </div>
          </div>
        </form>
      </Dialog>
    </>
  );
};

export default DeclinePTWDialog;
