import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { callPostAPI } from "../../../services/apis";
import { ENDPOINTS } from "../../../utils/APIEndpoints";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import TableListLayout from "../../../layouts/TableListLayout/TableListLayout";
import { useForm } from "react-hook-form";
import LoaderS from "../../../components/Loader/Loader";
import WorkOrderDetailForm from "./WorkOrderDetailForm";
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
import moment from "moment";
import { dateFormat, LOCALSTORAGE, dateFormat1, formateDate } from "../../../utils/constants";
import { Card } from "primereact/card";
import { appName } from "../../../utils/pagePath";

const WorkorderMaster = (props: any) => {
  const filterDefaultValues: any = {
    ASSIGN_NAME: { value: null, matchMode: FilterMatchMode.CONTAINS },
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    WO_TYPE: { value: null, matchMode: FilterMatchMode.IN },
    STATUS_DESC: { value: null, matchMode: FilterMatchMode.IN },
    LOCATION_NAME: { value: null, matchMode: FilterMatchMode.IN },
    SEVERITY: { value: null, matchMode: FilterMatchMode.IN },
    WO_NO: { value: null, matchMode: FilterMatchMode.IN }
  };

  let { pathname } = useLocation();
  const { t } = useTranslation();
  const navigate: any = useNavigate()
  const [selectedWoList, setSelectedWoList] = useState<any>(null);
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [selectedFacility, menuList]: any = useOutletContext();
  const [showLoader, setShowLoader] = useState<boolean>(true);
  let [tableData, setTableData] = useState<any>([]);
  const [originalList, setOriginalList] = useState<any>();
  const startOfPreviousWeek = moment().subtract(1, 'weeks').startOf('week').format(dateFormat1());
  const endOfPreviousWeek = moment().subtract(1, 'weeks').endOf('week').format(dateFormat1());
  const endOfPreviousWeekYear = moment().subtract(1, 'weeks').endOf('week').format('YYYY');
  const datelist = [{ label: "All", value: "All", dateData: "" },
  { label: "Today", value: `Today`, dateData: moment(new Date()).format(dateFormat()) },
  { label: "This Week", value: `This Week`, dateData: `${startOfPreviousWeek}${(" ")} to${(" ")} ${endOfPreviousWeek},${endOfPreviousWeekYear} ` },
  { label: "Custom Range", value: "Custom Range", dateData: "" }];
  let tableHeader: any = props?.tableHeader?.headerName !== "User Role Master";
  const [statusFilter, setStatusFilter] = useState<any>([]);
  const [caseTypeFilter, setCaseTypeFilter] = useState<any>([]);
  const [locationFilter, setLocationFilter] = useState<any>([]);
  const [assigneeFilter, setAssigneeFilter] = useState<any>([]);
  const [selectedDate, setSelectedDate] = useState<any | null>(null);
  const [selectedCustomeDate, setSelectedCustome] = useState<boolean>(false);
  const [filterData, setFilterData] = useState<any | null>([]);
  const [dateWO, setWODate] = useState(null);
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(15);
  const [filters, setFilters] = useState(filterDefaultValues);
  const [selectedDateFilter, setSelectedDateFilter] = useState<any | null>([])
  const [filterStatus, setFilterStatus] = useState<any | null>(false)
  const [filterDate, setFilterDate] = useState<any | null>([])
  const [startDate, setStartDate] = useState<any | null>()
  const [endDate, setEndDate] = useState<any | null>()
  const [technicianList, setTechnicianList] = useState<any | null>([])
  const [workOrderFilter, setWorkOrderFilter] = useState<any | null>([])
  const [workOrderDateFilter, setWorkOrderDateFilter] = useState<any | null>(null)
  const [customDateStatus, setCustomDateStatus] = useState<any | null>(false)
  const [assigneeStatus, setAssigneeStatus] = useState<any | null>(false)
  const [assignStatusFilter, setAssignStatusFilter] = useState<any | null>([])
  const[dateFilterList, setDateFilterList]=useState<any|null>([])
  const[todayFilter, setTodayFilter]=useState<any|null>([]);
  const[weekFilter, setWeekFilter]=useState<any|null>([])
  const[filterDateList,setFilterDateList]=useState<any|null>([])
  const {
    watch,
  } = useForm({
    defaultValues: {
      FILTER_BY: "",
    },
    mode: "onSubmit",
  });
  var Assign_status: boolean = false
  const filterByWatch: any = watch("FILTER_BY");

  const currentMenu = menuList
    ?.flatMap((menu: any) => menu?.DETAIL)
    .filter((detail: any) => detail.URL === pathname)[0];

  const getAPI = async () => {
    setShowLoader(true);
    try {
      const res = await callPostAPI(
        ENDPOINTS.GET_EVENTMASTER,
        { FILTER_BY: 100 },
        currentMenu?.FUNCTION_CODE
      );
      const res1 = await callPostAPI(
        ENDPOINTS.GET_TECHNICIANLIST,
        {},
        currentMenu?.FUNCTION_CODE
      );
      if (res1?.FLAG === 1) {
        setTechnicianList(res1?.TECHLIST)
      }

      if (res?.FLAG === 1) {
        const facilityData: any = JSON.parse(
          localStorage.getItem(LOCALSTORAGE.FACILITYID)!
        );
        const updatedServiceRequestList = formatServiceRequestList(res.HELPDESKMASTERSLIST, facilityData);
        setTableData(updatedServiceRequestList);
        setFilterData(updatedServiceRequestList);
        setOriginalList(updatedServiceRequestList);
        props?.setData(updatedServiceRequestList);
        localStorage.setItem("currentMenu", JSON.stringify(currentMenu));
        setShowLoader(false);
      } else {
        setTableData([]);
        setFilterData([]);
        setShowLoader(false);
      }
    } catch (error: any) {
      toast.error(error);
      setShowLoader(false);
    }
  };

  const formatServiceRequestList = (list: any, facilityData: any) => {
    const DATE_FORMAT = `${dateFormat()}, HH:mm`;


    let WORK_ORDER_LIST = list;

    WORK_ORDER_LIST = WORK_ORDER_LIST.map((element: any) => {
      const formattedDate = moment(element.WO_CREATED_TIME, DATE_FORMAT).format(DATE_FORMAT);
      return {
        ...element,
        WO_CREATED_TIME: formateDate(element.WO_CREATED_TIME),
        WO_CREATED:moment(element?.WO_CREATED_TIME).format("DD-MM-YYYY")
      };
    });
    return WORK_ORDER_LIST;
  };

  //----------------This is filter function--------------------------
  const getFilterArray = () => {
    const concatenatedValues = Object.values(filters)
      .map((item: any) => item.value)
      .filter(value => value && (Array.isArray(value) ? value.length > 0 : true))
      .reduce((acc, value) => {

        return acc.concat(Array.isArray(value) ? value : [value]);
      }, []);
    return concatenatedValues;
  }

  const getFilterData = (tableData: any) => {
    const concatenatedValues: any = getFilterArray()
    const normalizedCriteria :any= concatenatedValues.map((c: any) => c.trim().toLowerCase());
     setWorkOrderFilter(normalizedCriteria)
    const dataFilter: any = tableData?.filter((serviceRequest: any) => {
  
      const normalizedWOType = (serviceRequest.WO_TYPE_NAME || '').trim().toLowerCase();
      const normalizedLocationName = (serviceRequest.LOCATION_NAME || '').trim().toLowerCase();
      const normalizedAssignName = (serviceRequest.ASSIGN_NAME || '').trim().toLowerCase();
      const normalizedStatus = (serviceRequest.STATUS_DESC || '').trim().toLowerCase();
      const value = filters?.global?.value?.toLowerCase();
      const globalValue: any = Object.values(serviceRequest).some((val: any) =>
        val?.toString()?.toLowerCase()?.includes(value));
     
      const woTypeMatch = normalizedCriteria.includes(normalizedWOType);
      const locationMatch = normalizedCriteria.includes(normalizedLocationName);
      const statusMatch = normalizedCriteria.includes(normalizedStatus);
      const assignNameMatch = normalizedCriteria.some((name: string) =>
        normalizedAssignName.includes(name.trim().toLowerCase())
      );
        
      let isValid = false;
      if (assigneeFilter?.length > 0 && locationFilter?.length > 0 && statusFilter?.length > 0 && caseTypeFilter?.length > 0 && globalFilterValue?.length > 0) {
        isValid = locationMatch && statusMatch && globalValue && assignNameMatch && woTypeMatch;
      } else if (assigneeFilter?.length > 0 && statusFilter?.length > 0 && globalFilterValue?.length > 0 && caseTypeFilter?.length > 0) {
        isValid = statusMatch && globalValue && assignNameMatch && woTypeMatch;
      } else if (assigneeFilter?.length > 0 && locationFilter?.length > 0 && globalFilterValue?.length > 0 && caseTypeFilter?.length > 0) {
        isValid = locationMatch && globalValue && assignNameMatch && woTypeMatch;

      }else if(locationFilter?.length > 0 && statusFilter?.length > 0 && caseTypeFilter?.length > 0 && globalFilterValue?.length > 0){
        isValid = locationMatch && globalValue && statusMatch && woTypeMatch;
      }else if(locationFilter?.length > 0  && caseTypeFilter?.length > 0 && globalFilterValue?.length > 0){
        isValid = locationMatch && globalValue &&  woTypeMatch;
      }else if(assigneeFilter?.length > 0 && locationFilter?.length > 0 && globalFilterValue?.length > 0 ){
        isValid = assignNameMatch && globalValue &&  locationFilter;
      }else if(statusFilter?.length > 0 && caseTypeFilter?.length > 0 && globalFilterValue?.length > 0){
        isValid = statusMatch && globalValue &&  woTypeMatch;
      }else if(caseTypeFilter?.length > 0 && assigneeFilter?.length > 0 && globalFilterValue?.length > 0 ){
        isValid = woTypeMatch && assignNameMatch && globalValue;
      }
      else if (assigneeFilter?.length > 0 && locationFilter?.length > 0 && globalFilterValue?.length > 0 && statusFilter?.length > 0) {
        isValid = locationMatch && globalValue && assignNameMatch && statusMatch;
      } else if (assigneeFilter?.length > 0 && locationFilter?.length > 0 && caseTypeFilter?.length > 0 && statusFilter?.length > 0) {
        isValid = locationMatch && woTypeMatch && assignNameMatch && statusMatch;
      } else if (assigneeFilter?.length > 0 && statusFilter?.length > 0 && caseTypeFilter?.length > 0) {
        isValid = statusMatch && woTypeMatch && assignNameMatch;
      } else if (assigneeFilter?.length > 0 && locationFilter?.length > 0 && caseTypeFilter?.length > 0) {
        isValid = locationMatch && woTypeMatch && assignNameMatch;
      } else if (assigneeFilter?.length > 0 && locationFilter?.length > 0 && statusFilter?.length > 0) {
        isValid = locationMatch && statusMatch && assignNameMatch;
      } else if (locationFilter?.length > 0 && statusFilter?.length > 0 && caseTypeFilter?.length > 0) {
        isValid = locationMatch && statusMatch && woTypeMatch;
      } else if (assigneeFilter?.length > 0 && statusFilter?.length > 0) {
        isValid = statusMatch && assignNameMatch;
      } else if (assigneeFilter?.length > 0 && locationFilter?.length > 0) {
        isValid = locationMatch && assignNameMatch;
      } else if (assigneeFilter?.length > 0 && globalFilterValue?.length > 0) {
        isValid = assignNameMatch && globalValue;
      }
      else if (statusFilter?.length > 0 && globalFilterValue?.length > 0) {
      
        isValid = statusMatch && globalValue;
      } else if (locationFilter?.length > 0 && globalFilterValue?.length > 0) {

        isValid = locationMatch && globalValue;
      } else if (locationFilter?.length > 0 && statusFilter?.length > 0 && globalFilterValue?.length > 0) {

        isValid = locationMatch && statusMatch && globalValue;
      }
      else if (locationFilter?.length > 0 && statusFilter?.length > 0) {

        isValid = locationMatch && statusMatch
      } 
       else if (caseTypeFilter?.length > 0 && locationFilter?.length > 0) {
        isValid = woTypeMatch && locationMatch
      }
      else if (caseTypeFilter?.length > 0 && statusFilter?.length > 0) {
        isValid = woTypeMatch && statusMatch
      } else if (caseTypeFilter?.length > 0 && assigneeFilter?.length > 0) {
        isValid = woTypeMatch && assignNameMatch
      } else if (caseTypeFilter?.length > 0 && globalFilterValue?.length > 0) {
        isValid = woTypeMatch && globalValue
      }
      else if (locationFilter?.length > 0) {
        isValid = locationMatch;
      } else if (assigneeFilter.length > 0) {
        isValid = assignNameMatch
      } else if (globalFilterValue?.length > 0) {
        isValid = globalValue
      } else if (caseTypeFilter?.length > 0) {
        isValid = woTypeMatch
      }else if(statusFilter?.length > 0){
        isValid=statusMatch
      }

      return isValid;
    });
  
    return dataFilter;
  };


  useEffect(() => {
   
    if (locationFilter?.length > 0 ||caseTypeFilter?.length > 0|| statusFilter?.length > 0 || globalFilterValue?.length > 0 || assigneeFilter.length > 0) {
  
    if(workOrderDateFilter?.length> 0 || selectedDateFilter?.length> 0) {
     
      if(workOrderDateFilter !== "All"){
      const finalData: any = getFilterData(selectedDateFilter);
      setTableData(finalData)}else {
        const data: any = getFilterData(filterData);
        setTableData(data)
      }
    }else {
     
      const data: any = getFilterData(filterData);
       setTableData(data)
      setFilterDateList(data)
      setTodayFilter(data);
      setWeekFilter(data)
      }
    } else {
      if (workOrderDateFilter?.length> 0) {
        const data: any = getFilterData(tableData);
      
      //setFilterDateList(data)
      } else {
       
          if (globalFilterValue?.length > 0) {
            setTableData(tableData);
          } else {
           
            setTableData(filterData);
          
        }
      }
    }
  }, [filters?.LOCATION_NAME?.value, 
    filters?.global?.value, 
    filters?.ASSIGN_NAME?.value, 
    filters?.WO_TYPE?.value, filters?.STATUS_DESCRIPTION?.value, 
    filterData, filterData, filters?.ASSIGN_NAME?.value, workOrderDateFilter, statusFilter]);

  const handleCaseTypeFilter = (value: any) => {
    setCaseTypeFilter(value);
    
    // value?.forEach((v: any) => {
    //   const str = v;
    //   const regex = /\(([^)]+)\)/;
    //   const match: any = str.match(regex);
    //   if (match) {
    //     // Output: CM
        
    //     let str: any = match[1]
    //     data.push(str)
    //   }
    // })
    const data:any = value.map((item:any) => 
      item.split('(')[0].trim() // Split at '(' and take the first part
    );
   
    value = data
    setFilters((prev: any) => {
      return {
        ...prev,
        WO_TYPE: { value, matchMode: FilterMatchMode.IN },
      };
    });
    if(value?.length >0){
      resetFilter(value)
    } else {
      if (assigneeFilter?.length > 0 || statusFilter?.length > 0 || globalFilterValue?.length > 0 || locationFilter?.filter >0) {
        if(workOrderDateFilter?.length > 0) {
          const data: any = getFilterData(selectedDateFilter);
          setTableData(data)
        }else {
        const data: any = getFilterData(filterData);
        setTableData(data)
        }
    }else {
      if(workOrderDateFilter?.length > 0) {
        setTableData(selectedDateFilter)
      }else {
      setTableData(filterData)
      }
    }
  }
  };


  //-------------Reset Filter----------------
  const getDateFilter=(values:any)=>{
    const weekFilter1 = filterData.filter((e: any) => {
      let workOrdeDate: any = e?.WO_CREATED_TIME.split(',')[0];
      let filteredData = values?.includes(workOrdeDate)
      return filteredData
    });

    setSelectedDateFilter(weekFilter1)
    // const data: any = getFilterData(weekFilter1)
    // setTableData(data)
  }
  const resetFilter = (value: any) => {

    let values: any = [];
    if (workOrderDateFilter === "All") {
      values.push([])
      setFirst(0);
    } else if (workOrderDateFilter === "Today") {
      values.push(moment(new Date()).format(dateFormat()).toLowerCase());
    } else if (workOrderDateFilter === 'This Week') {
      let current = moment();
      let lastSunday = current.clone().subtract(1, 'weeks').startOf('week');
      for (let i = 0; i < 7; i++) {
         values.push(lastSunday.clone().add(i, 'days').format(dateFormat())); 
      }
    } else if (workOrderDateFilter === 'Custom Range') {
      // customRangeFilter?.forEach((v: any) => {
      //   values.push(v)
      // })
    }
  
    if (value?.length !== 0) {
      if (value?.length !== 0) {
        if (values?.length !== 0 && workOrderDateFilter !== "All") {
          if(workOrderDateFilter === "Today"){
            getDateFilter(values)
        } else if(workOrderDateFilter === "This Week"){
          getDateFilter(values)
  
        }
        }
      } else {
        if (assigneeFilter?.length >0 || locationFilter?.length > 0 || statusFilter?.length > 0  || globalFilterValue?.length >0 || caseTypeFilter?.length >0) {
          const data: any = getFilterData(filterData);
          setTableData(data)
        } else {
          setTableData(filterData)
        }
      }
    }
  }
  //-------------------Add assignee filter-----------------
  const handleAssigneeFilter = (e: any) => {
    const value: any = e
    setAssigneeFilter(value);
    setAssigneeStatus(true)
    setFilters((prev: any) => {
      return {
        ...prev,
        ASSIGN_NAME: { value, matchMode: FilterMatchMode.IN },
      };
    });
    Assign_status = true
    let _filters = { ...filters };
    _filters["ASSIGN_NAME"].value = value;
    setFilters(_filters);
    if(e?.length >0){
      resetFilter(value)
    } else {
      if (locationFilter?.length > 0 || statusFilter?.length > 0 || globalFilterValue?.length > 0 || caseTypeFilter?.length > 0) {
        if(workOrderDateFilter?.length > 0) {
          const data: any = getFilterData(selectedDateFilter);
          setTableData(data)
        }else {
        const data: any = getFilterData(filterData);
        setTableData(data)
        }
    }else {
      if(workOrderDateFilter?.length > 0) {
        setTableData(selectedDateFilter)
      }else {
      setTableData(filterData)
      }
    }
  }

  };
  //-------------------Add Location Filter-------------
  const handleLocationFilter = (value: any) => {
   
    setLocationFilter(value);
    setFilters((prev: any) => {
      return {
        ...prev,
        LOCATION_NAME: { value, matchMode: FilterMatchMode.IN },
      };
    });
    if(value?.length >0){
      resetFilter(value)
    } else {
      if (assigneeFilter?.length > 0 || statusFilter?.length > 0 || globalFilterValue?.length > 0 || caseTypeFilter?.filter >0) {
        if(workOrderDateFilter?.length > 0) {
          const data: any = getFilterData(selectedDateFilter);
          setTableData(data)
        }else {
        const data: any = getFilterData(filterData);
        setTableData(data)
        }
    }else {
      if(workOrderDateFilter?.length > 0) {
        setTableData(selectedDateFilter)
      }else {
      setTableData(filterData)
      }
    }
  }
   
  };
  //-----------Add global search filter---------------
  const onGlobalFilterChange = (e: any) => {
    setAssigneeStatus(false)
    Assign_status = false
    const value = e.target.value;
    let _filters = { ...filters };

    _filters["global"].value = value;

    setFilters(_filters);
    setGlobalFilterValue(value);
    if(value?.length >0){
      resetFilter(value)
    } else {
      if (assigneeFilter?.length > 0 || locationFilter?.length > 0 || globalFilterValue?.length > 0 || caseTypeFilter?.filter >0) {
        if(workOrderDateFilter?.length > 0) {
          const data: any = getFilterData(selectedDateFilter);
          setTableData(data)
        }else {
        const data: any = getFilterData(filterData);
        setTableData(data)
        }
    }else {
      if(workOrderDateFilter?.length > 0) {
        setTableData(selectedDateFilter)
      }else {
      setTableData(filterData)
      }
    }
  }
  };

  //---------------Add Status filter----------
  const handleStatusFilter = (value: any) => {
 
    setStatusFilter(value);
   
    setFilters((prev: any) => {
      return {
        ...prev,
        STATUS_DESC: { value, matchMode: FilterMatchMode.IN },
      };
    });
    if(value?.length >0){
      resetFilter(value)
    } else {
      if (assigneeFilter?.length > 0 || locationFilter?.length > 0 || globalFilterValue?.length > 0 || caseTypeFilter?.filter >0) {
        if(workOrderDateFilter?.length > 0) {
          const data: any = getFilterData(selectedDateFilter);
          setTableData(data)
        }else {
        const data: any = getFilterData(filterData);
        setTableData(data)
        }
    }else {
      if(workOrderDateFilter?.length > 0) {
        setTableData(selectedDateFilter)
      }else {
      setTableData(filterData)
      }
    }
  }
  };

  useEffect(() => {
    setFirst(0);
  }, [filterData, rows]);
  //------------Clear filter code ----------------
  const resetFilters = () => {
    setCaseTypeFilter([])
    setLocationFilter([])
    setStatusFilter([]);
    setSelectedCustome(false)
    setWorkOrderFilter([])
    setAssigneeFilter([])
    setWorkOrderDateFilter([])
    setSelectedDate(null)
    setFilterStatus(false)
    setWODate(null)
    setSelectedDateFilter([])
    if(globalFilterValue?.length > 0) {

     const data:any=getFilterData(filterData)
      setTableData(data)
    }else {
    setTableData(filterData)
    }
  };

  //----------------Status multiselect Data------------
  const tableHeaderFun: any = (params: any) => {
    const tData: any = filterData;
    const statusOptions = tData?.reduce(
      (uniqueStatus: any[], item: { STATUS_DESC: any }) => {
        if (!uniqueStatus.includes(item.STATUS_DESC)) {
          uniqueStatus.push(item.STATUS_DESC);
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
    //------------Location Multiselect Data---------------
    const locationOptions = tData?.reduce(
      (uniqueStatus: any[], item: { LOCATION_NAME: any }) => {
        if (!uniqueStatus.includes(item.LOCATION_NAME)) {
          uniqueStatus.push(item.LOCATION_NAME);
        }
        return uniqueStatus;
      },
      []
    );
    //------------Assignee Multi select data--------------
    const assigneeOptions = technicianList?.reduce(
      (uniqueStatus: any[], item: { USER_NAME: any }) => {
        if (!uniqueStatus.includes(item.USER_NAME)) {
          uniqueStatus.push(item.USER_NAME);
        }
        return uniqueStatus;
      },
      []
    );
    //------------Date Custome Range Event-------------------
    const setSelectedDateFun = (event: any) => {
      setSelectedCustome(false);
      if (event === "Custom Range") {
        setSelectedCustome(true);
      }
    };
    const panelFooterTemplate = (handleValue: any) => {
    
      return (
        <div className="py-2 px-3">
          <label onClick={() => {
            handleValue([])
            if (tableData?.length === 0) {
              setTableData(filterData)
            }
          }
          }>Clear Selection</label>
        </div>
      );
    };
    function getDatesInRange(startDate: any, endDate: any) {
      let dates = [];
      let currentDate = new Date(startDate);

      while (currentDate < endDate) {
        dates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }

      return dates;
    }
    const handlerCustomDateRange = async() => {
      
      if (dateWO !== null) {
        setCustomDateStatus(true)
        let datesInRange = getDatesInRange(dateWO[0], dateWO[1]);
        let value = datesInRange.map(date => moment(date).format(dateFormat()).toLowerCase());
       
        setStartDate(moment(dateWO[0]).format(dateFormat()))
        setEndDate(moment(dateWO[1]).format(dateFormat()))
        const res = await callPostAPI(
          ENDPOINTS.GET_EVENTMASTER,
          {FILTER_BY: "",
            FROM_DATE: moment(dateWO[0]).format("YYYY-MM-DD"),
          TO_DATE: moment(dateWO[1]).format("YYYY-MM-DD")},
          currentMenu?.FUNCTION_CODE
        );
        if(res?.FLAG === 1) {
          setTableData(res?.HELPDESKMASTERSLIST)
          setSelectedDateFilter(res?.HELPDESKMASTERSLIST)
        } else {
          setTableData([])
          setSelectedDateFilter([])
        }
       
        // if (assigneeFilter?.length >0 || locationFilter?.length > 0 || statusFilter?.length > 0  || caseTypeFilter?.length >0 || globalFilterValue?.length >0) {
          
        //   const weekFilter: any = tableData.filter((e: any) => {
             
        //     let workOrdeDate: any = e.WO_CREATED_TIME.split(',')[0]
        //     let filteredData = value?.includes(workOrdeDate)
        //     return filteredData
        //   });

        //   setTableData(weekFilter)
        //   setCustomRangeFilter(value)
        // }
        // else {
        //   const weekFilter: any = filterData.filter((e: any) => {

        //     let workOrdeDate: any = e.WO_CREATED_TIME.split(',')[0]
        //     let filteredData = value?.includes(workOrdeDate)
        //     return filteredData
         
        //   });
         
        //   setTableData(weekFilter)
        //   setCustomRangeFilter(value)
        // }
      }
      setSelectedCustome(false)
    }

    
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      if (tableData?.length === 0) {
        if (selectedDate === 'Custom Range' || workOrderDateFilter === 'Today' || workOrderDateFilter === 'This Week') {
          // setTableData([])
        }
       
        }
        else {
          if (globalFilterValue?.length === 0) {
           
            // setTableData(filterData)
          }
        
      }
    }, [workOrderDateFilter, assigneeStatus, selectedDate, tableData])

    const hasActiveFilters = (
      locationFilter?.length !== 0 ||
      assigneeFilter?.length !== 0 ||
      workOrderDateFilter?.length > 0 ||
      caseTypeFilter?.length !== 0 ||
      statusFilter?.length !== 0
    );

  
    // Columns se tup
    const formatDate = (date:any) => date.toISOString().split('T')[0];
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
          <MultiSelect
            // variant="filled"
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
            // variant="filled"
            value={locationFilter}
            onChange={(e: any) => handleLocationFilter(e.value)}
            options={locationOptions}
            filter
            maxSelectedLabels={1}
            optionLabel={locationOptions?.LOCATION_NAME}
            placeholder="Location"
            className="w-42"
            panelFooterTemplate={panelFooterTemplate(handleLocationFilter)}
          />

          <MultiSelect
            // variant="filled"
            value={statusFilter}
            onChange={(e: any) => handleStatusFilter(e.value)}
            options={statusOptions}
            filter
            maxSelectedLabels={1}
            optionLabel={statusOptions?.STATUS_DESC}
            // showClear
            placeholder="Status"
            className="w-42"
            panelFooterTemplate={panelFooterTemplate(handleStatusFilter)}
          />
          <MultiSelect
            value={assigneeFilter}
            onChange={(e: any) => handleAssigneeFilter(e.value)}
            options={assigneeOptions}
            filter
            maxSelectedLabels={1}
            optionLabel={assigneeOptions?.ASSIGN_NAME}
            placeholder="Assignee"
            className="w-42"
            panelFooterTemplate={panelFooterTemplate(handleAssigneeFilter)}
          />

          {/* Custom date Dropdown */}
          <Dropdown
            value={selectedDate}

            onChange={(e: any) => {
             
              const filteredDropdown = e.target.value;
              const inputString = filteredDropdown;
              let date_filter: any = inputString;
              setWorkOrderDateFilter(inputString)
              setSelectedDate(filteredDropdown);
              setSelectedDateFun(filteredDropdown);
              if (assigneeFilter?.length >0 || locationFilter?.length > 0 || statusFilter?.length > 0  || caseTypeFilter?.length >0 || globalFilterValue?.length >0) {
                tableData=dateFilterList
              }
              if (date_filter === "Today") {
                setStartDate(moment(new Date()).format(dateFormat()))
                if (assigneeFilter?.length > 0 || locationFilter?.length > 0 || statusFilter?.length > 0 || globalFilterValue?.length > 0) {
                 
                  const todayFilter1 = todayFilter?.filter((e: any) => {
                    let current: any = (moment(new Date()).format(dateFormat()))
                    let workOrdeDate: any = moment(e.WO_CREATED_TIME).format(dateFormat())
                    var filteredData1 = workOrdeDate === current;
                    return filteredData1
                  });
                 
                  setTableData(todayFilter1)
                  setSelectedDateFilter(todayFilter1)

                } else {
                  const todayFilter1 = filterData?.filter((e: any) => {
                    let current: any = (moment(new Date()).format(dateFormat()))
                    let workOrdeDate: any = moment(e.WO_CREATED_TIME).format(dateFormat())
                    var filteredData = workOrdeDate === current;
                    return filteredData
                  });
                
                  setTableData(todayFilter1)
                  setSelectedDateFilter(todayFilter1)
                }
              } else if (date_filter === "This Week") {
                var monday: any = moment().subtract(1, 'weeks').startOf('week').format(dateFormat());
                var sunday: any = moment().subtract(1, 'weeks').endOf('week').format(dateFormat());


                // Calculate the last week's Monday

                let lastWeekDates: any = [];
                let current = moment();
                let lastSunday = current.clone().subtract(1, 'weeks').startOf('week');
                for (let i = 0; i < 7; i++) {
                  lastWeekDates.push(lastSunday.clone().add(i, 'days').format(dateFormat()));
                }

                setStartDate(monday)
                setEndDate(sunday)
                if (assigneeFilter?.length > 0 || locationFilter?.length > 0 || statusFilter?.length > 0 || globalFilterValue?.length > 0) {
                  setFilterDateList(tableData)
                  const weekFilter1 = weekFilter?.filter((e: any) => {
                    let workOrdeDate: any = e?.WO_CREATED_TIME.split(',')[0];
                    let filteredData = lastWeekDates?.includes(workOrdeDate)
                    return filteredData
                  });
                  if (weekFilter1?.length > 0) {
                    // const data:any=setTableData(weekFilter)
                    setSelectedDateFilter(weekFilter1)
                    // setTableData(data)
                    setTableData(weekFilter1)
                    setWeekFilter(weekFilter1);
                    setFilterDate(weekFilter1)
                  } else {
                    setTableData([])
                    setFilterDate([])
                  }
                } else {
               
                  const weekFilter1 = filterData.filter((e: any) => {

                    let workOrdeDate: any = e?.WO_CREATED_TIME.split(',')[0]
                    let filteredData = lastWeekDates?.includes(workOrdeDate)
                    return filteredData
                  });

                  if (weekFilter1?.length > 0) {
                    setTableData(weekFilter1)
                    setFilterDate(weekFilter1)
                    setWeekFilter(weekFilter1)
                     setSelectedDateFilter(weekFilter1)
                  } else {
                    setTableData([])
                    setFilterDate([])
                       setSelectedDateFilter([])
                  }
                }
              }
              else if (date_filter === "All") {
               if (assigneeFilter?.length >0 || locationFilter?.length > 0 || statusFilter?.length > 0  || caseTypeFilter?.length >0 || globalFilterValue?.length >0) {
               const data:any =getFilterData(filterData)
                setTableData(data);
                  setFirst(0);
                } else {
                  setTableData(filterData);
                  setFirst(0);
                }
              } else if (date_filter === "Custom Range") {
                setSelectedCustome(true)
              }
            }}
            options={datelist}
            optionLabel={"value"}
            itemTemplate={(option) => (
              <div className="flex justify-between">
                {option.value !== 'Custom Range' ?
                  <>
                    <div>

                      {option.value}</div> <div className="ml-7" style={{ color: "#7E8083" }}>{option.dateData}</div>
                  </> :
                  <>
                    <div
                     onClick={()=>setSelectedCustome(true)}
                    >

                      {option.value}</div> <div className="ml-7" style={{ color: "#7E8083" }} onClick={()=>setSelectedCustome(true)}>{">"}</div>
                  </>}
              </div>)}
            placeholder="Date"
            className="w-42"
          />



          {hasActiveFilters && (
            <Button
              type="button"
              label="Clear Filter"
              onClick={resetFilters}
            />)}
        </div>
        {selectedCustomeDate === true && (
          <Card className="w-3/5 absolute z-10">
            <div>
              <Calendar
                value={dateWO}
                onChange={(e: any) => {
                  setWODate(e.value)
                }}
                inline
                numberOfMonths={1}
                selectionMode="range"
                readOnlyInput
                hideOnRangeSelection
              />
            </div>
            <div className="flex flex-wrap justify-end mt-2">
              <Buttons
                className="Secondary_Button me-2"
                label={t("Cancel")}
                onClick={() => {
                  setWODate(null)
                  setSelectedCustome(false)
                }}
              />
              <Buttons
                className="Primary_Button"
                label={t("Select")}
                onClick={() => {
                  handlerCustomDateRange()
                }}
              />
            </div>
          </Card>
        )}
      </>
    );
  };

  const statusBody = (params: any) => {
    const bgColor =
      params.STATUS_DESC === "Open"
        ? "#F4DCD9"
        : params.STATUS_DESC === "In Progress"
          ? "#FBD999"
          : params.STATUS_DESC === "On-Hold"
            ? "#E9ECEF"
            : params.STATUS_DESC === "Completed"
              ? "#C7E3A2"
              : params.STATUS_DESC === "Rectified"
                ? "#E5F0FE"
                : params.STATUS_DESC === "Cancelled"
                  ? "#6A7178"
                  : "";
    return (
      <div
        style={{
          backgroundColor: bgColor,
          borderRadius: "1rem",
          padding: "0.25rem",
          textAlign: "center",
          width: "120px",
        }}
      >
        <p>{params.STATUS_DESC}</p>
      </div>
    );
  };

  const onPageChange = (event: any) => {
    setFirst(event.first);
    setRows(event.rows);
  };

  useEffect(() => {
    if (currentMenu?.FUNCTION_CODE) {
      setCaseTypeFilter([])
      setLocationFilter([])
      setStatusFilter([]);
      setFilters(filterDefaultValues);
      setSelectedCustome(false)
      setWorkOrderFilter([])
      setAssigneeFilter([])
      setWorkOrderDateFilter([])
      setSelectedDate(null)
      setFilterStatus(false)
      setWODate(null)
      setGlobalFilterValue("")
      getAPI();
    }
  }, [selectedFacility, pathname, currentMenu]);

  const handlerServiceRequest = () => {
    navigate(`${appName}/servicerequestlist?add=`);
  };

  const GetWorkOrderFormWoId = (rowItem: any) => {
    props?.isForm({ rowItem });
    localStorage.setItem("Id", JSON.stringify(rowItem));
    localStorage.setItem("WO_ID", JSON.stringify(rowItem?.WO_ID));
  };
  
  return !props?.search ? (
    <>
      <>
        {showLoader ? (
          <>
            <LoaderS />
          </>
        ) : (
          <>
            <div className="mb-4 flex flex-wrap justify-between">
              <div>
                <h6 className="Text_Primary mr-2">{t(props?.FUNCTION_DESC)}</h6>
              </div>
              <div>
                <Buttons
                  className="Secondary_Button me-2"
                  label={t("Export")}
                />
                <Buttons
                  className="Primary_Button me-2"
                  label={t("Add Service Request")}
                  // icon="pi pi-plus"
                  onClick={handlerServiceRequest}
                />
              </div>
            </div>
          
            <DataTable
              value={tableData?.slice(first, first + rows)}
              header={tableHeaderFun}
              showGridlines
              emptyMessage={t("No Data found")}
              selectionMode={"checkbox"}
              globalFilterFields={[
                "LOCATION_NAME",
                "SEVERITY",
                "WO_NO",
                "STATUS_DESC",
                "ASSIGN_NAME",
                "REQ_DESC",
              ]}
              selection={selectedWoList}
              onSelectionChange={(e) => setSelectedWoList(e.value)}
           
            >
              <Column
                selectionMode="multiple"
                headerStyle={{ width: "3rem" }}
              ></Column>
              <Column
                field="WO_NO"
                header="Work Order"
                // sortable
                body={(rowData: any) => {
                  const rowItem: any = { ...rowData };
                  return (
                    <>
                      {tableHeader && (
                        <a
                          className="cursor-pointer mb-2"
                          onClick={() => GetWorkOrderFormWoId(rowItem)}
                        >
                          {rowData.WO_NO}
                        </a>
                      )}
                      {rowData?.SEVERITY === "High" ? (
                        <>
                          <label>
                            <i
                              className="pi pi-chevron-circle-up mr-2 "
                              style={{ color: "#DC2020" }}
                            ></i>
                            {rowData?.SEVERITY}
                          </label>
                        </>
                      ) : rowData?.SEVERITY === "Medium" ? (
                        <>
                          <label>
                            <i
                              className="pi pi-chevron-circle-down mr-2 "
                              style={{ color: "#FFAB00" }}
                            ></i>
                            {rowData?.SEVERITY}
                          </label>
                        </>
                      ) : rowData?.SEVERITY === "Low" ? (
                        <label>
                          <i
                            className="pi pi-chevron-circle-down mr-2 "
                            style={{ color: "#71DD37" }}
                          ></i>
                          {rowData?.SEVERITY}
                        </label>
                      ) : (
                        ""
                      )}
                    </>
                  );
                }}
              ></Column>
              <Column
                field="REQ_DESC"
                header="Issue"
                body={(rowData: any) => {
                  return (
                    <>
                      <div>
                        <label>
                          {rowData.ASSETGROUP_NAME}
                          {" > "}
                          {rowData.REQ_DESC}
                        </label>
                      </div>
                    </>
                  );
                }}
              ></Column>
              <Column field="LOCATION_DESCRIPTION" header="Location"
              ></Column>
              <Column
                field="STATUS_DESC"
                header="Status"
                body={statusBody}
              ></Column>
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

              <Column
                field="WO_CREATED_TIME"
                header="Date"
                style={{ minWidth: "150px" }}

              ></Column>

            </DataTable>
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
          </>
        )}
      </>{" "}
    </>
  ) : (

    <WorkOrderDetailForm
      headerName={currentMenu?.FUNCTION_DESC}
      setData={props?.setData}
      getAPI={getAPI}
      selectedData={props?.selectedData}
      isClick={props?.isForm}
      functionCode={currentMenu?.FUNCTION_CODE}
    />
  );
};

const Index: React.FC = () => {
  return (
    <TableListLayout>
      <WorkorderMaster />
    </TableListLayout>
  );
};

export default Index;
