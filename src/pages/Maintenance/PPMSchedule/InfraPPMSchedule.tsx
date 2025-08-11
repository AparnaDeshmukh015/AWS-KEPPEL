import { Card } from "primereact/card";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Buttons from "../../../components/Button/Button";
import { InputText } from "primereact/inputtext";
import { Accordion, AccordionTab } from "primereact/accordion";
import { Checkbox } from "primereact/checkbox";
import { IconField } from "primereact/iconfield";
import "../../../components/Checkbox/Checkbox.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import moment from "moment";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import {
  Calendar as BigCalendar,
  momentLocalizer,
  ToolbarProps,
} from "react-big-calendar";
import {
  Calendar as PrimeCalendar,
  CalendarMonthChangeEvent,
} from "primereact/calendar";
import { PATH } from "../../../utils/pagePath";
import "../PPMSchedule/PPMScheduleExtra.css";
import "./PPMSchedule.css";
import PPMAddForm from "./PPMAddForm";
import { callPostAPI } from "../../../services/apis";
import { ENDPOINTS } from "../../../utils/APIEndpoints";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import { toast } from "react-toastify";
import {
  eventNotification,
  helperEventNotification,
} from "../../../utils/eventNotificationParameter";
import { decryptData } from "../../../utils/encryption_decryption";
import { Button } from "primereact/button";
import "../../../components/DialogBox/DialogBox.css";
import { Sidebar } from "primereact/sidebar";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  parse,
} from "date-fns";
import HierarchyDialog from "../../../components/HierarchyDialog/HierarchyDialog";
import LoaderShow from "../../../components/Loader/LoaderShow";

const localizer = momentLocalizer(moment);
var priority_data: any = [];
const DnDCalendar = withDragAndDrop(BigCalendar);
const views = [
  {
    month: true,
    week: true,
    day: true,
    agenda: true,
  },
];
var priorityId: any = [];
var equipmentName: any = [];
var woTypeFilterName: any = [];
const InfraNewPPMSchedule = (props: any) => {
  const [date, setDate] = useState<Date | null>(null);
  const [startDate, setStartDate] = useState<any | null>(new Date());
  const [loading, setLoading] = useState<any | null>(false);
  const [checked, setChecked] = useState<boolean>(false);
  const [scheduleData, setScheduleData] = useState<any | null>([]);
  const [originalScheduleData, setOriginalScheduleData] = useState<any | null>(
    []
  );

  const [visibleEquipmentlist, showEquipmentlist] = useState(false);
  const [selectedEquipmentKey, setSelectedEquipmentKey] = useState("");
  const [month, setMonth] = useState<any | null>([new Date(), new Date()]);
  const [week, setWeek] = useState<any | null>([new Date(), new Date()]);
  const [globalFilterValue, setGlobalFilterValue] = useState<any | null>(null);
  const [hierachyFirstDate, setHierarchyFirstDate] = useState<any | null>(null);
  const [hierachyLastDate, setHierarchyLastDate] = useState<any | null>(null);

  const [groupedEvent, setGroupEvent] = useState<any | null>([]);
  const [currentDate, setCurrentDate] = useState<any | null>(new Date());
  const [priorityCheckAll, setPriorityCheckAll] = useState<any | null>(false);
  const [woTypeCheckAll, setWoTypeCheckAll] = useState<any | null>(false);
  const [statusToday, setStatusToday] = useState<any | null>(false);
  const [equipmentTypeCheckAll, setEquipmentTypeCheckAll] = useState<
    any | null
  >(false);
  const CustomToolbar: React.FC<ToolbarProps> = (props) => {
    const { date, onNavigate, label, view, onView } = props;

    // Format the date for the sub-header
    const formattedDate = moment(date).format("dddd, D MMMM YYYY");

    return (
      <div className="rbc-toolbar">
        <div className="rbc-btn-group px-4">
          <button
            type="button"
            onClick={() => {
              setGlobalFilterValue(null); // Clear search input
              setStatusToday(true);
              setFilterValue([]); // Clear all filters
              setPriorityCheckAll(false);
              setWoTypeCheckAll(false);
              setEquipmentTypeCheckAll(false);
              setSelectedCategories([]);
              setSelectedWoItems([]);
              setSelectedItems([]);
              priorityId = [];
              equipmentName = [];
              woTypeFilterName = [];
              // getOptionCall();
              setTimeout(() => onNavigate("TODAY"), 0);
            }}
          >
            Today
          </button>
          <button
            type="button"
            className="navigate-btn"
            onClick={() => onNavigate("PREV")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M13.2929 6.29297L7.58594 12L13.2929 17.707L14.7069 16.293L10.4139 12L14.7069 7.70697L13.2929 6.29297Z"
                fill="#272B30"
              />
            </svg>
          </button>
          <button
            type="button"
            className="navigate-btn"
            onClick={() => onNavigate("NEXT")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M10.707 17.707L16.414 12L10.707 6.29297L9.29297 7.70697L13.586 12L9.29297 16.293L10.707 17.707Z"
                fill="#272B30"
              />
            </svg>
          </button>
        </div>
        <div className="rbc-toolbar-label">{label}</div>
        <div className="rbc-btn-group px-4">
          <button
            type="button"
            className={view === "month" ? "rbc-active" : ""}
            onClick={() => {
              onView("month");
              setTimeout(() => onNavigate("TODAY"), 0);
            }}
          >
            Month
          </button>
          {/* <button
            type="button"
            className={view === "week" ? "rbc-active" : ""}
            onClick={() => {
              onView("week");
              // setFilterValue([]);
              setGlobalFilterValue(null);
              setTimeout(() => onNavigate("TODAY"), 0);
            }}
          >
            Week
          </button> */}
          {/* <button
            type="button"
            className={view === "day" ? "rbc-active" : ""}
            onClick={() => {
              onView("day");
              setTimeout(() => onNavigate("TODAY"), 0);
            }}
          >
            Day
          </button> */}
          <button
            type="button"
            className={view === "agenda" ? "rbc-active" : ""}
            onClick={() => {
              onView("agenda");
              setTimeout(() => onNavigate("TODAY"), 0);
            }}
          >
            Agenda
          </button>
        </div>
        <div className="thin-line1"></div>
        {/* Sub-header with formatted date */}
        {view === "month" || view === "agenda" ? (
          ""
        ) : (
          <div className="rbc-date-subheader px-4 py-1">{formattedDate}</div>
        )}
      </div>
    );
  };
  const CustomTimeGutterHeader = () => {
    return <div className="rbc-time-header-gutter">All Day</div>;
  };

  const timeGutterFormat = (date: Date, culture?: string) => {
    return moment(date).format("h A");
  };

  // Custom time slot wrapper - adjusted to match expected props
  const CustomTimeSlotWrapper = (props: any) => {
    return (
      <div
        className="rbc-time-slot"
        style={{
          borderBottom: "1px solid #eee",
          height: "48px",
        }}
      >
        {props.children}
      </div>
    );
  };

  // priyanka code start

  let location: any = useLocation();
  const [, menuList]: any = useOutletContext();

  const currentMenu = menuList
    ?.flatMap((menu: any) => menu?.DETAIL)
    .filter((detail: any) => detail.URL === location?.pathname)[0];
  // const [selectedDetails, setSelectedDetails] = useState<any>([]);
  const [showForm, setShowForm] = useState<any | null>(false);
  const [options, setOptions] = useState<any | false>([]);
  const [locationtypeOptions, setlocationtypeOptions] = useState([]);
  const [type, setType] = useState<any | null>([]);
  const [currentView, setCurrentView] = useState<any | null>("month");
  const today = new Date();

  const [visible, setVisible] = useState(true);
  const navigate: any = useNavigate();
  const [selectedKey, setSelectedKey] = useState("");
  const [visibleSidebar, setVisibleSidebar] = useState<boolean>(false);
  const [sidebarDetail, setSidebarDetail] = useState<any | null>([]);
  const [ppmDetails, setPpmDetails] = useState<any | null>([]);
  const FACILITY: any = localStorage.getItem("FACILITYID");
  const FACILITY_ID: any = JSON.parse(FACILITY);
  if (FACILITY_ID) {
    var facility_type: any = FACILITY_ID?.FACILITY_TYPE;
  }

  const [assetTreeDetails, setAssetTreeDetails] = useState<any | null>([
    {
      ASSETGROUP_NAME: "",
      ASSETTYPE_NAME: "",
      LOCATION_DESCRIPTION: "",
      ASSET_NAME: "",
    },
  ]);
  const [priorityList, setPriorityList] = useState<any | null>([]);
  const [nodes, setNodes] = useState<any | null>([]);
  const [filteredData, setFilteredData] = useState<any | null>(nodes);
  const [endDate, setEndDate] = useState<any | null>(new Date());
  const [woTypeValue, setWoTypeValue] = useState<any | null>([]);
  const [filterValue, setFilterValue] = useState<any[]>([]);
  const [selectedWoItems, setSelectedWoItems] = useState<any | null>([]);
  const [allEquipmentId, setAllEquipmentId] = useState<any | null>([]);
  const [equipmentLength, setEquipmentLength] = useState<any | null>(0);
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      LOCATION_ID: "",
      ASSETGROUP_ID: "",
      ASSETTYPE_ID: "",
      SEL_FACILITY: "",
      SEL_LOCATION: "",
      SEL_ASSETGROUP: "",
      SEL_ASSETTYPE: "",
      ASSETNAME: "",
    },
  });
  const watchAllFields: any = watch();
  const onSubmit = async () => { };
  const getAssetDetailsList = async (assetid: any) => {
    try {
      localStorage.setItem("assetId", assetid);

      const payload = {
        ASSET_ID: assetid ?? 0,
      };
      const res = await callPostAPI(ENDPOINTS.GET_INFRA_ASSET_DETAILS, payload);
      if (res?.FLAG === 1) {
        setAssetTreeDetails(res?.ASSETDETAILSLIST);
      } else {
        setAssetTreeDetails([]);
        toast?.error(res?.MSG);
      }
    } catch (error: any) {
      toast?.error(error.message);
    } finally {
    }
  };

  useEffect(() => {
    if (!visibleSidebar) {
      setAssetTreeDetails([
        {
          ASSETGROUP_NAME: "",
          ASSETTYPE_NAME: "",
          LOCATION_DESCRIPTION: "",
          ASSET_NAME: "",
        },
      ]);
    }
  }, [visibleSidebar]);

  const handleSelectedEvent = async (event: any) => {
    try {
      setLoading(true);
      setVisibleSidebar(true);
      setSidebarDetail({
        schedule_id: event?.schedule_id,
        functionCode: currentMenu?.FUNCTION_CODE,
      });
      const res = await callPostAPI(ENDPOINTS.GET_PPM_SCHEDULE_DETAILS, {
        PPM_ID: event?.id,
      });
      if (res?.FLAG === 1) {
        setPpmDetails(res?.PPMDETAILS);
        localStorage.setItem(
          "assetDetails",
          JSON.stringify(res?.PPMDETAILS[0])
        );
        sessionStorage.setItem("formData", JSON.stringify(res?.PPMDETAILS[0]));
      } else {
        setPpmDetails([]);
      }

      getAssetDetailsList(event?.asset_id);
    } catch (error: any) {
      setLoading(false);
    } finally {
      setLoading(false);
    }
    // navigate(PATH.PPMSCHEDULEDETAILS, { state: { schedule_id: event?.schedule_id, functionCode: currentMenu?.FUNCTION_CODE } })
  };

  const onEventDrop = async (data: any) => {
    const { start, event } = data;
    setScheduleData((prevEvents: any) =>
      prevEvents.map((prevEvent: any) => {
        return prevEvent?.id === event?.id ? { ...event, start } : prevEvent;
      })
    );

    if (start >= new Date()) {
      const payload: any = {
        ACTIVE: 1,
        PPM_ID: event?.schedule_id,
        SER_REQ_NO: "",
        MODE: "UPDATE",
        SCHEDULE_DATE: moment(start).format("YYYY-MM-DD"),
        SCHEDULE_DATETIME: moment(start).format("HH:mm"),
        REMARKS: "Test",
        PARA: { para1: `${currentMenu?.FUNCTION_DESC}`, para2: "Changed" },
      };

      const res = await callPostAPI(
        ENDPOINTS.UPDATE_PPM_SCHEDULE_DETAILS,
        payload
      );
      if (res?.FLAG === true) {
        toast.success(res?.MSG);
        let month: any = moment(start).format("MM");
        let year: any = moment(start).format("YYYY");
        let firstDate = moment(new Date(year, parseInt(month) - 1, 1)).format(
          "MM-DD-YYYY"
        );
        let lastDate = moment(new Date(year, parseInt(month), 1)).format(
          "MM-DD-YYYY"
        );
        await getOptions(firstDate, lastDate);
        const notifcation: any = {
          FUNCTION_CODE: currentMenu?.FUNCTION_CODE,
          EVENT_TYPE: "P",
          STATUS_CODE: 2,
          PARA1: decryptData(localStorage.getItem("USER_NAME")),
          PARA2: data?.title,
          PARA3: moment(start).format("DD-MM-YYYY"),
          PARA4: moment(data?.schedule_date).format("DD-MM-YYYY"),
          PARA5: data?.schedule_name,
        };

        const eventPayload = { ...eventNotification, ...notifcation };
        await helperEventNotification(eventPayload);
      }
    } else {
      toast.error("Please select current or future date");
      let month: any = moment(start).format("MM");
      let year: any = moment(start).format("YYYY");
      let firstDate = moment(new Date(year, parseInt(month) - 1, 1)).format(
        "MM-DD-YYYY"
      );
      let lastDate = moment(new Date(year, parseInt(month), 1)).format(
        "MM-DD-YYYY"
      );
      await getOptions(firstDate, lastDate);
    }
  };

  const getOptionCall = async () => {
    let month: any = moment(new Date()).format("MM");
    let year: any = moment(new Date()).format("YYYY");
    let firstDate = moment(new Date(year, parseInt(month) - 1, 1)).format(
      "MM-DD-YYYY"
    );
    let lastDate = moment(new Date(year, parseInt(month), 1)).format(
      "MM-DD-YYYY"
    );
    await getOptions(firstDate, lastDate);
  };

  const getOptions = async (firstDate: any, lastDate: any) => {
    try {
      setLoading(true);
      setHierarchyFirstDate(firstDate);
      setHierarchyLastDate(lastDate);

      const payload: any = {
        SCHEDULE_VIEW: 0,
        START_DATE: firstDate,
        END_DATE: lastDate,
        P_W_D: 0,
        N_W_D: 0,
        LOCATION: [],
        ASSETGROUP: [],
        ASSETTYPE: [],
        ASSETNAME: [],
      };

      const res = await callPostAPI(
        ENDPOINTS.GET_PPM_SCHEDULE_DASHBOARD,
        payload
      );

      if (res?.FLAG === 1) {
        const equipment_Id: any = res?.PPMSCHEDULEDETAILS?.map(
          (ppm: any) => ppm?.asset_id
        );
        if (statusToday) {
          setGlobalFilterValue(null);
        }
        setAllEquipmentId(equipment_Id);
        const updatedSchedule: any = res?.PPMSCHEDULEDETAILS?.map(
          (schedule: any) => {
            let startDate = moment(schedule?.start).format("YYYY-MM-DD");
            let endDate = moment(schedule?.end).format("YYYY-MM-DD");
            return {
              ...schedule,
              start: new Date(startDate),
              end: new Date(endDate),
              color: schedule?.COLORS,
            };
          }
        );

        const eventData: any = res?.PPMSCHEDULEDETAILS?.map((schedule: any) => {
          const [hours, minutes] = schedule?.schedule_time?.split(":") || [
            0, 0,
          ];

          const start_date = parse(
            schedule?.schedule_date,
            "dd-MM-yyyy",
            new Date()
          );

          start_date.setHours(parseInt(hours), parseInt(minutes));
          const end = new Date(start_date);
          end.setHours(end.getHours() + 4, end.getMinutes() + 30);

          return {
            date: schedule?.schedule_date,

            events: [
              {
                start_date, // Must be a Date object
                end,
                duration: "4h 30m",
                title: schedule?.title,
                description: schedule?.SCHEDULE_DESC,
              },
            ],
          };
        });

        monthWiseFilterHandler(
          priorityList?.length > 0 ? priorityList : priority_data,
          updatedSchedule
        );
        setGroupEvent(eventData);
        setScheduleData(updatedSchedule);
        setOriginalScheduleData(updatedSchedule);
        if (
          priorityId?.length > 0 ||
          equipmentName > 0 ||
          globalFilterValue !== null
        ) {
          getFilterData(
            priorityId,
            equipmentName,
            globalFilterValue,
            originalScheduleData,
            woTypeFilterName
          );
        }
      }
    } catch (error: any) {
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const getMasterDetails = async () => {
    const res1 = await callPostAPI(ENDPOINTS.LOCATION_HIERARCHY_LIST, null);
    const res2 = await callPostAPI(
      ENDPOINTS.GETASSETMASTEROPTIONS,
      { ASSETTYPE: "P" },
      props?.functionCode
    );
    if (res1?.FLAG === 1) {
      setlocationtypeOptions(res1?.LOCATIONHIERARCHYLIST);
      setOptions({
        assetGroup: res2?.ASSESTGROUPLIST,
        assetType: res2?.ASSESTTYPELIST,
      });
    }
  };

  const categories = [
    { name: "Immediate", key: "I", color: "#F5BCBC" },
    { name: "Urgent", key: "U", color: "#FBEBE9" },
    { name: "Normal", key: "N", color: "#FDF6E7" },
    { name: "Low", key: "L", color: "#E8F7FD" },
  ];
  const [selectedCategories, setSelectedCategories] = useState([categories[1]]);

  const handlePrioritySelectAll = (e: any) => {
    const isChecked = e.checked;
    setChecked(isChecked);
    const allPriorityIds = priorityList.map((item: any) => item.key);
    if (isChecked) {
      // Select all priority items

      setSelectedCategories(allPriorityIds);
      setPriorityCheckAll(true);
      priorityId.push(allPriorityIds);
      setFilterValue((pre: any[] = []) => [...pre, ...allPriorityIds]);
      // setFilterValue((prev: any) => [...prev, ...allPriorityIds]);
      // getOptionCall();
    } else {
      setFilterValue((pre: any[] = []) =>
        pre.filter((item: any) => !allPriorityIds.includes(item))
      );

      setPriorityCheckAll(false);
      setSelectedCategories([]);
      priorityId = [];
    }

    // Call getFilterData once (instead of per checkbox)
    getFilterData(
      priorityId,
      equipmentName,
      globalFilterValue,
      originalScheduleData,
      woTypeFilterName
    );
  };

  const onCategoryChange = (e: any) => {
    const selectedId = e.value;
    const previousSelected = [...selectedCategories];
    const updatedSelected = previousSelected.includes(selectedId)
      ? previousSelected.filter((id) => id !== selectedId)
      : [...previousSelected, selectedId];

    setSelectedCategories(updatedSelected);
    if (e.target.checked) {
      priorityId.push(e.value);
      setFilterValue((pre: any[] = []) => [...pre, e.value]);
      getFilterData(
        priorityId,
        equipmentName,
        globalFilterValue,
        originalScheduleData,
        woTypeFilterName
      );
    } else {
      let filterData: any = filterValue?.filter((f: any) => f !== e.value);
      setFilterValue(filterData);
      priorityId = filterData;
      getFilterData(
        priorityId,
        equipmentName,
        globalFilterValue,
        originalScheduleData,
        woTypeFilterName
      );
    }
  };

  const handleWorkTypeSelectAll = (e: any) => {
    const isChecked = e.checked;
    const allSelected = selectedWoItems.length === woTypeValue.length;
    const WoTypeCode: any = woTypeValue?.map(
      (woType: any) => woType?.WO_TYPE_CODE
    );
    if (isChecked === true) {
      setFilterValue((pre: any[] = []) => [...pre, ...WoTypeCode]);
      //setFilterValue((prev: any) => [...prev, ...WoTypeCode]);
      setWoTypeCheckAll(true);
      const allWorkTypeNames = woTypeValue.map(
        (item: any) => item.WO_TYPE_NAME
      );
      setSelectedWoItems(allWorkTypeNames);
      woTypeFilterName = [...allWorkTypeNames];
    } else {
      setWoTypeCheckAll(false);
      setSelectedWoItems([]);
      woTypeFilterName = [];
      setFilterValue((pre: any[] = []) =>
        pre.filter((item: any) => !WoTypeCode.includes(item))
      );
    }

    // Call getFilterData with updated filters

    getFilterData(
      priorityId,
      equipmentName,
      globalFilterValue,
      originalScheduleData,
      woTypeFilterName
    );
  };
  const onCategoryWoChange = (e: any, typeValue: any) => {
    const value = e.value;
    const checked = e.checked;
    let updatedSelection = [...selectedWoItems];
    setWoTypeCheckAll(false);
    if (checked) {
      updatedSelection.push(value);
      woTypeFilterName.push(typeValue?.WO_TYPE_CODE);
      setFilterValue((pre: any) => [...pre, typeValue?.WO_TYPE_CODE]);
    } else {
      updatedSelection = updatedSelection.filter((item) => item !== value);
      const data = woTypeFilterName.filter(
        (item: any) => item !== typeValue?.WO_TYPE_CODE
      );
      woTypeFilterName = data;

      const data1 = filterValue?.filter(
        (item: any) => item !== typeValue?.WO_TYPE_CODE
      );
      setFilterValue(data1);
    }
    setSelectedWoItems(updatedSelection);

    getFilterData(
      priorityId,
      equipmentName,
      globalFilterValue,
      originalScheduleData,
      woTypeFilterName
    );
  };

  const handleMonthChange = (e: CalendarMonthChangeEvent) => {
    const syntheticEvent = {
      value: new Date(e.year, e.month, 1), // Create date from month/year
    };

    onChangeDateCalendar(syntheticEvent);
  };

  useEffect(() => {
    // if (statusToday) {
    //   setGlobalFilterValue(null);
    //   getOptionCall();
    // } else {
    // onGlobalFilterChange();
    getFilterData(
      priorityId,
      equipmentName,
      globalFilterValue,
      originalScheduleData,
      woTypeFilterName
    );
    // }
  }, [filterValue, statusToday, globalFilterValue]);

  const CustomAgendaEvent = (event: any) => {
    return (
      <div className="">
        {groupedEvent.map((group: any, i: any) => (
          <div key={i} className="mb-[20px]">
            <div className="Text_Primary Header_Text agenda-date-heading">
              {group.date}
              {/* {format(group.date, "EEEE, dd MMMM yyyy")} */}
            </div>
            {group.events.map((event: any, j: any) => (
              <div
                key={j}
                className="flex items-start gap-4 mb-4 relative mx-[24px] my-[10px] pl-2 border-left"
              >
                {/* <div className="absolute left-0 top-2 w-2 h-2 bg-red-500 rounded-full" /> */}
                <div className=" w-24">
                  <div className="Text_Primary Header_Text">{event.time}</div>
                  <div className="Text_Secondary Helper_Text ">
                    {/* {event.duration} */}
                  </div>
                </div>
                <div className="flex-1 text-sm">
                  <div className="Text_Primary Header_Text">{event.title}</div>
                  <div className="mt-1 Text_Secondary Helper_Text ">
                    {event.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  const eventStyleGetter = (event: any) => {
    const backgroundColor = event.color || "#3182ce"; // fallback color
    const style = {
      backgroundColor,
    };
    return { style };
  };

  useEffect(() => {
    (async function () {
      if (facility_type === "R") {
        await getMasterDetails();
      } else {
        await getServiceRequestMasterListInfra();
      }
    })();
  }, []);

  // priyanka code end

  const onChangeDateCalendar = async (e: any) => {
    if (currentView === "month") {
      const startDate: any = startOfMonth(e?.value);
      const endDate: any = endOfMonth(e?.value);
      setStartDate(startDate);
      setEndDate(endDate);
      setCurrentDate(startDate);
      setCurrentView("month");

      setMonth([startDate, endDate]);
      await getOptions(
        moment(startDate).format("MM-DD-YYYY"),
        moment(endDate).format("MM-DD-YYYY")
      );
    } else if (currentView === "week") {
      const startofWeek: any = startOfWeek(e?.value);
      const endofWeek: any = endOfWeek(e?.value);
      setStartDate(startofWeek);
      setEndDate(endofWeek);
      setCurrentDate(startofWeek);
      setCurrentView("week");

      setWeek([startofWeek, endofWeek]);
      await getOptions(
        moment(startofWeek).format("MM-DD-YYYY"),
        moment(endofWeek).format("MM-DD-YYYY")
      );
    } else if (currentView === "day") {
      setStartDate(e?.value);
      setEndDate(e?.value);
      setCurrentDate(e?.value);
      setCurrentView("day");
      await getOptions(
        moment(e?.value).format("MM-DD-YYYY"),
        moment(e?.value).format("MM-DD-YYYY")
      );
    } else if (currentView === "agenda") {
    }
  };

  const monthWiseFilterHandler = (priorityData: any, scheduleData: any) => {
    let prioority = priorityList?.length > 0 ? priorityList : priority_data;
    const filteredScheduleData = prioority.filter(
      (item: any) =>
        scheduleData.filter(
          (priority: any) => priority.SEVERITY_ID === item.key
        ).length > 0
    );
    setPriorityList(filteredScheduleData);
  };

  const getServiceRequestMasterListInfra = async () => {
    try {
      const res = await callPostAPI(ENDPOINTS.GET_SCHEDULE_MASTERLIST);
      if (res?.FLAG === 1) {
        const priorityListData: any = res?.PRIORITYLIST?.map((item: any) => ({
          name: item?.SEVERITY,
          key: item?.SEVERITY_ID,
          color: item?.COLORS,
        }));
        setSelectedCategories(priorityListData);
        setWoTypeValue(res?.WOTYPELIST);
        setPriorityList(priorityListData);
        priority_data = priorityListData;
        // monthWiseFilterHandler(priorityListData, originalScheduleData)

        let month: any = moment(new Date()).format("MM");
        let year: any = moment(new Date()).format("YYYY");
        let firstDate = moment(new Date(year, parseInt(month) - 1, 1)).format(
          "MM-DD-YYYY"
        );
        let lastDate = moment(new Date(year, parseInt(month), 1)).format(
          "MM-DD-YYYY"
        );
        await getOptions(firstDate, lastDate);
      } else {
        toast?.error(res?.MSG);
      }
    } catch (error: any) {
      toast?.error(error.message);
    }
  };

  const dateTemplate = (date: any) => {
    const current = new Date(date.year, date.month, date.day);
    const isSameDay = (d1: Date, d2: Date) =>
      d1.toDateString() === d2.toDateString();
    const today = new Date();
    const isToday = isSameDay(current, today);
    const isStart = startDate && isSameDay(current, startDate);
    const isEnd = endDate && isSameDay(current, endDate);
    const inRange =
      startDate && endDate && current > startDate && current < endDate;

    // Skip all styling if it's today
    if (isToday) {
      return <div className="week">{date.day}</div>;
    }

    // Otherwise, apply range styling if needed
    const shouldStyleParent = isStart || isEnd || inRange;
    const backgroundColor = shouldStyleParent ? "#F1EEE9" : "transparent";

    return (
      <div
        className={`week ${shouldStyleParent ? "styled-parent" : ""}`}
        style={{
          backgroundColor,
          width: "2rem",
          height: "2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "auto",
        }}
      >
        {date.day}
      </div>
    );
  };

  const handleNavigate = async (
    newDate: Date,
    view: string,
    action: string
  ) => {
    setCurrentDate(newDate);
    if (view !== currentView) {
      setCurrentView(view);
    }
    setWoTypeCheckAll(false);
    setPriorityCheckAll(false);
    setEquipmentTypeCheckAll(false);
    setSelectedItems([]);
    setFilterValue([]);
    equipmentName = [];
    priorityId = [];
    priorityId = [];
    if (view === "month") {
      setStartDate(startOfMonth(newDate));
      setEndDate(endOfMonth(newDate));
      let month: any = moment(newDate).format("MM");
      let year: any = moment(newDate).format("YYYY");
      let firstDate = moment(new Date(year, parseInt(month) - 1, 1)).format(
        "MM-DD-YYYY"
      );
      let lastDate = moment(new Date(year, parseInt(month), 1)).format(
        "MM-DD-YYYY"
      );
      await getOptions(firstDate, lastDate);
    } else if (view === "week") {
      setStartDate(startOfWeek(newDate));

      setEndDate(endOfWeek(newDate));
      let firstDate = moment(startOfWeek(newDate)).format("MM-DD-YYYY");
      let lastDate = moment(endOfWeek(newDate)).format("MM-DD-YYYY");

      await getOptions(firstDate, lastDate);
    } else if (view === "day") {
      setStartDate(newDate);
      setEndDate(newDate);
      let firstDate = moment(newDate).format("MM-DD-YYYY");
      let lastDate = moment(newDate).format("MM-DD-YYYY");

      await getOptions(firstDate, lastDate);
    }
  };

  const [selectedItems, setSelectedItems] = useState<
    { key: string; label: string; data: any }[]
  >([]);
  const [checkedItems, setCheckedItems] = useState<string[]>([]);

  // Handle tree node click - just add this to your existing onNodeClick
  const handleNodeClick = async (e: any) => {
    if (
      e?.node?.isAsset === 1 ||
      !e.node.children ||
      e.node.children.length === 0
    ) {
      setSelectedKey(e.node.key);
      showEquipmentlist(false);
      setSelectedEquipmentKey(e.node.key);
      await getAssetDetailsList(e.node.key);

      // Add item to array - check by key regardless of hierarchy
      const itemExists = selectedItems.some(
        (item: { key: string }) => item.key === e.node.key
      );
      if (!itemExists) {
        // Get hierarchy path by traversing up the parent chain
        let hierarchyPath = "";
        let currentNode = e.node;

        while (currentNode) {
          hierarchyPath =
            currentNode.label + (hierarchyPath ? " > " + hierarchyPath : "");
          currentNode = currentNode.parent;
        }
        const data = selectedItems?.filter(
          (item: any) => item?.data?.key === e?.node?.key
        );
        if (data?.length > 0) {
          toast.error("This equipment already exist");
        } else {
          setSelectedItems((prev) => [
            ...prev,
            {
              key: e.node.asset_id,
              label: e.node.label,
              data: e.node,
              hierarchy:
                hierarchyPath ||
                `${e.node.parent?.label || ""} > ${e.node.label}`,
            },
          ]);
        }
      }
    } else {
      toast.error("Please select an equipment item, not a folder.");
    }
  };

  // Toggle all checkboxes when "All Select" is clicked
  const handleSelectAll = (e: any) => {
    const isChecked = e.checked;
    if (isChecked) {
      setEquipmentTypeCheckAll(true);
      setFilterValue((pre: any[] = []) => [...pre, ...allEquipmentId]);
      setCheckedItems([]);
      equipmentName = allEquipmentId;
      setEquipmentLength(allEquipmentId);
    } else {
      setEquipmentTypeCheckAll(false);
      setCheckedItems([]);
      // setFilterValue((prev: any) =>
      //   prev.filter((item: any) => !allEquipmentId.includes(item))
      // );
      setFilterValue((pre: any[] = []) =>
        pre.filter((item: any) => !allEquipmentId.includes(item))
      );
      setEquipmentLength(0);
      equipmentName = [];
    }
  };
  // Handle checkbox change
  const handleCheckboxChange = (itemKey: string, checked: boolean) => {
    setEquipmentTypeCheckAll(false);
    if (checked) {
      equipmentName.push(itemKey);

      setFilterValue((pre: any[] = []) => [...pre, itemKey]);
    } else {
      equipmentName = equipmentName.filter((equi: any) => equi !== itemKey);
      const data = filterValue.filter((equi: any) => equi !== itemKey);
      setFilterValue(data);
    }

    setCheckedItems((prev: string[]) => {
      const newCheckedItems = checked
        ? [...prev, itemKey]
        : prev.filter((key: string) => key !== itemKey);

      if (checkedItems.length === selectedItems.length && !checked) {
        setChecked(false);
      }
      return newCheckedItems;
    });
    getFilterData(
      priorityId,
      equipmentName,
      globalFilterValue,
      originalScheduleData,
      woTypeFilterName
    );

    if (checked && checkedItems.length + 1 === selectedItems.length) {
      setChecked(true);
    } else if (!checked) {
      setChecked(false);
    }
    if (equipmentName?.length > 0) {
      setEquipmentTypeCheckAll(false);
    } else {
      setEquipmentTypeCheckAll(true);
    }
  };

  const getFilterData = async (
    priorityId: any,
    equipmentName: any,
    globalvalue: any,
    updatedSchedule: any,
    woTypeFilterName?: any
  ) => {
    const data: any = updatedSchedule?.filter((f: any) => {
      const priorityMatch = filterValue?.includes(f?.SEVERITY_ID);
      const equipmentMatch = filterValue?.includes(f?.asset_id);
      const woTypeMatch = filterValue?.includes(f?.WO_TYPE_CODE);
      let globalData: any =
        globalvalue !== null ? globalvalue?.toLowerCase()?.trim() : null;

      const globalMatch: any = Object?.values(f)?.some((val: any) =>
        val?.toString()?.toLowerCase()?.includes(globalData)
      );

      let isValid = false;
      if (priorityId?.length > 0 && equipmentName?.length > 0) {
        isValid = equipmentMatch && priorityMatch;
      } else if (
        priorityId?.length > 0 &&
        equipmentName > 0 &&
        globalFilterValue !== null
      ) {
        isValid = equipmentMatch && priorityMatch && globalMatch;
      } else if (priorityId?.length > 0 && globalvalue !== null) {
        isValid = priorityMatch && globalMatch;
      } else if (equipmentName?.length > 0 && globalvalue !== null) {
        isValid = equipmentMatch && globalMatch;
      } else if (globalvalue !== null) {
        isValid = globalMatch;
      } else if (woTypeFilterName?.length > 0) {
        isValid = woTypeMatch;
      } else if (
        priorityId?.length > 0 &&
        equipmentName?.length > 0 &&
        globalvalue !== null &&
        woTypeFilterName?.length !== 0
      ) {
        isValid = equipmentMatch && priorityMatch && globalMatch && woTypeMatch;
      } else if (priorityId?.length > 0 && woTypeFilterName?.length > 0) {
        isValid = priorityMatch && woTypeMatch;
      } else if (equipmentName?.length > 0 && woTypeFilterName?.length > 0) {
        isValid = equipmentMatch && woTypeMatch;
      } else if (woTypeFilterName?.length > 0 && globalvalue !== null) {
        isValid = woTypeMatch && globalMatch;
      } else if (
        priorityId?.length > 0 &&
        equipmentName?.length > 0 &&
        woTypeFilterName?.length > 0
      ) {
        isValid = equipmentMatch && priorityMatch && woTypeMatch;
      } else if (
        priorityId?.length > 0 &&
        woTypeFilterName?.length > 0 &&
        globalvalue !== null
      ) {
        isValid = priorityMatch && woTypeMatch && globalMatch;
      } else if (
        priorityId?.length > 0 &&
        woTypeFilterName?.length > 0 &&
        globalvalue !== null
      ) {
        isValid = priorityMatch && woTypeMatch && globalMatch;
      } else if (priorityId?.length > 0) {
        isValid = priorityMatch;
        //validData
      } else if (equipmentName?.length > 0) {
        isValid = equipmentMatch;
      }
      return isValid;
    });

    if (data?.length > 0) {
      setScheduleData(data);
    } else {
      if (
        (priorityId?.length > 0 ||
          equipmentName > 0 ||
          globalvalue !== null ||
          woTypeFilterName?.length > 0) &&
        data?.length === 0
      ) {
        setScheduleData(data);
      } else {
        setScheduleData(originalScheduleData);
      }
    }
  };
  // const onGlobalFilterChange = async (e) => {
  //   const value = e.target.value;
  //   setGlobalFilterValue(value);

  //   getFilterData(
  //     priorityId,
  //     equipmentName,
  //     e.target.value,
  //     originalScheduleData,
  //     woTypeFilterName
  //   );
  // };

  return (
    <>
      {!showForm ? (
        <section className="w-full">
          <form onSubmit={handleSubmit(onSubmit)}>
            <Card className="fixedContainer">
              <div className="flex justify-between">
                <div>
                  <p className="Helper_Text Menu_Active flex mb-1 flex flex-col">
                    Maintenance /
                  </p>
                  <h6 className="Text_Primary Main_Header_Text mb-1">
                    Scheduled Maintenance
                  </h6>
                  <p className="flex flex-col Helper_Text"></p>
                </div>
                <div>
                  <Buttons
                    className="Primary_Button me-2"
                    label={"Add Schedule"}
                    onClick={() => {
                      sessionStorage.removeItem("selectedAssetFormData");
                      localStorage.setItem("schedulePage", "infraPPM");
                      navigate(PATH?.INFRA_SCHEDULE_ADD, {
                        state: {
                          typewatch: "typewatch",
                          Mode: "add",
                          page: "infraPPM",
                        },
                      });
                      //    navigate(PATH?.INFRA_SCHEDULE_ADD)
                      setShowForm(true);
                    }}
                  />
                </div>
              </div>
            </Card>
            <div className="h-24"></div>
            <Card className="main-component">
              <div className="mt-1 grid grid-cols-1  md:grid-cols-6 lg:grid-cols-6">
                <div className="col-span-2 p-[8px] border-r border-gray-200">
                  <div className="calendar-component">
                    <PrimeCalendar
                      value={startDate}
                      onChange={(e) => {
                        setDate(e.value as Date);
                        onChangeDateCalendar(e);
                      }}
                      onMonthChange={handleMonthChange}
                      showIcon
                      // overlayVisible={visible}
                      onFocus={() => setVisible(true)}
                      onBlur={() => setVisible(false)}
                      className="w-full"
                      dateTemplate={dateTemplate}
                      inline
                    />
                  </div>
                  <div className="px-[20px] py-[12px] flex flex-wrap justify-between">
                    <label className="Text_Primary Header_Text ">
                      Filter By
                    </label>
                    {filterValue?.length > 0 ||
                      globalFilterValue !== null ||
                      checkedItems?.length > 0 ||
                      equipmentTypeCheckAll ? (
                      <Button
                        type="button"
                        label="Reset Filter"
                        onClick={(e) => {
                          setFilterValue([]);
                          equipmentName = [];
                          priorityId = [];
                          woTypeFilterName = [];
                          setCheckedItems([]);
                          setWoTypeCheckAll(false);
                          setPriorityCheckAll(false);
                          setEquipmentTypeCheckAll(false);

                          setGlobalFilterValue(null);
                          setSelectedItems([]);
                          setSelectedCategories([]);
                          setSelectedWoItems([]);

                          // getOptionCall();
                        }}
                      />
                    ) : (
                      <label className="Menu_Active Input_Label ">
                        <i className="pi pi-check me-2"></i>All Selected
                      </label>
                    )}
                  </div>
                  <div className="">
                    <Accordion activeIndex={0}>
                      <AccordionTab
                        header={`Equipment (${equipmentName?.length})`}
                      >
                        <div>
                          <div className="flex align-items-center">
                            <Checkbox
                              inputId="ingredient1"
                              name="pizza"
                              value="Cheese"
                              onChange={handleSelectAll}
                              checked={equipmentTypeCheckAll}
                            />
                            <label htmlFor="ingredient1" className="ml-2">
                              Select All
                            </label>
                          </div>
                          <hr className="w-full border-gray-200 mt-2"></hr>
                          <div className="flex align-items-center">
                            {selectedItems.length === 0 ? (
                              <p></p>
                            ) : (
                              <div className="space-y-2 w-full">
                                {selectedItems.map(
                                  (
                                    item: {
                                      key: string;
                                      label: string;
                                      data: any;
                                      hierarchy?: string;
                                    },
                                    index
                                  ) => (
                                    <div className="flex justify-between items-center w-full">
                                      <div
                                        key={item.key}
                                        className="flex items-center gap-2 mt-2"
                                      >
                                        <Checkbox
                                          inputId={`itemcheckbox-${item.key}`}
                                          checked={checkedItems.includes(
                                            item.key
                                          )}
                                          onChange={(e: any) =>
                                            handleCheckboxChange(
                                              item.key,
                                              e.target.checked
                                            )
                                          }
                                        />
                                        <label
                                          htmlFor={`itemcheckbox-${item.key}`}
                                          className="truncate"
                                          title={item.hierarchy || item.label}
                                        >
                                          {item.hierarchy || item.label}
                                        </label>
                                      </div>
                                      <button
                                        className="flex justify-center items-center mt-2"
                                        onClick={() => {
                                          selectedItems.splice(index, 1);
                                        }}
                                      >
                                        <i
                                          className="pi pi-minus-circle text-red-600"
                                          aria-hidden="true"
                                        ></i>
                                      </button>
                                    </div>
                                  )
                                )}
                              </div>
                            )}
                          </div>
                          <div className="mt-2">
                            <IconField iconPosition="left">
                              {/* <InputIcon className="pi pi-search"> </InputIcon> */}
                              <InputText
                                placeholder="Select Equipment"
                                onClick={(e: any) => showEquipmentlist(true)}
                              />
                            </IconField>
                            <HierarchyDialog
                              showEquipmentlist={showEquipmentlist}
                              visibleEquipmentlist={visibleEquipmentlist}
                              selectedKey={selectedKey}
                              setSelectedKey={setSelectedKey}
                              setValue={setValue}
                              nodes={nodes}
                              filteredData={filteredData}
                              setFilteredData={setFilteredData}
                              setNodes={setNodes}
                              value={filteredData}
                              assetTreeDetails={assetTreeDetails}
                              setAssetTreeDetails={setAssetTreeDetails}
                              onNodeClick={handleNodeClick}
                              hierachyFirstDate={hierachyFirstDate}
                              hierachyLastDate={hierachyLastDate}
                              isCheckbox={false}
                            />
                          </div>
                        </div>
                      </AccordionTab>
                      <AccordionTab header="Type of work">
                        <div className="flex align-items-center">
                          <Checkbox
                            inputId="ingredient1"
                            name="pizza"
                            value="Cheese"
                            onChange={handleWorkTypeSelectAll}
                            // checked={
                            //   // selectedWoItems.length === woTypeValue.length &&
                            //   // woTypeValue.length > 0
                            // }
                            checked={woTypeCheckAll}
                          />
                          <label htmlFor="ingredient1" className="ml-2">
                            Select All
                          </label>
                        </div>
                        <hr className="w-full border-gray-200 mt-2"></hr>
                        <div className="flex flex-col gap-3 mt-2">
                          {woTypeValue.map((typeValue: any) => {
                            let checked: any = selectedWoItems?.includes(
                              typeValue.WO_TYPE_NAME
                            );

                            return (
                              <div className="flex gap-3 w-full justify-between">
                                <div className="flex align-items-center">
                                  <Checkbox
                                    name="category"
                                    value={typeValue.WO_TYPE_NAME}
                                    onChange={(e: any) =>
                                      onCategoryWoChange(e, typeValue)
                                    }
                                    checked={checked}
                                  />
                                  <label
                                    htmlFor={typeValue.WO_TYPE_CODE}
                                    className="ml-2"
                                  >
                                    {typeValue.WO_TYPE_NAME}
                                  </label>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </AccordionTab>
                      <AccordionTab
                        header={`Priority (${priorityList?.length})`}
                      >
                        <div className="flex align-items-center">
                          <Checkbox
                            inputId="ingredient1"
                            name="pizza"
                            value="Cheese"
                            onChange={handlePrioritySelectAll}
                            checked={priorityCheckAll}
                          />
                          <label htmlFor="ingredient1" className="ml-2">
                            Select All
                          </label>
                        </div>
                        <hr className="w-full border-gray-200 mt-2"></hr>
                        <div className="flex flex-col gap-3 mt-2">
                          {priorityList.map((category: any) => {
                            const isChecked = selectedCategories.includes(
                              category.key
                            );

                            return (
                              <div
                                key={category.key}
                                className="flex gap-3 w-full justify-between"
                              >
                                <div className="flex align-items-center">
                                  <Checkbox
                                    inputId={category.key}
                                    name="category"
                                    value={category.key}
                                    onChange={onCategoryChange}
                                    checked={isChecked}
                                  />
                                  <label
                                    htmlFor={category.key}
                                    className="ml-2"
                                  >
                                    {category.name}
                                  </label>
                                </div>
                                <i
                                  className="pi pi-circle-fill mt-2"
                                  style={{ color: category.color }}
                                ></i>
                              </div>
                            );
                          })}
                        </div>
                      </AccordionTab>
                    </Accordion>
                  </div>
                </div>
                <div className="col-span-4">
                  <div>
                    <div className="search-bar mt-4 mr-2 ml-2">
                      <IconField className="search-keyword">
                        <InputText
                          type="search"
                          placeholder="Search keywords"
                          value={globalFilterValue || ""}
                          onChange={(e: any) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                            } else {
                              setGlobalFilterValue(e.target.value || null);
                            }
                          }}
                        />
                      </IconField>
                    </div>
                    <div className="thin-line"></div>
                  </div>
                  {loading ? (
                    //
                    <LoaderShow />
                  ) : (
                    <>
                      <div className="mt-3" style={{ height: "530pt" }}>
                        <DnDCalendar
                          localizer={localizer}
                          view={currentView}
                          date={currentDate}
                          events={scheduleData}
                          allDayMaxRows={7}
                          popup={true}
                          resizable
                          selectable
                          step={15}
                          timeslots={2}
                          min={new Date(0, 0, 0, 1, 0)} // Start at 8:00 AM
                          max={new Date(0, 0, 0, 23, 0)}
                          formats={{
                            timeGutterFormat: timeGutterFormat,
                          }}
                          components={{
                            toolbar: CustomToolbar,
                            timeGutterHeader: CustomTimeGutterHeader,
                            timeSlotWrapper: CustomTimeSlotWrapper,
                            agenda: {
                              event: CustomAgendaEvent,
                              // time: CustomAgendaTime,
                            }, // Works across views including agenda
                          }}
                          eventPropGetter={eventStyleGetter}
                          // view={currentView}
                          views={["month", "week", "day", "agenda"]}
                          onNavigate={handleNavigate}
                          onSelectEvent={(event: any) =>
                            handleSelectedEvent(event)
                          }
                          onEventDrop={onEventDrop}
                          onView={(view) => setCurrentView(view)}
                        // onEventResize={onEventResize}
                        />
                      </div>

                      <InfraPPMScheduleDetails
                        setVisibleSidebar={setVisibleSidebar}
                        visibleSidebar={visibleSidebar}
                        assetTreeDetails={assetTreeDetails}
                        ppmDetails={ppmDetails}
                      />
                    </>
                  )}
                </div>
              </div>
            </Card>
          </form>
        </section>
      ) : (
        <PPMAddForm setShowForm={setShowForm} getOptions={getOptions} />
      )}
    </>
  );
};
// sidebar
const InfraPPMScheduleDetails = ({
  setVisibleSidebar,
  visibleSidebar,
  assetTreeDetails,
  ppmDetails,
}: any) => {
  const navigate = useNavigate();
  const sidebarcustomHeader: any = (
    <div className=" gap-2">
      <p className="Helper_Text Menu_Active">Scheduled Maintenance /</p>
      <h6 className="sidebarHeaderText mb-2">
        {ppmDetails?.length > 0 ? (
          <>
            {
              <>
                {ppmDetails[0]?.REQ_DESC !== null
                  ? ppmDetails[0]?.REQ_DESC
                  : "NA"}
              </>
            }
          </>
        ) : (
          "NA"
        )}
      </h6>
    </div>
  );

  useEffect(() => {
    // Add/remove class from body based on sidebar visibility
    if (visibleSidebar) {
      document.body.classList.add("sidebar-open");
    } else {
      document.body.classList.remove("sidebar-open");
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove("sidebar-open");
    };
  }, [visibleSidebar]);
  return (
    <>
      <Sidebar
        visible={visibleSidebar}
        onHide={() => setVisibleSidebar(false)}
        header={sidebarcustomHeader}
        className={`w-[600px] sidebar${visibleSidebar ? "open" : ""}`}
        position="right"
      >
        <div className="flex flex-col gap-[36px]">
          <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2">
            <div className="">
              <label className="Text_Secondary Helper_Text  ">
                Type of Work
              </label>
              <p className="Text_Primary Alert_Title">
                {ppmDetails?.length > 0 ? (
                  <>
                    {
                      <>
                        {ppmDetails[0]?.WO_TYPE_NAME !== null
                          ? ppmDetails[0]?.WO_TYPE_NAME
                          : "NA"}
                      </>
                    }
                  </>
                ) : (
                  "NA"
                )}
              </p>
            </div>
            <div className="">
              <label className="Text_Secondary Helper_Text  ">Priority</label>
              <p className="Text_Primary Alert_Title">
                {ppmDetails?.length > 0 ? (
                  <>
                    {
                      <>
                        {ppmDetails[0]?.SEVERITY !== null
                          ? ppmDetails[0]?.SEVERITY
                          : "NA"}
                      </>
                    }
                  </>
                ) : (
                  "NA"
                )}
                {/* {ppmDetails[0]?.SEVERITY}  */}
              </p>
            </div>
            <div className="">
              <label className="Text_Secondary Helper_Text  ">
                Date & Time
              </label>
              <p className="Text_Primary Alert_Title">
                {ppmDetails?.length > 0 ? (
                  <>
                    {
                      <>
                        {ppmDetails[0]?.SCHEDULE_DATE !== null
                          ? `${moment(ppmDetails[0]?.SCHEDULE_DATE).format(
                            "DD/MM/YYYY"
                          )} ${ppmDetails[0]?.SCHEDULE_TIME}`
                          : "NA"}
                      </>
                    }
                  </>
                ) : (
                  "NA"
                )}
              </p>
              <p className="Text_Secondary Alert_Title">
                {ppmDetails?.length > 0 ? (
                  <>
                    {
                      <>
                        {ppmDetails[0]?.SCHEDULE_OCCURRENCE !== null
                          ? ppmDetails[0]?.SCHEDULE_OCCURRENCE
                          : "NA"}
                      </>
                    }
                  </>
                ) : (
                  "NA"
                )}
              </p>
            </div>
            <div className="">
              <label className="Text_Secondary Helper_Text  ">Requestor</label>
              <p className="Text_Primary Alert_Title">
                {ppmDetails?.length > 0 && (ppmDetails[0].REQUESTOR_NAME ?? "")}
              </p>
            </div>
            <div className="col-span-2">
              <label className="Text_Secondary Helper_Text  ">
                Description
              </label>
              <p className="Text_Primary Alert_Title">
                {ppmDetails?.length > 0 ? (
                  <>
                    {
                      <>
                        {ppmDetails[0]?.SCHEDULE_DESC !== null
                          ? ppmDetails[0]?.SCHEDULE_DESC
                          : "NA"}
                      </>
                    }
                  </>
                ) : (
                  "NA"
                )}
              </p>
            </div>
          </div>
          <div className="">
            <label className="Text_Primary Header_Text ">
              Equipment Summary:
            </label>

            {assetTreeDetails?.length === 0 ? (
              " NA"
            ) : (
              <div className="flex flex-col gap-6 equpmentContainer">
                <div>
                  <label className="Text_Secondary Helper_Text">
                    Equipment Name
                  </label>
                  <p className="Text_Primary Helper_Text  ">
                    {assetTreeDetails[0]?.ASSET_NAME}
                  </p>
                </div>
                <div>
                  <label className="Text_Secondary Helper_Text">
                    Equipment Type
                  </label>
                  <p className="Text_Primary Helper_Text  ">
                    {assetTreeDetails[0]?.ASSETTYPE_NAME}
                  </p>
                </div>
                <div>
                  <label className="Text_Secondary Helper_Text">Location</label>
                  <p className="Text_Primary Helper_Text  ">
                    {assetTreeDetails[0]?.LOCATION_DESCRIPTION}
                  </p>
                </div>
              </div>
            )}
          </div>
          <div>
            <Button
              type="button"
              label="View Schedule"
              className="Secondary_Button mr-2 "
              onClick={() => {
                navigate(PATH.INFR_PPMSCHEDULEDETAILS, {
                  state: {
                    schedule_id: ppmDetails[0]?.PPM_ID,
                    functionCode: "",
                    assetTreeDetails: assetTreeDetails,
                  },
                });
              }}
            />
            <Button
              type="button"
              label="Edit Schedule"
              className="Primary_Button "
              onClick={() => {
                localStorage.removeItem("Id");
                localStorage.setItem("scheduleId", ppmDetails[0]?.SCHEDULE_ID);
                //    navigate(`${appName}/infraschedule`, { state: { typewatch: typewatch, Mode: Mode } });
                localStorage.setItem("schedulePage", "infraPPM");
                navigate("/assettaskschedulelist?edit=", {
                  state: {
                    typewatch: "typewatch",
                    Mode: "edit",
                    page: "infraPPM",
                  },
                });
              }}
            />
          </div>
        </div>
      </Sidebar>
    </>
  );
};

export default InfraNewPPMSchedule;
