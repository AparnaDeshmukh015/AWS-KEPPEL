import InputField from "../../../components/Input/Input";
import "./WorkorderMaster.css";
import Buttons from "../../../components/Button/Button";
import { Card } from "primereact/card";
import { useFieldArray, useForm } from "react-hook-form";
import Field from "../../../components/Field";
import { callPostAPI } from "../../../services/apis";
import { ENDPOINTS } from "../../../utils/APIEndpoints";
import { toast } from "react-toastify";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import moment from "moment";
import WorkOrderDialogBox from "../../../components/DialogBox/WorkOrderDalog";
import Select from "../../../components/Dropdown/Dropdown";
import { useLocation, useNavigate } from "react-router-dom";
import WorkorderRedirectDialogBox from "../../../components/DialogBox/WorkOrderDalog";
import Table from "../../../components/Table/Table";
import TimeCalendar from "../../../components/Calendar/TimeCalendar";
// import SignatureCanvas from "react-signature-canvas";
import { Dropdown } from "primereact/dropdown";
import {
  LOCALSTORAGE,
  convertTime,
  dateFormat,
} from "../../../utils/constants";
import PartDetailsDialogBox from "../../../components/DialogBox/PartDetailsDialogBox";
import { v4 as uuidv4 } from "uuid";
import DocumentUpload from "../../../components/pageComponents/DocumentUpload/DocumentUpload";
import Radio from "../../../components/Radio/Radio";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { base64ToFile } from "../../../utils/helper";
import { OverlayPanel } from "primereact/overlaypanel";
import { Button } from "primereact/button";
import { WorkOrderDetails } from "./WorkOrderDetails";
import WorkOrderReport from "../../../components/DialogBox/WorkorderReportDiloge";
import ReactSignatureCanvas from "react-signature-canvas";
import { Dialog } from "primereact/dialog";
import { decryptData } from "../../../utils/encryption_decryption";

interface WorkorderMasterFormProps {
  selectedData?: {
    RAISED_BY?: string;
    WO_NO?: string;
  };
}

interface taskDetails {
  TASK_ID: string;
  TASK_DES: string;
  TECH_NAME: string;
  TIME: string;
  REMARKS: string;
  WORKFORCE_ID: string;
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
  WO_NO: string;
  WO_TYPE: string;
  LOCATION_NAME: string;
  ASSET_NAME: string;
  ASSETGROUP_NAME: string;
  ASSETTYPE_NAME: string;
  WO_DATE: string;
  WO_REMARKS: string;
  SEVERITY_DESC: string;
  REMARK: string;
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
  ASSETTYPE_ID: string | any;
  ASSETGROUP_ID: string | any;
}

const WorkorderMasterForm = (props: any) => {
  const op: any = useRef(null);
  const { t } = useTranslation();
  const navigate: any = useNavigate();
  const location: any = useLocation();
  let { search } = useLocation();
  const [selectedDetails, setSelectedDetails] = useState<any>([]);
  const [editStatus, setEditStatus] = useState<any | null>(false);
  const [technician, setTechnician] = useState<any | null>([]);
  const [taskList, setTaskList] = useState<any | null>([]);
  const [options, setOptions] = useState<any | null>([]);
  const [optionsDoc, setOptionsDoc] = useState<any | null>([]);
  const [status, setStatus] = useState<any | null>(false);

  const [currentStatus, setCurrentStatus] = useState<any | null>();
  const [sigPad, setSigpad] = useState<any | null>();
  const [selectedParts, setSelectedParts] = useState<any | null>();
  const [workOrderReport, setworkOrderReport] = useState<any>([]);
  const [materialRequest, setMaterialRequest] = useState<any | null>([]);
  let [partOptions, setPartOptions] = useState([]);
  let [imgSrc, setImgSrc] = useState<any | null>();
  const [subStatus, setSubStatus] = useState<any | null>();
  const [approvalStatus, setApprovalStatus] = useState<any | null>(false);

  const [userId, setUserId] = useState<any | null>();
  const [requestTitle, setRequestTitle] = useState<any | null>([]);
  let [locationtypeOptions, setlocationtypeOptions] = useState([]);
  const [type, setType] = useState<any | null>([]);
  const [assetList, setAssetList] = useState<any | null>([]);
  const id: any = decryptData(localStorage.getItem("USER_ID"));
  const assestTypeLabel: any = [
    { name: "Equipment", key: "A" },
    { name: "Soft Services", key: "N" },
  ];
  const partDetailsLabel: any = [
    { name: "Self", key: "S" },
    { name: "Against Work Order", key: "A" },
  ];

  const clearSign = () => {
    sigPad.clear();
  };

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      PARTS_TYPE: "",
      RAISED_BY: props?.selectedData?.RAISED_BY || "",
      STRUCTURE_ID: "",
      ASSET_NONASSET: "",
      ASSETTYPE: "",
      REQ_DESC: "",
      DESCRIPTION: "",
      SEVERITY_CODE: "",
      TASK_DES: "",
      WORK_ORDER_NO: "",
      WO_NO:
        props?.selectedData !== undefined ? props?.selectedData?.WO_NO : "",
      WO_TYPE: "CM",
      LOCATION_NAME: "",
      ASSET_NAME: "",
      ASSETGROUP_NAME: "",
      ASSETTYPE_NAME: "",
      WO_DATE: "",
      WO_REMARKS: "",
      SEVERITY_DESC: "",
      TASKDETAILS: [
        {
          TASK_ID: "0",
          TASK_DES: "0",
          TECH_NAME: "0",
          TIME: "00:00",
          WORKFORCE_ID: "0",
          REMARKS: "0",
        },
      ],
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
    },
    mode: "all",
  });

  const ASSETIDwatch: any = watch("ASSET_ID");
  const ASSET_NONASSET: any = watch("ASSET_NONASSET");
  const watchAll: any = watch();
  const { fields } = useFieldArray({
    name: "TASKDETAILS",
    control,
  });

  const { append, remove } = useFieldArray({
    name: "DOC_LIST",
    control,
  });
  const doclistWatch: any = watch("DOC_LIST");
  const ASSIGN_TEAM_ID1: any = watch("ASSIGN_TEAM_ID");
  const description: any = watch("DESCRIPTION");

  const partWatch: any = watch("PARTS_TYPE");
  const partListWatch: any = watch("PART_LIST");

  const watchTaskDetails: any = watch("TASKDETAILS");

  const handlerAdd = (e: any) => {
    const isLastRowFilled = watchTaskDetails.every(
      (entry: any) =>
        entry.TASK_DES !== "" &&
        entry.TASK_NO !== null &&
        entry.REMARKS !== null &&
        entry.TIME !== null
    );

    if (isLastRowFilled) {
      const newField: any = {
        TASK_NO: fields?.length + 1,
        TASK_DES: "",
        TECH_NAME: "",
        TIME: convertTime("00:00"),
        REMARKS: "",
      };
      const updatedFields: any = [...watchTaskDetails, newField];
      setValue("TASKDETAILS", updatedFields);
    } else {
      toast.error("Please fill in the current row before adding a new one.");
    }
  };

  //Status change
  const handlingStatus = async (
    e: any,
    REMARK: any,
    statusCode?: any,
    type?: any,
    REASON_ID?: any
  ) => {
    const { name, id } = e.target;
    let isValid: any = true;
    let eventType: any = "";
    let eventPara: any = "";
    if (REMARK === "CANCELLED" || type === "") {
      eventType = "CANCELLED";
      eventPara = { para1: `Redirect Request`, para2: "Cancelled" };
    } else if (REMARK === "APPROVE" || type === "") {
      eventType = "APPROVE";
      eventPara = { para1: `Redirect Request`, para2: "Approved" };
      setApprovalStatus(false);
    } else if (REMARK === "Acknowledge" || type === "") {
      eventType = "ATT";
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
      if (sigPad.isEmpty() === false) {
        eventType = "COMP";
        eventPara = { para1: `Work order`, para2: "Completed" };
        isValid = true;
      } else {
        isValid = false;
        toast.error("Please select digital signature ");
      }
    }

    const data = await sigPad?.toDataURL();

    const result: any = data?.split("image/png;base64,")[1];
    const payloadDoc: any = {
      DOC_SRNO: 1,
      DOC_NAME: "Digital_Sign" + props?.selectedData?.WO_ID,
      DOC_DATA: result,
      DOC_EXTENTION: "image/png",
      DOC_SYS_NAME: uuidv4(),
      ISDELETE: false,
      DOC_TYPE: "D",
    };

    const payload: any = {
      ACTIVE: 1,
      WO_ID: props?.selectedData?.WO_ID,
      WO_NO: props?.selectedData?.WO_NO,
      MODE: "A",
      EVENT_TYPE: eventType,
      REMARKS: REMARK,
      SUB_STATUS: statusCode
        ? statusCode
        : statusCode?.STATUS_CODE !== undefined
          ? statusCode?.STATUS_CODE
          : "",
      DOC_LIST: currentStatus === 4 ? [payloadDoc] : doclistWatch,
      DOC_DATE: moment(new Date()).format(dateFormat()),
      REASON_ID: REASON_ID,
      PARA: eventPara,
    };
    if (isValid === true) {
      const res = await callPostAPI(ENDPOINTS.SET_WORKSTATUS_Api, payload);
      if (res.FLAG === true) {
        toast.success(res?.MSG);
        getOptionDetails(props?.selectedData?.WO_ID);
        props?.getAPI();
        if (id === "CANCEL") {
          props?.isClick();
        }
      }
    }

    // } else {
    //   toast.error('Add Signature');
    // }
  };

  // Get Technician List
  const getTechnicianList = async (ASSIGN_TEAM_ID: any) => {
    const res = await callPostAPI(ENDPOINTS?.GET_TECHNICIANLIST, {
      TEAM_ID: ASSIGN_TEAM_ID?.TEAM_ID,
    });

    if (res?.FLAG === 1) {
      setTechnician(res?.TECHLIST);
    }
  };

  //taskList
  const getTaskList = async (ASSET_ID: any, ASSETTYPE_ID: any) => {
    const payload: any = {
      ASSET_ID: ASSET_ID,
      ASSETTYPE_ID: ASSETTYPE_ID,
    };

    try {
      const res = await callPostAPI(ENDPOINTS?.TASK_LIST, payload);

      if (res?.FLAG === 1) {
        setTaskList(res?.TASKLIST);
      }
    } catch (error: any) {
      toast.error(error);
    }
  };

  const getOptionDetails = async (WO_ID: any) => {
    //const woId:any=localStorage.getItem('Id').
    const payload: any = { WO_ID: WO_ID };
    const res: any = await callPostAPI(
      ENDPOINTS.GET_WORKORDER_DETAILS,
      payload
    );

    if (res?.FLAG === 1) {
      // props?.getAPI();
      setSelectedDetails(res?.WORKORDERDETAILS[0]);
      setStatus(res?.WORKORDERDETAILS[0]?.STATUS_DESC);
      setCurrentStatus(res?.WORKORDERDETAILS[0]?.CURRENT_STATUS);
      setValue("WORK_ORDER_NO", res?.WORKORDERDETAILS[0]?.WO_NO);
      setValue("WO_TYPE", res?.WORKORDERDETAILS[0]?.WO_TYPE);
      setValue("RAISED_BY", res?.WORKORDERDETAILS[0]?.USER_NAME);
      setValue("LOCATION_NAME", res?.WORKORDERDETAILS[0]?.LOCATION_NAME);
      setValue(
        "WO_DATE",
        moment(res?.WORKORDERDETAILS[0]?.WO_DATE).format(dateFormat())
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

      setSubStatus(res?.WORKORDERDETAILS[0]?.SUB_STATUS);
      if (
        (res?.WORKORDERDETAILS[0]?.CURRENT_STATUS === 5 &&
          decryptData(localStorage.getItem("ROLETYPECODE")) === "SA") ||
        decryptData(localStorage.getItem("ROLETYPECODE")) === "S" ||
        decryptData(localStorage.getItem("ROLETYPECODE")) === "BM" ||
        decryptData(localStorage.getItem("ROLETYPECODE")) === "SM"
      ) {

        setApprovalStatus(true);
      }

      const updateTime: any = res?.WORKORDERTASKLIST?.map(
        (task: any, index: any) => {
          return {
            REMARKS: task?.REMARKS,
            STATUS: task?.REMARKS,
            TASK_ACTUALTIME: task?.TASK_ACTUALTIME,
            TASK_DESC: task?.TASK_DESC,
            TASK_ID: task?.TASK_ID,
            TASK_SRNO: task?.TIME_UOM_CODE,
            TIME_UOM_CODE: task?.REMARKS,
            WORKFORCE_ID: task?.WORKFORCE_ID,
            WO_ID: task?.WO_ID,
            TIME: convertTime(task?.TASK_ACTUALTIME),
          };
        }
      );
      setValue(
        "TASKDETAILS",
        res?.WORKORDERTASKLIST?.length > 0
          ? updateTime
          : [
            {
              TASK_ID: "0",
              TASK_DES: "0",
              TECH_NAME: "0",
              TIME: new Date(),
              WORKFORCE_ID: "0",
              REMARKS: "",
            },
          ]
      );
      const docData: any =
        "data:image/png;base64," + res?.DIGITALSIGNATURE[0]?.DOC_DATA;

      setImgSrc(docData);
      getTechnicianList(res?.WORKORDERDETAILS[0]?.ASSIGN_TEAM_ID);
      getWoOrderList(
        res?.WORKORDERDETAILS[0]?.ASSETTYPE_ID,
        res?.WORKORDERDETAILS[0]?.ASSET_NONASSET
      );

      if (
        res?.WORKORDERDETAILS[0]?.ASSET_ID != undefined &&
        res?.WORKORDERDETAILS[0]?.CURRENT_STATUS >= 3
      ) {
        getTaskList(
          res?.WORKORDERDETAILS[0]?.ASSET_ID,
          res?.WORKORDERDETAILS[0]?.ASSETTYPE_ID
        );
      }

      setworkOrderReport({
        workOrderReport: res?.WORKORDERDETAILS[0],
        tasklist: res?.TASKLIST,
        digitalSign: res?.DIGITALSIGNATURE[0],
      });
      if (res?.WORKORDERDETAILS[0]?.CURRENT_STATUS >= 3) {
        const payload: any = {
          MATREQ_ID: res?.WORKORDERDETAILS[0]?.MATREQ_ID,
          MATREQ_NO: res?.WORKORDERDETAILS[0]?.MATREQ_NO,
        };
        try {
          const res1 = await callPostAPI(
            ENDPOINTS.GET_MATERIAL_REQUISITION_DETAILS,
            payload
          );
          let newData = res1?.PARTLIST.map((item: any) => ({
            ...item,
            MATREQ_NO: res1?.MATREQUISITIONDETAILS[0]?.MATREQ_NO,
          }));
          setMaterialRequest(newData);
        } catch (error: any) {
          toast.error(error);
        }
      }

      if (res?.WORKORDERDETAILS[0]?.CURRENT_STATUS >= 3) {
        const payload = {
          RAISED_BY: decryptData(localStorage.getItem("USER_ID")),
          RETURN_TYPE: partWatch?.key,
          WO_ID: WO_ID,
        };

        const res1 = await callPostAPI(ENDPOINTS.GET_PARTS, payload);
        if (res?.FLAG === 1) {
          setValue("PART_LIST", res1?.PARTDETAILS);
          setSelectedParts(res1?.PARTDETAILS);
          setPartOptions(res1?.PARTDETAILS);
        } else {
          setValue("PART_LIST", []);
          setSelectedParts([]);
          setPartOptions([]);
        }
      }

      setOptionsDoc({
        assetDocList: res?.ASSETDOCLIST,
        workOrderDocList: res?.WORKORDERDOCLIST,
      });
    }
  };

  const onSubmit = async (payload: any, e: any) => {
    const buttonMode: any = e?.nativeEvent?.submitter?.name;
    payload.ACTIVE = 1;
    if (editStatus === true) {
      try {
        delete payload?.ASSETGROUP_NAME;
        delete payload?.ASSETTYPE;
        delete payload?.ASSETTYPE_NAME;
        delete payload?.LOCATION_NAME;
        delete payload?.SEVERITY_DESC;
        delete payload?.TASKDETAILS;
        delete payload?.PART_LIST;
        delete payload?.PARTS_TYPE;
        delete payload?.ASSET_NAME;
        delete payload?.TEAM_NAME;
        delete payload?.TASK_DES;
        delete payload?.TECH_NAME;

        payload.ASSET_NONASSET = selectedDetails?.ASSET_NONASSET;
        payload.ASSETGROUP_ID = payload?.ASSETGROUP_ID?.ASSETGROUP_ID;
        payload.ASSETTYPE_ID = payload?.ASSETTYPE_ID?.ASSETTYPE_ID;
        payload.ASSET_ID = payload?.ASSET_ID?.ASSET_ID;
        payload.LOCATION_ID = payload?.LOCATION_ID?.LOCATION_ID;
        payload.RAISED_BY = payload?.RAISEDBY_ID?.USER_ID;
        payload.REQ_ID = payload?.REQ_ID?.REQ_ID;
        payload.SEVERITY_CODE = selectedDetails?.SEVERITY_CODE;
        payload.ASSIGN_TEAM_ID = selectedDetails.ASSIGN_TEAM_ID;
        payload.TECH_ID = payload?.TECH_ID;
        payload.WO_ID = props.selectedData?.WO_ID;
        const res = await callPostAPI(ENDPOINTS.SAVE_WORKORDER, payload);
        if (res?.FLAG === true) {
          setEditStatus(false);
          getOptionDetails(props.selectedData?.WO_ID);
        }
      } catch (error: any) {
        toast?.error(error);
      }
    } else {
      delete payload?.RAISED_BY;
      delete payload?.STRUCTURE_ID;
      delete payload?.ASSET_NONASSET;
      delete payload?.REQ_DESC;
      delete payload?.DESCRIPTION;
      delete payload?.SEVERITY_CODE;
      delete payload?.TASK_DES;
      delete payload?.WORK_ORDER_NO;
      delete payload?.WO_TYPE;
      delete payload?.LOCATION_NAME;
      delete payload?.ASSET_NAME;
      delete payload?.WO_DATE;
      delete payload?.WO_REMARKS;
      delete payload?.SEVERITY_DESC;
      delete payload?.REAMRK;
      delete payload?.DOCTYPE_CONFIG_LIST;
      delete payload?.TEAM_NAME;
      delete payload?.ASSETTYPE;
      delete payload?.ASSIGN_TEAM_ID;
      payload.WO_ID = props.selectedData?.WO_ID;
      const isAnyQTYUndefined = partListWatch.some(
        (item: any) =>
          item.USED_QUANTITY === undefined ||
          item.USED_QUANTITY === null ||
          item?.USED_QUNATITY === ""
      );

      if (buttonMode === "task") {
        const isLastRowFilled = watchTaskDetails.every(
          (entry: any) => entry.TASK_ID !== "" && entry.WORKFORCE_ID !== null
        );
        const updateTaskList = watchTaskDetails?.map(
          (task: any, index: any) => {
            const time: any = moment(task?.TIME).format("HH:mm").split(":")[0];
            const time1: any = moment(task?.TIME).format("HH:mm").split(":")[1];
            let actulatime: any = parseInt(time) * 60 + parseInt(time1);

            return {
              TASK_ID: task?.TASK_ID,
              TASK_NAME: task?.TASK_DES,
              TASK_ACTUALTIME: actulatime,
              TECH_ID: task?.WORKFORCE_ID,
              TIME_UOM_CODE: "M",
              SHOW_ACTUAL_TIME: moment(task?.TIME).format("HH:mm"),
              REMARKS: task?.REMARKS,
            };
          }
        );

        payload.TASKDETAILS = updateTaskList;
        payload.MODE = "A";
        payload.REMARK = "ttest";
        payload.TECH_ID = "0";
        payload.PARTLIST = [];
        payload.PARA = { para1: `Task Details`, para2: "created" };

        try {
          if (isLastRowFilled) {
            const res = await callPostAPI(ENDPOINTS.SAVE_WO_TASK_PART, payload);
            if (res.FLAG === true) {
              toast?.success(res?.MSG);
              getOptionDetails(props?.selectedData?.WO_ID);
            } else {
              toast?.error(res?.MSG);
            }
          } else {
            toast.error(
              "Please fill in the current row before adding a new one."
            );
          }
        } catch (error: any) {
          toast?.error(error);
        }
      }
      if (buttonMode === "parts") {
        payload.RAISED_BY = decryptData(localStorage.getItem("USER_ID"));
        payload.RETURN_TYPE = partWatch?.key;
        payload.PARTLIST = partListWatch;
        payload.PARA = { para1: `Part Details`, para2: "created" };
        payload.TASKDETAILS = [];
        if (isAnyQTYUndefined === false) {
          try {
            const res = await callPostAPI(ENDPOINTS.SAVE_USEDPARTS, payload);
            if (res.FLAG === true) {
              toast?.success(res?.MSG);
              getOptionDetails(props?.selectedData?.WO_ID);
              //props?.isClick();
            } else {
              toast?.error(res?.MSG);
            }
          } catch (error: any) {
            toast?.error(error);
          }
        } else {
          toast.error("please fill the used quantity ");
        }
      }
    }
    // }
  };

  useEffect(() => {
    if (location?.state !== null) {
      getOptionDetails(location?.state);
    }
    if (ASSIGN_TEAM_ID1) {
      getTechnicianList(ASSIGN_TEAM_ID1);
    }
    if (partWatch && currentStatus >= 3) {
      getpartDetails();
    }
    //
  }, [location?.state, ASSIGN_TEAM_ID1, partWatch]);

  useEffect(() => {
    getOptionDetails(props?.selectedData?.WO_ID);
  }, []);

  useEffect(() => {
    const nestedErrors: any = errors?.TASKDETAILS || {};
    const firstError: any = Object?.values(nestedErrors)[0];
    const error: any = [];
    if (!isSubmitting) {
      if (!isSubmitting) {
        for (const key in firstError) {
          if (Object.prototype.hasOwnProperty.call(firstError, key)) {
            const fieldError = firstError[key];
            if (fieldError?.type === "required") {
              const errorMessage = fieldError?.message;
              error.push(errorMessage);
            }
          }
        }
      }
      if (error?.length > 0) {
        toast?.error(t("Please fill the required fields."));
      }
    }
  }, [errors, isSubmitting]);

  const deleteHandler = (e: any, el1: any) => {
    if (watchTaskDetails?.length > 0) {
      const lastIndex = watchTaskDetails.pop();
      const task = fields.pop();
      setValue("TASKDETAILS", watchTaskDetails);
    } else {
      toast.error("You cann't delete data");
    }
  };

  const handleDropdownChange = (
    event: { target: { name: string; value: any } },
    index: number
  ) => {
    const { name, value } = event.target;
    if (watchTaskDetails[0]?.TASK_ID !== 0) {
      if (name === `TASKDETAILS.${index}.TASK_DES`) {
        const taskId: any = watchTaskDetails?.filter(
          (task: any) => task?.TASK_ID === value.TASK_ID
        );
        if (taskId?.length <= 0) {
          setValue(`TASKDETAILS.${index}.TASK_DES`, value?.TASK_NAME);
          setValue(`TASKDETAILS.${index}.TASK_ID`, value?.TASK_ID);
        } else {
          toast.error("Task already exist");
        }
      } else if (name === `TASKDETAILS.${index}.WORKFORCE_ID`) {
        const workforceId: any = watchTaskDetails?.filter(
          (task: any) => task?.WORKFORCE_ID === value.USER_ID
        );
        if (workforceId?.length <= 0) {
          setValue(`TASKDETAILS.${index}.WORKFORCE_ID`, value?.USER_ID);
        } else {
          toast.error("already exist");
        }
      } else if (name === `TASKDETAILS.${index}.TIME`) {
        setValue(`TASKDETAILS.${index}.TIME`, value);
        const updatedTaskDetails = [...watchTaskDetails];
        updatedTaskDetails[index].TIME = value;
      }
    } else {
      if (name === `TASKDETAILS.${index}.TASK_DES`) {
        setValue(`TASKDETAILS.${index}.TASK_DES`, value?.TASK_NAME);
        setValue(`TASKDETAILS.${index}.TASK_ID`, value?.TASK_ID);
      } else if (name === `TASKDETAILS.${index}.WORKFORCE_ID`) {
        setValue(`TASKDETAILS.${index}.WORKFORCE_ID`, value?.USER_ID);
      } else if (name === `TASKDETAILS.${index}.TIME`) {
        setValue(`TASKDETAILS.${index}.TIME`, value);
      }
    }
  };

  const getpartDetails = async () => {
    const payload = {
      RAISED_BY: decryptData(localStorage.getItem("USER_ID")),
      RETURN_TYPE: partWatch?.key,
      WO_ID: props?.selectedData?.WO_ID,
    };

    const res1 = await callPostAPI(ENDPOINTS.GET_PARTS, payload);
    // const res1 = await callPostAPI(ENDPOINTS.GET_PARTS, payload);
    if (res1?.FLAG === 1) {
      setValue("PART_LIST", res1?.PARTDETAILS);
      setSelectedParts(res1?.PARTDETAILS);
      setPartOptions(res1?.PARTDETAILS);
    } else {
      setValue("PART_LIST", []);
      setSelectedParts([]);
      setPartOptions([]);
    }
  };

  const getWoOrderList = async (ASSETTYPE_ID: any, ASSET_NONASSET?: any) => {
    const payload: any = {
      ASSETTYPE_ID: ASSETTYPE_ID,
      ASSET_NONASSET: ASSET_NONASSET?.key
        ? ASSET_NONASSET?.key
        : ASSET_NONASSET,
    };

    const res = await callPostAPI(
      ENDPOINTS.GET_SERVICEREQUEST_WORKORDER,
      payload
    );
    if (res?.FLAG === 1) {
      setRequestTitle(res?.WOREQLIST);
    } else if (res?.FLAG === 0) {
      setRequestTitle([]);
    }
  };

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
        <div className="Text_Primary Input_Label">{option.LOCATION_NAME}</div>
        <div className=" Text_Secondary Helper_Text">
          {option.LOCATION_DESCRIPTION}
        </div>
      </div>
    );
  };

  const getOptions = async () => {
    try {
      const res = await callPostAPI(ENDPOINTS.GET_SERVICEREQUST_MASTERLIST, {});
      const res1 = await callPostAPI(ENDPOINTS.LOCATION_HIERARCHY_LIST, null);

      if (res?.FLAG === 1) {
        setlocationtypeOptions(res1?.LOCATIONHIERARCHYLIST);
        setOptions({
          assetGroup: res?.ASSETGROUPLIST.filter(
            (f: any) => f.ASSETGROUP_TYPE === ASSET_NONASSET
          ),
          assetType: res?.ASSETTYPELIST,
          assestOptions: res?.ASSETLIST,
        });
      }
      setUserId(parseInt(id));
      if (search === "?edit=") {
        //sessionStorage.setItem("Id",props?.selectedData?.WO_ID )
        getOptionDetails(props?.selectedData?.WO_ID);

        // setEditStatus(true);
      }
    } catch (error: any) {
      toast.error(error);
    }
  };

  useEffect(() => {
    // if (watchAll?.ASSETGROUP_ID) {
    const assetGroupId: any = watchAll?.ASSETGROUP_ID
      ? watchAll?.ASSETGROUP_ID?.ASSETGROUP_ID
      : watchAll?.ASSETGROUP_ID?.ASSETGROUP_ID;
    const assetTypeList: any = options?.assetType?.filter(
      (f: any) => f?.ASSETGROUP_ID === assetGroupId
    );

    setType(assetTypeList);
    // }
  }, [watchAll?.ASSETGROUP_ID]);

  useEffect(() => {
    // if (watchType) {
    const assetTypeId = watchAll?.ASSETTYPE_ID
      ? watchAll?.ASSETTYPE_ID?.ASSETTYPE_ID
      : watchAll?.ASSETTYPE_ID?.ASSETTYPE_ID;
    const assetList: any = options?.assestOptions?.filter(
      (f: any) => f.ASSETTYPE_ID === assetTypeId
    );

    setAssetList(assetList);
  }, [watchAll?.ASSETTYPE_ID]);

  useEffect(() => {
    if (editStatus === true) {
      getOptions();
    }
  }, [editStatus]);

  return (
    <>
      <section className="w-full">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex justify-between mt-1">
            <div>
              <h6 className="Text_Primary">{t("Work Order Details")}</h6>
            </div>
            <div>
              <h6
                className={`${currentStatus === 1
                  ? "Open"
                  : currentStatus === 2
                    ? "Acknowledge"
                    : currentStatus === 3
                      ? "WorkInProgress"
                      : currentStatus === 5
                        ? "OnHoldForParts"
                        : currentStatus === 4
                          ? "Rectified"
                          : currentStatus === 7
                            ? "Completed"
                            : "Text_Primary"
                  }`}
              >
                {status}
              </h6>
            </div>

            <div className="">
              <Buttons
                className="Secondary_Button w-20 mr-2 "
                label={"List"}
                onClick={props?.isClick}
              />
              {editStatus === false &&
                currentStatus !== 3 &&
                currentStatus !== 5 &&
                currentStatus !== 7 &&
                currentStatus !== 4 && (
                  <Buttons
                    className="Secondary_Button w-20 mr-2 "
                    label={"Edit"}
                    onClick={() => {
                      setEditStatus(true);
                    }}
                  />
                )}
              {editStatus === true && (
                <Buttons
                  className="Primary_Button w-20 mr-2"
                  label={"Save"}
                  type="submit"
                />
              )}

              <Button
                icon="pi pi-ellipsis-v"
                className="Primary_Button "
                onClick={(e: any) => op.current.toggle(e)}
              />
              <OverlayPanel ref={op}>
                <div className="flex flex-col">
                  <> </>

                  <>
                    {currentStatus !== 1 &&
                      status !== "Cancelled" &&
                      currentStatus !== 4 &&
                      currentStatus !== 2 &&
                      currentStatus !== 7 &&
                      currentStatus === 3 && (
                        <WorkOrderDialogBox
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
                          WO_ID={props?.selectedData?.WO_ID}
                          getAPI={props?.getAPI}
                          STATUS_CODE={"STATUS_CODE"}
                          currentStatus={currentStatus}
                          op={op}
                          errors={errors}
                          isSubmitting={isSubmitting}
                        />
                      )}
                  </>
                  <>
                    {currentStatus !== 1 &&
                      status !== "Cancelled" &&
                      status !== "Rectified" &&
                      currentStatus !== 2 &&
                      currentStatus !== 7 &&
                      currentStatus !== 5 &&
                      subStatus !== "0" && (
                        <Buttons
                          className=" WO_Button me-2"
                          label={"Request Material"}
                          onClick={() => {
                            navigate("/materialrequestlist?add=", {
                              state: {
                                wo_ID: props?.selectedData?.WO_ID,
                                remark: selectedDetails?.WO_REMARKS,
                              },
                            });
                          }}
                        />
                      )}
                  </>
                  <>
                    {currentStatus === 1 && (
                      <Buttons
                        className=" WO_Button  me-2"
                        type="button"
                        name="ACK"
                        label={"Acknowledge"}
                        onClick={(e: any) => handlingStatus(e, "Acknowledge")}
                      />
                    )}
                  </>

                  {currentStatus === 2 && (
                    <WorkorderRedirectDialogBox
                      control={control}
                      header={"Redirect"}
                      setValue={setValue}
                      register={register}
                      name={"Redirect"}
                      REMARK={""}
                      handlingStatus={""}
                      watch={watch}
                      ASSIGN_TEAM_ID={"ASSIGN_TEAM_ID"}
                      label={"Redirect"}
                      WO_ID={props?.selectedData?.WO_ID}
                      getAPI={props?.getAPI}
                    />
                  )}
                  {currentStatus === 1 && (
                    <WorkorderRedirectDialogBox
                      control={control}
                      header={"Redirect"}
                      setValue={setValue}
                      register={register}
                      name={"Redirect"}
                      REMARK={""}
                      handlingStatus={""}
                      watch={watch}
                      ASSIGN_TEAM_ID={"ASSIGN_TEAM_ID"}
                      label={"Redirect"}
                      WO_ID={props?.selectedData?.WO_ID}
                      getAPI={props?.getAPI}
                      currentStatus={currentStatus}
                    />
                  )}

                  {(currentStatus !== undefined && (currentStatus === 2 || currentStatus === 1)) && (
                    <WorkorderRedirectDialogBox
                      control={control}
                      header={"Redirect"}
                      setValue={setValue}
                      register={register}
                      name={"Redirect"}
                      REMARK={""}
                      handlingStatus={""}
                      watch={watch}
                      ASSIGN_TEAM_ID={"ASSIGN_TEAM_ID"}
                      label={"Redirect"}
                      WO_ID={props?.selectedData?.WO_ID}
                      getAPI={props?.getAPI}
                    />
                  )}

                  {currentStatus === 4 && (
                    <>
                      <WorkOrderDialogBox
                        header={"Complete"}
                        title={
                          "Are you sure you want to Complete the workorder?"
                        }
                        control={control}
                        setValue={setValue}
                        register={register}
                        name={"Complete"}
                        REMARK={"REMARK"}
                        handlingStatus={handlingStatus}
                        watch={watch}
                        label={"Complete"}
                        currentStatus={currentStatus}
                      />
                    </>
                  )}

                  {currentStatus === 7 && (
                    <WorkOrderReport
                      workOrderReport={WorkOrderReport}
                      label="Print"
                      header="Work Order Report"
                    />
                  )}

                  {currentStatus !== 1 &&
                    status !== "Cancelled" &&
                    currentStatus !== 4 &&
                    currentStatus !== 7 && (
                      <>
                        {currentStatus !== 5 ? (
                          <WorkOrderDialogBox
                            header={"Rectified"}
                            title={
                              "Are you sure you want to rectify the workorder?"
                            }
                            control={control}
                            setValue={setValue}
                            register={register}
                            name={"RCT"}
                            REMARK={"REMARK"}
                            handlingStatus={handlingStatus}
                            watch={watch}
                            label={"Rectified"}
                          />
                        ) : (
                          <Buttons
                            className=" WO_Button  me-2"
                            type="button"
                            name="ACK"
                            label={"Rectified"}
                            onClick={(e: any) =>
                              toast.error(
                                "You can not rectify this order is already on hold."
                              )
                            }
                          />
                        )}
                      </>
                    )}
                </div>
              </OverlayPanel>
            </div>
          </div>

          <Card className="mt-2">
            <Dialog
              header="Redirect Approve"
              visible={approvalStatus}
              style={{ width: "20vw" }}
              onHide={() => {
                setApprovalStatus(false);
              }}
            >
              <p>Do you want to approve?</p>
              <Buttons
                className="Primary_Button  w-28 me-2"
                type="button"
                name="APPROVE"
                label={"Approve"}
                onClick={(e: any) => handlingStatus(e, "APPROVE")}
              />
              <Buttons
                className="Secondary_Button w-28 "
                type="button"
                name="CANCELLED"
                label={"Cancel"}
                onClick={(e: any) => handlingStatus(e, "CANCELLED")}
              />
            </Dialog>
            <div className=" grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-3 lg:grid-cols-3">
              <Field
                controller={{
                  name: "WORK_ORDER_NO",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <InputField
                        {...register("WORK_ORDER_NO")}
                        label="Work Order No."
                        disabled
                        {...field}
                      />
                    );
                  },
                }}
              />
              <Field
                controller={{
                  name: "WO_TYPE",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <InputField
                        {...register("WO_TYPE")}
                        label="Work Order Type"
                        disabled
                        {...field}
                      />
                    );
                  },
                }}
              />
              <Field
                controller={{
                  name: "RAISED_BY",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <InputField
                        {...register("RAISED_BY")}
                        label="Raised By"
                        disabled
                        {...field}
                      />
                    );
                  },
                }}
              />
              <Field
                controller={{
                  name: "LOCATION_NAME",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <>
                        {editStatus === true ? (
                          <Field
                            controller={{
                              name: "LOCATION_ID",
                              control: control,
                              render: ({ field }: any) => {
                                return (
                                  <Select
                                    options={locationtypeOptions}
                                    {...register("LOCATION_ID", {})}
                                    label="Location "
                                    optionLabel="LOCATION_DESCRIPTION"
                                    valueTemplate={selectedLocationTemplate}
                                    itemTemplate={locationOptionTemplate}
                                    findKey={"LOCATION_ID"}
                                    selectedData={selectedDetails?.LOCATION_ID}
                                    setValue={setValue}
                                    {...field}
                                  />
                                );
                              },
                            }}
                          />
                        ) : (
                          <InputField label="Location" disabled {...field} />
                        )}
                      </>
                    );
                  },
                }}
              />
              {editStatus === true ? (
                <Field
                  controller={{
                    name: "ASSETGROUP_ID",
                    control: control,
                    render: ({ field }: any) => {
                      return (
                        <Select
                          options={options?.assetGroup}
                          {...register("ASSETGROUP_ID", {})}
                          label="Asset Group "
                          optionLabel="ASSETGROUP_NAME"
                          findKey={"ASSETGROUP_ID"}
                          selectedData={selectedDetails?.ASSETGROUP_ID}
                          setValue={setValue}
                          {...field}
                        />
                      );
                    },
                  }}
                />
              ) : (
                <Field
                  controller={{
                    name: "ASSETGROUP_NAME",
                    control: control,
                    render: ({ field }: any) => {
                      return (
                        <InputField
                          {...register("ASSETGROUP_NAME")}
                          label="Work Order Type"
                          disabled
                          {...field}
                        />
                      );
                    },
                  }}
                />
              )}

              {editStatus === true ? (
                <Field
                  controller={{
                    name: "ASSETTYPE_ID",
                    control: control,
                    render: ({ field }: any) => {
                      return (
                        <Select
                          options={type}
                          {...register("ASSETTYPE_ID", {
                            required:
                              editStatus === true
                                ? "Please fill the required fields"
                                : "",
                            onChange: (e: any) => {
                              getWoOrderList(
                                e?.target?.value?.ASSETTYPE_ID,
                                e?.target?.value?.ASSETTYPE
                              );
                            },
                          })}
                          label={
                            ASSET_NONASSET?.key === "A" ||
                              ASSET_NONASSET === "A"
                              ? "Equipment Type "
                              : "Service Type"
                          }
                          require={true}
                          optionLabel="ASSETTYPE_NAME"
                          findKey={"ASSETTYPE_ID"}
                          selectedData={selectedDetails?.ASSETTYPE_ID}
                          setValue={setValue}
                          invalid={errors.ASSETTYPE_ID}
                          {...field}
                        />
                      );
                    },
                  }}
                />
              ) : (
                <Field
                  controller={{
                    name: "ASSETTYPE_NAME",
                    control: control,
                    render: ({ field }: any) => {
                      return (
                        <InputField
                          {...register("ASSETTYPE_NAME")}
                          label="Asset Type"
                          disabled
                          {...field}
                        />
                      );
                    },
                  }}
                />
              )}
              {editStatus === true ? (
                <Field
                  controller={{
                    name: "ASSET_ID",
                    control: control,
                    render: ({ field }: any) => {
                      return (
                        <Select
                          options={assetList}
                          {...register("ASSET_ID", {
                            required:
                              editStatus === true
                                ? "Please fill the required fields"
                                : "",
                          })}
                          label={
                            ASSET_NONASSET?.key === "A" ||
                              ASSET_NONASSET === "A"
                              ? "Equipment Name "
                              : "Service Name"
                          }
                          require={true}
                          optionLabel="ASSET_NAME"
                          findKey={"ASSET_ID"}
                          selectedData={selectedDetails?.ASSET_ID}
                          setValue={setValue}
                          invalid={editStatus === true ? errors.ASSET_NAME : ""}
                          {...field}
                        />
                      );
                    },
                  }}
                />
              ) : (
                <Field
                  controller={{
                    name: "ASSET_NAME",
                    control: control,
                    render: ({ field }: any) => {
                      return (
                        <InputField label="ASSET_NAME" disabled {...field} />
                      );
                    },
                  }}
                />
              )}
              <Field
                controller={{
                  name: "WO_DATE",
                  control: control,
                  render: ({ field }: any) => {
                    return <InputField label="Raised On" disabled {...field} />;
                  },
                }}
              />
              {editStatus === true ? (
                <Field
                  controller={{
                    name: "REQ_ID",
                    control: control,
                    render: ({ field }: any) => {
                      return (
                        <Select
                          options={requestTitle}
                          //options={[]}
                          {...register("REQ_ID", {
                            required: "Please fill the required fields",
                          })}
                          label={"Request Title"}
                          optionLabel="REQ_DESC"
                          findKey={"REQ_ID"}
                          require={true}
                          selectedData={selectedDetails?.REQ_ID}
                          setValue={setValue}
                          invalid={errors.REQ_ID}
                          {...field}
                        />
                      );
                    },
                  }}
                />
              ) : (
                <Field
                  controller={{
                    name: "REQ_DESC",
                    control: control,
                    render: ({ field }: any) => {
                      return (
                        <InputField label="Request Title" disabled {...field} />
                      );
                    },
                  }}
                />
              )}
              <Field
                controller={{
                  name: "WO_REMARKS",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <InputField label="Description" disabled {...field} />
                    );
                  },
                }}
              />
              <Field
                controller={{
                  name: "SEVERITY_DESC",
                  control: control,
                  render: ({ field }: any) => {
                    return <InputField label="Severity" disabled {...field} />;
                  },
                }}
              />

              <Field
                controller={{
                  name: "TEAM_NAME",
                  control: control,
                  render: ({ field }: any) => {
                    return <InputField label="Team" disabled {...field} />;
                  },
                }}
              />
              <Field
                controller={{
                  name: "TECH_NAME",
                  control: control,

                  render: ({ field }: any) => {
                    return (
                      <InputField label="Technician Name" disabled {...field} />
                    );
                  },
                }}
              />
              {status === "Rectified" && (
                <>
                  <Field
                    controller={{
                      name: "SIG",
                      control: control,

                      render: ({ field }: any) => {
                        return (
                          <div>
                            <div className="flex justify-between">
                              <label className="Text_Secondary Input_Label">
                                {t("Digital Signature")}{" "}
                                <span className="text-red-600"> *</span>
                              </label>
                              <button
                                className="ClearButton"
                                onClick={clearSign}
                              >
                                {t("Clear")}
                              </button>
                            </div>
                            <div className="">
                              <ReactSignatureCanvas
                                {...field}
                                backgroundColor="#fff"
                                penColor="#7E8083"
                                canvasProps={{ className: "signatureStyle" }}
                                style={{ border: "2px solid black" }}
                                ref={(ref) => setSigpad(ref)}
                              />
                            </div>
                          </div>
                        );
                      },
                    }}
                  />
                </>
              )}

              {currentStatus === 7 && (
                <div className="">
                  <label className="Text_Secondary Input_Label">
                    {t("Digital Signature")}
                  </label>
                  <img src={imgSrc} className="signatureStyle" />
                </div>
              )}
            </div>
          </Card>
          {currentStatus !== 2 && currentStatus !== 1 && (
            <Card className="mt-2">
              <div className="headingConainer flex justify-between">
                <p>{t("Task Details")}</p>
                <div>
                  {currentStatus !== 7 && (
                    <Buttons
                      name={"task"}
                      className="Primary_Button"
                      label={t("Save Task")}
                      type="submit"
                    />
                  )}
                </div>
              </div>
              {currentStatus !== 2 && currentStatus !== 1 && (
                <div>
                  {fields?.map((el: any, i: number) => (
                    <div
                      key={el?.id}
                      className="mt-1 grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-5 lg:grid-cols-5"
                    >
                      <div>
                        <label className="Text_Secondary Input_Label">
                          {t("Task Name")}
                        </label>

                        <Field
                          controller={{
                            name: `TASKDETAILS.[${i}].TASK_DES`,
                            control: control,
                            render: ({ field }: any) => {
                              return (
                                <Dropdown
                                  name={`TASKDETAILS.${i}.TASK_DES` as any}
                                  options={taskList}
                                  optionLabel="TASK_NAME"
                                  onChange={(e) => handleDropdownChange(e, i)}
                                  disabled={currentStatus === 7 ? true : false}
                                  editable
                                  className="w-full"
                                  placeholder="Please Select"
                                  value={
                                    taskList?.filter(
                                      (f: any) =>
                                        f.TASK_ID ===
                                        watchTaskDetails?.[i]?.TASK_ID
                                    )[0]
                                  }
                                />
                              );
                            },
                          }}
                        />
                      </div>
                      <div>
                        <label className="Text_Secondary Input_Label">
                          {t("Technician Name")}
                        </label>

                        <Field
                          controller={{
                            name: `TASKDETAILS.[${i}].WORKFORCE_ID`,
                            control: control,
                            render: ({ field }: any) => {
                              return (
                                <Dropdown
                                  name={`TASKDETAILS.${i}.WORKFORCE_ID` as any}
                                  options={technician}
                                  optionLabel="USER_NAME"
                                  onChange={(e) => handleDropdownChange(e, i)}
                                  disabled={currentStatus === 7 ? true : false}
                                  editable
                                  placeholder="Please Select"
                                  className="w-full"
                                  value={
                                    technician?.filter(
                                      (f: any) =>
                                        f.USER_ID ===
                                        watchTaskDetails?.[i]?.WORKFORCE_ID
                                    )[0]
                                  }
                                />
                              );
                            },
                          }}
                        />
                      </div>
                      <div>
                        <label className="Text_Secondary Input_Label">
                          {t("Time")}
                        </label>

                        {/* <Field
                    controller={{
                      name: `TASKDETAILS.${i}.TIME`,
                      control: control,
                      render: ({ field }: any) => {
                        return (
                       
                        <input id="appt-time"
                         type="time"
                        className="p-inputtext p-component"
                        name={`TASKDETAILS.${i}.TIME`} 
                        disabled = {currentStatus === 7 ? true : false}
                        onChange={(e) => handleDropdownChange(e, i)}
                        value={watchTaskDetails[i]?.TIME} />
                              );
                            },
                          }}
                          error={"error"}
                        />  */}
                        <Field
                          controller={{
                            name: `TASKDETAILS.${i}.TIME`,
                            control: control,
                            render: ({ field }: any) => {
                              return (
                                <TimeCalendar
                                  {...register(`TASKDETAILS.${i}.TIME`)}
                                  disabled={currentStatus === 7 ? true : false}
                                  id="calendar-24"
                                  {...field}
                                  setValue={setValue}
                                  value={watchTaskDetails[i]?.TIME}
                                  onChange={(e: any) =>
                                    handleDropdownChange(e, i)
                                  }
                                />
                              );
                            },
                          }}
                        />
                      </div>
                      <Field
                        controller={{
                          name: `TASKDETAILS.${i}.REMARKS`,
                          control: control,
                          render: ({ field }: any) => {
                            return (
                              <InputField
                                {...register(
                                  `TASKDETAILS.${i}.REMARKS` as any,
                                  {}
                                )}
                                label="Remarks"
                                disabled={currentStatus === 7 ? true : false}
                                placeholder={t("Please_Enter")}
                                {...field}
                              />
                            );
                          },
                        }}
                        error={"error"}
                      />
                      <div>
                        <label className="Text_Secondary Input_Label">
                          {t("Action")}
                        </label>

                        <Field
                          controller={{
                            name: `TASKDETAILS.${i}.ACTION`,
                            control: control,
                            render: ({ field }: any) => {
                              if (i === fields.length - 1) {
                                // Show the first button only in the last row
                                return (
                                  <>
                                    <div className="flex items-center gap-2">
                                      <Buttons
                                        type="button"
                                        label=""
                                        icon="pi pi-plus"
                                        className="deleteButton"
                                        disabled={
                                          currentStatus === 7 ? true : false
                                        }
                                        onClick={(e: any) => handlerAdd(e)}
                                      />
                                      <Buttons
                                        type="button"
                                        label=""
                                        icon="pi pi-trash"
                                        className="deleteButton"
                                        onClick={(e: any) =>
                                          deleteHandler(e, el)
                                        }
                                      />
                                    </div>
                                  </>
                                );
                              } else {
                                return (
                                  <div className="flex items-center gap-2">
                                    {" "}
                                    {/* Only render the delete button */}
                                    <Button
                                      type="button"
                                      label=""
                                      disabled={
                                        currentStatus === 7 ? true : false
                                      }
                                      icon="pi pi-trash"
                                      className="deleteButton"
                                      onClick={(e: any) => deleteHandler(e, el)}
                                    />
                                  </div>
                                );
                              }
                            },
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}
          {currentStatus !== 2 && currentStatus !== 1 && (
            <Card className="mt-2">
              <div className="headingConainer flex justify-between">
                <p>{t("Part Details")}</p>
                <Field
                  controller={{
                    name: "PARTS_TYPE",
                    control: control,
                    render: ({ field }: any) => {
                      return (
                        <>
                          <Radio
                            {...register("PARTS_TYPE", {})}
                            // labelHead="Type"
                            require={true}
                            options={partDetailsLabel}
                            selectedData={
                              props?.selectedData?.ASSET_NONASSET || "A"
                            }
                            setValue={setValue}
                            {...field}
                          />
                        </>
                      );
                    },
                  }}
                />

                <div>
                  {" "}
                  {currentStatus !== 7 && partOptions?.length > 0 && (
                    <Buttons
                      name="parts"
                      className="Primary_Button"
                      label={t("Save Parts")}
                      type="submit"
                    />
                  )}
                </div>
              </div>
              <div>
                <DataTable
                  value={partOptions}
                  showGridlines
                  disabled={
                    props?.headerName === "Material Request Approve"
                      ? true
                      : false
                  }
                >
                  <Column
                    field="SR_NO"
                    header={t("Sr No")}
                    className="w-20"
                    body={(rowData, { rowIndex }) => {
                      return <>{rowIndex + 1}</>;
                    }}
                  ></Column>
                  <Column
                    field="PART_ID"
                    header={t("Part Code")}
                    className="w-40"
                  ></Column>
                  <Column
                    field="PART_NAME"
                    header={t("Part Name")}
                    className=""
                  ></Column>
                  <Column
                    field="STOCK"
                    header={t("Stock")}
                    className=""
                  ></Column>
                  <Column
                    field="REQ_QTY"
                    header={t("Used Quantity")}
                    className="w-40"
                    body={(rowData, { rowIndex }) => {
                      return (
                        <>
                          <Field
                            controller={{
                              name: `PART_LIST[${rowIndex}].USED_QUANTITY`,
                              control: control,
                              render: ({ field }: any) => {
                                return (
                                  <InputField
                                    {...register(
                                      `PART_LIST[${rowIndex}].USED_QUANTITY` as any,
                                      {
                                        validate: (value) =>
                                          parseInt(value, 10) <=
                                          parseInt(rowData.STOCK, 10) ||
                                          "Should be less than stock",
                                      }
                                    )}
                                    //disabled={currentStatus < 7 ? true  }
                                    //setValue={setValue}
                                    // invalid={
                                    //   errors?.PART_LIST?.[rowIndex]
                                    //     ?.USED_QUANTITY
                                    //     ? true
                                    //     : false
                                    // }
                                    invalidMessage={
                                      errors?.PART_LIST?.[rowIndex]
                                        ?.USED_QUANTITY?.message
                                    }
                                    {...field}
                                  />
                                );
                              },
                            }}
                          />
                        </>
                      );
                    }}
                  ></Column>
                  <Column
                    field="UOM_NAME"
                    header={t("UOM")}
                    className="w-40"
                  ></Column>
                </DataTable>
              </div>
            </Card>
          )}

          {currentStatus !== 1 && (
            <Card className="mt-2">
              <div className="headingConainer">
                <p>{t("Material Request")}</p>
              </div>
              <Table
                columnTitle={[
                  "MATREQ_NO",
                  "PART_CODE",
                  "PART_NAME",
                  "QTY",
                  "ISSUED_QTY",
                ]}
                customHeader={[
                  "Request No.",
                  "Part Code",
                  "Part Name",
                  "Requested Quantity",
                  "Issued Quantity",
                ]}
                columnData={materialRequest}
                scrollHeight={"200px"}
                downloadColumnHeader={"DOC_NAME"}
                isClick={props?.isForm}
                isDocumentDelete={true}
              />
            </Card>
          )}
          {currentStatus !== 7 && (
            <Card className="mt-2 col-span-2">
              <Card className="mt-2">
                <DocumentUpload
                  register={register}
                  control={control}
                  setValue={setValue}
                  watch={watch}
                  getValues={getValues}
                  errors={errors}
                />
              </Card>
            </Card>
          )}
          <WorkOrderDetails optionsDoc={optionsDoc} />
        </form>
      </section>
    </>
  );
};

export default WorkorderMasterForm;
