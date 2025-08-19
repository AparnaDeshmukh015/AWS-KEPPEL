import { Dialog } from "primereact/dialog";
import { InputTextarea } from "primereact/inputtextarea";
import React, { useEffect, useState } from "react";
import Select from "react-select/dist/declarations/src/Select";
import "../../../../components/Input/Input.css";
import Button from "../../../../components/Button/Button";
import Field from "../../../../components/Field";
import SuccessDialog from "./SuccessDialog";
import { useForm } from "react-hook-form";
import DateCalendar from "../../../../components/Calendar/Calendar";
import noDataIcon from "../../../../assest/images/DocumentUpload.png";
import { useTranslation } from "react-i18next";
import PTWApprovalDialog from "./PTWApprovalDialog";
import WoDocumentUpload from "../../../../components/pageComponents/DocumentUpload/WoDocumentUpload";
import { formateDate, helperNullDate } from "../../../../utils/constants";
import moment from "moment";
import Buttons from "../../../../components/Button/Button";
import { toast } from "react-toastify";
import "../../../../components/Calendar/Calendar.css";
// import "../../../../components/pageComponents/DocumentUpload/DocumentUpload.css";
const AddResolutionDialog = ({
  header,
  paragraph,
  getOptions,
  updateWOStatusInfra,
  selectedDetails,
  DOC_LIST_DATA,
  Actioncode
}: any) => {

  const [visible1, setVisible1] = useState<boolean>(false);
  const {   } = useTranslation();
  const [Descriptionlength, setDescriptionlength] = useState(0);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    getValues,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      REMARKS: "",
      ACTUAL_START_DATE: selectedDetails?.ACTUAL_START_DATE === "Invalid date" || selectedDetails?.ACTUAL_START_DATE === undefined
        ? "" : moment(selectedDetails?.ACTUAL_START_DATE).format("YYYY-MM-DD"),
      ACTUAL_END_DATE: selectedDetails?.ACTUAL_END_DATE === "Invalid date" || selectedDetails?.ACTUAL_END_DATE === undefined
        ? "" : moment(selectedDetails?.ACTUAL_END_DATE).format("YYYY-MM-DD"),
      DOC_LIST: DOC_LIST_DATA,
    },

    mode: "all",
  });

  useEffect(() => {
    const start_date: any = helperNullDate(selectedDetails?.ACTUAL_START_DATE);
    setValue("ACTUAL_START_DATE", start_date);
    const end_date: any = helperNullDate(selectedDetails?.ACTUAL_END_DATE);
    setValue("ACTUAL_END_DATE", end_date);
    setValue("REMARKS", selectedDetails?.COMPLETED_DESCRIPTION);
    setValue("DOC_LIST", DOC_LIST_DATA);

  }, [DOC_LIST_DATA])

  const REMARKS = watch("REMARKS");
  const ACTUAL_START_DATE = watch("ACTUAL_START_DATE");
  const ACTUAL_END_DATE = watch("ACTUAL_END_DATE");
  const OpenResolutionPopUp = () => {
    if (selectedDetails) {
      const start_date: any = helperNullDate(selectedDetails?.ACTUAL_START_DATE);
      setValue("ACTUAL_START_DATE", start_date);
      const end_date: any = helperNullDate(selectedDetails?.ACTUAL_END_DATE);
      setValue("ACTUAL_END_DATE", end_date);
      setValue("REMARKS", selectedDetails?.COMPLETED_DESCRIPTION);
      setValue("DOC_LIST", DOC_LIST_DATA);
      setDescriptionlength(selectedDetails?.COMPLETED_DESCRIPTION?.length ?? 0)
    }
    setVisible1(true);
  };
  const [IsSubmit, setIsSubmit] = useState<any | null>(false);
  const [loader, setloader] = useState<any | null>(false)
  const [IsCancel, setIsCancel] = useState<any | null>(false);
  const woDocumentUpload: any = [
    {
      key: 1,
      status: "B",
      label: "Add #Before photos"

    },
    {
      key: 2,
      status: "A",
      label: "Add #After photos"


    }
  ]
  const handleShowApprovalDialog = () => {
    setVisible1(false); // Close current dialog first
    setTimeout(() => {
      setShowApprovalDialog(true); // Show approval dialog after closing
    }, 2000); // Slight delay to let modal close animation finish
  };
  const CloseResolutionPopUp = () => {
    reset()
    setVisible1(false);
    setDescriptionlength(0)
  };
  const DOC_LIST = watch("DOC_LIST") == undefined ? DOC_LIST_DATA : watch("DOC_LIST");

  let payload = {
    ACTION_ID: header === "Edit Comments" ? 132 : header === "Submit for Closure" ? 130 : header === "Add Resolution" || header === "Edit Resolution" ? 143 : 122,
    COMPLETED_DESCRIPTION: REMARKS,
    ACTUAL_START_DATE: ACTUAL_START_DATE === 'Invalid Date' || ACTUAL_START_DATE === "" || ACTUAL_START_DATE === null ? "" : moment(ACTUAL_START_DATE).format("YYYY-MM-DD"),
    ACTUAL_END_DATE: ACTUAL_END_DATE === 'Invalid Date' || ACTUAL_END_DATE === "" || ACTUAL_END_DATE === null ? "" : moment(ACTUAL_END_DATE).format("YYYY-MM-DD"),
    DOC_LIST: DOC_LIST
  };



  const handleInputChange = (event: any) => {
    const value = event.target.value;
    setDescriptionlength(value.length);
  };

  const onSubmit = (payload: any) => {

    if (ACTUAL_START_DATE === null && payload?.ACTUAL_END_DATE !== null) {
      toast.error("Please select start date")
    }
    if (payload?.ACTUAL_START_DATE === "" && payload?.ACTUAL_END_DATE !== "") {
      toast.error("Please select start date")
    }
  }

  useEffect(() => {
    if (selectedDetails?.COMPLETED_DESCRIPTION !== undefined && selectedDetails?.COMPLETED_DESCRIPTION !== null) {

      setDescriptionlength(selectedDetails?.COMPLETED_DESCRIPTION?.length)
    }

  }, [selectedDetails])
  useEffect(() => {

    if ((!isSubmitting && Object?.values(errors)[0]?.type === "required") || (!isSubmitting && Object?.values(errors)[0]?.type === "validate")) {
      const check: any = Object?.values(errors)[0]?.message;
      toast?.error((check));
    }
  }, [isSubmitting]);

  return (
    <>
      <Button
        type="button"
        label={header === "Edit Comments" ? "Edit Resolution" : header === "Edit Resolution" ? "Edit" : header}
        className={header !== "Edit Resolution" ? "Primary_Button mr-2" : "Secondary_Button mr-2 "}
        icon={header === "Edit Resolution" && "pi pi-pencil"}
        onClick={() => OpenResolutionPopUp()}
      />
      <Dialog
        header={header === "Edit" ? "Edit Resolution" : header === "Complete" ? "Add Resolution" : header === "Edit Comments" ? "Edit Resolution" : header}
        visible={visible1}
        style={{ width: "900px" }}
        className="editWoDialogBox"
        onHide={() => CloseResolutionPopUp()}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 gap-6 mt-4 md:grid-cols-2 lg:grid-cols-2 border-b-2 border-gray-200 mr-4">
            <div className="col-span-2">

              <p className="Text_Secondary Helper_Text  ">Description (Max 400 characters) {header === "Submit for Closure" ? <span className="text-red-600"> *</span> : ""}</p>
              <div className={`${errors?.REMARKS ? "errorBorder" : ""}`}>
                <Field
                  controller={{
                    name: "REMARKS",
                    control: control,
                    render: ({ field }: any) => {
                      return (
                        <InputTextarea
                          {...register("REMARKS", {
                            required: header === "Submit for Closure" ? "Please fill the requried fields" : "",
                            onChange: (e: any) => handleInputChange(e),
                          })}
                          invalid={header === "Submit for Closure" ? errors?.REMARKS : ''}
                          require={header === "Submit for Closure" ? true : false}
                          rows={3}
                          maxLength={400}
                          setValue={setValue}
                          {...field}
                        />
                      );
                    },
                  }}
                />
                <label
                  className={` ${Descriptionlength === 400
                    ? "text-red-600"
                    : "Text_Secondary"
                    } Helper_Text`}
                >
                  { (`${Descriptionlength}/400 characters`)}
                </label>
              </div>
            </div>
            <div>
              {/* <label className="Text_Secondary Helper_Text">
                Actual Start Date
              </label> */}
              <div>
                <Field
                  controller={{

                    name: "ACTUAL_START_DATE",
                    control: control,
                    render: ({ field, fieldState }: any) => {
                      return (
                        <DateCalendar
                          {...register(
                            "ACTUAL_START_DATE", {
                            required: header === "Submit for Closure" ? "Please fill the required fields" : false,
                            validate: value => {
                              const endDate = getValues('ACTUAL_END_DATE');

                              if (endDate && new Date(value)?.getDate() > new Date(endDate).getDate()) {
                                return "Start date must be before the end date.";
                              }
                              return true;
                            }
                          }
                          )}
                          label="Actual Start Date"
                          showIcon
                          // require={true}
                          setValue={setValue}
                          require={header === "Submit for Closure" ? true : false}
                          invalid={header === "Submit for Closure" ? errors.ACTUAL_START_DATE : ""}
                          maxDate={new Date()}
                          minDate={moment(selectedDetails?.WO_REPORTED_AT, "DD-MM-YYYY HH:mm").toDate()}
                          {...field}
                        />
                      );
                    },
                  }}
                />
              </div>
            </div>
            <div>
              {/* <label className="Text_Secondary Helper_Text">
                Actual End Date
              </label> */}
              <div>
                <Field
                  controller={{
                    name: "ACTUAL_END_DATE",
                    control: control,
                    render: ({ field }: any) => {

                      return (
                        <DateCalendar
                          {...register(
                            "ACTUAL_END_DATE", {
                            required: header === "Submit for Closure" ? "Please fill the required fields" : false, // Conditionally required,
                            validate: value => {
                              const startDate = getValues('ACTUAL_START_DATE'); // Get the current value of the ACTUAL_START_DATE field
                              if (new Date(value)?.getDate() < new Date(startDate)?.getDate()) {
                                return "End date must be after the start date.";
                              }
                              return true;
                            }
                          }
                          )}
                          label="Actual End Date"
                          showIcon
                          // require={true}
                          setValue={setValue}
                          selectedData={
                            selectedDetails?.ACTUAL_END_DATE

                          }
                          require={header === "Submit for Closure" ? true : false}
                          invalid={header === "Submit for Closure" ? errors.ACTUAL_END_DATE : ""}
                          maxDate={new Date()}
                          minDate={moment(selectedDetails?.WO_REPORTED_AT, "DD-MM-YYYY HH:mm").toDate()}
                          {...field}
                        />
                      );
                    },
                  }}
                />
              </div>
            </div>
            <div className="col-span-2">
              <span>{`Upload Supporting Media (Optional) `}</span>
              {woDocumentUpload?.map((doc: any) => {

                return (

                  <div className="col-span-2 mt-4" key={doc?.key} >
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
                      isReopen={false}

                    />
                  </div>
                )
              }
              )}
            </div>

          </div>
          <div className="w-full">
            <div className="flex justify-end mt-4 gap-3">
              <Button
                name="Cancel"
                className="Cancel_Button"
                type="button"
                label={"Cancel"}
                onClick={() => CloseResolutionPopUp()}
              />

              {(header === "Add Resolution" || header === "Edit Resolution") && (
                <>
                  {payload?.ACTUAL_START_DATE === "" && payload?.ACTUAL_END_DATE !== "" && IsSubmit === false ?
                    <>
                      <Buttons
                        type="submit"
                        disabled={IsSubmit}
                        className="Primary_Button  w-20 me-2"
                        label={"Submit"}
                      />
                    </> :
                    <>
                      {payload?.ACTUAL_START_DATE !== "" && payload?.ACTUAL_END_DATE === "" && IsSubmit === false ?
                        <><SuccessDialog
                          header={"Submit"}
                          control={control}
                          setValue={setValue}
                          register={register}
                          paragraph={
                            "Your request has been successfully submitted."
                          }
                          watch={watch}
                          errors={errors}
                          payload={payload}
                          Actioncode={122}
                          CloseResolutionPopUp={CloseResolutionPopUp}
                          updateWOStatusInfra={updateWOStatusInfra}
                        /> </>
                        :
                        <>{(!payload?.ACTUAL_START_DATE || !payload?.ACTUAL_END_DATE || new Date(payload?.ACTUAL_START_DATE) <= new Date(payload?.ACTUAL_END_DATE)) && IsSubmit === false ?
                          <SuccessDialog
                            header={"Submit"}
                            control={control}
                            setValue={setValue}
                            register={register}
                            paragraph={
                              "Your request has been successfully submitted."
                            }
                            watch={watch}
                            errors={errors}
                            payload={payload}
                            Actioncode={122}
                            CloseResolutionPopUp={CloseResolutionPopUp}
                            updateWOStatusInfra={updateWOStatusInfra}
                          />
                          :
                          <>
                            {(payload?.ACTUAL_START_DATE === null || payload?.ACTUAL_END_DATE === null || new Date(payload?.ACTUAL_START_DATE) <= new Date(payload?.ACTUAL_END_DATE)) && IsSubmit === false ?
                              <SuccessDialog
                                header={"Submit"}
                                control={control}
                                setValue={setValue}
                                register={register}
                                paragraph={
                                  "Your request has been successfully submitted."
                                }
                                watch={watch}
                                errors={errors}
                                payload={payload}
                                Actioncode={122}
                                CloseResolutionPopUp={CloseResolutionPopUp}
                                updateWOStatusInfra={updateWOStatusInfra}
                              /> :
                              <Buttons
                                type="submit"
                                disabled={IsSubmit}
                                className="Primary_Button  w-20 me-2"
                                label={"Submit"}
                              />
                            }
                          </>}</>}
                    </>}
                </>
              )}



              {header === "Complete" ? (
                <>
                  {payload?.ACTUAL_START_DATE === "" && payload?.ACTUAL_END_DATE !== "" && IsSubmit === false ?
                    <>
                      <Buttons
                        type="submit"
                        disabled={IsSubmit}
                        className="Primary_Button  w-20 me-2"
                        label={"Submit"}
                      />
                    </> :
                    <>
                      {payload?.ACTUAL_START_DATE !== "" && payload?.ACTUAL_END_DATE === "" && IsSubmit === false ?
                        <><SuccessDialog
                          header={"Submit"}
                          control={control}
                          setValue={setValue}
                          register={register}
                          paragraph={
                            "Your request has been successfully submitted."
                          }
                          watch={watch}
                          errors={errors}
                          payload={payload}
                          Actioncode={122}
                          CloseResolutionPopUp={CloseResolutionPopUp}
                          updateWOStatusInfra={updateWOStatusInfra}
                        /> </>
                        :
                        <>{(!payload?.ACTUAL_START_DATE || !payload?.ACTUAL_END_DATE || new Date(payload?.ACTUAL_START_DATE) <= new Date(payload?.ACTUAL_END_DATE)) && IsSubmit === false ?
                          <SuccessDialog
                            header={"Submit"}
                            control={control}
                            setValue={setValue}
                            register={register}
                            paragraph={
                              "Your request has been successfully submitted."
                            }
                            watch={watch}
                            errors={errors}
                            payload={payload}
                            Actioncode={122}
                            CloseResolutionPopUp={CloseResolutionPopUp}
                            updateWOStatusInfra={updateWOStatusInfra}
                          />
                          :
                          <>
                            {(payload?.ACTUAL_START_DATE === null || payload?.ACTUAL_END_DATE === null || new Date(payload?.ACTUAL_START_DATE) <= new Date(payload?.ACTUAL_END_DATE)) && IsSubmit === false ?
                              <SuccessDialog
                                header={"Submit"}
                                control={control}
                                setValue={setValue}
                                register={register}
                                paragraph={
                                  "Your request has been successfully submitted."
                                }
                                watch={watch}
                                errors={errors}
                                payload={payload}
                                Actioncode={122}
                                CloseResolutionPopUp={CloseResolutionPopUp}
                                updateWOStatusInfra={updateWOStatusInfra}
                              /> :
                              <Buttons
                                type="submit"
                                disabled={IsSubmit}
                                className="Primary_Button  w-20 me-2"
                                label={"Submit"}
                              />
                            }
                          </>}</>}
                    </>}
                </>
              ) : header === "Submit for Closure" || header === "Edit Comments" ||
                header === "Edit" ? (
                <>
                  {payload?.ACTUAL_START_DATE !== "" && payload?.ACTUAL_END_DATE !== "" && payload?.COMPLETED_DESCRIPTION !== "" &&
                    new Date(payload?.ACTUAL_START_DATE) <= new Date(payload?.ACTUAL_END_DATE) && IsSubmit === false ?
                    <>
                      {/* {!showApprovalDialog ? (
                            <Buttons
                              type="button"
                              className="Primary_Button w-20 me-2"
                              label={"Submit"}
                              onClick={handleShowApprovalDialog}
                            />
                          ) : (  */}
                      <PTWApprovalDialog
                        header={"Submit"}
                        control={control}
                        setValue={setValue}
                        register={register}
                        cssStyle="Primary_Button mr-2"
                        headerText={"Confirm Submission"}
                        paragraph={header === "Edit Comments" ? "Are you sure you want to submit this resolution and close the work order?" :
                          "Are you ready to submit for closure review, or would you prefer to save and complete it later?"
                        }
                        sccusspara={
                          "Your submission has been successfully completed."
                        }
                        watch={watch}
                        errors={errors}
                        data={payload}
                        Actioncode={header === "Submit for Closure" ? 130 : 132}
                        Action_Code={header === "Submit for Closure" ? 124 : 132}
                        CloseResolutionPopUp={CloseResolutionPopUp}
                        setVisible1={setVisible1}
                        updateWOStatusInfra={updateWOStatusInfra}
                      /></> :
                    <Buttons
                      type="submit"
                      disabled={IsSubmit}
                      className="Primary_Button  w-20 me-2"
                      label={"Submit"}
                    />
                  }
                </>
              ) : (
                ""
              )}
            </div>
          </div>
        </form>
      </Dialog>
    </>
  );
};

export default AddResolutionDialog;
