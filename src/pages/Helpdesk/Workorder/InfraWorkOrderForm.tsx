import React from "react";
import { Card } from "primereact/card";
import { useEffect, useState, memo } from "react";
import { set, useForm } from "react-hook-form";
import { Tooltip } from "primereact/tooltip";
import success from "../../../assest/images/success.gif";
import {
  TabView,
  TabPanel,
  TabPanelHeaderTemplateOptions,
} from "primereact/tabview";
import "./WorkorderMaster.css";
import userIcon from "../../../assest/images/Avatar.png";
import timeIcon from "../../../assest/images/bx-time.png";
import noDataIcon from "../../../assest/images/nodatafound.png";
import reviewIcon from "../../../assest/images/IconContainer.png";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import Field from "../../../components/Field";
import InputField from "../../../components/Input/Input";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import {
  useLocation,
  useNavigate,
  useOutletContext,
  useParams,
} from "react-router-dom";
import { Checkbox } from "primereact/checkbox";
import Buttons from "../../../components/Button/Button";
import Select from "../../../components/Dropdown/Dropdown";
import { Timeline } from "primereact/timeline";

import {
  dateFormat,
  formateDate,
  helperNullDate,
  LOCALSTORAGE,
  onlyDateFormat,
  priorityIconList,
  saveTracker,
} from "../../../utils/constants";
import WORedirectDialogBox from "../../../components/WorkorderDialogBox/WORedirectDialogBox";
import { Badge } from "primereact/badge";
import moment from "moment";
import { callPostAPI } from "../../../services/apis";
import { ENDPOINTS } from "../../../utils/APIEndpoints";
import SidebarVisibal from "./SidebarVisibal";
import { v4 as uuidv4 } from "uuid";
import WorkOrderDialogBox from "../../../components/DialogBox/WorkOrderDalog";
import CountdownTimer from "./ShowCounter";
import { Dialog } from "primereact/dialog";
import LoaderS from "../../../components/Loader/Loader";
import { helperEventNotification } from "../../../utils/eventNotificationParameter";
import { appName, PATH } from "../../../utils/pagePath";
import { decryptData } from "../../../utils/encryption_decryption";
import DateTimeDisplay from "./DateTimeDisplay";
import pdfIcon from "../../../assest/images/pdfIcon.jpg";
import excelIcon from "../../../assest/images/excelIcon.png";
import wordDocIcon from "../../../assest/images/wordDocIcon.png";
import LoaderFileUpload from "../../../components/Loader/LoaderFileUpload";
import ReopenDialogBox from "../../../components/DialogBox/ReopenDialogBox";
import CancelWoDialog from "./InfraWorkorderDialog/CancelWoDialog";
import AssignWoDialog from "./InfraWorkorderDialog/AssignWoDialog";
import Button from "../../../components/Button/Button";
import { InputTextarea } from "primereact/inputtextarea";
import DateCalendar from "../../../components/Calendar/Calendar";
import SuccessDialog from "./InfraWorkorderDialog/SuccessDialog";
import RedirectWoDialog from "./InfraWorkorderDialog/RedirectWoDialog";
import InfraSidebarVisibal from "./InfraWorkorderDialog/InfraSidebarVisibal";
import AcknowledgeWoDialog from "./InfraWorkorderDialog/AcknowledgeWoDialog";
import PTWApprovalDialog from "./InfraWorkorderDialog/PTWApprovalDialog";
import AddResolutionDialog from "./InfraWorkorderDialog/AddResolutionDialog";
import RequestResumeDialog from "./InfraWorkorderDialog/RequestResumeDialog";
import WoDocumentUpload from "../../../components/pageComponents/DocumentUpload/WoDocumentUpload";

import { SplitButton } from "primereact/splitbutton";
import DeclinePTWDialog from "./InfraWorkorderDialog/DeclinePTWDialog";
import ProceedPTWDialog from "./InfraWorkorderDialog/ProceedPTWDialog";
import NormalizeToTest from "./InfraWorkorderDialog/NormalizeToTest";

import { Sidebar } from "primereact/sidebar";
import PdfReport from "./PdfReport/PdfReport";
import ImageGalleryComponent from "../ImageGallery/ImageGallaryComponent";
interface taskDetails {
  TASK_ID: any;
  TASK_NAME: any;
}

interface docType {
  DOC_SRNO: any;
  DOC_NAME: string;
  DOC_DATA: any;
  DOC_EXTENTION: string;
  DOC_SYS_NAME: any;
  ISDELETE: any;
  DOC_TYPE: any;
}

interface partList {
  PART_ID: string;
  PART_CODE: string;
  UOM_CODE: any;
  UOM_NAME: any;
  PART_NAME: any;
  STOCK: any;
  USED_QUANTITY: any;
}

interface docType {
  DOC_SRNO: any;
  DOC_NAME: string;
  DOC_DATA: any;
  DOC_EXTENTION: string;
  DOC_SYS_NAME: any;
  ISDELETE: any;
  DOC_TYPE: any;
}

interface FormValues {
  // SIG: ReactSignatureCanvas | null;
  RAISED_BY: string | null;
  STRUCTURE_ID: string | null;
  ASSET_NONASSET: string | null;
  ASSETTYPE: string | null;
  REQ_DESC: string | null;
  DESCRIPTION: string;
  SEVERITY_CODE: string;
  TASK_DES: string;
  WORK_ORDER_NO: string;
  WO_NO: string | null;
  SEVERITY_DESC: string;
  WO_TYPE: string;
  LOCATION_NAME: string;
  LOCATION_DESCRIPTION: string;
  ASSET_NAME: string;
  ASSETGROUP_NAME: string;
  ASSETTYPE_NAME: string;
  WO_DATE: string;
  WO_REMARKS: string;
  SEVERITY: string;
  REMARK: string;
  PHONE_NO: number;
  EMAIL_ID: any;
  STATUS_DESC: string | null;
  TASKDETAILS: taskDetails[];
  PART_LIST: partList[];
  ASSIGN_TEAM_ID: string;
  TEAM_NAME: string;
  TECH_NAME: string;
  STATUS_CODE: string;
  DOC_LIST: docType[];
  PARTS_TYPE: string;
  REQ_ID: string;
  ASSET_ID: string;
  MODE: string;
  LOCATION_ID: string;
  REQUESTTITLE_ID: string;
  CURRENT_STATUS: any;
  TECH_ID: any;
  RAISEDBY_ID: any;
  ASSETTYPE_ID: any;
  ASSETGROUP_ID: any;
  LAST_MAINTANCE_DATE: any;
  WARRANTY_END_DATE: any;
  TASK_NAME: any;
  BILL_DATE: any;
  VERIFY: any;
  ACTION_ID?: number;
}

interface TimelineEvent {
  status?: string;
  date?: string;
  icon?: string;
  color?: string;
  image?: string;
}

let WO_ID: number;

const InfraWorkOrderForm = (props: any) => {
  //const { serach }:any = useParams();
  const navigate: any = useNavigate();
  const { search } = useLocation();
  const location: any = useLocation();
  const [masterList, setmasterList] = useState<any | null>([]);
  const [selectedDetails, setSelectedDetails] = useState<any>([]);
  const [MapButtons, setMapButtons] = useState<any>([]);
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeTaskIndex, setActiveTaskIndex] = useState(0);
  let { pathname } = useLocation();
  const [selectedFacility, menuList]: any = useOutletContext();
  const id: any = decryptData(localStorage.getItem("USER_ID"));
  const [facilityStatus, setFacilityStatus] = useState<any | null>(null);
  const [isloading, setisloading] = useState<any | null>(false);
  const [loader, setloader] = useState<any | null>(false);
  const [IsCancel, setIsCancel] = useState<any | null>(false);
  let showdetails = true;
  const currentMenu = menuList
    ?.flatMap((menu: any) => menu?.DETAIL)
    .filter((detail: any) => {
      if (detail?.FUNCTION_CODE === "AS007") {
        showdetails = false;
      }
      return detail.URL === pathname;
    })[0];
  const [docOption, setDocOption] = useState<any | null>([]);

  const [technicianList, setTechnicianList] = useState<any | null>([]);
  const [ReassignList, setReassignList] = useState<any | null>([]);
  const [timelineList, setTimelineList] = useState<any | null>([]);
  const [WOAcativeList, setWOActiveList] = useState<any | null>([]);
  const [taskList, setTaskList] = useState<any | null>([]);
  const [EditTaskList, setEditTaskList] = useState<any | null>([]);
  const [assetDocList, setAssetDocList] = useState<any | null>([]);
  const [locationStatus, setLocationStatus] = useState<any | null>(false);
  const [options, setOptions] = useState<any | null>([]);
  const [loading, setLoading] = useState<any | null>(false);
  const [status, setStatus] = useState<any | null>(false);
  const [currentStatus, setCurrentStatus] = useState<any | null>();
  const [IsVisibleMaterialReqSideBar, setVisibleMaterialReqSideBar] =
    useState<boolean>(false);
  const [assetTreeDetails, setAssetTreeDetails] = useState<any | null>([]);
  const [signatureDoc, setSignatureDoc] = useState<any | null>([]);
  const [materiallist, setMaterialRequest] = useState<any | null>([]);
  const [asssetGroup, setasssetGroup] = useState<any | null>();
  const [asssetType, setasssetType] = useState<any | null>();
  const [asssetName, setasssetName] = useState<any | null>();
  const [issueName, setissueName] = useState<any | null>();
  const [partMatOptions, setMaterialPartOptions] = useState<any | null>([]);
  let [imgSrc, setImgSrc] = useState<any | null>();
  const [subStatus, setSubStatus] = useState<any | null>();
  const [approvalStatus, setApprovalStatus] = useState<any | null>(false);
  const [editStatus, setEditStatus] = useState<any | null>(false);
  let [locationtypeOptions, setlocationtypeOptions] = useState([]);
  const [EquipmentGroup, setEquipmentGroup] = useState<any | null>([]);
  const [type, setType] = useState<any | null>([]);
  const [assetList, setAssetList] = useState<any | null>([]);
  const [reassignVisible, setReassignVisible] = useState<boolean>(false);
  const [dateTimeAfterThreeDays, setDateTimeAfterThreeDays] = useState<
    number | null
  >(null);
  const [CompDays, setCompDays] = useState<any | null>(0);
  const [CompHours, setCompHours] = useState<any | null>(0);
  const [CompMinutes, setCompMinutes] = useState<any | null>(0);
  const [CompSeconds, setCompSeconds] = useState<any | null>(0);
  const [localGroupId, setLocalGroupID] = useState<any | null>("");
  const [localAssetTypeId, setLocalAssetTypId] = useState<any | null>("");
  const [localAssetId, setLocalAssetId] = useState<any | null>("");
  const [localRequestId, setLocalRequestId] = useState<any | null>("");
  const [visibleImage, setVisibleImage] = useState<boolean>(false);
  const [ViewAddTask, SetViewAddTask] = useState<boolean>(false);
  const [statusButton, setStatusButton] = useState<any | null>(null);
  const [showImage, setShowImage] = useState<any>([]);
  const [showReassingList, setShowReassingList] = useState<any | null>(true);
  const [IsSubmit, setIsSubmit] = useState<any | null>(false);
  const [issueList, setIssueList] = useState<any | null>([]);
  const [assignStatus, setAssignStatus] = useState<any | null>(false);
  const [editDetails, setEditdetails] = useState<boolean>(false);
  const [visibleTestingOhHold, setTestingOnHold] = useState<boolean>(false);
  const [techList, setTechList] = useState<any | null>([]);
  const [assigneeTechList, setAssigneeTechList] = useState<any | null>([]);
  const [selectedTechList, setSelectedTechList] = useState<any | null>([]);
  const [reasonList, setReasonList] = useState<any | null>([]);
  const [visible, setVisible] = useState<boolean>(false);
  const [paragraph, Setparagraph] = useState<any>("");
  const [Descriptionlength, setDescriptionlength] = useState(0);
  const [newStatusList, setnewStatusList] = useState<any | null>([]);
  const [visibleRight, setVisibleRight] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState<any | null>();
  const [addAssigneeAction, setaddAssigneeAction] = useState<any | null>();
  const [newtimelinelist, setNewTimelineList] = useState<any | null>([]);
  const [workOrderReportDetails, setWorkOrderReportDetails] = useState<
    any | null
  >([]);
  const [visibleSucces, setvisibleSucces] = useState<boolean>(false);
  const [DocTitle, setDocTitle] = useState<any | null>("");
  const [docName, setdocName] = useState<any | null>();
  const [successType, setSuccessType] = useState<any | null>(false);
  const [visibleSuccesReport, setVisibleSuccesReport] = useState<any | null>(
    false
  );
  const [selectedPriorityIconName, setselectedPriorityIconName] = useState<
    any | null
  >();
  const [descriptionData, setDescriptionData] = useState<any | null>(null);
  const [documentsToDelete, setDocumentsToDelete] = useState<string[]>([]);
  const Actionitems = [
    {
      label: "Testing on Hold",
      visible: true,
      command: () => {
        setTestingOnHold(true);
      },
    },
    {
      label: "Normalization not Required ",
      command: async () => {
        updateWOStatusInfra(
          { ACTION_ID: 126 },
          "This work order has been updated successfully."
        );
      },
    },
  ];
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    getValues,
    resetField,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      PARTS_TYPE: "",
      RAISED_BY: props?.selectedData?.RAISED_BY || "",
      STRUCTURE_ID: "",
      ASSET_NONASSET: "",
      REMARK: "",
      ASSETTYPE: "",
      REQ_DESC: "",
      DESCRIPTION: "",
      SEVERITY_CODE: props?.selectedData?.SEVERITY_CODE,
      TASK_DES: "",
      WORK_ORDER_NO: "",
      WO_NO:
        props?.selectedData !== undefined ? props?.selectedData?.WO_NO : "",
      WO_TYPE: "CM",
      LOCATION_NAME: "",
      LOCATION_DESCRIPTION: "",
      ASSET_NAME: "",
      ASSETGROUP_NAME: "",
      ASSETTYPE_NAME: "",
      WO_DATE: "",
      WO_REMARKS: "",
      SEVERITY_DESC: "",
      TASKDETAILS: [{ TASK_ID: "0", TASK_NAME: "" }],
      PART_LIST: [],
      ASSIGN_TEAM_ID: "",
      TEAM_NAME: "",
      TECH_NAME: "",
      STATUS_CODE: "",
      DOC_LIST: [],
      REQ_ID: "",
      ASSET_ID: "",
      MODE: props?.selectedData ? "E" : "A",
      RAISEDBY_ID: "",
      LOCATION_ID: "",
      REQUESTTITLE_ID: "",
      CURRENT_STATUS: 1,
      TECH_ID: [],
      ASSETTYPE_ID: "",
      ASSETGROUP_ID: "",
      LAST_MAINTANCE_DATE: "",
      WARRANTY_END_DATE: "",
      ACTION_ID: 0,
    },
    mode: "all",
  });

  let assigneeActionCode: any;

  const StatusEvents = [
    {
      id: 1,
      title: "Assignment",
      date:
        selectedDetails?.ASSIENTMENT_AT === null
          ? ""
          : formateDate(selectedDetails?.ASSIENTMENT_AT),
      status: currentStatus === 1 ? true : false,
      progress: true,
      subtitle: currentStatus === 1 ? selectedDetails?.SUB_STATUS_DESC : "",
    },
    // Only add "Cancelled" if selectedDetails?.CANCELLED_AT exists
    ...(selectedDetails?.CANCELLED_AT
      ? [
        {
          id: 6,
          title: "Cancelled",
          date:
            selectedDetails?.CANCELLED_AT === null
              ? ""
              : formateDate(selectedDetails?.CANCELLED_AT),
          status: currentStatus === 5 ? true : false,
          progress: true,
          subtitle:
            currentStatus === 5 ? selectedDetails?.SUB_STATUS_DESC : "",
        },
      ]
      : []),
    // Only add "Suspension" if selectedDetails?.SUSPENTION_AT exists
    ...(selectedDetails?.SUSPENTION_AT
      ? [
        {
          id: 2,
          title: "Suspension",
          date:
            selectedDetails?.SUSPENTION_AT === null
              ? ""
              : formateDate(selectedDetails?.SUSPENTION_AT),
          status: currentStatus === 3 ? true : false,
          progress: true,
          subtitle:
            currentStatus === 3 ? selectedDetails?.SUB_STATUS_DESC : "",
        },
      ]
      : []),

    {
      id: 3,
      title: "In Progress",
      date:
        selectedDetails?.ATTEND_AT === null
          ? ""
          : formateDate(selectedDetails?.ATTEND_AT),
      status: currentStatus === 2 ? true : false,
      progress: true,
      subtitle: currentStatus === 2 ? selectedDetails?.SUB_STATUS_DESC : "",
    },

    {
      id: 4,
      title: "Completed",
      date:
        selectedDetails?.COMPLETED_AT === null
          ? ""
          : formateDate(selectedDetails?.COMPLETED_AT),
      status: currentStatus === 4 ? true : false,
      progress: true,
      subtitle: currentStatus === 4 ? selectedDetails?.SUB_STATUS_DESC : "",
    },

    {
      id: 5,
      title: "Closure",
      date:
        selectedDetails?.CLOSURE_AT === null
          ? ""
          : formateDate(selectedDetails?.CLOSURE_AT),
      status: currentStatus === 6 ? true : false,
      progress: true,
      subtitle: currentStatus === 6 ? selectedDetails?.SUB_STATUS_DESC : "",
    },

    // Only add "Cancelled" if selectedDetails?.CANCELLED_AT exists
  ];
  useEffect(() => {
    (async function () {
      let WoSearchID: any = search?.split(":/")[1];
      let WO_ID =
        search === "?edit=" ? localStorage.getItem("WO_ID") : WoSearchID;
      await getServiceRequestMasterList(WO_ID);
      await getDocmentList(WO_ID);
    })();
  }, []);
  const techwatcxhh = watch("TECH_ID");

  useEffect(() => {
    masterList?.PRIORITYLIST?.filter((e: any) => {
      if (e?.SEVERITY_ID === selectedDetails?.SEVERITY_CODE) {
        setValue("SEVERITY_CODE", e);
      }
    });
    const PriorityIconName = priorityIconList?.filter(
      (e: any) => e?.ICON_ID === selectedDetails?.ICON_ID
    )[0]?.ICON_NAME;
    setselectedPriorityIconName(PriorityIconName);
  }, [search === "?edit=" && masterList?.PRIORITYLIST && selectedDetails]);

  const getServiceRequestMasterList = async (WO_ID: any) => {
    const payload: any = { WO_ID: WO_ID };
    setLoading(true);
    try {
      let res: any = await callPostAPI(
        ENDPOINTS.GET_INFRA_MASTER_SERVICE_REQUEST,
        payload,
        "HD001"
      );
      setmasterList(res);

      await getWoDetails(WO_ID);
      if (res && res.FLAG === 1) {
      }
    } catch (error: any) {
    } finally {
    }
  };

  // const handleRemoveExistingDocument = (docSysName: string) => {
  //   setDocumentsToDelete((prev) => [docSysName]);
  // };
  const onCancelEdit = () => {
    setEditdetails(false);
    resetField("DESCRIPTION");

    resetField("SEVERITY_CODE");
    setValue("DOC_LIST", []);
  };

  const onOpenEditDialog = () => {
    setEditdetails(true);
    setValue("DESCRIPTION", selectedDetails?.DESCRIPTION);
    setDescriptionlength(selectedDetails?.DESCRIPTION?.length);
    const selectedSeverity = masterList?.PRIORITYLIST?.filter((item: any) => {
      return item?.SEVERITY_ID === selectedDetails?.SEVERITY_CODE;
    });

    setValue("SEVERITY_CODE", selectedSeverity[0]);
    setValue("DOC_LIST", docOption);
  };
  const watchDoc = watch("DOC_LIST");

  const updateWOStatusInfra = async (payload: any, paragraph: any) => {
    if (payload?.DOC_LIST?.length > 0) {
      const filteredData = payload?.DOC_LIST?.filter(
        (item: any) => item.UPLOAD_TYPE !== "W"
      );
      payload.DOC_LIST = filteredData;
    }
    let WoSearchID: any = search?.split(":/")[1];
    let WO_ID =
      search === "?edit=" ? localStorage.getItem("WO_ID") : WoSearchID;
    payload.WO_ID = WO_ID;
    setLoading(true);
    setSidebarVisible(false);
    try {
      let res: any = await callPostAPI(
        ENDPOINTS.UPDATEWOSTATUSINFRA,
        payload,
        "HD001"
      );

      if (res && res.FLAG === true) {
        setVisible(true);
        setTimeout(() => {
          setVisible(false);
        }, 2000);
        if (payload.ACTION_ID === 114 || payload.ACTION_ID === 115) {
          setSidebarVisible(!sidebarVisible);
        }

        Setparagraph(paragraph);
        await getWoDetails(WO_ID);
        await getDocmentList(WO_ID);
      }

      return res.FLAG;
    } catch (error: any) {
    } finally {
    }
  };

  const getReasonList = async (statuscode: any, substatuscode: any) => {
    try {
      let payload: any = {};
      if (statuscode === 1 && substatuscode === 2) {
        payload = { STATUS_CODE: 5, SUB_STATUS_CODE: 12 };
      }
      if (statuscode === 1 && substatuscode === 1) {
        payload = { STATUS_CODE: 1, SUB_STATUS_CODE: 3 };
      } else if (statuscode === 1 && substatuscode === 3) {
        payload = { STATUS_CODE: 1, SUB_STATUS_CODE: 3 };
      }
      const res = await callPostAPI(ENDPOINTS.GET_CANCEL_REASON_LIST, payload);
      if (res && res?.FLAG) {
        setReasonList(res?.REASONLIST);
      }
    } catch (error) { }
  };

  const getWoDetails = async (WO_ID: any) => {
    const payload: any = { WO_ID: WO_ID };
    setLoading(true);
    try {
      let res: any = await callPostAPI(
        ENDPOINTS.GET_WORKORDER_DETAILS,
        payload,
        "HD001"
      );

      if (res && res.FLAG === 1) {
        setSelectedDetails(res?.WORKORDERDETAILS[0]);
        setCurrentStatus(res?.WORKORDERDETAILS[0]?.CURRENT_STATUS);
        setTimelineList(res?.ACTIVITYTIMELINELIST);
        setWOActiveList(res?.WOACTIVELIST);
        let map_details: any = JSON.parse(res?.MAPBUTTONS[0]?.JsonArray);
        setMapButtons(map_details);
        setValue("DESCRIPTION", res?.WORKORDERDETAILS[0]?.DESCRIPTION);
        setDescriptionData(res?.WORKORDERDETAILS[0]?.DESCRIPTION);
        getAssetDetailsList(res?.WORKORDERDETAILS[0]?.ASSET_ID);
        await getReasonList(
          res?.WORKORDERDETAILS[0]?.CURRENT_STATUS,
          res?.WORKORDERDETAILS[0]?.SUB_STATUS
        );
        setDescriptionlength(res?.WORKORDERDETAILS[0]?.DESCRIPTION?.length);
        setLoading(false);
      }
    } catch (error: any) {
      setLoading(false);
    } finally {
      setLoading(false);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (timelineList) {
      const newItemList = timelineList?.map((item: any) => ({
        ...item,
        CREATEDON: formateDate(item?.CREATEDON),
      }));
      setNewTimelineList(newItemList);
    }
  }, [timelineList, search]);

  const getAssetDetailsList = async (assetid: any) => {
    try {
      const payload = {
        ASSET_ID: assetid ?? 0,
      };
      const res = await callPostAPI(ENDPOINTS.GET_INFRA_ASSET_DETAILS, payload);
      if (res?.FLAG === 1) {
        setAssetTreeDetails(res?.ASSETDETAILSLIST);
      } else {
        toast?.error(res?.MSG);
      }
    } catch (error: any) {
      toast?.error(error.message);
    }
  };

  const actionBodyTemplate = (rowdata: any) => {
    return (
      <>
        <div className="flex flex-col gap-1">
          <span>{rowdata?.ACTION_DESC}</span>
          {rowdata?.REMARKS !== "" || rowdata?.REASON_DESCRIPTION !== null ? (
            <>
              <label
                className="Text_Secondary Helper_Text cursor-pointer"
                onClick={() => openDialogbox(rowdata)}
              >
                View Details
              </label>
              {/* <Button
                label="View Details"
                onClick={() => openDialogbox(rowdata)}
                className="Border_Button Secondary_Button "
                style={{ display: "flex", color: "#8e724a",padding:'0' }}
              /> */}
            </>
          ) : (
            ""
          )}
        </div>
      </>
    );
  };

  const sidebarcustomHeader: any = (
    <div className=" gap-2">
      <p className="Helper_Text Menu_Active">Work Order /</p>
      {selectedRowData?.ACTION_ID === 121 ? (
        <>
          <h6 className="sidebarHeaderText mb-2">Resume Approval Request</h6>
        </>
      ) : selectedRowData?.ACTION_ID === 113 ? (
        <>
          <h6 className="sidebarHeaderText mb-2">PTW Approval Request</h6>
        </>
      ) : (
        <>
          <h6 className="sidebarHeaderText mb-2">
            {" "}
            {selectedRowData?.ACTION_DESC}
          </h6>
        </>
      )}
    </div>
  );
  const openDialogbox = (rowData: any) => {
    setSelectedRowData(rowData);
    setVisibleRight(true);
  };

  const woDocumentUpload: any = [
    {
      key: 1,
      status: "B",
      label: "Upload Before Files",
    },
    {
      key: 2,
      status: "A",
      label: "Upload After Files",
    },
  ];
  const getDocmentList = async (WO_ID: any) => {
    setisloading(true);
    try {
      const res = await callPostAPI(
        ENDPOINTS.GET_DOCLIST,
        {
          WO_ID: WO_ID,
        },
        "HD001"
      );
      if (res?.FLAG === 1) {
        setAssetDocList(res?.ASSETDOCLIST);
        setDocOption(res?.WORKORDERDOCLIST);
        setValue("DOC_LIST", res?.WORKORDERDOCLIST);
        const docData: any = [];
        res?.DIGITAlSIGNLIST?.forEach((element: any) => {
          docData.push(element);
        });

        setImgSrc(docData);
        setSignatureDoc(docData);
      }
    } catch (error: any) {
    } finally {
      setisloading(false);
    }
  };

  const updateWoDetails = async (data: any) => {
    // debugger
    try {
      if (assigneeTechList?.length > 0) {
        localStorage.removeItem("TECHNICIAN_LIST");
      }
      let WoSearchID: any = search?.split(":/")[1];

      let WO_ID =
        search === "?edit=" ? localStorage.getItem("WO_ID") : WoSearchID;
      const payload: any = {
        WO_ID: WO_ID,
        WO_DESCRIPTION: descriptionData.replace(/\n/g, " "),
        // WO_DESCRIPTION: descriptionData,
        PRIORITY_ID: data?.SEVERITY_CODE?.SEVERITY_ID,
        MODE:
          assigneeTechList?.length > 0 && editDetails === false
            ? "ASSIGN"
            : "E",
        PARA: { para1: `Work order`, para2: "updated" },
        DOC_LIST:
          assigneeTechList?.length > 0 && editDetails === false
            ? []
            : data?.DOC_LIST,
        TECH_ID: assigneeTechList,
        WO_NO: selectedDetails?.WO_NO,
        WO_TYPE: selectedDetails?.WO_TYPE,
        ACTION_ID: data.ACTION_ID,
      };
      if (assigneeTechList?.length > 0) {
        localStorage.setItem(
          "TECHNICIAN_LIST",
          JSON.stringify(assigneeTechList)
        );
      }

      setLoading(true);

      let res: any = await callPostAPI(
        ENDPOINTS.UPDATE_WO_INFRA,
        payload,
        "HD001"
      );

      if (res && res?.FLAG) {
        setvisibleSucces(true);
        setTimeout(() => {
          setvisibleSucces(false);
        }, 2000);
        // }

        setEditdetails(false);
        // toast?.success(res?.MSG);
        await getWoDetails(WO_ID);
        await getDocmentList(WO_ID);
      }
    } catch (error: any) {
    } finally {
    }
  };

  const getAssignList = async () => {
    if (selectedDetails && selectedDetails?.ASSIGN_TEAM_ID) {
      var payload: any = {
        TEAM_ID: selectedDetails?.ASSIGN_TEAM_ID,
        WO_ID: selectedDetails?.WO_ID,
      };
    }
    try {
      const res: any = await callPostAPI(
        ENDPOINTS.GET_TEAM_USERLIST_INFRA,
        payload
      );
      let ptw: any = {
        label: "PTW Holder",
        code: "P",
      };
      let assignee1: any = {
        label: "Assignee",
        code: "A",
      };
      if (res && res?.FLAG) {
        const updatedUsers: any = res?.TEAMUSERLIST?.map((user: any) => ({
          ...user,
          sub_roles: user?.ASSING_ROLE === "P" ? ptw : assignee1,
          ASSING_ROLE: user?.ASSING_ROLE,
        }));
        setTechList(updatedUsers);

        const selectedTech: any = updatedUsers?.filter(
          (tech: any) => tech?.SELECT === 1
        );
        setSelectedTechList(updatedUsers);
        setTechnicianList(selectedTech);
        localStorage.setItem("TECHNICIAN_LIST", JSON.stringify(selectedTech));
      }
    } catch (error) { }
  };

  useEffect(() => {
    if (selectedDetails) {
      getAssignList();
    }
  }, [selectedDetails]);

  const ClosePopUp = () => {
    setVisible(!visible);
  };
  const CloseReportPopUp = () => {
    setVisibleSuccesReport(false);
  };
  const handlerReport = () => {
    localStorage.setItem(
      "workDetailsReport",
      JSON.stringify([selectedDetails])
    );
    // navigate(PATH.PDF_REPORT);
    setVisibleSuccesReport(true);
  };

  const handleInputChange = (event: any) => {
    const value = event?.target?.value;
    setDescriptionData(value);
    setDescriptionlength(value?.length);
  };

  const customizedMarker = (item: TimelineEvent) => {
    return (
      <span
        className="flex w-2rem h-2rem align-items-center justify-content-center  border-circle z-1 shadow-1"
        style={{ color: item?.date ? "#55A629" : "#7E8083" }}
      >
        <i
          className={`pi ${item?.status ? "pi-circle-fill" : "pi-circle"} `}
        ></i>
      </span>
    );
  };

  const customizedStatusTimeline = (item: any) => {
    return (
      <div className="">
        <h6
          className={`font-medium Sub_Service_Header_Text mb-1 ${item?.date
            ? "Text_Primary "
            : item?.status
              ? "Text_Primary "
              : "Text_Secondary"
            } `}
        >
          {item?.title}
        </h6>
        <p className="Sub_Service_Header_Text">{item?.subtitle}</p>
        <p className="Text_Secondary service_helper_text">{item?.date}</p>
      </div>
    );
  };
  const DetailsHeaderTemplate = (options: TabPanelHeaderTemplateOptions) => {
    return (
      <div
        className="flex justify-center gap-2"
        style={{ cursor: "pointer" }}
        onClick={options.onClick}
      >
        <span className="white-space-nowrap">
          Details{" "}
          {[105, 113, 114, 115, 118, 120, 121, 141, 142]?.some((num) =>
            MapButtons?.includes(num)
          ) && (
              <span
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  backgroundColor: "red",
                  display: "inline-flex", // Use flexbox to center the text
                  justifyContent: "center", // Center horizontally
                  alignItems: "center", // Center vertically
                  marginLeft: "8px", // Space between text and the dot
                  color: "white", // Set text color to white for contrast
                  fontSize: "12px", // Adjust font size for the number
                  fontWeight: "bold", // Make the number bold
                }}
              >
                1
              </span>
            )}
        </span>
        <Tooltip target=".custom-target-icon" />
        {/* {
          
          (selectedDetails?.ISAPPROVALCNC === false &&
            selectedDetails?.ISAPPROVED === false &&
            selectedDetails?.CURRENT_STATUS === 5) &&
            (selectedDetails?.SUB_STATUS === "1" ||
              selectedDetails?.SUB_STATUS === "2" ||
              selectedDetails?.SUB_STATUS === "3" ||
              selectedDetails?.SUB_STATUS === "4" ||
              selectedDetails?.SUB_STATUS === "5") ? (
            <Badge
              value="i"
              className="custom-target-icon"
              data-pr-position="top"
              data-pr-tooltip="Redirect Approval"
            />
          ) : (
            <></>
          )} */}
      </div>
    );
  };

  // {selectedDetails?.CURRENT_STATUS === 4 && (
  const MaterialHeaderTemplate = (options: TabPanelHeaderTemplateOptions) => {
    return (
      <div
        className="flex justify-center gap-2"
        style={{ cursor: "pointer" }}
        onClick={options.onClick}
      >
        <span className="white-space-nowrap">
          Resolution
          {[131, 132]?.some((num) =>
            [selectedDetails.PREVIOUS_ACTION]?.includes(num)
          ) &&
            [132]?.some((num) => MapButtons?.includes(num)) && (
              <span
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  backgroundColor: "red",
                  display: "inline-flex", // Use flexbox to center the text
                  justifyContent: "center", // Center horizontally
                  alignItems: "center", // Center vertically
                  marginLeft: "8px", // Space between text and the dot
                  color: "white", // Set text color to white for contrast
                  fontSize: "12px", // Adjust font size for the number
                  fontWeight: "bold", // Make the number bold
                }}
              >
                1
              </span>
            )}
        </span>
        <Tooltip target=".custom-target-icon1" />
        {
          // FACILITY["MATREQ_APPROVAL"] === true
          selectedDetails?.ISMATAPPROVALCNC === false &&
            selectedDetails?.ISMATAPPROVED === false &&
            selectedDetails?.CURRENT_STATUS === 5 &&
            selectedDetails?.SUB_STATUS === "6" ? (
            <Badge
              value="i"
              className="custom-target-icon1"
              data-pr-position="top"
              data-pr-tooltip="Material Request Approval"
            />
          ) : (
            <></>
          )
        }
      </div>
    );
  };
  // )}
  const getLocDesc = (e: any) => { };

  function getShortenedFileName(fileName: any) {
    // Get the base name (without extension) and the extension
    let baseName = fileName.split(".")[0]; // Get the name part without the extension
    let extension = fileName.split(".")[1]; // Get the file extension
    // Get the first 6 characters of the base name
    let firstSixChars = baseName.slice(0, 6);
    // Combine the first 6 characters with the extension using '...'
    let newFileName = `${firstSixChars}${extension !== undefined ? "..." + extension : ""
      }`;
    return newFileName;
  }

  const calFileSize = (base64: string) =>
    `${((4 * Math.ceil(base64.length / 3) * 0.5624896334383812) / 1000)
      .toFixed(1)
      .toString()} kb`;

  const setHandelImage = (item: any, docname?: any, docTitle?: any) => {
    setShowImage(item);
    setVisibleImage(true);
    setdocName(docname);
    setDocTitle(docTitle);
  };

  const ActivityHeaderTemplate = (options: TabPanelHeaderTemplateOptions) => {
    return (
      <div
        className="flex justify-center gap-2"
        style={{ cursor: "pointer" }}
        onClick={options.onClick}
      >
        <span className="white-space-nowrap">Activity Timeline</span>
      </div>
    );
  };

  const customizedContent = (item: any) => {
    return (
      <div className="flex justify-between mb-3 gap-3">
        <div className="mb-2 width-500">
          <p className=" Text_Primary flex Alert_Title mb-2">
            {item.title}
            <p className="Menu_Active Alert_Title  ml-2 ">
              {item?.DOC_NO ?? ""}
            </p>
          </p>
          <p className="  Text_Secondary Helper_Text ">{item.subtitle}</p>
          {item.ISREMARKS === 1 ? (
            <p className="  Text_Secondary Helper_Text ">
              <b>Remarks:</b> {item.TIMELINE_REMARKS}
            </p>
          ) : (
            <></>
          )}
        </div>
        <p className="Text_Secondary Helper_Text mt-4">
          {formateDate(item.CREATEDON)}
        </p>
      </div>
    );
  };

  const handlerShowDetails = () => {
    const payload = {
      ASSET_ID: selectedDetails?.ASSET_ID,
      WO_ID: selectedDetails?.WO_ID,
    };

    if (selectedDetails?.ASSET_NONASSET === "A") {
      navigate(`${appName}/assetmasterlist?edit=`, { state: payload });
    } else {
      navigate(`${appName}/servicemasterlist?edit=`, { state: payload });
    }
  };

  const onSubmit = async (payload: any, e: any) => { };

  const [sidebarVisible, setSidebarVisible] = useState<boolean>(false);
  const CloseSidebarVisible = () => {
    setSidebarVisible(!sidebarVisible);
  };
  const customHeader = (
    <>
      <div className=" gap-2">
        <p className="Helper_Text Menu_Active">Work Order / </p>
        <h6 className="sidebarHeaderText mb-2">PTW Approval Request</h6>
      </div>
    </>
  );

  let actualDate: any = helperNullDate(selectedDetails?.ACTUAL_START_DATE);

  const GetOpenList = () => {
    //  props?.isClick()
    navigate(`${appName}/workorderlist`, { state: "workorder" });
  };

  useEffect(() => {
    if (
      (!isSubmitting && Object?.values(errors)[0]?.type === "required") ||
      (!isSubmitting && Object?.values(errors)[0]?.type === "validate")
    ) {
      const check: any = Object?.values(errors)[0]?.message;
      toast?.error(t(check));
    }
  }, [isSubmitting]);
  console.log(IsSubmit, "IsSubmit");
  return (
    <>
      {loader ? (
        <>
          <LoaderS />
        </>
      ) : (
        <section className="w-full">
          <form onSubmit={handleSubmit(onSubmit)}>
            <>
              <Card className="stickyHeader">
                <div className="flex justify-between">
                  <div className="w-3/5">
                    <p className="Helper_Text Menu_Active mb-1">
                      Work Order /{" "}
                    </p>
                    <h6 className="Text_Primary Main_Header_Text mb-1">
                      {/* {selectedDetails?.ASSETGROUP_NAME ?? ""} -{" "} */}
                      {selectedDetails?.ISSUE_DESCRIPTION ?? ""}
                    </h6>
                    <p className="Sub_Header_Text ">
                      {selectedDetails?.WO_NO ?? ""}
                    </p>
                  </div>
                  <div className="flex justify-between">
                    <div className="w-full">
                      {MapButtons.includes(102) && (
                        <CancelWoDialog
                          header={"Cancel Work Order"}
                          control={control}
                          setValue={setValue}
                          register={register}
                          resetField={resetField}
                          paragraph={""}
                          watch={watch}
                          errors={errors}
                          cancelReasonList={reasonList}
                          updateWOStatusInfra={updateWOStatusInfra}
                        />
                      )}

                      {MapButtons.includes(101) && (
                        <AssignWoDialog
                          header={"Assign"}
                          cssClass={"Primary_Button mr-2"}
                          control={control}
                          setData={setValue}
                          register={register}
                          paragraph={""}
                          watch={watch}
                          errors={errors}
                          TECH_ID={"TECH_ID"}
                          AssigneeList={techList}
                          setTechList={setTechList}
                          setAssigneeTechList={setAssigneeTechList}
                          assigneeTechList={assigneeTechList}
                          setSelectedTechList={setSelectedTechList}
                          updateWoDetails={handleSubmit(updateWoDetails)}
                          selectedTechList={selectedTechList}
                          TEAM_NAME={selectedDetails?.TEAM_NAME}
                          setaddAssigneeAction={setaddAssigneeAction}
                          technicianList={technicianList}
                        />
                      )}
                      {[
                        108, 109, 110, 111, 104, 116, 117, 135, 136, 137, 138,
                      ]?.some((num) => MapButtons?.includes(num)) && (
                          <RedirectWoDialog
                            header={"Redirect"}
                            control={control}
                            setValue={setValue}
                            register={register}
                            paragraph={""}
                            watch={watch}
                            errors={errors}
                            updateWOStatusInfra={updateWOStatusInfra}
                            MapButtons={MapButtons}
                            reasonList={reasonList}
                          />
                        )}

                      {/* new code writeen by priyanka */}
                      {[112]?.some((num) => MapButtons?.includes(num)) && (
                        <ProceedPTWDialog
                          header={"Submit for PTW Approval"}
                          control={control}
                          setValue={setValue}
                          register={register}
                          cssStyle="Primary_Button mr-2"
                          headerText={"Confirm Submission for PTW Approval"}
                          paragraph={
                            "Are you sure you want to submit this Permit to Work for approval?"
                          }
                          sccusspara={
                            "Your request for PTW approval has been successfully submitted."
                          }
                          watch={watch}
                          errors={errors}
                          updateWOStatusInfra={updateWOStatusInfra}
                        />
                      )}

                      {[122]?.some((num) => MapButtons?.includes(num)) && (
                        <AddResolutionDialog
                          header={"Complete"}
                          control={control}
                          setValue={setValue}
                          register={register}
                          paragraph={""}
                          watch={watch}
                          errors={errors}
                          updateWOStatusInfra={updateWOStatusInfra}
                          selectedDetails={selectedDetails}
                          DOC_LIST_DATA={docOption}
                        />
                      )}
                      {[119]?.some((num) => MapButtons?.includes(num)) && (
                        <RequestResumeDialog
                          header={"Request for Resume"}
                          control={control}
                          setValue={setValue}
                          register={register}
                          paragraph={
                            "Are you sure you want to resume this work order?"
                          }
                          watch={watch}
                          errors={errors}
                          updateWOStatusInfra={updateWOStatusInfra}
                        />
                      )}
                      {[130]?.some((num) => MapButtons?.includes(num)) && (
                        <AddResolutionDialog
                          header={"Submit for Closure"}
                          control={control}
                          setValue={setValue}
                          register={register}
                          paragraph={""}
                          watch={watch}
                          errors={errors}
                          updateWOStatusInfra={updateWOStatusInfra}
                          selectedDetails={selectedDetails}
                          DOC_LIST_DATA={docOption}
                        />
                      )}
                      {/* pemding code for normalization form */}

                      {[125, 126]?.some((num) => MapButtons?.includes(num)) && (
                        <SplitButton
                          label={t("More Action")}
                          className="Secondary_SplitButton mr-2"
                          model={Actionitems}
                        />
                      )}
                      {visibleTestingOhHold === true
                        ? [125]?.some((num) => MapButtons?.includes(num)) && (
                          <>
                            <DeclinePTWDialog
                              header={"Testing On Hold"}
                              control={control}
                              setValue={setValue}
                              register={register}
                              paragraph={""}
                              watch={watch}
                              errors={errors}
                              Action_Code={MapButtons}
                              updateWOStatusInfra={updateWOStatusInfra}
                              setTestingOnHold={setTestingOnHold}
                            />
                          </>
                        )
                        : ""}

                      {[128, 140, 142]?.some((num) =>
                        MapButtons?.includes(num)
                      ) && (
                          <DeclinePTWDialog
                            header={"Fail"}
                            control={control}
                            setValue={setValue}
                            register={register}
                            paragraph={
                              "The work order testing has been marked as failed."
                            }
                            watch={watch}
                            Action_Code={MapButtons}
                            errors={errors}
                            updateWOStatusInfra={updateWOStatusInfra}
                            setTestingOnHold={setTestingOnHold}
                          />
                        )}
                      {[127, 139, 141]?.some((num) =>
                        MapButtons?.includes(num)
                      ) && (
                          <PTWApprovalDialog
                            header={"Pass"}
                            control={control}
                            setValue={setValue}
                            register={register}
                            cssStyle="Primary_Button mr-2"
                            headerText={"Confirm Test Pass"}
                            paragraph={
                              "Are you sure you want to mark this work order as passed?"
                            }
                            sccusspara={
                              "Your approval has been updated successfully."
                            }
                            watch={watch}
                            errors={errors}
                            Action_Code={MapButtons}
                            updateWOStatusInfra={updateWOStatusInfra}
                          />
                        )}
                      {[123, 124]?.some((num) => MapButtons?.includes(num)) && (
                        <NormalizeToTest
                          header={"Normalize To Test"}
                          control={control}
                          setValue={setValue}
                          paragraph={""}
                          watch={watch}
                          errors={errors}
                          updateWOStatusInfra={updateWOStatusInfra}
                          Active_code={MapButtons}
                        />
                      )}
                      {/*  */}
                      {[131]?.some((num) => MapButtons?.includes(num)) && (
                        <DeclinePTWDialog
                          header={"Return For Edit"}
                          control={control}
                          setValue={setValue}
                          register={register}
                          paragraph={
                            "Your request has been updated successfully."
                          }
                          watch={watch}
                          errors={errors}
                          updateWOStatusInfra={updateWOStatusInfra}
                          setTestingOnHold={setTestingOnHold}
                        />
                      )}
                      {[133]?.some((num) => MapButtons?.includes(num)) && (
                        <PTWApprovalDialog
                          header={"Proceed"}
                          control={control}
                          setValue={setValue}
                          register={register}
                          cssStyle="Primary_Button mr-2"
                          headerText={"Confirm Closure"}
                          paragraph={
                            "Are you sure you want to submit this resolution and close the work order?"
                          }
                          sccusspara={
                            "Your request for closure has been successfully submitted."
                          }
                          watch={watch}
                          errors={errors}
                          Action_Code={MapButtons}
                          updateWOStatusInfra={updateWOStatusInfra}
                        />
                      )}
                      {[134]?.some((num) => MapButtons?.includes(num)) && (
                        <PTWApprovalDialog
                          header={"Close"}
                          control={control}
                          setValue={setValue}
                          register={register}
                          cssStyle="Primary_Button mr-2"
                          headerText={"Confirm Closure"}
                          paragraph={
                            "Are you sure you want to close this work order?"
                          }
                          sccusspara={
                            "This work order has been successfully closed."
                          }
                          watch={watch}
                          Action_Code={MapButtons}
                          errors={errors}
                          updateWOStatusInfra={updateWOStatusInfra}
                        />
                      )}
                      {/* <Buttons
                                          label={"List"}
                                          className=" Secondary_Button  me-2"
                                          type="button"
                                          name="LIST"
                                          onClick={GetOpenList}
                                        /> */}
                      {/* {selectedDetails?.CURRENT_STATUS === 6 && ( */}

                      {/* <Buttons
                                        type="button"
                                        className="Secondary_Button me-2"
                                        label={"List"}
                                        onClick={()=>{
                                         navigate(`${appName}/workorderlist`,{ state: "workorder" });
                                        }}
                                      /> */}
                      <Buttons
                        className="Report_Button me-2"
                        label={""}
                        // onClick={props?.isClick}
                        icon="pi pi-download"
                        onClick={() => {
                          handlerReport();
                        }}
                      />
                      {/* )} */}
                    </div>
                    <div></div>
                  </div>
                </div>
              </Card>
              {/* <div className="h-32"></div> */}
              <Card className="mt-2">
                {loader ? (
                  <LoaderS />
                ) : (
                  <Timeline
                    value={StatusEvents}
                    layout="horizontal"
                    align="top"
                    marker={customizedMarker}
                    content={customizedStatusTimeline}
                  />
                )}
              </Card>
              <div className=" grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-3 lg:grid-cols-3">
                <div className="col-span-2 mt-2 woTabview">
                  <div className="woDetailTabview">
                    <TabView
                      activeIndex={activeIndex}
                      onTabChange={(e) => setActiveIndex(e.index)}
                    >
                      <TabPanel headerTemplate={DetailsHeaderTemplate}>
                        <Card className="mt-2">
                          {/* after reassign screen display below and edit button will hide*/}
                          {selectedDetails?.PREVIOUS_ACTION === 121 && (
                            <div className="reviewContainer">
                              <div className="flex flex-wrap gap-3 justify-between">
                                <div className="flex flex-wrap gap-3">
                                  <img
                                    src={reviewIcon}
                                    alt=""
                                    className="w-auto h-10"
                                  />
                                  <div className="flex flex-wrap">
                                    <div className="ml-3">
                                      {selectedDetails?.PREVIOUS_ACTION ===
                                        121 && (
                                          <label className="Text_Primary mb-2 Avatar_Initials">
                                            Resume Approval Request
                                          </label>
                                        )}

                                      {selectedDetails?.PREVIOUS_ACTION ===
                                        121 && (
                                          <p
                                            className="Text_Primary Input_Text"
                                            // data-pr-tooltip={remark}
                                            data-pr-position="bottom"
                                          >
                                            The resume approval request has been
                                            declined.
                                          </p>
                                        )}
                                    </div>
                                  </div>
                                </div>
                                {selectedDetails?.PREVIOUS_ACTION === 121 && (
                                  <InfraSidebarVisibal
                                    header={"Redirect"}
                                    control={control}
                                    setValue={setValue}
                                    watch={watch}
                                    Actioncode={MapButtons}
                                    btnText={"Review now"}
                                    updateWOStatusInfra={updateWOStatusInfra}
                                    MapButtons={MapButtons}
                                    // reassignVisible={reassignVisible}
                                    // headerTemplate={selectedDetails?.STATUS_DESC}
                                    // LAST_REMARKS={selectedDetails?.LAST_REMARKS}
                                    // PREVIOUS_ACTION={selectedDetails?.PREVIOUS_ACTION}
                                    selectedDetails={selectedDetails}
                                    subStatus={selectedDetails?.SUB_STATUS_DESC}
                                    setaddAssigneeAction={setaddAssigneeAction}
                                    // approvalStatus={approvalStatus}
                                    setTestingOnHold={setTestingOnHold}
                                  />
                                )}
                              </div>
                            </div>
                          )}
                          {(selectedDetails?.PREVIOUS_ACTION === 140 ||
                            selectedDetails?.PREVIOUS_ACTION === 128 ||
                            selectedDetails?.PREVIOUS_ACTION === 142) && (
                              <div className="reviewContainer">
                                <div className="flex flex-wrap gap-3 justify-between">
                                  <div className="flex flex-wrap gap-3">
                                    <img
                                      src={reviewIcon}
                                      alt=""
                                      className="w-auto h-10"
                                    />
                                    <div className="flex flex-wrap">
                                      <div className="ml-3">
                                        {(selectedDetails?.PREVIOUS_ACTION ===
                                          140 ||
                                          selectedDetails?.PREVIOUS_ACTION ===
                                          128 ||
                                          selectedDetails?.PREVIOUS_ACTION ===
                                          142) && (
                                            <label className="Text_Primary mb-2 Avatar_Initials">
                                              Testing Failed
                                            </label>
                                          )}

                                        {(selectedDetails?.PREVIOUS_ACTION ===
                                          140 ||
                                          selectedDetails?.PREVIOUS_ACTION ===
                                          128 ||
                                          selectedDetails?.PREVIOUS_ACTION ===
                                          142) && (
                                            <p
                                              className="Text_Primary Input_Text"
                                              // data-pr-tooltip={remark}
                                              data-pr-position="bottom"
                                            >
                                              The work order failed to meet the
                                              testing criteria.
                                            </p>
                                          )}
                                      </div>
                                    </div>
                                  </div>
                                  {(selectedDetails?.PREVIOUS_ACTION === 140 ||
                                    selectedDetails?.PREVIOUS_ACTION === 128 ||
                                    selectedDetails?.PREVIOUS_ACTION === 142) && (
                                      <InfraSidebarVisibal
                                        header={"Work Order"}
                                        control={control}
                                        setValue={setValue}
                                        watch={watch}
                                        Actioncode={MapButtons}
                                        btnText={"View Details"}
                                        updateWOStatusInfra={updateWOStatusInfra}
                                        MapButtons={MapButtons}
                                        // reassignVisible={reassignVisible}
                                        // headerTemplate={selectedDetails?.STATUS_DESC}
                                        // LAST_REMARKS={selectedDetails?.LAST_REMARKS}
                                        // PREVIOUS_ACTION={selectedDetails?.PREVIOUS_ACTION}
                                        selectedDetails={selectedDetails}
                                        subStatus={selectedDetails?.SUB_STATUS_DESC}
                                        setaddAssigneeAction={setaddAssigneeAction}
                                        // approvalStatus={approvalStatus}
                                        setTestingOnHold={setTestingOnHold}
                                      />
                                    )}
                                </div>
                              </div>
                            )}

                          {selectedDetails?.PREVIOUS_ACTION === 113 && (
                            <div className="reviewContainer">
                              <div className="flex flex-wrap gap-3 justify-between">
                                <div className="flex flex-wrap gap-3">
                                  <img
                                    src={reviewIcon}
                                    alt=""
                                    className="w-auto h-10"
                                  />
                                  <div className="flex flex-wrap">
                                    <div className="ml-3">
                                      {selectedDetails?.PREVIOUS_ACTION ===
                                        113 && (
                                          <label className="Text_Primary mb-2 Avatar_Initials">
                                            PTW Approval Request Declined
                                          </label>
                                        )}

                                      {selectedDetails?.PREVIOUS_ACTION ===
                                        113 && (
                                          <p
                                            className="Text_Primary Input_Text"
                                            // data-pr-tooltip={remark}
                                            data-pr-position="bottom"
                                          >
                                            Review the comments and resubmit if
                                            needed.
                                          </p>
                                        )}
                                    </div>
                                  </div>
                                </div>
                                {selectedDetails?.PREVIOUS_ACTION === 113 && (
                                  <InfraSidebarVisibal
                                    header={"Work Order"}
                                    control={control}
                                    setValue={setValue}
                                    watch={watch}
                                    Actioncode={MapButtons}
                                    btnText={"Review Now"}
                                    updateWOStatusInfra={updateWOStatusInfra}
                                    MapButtons={MapButtons}
                                    // reassignVisible={reassignVisible}
                                    // headerTemplate={selectedDetails?.STATUS_DESC}
                                    // LAST_REMARKS={selectedDetails?.LAST_REMARKS}
                                    // PREVIOUS_ACTION={selectedDetails?.PREVIOUS_ACTION}
                                    selectedDetails={selectedDetails}
                                    subStatus={selectedDetails?.SUB_STATUS_DESC}
                                    setaddAssigneeAction={setaddAssigneeAction}
                                    // approvalStatus={approvalStatus}
                                    setTestingOnHold={setTestingOnHold}
                                  />
                                )}
                              </div>
                            </div>
                          )}

                          {selectedDetails?.PREVIOUS_ACTION === 120 && (
                            <div className="reviewContainer">
                              <div className="flex flex-wrap gap-3 justify-between">
                                <div className="flex flex-wrap gap-3">
                                  <img
                                    src={reviewIcon}
                                    alt=""
                                    className="w-auto h-10"
                                  />
                                  <div className="flex flex-wrap">
                                    <div className="ml-3">
                                      {selectedDetails?.PREVIOUS_ACTION ===
                                        120 && (
                                          <label className="Text_Primary mb-2 Avatar_Initials">
                                            Resume Approval Request
                                          </label>
                                        )}

                                      {selectedDetails?.PREVIOUS_ACTION ===
                                        120 && (
                                          <p
                                            className="Text_Primary Input_Text"
                                            // data-pr-tooltip={remark}
                                            data-pr-position="bottom"
                                          >
                                            Review the comments and resubmit if
                                            needed.
                                          </p>
                                        )}
                                    </div>
                                  </div>
                                </div>
                                {selectedDetails?.PREVIOUS_ACTION === 120 && (
                                  <InfraSidebarVisibal
                                    header={"Work Order"}
                                    control={control}
                                    setValue={setValue}
                                    watch={watch}
                                    Actioncode={MapButtons}
                                    btnText={"View Details"}
                                    updateWOStatusInfra={updateWOStatusInfra}
                                    MapButtons={MapButtons}
                                    // reassignVisible={reassignVisible}
                                    // headerTemplate={selectedDetails?.STATUS_DESC}
                                    // LAST_REMARKS={selectedDetails?.LAST_REMARKS}
                                    // PREVIOUS_ACTION={selectedDetails?.PREVIOUS_ACTION}
                                    selectedDetails={selectedDetails}
                                    subStatus={selectedDetails?.SUB_STATUS_DESC}
                                    setaddAssigneeAction={setaddAssigneeAction}
                                    // approvalStatus={approvalStatus}
                                    setTestingOnHold={setTestingOnHold}
                                  />
                                )}
                              </div>
                            </div>
                          )}

                          {selectedDetails?.PREVIOUS_ACTION === 125 && (
                            <div className="reviewContainer">
                              <div className="flex flex-wrap gap-3 justify-between">
                                <div className="flex flex-wrap gap-3">
                                  <img
                                    src={reviewIcon}
                                    alt=""
                                    className="w-auto h-10"
                                  />
                                  <div className="flex flex-wrap">
                                    <div className="ml-3">
                                      {selectedDetails?.PREVIOUS_ACTION ===
                                        125 && (
                                          <label className="Text_Primary mb-2 Avatar_Initials">
                                            Testing On Hold
                                          </label>
                                        )}

                                      {selectedDetails?.PREVIOUS_ACTION ===
                                        125 && (
                                          <p
                                            className="Text_Primary Input_Text"
                                            // data-pr-tooltip={remark}
                                            data-pr-position="bottom"
                                          >
                                            The testing process has been
                                            temporarily paused.
                                          </p>
                                        )}
                                    </div>
                                  </div>
                                </div>
                                {selectedDetails?.PREVIOUS_ACTION === 125 && (
                                  <InfraSidebarVisibal
                                    header={"Work Order"}
                                    control={control}
                                    setValue={setValue}
                                    watch={watch}
                                    Actioncode={MapButtons}
                                    btnText={"View Details"}
                                    updateWOStatusInfra={updateWOStatusInfra}
                                    MapButtons={MapButtons}
                                    // reassignVisible={reassignVisible}
                                    // headerTemplate={selectedDetails?.STATUS_DESC}
                                    // LAST_REMARKS={selectedDetails?.LAST_REMARKS}
                                    // PREVIOUS_ACTION={selectedDetails?.PREVIOUS_ACTION}
                                    selectedDetails={selectedDetails}
                                    subStatus={selectedDetails?.SUB_STATUS_DESC}
                                    setaddAssigneeAction={setaddAssigneeAction}
                                    // approvalStatus={approvalStatus}
                                    setTestingOnHold={setTestingOnHold}
                                  />
                                )}
                              </div>
                            </div>
                          )}
                          {[105, 114, 113, 115, 118, 120, 121, 141, 142]?.some(
                            (num) => MapButtons?.includes(num)
                          ) && (
                              <div className="reviewContainer">
                                <div className="flex flex-wrap gap-3 justify-between">
                                  <div className="flex gap-3 flex-wrap">
                                    <img
                                      src={reviewIcon}
                                      alt=""
                                      className="w-auto h-10"
                                    />
                                    <div className="flex flex-wrap">
                                      <div className="ml-3">
                                        {[113, 114, 115]?.some((num) =>
                                          MapButtons?.includes(num)
                                        ) && (
                                            <label className="Text_Primary mb-2 Avatar_Initials">
                                              PTW Approval Request
                                            </label>
                                          )}

                                        {[105]?.some((num) =>
                                          MapButtons?.includes(num)
                                        ) && (
                                            <label className="Text_Primary mb-2 Avatar_Initials">
                                              Reassignment Request
                                            </label>
                                          )}
                                        {[141, 142]?.some((num) =>
                                          MapButtons?.includes(num)
                                        ) && (
                                            <label className="Text_Primary mb-2 Avatar_Initials">
                                              Testing Suspended
                                            </label>
                                          )}
                                        {[118]?.some((num) =>
                                          MapButtons?.includes(num)
                                        ) && (
                                            <label className="Text_Primary mb-2 Avatar_Initials">
                                              Suspension Approval Request
                                            </label>
                                          )}
                                        {[120, 121]?.some((num) =>
                                          MapButtons?.includes(num)
                                        ) && (
                                            <label className="Text_Primary mb-2 Avatar_Initials">
                                              Resume Approval Request
                                            </label>
                                          )}

                                        {[113, 114, 115].some((num) =>
                                          MapButtons.includes(num)
                                        ) && (
                                            <p
                                              className="Text_Primary Input_Text"
                                              // data-pr-tooltip={remark}
                                              data-pr-position="bottom"
                                            >
                                              A new PTW approval request is awaiting
                                              for approval.
                                            </p>
                                          )}

                                        {[105].some((num) =>
                                          MapButtons.includes(num)
                                        ) && (
                                            <p
                                              className="Text_Primary Input_Text"
                                              // data-pr-tooltip={remark}
                                              data-pr-position="bottom"
                                            >
                                              A new reassignment request is pending.
                                            </p>
                                          )}
                                        {[141, 142].some((num) =>
                                          MapButtons.includes(num)
                                        ) && (
                                            <p
                                              className="Text_Primary Input_Text"
                                              // data-pr-tooltip={remark}
                                              data-pr-position="bottom"
                                            >
                                              Some related work orders are still
                                              active
                                            </p>
                                          )}
                                        {[118].some((num) =>
                                          MapButtons.includes(num)
                                        ) && (
                                            <p
                                              className="Text_Primary Input_Text"
                                              // data-pr-tooltip={remark}
                                              data-pr-position="bottom"
                                            >
                                              A new suspension approval request is
                                              awaiting for your approval.
                                            </p>
                                          )}
                                        {[120, 121].some((num) =>
                                          MapButtons.includes(num)
                                        ) && (
                                            <p
                                              className="Text_Primary Input_Text"
                                              // data-pr-tooltip={remark}
                                              data-pr-position="bottom"
                                            >
                                              A new resume approval request is
                                              awaiting for your approval.
                                            </p>
                                          )}
                                        {selectedDetails?.SUB_STATUS === "4" ||
                                          selectedDetails?.SUB_STATUS === "1" ? (
                                          <>
                                            <p className="Text_Primary Input_Text  ">
                                              {selectedDetails?.REASON_DESC}
                                            </p>
                                          </>
                                        ) : (
                                          <></>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <InfraSidebarVisibal
                                    header={"Redirect"}
                                    control={control}
                                    setValue={setValue}
                                    watch={watch}
                                    Actioncode={MapButtons}
                                    btnText={
                                      [141, 142].some((num) =>
                                        MapButtons.includes(num)
                                      )
                                        ? "View Work Orders"
                                        : "Review Now"
                                    }
                                    updateWOStatusInfra={updateWOStatusInfra}
                                    MapButtons={MapButtons}
                                    // reassignVisible={reassignVisible}
                                    // headerTemplate={selectedDetails?.STATUS_DESC}
                                    selectedDetails={selectedDetails}
                                    subStatus={selectedDetails?.SUB_STATUS_DESC}
                                    // approvalStatus={approvalStatus}
                                    //for edit assigne reuired
                                    AssigneeList={techList}
                                    setTechList={setTechList}
                                    setAssigneeTechList={setAssigneeTechList}
                                    assigneeTechList={assigneeTechList}
                                    setSelectedTechList={setSelectedTechList}
                                    updateWoDetails={handleSubmit(
                                      updateWoDetails
                                    )}
                                    selectedTechList={selectedTechList}
                                    TEAM_NAME={selectedDetails?.TEAM_NAME}
                                    setaddAssigneeAction={setaddAssigneeAction}
                                    assigneeActionCode={assigneeActionCode}
                                    WOAcativeList={WOAcativeList}
                                    technicianList={technicianList}
                                    setTestingOnHold={setTestingOnHold}
                                  />
                                </div>
                              </div>
                            )}

                          <div className="flex flex-wrap justify-between mb-3">
                            <h6 className="Header_Text">Work Order Details</h6>
                            {/* PREVIOUS_ACTION */}
                            {currentStatus !== 5 &&
                              selectedDetails?.ISEDIT === 1 &&
                              selectedDetails?.PREVIOUS_ACTION === 0 && (
                                <Buttons
                                  className="Secondary_Button"
                                  label={"Edit"}
                                  icon="pi pi-pencil"
                                  onClick={() => onOpenEditDialog()}
                                />
                              )}
                            <Dialog
                              header="Edit Details"
                              visible={editDetails}
                              style={{ width: "900px" }}
                              className="editWoDialogBox"
                              onHide={() => onCancelEdit()}
                            >
                              <form>
                                <div className="grid grid-cols-1  gap-x-5 gap-y-6 md:grid-cols-3 lg:grid-cols-3 border-b-2 border-gray-200">
                                  <div className="col-span-2 pe-6 border-r-2 border-gray-200">
                                    <div className="mt-4">
                                      <label className="Text_Secondary Input_Label">
                                        Issue
                                      </label>
                                      <p className="Text_Primary Header_Text  ">
                                        {selectedDetails?.ISSUE_DESCRIPTION}
                                      </p>
                                    </div>
                                    <div className="mt-4">
                                      <Field
                                        controller={{
                                          name: "SEVERITY_CODE",
                                          control: control,
                                          render: ({ field }: any) => {
                                            return (
                                              <Select
                                                options={
                                                  masterList?.PRIORITYLIST
                                                }
                                                {...register("SEVERITY_CODE", {
                                                  required:
                                                    "Please fill the required fields",
                                                })}
                                                optionLabel="SEVERITY"
                                                label="Priority"
                                                require={true}
                                                findKey={"SEVERITY_ID"}
                                                filter={true}
                                                selectedData={
                                                  selectedDetails?.SEVERITY_CODE
                                                }
                                                setValue={setValue}
                                                invalid={errors.SEVERITY_CODE}
                                                {...field}
                                              />
                                            );
                                          },
                                        }}
                                      />
                                    </div>
                                    <div className="mt-4">
                                      <label className="Text_Secondary Input_Label">
                                        {t("Description (Max 400 characters)")}
                                        <span className="text-red-600"> *</span>
                                      </label>

                                      <Field
                                        controller={{
                                          name: "DESCRIPTION",
                                          control: control,
                                          render: ({ field }: any) => {
                                            return (
                                              <InputTextarea
                                                {...register("DESCRIPTION", {
                                                  required:
                                                    "please fill the required fields",

                                                  onChange: (e: any) =>
                                                    handleInputChange(e),
                                                })}
                                                rows={5}
                                                maxLength={400}
                                                invalid={errors.DESCRIPTION}
                                                setValue={setValue}
                                                className="resize-none"
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
                                        {t(
                                          `${Descriptionlength}/400 characters.`
                                        )}
                                      </label>
                                    </div>
                                    <div className="mt-4 mb-4">
                                      {/* <label className="Text_Secondary Helper_Text">
                                      Supporting Files
                                    </label> */}
                                      {/* <div>
                                      <a className="flex flex-col  ">
                                        {" "}
                                        <img
                                          src={pdfIcon}
                                          alt=""
                                          className="w-16 h-16 rounded-xl cursor-pointer"
                                        />
                                      </a>
                                      <div className="flex flex-col ">
                                        <div className="Text_Secondary Helper_Text">
                                          xyz.pdf
                                        </div>
                                        <div className="Text_Secondary Helper_Text">
                                          35kb
                                        </div>
                                      </div>
                                    </div> */}
                                      <div className="col-span-2">
                                        <WoDocumentUpload
                                          register={register}
                                          control={control}
                                          setValue={setValue}
                                          watch={watch}
                                          getValues={getValues}
                                          errors={errors}
                                          uploadtype="W"
                                          uploadLabel="Upload Supporting files"
                                          setIsSubmit={setIsSubmit}
                                        // onRemoveExistingDocument={handleRemoveExistingDocument}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                  <div className="mt-2">
                                    <label className="Header_Text Text_Primary">
                                      Equipment Summary
                                    </label>
                                    <div className="grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-3 lg:grid-cols-3 ">
                                      <div className="col-span-3">
                                        <label className="Text_Secondary Helper_Text">
                                          Equipment Name
                                        </label>
                                        <p className="Text_Primary Alert_Title  ">
                                          {selectedDetails?.ASSET_DESCRIPTION}
                                        </p>
                                      </div>
                                      <div className="col-span-3">
                                        <label className="Text_Secondary Helper_Text">
                                          Equipment Type
                                        </label>
                                        <p className="Text_Primary Alert_Title  ">
                                          {selectedDetails?.ASSETTYPE_NAME}
                                        </p>
                                      </div>

                                      <div className="col-span-3">
                                        <label className="Text_Secondary Helper_Text">
                                          Location
                                        </label>
                                        <p className="Text_Primary Alert_Title  ">
                                          {
                                            selectedDetails?.LOCATION_DESCRIPTION
                                          }
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex justify-end mt-4 gap-3 ">
                                  <Button
                                    name="Cancel"
                                    className="Cancel_Button "
                                    type="button"
                                    label={"Cancel"}
                                    onClick={() => onCancelEdit()}
                                  />
                                  {errors?.DESCRIPTION?.type === "required" ? (
                                    <Buttons
                                      disabled={IsSubmit}
                                      type="submit"
                                      className="Primary_Button  w-20 me-2"
                                      label={"Update"}
                                    />
                                  ) : (
                                    <>
                                      {IsSubmit === true ? (
                                        <Buttons
                                          disabled={IsSubmit}
                                          type="submit"
                                          className="Primary_Button  w-20 me-2"
                                          label={"Update"}
                                        />
                                      ) : (
                                        <SuccessDialog
                                          name="Update"
                                          header={"Update"}
                                          SuccessType={"WoUpdate"}
                                          control={control}
                                          setValue={setValue}
                                          register={register}
                                          paragraph={
                                            "This work order has been updated successfully."
                                          }
                                          watch={watch}
                                          errors={errors}
                                          updateWoDetails={handleSubmit(
                                            updateWoDetails
                                          )}
                                          IsSubmit={IsSubmit}
                                        />
                                      )}
                                    </>
                                  )}
                                  {/* <SuccessDialog
                                  header={"Update"}
                                  control={control}
                                  setValue={setValue}
                                  register={register}
                                  paragraph={
                                    "This work order has been cancelled successfully."
                                  }
                                  watch={watch}
                                  errors={errors}
                                  payload={successPayload}
                                  Actioncode={MapButtons}
                                  updateWOStatusInfra={updateWOStatusInfra}
                                  // CloseWOPopUp={CloseWOPopUp}
                                /> */}
                                </div>
                              </form>
                            </Dialog>
                          </div>

                          <div className="mt-2 grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-3 lg:grid-cols-3">
                            <div className=" flex flex-col gap-4">
                              <div>
                                <label className="Text_Secondary Helper_Text  ">
                                  Priority
                                </label>
                                <p className="Text_Primary Alert_Title gap-1 flex items-center">
                                  <i
                                    className={selectedPriorityIconName}
                                    style={{
                                      color: selectedDetails?.PRIORITY_COLOUR,
                                    }}
                                  ></i>
                                  {selectedDetails?.SEVERITY}
                                </p>
                              </div>
                              {/* <div>
                                <div>
                                  <label className="Text_Secondary Helper_Text  ">
                                    Type
                                  </label>

                                  {selectedDetails?.ASSET_NONASSET === "A" ? (
                                    <>
                                      <p className="Text_Primary Alert_Title  ">
                                        Equipment
                                      </p>
                                    </>
                                  ) : (
                                    <>
                                      <p className="Text_Primary Alert_Title  ">
                                        Soft Services
                                      </p>
                                    </>
                                  )}
                                </div>
                              </div> */}
                              <div>
                                <label className="Text_Secondary Helper_Text  ">
                                  Reporter
                                </label>
                                <p className="Text_Primary Alert_Title">
                                  {selectedDetails?.RAISED_BY_NAME}
                                </p>
                              </div>
                              <div>
                                <label className="Text_Secondary Helper_Text  ">
                                  Reported Date
                                </label>
                                <p className="Text_Primary Alert_Title  ">
                                  {selectedDetails?.REPORTED_AT
                                    ? formateDate(selectedDetails?.REPORTED_AT)
                                    : "NA"}
                                </p>
                              </div>

                              {/* <div>
                                <label className="Text_Secondary Helper_Text  ">
                                  Service Request ID
                                </label>
                                <p className="Menu_Active Alert_Title  ">
                                  <a href={`${process.env.REACT_APP_REDIRECT_URL}servicerequestlist?edit=`} target="_blank" onClick={() => {
                                    localStorage.setItem("WO_ID",
                                      JSON.stringify(selectedDetails?.WO_ID)
                                    );
                                  }}>{selectedDetails?.SER_REQ_NO}</a>
                                </p>
                              </div> */}
                            </div>
                            <div className="col-span-2">
                              <div className=" flex flex-col gap-4">
                                <div>
                                  <div>
                                    <label className="Text_Secondary Helper_Text  ">
                                      Location
                                    </label>
                                  </div>

                                  <p className="Text_Primary Alert_Title  ">
                                    {locationStatus === false && (
                                      <>
                                        {selectedDetails?.LOCATION_DESCRIPTION}
                                      </>
                                    )}
                                  </p>
                                </div>
                                <div>
                                  <label className="Text_Secondary Helper_Text  ">
                                    Description
                                  </label>
                                  {selectedDetails?.DESCRIPTION === null ||
                                    selectedDetails?.DESCRIPTION === "" ? (
                                    <>
                                      <p className="Text_Primary Alert_Title  ">
                                        NA
                                      </p>
                                    </>
                                  ) : (
                                    <>
                                      <p className="Text_Primary Alert_Title  ">
                                        {selectedDetails?.DESCRIPTION}
                                      </p>
                                    </>
                                  )}
                                </div>
                                <div>
                                  <label className="Text_Secondary Helper_Text  ">
                                    Supporting Files(
                                    {
                                      docOption?.filter(
                                        (e: any) => e.UPLOAD_TYPE === "W"
                                      ).length
                                    }
                                    )
                                  </label>
                                  {isloading === true ? (
                                    <div className="imageContainer  flex justify-center items-center z-400">
                                      <>
                                        {/* <LoaderFileUpload IsScannig={false} /> */}
                                      </>
                                    </div>
                                  ) : docOption?.filter(
                                    (e: any) => e.UPLOAD_TYPE === "W"
                                  ).length > 0 ? (
                                    <>
                                      <ImageGalleryComponent
                                        uploadType="W"
                                        docOption={docOption}
                                        Title={"Work Order"}
                                      />

                                      {/* <div className="flex flex-wrap gap-4">
                                      {docOption?.map(
                                        (doc: any, index: any) => {
                                          if (doc.UPLOAD_TYPE === "W") {
                                            const getExtension = (str: any) =>
                                              str.slice(str.lastIndexOf("."));
                                            const fileExtension = getExtension(
                                              doc?.DOC_NAME
                                            );
                                            let shortenedFileName: any =
                                              getShortenedFileName(
                                                doc?.DOC_NAME
                                              );
                                            let FileSize = calFileSize(
                                              doc?.DOC_DATA
                                            );
                                            var docData: string;
                                            if (fileExtension === ".pdf") {
                                              docData =
                                                "data:application/pdf;base64," +
                                                doc?.DOC_DATA;
                                              return (
                                                <div key={index}>
                                                  <a
                                                    href={docData}
                                                    download={doc?.DOC_NAME}
                                                    className="text-blue-500"
                                                    title={doc?.DOC_NAME}
                                                  >
                                                    {" "}
                                                    <img
                                                      src={pdfIcon}
                                                      alt=""
                                                      className="w-[120px] h-[120px]  rounded-xl cursor-pointer"
                                                    />
                                                  </a>
                                                  <div className="flex flex-col ">
                                                    <div className="Service_Image_Title">
                                                      {shortenedFileName}
                                                    </div>
                                                    <div className="Text_Secondary Helper_Text">
                                                      {FileSize}
                                                    </div>
                                                  </div>
                                                </div>
                                              );
                                            } else if (
                                              fileExtension === ".doc" ||
                                              fileExtension === ".docx"
                                            ) {
                                              docData =
                                                "data:application/msword;base64," +
                                                doc?.DOC_DATA;

                                              return (
                                                <div key={index}>
                                                  <a
                                                    href={docData}
                                                    download={doc?.DOC_NAME}
                                                    className="text-blue-500"
                                                    title={doc?.DOC_NAME}
                                                  >
                                                    <img
                                                      src={wordDocIcon}
                                                      alt=""
                                                      className="w-[120px] h-[120px]  rounded-xl cursor-pointer"
                                                    />
                                                  </a>
                                                  <div className="flex flex-col ">
                                                    <div className="Service_Image_Title">
                                                      {shortenedFileName}
                                                    </div>
                                                    <div className="Text_Secondary Helper_Text">
                                                      {FileSize}
                                                    </div>
                                                  </div>
                                                </div>
                                              );
                                            } else if (
                                              fileExtension === ".xls" ||
                                              fileExtension === ".xlsx"
                                            ) {
                                              docData =
                                                "data:application/excel;base64," +
                                                doc?.DOC_DATA;
                                              // Word icon
                                              return (
                                                <div key={index}>
                                                  <a
                                                    href={docData}
                                                    download={doc?.DOC_NAME}
                                                    className="text-blue-500 "
                                                    title={doc?.DOC_NAME}
                                                  >
                                                    <img
                                                      src={excelIcon}
                                                      alt=""
                                                      className="w-[120px] h-[120px]  rounded-xl cursor-pointer"
                                                    />
                                                  </a>
                                                  <div className="flex flex-col ">
                                                    <div className="Service_Image_Title">
                                                      {shortenedFileName}
                                                    </div>
                                                    <div className="Text_Secondary Helper_Text">
                                                      {FileSize}
                                                    </div>
                                                  </div>
                                                </div>
                                              );
                                            } else {

                                              docData =
                                                "data:image/png;base64," +
                                                doc?.DOC_DATA;

                                              return (
                                                <div
                                                  key={index}
                                                  onClick={() => {
                                                    setHandelImage(docData,

                                                      doc?.DOC_NAME,
                                                      "Work order"
                                                    );

                                                  }}
                                                >
                                                  <img
                                                    src={docData}
                                                    alt=""
                                                    className="w-[120px] h-[120px]  rounded-xl cursor-pointer"
                                                  />
                                                  <div className="flex flex-col ">
                                                    <div className="Service_Image_Title">
                                                      {shortenedFileName}
                                                    </div>
                                                    <div className="Text_Secondary Helper_Text">
                                                      {FileSize}
                                                    </div>
                                                  </div>
                                                </div>
                                              );
                                            }
                                          }
                                        }
                                      )}
                                    </div>
                                    <Dialog
                                      visible={visibleImage}
                                      style={{
                                        width: "50vw",
                                        height: "60vh",
                                      }}
                                      onHide={() => {
                                        setVisibleImage(false);
                                      }}
                                    >
                                      <a
                                        href={showImage}
                                        download={docName}
                                        className="flex flex-col"
                                        title={`Download ${docName}`}
                                      >
                                        <i
                                          className="pi pi-download"
                                          style={{
                                            fontSize: "24px",
                                            marginBottom: "8px",
                                            display: "flex",
                                            justifyContent: "end",
                                          }}
                                        ></i>
                                      </a>
                                      <img
                                        src={showImage}
                                        alt=""
                                        className="w-full h-full"
                                      />
                                      <h5>{docName}</h5>
                                      <h6>{DocTitle}</h6>
                                    </Dialog> */}
                                    </>
                                  ) : (
                                    <>
                                      <div className="flex items-center mt-2 justify-center w-full">
                                        <label
                                          htmlFor="dropzone-file"
                                          className="flex flex-col items-center justify-center w-full h-24 border-2
                                      border-gray-200 border rounded-lg  "
                                        >
                                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <img
                                              src={noDataIcon}
                                              alt=""
                                              className="w-12"
                                            />
                                            <p className="mb-2 mt-2 text-sm ">
                                              <span className="Text_Primary Alert_Title">
                                                {t("No items to show")}{" "}
                                              </span>
                                            </p>
                                          </div>
                                        </label>
                                      </div>
                                    </>
                                  )}

                                  <Dialog
                                    visible={visibleImage}
                                    style={{ width: "50vw" }}
                                    onHide={() => {
                                      setVisibleImage(false);
                                    }}
                                  >
                                    <a
                                      href={showImage}
                                      download={docName}
                                      className="flex flex-col"
                                      title={`Download ${docName}`}
                                    >
                                      <i
                                        className="pi pi-download"
                                        style={{
                                          fontSize: "24px",
                                          marginBottom: "8px",
                                          display: "flex",
                                          justifyContent: "end",
                                        }}
                                      ></i>
                                    </a>
                                    <img
                                      src={showImage}
                                      alt=""
                                      className="w-full bg-cover"
                                    />
                                    <h5>{docName}</h5>
                                    <h6>{DocTitle}</h6>
                                  </Dialog>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Card>

                        {selectedDetails?.ASSET_NONASSET === "A" && (
                          <Card className="mt-4">
                            <label className="Header_Text Text_Primary">
                              Equipment Summary
                            </label>
                            {/* <div className="flex flex-wrap justify-between mb-3">
                             
                              <Buttons
                              className="Border_Button Secondary_Button "
                              disabled={showdetails}
                              label={"Show Details"}
                              onClick={() => {
                                handlerShowDetails();
                              }}
                            />
                            </div> */}
                            <div className="grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-3 lg:grid-cols-3  ">
                              {/* <label className="Header_Text Text_Primary equpmentContainer">
                                Equipment Summary
                              </label> */}
                              <div className="col-span-3">
                                <label className="Text_Secondary Helper_Text">
                                  Equipment Name
                                </label>
                                <p className="Text_Primary Helper_Text  ">
                                  {/* {selectedEquipmentKey} */}
                                  {assetTreeDetails[0]?.length === 0
                                    ? selectedDetails?.ASSET_NAME
                                    : assetTreeDetails[0]?.ASSET_NAME}
                                </p>
                              </div>
                              <div>
                                <label className="Text_Secondary Helper_Text">
                                  Equipment Type
                                </label>
                                <p className="Text_Primary Helper_Text  ">
                                  {assetTreeDetails[0]?.length === 0
                                    ? selectedDetails?.ASSETTYPE_NAME
                                    : assetTreeDetails[0]?.ASSETTYPE_NAME}
                                </p>
                              </div>
                              {/* <div>
                                <label className="Text_Secondary Helper_Text">
                                  Equipment Group
                                </label>
                                <p className="Text_Primary Alert_Title">
                                  {assetTreeDetails[0]?.length === 0
                                    ? selectedDetails?.ASSETGROUP_NAME
                                    : assetTreeDetails[0]?.ASSETGROUP_NAME}
                                </p>
                              </div> */}
                              {/* Show Location  */}
                              {/* <div>
                                <label className="Text_Secondary Helper_Text">
                                  Location
                                </label>
                                <p className="Text_Primary Helper_Text  ">
                                  {assetTreeDetails[0]?.length === 0
                                    ? selectedDetails?.LOCATION_DESCRIPTION
                                    : assetTreeDetails[0]?.LOCATION_DESCRIPTION}
                                </p>
                              </div> */}
                            </div>
                            {/* <div className="grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-3 lg:grid-cols-3">
                            <div>
                              <label className="Text_Secondary Helper_Text">
                                Equipment Group
                              </label>
                              {selectedDetails?.ASSETGROUP_NAME === null ||
                                selectedDetails?.ASSETGROUP_NAME === "" ? (
                                <>
                                  <p className="Text_Primary Alert_Title  ">
                                    NA
                                  </p>
                                </>
                              ) : (
                                <>
                                  <p className="Text_Primary Alert_Title  ">
                                    {selectedDetails?.ASSETGROUP_NAME}
                                  </p>
                                </>
                              )}
                            </div>
                            <div>
                              <label className="Text_Secondary Helper_Text">
                                Ownership Status
                              </label>
                              {selectedDetails?.OWN_LEASE === null ||
                                selectedDetails?.OWN_LEASE === "" ? (
                                <>
                                  <p className="Text_Primary Alert_Title  ">
                                    NA
                                  </p>
                                </>
                              ) : (
                                <>
                                  {selectedDetails?.OWN_LEASE === "O" ? (
                                    <>
                                      <p className="Text_Primary Alert_Title  ">
                                        Owned
                                      </p>
                                    </>
                                  ) : (
                                    <>
                                      <p className="Text_Primary Alert_Title  ">
                                        Leased
                                      </p>
                                    </>
                                  )}
                                </>
                              )}
                            </div>
                            <div>
                              <label className="Text_Secondary Helper_Text">
                                Last Maintenance Date
                              </label>
                              {selectedDetails?.LAST_MAINTANCE_DATE === null ||
                                selectedDetails?.LAST_MAINTANCE_DATE === "" ? (
                                <>
                                  <p className="Text_Primary Alert_Title  ">
                                    NA
                                  </p>
                                </>
                              ) : (
                                <>
                                  <p className="Text_Primary Alert_Title  ">
                                    {onlyDateFormat(
                                      selectedDetails?.LAST_MAINTANCE_DATE
                                    )}
                                  </p>
                                </>
                              )}
                            </div>
                            <div>
                              <label className="Text_Secondary Helper_Text">
                                Equipment Type
                              </label>
                              {selectedDetails?.ASSETTYPE_NAME === null ||
                                selectedDetails?.ASSETTYPE_NAME === "" ? (
                                <>
                                  <p className="Text_Primary Alert_Title  ">
                                    NA
                                  </p>
                                </>
                              ) : (
                                <>
                                  <p className="Text_Primary Alert_Title  ">
                                    {selectedDetails?.ASSETTYPE_NAME}
                                  </p>
                                </>
                              )}
                            </div>
                            <div>
                              <label className="Text_Secondary Helper_Text">
                                Warranty End Date
                              </label>
                              {selectedDetails?.WARRANTY_END_DATE === null ||
                                selectedDetails?.WARRANTY_END_DATE === "" ? (
                                <>
                                  <p className="Text_Primary Alert_Title  ">
                                    NA
                                  </p>
                                </>
                              ) : (
                                <>
                                  <p className="Text_Primary Alert_Title  ">
                                    {" "}
                                    {onlyDateFormat(
                                      selectedDetails?.WARRANTY_END_DATE
                                    )}
                                  </p>
                                </>
                              )}
                            </div>
                            <div>
                              <label className="Text_Secondary Helper_Text">
                                Upcoming Schedule
                              </label>
                              {selectedDetails?.ASSETTYPE_NAME === null ||
                                selectedDetails?.ASSETTYPE_NAME === "" ? (
                                <>
                                  <p className="Text_Primary Alert_Title  ">
                                    NA
                                  </p>
                                </>
                              ) : (
                                <>
                                  <p className="Text_Primary Alert_Title  ">
                                    {onlyDateFormat(
                                      selectedDetails?.UPCOMING_SCHEDULE_DATE
                                    )}
                                  </p>
                                </>
                              )}
                            </div>
                            <div>
                              <label className="Text_Secondary Helper_Text">
                                Equipment Name
                              </label>
                              {selectedDetails?.ASSET_NAME === null ||
                                selectedDetails?.ASSET_NAME === "" ? (
                                <>
                                  <p className="Text_Primary Alert_Title  ">
                                    NA
                                  </p>
                                </>
                              ) : (
                                <>
                                  <p className="Text_Primary Alert_Title  ">
                                    {selectedDetails?.ASSET_NAME}
                                  </p>
                                </>
                              )}
                            </div>
                            <div>
                              <label className="Text_Secondary Helper_Text">
                                Vendor Name
                              </label>
                              {selectedDetails?.VENDOR_NAME === null ||
                                selectedDetails?.VENDOR_NAME === "" ? (
                                <>
                                  <p className="Text_Primary Alert_Title  ">
                                    NA
                                  </p>
                                </>
                              ) : (
                                <>
                                  <p className="Text_Primary Alert_Title  ">
                                    {selectedDetails?.VENDOR_NAME}
                                  </p>
                                </>
                              )}
                            </div>
                          </div> */}
                          </Card>
                        )}
                        {/* Soft Service Section */}
                        {selectedDetails?.ASSET_NONASSET === "N" && (
                          <Card className="mt-4">
                            <div className="flex flex-wrap justify-between mb-3">
                              <h6 className="Header_Text">
                                Soft Service Summary
                              </h6>
                              {selectedDetails?.ASSET_NAME === null ||
                                selectedDetails?.ASSET_NAME === "" ? (
                                <></>
                              ) : (
                                <>
                                  {/* <Buttons
                                  className="Border_Button Secondary_Button "
                                  label={"Show Details"}
                                  onClick={() => {
                                    handlerShowDetails();
                                  }}
                                /> */}
                                </>
                              )}
                            </div>

                            <div className="grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-3 lg:grid-cols-3">
                              <div>
                                <label className="Text_Secondary Helper_Text">
                                  Service Group
                                </label>
                                {selectedDetails?.ASSETGROUP_NAME === null ||
                                  selectedDetails?.ASSETGROUP_NAME === "" ? (
                                  <>
                                    <p className="Text_Primary Alert_Title  ">
                                      NA
                                    </p>
                                  </>
                                ) : (
                                  <>
                                    <p className="Text_Primary Alert_Title  ">
                                      {selectedDetails?.ASSETGROUP_NAME}
                                    </p>
                                  </>
                                )}
                              </div>
                              <div>
                                <label className="Text_Secondary Helper_Text">
                                  Service Type
                                </label>
                                {selectedDetails?.ASSETTYPE_NAME === null ||
                                  selectedDetails?.ASSETTYPE_NAME === "" ? (
                                  <>
                                    <p className="Text_Primary Alert_Title  ">
                                      NA
                                    </p>
                                  </>
                                ) : (
                                  <>
                                    <p className="Text_Primary Alert_Title  ">
                                      {selectedDetails?.ASSETTYPE_NAME}
                                    </p>
                                  </>
                                )}
                              </div>
                              <div>
                                <label className="Text_Secondary Helper_Text">
                                  Service Name
                                </label>
                                {selectedDetails?.ASSET_NAME === null ||
                                  selectedDetails?.ASSET_NAME === "" ? (
                                  <>
                                    <p className="Text_Primary Alert_Title  ">
                                      NA
                                    </p>
                                  </>
                                ) : (
                                  <>
                                    <p className="Text_Primary Alert_Title  ">
                                      {selectedDetails?.ASSET_NAME}
                                    </p>
                                  </>
                                )}
                              </div>
                            </div>
                          </Card>
                        )}
                      </TabPanel>

                      {
                        // [
                        //   123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133,
                        //   134,
                        // ]?.some((num) => [selectedDetails?.PREVIOUS_ACTION]?.includes(num))
                        selectedDetails?.COMPLETED_AT && (
                          <TabPanel headerTemplate={MaterialHeaderTemplate}>
                            <Card className="mt-2">
                              {[131, 132, 148]?.some((num) =>
                                [selectedDetails.PREVIOUS_ACTION]?.includes(num)
                              ) &&
                                [132, 148]?.some((num) =>
                                  MapButtons?.includes(num)
                                ) && (
                                  <div className="reviewContainer">
                                    <div className="flex justify-between">
                                      <div className="flex flex-wrap">
                                        <img
                                          src={reviewIcon}
                                          alt=""
                                          className="w-auto h-10"
                                        />
                                        <div className="flex flex-wrap">
                                          <div className="ml-3">
                                            <label className="Text_Primary mb-2 Avatar_Initials">
                                              Edit Required
                                            </label>
                                            <p
                                              className="Text_Primary Input_Text"
                                              // data-pr-tooltip={remark}
                                              data-pr-position="bottom"
                                            >
                                              The resolution has been returned
                                              for adjustment.
                                            </p>
                                            {/* {selectedDetails?.SUB_STATUS === "4" ||
                                  selectedDetails?.SUB_STATUS === "1" ? (
                                    <>
                                      <p className="Text_Primary Input_Text  ">
                                        {selectedDetails?.REASON_DESC}
                                      </p>
                                    </>
                                  ) : (
                                    <></>
                                  )} */}
                                          </div>
                                        </div>
                                      </div>
                                      <InfraSidebarVisibal
                                        header={"Work order"}
                                        control={control}
                                        setValue={setValue}
                                        watch={watch}
                                        btnText="View Now"
                                        MapButtons={MapButtons}
                                        reassignVisible={reassignVisible}
                                        headerTemplate={
                                          selectedDetails?.STATUS_DESC
                                        }
                                        selectedDetails={selectedDetails}
                                        subStatus={
                                          selectedDetails?.SUB_STATUS_DESC
                                        }
                                        updateWOStatusInfra={
                                          updateWOStatusInfra
                                        }
                                        approvalStatus={approvalStatus}
                                        docOption={docOption}
                                        setTestingOnHold={setTestingOnHold}
                                      />
                                    </div>
                                  </div>
                                )}

                              {selectedDetails?.ISADDRESOLUTION === 1 ? (
                                // 1 == 1
                                <div className="mt-2">
                                  {/* after reassign screen display below and edit button will hide*/}

                                  {/*  */}

                                  <h6 className="Header_Text">
                                    Resolution Details
                                  </h6>
                                  <div className="flex items-center mt-2 justify-center w-full">
                                    <label
                                      className="flex flex-col items-center justify-center w-full h-52 border-2
                                  border-gray-200 border rounded-lg  "
                                    >
                                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        {partMatOptions.length === 0 ? (
                                          <>
                                            <img
                                              src={noDataIcon}
                                              alt=""
                                              className="w-12"
                                            />
                                            <p className="mb-2 mt-2 text-sm text-gray-500  dark:text-gray-400">
                                              <span className="Text_Primary Alert_Title ">
                                                {t("No items to show")}{" "}
                                              </span>
                                            </p>
                                            <label className="Text_Secondary Helper_Text mb-4">
                                              {t(
                                                "No Resolution added to this work order."
                                              )}
                                            </label>
                                          </>
                                        ) : (
                                          <></>
                                        )}

                                        {/* <Buttons
                                className="Secondary_Button"
                                icon="pi pi-plus"
                                label={"Add Resolution"}
                              /> */}
                                        {/* <>{(selectedDetails?.ACTUAL_START_DATE)}</>
                              <>{(selectedDetails?.ACTUAL_END_DATE === null && selectedDetails?.ACTUAL_START_DATE === null && selectedDetails?.REASON_DESCRIPTION === null && docOption?.length === 0)?.toString() + "jdkf"}</> */}

                                        {/* {([
                                          123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133

                                        ]?.some((num) => [selectedDetails?.PREVIOUS_ACTION]?.includes(num)) && (selectedDetails?.ACTUAL_END_DATE === null || selectedDetails?.ACTUAL_START_DATE === "1900-01-01T00:00:00")
                                          && (selectedDetails?.ACTUAL_START_DATE === null || selectedDetails?.ACTUAL_END_DATE === "1900-01-01T00:00:00")
                                          && selectedDetails?.REASON_DESCRIPTION === null && docOption?.length === 0) && ( */}

                                        <AddResolutionDialog
                                          header={"Add Resolution"}
                                          control={control}
                                          setValue={setValue}
                                          register={register}
                                          paragraph={""}
                                          watch={watch}
                                          errors={errors}
                                          updateWOStatusInfra={
                                            updateWOStatusInfra
                                          }
                                          selectedDetails={selectedDetails}
                                          DOC_LIST_DATA={docOption}
                                          Actioncode={MapButtons}
                                        />
                                        {/* )} */}
                                      </div>
                                    </label>
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <div className="flex flex-wrap justify-between">
                                    <h6 className="Header_Text">
                                      Resolution Details
                                    </h6>

                                    {selectedDetails?.ISEDITRESOLUTION == 1 && (
                                      <AddResolutionDialog
                                        header={"Edit Resolution"}
                                        control={control}
                                        setValue={setValue}
                                        register={register}
                                        paragraph={""}
                                        watch={watch}
                                        errors={errors}
                                        updateWOStatusInfra={
                                          updateWOStatusInfra
                                        }
                                        selectedDetails={selectedDetails}
                                        DOC_LIST_DATA={docOption}
                                        Actioncode={MapButtons}
                                      />
                                    )}
                                  </div>
                                  <div className="grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-3 lg:grid-cols-3">
                                    <div className=" flex flex-col  gap-[16px]">
                                      <div>
                                        <label className="Text_Secondary Helper_Text  ">
                                          Last Updated By
                                        </label>
                                        <p className="Text_Primary Alert_Title  ">
                                          {selectedDetails?.LAST_MODIFIED_BY}
                                        </p>
                                      </div>
                                      <div>
                                        <div>
                                          <label className="Text_Secondary Helper_Text  ">
                                            Last Updated Date
                                          </label>
                                          <p className="Text_Primary Alert_Title  ">
                                            {formateDate(
                                              selectedDetails?.LAST_MODIFIED_ON
                                            )}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="col-span-2">
                                      <div className=" flex flex-col gap-2">
                                        <div>
                                          <label className="Text_Secondary Helper_Text  ">
                                            Resolution Description
                                          </label>
                                          <p className="Text_Primary Alert_Title  ">
                                            {
                                              selectedDetails?.COMPLETED_DESCRIPTION
                                            }
                                          </p>
                                        </div>
                                        {/* <div className="col-span-2">
                                          {woDocumentUpload?.map((doc: any) => {
                                            return (
                                              <div
                                                className="col-span-2"
                                                key={doc?.key}
                                              >
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
                                            );
                                          })}
                                        </div> */}

                                        <div>
                                          <div className="my-[24px]">
                                            <div className="mb-[8px]">
                                              <label className="Text_Secondary Helper_Text  ">
                                                #Before(
                                                {
                                                  docOption?.filter(
                                                    (e: any) =>
                                                      e.UPLOAD_TYPE === "B"
                                                  ).length
                                                }
                                                )
                                              </label>
                                            </div>
                                            {isloading === true ? (
                                              <div className="imageContainer  flex justify-center items-center z-400">
                                                <>
                                                  <LoaderFileUpload
                                                    IsScannig={false}
                                                  />
                                                </>
                                              </div>
                                            ) : docOption?.filter(
                                              (e: any) =>
                                                e.UPLOAD_TYPE === "B"
                                            ).length > 0 ? (
                                              <>
                                                <ImageGalleryComponent
                                                  uploadType="B"
                                                  docOption={docOption}
                                                  Title={"Before"}
                                                />
                                                {/* <div className="flex flex-wrap gap-3">
                                                    {docOption?.map(
                                                      (doc: any, index: any) => {
                                                        if (
                                                          doc.UPLOAD_TYPE === "B"
                                                        ) {
                                                          const getExtension = (
                                                            str: any
                                                          ) =>
                                                            str.slice(
                                                              str.lastIndexOf(".")
                                                            );
                                                          const fileExtension =
                                                            getExtension(
                                                              doc?.DOC_NAME
                                                            );

                                                          let shortenedFileName =
                                                            getShortenedFileName(
                                                              doc?.DOC_NAME
                                                            );
                                                          let FileSize =
                                                            calFileSize(
                                                              doc?.DOC_DATA
                                                            );

                                                          var docData: string;
                                                          if (
                                                            fileExtension === ".pdf"
                                                          ) {
                                                            docData =
                                                              "data:application/pdf;base64," +
                                                              doc?.DOC_DATA;
                                                            return (
                                                              <div key={index}>
                                                                <a
                                                                  href={docData}
                                                                  download={
                                                                    doc?.DOC_NAME
                                                                  }
                                                                  className="text-blue-500"
                                                                  title={
                                                                    doc?.DOC_NAME
                                                                  }
                                                                >
                                                                  {" "}
                                                                  <img
                                                                    src={pdfIcon}
                                                                    alt=""
                                                                    className="w-[120px] h-[120px]  rounded-xl cursor-pointer"
                                                                  />
                                                                </a>
                                                                <div className="flex flex-col ">
                                                                  <div className="Service_Image_Title">
                                                                    {
                                                                      shortenedFileName
                                                                    }
                                                                  </div>
                                                                  <div className="Text_Secondary Helper_Text">
                                                                    {FileSize}
                                                                  </div>
                                                                </div>
                                                              </div>
                                                            );
                                                          } else if (
                                                            fileExtension ===
                                                            ".doc" ||
                                                            fileExtension ===
                                                            ".docx"
                                                          ) {
                                                            docData =
                                                              "data:application/msword;base64," +
                                                              doc?.DOC_DATA;
                                                            // Word icon
                                                            return (
                                                              <div key={index}>
                                                                <a
                                                                  href={docData}
                                                                  download={
                                                                    doc?.DOC_NAME
                                                                  }
                                                                  className="text-blue-500"
                                                                  title={
                                                                    doc?.DOC_NAME
                                                                  }
                                                                >
                                                                  <img
                                                                    src={
                                                                      wordDocIcon
                                                                    }
                                                                    alt="Word icon"
                                                                    className="w-[120px] h-[120px]  rounded-xl cursor-pointer"
                                                                  />
                                                                </a>
                                                                <div className="flex flex-col ">
                                                                  <div className="Service_Image_Title">
                                                                    {
                                                                      shortenedFileName
                                                                    }
                                                                  </div>
                                                                  <div className="Text_Secondary Helper_Text">
                                                                    {FileSize}
                                                                  </div>
                                                                </div>
                                                              </div>
                                                            );
                                                          } else if (
                                                            fileExtension ===
                                                            ".xls" ||
                                                            fileExtension ===
                                                            ".xlsx"
                                                          ) {
                                                            docData =
                                                              "data:application/excel;base64," +
                                                              doc?.DOC_DATA;
                                                            // Word icon
                                                            return (
                                                              <div key={index}>
                                                                <a
                                                                  href={docData}
                                                                  download={
                                                                    doc?.DOC_NAME
                                                                  }
                                                                  className="text-blue-500"
                                                                  title={
                                                                    doc?.DOC_NAME
                                                                  }
                                                                >
                                                                  <img
                                                                    src={excelIcon}
                                                                    alt="Word icon"
                                                                    className="w-[120px] h-[120px]  rounded-xl cursor-pointer"
                                                                  />
                                                                </a>
                                                                <div className="flex flex-col ">
                                                                  <div className="Service_Image_Title">
                                                                    {
                                                                      shortenedFileName
                                                                    }
                                                                  </div>
                                                                  <div className="Text_Secondary Helper_Text">
                                                                    {FileSize}
                                                                  </div>
                                                                </div>
                                                              </div>
                                                            );
                                                          } else {
                                                            // Otherwise, treat it as an image (e.g., PNG) and show a thumbnail
                                                            docData =
                                                              "data:image/png;base64," +
                                                              doc?.DOC_DATA;

                                                            return (
                                                              <div
                                                                key={index}
                                                                onClick={() => {
                                                                  setHandelImage(
                                                                    docData,
                                                                    doc?.DOC_NAME,
                                                                    "Before Files"
                                                                  ); // Assuming this function sets the image for preview
                                                                }}
                                                              >
                                                                <img
                                                                  src={docData}
                                                                  alt=""
                                                                  className="w-[120px] h-[120px]  rounded-xl cursor-pointer"
                                                                />
                                                                <div className="flex flex-col ">
                                                                  <div className="Service_Image_Title">
                                                                    {
                                                                      shortenedFileName
                                                                    }
                                                                  </div>
                                                                  <div className="Text_Secondary Helper_Text">
                                                                    {FileSize}
                                                                  </div>
                                                                </div>
                                                              </div>
                                                            );
                                                          }
                                                        }
                                                      }
                                                    )}
                                                  </div>
                                                  <Dialog
                                                    visible={visibleImage}
                                                    style={{
                                                      width: "50vw",
                                                      height: "60vh",
                                                    }}
                                                    onHide={() => {
                                                      setVisibleImage(false);
                                                    }}
                                                  >
                                                    <img
                                                      src={showImage}
                                                      alt=""
                                                      className="w-full h-full"
                                                    />
                                                  </Dialog> */}
                                              </>
                                            ) : (
                                              <>
                                                <div className="flex items-center mt-2 justify-center w-full">
                                                  <label
                                                    htmlFor="dropzone-file"
                                                    className="flex flex-col items-center justify-center w-full h-24 border-2
                                                                              border-gray-200 border rounded-lg  "
                                                  >
                                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                      <img
                                                        src={noDataIcon}
                                                        alt=""
                                                        className="w-12"
                                                      />
                                                      <p className="mb-2 mt-2 text-sm ">
                                                        <span className="Text_Primary Alert_Title">
                                                          {t(
                                                            "No items to show"
                                                          )}{" "}
                                                        </span>
                                                      </p>
                                                    </div>
                                                  </label>
                                                </div>
                                              </>
                                            )}

                                            <Dialog
                                              visible={visibleImage}
                                              style={{ width: "50vw" }}
                                              onHide={() => {
                                                setVisibleImage(false);
                                              }}
                                            >
                                              <img
                                                src={showImage}
                                                alt=""
                                                className="w-full bg-cover"
                                              />
                                            </Dialog>
                                          </div>
                                          <div>
                                            <div className="mb-[8px]">
                                              <label className="Text_Secondary Helper_Text ">
                                                #After(
                                                {
                                                  docOption?.filter(
                                                    (e: any) =>
                                                      e.UPLOAD_TYPE === "A"
                                                  ).length
                                                }
                                                )
                                              </label>
                                            </div>
                                            {isloading === true ? (
                                              <div className="imageContainer  flex justify-center items-center z-400">
                                                <>
                                                  <LoaderFileUpload
                                                    IsScannig={false}
                                                  />
                                                </>
                                              </div>
                                            ) : docOption?.filter(
                                              (e: any) =>
                                                e.UPLOAD_TYPE === "A"
                                            ).length > 0 ? (
                                              <>
                                                <ImageGalleryComponent
                                                  uploadType="A"
                                                  docOption={docOption}
                                                  Title={"After"}
                                                />
                                                {/* <div className="flex flex-wrap gap-3">
                                                                                      {docOption?.map(
                                                                                        (doc: any, index: any) => {
                                                                                          if (doc.UPLOAD_TYPE === "A") {
                                                                                            const docData: any =
                                                                                              "data:image/png;base64," +
                                                                                              doc?.DOC_DATA;
                                                                                            return (
                                                                                              <>
                                                                                                <div
                                                                                                  onClick={() => {
                                                                                                    setHandelImage(
                                                                                                      docData
                                                                                                    );
                                                                                                  }}
                                                                                                >
                                                                                                  <img
                                                                                                    src={docData}
                                                                                                    alt=""
                                                                                                    className="w-20 h-20 rounded-xl"
                                                                                                  />
                                                                                                </div>
                                                                                             
                                                                                              </>
                                                                                            );
                                                                                          }
                                                                                        }
                                                                                      )}
                                                                                    </div> */}
                                                {/* <div className="flex flex-wrap gap-3">
                                                    {docOption?.map(
                                                      (doc: any, index: any) => {
                                                        if (
                                                          doc.UPLOAD_TYPE === "A"
                                                        ) {
                                                          const getExtension = (
                                                            str: any
                                                          ) =>
                                                            str.slice(
                                                              str.lastIndexOf(".")
                                                            );
                                                          const fileExtension =
                                                            getExtension(
                                                              doc?.DOC_NAME
                                                            );
                                                          let shortenedFileName =
                                                            getShortenedFileName(
                                                              doc?.DOC_NAME
                                                            );
                                                          let FileSize =
                                                            calFileSize(
                                                              doc?.DOC_DATA
                                                            );
                                                          var docData: string;
                                                          if (
                                                            fileExtension === ".pdf"
                                                          ) {
                                                            docData =
                                                              "data:application/pdf;base64," +
                                                              doc?.DOC_DATA;
                                                            return (
                                                              <div key={index}>
                                                                <a
                                                                  href={docData}
                                                                  download={
                                                                    doc?.DOC_NAME
                                                                  }
                                                                  className="text-blue-500"
                                                                  title={
                                                                    doc?.DOC_NAME
                                                                  }
                                                                >
                                                                  {" "}
                                                                  <img
                                                                    src={pdfIcon}
                                                                    alt=""
                                                                    className="w-[120px] h-[120px]  rounded-xl cursor-pointer"
                                                                  />
                                                                </a>
                                                                <div className="flex flex-col ">
                                                                  <div className="Service_Image_Title">
                                                                    {
                                                                      shortenedFileName
                                                                    }
                                                                  </div>
                                                                  <div className="Text_Secondary Helper_Text">
                                                                    {FileSize}
                                                                  </div>
                                                                </div>
                                                              </div>
                                                            );
                                                          } else if (
                                                            fileExtension ===
                                                            ".doc" ||
                                                            fileExtension ===
                                                            ".docx"
                                                          ) {
                                                            docData =
                                                              "data:application/msword;base64," +
                                                              doc?.DOC_DATA;
                                                            // Word icon
                                                            return (
                                                              <div key={index}>
                                                                <a
                                                                  href={docData}
                                                                  download={
                                                                    doc?.DOC_NAME
                                                                  }
                                                                  className="text-blue-500"
                                                                  title={
                                                                    doc?.DOC_NAME
                                                                  }
                                                                >
                                                                  <img
                                                                    src={
                                                                      wordDocIcon
                                                                    }
                                                                    alt="Word icon"
                                                                    className="w-[120px] h-[120px]  rounded-xl cursor-pointer"
                                                                  />
                                                                </a>
                                                                <div className="flex flex-col ">
                                                                  <div className="Service_Image_Title">
                                                                    {
                                                                      shortenedFileName
                                                                    }
                                                                  </div>
                                                                  <div className="Text_Secondary Helper_Text">
                                                                    {FileSize}
                                                                  </div>
                                                                </div>
                                                              </div>
                                                            );
                                                          } else if (
                                                            fileExtension ===
                                                            ".xls" ||
                                                            fileExtension ===
                                                            ".xlsx"
                                                          ) {
                                                            docData =
                                                              "data:application/excel;base64," +
                                                              doc?.DOC_DATA;
                                                            // Word icon
                                                            return (
                                                              <div key={index}>
                                                                <a
                                                                  href={docData}
                                                                  download={
                                                                    doc?.DOC_NAME
                                                                  }
                                                                  className="text-blue-500"
                                                                  title={
                                                                    doc?.DOC_NAME
                                                                  }
                                                                >
                                                                  <img
                                                                    src={excelIcon}
                                                                    alt="Word icon"
                                                                    className="w-[120px] h-[120px]  rounded-xl cursor-pointer"
                                                                  />
                                                                </a>
                                                                <div className="flex flex-col ">
                                                                  <div className="Service_Image_Title">
                                                                    {
                                                                      shortenedFileName
                                                                    }
                                                                  </div>
                                                                  <div className="Text_Secondary Helper_Text">
                                                                    {FileSize}
                                                                  </div>
                                                                </div>
                                                              </div>
                                                            );
                                                          } else {
                                                            // Otherwise, treat it as an image (e.g., PNG) and show a thumbnail
                                                            docData =
                                                              "data:image/png;base64," +
                                                              doc?.DOC_DATA;

                                                            return (
                                                              <div
                                                                key={index}
                                                                onClick={() => {
                                                                  setHandelImage(
                                                                    docData,
                                                                    doc?.DOC_NAME,
                                                                    "After"
                                                                  ); // Assuming this function sets the image for preview
                                                                }}
                                                              >
                                                                <img
                                                                  src={docData}
                                                                  alt=""
                                                                  className="w-[120px] h-[120px]  rounded-xl cursor-pointer"
                                                                />
                                                                <div className="flex flex-col ">
                                                                  <div className="Service_Image_Title">
                                                                    {
                                                                      shortenedFileName
                                                                    }
                                                                  </div>
                                                                  <div className="Text_Secondary Helper_Text">
                                                                    {FileSize}
                                                                  </div>
                                                                </div>
                                                              </div>
                                                            );
                                                          }
                                                        }
                                                      }
                                                    )}
                                                  </div>
                                                  <Dialog
                                                    visible={visibleImage}
                                                    style={{ width: "50vw" }}
                                                    onHide={() => {
                                                      setVisibleImage(false);
                                                    }}
                                                  >
                                                    <a
                                                      href={showImage}
                                                      download={docName}
                                                      className="flex flex-col"
                                                      title={`Download ${docName}`}
                                                    >
                                                      <i
                                                        className="pi pi-download"
                                                        style={{
                                                          fontSize: "24px",
                                                          marginBottom: "8px",
                                                          display: "flex",
                                                          justifyContent: "end",
                                                        }}
                                                      ></i>
                                                    </a>
                                                    <img
                                                      src={showImage}
                                                      alt=""
                                                      className="w-full bg-cover"
                                                    />
                                                    <h5>{docName}</h5>
                                                    <h6>{DocTitle}</h6>
                                                  </Dialog> */}
                                              </>
                                            ) : (
                                              <>
                                                <div className="flex items-center mt-2 justify-center w-full">
                                                  <label
                                                    htmlFor="dropzone-file"
                                                    className="flex flex-col items-center justify-center w-full h-24 border-2
                                                                              border-gray-200 border rounded-lg  "
                                                  >
                                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                      <img
                                                        src={noDataIcon}
                                                        alt=""
                                                        className="w-12"
                                                      />
                                                      <p className="mb-2 mt-2 text-sm ">
                                                        <span className="Text_Primary Alert_Title">
                                                          {t(
                                                            "No items to show"
                                                          )}{" "}
                                                        </span>
                                                      </p>
                                                    </div>
                                                  </label>
                                                </div>
                                              </>
                                            )}
                                          </div>
                                        </div>
                                        {/* <div>
                                <label className="Text_Secondary Helper_Text  ">
                                  #before (5)
                                </label>

                                <div className="flex flex-wrap gap-3">
                                  <div>
                                    <a className="flex flex-col  ">
                                      {" "}
                                      <img
                                        src={pdfIcon}
                                        alt=""
                                        className="w-16 h-16 rounded-xl cursor-pointer"
                                      />
                                    </a>
                                    <div className="flex flex-col ">
                                      <div className="Text_Secondary Helper_Text">
                                        xyz.pdf
                                      </div>
                                      <div className="Text_Secondary Helper_Text">
                                        35kb
                                      </div>
                                    </div>
                                  </div>
                                  <div>
                                    <a className="flex flex-col  ">
                                      {" "}
                                      <img
                                        src={pdfIcon}
                                        alt=""
                                        className="w-16 h-16 rounded-xl cursor-pointer"
                                      />
                                    </a>
                                    <div className="flex flex-col ">
                                      <div className="Text_Secondary Helper_Text">
                                        xyz.pdf
                                      </div>
                                      <div className="Text_Secondary Helper_Text">
                                        35kb
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <label className="Text_Secondary Helper_Text  ">
                                  #after (2)
                                </label>

                                <div className="flex flex-wrap gap-3">
                                  <div>
                                    <a className="flex flex-col  ">
                                      {" "}
                                      <img
                                        src={pdfIcon}
                                        alt=""
                                        className="w-16 h-16 rounded-xl cursor-pointer"
                                      />
                                    </a>
                                    <div className="flex flex-col ">
                                      <div className="Text_Secondary Helper_Text">
                                        xyz.pdf
                                      </div>
                                      <div className="Text_Secondary Helper_Text">
                                        35kb
                                      </div>
                                    </div>
                                  </div>
                                  <div>
                                    <a className="flex flex-col  ">
                                      {" "}
                                      <img
                                        src={pdfIcon}
                                        alt=""
                                        className="w-16 h-16 rounded-xl cursor-pointer"
                                      />
                                    </a>
                                    <div className="flex flex-col ">
                                      <div className="Text_Secondary Helper_Text">
                                        xyz.pdf
                                      </div>
                                      <div className="Text_Secondary Helper_Text">
                                        35kb
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div> */}

                                        <div className="flex flex-wrap justify-between gap-3 mt-[8px]">
                                          <div>
                                            <label className="Text_Secondary Helper_Text  ">
                                              Actual Start Date
                                            </label>
                                            {/* <p className="Text_Primary Alert_Title  ">
                                           
                                              {helperNullDate(
                                                selectedDetails?.ACTUAL_START_DATE
                                              ).toLocaleString()}
                                            </p>  */}
                                            {selectedDetails?.ACTUAL_START_DATE ===
                                              null ||
                                              selectedDetails?.ACTUAL_START_DATE ===
                                              "" ||
                                              selectedDetails?.ACTUAL_START_DATE ===
                                              "1900-01-01T00:00:00" ? (
                                              <>
                                                <p className="Text_Primary Alert_Title  ">
                                                  -
                                                </p>
                                              </>
                                            ) : (
                                              <>
                                                <p className="Text_Primary Alert_Title  ">
                                                  {" "}
                                                  {onlyDateFormat(
                                                    selectedDetails?.ACTUAL_START_DATE
                                                  )}
                                                </p>
                                              </>
                                            )}
                                          </div>
                                          <div>
                                            <label className="Text_Secondary Helper_Text  ">
                                              Actual End Date
                                            </label>
                                            {/* <p className="Text_Primary Alert_Title  ">
                                              {helperNullDate(
                                                selectedDetails?.ACTUAL_END_DATE
                                              ).toLocaleString()}
                                            </p> */}
                                            {selectedDetails?.ACTUAL_END_DATE ===
                                              null ||
                                              selectedDetails?.ACTUAL_END_DATE ===
                                              "" ||
                                              selectedDetails?.ACTUAL_END_DATE ===
                                              "1900-01-01T00:00:00" ? (
                                              <>
                                                <p className="Text_Primary Alert_Title  ">
                                                  -
                                                </p>
                                              </>
                                            ) : (
                                              <>
                                                <p className="Text_Primary Alert_Title  ">
                                                  {" "}
                                                  {onlyDateFormat(
                                                    selectedDetails?.ACTUAL_END_DATE
                                                  )}
                                                </p>
                                              </>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Card>
                          </TabPanel>
                        )
                      }
                      <TabPanel headerTemplate={ActivityHeaderTemplate}>
                        {timelineList.length === 0 ? (
                          <Card className="mt-2">
                            <h6 className="Header_Text">Activity Timeline</h6>
                            <div className="flex items-center mt-2 justify-center w-full">
                              <label
                                htmlFor="dropzone-file"
                                className="flex flex-col items-center justify-center w-full h-52 border-2
                                    border-gray-200 border rounded-lg  "
                              >
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                  <img
                                    src={noDataIcon}
                                    alt=""
                                    className="w-12"
                                  />
                                  <p className="mb-2 mt-2 text-sm text-gray-500 dark:text-gray-400">
                                    <span className="Text_Primary Alert_Title  ">
                                      {t("No items to show")}{" "}
                                    </span>
                                  </p>
                                </div>
                              </label>
                            </div>
                          </Card>
                        ) : (
                          <Card className="mt-2">
                            <div className="flex flex-wrap justify-between">
                              <h6 className="mb-2 Header_Text">
                                Activity Timeline
                              </h6>
                              {/* <div className="flex gap-2">
                            <Buttons
                              className="Border_Button Secondary_Button "
                              label={"List"}
                              icon="pi pi-list"
                            // onClick={() => { settimelinelistShow((prev) => !prev) }}
                            />
                            <Buttons
                              className="Border_Button Secondary_Button "
                              label={"Table"}
                              icon="pi pi-table"
                              onClick={() => {
                                settimelinelistShow((prev) => !prev);
                              }}
                            />

                          </div> */}
                            </div>

                            {/* {(timelinelistShow) && (<Timeline
                          value={timelineList}
                          className="customized-timeline"
                          content={customizedContent}
                        />)} */}
                            {/* <Dialog header="Remarks" visible={actiondetailvisible} style={{ width: '50vw' }} onHide={() => { if (!actiondetailvisible) return; setactiondetailvisible(false); }}>
                            <p className="m-0">
                              {selectedRowData?.REMARKS ?? ""}
                            </p>
                          </Dialog> */}

                            <Sidebar
                              className="w-[600px]"
                              header={sidebarcustomHeader}
                              visible={visibleRight}
                              position="right"
                              onHide={() => setVisibleRight(false)}
                            >
                              {/* <h6>View Details</h6> */}
                              <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2">
                                <div className="col-span-2">
                                  <label className="Text_Secondary Helper_Text  ">
                                    Status
                                  </label>

                                  <p
                                    className={`Helper_Text ${selectedRowData?.STATUS_DESC ===
                                      "Decline" ||
                                      selectedRowData?.STATUS_DESC ===
                                      "Declined"
                                      ? "Open"
                                      : selectedRowData?.STATUS_DESC?.includes(
                                        "Approved"
                                      )
                                        ? "Completed"
                                        : selectedRowData?.STATUS_DESC?.includes(
                                          "Pending"
                                        )
                                          ? "Rectified"
                                          : selectedRowData?.STATUS_DESC?.includes(
                                            "Fail"
                                          )
                                            ? "Open"
                                            : selectedRowData?.STATUS_DESC?.includes(
                                              "Return"
                                            )
                                              ? "Rectified"
                                              : ""
                                      }`}
                                  >
                                    {selectedRowData?.STATUS_DESC}
                                  </p>
                                  {/* <p className="Menu_Active Helper_Text">
                                  {selectedRowData?.STATUS_DESC ?? ""}
                                </p> */}
                                </div>
                                <div>
                                  <label className="Text_Secondary Helper_Text">
                                    Requestor
                                  </label>
                                  <p className="Text_Primary Alert_Title">
                                    {selectedRowData?.LOGIN_NAME ?? ""}
                                  </p>
                                </div>
                                <div>
                                  <label className="Text_Secondary Helper_Text  ">
                                    Request Date & Time
                                  </label>
                                  <p className="Text_Primary Alert_Title">
                                    {selectedRowData?.CREATEDON ?? ""}
                                  </p>
                                </div>
                                <div className="col-span-2">
                                  <label className="Text_Secondary Helper_Text  ">
                                    {selectedRowData?.ACTION_ID === 105
                                      ? "Reason"
                                      : "Remarks"}
                                  </label>
                                  <p className="Text_Primary Alert_Title">
                                    <b>
                                      {selectedRowData?.REASON_DESCRIPTION ??
                                        ""}
                                    </b>
                                  </p>
                                  <p className="Text_Primary Alert_Title">
                                    {selectedRowData?.REMARKS ?? ""}
                                  </p>
                                </div>
                              </div>
                            </Sidebar>
                            <DataTable
                              value={newtimelinelist}
                              scrollable
                              showGridlines
                              scrollHeight="400px"
                            >
                              <Column
                                field="CREATEDON"
                                header="Date & Time"
                                sortable
                              ></Column>
                              <Column
                                field="LOGIN_NAME"
                                header="User"
                                body={(rowData: any) => {
                                  return (
                                    <>
                                      <p className="user_name  mb-2">
                                        {rowData.LOGIN_NAME}
                                      </p>
                                    </>
                                  );
                                }}
                              ></Column>
                              <Column
                                field="ACTION_DESC"
                                header="Action"
                                body={actionBodyTemplate}
                              ></Column>
                              <Column
                                field="STATUS_DESC"
                                header="Status"
                              ></Column>
                            </DataTable>
                          </Card>
                        )}
                      </TabPanel>
                    </TabView>
                  </div>
                </div>
                <div className="mt-2">
                  <Card className="">
                    <div className="flex flex-wrap justify-between">
                      <h6 className="Header_Text pb-2">
                        {t("Assignees")} ({technicianList?.length})
                      </h6>

                      {/* <AssignWoDialog
                      header={"Edit"}
                      cssClass={"Secondary_Button mr-2"}
                      control={control}
                      setValue={setValue}
                      register={register}
                      paragraph={""}
                      watch={watch}
                      errors={errors}
                    /> */}
                      {currentStatus < 4 &&
                        selectedDetails?.ISGENERATE === 1 &&
                        selectedDetails?.PREVIOUS_ACTION !== 134 &&
                        !MapButtons.includes(101) &&
                        technicianList?.length > 0 && (
                          <AssignWoDialog
                            header={"Edit"}
                            cssClass={"Secondary_Button mr-2"}
                            control={control}
                            setData={setValue}
                            register={register}
                            paragraph={""}
                            watch={watch}
                            errors={errors}
                            TECH_ID={"TECH_ID"}
                            AssigneeList={techList}
                            setTechList={setTechList}
                            setAssigneeTechList={setAssigneeTechList}
                            assigneeTechList={assigneeTechList}
                            setSelectedTechList={setSelectedTechList}
                            updateWoDetails={handleSubmit(updateWoDetails)}
                            selectedTechList={selectedTechList}
                            TEAM_NAME={selectedDetails?.TEAM_NAME}
                            setaddAssigneeAction={setaddAssigneeAction}
                            technicianList={technicianList}
                          />
                        )}
                    </div>

                    {technicianList?.length === 0 && (
                      <div>
                        <label className="Text_Secondary Helper_Text">
                          Team
                        </label>
                        <p className="Text_Primary Alert_Title  ">
                          {selectedDetails?.TEAM_NAME}
                        </p>
                      </div>
                    )}

                    {technicianList?.length < 0 && (
                      <div className="flex items-center mt-2 justify-center w-full">
                        <label
                          // htmlFor="dropzone-file"
                          className="flex flex-col items-center justify-center w-full h-54 border-2
                                      border-gray-200 border rounded-lg  "
                        >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <img src={noDataIcon} alt="" className="w-12" />
                            <p className="mb-2 mt-2 text-sm text-gray-500 dark:text-gray-400">
                              <span className=" Text_Primary Input_Label">
                                {t("No assignees yet")}{" "}
                              </span>
                            </p>
                            <label className="Text_Secondary Helper_Text mb-4">
                              {t(
                                "Add assignees to work on this service request."
                              )}
                            </label>

                            {/* <Buttons
                            className="Secondary_Button"
                            icon="pi pi-plus"
                            label={t("Add Assignee")}
                          /> */}
                          </div>
                        </label>
                      </div>
                    )}

                    <div className="ScrollViewAssigneeTab mt-4">
                      {technicianList?.map((tech: any, index: any) => {
                        // const data = tech?.LOGIN_NAME.split(" ");
                        // const firstLetter = data[0]?.charAt(0) || " ";
                        // const secondLetter = data[1]?.charAt(0) || " ";
                        // const initials = firstLetter + secondLetter;

                        //added by Anand 
                        const nameWithoutBrackets = tech?.LOGIN_NAME.replace(/\s*\(.*?\)\s*/g, "").trim();
                        const data = nameWithoutBrackets.split(" ");
                        const firstLetter = data[0]?.charAt(0) || " ";
                        const secondLetter = data[1]?.charAt(0) || " ";
                        const initials = firstLetter + secondLetter;

                        return (
                          <div className="mt-3" key={index}>
                            <div className="flex flex-wrap justify-between gap-3">
                              <div className="flex flex-wrap gap-3">
                                {/* <div>
                                <img src={userIcon} alt="" className="w-10" />
                              </div> */}
                                <div className="AvtarInitials">{initials}</div>
                                <div className="">
                                  <label className="Text_Primary Input_Text">
                                    {tech?.LOGIN_NAME}
                                  </label>
                                  <p className="Secondary_Primary Helper_Text">
                                    {tech?.ROLE_NAME}
                                  </p>
                                </div>
                              </div>

                              <div className="">
                                {tech?.ASSING_ROLE === "P" ? (
                                  <span
                                    style={{
                                      display: "block",
                                      backgroundColor: "#E8F7FD",
                                      borderRadius: "1rem",
                                      padding: "0.25rem",
                                      textAlign: "center",
                                      width: "120px",
                                      color: "#272B30",
                                      fontSize: "11px",
                                      fontWeight: "500",
                                      height: "25px",
                                    }}
                                  >
                                    PTW Holder
                                  </span>
                                ) : (
                                  <span
                                    style={{
                                      display: "block",
                                      backgroundColor: "#E8F7FD",
                                      borderRadius: "1rem",
                                      padding: "0.25rem",
                                      textAlign: "center",
                                      width: "120px",
                                      color: "#272B30",
                                      fontSize: "11px",
                                      fontWeight: "500",
                                      height: "25px",
                                    }}
                                  >
                                    Assignee
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {/* only display purpose please remove after development
                     condition based code written above of commented code  */}
                      {/* <div className="flex justify-start mt-2">
                      <div>
                        <img src={noDataIcon} alt="" className="w-10" />
                      </div>
                      <div className="ml-2">
                        <label className="Text_Primary Input_Text">Test</label>
                        <p className="Secondary_Primary Helper_Text">Test123</p>
                      </div>
                    </div> */}
                      {/* <div className="flex justify-start mt-2">
                      <div>
                        <img src={noDataIcon} alt="" className="w-10" />
                      </div>
                      <div className="ml-2">
                        <label className="Text_Primary Input_Text">Test</label>
                        <p className="Secondary_Primary Helper_Text">Test123</p>
                      </div>
                    </div> */}
                      {/*  */}
                    </div>
                    <Dialog
                      header=""
                      visible={visible}
                      style={{ width: "550px" }}
                      className="dialogBoxStyle"
                      onHide={() => ClosePopUp()}
                    >
                      <form>
                        <div className="grid justify-items-center mb-3">
                          <div className="">
                            {
                              <img
                                src={success}
                                alt=""
                                height={60}
                                width={60}
                              />
                            }
                          </div>
                          <div className="mt-3">
                            <h6 className="Text_Primary text-center mb-3">
                              Success!
                            </h6>
                            <p className="Input_Text text-center">
                              {paragraph}
                            </p>
                          </div>
                        </div>
                      </form>
                    </Dialog>
                  </Card>
                </div>
              </div>

              <Sidebar
                className="w-full md:w-1/3"
                position="right"
                header={customHeader}
                visible={sidebarVisible}
                onHide={() => {
                  CloseSidebarVisible();
                }}
              >
                <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2">
                  <div className="col-span-2">
                    <label className="Text_Secondary Helper_Text  ">
                      Status
                    </label>
                    {/* <p className="Menu_Active Helper_Text">
                    {selectedDetails?.SUB_STATUS_DESC}
                  </p> */}
                    <p
                      className={`Helper_Text ${selectedDetails?.SUB_STATUS_DESC === "Decline" ||
                        selectedRowData?.SUB_STATUS_DESC === "Decline"
                        ? "Open"
                        : selectedDetails?.SUB_STATUS_DESC?.includes(
                          "Approved"
                        )
                          ? "Completed"
                          : selectedDetails?.SUB_STATUS_DESC?.includes(
                            "Pending"
                          )
                            ? "Rectified"
                            : selectedDetails?.SUB_STATUS_DESC?.includes("Fail")
                              ? "Open"
                              : selectedDetails?.SUB_STATUS_DESC?.includes("Return")
                                ? "Rectified"
                                : ""
                        }`}
                    >
                      {selectedDetails?.SUB_STATUS_DESC}
                    </p>
                  </div>
                  <div>
                    <label className="Text_Secondary Helper_Text  ">
                      Requestor
                    </label>
                    <p className="Text_Primary Alert_Title">
                      {selectedDetails?.LAST_MODIFIED_BY}
                    </p>
                  </div>

                  <div>
                    <label className="Text_Secondary Helper_Text  ">
                      Request Date & Time
                    </label>
                    <p className="Text_Primary Alert_Title">
                      {/* {formateDate(WORKORDER_DETAILS?.["REQ_DATE"])} */}
                      {formateDate(selectedDetails?.LAST_MODIFIED_ON)}
                    </p>
                  </div>
                  {selectedDetails?.PREVIOUS_ACTION === 114 ||
                    selectedDetails?.PREVIOUS_ACTION === 115 ? (
                    <>
                      <div>
                        <label className="Text_Secondary Helper_Text  ">
                          Approve by
                        </label>
                        <p className="Text_Primary Alert_Title">
                          {/* {selectedDetails?.PREVIOUS_ACTION === 121 ? selectedDetails?.REQUESTED_BY : selectedDetails?.LAST_MODIFIED_BY} */}
                          {selectedDetails?.REQUESTED_BY}
                          {/* {selectedDetails?.REQUESTED_BY} */}
                        </p>
                      </div>
                      <div>
                        <label className="Text_Secondary Helper_Text  ">
                          {" "}
                          Approve Date & Time
                        </label>
                        <p className="Text_Primary Alert_Title">
                          {/* {formateDate(WORKORDER_DETAILS?.["REQ_DATE"])} */}
                          {formateDate(selectedDetails?.REQUESTED_ON)}
                        </p>
                      </div>
                    </>
                  ) : (
                    <></>
                  )}
                </div>
              </Sidebar>
            </>
          </form>

          <Dialog
            header=""
            visible={visibleSucces}
            style={{ width: "550px" }}
            className="dialogBoxStyle"
            onHide={() => ClosePopUp()}
          >
            <form>
              <div className="grid justify-items-center mb-3">
                <div className="">
                  {<img src={success} alt="" height={60} width={60} />}
                </div>
                <div className="mt-3 ">
                  <h6 className="Text_Primary text-center mb-3">Success!</h6>
                  <p className="Input_Text text-center">
                    {"This work order has been updated successfully."}
                  </p>
                </div>
              </div>
            </form>
          </Dialog>
          <Dialog
            header=""
            visible={visibleSuccesReport}
            style={{ width: "80vw" }}
            onHide={() => CloseReportPopUp()}
          >
            <>
              <PdfReport />
            </>
          </Dialog>
        </section>
      )}
    </>
  );
};

export default InfraWorkOrderForm;
