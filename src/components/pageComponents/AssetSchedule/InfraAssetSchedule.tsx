import { Card } from "primereact/card";
import React, { useEffect, useState } from "react";
import { SubmitErrorHandler, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import InputField from "../../../components/Input/Input";
import Buttons from "../../../components/Button/Button";
import "./AssetScheduleForm.css";
import "../../Calendar/Calendar.css";
import "../../Input/Input.css";
import Field from "../../Field";
import Select from "../../../components/Dropdown/Dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import DateCalendar from "../../../components/Calendar/Calendar";
import TimeCalendar from "../../Calendar/TimeCalendar";
import { InputSwitch, InputSwitchChangeEvent } from "primereact/inputswitch";
import { SelectButton, SelectButtonChangeEvent } from "primereact/selectbutton";

import { RadioButton, RadioButtonChangeEvent } from "primereact/radiobutton";
import {
  eventNotification,
  helperEventNotification,
} from "../../../utils/eventNotificationParameter";

import { decryptData } from "../../../utils/encryption_decryption";
import { useDispatch } from "react-redux";
import { clearScheduleGroup } from "../../../store/scheduleGroup";
import "../../Calendar/Calendar.css";

import {
  LABELS,
  INFRS_EQUIPMENT_OPTIONS,
  convertTime,
  saveTracker,
  LOCALSTORAGE,
  helperNullDate,
} from "../../../utils/constants";
import Button from "../../../components/Button/Button";
import { callPostAPI } from "../../../services/apis";
import { ENDPOINTS } from "../../../utils/APIEndpoints";
import { toast } from "react-toastify";
import moment from "moment";
import { appName } from "../../../utils/pagePath";
import { useSelector } from "react-redux";

import { TreeExpandedKeysType } from "primereact/tree";
import HierarchyDialog from "../../HierarchyDialog/HierarchyDialog";

const InfraAssetSchedule = ({
  props,

  // watch,
  watchAll,
  // resetField,
  scheduleTaskList,
  scheduleId,

  setEditStatus,
  // isSubmitting,
  AssetSchedule,
  issueList,
  setScheduleTaskList,
  setAssetTypeState,
  assetTypeState,
  setSelectedSchedule,
  typewatch,
}: any) => {
  const dispatch = useDispatch();
  // This is where the state is accessed
  let pageInfra = localStorage.getItem("schedulePage");
  const FACILITY: any = localStorage.getItem("FACILITYID");
  const FACILITYID: any = JSON.parse(FACILITY);

  if (FACILITYID) {
    var facility_type: any = FACILITYID?.FACILITY_TYPE;
  }
  let { pathname } = useLocation();
  // Now you can use scheduleId as needed in your component
  const [selected, menuList]: any = useOutletContext();
  const currentMenu = menuList
    ?.flatMap((menu: any) => menu?.DETAIL)
    .filter((detail: any) => detail.URL === pathname);
  const [typeList, setTypeList] = useState<any | null>([]);
  const { search } = useLocation();
  const scheduleGroup = useSelector((state: any) => state.scheduleGroup);
  const scheduleLocation = useSelector((state: any) => state.scheduleLocation);

  const { t } = useTranslation();
  const [selectedDetails, setSelectedDetails] = useState<any>([]);
  const [Descriptionlength, setDescriptionlength] = useState(0);
  const [MONTHLY_1_MONTH_NUMs, setMONTHLY_1_MONTH_NUMs] = useState(0);
  const [checked, setChecked] = useState<boolean>(false);
  const [optiondisbled, setOptiondisbaled] = useState<boolean>(false);
  const [optiondisbledWeek, setOptiondisbaledWeek] = useState<boolean>(false);
  const options1: string[] = ["Daily", "Weekly", "Monthly", "Yearly"];
  const [options, setOptions] = useState<any>([]);
  const [Btnvalue, setBtnValue] = useState<string>(options1[0]);
  const [createWO, setWorkOrder] = useState<string>("");
  const [checkedrepeatuntil, setRepeatUntil] = useState<string>("");
  const [monthSelect, setMonthlist] = useState<string>("");

  const [assetGroupId, setAssetGroupId] = useState<any | null>(0);

  const [IsSubmit, setIsSubmit] = useState<any | null>(false);
  const handleSelectWeekChange = (week: any, fieldName: any) => {
    setValue(fieldName, week?.DAY_CODE);
  };
  const navigate: any = useNavigate();
  const [data, setData] = useState<{ DAY_CODE: number; DAY_DESC: string }>();
  const [visible, setVisible] = useState<boolean>(false);

  const getId: any = localStorage.getItem("Id");
  const dataId = JSON.parse(getId);
  const location = useLocation();
  const [nodes, setNodes] = useState<any | null>([]);
  const [filteredData, setFilteredData] = useState<any | null>(nodes);

  const [visibleEquipmentlist, showEquipmentlist] = useState(false);
  const [selectedKey, setSelectedKey] = useState("");
  const [selectedEquipmentKey, setSelectedEquipmentKey] = useState("");

  const [assetTreeDetails, setAssetTreeDetails] = useState<any | null>([]);
  const [addAssetTypeList, setaddAssetTypeList] = useState<any | null>([]);
  const [issueLength, setIssueLength] = useState<any | null>(0);
  const [loading, setLoading] = useState<any | null>(false);
  const scheduleId_nav = location?.state?.scheduleId
  console.log(scheduleId_nav, "scheduleId_nav")
  const selectedscheduleId =
    location?.state?.selectformscheduleId !== undefined ||
      location?.state?.selectformscheduleId !== null
      ? location?.state?.selectformscheduleId : location?.state?.scheduleId !== undefined ? scheduleId_nav
        : dataId?.SCHEDULE_ID;
  console.log(location?.state?.selectformscheduleId !== undefined ||
    location?.state?.selectformscheduleId !== null
    ? location?.state?.selectformscheduleId : location?.state?.scheduleId !== undefined || location?.state?.scheduleId !== null ? scheduleId_nav
      : dataId?.SCHEDULE_ID, "selectedscheduleId")
  var Mode = location?.state?.Mode ?? "";
  const schIdLid = location?.state?.selectedLocationSchedule ?? {};
  const ASSET_FOLDER_DATA = location?.state?.ASSET_FOLDER_DATA;
  const selectedAssetFormData: any = JSON.parse(
    sessionStorage.getItem("formData") || "{}"
  );


  const {
    getValues,
    setValue,
    register,
    control,
    handleSubmit,
    resetField,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      MODE: search === "?edit=" ? "E" : "A",
      PARA: { para1: `${currentMenu?.FUNCTION_DESC}`, para2: "Added" },

      ASSET_NONASSET: "",
      EQUIPMENT_NAME: selectedEquipmentKey ?? "",
      TYPE: null,
      SCHEDULE_NAME: props?.selectedData
        ? props?.selectedData?.SCHEDULE_NAME
        : search === "?edit="
          ? dataId?.SCHEDULE_NAME
          : "",
      SOFT_SERVICE: "",
      MAKE: props?.selectedData?.MAKE_ID || "",
      MODEL: props?.selectedData?.MODEL_ID || "",
      REQ_ID: "",
      SCHEDULE_ID: props?.selectedData
        ? props?.selectedData?.SCHEDULE_ID
        : search === "?edit="
          ? dataId?.SCHEDULE_ID
          : 0,
      SCHEDULE_INFRA_END_DATE: "",
      // SCHEDULE_DESC:"",
      SEVERITY: "",
      registerName: "",
      // EQUIPMENT: "",
      // EQUIPMENT_TYPE: "",
      DESCRIPTION: props?.selectedData
        ? props?.selectedData?.SCHEDULE_DESC
        : search === "?edit="
          ? dataId?.SCHEDULE_DESC
          : "",
      REQ_DESC: "",
      REPEAT_UNTIL: "",
      SCHEDULE_INFRA_START_DATE: "",
      NOOFOCCURENCE: 0,
      TEAM_LEAD_ID: 2,
      SEVERITY_ID: "",
      WO_TYPE_CODE: "",
      TEAM_ID: "",

      SCHEDULER: {
        SCHEDULE_ID: "0",
        FACILITY_ID: "",
        SCHEDULE_NAME: "",
        ASSET_NONASSET: "A",
        ASSETTYPE_ID: 1,
        FREQUENCY_TYPE: "P",
        PERIOD: "D",
        DAILY_ONCE_EVERY: "O",
        DAILY_ONCE_AT_TIME: "00:00",
        EVERY_DAYS: {},
        DAILY_ONCE_EVERY_DAYS: 0,
        DAILY_EVERY_PERIOD: 0,
        DAILY_EVERY_PERIOD_UOM: "H",
        DAILY_EVERY_STARTAT: "12:00",
        DAILY_EVERY_ENDAT: "12:00",
        WEEKLY_1_WEEKDAY: {},
        WEEKLY_1_EVERY_WEEK: {},
        WEEKLY_1_PREFERED_TIME: "12:00",
        WEEKLY_2_WEEKDAY: "0",
        WEEKLY_2_EVERY_WEEK: "0",
        WEEKLY_2_PREFERED_TIME: "12:00",
        MONTH_OPTION: "",
        MONTHLY_1_MONTHDAY: {},
        MONTHLY_1_MONTH_NUM: {},
        MONTHLY_2_WEEK_NUM: {},
        MONTHLY_2_WEEKDAY: {},
        MONTHLY_2_MONTH_NUM: "0",
        RUN_HOURS: "0",
        ACTIVE: 1,
        RUN_AVG_DAILY: "0",
        RUN_THRESHOLD_MAIN_TRIGGER: "0",
        MONTHLY_2ND_MONTHDAY: "0",
        MONTHLY_2ND_MONTH_NUM: "0",
        MONTHLY_1_PREFERED_TIME: "12:00",
        MONTHLY_2ND_PREFERED_TIME: "12:00",
        MONTHLY_2_WEEK_PREFERED_TIME: "12:00",

        YEARLY_MONTH: {},
        YEARLY_PREFERED_TIME: "12:00",
        SEVERITY: "",
        SCHEDULE_DESC: "",
        SCHEDULE_INFRA_START_DATE: "",
        SCHEDULE_INFRA_TIME: "",
        SCHEDULE_INFRA_DAYS: {},
        IS_ALL_DAY: 0,
        REPEAT_UNTIL: "",
        REPEAT_UNTIL_OCCURENCE: 2,
        REPEAT_END_DATE: "",
        IS_WO_CREATION: "I",
        WO_BEFORE_CREATION_DAYS: {},
        SCHEDULE_TASK_D: [
          {
            TASK_ID: 0,
            TASK_DESC: "",
            TASK_TIME: "00:00",
            TIME_UOM_CODE: 0,
            SKILL_ID: 0,
            ACTIVE: 1,
          },
        ],
        MODE: search === "?edit=" ? "E" : "A",
      },
      mode: "onSubmit",
    },
  });

  const [week, setWeek] = useState<{
    week: { DAY_CODE: number; DAY_DESC: string };
    SCHEDULER_WEEKLY_1_EVERY_WEEK: { MONTHLY_WEEK_NUM: number; VIEW: string };
    SCHEDULER_PERIOD: string;
  }>();
  const [startEndDate, setStartEndDate] = useState<{
    data: { startDate: any; endDate: any };
    SCHEDULER_DAILY_ONCE_EVERY: string;
    SCHEDULER_PERIOD: string;
  }>();

  const [selectedData, setSelectedData] = useState<any | null>([]);

  const SCDAILY_EVERY_STARTAT = watch("SCHEDULER.DAILY_EVERY_STARTAT");

  // useEffect(() => {
  //   if (typeList?.length > 0) {
  //     const typeListData: any = typeList?.find(
  //       (f: any) => f.ASSETTYPE_ID === selectedDetails?.ASSETTYPE_ID
  //     );
  //     if (!typeListData && typeListData !== undefined) {
  //       setValue("EQUIPMENT_TYPE", typeListData);
  //     }
  //   }
  // }, [selectedDetails?.ASSETTYPE_ID, typeList]);




  useEffect(() => {
    (async function () {
      if (watchAll?.TYPE !== null && scheduleId === 0) {
        if (search === "?add=") {
          setValue("SCHEDULER.SCHEDULE_ID", "0");
          setValue("SCHEDULE_ID", 0);
          // setScheduleTaskList([]);
          setOptions({ ...options, tasklistOptions: [] });
          // await getTaskList();
          // getScheduleOption(0);
          setSelectedData(0);
        }
      } else if (search === "?edit=") {
        let pageInfra = localStorage.getItem("schedulePage");
        if (pageInfra === "infraPPM") {
          let assetDetails: any = localStorage.getItem("assetDetails");
          let assetData: any = JSON.parse(assetDetails);

          setValue("EQUIPMENT_NAME", assetDetails?.ASSET_NAME);
          setValue("SEVERITY_ID", assetDetails?.SEVERITY);
          // getAssetDetailsList(assetData?.ASSET_ID);
        } else {
          await getScheduleDetails();
        }
      }

      if (
        Mode === "add" &&
        location.state?.selectformscheduleId !== undefined &&
        location.state?.selectformscheduleId !== null
      ) {

        await getScheduleDetails();
      }
    })();
  }, [
    watchAll?.TYPE,
    watchAll?.SCHEDULE_ID,
    selectedscheduleId,
    location.state,
  ]);
  // const EQUIPMENT_TYPE: any = watch("EQUIPMENT_TYPE");
  // const EQUIPMENT: any = watch("EQUIPMENT");
  const dailyEvery: any = watch("SCHEDULER.EVERY_DAYS");
  const weeklyEvery: any = watch("SCHEDULER.WEEKLY_1_EVERY_WEEK");
  const monthlyEvery: any = watch("SCHEDULER.MONTHLY_1_MONTH_NUM");
  const yearlyEvery: any = watch("SCHEDULER.YEARLY_MONTH");

  const SCHEDULER_DAILY_ONCE_EVERY: any = watch(
    "SCHEDULER.SCHEDULE_INFRA_DAYS"
  );
  useEffect(() => {
    if (search === "?add=") {
      sessionStorage.removeItem("formData");
      dispatch(clearScheduleGroup());
      resetField("EQUIPMENT_NAME");
      setValue("EQUIPMENT_NAME", "");
      // setValue("EQUIPMENT", "");
      // setValue("EQUIPMENT_TYPE", "");
      setSelectedEquipmentKey("");
      setIssueLength(0);
      setDescriptionlength(0);
    }
  }, [search === "?add="]);

  const getScheduleDetails = async (scheduleid?: any) => {
    // debugger;
    try {
      let scheduleData: any = localStorage.getItem("scheduleId");
      let locationData: any =
        location?.state === null
          ? null
          : location?.state?.page === "infraPPM"
            ? location?.state?.page
            : null;
      const payload = {
        // SCHEDULE_ID: props?.selectedData ? props?.selectedData?.SCHEDULE_ID : search === '?edit=' ? dataId?.SCHEDULE_ID : 0,
        SCHEDULE_ID:
          scheduleid !== undefined && scheduleid !== 0 ? scheduleid :
            locationData === "infraPPM"
              ? scheduleData
              : scheduleid !== 0 &&
                scheduleid !== undefined &&
                scheduleid !== null
                ? scheduleid
                : selectedscheduleId ?? dataId?.SCHEDULE_ID,
      };

      const res = await callPostAPI(ENDPOINTS.GET_SCHEDULE_DETAILS, payload);
      if (res && res.FLAG === 1) {

        setSelectedDetails(res?.SCHEDULEDETAILS[0]);
        setMONTHLY_1_MONTH_NUMs(res?.SCHEDULEDETAILS[0]?.MONTHLY_1_MONTH_NUM);

        setData(res?.SCHEDULEDETAILS[0].WEEKLY_1_WEEKDAY);
        setAssetGroupId(res?.SCHEDULEDETAILS[0]?.ASSETGROUP_ID);
        const scheduleInfraStartDate: any = helperNullDate(
          res?.SCHEDULEDETAILS[0]?.SCHEDULE_INFRA_START_DATE
        );
        setValue("SCHEDULE_NAME", res?.SCHEDULEDETAILS[0]?.SCHEDULE_NAME);
        setValue("REQ_DESC", res?.SCHEDULEDETAILS[0]?.REQ_DESC);
        setIssueLength(res?.SCHEDULEDETAILS[0]?.REQ_DESC?.length);
        setValue(
          "NOOFOCCURENCE",
          res?.SCHEDULEDETAILS[0]?.REPEAT_UNTIL_OCCURENCE
        );
        setValue("SCHEDULE_INFRA_START_DATE", scheduleInfraStartDate);
        let letEveryStart: any = convertTime(
          res?.SCHEDULEDETAILS[0]?.SCHEDULE_INFRA_TIME
        );
        // setValue("SCHEDULER.DAILY_EVERY_STARTAT", letEveryStart);
        setValue("DESCRIPTION", res?.SCHEDULEDETAILS[0]?.SCHEDULE_DESC);
        setDescriptionlength(res?.SCHEDULEDETAILS[0]?.SCHEDULE_DESC?.length);

        setBtnValue(
          res?.SCHEDULEDETAILS[0].PERIOD === "W"
            ? "Weekly"
            : res?.SCHEDULEDETAILS[0].PERIOD == "M"
              ? "Monthly"
              : res?.SCHEDULEDETAILS[0].PERIOD == "Y"
                ? "Yearly"
                : "Daily"
        );

        if (
          res?.SCHEDULEDETAILS[0].SCHEDULE_INFRA_DAYS !== undefined &&
          INFRS_EQUIPMENT_OPTIONS.InfraScheduledayNumList?.length > 0
        ) {
          const selectedInfradays: any =
            INFRS_EQUIPMENT_OPTIONS.InfraScheduledayNumList.find(
              (e: any) =>
                e.DAY_NUM === res?.SCHEDULEDETAILS[0].SCHEDULE_INFRA_DAYS
            );
          setValue("SCHEDULER.SCHEDULE_INFRA_DAYS", selectedInfradays);
        }

        if (res?.SCHEDULEDETAILS[0].PERIOD === "M") {
          const list = INFRS_EQUIPMENT_OPTIONS.monthNumList1.filter(
            (e: any) =>
              e.MONTH_NUM === res?.SCHEDULEDETAILS[0].MONTHLY_1_MONTH_NUM
          );
          if (list) {
            let preferedTime: any =
              res?.SCHEDULEDETAILS[0].MONTHLY_1_PREFERED_TIME;

            let convertPrefredTime: any = convertTime(preferedTime);
            console.log(convertPrefredTime, "convertPrefredTime222_M")

            setValue("SCHEDULER.MONTHLY_1_MONTH_NUM", list[0]);
            setValue(
              "SCHEDULER.MONTH_OPTION",
              res?.SCHEDULEDETAILS[0].MONTH_OPTION
            );
            // setValue("SCHEDULER.MONTHLY_1_PREFERED_TIME", convertPrefredTime)
            setValue("SCHEDULER.DAILY_EVERY_STARTAT", convertPrefredTime);


          }

          if (res?.SCHEDULEDETAILS[0].MONTH_OPTION === "1") {
            setMonthlist("O");
            setOptiondisbaledWeek(true);
            setOptiondisbaled(false);
            const DAY_NUM = INFRS_EQUIPMENT_OPTIONS.dayNumList.find(
              (e: any) =>
                e.DAY_NUM === res?.SCHEDULEDETAILS[0].MONTHLY_1_MONTHDAY
            );
            if (DAY_NUM) {
              setValue("SCHEDULER.MONTHLY_1_MONTHDAY", DAY_NUM);
            }
            //  setValue("SCHEDULER.DAILY_EVERY_STARTAT", convertPrefredTime);
            let preferedTime: any =
              res?.SCHEDULEDETAILS[0].MONTHLY_1_PREFERED_TIME;

            let convertPrefredTime: any = convertTime(preferedTime);
            setValue("SCHEDULER.DAILY_EVERY_STARTAT", convertPrefredTime);
          } else {
            setOptiondisbaledWeek(false);
            setOptiondisbaled(true);
            setMonthlist("T");
            let preferedTime: any =
              res?.SCHEDULEDETAILS[0].MONTHLY_1_PREFERED_TIME;
            let convertPrefredTime: any = convertTime(preferedTime);
            setValue("SCHEDULER.DAILY_EVERY_STARTAT", convertPrefredTime);
            const DAY_NUM1 = INFRS_EQUIPMENT_OPTIONS.weekNumList.find(
              (e: any) =>
                e.MONTHLY_WEEK_NUM ===
                res?.SCHEDULEDETAILS[0].MONTHLY_2_WEEK_NUM
            );

            if (DAY_NUM1) {
              let preferedTime: any =
                res?.SCHEDULEDETAILS[0].WEEKLY_1_PREFERED_TIME;
              let convertPrefredTime: any = convertTime(preferedTime);

              setValue("SCHEDULER.DAILY_EVERY_STARTAT", convertPrefredTime);
              setValue("SCHEDULER.MONTHLY_2_WEEK_NUM", DAY_NUM1);
            }
            const DAY_NUM2 = INFRS_EQUIPMENT_OPTIONS.weekDataLabel.find(
              (e: any) =>
                e.DAY_CODE === res?.SCHEDULEDETAILS[0].MONTHLY_2_WEEKDAY
            );

            if (DAY_NUM2) {
              let preferedTime: any =
                res?.SCHEDULEDETAILS[0].WEEKLY_2_PREFERED_TIME;
              let convertPrefredTime: any = convertTime(preferedTime);
              console.log(convertPrefredTime, 'preferedTime_W')

              setValue("SCHEDULER.DAILY_EVERY_STARTAT", convertPrefredTime);
              setValue("SCHEDULER.MONTHLY_2_WEEKDAY", DAY_NUM2);
            }
          }
        } else if (res?.SCHEDULEDETAILS[0].PERIOD === "D") {
          const Dailylist = INFRS_EQUIPMENT_OPTIONS.dayNumList.find(
            (e: any) =>
              e.DAY_NUM === res?.SCHEDULEDETAILS[0].DAILY_ONCE_EVERY_DAYS
          );

          if (Dailylist) {
            setValue("SCHEDULER.EVERY_DAYS", Dailylist);
          }
        } else if (res?.SCHEDULEDETAILS[0].PERIOD === "W") {
          const Dailylist = INFRS_EQUIPMENT_OPTIONS.weekNumList.find(
            (e: any) =>
              e.MONTHLY_WEEK_NUM === res?.SCHEDULEDETAILS[0].WEEKLY_1_EVERY_WEEK
          );

          if (Dailylist) {
            setValue("SCHEDULER.WEEKLY_1_EVERY_WEEK", Dailylist);
            let preferedTime: any =
              res?.SCHEDULEDETAILS[0].WEEKLY_1_PREFERED_TIME;
            let convertPrefredTime: any = convertTime(preferedTime);
            console.log(convertPrefredTime, 'preferedTime_W')

            setValue("SCHEDULER.DAILY_EVERY_STARTAT", convertPrefredTime);
          }
        } else if (res?.SCHEDULEDETAILS[0].PERIOD == "Y") {
          let letEveryStart: any = convertTime(
            res?.SCHEDULEDETAILS[0]?.YEARLY_PREFERED_TIME
          );
          setValue("SCHEDULER.DAILY_EVERY_STARTAT", letEveryStart);
          const list = INFRS_EQUIPMENT_OPTIONS.monthNumList.find(
            (e: any) => e.MONTH_NUM === res?.SCHEDULEDETAILS[0].YEARLY_MONTH
          );

          if (list) {
            setValue("SCHEDULER.YEARLY_MONTH", list);
            setValue(
              "SCHEDULER.MONTH_OPTION",
              res?.SCHEDULEDETAILS[0].MONTH_OPTION
            );
            // setMonthlist(res?.SCHEDULEDETAILS[0].MONTH_OPTION)
          }

          if (res?.SCHEDULEDETAILS[0].MONTH_OPTION == 1) {
            setMonthlist("O");
            const DAY_NUM = INFRS_EQUIPMENT_OPTIONS.dayNumList.find(
              (e: any) =>
                e.DAY_NUM === res?.SCHEDULEDETAILS[0].MONTHLY_1_MONTHDAY
            );
            if (DAY_NUM) {
              setValue("SCHEDULER.MONTHLY_1_MONTHDAY", DAY_NUM);
            }
          } else {
            setMonthlist("T");
            const DAY_NUM1 = INFRS_EQUIPMENT_OPTIONS.weekNumList.find(
              (e: any) =>
                e.MONTHLY_WEEK_NUM ===
                res?.SCHEDULEDETAILS[0].MONTHLY_2_WEEK_NUM
            );
            if (DAY_NUM1) {
              setValue("SCHEDULER.MONTHLY_2_WEEK_NUM", DAY_NUM1);
            }
            const DAY_NUM2 = INFRS_EQUIPMENT_OPTIONS.weekDataLabel.find(
              (e: any) =>
                e.DAY_CODE === res?.SCHEDULEDETAILS[0].MONTHLY_2_WEEKDAY
            );
            if (DAY_NUM2) {
              setValue("SCHEDULER.MONTHLY_2_WEEKDAY", DAY_NUM2);
            }
          }
        }

        setWorkOrder(
          res?.SCHEDULEDETAILS[0].IS_WO_CREATION == "S"
            ? "Schedule"
            : "Immediately"
        );
        if (res?.SCHEDULEDETAILS[0].IS_WO_CREATION == "S") {
          const Dailylist1 = INFRS_EQUIPMENT_OPTIONS.dayNumList.find(
            (e: any) =>
              e.DAY_NUM === res?.SCHEDULEDETAILS[0].WO_BEFORE_CREATION_DAYS
          );

          if (Dailylist1) {
            setValue("SCHEDULER.WO_BEFORE_CREATION_DAYS", Dailylist1);
          }
        }
        if (res?.SCHEDULEDETAILS[0].REPEAT_UNTIL) {
          const repeatUntil = INFRS_EQUIPMENT_OPTIONS.RepeatUntil.find(
            (e: any) => e.REPEAT_ID === res?.SCHEDULEDETAILS[0].REPEAT_UNTIL
          );

          // if (repeatUntil) {
          //   setValue("REPEAT_UNTIL", repeatUntil);
          // }
        }

        setRepeatUntil(`${res?.SCHEDULEDETAILS[0].REPEAT_UNTIL}`);

        if (res?.SCHEDULEDETAILS[0].REPEAT_UNTIL === 2) {
          const scheduleInfraStartDate: any = helperNullDate(
            res?.SCHEDULEDETAILS[0]?.REPEAT_END_DATE
          );

          setValue("SCHEDULE_INFRA_END_DATE", scheduleInfraStartDate);

          // setValue("SCHEDULER.WEEKLY_1_EVERY_WEEK", res?.SCHEDULEDETAILS[0]?.WEEKLY_1_EVERY_WEEK)
          setData(res?.SCHEDULEDETAILS[0].WEEKLY_1_WEEKDAY);

          const Dailylist1 = LABELS.weekDataLabel.find(
            (e: any) => e.DAY_CODE === res?.SCHEDULEDETAILS[0].WEEKLY_1_WEEKDAY
          );

          if (Dailylist1) {
            setValue("SCHEDULER.WEEKLY_1_WEEKDAY", Dailylist1);
          }
        }

        if (pathname === "/assettaskschedulelist" && facility_type === "I") {
          const typeofWork = options?.WOTYPELIST?.find(
            (e: any) => e.WO_TYPE_CODE === res?.SCHEDULEDETAILS[0]?.WO_TYPE_CODE
          );
          setValue("WO_TYPE_CODE", typeofWork);

          const Department = options?.TEAMLIST?.find(
            (e: any) => e.TEAM_ID === res?.SCHEDULEDETAILS[0]?.TEAM_ID
          );
          setValue("TEAM_ID", Department);
          const priority = options?.PRIORITYLIST?.find(
            (e: any) => e.SEVERITY_ID === res?.SCHEDULEDETAILS[0]?.SEVERITY_ID
          );
          setValue("SEVERITY_ID", priority);
          // const equipmnetgroup = options?.ASSETGROUPLIST?.find(
          //   (e: any) =>
          //     e.ASSETGROUP_ID === res?.SCHEDULEDETAILS[0]?.ASSETGROUP_ID
          // );
          // setValue("EQUIPMENT", equipmnetgroup);
          // const equipmentType = options?.ASSETTYPELIST?.find(
          //   (e: any) => e.ASSETTYPE_ID === res?.SCHEDULEDETAILS[0]?.ASSETTYPE_ID
          // );


          // setValue("EQUIPMENT_TYPE", equipmentType);

        }

        if (res?.SCHEDULEDETAILS[0].PERIOD === "M") {
          let preferedTime: any =
            res?.SCHEDULEDETAILS[0].MONTHLY_1_PREFERED_TIME
          let convertPrefredTime: any = convertTime(preferedTime);
          setValue("SCHEDULER.DAILY_EVERY_STARTAT", convertPrefredTime);

        }
      }
    } catch (error) { }
  };

  useEffect(() => {
    if (search !== "?add=" && selectedAssetFormData) {
      let pageInfra = localStorage.getItem("schedulePage");
      if (pageInfra !== "infraPPM") {
        setValue("EQUIPMENT_NAME", selectedAssetFormData?.ASSET_NAME);
      } else {
        let assetDetails: any = localStorage.getItem("assetDetails");
        let assetData: any = JSON.parse(assetDetails);

        setValue("EQUIPMENT_NAME", assetData?.ASSET_NAME);
        setValue("SEVERITY_ID", assetData?.SEVERITY);
      }
    }
  }, []);

  useEffect(() => {
    if (LABELS.weekDataLabel) {
      const selectedDay = LABELS.weekDataLabel.find(
        (week: any) => week.DAY_CODE === data
      );

      if (selectedDay) {
        setData(selectedDay);
      }
    }
  }, [LABELS.weekDataLabel, data]);

  const startdate: any = watch("SCHEDULE_INFRA_START_DATE");
  const [isValueCheck, setisValueCheck] = useState<boolean>(false);
  const User_Name = decryptData(localStorage.getItem("USER_NAME"));

  useEffect(() => {
    (async function () {
      await saveTracker(currentMenu);
      ////  await getEquimentHierarchy()
      await getOptions();

      setOptiondisbaledWeek(true);
    })();
  }, [selected, scheduleGroup, scheduleLocation, assetGroupId]);

  // useEffect(() => {
  //   const fetchScheduleDetails = async () => {
  //     if (scheduleId_nav !== null && scheduleId_nav !== undefined && scheduleId_nav !== 0) {
  //       await getScheduleDetails(scheduleId_nav);
  //     }
  //   };
  //   fetchScheduleDetails();
  // }, [scheduleId_nav]);
  const getOptions = async () => {
    setMonthlist("O");
    const payload = {
      ASSETTYPE: "P",
    };
    try {
      const res1 = await callPostAPI(
        ENDPOINTS.GET_SCHEDULE_MASTERLIST,
        payload,
        currentMenu?.FUNCTION_CODE
      );

      setOptions({
        WOTYPELIST: res1?.WOTYPELIST,
        ASSETGROUPLIST: res1?.ASSETGROUPLIST,
        PRIORITYLIST: res1?.PRIORITYLIST,
        ASSETTYPELIST: res1?.ASSETTYPELIST,
        TEAMLIST: res1?.TEAMLIST,
      });
      if (search !== "?add=") {
        // selectedDetails.ASSETGROUP_ID = scheduleGroup[0]?.ASSETGROUP_ID;

        // if (
        //   (scheduleGroup[0]?.ASSETGROUP_ID !== undefined &&
        //     scheduleGroup[0]?.ASSETGROUP_ID !== null) ||
        //   (assetGroupId !== undefined && assetGroupId !== null)
        // ) {
        //   const assetTypeList: any = res1?.ASSETTYPELIST?.filter(
        //     (f: any) =>
        //       f.ASSETGROUP_ID ===
        //       (scheduleGroup[0]?.ASSETGROUP_ID ?? assetGroupId)
        //   );
        //   if (assetTypeList?.length > 0) {

        //     setTypeList(assetTypeList);
        //   }
        // }

        // selectedDetails.ASSETTYPE_ID = scheduleGroup[0]?.ASSETTYPE_ID;
        // const ASSETGROUP_TYPE_LIST: any = res1?.ASSETGROUPLIST?.filter(
        //   (f: any) => f.ASSETGROUP_ID === scheduleGroup[0]?.ASSETGROUP_ID
        // );
        getScheduleDetails(scheduleId_nav);
      } else if (
        pathname === "/assettaskschedulelist" &&
        facility_type === "I"
      ) {
        const ASSETGROUP_TYPE_LIST: any = res1?.ASSETTYPELIST?.filter(
          (f: any) => f.ASSETGROUP_ID === assetGroupId
        );
        // if (ASSETGROUP_TYPE_LIST?.length > 0) {
        //   setTypeList(ASSETGROUP_TYPE_LIST);
        // }
        // debugger
        // getScheduleDetails()
      }
    } catch (error) { }
  };

  const handleOnGroupChange = (assetgroupid: any) => {
    if (pathname === "/assettaskschedulelist" && facility_type === "I") {
      const filteredAssetTypeList: any = options?.ASSETTYPELIST?.filter(
        (f: any) => f.ASSETGROUP_ID === assetgroupid
      );
      setaddAssetTypeList(filteredAssetTypeList);
    }
  };
  const onError: SubmitErrorHandler<any> = (errors, _) => {
    toast.error("Please select Required fields");
  };

  // const getAssetDetailsList = async (assetid: any) => {
  //   try {
  //     const payload = {
  //       ASSET_ID: assetid ?? 0,
  //     };

  //     const res = await callPostAPI(ENDPOINTS.GET_INFRA_ASSET_DETAILS, payload);

  //     if (res?.FLAG === 1) {
  //       setAssetTreeDetails(res?.ASSETDETAILSLIST);

  //       const payload1: any = {
  //         ASSET_NONASSET: "A",
  //         ASSET_ID: assetid ?? 0,
  //       };

  //       const res1 = await callPostAPI(
  //         ENDPOINTS.ASSETMASTER_DETAILS,
  //         payload1,
  //         "AS067"
  //       );
  //       if (res1?.FLAG === 1) {
  //         if (
  //           res1?.ASSETDETAILSLIST[0]?.SCHEDULE_ID !== undefined &&
  //           res1?.ASSETDETAILSLIST[0]?.SCHEDULE_ID !== null &&
  //           res1?.ASSETDETAILSLIST[0]?.SCHEDULE_ID !== 0
  //         ) {
  //           // getScheduleDetails(res1?.ASSETDETAILSLIST[0]?.SCHEDULE_ID ?? 0);
  //         } else {
  //           // reset();

  //           setValue(
  //             "EQUIPMENT_NAME",
  //             res1?.ASSETDETAILSLIST[0]?.ASSET_NAME ?? ""
  //           );
  //         }
  //       }
  //     } else {
  //       toast?.error(res?.MSG);
  //     }
  //   } catch (error: any) {
  //     toast?.error(error.message);
  //   }
  // };

  useEffect(() => {
    const selectedSeverity =
      options?.PRIORITYLIST?.length >= 1
        ? options?.PRIORITYLIST?.find((option: any) => option.SEVERITY === "Medium")
        : null;

    setValue("SEVERITY_ID", selectedSeverity);
  }, [options?.PRIORITYLIST]);
  const onSubmit = async (payload: any, e: any) => {
    if (week?.week === undefined && week?.SCHEDULER_PERIOD === "W") {
      toast.error("Please select the week");
      setIsSubmit(false);
      return;
    }
    if (
      week?.SCHEDULER_WEEKLY_1_EVERY_WEEK.MONTHLY_WEEK_NUM === 0 &&
      week?.SCHEDULER_PERIOD === "W"
    ) {
      setisValueCheck(true);
      toast.error(" Please add number of weeks required");
      setIsSubmit(false);
      return;
    }
    if (week?.SCHEDULER_PERIOD === "O") {
      setisValueCheck(true);
      toast.error(" Please add number of weeks required");
      setIsSubmit(false);
      return;
    }
    const facilityData = JSON.parse(
      localStorage.getItem(LOCALSTORAGE.FACILITY)!
    );
    let pageInfra = localStorage.getItem("schedulePage");
    let scheduleData: any = localStorage.getItem("scheduleId");
    console.log(scheduleData, pageInfra, 'scheduleData')
    const schedulerPayload1 = {
      MODE: search === "?edit=" ? "E" : "A",
      SCHEDULE_DETAILS: {
        SCHEDULE_ID:
          pageInfra === "infraPPM"
            ? scheduleData
            : selectedscheduleId !== undefined ? selectedscheduleId
              : (scheduleId_nav ? scheduleId_nav : "0")
        ,
        FACILITY_ID:
          facilityData?.length > 0
            ? JSON.parse(localStorage.getItem(`${LOCALSTORAGE?.FACILITYID}`)!)
              ?.FACILITY_ID
            : "",
        SCHEDULE_NAME: payload?.SCHEDULE_NAME,
        ASSET_NONASSET: "A",
        // ASSETTYPE_ID: payload?.EQUIPMENT_TYPE?.ASSETTYPE_ID,
        // ASSETGROUP_ID: payload?.EQUIPMENT?.ASSETGROUP_ID,
        FREQUENCY_TYPE: "P",
        PERIOD:
          Btnvalue == "Daily"
            ? "D"
            : Btnvalue == "Weekly"
              ? "W"
              : Btnvalue == "Monthly"
                ? "M"
                : Btnvalue == "Yearly"
                  ? "Y"
                  : "D",
        DAILY_ONCE_EVERY: "O",
        DAILY_ONCE_AT_TIME:
          Btnvalue == "Daily"
            ? moment(payload?.SCHEDULER.DAILY_EVERY_STARTAT).format("HH:mm")
            : "12:00",
        DAILY_ONCE_EVERY_DAYS:
          Btnvalue == "Daily" ? payload?.SCHEDULER.EVERY_DAYS.DAY_NUM : "0",
        DAILY_EVERY_PERIOD: 0,
        DAILY_EVERY_PERIOD_UOM: "",
        DAILY_EVERY_STARTAT: "00:00",
        DAILY_EVERY_ENDAT: payload?.SCHEDULER?.DAILY_EVERY_ENDAT,
        WEEKLY_1_WEEKDAY:
          Btnvalue == "Weekly"
            ? typeof payload?.SCHEDULER?.WEEKLY_1_WEEKDAY !== "object"
              ? payload?.SCHEDULER?.WEEKLY_1_WEEKDAY
              : data?.DAY_CODE
            : 0,
        WEEKLY_1_EVERY_WEEK:
          Btnvalue == "Weekly"
            ? payload?.SCHEDULER?.WEEKLY_1_EVERY_WEEK.MONTHLY_WEEK_NUM
            : "0",
        WEEKLY_1_PREFERED_TIME:
          Btnvalue == "Weekly"
            ? moment(payload?.SCHEDULER?.DAILY_EVERY_STARTAT).format("HH:mm")
            : "00:00",
        WEEKLY_2_WEEKDAY: "0",
        WEEKLY_2_EVERY_WEEK: "0",
        WEEKLY_2_PREFERED_TIME: payload?.SCHEDULER.WEEKLY_2_PREFERED_TIME,
        MONTH_OPTION: monthSelect === "O" ? 1 : 2,
        MONTHLY_1_MONTHDAY:
          (Btnvalue == "Monthly" && monthSelect === "O") ||
            (Btnvalue == "Yearly" && monthSelect === "O")
            ? payload?.SCHEDULER?.MONTHLY_1_MONTHDAY?.DAY_NUM
            : 0,
        MONTHLY_1_MONTH_NUM:
          (Btnvalue == "Monthly" &&
            (monthSelect === "T" || monthSelect === "O")) ||
            (Btnvalue == "Yearly" && monthSelect === "O")
            ? payload?.SCHEDULER?.MONTHLY_1_MONTH_NUM?.MONTH_NUM
            : 0,
        MONTHLY_2_WEEK_NUM:
          (Btnvalue == "Monthly" && monthSelect === "T") ||
            (Btnvalue == "Yearly" && monthSelect === "T")
            ? payload?.SCHEDULER?.MONTHLY_2_WEEK_NUM?.MONTHLY_WEEK_NUM
            : 0,
        MONTHLY_2_WEEKDAY:
          (Btnvalue == "Monthly" && monthSelect === "T") ||
            (Btnvalue == "Yearly" && monthSelect === "T")
            ? payload?.SCHEDULER?.MONTHLY_2_WEEKDAY?.DAY_CODE
            : 0,
        MONTHLY_2_MONTH_NUM:
          (Btnvalue == "Monthly" && monthSelect === "T") ||
            (Btnvalue == "Yearly" && monthSelect === "T")
            ? payload?.SCHEDULER?.MONTHLY_1_MONTH_NUM?.MONTH_NUM
            : 0,
        YEARLY_MONTH:
          Btnvalue == "Yearly"
            ? payload?.SCHEDULER?.YEARLY_MONTH?.MONTH_NUM
            : "",
        YEARLY_PREFERED_TIME:
          Btnvalue == "Yearly"
            ? moment(payload?.SCHEDULER?.DAILY_EVERY_STARTAT).format("HH:mm")
            : "00:00",
        RUN_HOURS: "0",
        ACTIVE: 1,
        RUN_AVG_DAILY: "0",
        RUN_THRESHOLD_MAIN_TRIGGER: "0",
        MONTHLY_2ND_MONTHDAY: 0,
        MONTHLY_2ND_MONTH_NUM: 0,
        MONTHLY_1_PREFERED_TIME:
          Btnvalue == "Monthly"
            ? moment(payload?.SCHEDULER?.DAILY_EVERY_STARTAT).format("HH:mm")
            : "00:00",
        MONTHLY_2ND_PREFERED_TIME:
          Btnvalue == "Monthly"
            ? moment(payload?.SCHEDULER?.DAILY_EVERY_STARTAT).format("HH:mm")
            : "00:00",
        MONTHLY_2_WEEK_PREFERED_TIME:
          payload?.SCHEDULER?.MONTHLY_2ND_PREFERED_TIME,
        WO_TYPE_CODE: payload?.WO_TYPE_CODE?.WO_TYPE_CODE,
        TEAM_ID: payload?.TEAM_ID?.TEAM_ID,
        SEVERITY_ID: payload?.SEVERITY_ID?.SEVERITY_ID,
        SCHEDULE_DESC: payload?.DESCRIPTION,
        SCHEDULE_INFRA_START_DATE:
          payload?.SCHEDULE_INFRA_START_DATE == ""
            ? ""
            : moment(payload?.SCHEDULE_INFRA_START_DATE).format("YYYY-MM-DD"),
        SCHEDULE_INFRA_TIME: payload?.SCHEDULER?.SCHEDULE_INFRA_TIME,
        SCHEDULE_INFRA_DAYS: payload?.SCHEDULER?.SCHEDULE_INFRA_DAYS?.DAY_NUM,
        IS_ALL_DAY: 0,
        REPEAT_UNTIL: payload?.REPEAT_UNTIL?.REPEAT_ID,
        REPEAT_UNTIL_OCCURENCE: payload?.NOOFOCCURENCE,
        REPEAT_END_DATE:
          payload?.SCHEDULE_INFRA_END_DATE == ""
            ? ""
            : moment(payload?.SCHEDULE_INFRA_END_DATE).format("YYYY-MM-DD"),
        IS_WO_CREATION: createWO == "Schedule" ? "S" : "I",
        WO_BEFORE_CREATION_DAYS:
          createWO == "Schedule"
            ? payload?.SCHEDULER?.WO_BEFORE_CREATION_DAYS?.DAY_NUM
            : 0,
        REQ_DESC: payload?.REQ_DESC,
        FREQUENCY_DESC: "P",
        OCCURS: Btnvalue,
        MODE: search === "?edit=" ? "E" : "A",
      },
    };

    delete payload?.MAKE;
    delete payload?.MODEL;
    delete payload?.SOFT_SERVICE;
    delete payload?.ASSETTYPE;
    delete payload?.TYPE;
    delete payload?.SCHEDULE_NAME;
    delete payload?.ASSET_NONASSET;
    delete payload?.REQ_ID;

    if (pathname === "/assettaskschedulelist" && facility_type === "I") {
      console.log(schedulerPayload1?.SCHEDULE_DETAILS?.SCHEDULE_ID, "schedulerPayload1?.SCHEDULE_DETAILS?.SCHEDULE_ID")
      const payload1 = {
        ...schedulerPayload1?.SCHEDULE_DETAILS,
        MODE: schedulerPayload1?.MODE,
        SCHEDULE_ID: selectedscheduleId ?? schedulerPayload1?.SCHEDULE_DETAILS?.SCHEDULE_ID,
        // ASSET_ID: (assetTreeDetails && assetTreeDetails[0]?.ASSET_ID) || 0,
        FUNCTION_CODE: currentMenu[0]?.FUNCTION_CODE,
        PARA:
          (search === "?edit=")
            ? { para1: `Schedule has been `, para2: ("updated") }
            : { para1: `Schedule has been `, para2: ("added") },
      };
      console.log(payload1, "payload1")
      // return
      const res1 = await callPostAPI(ENDPOINTS.SCHEDULE_SAVE, {
        ...payload1
      });
      payload.SCHEDULE_ID = res1?.SCHEDULE_ID;
      if (res1.FLAG === true) {
        toast?.success(res1?.MSG);
        // return
        const notifcation: any = {
          FUNCTION_CODE: currentMenu?.FUNCTION_CODE,
          EVENT_TYPE: "S",
          STATUS_CODE: search === "?edit=" ? 2 : 1,
          PARA1: search === "?edit=" ? User_Name : User_Name,
          PARA2: "schedulerPayload?.SCHEDULE_NAME",
        };
        const eventPayload = { ...eventNotification, ...notifcation };
        await helperEventNotification(eventPayload);
        props?.getAPI();
        if (pageInfra === "infraPPM") {
          navigate("/ppmSchedule");
        } else {
          navigate("/assettaskschedulelist");
        }
      } else {
        toast?.error(res1?.MSG);
      }
    } else {
      let pageInfra = localStorage.getItem("schedulePage");
      if (pageInfra === "infraPPM") {
        navigate("/ppmSchedule");
      } else {
        navigate(`${appName}/assetmasterlist?${Mode}=`, {
          state: schedulerPayload1,
        });
      }
    }
  };

  useEffect(() => {
    if (assetTreeDetails && assetTreeDetails?.length > 0) {
      if (assetTreeDetails[0]?.SCHEDULE_ID !== undefined &&
        assetTreeDetails[0]?.SCHEDULE_ID !== null && search === "?add=" && assetTreeDetails[0]?.SCHEDULE_ID !== 0) {

        getScheduleDetails(assetTreeDetails[0]?.SCHEDULE_ID);
      } else {
        reset();
        setValue("EQUIPMENT_NAME", assetTreeDetails[0]?.ASSET_NAME);
        const valveCode = assetTreeDetails[0]?.ASSET_NAME.split('>').pop();
        setValue("EQUIPMENT_NAME", valveCode?.trim());

        setDescriptionlength(0);
        setIssueLength(0);
      }
    }

  }, [assetTreeDetails]);

  useEffect(() => {
    if (pathname === "/assettaskschedulelist") {
      if (assetTreeDetails && assetTreeDetails?.length > 0) {
        if (options?.ASSETGROUPLIST) {
          // const selectedEqgroup = options?.ASSETGROUPLIST?.filter(
          //   (item: any) =>
          //     item?.ASSETGROUP_ID === assetTreeDetails[0]?.ASSETGROUP_ID
          // );

          // setValue("EQUIPMENT", selectedEqgroup[0]);

          // if (selectedEqgroup) {
          //   const selectEqtypeoption = options?.ASSETTYPELIST?.filter(
          //     (item: any) =>
          //       item?.ASSETGROUP_ID === assetTreeDetails[0]?.ASSETGROUP_ID
          //   );

          //   setaddAssetTypeList(selectEqtypeoption);
          //   const selectEqtype = options?.ASSETTYPELIST?.filter(
          //     (item: any) =>
          //       item?.ASSETTYPE_ID === assetTreeDetails[0]?.ASSETTYPE_ID
          //   );
          //   setValue("EQUIPMENT_TYPE", selectEqtype[0]);
          // }
        }
      }
    }
  }, [assetTreeDetails]);
  const inputElement = (
    labelName: any,
    registerName: any,
    lastLabel: any = null,
    validationType: any,
    optionlist: any = [],
    key: any,
    disabled: boolean
  ) => {
    const selectedStr = registerName.split(".")[1];

    return (
      <div className=" mb-2">
        <div className="flex gap-2">
          <div className="">
            <Field
              controller={{
                name: registerName,
                control: control,
                render: ({ field }: any) => {
                  return (
                    <Select
                      disabled={disabled}
                      options={optionlist}
                      {...register(registerName, {
                        required: "Please fill the required fields",
                      })}
                      label={labelName}
                      optionLabel={"VIEW"}
                      findKey={key}
                      selectedData={selectedDetails[selectedStr]}
                      setValue={setValue}
                      {...field}
                    />
                  );
                },
              }}
            />
          </div>
          {lastLabel && (
            <div className="flex items-end pb-2">
              <label className="Text_Secondary Input_Label">{lastLabel}</label>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <section className="w-full">
        <form onSubmit={handleSubmit(onSubmit, onError)}>
          <Card className="fixedContainer">
            <div className="flex justify-between">
              <div>
                {(search === "?edit=" || location?.state?.Mode === "edit") && (
                  <h6 className=" Text_Primary Main_Main_Header_Text mb-1">
                    Edit Scheduled Maintenance
                  </h6>
                )}
                {(search === "?add=" || location?.state?.Mode === "add") && (
                  <h6 className=" Text_Primary Main_Main_Header_Text mb-1">
                    Add Scheduled Maintenance
                  </h6>
                )}
                <p className="Helper_Text Menu_Active flex mb-1">
                  {/* {search === "?edit=" && ( */}
                  <p className="Helper_Text Menu_Active ">
                    {/* Pneumatic Actuated Diaphragm Valve HCL Diluting Tank to HCL
                    Dosing Pump 2 - DN15 */}
                    {assetTreeDetails?.length > 0
                      ? `${ASSET_FOLDER_DATA?.ASSET_FOLDER_DESCRIPTION ?? ""} ${assetTreeDetails[0]?.ASSET_NAME
                      }`
                      : location?.state !== null &&
                        location?.state?.ASSET_FOLDER_DATA
                          ?.ASSET_FOLDER_DESCRIPTION !== undefined
                        ? `${location?.state?.ASSET_FOLDER_DATA?.ASSET_FOLDER_DESCRIPTION} > ${selectedAssetFormData?.ASSET_NAME}`
                        : ""}
                  </p>
                  {/* )} */}
                </p>
              </div>
              <div className="h-10 flex items-center">
                {pageInfra === "assetSchedule" || pageInfra === "infraPPM" || pathname === "/assettaskschedulelist" ? (
                  <Buttons
                    className="Secondary_Button w-20 me-2"
                    label={
                      pathname === "/assettaskschedulelist" ? "List" : "Cancel"
                    }
                    onClick={() => {
                      let pageInfra = localStorage.getItem("schedulePage");
                      if (pageInfra === "infraPPM") {
                        navigate(`${appName}/ppmSchedule?`);
                      } else if (Mode !== "") {
                        navigate(`${appName}/assetmasterlist?${Mode}=`, {
                          state: { groupStatus: true },
                        });
                      } else {
                        navigate(`${appName}/assettaskschedulelist`);
                      }
                    }}
                  />
                ) : (
                  <></>
                )}

                {/* <Buttons className="Primary_Button w-20" label={"Schedule1"} onClick={routes} /> */}

                {pathname === "/assettaskschedulelist" &&
                  facility_type === "I" ? (
                  <Buttons
                    type="submit"
                    className="Primary_Button w-20"
                    label={"Save"}
                  />
                ) : (
                  <Buttons
                    type="submit"
                    className="Primary_Button w-20"
                    label={"Submit"}
                  />
                )}
                {/* <Buttons type="submit" className="Primary_Button w-20" label={"Schedule"} /> */}
              </div>
            </div>
          </Card>
          <div className="h-[7.5rem]"></div>
          <div className="grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-3 lg:grid-cols-3">
            <div className="col-span-2">
              <Card className="mt-3">
                <div className="flex flex-wrap justify-between mb-3">
                  <h6 className="Main_Header_Text">Maintenance Details</h6>
                </div>

                <div className="grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-2 lg:grid-cols-2">
                  <div className="col-span-2">
                    {/* <Field
                      controller={{
                        name: "EQUIPMENT_NAME",
                        control: control,
                        render: ({ field }: any) => {
                          return (
                            <InputField
                              {...register("EQUIPMENT_NAME", {
                                required: "Please fill the required fields.",
                                validate: (value) =>
                                  value.trim() !== "" ||
                                  t("Please fill the required fields."),
                              })}
                              require={true}
                              label="Equipment"
                              invalid={errors.EQUIPMENT_NAME}
                              readOnly={true}
                              placeholder={true}
                              disabled={
                                selectedAssetFormData?.ASSET_NAME ? true : false
                              }
                              setValue={setValue}
                              //
                              {...field}
                              onClick={(e: any) => {
                                showEquipmentlist(true);
                              }}
                            />
                          );
                        },
                      }}
                    /> */}
                  </div>

                  <Field
                    controller={{
                      name: "SCHEDULE_NAME",
                      control: control,
                      render: ({ field }: any) => {
                        return (
                          <InputField
                            {...register("SCHEDULE_NAME", {
                              required: "Please fill the required fields.",
                            })}
                            selectedData={selectedDetails?.SCHEDULE_NAME}
                            label="Schedule Name"
                            invalid={errors?.SCHEDULE_NAME}
                            setValue={setValue}
                            require={true}
                            {...field}
                          />
                        );
                      },
                    }}
                  />

                  <Field
                    controller={{
                      name: "WO_TYPE_CODE",
                      control: control,
                      render: ({ field }: any) => {
                        return (
                          <Select
                            options={options?.WOTYPELIST}
                            {...register("WO_TYPE_CODE", {
                              required: "Please fill the required fields",
                            })}
                            label="Type Of Work"
                            require={true}
                            optionLabel="WO_TYPE_NAME"
                            findKey={"WO_TYPE_CODE"}
                            selectedData={selectedDetails?.WO_TYPE_CODE}
                            setValue={setValue}
                            invalid={errors.WO_TYPE_CODE}
                            {...field}
                          />
                        );
                      },
                    }}
                  />

                  <Field
                    controller={{
                      name: "TEAM_ID",
                      control: control,
                      render: ({ field }: any) => {
                        return (
                          <Select
                            options={options?.TEAMLIST}
                            {...register("TEAM_ID", {
                              required: "Please fill the required fields",
                            })}
                            label="Team"
                            require={true}
                            optionLabel="TEAM_NAME"
                            findKey={"TEAM_ID"}
                            selectedData={selectedDetails?.TEAM_ID}
                            setValue={setValue}
                            invalid={errors.TEAM_ID}
                            {...field}
                          />
                        );
                      },
                    }}
                  />
                  <Field
                    controller={{
                      name: "SEVERITY_ID",
                      control: control,
                      render: ({ field }: any) => {
                        return (
                          <Select
                            options={options?.PRIORITYLIST}
                            {...register("SEVERITY_ID", {
                              required: "Please fill the required fields",
                            })}
                            label="Priority"
                            require={true}
                            optionLabel="SEVERITY"
                            findKey={"SEVERITY_ID"}
                            selectedData={selectedDetails?.SEVERITY_ID}
                            setValue={setValue}
                            invalid={errors.SEVERITY_ID}
                            {...field}
                          />
                        );
                      },
                    }}
                  />

                  {/* <Field
                    controller={{
                      name: "EQUIPMENT",
                      control: control,
                      render: ({ field }: any) => {
                        return (
                          <Select
                            options={options?.ASSETGROUPLIST}
                            {...register("EQUIPMENT", {
                              required: "Please fill the required fields",
                              onChange: async (e: any) => {
                                handleOnGroupChange(
                                  e?.target?.value?.ASSETGROUP_ID
                                );
                              },
                            })}
                            label="Equipment Group"
                            require={true}
                            optionLabel="ASSETGROUP_NAME"
                            findKey={"ASSETGROUP_ID"}
                            selectedData={selectedDetails?.ASSETGROUP_ID}
                            setValue={setValue}
                            // disabled={selectedAssetFormData?.GROUP?.ASSETGROUP_ID || search === "?edit=" ? true: assetTreeDetails?.lenght>0? true: false}
                            disabled={
                              selectedAssetFormData?.GROUP?.ASSETGROUP_ID ||
                                search === "?edit="
                                ? true
                                : assetTreeDetails?.length > 0
                                  ? true
                                  : false
                            }
                            invalid={errors.EQUIPMENT}
                            {...field}
                          />
                        );
                      },
                    }}
                  /> */}

                  {/* <Field
                    controller={{
                      name: "EQUIPMENT_TYPE",
                      control: control,
                      render: ({ field }: any) => {
                        return (
                          <Select
                            options={
                              search === "?add=" ? addAssetTypeList : typeList
                            }
                            {...register("EQUIPMENT_TYPE", {
                              required: "Please fill the required fields",
                            })}
                            label="Equipment Type"
                            require={true}
                            optionLabel="ASSETTYPE_NAME"
                            findKey={"ASSETTYPE_ID"}
                            selectedData={pathname !== "/assettaskschedulelist" ? selectedDetails?.ASSETTYPE_ID : undefined}
                            setValue={setValue}
                            // disabled={selectedAssetFormData?.TYPE?.ASSETTYPE_ID || search === "?edit=" ?true? assetTreeDetails?.lenght>0? true: false}
                            disabled={
                              selectedAssetFormData?.TYPE?.ASSETTYPE_ID ||
                                search === "?edit="
                                ? true
                                : assetTreeDetails?.length > 0
                                  ? true
                                  : false
                            }
                            invalid={errors.EQUIPMENT_TYPE}
                            {...field}
                          />
                        );
                      },
                    }}
                  /> */}
                  <div className="col-span-2">
                    <Field
                      controller={{
                        name: "REQ_DESC",
                        control: control,
                        render: ({ field }: any) => {
                          return (
                            <InputField
                              {...register("REQ_DESC", {
                                required: ("Please fill the required fields."),
                                onChange: (e: any) => {
                                  setIssueLength(e?.target?.value?.length);
                                },
                                validate: (value) =>
                                  value.trim() !== "" ||
                                  ("Please fill the required fields."),
                              })}
                              require={true}
                              label="Issue (Max 100 characters)"
                              maxLength={100}
                              invalid={errors.REQ_DESC}
                              // setValue={issueDescription}
                              setValue={setValue}
                              {...field}
                            // value={issueDescription}
                            />
                          );
                        },
                      }}
                    />
                    <label
                      className={` ${issueLength === 100 ? "text-red-600" : "Text_Secondary"
                        } Helper_Text`}
                    >
                      {(`${issueLength}/100 characters`)}
                    </label>
                  </div>
                  {/* new code close */}
                  <div className="col-span-2">
                    <label className="Text_Secondary Input_Label">
                      {("Description (Max 400 characters)")}
                    </label>

                    <Field
                      controller={{
                        name: "DESCRIPTION",
                        control: control,
                        render: ({ field }: any) => {
                          return (
                            <InputTextarea
                              {...register("DESCRIPTION", {
                                onChange: (e: any) => {
                                  setDescriptionlength(
                                    e?.target?.value?.length
                                  );
                                },
                              })}
                              rows={5}
                              maxLength={400}
                              selectedData={selectedDetails?.SCHEDULE_DESC}
                              // invalid={errors.DESCRIPTION}
                              setValue={setValue}
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
                      {(`Up to ${Descriptionlength}/400 characters.`)}
                    </label>
                  </div>
                </div>
              </Card>
              <div className="mt-2">
                <Card>
                  <div className="flex flex-wrap justify-between mb-3">
                    <h6 className="Main_Header_Text">Schedule Details</h6>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="">
                      <div className="flex flex-wrap justify-between mb-2">
                        <p className="Header_Text">Scheduled Date</p>
                      </div>
                      <div className="grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-4 lg:grid-cols-4">
                        <Field
                          controller={{
                            name: "SCHEDULE_INFRA_START_DATE",
                            control: control,
                            render: ({ field }: any) => {
                              return (
                                <DateCalendar
                                  {...register("SCHEDULE_INFRA_START_DATE", {
                                    required:
                                      "Please fill the required fields.",
                                  })}
                                  label="Start Date"
                                  showIcon
                                  require={true}
                                  setValue={setValue}
                                  invalid={errors?.SCHEDULE_INFRA_START_DATE}
                                  //   selectedData={selectedDetails?.SCHEDULE_INFRA_START_DATE}
                                  {...field}
                                />
                              );
                            },
                          }}
                        />

                        <Field
                          controller={{
                            name: "SCHEDULER.DAILY_EVERY_STARTAT",
                            control: control,
                            render: ({ field }: any) => {
                              return (
                                <TimeCalendar
                                  {...register(
                                    "SCHEDULER.DAILY_EVERY_STARTAT",
                                    {
                                      required:
                                        "Please fill the required fields.",
                                    }
                                  )}
                                  require={true}
                                  label={("Preferred Time")}
                                  setValue={setValue}
                                  {...field}
                                />
                              );
                            },
                          }}
                        />
                      </div>
                      <div className="grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-3 lg:grid-cols-3">
                        <div>
                          <p className="Header_Text mt-2">Duration</p>
                          {inputElement(
                            "How many days the maintenance will last?",
                            "SCHEDULER.SCHEDULE_INFRA_DAYS",
                            "Day(s)",
                            "onlyDay",
                            INFRS_EQUIPMENT_OPTIONS?.InfraScheduledayNumList,
                            "DAY_NUM",
                            false
                          )}
                        </div>
                      </div>

                      {/* <div className="mt-3 inputSwitch flex gap-2">
                        <InputSwitch
                          checked={checked}
                          onChange={(e: InputSwitchChangeEvent) =>
                            setChecked(e.value)
                          }
                        />
                        <div className="">
                          <label className="Text_Secondary Input_Label">
                            All Day
                          </label>
                        </div>
                      </div> */}
                    </div>

                    <div>
                      <div className="flex flex-wrap justify-between mb-2">
                        <p className="Header_Text">Recurrence</p>
                      </div>

                      <div className="RecurrenceBtn">
                        <SelectButton
                          value={Btnvalue}
                          onChange={(e: SelectButtonChangeEvent) => {
                            setBtnValue(e.value);
                            setValue("SCHEDULER.WEEKLY_1_WEEKDAY", {});
                            setData({ DAY_CODE: 0, DAY_DESC: "" });
                          }}
                          options={options1}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex flex-wrap justify-between mb-2">
                        <p className="Header_Text">Frequency</p>
                      </div>

                      {Btnvalue === "Daily" ? (
                        <>
                          <div className="grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-3 lg:grid-cols-3">
                            <div>
                              {/* SCHEDULER.DAILY_ONCE_EVERY_DAYS */}
                              {inputElement(
                                "Every",
                                "SCHEDULER.EVERY_DAYS",
                                "Day(s)",
                                "onlyDay",
                                INFRS_EQUIPMENT_OPTIONS.dayNumList,
                                "DAY_NUM",
                                false
                              )}
                            </div>
                          </div>
                        </>
                      ) : (
                        ""
                      )}
                      {Btnvalue === "Weekly" ? (
                        <>
                          <div className="grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-3 lg:grid-cols-3">
                            <div>
                              {/* Week Display Sunday Monday */}
                              {inputElement(
                                "Every",
                                "SCHEDULER.WEEKLY_1_EVERY_WEEK",
                                "Week(s)",
                                "onlyWeek",
                                INFRS_EQUIPMENT_OPTIONS.weekNumList,
                                "MONTHLY_WEEK_NUM",
                                false
                              )}
                            </div>
                            <div className="col-span-2">
                              <div className="">
                                <label className="Text_Secondary Input_Label">
                                  On
                                </label>
                              </div>
                              <div
                                className=""
                              // {...register("SCHEDULER.WEEKLY_1_WEEKDAY", {})}
                              >
                                {LABELS.weekDataLabel?.map((week: any) => {
                                  return (
                                    <Buttons
                                      className={`Secondary_Button mr-1 ${data?.DAY_CODE === week?.DAY_CODE
                                        ? "!bg-[#8e724a] !text-white"
                                        : ""
                                        }`}
                                      label={week?.DAY_DESC}
                                      type="button"
                                      onClick={() => {
                                        setData(week);
                                        handleSelectWeekChange(
                                          week,
                                          "SCHEDULER.WEEKLY_1_WEEKDAY"
                                        );
                                      }}
                                    />
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        ""
                      )}
                      {Btnvalue === "Monthly" ? (
                        <>
                          <div className="grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-3 lg:grid-cols-3">
                            <div>
                              {/* MONHLY ONCE SELECT OF PERIODIC MONTHLY*/}
                              {inputElement(
                                "Every",
                                "SCHEDULER.MONTHLY_1_MONTH_NUM",
                                "Month(s)",
                                "onlyMonth",
                                INFRS_EQUIPMENT_OPTIONS.monthNumList1,
                                "MONTH_NUM",
                                false
                              )}
                            </div>
                            <div className="col-span-2">
                              <div className="">
                                <label className="Text_Secondary Input_Label">
                                  On
                                </label>
                              </div>
                              <div className="flex gap-2 flex-wrap">
                                <div>
                                  <RadioButton
                                    inputId="monthSelect1"
                                    name="monthSelect"
                                    value="O"
                                    onChange={(e: RadioButtonChangeEvent) => {
                                      setMonthlist(e.value);
                                      setOptiondisbaledWeek(true);
                                      setOptiondisbaled(false);
                                      setValue(
                                        "SCHEDULER.MONTHLY_2_WEEK_NUM",
                                        "0"
                                      );

                                      setValue(
                                        "SCHEDULER.MONTHLY_2_WEEKDAY",
                                        "0"
                                      );
                                    }}
                                    checked={monthSelect === "O"}
                                  />
                                </div>
                                <div>
                                  {inputElement(
                                    "",
                                    "SCHEDULER.MONTHLY_1_MONTHDAY",
                                    "day",
                                    "onlyDay",
                                    INFRS_EQUIPMENT_OPTIONS.dayNumList,
                                    "DAY_NUM",
                                    optiondisbled
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-2 flex-wrap">
                                <div>
                                  <RadioButton
                                    inputId="monthSelect2"
                                    name="monthSelect"
                                    value="T"
                                    onChange={(e: RadioButtonChangeEvent) => {
                                      setMonthlist(e.value);
                                      setOptiondisbaled(true);
                                      setOptiondisbaledWeek(false);
                                      setValue(
                                        "SCHEDULER.MONTHLY_1_MONTHDAY",
                                        "0"
                                      );
                                    }}
                                    checked={monthSelect === "T"}
                                  />
                                </div>

                                <div>
                                  {inputElement(
                                    "",
                                    "SCHEDULER.MONTHLY_2_WEEK_NUM",
                                    "Week",
                                    "",
                                    INFRS_EQUIPMENT_OPTIONS.weekNumList,
                                    "MONTHLY_WEEK_NUM",
                                    optiondisbledWeek
                                  )}
                                </div>
                                <div>
                                  {inputElement(
                                    "",
                                    "SCHEDULER.MONTHLY_2_WEEKDAY",
                                    "day",
                                    "",
                                    INFRS_EQUIPMENT_OPTIONS.weekDataLabel,
                                    "DAY_CODE",
                                    optiondisbledWeek
                                  )}
                                </div>
                                {/* <div>
                              {inputElement(
                                "",
                                "SCHEDULER.MONTHLY_1_MONTHDAY",
                                "day",
                                "onlyDay"
                              )}
                            </div> */}
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        ""
                      )}
                      {Btnvalue === "Yearly" ? (
                        <>
                          <div className="grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-3 lg:grid-cols-3">
                            <div>
                              {/* MONHLY ONCE SELECT OF PERIODIC MONTHLY*/}
                              {inputElement(
                                "Every",
                                "SCHEDULER.YEARLY_MONTH",
                                "",
                                "onlyMonth",
                                INFRS_EQUIPMENT_OPTIONS.monthNumList,
                                "MONTH_NUM",
                                false
                              )}
                            </div>
                            <div className="col-span-2">
                              <div className="">
                                <label className="Text_Secondary Input_Label">
                                  On
                                </label>
                              </div>
                              <div className="flex gap-2 flex-wrap">
                                <div>
                                  <RadioButton
                                    inputId="monthSelect1"
                                    name="monthSelect"
                                    value="O"
                                    onChange={(e: RadioButtonChangeEvent) => {
                                      setMonthlist(e.value);
                                      setOptiondisbaledWeek(true);
                                      setOptiondisbaled(false);
                                      setValue(
                                        "SCHEDULER.MONTHLY_2_WEEK_NUM",
                                        "0"
                                      );

                                      setValue(
                                        "SCHEDULER.MONTHLY_2_WEEKDAY",
                                        "0"
                                      );
                                    }}
                                    checked={monthSelect === "O"}
                                  />
                                </div>
                                <div>
                                  {inputElement(
                                    "",
                                    "SCHEDULER.MONTHLY_1_MONTHDAY",
                                    "day",
                                    "onlyDay",
                                    INFRS_EQUIPMENT_OPTIONS.dayNumList,
                                    "DAY_NUM",
                                    optiondisbled
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-2 flex-wrap">
                                <div>
                                  <RadioButton
                                    inputId="monthSelect2"
                                    name="monthSelect"
                                    value="T"
                                    onChange={(e: RadioButtonChangeEvent) => {
                                      setMonthlist(e.value);
                                      setOptiondisbaled(true);
                                      setOptiondisbaledWeek(false);
                                      setValue(
                                        "SCHEDULER.MONTHLY_1_MONTHDAY",
                                        "0"
                                      );
                                    }}
                                    checked={monthSelect === "T"}
                                  />
                                </div>

                                <div>
                                  {inputElement(
                                    "",
                                    "SCHEDULER.MONTHLY_2_WEEK_NUM",
                                    "Week",
                                    "",
                                    INFRS_EQUIPMENT_OPTIONS.weekNumList,
                                    "MONTHLY_WEEK_NUM",
                                    optiondisbledWeek
                                  )}
                                </div>
                                <div>
                                  {inputElement(
                                    "",
                                    "SCHEDULER.MONTHLY_2_WEEKDAY",
                                    "day",
                                    "",
                                    INFRS_EQUIPMENT_OPTIONS.weekDataLabel,
                                    "DAY_CODE",
                                    optiondisbledWeek
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        ""
                      )}
                    </div>

                    <div>
                      <div className="flex flex-wrap justify-between mb-2">
                        <p className="Header_Text">Schedule Range</p>
                      </div>
                      <div className="grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-3 lg:grid-cols-3">
                        <Field
                          controller={{
                            name: "REPEAT_UNTIL",
                            control: control,
                            render: ({ field }: any) => {
                              return (
                                <Select
                                  {...register("REPEAT_UNTIL", {
                                    required: (
                                      "Please fill the required fields."
                                    ),
                                    onChange(event: any) {
                                      setRepeatUntil(
                                        `${event.target.value.REPEAT_ID}`
                                      );
                                    },
                                  })}
                                  options={INFRS_EQUIPMENT_OPTIONS.RepeatUntil}
                                  label="Repeat Until"
                                  require={true}
                                  optionLabel="REPEAT_NAME"
                                  invalid={errors.REPEAT_UNTIL}
                                  filter={true}
                                  findKey={"REPEAT_ID"}
                                  selectedData={selectedDetails.REPEAT_UNTIL}
                                  setValue={setValue}
                                  {...field}
                                />
                              );
                            },
                          }}
                        />
                        {checkedrepeatuntil === "2" ? (
                          <Field
                            controller={{
                              name: "SCHEDULE_INFRA_END_DATE",
                              control: control,
                              render: ({ field }: any) => {
                                return (
                                  <DateCalendar
                                    {...register("SCHEDULE_INFRA_END_DATE", {
                                      required:
                                        checkedrepeatuntil === "2"
                                          ? "Please fill the required fields."
                                          : "",
                                    })}
                                    label="End Date"
                                    showIcon
                                    minDate={startdate}
                                    require={true}
                                    invalid={
                                      checkedrepeatuntil === "2"
                                        ? errors?.SCHEDULE_INFRA_END_DATE
                                        : ""
                                    }
                                    setValue={setValue}
                                    {...field}
                                  />
                                );
                              },
                            }}
                          />
                        ) : checkedrepeatuntil === "1" ? (
                          <div className="col mb-2">
                            <div className="w-36">
                              <label className="Text_Secondary Input_Label mr-2">
                                {("No. of Occurance")}
                                <span className="text-red-600"> *</span>
                              </label>
                            </div>
                            <div className={"w-80"}>
                              <Field
                                controller={{
                                  name: "NOOFOCCURENCE",
                                  control: control,
                                  render: ({ field }: any) => {
                                    return (
                                      <InputField
                                        {...register("NOOFOCCURENCE", {
                                          required:
                                            checkedrepeatuntil === "1"
                                              ? "Please fill the required fields."
                                              : "",
                                        })}
                                        // name="No. of Occurance"
                                        invalid={
                                          checkedrepeatuntil === "1"
                                            ? errors?.NOOFOCCURENCE
                                            : ""
                                        }
                                        setValue={setValue}
                                        require={true}
                                        {...field}
                                      />
                                    );
                                  },
                                }}
                              />
                            </div>
                          </div>
                        ) : (
                          <></>
                        )}
                      </div>
                      <div>
                        <p className="Text_Primary Alert_Title  mt-2">
                          {Btnvalue === "Monthly" &&
                            monthlyEvery?.MONTH_NUM !== undefined
                            ? `Occurs every ${monthlyEvery?.MONTH_NUM
                            } months starting ${moment(startdate).format(
                              "DD-MM-YYYY"
                            )}`
                            : Btnvalue === "Yearly" &&
                              yearlyEvery?.VIEW !== undefined
                              ? `Occurs every ${yearlyEvery?.VIEW
                              } month starting ${moment(startdate).format(
                                "DD-MM-YYYY"
                              )}`
                              : Btnvalue === "Weekly" &&
                                weeklyEvery?.MONTHLY_WEEK_NUM !== undefined
                                ? `Occurs every ${weeklyEvery?.MONTHLY_WEEK_NUM
                                } week starting ${moment(startdate).format(
                                  "DD-MM-YYYY"
                                )}`
                                : Btnvalue === "Daily" &&
                                  dailyEvery?.DAY_NUM !== undefined
                                  ? `Occurs every ${dailyEvery?.DAY_NUM
                                  } day starting ${moment(startdate).format(
                                    "DD-MM-YYYY"
                                  )}`
                                  : ""}
                        </p>
                      </div>
                    </div>

                    <hr className="mb-2 mt-2"></hr>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap justify-between mt-2">
                      <h6 className="Main_Header_Text">Work Order Creation</h6>
                    </div>

                    <div>
                      <div className="">
                        <label className="Text_Secondary Input_Label">
                          When should work order be created?
                        </label>
                      </div>
                      <div className="grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-2 lg:grid-cols-2">
                        <div className="flex gap-2 p-3 containerWO">
                          <div className="flex align-items-center">
                            <RadioButton
                              inputId="createWO1"
                              name="createWO"
                              value="Schedule"
                              onChange={(e: RadioButtonChangeEvent) => {
                                setWorkOrder(e.value);
                              }}
                              checked={createWO === "Schedule" ? true : false}
                            />
                          </div>
                          <div className="flex flex-col gap-2">
                            <div className="flex flex-wrap justify-between ">
                              <p className="Input_Text Text_Primary">
                                Scheduled
                              </p>
                            </div>
                            <label className="Sub_Header_Text Text_Secondary">
                              Generate work orders in advance of their scheduled
                              cycle.
                            </label>
                          </div>
                        </div>

                        <div className="flex gap-2 p-3 containerWO">
                          <div className="flex align-items-center">
                            <RadioButton
                              inputId="createWO2"
                              name="createWO"
                              value="Immediately"
                              onChange={(e: RadioButtonChangeEvent) =>
                                setWorkOrder(e.value)
                              }
                              checked={createWO === "Immediately"}
                            />
                          </div>
                          <div className="flex flex-col gap-2">
                            <div className="flex flex-wrap justify-between ">
                              <p className="Input_Text Text_Primary">
                                Immediately
                              </p>
                            </div>
                            <label className="Sub_Header_Text Text_Secondary">
                              Generate all work orders as early as possible.
                            </label>
                          </div>
                        </div>
                      </div>

                      {createWO === "Schedule" ? (
                        <>
                          <div className="grid grid-cols-1 gap-x-3 gap-y-3 mt-2 ">
                            {/* SCHEDULER.DAILY_ONCE_EVERY_DAYS */}
                            {inputElement(
                              "How many days before? (Please specify the number of days",
                              "SCHEDULER.WO_BEFORE_CREATION_DAYS",
                              "Day(s)",
                              "onlyDay",
                              INFRS_EQUIPMENT_OPTIONS.dayNumList,
                              "DAY_NUM",
                              false
                            )}
                          </div>
                        </>
                      ) : (
                        ""
                      )}
                    </div>
                  </div>
                </Card>
              </div>
            </div>
            <div>
              {/* <Card className="mt-3">
                <div className="flex flex-wrap justify-between mb-3">
                  <h6 className="Main_Header_Text">Equipment Summary</h6>
                </div> */}

              {/* <div className=" flex flex-col gap-3">
                  <div className=" flex flex-col gap-1">
                    <label className="Text_Secondary Helper_Text">
                      Equipment Name
                    </label>

                    <>
                      <p className="Text_Primary Alert_Title  ">

                        {assetTreeDetails?.length > 0
                          ? `${ASSET_FOLDER_DATA?.ASSET_FOLDER_DESCRIPTION ?? ""
                          } ${assetTreeDetails[0]?.ASSET_NAME}`
                          : `${ASSET_FOLDER_DATA?.ASSET_FOLDER_DESCRIPTION ?? ""
                          } > ${selectedAssetFormData?.ASSET_NAME ?? ""}`}
                      </p>
                    </>

                  </div>
                  <div className=" flex flex-col gap-1">
                    <label className="Text_Secondary Helper_Text">
                      Equipment Type
                    </label>

                    <>
                      <p className="Text_Primary Alert_Title  ">

                        {assetTreeDetails?.length > 0
                          ? assetTreeDetails[0]?.ASSETTYPE_NAME
                          : selectedAssetFormData?.TYPE?.ASSETTYPE_NAME ?? ""}
                      </p>
                    </>
                    {/* )} */}
            </div>

            {/* <div className=" flex flex-col gap-1">
                    <label className="Text_Secondary Helper_Text">
                      Equipment Group
                    </label>

                    <>
                      <p className="Text_Primary Alert_Title  ">

                        {assetTreeDetails?.length > 0
                          ? assetTreeDetails[0]?.ASSETGROUP_NAME
                          : selectedAssetFormData?.GROUP?.ASSETGROUP_NAME ?? ""}
                      </p>
                    </>

                  </div> */}

            {/* <div className=" flex flex-col gap-1">
                    <label className="Text_Secondary Helper_Text">
                      Location
                    </label>

                    <>
                      <p className="Text_Primary Alert_Title  ">
                        {assetTreeDetails?.length > 0
                          ? assetTreeDetails[0]?.LOCATION_DESCRIPTION
                          : selectedAssetFormData?.LOCATION
                            ?.LOCATION_DESCRIPTION ?? ""}
                      </p>
                    </>
                  </div> */}

            {/* <HierarchyDialog
                    showEquipmentlist={showEquipmentlist}
                    visibleEquipmentlist={visibleEquipmentlist}
                    selectedKey={selectedKey}
                    setSelectedKey={setSelectedKey}
                    setValue={setValue}
                    nodes={nodes}
                    filteredData={filteredData}
                    setFilteredData={setFilteredData}
                    setNodes={setNodes}
                    assetTreeDetails={assetTreeDetails}
                    setAssetTreeDetails={setAssetTreeDetails}
                    loading={loading}
                  /> */}
            {/* </div>  */}


            {/* </Card>
            </div> */}
          </div>
        </form>
      </section>
    </>
  );
};

export default InfraAssetSchedule;
