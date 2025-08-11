
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { callPostAPI } from "../../../services/apis";
import { ENDPOINTS } from "../../../utils/APIEndpoints";
import { useLocation, useOutletContext, useNavigate } from "react-router-dom";
import TableListLayout from "../../../layouts/TableListLayout/TableListLayout";
import * as xlsx from "xlsx";
import FileSaver from "file-saver";
import { useForm } from "react-hook-form";
import ServiceRequestDetailForm from "./ServiceRequestDetailForm";
import { IconField } from "primereact/iconfield";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { useTranslation } from "react-i18next";
import { InputText } from "primereact/inputtext";
import { FilterMatchMode } from "primereact/api";
import { MultiSelect } from "primereact/multiselect";
import { Button } from "primereact/button";
import "../../../components/MultiSelects/MultiSelects.css";
import Buttons from "../../../components/Button/Button";
import { Paginator } from "primereact/paginator";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import "../../../components/Table/Table.css";
import moment from "moment";
import { dateFormat, dateFormat1, formateDate, LOCALSTORAGE, priorityIconList } from "../../../utils/constants";
import { appName, PATH } from "../../../utils/pagePath";
import { Card } from "primereact/card";
import { decryptData } from "../../../utils/encryption_decryption";
import { useDispatch, useSelector } from "react-redux";
import { updateFilter, clearFilters } from "../../../store/filterstore";

const ServiceRequestReal = (props: any) => {
  const FACILITY: any = localStorage.getItem("FACILITYID");
  const FACILITYID: any = JSON.parse(FACILITY);
  const dispatch: any = useDispatch();
  const location: any = useLocation();
  if (FACILITYID) {
    var facility_type: any = FACILITYID?.FACILITY_TYPE;

  }
  const filterDefaultValues: any = {
    ASSIGN_NAME: { value: null, matchMode: FilterMatchMode.CONTAINS },
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    WO_TYPE: { value: null, matchMode: FilterMatchMode.IN },
    STATUS_DESCRIPTION: { value: null, matchMode: FilterMatchMode.IN },
    LOCATION_DESCRIPTION: { value: null, matchMode: FilterMatchMode.IN },
    SEVERITY: { value: null, matchMode: FilterMatchMode.IN },
    WO_NO: { value: null, matchMode: FilterMatchMode.IN },
    WO_DATE: { value: null, matchMode: FilterMatchMode.IN },
    REPORTED_NAME: { value: null, matchMode: FilterMatchMode.CONTAINS },
  };
  const filterGroup = useSelector((state: any) => state.serviceGroupFilter);
  let { pathname } = useLocation();
  let { search } = useLocation();
  var Assign_status: boolean = false;
  var gloabalStatus: boolean = false;
  const navigate: any = useNavigate();
  const [selectedFacility, menuList]: any = useOutletContext();
  const { t } = useTranslation();
  const [filterData, setFilterData] = useState<any | null>([])
  const [selectedWoList, setSelectedWoList] = useState<any>(null);
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  // const [showLoader, setShowLoader] = useState<boolean>(true);
  let [tableData, setTableData] = useState<any>();
  var globalStatus: boolean = false;
  let tableHeader: any = props?.tableHeader?.headerName !== "User Role Master";
  const [originalList, setOriginalList] = useState<any | null>([])
  const [caseTypeFilter, setCaseTypeFilter] = useState<any>([]);
  const [statusFilter, setStatusFilter] = useState<any | null>([]);
  const [assigneeFilter, setAssigneeFilter] = useState<any | null>([]);
  const [locationFilter, setLocationFilter] = useState<any | null>([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedCustomeDate, setSelectedCustome] = useState<boolean>(false);
  const [dateWO, setWODate] = useState(null);
  const [selectedDateFilter, setSelectedDateFilter] = useState<any | null>([])
  const [technicianList, setTechnicianList] = useState<any | null>([])

  const [workOrderDateFilter, setWorkOrderDateFilter] = useState<any | null>([])
  const [todayFilter, setTodayFilter] = useState<any | null>([]);
  const [weekFilter, setWeekFilter] = useState<any | null>([])
  //const startOfPreviousWeek = moment().subtract(1, 'weeks').startOf('week').format(dateFormat1());
  const startOfPreviousWeek = moment().startOf('week').format(dateFormat1());
  // const endOfPreviousWeek = moment().subtract(1, 'weeks').endOf('week').format(dateFormat1());
  const endOfPreviousWeek = moment().endOf('week').format(dateFormat1());
  // const endOfPreviousWeekYear = moment().subtract(1, 'weeks').endOf('week').format('YYYY');
  const endOfPreviousWeekYear = moment().endOf('week').format('YYYY');
  // const[firstMinDate, setFirstMinDate]=useState<any|null>(false)
  const [firstDateSelected, setFirstDateSelected] = useState<boolean>(false);
  const [reportedBy, setReportedBy] = useState<any | null>([])
  const [minDate, setMinDate] = useState<any | null>(null)
  const datelist = [{ label: "All", value: "All", dateData: "" },
  { label: "Today", value: `Today`, dateData: moment(new Date()).format(dateFormat()) },
  { label: "This week", value: `This week`, dateData: `${startOfPreviousWeek}${(" ")} to${(" ")} ${endOfPreviousWeek}, ${endOfPreviousWeekYear}` },
  { label: "Custom range", value: "Custom range", dateData: "" }];
  const {
    // watch,
  } = useForm({
    defaultValues: {
      FILTER_BY: "",
    },
    mode: "onSubmit",
  });

  const currentMenu = menuList
    ?.flatMap((menu: any) => menu?.DETAIL)
    ?.filter((detail: any) => detail.URL === pathname)[0];

  const handlerCustomDateRanges = async () => {
    clearFilterValue()
    if (dateWO !== null) {
      if (dateWO[0] !== null && dateWO[1] !== null) {
        const res = await callPostAPI(
          ENDPOINTS.GET_EVENTMASTER,
          {
            FILTER_BY: "",
            FROM_DATE: moment(dateWO[0]).format("YYYY-MM-DD"),
            TO_DATE: moment(dateWO[1]).format("YYYY-MM-DD")
          },
          currentMenu?.FUNCTION_CODE
        );
        if (res?.FLAG === 1) {
          const updatedServiceRequestList: any = await formatServiceRequestList(res.HELPDESKMASTERSLIST);
          setOriginalList(updatedServiceRequestList)
          //  setFilterData(updatedServiceRequestList)
          if (locationFilter?.length > 0 || caseTypeFilter?.length > 0 || statusFilter?.length > 0 || assigneeFilter?.length > 0) {
            const data: any = getFilterData(updatedServiceRequestList)
            setTableData(data)
          } else {
            setTableData(updatedServiceRequestList)
            setSelectedDateFilter(updatedServiceRequestList)
          }
          // setFirstMinDate(false)
        } else {
          setTableData([])
          setSelectedDateFilter([])
        }
        setSelectedCustome(false)
      } else {
        toast.error("Please select date range")
      }
    } else {
      toast.error("Please select date range")
    }

  }
  const handlerCustomDateRange = async () => {
    clearFilterValue()
    if (dateWO !== null) {
      if (dateWO[0] !== null && dateWO[1] !== null) {
        const res = await callPostAPI(
          ENDPOINTS.GET_EVENTMASTER,
          {
            FILTER_BY: "",
            FROM_DATE: moment(dateWO[0]).format("YYYY-MM-DD"),
            TO_DATE: moment(dateWO[1]).format("YYYY-MM-DD")
          },
          currentMenu?.FUNCTION_CODE
        );
        if (res?.FLAG === 1) {
          const updatedServiceRequestList: any = await formatServiceRequestList(res.HELPDESKMASTERSLIST);
          setOriginalList(updatedServiceRequestList)
          //  setFilterData(updatedServiceRequestList)
          setTableData(updatedServiceRequestList)
          setSelectedDateFilter(updatedServiceRequestList)
          // setFirstMinDate(false)
        } else {
          setTableData([])
          setSelectedDateFilter([])
        }
        setSelectedCustome(false)
      } else {
        toast.error("Please select date range")
      }
    } else {
      toast.error("Please select date range")
    }

  }

  const getAPI = async () => {
    try {
      const payload: any = {
        FILTER_BY: 100,
      };

      const res = await callPostAPI(
        ENDPOINTS.GET_EVENTMASTER,
        payload,
        currentMenu?.FUNCTION_CODE
      );
      const res1 = await callPostAPI(
        ENDPOINTS.GET_TECHNICIANLIST,
        {},
        currentMenu?.FUNCTION_CODE
      );
      if (res1?.FLAG === 1) {
        setTechnicianList(res1?.TECHLIST)
      } else {
        setTechnicianList([])
      }

      if (res?.FLAG === 1) {
        const updatedServiceRequestList: any = await formatServiceRequestList(res.HELPDESKMASTERSLIST);
        setFilterData(updatedServiceRequestList);
        if (filterGroup?.WO_DATE?.value === "Today") {
          const todayFilter = updatedServiceRequestList.filter((e: any) => {
            let workOrdeDate: any = e?.SERVICE_CREATED_TIME?.split(" ")[0];
            let filteredData = workOrdeDate === moment(new Date()).format(dateFormat());
            return filteredData;
          });
          //setTodayFilter(todayFilter);
          setWorkOrderDateFilter(filterGroup?.WO_DATE?.value)
          setSelectedDateFilter(todayFilter);
        } else if (filterGroup?.WO_DATE?.value === "This week") {
          let lastWeekDates: any = [];
          let current = moment();
          let lastSunday = current.clone().startOf("week");
          for (let i = 0; i < 7; i++) {
            lastWeekDates.push(
              lastSunday.clone().add(i, "days").format(dateFormat())
            );
          }
          const weekFilter = updatedServiceRequestList?.filter((e: any) => {
            let workOrdeDate: any = e?.SERVICE_CREATED_TIME?.split(" ")[0];
            let filteredData = lastWeekDates?.includes(workOrdeDate);
            return filteredData;
          });
          //setWeekFilter(weekFilter);
          setWorkOrderDateFilter(filterGroup?.WO_DATE?.value)
          setSelectedDateFilter(weekFilter);
        } else if (filterGroup?.WO_DATE?.value === "Custom range") {
          handlerCustomDateRanges()
        }
        setTableData(updatedServiceRequestList);

        setTodayFilter(updatedServiceRequestList);
        setWeekFilter(updatedServiceRequestList)
        props?.setData(updatedServiceRequestList);
        localStorage.setItem("currentMenu", JSON.stringify(currentMenu));
      } else {
        setTableData([]);
        setFilterData([]);
      }
    } catch (error: any) {
      toast.error(error);
    }
  };


  const statusColor = (element: any) => {
    const baseStatus = element.split(" (Re-open)")[0];
    let data: any = localStorage.getItem("statusColorCode");
    const dataColor: any = JSON.parse(data)
    return dataColor.find(
      (item: any) => item.STATUS_DESC === baseStatus)?.COLORS;

  }

  const formatServiceRequestList = async (list: any) => {
    let WORK_ORDER_LIST = list;

    const SERVICE_REQUEST_LIST: any = WORK_ORDER_LIST.map((element: any) => {
      const pendingActionColor: any = statusColor(element?.STATUS_DESC);
      return {
        // ...element,
        SERVICE_CREATED_TIME: element.SERVICE_CREATED_TIME,
        WO_TYPE: element?.WO_TYPE,
        SEVERITY: element?.SEVERITY,
        SER_REQ_NO: element?.SER_REQ_NO,
        WO_NO: element?.WO_NO,
        LOCATION_NAME: element?.LOCATION_NAME,
        LOCATION_DESCRIPTION: element?.LOCATION_DESCRIPTION,
        STATUS_DESCRIPTION: element?.STATUS_DESC,
        ASSIGN_NAME: element?.ASSIGN_NAME,
        WO_TYPE_NAME: element?.WO_TYPE_NAME,
        SERVICE_GROUP_REQ: `${element?.ASSETGROUP_NAME}>${element?.REQ_DESC}`,
        WO_ID: element?.WO_ID,
        STATUS_COLOURS: pendingActionColor,
        PRIORITY_COLOURS: element?.PRIORITY_COLOURS,
        REPORTED_NAME: element?.RAISED_BY_NAME,
      };
    });

    return SERVICE_REQUEST_LIST;
  };

  const [filters, setFilters] = useState(filterDefaultValues);

  const getFilterArray = () => {
    const concatenatedValues = Object.values(filterGroup)
      ?.map((item: any) => item.value)
      ?.filter(value => value && (Array.isArray(value) ? value.length > 0 : true))
      ?.reduce((acc, value) => {

        return acc.concat(Array?.isArray(value) ? value : [value]);
      }, []);
    return concatenatedValues;
  }

  const getFilterData = (tableData: any) => {
    const concatenatedValues: any = getFilterArray();
    const normalizedCriteria: any = concatenatedValues.map((c: any) =>
      c.trim().toLowerCase()
    );
    // setServiceRequestFilter(normalizedCriteria)
    const dataFilter: any = tableData?.filter((serviceRequest: any) => {
      const normalizedWOType = (serviceRequest.WO_TYPE_NAME || '').trim().toLowerCase();
      const normalizedLocationName = (serviceRequest.LOCATION_DESCRIPTION || '').trim().toLowerCase();
      const normalizedAssignName = (serviceRequest.ASSIGN_NAME || '').trim().toLowerCase();
      const normalizedStatus = (serviceRequest.STATUS_DESCRIPTION || '').trim().toLowerCase();
      const value = filters?.global?.value?.toLowerCase();
      const globalValue: any = Object.values(serviceRequest).some((val: any) =>
        val?.toString()?.trim().toLowerCase()?.includes(value)
      );

      const normalizedReportedBy = (serviceRequest.REPORTED_NAME || '').trim().toLowerCase();
      const woTypeMatch = normalizedCriteria.includes(normalizedWOType);
      const locationMatch = normalizedCriteria.includes(normalizedLocationName);
      const statusMatch = normalizedCriteria.includes(normalizedStatus);
      const assignNameMatch = normalizedCriteria.some((name: string) =>
        normalizedAssignName.includes(name.trim().toLowerCase())
      );

      const reportedByMatch = normalizedCriteria.includes(normalizedReportedBy);


      let isValid = false;
      if (
        assigneeFilter?.length > 0 &&
        locationFilter?.length > 0 &&
        statusFilter?.length > 0 &&
        caseTypeFilter?.length > 0 &&
        globalFilterValue?.length > 0 &&
        reportedBy?.length > 0
      ) {
        isValid =
          locationMatch &&
          statusMatch &&
          globalValue &&
          assignNameMatch &&
          woTypeMatch && reportedByMatch;
      } else if (globalFilterValue?.length > 0 && assigneeFilter?.length > 0 && locationFilter?.length > 0 && statusFilter?.length > 0 && reportedBy?.length > 0) {
        isValid = globalValue && assignNameMatch && locationMatch && statusMatch && reportedByMatch;
      } else if (globalFilterValue?.length > 0 && assigneeFilter?.length > 0 && locationFilter?.length > 0 && caseTypeFilter?.length > 0 && reportedBy?.length > 0) {
        isValid = globalValue && assignNameMatch && locationMatch && woTypeMatch && reportedByMatch;
      } else if (globalFilterValue?.length > 0 && assigneeFilter?.length > 0 && statusFilter?.length > 0 && caseTypeFilter?.length > 0 && reportedBy?.length > 0) {
        isValid = globalValue && assignNameMatch && statusMatch && woTypeMatch && reportedByMatch;
      } else if (globalFilterValue?.length > 0 && locationFilter?.length > 0 && statusFilter?.length > 0 && caseTypeFilter?.length > 0 && reportedBy?.length > 0) {
        isValid = globalValue && locationMatch && statusMatch && woTypeMatch && reportedByMatch;
      } else if (assigneeFilter?.length > 0 && statusFilter?.length > 0 && caseTypeFilter?.length > 0 && reportedBy?.length > 0 && locationFilter?.length > 0) {
        isValid = assignNameMatch && statusMatch && woTypeMatch && reportedByMatch && locationMatch;
      }
      else if (
        assigneeFilter?.length > 0 &&
        locationFilter?.length > 0 &&
        statusFilter?.length > 0 &&
        caseTypeFilter?.length > 0 &&
        globalFilterValue?.length > 0
      ) {
        isValid =
          locationMatch &&
          statusMatch &&
          globalValue &&
          assignNameMatch &&
          woTypeMatch;
      } else if (
        assigneeFilter?.length > 0 &&
        statusFilter?.length > 0 &&
        globalFilterValue?.length > 0 &&
        caseTypeFilter?.length > 0
      ) {
        isValid = statusMatch && globalValue && assignNameMatch && woTypeMatch;
      } else if (
        assigneeFilter?.length > 0 &&
        locationFilter?.length > 0 &&
        globalFilterValue?.length > 0 &&
        caseTypeFilter?.length > 0
      ) {
        isValid =
          locationMatch && globalValue && assignNameMatch && woTypeMatch;
      } else if (
        locationFilter?.length > 0 &&
        statusFilter?.length > 0 &&
        caseTypeFilter?.length > 0 &&
        globalFilterValue?.length > 0
      ) {
        isValid = locationMatch && globalValue && statusMatch && woTypeMatch;
      } else if (
        locationFilter?.length > 0 &&
        caseTypeFilter?.length > 0 &&
        globalFilterValue?.length > 0
      ) {
        isValid = locationMatch && globalValue && woTypeMatch;
      } else if (
        assigneeFilter?.length > 0 &&
        locationFilter?.length > 0 &&
        globalFilterValue?.length > 0 &&
        statusFilter?.length > 0
      ) {
        isValid =
          locationMatch && globalValue && assignNameMatch && statusMatch;
      } else if (
        assigneeFilter?.length > 0 &&
        locationFilter?.length > 0 &&
        caseTypeFilter?.length > 0 &&
        statusFilter?.length > 0
      ) {
        isValid =
          locationMatch && woTypeMatch && assignNameMatch && statusMatch;
      } else if (
        assigneeFilter?.length > 0 &&
        statusFilter?.length > 0 &&
        caseTypeFilter?.length > 0
      ) {
        isValid = statusMatch && woTypeMatch && assignNameMatch;
      } else if (
        assigneeFilter?.length > 0 &&
        locationFilter?.length > 0 &&
        caseTypeFilter?.length > 0
      ) {
        isValid = locationMatch && woTypeMatch && assignNameMatch;
      } else if (
        assigneeFilter?.length > 0 &&
        locationFilter?.length > 0 &&
        statusFilter?.length > 0
      ) {
        isValid = locationMatch && statusMatch && assignNameMatch;
      } else if (
        locationFilter?.length > 0 &&
        statusFilter?.length > 0 &&
        caseTypeFilter?.length > 0
      ) {
        isValid = locationMatch && statusMatch && woTypeMatch;
      } else if (assigneeFilter?.length > 0 && statusFilter?.length > 0) {
        isValid = statusMatch && assignNameMatch;
      } else if (
        assigneeFilter?.length > 0 &&
        locationFilter?.length > 0 &&
        globalFilterValue?.length > 0
      ) {
        isValid = assignNameMatch && locationMatch && globalValue;
      } else if (
        statusFilter?.length > 0 &&
        caseTypeFilter?.length > 0 &&
        globalFilterValue?.length > 0
      ) {
        isValid = statusMatch && globalValue && woTypeMatch;
      } else if (
        statusFilter?.length > 0 &&
        caseTypeFilter?.length > 0 &&
        globalFilterValue?.length > 0 &&
        assigneeFilter?.length > 0
      ) {
        isValid = statusMatch && globalValue && woTypeMatch && assignNameMatch;
      } else if (
        caseTypeFilter?.length > 0 &&
        assigneeFilter?.length > 0 &&
        globalFilterValue?.length > 0
      ) {
        isValid = woTypeMatch && assignNameMatch && globalValue;
      } else if (globalFilterValue?.length > 0 && reportedBy?.length > 0 && statusFilter?.length > 0) {
        isValid = globalValue && statusMatch && reportedByMatch;
      } else if (globalFilterValue?.length > 0 && reportedBy?.length > 0 && caseTypeFilter?.length > 0) {
        isValid = globalValue && woTypeMatch && reportedByMatch;
      } else if (globalFilterValue?.length > 0 && reportedBy?.length > 0 && locationFilter?.length > 0) {
        isValid = globalValue && locationMatch && reportedByMatch;
      } else if (globalFilterValue?.length > 0 && reportedBy?.length > 0 && assigneeFilter?.length > 0) {
        isValid = globalValue && assignNameMatch && reportedByMatch;
      } else if (caseTypeFilter?.length > 0 && statusFilter?.length > 0 && reportedBy?.length > 0) {
        isValid = woTypeMatch && statusMatch && reportedByMatch;
      } else if (caseTypeFilter?.length > 0 && locationFilter?.length > 0 && reportedBy?.length > 0) {
        isValid = woTypeMatch && locationMatch && reportedByMatch;
      } else if (caseTypeFilter?.length > 0 && assigneeFilter?.length > 0 && reportedBy?.length > 0) {
        isValid = woTypeMatch && assignNameMatch && reportedByMatch;
      } else if (statusFilter?.length > 0 && locationFilter?.length > 0 && reportedBy?.length > 0) {
        isValid = statusMatch && locationMatch && reportedByMatch
      } else if (statusFilter?.length > 0 && assigneeFilter?.length > 0 && reportedBy?.length > 0) {
        isValid = statusMatch && assignNameMatch && reportedByMatch
      } else if (locationFilter?.length > 0 && assigneeFilter?.length > 0 && reportedBy?.length > 0) {
        isValid = locationMatch && assignNameMatch && reportedByMatch
      }
      else if (assigneeFilter?.length > 0 && locationFilter?.length > 0) {
        isValid = locationMatch && assignNameMatch;
      } else if (assigneeFilter?.length > 0 && globalFilterValue?.length > 0) {
        isValid = assignNameMatch && globalValue;
      } else if (statusFilter?.length > 0 && globalFilterValue?.length > 0) {
        isValid = statusMatch && globalValue;
      } else if (locationFilter?.length > 0 && globalFilterValue?.length > 0) {
        isValid = locationMatch && globalValue;
      } else if (
        locationFilter?.length > 0 &&
        statusFilter?.length > 0 &&
        globalFilterValue?.length > 0
      ) {
        isValid = locationMatch && statusMatch && globalValue;
      } else if (locationFilter?.length > 0 && statusFilter?.length > 0) {
        isValid = locationMatch && statusMatch;
      } else if (caseTypeFilter?.length > 0 && locationFilter?.length > 0) {
        isValid = woTypeMatch && locationMatch;
      } else if (caseTypeFilter?.length > 0 && statusFilter?.length > 0) {
        isValid = woTypeMatch && statusMatch;
      } else if (caseTypeFilter?.length > 0 && assigneeFilter?.length > 0) {
        isValid = woTypeMatch && assignNameMatch;
      } else if (caseTypeFilter?.length > 0 && globalFilterValue?.length > 0) {
        isValid = woTypeMatch && globalValue;
      } else if (globalFilterValue?.length > 0 && reportedBy?.length > 0) {
        isValid = globalValue && reportedByMatch;

      } else if (assigneeFilter?.length > 0 && reportedBy?.length > 0) {
        isValid = assignNameMatch && reportedByMatch;

      } else if (caseTypeFilter?.length > 0 && reportedBy?.length > 0) {
        isValid = woTypeMatch && reportedByMatch;

      } else if (statusFilter?.length > 0 && reportedBy?.length > 0) {
        isValid = statusMatch && reportedByMatch;

      } else if (locationFilter?.length > 0 && reportedBy?.length > 0) {
        isValid = locationMatch && reportedByMatch;

      }
      else if (locationFilter?.length > 0) {
        isValid = locationMatch;
      } else if (assigneeFilter.length > 0) {
        isValid = assignNameMatch;
      } else if (globalFilterValue?.length > 0) {
        isValid = globalValue;
      } else if (caseTypeFilter?.length > 0) {
        isValid = woTypeMatch;
      } else if (statusFilter?.length > 0) {
        isValid = statusMatch;
      } else if (reportedBy?.length > 0) {
        isValid = reportedByMatch;

      }

      return isValid;
    });

    return dataFilter;
  };

  useEffect(() => {
    if (locationFilter?.length > 0 || caseTypeFilter?.length > 0 || statusFilter?.length > 0 || globalFilterValue?.length > 0 || assigneeFilter.length > 0 || reportedBy?.length > 0) {

      if (workOrderDateFilter?.length > 0 || selectedDateFilter?.length > 0) {
        if (workOrderDateFilter !== "All") {
          if (selectedDateFilter?.length > 0) {
            const finalData: any = getFilterData(selectedDateFilter);
            setTableData(finalData)
          } else {
            //   const finalData: any = getFilterData(filterData);
            // setTableData(finalData)
          }
        } else {
          const data: any = getFilterData(filterData);
          setTableData(data)
        }
      } else {
        const data: any = getFilterData(filterData);
        setTableData(data)
      }
    } else {
      if (workOrderDateFilter?.length > 0) {
        //const data: any = getFilterData(tableData);
        setTableData(selectedDateFilter)
        //setFilterDateList(data)
      } else {

        if (globalFilterValue?.length > 0) {
          setTableData(tableData);
        } else {

          setTableData(filterData);

        }
      }
    }
  }, [filters?.LOCATION_DESCRIPTION?.value,
  filters?.global?.value,
  filters?.ASSIGN_NAME?.value,
  filters?.WO_TYPE?.value, filters?.STATUS_DESCRIPTION?.value,
    filterData, filterData, filters?.ASSIGN_NAME?.value, workOrderDateFilter, statusFilter, filters?.REPORTED_NAME?.value]);

  const clearFilterValue = () => {
    setCaseTypeFilter([])
    setLocationFilter([])
    setStatusFilter([]);
    setGlobalFilterValue("")
    setAssigneeFilter([])
  }
  const getDateFilter = (values: any) => {
    const weekFilter1 = filterData.filter((e: any) => {
      let workOrdeDate: any = e?.SERVICE_CREATED_TIME.split(' ')[0];
      let filteredData = values?.includes(workOrdeDate)

      return filteredData
    });

    setSelectedDateFilter(weekFilter1)
    const data: any = getFilterData(weekFilter1)
    setTableData(data)
  }

  const resetFilter = (value: any) => {
    let values: any = [];
    if (workOrderDateFilter === "All") {
      values.push([])
      setTableData(tableData)
    } else if (selectedDate === "Today") {
      values.push(moment(new Date()).format(dateFormat()));
    } else if (workOrderDateFilter === "This week") {

      let current = moment();
      let lastSunday = current.clone().startOf('week');

      for (let i = 0; i < 7; i++) {
        values.push(lastSunday.clone().add(i, 'days').format(dateFormat()));
      }

    } else if (workOrderDateFilter === 'Custom range') {
    }

    if (value?.length !== 0) {
      if (values?.length !== 0 && workOrderDateFilter !== "All") {
        if (workOrderDateFilter === "Today") {
          getDateFilter(values)
        } else if (workOrderDateFilter === "This week") {
          getDateFilter(values)

        }

      }
      else {

        if (assigneeFilter?.length > 0 || locationFilter?.length > 0 || statusFilter?.length > 0 || globalFilterValue?.length > 0 || caseTypeFilter?.length > 0 || reportedBy?.length > 0) {
          if (globalStatus) {
            const data: any = getFilterData(tableData);
            setTableData(data)
          } else {
            const data: any = getFilterData(filterData);
            setTableData(data)
            // setFilterDateList(data)
          }
        } else {
          setTableData(filterData)
        }
      }
    }
  }

  const handleCaseTypeFilter = (value: any) => {
    setCaseTypeFilter(value);

    const data: any = value.map((item: any) =>
      item.split('(')[0].trim()
    );
    value = data
    setFilters((prev: any) => {
      return {
        ...prev,
        WO_TYPE: { value, matchMode: FilterMatchMode.IN },
      };
    });
    dispatch(updateFilter({ key: "WO_TYPE", value }));
    if (value?.length > 0) {
      resetFilter(value)
    } else {
      if (assigneeFilter?.length > 0 || statusFilter?.length > 0 || globalFilterValue?.length > 0 || locationFilter?.filter > 0 || reportedBy?.length > 0) {
        if (workOrderDateFilter?.length > 0) {
          const data: any = getFilterData(selectedDateFilter);
          setTableData(data)
        } else {
          const data: any = getFilterData(filterData);
          setTableData(data)
        }
      } else {
        if (workOrderDateFilter?.length > 0) {
          if (selectedDateFilter?.length > 0) {
            setTableData(selectedDateFilter)
          } else {
            setTableData(filterData)
          }
        } else {
          setTableData(filterData)
        }
      }
    }
  };


  const handleAssigneeFilter = (e: any) => {
    setAssigneeFilter(e);
    Assign_status = true;
    setFilters((prev: any) => {
      return {
        ...prev,
        ASSIGN_NAME: { value, matchMode: FilterMatchMode.IN },
      };
    });

    const value = e;
    let _filters = { ...filters };

    _filters["ASSIGN_NAME"].value = e;
    dispatch(updateFilter({ key: "ASSIGN_NAME", value }));
    setFilters(_filters);
    if (e?.length > 0) {
      resetFilter(value)
    } else {
      if (locationFilter?.length > 0 || statusFilter?.length > 0 || globalFilterValue?.length > 0 || caseTypeFilter?.length > 0) {
        if (workOrderDateFilter?.length > 0) {
          const data: any = getFilterData(selectedDateFilter);
          setTableData(data)
        } else {
          const data: any = getFilterData(filterData);
          setTableData(data)
        }
      } else {
        if (workOrderDateFilter?.length > 0) {
          if (selectedDateFilter?.length > 0) {
            setTableData(selectedDateFilter)
          } else {
            setTableData(filterData)
          }
        } else {
          setTableData(filterData)
        }
      }
    }

  };

  const handleReporterFilter = (e: any) => {
    setReportedBy(e);
    const value = e;
    setFilters(value);
    setFilters((prev: any) => {
      return {
        ...prev,
        REPORTED_NAME: { value, matchMode: FilterMatchMode.IN },
      };
    });
    dispatch(updateFilter({ key: "REPORTED_NAME", value }));



    if (e?.length > 0) {
      resetFilter(value);
    } else {
      if (
        locationFilter?.length > 0 ||
        statusFilter?.length > 0 ||
        globalFilterValue?.length > 0 ||
        caseTypeFilter?.length > 0
      ) {
        if (workOrderDateFilter?.length > 0) {
          const data: any = getFilterData(selectedDateFilter);
          setTableData(data);
        } else {
          const data: any = getFilterData(filterData);
          setTableData(data);
        }
      } else {
        if (workOrderDateFilter?.length > 0) {
          if (selectedDateFilter?.length > 0) {
            setTableData(selectedDateFilter);
          } else {
            setTableData(filterData);
          }
        } else {
          setTableData(filterData);
        }
      }
    }
  };

  const handleLocationFilter = (value: any) => {
    setLocationFilter(value);
    setFilters((prev: any) => {
      return {
        ...prev,
        LOCATION_DESCRIPTION: { value, matchMode: FilterMatchMode.IN },
      };
    });
    dispatch(updateFilter({ key: "LOCATION_DESCRIPTION", value }));
    if (value?.length > 0) {
      resetFilter(value)
    } else {
      if (assigneeFilter?.length > 0 || statusFilter?.length > 0 || globalFilterValue?.length > 0 || caseTypeFilter?.filter > 0) {
        if (workOrderDateFilter?.length > 0) {

          const data: any = getFilterData(selectedDateFilter);
          setTableData(data)
        } else {
          const data: any = getFilterData(filterData);
          setTableData(data)
        }
      } else {
        if (workOrderDateFilter?.length > 0) {
          if (selectedDateFilter?.length > 0) {
            setTableData(selectedDateFilter)
          } else {
            setTableData(filterData)
          }
        } else {
          setTableData(filterData)
        }
      }
    }

  };

  const onGlobalFilterChange = (e: any) => {
    Assign_status = false
    gloabalStatus = true
    const value = e.target.value;
    setGlobalFilterValue(value);
    let _filters = { ...filters };
    _filters["global"].value = value;
    setFilters(_filters);
    dispatch(updateFilter({ key: "global", value }));
    if (value?.length > 0) {
      resetFilter(value)
    } else {
      if (assigneeFilter?.length > 0 || locationFilter?.length > 0 || globalFilterValue?.length > 0 || caseTypeFilter?.filter > 0) {
        if (workOrderDateFilter?.length > 0) {
          const data: any = getFilterData(selectedDateFilter);
          setTableData(data)
        } else {
          const data: any = getFilterData(filterData);
          setTableData(data)
        }
      } else {
        if (workOrderDateFilter?.length > 0) {
          if (selectedDateFilter?.length > 0) {
            setTableData(selectedDateFilter)
          } else {
            setTableData(filterData)
          }
        } else {
          setTableData(filterData)
        }
      }
    }
  };


  const handleStatusFilter = (value: any) => {
    Assign_status = false
    setStatusFilter(value);
    setFilters((prev: any) => {
      return {
        ...prev,
        STATUS_DESCRIPTION: { value, matchMode: FilterMatchMode.IN },
      };
    });
    dispatch(updateFilter({ key: "STATUS_DESCRIPTION", value }));
    if (value?.length > 0) {
      resetFilter(value)
    } else {
      if (assigneeFilter?.length > 0 || locationFilter?.length > 0 || globalFilterValue?.length > 0 || caseTypeFilter?.filter > 0) {
        if (workOrderDateFilter?.length > 0) {
          const data: any = getFilterData(selectedDateFilter);
          setTableData(data)
        } else {
          const data: any = getFilterData(filterData);
          setTableData(data)
        }
      } else {
        if (workOrderDateFilter?.length > 0) {
          if (selectedDateFilter?.length > 0) {
            setTableData(selectedDateFilter)
          } else {
            setTableData(filterData)
          }
        } else {
          setTableData(filterData)
        }
      }
    }
  };

  //------------Clear filter code ----------------
  const resetFilters = () => {
    setStatusFilter([]);
    setCaseTypeFilter([])
    handleLocationFilter([]);
    setReportedBy([])
    setFilters(filterDefaultValues);
    setAssigneeFilter([]);
    setWorkOrderDateFilter(null);
    setSelectedDate(null);
    setWODate(null);
    setFirstDateSelected(false)
    setMinDate(null)
    setSelectedCustome(false);
    setSelectedDateFilter([])
    dispatch(clearFilters())
    if (globalFilterValue?.length > 0) {
      setTableData(tableData)
    } else {
      setTableData(filterData)
    }
  };

  const hasActiveFilters = (
    caseTypeFilter?.length !== 0 ||
    locationFilter?.length !== 0 ||
    assigneeFilter?.length !== 0 ||
    workOrderDateFilter?.length > 0 ||
    statusFilter?.length !== 0
    || reportedBy?.length !== 0
  );

  const tableHeaderFun: any = () => {
    const tData = workOrderDateFilter === "Custom range" ? originalList : filterData;
    const statusOptions = tData?.reduce(

      (uniqueStatus: any[], item: { STATUS_DESCRIPTION: any }) => {
        if (!uniqueStatus.includes(item.STATUS_DESCRIPTION)) {
          uniqueStatus.push(item.STATUS_DESCRIPTION);
        }
        return uniqueStatus;
      },
      []
    );

    const caseTypeOptions = Array.from(
      tData?.reduce((uniqueStatus: any, item: any) => {

        const data = `${item.WO_TYPE_NAME}(${item.WO_TYPE})`;
        uniqueStatus.add(data);
        return uniqueStatus;
      }, new Set())
    );

    const assigneeOptions = technicianList?.reduce(
      (uniqueStatus: any[], item: { USER_NAME: any }) => {
        if (!uniqueStatus.includes(item.USER_NAME)) {
          uniqueStatus.push(item.USER_NAME);
        }
        return uniqueStatus;
      },
      []
    );

    const reporterOptions = tData?.reduce(
      (uniqueStatus: any[], item: { REPORTED_NAME: any }) => {
        if (!uniqueStatus.includes(item.REPORTED_NAME)) {
          if (item.REPORTED_NAME !== null) {
            uniqueStatus.push(item.REPORTED_NAME);
          }

        }
        return uniqueStatus;
      },
      []
    );


    const locationOptions = tData?.reduce(
      (uniqueStatus: any[], item: { LOCATION_DESCRIPTION: any }) => {
        const trimmedLocation = item.LOCATION_DESCRIPTION?.trim();  // Trim the LOCATION_DESCRIPTION

        if (trimmedLocation && !uniqueStatus.includes(trimmedLocation)) {
          uniqueStatus.push(trimmedLocation);
        }
        return uniqueStatus;
      },
      []
    );

    const setSelectedDateFun = (event: any) => {
      setSelectedCustome(false);
      if (event.code === "CR") {
        setSelectedCustome(true);
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
        setMinDate(null)


      }
    }

    const panelFooterTemplate = (handleValue: any) => {
      return (
        <div className="py-2 px-3">
          <label onClick={() => handleValue([])}>Clear Selection</label>
        </div>
      );
    };
    return (
      <>
        <div className="flex flex-wrap gap-2">
          <IconField iconPosition="right" className="w-64">
            <InputText
              type="search"
              value={globalFilterValue}
              onChange={onGlobalFilterChange}
              placeholder="Search"
              className="w-64"
            />
          </IconField>
          <Dropdown
            value={selectedDate}
            onChange={(e: any) => {
              setCaseTypeFilter([])
              setLocationFilter([])
              setStatusFilter([]);
              setAssigneeFilter([])
              setGlobalFilterValue("")
              let value = e.target.value;
              dispatch(updateFilter({ key: "WO_DATE", value }));

              const filteredDropdown = e.target.value;
              const inputString = filteredDropdown;
              let date_filter: any = inputString;
              setWorkOrderDateFilter(inputString)
              setSelectedDate(filteredDropdown);
              setSelectedDateFun(filteredDropdown);
              if (date_filter === "Today") {
                if (assigneeFilter?.length > 0 || locationFilter?.length > 0 || statusFilter?.length > 0 || globalFilterValue?.length > 0 || caseTypeFilter?.length > 0 || reportedBy?.length > 0) {

                  const todayFilter1 = filterData?.filter((e: any) => {
                    let current: any = (moment(new Date()).format(dateFormat()))
                    let workOrdeDate: any = moment(e.SERVICE_CREATED_TIME).format(dateFormat())
                    var filteredData1 = workOrdeDate === current;
                    return filteredData1
                  });

                  setTableData(todayFilter1)
                  setSelectedDateFilter(todayFilter1)

                } else {
                  const todayFilter1 = todayFilter?.filter((e: any) => {
                    let current: any = (moment(new Date()).format(dateFormat()))

                    let workOrdeDate: any = e?.SERVICE_CREATED_TIME.split(' ')[0];
                    var filteredData = workOrdeDate === current;
                    return filteredData
                  });
                  //  setFilterData(todayFilter1)
                  setTableData(todayFilter1)
                  setSelectedDateFilter(todayFilter1)
                }
              } else if (date_filter === "This week") {
                let lastWeekDates: any = [];
                let current = moment();
                // let lastSunday = current.clone().subtract(1, 'weeks').startOf('week');
                let lastSunday = current.clone().startOf('week');
                for (let i = 0; i < 7; i++) {
                  lastWeekDates.push(lastSunday.clone().add(i, 'days').format(dateFormat()));
                }

                if (assigneeFilter?.length > 0 || locationFilter?.length > 0 || statusFilter?.length > 0 || globalFilterValue?.length > 0 || caseTypeFilter?.length > 0 || reportedBy?.length > 0) {
                  // setFilterDateList(tableData)
                  const weekFilter1 = filterData?.filter((e: any) => {
                    let workOrdeDate: any = e?.SERVICE_CREATED_TIME.split(' ')[0];
                    let filteredData = lastWeekDates?.includes(workOrdeDate)
                    return filteredData
                  });
                  if (weekFilter1?.length > 0) {
                    setSelectedDateFilter(weekFilter1)

                    setTableData(weekFilter1)
                    setWeekFilter(weekFilter1);

                  } else {
                    setTableData([])

                  }
                } else {

                  const weekFilter1 = weekFilter.filter((e: any) => {
                    let workOrdeDate: any = e?.SERVICE_CREATED_TIME.split(' ')[0];
                    let filteredData = lastWeekDates?.includes(workOrdeDate);
                    return filteredData;
                  });

                  if (weekFilter1?.length > 0) {
                    setTableData(weekFilter1);
                    setWeekFilter(weekFilter1);
                    setSelectedDateFilter(weekFilter1);
                  } else {
                    setTableData([]);
                    setSelectedDateFilter([]);
                  }
                }
              }
              else if (date_filter === "All") {
                if (assigneeFilter?.length > 0 || locationFilter?.length > 0 || statusFilter?.length > 0 || caseTypeFilter?.length > 0 || globalFilterValue?.length > 0 || reportedBy?.length > 0) {
                  const data: any = getFilterData(filterData)
                  setTableData(data);
                  setFirst(0);
                } else {
                  setTableData(filterData);
                  setFirst(0);
                }
              } else if (date_filter === "Custom range") {
                setSelectedCustome(true)

              }
            }}
            options={datelist}
            optionLabel={"value"}
            itemTemplate={(option) => (
              <div className="flex justify-between">
                {option.value !== 'Custom range' ?
                  <>
                    <div>

                      {option.value}</div> <div className="ml-7" style={{ color: "#7E8083" }}>{option.dateData}</div>
                  </> :
                  <>
                    <div onClick={() => setSelectedCustome(true)} style={{ display: "flex", width: "100%" }}>{option.value}
                      <div className="ml-7" style={{ color: "#7E8083", marginLeft: 140 }} onClick={() => setSelectedCustome(true)}>{">"}</div>
                    </div>
                  </>}
              </div>)}
            placeholder="Date"
            className="w-42"
          />
          <MultiSelect
            value={caseTypeFilter}
            onChange={(e: any) => handleCaseTypeFilter(e.value)}
            options={caseTypeOptions}
            filter
            maxSelectedLabels={1}
            optionLabel={''}
            placeholder="Case Type"
            className="w-42"
            panelFooterTemplate={panelFooterTemplate(handleCaseTypeFilter)}
          />
          <MultiSelect
            value={locationFilter}
            onChange={(e: any) => handleLocationFilter(e.value)}
            options={locationOptions}
            filter
            maxSelectedLabels={1}
            optionLabel={locationOptions?.LOCATION_DESCRIPTION}
            placeholder="Location"
            className="w-42"
            panelFooterTemplate={panelFooterTemplate(handleLocationFilter)}
          />

          <MultiSelect
            value={statusFilter}
            onChange={(e: any) => handleStatusFilter(e.value)}
            options={statusOptions}
            filter
            maxSelectedLabels={1}
            optionLabel={statusOptions?.STATUS_DESCRIPTION}
            placeholder="Status"
            className="w-42"
            panelFooterTemplate={panelFooterTemplate(handleStatusFilter)}
          />
          {facility_type === "R" && (<MultiSelect
            value={reportedBy}
            onChange={(e: any) => handleReporterFilter(e.value)}
            options={reporterOptions}
            filter
            maxSelectedLabels={1}
            optionLabel={reporterOptions?.REPORTED_NAME}
            placeholder="Reporter"
            className="w-42"
            panelFooterTemplate={panelFooterTemplate(handleReporterFilter)}
          />)}
          {facility_type === "R" && (<MultiSelect
            value={assigneeFilter}
            onChange={(e: any) => handleAssigneeFilter(e.value)}
            options={assigneeOptions}
            filter
            maxSelectedLabels={1}
            optionLabel={assigneeOptions?.ASSIGN_NAME}
            placeholder="Assignee"
            className="w-42"
            panelFooterTemplate={panelFooterTemplate(handleAssigneeFilter)}
          />)}




          {hasActiveFilters && (<Button
            type="button"
            label="Clear Filter"
            onClick={() => resetFilters()}
          />
          )}
        </div>
        {selectedCustomeDate && (
          <Card className="w-3/5 absolute z-10">
            <div>
              <Calendar
                value={dateWO}
                onChange={(e: any) => {
                  getCalendarRangeDate(e)
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
                label={t("Cancel")}
                onClick={() => {
                  setSelectedCustome(false);
                  resetFilters();
                }}
              />
              <Buttons
                className="Primary_Button"
                label={t("Select")}
                onClick={() => {
                  (async function () {
                    await handlerCustomDateRange()
                  })()

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
          width: "150px",
        }}
      >
        <p>{params.STATUS_DESCRIPTION}</p>
      </div>
    );
  };
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(15);
  const onPageChange = (event: any) => {
    setFirst(event.first);
    setRows(event.rows);
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

    const payload: any = {
      FUNCTION_CODE: currentMenu?.FUNCTION_CODE
    }
    const res = await callPostAPI(ENDPOINTS.GET_EXCEL_DOWNLOADDATA, payload);
    if (res?.FLAG === 1) {
      if (res?.DOWNLOADDATA?.length > 0) {
        if (assigneeFilter?.length > 0 || locationFilter?.length > 0 || statusFilter?.length > 0 || globalFilterValue?.length > 0 || workOrderDateFilter?.length > 0 || caseTypeFilter?.length > 0 || reportedBy?.length > 0) {
          const matchedServiceRequests: any = res?.DOWNLOADDATA.filter((serviceRequest: any) => {
            return tableData.some((tableRow: any) => tableRow.SER_REQ_NO === serviceRequest["Service Request Number"]);
          });
          if (matchedServiceRequests?.length > 0) {
            ExportCSV(matchedServiceRequests, currentMenu?.FUNCTION_DESC);
          } else {
            toast.error("No Data Found");
          }
        } else {
          ExportCSV(res?.DOWNLOADDATA, currentMenu?.FUNCTION_DESC);
        }
      } else {
        toast.error("No Data Found");
      }
    } else {
      toast.error("No Data found")
    }


  };

  useEffect(() => {

    if (currentMenu?.FUNCTION_CODE) {

      if (location?.state === "workorder") {
        (async function () {
          await getAPI();
        })();

        setLocationFilter(filterGroup?.LOCATION_DESCRIPTION?.value);
        if (filterGroup?.ASSIGN_NAME?.value) {
          setAssigneeFilter(filterGroup.ASSIGN_NAME.value);
        } else {
          setAssigneeFilter([]);
        }
        if (filterGroup?.WO_TYPE?.value) {
          setCaseTypeFilter(filterGroup.WO_TYPE.value);
        }
        if (filterGroup?.STATUS_DESC?.value) {
          setStatusFilter(filterGroup?.STATUS_DESC?.value)
        }
        setWorkOrderDateFilter(filterGroup.WO_DATE.value)
        setSelectedDate(filterGroup.WO_DATE.value)

      } else {
        (async function () {
          await getAPI();
        })();
      }

    }
  }, [location.state, selectedFacility, search]);

  useEffect(() => {
    setFirst(0);
  }, [filterData, rows]);

  const GetWorkOrderFormWoId = (rowItem: any) => {
    localStorage.setItem("Id", JSON.stringify(rowItem));
    localStorage.setItem("WO_ID", JSON.stringify(rowItem?.WO_ID));
    navigate(PATH?.WORKORDERMASTER + "?edit=")

  };
  return (
    <>
      <>
        <div className="mb-4 flex flex-wrap justify-between">
          <div>
            <h6 className="Text_Primary mr-2">{"All Service Request"}</h6>
          </div>
          <div>
            <Buttons
              className="Secondary_Button me-2"
              label={t("Export")}
              onClick={handlerDownload}
            />
            {currentMenu?.ADD_RIGHTS === "True" && (<Buttons
              className="Primary_Button me-2"
              label={t("Add Service Request")}
              onClick={() => {
                navigate(`${appName}/servicerequestlist?add=`);
              }}
            />)}

          </div>
        </div>

        <DataTable
          value={tableData?.slice(first, first + rows)}
          header={tableHeaderFun}
          showGridlines
          emptyMessage={t("No Data found.")}
          selectionMode={"checkbox"}
          globalFilterFields={[
            "LOCATION_DESCRIPTION",
            "SEVERITY",
            "SER_REQ_NO",
            "WO_NO",
            "STATUS_DESCRIPTION",
            "SERVICE_CREATED_TIME",
            "SERVICE_GROUP_REQ",
            "ASSIGN_NAME",
            "WO_DATE"
          ]}
          selection={selectedWoList}
          onSelectionChange={(e) =>
            setSelectedWoList(e.value)}
        >
          <Column
            selectionMode="multiple"
            headerStyle={{ width: "3rem" }}
          ></Column>
          <Column
            field="WO_TYPE"
            header="Type"
            style={{ minWidth: "100px" }}
          ></Column>
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
                          localStorage.setItem("Id", JSON.stringify(rowItem));
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
                  <label>
                    <i
                      className="pi pi-chevron-circle-up mr-2 "
                      style={{ color: rowData?.PRIORITY_COLOURS }}
                    ></i>
                    {rowData?.SEVERITY}
                  </label>
                </>
              );
            }}
          ></Column>
          <Column
            field="WO_NO"
            header="Work Order"
            style={{ minWidth: "80px" }}
            body={(rowData: any) => {
              const rowItem: any = { ...rowData };
              return (
                <>
                  {decryptData(localStorage.getItem(LOCALSTORAGE?.ROLETYPECODE)
                  ) !== "O" && decryptData(
                    localStorage.getItem(LOCALSTORAGE?.ROLETYPECODE)
                  ) !== "H" ?

                    <> {tableHeader && (
                      <label
                        className="cursor-pointer"
                        onClick={() => GetWorkOrderFormWoId(rowItem)}
                      >
                        {rowData.WO_NO}
                      </label>
                    )}</> : <>{rowData.WO_NO}</>}
                </>
              );
            }}
          ></Column>

          <Column field="SERVICE_GROUP_REQ"
            header="Group > Issue"
            style={{ minWidth: "150px" }}
          ></Column>
          <Column
            field="LOCATION_DESCRIPTION"
            header="Location"
            style={{ minWidth: "150px" }}
          ></Column>
          <Column
            field="STATUS_DESCRIPTION"
            header="Status"
            style={{ minWidth: "100px" }}
            body={statusBody}
          ></Column>
          {facility_type === "R" && (<Column
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
          ></Column>)}
          {facility_type === "R" && (<Column
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
          ></Column>)}


          <Column
            field="SERVICE_CREATED_TIME"
            header="Date"
            style={{ minWidth: "80px" }}
          ></Column>
        </DataTable>
        <div className="flex p-4 bg-white flex-row gap-3a justify-between">
          {tableData?.length > 0 && <div className="mt-3 Text_Secondary Input_label">
            {`Showing ${first + 1} - ${tableData?.slice(first, first + rows)?.length + first}  of ${tableData?.length}`}
          </div>}
          <Paginator
            first={first}
            rows={rows}
            totalRecords={tableData?.length}
            onPageChange={onPageChange}
            currentPageReportTemplate="Items per Page:-"
            rowsPerPageOptions={[15, 25, 50]}
            alwaysShow={false}
            template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
          ></Paginator>
        </div>
      </>
    </>
  )
};



export default ServiceRequestReal;