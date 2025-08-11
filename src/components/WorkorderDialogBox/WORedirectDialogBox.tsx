import React, { useEffect, useState } from "react";
import Buttons from "../Button/Button";
import { Dialog } from "primereact/dialog";
import "./WoDialogBox.css";
import WorkorderRedirectDialogBox from "../DialogBox/WorkorderRedirectDialog";
import { callPostAPI } from "../../services/apis";
import { toast } from "react-toastify";
import { ENDPOINTS } from "../../utils/APIEndpoints";

const WORedirectDialogBox = ({
  control,
  setValue,
  register,
  REMARK,
  handlingStatus,
  watch,
  ASSIGN_TEAM_ID,
  getAPI,
  getOptionDetails,
  subStatus,
  currentStatus,
  errors,
  eventNotification,
}: any) => {
  const [visible1, setVisible1] = useState<boolean>(false);

  const status: any = [
    {
      code: "1",
      header: "Reassign",
      description: "Transfer work order to another technician",
    },
    {
      code: "2",
      header: "Collaborate",
      description: "Work together with another technician ",
    },

    {
      code: "3",
      header: "External Vendor Required",
      description: "Awaiting help from experts",
    },
    {
      code: "4",
      header: "Cancel Work Order",
      description: "No work to be done",
    },
    {
      code: "5",
      header: "Put On Hold",
      description: "Pausing this work order",
    },
    // { code: "7", header: "Cancel - Pre Conditional", description: "Cancel this work order due to pre-condition requirements." },
  ];

  const [redirectStatus, setRedirecStatus] = useState(false);
  const [statusHeader, setStatusHeader] = useState<any | null>();
  const [statusCode, setStatusCode] = useState<any | null>();
  const [options, setOptions] = useState<any | null>([]);
  var tempstatusList: any = [];
  var List: any = [];

  const setDialogVisible = () => {
    setVisible1(false);
    setVisible1(!visible1);
  };

  const setRedirectDialogVisible = (e: any, index: any, Status_Code: any) => {
    setStatusCode(Status_Code);
    setStatusHeader(e);
    setRedirecStatus(true);
    setVisible1(false);
  };

  const getOptions = async () => {
    try {
      const res = await callPostAPI(ENDPOINTS.GET_SERVICEREQUST_MASTERLIST, {});

      if (res?.FLAG === 1) {
        tempstatusList = res?.STATUSLIST;
        if (currentStatus === 1) {
          tempstatusList.forEach((element: any) => {
            if (element.STATUS_CODE === "1" || element.STATUS_CODE === "4") {
              List.push(element);
              setOptions({
                statusList: List,
              });
            }
          });
        } else {
          setOptions({
            statusList: tempstatusList,
          });
        }
      }
    } catch (error: any) {
      toast.error(error);
    }
  };

  useEffect(() => {
    if (visible1) {
      (async function () {
        await getOptions();
        setValue("REMARK", "");
      })();
    }
  }, [visible1]);

  return (
    <>
      <Buttons
        className="Secondary_Button w-20 me-2"
        label={"Redirect"}
        onClick={() => setDialogVisible()}
      />
      {!redirectStatus && visible1 && (
        <Dialog
          header="Redirect"
          visible={visible1}
          style={{ width: "35vw" }}
          onHide={() => setDialogVisible()}
        >
          {options &&
            options?.statusList?.map((s: any, index: any) => {
              let description: any = "";
              for (let i = 0; i < status?.length; i++) {
                if (status[i].code === s.STATUS_CODE) {
                  description = status[i].description;
                }
              }
              return (
                <div
                  onClick={() =>
                    setRedirectDialogVisible(
                      s.STATUS_DESC,
                      index,
                      s?.STATUS_CODE
                    )
                  }
                  className="flex  justify-between w-full p-3 h-54 border-2
                border-gray-200 border rounded-lg mb-2 redirectContainer"
                >
                  <div>
                    <h6 className=" Text_Primary" style={{ fontSize: "18px" }}>
                      {s?.STATUS_DESC}
                    </h6>
                    <p className="Text_Secondary Helper_Text">{description} </p>
                  </div>
                  <div>
                    <i className="pi pi-angle-right mt-3"></i>
                  </div>
                </div>
              );
            })}
        </Dialog>
      )}
      {redirectStatus && (
        <WorkorderRedirectDialogBox
          header={statusHeader}
          control={control}
          setValue={setValue}
          register={register}
          name={statusCode}
          REMARK={REMARK}
          handlingStatus={handlingStatus}
          watch={watch}
          // handlerWorkOrderStatus={handlerWorkOrderStatus}
          ASSIGN_TEAM_ID={ASSIGN_TEAM_ID}
          getOptionDetails={getOptionDetails}
          // options={options}
          teamList={options?.teamList}
          vendorList={options?.vendorList}
          statusCode={statusCode}
          technicianList={options?.technicianList}
          resonList={options?.reasonList}
          errors={errors}
          currentStatus={currentStatus}
          // isSubmitting={isSubmitting}
          subStatus={subStatus}
          redirectStatus={redirectStatus}
          setVisible1={setVisible1}
          setRedirecStatus={setRedirecStatus}
          eventNotification={eventNotification}
          getAPI={getAPI}
        />
      )}
    </>
  );
};

export default WORedirectDialogBox;
