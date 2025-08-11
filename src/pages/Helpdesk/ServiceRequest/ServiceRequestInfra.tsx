import React, { useState, useEffect } from "react";
import "../../../components/Table/Table.css";
import "../../../components/Checkbox/Checkbox.css";
import { toast } from "react-toastify";
import { callPostAPI } from "../../../services/apis";
import { ENDPOINTS } from "../../../utils/APIEndpoints";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import TableListLayout from "../../../layouts/TableListLayout/TableListLayout";
import { set, useForm } from "react-hook-form";
import LoaderS from "../../../components/Loader/Loader";
import { IconField } from "primereact/iconfield";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { useTranslation } from "react-i18next";
import { InputText } from "primereact/inputtext";
import { FilterMatchMode, localeOption } from "primereact/api";
import { MultiSelect } from "primereact/multiselect";
import { Button } from "primereact/button";
import "../../../components/MultiSelects/MultiSelects.css";
import Buttons from "../../../components/Button/Button";
import { Paginator } from "primereact/paginator";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import moment from "moment";
import { dateFormat, dateFormat1, formateDate, LOCALSTORAGE, priorityIconList } from "../../../utils/constants";
import { Card } from "primereact/card";
import { appName } from "../../../utils/pagePath";
import * as xlsx from "xlsx";
import FileSaver from "file-saver";

import { decryptData } from "../../../utils/encryption_decryption";
var dateStatus: any = false;
const ServiceRequestInfra = (props: any) => {
  const FACILITY: any = localStorage.getItem("FACILITYID");
  const FACILITYID: any = JSON.parse(FACILITY);

  if (FACILITYID) {
    var facility_type: any = FACILITYID?.FACILITY_TYPE;

  }
  const filterDefaultValues: any = {
    ASSIGN_NAME: { value: null, matchMode: FilterMatchMode.CONTAINS },
    TEAMNAME: { value: null, matchMode: FilterMatchMode.IN },
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    WO_TYPE: { value: null, matchMode: FilterMatchMode.IN },
    STATUS_DESCRIPTION: { value: null, matchMode: FilterMatchMode.IN },
    LOCATION_DESCRIPTION: { value: null, matchMode: FilterMatchMode.IN },
    SEVERITY: { value: null, matchMode: FilterMatchMode.IN },
    WO_NO: { value: null, matchMode: FilterMatchMode.IN },
    WO_DATE: { value: null, matchMode: FilterMatchMode.IN },
    REPORTED_NAME: { value: null, matchMode: FilterMatchMode.CONTAINS },
    SUB_STATUS_DESC: { value: null, matchMode: FilterMatchMode.IN }
  };
  let { pathname } = useLocation();
  let { search } = useLocation();
  const navigate: any = useNavigate();
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [selectedFacility, menuList]: any = useOutletContext();
  const { t } = useTranslation();
  const [filterData, setFilterData] = useState<any | null>([])
  const [selectedWoList, setSelectedWoList] = useState<any>(null);
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<any | null>([])
  const [teamNameFilter, setTeamNameFilter] = useState<any | null>([])
  const [fromDate, setFromDate] = useState<any>(null)
  const [toDate, setToDate] = useState<any>(null)
  const [subStatusData, setSubStatusData] = useState<any>([])
  const [pageCount, setPageCount] = useState<any>(0)
  const [showLoader, setShowLoader] = useState<boolean>(true);
  let [tableData, setTableData] = useState<any>();
  var globalStatus: boolean = false;
  const [statusData, setStautusData] = useState<any>([])
  const [caseTypeFilter, setCaseTypeFilter] = useState<any>([]);
  const [statusFilter, setStatusFilter] = useState<any | null>([]);
  const [assigneeFilter, setAssigneeFilter] = useState<any | null>([]);
  const [locationFilter, setLocationFilter] = useState<any | null>([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedCustomeDate, setSelectedCustome] = useState<boolean>(false);
  const [dateWO, setWODate] = useState(null);
  const [selectedDateFilter, setSelectedDateFilter] = useState<any | null>([])

  const [filters, setFilters] = useState(filterDefaultValues);
  const [workOrderDateFilter, setWorkOrderDateFilter] = useState<any | null>([])


  const startOfPreviousWeek = moment().startOf('week').format(dateFormat1());

  const endOfPreviousWeek = moment().endOf('week').format(dateFormat1());
  let tableHeader: any = props?.tableHeader?.headerName !== "User Role Master";
  const endOfPreviousWeekYear = moment().endOf('week').format('YYYY');

  const [firstDateSelected, setFirstDateSelected] = useState<boolean>(false);

  const [minDate, setMinDate] = useState<any | null>(null)
  const datelist = [{ label: "All", value: "All", dateData: "" },
  { label: "Today", value: `Today`, dateData: moment(new Date()).format(dateFormat()) },
  { label: "This week", value: `This week`, dateData: `${startOfPreviousWeek}${(" ")} to${(" ")} ${endOfPreviousWeek}, ${endOfPreviousWeekYear}` },
  { label: "Custom range", value: "Custom range", dateData: "" }];
  const [filterDropDownData, setFilterDropDownData] = useState<any>([])
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

  const transformStatusData = (data: any) => {
    const grouped: any = {};
    data.forEach(({ MAIN_STATUS, MAIN_STATUS_DESC, SUB_STATUS_DESC, STATUS_CODE }: any) => {
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
        });
        group.seen.add(subLabel);
      }
    });
    return Object.values(grouped).map(({ seen, ...group }: any) => group);
  };
  const formatServiceRequestList = (list: any) => {
    let WORK_ORDER_LIST = list;
    WORK_ORDER_LIST = WORK_ORDER_LIST.map((element: any) => {
      return {
        WO_CREATED_TIME: element.WO_REPORTED_AT !== null ? formateDate(element.WO_REPORTED_AT || element.WO_CREATED_TIME) : "",
        WO_CREATED: moment(element?.WO_REPORTED_AT).format(dateFormat()),
        WO_TYPE: element?.WO_TYPE,
        STATUS_COLOURS: element?.STATUS_COLOR,
        SEVERITY: element?.SEVERITY,
        SER_REQ_NO: element?.WO_NO,
        WO_NO: element?.WO_NO,
        LOCATION_NAME: element?.LOCATION_NAME,
        LOCATION_DESCRIPTION: element?.LOCATION_DESCRIPTION,
        STATUS_DESC: element?.STATUS_DESC,
        ASSIGN_NAME: element?.ASSIGN_NAME,
        WO_TYPE_NAME: element?.WO_TYPE_NAME,
        WO_GROUP_REQ: element?.GROUP_ISSUE,
        WO_ID: element?.WO_ID,
        PRIORITY_COLOURS: element?.COLORS,
        DESCRIPTION: element.DESCRIPTION,
        TEAMNAME: element?.TEAM_NAME,
        SUB_STATUS_DESC: element?.SUB_STATUS_DESC,
        ICON_ID: element?.ICON_ID,
        REPORTED_NAME: element?.RAISED_BY_NAME
      };
      // }
    });

    return WORK_ORDER_LIST;
  };
  const getFilterListData = async (pageData: any, startDate?: any, end?: any) => {
    const payload = {
      "SEARCH_TEXT": globalFilterValue !== null ? globalFilterValue : null,
      "FROM_DATE": dateStatus === true ? null : fromDate !== null ? fromDate : startDate,
      "TO_DATE": dateStatus === true ? null : toDate !== null ? toDate : end,
      "WO_TYPE_LIST": caseTypeFilter?.length > 0 ? filters?.WO_TYPE?.value : [],
      "PRIORITY_LIST": priorityFilter?.length > 0 ? filters?.SEVERITY?.value : [],
      "ASSIGNEE_LIST": assigneeFilter?.length > 0 ? filters?.ASSIGN_NAME?.value : [],
      "TEAM_LIST": teamNameFilter?.length > 0 ? filters?.TEAMNAME?.value : [],
      "SUB_STATUS_LIST": subStatusData?.length > 0 ? subStatusData : [],
      "PAGE_NUMBER": pageData?.PAGE_NUMBER,
      "PAGE_SIZE": pageData?.PAGE_SIZE,

    }

    const res: any = await callPostAPI(
      ENDPOINTS.FILTER_GET_API_LIST,
      payload,
      currentMenu?.FUNCTION_CODE
    );
    if (res?.FLAG === 1) {
      setPageCount(res?.WOLIST[0]?.TOTAL_COUNT)
      const updatedList = formatServiceRequestList(res?.WOLIST);
      setTableData(updatedList)
    } else {
      setTableData([])
    }
  }

  const getAPI = async () => {
    setShowLoader(true);
    try {
      const responseFilter: any = await callPostAPI(ENDPOINTS.FILTER_GET_API, {}, currentMenu?.FUNCTION_CODE);
      if (responseFilter?.FLAG === 1) {
        setFilterDropDownData(responseFilter)
        const statusOptions1 = transformStatusData(responseFilter?.STATUSLIST);
        setStautusData(statusOptions1)
      } else {
        setFilterDropDownData([])
        setStautusData([])
      }
      await getFilterListData({ "PAGE_NUMBER": 1, "PAGE_SIZE": 10 })
    } catch (error: any) {
      toast.error(error);
      setShowLoader(false);
    }
  };

  const tableHeaderFun: any = () => {
    //------------Date Custome Range Event-------------------
    const setSelectedDateFun = (event: any) => {
      setSelectedCustome(false);
      if (event === "Custom range") {
        setSelectedCustome(true);
      }
    };
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


    const statusTemplate = (option: any) => {
      return (
        <>
          <div>{option.label}</div>
        </>
      );
    };


    const handlerCustomDateRange = async () => {
      setCaseTypeFilter([]);
      setLocationFilter([]);
      setStatusFilter([]);
      setAssigneeFilter([]);
      setGlobalFilterValue("");
      if (dateWO !== null) {
        if (dateWO[0] !== null && dateWO[1] !== null) {
          setFromDate(moment(dateWO[0]).format("YYYY-MM-DD"));
          setToDate(moment(dateWO[1]).format("YYYY-MM-DD"));
          setSelectedCustome(false);
          await getFilterListData({ "PAGE_NUMBER": 1, "PAGE_SIZE": 10 }, moment(dateWO[0]).format("YYYY-MM-DD"), moment(dateWO[1]).format("YYYY-MM-DD"))

        } else {
          toast.error("Please select date range");
        }
      } else {
        toast.error("Please select date range");
      }
    };


    const hasActiveFilters = (
      locationFilter?.length !== 0 ||
      assigneeFilter?.length !== 0 ||
      workOrderDateFilter?.length > 0 ||
      caseTypeFilter?.length !== 0 ||
      statusFilter?.length !== 0 ||
      priorityFilter?.length !== 0 ||
      teamNameFilter?.length !== 0 ||
      fromDate !== null ||
      toDate !== null
    );

    const resetFilters = async () => {
      setCaseTypeFilter([]);
      setLocationFilter([]);
      setStatusFilter([]);
      setPriorityFilter([]);
      setTeamNameFilter([]);
      setSubStatusData([])
      setSelectedCustome(false);
      setAssigneeFilter([]);
      setWorkOrderDateFilter([]);
      setSelectedDate(null);
      // setFilterStatus(false)
      setWODate(null);
      filters["global"].value = null;
      filters["WO_TYPE"].value = null;
      //  filters["ASSIGN_NAME"].value = null;
      filters["SUB_STATUS_DESC"].value = null;
      filters["LOCATION_DESCRIPTION"].value = null;
      filters["SEVERITY"].value = null;
      filters["TEAMNAME"].value = null;
      filters["STATUS_DESCRIPTION"].value = null;
      filters["global"].value = null;
      dateStatus = true;
      setFilters({ ...filters });
      await getFilterListData({ "PAGE_NUMBER": 1, "PAGE_SIZE": 10 })



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
      }
    };
    const getListFilter = async () => {
      getFilterListData({ "PAGE_NUMBER": 1, "PAGE_SIZE": 10 })
    }
    const handleAssigneeFilter = (e: any) => {
      let value: any = e;
      setAssigneeFilter(value);
      const userIds = value.map((user: any) => { return ({ "USER_ID": user.USER_ID }) });
      value = userIds;
      setFilters((prev: any) => {
        return {
          ...prev,
          ASSIGN_NAME: { value, matchMode: FilterMatchMode.IN },
        };
      });
    };

    const handleCaseTypeFilter = (e: any) => {
      let value: any = e;
      setCaseTypeFilter(value);
      const caseTypeIds = value.map((user: any) => { return ({ "WO_TYPE_CODE": user.WO_TYPE_CODE }) });
      value = caseTypeIds;
      setFilters((prev: any) => {
        return {
          ...prev,
          WO_TYPE: { value, matchMode: FilterMatchMode.IN },
        };
      });
    };

    const onGlobalFilterChange = (e: any) => {


      const value = e.target.value;
      let _filters = { ...filters };

      _filters["global"].value = value;

      setFilters(_filters);
      setGlobalFilterValue(value);

    };

    const handleStatusFilter = (e: any, selectedOption: any) => {

      let value: any = e;
      setStatusFilter(value);
      let code: any = { STATUS_CODE: selectedOption?.STATUS_CODE }


      setSubStatusData((prev: any) => [...prev, code]);

      if (facility_type === "I") {

        setFilters((prev: any) => {
          return {
            ...prev,
            SUB_STATUS_DESC: { value, matchMode: FilterMatchMode.IN },
          };
        });
      } else {
        setFilters((prev: any) => {
          return {
            ...prev,
            STATUS_DESCRIPTION: { value, matchMode: FilterMatchMode.IN },
          };
        });
      }

    };

    const handlePriorityFilter = (e: any) => {
      let value: any = e;
      setPriorityFilter(value);

      const severityIds = value.map((user: any) => { return ({ "SEVERITY_ID": user.SEVERITY_ID }) });
      value = severityIds;
      setFilters((prev: any) => {
        return {
          ...prev,
          SEVERITY: { value, matchMode: FilterMatchMode.IN },
        };
      });

    };

    const handleDepartmentFilter = (e: any) => {
      let value: any = e;
      setTeamNameFilter(value);
      const teamIds: any = value.map((user: any) => { return ({ "TEAM_ID": user.TEAM_ID }) });
      value = teamIds;
      setFilters((prev: any) => {
        return {
          ...prev,
          TEAMNAME: { value, matchMode: FilterMatchMode.IN },
        };
      });

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
              dateStatus = false
              const filteredDropdown = e.target.value;
              const inputString = filteredDropdown;
              let date_filter: any = inputString;
              setSelectedDate(filteredDropdown);
              if (date_filter === "Today") {
                setFromDate(moment(new Date()).format("YYYY-MM-DD"));
                setToDate(moment(new Date()).format("YYYY-MM-DD"));
                await getFilterListData({ "PAGE_NUMBER": 1, "PAGE_SIZE": 10 })
              } else if (date_filter === "This week") {

                const startOfPreviousWeek = moment().startOf("week").format("YYYY-MM-DD");
                const endOfPreviousWeek = moment().endOf("week").format("YYYY-MM-DD");
                setFromDate(startOfPreviousWeek);
                setToDate(endOfPreviousWeek);
                await getFilterListData({ "PAGE_NUMBER": 1, "PAGE_SIZE": 10 })
              } else if (date_filter === "All") {

              } else if (date_filter === "Custom range") {
                setSelectedCustome(true);
              }
            }}
            options={datelist}
            optionLabel={"value"}
            itemTemplate={(option) => (
              <div className="flex justify-between">
                {option.value !== "Custom range" ? (
                  <>
                    <div>{option.value}</div>{" "}
                    <div className="ml-7" style={{ color: "#7E8083" }}>
                      {option.dateData}
                    </div>
                  </>
                ) : (
                  <>
                    <div
                      onClick={() => setSelectedCustome(true)}
                      style={{ display: "flex", width: "100%" }}
                    >
                      {option.value}
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
            itemTemplate={(option) => `${option.WO_TYPE_NAME} (${option.WO_TYPE_CODE})`}
            panelFooterTemplate={panelFooterTemplate(handleCaseTypeFilter)}
          />

          <MultiSelect
            value={statusFilter}
            onChange={(e: any) => handleStatusFilter(e?.value, e?.selectedOption)}
            options={statusData}
            filter
            maxSelectedLabels={1}
            optionGroupLabel="SUB_STATUS_DESC"
            optionGroupChildren="items"
            optionGroupTemplate={statusTemplate}
            placeholder="Status"
            className="w-42"
            panelFooterTemplate={panelFooterTemplate(handleStatusFilter)}
          />
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

          <Button type="button" label="Apply" onClick={getListFilter} />
          {/* Custom date Dropdown */}

          {hasActiveFilters && (
            <Button type="button" label="Clear Filter" onClick={resetFilters} />
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
                label={t("Cancel")}
                onClick={() => {
                  setSelectedCustome(false);
                }}
              />
              <Buttons
                className="Primary_Button"
                label={t("Select")}
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
        {facility_type === "I" ? <p>{params?.SUB_STATUS_DESC}</p>
          : <p>{params?.STATUS_DESC}</p>}
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
    const payload: any = {
      FUNCTION_CODE: currentMenu?.FUNCTION_CODE,
    };
    const res = await callPostAPI(ENDPOINTS.GET_EXCEL_DOWNLOADDATA, payload);
    if (res?.FLAG === 1) {
      if (res?.DOWNLOADDATA?.length > 0) {
        if (
          assigneeFilter?.length > 0 ||
          locationFilter?.length > 0 ||
          statusFilter?.length > 0 ||
          globalFilterValue?.length > 0 ||
          workOrderDateFilter?.length > 0 ||
          priorityFilter?.length > 0 ||
          teamNameFilter?.length > 0
        ) {
          const matchedServiceRequests: any = res?.DOWNLOADDATA.filter(
            (serviceRequest: any) => {
              return tableData.some(
                (tableRow: any) =>
                  tableRow.WO_NO === serviceRequest["Work Order Number"]
              );
            }
          );

          if (matchedServiceRequests?.length > 0) {
            ExportCSV(matchedServiceRequests, currentMenu?.FUNCTION_DESC);
          } else {
            toast.error("No data Found");
          }
        } else {
          if (res?.DOWNLOADDATA?.length > 0) {
            ExportCSV(res?.DOWNLOADDATA, currentMenu?.FUNCTION_DESC);
          } else {
            toast.error("No data Found");
          }
        }
      } else {
        toast.error("No Data Found");
      }
    } else {
      toast.error("No Data found");
    }

  };
  const onPageChange = async (event: any) => {
    await getFilterListData({ "PAGE_NUMBER": event.page + 1, "PAGE_SIZE": event?.rows })
    setFirst(event.first);
    setRows(event.rows);
  }


  useEffect(() => {
    if (currentMenu?.FUNCTION_CODE) {
      (async function () {
        await getAPI();
      })()
    }

  }, [selectedFacility, pathname, currentMenu, search]);
  return (<>
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
          //  onClick={props?.isForm}
          />)}

        </div>
      </div>

      <DataTable
        value={tableData}
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
                <>
                  <p
                    className="cursor-pointer mb-2"
                    onClick={() => {

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

        <Column field="WO_GROUP_REQ"
          header="Group > Issue"
          style={{ minWidth: "150px" }}
        ></Column>
        <Column field="DESCRIPTION"
          header="Description"
          style={{ minWidth: "150px" }}
        ></Column>
        <Column
          field="STATUS_DESCRIPTION"
          header="Sub Status"
          style={{ minWidth: "100px" }}
          body={statusBody}
        ></Column>
        <Column
          field="SEVERITY"
          header="Priority"
          style={{ minWidth: "130px" }}
          body={(rowData: any) => {
            const PriorityIconName = priorityIconList?.filter((e: any) => e?.ICON_ID === rowData?.ICON_ID)[0]?.ICON_NAME
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
          field="WO_CREATED_TIME"
          header="Date"
          style={{ minWidth: "80px" }}
        ></Column>
      </DataTable>
      <div className="flex p-4 bg-white flex-row gap-3a justify-between">
        {tableData?.length > 0 && <div className="mt-3 Text_Secondary Input_label">
          {`Showing ${first + 1} - ${tableData?.slice(first, first + rows)?.length + first}  of ${pageCount}`}
        </div>}
        <Paginator
          first={first}
          rows={rows}
          totalRecords={pageCount}
          onPageChange={onPageChange}
          currentPageReportTemplate="Items per Page:-"
          rowsPerPageOptions={[15, 25, 50]}
          alwaysShow={false}
          template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
        ></Paginator>
      </div>
    </>
  </>)
}
export default ServiceRequestInfra;