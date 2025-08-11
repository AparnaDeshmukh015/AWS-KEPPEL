import { useCallback, useEffect, useState } from "react";
import { Sidebar } from 'primereact/sidebar';
import Buttons from "../../../components/Button/Button";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { useTranslation } from "react-i18next";
import { callPostAPI } from "../../../services/apis";
import { ENDPOINTS } from "../../../utils/APIEndpoints";
import { toast } from "react-toastify";
import { formateDate } from "../../../utils/constants";
import { Dialog } from 'primereact/dialog';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from "primereact/button";
import { decryptData } from "../../../utils/encryption_decryption";

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
  // statusCode,
  // selectedDetails
}: any) => {
  const [setVisible, setReassignVisible] = useState<boolean>(false);
  const [visibleDecline, setVisibleDecline] = useState(false);
  const [matvisibleDecline, setmatVisibleDecline] = useState(false);
  const [value, setValue] = useState("");
  const [IsSubmit, setIsSubmit] = useState<any | null>(false);
  const { t } = useTranslation();
  const [FilterMatlist, setFilterMatlist] = useState([]);
  const getId: any = localStorage.getItem("Id")
  const dataId = JSON.parse(getId)

  useEffect(() => {
    let FILT_MAT_LIST = PART_LIST?.filter((e: any) => e.MATREQ_ID === MATERIAL_LIST[0].MATREQ_ID);
    setFilterMatlist(FILT_MAT_LIST);
  }, [PART_LIST !== undefined]);

  const getOptionDetails = async (WO_ID: any) => {
    const payload: any = { WO_ID: WO_ID };
    try {
      const res: any = await callPostAPI(
        ENDPOINTS.GET_WORKORDER_DETAILS,
        payload
      );

      if (res?.FLAG === 1) {
        if (res?.WORKORDERDETAILS[0]?.CURRENT_STATUS !== 1 || res?.WORKORDERDETAILS[0]?.CURRENT_STATUS !== "1") {
        }
      }

    } catch (error: any) {
      toast.error(error)
    }
  }


  const onSubmit = useCallback(async (payload: any, e: any, type: any, payload1: any) => {
    if (IsSubmit) return true
    setIsSubmit(true)
    if (value.trim() === "" && type == "C") {
      setIsSubmit(false)
      toast.error("Please Enter Remarks");

      return;
    }
    const t = type === "AP" ? "Approved" : "Cancel";
    const b = type === "AP" ? true : false;
    const m = type === "AP" ? "AP" : "C";
    //const buttonMode: any = e?.nativeEvent?.submitter?.name;

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
        await getOptionDetails(MATERIAL_LIST[0]["WO_ID"])
        await getOptions();

        await setworkorderstatus(payload1, type);
      } else {

        toast?.error(res?.MSG);
      }
    } catch (error: any) {

      toast?.error(error);
    } finally {
      setIsSubmit(false)
    }
  }, [IsSubmit,
    MATERIAL_LIST,
    FilterMatlist,
    setworkorderstatus,
    callPostAPI,
    getOptionDetails,
    getOptions,
    setIsSubmit,
    value,])

  const getAPI = async () => {
    const res = await callPostAPI(ENDPOINTS.GET_EVENTMASTER, {
      FILTER_BY: 30,
    }, 'HD001');

    if (res?.FLAG === 1) {

    }
  }

  async function setworkorderstatus(payload1: any, type: any) {
    const t = type === "AP" ? "APPROVE" : "CANCELLED";
    const m = type === "AP" ? "AP" : "C";
    payload1.ACTIVE = 1;
    payload1.WO_ID = dataId?.WO_ID;
    payload1.WO_NO = dataId?.WO_NO;
    payload1.MODE = m;
    payload1.EVENT_TYPE = t;
    payload1.REMARKS = value;
    payload1.SUB_STATUS = WORKORDER_DETAILS?.SUB_STATUS;
    payload1.DOC_LIST = [];
    payload1.DOC_DATE = "";
    payload1.REASON_ID = "0";
    payload1.TYPE = "0";
    payload1.PARA = {
      para1: WORKORDER_DETAILS?.STATUS_DESC,
      para2: type === "AP" ? "Approved" : "Cancelled",
    };
    payload1.APPROVAL_TYPE = "M";

    const res1 = await callPostAPI(ENDPOINTS.SET_WORKSTATUS_Api, payload1);
    if (res1.FLAG === true) {
      await getOptionDetails(WORKORDER_DETAILS?.["WO_ID"])
      await getAPI()

      setmatVisibleDecline(false);
      setReassignVisible(false);
      setIsSubmit(false)
      window.location.reload();
    } else {
      toast.error(res1?.MSG);
      setIsSubmit(false)
    }
  }

  async function onReqSubmit(payload1: any, type: any) {
    if (IsSubmit) return true
    setIsSubmit(true)

    if (value.trim() === "" && type === "C") {
      setIsSubmit(false)
      toast.error("Please Enter Remarks");
      return;
    }

    const t = type === "AP" ? "APPROVE" : "CANCELLED";
    //const b = type == "AP" ? true : false;
    const m = type === "AP" ? "AP" : "C";
    payload1.ACTIVE = 1;
    payload1.WO_ID = WORKORDER_DETAILS?.["WO_ID"];
    payload1.WO_NO = WORKORDER_DETAILS?.["WO_NO"];
    payload1.MODE = m;
    payload1.EVENT_TYPE = t;
    payload1.REMARKS = value;
    payload1.SUB_STATUS = subStatus;
    payload1.DOC_LIST = [];
    payload1.DOC_DATE = "";
    payload1.REASON_ID = "0";
    payload1.TYPE = "0";
    payload1.PARA = {
      para1: WORKORDER_DETAILS?.STATUS_DESC,
      para2: type === "AP" ? "Approved" : "Cancelled",
    };
    payload1.APPROVAL_TYPE = "R";
    //payload1.REASSIGN_TYPE = statusCode === 1 ? "B" : "";
    payload1.REASSIGN_TYPE = WORKORDER_DETAILS?.["ATTEND_AT"] === null ? "B" : "";
    payload1.DUPLICATE_BY = DUPLICATE_BY;

    try {
      const res1 = await callPostAPI(ENDPOINTS.SET_WORKSTATUS_Api, payload1);
      if (res1.FLAG === true) {
        toast.success(res1?.MSG);
        await getOptionDetails(payload1.WO_ID)
        // getOptionDetails(WORKORDER_DETAILS?.["WO_ID"]);

        await getOptions();
        setVisibleDecline(false);
        setReassignVisible(false);

        await getAPI()
        setIsSubmit(false)
        window.location.reload()
      } else {
        setIsSubmit(false)
        toast.error(res1?.MSG);
      }
    } catch (error: any) {
      toast.error(error)
    } finally {
      setIsSubmit(false)
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
  const reviewReassignRequest = () => {
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
            onClick={() => reviewReassignRequest()}
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
              <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2">
                <div>
                  <label className="Text_Secondary Helper_Text  ">Status</label>
                  <p className="Rectified Helper_Text">Pending Review</p>
                </div>
                <div>
                  <label className="Text_Secondary Helper_Text  ">
                    Request Date & Time
                  </label>
                  <p className="Text_Primary Alert_Title">

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
                    {ASSIGNTECHLIST && ASSIGNTECHLIST?.map((assign: any, index: any) => {
                      return (
                        <>{assign?.USER_NAME}
                          {index < ASSIGNTECHLIST.length - 1 && ', '}
                        </>
                      );
                    })}
                  </p>
                </div>)}
                {(subStatus !== "4" || subStatus !== "5") && (headerTemplate === "Collaborate") && (<div>
                  <label className="Text_Secondary Helper_Text  ">
                    {WORKORDER_DETAILS?.["STATUS_DESC"]} with
                  </label>
                  <p className="Text_Primary Alert_Title">
                    {ASSIGNTECHLIST && ASSIGNTECHLIST?.map((assign: any, index: any) => {
                    
                   return (
                  assign.ASSIGN_TYPE === "C" && (
                    <span key={index}>
                      {assign?.USER_NAME}
                      {index < ASSIGNTECHLIST.filter((item:any) => item.ASSIGN_TYPE === "C").length - 1 && ', '}
                    </span>
                  ))

                  })}
                  </p>

                </div>)}
                <div className="col-span-2">
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
                          ? <>{WORKORDER_DETAILS?.["ONHOLD_REMARKS"] !== "" ? <>{WORKORDER_DETAILS?.["ONHOLD_REMARKS"]}<br /></> : ""}{WORKORDER_DETAILS?.["REASON_DESC"]}</>
                          : WORKORDER_DETAILS?.["SUB_STATUS"] === "2" &&
                            WORKORDER_DETAILS?.["CURRENT_STATUS"] === 5
                            ? WORKORDER_DETAILS?.["COLLABRAT_REMARKS"]
                            : WORKORDER_DETAILS?.["SUB_STATUS"] === "4" &&
                              WORKORDER_DETAILS?.["CURRENT_STATUS"] === 5
                              ? WORKORDER_DETAILS?.["CANCELLED_REMARKS"] :
                              "No Remarks Added"}
                  </p>
                  {/* <p className="Text_Primary Alert_Title">
                    {WORKORDER_DETAILS?.["REASON_DESC"]}
                  </p> */}
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
                        onClick={() => onReqSubmit({}, "AP")}
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
                    Request Date & Time
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

                <div className="col-span-2">
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
                        disabled={IsSubmit}
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
          setIsSubmit(false)
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
              setIsSubmit(false)
            }}
          />
          <Button
            //  type="submit"
            id="onHold"
            name="Save"
            disabled={IsSubmit}
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
            disabled={IsSubmit}
            label={"Submit"}
            onClick={async () => await onSubmit({}, "", "C", {})}
          />
        </div>
      </Dialog>
    </>
  );
};
export default SidebarVisibal;
