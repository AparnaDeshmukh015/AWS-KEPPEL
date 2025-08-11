import React, { useState } from 'react'
import { Dialog } from 'primereact/dialog';
import Button from '../../../../components/Button/Button';
import SuccessDialog from './SuccessDialog';

const AcknowledgeWoDialog = ({
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

  let payload = { ACTION_ID: 103 }
  const OpenAcknowledgePopUp = () => {
    setVisible(!visible);
    // setTimeout(() => {
    //   setVisible(false);
    // }, 5000);
  };
  const CloseAcknowledgePopUp = () => {
    setVisible(!visible);
  };

  return (
    <>
      <Button
        type="button"
        label={header}
        className="Primary_Button mr-2 "
        onClick={() => OpenAcknowledgePopUp()}
      />
      <Dialog
        header=""
        visible={visible}
        style={{ width: "550px" }}
        className="dialogBoxStyle"
        onHide={() => CloseAcknowledgePopUp()}
      >
        <form>
          <div className="grid justify-items-center">
            <div className="">
              <h6 className="Text_Primary text-center mb-3">Confirm Acknowledge</h6>

              <p className="Input_Text text-center">{paragraph}</p>
            </div>
            <div className="flex justify-end mt-[35px] gap-3">
              <Button
                name="Cancel"
                className="Cancel_Button"
                type="button"
                label={"Cancel"}
                onClick={() => CloseAcknowledgePopUp()}
              />
              <SuccessDialog
                header={"Acknowledge"}
                control={control}
                setValue={setValue}
                register={register}
                paragraph={"Your acknowledgement has been successfully submitted."}
                watch={watch}
                errors={errors}
                payload={payload}
                Actioncode={103}
                updateWOStatusInfra={updateWOStatusInfra}
                CloseAcknowledgePopUp={CloseAcknowledgePopUp}
              />
            </div>
          </div>
        </form>
      </Dialog>
    </>
  );
};

export default AcknowledgeWoDialog;


