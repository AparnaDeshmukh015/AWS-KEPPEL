import { Card } from "primereact/card";
import { useEffect, useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useCountdown } from "./count";
import "../../Dashboard/Dashboard.css";
import { Tooltip } from "primereact/tooltip";
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
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { toast } from "react-toastify";
import Radio from "../../../components/Radio/Radio";
import Field from "../../../components/Field";
import InputField from "../../../components/Input/Input";
import { InputTextarea } from "primereact/inputtextarea";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import { Checkbox } from "primereact/checkbox";
import Buttons from "../../../components/Button/Button";
import SplitButton from "../../../components/SplitButton/SplitButton";
import Select from "../../../components/Dropdown/Dropdown";
import { Timeline } from "primereact/timeline";
import { dateFormat, formateDate, LOCALSTORAGE, onlyDateFormat, saveTracker } from "../../../utils/constants";
import WORedirectDialogBox from "../../../components/WorkorderDialogBox/WORedirectDialogBox";
import { Badge } from "primereact/badge";
import moment from "moment";
import { callPostAPI } from "../../../services/apis";
import { ENDPOINTS } from "../../../utils/APIEndpoints";
import DateCalendar from "../../../components/Calendar/Calendar";
import SidebarVisibal from "./SidebarVisibal";
import { v4 as uuidv4 } from "uuid";
import WorkOrderDialogBox from "../../../components/DialogBox/WorkOrderDalog";
import CountdownTimer from "./ShowCounter";

import { Dialog } from "primereact/dialog";
import LoaderS from "../../../components/Loader/Loader";
import {
  eventNotification,
  helperEventNotification,
} from "../../../utils/eventNotificationParameter";
import { appName } from "../../../utils/pagePath";
import { decryptData } from "../../../utils/encryption_decryption";
import MaterialRequestForm from "../../Inventory/MaterialRequest/MaterialRequestForm";
import { watch } from "fs";

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
}

interface TimelineEvent {
  status?: string;
  date?: string;
  icon?: string;
  color?: string;
  image?: string;
}



let WO_ID: number;
const WorkOrderDetailForm = (props: any) => {
  // let LocationDescList: any = []
  const location: any = useLocation();
  const navigate: any = useNavigate();
  const { t } = useTranslation();
  const { search } = useLocation();
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeTaskIndex, setActiveTaskIndex] = useState(0);
  let { pathname } = useLocation();
  const [, menuList]: any = useOutletContext();
  const id: any = decryptData(localStorage.getItem("USER_ID"));

  const assestTypeLabel: any = [
    { name: "Equipment", key: "A" },
    { name: "Soft Services", key: "N" },
  ];
  const partDetailsLabel: any = [
    { name: "Self", key: "S" },
    { name: "Against Work Order", key: "A" },
  ];
  const currentMenu = menuList
    ?.flatMap((menu: any) => menu?.DETAIL)
    .filter((detail: any) => detail.URL === pathname)[0];
  const [masterListOption, setMasterListOption] = useState<any | null>([]);
  const [docOption, setDocOption] = useState<any | null>([]);
  const [selectedDetails, setSelectedDetails] = useState<any>([]);
  const [technicianList, setTechnicianList] = useState<any | null>([]);
  const [ReassignList, setReassignList] = useState<any | null>([]);
  const [timelineList, setTimelineList] = useState<any | null>([]);
  const [taskList, setTaskList] = useState<any | null>([]);
  const [EditTaskList, setEditTaskList] = useState<any | null>([]);
  const [assetDocList, setAssetDocList] = useState<any | null>([]);
  const [locationStatus, setLocationStatus] = useState<any | null>(false);
  const [options, setOptions] = useState<any | null>([]);
  const [loading, setLoading] = useState<any | null>(false);
  const [status, setStatus] = useState<any | null>(false);
  const [currentStatus, setCurrentStatus] = useState<any | null>();
  const [sigPad, setSigpad] = useState<any | null>();
  const [selectedParts, setSelectedParts] = useState<any | null>([]);
  const [IsVisibleMaterialReqSideBar, setVisibleMaterialReqSideBar] = useState<boolean>(false);
  const [partOptions, setPartOptions] = useState<any | null>([]);
  const [materiallist, setMaterialRequest] = useState<any | null>([]);
  const [CheckPartOptionsList, setCheckPartOptionsList] = useState<any | null>(
    []
  );

  const [partMatOptions, setMaterialPartOptions] = useState<any | null>([]);
  let [imgSrc, setImgSrc] = useState<any | null>();
  const [subStatus, setSubStatus] = useState<any | null>();
  const [approvalStatus, setApprovalStatus] = useState<any | null>(false);
  const [editStatus, setEditStatus] = useState<any | null>(false);
  const [userId, setUserId] = useState<any | null>();

  let [locationtypeOptions, setlocationtypeOptions] = useState([]);
  const [EquipmentGroup, setEquipmentGroup] = useState<any | null>([]);
  const [type, setType] = useState<any | null>([]);
  const [assetList, setAssetList] = useState<any | null>([]);
  const [ownLeasedStatus, setOwnLeasedStatus] = useState<any | null>(null)
  const [reassignVisible, setReassignVisible] = useState<boolean>(false);
  const [dateTimeAfterThreeDays, setDateTimeAfterThreeDays] = useState<
    number | null
  >(null);
  const [visibleImage, setVisibleImage] = useState<boolean>(false);
  const [ViewAddTask, SetViewAddTask] = useState<boolean>(false);
  const [locationID, setLocationID] = useState()
  const [showImage, setShowImage] = useState<any>([]);
  const [MATERIAL_LIST, setMaterialList] = useState<any>([]);
  const [showReassingList, setShowReassingList] = useState<any | null>(true);
  const [IsSubmit, setIsSubmit] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<any | null>("")
  const [issueList, setIssueList] = useState<any | null>([])
  const [groupStatus, setGroupStatus] = useState<any | null>(false)
  const onCategoryChange = (e: any) => {
    const updatedTasklistOptions = taskList?.map((task: any, index: any) => {
      if (index === e.value) {
        task.isChecked = e.checked === true ? 1 : 0;
      }
      return task;
    });

    setTaskList(updatedTasklistOptions);
    setEditTaskList(updatedTasklistOptions);
    setValue("TASKDETAILS", updatedTasklistOptions);
  };

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
      TECH_ID: 0,
      ASSETTYPE_ID: "",
      ASSETGROUP_ID: "",
      LAST_MAINTANCE_DATE: "",
      WARRANTY_END_DATE: "",
    },
    mode: "all",
  });
  const partWatch: any = watch("PARTS_TYPE");
  const partListWatch: any = watch("PART_LIST");
  const { fields, append } = useFieldArray({
    name: "TASKDETAILS",
    control,
  });

  const ASSET_NONASSET: any = watch("ASSET_NONASSET");
  const doclistWatch: any = watch("DOC_LIST");
  const watchAll: any = watch();
  const SAMPEL_FACILITY: any = localStorage.getItem("FACILITYID");
  const FACILITY: any = JSON.parse(SAMPEL_FACILITY);

  const eventNotification = async () => {
    const payload: any = { WO_ID: localStorage.getItem("WO_ID") };

    try {
      const res: any = await callPostAPI(
        ENDPOINTS.GET_WORKORDER_DETAILS,
        payload,
        "HD001"
      );

      if (res?.FLAG === 1) {
        const notifcation: any = {
          FUNCTION_CODE: currentMenu?.FUNCTION_CODE,
          WO_NO: res?.WORKORDERDETAILS[0]?.WO_NO,

          EVENT_TYPE: "W",
          STATUS_CODE: res?.WORKORDERDETAILS[0]?.CURRENT_STATUS,
          PARA1:
            search === "?edit="
              ? decryptData(localStorage.getItem("USER_NAME"))
              : decryptData(localStorage.getItem("USER_NAME")),
          PARA2: res?.WORKORDERDETAILS[0]?.WO_NO,
          PARA3:
            res?.WORKORDERDETAILS[0]?.WO_DATE === null ? ""
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
          PARA16: res?.WORKORDERDETAILS[0]?.ATTENDED_BY_NAME,
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

        helperEventNotification(eventPayload);
      }
    } catch (error: any) {

    }

  }
  const handlingStatus = async (
    e: any,
    REMARK: string | undefined,
    statusCode?: any,
    type?: any,
    REASON_ID?: any,
    sigPad?: any,
    VERIFY_BY?: any,
    RECT_ID?: any
  ) => {

    let isValid: any = true;
    let eventType: any = "";
    let eventPara: any = "";
    let TYPE: any = "";
    if (REMARK === "CANCELLED" || type === "") {
      eventType = "CANCELLED";
      eventPara = { para1: `Redirect Request`, para2: "Cancelled" };
    } else if (REMARK === "APPROVE" || type === "") {
      eventType = "APPROVE";
      eventPara = { para1: `Redirect Request`, para2: "Approved" };
      setApprovalStatus(false);
    } else if (REMARK === "Acknowledge" || type === "") {
      eventType = "ATT";
      TYPE = "34";
      eventPara = { para1: `Work order`, para2: "Acknowledged" };
    } else if (REMARK === "WIP" || type === "") {
      eventType = "ATT";
      eventPara = { para1: `Work order`, para2: "is in Progress" };
    } else if (id === "CANCEL" || type === "CANCEL") {
      eventType = "CANCEL";
      eventPara = { para1: `Work order`, para2: "Cancelled" };
    } else if (id === "RCT" || type === "RCT") {
      eventType = "RCT";

      eventPara = { para1: `Work order`, para2: "Rectified" };
    } else if (id === "onHold" || type === "HOLD") {
      eventType = "HOLD";
      eventPara = { para1: `Work order`, para2: "status Changed on hold" };
    } else if (id === "Complete" || type === "Complete") {
      if (sigPad !== "") {
        eventType = "COMP";
        eventPara = { para1: `Work order`, para2: "Completed" };
        isValid = true;
      } else {
        isValid = false;
        toast.error("Please select digital signature ");
      }
    }
    if (REMARK === "CONTINUE" || type === "CONTINUE") {
      eventType = "CONTINUE";
      eventPara = { para1: `Work order`, para2: "status Changed work in progress" };
    }

    const data = sigPad;

    const result: any = data?.split("image/png;base64,")[1];

    const payloadDoc: any = {
      DOC_SRNO: 1,
      DOC_NAME: "Digital_Sign" + WO_ID,
      DOC_DATA: result,
      DOC_EXTENTION: "image/png",
      DOC_SYS_NAME: uuidv4(),
      ISDELETE: false,
      DOC_TYPE: "D",
    };


    let docfilterList: any = [];
    if (doclistWatch.length > 0) {
      docfilterList = doclistWatch?.filter(
        (doc: any) => (doc.UPLOAD_TYPE == "A" || doc.UPLOAD_TYPE == "B")
      );
    }
    const payload: any = {
      ACTIVE: 1,
      WO_ID: selectedDetails?.WO_ID,
      WO_NO: selectedDetails?.WO_NO,
      MATREQ_NO: props?.selectedData?.MATREQ_NO,
      MODE: "A",
      EVENT_TYPE: eventType,
      REMARKS: REMARK,
      SUB_STATUS: statusCode,
      DOC_LIST: currentStatus === 4 ? [payloadDoc] : docfilterList,
      DOC_DATE: moment(new Date()).format("DD-MM-YYYY"),
      REASON_ID: selectedDetails?.REASON_ID,
      TYPE: TYPE,
      PARA: eventPara,
      APPROVAL_TYPE: "R",
      VERIFY_BY: selectedDetails?.VERIFY_BY,
      REASSIGN_TYPE: currentStatus === 1 ? 'B' : '',
      RECT_ID: selectedDetails?.RECT_ID
    };

    if (isValid === true) {
      const res = await callPostAPI(ENDPOINTS.SET_WORKSTATUS_Api, payload, "HD001");
      setValue("TASK_NAME", "")
      if (res.FLAG === true) {
        toast.success(res?.MSG);
        getOptionDetails(WO_ID);
        eventNotification()
          
        props?.getAPI();
        window.location.reload();
        if (id === "CANCEL") {
          getOptionDetails(WO_ID);
          props?.isClick();
        }
      }
    }
  };

  // function getCountdown() {

  //   const date = new Date(
  //     currentStatus === 3
  //       ? selectedDetails?.RECTIFIED_WITHIN
  //       : selectedDetails?.ACKNOWLEDGED_WITHIN
  //   ); // some mock date

  //   var milliseconds = date!.getTime();

  //   // const THREE_DAYS_IN_MS = 3 * 24 * 60 * 60 * 1000;
  //   //const NOW_IN_MS = new Date().getTime();
  //   const NOW_IN_MS = new Date(selectedDetails?.CURRUENT_TIME).getTime();

  //   const gettime = NOW_IN_MS - milliseconds;
  //   const finalTime = NOW_IN_MS - (gettime + 53000);

  //   setDateTimeAfterThreeDays(finalTime);
  // }

  function getCountdown() {

    const date =
      currentStatus === 3
        ? selectedDetails?.RECTIFIED_WITHIN_MS
        : selectedDetails?.ACKNOWLEDGED_WITHIN_MS
    // some mock date

    // var milliseconds = date!.getTime();

    // const THREE_DAYS_IN_MS = 3 * 24 * 60 * 60 * 1000;
    //const NOW_IN_MS = new Date().getTime();
    const NOW_IN_MS = selectedDetails?.CURRENT_TIME_MS

    const gettime = NOW_IN_MS - date;
    const finalTime = NOW_IN_MS - gettime;

    setDateTimeAfterThreeDays(finalTime);
  }

  const initialTime = selectedDetails?.CURRUENT_TIME !== null ? new Date(selectedDetails.CURRUENT_TIME) : new Date();
  const [currentDate, setCurrentDate] = useState<any>(new Date());


  const isOverdue = (date: string | null) => new Date(date ?? '') < currentDate;

  // Utility function to check if the date is upcoming
  const isUpcoming = (date: string | null) => new Date(date ?? '') > currentDate;

  const getStatus = () => {
    if (currentStatus === 1) {

      // For ACKNOWLEDGED_WITHIN
      if (selectedDetails?.ACKNOWLEDGED_WITHIN !== null) {
        if (isOverdue(selectedDetails.ACKNOWLEDGED_WITHIN)) {
          return "Overdue";
        } else if (isUpcoming(selectedDetails.ACKNOWLEDGED_WITHIN)) {
          return "";
        } else {
          return "NA";
        }
      }
    } else if (currentStatus === 3) {
      // For RECTIFIED_WITHIN
      if (selectedDetails?.RECTIFIED_WITHIN !== null) {
        if (isOverdue(selectedDetails.RECTIFIED_WITHIN)) {
          return "Overdue";
        } else if (isUpcoming(selectedDetails.RECTIFIED_WITHIN)) {
          return "";
        } else {
          return "NA";
        }
      }
    }

    return "NA"; // Default case for other statuses
  };



  useEffect(() => {
    if (
      selectedDetails?.RECTIFIED_WITHIN !== undefined ||
      selectedDetails?.ACKNOWLEDGED_WITHIN !== undefined
    ) {
      if (
        selectedDetails?.RECTIFIED_WITHIN !== null ||
        selectedDetails?.ACKNOWLEDGED_WITHIN !== null
      ) {
        getCountdown();
      }
    }
  }, [selectedDetails?.RECTIFIED_WITHIN, selectedDetails?.ACKNOWLEDGED_WITHIN]);

  const convertDateFormat = (dateString: any) => {
    const date = moment(dateString, `${dateFormat()}${","}HH:mm A`);

    // Format in 24-hour format and get AM/PM
    const formatted = date.format(`${dateFormat()}${","}HH:mm A`) + ' ' + (date.hour() >= 12 ? 'PM' : 'AM');
    return formatted
  }

  const StatusEvents = [
    {
      id: 1,
      title: "Open",
      date:
        selectedDetails?.REPORTED_AT === null
          ? ""
          //  : convertDateFormat(selectedDetails?.REPORTED_AT),
          : formateDate(selectedDetails?.REPORTED_AT),
      status: currentStatus === 1 ? true : false,
      progress: true,
    },
    {
      id: 3,
      title: "In Progress",
      date:
        currentStatus === 1
          ? null
          : selectedDetails?.ATTEND_AT == null
            ? ""
            // :selectedDetails?.ATTEND_AT,
            : formateDate(selectedDetails?.ATTEND_AT),
      status: currentStatus === 3 ? true : false,
      progress: true,
    },
    {
      id: 5,
      title: "On Hold",
      date:
        currentStatus !== 5
          ? null
          : selectedDetails?.ONHOLD_AT == null
            ? ""
            // :selectedDetails?.ONHOLD_AT,
            : formateDate(selectedDetails?.ONHOLD_AT),
      status: currentStatus === 5 ? true : false,
      progress: true,
    },
    {
      id: 4,
      title: "Rectified",
      date:
        selectedDetails?.RECTIFIED_AT == null
          ? ""
          // :selectedDetails?.RECTIFIED_AT,
          : formateDate(selectedDetails?.RECTIFIED_AT),
      status: currentStatus === 4 ? true : false,
      progress: true,
    },
    {
      id: 7,
      title: "Completed",
      date:
        selectedDetails?.COMPLETED_AT === null
          ? ""
          // : selectedDetails?.COMPLETED_AT,
          : formateDate(selectedDetails?.COMPLETED_AT),
      status: currentStatus === 7 ? true : false,
      progress: false,
    },
    {
      id: 6,
      title: "Cancelled",
      date:
        currentStatus >= 6
          ? selectedDetails?.CANCELLED_AT == null
            ? ""
            // : selectedDetails?.CANCELLED_AT
            : formateDate(selectedDetails?.CANCELLED_AT)
          : "",
      status: currentStatus === 6 ? true : false,
      progress: false,
    },
  ];


  useEffect(() => {

    if (location?.state !== null) {
      getOptionDetails(location?.state);
    }
  }, [location?.state]);

  const customizedMarker = (item: TimelineEvent) => {
    return (
      <span
        className="flex w-2rem h-2rem align-items-center justify-content-center  border-circle z-1 shadow-1"
        style={{ color: item.date ? "#55A629" : "#7E8083" }}
      >
        <i
          className={`pi ${item.status ? "pi-circle-fill" : "pi-circle"} `}
        ></i>
      </span>
    );
  };

  const formatServiceRequestList = (list: any,) => {
    const DATE_FORMAT = `${dateFormat()}, HH:mm`;


    let WORK_ORDER_LIST = list;

    WORK_ORDER_LIST = WORK_ORDER_LIST.map((element: any) => {

      return {
        ...element,
        // ACKNOWLEDGED_WITHIN: "2024-11-05T02:28:20.1258664+00:00",
        //CURRENT_DATE: "2024-11-05T02:20:10.1258664+00:00"

      };
    });
    return WORK_ORDER_LIST;
  };

  const getOptionDetails = async (WO_ID: any, reponseData?: any) => {
    const payload: any = { WO_ID: localStorage.getItem("WO_ID") };
    setLoading(true)
    try {
      let res: any = await callPostAPI(
        ENDPOINTS.GET_WORKORDER_DETAILS,
        payload,
        "HD001"
      );

      if (res?.FLAG === 1) {

        if (locationStatus === false) {
          const res1 = await callPostAPI(ENDPOINTS.LOCATION_HIERARCHY_LIST, null, "HD001");

          if (res1?.FLAG === 1) {
            setlocationtypeOptions(res1?.LOCATIONHIERARCHYLIST);
          }
        }
        // getRequestList(res?.WORKORDERDETAILS[0]?.ASSETGROUP_ID, res?.WORKORDERDETAILS[0]?.ASSET_NONASSET,res?.WORKORDERDETAILS[0]?.REQ_ID )
        if (res?.WORKORDERDETAILS[0]?.CURRENT_STATUS === 1 || res?.WORKORDERDETAILS[0]?.CURRENT_STATUS === 3) {
          try {
            const payload: any = {
              ASSETGROUP_ID: res?.WORKORDERDETAILS[0]?.ASSETGROUP_ID,
              ASSET_NONASSET: res?.WORKORDERDETAILS[0]?.ASSET_NONASSET
            };

            const res1 = await callPostAPI(
              ENDPOINTS.GET_SERVICEREQUEST_WORKORDER,
              payload, null
            );

            if (res?.FLAG === 1) {
              setIssueList(res1?.WOREQLIST)

            } else {
              setIssueList(res1?.WOREQLIST)
            }
          } catch (error: any) {

          } finally {

          }
        }

        setDocOption(res?.WORKORDERDOCLIST);
        setTechnicianList(res?.ASSIGNTECHLIST);
        setTimelineList(res?.ACTIVITYTIMELINELIST);
        setAssetDocList(res?.ASSETDOCLIST);
        const updatedServiceRequestList: any = formatServiceRequestList(res?.WORKORDERDETAILS);
        setSelectedDetails(updatedServiceRequestList[0]);

        setStatus(res?.WORKORDERDETAILS[0]?.STATUS_DESC);
        setCurrentStatus(res?.WORKORDERDETAILS[0]?.CURRENT_STATUS);
        setValue("WORK_ORDER_NO", res?.WORKORDERDETAILS[0]?.WO_NO);
        setValue("WO_TYPE", res?.WORKORDERDETAILS[0]?.WO_TYPE);
        setValue("RAISED_BY", res?.WORKORDERDETAILS[0]?.USER_NAME);
        setValue("LOCATION_NAME", res?.WORKORDERDETAILS[0]?.LOCATION_NAME);
        setValue("LOCATION_DESCRIPTION", res?.WORKORDERDETAILS[0]?.LOCATION_DESCRIPTION);

        setValue(
          "WO_DATE",
          moment(res?.WORKORDERDETAILS[0]?.WO_DATE).format(dateFormat())
        );
        setValue("DOC_LIST", res?.WORKORDERDOCLIST);

        setOptions({
          assetGroup: reponseData?.ASSETGROUPLIST?.filter(
            (f: any) =>
              f.ASSETGROUP_TYPE === res?.WORKORDERDETAILS[0]?.ASSET_NONASSET
          ),
          assetType: reponseData?.ASSETTYPELIST,
          assestOptions: reponseData?.ASSETLIST,
          teamList: reponseData?.TEAMLIST,
          vendorList: reponseData?.VENDORLISTLIST,
          technicianList: reponseData?.USERLIST,
          statusList: reponseData?.STATUSLIST,
          reasonList: reponseData?.REASONLIST,
        });
        setEquipmentGroup(
          reponseData?.ASSETGROUPLIST?.filter(
            (f: any) =>
              f.ASSETGROUP_TYPE === res?.WORKORDERDETAILS[0]?.ASSET_NONASSET
          )
        );

        setValue("REQ_DESC", res?.WORKORDERDETAILS[0]?.REQ_DESC);
        setValue("WO_REMARKS", res?.WORKORDERDETAILS[0]?.WO_REMARKS);
        setValue("SEVERITY_DESC", res?.WORKORDERDETAILS[0]?.SEVERITY_DESC);
        setValue("TEAM_NAME", res?.WORKORDERDETAILS[0]?.TEAM_NAME);
        setValue("ASSET_NAME", res?.WORKORDERDETAILS[0]?.ASSET_NAME);
        setValue("TECH_NAME", res?.WORKORDERDETAILS[0]?.TECH_NAME);
        setValue("DOC_LIST", res?.WORKORDERDOCLIST);
        setValue("ASSET_NONASSET", res?.WORKORDERDETAILS[0]?.ASSET_NONASSET);
        setValue("ASSETGROUP_NAME", res?.WORKORDERDETAILS[0]?.ASSETGROUP_NAME);
        setValue("ASSETTYPE_NAME", res?.WORKORDERDETAILS[0]?.ASSETTYPE_NAME);
        let req = res?.WORKORDERDETAILS[0]?.REQ_ID
        setValue("REQ_ID", req);
        getTaskList(
          res?.WORKORDERDETAILS[0]?.ASSETTYPE_ID,
          res?.WORKORDERDETAILS[0]?.WO_ID,
          res?.WORKORDERTASKLIST
        );

        setSubStatus(res?.WORKORDERDETAILS[0]?.SUB_STATUS);

        if (
          (res?.WORKORDERDETAILS[0]?.CURRENT_STATUS === 5 &&
            decryptData(localStorage.getItem("ROLETYPECODE")) === "SA") ||
          decryptData(localStorage.getItem("ROLETYPECODE")) === "S" ||
          decryptData(localStorage.getItem("ROLETYPECODE")) === "BM" ||
          decryptData(localStorage.getItem("ROLETYPECODE")) === "SM" ||
          decryptData(localStorage.getItem("ROLETYPECODE")) === "SA" ||
          decryptData(localStorage.getItem("ROLETYPECODE")) === "S" ||
          decryptData(localStorage.getItem("ROLETYPECODE")) === "BM" ||
          decryptData(localStorage.getItem("ROLETYPECODE")) === "SM"
        ) {
          setApprovalStatus(true);
        }
        const docData: any =
          "data:image/png;base64," + res?.DIGITALSIGNATURE[0]?.DOC_DATA;

        setImgSrc(docData);

        if (res?.WORKORDERDETAILS[0]?.CURRENT_STATUS >= 3) {
          const payload: any = {
            MATREQ_ID: res?.WORKORDERDETAILS[0]?.MATREQ_ID,
            MATREQ_NO: res?.WORKORDERDETAILS[0]?.MATREQ_NO,
            WO_ID: WO_ID,
            TYPE: "W",
          };
          try {
            const res1 = await callPostAPI(
              ENDPOINTS.GET_MATERIAL_REQUISITION_DETAILS,
              payload,
              "HD001"
            );
            let PART_LIST = res1?.PARTLIST;
            let SAMPEL_PART_LIST = res1?.PARTLIST;

            let MAT_REQUISITION_DETAILS = res1?.MATREQUISITIONDETAILS.map(
              (item: any) => ({
                ...item,
                MATREQ_NO: res1?.MATREQUISITIONDETAILS[0]?.MATREQ_NO,
              })
            );

            let CHECK_PART_LIST = [];
            for (let i = 0; i < SAMPEL_PART_LIST.length; i++) {
              const item = SAMPEL_PART_LIST[i];
              if (item.STATUS !== 8) {
                CHECK_PART_LIST.push(item);
              }
            }

            setMaterialPartOptions(PART_LIST);
            setMaterialRequest(MAT_REQUISITION_DETAILS);
            setCheckPartOptionsList(CHECK_PART_LIST);
            setLoading(false);
          } catch (error: any) {
            toast.error(error);
          } finally {
            setLoading(false)
          }
        }
      } else {
        setLoading(false);
      }
    } catch (error: any) {
      toast.error(error);
      setLoading(false);
      // toast.error(error)
    } finally {
      setLoading(false);
    }
  };



  const getOptionDetailsOverdue = async (WO_ID: any, reponseData?: any) => {
    const payload: any = { WO_ID: WO_ID == null ? localStorage.getItem("WO_ID") : WO_ID };
    // setLoading(true)
    try {
      let res: any = await callPostAPI(
        ENDPOINTS.GET_WORKORDER_DETAILS,
        payload,
        "HD001"
      );

      if (res?.FLAG === 1) {
        // getRequestList(res?.WORKORDERDETAILS[0]?.ASSETGROUP_ID, res?.WORKORDERDETAILS[0]?.ASSET_NONASSET,res?.WORKORDERDETAILS[0]?.REQ_ID )
        if (res?.WORKORDERDETAILS[0]?.CURRENT_STATUS === 1 || res?.WORKORDERDETAILS[0]?.CURRENT_STATUS === 3) {
          try {
            const payload: any = {
              ASSETGROUP_ID: res?.WORKORDERDETAILS[0]?.ASSETGROUP_ID,
              ASSET_NONASSET: res?.WORKORDERDETAILS[0]?.ASSET_NONASSET
            };

            const res1 = await callPostAPI(
              ENDPOINTS.GET_SERVICEREQUEST_WORKORDER,
              payload, null
            );

            if (res?.FLAG === 1) {
              setIssueList(res1?.WOREQLIST)

            } else {
              setIssueList(res1?.WOREQLIST)
            }
          } catch (error: any) {

          } finally {

          }
        }

        setDocOption(res?.WORKORDERDOCLIST);
        setTechnicianList(res?.ASSIGNTECHLIST);
        setTimelineList(res?.ACTIVITYTIMELINELIST);
        setAssetDocList(res?.ASSETDOCLIST);
        const updatedServiceRequestList: any = formatServiceRequestList(res?.WORKORDERDETAILS);
        setSelectedDetails(updatedServiceRequestList[0]);

        setStatus(res?.WORKORDERDETAILS[0]?.STATUS_DESC);
        setCurrentStatus(res?.WORKORDERDETAILS[0]?.CURRENT_STATUS);
        setValue("WORK_ORDER_NO", res?.WORKORDERDETAILS[0]?.WO_NO);
        setValue("WO_TYPE", res?.WORKORDERDETAILS[0]?.WO_TYPE);
        setValue("RAISED_BY", res?.WORKORDERDETAILS[0]?.USER_NAME);
        setValue("LOCATION_NAME", res?.WORKORDERDETAILS[0]?.LOCATION_NAME);
        setValue("LOCATION_DESCRIPTION", res?.WORKORDERDETAILS[0]?.LOCATION_DESCRIPTION);

        setValue(
          "WO_DATE",
          moment(res?.WORKORDERDETAILS[0]?.WO_DATE).format(dateFormat())
        );
        setValue("DOC_LIST", res?.WORKORDERDOCLIST);

        setOptions({
          assetGroup: reponseData?.ASSETGROUPLIST?.filter(
            (f: any) =>
              f.ASSETGROUP_TYPE === res?.WORKORDERDETAILS[0]?.ASSET_NONASSET
          ),
          assetType: reponseData?.ASSETTYPELIST,
          assestOptions: reponseData?.ASSETLIST,
          teamList: reponseData?.TEAMLIST,
          vendorList: reponseData?.VENDORLISTLIST,
          technicianList: reponseData?.USERLIST,
          statusList: reponseData?.STATUSLIST,
          reasonList: reponseData?.REASONLIST,
        });
        setEquipmentGroup(
          reponseData?.ASSETGROUPLIST?.filter(
            (f: any) =>
              f.ASSETGROUP_TYPE === res?.WORKORDERDETAILS[0]?.ASSET_NONASSET
          )
        );
        // if()

        setValue("REQ_DESC", res?.WORKORDERDETAILS[0]?.REQ_DESC);
        setValue("WO_REMARKS", res?.WORKORDERDETAILS[0]?.WO_REMARKS);
        setValue("SEVERITY_DESC", res?.WORKORDERDETAILS[0]?.SEVERITY_DESC);
        setValue("TEAM_NAME", res?.WORKORDERDETAILS[0]?.TEAM_NAME);
        setValue("ASSET_NAME", res?.WORKORDERDETAILS[0]?.ASSET_NAME);
        setValue("TECH_NAME", res?.WORKORDERDETAILS[0]?.TECH_NAME);
        setValue("DOC_LIST", res?.WORKORDERDOCLIST);
        setValue("ASSET_NONASSET", res?.WORKORDERDETAILS[0]?.ASSET_NONASSET);
        setValue("ASSETGROUP_NAME", res?.WORKORDERDETAILS[0]?.ASSETGROUP_NAME);
        setValue("ASSETTYPE_NAME", res?.WORKORDERDETAILS[0]?.ASSETTYPE_NAME);
        let req = res?.WORKORDERDETAILS[0]?.REQ_ID
        setValue("REQ_ID", req);
        getTaskList(
          res?.WORKORDERDETAILS[0]?.ASSETTYPE_ID,
          res?.WORKORDERDETAILS[0]?.WO_ID,
          res?.WORKORDERTASKLIST
        );

        setSubStatus(res?.WORKORDERDETAILS[0]?.SUB_STATUS);

        if (
          (res?.WORKORDERDETAILS[0]?.CURRENT_STATUS === 5 &&
            decryptData(localStorage.getItem("ROLETYPECODE")) === "SA") ||
          decryptData(localStorage.getItem("ROLETYPECODE")) === "S" ||
          decryptData(localStorage.getItem("ROLETYPECODE")) === "BM" ||
          decryptData(localStorage.getItem("ROLETYPECODE")) === "SM" ||
          decryptData(localStorage.getItem("ROLETYPECODE")) === "SA" ||
          decryptData(localStorage.getItem("ROLETYPECODE")) === "S" ||
          decryptData(localStorage.getItem("ROLETYPECODE")) === "BM" ||
          decryptData(localStorage.getItem("ROLETYPECODE")) === "SM"
        ) {
          setApprovalStatus(true);
        }
        const docData: any =
          "data:image/png;base64," + res?.DIGITALSIGNATURE[0]?.DOC_DATA;

        setImgSrc(docData);

        if (res?.WORKORDERDETAILS[0]?.CURRENT_STATUS >= 3) {
          const payload: any = {
            MATREQ_ID: res?.WORKORDERDETAILS[0]?.MATREQ_ID,
            MATREQ_NO: res?.WORKORDERDETAILS[0]?.MATREQ_NO,
            WO_ID: WO_ID,
            TYPE: "W",
          };
          try {
            const res1 = await callPostAPI(
              ENDPOINTS.GET_MATERIAL_REQUISITION_DETAILS,
              payload,
              "HD001"
            );
            let PART_LIST = res1?.PARTLIST;
            let SAMPEL_PART_LIST = res1?.PARTLIST;

            let MAT_REQUISITION_DETAILS = res1?.MATREQUISITIONDETAILS.map(
              (item: any) => ({
                ...item,
                MATREQ_NO: res1?.MATREQUISITIONDETAILS[0]?.MATREQ_NO,
              })
            );

            let CHECK_PART_LIST = [];
            for (let i = 0; i < SAMPEL_PART_LIST.length; i++) {
              const item = SAMPEL_PART_LIST[i];
              if (item.STATUS !== 8) {
                CHECK_PART_LIST.push(item);
              }
            }

            setMaterialPartOptions(PART_LIST);
            setMaterialRequest(MAT_REQUISITION_DETAILS);
            setCheckPartOptionsList(CHECK_PART_LIST);
            setLoading(false);
          } catch (error: any) {
            toast.error(error);
          } finally {
            setLoading(false)
          }
        }
      } else {
        setLoading(false);
      }
    } catch (error: any) {
      toast.error(error);
      setLoading(false);
      // toast.error(error)
    } finally {
      setLoading(false);
    }
  };
  //taskList

  const getTaskList = async (
    ASSETTYPE_ID: any,
    WO_ID: any,
    WORKORDERTASKLIST: any
  ) => {

    const payload = {
      ASSETTYPE_ID: ASSETTYPE_ID,
      WO_ID: WO_ID,
    };

    try {
      const res = await callPostAPI(ENDPOINTS.TASK_LIST, payload, "HD001");
      // if (res?.FLAG === 1) {

      if (WORKORDERTASKLIST?.length > 0) {
        const workOrderTaskMap = WORKORDERTASKLIST.reduce(
          (map: any, task: any) => {
            if (task?.TASK_ID === 0 || task.isChecked === 1) {
              map[task.TASK_ID] = task.isChecked;
            }
            return map;
          },
          {}
        );

        const updatedTaskList = [
          ...res?.TASKLIST?.map((task: any) => ({
            ...task,
            isChecked: workOrderTaskMap.hasOwnProperty(task.TASK_ID)
              ? workOrderTaskMap[task.TASK_ID]
              : task.isChecked,
          })),
          ...WORKORDERTASKLIST.filter(
            (task: any) => task.TASK_ID === 0 || task.isChecked === 1
          )
            .filter(
              (task: any) =>
                !res?.TASKLIST?.some((t: any) => t.TASK_ID === task?.TASK_ID)
            )
            .map((task: any) => ({
              TASK_ID: task?.TASK_ID,
              TASK_NAME: task?.TASK_DESC,
              FACILITY_ID: task?.FACILITY_ID,
              ASSETTYPE_ID: task?.ASSETTYPE_ID,
              ACTIVE: true,
              isChecked: task.isChecked,
            })),
        ];

        setTaskList(updatedTaskList);
        setEditTaskList(updatedTaskList)
      } else {
        setTaskList(res?.TASKLIST);
        setEditTaskList(res?.TASKLIST);
      }

    } catch (error: any) {
      toast.error(error);
    }
  };

  useEffect(() => {
    setEquipmentGroup(options?.assetGroup);

    setValue("REQ_ID", "")
    if (watchAll?.ASSETGROUP_ID) {
      const assetGroupId: any = watchAll?.ASSETGROUP_ID?.ASSETGROUP_ID
        ? watchAll?.ASSETGROUP_ID?.ASSETGROUP_ID
        : watchAll?.ASSETGROUP_ID?.ASSETGROUP_ID;
      const assetTypeList: any = options?.assetType?.filter(
        (f: any) => f?.ASSETGROUP_ID === assetGroupId
      );
      setType(assetTypeList);

      const issue: any = issueList?.filter(
        (f: any) => f?.REQ_ID === f?.REQ_ID
      );
      setIssueList(issueList);
      setValue("REQ_ID", watchAll?.REQ_ID)
      //getRequestList(watchAll?.ASSETGROUP_ID?.ASSETGROUP_ID, watchAll?.ASSETGROUP_ID?.ASSETGROUP_TYPE )

    }
  }, [watchAll?.ASSETGROUP_ID]);

  useEffect(() => {
    if (watchAll?.ASSETTYPE_ID) {
      const assetTypeId = watchAll?.ASSETTYPE_ID?.ASSETTYPE_ID
        ? watchAll?.ASSETTYPE_ID?.ASSETTYPE_ID
        : watchAll?.ASSETTYPE_ID?.ASSETTYPE_ID;
      const assetList: any = options?.assestOptions?.filter(
        (f: any) => f.ASSETTYPE_ID === assetTypeId
      );

      setAssetList(assetList);


    }
  }, [watchAll?.ASSETTYPE_ID]);

  const getOptions = async () => {
    // setLoading(true);
    try {
      const res = await callPostAPI(ENDPOINTS.GET_SERVICEREQUST_MASTERLIST, {
        WO_ID: WO_ID
      }, "HD001");
      // const res1 = await callPostAPI(ENDPOINTS.LOCATION_HIERARCHY_LIST, null, "HD001");

      if (res?.FLAG === 1) {
        // setlocationtypeOptions(res1?.LOCATIONHIERARCHYLIST);
        setMasterListOption(res);
      }

      setUserId(parseInt(id));
      if (search === "?edit=") {
        let WO_ID = localStorage.getItem("WO_ID");
        getOptionDetails(WO_ID, res);
      }

    } catch (error: any) {
      toast.error(error);
    }
  };

  useEffect(() => {
    saveTracker(currentMenu);
  }, []);

  useEffect(() => {
    let id: any = localStorage.getItem("WO_ID")
    WO_ID = parseInt(id);
    if (WO_ID !== undefined) {
      sessionStorage.setItem("WO_ID", WO_ID.toString());
    }
    WO_ID = parseInt(sessionStorage.getItem("WO_ID")!);
    getOptions();


  }, []);

  useEffect(() => {
    const location: any = locationtypeOptions?.filter((f: any) => f.LOCATION_ID === f.LOCATION_ID)
    setlocationtypeOptions(location)
  }, [locationStatus])

  function OpenLocationDropDown() {
    if (locationStatus === true) {
      setLocationStatus(false);
    } else if (locationStatus === false) {
      setLocationStatus(true);
    }

  };

  const OpenEditStatusDropDown = () => {

    if (editStatus === true) {

      setValue("ASSETGROUP_ID", selectedDetails?.ASSETGROUP_ID)
      setGroupStatus(false)
      setEditStatus(false);
      setValue('TECH_ID', '')
      setTaskList(EditTaskList)
    } else if (editStatus === false) {
      setGroupStatus(true)
      setEditStatus(true);
      setTaskList(EditTaskList)
    }
  };
  useEffect(() => {
    if (editStatus) {
      const group: any = EquipmentGroup?.filter((f: any) => f?.ASSETGROUP_ID === f?.ASSETGROUP_ID)
      setEquipmentGroup(group)
    }
  }, [editStatus])

  const onSubmit = async (payload: any, e: any) => {
    setIsSubmit(true);

    const buttonMode: any = e?.nativeEvent?.submitter?.name;
    payload.ACTIVE = 1;
    delete payload?.ASSETGROUP_NAME;
    delete payload?.ASSETTYPE;
    delete payload?.ASSETTYPE_NAME;
    delete payload?.LOCATION_NAME;
    delete payload?.SEVERITY_DESC;
    delete payload?.PART_LIST;
    delete payload?.PARTS_TYPE;
    delete payload?.ASSET_NAME;
    delete payload?.TEAM_NAME;
    delete payload?.TASK_DES;
    delete payload?.TECH_NAME;
    delete payload?.STRUCTURE_ID;
    delete payload?.WARRANTY_END_DATE;
    delete payload?.LAST_MAINTANCE_DATE;
    delete payload?.REQUESTTITLE_ID;
    delete payload?.RAISEDBY_ID;
    delete payload?.DESCRIPTION;
    if (editStatus === true || locationStatus === true) {

      try {
        delete payload?.TASKDETAILS;
        payload.MODE = "E";
        // payload.ASSET_NONASSET = selectedDetails?.ASSET_NONASSET;
        //  payload.ASSETGROUP_ID = payload?.ASSETGROUP_ID?.ASSETGROUP_ID;
        //  payload.ASSETTYPE_ID = payload?.ASSETTYPE_ID?.ASSETTYPE_ID;
        // payload.ASSET_ID = payload?.ASSET_ID?.ASSET_ID;
        payload.ASSETGROUP_ID =
          payload?.ASSETGROUP_ID?.ASSETGROUP_ID !== undefined
            ? payload?.ASSETGROUP_ID?.ASSETGROUP_ID
            : selectedDetails?.ASSETGROUP_ID;
        payload.ASSETTYPE_ID = groupStatus === true ?
          selectedDetails?.ASSETTYPE_ID : payload.ASSETTYPE_ID !== undefined
            ? payload?.ASSETTYPE_ID?.ASSETTYPE_ID
            : selectedDetails?.ASSETTYPE_ID;
        payload.ASSET_ID = groupStatus === true ?
          selectedDetails?.ASSET_ID : payload.ASSET_ID !== undefined
            ? payload?.ASSET_ID?.ASSET_ID
            : selectedDetails?.ASSET_ID;
        payload.LOCATION_ID =
          payload?.LOCATION_ID?.LOCATION_ID !== undefined
            ? payload?.LOCATION_ID?.LOCATION_ID
            : selectedDetails?.LOCATION_ID;
        payload.RAISED_BY =
          payload?.RAISEDBY_ID?.USER_ID !== undefined
            ? payload?.RAISEDBY_ID?.USER_ID
            : selectedDetails?.RAISED_BY;
        payload.REQ_ID =
          payload?.REQ_ID?.REQ_ID !== undefined
            ? payload?.REQ_ID?.REQ_ID
            : selectedDetails?.REQ_ID;
        // payload.SEVERITY_CODE = payload.SEVERITY_CODE.SEVERITY_ID !== undefined
        //   ? payload.SEVERITY_CODE.SEVERITY_ID
        //   : selectedDetails?.SEVERITY_CODE;
        payload.SEVERITY_CODE =
          payload.SEVERITY_CODE !== undefined &&
            payload.SEVERITY_CODE.SEVERITY_ID !== undefined
            ? payload.SEVERITY_CODE.SEVERITY_ID
            : selectedDetails?.SEVERITY_CODE;
        payload.ASSIGN_TEAM_ID = selectedDetails.ASSIGN_TEAM_ID;
        // payload.TECH_ID = REASSIGN_ID;
        payload.REASSIGN_TYPE = (currentStatus === 1 && selectedDetails.ATTEND_AT == null) ? 'B' : '';

        payload.WO_ID = selectedDetails?.WO_ID;
        payload.PARA = { para1: `Work order`, para2: "updated" };
        payload.WO_DATE =
          payload.WO_DATE !== undefined
            ? moment(payload?.WO_DATE).format("DD-MM-YYYY")
            : payload.WO_DATE;
        delete payload?.STATUS_CODE;

        const res = await callPostAPI(ENDPOINTS.SAVE_WORKORDER, payload, "HD001");
        if (res?.FLAG === true) {
          toast?.success(res?.MSG);
          getOptionDetails(WO_ID);
          setEditStatus(false);
          setLocationStatus(false);
          setShowReassingList(false);
          // getOptions();
          setIsSubmit(false)
          setGroupStatus(false)

          //   getOptionDetails(props.selectedData?.WO_ID);
        } else {
          toast?.error(res?.MSG);
          setIsSubmit(false)
          setGroupStatus(false)

        }
      } catch (error: any) {
        setIsSubmit(false)

        toast?.error(error);
      }
    } else if (editStatus === false || locationStatus === false) {
      delete payload.ASSET_NONASSET;
      delete payload.ASSETGROUP_ID;
      delete payload.ASSETTYPE_ID;
      delete payload.ASSET_ID;
      delete payload.LOCATION_ID;
      delete payload.RAISED_BY;
      delete payload.REQ_ID;
      delete payload.SEVERITY_CODE;
      delete payload.ASSIGN_TEAM_ID;
      delete payload.TECH_ID;
      delete payload?.STATUS_CODE;
      delete payload?.REQ_DESC;
      delete payload?.CURRENT_STATUS;
      delete payload?.DOC_LIST;
      delete payload?.MODE;
      delete payload?.WORK_ORDER_NO;
      delete payload?.WO_DATE;
      delete payload?.WO_NO;
      delete payload?.WO_REMARKS;
      delete payload?.WO_TYPE;
      delete payload?.TASKDETAILS;
      if (buttonMode === "task") {
        const checkedTasks = taskList.filter((task: any) => task.isChecked);

        const checkedTasksWith: any = checkedTasks.map(
          (task: any, index: any) => ({
            ...task,
            SEQNO: index + 1, // SEQNO is index + 1
          })
        );
        const taskDetails = checkedTasksWith?.map((task: any, index: any) => {
          return {
            TASK_ID: task.TASK_ID,
            TASK_NAME: task.TASK_NAME,
            TECH_ID: "",
            TASK_SRNO: index + 1,
            TIME_UOM_CODE: "M",
            SHOW_ACTUAL_TIME: "012:00",
            REMARKS: "Test",
          };
        });

        // payload.ASSEST_TYPE=selectedDetails?.ASSET_NONASSET;
        // payload.ASSETTYPE_ID= selectedDetails?.ASSETTYPE_ID;
        payload.WO_ID = WO_ID;
        payload.MODE = "A";
        payload.REMARKS = "Test";
        payload.TECH_ID = 0;

        payload.TASK_LIST = taskDetails;
        payload.PARA = { para1: `Task Details`, para2: "added" };
        if (checkedTasks?.length > 0) {

          // return
          const res = await callPostAPI(ENDPOINTS.SAVE_WO_TASK_PART, payload, "HD001");

          if (res.FLAG === true) {
            toast?.success(res?.MSG);
            //getOptionDetails(WO_ID);
            getOptions();
            getOptionDetails(WO_ID);
            setIsSubmit(false);
          } else {
            toast?.error(res?.MSG);
            setIsSubmit(false);
          }
        } else if (checkedTasks?.length === 0) {
          setIsSubmit(false);
          toast.error(" Please select at least one task");
        }
      } else {
        if (buttonMode === "parts") {
          const isAnyQTYUndefined = partListWatch.some(
            (item: any) =>
              item.USED_QUANTITY === undefined ||
              item.USED_QUANTITY === null ||
              item?.USED_QUNATITY === ""
          );
          payload.RAISED_BY = decryptData(localStorage.getItem("USER_ID"));
          payload.RETURN_TYPE = partWatch?.key;
          payload.PARTLIST = partListWatch;
          payload.PARA = { para1: `Part Details`, para2: "created" };
          payload.TASKDETAILS = [];
          if (isAnyQTYUndefined === false) {
            try {
              const res = await callPostAPI(ENDPOINTS.SAVE_USEDPARTS, payload, "HD001");
              if (res.FLAG === true) {
                toast?.success(res?.MSG);
                getOptionDetails(WO_ID);
                //props?.isClick();
                setIsSubmit(false);
              } else {
                toast?.error(res?.MSG);
                setIsSubmit(false);
              }
            } catch (error: any) {
              toast?.error(error);
              setIsSubmit(false);
            }
            setIsSubmit(false)

          } else {
            toast.error("please fill the used quantity ");
            setIsSubmit(false);
          }
        }
      }
    }
  };

  const setHandelImage = (item: any) => {
    setVisibleImage(true);
    setShowImage(item);
  };



  const customizedContent = (item: any) => {
    return (
      <div className="flex justify-between mb-3 gap-3">
        <div className="mb-2">
          <p className=" Text_Primary flex Alert_Title mb-2">
            {item.title}
            <p className="Menu_Active Alert_Title  ml-2 ">
              {item?.DOC_NO ?? ""}
            </p>
          </p>
          <p className="  Text_Secondary Helper_Text ">{item.subtitle}</p>
        </div>
        <p className="Text_Secondary Helper_Text mt-4">
          {/* {moment(item.date).format(
            `${dateFormat()} ${","} HH:mm `
          )} */}
          {formateDate(item.date)}
          {/* {item.date} */}
        </p>
      </div>
    );
  };

  const customizedStatusTimeline = (item: any) => {
    return (
      <div className="">
        <h6
          className={`font-medium Alert_Title mb-1 ${item.date
            ? "Text_Primary "
            : item.status
              ? "Text_Primary "
              : "Text_Secondary"
            } `}
        >
          {item.title}
        </h6>
        <p className="Text_Secondary Helper_Text">{item.date}</p>
      </div>
    );
  };

  const DetailsHeaderTemplate = (options: TabPanelHeaderTemplateOptions) => {
    return (
      <div
        className="flex justify-center gap-2 p-3"
        style={{ cursor: "pointer" }}
        onClick={options.onClick}
      >
        <span className="white-space-nowrap">Details</span>
        <Tooltip target=".custom-target-icon" />
        {
          // FACILITY["REDIRECT_APPROVAL"] === true 
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
          )}
      </div>
    );
  };

  const MaterialHeaderTemplate = (options: TabPanelHeaderTemplateOptions) => {
    return (
      <div
        className="flex justify-center gap-2 p-3"
        style={{ cursor: "pointer" }}
        onClick={options.onClick}
      >
        <span className="white-space-nowrap">Material</span>
        <Tooltip target=".custom-target-icon1" />
        {
          // FACILITY["MATREQ_APPROVAL"] === true 
          (selectedDetails?.ISMATAPPROVALCNC === false &&
            selectedDetails?.ISMATAPPROVED === false &&
            selectedDetails?.CURRENT_STATUS === 5 &&
            selectedDetails?.SUB_STATUS === "6") ? (
            <Badge
              value="i"
              className="custom-target-icon1"
              data-pr-position="top"
              data-pr-tooltip="Material Request Approval"
            />
          ) : (
            <></>
          )}
      </div>
    );
  };

  const ActivityHeaderTemplate = (options: TabPanelHeaderTemplateOptions) => {
    return (
      <div
        className="flex justify-center gap-2 p-3"
        style={{ cursor: "pointer" }}
        onClick={options.onClick}
      >
        <span className="white-space-nowrap">Activity Timeline</span>
      </div>
    );
  };

  const footer = (
    <></>

  );

  const selectedLocationTemplate = (option: any, props: any) => {
    if (option) {
      return (
        <div className="flex align-items-center">
          <div>{option.LOCATION_DESCRIPTION}</div>
        </div>
      );
    }

    return <span>{props.placeholder}</span>;
  };

  const locationOptionTemplate = (option: any) => {
    return (
      <div className="align-items-center">
        <div className="Text_Secondary Helper_Text  ">
          {option.LOCATION_NAME}
        </div>
        <div className=" Text_Secondary Helper_Text">
          {option.LOCATION_DESCRIPTION}
        </div>
      </div>
    );
  };

  const TASK_NAME = watch("TASK_NAME");
  const setPushList = (data: any) => {
    taskList.push({ TASK_ID: "0", TASK_NAME: data });
    reset({ TASK_NAME: "" });
  };

  const AddTask = () => {
    if (TASK_NAME !== undefined) {
      if (
        TASK_NAME.trim() !== ""
      ) {
        setPushList(TASK_NAME);
      } else {
        toast.error(
          "Please Enter Task Details"
        );
      }
      setValue(TASK_NAME, "");
    } else {
      toast.error(
        "Please Enter Task Details"
      );
    }
  }

  const OpenViewAddTask = () => {
    if (ViewAddTask === false) {
      SetViewAddTask(true);
    } else {
      SetViewAddTask(false);
    }
  };

  const taskDetailsWatch = watch("TASKDETAILS");

  const handlerInputData = (e: any) => {
    setTaskList([...taskList, ...taskDetailsWatch]);
  };

  const GetOpenList = () => {
    navigate(`${appName}/workorderlist`);
  };

  const getLocDesc = (e: any) => {
    setValue("LOCATION_DESCRIPTION", e)
  }

  const getRequestList = async (ASSETGROUP_ID: any, ASSET_NONASSET?: any, reqId?: any) => {

    try {
      const payload: any = {
        ASSETGROUP_ID: ASSETGROUP_ID,
        ASSET_NONASSET: ASSET_NONASSET
      };

      const res = await callPostAPI(
        ENDPOINTS.GET_SERVICEREQUEST_WORKORDER,
        payload, "HD001"
      );

      if (res?.FLAG === 1) {
        setIssueList(res?.WOREQLIST)
        setSelectedIssue(reqId)
        setValue("REQ_ID", reqId)

      } else {
        setIssueList(res?.WOREQLIST)
      }
    } catch (error: any) {

    } finally {

    }
  }


  const getEquipmentGroup = async (groupId: any, groupType: any) => {
    try {
      selectedDetails.ASSETTYPE_ID = "";
      selectedDetails.ASSET_ID = ""
      setGroupStatus(true)
      const res = await callPostAPI(ENDPOINTS?.GET_ASSET_GROUP_CHECK, {
        ASSETGROUP_ID: groupId,
      }, "HD001");
      getRequestList(groupId, groupType)
      if (res?.FLAG === false) {
        const res1 = await callPostAPI(ENDPOINTS?.GET_ASSETGROUPTEAMLIST, {
          WO_ID: WO_ID,
          ASSETGROUP_ID: groupId,
        }, "HD001");
        let ReassignList = res1?.TECHLIST;
        setReassignList([])

        technicianList.forEach((element: any) => {
          ReassignList.forEach((item: any) => {
            if (element.TEAM_ID === item.TEAM_ID) {
              setShowReassingList(false);
              setReassignVisible(false)
              setReassignList(ReassignList)
            } else {
              setShowReassingList(true);
              setReassignVisible(true)
              setReassignList(ReassignList)
            }
          });
        });
        setValue("TECH_ID", "");
        setValue("ASSET_ID", "");
        setTaskList([])
      }
    } catch (e: any) {
      console.log(e ?? 'error', "e")
    }

  };

  const getEquipmentType = (e: any) => {
    selectedDetails.ASSETTYPE_ID = e?.target?.value?.ASSETTYPE_ID
    setValue("ASSETTYPE_ID", e?.target?.value?.ASSETTYPE_ID)
    if (taskList.length > 0) {
      setTaskList([])
    } else {
      return
    }

  }

console.log(initialTime, 'initialTime')
  const getSoftServiceGroup = () => {
  
      setType([])
      setAssetList([])
    setValue("ASSETTYPE_ID", "");
    setValue("ASSET_ID", "");
    setGroupStatus(true)
  }

  const GetVisibleSiderBar = (val: any) => {
    if (val === 0 && IsVisibleMaterialReqSideBar === false) {
      setVisibleMaterialReqSideBar(true);
    } else {
      setVisibleMaterialReqSideBar(false);
    }

  }

  const GetCancelEdit = () => {
    if (editStatus === true) {
      setEditStatus(false);
    }
    if (locationStatus === true) {
      setLocationStatus(false);
    }
  }

  const remarkMapping: any = {
    "1": selectedDetails?.REDIRECT_INSTRUCTIONS,
    "2": selectedDetails?.COLLABRAT_REMARKS,
    "3": selectedDetails?.VENDOR_REDIRECT_REMARKS,
    "4": selectedDetails?.CANCELLED_REMARKS,
    "5": selectedDetails?.ONHOLD_REMARKS,
  };

  useEffect(() => {
    if ((!isSubmitting && Object?.values(errors)[0]?.type === "required") || (!isSubmitting && Object?.values(errors)[0]?.type === "validate")) {
      const check: any = Object?.values(errors)[0]?.message;
      toast?.error(t(check));
    }
  }, [isSubmitting]);



  const remark = remarkMapping[selectedDetails?.SUB_STATUS] || "No additional remark";
  if (loading) {
    return <LoaderS />
  }

  return (
    <>

      <section className="w-full">
        <form onSubmit={handleSubmit(onSubmit)}>
          {selectedDetails?.length !== 0 ?
            <>
              <Card className="fixedContainer">
                <div className="flex justify-between">
                  <div>
                    <p className="Helper_Text Menu_Active mb-1">
                      Work Order /{" "}
                    </p>
                    <h6 className="Text_Primary Main_Header_Text mb-1">
                      {selectedDetails?.ASSETGROUP_NAME ?? ""} -{" "}
                      {selectedDetails?.REQ_DESC ?? ""}
                    </h6>
                    <p className="Sub_Header_Text ">
                      {selectedDetails?.WO_NO ?? ""}
                    </p>
                  </div>
                  <div>
                    {/* List */}

                    {currentStatus === 7 && status === "Completed" && (
                      <Buttons
                        label={"List"}
                        className=" Primary_Button  me-2"
                        type="button"
                        name="LIST"
                        onClick={GetOpenList}
                      />
                    )}

                    {(editStatus === true || locationStatus === true) && (
                      <Buttons
                        type="submit"
                        className="Secondary_Button w-20 me-2"
                        label={"Cancel"}
                        onClick={GetCancelEdit}
                      />
                    )}
                    {/* Save */}

                    {(locationStatus === true || editStatus === true) &&
                      (currentStatus === 1 || currentStatus === 3) && (
                        <Buttons
                          type="submit"
                          // disabled={IsSubmit}
                          className="Primary_Button  w-20 me-2"
                          label={"Save"}
                        />
                      )}

                    {/* Redirect */}
                    {currentStatus !== 6 &&
                      status !== "Cancelled" &&
                      currentStatus !== 7 &&
                      editStatus === false &&
                      locationStatus === false &&
                      (currentStatus === 3 || currentStatus === 1) ? (
                      <WORedirectDialogBox
                        control={control}
                        header={"OnHold"}
                        setValue={setValue}
                        register={register}
                        name={"onHold"}
                        REMARK={""}
                        handlingStatus={handlingStatus}
                        watch={watch}
                        ASSIGN_TEAM_ID={"ASSIGN_TEAM_ID"}
                        label={"Redirect"}
                        getAPI={props?.getAPI}
                        STATUS_CODE={"STATUS_CODE"}
                        currentStatus={currentStatus}
                        errors={errors}
                        subStatus={selectedDetails.SUB_STATUS}
                        isSubmitting={isSubmitting}
                        options={options}
                        getOptionDetails={getOptionDetails}
                        eventNotification={eventNotification}
                      />
                    ) : (
                      <></>
                    )}

                    {/* Acknowledge */}

                    {currentStatus === 1 && editStatus === false && locationStatus === false && (
                      <Buttons
                        className=" Primary_Button  me-2"
                        type="button"
                        name="ACK"
                        label={"Acknowledge"}
                        onClick={(e: any) => handlingStatus(e, "Acknowledge")}
                      />
                    )}

                    {/* Rectified */}

                    {currentStatus >= 3 &&
                      status !== "Cancelled" &&
                      currentStatus !== 4 &&
                      editStatus === false &&
                      locationStatus === false &&
                      currentStatus !== 7 && (
                        <>
                          {currentStatus !== 5 ? (
                            <WorkOrderDialogBox
                              header={"Rectified"}
                              title={
                                "Are you sure you want to rectify the workorder?"
                              }
                              errors={errors}
                              control={control}
                              setValue={setValue}
                              register={register}
                              getValues={getValues}
                              name={"RCT"}
                              REMARK={"REMARK"}
                              handlingStatus={handlingStatus}
                              watch={watch}
                              label={"Rectified"}
                            />
                          ) : (

                            selectedDetails?.ISAPPROVED === true &&
                            selectedDetails?.CURRENT_STATUS === 5 &&
                            selectedDetails?.SUB_STATUS === "5" && (
                              <Buttons
                                className=" Primary_Button   me-2"
                                type="button"
                                name="CONTINUE"
                                label={"Continue Work Order"}
                                onClick={(e: any) =>
                                  handlingStatus(e, "CONTINUE")
                                }
                              />
                            )
                          )}
                        </>
                      )}

                    {/* Complete */}

                    {currentStatus == 4 ? (
                      <WorkOrderDialogBox
                        header={"Complete"}
                        title={
                          "Are you sure you want to Complete the workorder?"
                        }
                        control={control}
                        setValue={setValue}
                        register={register}
                        name={"Complete"}
                        // REMARK={"REMARK"}
                        handlingStatus={handlingStatus}
                        watch={watch}
                        label={"Complete"}
                        errors={errors}
                        currentStatus={currentStatus}
                      />
                    ) : (
                      <></>
                    )}
                  </div>
                </div>
              </Card>
              <div className="h-28"></div>
              <Card className="mt-2">
                <Timeline
                  value={StatusEvents}
                  layout="horizontal"
                  align="top"
                  marker={customizedMarker}
                  content={customizedStatusTimeline}
                />
              </Card>
              <div className=" grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-3 lg:grid-cols-3">
                <div className="col-span-2 mt-3 woTabview">
                  <div className="woDetailTabview">
                    <TabView
                      activeIndex={activeIndex}
                      onTabChange={(e) => setActiveIndex(e.index)}
                    >
                      <TabPanel headerTemplate={DetailsHeaderTemplate}>
                        <Card className="mt-2">

                          <div>
                            {selectedDetails?.ISAPPROVALCNC === false &&
                              selectedDetails?.ISAPPROVED === false &&
                              selectedDetails?.CURRENT_STATUS === 5 &&
                              (selectedDetails?.SUB_STATUS === "1" ||
                                selectedDetails?.SUB_STATUS === "2" ||
                                selectedDetails?.SUB_STATUS === "3" ||
                                selectedDetails?.SUB_STATUS === "4" ||
                                selectedDetails?.SUB_STATUS === "5") ? (
                              <>
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
                                            {selectedDetails?.STATUS_DESC}{" "}
                                            Request
                                          </label>

                                          <p
                                            className="Text_Primary Input_Text"
                                            data-pr-tooltip={remark}
                                            data-pr-position="bottom"
                                          >
                                            {remark}
                                          </p>
                                          {selectedDetails?.SUB_STATUS ===
                                            "4" ||
                                            selectedDetails?.SUB_STATUS ===
                                            "1" ? (
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
                                    <SidebarVisibal
                                      reassignVisible={reassignVisible}
                                      headerTemplate={
                                        selectedDetails?.STATUS_DESC
                                      }
                                      selectedDetails={selectedDetails}
                                      subStatus={selectedDetails?.SUB_STATUS}
                                      approvalStatus={approvalStatus}
                                      handlingStatus={handlingStatus}
                                      ASSIGNTECHLIST={technicianList}
                                      WORKORDER_DETAILS={selectedDetails}
                                      //getOptionDetails={getOptionDetails}
                                      getOptions={getOptions}
                                      statusCode={
                                        selectedDetails.CURRENT_STATUS
                                      }
                                      DUPLICATE_BY={
                                        selectedDetails.DUPLICATE_BY
                                      }
                                      IsVisibleMaterialReqSideBar={
                                        IsVisibleMaterialReqSideBar
                                      }
                                      setVisibleMaterialReqSideBar={
                                        setVisibleMaterialReqSideBar
                                      }
                                      woor
                                    />
                                  </div>
                                </div>
                              </>
                            ) : (
                              <></>
                            )}
                          </div>

                          <div className="flex flex-wrap justify-between">
                            <h6 className="Header_Text">Work Order Details</h6>
                          </div>

                          <div className="mt-2 grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-3 lg:grid-cols-3">
                            <div className=" flex flex-col gap-2">
                              <div>
                                <label className="Text_Secondary Helper_Text  ">
                                  Priority
                                </label>
                                <p className="Text_Primary Alert_Title  ">
                                  {selectedDetails?.SEVERITY_DESC}
                                </p>
                              </div>
                              <div>
                                <div>
                                  <label className="Text_Secondary Helper_Text  ">
                                    Type
                                  </label>

                                  {selectedDetails?.ASSET_NONASSET === "A" ? (
                                    <>
                                      <p className="Text_Primary Alert_Title  ">
                                        Equipment{" "}
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

                              </div>
                              <div>
                                <label className="Text_Secondary Helper_Text  ">
                                  Reporter
                                </label>
                                <p className="Menu_Active Alert_Title">
                                  {selectedDetails?.USER_NAME}
                                </p>
                              </div>
                              <div>
                                <label className="Text_Secondary Helper_Text  ">
                                  Reported Date
                                </label>
                                <p className="Text_Primary Alert_Title  ">
                                  {selectedDetails?.REPORTED_AT
                                    ?
                                    formateDate(selectedDetails?.REPORTED_AT)
                                    : "NA"}
                                </p>
                              </div>
                            </div>
                            <div className="col-span-2">
                              <div className=" flex flex-col gap-2">
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

                                        {(currentStatus === 1 ||
                                          currentStatus == 3) && (
                                            <i
                                              className="pi pi-pencil Menu_Active ml-2 cursor-pointer"
                                              onClick={() =>
                                                OpenLocationDropDown()
                                              }
                                            ></i>

                                          )}
                                      </>
                                    )}

                                    {locationStatus === true && (

                                      <Field
                                        controller={{
                                          name: "LOCATION_ID",
                                          control: control,
                                          render: ({ field }: any) => {
                                            return (
                                              <Select
                                                options={locationtypeOptions}
                                                {...register("LOCATION_ID", {
                                                  onChange: (e: any) => {

                                                    getLocDesc(
                                                      e?.target?.value
                                                        ?.LOCATION_DESCRIPTION
                                                    );
                                                  },
                                                })}
                                                filter={true}
                                                optionLabel="LOCATION_DESCRIPTION"
                                                findKey={"LOCATION_ID"}

                                                selectedData={
                                                  selectedDetails?.LOCATION_ID
                                                }
                                                setValue={setValue}
                                                invalid={errors.LOCATION_ID}
                                                {...field}

                                              />
                                            );
                                          },
                                        }}
                                      />
                                    )}
                                  </p>
                                </div>
                                <div>
                                  <label className="Text_Secondary Helper_Text  ">
                                    Description
                                  </label>
                                  {selectedDetails?.WO_REMARKS === null ||
                                    selectedDetails?.WO_REMARKS === "" ? (
                                    <>
                                      <p className="Text_Primary Alert_Title  ">
                                        NA
                                      </p>
                                    </>
                                  ) : (
                                    <>
                                      <p className="Text_Primary Alert_Title  ">
                                        {selectedDetails?.WO_REMARKS}
                                      </p>
                                    </>
                                  )}

                                </div>
                                <div>
                                  <label className="Text_Secondary Helper_Text  ">
                                    Supporting Images(
                                    {
                                      docOption?.filter(
                                        (e: any) => e.UPLOAD_TYPE === "W"
                                      ).length
                                    }
                                    )
                                  </label>

                                  {docOption?.filter(
                                    (e: any) => e.UPLOAD_TYPE === "W"
                                  ).length > 0 ? (
                                    <>
                                      <div className="flex flex-wrap gap-3">
                                        {docOption?.map(
                                          (doc: any, index: any) => {
                                            if (doc.UPLOAD_TYPE === "W") {
                                              const docData: any =
                                                "data:image/png;base64," +
                                                doc?.DOC_DATA;
                                              return (
                                                <>
                                                  <div
                                                    onClick={() => {
                                                      setHandelImage(docData);
                                                    }}
                                                  >
                                                    <img
                                                      src={docData}
                                                      alt=""
                                                      className="w-16 h-16 rounded-xl"
                                                    />
                                                  </div>
                                                  {/* setHandelImage */}
                                                </>
                                              );
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
                                      </Dialog>
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
                                    <img
                                      src={showImage}
                                      alt=""
                                      className="w-full bg-cover"
                                    />
                                  </Dialog>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* rectification code */}
                          {currentStatus === 4 || currentStatus === 7 ? (
                            <div className="mt-2">
                              <hr className="w-full mb-2"></hr>
                              <div className="flex flex-wrap justify-between">
                                <h6 className="Header_Text">
                                  Rectified Details
                                </h6>
                              </div>

                              <div className="mt-2 grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-3 lg:grid-cols-3">
                                <div className=" flex flex-col gap-2">
                                  <div>
                                    <label className="Text_Secondary Helper_Text  ">
                                      Rectified by
                                    </label>
                                    <p className="Text_Primary Alert_Title  ">
                                      {selectedDetails?.RECTIFIED_BY_NAME}
                                    </p>
                                  </div>
                                  <div>
                                    <div>
                                      <label className="Text_Secondary Helper_Text  ">
                                        Rectified Date
                                      </label>
                                      {/* <i className="pi pi-pencil Text_Main ml-2"></i> */}
                                    </div>
                                    <p className="Text_Primary Alert_Title  ">

                                      {formateDate(selectedDetails?.RECTIFIED_AT)}
                                    </p>
                                  </div>
                                </div>
                                <div className="col-span-2">
                                  <div className=" flex flex-col gap-2">
                                    <div>
                                      <label className="Text_Secondary Helper_Text  ">
                                        Rectification Comment
                                      </label>
                                      {selectedDetails?.RECTIFIED_REMARKS ===
                                        null ||
                                        selectedDetails?.RECTIFIED_REMARKS ===
                                        "" ? (
                                        <>
                                          <p className="Text_Primary Alert_Title  ">
                                            NA
                                          </p>
                                        </>
                                      ) : (
                                        <>
                                          <p className="Text_Primary Alert_Title  ">
                                            {selectedDetails?.RECTIFIED_REMARKS}
                                          </p>
                                        </>
                                      )}
                                    </div>
                                    <div>
                                      <div>
                                        <label className="Text_Secondary Helper_Text  ">
                                          Before Images(
                                          {
                                            docOption?.filter(
                                              (e: any) => e.UPLOAD_TYPE === "B"
                                            ).length
                                          }
                                          )
                                        </label>

                                        {docOption?.filter(
                                          (e: any) => e.UPLOAD_TYPE === "B"
                                        ).length > 0 ? (
                                          <>
                                            <div className="flex flex-wrap gap-3">
                                              {docOption?.map(
                                                (doc: any, index: any) => {
                                                  if (doc.UPLOAD_TYPE === "B") {
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
                                                            className="w-16 h-16 rounded-xl"
                                                          />
                                                        </div>
                                                        {/* setHandelImage */}
                                                      </>
                                                    );
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
                                            </Dialog>
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
                                          <img
                                            src={showImage}
                                            alt=""
                                            className="w-full bg-cover"
                                          />
                                        </Dialog>
                                      </div>
                                      <div>
                                        <label className="Text_Secondary Helper_Text  ">
                                          After Images(
                                          {
                                            docOption?.filter(
                                              (e: any) => e.UPLOAD_TYPE === "A"
                                            ).length
                                          }
                                          )
                                        </label>
                                        {docOption?.filter(
                                          (e: any) => e.UPLOAD_TYPE === "A"
                                        ).length > 0 ? (
                                          <>
                                            <div className="flex flex-wrap gap-3">
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
                                                        {/* setHandelImage */}
                                                      </>
                                                    );
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
                                              <img
                                                src={showImage}
                                                alt=""
                                                className="w-full bg-cover"
                                              />
                                            </Dialog>
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
                                      </div>

                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <></>
                          )}


                          {currentStatus === 7 ? (
                            <div className="mt-2">
                              <hr className="w-full mb-2"></hr>
                              <div className="flex flex-wrap justify-between">
                                <h6 className="Header_Text">
                                  Completion Details
                                </h6>

                              </div>

                              <div className="mt-2 grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-3 lg:grid-cols-3">
                                <div className=" flex flex-col gap-2">
                                  <div>
                                    <label className="Text_Secondary Helper_Text  ">
                                      Verified by
                                    </label>
                                    {selectedDetails?.VERIFY_BY === null ||
                                      selectedDetails?.VERIFY_BY === "" ? (
                                      <>
                                        <p className="Text_Primary Alert_Title  ">
                                          NA
                                        </p>
                                      </>
                                    ) : (
                                      <>
                                        <p className="Menu_Active Alert_Title  ">
                                          {selectedDetails?.VERIFY_BY}
                                        </p>
                                      </>
                                    )}
                                  </div>
                                  <div>
                                    <div>
                                      <label className="Text_Secondary Helper_Text  ">
                                        Verified Date
                                      </label>

                                    </div>
                                    <p className="Text_Primary Alert_Title  ">
                                      {/* {moment(
                                        selectedDetails?.COMPLETED_AT
                                      ).format(`${dateFormat()} ${" "}`)} */}
                                      {formateDate(selectedDetails?.COMPLETED_AT)}
                                    </p>
                                  </div>
                                </div>
                                <div className="col-span-2">
                                  <div className=" flex flex-col gap-2">
                                    <div>
                                      <label className="Text_Secondary Helper_Text  ">
                                        Signature
                                      </label>
                                      <div
                                        className="justify-center flex w-full h-[100px] p-4 border-2
                border-gray-200 border rounded-lg "
                                      >
                                        <img
                                          src={imgSrc}
                                          className="w-[102px] h-[65px] bg-contain "
                                        />
                                      </div>
                                    </div>
                                    <div></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <></>
                          )}
                        </Card>

                        {/* when its no data */}
                        {decryptData(localStorage.getItem("ROLETYPECODE")) !==
                          "O" ||
                          (decryptData(localStorage.getItem("ROLETYPECODE")) !==
                            "H" &&
                            selectedDetails?.ASSET_NONASSET !== "N" && (
                              <Card className="mt-2">
                                <h6 className="Header_Text">
                                  Equipment Summary
                                </h6>
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
                                        <span className="Text_Primary Alert_Title">
                                          {t("No items to show")}{" "}
                                        </span>
                                      </p>
                                      <label className="Text_Secondary Helper_Text mb-4">
                                        {t(
                                          "Add equipment to access related tasks and resources."
                                        )}
                                      </label>

                                      <Buttons
                                        className="Secondary_Button"
                                        icon="pi pi-plus"
                                        label={"Add Equipment"}
                                      />
                                    </div>
                                  </label>
                                </div>
                              </Card>
                            ))}
                        {selectedDetails?.ASSET_NONASSET !== "N" && (
                          <Card className="mt-2">
                            <div className="flex flex-wrap justify-between">
                              <h6 className="Header_Text">Equipment Summary</h6>
                              {(currentStatus === 1 || currentStatus == 3) && (
                                <Buttons
                                  className="Secondary_Button"
                                  icon="pi pi-pencil"
                                  label={"Edit"}
                                  onClick={() => {
                                    OpenEditStatusDropDown();
                                  }}
                                // onClick={OpenLocationDropDown}
                                />
                              )}
                            </div>

                            {editStatus === false && (
                              <div className="mt-2 grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-3 lg:grid-cols-3">
                                <div>
                                  <label className="Text_Secondary Helper_Text  ">
                                    Equipment Group
                                  </label>
                                  <p className="Text_Primary Alert_Title  ">
                                    {selectedDetails?.ASSETGROUP_NAME}
                                  </p>
                                </div>
                                <div>
                                  <label className="Text_Secondary Helper_Text  ">
                                    Ownership Status
                                  </label>
                                  <p className="Text_Primary Alert_Title  ">
                                    {selectedDetails?.OWN_LEASE === null ||
                                      selectedDetails?.OWN_LEASE === "" ||
                                      selectedDetails?.OWN_LEASE === undefined
                                      ? "NA" : selectedDetails?.OWN_LEASE === "O"
                                        ? "Owned" :
                                        selectedDetails?.OWN_LEASE === "L" ?
                                          "Leased" : "NA"}
                                    {/* {ownLeasedStatus} */}
                                  </p>
                                </div>
                                <div>
                                  <label className="Text_Secondary Helper_Text  ">
                                    Last Maintenance Date
                                  </label>
                                  <p className="Text_Primary Alert_Title  ">
                                    {selectedDetails?.LAST_MAINTANCE_DATE ==
                                      null ||
                                      selectedDetails?.LAST_MAINTANCE_DATE === ""
                                      ? "NA"
                                      :
                                      // moment(
                                      //   selectedDetails?.LAST_MAINTANCE_DATE
                                      // ).format(dateFormat())}
                                      onlyDateFormat(selectedDetails?.LAST_MAINTANCE_DATE)
                                    }
                                  </p>
                                </div>
                                <div>
                                  <label className="Text_Secondary Helper_Text  ">
                                    Equipment Type
                                  </label>
                                  <p className="Text_Primary Alert_Title  ">
                                    {selectedDetails?.ASSETTYPE_NAME === null
                                      ? "NA"
                                      : selectedDetails?.ASSETTYPE_NAME}
                                  </p>
                                </div>
                                <div>
                                  <label className="Text_Secondary Helper_Text  ">
                                    Warranty End Date
                                  </label>
                                  <p className="Text_Primary Alert_Title  ">
                                    {selectedDetails?.WARRANTY_END_DATE ==
                                      null ||
                                      selectedDetails?.WARRANTY_END_DATE === ""
                                      ? "NA"
                                      :
                                      //  moment(
                                      //   selectedDetails?.WARRANTY_END_DATE
                                      // ).format(dateFormat())
                                      onlyDateFormat(selectedDetails?.WARRANTY_END_DATE)
                                    }
                                  </p>
                                </div>
                                <div>
                                  <label className="Text_Secondary Helper_Text  ">
                                    Upcoming Schedule
                                  </label>
                                  <p className="Text_Primary Alert_Title  ">
                                    {selectedDetails?.UPCOMING_SCHEDULE_DATE
                                      ?
                                      //  moment(
                                      //   selectedDetails?.UPCOMING_SCHEDULE_DATE
                                      // ).format(dateFormat())
                                      onlyDateFormat(selectedDetails?.UPCOMING_SCHEDULE_DATE)
                                      : "NA"}
                                  </p>
                                </div>
                                <div>
                                  <label className="Text_Secondary Helper_Text  ">
                                    Equipment Name
                                  </label>
                                  <p className="Text_Primary Alert_Title  ">
                                    {selectedDetails?.ASSET_NAME === "" ||
                                      selectedDetails?.ASSET_NAME === null ||
                                      selectedDetails?.ASSET_NAME === undefined
                                      ? "NA"
                                      : selectedDetails?.ASSET_NAME}
                                  </p>
                                </div>
                                <div>
                                  <label className="Text_Secondary Helper_Text  ">
                                    Vendor Name
                                  </label>
                                  <p className="Text_Primary Alert_Title  ">
                                    {selectedDetails?.VENDOR_NAME === "" ||
                                      selectedDetails?.VENDOR_NAME === null ||
                                      selectedDetails?.VENDOR_NAME === undefined
                                      ? "NA"
                                      : selectedDetails?.VENDOR_NAME}
                                  </p>
                                </div>
                                <div>
                                  <label className="Text_Secondary Helper_Text  ">
                                    Issue
                                  </label>
                                  <p className="Text_Primary Alert_Title  ">
                                    {selectedDetails?.REQ_DESC === "" ||
                                      selectedDetails?.REQ_DESC === null ||
                                      selectedDetails?.REQ_DESC === undefined
                                      ? "NA"
                                      : selectedDetails?.REQ_DESC}
                                  </p>
                                </div>
                              </div>
                            )}
                            {editStatus === true ?
                              <div className="mt-2 grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-3 lg:grid-cols-3">
                                <div>
                                  <label className="Text_Secondary Helper_Text  ">
                                    Equipment Group{" "}
                                    <span className="text-red-600"> *</span>
                                  </label>
                                  <p className="Text_Primary Alert_Title  ">
                                    <Field
                                      controller={{
                                        name: "ASSETGROUP_ID",
                                        control: control,
                                        render: ({ field }: any) => {
                                          return (
                                            <Select
                                              require={false}
                                              options={EquipmentGroup}
                                              {...register("ASSETGROUP_ID", {
                                                required:
                                                  "Please fill the required fields",
                                                onChange: (e: any) => {
                                                  setType([])
                                                  setAssetList([])
                                                  getEquipmentGroup(
                                                    e?.target?.value
                                                      ?.ASSETGROUP_ID,
                                                    e?.target?.value?.ASSETGROUP_TYPE
                                                  );
                                                },
                                              })}
                                              optionLabel="ASSETGROUP_NAME"
                                              findKey={"ASSETGROUP_ID"}
                                              selectedData={
                                                selectedDetails?.ASSETGROUP_ID
                                              }
                                              setValue={setValue}
                                              invalid={errors.ASSETGROUP_ID}
                                              {...field}
                                            />
                                          );
                                        },
                                      }}
                                    />
                                  </p>
                                </div>
                                <div>
                                  <label className="Text_Secondary Helper_Text  ">
                                    Ownership Status
                                  </label>
                                  <p className="Text_Primary Alert_Title  ">
                                    {selectedDetails?.OWN_LEASE === null ||
                                      selectedDetails?.OWN_LEASE === "" ||
                                      selectedDetails?.OWN_LEASE === undefined
                                      ? "NA" : selectedDetails?.OWN_LEASE === "O"
                                        ? "Owned" :
                                        selectedDetails?.OWN_LEASE === "L" ?
                                          "Leased" : "NA"}
                                  </p>
                                </div>
                                <div>
                                  <label className="Text_Secondary Helper_Text  ">
                                    Last Maintenance Date
                                  </label>
                                  <p className="Text_Primary Alert_Title  ">
                                    {selectedDetails?.LAST_MAINTANCE_DATE ==
                                      null ||
                                      selectedDetails?.LAST_MAINTANCE_DATE === ""
                                      ? "NA"
                                      :
                                      //  moment(
                                      //   selectedDetails?.LAST_MAINTANCE_DATE
                                      // ).format(dateFormat())
                                      onlyDateFormat(selectedDetails?.LAST_MAINTANCE_DATE)
                                    }
                                  </p>
                                </div>
                                <div>
                                  <label className="Text_Secondary Helper_Text  ">
                                    Equipment Type{" "}
                                    {/* <span className="text-red-600"> *</span> */}
                                  </label>
                                  <p className="Text_Primary Alert_Title  ">
                                    <Field
                                      controller={{
                                        name: "ASSETTYPE_ID",
                                        control: control,
                                        render: ({ field }: any) => {
                                          return (
                                            <Select
                                              options={type}
                                              {...register("ASSETTYPE_ID", {
                                                // required:
                                                //   "Please fill the required fields",
                                                onChange: (e: any) => {
                                                  getEquipmentType(e);
                                                },
                                              })}
                                              //require={false}
                                              optionLabel="ASSETTYPE_NAME"
                                              findKey={"ASSETTYPE_ID"}
                                              selectedData={
                                                selectedDetails?.ASSETTYPE_ID
                                              }
                                              setValue={setValue}
                                              //   invalid={errors.ASSETTYPE_ID}
                                              {...field}
                                            />
                                          );
                                        },
                                      }}
                                    />
                                  </p>
                                </div>
                                <div>
                                  <label className="Text_Secondary Helper_Text  ">
                                    Warranty End Date
                                  </label>
                                  <p className="Text_Primary Alert_Title  ">

                                    {onlyDateFormat(selectedDetails?.WARRANTY_END_DATE)}
                                  </p>
                                </div>
                                <div>
                                  <label className="Text_Secondary Helper_Text  ">
                                    Upcoming Schedule
                                  </label>
                                  <p className="Text_Primary Alert_Title  ">
                                    {selectedDetails?.UPCOMING_SCHEDULE_DATE
                                      ?
                                      // moment(
                                      //   selectedDetails?.UPCOMING_SCHEDULE_DATE
                                      // ).format(dateFormat())
                                      onlyDateFormat(selectedDetails?.UPCOMING_SCHEDULE_DATE)
                                      : "NA"}
                                  </p>
                                </div>
                                <div>
                                  <label className="Text_Secondary Helper_Text  ">
                                    Equipment Name{" "}
                                    {/* <span className="text-red-600"> *</span> */}
                                  </label>
                                  <p className="Text_Primary Alert_Title  ">
                                    <Field
                                      controller={{
                                        name: "ASSET_ID",
                                        control: control,
                                        render: ({ field }: any) => {
                                          return (
                                            <Select
                                              options={assetList}
                                              {...register("ASSET_ID", {
                                                onChange: (e: any) => {
                                                  selectedDetails.ASSET_ID = e?.target?.value?.ASSET_ID
                                                  setValue("ASSET_ID", e?.target?.value?.ASSET_ID)
                                                }
                                              })}
                                              optionLabel="ASSET_NAME"
                                              // require={false}
                                              findKey={"ASSET_ID"}
                                              selectedData={
                                                selectedDetails?.ASSET_ID
                                              }
                                              setValue={setValue}
                                              // invalid={errors?.ASSET_ID}
                                              {...field}
                                            />
                                          );
                                        },
                                      }}
                                    />
                                  </p>
                                </div>
                                <div>
                                  <label className="Text_Secondary Helper_Text  ">
                                    Vendor Name
                                  </label>
                                  <p className="Text_Primary Alert_Title  ">
                                    {selectedDetails?.VENDOR_NAME === "" ||
                                      selectedDetails?.VENDOR_NAME === null ||
                                      selectedDetails?.VENDOR_NAME === undefined
                                      ? "NA"
                                      : selectedDetails?.VENDOR_NAME}
                                  </p>
                                </div>


                                {/* <div></div> */}
                                {reassignVisible === true &&
                                  showReassingList === true && (
                                    <div>
                                      <label className="Text_Secondary Helper_Text  ">
                                        Reassign{" "}
                                        <span className="text-red-600"> *</span>
                                      </label>
                                      <p className="Text_Primary Alert_Title  ">
                                        <Field
                                          controller={{
                                            name: "TECH_ID",
                                            control: control,
                                            render: ({ field }: any) => {
                                              return (
                                                <Select
                                                  require={false}
                                                  options={ReassignList}
                                                  {...register("TECH_ID", {
                                                    required:
                                                      "Please fill the required fields",
                                                  })}
                                                  optionLabel="USER_NAME"
                                                  findKey={"TECH_ID"}
                                                  selectedData={
                                                    selectedDetails?.TECH_ID
                                                  }
                                                  setValue={setValue}
                                                  invalid={errors.TECH_ID}
                                                  {...field}
                                                />
                                              );
                                            },
                                          }}
                                        />
                                      </p>
                                    </div>
                                  )}

                                <div>
                                  <label className="Text_Secondary Helper_Text  ">
                                    {" "}
                                    {/* <span className="text-red-600"> *</span> */}
                                  </label>
                                  <p className="Text_Primary Alert_Title  ">
                                    <Field
                                      controller={{
                                        name: "REQ_ID",
                                        control: control,
                                        render: ({ field }: any) => {
                                          return (
                                            <Select
                                              options={issueList}
                                              //options={[]}
                                              {...register("REQ_ID", {
                                                required: "Please fill the required fields",
                                              })}
                                              label={"Issue"}
                                              optionLabel="REQ_DESC"
                                              require={true}
                                              findKey={"REQ_ID"}

                                              selectedData={selectedDetails?.REQ_ID}
                                              setValue={setValue}
                                              invalid={errors.REQ_ID}
                                              {...field}
                                            />
                                          );
                                        },
                                      }}
                                    />
                                  </p>
                                </div>
                              </div>
                              : <></>
                            }
                          </Card>
                        )}

                        {selectedDetails?.ASSET_NONASSET === "N" && (
                          <Card className="mt-2">
                            <div className="flex flex-wrap justify-between">
                              <h6 className="Header_Text">
                                Soft Service Summary
                              </h6>
                              {currentStatus === 1 && (
                                <Buttons
                                  className="Secondary_Button"
                                  icon="pi pi-pencil"
                                  label={"Edit"}
                                  onClick={() => {
                                    OpenEditStatusDropDown();
                                  }}
                                />
                              )}
                            </div>

                            {editStatus === false && (
                              <div className="mt-2 grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-3 lg:grid-cols-3">
                                <div>
                                  <label className="Text_Secondary Helper_Text  ">
                                    Service Group
                                  </label>
                                  <p className="Text_Primary Alert_Title  ">
                                    {selectedDetails?.ASSETGROUP_NAME}
                                  </p>
                                </div>
                                <div>
                                  <label className="Text_Secondary Helper_Text  ">
                                    Last Maintenance Date
                                  </label>
                                  <p className="Text_Primary Alert_Title  ">
                                    {selectedDetails?.LAST_MAINTANCE_DATE ==
                                      null ||
                                      selectedDetails?.LAST_MAINTANCE_DATE === ""
                                      ? "NA"
                                      :
                                      // moment(
                                      //   selectedDetails?.LAST_MAINTANCE_DATE
                                      // ).format(dateFormat())
                                      onlyDateFormat(selectedDetails?.LAST_MAINTANCE_DATE)
                                    }
                                  </p>
                                </div>
                                <div>
                                  <label className="Text_Secondary Helper_Text  ">
                                    Upcoming Schedule
                                  </label>
                                  <p className="Text_Primary Alert_Title  ">
                                    {selectedDetails?.UPCOMING_SCHEDULE_DATE
                                      ?
                                      // moment(
                                      //   selectedDetails?.UPCOMING_SCHEDULE_DATE
                                      // ).format(dateFormat())

                                      onlyDateFormat(selectedDetails?.UPCOMING_SCHEDULE_DATE)
                                      : "NA"}
                                  </p>
                                </div>
                                <div>
                                  <label className="Text_Secondary Helper_Text  ">
                                    Service Type
                                  </label>
                                  <p className="Text_Primary Alert_Title  ">
                                    {selectedDetails?.ASSETTYPE_NAME}
                                  </p>
                                </div>
                                <div>
                                  <label className="Text_Secondary Helper_Text  ">
                                    Vendor Name
                                  </label>
                                  <p className="Text_Primary Alert_Title  ">
                                    {selectedDetails?.VENDOR_NAME === "" ||
                                      selectedDetails?.VENDOR_NAME === null ||
                                      selectedDetails?.VENDOR_NAME === undefined
                                      ? "NA"
                                      : selectedDetails?.VENDOR_NAME}
                                  </p>
                                </div>
                                <div></div>
                                <div>
                                  <label className="Text_Secondary Helper_Text  ">
                                    Service Name
                                  </label>
                                  <p className="Text_Primary Alert_Title  ">
                                    {selectedDetails?.ASSET_NAME}
                                  </p>
                                </div>
                              </div>
                            )}
                            {editStatus === true && (
                              <div className="mt-2 grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-3 lg:grid-cols-3">
                                <div>
                                  <label className="Text_Secondary Helper_Text  ">
                                    Service Group{" "}
                                    <span className="text-red-600"> *</span>
                                  </label>
                                  <p className="Text_Primary Alert_Title  ">
                                    <Field
                                      controller={{
                                        name: "ASSETGROUP_ID",
                                        control: control,
                                        render: ({ field }: any) => {
                                          return (
                                            <Select
                                              options={EquipmentGroup}
                                              {...register("ASSETGROUP_ID", {
                                                required:
                                                  "Please fill the required fields",
                                                onChange: (e: any) => {
                                                  getSoftServiceGroup();
                                                },
                                              })}
                                              require={false}
                                              optionLabel="ASSETGROUP_NAME"
                                              findKey={"ASSETGROUP_ID"}
                                              selectedData={
                                                selectedDetails?.ASSETGROUP_ID
                                              }
                                              setValue={setValue}
                                              invalid={errors.ASSETGROUP_ID}
                                              {...field}
                                            />
                                          );
                                        },
                                      }}
                                    />
                                  </p>
                                </div>
                                <div>
                                  <label className="Text_Secondary Helper_Text  ">
                                    Last Maintenance Date
                                  </label>
                                  <p className="Text_Primary Alert_Title  ">
                                    {selectedDetails?.LAST_MAINTANCE_DATE ==
                                      null ||
                                      selectedDetails?.LAST_MAINTANCE_DATE === ""
                                      ? "NA"
                                      :
                                      // moment(
                                      //   selectedDetails?.LAST_MAINTANCE_DATE
                                      // ).format(dateFormat())
                                      onlyDateFormat(selectedDetails?.LAST_MAINTANCE_DATE)
                                    }
                                  </p>
                                </div>
                                <div>
                                  <label className="Text_Secondary Helper_Text  ">
                                    Upcoming Schedule
                                  </label>
                                  <p className="Text_Primary Alert_Title  ">
                                    {selectedDetails?.UPCOMING_SCHEDULE_DATE
                                      ?
                                      // moment(
                                      //   selectedDetails?.UPCOMING_SCHEDULE_DATE
                                      // ).format(dateFormat())
                                      onlyDateFormat(selectedDetails?.UPCOMING_SCHEDULE_DATE)
                                      : "NA"}
                                  </p>
                                </div>

                                <div>
                                  <label className="Text_Secondary Helper_Text  ">
                                    Service Type
                                    {/* {" "}<span className="text-red-600"> *</span> */}
                                  </label>
                                  <p className="Text_Primary Alert_Title  ">
                                    <Field
                                      controller={{
                                        name: "ASSETTYPE_ID",
                                        control: control,
                                        render: ({ field }: any) => {
                                          return (
                                            <Select
                                              options={type}
                                              {...register("ASSETTYPE_ID", {
                                                // required: "Please fill the required fields",
                                              })}
                                              require={false}
                                              optionLabel="ASSETTYPE_NAME"
                                              findKey={"ASSETTYPE_ID"}
                                              selectedData={
                                                selectedDetails?.ASSETTYPE_ID
                                              }
                                              setValue={setValue}
                                              invalid={errors.ASSETTYPE_ID}
                                              {...field}
                                            />
                                          );
                                        },
                                      }}
                                    />
                                  </p>
                                </div>
                                <div>
                                  <label className="Text_Secondary Helper_Text  ">
                                    Vendor Name
                                  </label>
                                  <p className="Text_Primary Alert_Title  ">
                                    {selectedDetails?.VENDOR_NAME === "" ||
                                      selectedDetails?.VENDOR_NAME === null ||
                                      selectedDetails?.VENDOR_NAME === undefined
                                      ? "NA"
                                      : selectedDetails?.VENDOR_NAME}
                                  </p>
                                </div>
                                <div></div>
                                <div>
                                  <label className="Text_Secondary Helper_Text  ">
                                    Service Name
                                    {/* {" "} <span className="text-red-600"> *</span> */}
                                  </label>
                                  <p className="Text_Primary Alert_Title  ">
                                    <Field
                                      controller={{
                                        name: "ASSET_ID",
                                        control: control,
                                        render: ({ field }: any) => {
                                          return (
                                            <Select
                                              options={assetList}
                                              {...register("ASSET_ID", {
                                                // required:"Please fill the required fields",
                                              })}
                                              optionLabel="ASSET_NAME"
                                              require={false}
                                              findKey={"ASSET_ID"}
                                              selectedData={
                                                selectedDetails?.ASSET_ID
                                              }
                                              setValue={setValue}
                                              invalid={errors?.ASSET_ID}
                                              {...field}
                                            />
                                          );
                                        },
                                      }}
                                    />
                                  </p>
                                </div>
                                <div>
                                  <label className="Text_Secondary Helper_Text  ">
                                    {" "}
                                    {/* <span className="text-red-600"> *</span> */}
                                  </label>
                                  <p className="Text_Primary Alert_Title  ">
                                    <Field
                                      controller={{
                                        name: "REQ_ID",
                                        control: control,
                                        render: ({ field }: any) => {
                                          return (
                                            <Select
                                              options={issueList}
                                              //options={[]}
                                              {...register("REQ_ID", {
                                                required: "Please fill the required fields",
                                              })}
                                              label={"Issue"}
                                              optionLabel="REQ_DESC"
                                              require={true}
                                              findKey={"REQ_ID"}

                                              selectedData={selectedDetails?.REQ_ID}
                                              setValue={setValue}
                                              invalid={errors.REQ_ID}
                                              {...field}
                                            />
                                          );
                                        },
                                      }}
                                    />
                                  </p>
                                </div>
                              </div>
                            )}
                          </Card>
                        )}
                        <Card className="mt-4">
                          <div className="flex flex-wrap justify-between mb-3">
                            <h6 className="Header_Text">
                              {t("Reporter Details (Optional)")}
                            </h6>
                          </div>
                          <div className=" grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-3 lg:grid-cols-3">
                            <div>
                              <label className="Text_Secondary Helper_Text">
                                Reporter Name
                              </label>
                              {selectedDetails?.CONTACT_NAME === null ||
                                selectedDetails?.CONTACT_NAME === "" ? (
                                <>
                                  <p className="Text_Primary Alert_Title  ">NA</p>
                                </>
                              ) : (
                                <>
                                  <p className="Text_Primary Alert_Title  ">
                                    {selectedDetails?.CONTACT_NAME}
                                  </p>
                                </>
                              )}
                            </div>
                            <div>
                              <label className="Text_Secondary Helper_Text">
                                Reporter Email
                              </label>
                              {selectedDetails?.CONTACT_EMAIL === null ||
                                selectedDetails?.CONTACT_EMAIL === "" ? (
                                <>
                                  <p className="Text_Primary Alert_Title  ">NA</p>
                                </>
                              ) : (
                                <>
                                  <p className="Text_Primary Alert_Title  ">
                                    {selectedDetails?.CONTACT_EMAIL}
                                  </p>
                                </>
                              )}
                            </div>
                            <div>
                              <label className="Text_Secondary Helper_Text">
                                Reporter Phone
                              </label>
                              {selectedDetails?.CONTACT_PHONE === null ||
                                selectedDetails?.CONTACT_PHONE === "" ? (
                                <>
                                  <p className="Text_Primary Alert_Title  ">NA</p>
                                </>
                              ) : (
                                <>
                                  <p className="Text_Primary Alert_Title  ">
                                    {selectedDetails?.CONTACT_PHONE}
                                  </p>
                                </>
                              )}
                            </div>
                            <div>
                              <label className="Text_Secondary Helper_Text">
                                Account
                              </label>
                              {selectedDetails?.SALESFROCE_ACCOUNT === null ||
                                selectedDetails?.SALESFROCE_ACCOUNT === "" ? (
                                <>
                                  <p className="Text_Primary Alert_Title  ">NA</p>
                                </>
                              ) : (
                                <>
                                  <p className="Text_Primary Alert_Title  ">
                                    {selectedDetails?.SALESFROCE_ACCOUNT}
                                  </p>
                                </>
                              )}
                            </div>

                          </div>
                        </Card>
                        {(currentStatus !== 1 && currentStatus !== 5) && (
                          <Card className="mt-2">
                            <div className="flex flex-wrap justify-between">
                              <h6 className="Header_Text">Tasks & Resources</h6>

                              <div className="w-1/2 flex flex-wrap justify-end">
                                {currentStatus !== 1 &&
                                  currentStatus !== 7 &&
                                  currentStatus !== 6 &&
                                  currentStatus !== 5 &&
                                  ViewAddTask === false && (
                                    <div>
                                      <Buttons
                                        className="Secondary_Button mb-1"
                                        // icon="pi pi-plus"
                                        label={"Add Task"}
                                        onClick={() => {
                                          OpenViewAddTask();
                                        }}
                                      />
                                    </div>
                                  )}

                                {currentStatus !== 1 &&
                                  taskList?.length > 0 &&
                                  currentStatus !== 7 &&
                                  currentStatus !== 5 &&
                                  currentStatus !== 6 && (
                                    <Buttons
                                      type="submit"
                                      className="Primary_Button ml-2"
                                      label={"Save Task"}
                                      name={"task"}
                                    />
                                  )}
                              </div>
                            </div>
                            <div className="dashboardTab">
                              <TabView
                                activeIndex={activeTaskIndex}
                                onTabChange={(e) => setActiveTaskIndex(e.index)}
                              >
                                <TabPanel header={t("Tasks")}>
                                  {0 === 0 ? (
                                    <>
                                      {taskList.map(
                                        (category: any, index: any) => {
                                          return currentStatus !== 6 &&
                                            currentStatus !== 7 ? (
                                            <div
                                              key={index}
                                              className="mb-1 flex align-items-center"
                                            >
                                              <Checkbox
                                                inputId={category.TASK_ID}
                                                name="category"
                                                value={index}
                                                onChange={onCategoryChange}
                                                checked={
                                                  category.isChecked === 1
                                                    ? true
                                                    : false
                                                }
                                              />
                                              <label
                                                htmlFor={category.key}
                                                className=" Alert_Title w-full ml-2"
                                              >
                                                {category.TASK_NAME}
                                              </label>
                                            </div>
                                          ) : category.isChecked === 1 ? (
                                            <div
                                              key={index}
                                              className="w-full flex align-items-center"
                                            >
                                              <label
                                                htmlFor={category.key}
                                                className="Alert_Title ml-2"
                                              >
                                                <i className="pi pi-check-square mr-2"></i>
                                                {category.TASK_NAME}
                                              </label>
                                            </div>
                                          ) : <></>

                                        }
                                      )}
                                      <div className=" w-full flex mt-2 gap-2">
                                        {currentStatus !== 1 &&
                                          currentStatus !== 7 &&
                                          currentStatus !== 6 &&
                                          currentStatus !== 5 &&
                                          ViewAddTask === true ? (
                                          <div className="w-full">
                                            <label className="Text_Secondary Helper_Text  ">
                                              Task Details{" "}
                                              <span className="text-red-600">
                                                {" "}
                                                *
                                              </span>
                                            </label>
                                            <Field
                                              controller={{
                                                name: "TASK_NAME",
                                                control: control,
                                                render: ({ field }: any) => {
                                                  return (
                                                    <InputField
                                                      {...register(
                                                        "TASK_NAME",
                                                        {
                                                          // required: "Please fill the required fields",
                                                        }
                                                      )}
                                                      // require={true}
                                                      setValue={setValue}
                                                      {...field}
                                                    />
                                                  );
                                                },
                                              }}
                                            />
                                          </div>
                                        ) : (
                                          <></>
                                        )}

                                        {currentStatus !== 1 &&
                                          currentStatus !== 7 &&
                                          currentStatus !== 6 &&
                                          ViewAddTask === true && (
                                            <div>
                                              <Buttons
                                                className="Secondary_Button mt-5"
                                                icon="pi pi-plus"
                                                label=""
                                                onClick={() => { AddTask() }}
                                              />
                                            </div>
                                          )}
                                      </div>
                                    </>
                                  ) : (
                                    <>No Data Found</>
                                  )}
                                </TabPanel>
                                <TabPanel header={t("Resources")}>
                                  {assetDocList?.length > 0 ? (
                                    <>
                                      {assetDocList.map(
                                        (category: any, index: any) => {
                                          return (
                                            <div
                                              key={index}
                                              className="w-full flex align-items-center"
                                            >
                                              <label
                                                htmlFor={category.key}
                                                className="Alert_Title ml-2"
                                              >
                                                <i className="pi pi-clipboard mr-2"></i>
                                                {category.DOC_NAME}
                                              </label>
                                            </div>
                                          );
                                        }
                                      )}
                                    </>
                                  ) : (
                                    <>No Data Found</>
                                  )}
                                </TabPanel>
                              </TabView>
                            </div>
                          </Card>
                        )}
                      </TabPanel>
                      {currentStatus !== 1 && (
                        <TabPanel headerTemplate={MaterialHeaderTemplate}>
                          {partMatOptions.length === 0 && (
                            <Card className="mt-2">
                              <h6 className="Header_Text">Material Details</h6>
                              <div className="flex items-center mt-2 justify-center w-full">
                                <label
                                  htmlFor="dropzone-file"
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
                                            "No materials added to this work order."
                                          )}
                                        </label>
                                      </>
                                    ) : (
                                      <></>
                                    )}

                                    {(currentStatus !== 4 &&
                                      currentStatus !== 6 &&
                                      currentStatus !== 1 &&
                                      currentStatus === 7) ||
                                      status === "Rectified" ||
                                      currentStatus === 5 ||
                                      currentStatus === 6 ? (
                                      <></>
                                    ) : (
                                      <Buttons
                                        className="Secondary_Button"
                                        icon="pi pi-plus"
                                        label={"Add Material Requisition"}
                                        onClick={() => {
                                          navigate(
                                            `${appName}/materialrequestlist?add=`,
                                            {
                                              state: {
                                                wo_ID: WO_ID,
                                                remark:
                                                  selectedDetails?.WO_REMARKS,
                                                MATREQ_ID:
                                                  selectedDetails?.MATREQ_ID,
                                              },
                                            }
                                          );
                                        }}
                                      />
                                    )}
                                  </div>
                                </label>
                              </div>
                            </Card>
                          )}
                          {partMatOptions.length > 0 && (
                            <Card className="mt-2">
                              {/* <div className="flex flex-wrap">
                          <div className="flex flex-wrap">
                            <img src={reviewIcon} alt="" className="w-10" />
                            <div className="ml-3">
                              <label className="Text_Primary mb-2 Avatar_Initials">
                                Reassignment Request
                              </label>
                              <p className="Text_Primary Input_Text">
                                Unqualified to work on this
                              </p>
                            </div>
                          </div>
                        </div> */}
                              <div>
                                {selectedDetails?.ISMATAPPROVALCNC === false &&
                                  selectedDetails?.ISMATAPPROVED === false &&
                                  selectedDetails?.CURRENT_STATUS === 5 &&
                                  selectedDetails?.SUB_STATUS === "6" ? (
                                  <>
                                    <div className="reviewContainer">
                                      <div className="flex justify-between">
                                        <div className="flex flex-wrap">
                                          <div className="flex flex-wrap">
                                            <img
                                              src={reviewIcon}
                                              alt=""
                                              className="w-10 h-10"
                                            />
                                            <div className="ml-3">
                                              <label className="Text_Primary mb-2 Header_Text">
                                                Material Requisition
                                              </label>

                                              {/* {(selectedDetails?.SUB_STATUS === "6") && (
                                              <>
                                                <p className="Text_Primary Helper_Text">
                                                  {selectedDetails?.ONHOLD_REMARKS}
                                                </p>
                                              </>
                                            )} */}
                                              {selectedDetails?.SUB_STATUS ===
                                                "6" &&
                                                (decryptData(
                                                  localStorage.getItem(
                                                    LOCALSTORAGE?.ROLETYPECODE
                                                  )
                                                ) === "S" || decryptData(
                                                  localStorage.getItem(
                                                    LOCALSTORAGE?.ROLETYPECODE
                                                  )
                                                ) === "SA") && (
                                                  <>
                                                    <p className="Text_Primary Helper_Text">
                                                      Review and approve the
                                                      material requisition for
                                                      this work order.
                                                    </p>
                                                  </>
                                                )}
                                            </div>
                                          </div>
                                        </div>
                                        <SidebarVisibal
                                          reassignVisible={reassignVisible}
                                          headerTemplate={
                                            selectedDetails?.STATUS_DESC
                                          }
                                          selectedParts={selectedParts}
                                          MATERIAL_LIST={materiallist}
                                          PART_LIST={partMatOptions}
                                          subStatus={subStatus}
                                          selectedDetails={selectedDetails}
                                          getOptions={getOptions}
                                          IsVisibleMaterialReqSideBar={
                                            IsVisibleMaterialReqSideBar
                                          }
                                          setVisibleMaterialReqSideBar={
                                            setVisibleMaterialReqSideBar
                                          }
                                        />
                                      </div>
                                    </div>
                                  </>
                                ) : (
                                  <></>
                                )}
                              </div>

                              <div className="flex flex-wrap justify-between">
                                <h6 className="Header_Text">
                                  Material Details
                                </h6>
                                {currentStatus !== 4 &&
                                  currentStatus !== 6 &&
                                  currentStatus !== 1 &&
                                  currentStatus !== 7 &&
                                  currentStatus !== 5 ? (
                                  <Buttons
                                    className="Secondary_Button"
                                    icon="pi pi-plus"
                                    label={"Add Material Requisition"}
                                    onClick={() => {
                                      navigate(
                                        `${appName}/materialrequestlist?add=`,
                                        {
                                          state: {
                                            wo_ID: WO_ID,
                                            remark: selectedDetails?.WO_REMARKS,
                                          },
                                        }
                                      );
                                    }}
                                  />
                                ) : (
                                  <></>
                                )}

                              </div>
                              <div className="mt-2">
                                <DataTable
                                  value={partMatOptions}
                                  showGridlines
                                  emptyMessage={t("No Data found.")}
                                  footer={footer}
                                >
                                  <Column
                                    field="PART_NAME"
                                    header="Material Name"
                                    className="w-30"
                                    body={(rowData: any) => {
                                      return (
                                        <>
                                          <div>
                                            <label className="Text_Primary Alert_Title">
                                              {rowData?.PART_NAME}
                                            </label>
                                            <p className="  Text_Secondary Helper_Text">
                                              {rowData?.PART_CODE}
                                            </p>
                                          </div>
                                        </>
                                      );
                                    }}
                                  ></Column>

                                  <Column
                                    field="MATREQ_NO"
                                    header={t("Mat Req No")}
                                    className="w-30"
                                    body={(rowData: any) => {
                                      const rowItem: any = { ...rowData };
                                      return (
                                        <>
                                          <p
                                            className={`${selectedDetails?.ISMATAPPROVALCNC ===
                                              false &&
                                              selectedDetails?.ISMATAPPROVED ===
                                              false &&
                                              selectedDetails?.CURRENT_STATUS ===
                                              5 &&
                                              selectedDetails?.SUB_STATUS ===
                                              "6"
                                              ? "cursor-pointer"
                                              : ""
                                              } `}
                                            onClick={() => {
                                              GetVisibleSiderBar(0);
                                            }}
                                          >
                                            {rowData.MATREQ_NO}
                                          </p>
                                        </>
                                      );
                                    }}
                                  ></Column>
                                  <Column
                                    field="QTY"
                                    header="Quantity"
                                  ></Column>
                                  {/* 
                                <Column
                                  field="ISSUED_QTY"
                                  header={t("Issued Qty")}
                                  className="w-30"
                                ></Column> */}

                                  {/* <Column
                                  field="UOM_NAME"
                                  header={t("UOM")}
                                  className="w-30"
                                ></Column> */}

                                  <Column
                                    field="STATUS_DESC"
                                    header="Status"
                                  ></Column>
                                  {/* <Column
                                  field="STATUS_DESC"
                                  header="Status"
                                ></Column> */}
                                </DataTable>
                              </div>
                            </Card>
                          )}
                        </TabPanel>
                      )}
                      <TabPanel headerTemplate={ActivityHeaderTemplate}>
                        {timelineList.length == 0 && (
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
                        )}
                        <Card className="mt-2">
                          <h6 className="mb-2 Header_Text">
                            Activity Timeline
                          </h6>
                          <Timeline
                            value={timelineList}
                            className="customized-timeline"
                            content={customizedContent}
                          />
                        </Card>
                      </TabPanel>
                    </TabView>
                  </div>
                </div>
                <div className=" mt-3 ">
                  {(currentStatus !== 7 && currentStatus !== 6 && currentStatus !== 4) ? (
                    <Card>
                      <div className="flex justify-between">
                        <div className=" ">
                          <h6 className="Header_Text">SLA Duration</h6>
                          <p className="Text_Secondary Helper_Text ">
                            {`${(currentStatus === 1 || (currentStatus === 5 && selectedDetails?.RECTIFIED_WITHIN == null)) &&
                              new Date(selectedDetails?.ACKNOWLEDGED_WITHIN) >=
                              // new Date(selectedDetails?.CURRENT_DATE)
                              // currentDate
                              initialTime
                              ? "Acknowledge within"
                              : (currentStatus === 3 || (currentStatus === 5 && selectedDetails?.RECTIFIED_WITHIN != null)) &&
                                new Date(selectedDetails?.RECTIFIED_WITHIN) >=
                                //new Date(selectedDetails?.CURRENT_DATE)
                                initialTime
                                ? "Rectify within"
                                : ""
                              }`}

                            {/* {getStatus()} */}
                          </p>
                          {dateTimeAfterThreeDays !== null &&
                            (currentStatus === 7 || currentStatus === 6 || currentStatus === 4) ? (
                            <></>
                          ) : (
                            <CountdownTimer
                              getOptionDetails={getOptionDetailsOverdue}
                              targetDate={dateTimeAfterThreeDays}
                              current_time={selectedDetails?.CURRENT_TIME_MS}
                            />
                          )}

                          <div className="flex justify-between">
                            <h6 className="Text_Main">
                              {`${(currentStatus === 1 || (currentStatus === 5 && selectedDetails?.RECTIFIED_WITHIN == null))
                                ? selectedDetails?.ACKNOWLEDGED_WITHIN == null ? "NA" : selectedDetails?.ACKNOWLEDGED_WITHIN !==
                                  null &&
                                  new Date(
                                    selectedDetails?.ACKNOWLEDGED_WITHIN
                                  ) <
                                  // new Date(selectedDetails?.CURRENT_DATE)
                                  // new Date()
                                  initialTime
                                  ? "Overdue"
                                  : selectedDetails?.ACKNOWLEDGED_WITHIN !==
                                    null &&
                                    new Date(
                                      selectedDetails?.ACKNOWLEDGED_WITHIN
                                    ) >
                                    // new Date(selectedDetails?.CURRENT_DATE)
                                    //new Date()
                                    initialTime
                                    ? ""
                                    : ""
                                : (currentStatus === 3 || (currentStatus === 5 && selectedDetails?.RECTIFIED_WITHIN != null))
                                  ? selectedDetails?.RECTIFIED_WITHIN ==
                                    null ? "NA"
                                    : selectedDetails?.RECTIFIED_WITHIN !==
                                      null &&
                                      new Date(
                                        selectedDetails?.RECTIFIED_WITHIN
                                      ) <
                                      //new Date()
                                      initialTime
                                      ? "Overdue"
                                      : selectedDetails?.RECTIFIED_WITHIN !==
                                        null &&
                                        new Date(
                                          selectedDetails?.RECTIFIED_WITHIN
                                        ) >
                                        //new Date()
                                        initialTime
                                        ? ""
                                        : ""
                                  : ""
                                }`}
                            </h6>
                          </div>
                        </div>
                        <div>
                          <img src={timeIcon} alt="" />
                        </div>
                      </div>
                    </Card>
                  ) : (
                    <></>
                  )}
                  <Card className=" mt-2 ">

                    <h6 className="Header_Text pb-2">
                      {t("Assignees")} ({technicianList?.length})
                    </h6>
                    <div className="ScrollViewAssigneeTab">
                      {technicianList?.map((tech: any, index: any) => {
                        return (
                          <div className="flex justify-start mt-2" key={index}>
                            <div>
                              <img src={userIcon} alt="" className="w-10" />
                            </div>
                            <div className="ml-2">
                              <label className="Text_Primary Input_Text ">
                                {tech?.USER_NAME}
                              </label>
                              <p className="Secondary_Primary Helper_Text">
                                {tech?.TEAM_NAME}
                              </p>
                            </div>
                          </div>
                        );
                      })}

                    </div>
                  </Card>
                </div>
              </div>
            </> : <></>}
        </form>
      </section>
    </>


  );
};

export default WorkOrderDetailForm;
