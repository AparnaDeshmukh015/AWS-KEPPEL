import React, { useCallback, useEffect, useState, useRef } from "react";
import { useLocation, useOutletContext } from "react-router-dom";
import "../../../components/Table/Table.css";
import "../../../components/Checkbox/Checkbox.css";
import Buttons from "../../../components/Button/Button";
import "../../../components/MultiSelects/MultiSelects.css";
import "../../../components/Dropdown/Dropdown.css";
import "../../../components/Calendar/Calendar.css";
import { Card } from "primereact/card";
import { useForm } from "react-hook-form";
import Select from "../../../components/Dropdown/Dropdown";
import Field from "../../../components/Field";
import moment from "moment";
import DateCalendar from "../../../components/Calendar/Calendar";
import { ENDPOINTS } from "../../../utils/APIEndpoints";
import { callPostAPI } from "../../../services/apis";
import MultiSelects from "../../../components/MultiSelects/MultiSelects";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import "../../../components/Input/Input.css";
import "../../../components/Calendar/Calendar.css";
import * as xlsx from "xlsx";
import FileSaver from "file-saver";
import LoaderFileUpload from "../../../components/Loader/LoaderFileUpload";
import { dateFormat } from "../../../utils/constants";
import ExcelJS from "exceljs";
import { toast } from "react-toastify";
import { on } from "events";
import { Paginator } from "primereact/paginator";
import { Dialog } from "primereact/dialog";
import LoaderShow from "../../../components/Loader/LoaderShow";

const Report = (props: any) => {
  const { pathname } = useLocation();
  const [selectedFacility, menuList]: any = useOutletContext();
  const [options, setOptions] = React.useState<any | null>([]);
  const [reportData, setReportData] = React.useState<any | null>([]);
  const [columnData, setColumnData] = React.useState<any | null>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [reportDetails, setReportDetails] = useState<any>(null);
  const [reportDate, setReportDate] = React.useState<any>(null);
  const [reportID, setReportId] = useState<any | null>(0);
  const [statusData, setStautusData] = useState<any | null>([]);
  const [checkedRpoertData, setCheckedReportData] = useState<any | null>([]);
  const [equimentColumnStatus, setEquipmentColumnStatus] = useState<any | null>(
    false
  );
  const [equipmentColumnList, setEquipmentColumnList] = useState<any | null>(
    []
  );
  const [originalList, setOriginalList] = useState<any | null>([]);
  const [filterOption, setFilterOption] = useState<any | null>([]);
  const [startDate, setStartDate] = useState<any | null>(null);

  const [searchStatus, setSearchStatus] = useState<any | null>(false);
  const [statusResponse, setStatusReponse] = useState<any | null>([]);
  const [subStatusData, setSubStatusData] = useState<any>([]);
  const [reportStatus, setReportStatus] = useState(false);
  const [type, setType] = useState<any | null>([]);
  const [assetName, setAssetName] = useState<any | null>([]);
  const [assetData, setAssetData] = useState<any | null>();
  const op = useRef<any | null>(null);
  const [reportSummary, setReportSummary] = useState(null);
  const currentMenu = menuList
    ?.flatMap((menu: any) => menu?.DETAIL)
    .filter((detail: any) => detail.URL === pathname)[0];
  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      REPORT_DETAILS: "",
      START_DATE: "",
      END_DATE: "",
      CATEGORY_OF_WORK: "",
      LOCATION: "",
      EQUIPMENT_COLUMN: "",
      WO_TYPE_LIST: "",
      PRIORITY_LIST: "",
      ASSIGNEE_LIST: "",
      TEAM_LIST: "",
      SUB_STATUS_LIST: "",
      REPORTER_LIST: "",
      ASSETGROUP_ID: "",
      ASSETTYPE_ID: "",
      ASSETNAME: "",
      ACTIVE:
        props?.selectedData?.ACTIVE !== undefined
          ? props.selectedData.ACTIVE
          : true,

      SUB_STATUS: "",
    },
    mode: "onSubmit",
  });

  function convertToAoA(obj: any): any[][] {
    const result: any[][] = [];
    for (const key in obj) {
      if (Object.hasOwnProperty.call(obj, key)) {
        const value = obj[key];

        if (
          value !== null &&
          typeof value === "object" &&
          !Array.isArray(value)
        ) {
          if (value instanceof Date) {
            result.push([key, value]);
          }
          for (const nestedKey in value) {
            if (Object.hasOwnProperty.call(value, nestedKey)) {
              const nestedValue = value[nestedKey];

              result.push([`${key}.${nestedKey}`, nestedValue]);
            } else {
              result.push([`${key}.${nestedKey}`, value[nestedKey]]);
            }
          }
        } else {
          // Regular key-value pair
          result.push([key, value]);
        }
      }
    }

    return result;
  }

  const ExportCSV = async (csvData: any, searchData: any, fileName: any) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Report");

    // Add summary section
    const rowSummary = worksheet.addRow([reportSummary]);
    rowSummary.font = { bold: true };
    rowSummary.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "" },
    };
    rowSummary.border = {
      top: { style: "medium", color: { argb: "FF000000" } },
      bottom: { style: "medium", color: { argb: "FF000000" } },
      left: { style: "medium", color: { argb: "FF000000" } },
      right: { style: "medium", color: { argb: "FF000000" } },
    };

    // Add report details
    const summaryJSONData = convertToAoA(reportDetails);
    summaryJSONData.forEach((row) => worksheet.addRow(row));
    worksheet.addRow([]); // Empty row

    // Add "Report Details" title (will merge later)
    const detailsTitleRow = worksheet.addRow(["Report Details"]);

    // Add headers and data first
    const jobHeaders = csvData.length > 0 ? Object.keys(csvData[0]) : [];
    const headerRow = worksheet.addRow(jobHeaders);

    // Style headers
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "#8e724a" },
      };
      cell.font = {
        bold: true,
        color: { argb: "FFFFFFFF" },
      };
      cell.border = {
        top: { style: "thin", color: { argb: "FF000000" } },
        bottom: { style: "thin", color: { argb: "FF000000" } },
        left: { style: "thin", color: { argb: "FF000000" } },
        right: { style: "thin", color: { argb: "FF000000" } },
      };
      cell.alignment = { horizontal: "center" };
    });

    // Add all data rows
    csvData.forEach((item: any) => {
      const row = jobHeaders.map((header) => item[header]);
      worksheet.addRow(row);
    });

    try {
      const lastCol = worksheet.columns
        ? String.fromCharCode(64 + worksheet.columns.length)
        : "J";
      worksheet.mergeCells(
        `A${detailsTitleRow.number}:${lastCol}${detailsTitleRow.number}`
      );
    } catch (error) {
      worksheet.mergeCells(
        `A${detailsTitleRow.number}:J${detailsTitleRow.number}`
      );
    }

    // Apply styling to the merged title
    detailsTitleRow.font = { bold: true };
    detailsTitleRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "" },
    };
    detailsTitleRow.border = {
      top: { style: "medium", color: { argb: "FF000000" } },
      bottom: { style: "medium", color: { argb: "FF000000" } },
      left: { style: "medium", color: { argb: "FF000000" } },
      right: { style: "medium", color: { argb: "FF000000" } },
    };
    detailsTitleRow.alignment = { horizontal: "center", vertical: "middle" };

    // Auto-fit columns
    worksheet.columns.forEach((column: any) => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, (cell: any) => {
        const columnLength = cell.value ? cell.value.toString().length : 0;
        if (columnLength > maxLength) {
          maxLength = columnLength;
        }
      });
      column.width = Math.min(Math.max(maxLength + 2, 10), 50);
    });

    // Generate Excel file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    FileSaver.saveAs(blob, `${fileName}.xlsx`);
  };

  const onSubmit = async (payload: any) => {
    setReportStatus(true);
    let data: any = {};

    let payloadData: any = {};
    if (payload?.REPORT_DETAILS?.REPORT_ID === 1) {
      data = {
        Start_Date: moment(payload?.START_DATE).format(dateFormat()),
        End_Date: moment(payload?.END_DATE).format(dateFormat()),
        Category_Of_Work: payload?.CATEGORY_OF_WORK?.map(
          (item: any) => item?.WO_TYPE_NAME
        )?.join(", "),
        Location: payload?.LOCATION.map(
          (item: any) => item?.LOCATION_DESCRIPTION
        ).join(", "),
      };
    } else if (payload?.REPORT_DETAILS?.REPORT_ID === 2) {
      data = {
        Start_Date: moment(payload?.START_DATE).format(dateFormat()),
        End_Date: moment(payload?.END_DATE).format(dateFormat()),
      };
    } else if (payload?.REPORT_DETAILS?.REPORT_ID === 3) {
      data = {
        Location: payload?.LOCATION.map(
          (item: any) => item?.LOCATION_DESCRIPTION
        ).join(", "),
        Equipment: "All Equipments",
      };
    } else if (payload?.REPORT_DETAILS?.REPORT_ID === 4) {
      data = {
        Start_Date: moment(payload?.START_DATE).format(dateFormat()),
        End_Date: moment(payload?.END_DATE).format(dateFormat()),
      };
    } else if (payload?.REPORT_DETAILS?.REPORT_ID === 5) {
      data = {
        Start_Date: moment(payload?.START_DATE).format(dateFormat()),
        End_Date: moment(payload?.END_DATE).format(dateFormat()),
        Location: payload?.LOCATION.map(
          (item: any) => item?.LOCATION_DESCRIPTION
        ).join(", "),
        Group:
          payload?.ASSETGROUP_ID?.length > 0
            ? payload?.ASSETGROUP_ID.map(
              (item: any) => item?.ASSETGROUP_NAME
            ).join(", ")
            : "",
        Type:
          payload?.ASSETTYPE_ID?.length > 0
            ? payload?.ASSETTYPE_ID.map(
              (item: any) => item?.ASSETTYPE_NAME
            ).join(", ")
            : "",
        AssetName:
          payload?.ASSETNAME?.length > 0
            ? payload?.ASSETNAME.map((item: any) => item?.ASSET_NAME).join(", ")
            : "",
      };
    }
    let fromDate = moment(payload?.START_DATE).format("DD-MM");
    let endDate = moment(payload?.END_DATE).format("DD-MM-YYYY");
    const woTypeCode =
      payload?.CATEGORY_OF_WORK?.length > 0
        ? payload?.CATEGORY_OF_WORK?.map((item: any) => {
          return {
            WO_TYPE_CODE: item?.WO_TYPE_CODE,
          };
        })
        : [];

    const locationId =
      payload?.LOCATION?.length > 0
        ? payload?.LOCATION?.map((item: any) => {
          return { LOCATION_ID: item?.LOCATION_ID };
        })
        : [];
    const woTypeList =
      payload?.WO_TYPE_LIST?.length > 0
        ? payload?.WO_TYPE_LIST?.map((item: any) => {
          return { WO_TYPE_CODE: item?.WO_TYPE_CODE };
        })
        : [];
    const priorityList =
      payload?.PRIORITY_LIST?.length > 0
        ? payload?.PRIORITY_LIST?.map((item: any) => {
          return { SEVERITY_ID: item?.SEVERITY_ID };
        })
        : [];
    const assigneeList =
      payload?.ASSIGNEE_LIST?.length > 0
        ? payload?.ASSIGNEE_LIST?.map((item: any) => {
          return { USER_ID: item?.USER_ID };
        })
        : [];
    const teamList =
      payload?.TEAM_LIST?.length > 0
        ? payload?.TEAM_LIST?.map((item: any) => {
          return { TEAM_ID: item?.TEAM_ID };
        })
        : [];
    const reportList =
      payload?.REPORTER_LIST?.length > 0
        ? payload?.REPORTER_LIST?.map((item: any) => {
          return { REPORT_ID: item?.USER_ID };
        })
        : [];
    const assetGroup =
      payload?.ASSETGROUP_ID?.length > 0
        ? payload?.ASSETGROUP_ID?.map((item: any) => {
          return { ASSETGROUP_ID: item?.ASSETGROUP_ID };
        })
        : [];
    const assetType =
      payload?.ASSETTYPE_ID?.length > 0
        ? payload?.ASSETTYPE_ID?.map((item: any) => {
          return { ASSETTYPE_ID: item?.ASSETTYPE_ID };
        })
        : [];
    const assetList =
      payload?.ASSETNAME?.length > 0
        ? payload?.ASSETNAME?.map((item: any) => {
          return { ASSET_ID: item?.ASSET_ID };
        })
        : [];
    const subStatusList =
      subStatusData?.length > 0
        ? subStatusData?.map((item: any) => {
          return {
            STATUS_CODE: item?.STATUS_CODE,
          };
        })
        : [];

    try {
      if (payload?.REPORT_DETAILS?.REPORT_ID === 1) {
        payloadData = {
          FROM_DATE: moment(payload?.START_DATE).format("YYYY-MM-DD"),
          TO_DATE: moment(payload?.END_DATE).format("YYYY-MM-DD"),
          WO_TYPE_LIST: woTypeCode,
          LOCATION_LIST: locationId,
          REPORT_ID: payload?.REPORT_DETAILS?.REPORT_ID,
        };
      } else if (payload?.REPORT_DETAILS?.REPORT_ID === 2) {
        payloadData = {
          FROM_DATE: moment(payload?.START_DATE).format("YYYY-MM-DD"),
          TO_DATE: moment(payload?.END_DATE).format("YYYY-MM-DD"),

          REPORT_ID: payload?.REPORT_DETAILS?.REPORT_ID,
        };
      } else if (payload?.REPORT_DETAILS?.REPORT_ID === 3) {
        payloadData = {
          LOCATION_LIST: locationId,
          REPORT_ID: payload?.REPORT_DETAILS?.REPORT_ID,
        };
      } else if (payload?.REPORT_DETAILS?.REPORT_ID === 4) {
        payloadData = {
          FROM_DATE: moment(payload?.START_DATE).format("YYYY-MM-DD"),
          TO_DATE: moment(payload?.END_DATE).format("YYYY-MM-DD"),
          WO_TYPE_LIST: woTypeList,
          PRIORITY_LIST: priorityList,
          ASSIGNEE_LIST: assigneeList,
          TEAM_LIST: teamList,
          SUB_STATUS_LIST: subStatusList,
          LOCATION_LIST: locationId,
          REPORTER_LIST: reportList,
          REPORT_ID: payload?.REPORT_DETAILS?.REPORT_ID,
        };
      } else if (payload?.REPORT_DETAILS?.REPORT_ID === 5) {
        payloadData = {
          FROM_DATE: moment(payload?.START_DATE).format("YYYY-MM-DD"),
          TO_DATE: moment(payload?.END_DATE).format("YYYY-MM-DD"),

          LOCATION_LIST: locationId,
          ASSETGROUP_LIST: assetGroup,
          ASSETTYPE_LIST: assetType,
          ASSETNAME_LIST: assetList,
          REPORT_ID: payload?.REPORT_DETAILS?.REPORT_ID,
        };
      }
      setLoading(true);

      const res = await callPostAPI(
        ENDPOINTS.GET_REPORT_DATA,
        payloadData,
        "AS067"
      );
      if (res?.FLAG === 1) {
        setSearchStatus(true);
        setCheckedReportData([]);
        setColumnData(res?.COLUMNLIST);
        setOriginalList(res?.REPORTDATA);
        setReportData(res?.REPORTDATA);
        if (reportID === 3 || reportID === 4 || reportID === 5) {
          setEquipmentColumnStatus(true);
          setEquipmentColumnList(res?.COLUMNLIST);
        }
        setReportDetails(data);

        fromDate = fromDate !== "Invalid date" ? fromDate : "";
        endDate = endDate !== "Invalid date" ? endDate : "";
        setReportDate(
          `${reportID === 1
            ? "KPI_Report"
            : reportID === 2
              ? "Aging_Report"
              : reportID === 3
                ? "Equipment_Report"
                : reportID === 4
                  ? "Work_HisotryReport"
                  : reportID === 5
                    ? "PPM_Schdule"
                    : ""
          }${fromDate}_${endDate}`
        );
        let summary_report: any = `${reportID === 1
          ? "KPI Report Summary"
          : reportID === 2
            ? "Aging Report Summary"
            : reportID === 3
              ? "Equipment Report Summary"
              : reportID === 4
                ? "Work Hisotry Report Summary"
                : reportID === 5
                  ? "PPM Schdule Report Summary"
                  : ""
          }`;
        setReportSummary(summary_report);
        //   ExportCSV(res?.REPORTDATA,  data , );
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const getOption = async () => {
    const res = await callPostAPI(ENDPOINTS.GET_COMMON_REPORT_LIST, null);
    if (res?.FLAG === 1) {
      setOptions({
        reportList: res?.REPORTLIST,
        locationList: res?.LOCATIONLIST,
        woTypeList: res?.WOTYPELIST,
      });
    }
  };

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
          });
          group.seen.add(subLabel);
        }
      }
    );
    return Object.values(grouped).map(({ seen, ...group }: any) => group);
  };

  const handlerFilterData = async () => {
    const res: any = await callPostAPI(
      ENDPOINTS.FILTER_GET_API,
      {},
      currentMenu?.FUNCTION_CODE
    );
    if (res?.FLAG === 1) {
      setFilterOption(res);
      const statusOptions1 = transformStatusData(res?.STATUSLIST);
      setStautusData(statusOptions1);
      setStatusReponse(res?.STATUSLIST);
    }
  };

  const getPPMHandler = async () => {
    const res = await callPostAPI(
      ENDPOINTS.GET_SERVICEREQUST_MASTERLIST,
      {},
      "HD004"
    );

    if (res?.FLAG === 1) {
      setAssetData({
        assetGroup: res?.ASSETGROUPLIST,
        assetType: res?.ASSETTYPELIST,
        asset_Name: res?.ASSETLIST,
      });
    }
  };

  const handlerDownload = () => {
    const isReportDownLoad: any = reportData.some(
      (obj: any) => Object.keys(obj).length > 0
    );
    if (isReportDownLoad) {
      ExportCSV(reportData, reportDetails, reportDate);
    } else {
      toast.error("Please select at least one item to export");
    }
  };

  const handlerColumnChange = useCallback(
    async (e: any) => {
      const selectedColumns = e?.target?.value;
      setColumnData(selectedColumns);
      if (originalList.length > 0 && selectedColumns) {
        const colNames = selectedColumns.map((col: any) => col.COLMUNM_NAME);
        const filteredData = originalList.map((item: any) => {
          const newItem: any = {};
          colNames.forEach((colName: string) => {
            if (item.hasOwnProperty(colName)) {
              newItem[colName] = item[colName];
            }
          });
          return newItem;
        });
        setReportData(filteredData);
      }
    },
    [originalList]
  );

  useEffect(() => {
    getOption();
  }, []);

  useEffect(() => {
    if (
      equimentColumnStatus &&
      equipmentColumnList &&
      equipmentColumnList.length > 0
    ) {
      setValue("EQUIPMENT_COLUMN", equipmentColumnList);
    }
  }, [
    equimentColumnStatus,
    equipmentColumnList,
    setValue,
    handlerColumnChange,
  ]);

  useEffect(() => {
    setReportData(reportData);
  }, [reportData]);

  useEffect(() => {
    if (
      (!isSubmitting && Object?.values(errors)[0]?.type === "required") ||
      (!isSubmitting && Object?.values(errors)[0]?.type === "validate")
    ) {
      const check: any = Object?.values(errors)[0]?.message;
      toast?.error(check);
      setColumnData([]);
      setReportData([]);
      setReportStatus(false);
    }
  }, [isSubmitting]);

  const statusTemplate = (option: any) => {
    return (
      <>
        <div>{option.label}</div>
      </>
    );
  };

  return (
    <section className="w-full">
      <h6>{currentMenu?.FUNCTION_DESC}</h6>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="mt-2">
          <div className="mt-1 grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-4 lg:grid-cols-4">
            <Field
              controller={{
                name: "REPORT_DETAILS",
                control: control,
                render: ({ field }: any) => {
                  return (
                    <Select
                      options={options?.reportList || []}
                      {...register("REPORT_DETAILS", {})}
                      label="Report Details List"
                      require={true}
                      findKey={"ID"}
                      optionLabel="REPORT_NAME"
                      setValue={setValue}
                      invalid={errors.REPORT_DETAILS}
                      {...field}
                      onChange={(e: any) => {
                        {
                          setReportData([]);
                          setColumnData([]);
                          setValue("ASSETGROUP_ID", "");
                          setValue("LOCATION", "");
                          setValue("ASSETTYPE_ID", "");
                          setValue("ASSIGNEE_LIST", "");
                          setValue("START_DATE", "");
                          setValue("END_DATE", "");

                          setValue("CATEGORY_OF_WORK", "");
                          setValue("LOCATION", "");
                          setValue("EQUIPMENT_COLUMN", "");
                          setValue("WO_TYPE_LIST", "");
                          setValue("PRIORITY_LIST", "");
                          setValue("ASSIGNEE_LIST", "");
                          setValue("TEAM_LIST", "");
                          setValue("SUB_STATUS_LIST", "");
                          setValue("REPORTER_LIST", "");
                          setValue("ASSETGROUP_ID", "");
                          setValue("ASSETTYPE_ID", "");
                          setValue("ASSETNAME", "");
                          setSearchStatus(false);
                          field.onChange(e);
                          setEquipmentColumnStatus(false);
                          setReportId(e?.target?.value?.REPORT_ID);
                          clearErrors();

                          if (e?.target?.value?.REPORT_ID === 4) {
                            handlerFilterData();
                          } else if (e?.target?.value?.REPORT_ID === 5) {
                            {
                              getPPMHandler();
                            }
                          }
                          setReportStatus(false);
                        }
                      }}
                    />
                  );
                },
              }}
            />

            {reportID === 1 ||
              reportID === 2 ||
              reportID === 4 ||
              reportID === 5 ? (
              <Field
                controller={{
                  name: "START_DATE",
                  control: control,
                  rules: {
                    validate: (value: any) => {
                      return (value &&
                        value &&
                        (reportID === 1 ||
                          reportID === 2 ||
                          reportID === 4 ||
                          reportID === 5)) !== ""
                        ? true
                        : "Please fill the required fields.";
                    },
                  },
                  render: ({ field, fieldState }: any) => {
                    return (
                      <DateCalendar
                        {...register("START_DATE", {
                          //    required: (reportID === 1 || reportID === 2 || reportID === 5 || reportID === 6 ?"Please fill the required fields.":""),
                        })}
                        label="Start  Date"
                        setValue={setValue}
                        require={true}
                        showIcon
                        invalid={
                          reportID === 1 ||
                            reportID === 2 ||
                            reportID === 4 ||
                            reportID === 5
                            ? errors?.START_DATE
                            : ""
                        }
                        {...field}
                        onChange={(e: any) => {
                          setStartDate(e?.target?.value);

                          field.onChange(e);
                        }}
                        minDate={reportID === 5 ? new Date() : ""}
                      />
                    );
                  },
                }}
              />
            ) : (
              ""
            )}
            {reportID === 1 ||
              reportID === 2 ||
              reportID === 4 ||
              reportID === 5 ? (
              <Field
                controller={{
                  name: "END_DATE",
                  control: control,
                  rules: {
                    validate: (value: any) => {
                      return (value &&
                        value &&
                        (reportID === 1 ||
                          reportID === 2 ||
                          reportID === 4 ||
                          reportID === 5)) !== ""
                        ? true
                        : "Please fill the required fields.";
                    },
                  },
                  render: ({ field, fieldState }: any) => {
                    return (
                      <DateCalendar
                        {...register("END_DATE", {
                          //   required: (reportID === 1 || reportID === 2 || reportID === 5 || reportID === 6?"Please fill the required fields.":""),
                        })}
                        label="End Date"
                        setValue={setValue}
                        require={true}
                        minDate={
                          reportID === 5 ? new Date() : new Date(startDate)
                        }
                        showIcon
                        invalid={
                          reportID === 1 ||
                            reportID === 2 ||
                            reportID === 4 ||
                            reportID === 5
                            ? fieldState?.error
                            : ""
                        }
                        {...field}
                      />
                    );
                  },
                }}
              />
            ) : (
              ""
            )}
            {reportID === 1 ? (
              <Field
                controller={{
                  name: "CATEGORY_OF_WORK",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <MultiSelects
                        options={options?.woTypeList || []}
                        {...register("CATEGORY_OF_WORK", {
                          required:
                            reportID === 1
                              ? "Please fill the required fields."
                              : "",
                        })}
                        label="Category Of Work"
                        require={true}
                        findKey={"ID"}
                        optionLabel="WO_TYPE_NAME"
                        setValue={setValue}
                        invalid={errors.CATEGORY_OF_WORK}
                        resetFilterOnHide={true}
                        {...field}
                      />
                    );
                  },
                }}
              />
            ) : (
              ""
            )}

            {reportID === 1 ||
              reportID === 3 ||
              reportID === 4 ||
              reportID === 5 ? (
              <Field
                controller={{
                  name: "LOCATION",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <MultiSelects
                        options={options?.locationList || []}
                        {...register("LOCATION", {
                          required:
                            reportID === 1 ||
                              reportID === 3 ||
                              reportID === 4 ||
                              reportID === 5
                              ? "Please fill the required fields."
                              : "",
                        })}
                        label="Location"
                        require={true}
                        findKey={"ID"}
                        optionLabel="LOCATION_DESCRIPTION"
                        setValue={setValue}
                        invalid={
                          reportID === 1 ||
                            reportID === 3 ||
                            reportID === 4 ||
                            reportID === 5
                            ? errors.LOCATION
                            : ""
                        }
                        resetFilterOnHide={true}
                        {...field}
                      />
                    );
                  },
                }}
              />
            ) : (
              ""
            )}
            {reportID === 4 ? (
              <>
                <Field
                  controller={{
                    name: "WO_TYPE_LIST",
                    control: control,
                    render: ({ field }: any) => {
                      return (
                        <MultiSelects
                          {...register("WO_TYPE_LIST", {})}
                          showClear={true}
                          label="Workorder Type"
                          options={filterOption?.WOTYPELIST}
                          filter
                          maxSelectedLabels={1}
                          optionLabel={"WO_TYPE_NAME"}
                          placeholder="Workorder Type"
                          setValue={setValue}
                          resetFilterOnHide={true}
                          {...field}
                        />
                      );
                    },
                  }}
                />
                <Field
                  controller={{
                    name: "SUB_STATUS",
                    control: control,
                    render: ({ field }: any) => {
                      return (
                        <MultiSelects
                          {...register("SUB_STATUS", {
                            onChange: (e: any) => {
                              const subData = statusData?.flatMap(
                                (mainStatus: any) =>
                                  mainStatus.items.filter((item: any) =>
                                    e?.target?.value.includes(item.value)
                                  )
                              );
                              setSubStatusData(subData);
                            },
                          })}
                          options={statusData}
                          filter
                          maxSelectedLabels={1}
                          label="Status"
                          optionGroupLabel="SUB_STATUS_DESC"
                          optionGroupChildren="items"
                          optionGroupTemplate={statusTemplate}
                          placeholder="Status"
                          setValue={setValue}
                          resetFilterOnHide={true}
                          {...field}
                        />
                      );
                    },
                  }}
                />
                <Field
                  controller={{
                    name: "TEAM_LIST",
                    control: control,
                    render: ({ field }: any) => {
                      return (
                        <MultiSelects
                          {...register("TEAM_LIST", {})}
                          label="Team"
                          options={filterOption?.TEAMLIST}
                          filter
                          maxSelectedLabels={1}
                          optionLabel={"TEAM_NAME"}
                          placeholder="Team"
                          setValue={setValue}
                          {...field}
                        />
                      );
                    },
                  }}
                />
                <Field
                  controller={{
                    name: "PRIORITY_LIST",
                    control: control,
                    render: ({ field }: any) => {
                      return (
                        <MultiSelects
                          {...register("PRIORITY_LIST", {})}
                          label="Priority"
                          filter
                          maxSelectedLabels={1}
                          options={filterOption?.PRIORITYLIST}
                          optionLabel={"SEVERITY"}
                          placeholder="Priority"
                          setValue={setValue}
                          {...field}
                        />
                      );
                    },
                  }}
                />
                <Field
                  controller={{
                    name: "REPORTER_LIST",
                    control: control,
                    render: ({ field }: any) => {
                      return (
                        <MultiSelects
                          {...register("REPORTER_LIST", {})}
                          label="Reporter"
                          options={filterOption?.REPORTERLIST}
                          filter
                          maxSelectedLabels={1}
                          optionLabel={"LOGIN_NAME"}
                          placeholder="Reporter"
                          setValue={setValue}
                          {...field}
                        />
                      );
                    },
                  }}
                />
                <Field
                  controller={{
                    name: "ASSIGNEE_LIST",
                    control: control,
                    render: ({ field }: any) => {
                      return (
                        <MultiSelects
                          {...register("ASSIGNEE_LIST", {})}
                          label="Assignee"
                          options={filterOption?.ASSIGNEELIST}
                          filter
                          maxSelectedLabels={1}
                          optionLabel={"LOGIN_NAME"}
                          placeholder="Assignee"
                          setValue={setValue}
                          {...field}
                        />
                      );
                    },
                  }}
                />
              </>
            ) : (
              <></>
            )}

            {reportID === 5 ? (
              <>
                <Field
                  controller={{
                    name: "ASSETGROUP_ID",
                    control: control,
                    render: ({ field }: any) => {
                      return (
                        <MultiSelects
                          {...register("ASSETGROUP_ID", {
                            onChange: (e) => {
                              const matchingObjects =
                                assetData?.assetType?.filter((obj1: any) =>
                                  e.target.value.some(
                                    (obj2: any) =>
                                      obj1.ASSETGROUP_ID === obj2.ASSETGROUP_ID
                                  )
                                );

                              setType(matchingObjects);
                            },
                          })}
                          label="Group"
                          options={assetData?.assetGroup}
                          filter
                          maxSelectedLabels={1}
                          optionLabel={"ASSETGROUP_NAME"}
                          placeholder="Please select value"
                          setValue={setValue}
                          {...field}
                        />
                      );
                    },
                  }}
                />
                <Field
                  controller={{
                    name: "ASSETTYPE_ID",
                    control: control,
                    render: ({ field }: any) => {
                      return (
                        <MultiSelects
                          {...register("ASSETTYPE_ID", {
                            onChange: (e: any) => {
                              const assetFilterData: any =
                                assetData?.asset_Name?.filter((obj1: any) =>
                                  e.target.value.some(
                                    (obj2: any) =>
                                      obj1.ASSETTYPE_ID === obj2.ASSETTYPE_ID
                                  )
                                );

                              setAssetName(assetFilterData);
                            },
                          })}
                          options={assetData?.assetType}
                          filter
                          label="Type"
                          maxSelectedLabels={1}
                          optionLabel={"ASSETTYPE_NAME"}
                          placeholder="Please select value"
                          setValue={setValue}
                          {...field}
                        />
                      );
                    },
                  }}
                />
                <Field
                  controller={{
                    name: "ASSETNAME",
                    control: control,
                    render: ({ field }: any) => {
                      return (
                        <MultiSelects
                          {...register("ASSETNAME", {})}
                          options={assetName}
                          filter
                          label="Equipment Name"
                          maxSelectedLabels={1}
                          optionLabel={"ASSET_NAME"}
                          placeholder="Please select value"
                          setValue={setValue}
                          {...field}
                        />
                      );
                    },
                  }}
                />
              </>
            ) : (
              <></>
            )}

            {reportID === 1 ||
              reportID === 2 ||
              reportID === 3 ||
              reportID === 4 ||
              reportID === 5 ? (
              <div className="flex align-items-center">
                <Buttons
                  type="submit"
                  className="Primary_Button md:mt-5"
                  label={"Search"}
                  name="Download"
                />
              </div>
            ) : (
              ""
            )}
          </div>
        </Card>
        {loading ? (
          <LoaderShow />
        ) : (
          <>
            {reportStatus && (
              <>
                {reportData?.length > 0 ? (
                  <>
                    <Card className="mt-2">
                      <div className="w-full">
                        <div className="mt-1  flex  justify-between ">
                          {/* <div></div> */}
                          <h6 className="text-start">Report Summary</h6>
                          <div className="flex justify-end md:col-span-1">
                            {equimentColumnStatus ? (
                              <Field
                                controller={{
                                  name: "EQUIPMENT_COLUMN",
                                  control: control,
                                  render: ({ field }: any) => (
                                    <MultiSelects
                                      options={equipmentColumnList || []}
                                      {...register("EQUIPMENT_COLUMN", {
                                        // required: "Please fill the required fields.",
                                        onChange: (e) => {
                                          handlerColumnChange(e);
                                        },
                                      })}
                                      findKey={"COL_ID"}
                                      optionLabel="COLMUNM_NAME"
                                      maxSelectedLabels={2}
                                      //  selectedData={}
                                      setValue={setValue}
                                      invalid={errors.LOCATION}
                                      {...field}
                                    />
                                  ),
                                }}
                              />
                            ) : (
                              ""
                            )}
                            <div className="flex items-end">
                              <Buttons
                                type="button"
                                className="justify-self-end"
                                icon="pi pi-download"
                                label={""}
                                name="Download"
                                onClick={() => handlerDownload()}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex ">
                        <div className="border-t border-gray-200 pt-4">
                          {Object.entries(reportDetails).map(
                            ([key, value]: [string, any]) => {
                              if (
                                value === "" ||
                                value === null ||
                                value === undefined
                              ) {
                                return null;
                              }

                              if (
                                key === "Location" ||
                                key === "Equipment" ||
                                key === "Group" ||
                                key === "Type" ||
                                key === "AssetName" ||
                                key === "Category_Of_Work"
                              ) {
                                const truncatedDescription =
                                  value?.length > 50
                                    ? value.slice(0, 50) + "..."
                                    : value;

                                return (
                                  <div key={key}>
                                    <strong>{key.replace(/_/g, " ")}: </strong>
                                    <span
                                      className="cursor-pointer"
                                      title={value}
                                    >
                                      {truncatedDescription === ""
                                        ? "NA"
                                        : truncatedDescription}
                                    </span>
                                  </div>
                                );
                              }

                              if (
                                typeof value === "object" &&
                                !Array.isArray(value) &&
                                value !== null
                              ) {
                                if (value instanceof Date) {
                                  return (
                                    <div key={key}>
                                      <strong>{key.replace(/_/g, " ")}:</strong>{" "}
                                      {value instanceof Date
                                        ? value.toLocaleString()
                                        : value}
                                    </div>
                                  );
                                }

                                // For nested objects, filter out blank properties
                                const nestedEntries = Object.entries(
                                  value
                                ).filter(
                                  ([_, subValue]) =>
                                    subValue !== "" &&
                                    subValue !== null &&
                                    subValue !== undefined
                                );

                                // Only render if there are non-blank nested properties
                                if (nestedEntries.length > 0) {
                                  return (
                                    <div key={key}>
                                      {nestedEntries.map(
                                        ([subKey, subValue]: [string, any]) => (
                                          <p key={subKey}>
                                            <strong>
                                              {subKey.replace(/_/g, " ")}:
                                            </strong>{" "}
                                            {subValue}
                                          </p>
                                        )
                                      )}
                                    </div>
                                  );
                                }
                                return null;
                              } else {
                                return (
                                  <div key={key}>
                                    <strong>{key.replace(/_/g, " ")}:</strong>{" "}
                                    {value}
                                  </div>
                                );
                              }
                            }
                          )}
                        </div>
                      </div>
                    </Card>
                  </>
                ) : (
                  <></>
                )}

                <ReportTable reportData={reportData} columnData={columnData} />
              </>
            )}
          </>
        )}
      </form>
      {/* <Dialog
        header=""
        visible={loading}
        closable={false}
        onHide={() => {}}
        modal
        draggable={false}
        resizable={false}
        maskStyle={{ backgroundColor: "transparent" }}
      >
        <div
          className="w-6 h-6  animate-spin  size-6 border-[3px] border-current border-t-transparent text-[#8E724A] rounded-full "
          role="status"
          aria-label="loading"
        >
          <span className="sr-only">Loading...</span>
        </div>
      </Dialog> */}
    </section>
  );
};

const ReportTable = ({ reportData, columnData }: any) => {
  const topScrollRef = useRef<any | null>(null);
  const bottomScrollRef = useRef<any | null>(null);
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(15);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [scrollWidth, setScrollWidth] = useState("100%");
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

  const onPageChange = (event: any) => {
    setFirst(event.first);
    setRows(event.rows);
  };

  useEffect(() => {
    setFirst(0);
  }, [reportData, rows]);
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
  }, []);

  useEffect(() => {
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
  }, [reportData]);
  return (
    <>
      <Card className="mt-2">
        <div
          ref={topScrollRef}
          className="top-scrollbar"
          style={{
            width: "100%",
            overflowX: "auto",
            overflowY: "hidden",
            height: "15px",
            marginBottom: "5px",
            backgroundColor: "#f5f5f5",
            borderRadius: "4px",
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
          ref={tableContainerRef}
          style={{
            width: "100%",
            overflow: "hidden",
            position: "relative",
            border: "1px solid #dee2e6",
            borderRadius: "6px",
          }}
        >
          <DataTable
            value={reportData?.slice(first, first + rows)}
            className="primeTable"
            scrollable
            style={{ minWidth: "100%", overflowX: "auto" }}
            emptyMessage={"No Data found"}
            tableStyle={{ minWidth: "1200px" }}
          >
            {columnData?.map((column: any) => (
              <Column
                className="border-b-2 border-gray-200"
                key={column?.COL_ID} // Use a unique ID from your column data
                field={column?.COLMUNM_NAME}
                header={column?.COLMUNM_NAME}
                style={{ width: "200px" }}
              />
            ))}
          </DataTable>
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
            }}
          >
            <div
              style={{
                height: "1px",
                // width: calculateScrollWidth(),
              }}
            />
          </div>
        </div>
        {reportData.some((obj: any) => Object.keys(obj).length > 0) && (
          <div className="flex p-4 bg-white flex-row gap-3a justify-between">
            <div className="mt-3 Text_Secondary Input_label">
              {`Showing ${first + 1} - ${reportData?.slice(first, first + rows)?.length + first
                }  of ${reportData?.length}`}
            </div>
            <Paginator
              first={first}
              rows={rows}
              totalRecords={reportData?.length}
              onPageChange={onPageChange}
              currentPageReportTemplate="Items per Page:-"
              rowsPerPageOptions={[15, 25, 50]}
              alwaysShow={false}
              template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
            ></Paginator>{" "}
          </div>
        )}
      </Card>
    </>
  );
};
export default Report;
