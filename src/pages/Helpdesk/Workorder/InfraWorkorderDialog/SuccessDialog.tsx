import { Dialog } from 'primereact/dialog';
import React, { act, useState } from 'react'
import Button from '../../../../components/Button/Button';
import { toast } from 'react-toastify';

const SuccessDialog = ({
  indexgetStatus,
  header,
  control,
  setValue,
  register,
  paragraph,
  watch,
  errors,
  payload,
  updateWOStatusInfra,
  Actioncode,
  CloseReassignPopUp,
  updateWoDetails,
  SuccessType,
  CloseAcknowledgePopUp,
  ClosePTWApprovalPopUp,
  CloseResolutionPopUp,
  CloseConfirmPTWPopUp,
  CloseDeclinePTWApprovalPopUp,
  CloseRedirectOtherPopUp,
  CloseRedirectPopUp,
  CloseWOPopUp,
  CssStyle,
  setError,
  resetFields,
}: any) => {

  const [visible, setVisible] = useState<boolean>(false);
  const OpenSuccessPopUp = async () => {



    try {
      let valid = true;
      if (Actioncode == 102) {
        updateWOStatusInfra(payload, paragraph);
        CloseAcknowledgePopUp();
      }

      if (Actioncode == 103) {
        updateWOStatusInfra(payload, paragraph);
        CloseAcknowledgePopUp();
      }
      if (Actioncode == 112) {
        updateWOStatusInfra(payload, paragraph);
      }
      if (Actioncode == 113) {
        updateWOStatusInfra(payload, paragraph);
      }
      if (Actioncode == 114 || Actioncode == 115) {
        updateWOStatusInfra(payload, paragraph);
      }

      if (
        Actioncode === 108 ||
        Actioncode === 109 ||
        Actioncode === 110 ||
        Actioncode === 111 ||
        Actioncode == 116 ||
        Actioncode == 117 ||
        Actioncode == 104 ||
        Actioncode == 135 ||
        Actioncode == 136 ||
        Actioncode == 137 ||
        Actioncode == 138
      ) {
        if (Actioncode === 104 && (payload?.REASONID_INFRA !== undefined && payload?.REASONID_INFRA !== "")) {
          updateWOStatusInfra(payload, paragraph);
          CloseRedirectOtherPopUp();
          CloseRedirectPopUp();

        } else if (Actioncode === 104 && (payload?.REASONID_INFRA === undefined || payload?.REASONID_INFRA === "")) {
          // toast.error("Please fill the required fields.");
          setError(true);
          valid = false;
          return true;
        } else if (Actioncode !== 104 && payload?.REMARKS !== undefined && payload?.REMARKS !== "") {
          updateWOStatusInfra(payload, paragraph);
          CloseRedirectOtherPopUp();
          CloseRedirectPopUp();

          valid = true;
        } else {
          toast.error("Please fill the required fields.");
          setError(true);
          valid = false;
          return true;
        }
      }
      if (Actioncode == 122) {
        updateWOStatusInfra(payload, paragraph);
        CloseResolutionPopUp();
      }
      if (Actioncode == 124 && header === "Suspend") {
        updateWOStatusInfra(payload, paragraph);
        // CloseConfirmPTWPopUp();
      }
      if (Actioncode == 123) {
        updateWOStatusInfra(payload, paragraph);
        // CloseConfirmPTWPopUp();
      }
      if (Actioncode == 125) {
        updateWOStatusInfra(payload, paragraph);
      }
      if (
        Actioncode == 127 ||
        Actioncode == 128 ||
        Actioncode == 139 ||
        Actioncode == 140 ||
        Actioncode == 141 ||
        Actioncode == 142
      ) {

        updateWOStatusInfra(payload, paragraph);
      }
      if (Actioncode == 118 || Actioncode == 119 || Actioncode == 120) {
        updateWOStatusInfra(payload, paragraph);
      }
      if (Actioncode == 121 || Actioncode == 131) {
        updateWOStatusInfra(payload, paragraph);
      }
      if (Actioncode == 133) {
        updateWOStatusInfra(payload, paragraph);
      }
      if (Actioncode == 132) {
        if (header === "Save & Submit later") {
          const updatedPayload = {
            ...payload,
            ACTION_ID: 150
          }
          updateWOStatusInfra(updatedPayload, paragraph);


        } else {
          updateWOStatusInfra(payload, paragraph);
        }

      }
      if (Actioncode == 124 && header === "Submit for Closure") {
        updateWOStatusInfra(payload, paragraph);
      }
      if (Actioncode == 124 && header === "Save & Submit later") {
        const updatedPayload = {
          ...payload,
          ACTION_ID: 149
        }
        updateWOStatusInfra(updatedPayload, paragraph);
        CloseResolutionPopUp();

      }
      if (Actioncode == 134) {
        updateWOStatusInfra(payload, paragraph);
      }
      if (SuccessType === "WoUpdate") {
        updateWoDetails();
      }
      if (valid === true) {
        setVisible(!visible);
      }

      if (Actioncode == 101 || Actioncode == 102 || Actioncode == 107) {
        updateWOStatusInfra(payload, paragraph);
        CloseWOPopUp();
      }
      setTimeout(() => {
        setVisible(false);
        if (
          Actioncode === 104 &&
          payload?.REASONID_INFRA !== undefined &&
          payload?.REASONID_INFRA !== ""
        ) {
          resetFields();
        }
      }, 10000);
    } catch (error: any) {
      toast.error(error)
    }
  };

  return (
    <>
      <Button
        type="submit"
        label={header}
        className={header === "Save & Submit later" ? "Secondary_Button mr-2" : "Primary_Button mr-2"}
        onClick={() => OpenSuccessPopUp()}
      />
      {/* <Dialog
        header=""
        visible={visible}
        style={{ width: "30vw" }}
        onHide={() => ClosePopUp()}
      >
        <form>
          <div className="grid justify-items-center"> */}

      {/* <div className="mt-2 ">
              <h6 className="Text_Primary text-center mb-2">Success!</h6>

              <p className="Input_Text text-center">{paragraph}</p>
            </div> */}
      {/* </div>
        </form>
      </Dialog> */}
    </>
  );
};

export default SuccessDialog
