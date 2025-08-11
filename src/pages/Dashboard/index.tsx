import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { LOCALSTORAGE } from "../../utils/constants";
import { TabView, TabPanel } from "primereact/tabview";
import "./Dashboard.css";
import { OverlayPanel } from "primereact/overlaypanel";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import ReactApexChart from "react-apexcharts";
import { SelectButton, SelectButtonChangeEvent } from "primereact/selectbutton";
import { ENDPOINTS } from "../../utils/APIEndpoints"
import { callPostAPI } from "../../services/apis";

import Buttons from "../../components/Button/Button";
import { Calendar } from "primereact/calendar";
import { toast } from "react-toastify";
import moment from "moment";
import { title } from "process";
import { decryptData } from "../../utils/encryption_decryption";
let fromDate: any;
let ToDate: any;
let totresvalue: any = 0;
let totretvalue: any = 0;
let IsCheckValue: any = "Day";

const Dashboard = () => {

  let OnloadFilterList: any = [];
  let OnloadResolveCaseList: any = [{ Cancelled: 0, Completed: 0 }];
  let OnloadActiveCaseList: any = [{ Open: 0, "In Progress": 0, "On Hold": 0, Rectified: 0 }];
  let OnloadCMWOList: any = [{ High: 0, Medium: 0, Low: 0 }]
  let OnloadPMWOList: any = [{ High: 0, Medium: 0, Low: 0 }]
  let OnloadPDWOList: any = [{ High: 0, Medium: 0, Low: 0 }]
  let OnloadAvgResList: any = [{ High: 0, Medium: 0, Low: 0 }]
  let OnloadAvgRetList: any = [{ High: 0, Medium: 0, Low: 0 }]

  const { i18n } = useTranslation();
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);
  const op: any = useRef<OverlayPanel>(null);
  const options: string[] = ["Day", "Hour"];
  const [value, setValue] = useState<string>(options[0]);
  const [DateDesc, setDateDesc] = useState<string>("");
  const [FilterDesc, setFilterDesc] = useState<string>("");
  const [FilterMainDesc, setFilterMainDesc] = useState<string>("");
  const [WoCount, setWoCount] = useState<string>("");
  const [TotalResTime, setTotalResTime] = useState<any>(0);

  const [AvgTotResTime, setAvgTotResTime] = useState<any>("0d 0h 0m");
  const [AvgTotRetTime, setAvgTotRetTime] = useState<any>(0);

  const [ResTime, setResTime] = useState<any>({ High: 0, Medium: 0, Low: 0 });

  const [filterBtnClick, setfilterBtnClick] = useState<boolean>(false);
  const [DateFilterList, setDateFilterList] = useState<any | null>([]);
  const [ActiveCaseList, setActiveCaseList] = useState<any | null | undefined>([
    0, 0, 0, 0,
  ]);
  const [ResolvedCaseList, setResolvedCaseList] = useState<
    any | null | undefined
  >([0, 0]);
  const [CMWoList, setCMWoList] = useState<any | null | undefined>([0, 0, 0]);

  const [selectedCustomeDate, setSelectedCustome] = useState<boolean>(false);
  const [dateWO, setWODate] = useState<any | null>([]);

  const AvgDashboardData = (dataList: any) => {
    let data: any = [];
    let v_data: any = [];
    data = Object.values(dataList);
    if (IsCheckValue == "Hour") {
      for (let i = 0; i < data.length; i++) {
        var days = "";
        var duration = moment.duration(data[i], "minutes");
        days = duration.hours() + "h";
        v_data.push(days);
      }
    }
    if (IsCheckValue == "Day") {
      for (let i = 0; i < data.length; i++) {
        var days = "";
        var duration = moment.duration(data[i], "minutes");
        days = duration.days() + "d";
        v_data.push(days);
      }
    }
    return v_data;
  };

  const AvgTimeCal = (totalaval: any) => {
    var mins = totalaval % 60;
    var hours_n = Math.floor(totalaval / 60);
    var days = Math.floor(hours_n / 24);
    var hourss = hours_n % 24;
    var val = "0d 0h 0m";
    if (IsCheckValue == "Day") {
      val = days + "d " + hourss + "h " + mins + "m";
    }
    if (IsCheckValue == "Hour") {
      val = hourss + "h " + mins + "m";
    }
    return val;
  };

  const onToggleButtonChange = (e: any) => {
    // getAvgTime(TotalResTime);
    // AvgDashboardData();
    setValue(e.value);
    if (e.value != undefined || e.value != null) {
      IsCheckValue = e.value;
      getDashboardDetails();
    }

    // setResponseTime({
    //   series: [
    //     {
    //       data: AvgDashboardData(),
    //     },
    //   ]
    // })
  };

  const DashboardSeriesData = (detailsList: any = []) => {
    let data: any = [];
    data = Object.values(detailsList[0]);
    return data;
  };

  const DashboardLabelData = (detailsList: any) => {
    let data: any = [];
    data = Object.keys(detailsList[0]);
    return data;
  };
  const [optionsList, setObjet] = useState<any | null>({
    series: DashboardSeriesData(OnloadActiveCaseList),
    options: {
      chart: {
        type: "donut",
      },
      colors: ["#FF9089", "#7E7E7E", "#FFCE73", "#88C8FF"],
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


  const [resolvedList, setResolved] = useState<any | null>({
    series: ResolvedCaseList,
    options: {
      chart: {
        type: "donut",
      },
      // title: {
      //   text: "Resolved Cases",
      // },
      colors: ["#7BD18A", "#C0E5C6"],
      dataLabels: {
        enabled: false,
      },
      labels: DashboardLabelData(OnloadResolveCaseList),
      plotOptions: {
        pie: {
          donut: {
            size: '65%',
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
      // title: {
      //   text: "Corrective Maintenance",
      // },
      colors: ["#FF655B", "#FFCE73", "#7BD18A"],
      dataLabels: {
        enabled: false,
      },
      labels: DashboardLabelData(OnloadCMWOList),

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
  const [preventiveList, setPreventive] = useState<any | null>({
    series: DashboardSeriesData(OnloadPMWOList),
    options: {
      chart: {
        type: "donut",
      },
      // title: {
      //   text: "Preventive Maintenance",
      // },
      colors: ["#FF655B", "#FFCE73", "#7BD18A"],
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
  const [predictiveList, setPredictive] = useState<any | null>({
    series: DashboardSeriesData(OnloadPDWOList),
    options: {
      chart: {
        type: "donut",
      },
      // title: {
      //   text: "Predictive Maintenance",
      // },
      colors: ["#FF655B", "#FFCE73", "#7BD18A"],
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

  const [responseTimeList, setResponseTime] = useState<any | null>({
    series: [
      {
        data: AvgDashboardData(OnloadAvgResList[0]),
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
      dataLabels: {
        enabled: false,
      },
      xaxis: {
        categories: ["High", "Medium", "Low"],
        title: {
          text: IsCheckValue,
        },
      },
    },
  });

  const [rectificationTimeList, setRectificationTime] = useState<any | null>({
    series: [
      {
        data: AvgDashboardData(OnloadAvgRetList[0]),
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
      dataLabels: {
        enabled: false,
      },
      xaxis: {
        categories: ["High", "Medium", "Low"],
        title: {
          text: IsCheckValue,
        },
      },
    },
  });

  useEffect(() => {
    let language: any = localStorage.getItem("language");
    i18n.changeLanguage(language);
    (async function () {
      await getDashboardMasterDetails();
    })();
    UpdateDashboardDetails();
  }, []);

  async function getDashboardMasterDetails() {
    try {
      const res = await callPostAPI(ENDPOINTS.GET_DASHBOARD_MASTER, {}, null);
      setDateFilterList(res?.DATEFILTERLIST);
      OnloadFilterList = res?.DATEFILTERLIST;
      if (OnloadFilterList.length > 0) {
        await filterDateHandeler(OnloadFilterList[2]);
      }
    } catch (error: any) {
      toast.error(error)
    }
  }

  const filterDateHandeler = async (items: any) => {
    op?.current?.hide();
    if (items.SEQ_NO == 7) {
      setSelectedCustome(true);
      setfilterBtnClick(false);
    } else {
      fromDate = items.FROM_DATE;
      ToDate = items.TO_DATE;
      setDateDesc(items.DATE_DESC);
      setFilterDesc(items.SUB_DATE_DESC);
      await getDashboardDetails();
    }
    setfilterBtnClick(false);
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
    getDashboardDetails();
  };
  const getDashboardDetails = async () => {
    try {
      let payload = {
        FROM_DATE: fromDate,
        TO_DATE: ToDate,
      };
      const res = await callPostAPI(
        ENDPOINTS.GET_DASHBOARD_DETAILS,
        payload,
        null
      );

      OnloadActiveCaseList = res?.ACTIVECASELIST;
      OnloadResolveCaseList = res?.RESOLVECASELIST;
      OnloadCMWOList = res?.CMWOLIST;
      OnloadPMWOList = res?.PMWOLIST;
      OnloadPDWOList = res?.PDWOLIST;
      OnloadAvgResList = res?.AVGRESLIST;
      OnloadAvgRetList = res?.AVGRECLIST;
      totresvalue = res?.WOCOUNTLIST[0]?.AVG_RES_TOT_TIME;
      totretvalue = res?.WOCOUNTLIST[0]?.AVG_RET_TOT_TIME;

      setTotalResTime(res?.WOCOUNTLIST[0]?.AVG_RES_TOT_TIME);
      setWoCount(res?.WOCOUNTLIST[0]?.WO_COUNT);
      setActiveCaseList(DashboardSeriesData(res?.ACTIVECASELIST));
      setResolvedCaseList(DashboardSeriesData(res?.RESOLVECASELIST));
      setCMWoList(DashboardSeriesData(res?.CMWOLIST));

      UpdateDashboardDetails();
    } catch (error: any) { }
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
    setResponseTime({
      series: [
        {
          data: AvgDashboardData(OnloadAvgResList[0]),
        },
      ],
      options: {
        xaxis: {
          title: {
            text: IsCheckValue,
          },
        },
      },
    });
    setRectificationTime({
      series: [
        {
          data: AvgDashboardData(OnloadAvgRetList[0]),
        },
      ],
      options: {
        xaxis: {
          title: {
            text: IsCheckValue,
          },
        },
      },
    });

    let avgres = AvgTimeCal(totresvalue);
    setAvgTotResTime(avgres);

    let avgret = AvgTimeCal(totretvalue);
    setAvgTotRetTime(avgret);
  };

  return (
    <>
      <div>
        <div>
          <h6>{t("Dashboard")}</h6>
        </div>

        <div className="mt-2 dashboardTab">
          {/* <TabView
            activeIndex={activeIndex}
            onTabChange={(e) => setActiveIndex(e.index)}
          >
            <TabPanel header={t("Work Order")}> */}
          <div>
            <div className=" flex justify-content-center">
              <Button
                type="button"
                // onClick={(e:any) => {op.current.toggle(e); dateFilterClickFun(e)}}
                onClick={(e: any) => {
                  op?.current?.toggle(e);
                  setfilterBtnClick(true);
                }}
                // label="Select"
                className="dateSelect"
              >
                <div className="flex w-full items-baseline justify-between">
                  <div className="w-full flex items-baseline ">
                    <i className="pi pi-calendar Text-Secondary"></i>
                    <p className="Text_Primary ml-2">{DateDesc}</p>
                  </div>
                  <i
                    className="pi pi-sort-down-fill Text-Secondary"
                    style={{ color: "#7E8083" }}
                  ></i>
                </div>
              </Button>
              <div className="mt-1 ml-2">
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
                    {DateFilterList?.map((list: any, index: any) => {
                      return (
                        <>
                          <li
                            className={` px-4 py-2 ${list.DATE_SEQNO === "CR"
                              ? "border-t-2"
                              : list.DATE_SEQNO === "CU"
                                ? "CustomDate border-t-2"
                                : ""
                              }`}
                            onClick={(e: any) => filterDateHandeler(list)}
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

              {selectedCustomeDate === true && (
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
          <div className="mt-3 grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-2 lg:grid-cols-2">
            <div>
              <Card className="">
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
            <div>
              <Card className="">
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
                  width={380}
                />
              </Card>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-3 lg:grid-cols-3">
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
          </div>
          <div className="mt-3 grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-2 lg:grid-cols-2">
            <div>
              <Card className="">
                <div className="flex justify-between">
                  <div>
                    <label className="Title_Label Text_Primary">
                      Response Time
                    </label>
                    <p className="Helper_Text Text_Secondary">{DateDesc}</p>
                  </div>

                  <div>
                    <SelectButton
                      value={value}
                      onChange={(e: any) => {
                        onToggleButtonChange(e);
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
            <div>
              <Card className="">
                <div className="flex justify-between">
                  <div>
                    <label className="Title_Label Text_Primary">
                      Rectification Time
                    </label>
                    <p className="Helper_Text Text_Secondary">{DateDesc}</p>
                  </div>

                  <div>
                    <SelectButton
                      value={value}
                      onChange={(e: any) => {
                        onToggleButtonChange(e);
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
                    <h4 className="Text_Primary">{WoCount}</h4>
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
          </div>
          {/* </TabPanel>
          </TabView> */}
        </div>
      </div>
    </>
  );
};

export default Dashboard;
