import React, { useEffect, useRef, useState } from "react";
import "../../../components/Table/Table.css";
import "../../../components/Checkbox/Checkbox.css";
import { toast } from "react-toastify";
import { callPostAPI } from "../../../services/apis";
import { ENDPOINTS } from "../../../utils/APIEndpoints";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import { IconField } from "primereact/iconfield";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { useTranslation } from "react-i18next";
import { InputText } from "primereact/inputtext";
import { FilterMatchMode } from "primereact/api";
import { MultiSelect } from "primereact/multiselect";
import { Button } from "primereact/button";
import "../../../components/MultiSelects/MultiSelects.css";
import "../../../components/Input/Input.css";
import Buttons from "../../../components/Button/Button";
import { Paginator } from "primereact/paginator";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import moment from "moment";
import {
  dateFormat,
  formateDate,
  dateFormatDropDownList,
  isOccupantValidityToday,
  LOCALSTORAGE,
  ROLETYPECODE,
} from "../../../utils/constants";
import { Card } from "primereact/card";
import { appName } from "../../../utils/pagePath";
import * as xlsx from "xlsx";
import FileSaver from "file-saver";
import { Dialog } from "primereact/dialog";
import { priorityIconList } from "../../../utils/constants";
import { clearFilters, updateFilter } from "../../../store/filterstore";
import { useDispatch, useSelector } from "react-redux";
import { OverlayPanel } from "primereact/overlaypanel";
import { Checkbox } from "primereact/checkbox";
import { decryptData } from "../../../utils/encryption_decryption";
import LocationHierarchyDialog from "../../../components/HierarchyDialog/LocationHierarchyDialog";
import { useForm } from "react-hook-form";
import LoaderShow from "../../../components/Loader/LoaderShow";
import { truncate } from "fs/promises";
import { deprecate } from "util";

var dateStatus: any = false;
var globalStatus: any = false;
var clear_location: any = false;
var clear_status: any = false;
const WorkOrderMasterInfra = (props: any) => {
  let { pathname } = useLocation();
  const {   } = useTranslation();
  const { search }: any = useLocation();
  const navigate: any = useNavigate();
  const filterGroup = useSelector((state: any) => state.filterGroup);
  const location: any = useLocation();

  const is_Occupant_Validity = isOccupantValidityToday();

  const [DateFilterList, setDateFilterList] = useState<any | null>([]);
  const filterDefaultValues: any = {
    ASSIGN_NAME: { value: null, matchMode: FilterMatchMode.IN },
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    WO_TYPE: { value: null, matchMode: FilterMatchMode.IN },
    SUB_STATUS_DESC: { value: null, matchMode: FilterMatchMode.IN },
    LOCATION_DESCRIPTION: { value: null, matchMode: FilterMatchMode.IN },
    SEVERITY: { value: null, matchMode: FilterMatchMode.IN },
    TEAMNAME: { value: null, matchMode: FilterMatchMode.IN },
    WO_NO: { value: null, matchMode: FilterMatchMode.IN },
    STATUS_DESC: { value: null, matchMode: FilterMatchMode.IN },
    REPORTED_NAME: { value: null, matchMode: FilterMatchMode.IN },
    WO_DATE: { value: null, matchMode: FilterMatchMode.IN },
    WO_START: { value: null, matchMode: FilterMatchMode.IN },
    WO_END: { value: null, matchMode: FilterMatchMode.IN },
  };

  console.log(clear_status, "clear_status");
  const [selectedFacility, menuList]: any = useOutletContext();
  const currentMenu = menuList
    ?.flatMap((menu: any) => menu?.DETAIL)
    .filter((detail: any) => detail.URL === pathname)[0];

  const currentWorkOrderRights = menuList
    ?.flatMap((menu: any) => menu?.DETAIL)
    .filter((detail: any) => {
      return detail.URL === "/workorderlist";
    })[0];
  console.log(currentWorkOrderRights, "currentWorkOrderRights");
  // const menuData:any=localStorage.getItem("currentMenu");
  //  const currentMenu1 = JSON.parse(menuData);
  let tableHeader: any = props?.tableHeader?.headerName !== "User Role Master";
  const [clearLocation, setClearLocation] = useState<any>(false);
  const dispatch: any = useDispatch();
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(15);
  const [statusData, setStautusData] = useState<any>([]);
  const [statusResponse, setStatusReponse] = useState<any | null>([]);
  const [showLoader, setShowLoader] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<any[]>([]);
  const [caseTypeFilter, setCaseTypeFilter] = useState<any>([]);
  const [locationFilter, setLocationFilter] = useState<any>([]);
  const [assigneeFilter, setAssigneeFilter] = useState<any>([]);
  const [statusDatas, setStatusDatas] = useState<any | null>("");
  const [selectedDate, setSelectedDate] = useState<any | null>(null);
  const [selectedCustomeDate, setSelectedCustome] = useState<boolean>(false);
  const [filterData, setFilterData] = useState<any | null>([]);
  const [dateWO, setWODate] = useState(null);
  const [filters, setFilters] = useState(filterDefaultValues);
  const [subStatusData, setSubStatusData] = useState<any>([]);
  const [workOrderDateFilter, setWorkOrderDateFilter] = useState<any | null>(
    []
  );
  const [locationName, setLocationName] = useState<any>(null);
  const [globalFilterValue, setGlobalFilterValue] = useState<any | null>(null);
  const [firstDateSelected, setFirstDateSelected] = useState<boolean>(false);
  const [minDate, setMinDate] = useState<any | null>(null);
  const [fromDate, setFromDate] = useState<any>(null);
  const [toDate, setToDate] = useState<any>(null);
  const [pageCount, setPageCount] = useState<any>(0);
  const [customRangeStatus, setCustomRangeStatus] = useState<any | null>(false);
  const [priorityFilter, setPriorityFilter] = useState<any | null>([]);
  const [teamNameFilter, setTeamNameFilter] = useState<any | null>([]);
  const [tableData, setTableData] = useState<any>([]);
  const [filterDropDownData, setFilterDropDownData] = useState<any>([]);
  const [reportedBy, setReportedBy] = useState<any | null>([]);
  const [resetStatus, setResetStatus] = useState<any | null>(true);
  const [statusListCount, setstatusListCount] = useState<any | null>([]);
  const topScrollRef = useRef<any | null>(null);
  const bottomScrollRef = useRef<any | null>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [subStatusLabel, setSubStatusLabel] = useState<any | null>([]);
  const [scrollWidth, setScrollWidth] = useState("100%");
  const [customResetDate, setCustomResetDate] = useState<any | null>(false);
  const [visibleEquipmentlist, showEquipmentlist] = useState(false);
  const [selectedKey, setSelectedKey] = useState<any>(null);
  const [nodes, setNodes] = useState<any[]>([]);
  const [locationFilteredData, setLocationFilteredData] = useState<any[]>([]);
  const [locationResetStatus, setLocationResetStatus] = useState<any>(false);
  // Function to synchronize scroll positions
  const syncScroll = (source: any, targets: any) => {
    if (source.current) {
      const scrollLeft = source.current.scrollLeft;
      targets.forEach((target: any) => {
        if (target.current) {
          target.current.scrollLeft = scrollLeft;
        }
      });
    }
  };

  const FACILITY: any = localStorage.getItem("FACILITYID");
  const FACILITYID: any = JSON.parse(FACILITY);
  const op = useRef<any | null>(null);

  if (FACILITYID) {
    var facility_type: any = FACILITYID?.FACILITY_TYPE;
  }

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
      LOCATIONID: "",
      EQUIPMENT_NAME: "",
    },
    mode: "all",
  });
  const DataDateLocalStorage: any = localStorage.getItem("DateData");
  const Data_Date: any = JSON.parse(DataDateLocalStorage);
  const transformStatusData = (data: any) => {
    const grouped: any = {};
    data.forEach(
      ({
        MAIN_STATUS,
        MAIN_STATUS_DESC,
        SUB_STATUS_DESC,
        STATUS_CODE,
      }: any) => {
        const mainKey: any = MAIN_STATUS;
        const mainLabel = MAIN_STATUS_DESC.trim();
        const subLabel = SUB_STATUS_DESC.trim();
        if (!grouped[mainKey]) {
          grouped[mainKey] = {
            label: mainLabel,
            MAIN_STATUS: mainKey,
            items: [],
            seen: new Set(), // to avoid duplicate sub labels
          };
        }
        const group = grouped[mainKey];
        if (!group.seen.has(subLabel)) {
          group.items.push({
            label: subLabel,
            value: subLabel,
            STATUS_CODE: STATUS_CODE,
            ISChecked: false,
          });
          group.seen.add(subLabel);
        }
      }
    );
    return Object.values(grouped).map(({ seen, ...group }: any) => group);
  };

  const statusColor = (element: any) => {
    const baseStatus = element?.split(" (Re-open)")[0];
    let data: any = localStorage.getItem("statusColorCode");
    const dataColor: any = JSON.parse(data);
    return dataColor.find((item: any) => item.STATUS_DESC === baseStatus)
      ?.COLORS;
  };
  const formatServiceRequestList = (list: any) => {
    let WORK_ORDER_LIST = list;
    WORK_ORDER_LIST = WORK_ORDER_LIST.map((element: any) => {
      return {
        WO_CREATED_TIME:
          pathname === "/servicerequestlist"
            ? formateDate(element.SERVICE_CREATED_TIME)
            : element.WO_REPORTED_AT !== null
            ? formateDate(element.WO_REPORTED_AT || element.WO_CREATED_TIME)
            : "",
        WO_CREATED: moment(element?.WO_REPORTED_AT).format(dateFormat()),
        WO_TYPE: element?.WO_TYPE,
        STATUS_COLOURS: statusColor(element?.STATUS_DESC),
        SEVERITY: element?.SEVERITY,
        SER_REQ_NO:
          pathname === "/servicerequestlist" ? element?.SER_REQ_NO : "",
        WO_NO: element?.WO_NO,
        LOCATION_NAME: element?.LOCATION_NAME,
        LOCATION_DESCRIPTION: element?.LOCATION_DESCRIPTION,
        STATUS_DESC: element?.STATUS_DESC,
        ASSIGN_NAME: element?.ASSIGN_NAME,
        WO_TYPE_NAME: element?.WO_TYPE_NAME,
        WO_GROUP_REQ:
          facility_type === "I"
            ? element?.GROUP_ISSUE
            : `${element?.ASSETGROUP_NAME}>${element?.REQ_DESC}`,
        WO_ID: element?.WO_ID,
        PRIORITY_COLOURS: element?.COLORS,
        DESCRIPTION: element.DESCRIPTION,
        TEAMNAME: element?.TEAM_NAME,
        SUB_STATUS_DESC: element?.SUB_STATUS_DESC,
        ICON_ID: element?.ICON_ID,
        REPORTED_NAME: element?.RAISED_BY_NAME,
        FUNCTION_CODE: pathname === "/servicerequestlist" ? "HD004" : "HD001",
      };
      // }
    });

    return WORK_ORDER_LIST;
  };

  const getFilterListData = async (
    pageData: any,
    startDate?: any,
    end?: any,
    clearStatus?: any
  ) => {
    const payload = {
      SEARCH_TEXT:
        globalStatus == true
          ? ""
          : globalFilterValue !== null
          ? globalFilterValue
          : null,
      FROM_DATE:
        location?.state === "workorder"
          ? filterGroup?.WO_START?.value
          : dateStatus === true
          ? null
          : fromDate !== null
          ? fromDate
          : startDate !== null
          ? startDate
          : null,
      TO_DATE:
        location?.state === "workorder"
          ? filterGroup?.WO_END?.value
          : dateStatus === true
          ? null
          : toDate !== null
          ? toDate
          : toDate !== null
          ? toDate
          : null,
      WO_TYPE_LIST:
        location?.state === "workorder"
          ? filterGroup?.WO_TYPE?.value
          : caseTypeFilter?.length > 0
          ? filters?.WO_TYPE?.value
          : [],
      PRIORITY_LIST:
        location?.state === "workorder"
          ? filterGroup?.SEVERITY?.value
          : priorityFilter?.length > 0
          ? filters?.SEVERITY?.value
          : [],
      ASSIGNEE_LIST:
        location?.state === "workorder"
          ? filterGroup?.ASSIGN_NAME?.value
          : assigneeFilter?.length > 0
          ? filters?.ASSIGN_NAME?.value
          : [],
      TEAM_LIST:
        location?.state === "workorder"
          ? filterGroup?.TEAM_ID?.value
          : teamNameFilter?.length > 0
          ? filters?.TEAMNAME?.value
          : [],
      SUB_STATUS_LIST:
        clear_status === true
          ? []
          : location?.state === "workorder"
          ? filterGroup?.SUB_STATUS_DESC?.value
          : subStatusData?.length > 0
          ? subStatusData
          : [],
      PAGE_NUMBER: pageData?.PAGE_NUMBER,
      PAGE_SIZE: pageData?.PAGE_SIZE,
      LOCATION_LIST:
        location?.state === "workorder"
          ? filterGroup?.LOCATION_DESCRIPTION?.value
          : locationFilter?.length > 0
          ? filters?.LOCATION_DESCRIPTION?.value
          : [],
      REPORTER_LIST:
        location?.state === "workorder"
          ? filterGroup?.REPORTED_NAME?.value
          : reportedBy?.length > 0
          ? filters?.REPORTED_NAME?.value
          : [],
      STATUS_LIST:
        location?.state === "workorder"
          ? filterGroup?.STATUS_DESC?.value
          : statusFilter?.length > 0
          ? filters?.STATUS_DESC?.value
          : [],
      TYPE: "FILTER",
    };
    setShowLoader(true);
    console.log("payload", payload);

    try {
      const res: any = await callPostAPI(
        ENDPOINTS.FILTER_GET_API_LIST,
        payload,
        currentMenu?.FUNCTION_CODE
      );
      if (res?.FLAG === 1) {
        if (
          teamNameFilter?.length === 0 &&
          assigneeFilter?.length === 0 &&
          reportedBy?.length === 0 &&
          caseTypeFilter?.length === 0 &&
          priorityFilter?.length === 0 &&
          statusFilter?.length === 0 &&
          globalFilterValue === ""
        ) {
          console.log(1111);
          if (clear_location === true || clear_status === true) {
            console.log(2222);
            setResetStatus(true);
            setCustomRangeStatus(false);
          }
        }
        setPageCount(res?.WOLIST[0]?.TOTAL_COUNT);
        setstatusListCount(res?.COUNTLIST);

        const updatedList =
          res?.WOLIST?.length > 0 ? formatServiceRequestList(res?.WOLIST) : [];
        if (res?.WOLIST?.length > 0) {
          setRows(15);
          setFirst(0);
        }
        setTableData(updatedList);
        setShowLoader(false);
      } else {
        setTableData([]);
        setShowLoader(false);
      }
    } catch (error: any) {
      setShowLoader(false);
    } finally {
      setShowLoader(false);
    }
  };

  async function getDashboardMasterDetails() {
    try {
      const res = await callPostAPI(ENDPOINTS.GET_DASHBOARD_MASTER, {}, null);
      const responeDate: any = dateFormatDropDownList(res?.DATEFILTERLIST);
      setDateFilterList(responeDate);
    } catch (error: any) {
      toast.error(error);
    }
  }
  const getAPI = async () => {
    // setShowLoader(true);
    try {
      getDashboardMasterDetails();
      let functionCode: any =
        pathname === "/servicerequestlist" ? "HD004" : "HD001";
      const responseFilter: any = await callPostAPI(
        ENDPOINTS.FILTER_GET_API,
        {},
        functionCode
      );
      if (responseFilter?.FLAG === 1) {
        const filteredStatuses = responseFilter?.WOSTATUSLIST?.filter(
          (status: any) =>
            status.STATUS_CODE !== 11 && status.STATUS_CODE !== 12
        );

        setStatusDatas(filteredStatuses);
        setFilterDropDownData(responseFilter);

        if (location?.state === null) {
          dispatch(clearFilters());
          setResetStatus(true);
        } else {
          if (
            filterGroup?.LOCATION_DESCRIPTION?.value !== null ||
            filterGroup?.STATUS_DESC?.value !== null ||
            filterGroup?.REPORTED_NAME?.value !== null ||
            filterGroup?.ASSIGN_NAME?.value !== null ||
            filterGroup?.WO_TYPE?.value !== null ||
            filterGroup?.WO_DATE?.value !== null ||
            filterGroup?.TEAM_ID?.value !== null ||
            filterGroup?.SEVERITY?.value !== null ||
            filterGroup?.SUB_STATUS_DESC?.value !== null
          ) {
            //     const matchedsubStatus =  filterGroup?.SUB_STATUS_DESC?.value?.map((idObj:any) =>
            //   responseFilter?.STATUSLIST.find((loc:any) => loc.STATUS_CODE === idObj.STATUS_CODE)
            // );
            const statusCodes = filterGroup?.SUB_STATUS_DESC?.value?.map(
              (item: any) => item.STATUS_CODE
            );
            const updatedData = statusData.map((group: any) => ({
              ...group,
              items: group.items.map((item: any) => ({
                ...item,
                ISChecked: statusCodes.includes(item.STATUS_CODE),
              })),
            }));

            setStautusData(updatedData);

            const matchedDepartment = filterGroup?.TEAM_ID?.value?.map(
              (idObj: any) =>
                responseFilter?.TEAMLIST.find(
                  (loc: any) => loc.TEAM_ID === idObj.TEAM_ID
                )
            );
            setTeamNameFilter(matchedDepartment);
            const matchedPriority = filterGroup?.SEVERITY?.value?.map(
              (idObj: any) =>
                responseFilter?.PRIORITYLIST.find(
                  (loc: any) => loc.SEVERITY_ID === idObj.SEVERITY_ID
                )
            );
            setPriorityFilter(matchedPriority);
            const matchedLocations =
              filterGroup?.LOCATION_DESCRIPTION?.value?.map((idObj: any) =>
                responseFilter?.LOCATIONLIST.find(
                  (loc: any) => loc.LOCATION_ID === idObj.LOCATION_ID
                )
              );

            setResetStatus(false);

            setLocationFilter(matchedLocations);
            const matchedStatus = filterGroup?.STATUS_DESC?.value?.map(
              (idObj: any) =>
                responseFilter?.WOSTATUSLIST.find(
                  (loc: any) => loc.STATUS_CODE === idObj.STATUS_CODE
                )
            );
            setStatusFilter(matchedStatus);

            const matchedAssignee = filterGroup?.ASSIGN_NAME?.value?.map(
              (idObj: any) =>
                responseFilter?.ASSIGNEELIST.find(
                  (loc: any) => loc.USER_ID === idObj.USER_ID
                )
            );
            setAssigneeFilter(matchedAssignee);
            const matchedReporter = filterGroup?.REPORTED_NAME?.value?.map(
              (idObj: any) =>
                responseFilter?.REPORTERLIST.find(
                  (loc: any) => loc.USER_ID === idObj.USER_ID
                )
            );
            setReportedBy(matchedReporter);
            const matchedWoType = filterGroup?.WO_TYPE?.value?.map(
              (idObj: any) =>
                responseFilter?.WOTYPELIST.find(
                  (loc: any) => loc.WO_TYPE_CODE === idObj.WO_TYPE_CODE
                )
            );
            setCaseTypeFilter(matchedWoType);

            setWorkOrderDateFilter(filterGroup.WO_DATE.value);
            setCustomRangeStatus(true);
            setSelectedDate(filterGroup.WO_DATE.value);
            if (filterGroup?.WO_DATE?.value?.DATE_DESC === "Custom") {
              const data: any = [];
              data.push(new Date(filterGroup?.WO_START?.value));
              data.push(new Date(filterGroup?.WO_END?.value));

              setWODate(data);
            }
            setFilters(filterGroup);
          }
        }
        const statusOptions1 = transformStatusData(responseFilter?.STATUSLIST);
        setStautusData(statusOptions1);
        setStatusReponse(responseFilter?.STATUSLIST);
        setShowLoader(false);
      } else {
        setFilterDropDownData([]);
        setStautusData([]);
        setShowLoader(false);
      }
      await getFilterListData({ PAGE_NUMBER: 1, PAGE_SIZE: 15 });
    } catch (error: any) {
      toast.error(error);
      setShowLoader(false);
    } finally {
      setShowLoader(false);
    }
  };

  const handlerServiceRequest = () => {
    navigate(`${appName}/servicerequestlist?add=`);
  };

  const handleCaseTypeFilter = (e: any) => {
    if (fromDate === null && toDate === null) {
      setSelectedDate(null);
    }
    setCustomRangeStatus(true);
    setSelectedCustome(false);
    setCustomResetDate(false);
    let value: any = e;
    setCaseTypeFilter(value);
    const caseTypeIds = value.map((user: any) => {
      return { WO_TYPE_CODE: user.WO_TYPE_CODE };
    });
    value = caseTypeIds;
    setFilters((prev: any) => {
      return {
        ...prev,
        WO_TYPE: { value, matchMode: FilterMatchMode.IN },
      };
    });
    setResetStatus(false);
    dispatch(updateFilter({ key: "WO_TYPE", value }));
  };

  const onGlobalFilterChange = (e: any) => {
    globalStatus = false;
    setSelectedCustome(false);
    setCustomResetDate(false);
    if (fromDate === null && toDate === null) {
      setSelectedDate(null);
    }
    setCustomRangeStatus(true);
    const value = e.target.value;
    let _filters = { ...filters };

    _filters["global"].value = value;

    setFilters(_filters);
    setGlobalFilterValue(value);
    setResetStatus(false);
    dispatch(updateFilter({ key: "global", value }));
  };

  const handleStatusFilter = (e: any, selectedOption: any) => {
    if (fromDate === null && toDate === null) {
      setSelectedDate(null);
    }
    setCustomRangeStatus(true);
    setSelectedCustome(false);
    setCustomResetDate(false);
    let value: any = e;
    if (facility_type === "I") {
      setStatusFilter(value);
      setCustomRangeStatus(true);

      const dataStatusCode = statusResponse
        .filter(
          (status: any) => status.SUB_STATUS_DESC === selectedOption?.label
        )
        .map(({ STATUS_CODE }: any) => ({ STATUS_CODE }));
      const dataStatusCode1 = statusResponse
        .filter(
          (status: any) => status.SUB_STATUS_DESC === selectedOption?.label
        )
        .map(({ STATUS_CODE }: any) => ({ STATUS_CODE }));
      setSubStatusData((prev: any) => [...prev, ...dataStatusCode]);
      setFilters((prev: any) => {
        return {
          ...prev,
          SUB_STATUS_DESC: { value, matchMode: FilterMatchMode.IN },
        };
      });
      value = dataStatusCode;
      dispatch(updateFilter({ key: "SUB_STATUS_DESC", value }));
      setResetStatus(false);
    } else {
      setStatusFilter(value);
      const caseTypeIds = value.map((user: any) => {
        return { STATUS_CODE: user.STATUS_CODE };
      });
      value = caseTypeIds;
      setFilters((prev: any) => {
        return {
          ...prev,
          STATUS_DESC: { value, matchMode: FilterMatchMode.IN },
        };
      });
      setResetStatus(false);
      dispatch(updateFilter({ key: "STATUS_DESC", value }));
    }
  };
  const handleAssigneeFilter = (value: any) => {
    if (fromDate === null && toDate === null) {
      setSelectedDate(null);
    }
    setCustomRangeStatus(true);
    setSelectedCustome(false);
    setCustomResetDate(false);
    setAssigneeFilter(value);
    const assignIds = value.map((user: any) => {
      return { USER_ID: user?.USER_ID };
    });
    value = assignIds;
    setFilters((prev: any) => {
      return {
        ...prev,
        ASSIGN_NAME: { value, matchMode: FilterMatchMode.IN },
      };
    });
    setResetStatus(false);
    dispatch(updateFilter({ key: "ASSIGN_NAME", value }));
  };

  const handlePriorityFilter = (e: any) => {
    if (fromDate === null && toDate === null) {
      setSelectedDate(null);
    }
    setCustomRangeStatus(true);
    setSelectedCustome(false);
    setCustomResetDate(false);
    let value: any = e;
    setPriorityFilter(value);
    setResetStatus(false);
    const severityIds = value.map((user: any) => {
      return { SEVERITY_ID: user.SEVERITY_ID };
    });
    value = severityIds;
    setFilters((prev: any) => {
      return {
        ...prev,
        SEVERITY: { value, matchMode: FilterMatchMode.IN },
      };
    });
    dispatch(updateFilter({ key: "SEVERITY", value }));
  };

  const handleDepartmentFilter = (e: any) => {
    if (fromDate === null && toDate === null) {
      setSelectedDate(null);
    }
    setCustomRangeStatus(true);
    setSelectedCustome(false);
    setCustomResetDate(false);
    setResetStatus(false);
    let value: any = e;
    setTeamNameFilter(value);
    const teamIds: any = value.map((user: any) => {
      return { TEAM_ID: user.TEAM_ID };
    });
    value = teamIds;
    setFilters((prev: any) => {
      return {
        ...prev,
        TEAMNAME: { value, matchMode: FilterMatchMode.IN },
      };
    });

    dispatch(updateFilter({ key: "TEAM_ID", value }));
  };
  const handleReporterFilter = (value: any) => {
    if (fromDate === null && toDate === null) {
      setSelectedDate(null);
    }
    setCustomRangeStatus(true);
    setSelectedCustome(false);
    setCustomResetDate(false);
    setReportedBy(value);
    setResetStatus(false);
    const reporterIds = value.map((user: any) => {
      return { USER_ID: user?.USER_ID };
    });
    value = reporterIds;
    setFilters((prev: any) => {
      return {
        ...prev,
        REPORTED_NAME: { value, matchMode: FilterMatchMode.IN },
      };
    });
    dispatch(updateFilter({ key: "REPORTED_NAME", value }));
  };

  const handleLocationFilter = (value: any) => {
    if (fromDate === null && toDate === null) {
      setSelectedDate(null);
    }
    if (value?.lenght > 0) {
    }
    setCustomRangeStatus(true);
    setSelectedCustome(false);
    setCustomResetDate(false);
    setLocationFilter(value);
    const locationIds = value.map((user: any) => {
      return { LOCATION_ID: user?.LOCATION_ID };
    });

    value = locationIds;
    setFilters((prev: any) => {
      return {
        ...prev,
        LOCATION_DESCRIPTION: { value, matchMode: FilterMatchMode.IN },
      };
    });
    setResetStatus(false);
    setLocationResetStatus(false);
    dispatch(updateFilter({ key: "LOCATION_DESCRIPTION", value }));
  };

  const clearLocationFilter = async (location: any) => {
    let value: any = null;
    setFilters((prev: any) => {
      return {
        ...prev,
        LOCATION_DESCRIPTION: { value, matchMode: FilterMatchMode.IN },
      };
    });
    if (
      teamNameFilter?.length > 0 ||
      assigneeFilter?.length > 0 ||
      reportedBy?.length > 0 ||
      caseTypeFilter?.length > 0 ||
      priorityFilter?.length > 0
    ) {
      setLocationFilter(location);

      // clear_location = true;
    } else {
      setLocationFilter(location);

      dispatch(updateFilter({ key: "LOCATION_DESCRIPTION", value }));
      // clear_location = true;
    }
  };

  console.log(clear_location, "clear_location");
  const tableHeaderFun: any = () => {
    //------------Date Custome Range Event-------------------

    const panelFooterTemplate = (handleValue: any) => {
      return (
        <div className="py-2 px-3">
          <label
            onClick={() => {
              handleValue([]);
              if (tableData?.length === 0) {
                setTableData(filterData);
              }
            }}
          >
            Clear Selection
          </label>
        </div>
      );
    };

    const statusCountMap: { [key: string]: number } = {};

    statusListCount.forEach((item: any) => {
      const key = (item.STATUS_DESC ?? "Unknown").trim();
      if (statusCountMap[key]) {
        statusCountMap[key] += item.COUNT;
      } else {
        statusCountMap[key] = item.COUNT;
      }
    });

    const handlerCustomDateRange = async () => {
      setResetStatus(false);

      setFromDate(null);
      setToDate(null);
      dateStatus = false;
      if (dateWO !== null) {
        if (dateWO[0] !== null && dateWO[1] !== null) {
          setFromDate(moment(dateWO[0]).format("YYYY-MM-DD"));
          setToDate(moment(dateWO[1]).format("YYYY-MM-DD"));
          setSelectedCustome(false);
          let value = moment(dateWO[0]).format("YYYY-MM-DD");
          setFilters((prev: any) => {
            return {
              ...prev,
              WO_START: { value, matchMode: FilterMatchMode.IN },
            };
          });
          value = moment(dateWO[1]).format("YYYY-MM-DD");
          setFilters((prev: any) => {
            return {
              ...prev,
              WO_END: { value, matchMode: FilterMatchMode.IN },
            };
          });
          dispatch(
            updateFilter({
              key: "WO_START",
              value: moment(dateWO[0]).format("YYYY-MM-DD"),
            })
          );
          dispatch(
            updateFilter({
              key: "WO_END",
              value: moment(dateWO[1]).format("YYYY-MM-DD"),
            })
          );
          const payload = {
            SEARCH_TEXT:
              globalStatus == true
                ? ""
                : globalFilterValue !== null
                ? globalFilterValue
                : null,
            FROM_DATE: moment(dateWO[0]).format("YYYY-MM-DD"),
            TO_DATE: moment(dateWO[1]).format("YYYY-MM-DD"),
            WO_TYPE_LIST:
              filterGroup?.WO_TYPE?.value !== null
                ? filterGroup?.WO_TYPE?.value
                : caseTypeFilter?.length > 0
                ? filters?.WO_TYPE?.value
                : [],
            PRIORITY_LIST:
              priorityFilter?.length > 0 ? filters?.SEVERITY?.value : [],
            ASSIGNEE_LIST:
              filterGroup?.ASSIGN_NAME?.value !== null
                ? filterGroup?.ASSIGN_NAME?.value
                : assigneeFilter?.length > 0
                ? filters?.ASSIGN_NAME?.value
                : [],
            TEAM_LIST:
              teamNameFilter?.length > 0 ? filters?.TEAMNAME?.value : [],
            SUB_STATUS_LIST: subStatusData?.length > 0 ? subStatusData : [],
            PAGE_NUMBER: 1,
            PAGE_SIZE: 15,
            LOCATION_LIST:
              filterGroup?.LOCATION_DESCRIPTION?.value !== null
                ? filterGroup?.LOCATION_DESCRIPTION?.value
                : locationFilter?.length > 0
                ? filters?.LOCATION_DESCRIPTION?.value
                : [],
            REPORTER_LIST:
              filterGroup?.REPORTED_NAME?.value !== null
                ? filterGroup?.REPORTED_NAME?.value
                : reportedBy?.length > 0
                ? filters?.REPORTED_NAME?.value
                : [],
            STATUS_LIST:
              statusFilter?.length > 0 ? filters?.STATUS_DESC?.value : [],
            TYPE: "FILTER",
          };

          const res: any = await callPostAPI(
            ENDPOINTS.FILTER_GET_API_LIST,
            payload,
            currentMenu?.FUNCTION_CODE
          );
          if (res?.FLAG === 1) {
            setPageCount(res?.WOLIST[0]?.TOTAL_COUNT);

            const updatedList = formatServiceRequestList(res?.WOLIST);
            setTableData(updatedList);
          } else {
            setTableData([]);
          }
        } else {
          toast.error("Please select date range");
        }
      } else {
        toast.error("Please select date range");
      }
    };

    const clearSelection = async (e: any) => {
      e.preventDefault();
      clear_status = true;
      const updatedStatusData: any = statusData?.map((group: any) => ({
        ...group,
        items: group?.items?.map((item: any) => ({
          ...item,
          ISChecked: false,
        })),
      }));

      setStautusData(updatedStatusData);
      setSubStatusLabel([]);
      setSubStatusData([]);
      // if (
      //   teamNameFilter?.length > 0 ||
      //   caseTypeFilter?.lenght > 0 ||
      //   assigneeFilter?.length > 0 ||
      //   reportedBy?.length > 0 ||
      //   locationFilter?.length > 0
      // ) {
      //   setCustomRangeStatus(true);
      //   setResetStatus(false);
      //   await getFilterListData({ PAGE_NUMBER: 1, PAGE_SIZE: 15 });
      // } else {
      //   setCustomRangeStatus(false);
      //   setResetStatus(true);
      //   await getFilterListData({ PAGE_NUMBER: 1, PAGE_SIZE: 15 });
      // }
    };

    var hasActiveFilters =
      workOrderDateFilter?.length > 0 ||
      caseTypeFilter?.length > 0 ||
      statusFilter?.length > 0 ||
      priorityFilter?.length > 0 ||
      teamNameFilter?.length > 0 ||
      globalFilterValue !== null ||
      reportedBy?.length > 0;

    const resetFilters = async () => {
      setCustomResetDate(false);
      dispatch(clearFilters());
      setReportedBy([]);
      setClearLocation(true);
      setCaseTypeFilter([]);
      setLocationFilter([]);
      setStatusFilter([]);
      setPriorityFilter([]);
      setTeamNameFilter([]);
      setSubStatusData([]);
      setSelectedCustome(false);
      setAssigneeFilter([]);
      setLocationResetStatus(true);
      setWorkOrderDateFilter([]);
      setSelectedDate(null);
      setLocationName(null);

      getLocationLabel();
      let value: any = null;
      setCustomRangeStatus(false);
      setWODate(null);
      setGlobalFilterValue("");
      setSubStatusLabel([]);
      // let value:any=null;
      setFilters((prev: any) => {
        return {
          ...prev,
          ASSIGN_NAME: { value: null, matchMode: FilterMatchMode.IN },
          global: { value: null, matchMode: FilterMatchMode.CONTAINS },
          WO_TYPE: { value: null, matchMode: FilterMatchMode.IN },
          SUB_STATUS_DESC: { value: null, matchMode: FilterMatchMode.IN },
          LOCATION_DESCRIPTION: { value: null, matchMode: FilterMatchMode.IN },
          SEVERITY: { value: null, matchMode: FilterMatchMode.IN },
          TEAMNAME: { value: null, matchMode: FilterMatchMode.IN },
          WO_NO: { value: null, matchMode: FilterMatchMode.IN },
          STATUS_DESC: { value: null, matchMode: FilterMatchMode.IN },
          REPORTED_NAME: { value: null, matchMode: FilterMatchMode.IN },
          WO_DATE: { value: null, matchMode: FilterMatchMode.IN },
          WO_START: { value: null, matchMode: FilterMatchMode.IN },
          WO_END: { value: null, matchMode: FilterMatchMode.IN },
        };
      });

      setFromDate(null);
      setToDate(null);
      setFilters({ ...filters });
      dispatch(updateFilter({ key: "ASSIGN_NAME", value: null }));
      dispatch(updateFilter({ key: "global", value: null }));
      dispatch(updateFilter({ key: "WO_TYPE", value: null }));
      dispatch(updateFilter({ key: "WO_START", value: null }));
      dispatch(updateFilter({ key: "SUB_STATUS_DESC", value: null }));
      dispatch(updateFilter({ key: "LOCATION_DESCRIPTION", value: null }));
      dispatch(updateFilter({ key: "SEVERITY", value: null }));
      dispatch(updateFilter({ key: "TEAMNAME", value: null }));
      dispatch(updateFilter({ key: "WO_NO", value: null }));
      dispatch(updateFilter({ key: "REPORTED_NAME", value: null }));
      dispatch(updateFilter({ key: "WO_END", value: null }));
      dispatch(updateFilter({ key: "STATUS_DESC", value: null }));
      dispatch(updateFilter({ key: "WO_DATE", value: null }));
      const updatedStatusData: any = statusData?.map((group: any) => ({
        ...group,
        items: group?.items?.map((item: any) => ({
          ...item,
          ISChecked: false,
        })),
      }));

      setStautusData(updatedStatusData);
      const payload = {
        SEARCH_TEXT: null,
        FROM_DATE: null,
        TO_DATE: null,
        WO_TYPE_LIST: [],
        PRIORITY_LIST: [],
        ASSIGNEE_LIST: [],
        TEAM_LIST: [],
        SUB_STATUS_LIST: [],
        PAGE_NUMBER: 1,
        PAGE_SIZE: 15,
        LOCATION_LIST: [],
        REPORTER_LIST: [],
        STATUS_LIST: [],
        TYPE: "FILTER",
      };

      const res: any = await callPostAPI(
        ENDPOINTS.FILTER_GET_API_LIST,
        payload,
        currentMenu?.FUNCTION_CODE
      );
      if (res?.FLAG === 1) {
        setPageCount(res?.WOLIST[0]?.TOTAL_COUNT);
        const updatedList = formatServiceRequestList(res?.WOLIST);
        setTableData(updatedList);
      } else {
        setTableData([]);
      }

      if (pathname === "/servicerequestlist") {
        navigate("/servicerequestlist", { state: null });
      } else {
        //  navigate("/workorderlist",{state:null})
      }

      dateStatus = true;
      globalStatus = true;
      hasActiveFilters = false;
      //  await getAPI();

      setResetStatus(true);
      // window.location.reload();
    };

    const onStatusChange = (e: any, item: any) => {
      const { value, checked } = e.target;
      setCustomRangeStatus(true);
      if (checked === true) {
        const dataStatusCode = statusResponse
          .filter((status: any) => status.SUB_STATUS_DESC === item?.label)
          .map(({ STATUS_CODE }: any) => ({ STATUS_CODE }));
        const seen = new Set();
        const dataStatusCode1 = statusResponse
          .filter((status: any) => status.SUB_STATUS_DESC === item?.label)
          .map(({ SUB_STATUS_DESC }: any) => ({ SUB_STATUS_DESC }))
          .filter((item: any) => {
            const duplicate = seen.has(item.SUB_STATUS_DESC);
            seen.add(item.SUB_STATUS_DESC);
            return !duplicate;
          });

        dispatch(
          updateFilter({ key: "SUB_STATUS_DESC", value: dataStatusCode })
        );
        setSubStatusLabel((prev: any) => [...prev, ...dataStatusCode1]);
        setSubStatusData((prev: any) => [...prev, ...dataStatusCode]);
        setFilters((prev: any) => {
          return {
            ...prev,
            SUB_STATUS_DESC: { value, matchMode: FilterMatchMode.IN },
          };
        });

        setResetStatus(false);
        setStautusData((prev: any) =>
          checked
            ? [...prev, value]
            : prev.filter((code: any) => code !== value)
        );
        //   let value =dataStatusCode1
        // dispatch(updateFilter({ key: "SUB_STATUS_DESC", value }));
      } else {
        const dataStatusCode = statusResponse
          .filter((status: any) => status.SUB_STATUS_DESC === item?.label)
          .map(({ STATUS_CODE }: any) => ({ STATUS_CODE }));
        const dataStatusCode1 = statusResponse
          .filter((status: any) => status.SUB_STATUS_DESC === item?.label)
          .map(({ SUB_STATUS_DESC }: any) => ({ SUB_STATUS_DESC }));

        const unmatchedItems = subStatusData.filter(
          (item1: any) =>
            !dataStatusCode.some(
              (item2: any) => item2.STATUS_CODE === item1.STATUS_CODE
            )
        );

        setSubStatusData(unmatchedItems);
        const matchedLabel = dataStatusCode1.map(
          (item: any) => item.SUB_STATUS_DESC
        );
        const unmatchedLabel = subStatusLabel.filter(
          (item: any) => !matchedLabel.includes(item.SUB_STATUS_DESC)
        );

        setSubStatusLabel(unmatchedLabel);
        setStautusData((prev: any) =>
          checked
            ? [...prev, value]
            : prev.filter((code: any) => code !== value)
        );
      }
    };

    const getCalendarRangeDate = (e: any) => {
      const selectedDates = e.value;
      if (e.value[0] !== null && minDate === null) {
        setMinDate(selectedDates[0]);
        setWODate(selectedDates);
        setFirstDateSelected(true);
      } else if (e.value[0] !== null && e.value[1] !== null) {
        setFirstDateSelected(false);
        setWODate(selectedDates);
        setMinDate(null);
        setSelectedCustome(true);
      }
    };
    const getListFilter = async () => {
      //setTableData([])
      getFilterListData({ PAGE_NUMBER: 1, PAGE_SIZE: 15 });
    };

    const getButtonLabel = () => {
      if (subStatusLabel.length === 0) {
        return "Status";
      } else if (subStatusLabel.length === 1) {
        return subStatusLabel[0]?.SUB_STATUS_DESC;
      } else if (subStatusLabel.length > 1) {
        return `${subStatusLabel.length}${" "}items selected`;
      }
    };

    const getLocationLabel = () => {
      if (locationFilter.length === 0) {
        return "Location";
      } else if (locationFilter.length === 1) {
        return locationName;
      } else if (locationFilter.length > 1) {
        return `${locationFilter.length}${" "}items selected`;
      }
    };

    return (
      <>
        <div className="flex flex-wrap gap-2">
          <IconField iconPosition="right" className="w-64">
            {/* <InputIcon className="pi pi-search" /> */}
            <InputText
              type="search"
              value={globalFilterValue}
              onChange={onGlobalFilterChange}
              placeholder="Search"
              className="w-80 Search-Input"
            />
          </IconField>
          <Dropdown
            value={selectedDate}
            onChange={async (e: any) => {
              e.preventDefault();
              setResetStatus(false);
              dateStatus = false;
              let date_filter: any = e.target.value?.DATE_DESC;
              let value = e.target.value;
              dispatch(updateFilter({ key: "WO_DATE", value }));
              setSelectedDate(e.target.value);
              if (date_filter === "Custom") {
                if (
                  locationFilter?.length > 0 ||
                  priorityFilter?.length > 0 ||
                  statusFilter?.length > 0 ||
                  reportedBy?.length > 0 ||
                  assigneeFilter?.lenght > 0 ||
                  caseTypeFilter?.length > 0 ||
                  teamNameFilter?.length > 0 ||
                  globalFilterValue !== null
                ) {
                  setCustomRangeStatus(true);
                } else {
                  setCustomRangeStatus(false);
                  setCustomResetDate(true);
                }
                setSelectedCustome(true);
              } else {
                setCustomRangeStatus(true);
                setWODate(null);
                setSelectedCustome(false);
                let startDate = moment(e?.target?.value?.FROM_DATE).format(
                  "YYYY-MM-DD"
                );
                let endDate = moment(e.target.value?.TO_DATE).format(
                  "YYYY-MM-DD"
                );
                setFromDate(startDate);
                setToDate(endDate);
                let value: any = startDate;
                setFilters((prev: any) => {
                  return {
                    ...prev,
                    WO_START: { value, matchMode: FilterMatchMode.IN },
                  };
                });
                value = endDate;
                setFilters((prev: any) => {
                  return {
                    ...prev,
                    WO_END: { value, matchMode: FilterMatchMode.IN },
                  };
                });
                dispatch(updateFilter({ key: "WO_START", value: startDate }));
                dispatch(updateFilter({ key: "WO_END", value: endDate }));
              }
            }}
            options={Data_Date}
            optionLabel={"DATE_DESC"}
            itemTemplate={(option) => (
              <div className="flex justify-between">
                {option.value !== "Custom" ? (
                  <>
                    <div>{option.DATE_DESC}</div>{" "}
                    <div className="ml-7" style={{ color: "#7E8083" }}>
                      {option.SUB_DATE_DESC}
                    </div>
                  </>
                ) : (
                  <>
                    <div
                      onClick={() => setSelectedCustome(true)}
                      style={{ display: "flex", width: "100%" }}
                    >
                      {option.DATE_DESC}
                      <div
                        className="ml-7"
                        style={{ color: "#7E8083", marginLeft: 140 }}
                        onClick={() => setSelectedCustome(true)}
                      >
                        {">"}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
            placeholder="Date"
            className="w-42"
          />
          {facility_type === "I" && (
            <MultiSelect
              filter
              maxSelectedLabels={1}
              value={teamNameFilter}
              onChange={(e: any) => handleDepartmentFilter(e.value)}
              options={filterDropDownData?.TEAMLIST}
              optionLabel={"TEAM_NAME"}
              placeholder="Department"
              className="w-42"
              panelFooterTemplate={panelFooterTemplate(handleDepartmentFilter)}
            />
          )}

          <MultiSelect
            value={caseTypeFilter}
            onChange={(e: any) => handleCaseTypeFilter(e.value)}
            options={filterDropDownData?.WOTYPELIST}
            filter
            maxSelectedLabels={1}
            optionLabel={"WO_TYPE_NAME"}
            placeholder="Case Type"
            className="w-42"
            itemTemplate={(option) =>
              `${option.WO_TYPE_NAME} (${option.WO_TYPE_CODE})`
            }
            panelFooterTemplate={panelFooterTemplate(handleCaseTypeFilter)}
          />
          {facility_type === "R" && (
            <MultiSelect
              value={locationFilter}
              onChange={(e: any) => handleLocationFilter(e.value)}
              options={filterDropDownData?.LOCATIONLIST}
              filter
              maxSelectedLabels={1}
              optionLabel={"LOCATION_DESCRIPTION"}
              placeholder="Location"
              className="w-42"
              panelFooterTemplate={panelFooterTemplate(handleLocationFilter)}
            />
          )}
          {facility_type === "I" && (
            <div>
              <div className="relative w-40">
                <InputText
                  placeholder="Location"
                  value={
                    clearLocation === true
                      ? ""
                      : clear_location === true
                      ? ""
                      : locationFilter?.length > 0
                      ? getLocationLabel()
                      : ""
                  }
                  onClick={(e: any) => {
                    clear_location = false;
                    showEquipmentlist(true);
                    setClearLocation(false);
                  }}
                  readOnly
                  className="width-1/5 pr-8 placeholder-[#6b7280]"
                />
                <i
                  className="pi pi-angle-down absolute right-2 top-1/2 -translate-y-1/2 text-[#6b7280]"
                  style={{ pointerEvents: "none" }} // Ensures clicks pass through to InputText
                />
              </div>
              <LocationHierarchyDialog
                showEquipmentlist={showEquipmentlist}
                visibleEquipmentlist={visibleEquipmentlist}
                selectedKey={selectedKey}
                setSelectedKey={setSelectedKey}
                nodes={nodes}
                locationFilteredData={locationFilteredData}
                setLocationFilteredData={setLocationFilteredData}
                setNodes={setNodes}
                setValue={setValue}
                // getDashboardDetails={getDashboardDetails}
                setLocationName={setLocationName}
                handleLocationFilter={handleLocationFilter}
                locationResetStatus={locationResetStatus}
                setLocationResetStatus={setLocationResetStatus}
                clearLocationFilter={clearLocationFilter}
                clearLocation={clearLocation}
              />
            </div>
          )}

          {facility_type === "R" && (
            <MultiSelect
              value={statusFilter}
              onChange={(e: any) => handleStatusFilter(e.value, "")}
              options={
                pathname === "/workorderlist"
                  ? statusDatas
                  : filterDropDownData?.WOSTATUSLIST
              }
              filter
              maxSelectedLabels={1}
              optionLabel={"STATUS_DESC"}
              placeholder="Status"
              className="w-42"
              panelFooterTemplate={panelFooterTemplate(handleStatusFilter)}
            />
          )}
          {facility_type === "I" && (
            <>
              {/* <InputText value={getButtonLabel()} 
               onClick={(e) => op.current.toggle(e)} 
              className="w-40"  
               style={{ width: '10.5rem' }}
              //  icon="pi pi-angle-down" iconPos="right"
                /> */}
              <div className="relative w-40">
                <InputText
                  placeholder="Status"
                  value={getButtonLabel()}
                  onClick={(e) => {
                    op.current.toggle(e);
                    clear_status = false;
                  }}
                  className="w-full pr-8 placeholder-[#6b7280]" // pr-8 = padding-right for icon space
                  readOnly
                />
                <i
                  className="pi pi-angle-down absolute right-2 top-1/2 -translate-y-1/2 text-[#6b7280]"
                  style={{ pointerEvents: "none" }} // Ensures clicks pass through to InputText
                />
              </div>
              <OverlayPanel className="custom-overlay" ref={op}>
                <div className="flex flex-row flex-wrap gap-5 bg-white">
                  {statusData?.map((option: any, index: any) => (
                    <div key={index} className="w-[300px] bg-white">
                      <div className="status-header">{option.label}</div>
                      {option?.items?.map((optionItem: any, idx: any) => {
                        // Get the count for the status from your count array
                        const countData = statusListCount.find(
                          (item: any) => item.STATUS_DESC === optionItem.label
                        );

                        return (
                          <div
                            key={idx}
                            className="flex flex-wrap justify-between mt-2 bg-white"
                          >
                            <div className="flex">
                              <Checkbox
                                value={optionItem.STATUS_CODE}
                                onChange={(e: any) =>
                                  onStatusChange(e, optionItem)
                                }
                                checked={statusData?.includes(
                                  optionItem.STATUS_CODE
                                )}
                              />
                              <label
                                htmlFor={optionItem.label}
                                className="ml-2 status-subheading"
                              >
                                {optionItem.label}
                              </label>
                            </div>
                            <label className="status-subheading">
                              ({countData ? countData.COUNT : 0}){" "}
                              {/* Show the count here */}
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center p-4 px-[24px] py-[12px] border-  border-gray-200">
                  <a
                    className="status-subheading"
                    onClick={(e: any) => clearSelection(e)}
                  >
                    Clear Selection
                  </a>
                  {/* <Button
                    type="button"
                    className="Primary_Button w-28 me-2"
                    label={"Apply"}
                    onClick={() => {
                      op.current.hide();
                    }}
                  /> */}
                </div>
              </OverlayPanel>
            </>
          )}
          {facility_type === "I" && (
            <MultiSelect
              filter
              maxSelectedLabels={1}
              value={priorityFilter}
              onChange={(e: any) => handlePriorityFilter(e.value)}
              options={filterDropDownData?.PRIORITYLIST}
              optionLabel={"SEVERITY"}
              placeholder="Priority"
              className="w-42"
              panelFooterTemplate={panelFooterTemplate(handlePriorityFilter)}
            />
          )}
          {facility_type === "R" && (
            <MultiSelect
              value={reportedBy}
              onChange={(e: any) => handleReporterFilter(e.value)}
              options={filterDropDownData?.REPORTERLIST}
              filter
              maxSelectedLabels={1}
              optionLabel={"LOGIN_NAME"}
              placeholder="Reporter"
              className="w-42"
              panelFooterTemplate={panelFooterTemplate(handleReporterFilter)}
            />
          )}
          <MultiSelect
            value={assigneeFilter}
            onChange={(e: any) => handleAssigneeFilter(e.value)}
            options={filterDropDownData?.ASSIGNEELIST}
            filter
            maxSelectedLabels={1}
            optionLabel={"LOGIN_NAME"}
            placeholder="Assignee"
            className="w-42"
            panelFooterTemplate={panelFooterTemplate(handleAssigneeFilter)}
          />

          {!resetStatus && customRangeStatus === true && (
            <Button
              type="button"
              className="Primary_Button"
              label="Apply"
              onClick={getListFilter}
            />
          )}
          {/* Custom date Dropdown */}

          {!resetStatus && customRangeStatus === true && (
            <Button
              type="button"
              className="Secondary_Button"
              label="Clear Filter"
              onClick={resetFilters}
            />
          )}
          {customRangeStatus === false && customResetDate === true && (
            <Button
              type="button"
              className="Secondary_Button"
              label="Clear Filter"
              onClick={resetFilters}
            />
          )}
        </div>

        {selectedCustomeDate && (
          <Card className="w-3/5 absolute z-10">
            <div>
              <Calendar
                value={dateWO}
                onChange={(e: any) => {
                  getCalendarRangeDate(e);
                }}
                inline
                numberOfMonths={1}
                selectionMode="range"
                readOnlyInput
                hideOnRangeSelection
                minDate={firstDateSelected ? minDate : null}
              />
            </div>
            <div className="flex flex-wrap justify-end mt-2">
              <Buttons
                className="Secondary_Button me-2"
                label={ ("Cancel")}
                onClick={() => {
                  setSelectedCustome(false);
                }}
              />
              <Buttons
                className="Primary_Button"
                label={ ("Select")}
                onClick={async () => {
                  await handlerCustomDateRange();
                  // resetFilters();
                }}
              />
            </div>
          </Card>
        )}
      </>
    );
  };

  const statusBody = (params: any) => {
    return (
      <div
        style={{
          backgroundColor: params?.STATUS_COLOURS,
          borderRadius: "1rem",
          padding: "0.25rem",
          textAlign: "center",
          // width: "120px",
        }}
      >
        {/* <p>{params?.STATUS_DESC}</p> */}
        {facility_type === "I" ? (
          <p>{params?.SUB_STATUS_DESC}</p>
        ) : (
          <p>{params?.STATUS_DESC}</p>
        )}
      </div>
    );
  };

  const GetWorkOrderFormWoId = (rowItem: any) => {
    // props?.isForm({ rowItem });
    navigate(`${appName}/workorderlist?edit=`);
    localStorage.setItem("Id", JSON.stringify(rowItem));
    localStorage.setItem("WO_ID", JSON.stringify(rowItem?.WO_ID));
  };

  const ExportCSV = (csvData: any, fileName: any) => {
    const fileType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    const fileExtension = ".xlsx";

    for (let key in csvData) {
      delete csvData[key].SKILL_ID;
      delete csvData[key].FACILITY_ID;
      delete csvData[key].PART_ID;
      delete csvData[key].MAKE_ID;
      delete csvData[key].WO_ID;
      delete csvData[key].ASSETTYPE_ID;
      delete csvData[key].ASSET_ID;
      delete csvData[key].ASSETGROUP_ID;
      delete csvData[key].SCHEDULE_ID;
      delete csvData[key].TASK_ID;
      delete csvData[key].MODEL_ID;
      delete csvData[key].UOM_ID;
      delete csvData[key].USER_ID;
      delete csvData[key].ROLE_ID;
      delete csvData[key].SKILL_ID;
      delete csvData[key].TEAM_ID;
      delete csvData[key].LOCATIONTYPE_ID;
      delete csvData[key].LOCATION_ID;
      delete csvData[key].DOC_ID;
      delete csvData[key].STORE_ID;
      delete csvData[key].VENDOR_ID;
      delete csvData[key].MATREQ_ID;
      delete csvData[key].REQ_ID;
      delete csvData[key].EVENT_ID;
      delete csvData[key].EVENT_TYPE;
      delete csvData[key].OBJ_ID;
      delete csvData[key].STATUS_CODE;
    }

    const ws = xlsx.utils.json_to_sheet(csvData);
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = xlsx.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(data, fileName + fileExtension);
  };

  const handlerDownload = async () => {
    const payload = {
      SEARCH_TEXT:
        globalStatus == true
          ? ""
          : globalFilterValue !== null
          ? globalFilterValue
          : null,
      FROM_DATE:
        location?.state === "workorder"
          ? filterGroup?.WO_START?.value
          : dateStatus === true
          ? null
          : fromDate !== null
          ? fromDate
          : null,
      TO_DATE:
        location?.state === "workorder"
          ? filterGroup?.WO_END?.value
          : dateStatus === true
          ? null
          : toDate !== null
          ? toDate
          : toDate !== null
          ? toDate
          : null,
      WO_TYPE_LIST:
        location?.state === "workorder"
          ? filterGroup?.WO_TYPE?.value
          : caseTypeFilter?.length > 0
          ? filters?.WO_TYPE?.value
          : [],
      PRIORITY_LIST: priorityFilter?.length > 0 ? filters?.SEVERITY?.value : [],
      ASSIGNEE_LIST:
        location?.state === "workorder"
          ? filterGroup?.ASSIGN_NAME?.value
          : assigneeFilter?.length > 0
          ? filters?.ASSIGN_NAME?.value
          : [],
      TEAM_LIST: teamNameFilter?.length > 0 ? filters?.TEAMNAME?.value : [],
      SUB_STATUS_LIST: subStatusData?.length > 0 ? subStatusData : [],
      PAGE_NUMBER: 0,
      PAGE_SIZE: 15,
      LOCATION_LIST:
        location?.state === "workorder"
          ? filterGroup?.LOCATION_DESCRIPTION?.value
          : locationFilter?.length > 0
          ? filters?.LOCATION_DESCRIPTION?.value
          : [],
      REPORTER_LIST:
        location?.state === "workorder"
          ? filterGroup?.REPORTED_NAME?.value
          : reportedBy?.length > 0
          ? filters?.REPORTED_NAME?.value
          : [],
      STATUS_LIST:
        location?.state === "workorder"
          ? filterGroup?.STATUS_DESC?.value
          : statusFilter?.length > 0
          ? filters?.STATUS_DESC?.value
          : [],
      TYPE: "EXCEL",
    };

    const res: any = await callPostAPI(
      ENDPOINTS.FILTER_GET_API_LIST,
      payload,
      currentMenu?.FUNCTION_CODE
    );
    if (res?.FLAG === 1) {
      ExportCSV(res?.WOLIST, currentMenu?.FUNCTION_DESC);
    } else {
      setTableData([]);
    }
  };
  const onPageChange = async (event: any) => {
    await getFilterListData({
      PAGE_NUMBER: event.page + 1,
      PAGE_SIZE: event?.rows,
    });
    setFirst(event.first);
    setRows(event.rows);
  };

  const getLocation = async () => {
    let Currentfacility = JSON.parse(
      localStorage.getItem(LOCALSTORAGE.FACILITY)!
    );
    let filterFacility: any = Currentfacility.filter(
      (f: any) => f?.FACILITY_ID === selectedFacility?.FACILITY_ID
    );
    const payload: any = {
      LOCATION_ID: filterFacility[0]?.LOCATION_ID,
      ISLOCATIONFILTERFLAG: 1,
    };

    const res = await callPostAPI(ENDPOINTS?.GETHIRARCHY_LIST, payload);
    if (res?.FLAG === 1) {
      setNodes(res?.LOCATIONHIERARCHYLIST);
    }
  };
  useEffect(() => {
    if (currentMenu?.FUNCTION_CODE) {
      (async function () {
        await getLocation();
      })();
      if (location?.state === "workorder") {
        (async function () {
          await getAPI();
        })();
      } else {
        //
        (async function () {
          setCaseTypeFilter([]);
          setLocationFilter([]);
          setStatusFilter([]);
          setPriorityFilter([]);
          setTeamNameFilter([]);
          setSubStatusData([]);
          setSelectedCustome(false);
          setAssigneeFilter([]);
          setLocationResetStatus(true);
          setWorkOrderDateFilter([]);
          setSelectedDate(null);

          let value: any = null;
          setCustomRangeStatus(false);
          setWODate(null);
          setGlobalFilterValue("");
          setSubStatusLabel([]);
          await getAPI();
        })();
      }
    }
  }, [selectedFacility, pathname, search, location?.state, currentMenu]);
  // Set up scroll event listeners
  useEffect(() => {
    const topScroll = topScrollRef.current;
    const bottomScroll = bottomScrollRef.current;
    const tableContainer = tableContainerRef.current;

    if (topScroll && bottomScroll && tableContainer) {
      const tableWrapper = tableContainer.querySelector(
        ".p-datatable-wrapper"
      ) as any;

      const handleTopScroll = () =>
        syncScroll(topScrollRef, [bottomScrollRef, { current: tableWrapper }]);
      const handleBottomScroll = () =>
        syncScroll(bottomScrollRef, [topScrollRef, { current: tableWrapper }]);
      const handleTableScroll = () =>
        syncScroll({ current: tableWrapper }, [topScrollRef, bottomScrollRef]);

      topScroll.addEventListener("scroll", handleTopScroll);
      bottomScroll.addEventListener("scroll", handleBottomScroll);
      tableWrapper.addEventListener("scroll", handleTableScroll);

      return () => {
        topScroll.removeEventListener("scroll", handleTopScroll);
        bottomScroll.removeEventListener("scroll", handleBottomScroll);
        tableWrapper.removeEventListener("scroll", handleTableScroll);
      };
    }
  }, []);

  // Calculate the total width needed for the scrollbars
  useEffect(() => {
    if (!showLoader) {
      setTimeout(() => {
        let tableWrapper: any = null;
        const container = tableContainerRef.current;

        if (tableContainerRef.current) {
          tableWrapper = tableContainerRef.current.querySelector(
            ".p-datatable-wrapper"
          );
        }

        if (tableWrapper && container) {
          setScrollWidth(`${tableWrapper.scrollWidth}px`); // set table scrollWidth to fake scrollbar
        }
      }, 100); // slight delay to ensure DOM is rendered
    }
  }, [showLoader]);

  useEffect(() => {
    showEquipmentlist(false);
  }, []);

  useEffect(() => {
    if (showLoader === false) {
      const updateScrollWidth = () => {
        if (tableContainerRef.current) {
          const tableWrapper = tableContainerRef.current.querySelector(
            ".p-datatable-wrapper"
          );
          if (tableWrapper) {
            setScrollWidth(`${tableWrapper.scrollWidth}px`);
          }
        }
      };
      const timeout = setTimeout(updateScrollWidth, 100);

      return () => clearTimeout(timeout);
    }
  }, [tableData, showLoader]);

  return (
    <>
      <div className="card shadow-none" style={{ width: "100%" }}>
        <div className="my-4 flex flex-wrap justify-between items-center">
          <div>
            <h6 className="Text_Primary mr-2">
              { (currentMenu?.FUNCTION_DESC)}
            </h6>
          </div>
          <div>
            <Buttons
              className="Secondary_Button me-2"
              label={ ("Export")}
              onClick={handlerDownload}
            />
            {currentMenu?.ADD_RIGHTS === "True" &&
              is_Occupant_Validity === true &&
              decryptData(localStorage.getItem(LOCALSTORAGE?.ROLETYPECODE)) ===
                ROLETYPECODE?.OCCUPANT && (
                <Buttons
                  className="Primary_Button me-2"
                  label={ ("Add Service Request")}
                  // icon="pi pi-plus"
                  onClick={handlerServiceRequest}
                />
              )}
            {currentMenu?.ADD_RIGHTS === "True" &&
              decryptData(localStorage.getItem(LOCALSTORAGE?.ROLETYPECODE)) !==
                ROLETYPECODE?.OCCUPANT && (
                <Buttons
                  className="Primary_Button me-2"
                  label={ ("Add Service Request")}
                  // icon="pi pi-plus"
                  onClick={handlerServiceRequest}
                />
              )}
          </div>
        </div>
        <div
          className="p-4 bg-white rounded- -lg border- -4 border-x-4"
          style={{
            borderWidth: "1px",
          }}
        >
          {tableHeaderFun()}
        </div>

        <div
          ref={topScrollRef}
          className="top-scrollbar border-x h-auto bg-white"
          style={{
            width: "100%",
            overflowX: "auto",
            overflowY: "hidden",
          }}
        >
          <div
            style={{
              height: "1px",
              width: scrollWidth,
            }}
          />
        </div>

        <div
          className="rounded-b-lg pb-2"
          ref={tableContainerRef}
          style={{
            width: "100%",
            overflow: "hidden",
            position: "relative",
            borderWidth: "1px",
          }}
        >
          <DataTable
            value={tableData}
            showGridlines
            emptyMessage={ ("No Data found")}
            globalFilterFields={["SEVERITY"]}
            style={{ width: "100%" }}
            tableStyle={{ minWidth: "1200px" }}
            loading={showLoader} // Add loading state prop
            loadingIcon={<LoaderShow />}
          >
            {pathname === "/servicerequestlist" && (
              <Column
                field="WO_TYPE"
                header="Type"
                style={{ minWidth: "100px" }}
              ></Column>
            )}
            {pathname === "/servicerequestlist" && (
              <Column
                field="SER_REQ_NO"
                header="Service Request Number"
                style={{ minWidth: "180px" }}
                body={(rowData: any) => {
                  const rowItem: any = { ...rowData };
                  return (
                    <>
                      {tableHeader && (
                        <>
                          <p
                            className="cursor-pointer mb-2"
                            onClick={() => {
                              // props?.isForm({ rowItem });
                              navigate(`${appName}/servicerequestlist?edit=`);
                              localStorage.setItem(
                                "Id",
                                JSON.stringify(rowItem)
                              );
                              localStorage.setItem(
                                "WO_ID",
                                JSON.stringify(rowItem?.WO_ID)
                              );
                            }}
                          >
                            {rowData.SER_REQ_NO}
                          </p>
                        </>
                      )}
                    </>
                  );
                }}
              ></Column>
            )}
            <Column
              field="WO_NO"
              header="Work Order Number"
              style={{ minWidth: "250px" }}
              body={(rowData: any) => {
                const rowItem: any = { ...rowData };
                return (
                  <>
                    {tableHeader && (
                      <>
                        {facility_type === "I" ? (
                          <p
                            className="cursor-pointer mb-2"
                            onClick={() => GetWorkOrderFormWoId(rowItem)}
                          >
                            {rowData.WO_NO}
                          </p>
                        ) : (
                          <>
                            {currentWorkOrderRights !== undefined ? (
                              <p
                                className="cursor-pointer mb-2"
                                onClick={() => GetWorkOrderFormWoId(rowItem)}
                              >
                                {rowData.WO_NO}
                              </p>
                            ) : (
                              <p> {rowData.WO_NO}</p>
                            )}
                          </>
                        )}
                      </>
                    )}
                  </>
                );
              }}
            ></Column>
            <Column
              field="LOCATION_DESCRIPTION"
              header={"Location"}
              style={{ minWidth: "200px" }}
            ></Column>
            <Column
              field="WO_GROUP_REQ"
              header="Issue"
              style={{ minWidth: "450px" }}
            ></Column>
            <Column
              field="DESCRIPTION"
              header="Description"
              style={{ minWidth: "200px" }}
              body={(rowData) => {
                const truncatedDescription =
                  rowData?.DESCRIPTION?.length > 50
                    ? rowData.DESCRIPTION.slice(0, 50) + "..."
                    : rowData.DESCRIPTION;

                return (
                  <div
                    className="description-cell cursor-pointer"
                    title={rowData?.DESCRIPTION}
                  >
                    {truncatedDescription === "" ? "NA" : truncatedDescription}
                  </div>
                );
              }}
            />

            <Column
              field="STATUS_DESC"
              header={facility_type === "I" ? "Sub-Status" : "Status"}
              style={{ minWidth: "200px" }}
              body={statusBody}
            ></Column>

            {facility_type === "I" && (
              <Column
                field="SEVERITY"
                header="Priority"
                style={{ minWidth: "130px" }}
                body={(rowData: any) => {
                  const PriorityIconName = priorityIconList?.filter(
                    (e: any) => e?.ICON_ID === rowData?.ICON_ID
                  )[0]?.ICON_NAME;
                  return (
                    <>
                      <label>
                        <i
                          className={`mr-2 ${PriorityIconName}`}
                          style={{ color: rowData?.PRIORITY_COLOURS }}
                        ></i>
                        {rowData?.SEVERITY}
                      </label>
                    </>
                  );
                }}
              ></Column>
            )}

            {facility_type !== "I" && (
              <Column
                field="REPORTED_NAME"
                header="Reporter"
                style={{ minWidth: "200px" }}
                body={(rowData: any) => {
                  return (
                    <>
                      <div>
                        <label className="Table_Header Text_Primary">
                          {rowData.REPORTED_NAME}
                        </label>
                      </div>
                    </>
                  );
                }}
              ></Column>
            )}
            {facility_type != "I" && (
              <Column
                field="ASSIGN_NAME"
                header="Assignee"
                style={{ minWidth: "200px" }}
                body={(rowData: any) => {
                  return (
                    <>
                      <div>
                        <label className="Table_Header Text_Primary">
                          {rowData.ASSIGN_NAME}
                        </label>
                      </div>
                      <div>
                        <label className="Helper_Text Text_Secondary">
                          {rowData.ASSIGN_TEAM_NAME}
                        </label>
                      </div>
                    </>
                  );
                }}
              ></Column>
            )}

            <Column
              field="WO_CREATED_TIME"
              header="Date"
              style={{ minWidth: "160px" }}
            ></Column>
          </DataTable>
        </div>
        {/* </>)} */}
        {/* Bottom scrollbar */}
        <div
          ref={bottomScrollRef}
          className="bottom-scrollbar"
          style={{
            width: "100%",
            overflowX: "auto",
            overflowY: "hidden",
            height: "15px",
            marginTop: "5px",
            backgroundColor: "#f5f5f5",
            borderRadius: "4px",
            display: "unset",
          }}
        >
          <div
            style={{
              height: "1px",
              // width: calculateScrollWidth(),
            }}
          />
        </div>

        <div className="flex p-4 bg-white flex-row gap-3a justify-between">
          {tableData?.length > 0 && (
            <div className="mt-3 Text_Secondary Input_label">
              {`Showing ${first + 1} - ${
                tableData?.length + first
              }  of ${pageCount}`}
            </div>
          )}
          {tableData?.length > 0 ? (
            <Paginator
              first={tableData?.length > 0 ? first : 0}
              rows={tableData?.length > 0 ? rows : 0}
              totalRecords={pageCount}
              onPageChange={onPageChange}
              currentPageReportTemplate="Items per Page:-"
              rowsPerPageOptions={[15, 25, 50, 75].filter(
                (option) => option <= pageCount
              )}
              alwaysShow={false}
              template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
            ></Paginator>
          ) : (
            ""
          )}
        </div>
      </div>
      {/* <Dialog
        header=""
        visible={showLoader && customRangeStatus === true ? showLoader : false}
        closable={false}
        onHide={() => {}}
        modal
        draggable={false}
        resizable={false}
        maskStyle={{ backgroundColor: "transparent" }}
      >
        <LoaderShow/>
      </Dialog> */}
    </>
  );
};

export default WorkOrderMasterInfra;
