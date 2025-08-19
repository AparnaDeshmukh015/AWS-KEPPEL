import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Table from "../../../components/Table/Table";
import { callPostAPI } from "../../../services/apis";
import { ENDPOINTS } from "../../../utils/APIEndpoints";
import { useLocation, useOutletContext } from "react-router-dom";
import TableListLayout from "../../../layouts/TableListLayout/TableListLayout";

import ServiceRequestForm from "./ServiceRequestForm";
import Field from "../../../components/Field";
import Select from "../../../components/Dropdown/Dropdown";
import { useForm } from "react-hook-form";
import ServiceRequestDetailForm from "./ServiceRequestDetailForm";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { useTranslation } from "react-i18next";
import { InputText } from "primereact/inputtext";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import { MultiSelect } from "primereact/multiselect";
import { Button } from "primereact/button";
import "../../../components/MultiSelects/MultiSelects.css";
import Buttons from "../../../components/Button/Button";
import { Paginator } from "primereact/paginator";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import moment from "moment";
import { dateFormat } from "../../../utils/constants";

const ServiceRequest = (props: any) => {
  let { pathname } = useLocation();
  const [selectedFacility, menuList]: any = useOutletContext();
  const {   } = useTranslation();
  const [selectedWoList, setSelectedWoList] = useState<any>(null);
  const [rowClick, setRowClick] = useState<boolean>(true);
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [showLoader, setShowLoader] = useState<boolean>(true);
  const [tableData, setTableData] = useState<any>();
  let userRole: any = props?.tableHeader?.headerName === "User Role Master";
  let tableHeader: any = props?.tableHeader?.headerName !== "User Role Master";
  const [statusFilter, setStatusFilter] = useState<any>();
  const [caseTypeFilter, setCaseTypeFilter] = useState<any>();
  const [locationFilter, setLocationFilter] = useState<any>();
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedCustomeDate, setSelectedCustome] = useState<boolean>(false);
  const [dateWO, setWODate] = useState(null);
  const datelist = [
    { name: "Today", code: "TO" },
    { name: "This Week", code: "TW" },
    { name: "Custom Range", code: "CR" },
  ];
  const {
    register,

    control,
    setValue,
    getValues,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      FILTER_BY: "",
    },

    mode: "onSubmit",
  });
  const filterByWatch: any = watch("FILTER_BY");

  const currentMenu = menuList
    ?.flatMap((menu: any) => menu?.DETAIL)
    .filter((detail: any) => detail.URL === pathname)[0];

  const getAPI = async () => {
    try {
      const payload: any = {
        FILTER_BY: filterByWatch ? filterByWatch?.code : 7,
      };

      // console.log(" currentMenu?.FUNCTION_CODE", currentMenu?.FUNCTION_CODE);

      const res = await callPostAPI(
        ENDPOINTS.GET_EVENTMASTER,
        payload,
        currentMenu?.FUNCTION_CODE
      );
      if (res?.FLAG === 1) {
        setTableData(res?.HELPDESKMASTERSLIST || []);
        props?.setData(res?.HELPDESKMASTERSLIST || []);
        localStorage.setItem("currentMenu", JSON.stringify(currentMenu));
        setShowLoader(false);
      } else {
        setShowLoader(false);
      }
    } catch (error: any) {
      toast.error(error);
      setShowLoader(false);
    }
  };

  const filterDefaultValues: any = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    WO_TYPE: { value: null, matchMode: FilterMatchMode.IN },
    STATUS_DESC: { value: null, matchMode: FilterMatchMode.IN },
    LOCATION_NAME: { value: null, matchMode: FilterMatchMode.IN },
    SEVERITY: { value: null, matchMode: FilterMatchMode.IN },
    WO_NO: { value: null, matchMode: FilterMatchMode.IN },
    WO_DATE: {},
  };

  const [filters, setFilters] = useState(filterDefaultValues);

  const handleCaseTypeFilter = (value: any) => {
    setCaseTypeFilter(value);
    setFilters((prev: any) => {
      return {
        ...prev,
        WO_TYPE: { value, matchMode: FilterMatchMode.IN },
      };
    });
  };

  const handleLocationFilter = (value: any) => {
    setLocationFilter(value);
    setFilters((prev: any) => {
      return {
        ...prev,
        LOCATION_NAME: { value, matchMode: FilterMatchMode.IN },
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

  const handleStatusFilter = (value: any) => {
    setStatusFilter(value);
    setFilters((prev: any) => {
      return {
        ...prev,
        STATUS_DESC: { value, matchMode: FilterMatchMode.IN },
      };
    });
  };

  const resetFilters = () => {
    setStatusFilter(undefined);
    setCaseTypeFilter(undefined);
    handleLocationFilter(undefined);
    setFilters(filterDefaultValues);
  };

  const tableHeaderFun: any = (params: any) => {
    const tData = params?.props?.value;
    const statusOptions = tData?.reduce(
      (uniqueStatus: any[], item: { STATUS_DESC: any }) => {
        if (!uniqueStatus.includes(item.STATUS_DESC)) {
          uniqueStatus.push(item.STATUS_DESC);
        }
        return uniqueStatus;
      },
      []
    );

    const caseTypeOptions = tData?.reduce(
      (uniqueStatus: any[], item: { WO_TYPE: any }) => {
        if (!uniqueStatus.includes(item.WO_TYPE)) {
          uniqueStatus.push(item.WO_TYPE);
        }
        return uniqueStatus;
      },
      []
    );

    const locationOptions = tData?.reduce(
      (uniqueStatus: any[], item: { LOCATION_NAME: any }) => {
        if (!uniqueStatus.includes(item.LOCATION_NAME)) {
          uniqueStatus.push(item.LOCATION_NAME);
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
    return (
      <>
        <div className="flex flex-wrap gap-2">
          <IconField iconPosition="right" className="w-64">
            <InputIcon className="pi pi-search" />
            <InputText
              value={globalFilterValue}
              onChange={onGlobalFilterChange}
              placeholder="Search"
              className="w-64"
            />
          </IconField>

          <MultiSelect
            value={locationFilter}
            onChange={(e: any) => handleLocationFilter(e.value)}
            options={locationOptions}
            filter
            maxSelectedLabels={2}
            optionLabel={locationOptions?.LOCATION_NAME}
            placeholder="Location"
            className="w-42"
          />

          <MultiSelect
            value={caseTypeFilter}
            onChange={(e: any) => handleCaseTypeFilter(e.value)}
            options={caseTypeOptions}
            filter
            maxSelectedLabels={2}
            optionLabel={locationOptions?.WO_TYPE}
            placeholder="Case Type"
            className="w-42"
          />
          <MultiSelect
            value={statusFilter}
            onChange={(e: any) => handleStatusFilter(e.value)}
            options={statusOptions}
            filter
            maxSelectedLabels={2}
            optionLabel={locationOptions?.STATUS_DESC}
            // showClear
            placeholder="Status"
            className="w-42"
          />

          <Dropdown
            value={selectedDate}
            onChange={(e: any) => {
              setSelectedDate(e.value);
              setSelectedDateFun(e.value);
              var d1 = new Date();
              var getdate = moment(d1).format(dateFormat());

              // console.log(getdate);
            }}
            // onClick={(e: any) => {
            //   // setSelectedDate(e.value);
            //   setSelectedDateFun(e.value);
            //   console.log(selectedDate);
            // }}
            options={datelist}
            optionLabel="name"
            placeholder="Date"
            className="w-42"
          />

          <Button
            type="button"
            label="Clear Filter"
            className="Border_Button Secondary_Button "
            onClick={() => resetFilters()}
          />
        </div>
        {/* {selectedCustomeDate === true && (
          <div className="w-3/5 absolute">
            <Calendar
              value={dateWO}
              onChange={(e: any) => setWODate(e.value)}
              inline
              numberOfMonths={2}
              selectionMode="range"
              readOnlyInput
              hideOnRangeSelection
            />
          </div>
        )} */}
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

  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(15);
  const onPageChange = (event: any) => {
    setFirst(event.first);
    setRows(event.rows);
  };

  var CURRENT_STATUS: any;

  const GetViewServiceDataFrom = (rowItem: any, rowData: any) => {
    props?.isForm({ rowItem });
    localStorage.setItem("Id", JSON.stringify(rowItem));
    localStorage.setItem("WO_ID", JSON.stringify(rowItem?.WO_ID))
    CURRENT_STATUS = rowData.CURRENT_STATUS
  }
  // console.log("propssssss", props, props?.isClick);

  useEffect(() => {
    if (currentMenu?.FUNCTION_CODE) {
      getAPI();
    }
  }, [menuList, pathname]);

  // useEffect(() => {
  //   if (currentMenu?.FUNCTION_CODE) {
  //     getAPI();
  //   }
  // }, [selectedFacility, currentMenu, filterByWatch]);

  return !props?.search ? (
    <>
      {/* <div style={{ width: "40vw" }}>
        <Field
          controller={{
            name: "FILTER_BY",
            control: control,
            render: ({ field }: any) => {
              return (
                <Select
                  options={filterRecord}
                  {...register("FILTER_BY", {})}
                  label="Record For"
                  optionLabel="name"
                  setValue={setValue}
                  {...field}
                />
              );
            },
          }}
        />
      </div> */}
      {/* <Table
        tableHeader={{
          headerName: currentMenu?.FUNCTION_DESC,
          search: true,
          // wo_list: (
          //   <div style={{ width: "20vw" }}>
          //     <Field
          //       controller={{
          //         name: "FILTER_BY",
          //         control: control,
          //         render: ({ field }: any) => {
          //           return (
          //             <Select
          //               options={filterRecord}
          //               {...register("FILTER_BY", {})}
          //               // label="Record For"
          //               optionLabel="name"
          //               setValue={setValue}
          //               {...field}
          //             />
          //           );
          //         },
          //       }}
          //     />
          //   </div>
          // ),
        }}
        dataKey={currentMenu?.FUNCTION_DESC}
        columnTitle={[
          "WO_NO",
          "LOCATION_NAME",
          "ASSET_NAME",
          "REQ_DESC",
          "SEVERITY",
          "STATUS_DESC",
          "SERVICE_CREATED_TIME",
        ]}
        customHeader={[
          "Request No.",
          "Location",
          "Equipment Name",
          "Request Title",
          "Severity",
          "Status",
          "Date",
        ]}
        columnData={props?.data}
        clickableColumnHeader={["WO_NO"]}
        filterFields={["WO_NO", "LOCATION_NAME", "ASSET_NAME", "REQ_DESC", "SEVERITY", "STATUS_DESC", "SERVICE_CREATED_TIME"]}
        setSelectedData
        isClick={props?.isForm}
        handelDelete={props?.handelDelete}
        getAPI={getAPI}
        deleteURL={ENDPOINTS.DELETE_SKILLMASTER}
        DELETE_ID="OBJ_ID"
      />{" "} */}


      <>
        <div className="mb-4 flex flex-wrap justify-between">
          <div>
            {/* <h6 className="Text_Primary mr-2">{ (props?.FUNCTION_DESC)}</h6> */}
            <h6 className="Text_Primary mr-2">{"All Service Request"}</h6>

          </div>
          <div>
            <Buttons
              className="Secondary_Button me-2"
              label={ ("Export")}
            />
            <Buttons
              className="Primary_Button me-2"
              label={ ("Add Service Request")}
              icon="pi pi-plus"
              onClick={props?.isForm}
            />
          </div>
        </div>
        <DataTable
          value={tableData}
          header={tableHeaderFun}
          filters={filters}
          showGridlines
          emptyMessage={ ("No Data found.")}
          selectionMode={"checkbox"}
          globalFilterFields={[
            "LOCATION_NAME",
            "SEVERITY",
            "WO_NO",
            "STATUS_DESC",
          ]}
          selection={selectedWoList}
          onSelectionChange={(e) => setSelectedWoList(e.value)}
          dataKey="WO_ID"
        >
          <Column
            selectionMode="multiple"
            headerStyle={{ width: "3rem" }}
          ></Column>
          <Column
            field="WO_NO"
            header="Request No"
            sortable
            body={(rowData: any) => {
              const rowItem: any = { ...rowData };
              return (
                <>
                  {tableHeader && (
                    <p
                      className="cursor-pointer"
                      onClick={() => { GetViewServiceDataFrom(rowItem, rowData) }
                      }
                    >
                      {rowData.WO_NO}
                    </p>
                  )}
                </>
              );
            }}
          ></Column>
          <Column field="REQ_DESC" header="Request Title" sortable></Column>
          <Column field="LOCATION_NAME" header="Location" sortable></Column>
          <Column
            field="SEVERITY"
            header="Priority"
            sortable
            body={(rowData: any) => {
              if (rowData?.SEVERITY === "High") {
                return (
                  <>
                    <label>
                      <i
                        className="pi pi-chevron-circle-up mr-2 "
                        style={{ color: "#DC2020" }}
                      ></i>
                      {rowData?.SEVERITY}
                    </label>
                  </>
                );
              } else if (rowData?.SEVERITY === "Medium") {
                return (
                  <>
                    <label>
                      <i
                        className="pi pi-chevron-circle-down mr-2 "
                        style={{ color: "#FFAB00" }}
                      ></i>
                      {rowData?.SEVERITY}
                    </label>
                  </>
                );
              } else {
                return (
                  <>
                    <label>
                      <i
                        className="pi pi-chevron-circle-down mr-2 "
                        style={{ color: "#71DD37" }}
                      ></i>
                      {rowData?.SEVERITY}
                    </label>
                  </>
                );
              }
            }}
          ></Column>
          <Column
            field="STATUS_DESC"
            header="Status"
            body={statusBody}
            sortable
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
    </>
  ) : (
    // <ServiceRequestForm
    <ServiceRequestDetailForm
      headerName={currentMenu?.FUNCTION_DESC}
      setData={props?.setData}
      getAPI={getAPI}
      selectedData={props?.selectedData}
      isClick={props?.isForm}
      CURRENT_STATUS={CURRENT_STATUS}
    />
  );
};

const Index: React.FC = () => {
  return (
    <TableListLayout>
      <ServiceRequest />
    </TableListLayout>
  );
};

export default Index;
