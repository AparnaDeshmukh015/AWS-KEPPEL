import {
  set,
  SubmitErrorHandler,
  useFieldArray,
  useForm,
} from "react-hook-form";
import React, { useCallback, useEffect, useState } from "react";
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
import { saveTracker } from "../../../utils/constants";
import {
  eventNotification,
  helperEventNotification,
} from "../../../utils/eventNotificationParameter";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import { helperNullDate } from "../../../utils/constants";
import { InputTextarea } from "primereact/inputtextarea";
import MultiSelects from "../../../components/MultiSelects/MultiSelects";
import { PATH } from "../../../utils/pagePath";
import { decryptData } from "../../../utils/encryption_decryption";
import {
  clearScheduleTaskList,
  upsertScheduleTask,
} from "../../../store/scheduleTaskListStore";
import { useDispatch, useSelector } from "react-redux";
import {
  clearScheduleGroup,
  setScheduleGroup,
} from "../../../store/scheduleGroup";
import {
  clearScheduleLocation,
  setScheduleLocation,
} from "../../../store/schedulelocation";
import "../../../components/Calendar/Calendar.css";

import LoaderS from "../../../components/Loader/Loader";
const AssetMasterForm = (props: any) => {
  const dispatch = useDispatch();
  const scheduleTaskList = useSelector((state: any) => state.scheduleTaskList);

  const { t } = useTranslation();
  const location = useLocation();

  const scheduleGroup = useSelector((state: any) => state.scheduleGroup);

  const [typeError, setTypeError] = useState<any | null>(false);
  const [groupError, setGroupError] = useState<any | null>(false);
  const [assetNameError, setAssetNameError] = useState<any | null>(false);

  const [options, setOptions] = useState<any>({});
  const [selectedDetails, setSelectedDetails] = useState<any>([]);
  const [editStatus, setEditStatus] = useState<any | null>(false);
  const [typeList, setTypeList] = useState<any | null>([]);
  const [assigneeList, setAssigneeList] = useState<any | null>([]);
  const [Descriptionlength, setDescriptionlength] = useState(0);
  const [issueList, setIssueList] = useState<any | null>([]);
  const [ppmAssignee, setPPMAssignee] = useState<any | null>([]);
  const [vendorList, setVendorList] = useState<any | null>([]);
  const [assetTypeState, setAssetTypeState] = useState<any | null>(false);
  const [selectedLocationSchedule, setselectedLocationSchedule] = useState<
    any | null
  >();
  // const [selectedSchedule, setSelectedSchedule] = useState<any | null>(null);
  const [schedId, setScheId] = useState<any | null>(0);
  const [IsSubmit, setIsSubmit] = useState<any | null>(false);
  const [scheduleGroupStatus, setScheduleGroupStatus] = useState<any | null>(
    false
  );
  const [selectedscheduleID, setselectedscheduleID] = useState<any | null>();
  const [selectedAssetId, setselectedAssetId] = useState<any | null>();
  const [loadig, setLoading] = useState<any | null>(false);
  const [locationError, setLocationError] = useState<any | null>(false);
  const FACILITY: any = localStorage.getItem("FACILITYID");
  const FACILITY_ID: any = JSON.parse(FACILITY);
  if (FACILITY_ID) {
    var facility_type: any = FACILITY_ID?.FACILITY_TYPE;
  }

  const [selectedScheduleTaskDetails, setSelectedScheduleTaskDetails] =
    useState<any>();
  const { search } = useLocation();

  const handleInputChange = (event: any) => {
    const value = event.target.value;
    setDescriptionlength(value.length);
  };

  let { pathname } = useLocation();
  const [, menuList]: any = useOutletContext();
  const currentMenu = menuList
    ?.flatMap((menu: any) => menu?.DETAIL)
    .filter((detail: any) => detail.URL === pathname)[0];
  const getId: any = localStorage.getItem("Id");
  const dataId = JSON.parse(getId);
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
      ASSET_NAME: "",
      GROUP: "",
      TYPE: null,
      BAR_CODE: "",
      MAKE: "",
      MODEL: "",
      CURRENT_STATE: "",
      ACTIVE: search === "?edit=" ? dataId?.ACTIVE : true,
      ASSET_DESC: "",
      LINK_OBEM: "",
      ASSET_NONASSET: "A",
      ASSET_FOLDER_ID: "",
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
  const TypeWatch = watch("TYPE");
  const GroupWatch = watch("GROUP");
  const LocationWatch = watch("LOCATION");
  const AssetNameWatch = watch("ASSET_NAME");
  const ASSET_FOLDER_DATA = watch("ASSET_FOLDER_ID");

  const [type, group, watchedLocation, assetName] = watch([
    "TYPE",
    "GROUP",
    "LOCATION",
    "ASSET_NAME",
  ]);

  const allFieldsFilled: any = !!(
    type &&
    group &&
    watchedLocation &&
    assetName
  );

  useEffect(() => {
    // if (search !== "?edit") {
    const savedData = sessionStorage.getItem("formData");
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      Object.keys(parsedData).forEach((key: any) => {
        setValue(key, parsedData[key]);
      });
      // }
    }
  }, [setValue]);
  useEffect(() => {
    sessionStorage.setItem("formData", JSON.stringify(watchAll));
  }, [watchAll]);

  const User_Name = decryptData(localStorage.getItem("USER_NAME"));

  const { fields, append: colAppend } = useFieldArray({
    name: "EXTRA_COL_LIST",
    control,
  });

  const getSelectedScheduleId = (selectedScheduleId: number) =>
    setselectedscheduleID(selectedScheduleId);

  const ASSET_DESCWatch: any = watch("ASSET_DESC") || "";
  useEffect(() => {
    if (ASSET_DESCWatch) setDescriptionlength(ASSET_DESCWatch.length);
  }, [ASSET_DESCWatch]);

  const MANINTENANCE: any = watch("UNDERAMC");
  const scheduleDetails = location.state?.SCHEDULE_DETAILS;

  useEffect(() => {
    if (scheduleDetails) {
      dispatch(upsertScheduleTask(scheduleDetails));
    }
  }, [scheduleDetails]);
  console.log(Object.keys(options).length, "Object.keys(options).length");
  const onError: SubmitErrorHandler<any> = (errors, _) => {};

  const onSubmit = useCallback(
    async (payload: any) => {
      try {
        if (IsSubmit) return true;
        setIsSubmit(true);

        let schedule_Id: any = "0";
        let schedulerPayload: any;

        if (!payload.SCHEDULE_ID || editStatus || payload.SCHEDULE_ID === 0) {
          let schedulerData: any;
          if (location?.state !== null && facility_type == "I") {
            // location?.state?.SCHEDULE_DETAILS.MODE="A";
            schedulerData = location?.state?.SCHEDULE_DETAILS;
          } else {
            schedulerData = payload?.SCHEDULER;

            const updatedTaskList: any =
              payload?.SCHEDULER?.SCHEDULE_TASK_D?.filter(
                (task: any) => task.isChecked === true
              );
            const tasksWithoutIsChecked = updatedTaskList.map(
              ({ isChecked, ...rest }: any) => rest
            );

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
            schedulerData.MONTHLYONCETWICE =
              schedulerData?.MONTHLYONCETWICE?.key;

            // schedulerData.MODE = !!payload.SCHEDULE_ID ? "E" : "A";

            // schedulerData.MODE = schedulerData?.SCHEDULE_ID !== 0 ? "E" : "A";

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
                schedulerData[elem] = moment(schedulerData[elem]).format(
                  "HH:mm"
                );
              }
            });

            schedulerData.MONTH_OPTION =
              schedulerData?.MONTH_OPTION?.MONTH_OPTION || "";

            schedulerData.SCHEDULE_TASK_D = tasksWithoutIsChecked
              ? tasksWithoutIsChecked
              : [];
            schedulerPayload = {
              ...payload?.SCHEDULER,
              ASSETTYPE_ID: payload?.TYPE?.ASSETTYPE_ID,
              REQ_ID: schedulerData?.Record?.REQ_ID,
            };
            delete payload?.SCHEDULER?.Record;
          }

          // return
          if (schedulerData?.SCHEDULE_NAME !== null) {
            const res1 = await callPostAPI(
              ENDPOINTS.SCHEDULE_SAVE,
              facility_type == "I"
                ? {
                    ...schedulerData,
                    MODE:
                      schedulerData?.SCHEDULE_ID &&
                      schedulerData?.SCHEDULE_ID !== "0"
                        ? "E"
                        : "A",
                    FUNCTION_CODE: currentMenu?.FUNCTION_CODE,
                  }
                : schedulerPayload,
              "AS067"
            );
            schedule_Id = res1?.SCHEDULE_ID;
          }
        }
        delete payload?.SCHEDULER;
        const updateColList: any = payload?.EXTRA_COL_LIST?.filter(
          (item: any) => item?.VALUE
        ).map((data: any) => ({
          [data?.FIELDNAME]: data?.VALUE,
        }));
        // payload.SCHEDULE_ID = payload?.SCHEDULE_ID !== 0 ? payload?.SCHEDULE_ID : 0;
        payload.SCHEDULE_ID =
          selectedscheduleID === null ||
          selectedscheduleID === "0" ||
          selectedscheduleID === undefined
            ? schedule_Id
            : selectedscheduleID;
        payload.EXTRA_COL_LIST = updateColList || [];
        payload.ACTIVE = payload?.ACTIVE === true ? 1 : 0;
        payload.LOCATION_ID = payload?.LOCATION?.LOCATION_ID;
        payload.ASSETGROUP_ID = payload?.GROUP?.ASSETGROUP_ID;
        payload.ASSETTYPE_ID = payload?.TYPE?.ASSETTYPE_ID;
        payload.MAKE_ID = payload?.MAKE?.MAKE_ID ?? "";
        payload.MODEL_ID = payload?.MODEL?.MODEL_ID ?? "";
        payload.UNDERAMC = payload.UNDERAMC === true ? 1 : 0;
        payload.CS_ID = payload?.CURRENT_STATE?.CS_ID;
        payload.VENDOR_ID = payload?.VENDOR_NAME?.VENDOR_ID || "";
        payload.OBEM_ASSET_ID = payload?.LINK_OBEM?.ASSET_ID;
        payload.OWN_LEASE = payload?.ASSET?.key || "";
        payload.AMC_VENDOR = payload?.UNDERAMC
          ? payload?.AMC_VENDOR?.VENDOR_ID
          : "";
        payload.AMC_EXPIRY_DATE = payload?.UNDERAMC
          ? moment(payload.AMC_DATE).format("YYYY-MM-DD")
          : "";
        payload.COMMISSIONING_DATE = payload.COMMISSIONING_DATE
          ? moment(payload.COMMISSIONING_DATE).format("YYYY-MM-DD")
          : "";
        payload.WARRANTY_END_DATE = payload.WARREANTY_DATE
          ? moment(payload.WARREANTY_DATE).format("YYYY-MM-DD")
          : "1900-01-01T00:00:00";
        payload.LAST_MAINTANCE_DATE = payload.LAST_DATE
          ? moment(payload.LAST_DATE).format("YYYY-MM-DD")
          : "1900-01-01T00:00:00";
        payload.MODE = search === "?edit=" ? "E" : "A";
        payload.PARA =
          search === "?edit="
            ? { para1: `${props?.headerName}`, para2: t("Updated") }
            : { para1: `${props?.headerName}`, para2: t("Added") };
        payload.ASSIGN_LIST = payload?.ASSIGN_TO;
        payload.ASSET_FOLDER_ID =
          facility_type === "I"
            ? payload?.ASSET_FOLDER_ID?.ASSET_FOLDER_ID
            : "";

        payload.ASSET_ID =
          search === "?edit=" ? sessionStorage.getItem("asset_id") : "";

        delete payload?.LOCATION;
        delete payload?.GROUP;
        delete payload?.TYPE;
        delete payload?.MODEL;
        delete payload?.MAKE;
        // delete payload?.CURRENT_STATE;
        delete payload?.VENDOR_NAME;
        delete payload?.LINK_OBEM;
        delete payload.LAST_DATE;
        delete payload?.WARREANTY_DATE;
        delete payload?.AMC_DATE;
        delete payload?.ASSET;
        delete payload?.ASSIGN_TO;

        const res = await callPostAPI(
          ENDPOINTS.ASSETMASTER_SAVE,
          payload,
          "AS007"
        );
        if (res?.FLAG === true) {
          toast?.success(res?.MSG);
          const notifcation: any = {
            FUNCTION_CODE: currentMenu?.FUNCTION_CODE,
            EVENT_TYPE: "M",
            STATUS_CODE: search === "?edit=" ? 2 : 1,
            PARA1: search === "?edit=" ? User_Name : User_Name,
            PARA2: payload?.ASSET_CODE,
            PARA3: payload?.ASSET_NAME,
            PARA4: payload?.BAR_CODE,
            PARA5: payload?.ASSET_COST,
            PARA6: payload?.BENCHMARK_VALUE,
            PARA7: payload.COMMISSIONING_DATE
              ? moment(payload.COMMISSIONING_DATE).format("YYYY-MM-DD")
              : "",
            PARA8: (payload.WARRANTY_END_DATE = payload.WARREANTY_DATE
              ? moment(payload.WARREANTY_DATE).format("YYYY-MM-DD")
              : ""),
            PARA9: (payload.AMC_EXPIRY_DATE = payload?.UNDERAMC
              ? moment(payload.AMC_DATE).format("YYYY-MM-DD")
              : ""),
            PARA10: payload?.ASSET_NONASSET,
          };

          const eventPayload = { ...eventNotification, ...notifcation };
          await helperEventNotification(eventPayload);
          if (location?.state === null || location?.state !== null) {
            // props?.getAPI();
            props?.isClick();
            // }
          } else {
            setIsSubmit(false);
            toast?.error(res?.MSG);
          }
        }
      } catch (error: any) {
        toast?.error(error);
      } finally {
        setIsSubmit(false);
      }
    },
    [
      IsSubmit,
      editStatus,
      selectedDetails,
      props?.headerName,
      search,
      location?.state,
      currentMenu?.FUNCTION_CODE,
      User_Name,
      eventNotification,
      helperEventNotification,
      callPostAPI,
      // selectedSchedule,
      toast,
      selectedscheduleID,
    ]
  );

  const labelAsset: any = [
    { name: "Owned", key: "O" },
    { name: "Leased", key: "L" },
  ];
  const labelParent: any = [
    { name: "Yes", key: "Y" },
    { name: "No", key: "N" },
  ];

  const selectedLocationTemplate = (option: any, props: any) => {
    if (option) {
      return (
        <div className="flex align-items-center">
          <div>
            {option.LOCATION_DESCRIPTION == null
              ? option.LOCATION_NAME
              : option.LOCATION_DESCRIPTION}
          </div>
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

  const getScheduleList = async (assetId: any) => {
    try {
      const payload = {
        ASSETTYPE_ID: assetId,
      };
      const res = await callPostAPI(ENDPOINTS.SCHEDULE_LIST, payload, "AS067");

      const SCHEDULELISTs = res.SCHEDULELIST;

      for (let i = 0; i < SCHEDULELISTs.length; i++) {
        dispatch(upsertScheduleTask(SCHEDULELISTs[i]));
      }

      if (search === "?edit=") {
        // const assetTypeList: any = options?.assetType?.filter((f: any) => f.ASSETGROUP_ID === watchAll?.GROUP?.ASSETGROUP_ID)
        // setTypeList(assetTypeList)
        getSelectedScheduleId(res?.SCHEDULELIST[0]?.SCHEDULE_ID || 0);
        setValue("SCHEDULE_ID", res?.SCHEDULELIST[0]?.SCHEDULE_ID || 0);
        setValue("SCHEDULER.SCHEDULE_ID", res?.SCHEDULELIST[0]?.SCHEDULE_ID);
      }
    } catch (error) {}
  };

  const getAssetDetails = async (columnCaptions: any, ASSET_ID?: any) => {
    const getId: any = localStorage.getItem("Id");
    const assetId: any = JSON.parse(getId);

    const payload: any = {
      ASSET_NONASSET: "A",
      ASSET_ID:
        location?.state !== null
          ? ASSET_ID
          : props?.selectedData === null
          ? assetId?.ASSET_ID
          : props?.selectedData?.ASSET_ID,
    };
    try {
      const res = await callPostAPI(ENDPOINTS.ASSETMASTER_DETAILS, payload, "");

      if (res && res.FLAG === 1) {
        const assetTypeList: any = res?.ASSESTTYPELIST?.filter(
          (f: any) =>
            f.ASSETGROUP_ID === res?.ASSETDETAILSLIST[0]?.ASSETGROUP_ID
        );

        setTypeList(assetTypeList);
        setSelectedDetails(res?.ASSETDETAILSLIST[0]);
        setselectedAssetId(res?.ASSETDETAILSLIST[0]?.ASSET_ID);
        sessionStorage.setItem("asset_id", res?.ASSETDETAILSLIST[0]?.ASSET_ID);

        setScheId(
          res?.ASSETDETAILSLIST[0]?.SCHEDULE_ID !== null
            ? res?.ASSETDETAILSLIST[0]?.SCHEDULE_ID
            : 0
        );
        localStorage.setItem(
          "SCHEDULE_ID",
          JSON?.stringify(res?.ASSETDETAILSLIST[0]?.SCHEDULE_ID)
        );
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
        setValue("ASSET_NAME", res?.ASSETDETAILSLIST[0]?.ASSET_NAME);
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

        setSelectedScheduleTaskDetails(res?.SCHEDULELIST[0]);
        const payload: any = {
          ASSETGROUP_ID: res?.ASSETDETAILSLIST[0]?.ASSETGROUP_ID,
        };
        const res1 = await callPostAPI(
          ENDPOINTS.GET_ASSETGROUPTEAMLIST,
          payload,
          "AS067"
        );

        if (res1 && res1.FLAG === 1) {
          setPPMAssignee(res1?.TECHLIST);
        }
        if (facility_type === "R") {
          const payload1: any = {
            ASSETGROUP_ID: res?.ASSETDETAILSLIST[0]?.ASSETGROUP_ID,
            ASSET_NONASSET: res?.ASSETDETAILSLIST[0]?.ASSET_NONASSET,
          };

          const res2 = await callPostAPI(
            ENDPOINTS.GET_SERVICEREQUEST_WORKORDER,
            payload1,
            "AS067"
          );

          if (res2?.FLAG === 1) {
            setIssueList(res2?.WOREQLIST);
          } else {
            setIssueList([]);
          }
        }
        // await getRequestList(res?.ASSETDETAILSLIST[0]?.ASSETGROUP_ID, res?.ASSETDETAILSLIST[0]?.ASSET_NONASSET)
        setAssigneeList(res?.ASSIGNLIST);
        const configList = res.CONFIGLIST[0];
        for (let key in configList) {
          if (configList[key] === null) {
            delete configList[key];
          }
        }
        if (res?.ASSETDETAILSLIST[0]?.ASSETTYPE_ID !== null) {
          if (facility_type === "I" || facility_type === "R") {
            await getScheduleList(res?.ASSETDETAILSLIST[0]?.ASSETTYPE_ID);
          }
        }

        const previousColumnCaptions: any = columnCaptions.map((item: any) => ({
          ...item,
          VALUE: configList[item.FIELDNAME],
        }));

        colAppend(previousColumnCaptions);

        const SCHEDULELIST = res.SCHEDULELIST;

        setScheduleGroupStatus(false);

        if (facility_type === "I") {
          for (let i = 0; i < SCHEDULELIST.length; i++) {
            dispatch(upsertScheduleTask(SCHEDULELIST[i]));
          }

          const Data: any = {
            ASSETGROUP_ID: res?.ASSETDETAILSLIST[0]?.ASSETGROUP_ID,
            ASSETTYPE_ID: res?.ASSETDETAILSLIST[0]?.ASSETTYPE_ID,
          };

          dispatch(setScheduleGroup(Data));
        }
        // setValue("LOCATION", res?.ASSETDETAILSLIST[0]?.LOCATION_ID);
      }
    } catch (error: any) {
      toast?.error(error);
    } finally {
    }
  };
  console.log(options, "option");
  useEffect(() => {
    if (search === "?edit=") {
      const getScheduleId: any = localStorage.getItem("SCHEDULE_ID");
      const scheduleId = JSON.parse(getScheduleId);
      if (scheduleId !== null && scheduleId !== undefined) {
        setScheId(scheduleId);
      }
    }
  }, [selectedDetails, search]);

  const getRequestList = async (ASSETGROUP_ID: any, ASSET_NONASSET?: any) => {
    setValue("TYPE", null);
    const payload: any = {
      ASSETGROUP_ID: ASSETGROUP_ID,
      ASSET_NONASSET: ASSET_NONASSET?.key
        ? ASSET_NONASSET?.key
        : ASSET_NONASSET,
    };

    const res = await callPostAPI(
      ENDPOINTS.GET_SERVICEREQUEST_WORKORDER,
      payload,
      "AS067"
    );

    if (res?.FLAG === 1) {
      setIssueList(res?.WOREQLIST);
    } else {
      setIssueList([]);
    }
    // if (search === "?add=") {
    await GET_ASSETGROUPTEAMLIST(ASSETGROUP_ID);
    // }
  };

  const GET_ASSETGROUPTEAMLIST = async (ASSETGROUP_ID: any) => {
    const payload: any = {
      ASSETGROUP_ID: ASSETGROUP_ID,
    };
    const res = await callPostAPI(
      ENDPOINTS.GET_ASSETGROUPTEAMLIST,
      payload,
      "HD004"
    );

    if (res?.FLAG === 1) {
      setPPMAssignee(res?.TECHLIST);
      setValue("ASSET_NAME", dataId?.ASSET_NAME);
    } else {
      setPPMAssignee([]);
    }
  };

  const getOptions = async () => {
    const payload = {
      ASSETTYPE: "A",
    };
    try {
      let res1 = await callPostAPI(ENDPOINTS.LOCATION_HIERARCHY_LIST, "AS067");
      let res = await callPostAPI(
        ENDPOINTS.GETASSETMASTEROPTIONS,
        payload,
        "AS067"
      );

      if (res && res1 && res?.FLAG === 1) {
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
          location: res1?.LOCATIONHIERARCHYLIST,
          hirarchy: res?.EQUIPMENTHIERARCHYLIST.map((f: any) => ({
            ASSET_FOLDER_DESCRIPTION:
              f.ASSET_FOLDER_DESCRIPTION !== null &&
              f.ASSET_FOLDER_DESCRIPTION.trim() !== ""
                ? f.ASSET_FOLDER_DESCRIPTION
                : "no label",
            ASSET_FOLDER_ID: f.ASSET_FOLDER_ID,
            ASSETGROUP_ID: f.ASSETGROUP_ID,
            ASSETTYPE_ID: f.ASSETTYPE_ID,
          })), // f.ASSET_FOLDER_DESCRIPTION.trim()!==""),
        });

        setVendorList(res?.VENDORELIST);

        const columnCaptions = res?.CONFIGLIST.map((item: any) => ({
          FIELDNAME: item.FIELDNAME,
          LABEL: item?.COLUMN_CAPTION,
          VALUE: "",
        }));

        if (search === "?edit=") {
          if (location?.state !== null && vendorList && options) {
            await getAssetDetails(columnCaptions, location?.state?.ASSET_ID);
          } else {
            await getAssetDetails(columnCaptions);
          }
        } else {
          colAppend(columnCaptions);
        }
        if (GroupWatch) {
          const assetTypeList: any = res?.ASSESTTYPELIST?.filter(
            (f: any) => f.ASSETGROUP_ID === watchAll?.GROUP?.ASSETGROUP_ID
          );
          setTypeList(assetTypeList);

          if (typeList && typeList.length !== 0) {
            setValue("TYPE", TypeWatch);
          }
        }
      }
    } catch (error) {
    } finally {
    }
  };

  useEffect(() => {
    if (allFieldsFilled === true) {
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
    } else {
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
    }
  }, [isSubmitting, locationError]);

  useEffect(() => {
    if (watchAll?.GROUP) {
      setGroupError(false);
      const assetTypeList: any = options?.assetType?.filter(
        (f: any) => f.ASSETGROUP_ID === watchAll?.GROUP?.ASSETGROUP_ID
      );

      setTypeList(assetTypeList);
      if (typeList && typeList.length !== 0) {
        setValue("TYPE", TypeWatch);
      }

      if (facility_type === "I" && location?.state !== null) {
        selectedDetails.ASSETTYPE_ID = scheduleGroup[0]?.ASSETTYPE_ID;
      }
      setPPMAssignee(ppmAssignee);
      setAssigneeList(assigneeList);
      setValue("SCHEDULER.SCHEDULE_TASK_D", []);
      setValue("SCHEDULER.SCHEDULE_ID", 0);
      setValue("SCHEDULE_ID", 0);
    }
  }, [watchAll?.GROUP, options, facility_type, location?.state]);

  useEffect(() => {
    (async function () {
      try {
        if (currentMenu || location.state !== null) {
          await saveTracker(currentMenu);
          await getOptions();
        }
        if (search === "?add=") {
        }
      } catch (error: any) {
        if (search === "?add=") {
        }
        toast?.error(error);
      } finally {
        if (search === "?add=") {
        }
      }
    })();
  }, [currentMenu, location.state, props?.selectedData]);
  useEffect(() => {
    if (MANINTENANCE === false) {
      setValue("AMC_DATE", "");
      setValue("AMC_VENDOR", "");
    }
  }, [MANINTENANCE]);

  useEffect(() => {
    if (watchAll?.ASSET_NAME !== "") {
      setAssetNameError(false);
    }
    if (watchAll?.TYPE !== null) {
      setTypeError(false);
    }
  }, [watchAll?.ASSET_NAME, watchAll?.TYPE]);

  const infraScheduleData = (infraData: any) => {};
  useEffect(() => {
    if (options?.location && watchAll?.LOCATION?.LOCATION_ID) {
      setLocationError(false);
      const selecetedlocationSchedule: any = options?.location?.filter(
        (f: any) => f.LOCATION_ID === watchAll?.LOCATION?.LOCATION_ID
      );

      setselectedLocationSchedule(selecetedlocationSchedule[0]);
    }
  }, [options?.location, watchAll?.LOCATION?.LOCATION_ID]);

  return (
    <>
      {/* {loadig ? (
        <LoaderS />
      ) : ( */}
      <section className="w-full">
        <form onSubmit={handleSubmit(onSubmit, onError)}>
          <div className="flex justify-between mt-1">
            <div>
              <h6 className="Text_Primary">
                {t(`${search === "?edit=" ? "Edit" : "Add"}`)}{" "}
                {props?.headerName}{" "}
              </h6>
            </div>
            <div className="flex">
              {search === "?edit=" ? (
                <>
                  {currentMenu?.UPDATE_RIGHTS === "True" && (
                    <Buttons
                      type="submit"
                      disabled={IsSubmit}
                      className="Primary_Button  w-20 me-2"
                      label={"Save"}
                    />
                  )}
                </>
              ) : (
                <>
                  {search === "?add=" ? (
                    <Buttons
                      type="submit"
                      disabled={IsSubmit}
                      className="Primary_Button  w-20 me-2"
                      label={"Save"}
                    />
                  ) : (
                    ""
                  )}
                </>
              )}
              {currentMenu?.UPDATE_RIGHTS === "True" && (
                <Buttons
                  className="Secondary_Button w-20 "
                  label={"List"}
                  onClick={props?.isClick}
                />
              )}
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
                          //This is Aparna Code
                          onChange: (e: any) => {
                            dispatch(clearScheduleLocation());
                            dispatch(setScheduleLocation(e?.target.value));
                          },
                        })}
                        label="Location"
                        require={true}
                        optionLabel="LOCATION_NAME"
                        valueTemplate={selectedLocationTemplate}
                        itemTemplate={locationOptionTemplate}
                        invalid={locationError ? true : !!errors.LOCATION}
                        filter={true}
                        findKey={"LOCATION_ID"}
                        selectedData={
                          selectedDetails.LOCATION_ID !== undefined
                            ? selectedDetails.LOCATION_ID
                            : ""
                        }
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
                          validate: (value) =>
                            value.trim() !== "" ||
                            "Please fill the required fields",
                        })}
                        label="Name"
                        require={true}
                        invalid={assetNameError ? true : !!errors.ASSET_NAME}
                        setValue={setValue}
                        {...field}
                      />
                    );
                  },
                }}
              />
              {facility_type === "R" ? (
                ""
              ) : (
                <>
                  <div className="col-span-1">
                    <label className="Text_Secondary Input_Label">
                      {t("Description")}
                    </label>
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
                    <label
                      className={` ${
                        Descriptionlength === 400
                          ? "text-red-600"
                          : "Text_Secondary"
                      } Helper_Text`}
                    >
                      {t(`Up to ${Descriptionlength}/400 characters.`)}
                    </label>
                  </div>
                </>
              )}

              {facility_type === "I" && (
                <>
                  {Object.keys(options).length === 0 ? (
                    <>
                      <LoaderS />
                    </>
                  ) : (
                    <Field
                      controller={{
                        name: "ASSET_FOLDER_ID",
                        control: control,
                        render: ({ field }: any) => {
                          return (
                            <Select
                              options={
                                options?.hirarchy?.length > 0
                                  ? options?.hirarchy
                                  : []
                              }
                              {...register("ASSET_FOLDER_ID", {
                                required:
                                  facility_type === "I"
                                    ? "Please fill the required fields"
                                    : "",
                              })}
                              filter={true}
                              label="Equipment Hierarchy"
                              optionLabel="ASSET_FOLDER_DESCRIPTION"
                              findKey={"ASSET_FOLDER_ID"}
                              require={facility_type === "I" ? true : false}
                              selectedData={selectedDetails?.ASSET_FOLDER_ID}
                              setValue={setValue}
                              invalid={
                                facility_type === "I"
                                  ? errors.ASSET_FOLDER_ID
                                  : ""
                              }
                              {...field}
                            />
                          );
                        },
                      }}
                    />
                  )}
                </>
              )}
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
                          onChange: async (e: any) => {
                            setValue("ASSIGN_TO", "");

                            await getRequestList(
                              e?.target?.value?.ASSETGROUP_ID,
                              e?.target?.value?.ASSETGROUP_TYPE
                            );
                          },
                        })}
                        label="Group"
                        require={true}
                        filter={true}
                        optionLabel="ASSETGROUP_NAME"
                        findKey={"ASSETGROUP_ID"}
                        selectedData={selectedDetails?.ASSETGROUP_ID}
                        setValue={setValue}
                        invalid={groupError ? true : !!errors.GROUP}
                        // invalid={errors.GROUP}
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
                  render: ({ field, fieldState }: any) => {
                    return (
                      <Select
                        options={typeList}
                        {...register("TYPE", {
                          required: "Please fill the required fields",
                          onChange: async (e: any) => {
                            dispatch(clearScheduleGroup());
                            dispatch(setScheduleGroup(e?.target.value));
                            setAssetTypeState(true);
                            dispatch(clearScheduleTaskList());
                            await getScheduleList(
                              e?.target?.value?.ASSETTYPE_ID
                            );
                          },
                        })}
                        label="Type"
                        require={true}
                        filter={true}
                        optionLabel="ASSETTYPE_NAME"
                        findKey={"ASSETTYPE_ID"}
                        selectedData={selectedDetails?.ASSETTYPE_ID}
                        setValue={setValue}
                        invalid={typeError ? true : !!errors.TYPE}
                        // invalid={errors.TYPE || allFieldsFilled === false ? errors.TYPE : "" }
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
                        {...register("MAKE", {})}
                        label="Make"
                        optionLabel="MAKE_NAME"
                        findKey={"MAKE_ID"}
                        filter={true}
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
                        filter={true}
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
                        {...register("CURRENT_STATE", {})}
                        label="Current Status"
                        optionLabel="CS_DESC"
                        findKey={"CS_ID"}
                        filter={true}
                        selectedData={selectedDetails?.CS_ID}
                        setValue={setValue}
                        {...field}
                      />
                    );
                  },
                }}
              />

              {facility_type === "R" ? (
                <>
                  <div className="col-span-1">
                    <label className="Text_Secondary Input_Label">
                      {t("Description")}
                    </label>
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
                    <label
                      className={` ${
                        Descriptionlength === 400
                          ? "text-red-600"
                          : "Text_Secondary"
                      } Helper_Text`}
                    >
                      {t(`Up to ${Descriptionlength}/400 characters.`)}
                    </label>
                  </div>
                </>
              ) : (
                ""
              )}

              <Field
                controller={{
                  name: "ASSIGN_TO",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <MultiSelects
                        options={ppmAssignee}
                        {...register("ASSIGN_TO", {})}
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
                            props?.selectedData?.ACTIVE === true ? true : false
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
            ASSET_FOLDER_DATA={ASSET_FOLDER_DATA}
            errors={errors}
            setValue={setValue}
            watchAll={watchAll}
            register={register}
            control={control}
            watch={watch}
            resetField={resetField}
            scheduleTaskList={scheduleTaskList}
            scheduleId={
              search === "?edit=" && assetTypeState === true
                ? 0
                : search === "?edit="
                ? schedId
                : 0
            }
            getValues={getValues}
            setEditStatus={setEditStatus}
            isSubmitting={isSubmitting}
            AssetSchedule={
              TypeWatch == undefined ||
              TypeWatch == null ||
              GroupWatch == undefined ||
              GroupWatch == null ||
              LocationWatch == undefined ||
              LocationWatch == null ||
              AssetNameWatch == undefined ||
              AssetNameWatch == null
                ? false
                : true
            }
            issueList={issueList}
            setScheduleTaskList={upsertScheduleTask}
            setAssetTypeState={setAssetTypeState}
            assetTypeState={assetTypeState}
            setSelectedSchedule={setselectedscheduleID}
            infraScheduleData={infraScheduleData}
            typewatch={TypeWatch}
            setScheduleGroupStatus={setScheduleGroupStatus}
            getSelectedScheduleId={getSelectedScheduleId}
            selectedLocationSchedule={selectedLocationSchedule}
            allFieldsFilled={allFieldsFilled}
            Mode={search === "?edit=" ? "edit" : "add"}
            setLocationError={setLocationError}
            setTypeError={setTypeError}
            setGroupError={setGroupError}
            setAssetNameError={setAssetNameError}
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
                            {...register("UNDERAMC", {})}
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
                  <Field
                    controller={{
                      name: "AMC_DATE",
                      control: control,
                      rules: {
                        validate: (value: any) => {
                          return value && value !== ""
                            ? true
                            : "Please fill the required fields";
                        },
                      },
                      render: ({ field, fieldState }: any) => {
                        return (
                          <DateCalendar
                            value={field.value}
                            onChange={(e: any) => {
                              field.onChange(e.value);
                            }}
                            label={t("AMC expiry Date")}
                            require={true}
                            invalid={fieldState?.error}
                            showIcon
                            setValue={setValue}
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
                              required:
                                MANINTENANCE === true
                                  ? "Please Fill the Required Fields."
                                  : "",
                            })}
                            label="AMC Vendor"
                            optionLabel="VENDOR_NAME"
                            require={MANINTENANCE === true ? true : false}
                            findKey={"VENDOR_ID"}
                            filter={true}
                            selectedData={selectedDetails?.AMC_VENDOR}
                            setValue={setValue}
                            invalid={
                              MANINTENANCE === true ? errors.AMC_VENDOR : ""
                            }
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
                        filter={true}
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
                      return value && value !== ""
                        ? true
                        : "Please fill the required fields.";
                    },
                  },
                  render: ({ field, fieldState }: any) => {
                    return (
                      <DateCalendar
                        value={field.value}
                        onChange={(e: any) => {
                          field.onChange(e.value);
                        }}
                        label={t("Commissioning Date")}
                        require={true}
                        // invalid={errors.COMMISSIONING_DATE}
                        invalid={fieldState?.error}
                        showIcon
                        setValue={setValue}
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
      {/* )} */}
    </>
  );
};

export default AssetMasterForm;
