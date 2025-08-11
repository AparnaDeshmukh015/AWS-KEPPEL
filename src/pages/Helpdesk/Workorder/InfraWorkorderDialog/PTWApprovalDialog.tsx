import React, { useEffect, useState } from 'react'
import { Dialog } from 'primereact/dialog';
import Button from '../../../../components/Button/Button';
import SuccessDialog from './SuccessDialog';


const PTWApprovalDialog = ({
  header,
  control,
  setValue,
  register,
  paragraph,
  watch,
  errors,
  getOptions,
  headerText,
  data,
  sccusspara,
  cssStyle,
  updateWOStatusInfra,
  CloseResolutionPopUp,
  Action_Code,
  selectedDetails,

}: any) => {
  const [visible, setVisible] = useState<boolean>(false);
  
  let payload = headerText === "Confirm Submission" ? data : { ACTION_ID: selectedDetails?.IS_ISOLATION_REQUIRED == false ? 114 : selectedDetails?.IS_ISOLATION_REQUIRED == true ? 115 : headerText === "Confirm Closure" ? [133]?.some((num) => Action_Code?.includes(num)) == true ? 133 : 134 : headerText === "Confirm Approval" ? 120 : headerText === "Confirm Test Pass" ? 127 : Action_Code == null ? 112 : [139]?.some((num) => Action_Code?.includes(num)) == true ? 139 : [141]?.some((num) => Action_Code?.includes(num)) == true ? 141 : 112 }
  const OpenPTWApprovalPopUp = () => {

    // CloseResolutionPopUp();

    setVisible(true);
  };
  const ClosePTWApprovalPopUp = () => {
    setVisible(!visible);
  };


  return (
    <>
      <Button
        type="button"
        label={header}
        className={cssStyle}
        onClick={() => OpenPTWApprovalPopUp()}
      />
      <Dialog
        header=""
        visible={visible}
        style={{ width: "550px" }}
        className="dialogBoxStyle"

        onHide={() => ClosePTWApprovalPopUp()}
      >
        <form>
          <div className="grid justify-items-center">
            <div className="">
              <h6 className="Text_Primary text-center mb-3">{headerText}</h6>

              <p className="Input_Text text-center">{paragraph}</p>
            </div>
            <div className="flex justify-end mt-[35px] gap-3">
              {headerText === "Confirm Submission" ? (
                <>
                  {/* <Button
                    name="Cancel"
                    className="Secondary_Button "
                    type="button"
                    label={"Save & Submit later"}

                    onClick={() => ClosePTWApprovalPopUp()}
                  /> */}
                  <SuccessDialog
                    header={"Save & Submit later"}
                    control={control}

                    setValue={setValue}
                    register={register}
                    paragraph={sccusspara}
                    watch={watch}
                    errors={errors}
                    payload={payload}
                    Actioncode={Action_Code}
                    CloseResolutionPopUp={CloseResolutionPopUp}
                    updateWOStatusInfra={updateWOStatusInfra}
                    ClosePTWApprovalPopUp={ClosePTWApprovalPopUp}
                  />
                  <SuccessDialog
                    header={"Submit for Closure"}
                    control={control}
                    setValue={setValue}
                    register={register}
                    paragraph={sccusspara}
                    watch={watch}
                    errors={errors}
                    payload={payload}
                    Actioncode={Action_Code}
                    CloseResolutionPopUp={CloseResolutionPopUp}
                    updateWOStatusInfra={updateWOStatusInfra}
                    ClosePTWApprovalPopUp={ClosePTWApprovalPopUp}

                  />
                </>
              ) : headerText === "Confirm Closure" ? (
                <>
                  <Button
                    name="Cancel"
                    className="Cancel_Button "
                    type="button"
                    label={"Cancel"}
                    onClick={() => ClosePTWApprovalPopUp()}
                  />

                  {headerText === "Confirm Closure" &&
                    paragraph ===
                    "Are you sure you want to close this work order?" ? (
                    <>
                      <SuccessDialog
                        header={"Close Work Order"}
                        control={control}
                        setValue={setValue}
                        register={register}
                        paragraph={sccusspara}
                        watch={watch}
                        errors={errors}
                        payload={payload}
                        Actioncode={134}
                        CloseResolutionPopUp={CloseResolutionPopUp}
                        updateWOStatusInfra={updateWOStatusInfra}
                        ClosePTWApprovalPopUp={ClosePTWApprovalPopUp}
                      />
                    </>
                  ) : (
                    <>
                      <SuccessDialog
                        header={"Submit & Close"}
                        control={control}
                        setValue={setValue}
                        register={register}
                        paragraph={sccusspara}
                        watch={watch}
                        errors={errors}
                        payload={payload}
                        Actioncode={133}
                        CloseResolutionPopUp={CloseResolutionPopUp}
                        updateWOStatusInfra={updateWOStatusInfra}
                        ClosePTWApprovalPopUp={ClosePTWApprovalPopUp}
                      />
                    </>
                  )}
                </>
              ) : headerText === "Confirm Test Pass" ? (
                <>
                  <Button
                    name="Cancel"
                    className="Cancel_Button"
                    type="button"
                    label={"Cancel"}
                    onClick={() => ClosePTWApprovalPopUp()}
                  />
                  <SuccessDialog
                    header={"Mark as Passed"}
                    control={control}
                    setValue={setValue}
                    register={register}
                    paragraph={sccusspara}
                    watch={watch}
                    errors={errors}
                    payload={payload}
                    Actioncode={Action_Code[0] ? 139 : Action_Code[0] ? 141 : 127}
                    updateWOStatusInfra={updateWOStatusInfra}
                    ClosePTWApprovalPopUp={ClosePTWApprovalPopUp}
                  />
                </>
              ) : (
                <>
                  <Button
                    name="Cancel"
                    className="Cancel_Button "
                    type="button"
                    label={"Cancel"}
                    onClick={() => ClosePTWApprovalPopUp()}
                  />
                  <SuccessDialog
                    header={headerText === "Confirm Approval" ? "Approve" : "Submit for Approval"}
                    control={control}
                    setValue={setValue}
                    register={register}
                    paragraph={sccusspara}
                    watch={watch}
                    errors={errors}
                    payload={{ ACTION_ID: headerText === "Confirm Approval" ? 120 : selectedDetails?.IS_ISOLATION_REQUIRED == false ? 114 : 115 }}
                    Actioncode={headerText === "Confirm Approval" ? 120 : selectedDetails?.IS_ISOLATION_REQUIRED == false ? 114 : 115}
                    updateWOStatusInfra={updateWOStatusInfra}
                    ClosePTWApprovalPopUp={ClosePTWApprovalPopUp}
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

export default PTWApprovalDialog
