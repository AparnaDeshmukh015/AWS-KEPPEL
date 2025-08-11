import { Dialog } from 'primereact/dialog';
import React, { useState } from 'react'
import Button from '../../../../components/Button/Button';
import SuccessDialog from './SuccessDialog';

const RequestResumeDialog = ({
  header,
  control,
  setValue,
  register,
  paragraph,
  watch,
  errors,
  getOptions,
  updateWOStatusInfra
}: any) => {
  const [visible, setVisible] = useState<boolean>(false);

  const OpenRequestResumePopUp = () => {
    setVisible(!visible);
    // setTimeout(() => {
    //   setVisible(false);
    // }, 5000);
  };
  const CloseRequestResumePopUp = () => {
    setVisible(!visible);
  };

  return (
    <>
      <Button
        type="button"
        label={header}
        className="Primary_Button mr-2 "
        onClick={() => OpenRequestResumePopUp()}
      />
      <Dialog
        header=""
        visible={visible}
        style={{ width: "550px" }}
        className="dialogBoxStyle"
        onHide={() => CloseRequestResumePopUp()}
      >
        <form>
          <div className="grid justify-items-center">
            <div className="">
              <h6 className="Text_Primary text-center mb-3">Confirm Resume</h6>

              <p className="Input_Text text-center">{paragraph}</p>
            </div>
            <div className="flex justify-end mt-[35px] gap-3">
              <Button
                name="Cancel"
                className="Cancel_Button"
                type="button"
                label={"Cancel"}
                onClick={() => CloseRequestResumePopUp()}
              />
              <SuccessDialog
                header={"Yes, Confirm"}
                control={control}
                setValue={setValue}
                register={register}
                paragraph={"Your resume request has been successfully submitted."}
                watch={watch}
                errors={errors}
                payload={{ ACTION_ID: 119 }}
                Actioncode={119}
                updateWOStatusInfra={updateWOStatusInfra}
              />
            </div>
          </div>
        </form>
      </Dialog>
    </>
  );
};

export default RequestResumeDialog
