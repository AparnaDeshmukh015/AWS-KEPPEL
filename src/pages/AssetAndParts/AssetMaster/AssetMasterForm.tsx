import { useFieldArray, useForm } from "react-hook-form";
import React, { useEffect, useState } from "react";
import InputField from "../../../components/Input/Input";
import Buttons from "../../../components/Button/Button";
import { Card } from "primereact/card";
import DateCalendar from "../../../components/Calendar/Calendar";
import Radio from "../../../components/Radio/Radio";
import Select from "../../../components/Dropdown/Dropdown";
import Field from "../../../components/Field";
import Checkboxs from "../../../components/Checkbox/Checkbox";
import AssetSchedule from "../../../components/pageComponents/AssetSchedule/AssetScheduleForm";
import { ENDPOINTS } from "../../../utils/APIEndpoints";
import { callPostAPI } from "../../../services/apis";
import DocumentUpload from "../../../components/pageComponents/DocumentUpload/DocumentUpload";
import moment from "moment";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { LOCALSTORAGE, saveTracker } from "../../../utils/constants"
import {
  eventNotification,
  helperEventNotification,
} from "../../../utils/eventNotificationParameter";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import { helperNullDate } from "../../../utils/constants";
import IdleTimer from "../../../utils/IdealTimer";
import { InputTextarea } from "primereact/inputtextarea";
import MultiSelects from "../../../components/MultiSelects/MultiSelects";
import { PATH } from "../../../utils/pagePath";
import { decryptData } from "../../../utils/encryption_decryption";
import LoaderS from "../../../components/Loader/Loader";

const AssetMasterForm = (props: any) => {
  const facilityData: any = JSON.parse(((localStorage.getItem(LOCALSTORAGE.FACILITYID)))!);
  const { t } = useTranslation();
  const location = useLocation();
  const navigate: any = useNavigate()
  const [options, setOptions] = useState<any>({});
  const [selectedDetails, setSelectedDetails] = useState<any>([]);
  const [scheduleTaskList, setScheduleTaskList] = useState([]);
  const [selectedTaskDetailsList, setSelectedTaskDetailsList] = useState([]);
  const [editStatus, setEditStatus] = useState<any | null>(false);
  const [typeList, setTypeList] = useState<any | null>([])
  const [assigneeList, setAssigneeList] = useState<any | null>([])
  const [Descriptionlength, setDescriptionlength] = useState(0);
  const [loading, setLoading] = useState<any | null>(false)
  const [issueList, setIssueList] = useState<any | null>([])
  const [ppmAssignee, setPPMAssignee] = useState<any | null>([])
  const [vendorList, setVendorList] = useState<any | null>([])
  const[assetTypeState, setAssetTypeState]=useState<any|null>(false)
  const[idSchedule, setIdSchedule]=useState<any|null>(null)
  // const [s]
  const [selectedScheduleTaskDetails, setSelectedScheduleTaskDetails] =
    useState<any>();
  const { search } = useLocation();
  const faults: any = [
    {
      "id": 232,
      "duration": 10.79,
      "name": "AHU-FD-004 Low Static Pressure",
      "description": "Detects low static air pressure comparing with set limit"
    },
    {
      "id": 320,
      "duration": 39.48,
      "name": "AHU-FD-013 Supply Air Flow Reading During Unit Off",
      "description": "Detect Supply Air Flow Sensor Calibration Issue /Fault"
    },
    {
      "id": 1913,
      "duration": 400.41,
      "name": "AHU-FD-049 CHW Valve-1 Modulation Out of Limits",
      "description": "Detect if command and CHW valve feedback deviates."
    },
    {
      "id": 2944,
      "duration": 117.21,
      "name": "AHU-FD-083 Check if AHU Supply Air Static Pressure Set Point Reset Control Strategy can be Implemented",
      "description": "This FDD detect if supply sir static pressure set point can be reset based on demand. By automatically resetting the supply air static pressure set point, There will be a reduction in energy consumption resulting from the improved system efficiency. There will also be a greater consistency in supply air static pressure and conditions in a space."
    },
    {
      "id": 9801,
      "duration": 25.01,
      "name": "AHU Return Air Temperature is too Cold",
      "description": "Detect if the return air temperature is too cold while AHU operation."
    },
    {
      "id": 9827,
      "duration": 10,
      "name": "AHU Supply Air Temperature Setpoint Set at Lower than Recommended Threshold",
      "description": "AHU Supply Air Temperature Setpoint Set at Lower than Recommended Threshold"
    },
    {
      "id": 9829,
      "duration": 53.85,
      "name": "AHU Supply Fan VFD is Operating at Constant Speed",
      "description": "AHU Supply Fan VFD is Operating at Constant Speed"
    },
    {
      "id": 9835,
      "duration": 51.91,
      "name": "AHU Cooling Valve is not Modulating",
      "description": "AHU Cooling Valve is not Modulating"
    },
    {
      "id": 9838,
      "duration": 54.46,
      "name": "AHU Cooling Valve Output & Feedback Mismatch (Beyond 10%)",
      "description": "AHU Cooling Valve Output & Feedback Mismatch (Beyond 10%)"
    },
    {
      "id": 9840,
      "duration": 74.49,
      "name": "AHU Supply Fan VFD not Operating as per Commanded Speed (Beyond 10%)",
      "description": "AHU Supply Fan VFD not Operating as per Commanded Speed (Beyond 10%)"
    },
    {
      "id": 9843,
      "duration": 9.26,
      "name": "Return Air Temperature Sensor reading outside limit (8 hours)",
      "description": "Return Air Temperature Sensor reading outside limit (8 hours)"
    },
    {
      "id": 9921,
      "duration": 228.37,
      "name": "AHU CHW Valve is Leaking while Equipment Shutdown",
      "description": "AHU Chilled Water Valve is Leaking while Equipment Shutdown"
    },
    {
      "id": 10075,
      "duration": 34.83,
      "name": "AHU Supply Air Duct Static Pressure is Higher than General Threshold",
      "description": "AHU Supply Air Duct Static Pressure is Higher than General Threshold"
    }
  ]


  const spaceList: any = [
    {
      "spaceid": "ab507e07-3d99-4a8b-872c-0965f52fe927",
      "spacename": "Roof - Podium",
      "equipmentid": "cd732376-821b-4c40-8667-f9b70778c945",
      "	equipmentname": "Alarm Test"
    },
    {
      "spaceid": "ab507e07-3d99-4a8b-872c-0965f52fe9275855",
      "spacename": "Roof - Podium 2",
      "equipmentid": "cd732376-821b-4c40-8667-f9b70778c945",
      "	equipmentname": "Alarm Test"
    }

  ]

  const handleInputChange = (event: any) => {
    const value = event.target.value;
    setDescriptionlength(value.length);
  };

  let { pathname } = useLocation();
  const [, menuList]: any = useOutletContext();
  const currentMenu = menuList
    ?.flatMap((menu: any) => menu?.DETAIL)
    .filter((detail: any) => detail.URL === pathname)[0];
  const {
    register,
    resetField,
    handleSubmit,
    getValues,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      id: 0,
      LOCATION: "",
      spaceid: "",
      ASSET_CODE: "",
      ASSET_NAME: props?.selectedData?.ASSET_NAME || "",
      GROUP: "",
      TYPE: null,
      BAR_CODE: "",
      MAKE: "",
      MODEL: "",
      CURRENT_STATE: "",
      ACTIVE:
        props?.selectedData?.ACTIVE !== undefined
          ? props?.selectedData?.ACTIVE
          : true,
      ASSET_DESC: "",
      LINK_OBEM: "",
      ASSET_NONASSET: "A",

      SCHEDULE_ID: 0,
      SCHEDULER: {
        ASSET_NONASSET: "A",
        MODE: "A",

        TEAM_LEAD_ID: 0,
        TEAM_ID: 0,
        SCHEDULE_ID:
          props?.selectedData !== undefined
            ? props?.selectedData?.SCHEDULE_ID
            : 0,
        SCHEDULE_NAME: selectedScheduleTaskDetails?.SCHEDULE_NAME || null,
        FREQUENCY_TYPE: "",
        PERIOD: "",
        REQ_ID: "",
        Record: "",
        DAILY_ONCE_EVERY: "O",
        DAILY_ONCE_AT_TIME: "00:00",
        DAILY_ONCE_EVERY_DAYS: 0,
        DAILY_EVERY_PERIOD: 0,
        DAILY_EVERY_PERIOD_UOM: "H",
        DAILY_EVERY_STARTAT: "00:00",
        DAILY_EVERY_ENDAT: "00:00",
        WEEKLY_1_WEEKDAY: "0",
        WEEKLY_1_EVERY_WEEK: "0",
        WEEKLY_1_PREFERED_TIME: "00:00",
        WEEKLY_2_WEEKDAY: "0",
        WEEKLY_2_EVERY_WEEK: "0",
        WEEKLY_2_PREFERED_TIME: "00:00",
        MONTH_OPTION: 0,
        MONTHLY_1_MONTHDAY: "0",
        MONTHLY_1_MONTH_NUM: "0",
        MONTHLY_2_WEEK_NUM: "0",
        MONTHLY_2_WEEKDAY: "0",
        MONTHLY_2_MONTH_NUM: "0",
        RUN_HOURS: "0",
        ACTIVE: 1,
        RUN_AVG_DAILY: "0",
        RUN_THRESHOLD_MAIN_TRIGGER: "0",
        MONTHLY_2ND_MONTHDAY: "0",
        MONTHLY_2ND_MONTH_NUM: "0",
        MONTHLY_1_PREFERED_TIME: "00:00",
        MONTHLY_2ND_PREFERED_TIME: "00:00",
        MONTHLY_2_WEEK_PREFERED_TIME: "00:00",
        SCHEDULE_TASK_D: [],
      },
      UNDERAMC: props?.selectedData?.UNDERAMC || false,
      AMC_DATE: "",
      AMC_VENDOR: "",
      ASSET: "",
      CAPACITY_SIZE: 0,
      SERIAL_NUMBER: 0,
      ASSET_COST: props?.selectedData?.ASSET_COST || 0,
      BENCHMARK_VALUE: 0,
      MTBF_HOURS: 0,
      VENDOR_NAME: "",
      WARREANTY_DATE: null,
      COMMISSIONING_DATE: "",
      LAST_DATE: null,
      ASSET_ID: 0,
      MODE: "",
      PARA: "",
      EXTRA_COL_LIST: [""],
      DOC_LIST: [],
      ASSIGN_TO: "",
      ANALIYTIC_FDD: "",
    },
    mode: "all",
  });
  const watchAll: any = watch();

  const User_Name = decryptData((localStorage.getItem("USER_NAME")));
  const ROLETYPECODES = decryptData((localStorage.getItem("ROLETYPECODE")))



  const { fields, append: colAppend } = useFieldArray({
    name: "EXTRA_COL_LIST",
    control,
  });

  const ASSET_DESCWatch: any = watch("ASSET_DESC") || ""
  useEffect(() => {
    if (ASSET_DESCWatch)
      setDescriptionlength(ASSET_DESCWatch.length);
  }, [ASSET_DESCWatch]);

  const MANINTENANCE: any = watch("UNDERAMC");

  const onSubmit = async (payload: any) => {
    try {
      if (!payload.SCHEDULE_ID || editStatus) {
        const schedulerData = payload.SCHEDULER;
        const updatedTaskList: any = payload?.SCHEDULER?.SCHEDULE_TASK_D?.filter((task: any) => task.isChecked === true);
        const tasksWithoutIsChecked = updatedTaskList.map(({ isChecked, ...rest }: any) => rest);
        schedulerData.ASSET_NONASSET = "A";
        schedulerData.MAKE_ID = payload.MAKE?.MAKE_ID;
        schedulerData.MAKE_ID = payload.MAKE?.MAKE_ID;
        schedulerData.MODEL_ID = payload?.MODEL?.MODEL_ID;
        schedulerData.FREQUENCY_TYPE =
          schedulerData?.PERIOD?.FREQUENCY_TYPE || "";
        schedulerData.PERIOD = schedulerData?.PERIOD?.VALUE || "";
        schedulerData.DAILY_ONCE_EVERY =
          schedulerData?.DAILY_ONCE_EVERY?.key || "";
        schedulerData.MONTHLY_2_WEEK_NUM =
          schedulerData?.MONTHLY_2_WEEK_NUM?.MONTHLY_2_WEEK_NUM || "0";
        schedulerData.MONTHLYONCETWICE = schedulerData?.MONTHLYONCETWICE?.key;
        schedulerData.MODE = !payload.SCHEDULE_ID === false ? "E" : "A";
        const timeConvert = [
          "DAILY_ONCE_AT_TIME",
          "DAILY_EVERY_STARTAT",
          "DAILY_EVERY_ENDAT",
          "WEEKLY_1_PREFERED_TIME",
          "MONTHLY_1_PREFERED_TIME",
          "MONTHLY_2_WEEK_PREFERED_TIME",
          "MONTHLY_2ND_PREFERED_TIME",
        ];
        delete schedulerData?.REQ_ID;
        timeConvert?.forEach((elem: any) => {
          if (moment(schedulerData[elem])?.isValid()) {
            schedulerData[elem] = moment(schedulerData[elem]).format("HH:mm");
          }
        });

        schedulerData.MONTH_OPTION =
          schedulerData?.MONTH_OPTION?.MONTH_OPTION || "";

        schedulerData.SCHEDULE_TASK_D = tasksWithoutIsChecked ? tasksWithoutIsChecked : [];
        const schedulerPayload: any = {
          ...payload?.SCHEDULER,
          ASSETTYPE_ID: payload?.TYPE?.ASSETTYPE_ID,
          REQ_ID: schedulerData?.Record?.REQ_ID
        };
        delete payload?.SCHEDULER?.Record



        if (schedulerData?.SCHEDULE_NAME !== null) {
          const res1 = await callPostAPI(
            ENDPOINTS.SCHEDULE_SAVE,
            schedulerPayload
          );
          payload.SCHEDULE_ID = res1?.SCHEDULE_ID;
        }
      }

      delete payload?.SCHEDULER;
      const updateColList: any = payload?.EXTRA_COL_LIST?.filter(
        (item: any) => item?.VALUE
      ).map((data: any) => ({
        [data?.FIELDNAME]: data?.VALUE,
      }));
      payload.SCHEDULE_ID = payload?.SCHEDULE_ID !== 0 ? payload?.SCHEDULE_ID : 0;
      payload.EXTRA_COL_LIST = updateColList || [];
      payload.ACTIVE = payload?.ACTIVE === true ? 1 : 0;
      payload.LOCATION_ID = payload?.LOCATION?.LOCATION_ID;
      payload.ASSETGROUP_ID = payload?.GROUP?.ASSETGROUP_ID;
      payload.ASSETTYPE_ID = payload?.TYPE?.ASSETTYPE_ID;
      payload.MAKE_ID = payload?.MAKE?.MAKE_ID;
      payload.MODEL_ID = payload?.MODEL?.MODEL_ID;
      payload.UNDERAMC = payload.UNDERAMC === true ? 1 : 0;
      payload.CS_ID = payload?.CURRENT_STATE?.CS_ID;
      payload.VENDOR_ID = payload?.VENDOR_NAME?.VENDOR_ID || "";
      payload.OBEM_ASSET_ID = payload?.LINK_OBEM?.ASSET_ID;
      payload.OWN_LEASE = payload?.ASSET?.key || "";
      payload.AMC_VENDOR = payload?.UNDERAMC
        ? payload?.AMC_VENDOR?.VENDOR_ID
        : "";
      payload.AMC_EXPIRY_DATE = payload?.UNDERAMC
        ? moment(payload.AMC_DATE).format('YYYY-MM-DD')
        : "";
      payload.COMMISSIONING_DATE = payload.COMMISSIONING_DATE
        ? moment(payload.COMMISSIONING_DATE).format('YYYY-MM-DD')
        : "";
      payload.WARRANTY_END_DATE = payload.WARREANTY_DATE
        ? moment(payload.WARREANTY_DATE).format('YYYY-MM-DD')
        : "1900-01-01T00:00:00";
      payload.LAST_MAINTANCE_DATE = payload.LAST_DATE
        ? moment(payload.LAST_DATE).format('YYYY-MM-DD')
        : "1900-01-01T00:00:00";
      payload.MODE = search === '?edit=' ? "E" : "A";
      payload.PARA = search === '?edit='
        ? { para1: `${props?.headerName}`, para2: t("Updated") }
        : { para1: `${props?.headerName}`, para2: t("Added") };
      payload.ASSIGN_LIST = payload?.ASSIGN_TO;
      payload.ASSET_ID = search === '?edit=' ? selectedDetails?.ASSET_ID : ""
      delete payload?.LOCATION;
      delete payload?.GROUP;
      delete payload?.TYPE;
      delete payload?.MODEL;
      delete payload?.MAKE;
      delete payload?.CURRENT_STATE;
      delete payload?.VENDOR_NAME;
      delete payload?.LINK_OBEM;
      delete payload.LAST_DATE;
      delete payload?.WARREANTY_DATE;
      delete payload?.AMC_DATE;
      delete payload?.ASSET;
      delete payload?.ASSIGN_TO;

      const res = await callPostAPI(ENDPOINTS.ASSETMASTER_SAVE, payload, "AS007");
      if (res?.FLAG === true) {

        toast?.success(res?.MSG);
        const notifcation: any = {
          "FUNCTION_CODE": currentMenu?.FUNCTION_CODE,
          "EVENT_TYPE": "M",
          "STATUS_CODE": search === "?edit=" ? 2 : 1,
          "PARA1": search === "?edit=" ? User_Name : User_Name,
          PARA2: payload?.ASSET_CODE,
          PARA3: payload?.ASSET_NAME,
          PARA4: payload?.BAR_CODE,
          PARA5: payload?.ASSET_COST,
          PARA6: payload?.BENCHMARK_VALUE,
          PARA7: payload.COMMISSIONING_DATE
            ? moment(payload.COMMISSIONING_DATE).format('YYYY-MM-DD')
            : "",
          PARA8: payload.WARRANTY_END_DATE = payload.WARREANTY_DATE
            ? moment(payload.WARREANTY_DATE).format('YYYY-MM-DD')
            : "",
          PARA9: payload.AMC_EXPIRY_DATE = payload?.UNDERAMC
            ? moment(payload.AMC_DATE).format('YYYY-MM-DD')
            : "",
          PARA10: payload?.ASSET_NONASSET
        };

        const eventPayload = { ...eventNotification, ...notifcation };
        helperEventNotification(eventPayload);
        if (location?.state === null) {
          props?.getAPI();
          props?.isClick();
        }
      } else {
        toast?.error(res?.MSG);
      }

    } catch (error: any) {
      toast?.error(error);
    }
  };

  const labelAsset: any = [
    { name: "Owned", key: "O" },
    { name: "Leased", key: "L" },
  ];

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

  const getScheduleList = async () => {
    try {
      if (watchAll?.TYPE !== '' || watchAll?.TYPE !== null) {
        if (watchAll?.TYPE?.ASSETTYPE_ID) {
          const payload = {
            ASSETTYPE_ID: watchAll?.TYPE?.ASSETTYPE_ID,
          };
          const res = await callPostAPI(ENDPOINTS.SCHEDULE_LIST, payload, "AS067");
          setScheduleTaskList(res?.SCHEDULELIST);
          if (search === "?edit=") {
            setValue("SCHEDULE_ID", res?.SCHEDULELIST[0]?.SCHEDULE_ID || 0);
            setValue("SCHEDULER.SCHEDULE_ID", res?.SCHEDULELIST[0]?.SCHEDULE_ID)
          }
        }
      }
    } catch (error) { }
  };

  const getAssetDetails = async (columnCaptions: any, ASSET_ID?: any) => {
    const getId: any = localStorage.getItem("Id");
    const assetId: any = JSON.parse(getId);
    setLoading(true)
    const payload: any = {
      ASSET_NONASSET: "A",
      ASSET_ID: location?.state !== null ? ASSET_ID : props?.selectedData === null ? assetId?.ASSET_ID : props?.selectedData?.ASSET_ID,
    };

    try {
      const res = await callPostAPI(
        ENDPOINTS.ASSETMASTER_DETAILS,
        payload,
        "AS067"
      );

      if (res?.FLAG === 1) {

        const payload: any = {
          ASSETGROUP_ID: res?.ASSETDETAILSLIST[0]?.ASSETGROUP_ID
        };
        const res1 = await callPostAPI(
          ENDPOINTS.GET_ASSETGROUPTEAMLIST,
          payload, "HD004"
        );

        if (res?.FLAG === 1) {
          setPPMAssignee(res1?.TECHLIST);
        }
        getRequestList(res?.ASSETDETAILSLIST[0]?.ASSETGROUP_ID, res?.ASSETDETAILSLIST[0]?.ASSET_NONASSET)
        setAssigneeList(res?.ASSIGNLIST)
        const configList = res.CONFIGLIST[0];
        for (let key in configList) {
          if (configList[key] === null) {
            delete configList[key];
          }
        }

        const previousColumnCaptions: any = columnCaptions.map((item: any) => ({
          ...item,
          VALUE: configList[item.FIELDNAME],
        }));

        colAppend(previousColumnCaptions);
        const amcDate: any = helperNullDate(
          res?.ASSETDETAILSLIST[0]?.AMC_EXPIRY_DATE
        );

        const lastDate: any = helperNullDate(
          res?.ASSETDETAILSLIST[0]?.LAST_MAINTANCE_DATE
        );

        const commissioningDate: any = helperNullDate(
          res?.ASSETDETAILSLIST[0]?.COMMISSIONING_DATE
        );

        const warrantyDate: any = helperNullDate(
          res?.ASSETDETAILSLIST[0]?.WARRANTY_END_DATE
        );

        setSelectedDetails(res?.ASSETDETAILSLIST[0]);
        setSelectedScheduleTaskDetails(res?.SCHEDULELIST[0]);
        setSelectedTaskDetailsList(res?.SCHEDULETASKLIST);
        setValue("ASSET_CODE", res?.ASSETDETAILSLIST[0]?.ASSET_CODE);
        setValue("BAR_CODE", res?.ASSETDETAILSLIST[0]?.BAR_CODE);
        setValue("ASSET_DESC", res?.ASSETDETAILSLIST[0]?.ASSET_DESC);
        setValue("CAPACITY_SIZE", res?.ASSETDETAILSLIST[0]?.CAPACITY_SIZE);
        setValue("SERIAL_NUMBER", res?.ASSETDETAILSLIST[0]?.SERIAL_NUMBER);
        setValue("ASSET_COST", res?.ASSETDETAILSLIST[0]?.ASSET_COST);
        setValue("ASSET_NAME", res?.ASSETDETAILSLIST[0]?.ASSET_NAME);
        setValue("BENCHMARK_VALUE", res?.ASSETDETAILSLIST[0]?.BENCHMARK_VALUE);
        setValue("MTBF_HOURS", res?.ASSETDETAILSLIST[0]?.MTBF_HOURS);
        setValue("AMC_DATE", amcDate);
        setValue("WARREANTY_DATE", warrantyDate);
        setValue("COMMISSIONING_DATE", commissioningDate);
        setValue("LAST_DATE", lastDate);
        setValue("SCHEDULER.SCHEDULE_TASK_D", res?.SCHEDULETASKLIST);
        setValue("DOC_LIST", res?.ASSETDOCLIST);
        setValue("UNDERAMC", res?.ASSETDETAILSLIST[0]?.UNDERAMC);
        setValue("AMC_VENDOR", res?.ASSETDETAILSLIST[0]?.AMC_VENDOR);
      }
    } catch (error: any) {
      toast?.error(error);
    } finally {
      setLoading(false)
    }
  };

  const getRequestList = async (ASSETGROUP_ID: any, ASSET_NONASSET?: any, reqId?: any) => {
    setValue("TYPE", null)
    const payload: any = {
      ASSETGROUP_ID: ASSETGROUP_ID,
      ASSET_NONASSET: ASSET_NONASSET?.key
        ? ASSET_NONASSET?.key
        : ASSET_NONASSET,
    };

    const res = await callPostAPI(
      ENDPOINTS.GET_SERVICEREQUEST_WORKORDER,
      payload, "AS067"
    );

    if (res?.FLAG === 1) {
      setIssueList(res?.WOREQLIST)
      if (search === "?edit=") {
        // setSelectedIssue(reqId)
      }
    } else {
      setIssueList([])
    }
    if (search === "?add=") {
      GET_ASSETGROUPTEAMLIST(ASSETGROUP_ID)
    }
  }

  const GET_ASSETGROUPTEAMLIST = async (ASSETGROUP_ID: any) => {
    const payload: any = {
      ASSETGROUP_ID: ASSETGROUP_ID
    };
    const res = await callPostAPI(
      ENDPOINTS.GET_ASSETGROUPTEAMLIST,
      payload, "HD004"
    );

    if (res?.FLAG === 1) {
      setPPMAssignee(res?.TECHLIST);
    }
  }

  const getOptions = async () => {
    const payload = {
      ASSETTYPE: "A",
    };
    try {
      setLoading(true)
      let res = await callPostAPI(
        ENDPOINTS.GETASSETMASTEROPTIONS,
        payload,
      );
      let res1 = await callPostAPI(ENDPOINTS.LOCATION_HIERARCHY_LIST, "AS067");
      setOptions({
        assetGroup: res?.ASSESTGROUPLIST,
        assetType: res?.ASSESTTYPELIST,
        assetMake: res?.MAKELIST,
        assetModel: res?.MODELLIST,
        unit: res?.UOMLIST,
        currentState: res?.CURRENTSTATUSLIST,
        obemList: res?.OBMASSETLIST,
        vendorList: res?.VENDORELIST,
        configList: res?.CONFIGLIST,
        userList: res?.USERLIST,
        location: res1?.LOCATIONHIERARCHYLIST
      });
      setVendorList(res?.VENDORELIST)
      const columnCaptions = res?.CONFIGLIST.map((item: any) => ({
        FIELDNAME: item.FIELDNAME,
        LABEL: item?.COLUMN_CAPTION,
        VALUE: "",
      }));

      if (res?.FLAG === 1) {
        if (search === '?edit=') {
          getAssetDetails(columnCaptions);
          if (location?.state !== null) {
            getAssetDetails(columnCaptions, location?.state?.ASSET_ID);
          }
        } else {
          colAppend(columnCaptions);
        }
      }
    } catch (error) { }
    finally {
      setLoading(false)
    }
  };
 
  useEffect(() => {
    if (watchAll?.TYPE !== null || watchAll?.TYPE !== undefined) {
      getScheduleList();
      setValue("SCHEDULER.SCHEDULE_ID", 0)
      setValue("SCHEDULE_ID", 0)
      
    } else {
      setValue("TYPE", null)
      setValue("SCHEDULER.SCHEDULE_ID", 0)
      setValue("SCHEDULE_ID", 0)
     
    }
    const vendor: any = options?.vendorList?.filter((f: any) =>
      f?.VENDOR_ID === f?.VENDOR_ID)
    // setValue("AMC_VENDOR", selectedDetails?.AMC_VENDOR)
    setVendorList(vendor)
   
    // getTaskList()
  }, [watchAll?.TYPE]);

  useEffect(() => {
    const nestedErrors: any = errors?.SCHEDULER || {};
    const firstError: any = Object?.values(nestedErrors)[0];
    if (
      !isSubmitting &&
      (Object?.values(errors)[0]?.type === "required" ||
        Object?.values(errors)[0]?.type === "validate")
    ) {
      const check: any = Object?.values(errors)[0]?.message;
      toast?.error(t(check));
    } else if (
      !isSubmitting &&
      (firstError?.type === "required" || firstError?.type === "validate")
    ) {
      const check: any = firstError?.message;
      toast?.error(t(check));
    }
  }, [isSubmitting]);

  useEffect(() => {
    if (watchAll?.GROUP) {
      const assetTypeList: any = options?.assetType?.filter((f: any) => f.ASSETGROUP_ID === watchAll?.GROUP?.ASSETGROUP_ID)
      setTypeList(assetTypeList)

      setPPMAssignee(ppmAssignee)
      setAssigneeList(assigneeList)
      setValue("SCHEDULER.SCHEDULE_TASK_D", [])
      setScheduleTaskList([])
      setValue("SCHEDULER.SCHEDULE_ID", 0)
    setValue("SCHEDULE_ID", 0)
    }

  }, [watchAll?.GROUP])

  useEffect(() => {
    getOptions();
    saveTracker(currentMenu);
  }, [currentMenu]);
  useEffect(() => {
   
    if (MANINTENANCE === false) {
      setValue("AMC_DATE", "")
      setValue("AMC_VENDOR", "")
    }
  }, [MANINTENANCE])

  const handlerShowService = () => {
    navigate(PATH.SHOWSERVICEREQEST, { state: location?.state?.WO_ID })
  }

  if (loading === true) {
    <LoaderS />
  }

  return (
    <>
      {/* <IdleTimer /> */}
      <section className="w-full">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex justify-between mt-1">
            <div>
              <h6 className="Text_Primary">
                {t(`${search === '?edit=' ? "Edit" : "Add"}`)} {props?.headerName} {" "}
              </h6>
            </div>
            <div className="flex">
              {location?.state !== null && (<Buttons
                type="submit"
                className="Primary_Button   me-2"
                label={"Show Service Request"}
                onClick={() => handlerShowService()}
              />)}
              {search === '?edit=' ?
                <>

                  {currentMenu?.UPDATE_RIGHTS === "True" && (<Buttons
                    type="submit"
                    className="Primary_Button  w-20 me-2"
                    label={"Save"}
                  />)}</> :
                <>
                  {search === '?add=' ? <Buttons
                    type="submit"
                    className="Primary_Button  w-20 me-2"
                    label={"Save"}
                  /> : ""}</>}
              {currentMenu?.UPDATE_RIGHTS === "True" && (<Buttons
                className="Secondary_Button w-20 "
                label={"List"}
                onClick={props?.isClick}
              />)}
            </div>

          </div>

          <Card className="mt-2">
            <div className="headingConainer">
              <p>Equipment Details</p>
            </div>
            <div className="mt-1 grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-3 lg:grid-cols-3">
              <Field
                controller={{
                  name: "LOCATION",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <Select
                        options={options?.location}
                        {...register("LOCATION", {
                          required: t("Please fill the required fields."),
                        })}
                        label="Location"
                        require={true}
                        optionLabel="LOCATION_NAME"
                        valueTemplate={selectedLocationTemplate}
                        itemTemplate={locationOptionTemplate}
                        invalid={errors.LOCATION}
                        filter={true}
                        findKey={"LOCATION_ID"}
                        selectedData={selectedDetails?.LOCATION_ID}
                        setValue={setValue}
                        {...field}
                      />
                    );
                  },
                }}
              />

              <Field
                controller={{
                  name: "ASSET_CODE",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <InputField
                        {...register("ASSET_CODE", {
                          validate: (fieldValue: any) => {
                            const sanitizedValue = fieldValue
                              ?.toString()
                              ?.replace(/[^0-9]/g, "");
                            setValue("ASSET_CODE", sanitizedValue);
                            return true;
                          },
                        })}
                        label="Code"
                        disabled={props.selectedData ? true : false}
                        setValue={setValue}
                        {...field}
                      />
                    );
                  },
                }}
              />

              <Field
                controller={{
                  name: "ASSET_NAME",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <InputField
                        {...register("ASSET_NAME", {
                          required: "Please fill the required fields",
                          validate: value => value.trim() !== "" || "Please fill the required fields"
                        })}
                        label="Name"
                        require={true}
                        invalid={errors.ASSET_NAME}
                        value={selectedDetails?.ASSET_NAME}
                        {...field}
                        setValue={setValue}
                      />
                    );
                  },
                }}
              />

              <Field
                controller={{
                  name: "GROUP",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <Select
                        options={options?.assetGroup}
                        {...register("GROUP", {
                          required: "Please fill the required fields",
                          onChange: (e: any) => {
                            setValue("ASSIGN_TO", "")
                            getRequestList(
                              e?.target?.value?.ASSETGROUP_ID,
                              e?.target?.value?.ASSETGROUP_TYPE

                            );
                          },
                        })}
                        label="Group"
                        require={true}
                        optionLabel="ASSETGROUP_NAME"
                        findKey={"ASSETGROUP_ID"}
                        selectedData={selectedDetails?.ASSETGROUP_ID}
                        setValue={setValue}
                        invalid={errors.GROUP}
                        {...field}
                      />
                    );
                  },
                }}
              />

              <Field
                controller={{
                  name: "TYPE",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <Select
                        options={typeList}
                        {...register("TYPE", {
                          required: "Please fill the required fields",
                          onChange:(e)=>{
                            setAssetTypeState(true)
                            setIdSchedule(0)
                          }
                        })}
                        label="Type"
                        require={true}
                        optionLabel="ASSETTYPE_NAME"
                        findKey={"ASSETTYPE_ID"}
                        selectedData={selectedDetails?.ASSETTYPE_ID}
                        setValue={setValue}
                        invalid={errors.TYPE}
                        {...field}
                      />
                    );
                  },
                }}
              />

              <Field
                controller={{
                  name: "BAR_CODE",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <InputField
                        {...register("BAR_CODE")}
                        label="QR code"
                        // require={true}

                        invalid={errors.BAR_CODE}
                        {...field}
                        setValue={setValue}
                      />
                    );
                  },
                }}
              />

              <Field
                controller={{
                  name: "MAKE",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <Select
                        options={options?.assetMake}
                        {...register("MAKE", {
                        })}
                        label="Make"
                        optionLabel="MAKE_NAME"
                        findKey={"MAKE_ID"}
                        selectedData={selectedDetails?.MAKE_ID}
                        setValue={setValue}
                        {...field}
                      />
                    );
                  },
                }}
              />

              <Field
                controller={{
                  name: "MODEL",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <Select
                        options={options?.assetModel}
                        {...register("MODEL", {})}
                        label="Model"
                        optionLabel="MODEL_NAME"
                        findKey={"MODEL_ID"}
                        selectedData={selectedDetails?.MODEL_ID}
                        setValue={setValue}
                        {...field}
                      />
                    );
                  },
                }}
              />

              <Field
                controller={{
                  name: "CURRENT_STATE",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <Select
                        options={options?.currentState}
                        {...register("CURRENT_STATE", {
                        })}
                        label="Current Status"
                        optionLabel="CS_DESC"
                        findKey={"CS_ID"}
                        selectedData={selectedDetails?.CS_ID}
                        setValue={setValue}
                        {...field}
                      />
                    );
                  },
                }}
              />

              <div className="col-span-1">
                <label className="Text_Secondary Input_Label">{t("Description")}</label>
                <Field
                  controller={{
                    name: "ASSET_DESC",
                    control: control,
                    render: ({ field }: any) => {
                      return (
                        <InputTextarea
                          {...register("ASSET_DESC", {
                            onChange: (e: any) => handleInputChange(e),
                          })}
                          maxLength={400}
                          setValue={setValue}
                          {...field}
                        />
                      );
                    },
                  }}
                />
                <label className={` ${Descriptionlength === 400 ?
                  "text-red-600" : "Text_Secondary"} Helper_Text`}>
                  {t(`Up to ${Descriptionlength}/400 characters.`)}
                </label>
              </div>

             

           

              <Field
                controller={{
                  name: "ASSIGN_TO",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <MultiSelects
                        options={ppmAssignee}
                        {...register("ASSIGN_TO", {
                        })}
                        label="PPM Assignee"

                        optionLabel="USER_NAME"
                        findKey={"USER_ID"}
                        selectedData={assigneeList}
                        setValue={setValue}
                        {...field}
                      />
                    );
                  },
                }}
              />

              <div className="flex align-items-center">
                <Field
                  controller={{
                    name: "ACTIVE",
                    control: control,
                    render: ({ field }: any) => {
                      return (
                        <Checkboxs
                          {...register("ACTIVE")}
                          checked={
                            props?.selectedData?.ACTIVE === true
                              ? true
                              : false || false
                          }
                          className="md:mt-7"
                          label="Active"
                          setValue={setValue}
                          {...field}
                        />
                      );
                    },
                  }}
                  error={errors?.ACTIVE?.message}
                />
              </div>
            </div>
          </Card>

          <AssetSchedule
            errors={errors}
            setValue={setValue}
            watchAll={watchAll}
            register={register}
            control={control}
            watch={watch}
            resetField={resetField}
            scheduleTaskList={scheduleTaskList}
            scheduleId={search === '?edit=' && assetTypeState === true?0:search === '?edit='? selectedDetails?.SCHEDULE_ID : 0}
            getValues={getValues}
            setEditStatus={setEditStatus}
            isSubmitting={isSubmitting}
            AssetSchedule={true}
            issueList={issueList}
            setScheduleTaskList={setScheduleTaskList}
            setAssetTypeState={setAssetTypeState}
            assetTypeState={assetTypeState}
          />

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

          <Card className="mt-2">
            <div className="headingConainer">
              <p>{t("Other Details")}</p>
            </div>
            <div className="mt-1 grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-3 lg:grid-cols-3">
              <div className=" flex flex-wrap">
                <Field
                  controller={{
                    name: "ASSET",
                    control: control,
                    render: ({ field }: any) => {
                      return (
                        <>
                          <Radio
                            {...register("ASSET")}
                            options={labelAsset}
                            labelHead="Is this Owned/Leased? "
                            selectedData={selectedDetails?.OWN_LEASE || "O"}
                            setValue={setValue}
                            {...field}
                          />
                        </>
                      );
                    },
                  }}
                />
                <div className="flex ml-4 align-items-center">
                  <Field
                    controller={{
                      name: "UNDERAMC",
                      control: control,
                      render: ({ field }: any) => {
                        return (
                          <Checkboxs
                            {...register("UNDERAMC", {
                            })}
                            className="md:mt-6"
                            label="Maintenance"
                            checked={selectedDetails?.UNDERAMC}
                            setValue={setValue}
                            {...field}
                          />
                        );
                      },
                    }}
                  />
                </div>
              </div>

              {MANINTENANCE && (
                <>
                  {/* <Field
                    controller={{
                      name: "AMC_DATE",
                      control: control,
                      render: ({ field }: any) => {
                        return (
                          <DateCalendar
                            {...register("AMC_DATE", {
                              required: MANINTENANCE === true ? "Please Fill the Required Fields." : "",
                            })}
                            label="AMC expiry Date"
                            showIcon
                            require={MANINTENANCE === true ? true : ""}
                            setValue={setValue}
                            invalid={MANINTENANCE === true ? errors?.AMC_DATE : ""}
                            {...field}
                          />
                        );
                      },
                    }}
                  /> */}
                  <Field
                    controller={{
                      name: "AMC_DATE",
                      control: control,
                      rules: {
                        validate: (value: any) => {
                          return value && value !== '' ? true : "Please fill the required fields";
                        },
                      },
                      render: ({ field, fieldState }: any) => {
                        return (
                          <DateCalendar
                            value={field.value} // Ensure the value is synced with react-hook-form
                            onChange={(e: any) => {
                              // Explicitly update the value using setValue or field.onChange
                              field.onChange(e.value);
                            }}
                            label={t("AMC expiry Date")}
                            require={true}
                            invalid={fieldState?.error} // Show error if validation fails
                            showIcon
                            setValue={setValue} // Optional: if you need to manually set the value elsewhere
                          />
                        );
                      },
                    }}
                  />

                  <Field
                    controller={{
                      name: "AMC_VENDOR",
                      control: control,
                      render: ({ field }: any) => {
                        return (
                          <Select
                            options={vendorList}
                            {...register("AMC_VENDOR", {
                              required: MANINTENANCE === true ? "Please Fill the Required Fields." : "",
                            })}
                            label="AMC Vendor"
                            optionLabel="VENDOR_NAME"
                            require={MANINTENANCE === true ? true : false}
                            findKey={"VENDOR_ID"}
                            selectedData={selectedDetails?.AMC_VENDOR}
                            setValue={setValue}
                            invalid={MANINTENANCE === true ? errors.AMC_VENDOR : ""}
                            {...field}
                          />
                        );
                      },
                    }}
                  />
                </>
              )}
            </div>
            <div className="mt-1 grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-3 lg:grid-cols-3">
              <Field
                controller={{
                  name: "CAPACITY_SIZE",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <InputField
                        {...register("CAPACITY_SIZE", {
                          validate: (fieldValue: any) => {
                            const sanitizedValue = fieldValue
                              ?.toString()
                              ?.replace(/[^0-9]/g, "");
                            setValue("CAPACITY_SIZE", sanitizedValue);
                            return true;
                          },
                        })}
                        label="Capacity/Size"
                        invalid={errors.CAPACITY_SIZE}
                        {...field}
                      />
                    );
                  },
                }}
              />
              <Field
                controller={{
                  name: "SERIAL_NUMBER",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <InputField
                        {...register("SERIAL_NUMBER", {
                          validate: (fieldValue: any) => {
                            const sanitizedValue = fieldValue
                              ?.toString()
                              ?.replace(/[^0-9]/g, "");
                            setValue("SERIAL_NUMBER", sanitizedValue);
                            return true;
                          },
                        })}
                        label="Serial No."
                        invalid={errors.SERIAL_NUMBER}
                        {...field}
                      />
                    );
                  },
                }}
              />
              <Field
                controller={{
                  name: "ASSET_COST",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <InputField
                        {...register("ASSET_COST", {
                          validate: (fieldValue: any) => {
                            const sanitizedValue = fieldValue
                              ?.toString()
                              ?.replace(/[^0-9]/g, "");
                            setValue("ASSET_COST", sanitizedValue);
                            return true;
                          },
                        })}
                        label={t("Approximate Cost")}
                        invalidMessage={errors.ASSET_COST?.message}
                        {...field}
                      />
                    );
                  },
                }}
              />
              <Field
                controller={{
                  name: "BENCHMARK_VALUE",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <InputField
                        {...register("BENCHMARK_VALUE", {
                          validate: (fieldValue: any) => {
                            const sanitizedValue = fieldValue
                              ?.toString()
                              ?.replace(/[^0-9]/g, "");
                            setValue("BENCHMARK_VALUE", sanitizedValue);
                            return true;
                          },
                        })}
                        label="Benchmark Value"
                        invalid={errors.BENCHMARK_VALUE}
                        {...field}
                      />
                    );
                  },
                }}
              />
              <Field
                controller={{
                  name: "MTBF_HOURS",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <InputField
                        {...register("MTBF_HOURS", {
                          validate: (fieldValue: any) => {
                            const sanitizedValue = fieldValue
                              ?.toString()
                              ?.replace(/[^0-9]/g, "");
                            setValue("MTBF_HOURS", sanitizedValue);
                            return true;
                          },
                        })}
                        label="MTBF (Hours)"
                        invalid={errors.MTBF_HOURS}
                        {...field}
                      />
                    );
                  },
                }}
              />
              <Field
                controller={{
                  name: "VENDOR_NAME",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <Select
                        options={options?.vendorList}
                        {...register("VENDOR_NAME")}
                        label="Vendor Name"
                        optionLabel="VENDOR_NAME"
                        invalid={errors.VENDOR_NAME}
                        findKey={"VENDOR_ID"}
                        selectedData={selectedDetails?.VENDOR_ID}
                        setValue={setValue}
                        {...field}
                      />
                    );
                  },
                }}
              />
              <Field
                controller={{
                  name: "WARREANTY_DATE",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <DateCalendar
                        {...register("WARREANTY_DATE")}
                        label="Warranty End Date"
                        showIcon
                        setValue={setValue}
                        {...field}
                      />
                    );
                  },
                }}
              />
             
              <Field
                controller={{
                  name: "COMMISSIONING_DATE",
                  control: control,
                  rules: {
                    validate: (value: any) => {
                      return value && value !== '' ? true : "Please fill the required fields.";
                    },
                  },
                  render: ({ field, fieldState }: any) => {
                    return (
                      <DateCalendar
                        value={field.value} // Ensure the value is synced with react-hook-form
                        onChange={(e: any) => {
                          // Explicitly update the value using setValue or field.onChange
                          field.onChange(e.value);
                        }}
                        label={t("Commissioning Date")}
                        require={true}
                        invalid={fieldState?.error} // Show error if validation fails
                        showIcon
                        setValue={setValue} // Optional: if you need to manually set the value elsewhere
                      />
                    );
                  },
                }}
              />


              <Field
                controller={{
                  name: "LAST_DATE",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <DateCalendar
                        {...register("LAST_DATE")}
                        label="Maintenance PM Date"
                        showIcon
                        setValue={setValue}
                        {...field}
                      />
                    );
                  },
                }}
              />
              {fields.map((arrayField: any, index: number) => {
                return (
                  <React.Fragment key={arrayField?.FIELDNAME}>
                    <div>
                      <Field
                        controller={{
                          name: `EXTRA_COL_LIST.${index}.VALUE`,
                          control: control,
                          render: ({ field }: any) => {
                            return (
                              <InputField
                                {...register(`EXTRA_COL_LIST.${index}`, {})}
                                label={arrayField?.LABEL}
                                placeholder={"Please Enter"}
                                {...field}
                              />
                            );
                          },
                        }}
                      />
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </Card>
        </form>
      </section>
    </>
  );
};

export default AssetMasterForm;
