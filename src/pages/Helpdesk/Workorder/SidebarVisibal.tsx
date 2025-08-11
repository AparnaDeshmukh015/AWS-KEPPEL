import { useEffect, useState } from "react";
import { Sidebar } from 'primereact/sidebar';
import Buttons from "../../../components/Button/Button";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { useTranslation } from "react-i18next";
import { callPostAPI } from "../../../services/apis";
import { ENDPOINTS } from "../../../utils/APIEndpoints";
import { toast } from "react-toastify";
import { formateDate, onlyDateFormat } from "../../../utils/constants";
import { Dialog } from 'primereact/dialog';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from "primereact/button";
import { decryptData } from "../../../utils/encryption_decryption";
import { eventNotification, helperEventNotification } from "../../../utils/eventNotificationParameter";
const SidebarVisibal = ({
  headerTemplate,
  MATERIAL_LIST,
  PART_LIST,
  subStatus,
  ASSIGNTECHLIST,
  WORKORDER_DETAILS,
  getOptions,
  IsVisibleMaterialReqSideBar,
  setVisibleMaterialReqSideBar,
  DUPLICATE_BY,
  statusCode,
  selectedDetails
}: any) => {
  const [setVisible, setReassignVisible] = useState<boolean>(false);
  const [visibleDecline, setVisibleDecline] = useState(false);
  const [matvisibleDecline, setmatVisibleDecline] = useState(false);
  const [value, setValue] = useState("");

  const { t } = useTranslation();
  const [FilterMatlist, setFilterMatlist] = useState([]);

  useEffect(() => {
    let FILT_MAT_LIST = PART_LIST?.filter((e: any) => e.MATREQ_ID === MATERIAL_LIST[0].MATREQ_ID);
    setFilterMatlist(FILT_MAT_LIST);
  }, [PART_LIST !== undefined || PART_LIST !== null]);

  const getOptionDetails = async (WO_ID: any) => {
    const payload: any = { WO_ID: WO_ID };
    try {
      const res: any = await callPostAPI(
        ENDPOINTS.GET_WORKORDER_DETAILS,
        payload
      );

      if (res?.FLAG === 1) {


        if (res?.WORKORDERDETAILS[0]?.CURRENT_STATUS !== 1 || res?.WORKORDERDETAILS[0]?.CURRENT_STATUS !== "1") {
          const notifcation: any = {
            FUNCTION_CODE: "HD001",
            WO_NO: res?.WORKORDERDETAILS[0]?.WO_NO,

            EVENT_TYPE: "W",
            STATUS_CODE: res?.WORKORDERDETAILS[0]?.CURRENT_STATUS,
            PARA1: decryptData(localStorage.getItem("USER_NAME")),
            PARA2: res?.WORKORDERDETAILS[0]?.WO_NO,
            PARA3: res?.WORKORDERDETAILS[0]?.WO_DATE === null ? ""
              : onlyDateFormat(res?.WORKORDERDETAILS[0]?.WO_DATE),
            PARA4: res?.WORKORDERDETAILS[0]?.USER_NAME,
            PARA5: res?.WORKORDERDETAILS[0]?.LOCATION_NAME,
            PARA6: res?.WORKORDERDETAILS[0]?.ASSET_NAME,
            PARA7: res?.WORKORDERDETAILS[0]?.WO_REMARKS,
            PARA8: res?.WORKORDERDETAILS[0]?.SEVERITY_DESC,
            PARA9: res?.WORKORDERDETAILS[0]?.REPORTED_AT !== null
              ? formateDate(res?.WORKORDERDETAILS[0]?.REPORTED_AT) : "",
            PARA10: res?.WORKORDERDETAILS[0]?.ACKNOWLEDGED_AT !== null
              ? formateDate(res?.WORKORDERDETAILS[0]?.ATTEND_AT)
              : "",
            PARA11: res?.WORKORDERDETAILS[0]?.ATTEND_AT !== null
              ? formateDate(res?.WORKORDERDETAILS[0]?.ATTEND_AT)
              : "",
            PARA12: res?.WORKORDERDETAILS[0]?.RECTIFIED_AT !== null
              ? formateDate(res?.WORKORDERDETAILS[0]?.RECTIFIED_AT) : "",
            PARA13: res?.WORKORDERDETAILS[0]?.COMPLETED_AT !== null
              ? formateDate(res?.WORKORDERDETAILS[0]?.COMPLETED_AT) : "",
            PARA14: res?.WORKORDERDETAILS[0]?.CANCELLED_AT !== null
              ? formateDate(res?.WORKORDERDETAILS[0]?.CANCELLED_AT)
              : "",
            PARA15: "", //updated
            PARA16: res?.WORKORDERDETAILS[0]?.ACKNOWLEDGED_BY_NAME,
            PARA17: "", //attendBy
            PARA18: res?.WORKORDERDETAILS[0]?.RECTIFIED_BY_NAME,
            PARA19: res?.WORKORDERDETAILS[0]?.COMPLETED_BY_NAME,
            PARA20: res?.WORKORDERDETAILS[0]?.CANCELLED_BY_NAME, //cancelled BY
            PARA21: "", //approve on
            PARA22: "", //approve by,
            PARA23: "", //denied on,
            PARA24: "", //denied by
          };

          const eventPayload = { ...eventNotification, ...notifcation };
          console.log(eventPayload, 'event')
          helperEventNotification(eventPayload);
        }
      }



    } catch (error: any) {
      console.log(error)
    }
  }


  async function onSubmit(payload: any, e: any, type: any, payload1: any) {

    if (value.trim() === "" && type == "C") {
      toast.error("Please Enter Remarks");
      return;
    }
    const t = type === "AP" ? "Approved" : "Cancel";
    const b = type == "AP" ? true : false;
    const m = type === "AP" ? "AP" : "C";
    const buttonMode: any = e?.nativeEvent?.submitter?.name;

    payload.RAISED_BY = MATERIAL_LIST[0]["MATREQ_RAISEDBY"];
    payload.MATREQTYPE = MATERIAL_LIST[0]["SELF_WO"];
    payload.MATREQ_DATE = MATERIAL_LIST[0]["MATREQ_DATE"].toString();
    payload.REMARKS = MATERIAL_LIST[0]["REMARKS"];
    payload.STORE_ID = MATERIAL_LIST[0]["STORE_ID"];
    payload.PART_LIST = FilterMatlist;
    payload.MODE = m;
    payload.PARA = { para1: "Material Requisition", para2: t };
    payload.MATREQ_ID = MATERIAL_LIST[0]["MATREQ_ID"];
    payload.WO_NO = MATERIAL_LIST[0]["WO_NO"];
    payload.WO_ID = MATERIAL_LIST[0]["WO_ID"];
    payload.ISAPPROVED = b;

    try {
      const res = await callPostAPI(
        ENDPOINTS.SAVE_INVENTORY_MATERIAL_REQUISITION,
        payload
      );

      if (res?.FLAG) {
        toast?.success(res?.MSG);
        //  getOptionDetails(MATERIAL_LIST[0]["WO_ID"]);
        getOptionDetails(MATERIAL_LIST[0]["WO_ID"])
        getOptions();

        setworkorderstatus(payload1, type);
      } else {
        toast?.error(res?.MSG);
      }
    } catch (error: any) {
      toast?.error(error);
    }
  }

  const getAPI = async () => {
    const res = await callPostAPI(ENDPOINTS.GET_EVENTMASTER, {
      FILTER_BY: 30,
    }, 'HD001');
    console.log(res, 'res')
    if (res?.FLAG === 1) {
      window.location.reload()
    }
  }

  async function setworkorderstatus(payload1: any, type: any) {
    const t = type === "AP" ? "APPROVE" : "CANCELLED";
    const b = type == "AP" ? true : false;
    const m = type === "AP" ? "AP" : "C";
    payload1.ACTIVE = 1;
    payload1.WO_ID = WORKORDER_DETAILS?.["WO_ID"];
    payload1.WO_NO = WORKORDER_DETAILS?.["WO_NO"];
    payload1.MODE = m;
    payload1.EVENT_TYPE = t;
    payload1.REMARKS = value;
    payload1.SUB_STATUS = WORKORDER_DETAILS?.SUB_STATUS;
    payload1.DOC_LIST = []; //currentStatus === 4 ? [payloadDoc] : doclistWatch,
    payload1.DOC_DATE = ""; // moment(new Date()).format(dateFormat()),
    payload1.REASON_ID = "0"; // REASON_ID,
    payload1.TYPE = "0";
    payload1.PARA = {
      para1: WORKORDER_DETAILS?.STATUS_DESC,
      para2: type === "AP" ? "Approved" : "Cancelled",
    };
    payload1.APPROVAL_TYPE = "M";
    console.log(payload1, 'payload')
    const res1 = await callPostAPI(ENDPOINTS.SET_WORKSTATUS_Api, payload1);
    if (res1.FLAG === true) {
      //   toast.success(res1?.MSG);
      getOptionDetails(WORKORDER_DETAILS?.["WO_ID"])
      getAPI()

      setmatVisibleDecline(false);
      setReassignVisible(false);
    } else {
      toast.error(res1?.MSG);
    }
  }

  async function onReqSubmit(payload1: any, type: any) {

    if (value.trim() === "" && type === "C") {
      toast.error("Please Enter Remarks");
      return;
    }

    const t = type === "AP" ? "APPROVE" : "CANCELLED";
    const b = type == "AP" ? true : false;
    const m = type === "AP" ? "AP" : "C";
    payload1.ACTIVE = 1;
    payload1.WO_ID = WORKORDER_DETAILS?.["WO_ID"];
    payload1.WO_NO = WORKORDER_DETAILS?.["WO_NO"];
    payload1.MODE = m;
    payload1.EVENT_TYPE = t;
    payload1.REMARKS = value;
    payload1.SUB_STATUS = subStatus;
    payload1.DOC_LIST = []; //currentStatus === 4 ? [payloadDoc] : doclistWatch,
    payload1.DOC_DATE = ""; // moment(new Date()).format(dateFormat()),
    payload1.REASON_ID = "0"; // REASON_ID,
    payload1.TYPE = "0";
    payload1.PARA = {
      para1: WORKORDER_DETAILS?.STATUS_DESC,
      para2: type === "AP" ? "Approved" : "Cancelled",
    };
    payload1.APPROVAL_TYPE = "R";
    //payload1.REASSIGN_TYPE = statusCode === 1 ? "B" : "";
    payload1.REASSIGN_TYPE = WORKORDER_DETAILS?.["ATTEND_AT"] === null ? "B" : "";
    payload1.DUPLICATE_BY = DUPLICATE_BY;
    console.log(payload1, 'payload')
    const res1 = await callPostAPI(ENDPOINTS.SET_WORKSTATUS_Api, payload1);
    if (res1.FLAG === true) {
      toast.success(res1?.MSG);
      getOptionDetails(payload1.WO_ID)
      // getOptionDetails(WORKORDER_DETAILS?.["WO_ID"]);

      getOptions();
      setVisibleDecline(false);
      setReassignVisible(false);
      getAPI()
    } else {
      toast.error(res1?.MSG);
    }
  }

  const customHeader = (
    <>
      {headerTemplate === "Reassign" || headerTemplate === "Collaborate" || headerTemplate === 'External Vendor Required' || headerTemplate === 'Cancel Work Order' || headerTemplate === 'Put On Hold' ? (
        <>

          <div className=" gap-2">
            <p className="Helper_Text Menu_Active">Redirect / </p>
            <h6 className="Input_Text Text_Primary mb-2">
              {WORKORDER_DETAILS?.["STATUS_DESC"]} Request
            </h6>
          </div>
        </>
      ) : (
        <>
          <div className=" gap-2">
            <p className="Helper_Text Menu_Active"> Material Requisition / </p>
            <h6 className="Text_Primary">
              {MATERIAL_LIST?.length > 0 ? MATERIAL_LIST[0]?.MATREQ_NO : ""}
            </h6>
          </div>
        </>
      )}
    </>
  );
  const reviewReassignRequest = (item: any) => {
    setReassignVisible(true);
  };

  useEffect(() => {
    if (IsVisibleMaterialReqSideBar === true) {
      setReassignVisible(true);
    } else if (IsVisibleMaterialReqSideBar === false) {
      setReassignVisible(false);
    }
  }, [IsVisibleMaterialReqSideBar]);

  return (
    <>
      {(decryptData(localStorage.getItem("ROLETYPECODE")) === "SA" ||
        decryptData(localStorage.getItem("ROLETYPECODE")) === "S") && (
          <Buttons
            className="Review_Button"
            type="button"
            icon="pi pi-arrow-right"
            label={"Review Now"}
            onClick={(e: any) => reviewReassignRequest(e)}
          />
        )}
      <Sidebar
        className="w-full md:w-1/3"
        position="right"
        header={customHeader}
        visible={setVisible}
        onHide={() => {
          setReassignVisible(false);
          setVisibleMaterialReqSideBar(false)
        }}
      >
        {headerTemplate === "Reassign" || headerTemplate === "Collaborate" || headerTemplate == 'External Vendor Required' || headerTemplate == 'Cancel Work Order' || headerTemplate == 'Put On Hold' ? (
          <>
            <div>
              <div className="mt-2 grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-2 lg:grid-cols-2">
                <div>
                  <label className="Text_Secondary Helper_Text  ">Status</label>
                  <p className="Menu_Active Helper_Text">Pending Review</p>
                </div>
                <div>
                  <label className="Text_Secondary Helper_Text  ">
                    Request Date
                  </label>
                  <p className="Text_Primary Alert_Title">
                    {/* {moment(WORKORDER_DETAILS?.["REQ_DATE"]).format(
                      dateFormat()
                    )} */}
                    {/* {moment(WORKORDER_DETAILS?.["REQ_DATE"]).format(
                      `${dateFormat()} ${","} HH:mm `
                    )} */}
                    {formateDate(WORKORDER_DETAILS?.["REQ_DATE"])}
                  </p>
                </div>
                <div>
                  <label className="Text_Secondary Helper_Text  ">
                    Requestor
                  </label>
                  <p className="Text_Primary Alert_Title">
                    {WORKORDER_DETAILS?.["REQ_NAME"]}
                  </p>
                </div>
                {(subStatus !== "4" || subStatus !== "5") && (headerTemplate === "Reassign") && (<div>
                  <label className="Text_Secondary Helper_Text  ">
                    {WORKORDER_DETAILS?.["STATUS_DESC"]} to
                  </label>

                  <p className="Text_Primary Alert_Title">
                    {ASSIGNTECHLIST?.[0]?.["USER_NAME"]}
                  </p>
                </div>)}
                {(subStatus !== "4" || subStatus !== "5") && (headerTemplate === "Collaborate") && (<div>
                  <label className="Text_Secondary Helper_Text  ">
                    {WORKORDER_DETAILS?.["STATUS_DESC"]} with
                  </label>
                  <p className="Text_Primary Alert_Title">
                    {ASSIGNTECHLIST?.[0]?.["USER_NAME"]}
                  </p>

                </div>)}
                <div>
                  <label className="Text_Secondary Helper_Text  ">
                    Remarks
                  </label>
                  <p className="Text_Primary Alert_Title">
                    {WORKORDER_DETAILS?.["SUB_STATUS"] === "5" &&
                      WORKORDER_DETAILS?.["CURRENT_STATUS"] === 5
                      ? WORKORDER_DETAILS?.["VENDOR_REDIRECT_REMARKS"]
                      : WORKORDER_DETAILS?.["SUB_STATUS"] === "3" &&
                        WORKORDER_DETAILS?.["CURRENT_STATUS"] === 5
                        ? WORKORDER_DETAILS?.["VENDOR_REDIRECT_REMARKS"]
                        : WORKORDER_DETAILS?.["SUB_STATUS"] === "1" &&
                          WORKORDER_DETAILS?.["CURRENT_STATUS"] === 5
                          ? WORKORDER_DETAILS?.["REDIRECT_INSTRUCTIONS"]
                          : WORKORDER_DETAILS?.["SUB_STATUS"] === "2" &&
                            WORKORDER_DETAILS?.["CURRENT_STATUS"] === 5
                            ? WORKORDER_DETAILS?.["COLLABRAT_REMARKS"]
                            : ""}
                  </p>
                  <p className="Text_Primary Alert_Title">
                    {WORKORDER_DETAILS?.["REASON_DESC"]}
                  </p>
                </div>
              </div>
              <div className="mt-5">
                {(decryptData(localStorage.getItem("ROLETYPECODE")) === "SA" ||
                  decryptData(localStorage.getItem("ROLETYPECODE")) === "S") && (
                    <>
                      <Buttons
                        className="Secondary_Button me-2"
                        label={"Decline"}
                        type="button"
                        name="CANCELLED"
                        onClick={() => setVisibleDecline(true)}
                      />
                      <Buttons
                        type="button"
                        label={"Approve"}
                        name="APPROVE"
                        className="Primary_Button"
                        onClick={(e: any) => onReqSubmit({}, "AP")}
                      />
                    </>
                  )}
              </div>
            </div>
          </>
        ) : (
          <>
            <div>
              <div className="mt-2 grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-2 lg:grid-cols-2">
                <div>
                  <label className="Text_Secondary Helper_Text  ">Status</label>
                  <p className="Menu_Active Alert_Title">
                    {MATERIAL_LIST?.length > 0
                      ? MATERIAL_LIST[0]["STATUS_DESC"]
                      : ""}
                  </p>
                </div>
                <div>
                  <label className="Text_Secondary Helper_Text  ">
                    Requisition Type
                  </label>
                  <p className="Text_Primary Alert_Title">
                    {MATERIAL_LIST?.length > 0
                      ? MATERIAL_LIST[0]["SELF_WO"] == "A"
                        ? "Against Work Order"
                        : "Self"
                      : ""}
                  </p>
                </div>
                <div>
                  <label className="Text_Secondary Helper_Text  ">
                    Request Date
                  </label>
                  <p className="Text_Primary Alert_Title">
                    {MATERIAL_LIST?.length > 0
                      ?
                      // moment(MATERIAL_LIST[0]["MATREQ_DATETIME"]).format(
                      //   `${dateFormat()} ${","} HH:mm`
                      // )
                      formateDate(MATERIAL_LIST[0]["MATREQ_DATETIME"])
                      : ""}
                  </p>
                </div>
                <div>
                  <label className="Text_Secondary Helper_Text  ">
                    Requestor
                  </label>
                  <p className="Text_Primary Alert_Title">
                    {MATERIAL_LIST?.length > 0
                      ? MATERIAL_LIST[0]["USER_NAME"]
                      : ""}
                  </p>
                </div>

                <div>
                  <label className="Text_Secondary Helper_Text  ">
                    Remarks
                  </label>
                  <p className="Text_Primary Alert_Title">
                    {MATERIAL_LIST?.length > 0
                      ? MATERIAL_LIST[0]["REMARKS"]
                      : ""}
                  </p>
                </div>
              </div>
              <div className="mt-3">
                <DataTable
                  value={FilterMatlist}
                  showGridlines
                  emptyMessage={t("No Data found.")}
                >
                  <Column
                    field="PART_NAME"
                    header="Material Name"
                    body={(rowData: any) => {
                      return (
                        <>
                          <div>
                            <label className=" Text_Primary Alert_Title ">
                              {rowData?.PART_NAME}
                            </label>
                            <p className="Text_Secondary Helper_Text">
                              {rowData?.PART_CODE}
                            </p>
                          </div>
                        </>
                      );
                    }}
                  ></Column>
                  <Column field="STOCK" header="Stock"></Column>
                  <Column field="QTY" header="Quantity"></Column>

                </DataTable>
              </div>
              <div className="mt-5">
                {(decryptData(localStorage.getItem("ROLETYPECODE")) === "SA" ||
                  decryptData(localStorage.getItem("ROLETYPECODE")) === "S") && (
                    <>
                      <Buttons
                        className="Secondary_Button me-2"
                        label={"Decline"}

                        onClick={() => {
                          setValue("")
                          setmatVisibleDecline(true);
                          setReassignVisible(false);
                          setVisibleMaterialReqSideBar(false)
                        }}
                        type="button"
                      />
                      <Buttons
                        type="button"
                        label={"Approve"}
                        onClick={async () => await onSubmit({}, "", "AP", {})}
                        className="Primary_Button"
                      />
                    </>
                  )}
              </div>
            </div>
          </>
        )}

      </Sidebar>

      <Dialog
        header="Decline Request"
        visible={visibleDecline}
        style={{ width: "40vw" }}
        onHide={() => {
          if (!visibleDecline) return;
          setVisibleDecline(false);
        }}
      >
        <label className="Text_Secondary Input_Label">{t("Remarks")}<span className="text-red-600"> *</span></label>
        <InputTextarea
          value={value}
          placeholder="Enter Remarks"
          onChange={(e) => setValue(e.target.value)}
          rows={5}
          cols={30}
        />

        <div className="flex justify-end mt-5">
          <Button
            className="Cancel_Button  me-2"
            type="button"
            label={"Cancel"}
            onClick={() => {
              setValue("");
              setVisibleDecline(false);
            }}
          />
          <Button
            //  type="submit"
            id="onHold"
            name="Save"
            className="Primary_Button"
            label={"Submit"}
            onClick={async () => await onReqSubmit({}, "C")}
          />
        </div>
      </Dialog>

      <Dialog
        header="Decline Material Request"
        visible={matvisibleDecline}
        style={{ width: "40vw" }}
        onHide={() => {
          if (!matvisibleDecline) return;
          setmatVisibleDecline(false);
        }}
      >
        <label className="Text_Secondary Input_Label">
          {t("Remarks")}
          <span className="text-red-600"> *</span>
        </label>
        <InputTextarea
          value={value}
          placeholder="Enter Remarks"
          onChange={(e) => setValue(e.target.value)}
          rows={5}
          cols={30}
        />

        <div className="flex justify-end mt-5">
          <Button
            className="Cancel_Button  me-2"
            type="button"
            label={"Cancel"}
            onClick={() => {
              setValue("")
              setmatVisibleDecline(false);

            }}
          />
          <Button
            id="onHold"
            name="Save"
            className="Primary_Button"
            label={"Submit"}
            onClick={async () => await onSubmit({}, "", "C", {})}
          />
        </div>
      </Dialog>
    </>
  );
};
export default SidebarVisibal;
