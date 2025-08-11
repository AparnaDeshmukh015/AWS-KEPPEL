import React, { ReactNode, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import "./Dashboard.css";
import { OverlayPanel } from "primereact/overlaypanel";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import ReactApexChart from "react-apexcharts";
import { SelectButton } from "primereact/selectbutton";
import { ENDPOINTS } from "../../utils/APIEndpoints";
import { callPostAPI } from "../../services/apis";

import Buttons from "../../components/Button/Button";
import { Calendar } from "primereact/calendar";
import { toast } from "react-toastify";
import moment from "moment";
import { useLocation, useOutletContext } from "react-router-dom";
import { colors } from "react-select/dist/declarations/src/theme";
import Field from "../../components/Field";
import { useForm } from "react-hook-form";
import MultiSelects from "../../components/MultiSelects/MultiSelects";
import "../../components/MultiSelects/MultiSelects.css";
import { InputText } from "primereact/inputtext";
import { DataScroller, DataScrollerProps } from "primereact/datascroller";
import { DataView, DataViewLayoutOptions } from "primereact/dataview";
import * as excelJs from "exceljs";
import * as xlsx from "xlsx";
import { saveAs } from "file-saver";
import LocationHierarchyDialog from "../../components/HierarchyDialog/LocationHierarchyDialog";
import { LOCALSTORAGE } from "../../utils/constants";
import { transpileModule } from "typescript";
import { FileUpload } from "primereact/fileupload";
import LoaderFileUpload from "../../components/Loader/LoaderFileUpload";
import LoaderShow from "../../components/Loader/LoaderShow";

let fromDate: any;
let ToDate: any;
let totresvalue: any = 0;
let totretvalue: any = 0;
let IsCheckValueRes: any = "Hour";
let IsCheckValueRect: any = "Hour";
let IsResRectCheck: any = "All";

const Dashboard = () => {
  let { pathname } = useLocation();
  const [selectedFacility, menuList]: any = useOutletContext();
  const [visibleEquipmentlist, showEquipmentlist] = useState(false);
  const [dashboardConfigureList, setDashboardConfigureList] = useState<
    any | null
  >([]);
  const [selectedKey, setSelectedKey] = useState<any>(null);
  const [nodes, setNodes] = useState<any[]>([]);
  const [locationFilteredData, setLocationFilteredData] = useState<any[]>([]);
  const [loading, setLaoding] = useState<boolean>(false);
  const [locationResetStatus, setLocationResetStatus] = useState<any | null>(
    false
  );
  const [locationCheckData, setLocationCheckData] = useState<any | null>([]);
  const currentMenu = menuList
    ?.flatMap((menu: any) => menu?.DETAIL)
    .filter((detail: any) => detail.URL === pathname)[0];
  let OnloadFilterList: any = [];
  const FACILITY: any = localStorage.getItem("FACILITYID");
  const FACILITYID: any = JSON.parse(FACILITY);
  const isPrecondition = FACILITYID?.ISPRECONDITION === true;
  let OnloadResolveCaseList: any = [
    {
      Cancelled: 0,
      Completed: 0,
      Accepted: 0,
      ...(isPrecondition && { "Cancelled - Pre Conditional": 0 }),
    },
  ];

  let OnloadActiveCaseList: any = [
    {
      Open: 0,
      "In Progress": 0,
      "On Hold": 0,
      Rectified: 0,
      "Pending Action": 0,
      "Re Open": 0,
    },
  ];
  let OnloadCMWOList: any = [{ High: 0, Medium: 0, Low: 0 }];
  let OnloadPMWOList: any = [{ High: 0, Medium: 0, Low: 0 }];
  let OnloadPDWOList: any = [{ High: 0, Medium: 0, Low: 0 }];
  let OnloadAvgResList: any = [{ High: 0, Medium: 0, Low: 0 }];
  let OnloadAvgRetList: any = [{ High: 0, Medium: 0, Low: 0 }];
  const [location, setLocation] = useState<any | null>([]);
  const { i18n } = useTranslation();
  const { t } = useTranslation();
  const op: any = useRef<OverlayPanel>(null);
  const options: string[] = ["Day", "Hour"];
  const [valueRes, setValueRes] = useState<string>(options[1]);
  const [valueRect, setValueRect] = useState<string>(options[1]);
  const [DateDesc, setDateDesc] = useState<string>("");
  const [FilterDesc, setFilterDesc] = useState<string>("");
  const [WoCount, setWoCount] = useState<string>("");
  const [WoRetCount, setWoRetCount] = useState<string>("");
  const [AvgTotResTime, setAvgTotResTime] = useState<any>("0d 0h 0m");
  const [AvgTotRetTime, setAvgTotRetTime] = useState<any>(0);
  const [DateFilterList, setDateFilterList] = useState<any | null>([]);
  const [totalCaseCount, setTotalCaseCount] = useState<any>(0);
  const [totalEquipmentGroupCount, settotalEquipmentGroupCount] =
    useState<any>(0);
  const [totalEquipmentTypeCount, settotalEquipmentTypeCount] =
    useState<any>(0);
  const [totalIssueCount, settotalIssueCount] = useState<any>(0);
  const [totalAsssigneeCount, settotalAsssigneeCount] = useState<any>(0);
  const [totalReporterCount, settotalReporterCount] = useState<any>(0);
  const [searchText, setSearchText] = useState<any>("");
  const [locationName, setLocationName] = useState<any>(null);
  const [ResolvedCaseList, setResolvedCaseList] = useState<
    any | null | undefined
  >([0, 0]);
  const [CMWoList, setCMWoList] = useState<any | null | undefined>([0, 0, 0]);
  var onActiveColors: any = [];

  const [selectedCustomeDate, setSelectedCustome] = useState<boolean>(false);
  const [dateWO, setWODate] = useState<any | null>([]);
  const [equipmentGroupList, setequipmentGroup] = useState<any | null>([]);
  const [ogequipmentGroupList, setogequipmentGroup] = useState<any | null>([]);
  const [equipmentTypeList, setequipmentTypeList] = useState<any | null>([]);
  const [ogequipmentTypeList, setogequipmentTypeList] = useState<any | null>(
    []
  );
  const [issueList, setissueList] = useState<any | null>([]);
  const [ogissueList, setogissueList] = useState<any | null>([]);
  const [assignee, setAssignee] = useState<any | null>([]);
  const [ogassignee, setogAssignee] = useState<any | null>([]);

  const [reporterList, setreporterList] = useState<any | null>([]);
  const [ogreporterList, setogreporterList] = useState<any | null>([]);

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
  const AvgDashboardDataRes = (dataList: any) => {
    let v_data: any = [];
    const data: any = Object?.values(dataList);

    if (IsCheckValueRes === "Hour") {
      for (let i = 0; i < data?.length; i++) {
        const hours = Math.floor(data[i] / 60);
        v_data.push(`${hours}h`);
      }
    }
    if (IsCheckValueRes === "Day") {
      for (let i = 0; i < data?.length; i++) {
        const days = Math.floor(data[i] / (24 * 60));
        v_data.push(`${days}d`);
      }
    }
    return v_data;
  };
  const AvgDashboardDataRect = (dataList: any) => {
    let v_data: any = [];
    const data: any = Object.values(dataList);

    if (IsCheckValueRect === "Hour") {
      for (let i = 0; i < data?.length; i++) {
        const hours = Math.floor(data[i] / 60);
        v_data.push(`${hours}h`);
      }
    }
    if (IsCheckValueRect === "Day") {
      for (let i = 0; i < data?.length; i++) {
        const days = Math.floor(data[i] / (24 * 60));
        v_data.push(`${days}d`);
      }
    }
    return v_data;
  };

  const AvgTimeCalRes = (totalaval: any) => {
    var val = "0d 0h 0m";
    if (IsCheckValueRes === "Day") {
      const days = Math.floor(totalaval / (24 * 60));
      const hours = Math.floor((totalaval % (24 * 60)) / 60);
      const minutes = totalaval % 60;
      val = days + "d " + hours + "h " + minutes + "m";
    }
    if (IsCheckValueRes === "Hour") {
      const hours = Math.floor(totalaval / 60);
      const minutes = totalaval % 60;
      val = hours + "h " + minutes + "m";
    }
    return val;
  };

  const AvgTimeCalRect = (totalaval: any) => {
    var val = "0d 0h 0m";
    if (IsCheckValueRect === "Day") {
      const days = Math.floor(totalaval / (24 * 60));
      const hours = Math.floor((totalaval % (24 * 60)) / 60);
      const minutes = totalaval % 60;
      val = days + "d " + hours + "h " + minutes + "m";
    }
    if (IsCheckValueRect === "Hour") {
      const hours = Math.floor(totalaval / 60);
      const minutes = totalaval % 60;
      val = hours + "h " + minutes + "m";
    }
    return val;
  };

  const onToggleButtonChangeRes = async (e: any, ResRectCheck: any) => {
    setValueRes(e.value);
    IsResRectCheck = ResRectCheck;
    if (e.value != null) {
      IsCheckValueRes = e.value;
      let locationStatus: any = false;
      await getDashboardDetails(locationStatus);
    }
  };
  const onToggleButtonChangeRect = async (e: any, ResRectCheck: any) => {
    setValueRect(e.value);
    IsResRectCheck = ResRectCheck;
    if (e.value != null) {
      IsCheckValueRect = e.value;
      let locationStatus: any = false;
      await getDashboardDetails(locationStatus);
    }
  };

  const DashboardSeriesData = (detailsList: any = []) => {
    let dataDashboardSeriesData: any = Object.values(detailsList[0]);
    return dataDashboardSeriesData;
  };

  const DashboardLabelData = (detailsList: any) => {
    let dataDashboardLabelData: any = Object.keys(detailsList[0]);
    return dataDashboardLabelData;
  };

  const [optionsList, setObjet] = useState<any | null>({
    series: DashboardSeriesData(OnloadActiveCaseList),
    options: {
      chart: {
        type: "donut",
      },
      colors: ["#FF9089", "#7E7E7E", "#FFCE73", "#88C8FF", "#ffffff", "f1f1f1"],
      dataLabels: {
        enabled: false,
      },
      labels: DashboardLabelData(OnloadActiveCaseList),
      plotOptions: {
        pie: {
          donut: {
            labels: {
              show: true,
              total: {
                showAlways: true,
                label: "Active Cases",
                show: true,
                style: {
                  fontSize: "12px",
                  // color: "grey",
                },
              },
            },
          },
        },
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 300,
            },
            legend: {
              position: "bottom",
            },
          },
        },
      ],
    },
  });

  const [resolvedList, setResolved] = useState<any | null>({
    series: ResolvedCaseList,
    options: {
      chart: {
        type: "donut",
      },

      // colors: ["#7BD18A", "#C0E5C6"],
      colors: [],
      dataLabels: {
        enabled: false,
      },
      labels: DashboardLabelData(OnloadResolveCaseList),
      plotOptions: {
        pie: {
          donut: {
            // size: "65%",
            labels: {
              show: true,
              total: {
                showAlways: true,
                label: "Resolved Cases",
                show: true,
              },
            },
          },
        },
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 300,
            },
            legend: {
              position: "bottom",
            },
          },
        },
      ],
    },
  });

  const [correctiveList, setCorrective] = useState<any | null>({
    series: CMWoList,
    options: {
      chart: {
        type: "donut",
      },

      // colors: ["#FF655B", "#FFCE73", "#7BD18A"],
      colors: ["#e23b03", "#fff694", "#c3f060"],
      dataLabels: {
        enabled: false,
      },
      labels: DashboardLabelData(OnloadCMWOList),

      grid: {
        padding: {
          bottom: -60,
        },
      },

      plotOptions: {
        pie: {
          startAngle: -90,
          endAngle: 90,
          offsetY: 10,
          donut: {
            labels: {
              show: true,
              total: {
                showAlways: true,
                show: true,
              },
            },
          },
        },
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200,
            },
            legend: {
              position: "bottom",
            },
          },
        },
      ],
    },
  });
  const [preventiveList, setPreventive] = useState<any | null>({
    series: DashboardSeriesData(OnloadPMWOList),
    options: {
      chart: {
        type: "donut",
      },

      colors: ["#e23b03", "#fff694", "#c3f060"],
      dataLabels: {
        enabled: false,
      },
      labels: DashboardLabelData(OnloadPMWOList),

      grid: {
        padding: {
          bottom: -60,
        },
      },

      plotOptions: {
        pie: {
          startAngle: -90,
          endAngle: 90,
          offsetY: 10,
          donut: {
            labels: {
              show: true,
              total: {
                showAlways: true,
                show: true,
              },
            },
          },
        },
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200,
            },
            legend: {
              position: "bottom",
            },
          },
        },
      ],
    },
  });
  const [predictiveList, setPredictive] = useState<any | null>({
    series: DashboardSeriesData(OnloadPDWOList),
    options: {
      chart: {
        type: "donut",
      },
      // title: {
      //   text: "Predictive Maintenance",
      // },
      // colors: ["#FF655B", "#FFCE73", "#7BD18A"],
      colors: ["#e23b03", "#fff694", "#c3f060"],
      dataLabels: {
        enabled: false,
      },
      labels: DashboardLabelData(OnloadPDWOList),

      grid: {
        padding: {
          bottom: -60,
        },
      },
      // legend: {
      //   position: "bottom",
      // },
      plotOptions: {
        pie: {
          startAngle: -90,
          endAngle: 90,
          offsetY: 10,
          donut: {
            labels: {
              show: true,
              total: {
                showAlways: true,
                show: true,
              },
            },
          },
        },
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200,
            },
            legend: {
              position: "bottom",
            },
          },
        },
      ],
    },
  });

  // const [responseTimeList, setResponseTime] = useState<any | null>({
  //   series: [
  //     {
  //       name: IsCheckValueRes,
  //       data: AvgDashboardDataRes(OnloadAvgResList[0]),
  //     },
  //   ],
  //   options: {
  //     chart: {
  //       type: "bar",
  //       height: 350,
  //       toolbar: {
  //         show: false,
  //         // tools: {
  //         //   download: true,
  //         //   selection: false,
  //         //   zoom: false,
  //         //   zoomin: false,
  //         //   zoomout: false,
  //         //   pan: false,
  //         //   reset: false,
  //         // },
  //         export: {
  //           csv: {
  //             filename: "Custom_File_Name", // CSV download filename
  //           },
  //           svg: {
  //             filename: "Custom_File_Name", // SVG download filename
  //           },
  //           png: {
  //             filename: "Custom_File_Name", // PNG download filename
  //           },
  //         },
  //       },
  //     },
  //     plotOptions: {
  //       bar: {
  //         borderRadius: 4,
  //         distributed: true,
  //         borderRadiusApplication: "end",
  //         horizontal: true,
  //       },
  //     },

  //     colors: ["#7BD18A", "#9DE0A9", "#C0E5C6"],
  //     title: {
  //       text: "Response Time",
  //       align: "center",
  //       margin: 10,
  //       offsetX: 0,
  //       offsetY: 0,
  //       floating: true,
  //       style: {
  //         fontSize: "14px",
  //         fontWeight: "bold",
  //         fontFamily: undefined,
  //         color: "#263238",
  //       },
  //     },
  //     dataLabels: {
  //       enabled: false,
  //     },
  //     xaxis: {
  //       categories: ["High", "Medium", "Low"],
  //       title: {
  //         text: IsCheckValueRes,
  //       },
  //     },
  //   },
  // });

  const [responseTimeList, setResponseTime] = useState<any | null>({
    series: [
      {
        name: IsCheckValueRes,
        data: AvgDashboardDataRes(OnloadAvgResList[0]),
      },
    ],
    options: {
      chart: {
        type: "bar",
        height: 350,
        toolbar: {
          show: false,
        },
        zoom: {
          enabled: false,
        },
      },
      plotOptions: {
        bar: {
          borderRadius: 4,
          distributed: true,
          borderRadiusApplication: "end",
          horizontal: true,
        },
      },
      colors: ["#7BD18A", "#9DE0A9", "#C0E5C6"],
      title: {
        text: "Response Time",
        align: "center",
        margin: 10,
        offsetX: 0,
        offsetY: 0,
        floating: true,
        style: {
          fontSize: "14px",
          fontWeight: "bold",
          fontFamily: undefined,
          color: "#263238",
        },
      },
      dataLabels: {
        enabled: false,
      },
      xaxis: {
        categories: ["High", "Medium", "Low"],
        title: {
          text: IsCheckValueRes,
        },
      },
    },
  });

  const [rectificationTimeList, setRectificationTime] = useState<any | null>({
    series: [
      {
        name: IsCheckValueRect,
        data: AvgDashboardDataRect(OnloadAvgRetList[0]),
      },
    ],
    options: {
      chart: {
        type: "bar",
        height: 350,
      },
      plotOptions: {
        bar: {
          borderRadius: 4,
          distributed: true,
          borderRadiusApplication: "end",
          horizontal: true,
        },
      },
      colors: ["#7BD18A", "#9DE0A9", "#C0E5C6"],
      title: {
        text: "Rectification Time",
        align: "center",
        margin: 10,
        offsetX: 0,
        offsetY: 0,
        floating: true,
        style: {
          fontSize: "14px",
          fontWeight: "bold",
          fontFamily: undefined,
          color: "#263238",
        },
      },
      dataLabels: {
        enabled: false,
      },
      xaxis: {
        categories: ["High", "Medium", "Low"],
        title: {
          text: IsCheckValueRect,
        },
      },
    },
  });

  const getLocation = async () => {
    let Currentfacility = JSON?.parse(
      localStorage.getItem(LOCALSTORAGE?.FACILITY)!
    );
    let filterFacility: any = Currentfacility?.filter(
      (f: any) => f?.FACILITY_ID === selectedFacility?.FACILITY_ID
    );
    const payload: any = {
      LOCATION_ID: filterFacility[0]?.LOCATION_ID,
      ISLOCATIONFILTERFLAG: 1,
    };

    const res = await callPostAPI(ENDPOINTS?.GETHIRARCHY_LIST, payload);
    if (res?.FLAG === 1) {
      // setNodes(res?.LOCATIONHIERARCHYLIST);

      setNodes(res?.LOCATIONHIERARCHYLIST);
    }
  };

  // common download excel code added by anand
  const handleDownloadExcel = (data: [], fileName: string) => {
    const worksheet = xlsx.utils.json_to_sheet(data);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    const excelBuffer = xlsx.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `${fileName}.xlsx`);
  };

  //common seacrh function > added by Anand
  const handleSearch = (
    searchValue: string,
    filterlist: any[],
    originalList: any[],
    setFilteredList: any,
    searchtype: string
  ) => {
    setSearchText(searchValue);

    if (searchValue?.trim()?.length > 0) {
      if (searchtype === "Eqgroup") {
        const filtered = filterlist?.filter((item) =>
          item?.ASSETGROUP_NAME?.toLowerCase().includes(
            searchValue.toLowerCase()
          )
        );
        setFilteredList(filtered);
      } else if (searchtype === "Eqtype") {
        const filtered = filterlist?.filter((item) =>
          item?.ASSETTYPE_NAME?.toLowerCase().includes(
            searchValue.toLowerCase()
          )
        );
        setFilteredList(filtered);
      } else if (searchtype === "issue") {
        const filtered = filterlist?.filter((item) =>
          item?.ISSUE_DESCRIPTION?.toLowerCase().includes(
            searchValue.toLowerCase()
          )
        );
        setFilteredList(filtered);
      } else if (searchtype === "assignee") {
        const filtered = filterlist?.filter((item) =>
          item?.ASSIGNEE_NAME?.toLowerCase().includes(searchValue.toLowerCase())
        );
        setFilteredList(filtered);
      } else if (searchtype === "reporter") {
        const filtered = filterlist?.filter((item) =>
          item?.REPORTER_NAME?.toLowerCase().includes(searchValue.toLowerCase())
        );
        setFilteredList(filtered);
      }
    } else {
      setFilteredList(originalList);
    }
  };

  //common seacrh function > added by Anand
  const onSearchFilter = (
    e: React.ChangeEvent<HTMLInputElement>,
    tab: string
  ) => {
    const searchValue = e.target.value;

    if (tab === "Eqgroup") {
      handleSearch(
        searchValue,
        equipmentGroupList,
        ogequipmentGroupList,
        setequipmentGroup,
        "Eqgroup"
      );
    } else if (tab === "Eqtype") {
      handleSearch(
        searchValue,
        equipmentTypeList,
        ogequipmentTypeList,
        setequipmentTypeList,
        "Eqtype"
      );
    } else if (tab === "issue") {
      handleSearch(searchValue, issueList, ogissueList, setissueList, "issue");
    } else if (tab === "assignee") {
      handleSearch(searchValue, assignee, ogassignee, setAssignee, "assignee");
    } else if (tab === "reporter") {
      handleSearch(
        searchValue,
        reporterList,
        ogreporterList,
        setreporterList,
        "reporter"
      );
    }
  };

  useEffect(() => {
    let language: any = localStorage.getItem("language");
    i18n.changeLanguage(language);
    try {
      setLaoding(true);
      (async function () {
        setLocationName(null);
        setLocationResetStatus(true);
        await getDashboardMasterDetails();
        await getLocation();
      })();
      UpdateDashboardDetails();
    } catch (error: any) {
      toast.error(error);
    } finally {
      setLaoding(false);
    }
  }, [selectedFacility, currentMenu]);

  async function getDashboardMasterDetails() {
    try {
      const res = await callPostAPI(ENDPOINTS.GET_DASHBOARD_MASTER, {}, null);
      setDateFilterList(res?.DATEFILTERLIST);
      OnloadFilterList = res?.DATEFILTERLIST;
      if (OnloadFilterList.length > 0) {
        await filterDateHandeler(OnloadFilterList[5]);
      }
    } catch (error: any) {
      toast.error(error);
    }
  }

  const filterDateHandeler = async (items: any) => {
    IsResRectCheck = "All";
    op?.current?.hide();
    if (items.SEQ_NO == 7) {
      setSelectedCustome(true);
      // setfilterBtnClick(false);
    } else {
      setWODate([]);
      setSelectedCustome(false);
      fromDate = items.FROM_DATE;
      ToDate = items.TO_DATE;
      setDateDesc(items.DATE_DESC);
      setFilterDesc(items.SUB_DATE_DESC);
      let locationStatus: any = false;
      await getDashboardDetails(locationStatus);
    }
    //setfilterBtnClick(false);
  };

  const onSubmitCustomDate = () => {
    if (dateWO.length == 0) {
      toast?.error("Please Select From and To Date");
      return;
    }
    if (dateWO.length < 2) {
      toast?.error("Please Select From and To Date");
      return;
    }
    if (dateWO.length == 2) {
      if (dateWO[0] == undefined || dateWO[0] == null) {
        toast?.error("Please Select From Date");
        return;
      }
      if (dateWO[1] == undefined || dateWO[1] == null) {
        toast?.error("Please Select To Date");
        return;
      }
    }

    fromDate = moment(dateWO[0]).format("YYYY-MM-DD");
    ToDate = moment(dateWO[1]).format("YYYY-MM-DD");
    setDateDesc("Custom");
    setFilterDesc(
      moment(dateWO[0]).format("DD MMM, YYYY") +
        " - " +
        moment(dateWO[1]).format("DD MMM, YYYY")
    );
    setSelectedCustome(false);
    let locationStatus: any = false;
    (async function () {
      await getDashboardDetails(locationStatus);
    })();
  };
  const getDashboardDetails = async (
    locationStatus: any,
    uniqueLocation?: any
  ) => {
    try {
      let statusCode: any = localStorage.getItem("statusColorCode");
      const dataColor: any = JSON.parse(statusCode);
      const data = dataColor?.map((item: any) => {
        return {
          STATUS_DESC: item.STATUS_DESC,
          COLORS: item.COLORS,
        };
      });

      const statusMap: any = {
        Open: "Open",
        "In Progress": "In Progress",
        "On Hold": "On-Hold",
        Rectified: "Rectified",
        "Pending Action": "Pending Action",
        "Re Open": "Re-open",
      };
      const labels = Object.keys(OnloadActiveCaseList[0]);
      const colorsActive: any = labels.map((label) => {
        const statusDesc = statusMap[label];
        const match = data.find((item: any) => item.STATUS_DESC === statusDesc);
        return match ? match.COLORS : "#ccc"; // fallback color
      });
      let preConditionalColor: any =
        FACILITYID?.ISPRECONDITION === true
          ? "Cancelled - Pre Conditional"
          : "";
      const statusResolvedMap: any = {
        Cancelled: "Cancelled",
        Completed: "Completed",
        Accepted: "Accepted",
        ...(isPrecondition && {
          "Cancelled - Pre Conditional": "Cancelled - Pre Conditional",
        }),
        preConditionalColor: preConditionalColor,
      };
      const labelsResolved = Object.keys(OnloadResolveCaseList[0]);
      const colorsResolved: any = labelsResolved.map((label) => {
        const statusDesc = statusResolvedMap[label];
        const match = data.find((item: any) => item.STATUS_DESC === statusDesc);
        return match ? match.COLORS : "#ccc"; // fallback color
      });

      let payload = {
        FROM_DATE: fromDate,
        TO_DATE: ToDate,
        LOCATION_LIST:
          locationStatus === true
            ? uniqueLocation
            : location?.length > 0
            ? location
            : [],
      };

      const res = await callPostAPI(
        ENDPOINTS.GET_DASHBOARD_DETAILS,
        payload,
        null
      );
      if (res && res?.FLAG === 1) {
        setequipmentGroup(res?.ASSETGROUPLIST);
        setogequipmentGroup(res?.ASSETGROUPLIST);

        if (res?.ASSETGROUPLIST?.length > 0) {
          const totalCountAssetGroup = res?.ASSETGROUPLIST?.reduce(
            (acc: number, item: any) => {
              return acc + item.COUNT;
            },
            0
          );
          if (totalCountAssetGroup) {
            settotalEquipmentGroupCount(totalCountAssetGroup);
          }
        } else {
          settotalEquipmentGroupCount(0);
        }

        if (res?.ASSETTYPELIST?.length > 0) {
          const totalCountAssetType = res?.ASSETTYPELIST?.reduce(
            (acc: number, item: any) => {
              return acc + item?.COUNT;
            },
            0
          );
          if (totalCountAssetType) {
            settotalEquipmentTypeCount(totalCountAssetType);
          }
        } else {
          settotalEquipmentTypeCount(0);
        }

        if (res?.ISSUELIST?.length > 0) {
          const totalCountIssue = res?.ISSUELIST?.reduce(
            (acc: number, item: any) => {
              return acc + item?.COUNT;
            },
            0
          );
          if (totalCountIssue) {
            settotalIssueCount(totalCountIssue);
          }
        } else {
          settotalIssueCount(0);
        }

        if (res?.ASSINEELIST?.length > 0) {
          const totalCountAssignee = res?.ASSINEELIST?.reduce(
            (acc: number, item: any) => {
              return acc + item?.COUNT;
            },
            0
          );
          if (totalCountAssignee) {
            settotalAsssigneeCount(totalCountAssignee);
          }
        } else {
          settotalAsssigneeCount(0);
        }

        if (res?.ASSINEELIST?.length > 0) {
          const totalCountReporter = res?.REPORTERLIST?.reduce(
            (acc: number, item: any) => {
              return acc + item?.COUNT;
            },
            0
          );
          if (totalCountReporter) {
            settotalReporterCount(totalCountReporter);
          }
        } else {
          settotalReporterCount(0);
        }
        setissueList(res?.ISSUELIST);
        setogissueList(res?.ISSUELIST);

        setAssignee(res?.ASSINEELIST);
        setogAssignee(res?.ASSINEELIST);
        setreporterList(res?.REPORTERLIST);
        setogreporterList(res?.REPORTERLIST);
        setequipmentTypeList(res?.ASSETTYPELIST);
        setogequipmentTypeList(res?.ASSETTYPELIST);
        OnloadActiveCaseList = res?.ACTIVECASELIST;
        OnloadResolveCaseList = res?.RESOLVECASELIST.map((item: any) => {
          const { Cancelled, Completed, Accepted } = item;
          return {
            Cancelled,
            Completed,
            Accepted,
            ...(isPrecondition && {
              "Cancelled - Pre Conditional":
                item["Cancelled - Pre Conditional"],
            }),
          };
        });
        OnloadCMWOList = res?.CMWOLIST;
        OnloadPMWOList = res?.PMWOLIST;
        OnloadPDWOList = res?.PDWOLIST;
        OnloadAvgResList = res?.AVGRESLIST;
        OnloadAvgRetList = res?.AVGRECLIST;
        totresvalue = res?.WOCOUNTLIST[0]?.AVG_RES_TOT_TIME;
        totretvalue = res?.WOCOUNTLIST[0]?.AVG_RET_TOT_TIME;

        const totalActiveCaseList: any = Object.values(
          res?.ACTIVECASELIST[0]
        ).reduce((sum: any, value: any) => sum + value, 0);
        const totalResolveCaseList: any = Object.values(
          res?.RESOLVECASELIST[0]
        ).reduce((sum: any, value: any) => sum + value, 0);
        // setTotalResTime(res?.WOCOUNTLIST[0]?.AVG_RES_TOT_TIME);

        setTotalCaseCount(totalActiveCaseList + totalResolveCaseList);
        setWoCount(res?.WOCOUNTLIST[0]?.WO_COUNT);
        setWoRetCount(res?.WOCOUNTLIST[0]?.WO_RET_COUNT);
        // setActiveCaseList(DashboardSeriesData(res?.ACTIVECASELIST));
        setResolvedCaseList(DashboardSeriesData(res?.RESOLVECASELIST));
        setCMWoList(DashboardSeriesData(res?.CMWOLIST));

        UpdateDashboardDetails();

        setObjet({
          series: DashboardSeriesData(OnloadActiveCaseList),
          options: {
            chart: {
              type: "donut",
            },
            // colors: ["#FF9089", "#7E7E7E", "#FFCE73", "#88C8FF"],
            colors: colorsActive,
            dataLabels: {
              enabled: false,
            },
            labels: DashboardLabelData(OnloadActiveCaseList),
            plotOptions: {
              pie: {
                donut: {
                  labels: {
                    show: true,
                    total: {
                      showAlways: true,
                      label: "Active Cases",
                      show: true,
                      style: {
                        fontSize: "12px",
                        color: "grey",
                      },
                    },
                  },
                },
              },
            },
            responsive: [
              {
                breakpoint: 480,
                options: {
                  chart: {
                    width: 300,
                  },
                  legend: {
                    position: "bottom",
                  },
                },
              },
            ],
          },
        });
        setResolved({
          series: [
            res?.RESOLVECASELIST[0]?.Cancelled,
            res?.RESOLVECASELIST[0]?.Completed,
            res?.RESOLVECASELIST[0]?.Accepted,
            ...(isPrecondition
              ? [res?.RESOLVECASELIST[0]?.["Cancelled - Pre Conditional"]]
              : []),
          ],
          options: {
            chart: {
              type: "donut",
            },

            colors: colorsResolved,
            dataLabels: {
              enabled: false,
            },
            labels: DashboardLabelData(OnloadResolveCaseList),
            plotOptions: {
              pie: {
                donut: {
                  // size: "65%",
                  labels: {
                    show: true,
                    total: {
                      showAlways: true,
                      label: "Resolved Cases",
                      show: true,
                    },
                  },
                },
              },
            },
            responsive: [
              {
                breakpoint: 480,
                options: {
                  chart: {
                    width: 300,
                  },
                  legend: {
                    position: "bottom",
                  },
                },
              },
            ],
          },
        });
        setCorrective({
          series: DashboardSeriesData(res?.CMWOLIST),
          options: {
            chart: {
              type: "donut",
            },

            // colors: ["#FF655B", "#FFCE73", "#7BD18A"],
            colors: ["#e23b03", "#fff694", "#c3f060"],
            dataLabels: {
              enabled: false,
            },
            labels: DashboardLabelData(OnloadCMWOList),

            grid: {
              padding: {
                bottom: -60,
              },
            },

            plotOptions: {
              pie: {
                startAngle: -90,
                endAngle: 90,
                offsetY: 10,
                donut: {
                  labels: {
                    show: true,
                    total: {
                      showAlways: true,
                      show: true,
                    },
                  },
                },
              },
            },
            responsive: [
              {
                breakpoint: 480,
                options: {
                  chart: {
                    width: 200,
                  },
                  legend: {
                    position: "bottom",
                  },
                },
              },
            ],
          },
        });

        setPreventive({
          series: DashboardSeriesData(res?.PMWOLIST),
          options: {
            chart: {
              type: "donut",
            },
            // title: {
            //   text: "Preventive Maintenance",
            // },
            // colors: ["#FF655B", "#FFCE73", "#7BD18A"],
            colors: ["#e23b03", "#fff694", "#c3f060"],
            dataLabels: {
              enabled: false,
            },
            labels: DashboardLabelData(OnloadPMWOList),

            grid: {
              padding: {
                bottom: -60,
              },
            },
            // legend: {
            //   position: "bottom",
            // },
            plotOptions: {
              pie: {
                startAngle: -90,
                endAngle: 90,
                offsetY: 10,
                donut: {
                  labels: {
                    show: true,
                    total: {
                      showAlways: true,
                      show: true,
                    },
                  },
                },
              },
            },
            responsive: [
              {
                breakpoint: 480,
                options: {
                  chart: {
                    width: 200,
                  },
                  legend: {
                    position: "bottom",
                  },
                },
              },
            ],
          },
        });
        setPredictive({
          series: DashboardSeriesData(res?.PDWOLIST),
          options: {
            chart: {
              type: "donut",
            },
            // title: {
            //   text: "Predictive Maintenance",
            // },
            // colors: ["#FF655B", "#FFCE73", "#7BD18A"],
            colors: ["#e23b03", "#fff694", "#c3f060"],
            dataLabels: {
              enabled: false,
            },
            labels: DashboardLabelData(res?.PDWOLIST),

            grid: {
              padding: {
                bottom: -60,
              },
            },
            // legend: {
            //   position: "bottom",
            // },
            plotOptions: {
              pie: {
                startAngle: -90,
                endAngle: 90,
                offsetY: 10,
                donut: {
                  labels: {
                    show: true,
                    total: {
                      showAlways: true,
                      show: true,
                    },
                  },
                },
              },
            },
            responsive: [
              {
                breakpoint: 480,
                options: {
                  chart: {
                    width: 200,
                  },
                  legend: {
                    position: "bottom",
                  },
                },
              },
            ],
          },
        });
        setDashboardConfigureList(res?.DASHBOARDCONFIGLIST);
      }
    } catch (error: any) {
      setLaoding(false);
    } finally {
      setLaoding(false);
    }
  };

  const UpdateDashboardDetails = () => {
    setObjet({
      series: DashboardSeriesData(OnloadActiveCaseList),
    });
    setResolved({
      series: DashboardSeriesData(OnloadResolveCaseList),
    });
    setCorrective({
      series: DashboardSeriesData(OnloadCMWOList),
    });
    setPreventive({
      series: DashboardSeriesData(OnloadPMWOList),
    });
    setPredictive({
      series: DashboardSeriesData(OnloadPDWOList),
    });

    if (IsResRectCheck === "Res" || IsResRectCheck === "All") {
      setResponseTime({
        series: [
          {
            name: IsCheckValueRes,
            data: AvgDashboardDataRes(OnloadAvgResList[0]),
          },
        ],
        options: {
          xaxis: {
            title: {
              text: IsCheckValueRes,
            },
          },
        },
      });
      let avgres = AvgTimeCalRes(totresvalue);
      setAvgTotResTime(avgres);
    }
    if (IsResRectCheck === "Rect" || IsResRectCheck === "All") {
      setRectificationTime({
        series: [
          {
            name: IsCheckValueRect,
            data: AvgDashboardDataRect(OnloadAvgRetList[0]),
          },
        ],
        options: {
          xaxis: {
            title: {
              text: IsCheckValueRect,
            },
          },
        },
      });
      let avgret = AvgTimeCalRect(totretvalue);
      setAvgTotRetTime(avgret);
    }
  };

  const itemTemplate = (item: any): ReactNode => {
    const AssetGroupheader = item.ASSETGROUP_NAME ? (
      <div className="equipment-scrollbar-text">{item?.ASSETGROUP_NAME}</div>
    ) : (
      ""
    );
    const AssetTypeHeader = item.ASSETTYPE_NAME ? (
      <>
        <div className="equipment-scrollbar-text1">{item.ASSETTYPE_NAME}</div>
        <div className="equipment-scrollbar-secondaryText">
          {item?.ASSETGROUP_NAME}{" "}
        </div>
      </>
    ) : (
      ""
    );
    const IssueHeader =
      item.ISSUE_DESCRIPTION && item?.ASSETGROUP_NAME ? (
        <>
          <div className="equipment-scrollbar-text1">
            {item.ISSUE_DESCRIPTION}
          </div>
          <div className="equipment-scrollbar-secondaryText">
            {item?.ASSETGROUP_NAME}
          </div>
        </>
      ) : (
        ""
      );
    return (
      <div className="flex justify-between">
        <div className="flex justify-start mb-[8px]">
          {/* <div className={item.type === 'grp' ? "equipment-color" : "equipment-color mt-2"} style={{ background: item.color }}></div> */}
          {AssetTypeHeader !== "" ? (
            <div className="">{AssetTypeHeader}</div>
          ) : IssueHeader !== "" ? (
            <div className="">{IssueHeader}</div>
          ) : AssetGroupheader !== "" ? (
            <div className="">{AssetGroupheader}</div>
          ) : (
            ""
          )}
        </div>
        <div className="">
          <span className="equipment-scrollbar-quantity">{item.COUNT}</span>
        </div>
      </div>
    );
  };

  const reporterCount = `${totalReporterCount}`;
  const AssigneeTemplate = (item: any): ReactNode => {
    const initials = item?.ASSIGNEE_NAME?.split(" ")
      .map((name: string) => name.charAt(0).toUpperCase())
      .slice(0, 2)
      .join("");
    return (
      <div className="flex justify-between">
        <div className="flex justify-start mb-[18px]">
          {/* <div className="flex items-center justify-center w-6 h-6 bg-rose-300 rounded-full"> */}
          <div className="initials">
            <span className="text-white text-xs font-semibold">{initials}</span>
          </div>
          <div>
            <div className="assignee-primaryText">{item.ASSIGNEE_NAME}</div>
            {/* <div className="assignee-secondaryText" >{item.subHeader}</div> */}
          </div>
        </div>
        <div className="">
          <span className="equipment-scrollbar-quantity">{item.COUNT}</span>
        </div>
      </div>
    );
  };

  const ReporterTemplate = (item: any): ReactNode => {
    const initials = item?.REPORTER_NAME?.split(" ")
      .map((name: string) => name.charAt(0).toUpperCase())
      .slice(0, 2)
      .join("");
    return (
      <div className="flex justify-between">
        <div className="flex justify-start mb-[18px]">
          {/* <div className="flex items-center justify-center w-6 h-6 bg-rose-300 rounded-full"> */}
          <div className="report-initials">
            <span className="text-white text-xs font-semibold">{initials}</span>
          </div>
          <div>
            <div className="assignee-primaryText">{item?.REPORTER_NAME}</div>
          </div>
        </div>
        <div className="">
          <span className="equipment-scrollbar-quantity">{item?.COUNT}</span>
        </div>
      </div>
    );
  };

  useEffect(() => {
    const data: any = dashboardConfigureList?.filter(
      (f: any) => f?.DASHBOARD_ID === f?.DASHBOARD_ID
    );
    setDashboardConfigureList(data);
  }, [correctiveList, preventiveList, predictiveList]);
  console.log(resolvedList, "resolvedList");

  return (
    <>
      <div>
        <div>
          <h6>{t("Dashboard")}</h6>
        </div>

        <div className="mt-2 dashboardTab">
          <div>
            <div className=" flex justify-content-center flex-wrap gap-2">
              <div>
                <InputText
                  placeholder="Search Location"
                  value={locationName !== null ? locationName : ""}
                  onClick={(e: any) => showEquipmentlist(true)}
                  readOnly
                  className="width-1/5"
                />
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
                  getDashboardDetails={getDashboardDetails}
                  setLocationName={setLocationName}
                  setLocationCheckData={setLocationCheckData}
                  locationCheckData={locationCheckData}
                />
              </div>
              <div className="date-select">
                <Button
                  type="button"
                  onClick={(e: any) => {
                    op?.current?.toggle(e);
                  }}
                  // label="Select"
                  className="dateSelect"
                >
                  <div className="flex w-full items-baseline justify-between">
                    <div className="w-full flex items-baseline gap-2 date-select-group">
                      <i className="pi pi-calendar Text-Secondary"></i>
                      <p className="Text_Primary ml-2 mr-2">{DateDesc}</p>
                      <i className="pi pi-sort-down-fill Text-Secondary"></i>
                    </div>
                  </div>
                </Button>
              </div>
              <div className="mt-2 ml-2">
                <label className="Text_Primary Input_Text mb-3">
                  {FilterDesc}
                </label>
              </div>

              {/* {filterBtnClick === true && (
                        <> */}

              {
                <OverlayPanel
                  className="dateFilterOverlayPanel"
                  ref={op}
                  dismissable
                >
                  <ul>
                    <li className="px-4 py-2 mb-2 border-b-2">
                      <div className="text-center dateText">Date range</div>
                    </li>
                    {DateFilterList?.map((list: any) => {
                      return (
                        <>
                          <li
                            className={` px-4 py-2 ${
                              list.DATE_SEQNO === "CR"
                                ? "border-t-2"
                                : list.DATE_SEQNO === "CU"
                                ? "CustomDate border-t-2"
                                : ""
                            }`}
                            onClick={() => filterDateHandeler(list)}
                          >
                            <div className="flex flex-wrap justify-between">
                              <label className="Text_Primary Input_Text">
                                {list.DATE_DESC}
                              </label>
                              <p className="Text_Secondary Helper_Text">
                                {list.SUB_DATE_DESC}
                              </p>
                            </div>
                          </li>
                        </>
                      );
                    })}
                  </ul>
                </OverlayPanel>
              }

              {/* </>
                      )} */}

              {selectedCustomeDate && (
                <Card className="w-3/5 absolute z-10">
                  <div className="text-center">
                    <h6 className=" Text_Primary mb-0">Custom date range</h6>
                  </div>
                  <div>
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
                  <div className="flex flex-wrap justify-end mt-2">
                    <Buttons
                      className="Secondary_Button me-2"
                      label={t("Cancel")}
                      onClick={() => setSelectedCustome(false)}
                    />
                    <Buttons
                      className="Primary_Button"
                      label={t("Select")}
                      onClick={() => onSubmitCustomDate()}
                    />
                  </div>
                </Card>
              )}
            </div>
          </div>
          {loading ? (
            <>
              <LoaderShow />
            </>
          ) : (
            <>
              <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-3 md:grid-cols-3 lg:grid-cols-3">
                {dashboardConfigureList?.find(
                  (d: any) => d.DASHBOARD_ID === 1 && d.ACTIVE
                ) && (
                  <>
                    <Card className="h-full">
                      <label className="Title_Label Text_Primary">
                        Total Cases
                      </label>

                      <h2 className="flex flex-col justify-center items-center text-center h-40 w-full">
                        {totalCaseCount}
                        <p className="text-sm text-gray-500">
                          Cases in building
                        </p>
                      </h2>
                    </Card>
                  </>
                )}
                {dashboardConfigureList?.find(
                  (d: any) => d.DASHBOARD_ID === 2 && d.ACTIVE
                ) && (
                  <div>
                    <Card className="h-full">
                      <div>
                        <label className="Title_Label Text_Primary">
                          Active Cases
                        </label>
                        <p className="Helper_Text Text_Secondary">{DateDesc}</p>
                      </div>
                      <ReactApexChart
                        options={optionsList?.options}
                        series={optionsList?.series}
                        type="donut"
                        width={380}
                      />
                    </Card>
                  </div>
                )}
                {dashboardConfigureList?.find(
                  (d: any) => d.DASHBOARD_ID === 3 && d.ACTIVE
                ) && (
                  <div>
                    <Card className="h-full">
                      <div>
                        <label className="Title_Label Text_Primary">
                          Resolved Cases
                        </label>
                        <p className="Helper_Text Text_Secondary">{DateDesc}</p>
                      </div>
                      <ReactApexChart
                        options={resolvedList?.options}
                        series={resolvedList?.series}
                        type="donut"
                        width={isPrecondition ? 450 : 360}
                      />
                    </Card>
                  </div>
                )}
              </div>
              <div className="mt-3 grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-3 lg:grid-cols-3">
                {dashboardConfigureList?.find(
                  (d: any) => d.DASHBOARD_ID === 4 && d.ACTIVE
                ) && (
                  <div>
                    <Card className="">
                      <div>
                        <label className="Title_Label Text_Primary">
                          Corrective Maintenance
                        </label>
                        <p className="Helper_Text Text_Secondary">{DateDesc}</p>
                      </div>
                      <ReactApexChart
                        options={correctiveList?.options}
                        series={correctiveList?.series}
                        type="donut"
                        width={340}
                      />
                    </Card>
                  </div>
                )}
                {dashboardConfigureList?.find(
                  (d: any) => d.DASHBOARD_ID === 5 && d.ACTIVE
                ) && (
                  <div>
                    <Card className="">
                      <div>
                        <label className="Title_Label Text_Primary">
                          Preventive Maintenance
                        </label>
                        <p className="Helper_Text Text_Secondary">{DateDesc}</p>
                      </div>
                      <ReactApexChart
                        options={preventiveList?.options}
                        series={preventiveList?.series}
                        type="donut"
                        width={340}
                      />
                    </Card>
                  </div>
                )}
                {dashboardConfigureList?.find(
                  (d: any) => d.DASHBOARD_ID === 6 && d.ACTIVE
                ) && (
                  <div>
                    <Card className="">
                      <div>
                        <label className="Title_Label Text_Primary">
                          Predictive Maintenance
                        </label>
                        <p className="Helper_Text Text_Secondary">{DateDesc}</p>
                      </div>
                      <ReactApexChart
                        options={predictiveList?.options}
                        series={predictiveList?.series}
                        type="donut"
                        width={340}
                      />
                    </Card>
                  </div>
                )}
              </div>
              <div className="mt-3 grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-2 lg:grid-cols-2">
                {dashboardConfigureList?.find(
                  (d: any) => d.DASHBOARD_ID === 7 && d.ACTIVE
                ) && (
                  <div>
                    <Card className="">
                      <div className="flex justify-between">
                        <div>
                          <label className="Title_Label Text_Primary">
                            Response Time
                          </label>
                          <p className="Helper_Text Text_Secondary">
                            {DateDesc}
                          </p>
                        </div>

                        <div>
                          <SelectButton
                            value={valueRes}
                            onChange={async (e: any) => {
                              await onToggleButtonChangeRes(e, "Res");
                            }}
                            options={options}
                          />
                        </div>
                      </div>
                      <div className="flex  mt-3">
                        <div className="w-1/2">
                          <p className="Helper_Text Text_Secondary">
                            Average Response Time
                          </p>
                          <h4 className="Text_Primary">{AvgTotResTime}</h4>
                        </div>
                        <div>
                          <p className="Helper_Text Text_Secondary">
                            Total Work Orders
                          </p>
                          <h4 className="Text_Primary">{WoCount}</h4>
                        </div>
                      </div>
                      <ReactApexChart
                        options={responseTimeList?.options}
                        series={responseTimeList?.series}
                        type="bar"
                        height={250}
                      />
                    </Card>
                  </div>
                )}
                {dashboardConfigureList?.find(
                  (d: any) => d.DASHBOARD_ID === 8 && d.ACTIVE
                ) && (
                  <div>
                    <Card className="">
                      <div className="flex justify-between">
                        <div>
                          <label className="Title_Label Text_Primary">
                            Rectification Time
                          </label>
                          <p className="Helper_Text Text_Secondary">
                            {DateDesc}
                          </p>
                        </div>

                        <div>
                          <SelectButton
                            value={valueRect}
                            onChange={async (e: any) => {
                              await onToggleButtonChangeRect(e, "Rect");
                            }}
                            options={options}
                          />
                        </div>
                      </div>
                      <div className="flex  mt-3">
                        <div className="w-1/2">
                          <p className="Helper_Text Text_Secondary">
                            Average Rectification Time
                          </p>
                          <h4 className="Text_Primary">{AvgTotRetTime}</h4>
                        </div>
                        <div>
                          <p className="Helper_Text Text_Secondary">
                            Total Work Orders
                          </p>
                          <h4 className="Text_Primary">{WoRetCount}</h4>
                        </div>
                      </div>
                      <ReactApexChart
                        options={rectificationTimeList?.options}
                        series={rectificationTimeList?.series}
                        type="bar"
                        height={250}
                      />
                    </Card>
                  </div>
                )}
              </div>
              <div className="mt-3 grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-3 lg:grid-cols-3 h-full">
                {dashboardConfigureList?.find(
                  (d: any) => d.DASHBOARD_ID === 9 && d.ACTIVE
                ) && (
                  <div className="without-upper-padding">
                    <Card className="h-full">
                      <div className="flex justify-between">
                        <div>
                          <label className="Title_Label Text_Primary">
                            Equipment Group
                          </label>
                        </div>
                        <div className="equipment-group pt-[7px] pb-[1px]">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="25"
                            height="24"
                            viewBox="0 0 25 24"
                            fill="none"
                            onClick={() => {
                              handleDownloadExcel(
                                equipmentGroupList,
                                "EquipmentGroup"
                              );
                            }}
                          >
                            <path
                              d="M14.1633 3H12.1633V9H9.16333L13.1633 14L17.1633 9H14.1633V3Z"
                              fill="#929CA6"
                            />
                            <path
                              d="M20.8333 18H4.83325V11H2.83325V18C2.83325 19.103 3.73025 20 4.83325 20H20.8333C21.9363 20 22.8333 19.103 22.8333 18V11H20.8333V18Z"
                              fill="#929CA6"
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="divider"></div>
                      <div className="equipment-searchbar-ro flex justify-between">
                        <div className="">
                          <InputText
                            type="search"
                            placeholder="Search"
                            className="equipment-button mt-[13.5px]"
                            onChange={(e) => onSearchFilter(e, "Eqgroup")}
                          />
                        </div>
                        <div className="flex flex-col items-end justify-end">
                          <h5 className="Text_Primary mt-[10px]">
                            {totalEquipmentGroupCount}
                          </h5>
                          <p className="hehe">Total WO</p>
                        </div>
                      </div>
                      <div className="mt-[24px]">
                        <DataScroller
                          value={equipmentGroupList}
                          itemTemplate={itemTemplate}
                          rows={8}
                          inline
                          scrollHeight="300px"
                        />
                      </div>
                    </Card>
                  </div>
                )}
                {dashboardConfigureList?.find(
                  (d: any) => d.DASHBOARD_ID === 10 && d.ACTIVE
                ) && (
                  <div className="without-upper-padding">
                    <Card className="h-full">
                      <div className="flex justify-between">
                        <div>
                          <label className="Title_Label Text_Primary">
                            Equipment Type
                          </label>
                        </div>
                        <div className="equipment-group pt-[7px] pb-[1px]">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="25"
                            height="24"
                            viewBox="0 0 25 24"
                            fill="none"
                            onClick={() => {
                              handleDownloadExcel(
                                equipmentTypeList,
                                "EquipmentType"
                              );
                            }}
                          >
                            <path
                              d="M14.1633 3H12.1633V9H9.16333L13.1633 14L17.1633 9H14.1633V3Z"
                              fill="#929CA6"
                            />
                            <path
                              d="M20.8333 18H4.83325V11H2.83325V18C2.83325 19.103 3.73025 20 4.83325 20H20.8333C21.9363 20 22.8333 19.103 22.8333 18V11H20.8333V18Z"
                              fill="#929CA6"
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="divider"></div>
                      <div className="equipment-searchbar-ro flex justify-between">
                        <div className="">
                          <InputText
                            type="search"
                            placeholder="Search"
                            className="equipment-button mt-[13.5px]"
                            onChange={(e) => onSearchFilter(e, "Eqtype")}
                          />
                        </div>
                        <div className="flex flex-col items-end justify-end">
                          <h5 className="Text_Primary mt-[10px]">
                            {totalEquipmentTypeCount}
                          </h5>
                          <p className="hehe">Total WO</p>
                        </div>
                      </div>
                      <div className="mt-[24px]">
                        <DataScroller
                          value={equipmentTypeList}
                          itemTemplate={itemTemplate}
                          rows={8}
                          inline
                          scrollHeight="300px"
                        />
                      </div>
                    </Card>
                  </div>
                )}
                {dashboardConfigureList?.find(
                  (d: any) => d.DASHBOARD_ID === 11 && d.ACTIVE
                ) && (
                  <div className="without-upper-padding">
                    <Card className="h-full">
                      <div className="flex justify-between">
                        <div>
                          <label className="Title_Label Text_Primary">
                            Issue
                          </label>
                        </div>
                        <div className="equipment-group pt-[7px] pb-[1px]">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="25"
                            height="24"
                            viewBox="0 0 25 24"
                            fill="none"
                            onClick={() => {
                              handleDownloadExcel(issueList, "Issue");
                            }}
                          >
                            <path
                              d="M14.1633 3H12.1633V9H9.16333L13.1633 14L17.1633 9H14.1633V3Z"
                              fill="#929CA6"
                            />
                            <path
                              d="M20.8333 18H4.83325V11H2.83325V18C2.83325 19.103 3.73025 20 4.83325 20H20.8333C21.9363 20 22.8333 19.103 22.8333 18V11H20.8333V18Z"
                              fill="#929CA6"
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="divider"></div>

                      <div className="equipment-searchbar-ro flex justify-between">
                        <div className="">
                          <InputText
                            type="search"
                            placeholder="Search"
                            className="equipment-button mt-[13.5px]"
                            onChange={(e) => onSearchFilter(e, "issue")}
                          />
                        </div>
                        <div className="flex flex-col items-end justify-end">
                          <h5 className="Text_Primary mt-[10px]">
                            {totalIssueCount}
                          </h5>
                          <p className="hehe">Total WO</p>
                        </div>
                      </div>
                      <div className="mt-[24px] ">
                        <DataScroller
                          value={issueList}
                          itemTemplate={itemTemplate}
                          rows={8}
                          inline
                          scrollHeight="300px"
                        />
                      </div>
                    </Card>
                  </div>
                )}
              </div>
              {/* </TabPanel>
          </TabView> */}
              <div className="mt-3 grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-2 lg:grid-cols-2">
                {dashboardConfigureList?.find(
                  (d: any) => d.DASHBOARD_ID === 12 && d.ACTIVE
                ) && (
                  <div className="without-upper-padding mb-1">
                    <Card className="h-full">
                      <div className="flex justify-between">
                        <div>
                          <label className="Title_Label Text_Primary">
                            Assignee
                            {/* <span className="assigneeNumber ml-[15px]">{assigneeCount}</span> */}
                          </label>
                        </div>
                        <div className="equipment-group pt-[7px] pb-[1px]">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="25"
                            height="24"
                            viewBox="0 0 25 24"
                            fill="none"
                            onClick={() => {
                              handleDownloadExcel(assignee, "Assignee");
                            }}
                          >
                            <path
                              d="M14.1633 3H12.1633V9H9.16333L13.1633 14L17.1633 9H14.1633V3Z"
                              fill="#929CA6"
                            />
                            <path
                              d="M20.8333 18H4.83325V11H2.83325V18C2.83325 19.103 3.73025 20 4.83325 20H20.8333C21.9363 20 22.8333 19.103 22.8333 18V11H20.8333V18Z"
                              fill="#929CA6"
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="divider"></div>
                      <div className="equipment-searchbar-ro flex justify-between">
                        <div className="">
                          <InputText
                            type="search"
                            placeholder="Search"
                            className="equipment-button mt-[13.5px] "
                            onChange={(e) => onSearchFilter(e, "assignee")}
                          />
                        </div>
                        {/* <div className="flex flex-col items-end justify-end ">
                    <h5 className="Text_Primary mt-[10px]">{assigneeCount}</h5>
                    <p className="hehe">Assigned WO</p>
                  </div> */}
                      </div>
                      <div className="">
                        <p className="hehe flex items-end justify-end ">
                          Assigned WO
                        </p>

                        <DataScroller
                          value={assignee}
                          itemTemplate={AssigneeTemplate}
                          rows={8}
                          inline
                          scrollHeight="300px"
                        />
                      </div>
                    </Card>
                  </div>
                )}
                {dashboardConfigureList?.find(
                  (d: any) => d.DASHBOARD_ID === 13 && d.ACTIVE
                ) && (
                  <div className="without-upper-padding">
                    <Card className="h-full">
                      <div className="flex justify-between">
                        <div>
                          <label className="Title_Label Text_Primary">
                            Reporter
                            {/* <span className="assigneeNumber ml-[15px]">{reporterCount}</span> */}
                          </label>
                        </div>
                        <div className="equipment-group pt-[7px] pb-[1px]">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="25"
                            height="24"
                            viewBox="0 0 25 24"
                            fill="none"
                            onClick={() => {
                              handleDownloadExcel(reporterList, "Reporter");
                            }}
                          >
                            <path
                              d="M14.1633 3H12.1633V9H9.16333L13.1633 14L17.1633 9H14.1633V3Z"
                              fill="#929CA6"
                            />
                            <path
                              d="M20.8333 18H4.83325V11H2.83325V18C2.83325 19.103 3.73025 20 4.83325 20H20.8333C21.9363 20 22.8333 19.103 22.8333 18V11H20.8333V18Z"
                              fill="#929CA6"
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="divider"></div>
                      <div className="equipment-searchbar-ro flex justify-between">
                        <div className="">
                          <InputText
                            type="search"
                            placeholder="Search"
                            className="equipment-button mt-[13.5px]"
                            onChange={(e) => onSearchFilter(e, "reporter")}
                          />
                        </div>
                        <div className="flex flex-col items-end justify-end ">
                          <h5 className="Text_Primary mt-[10px]">
                            {reporterCount}
                          </h5>
                          <p className="hehe">Total WO</p>
                        </div>
                      </div>
                      <div className="mt-[24px] ">
                        <DataScroller
                          value={reporterList}
                          itemTemplate={ReporterTemplate}
                          rows={8}
                          inline
                          scrollHeight="300px"
                        />
                      </div>
                    </Card>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Dashboard;
