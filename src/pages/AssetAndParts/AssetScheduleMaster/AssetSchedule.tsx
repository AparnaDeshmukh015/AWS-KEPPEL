import Field from "../../../components/Field";
import InputField from "../../../components/Input/Input";
import Select from "../../../components/Dropdown/Dropdown";
import Radio from "../../../components/Radio/Radio";
import { useTranslation } from "react-i18next";
import Buttons from "../../../components/Button/Button";
import "../../../components/pageComponents/AssetSchedule/AssetScheduleForm";
import { validation } from "../../../utils/validation";
import { LABELS, OPTIONS, convertTime } from "../../../utils/constants";
import { useEffect, useState } from "react";
import TimeCalendar from "../../../components/Calendar/TimeCalendar";
import { Card } from "primereact/card";
import TaskAndDoc from "../../../components/pageComponents/TaskAndDoc/TaskAndDoc";
import { ENDPOINTS } from "../../../utils/APIEndpoints";
import { callPostAPI } from "../../../services/apis";
import noDataIcon from "../../../assest/images/nodatafound.png";

const AssetSchedule = ({
  register,
  control,
  watchAll,
  watch,
  errors,
  setValue,
  getValues,
  setStartEndDate,
  setisValueCheck,
  task,
  setWeek,
}: any) => {
  const { t } = useTranslation();
  const watchScheduler = watchAll?.SCHEDULER;
  let scheduleWatch: any = watchAll?.SCHEDULE_ID;
  const [taskList, setTaskList] = useState<any | null>(task);
  const [selectedData, setSelectedData] = useState<any | null>([]);
  const [, setEditSelectedData] = useState<any | null>([]);
  const [, setError] = useState<any | null>(false);
  const [, setErrorName] = useState<any | null>(false);
  const [data, setData] = useState<{ DAY_CODE: number; DAY_DESC: string }>();

  const handleSelectWeekChange = (week: any, fieldName: any) => {
    setValue(fieldName, week?.DAY_CODE);
  };


  var SCHEDULER_WEEKLY_1_EVERY_WEEK = watch("SCHEDULER.WEEKLY_1_EVERY_WEEK");
  const SCHEDULER_PERIOD = watch("SCHEDULER.PERIOD");
  // JSX Elements

  const SCHEDULER_DAILY_EVERY_STARTAT = watch("SCHEDULER.DAILY_EVERY_STARTAT"); // Start time
  const SCHEDULER_DAILY_EVERY_ENDAT = watch("SCHEDULER.DAILY_EVERY_ENDAT");
  const SCHEDULER_DAILY_ONCE_EVERY = watch("SCHEDULER.DAILY_ONCE_EVERY");
  var SCHEDULER_DAILY_ONCE_EVERY_DAYS = watch("SCHEDULER.DAILY_ONCE_EVERY_DAYS");
  var SCHEDULER_DAILY_EVERY_PERIOD = watch("SCHEDULER.DAILY_EVERY_PERIOD");
  const timeInputField = (labelName: any, registerName: any) => {
    return (
      <div className="flex justify-start mb-2">
        <div className="w-36">
          <label className="Text_Secondary Input_Label mr-2">{labelName}</label>
        </div>
        <div className="w-36">
          <Field
            controller={{
              name: registerName,
              control: control,
              render: ({ field }: any) => {
                return (
                  <TimeCalendar
                    {...register(registerName, {
                      required: "AMC expiry date is Required.",
                    })}
                    setValue={setValue}
                    {...field}
                  />
                );
              },
            }}
          />
        </div>
      </div>
    );
  };

  const inputElement = (
    labelName: any,
    registerName: any,
    lastLabel: any = null,
    validationType: any
  ) => {



    if (registerName == 'SCHEDULER.DAILY_ONCE_EVERY_DAYS') {
      SCHEDULER_WEEKLY_1_EVERY_WEEK = 0;

      SCHEDULER_DAILY_EVERY_PERIOD = 0;
      if (SCHEDULER_DAILY_ONCE_EVERY_DAYS !== '0') {
        setisValueCheck(false)
      }

    } else if (registerName == 'SCHEDULER.WEEKLY_1_EVERY_WEEK') {
      SCHEDULER_DAILY_ONCE_EVERY_DAYS = 0;
      SCHEDULER_DAILY_EVERY_PERIOD = 0;
      if (SCHEDULER_WEEKLY_1_EVERY_WEEK !== '0') {
        setisValueCheck(false)
      }
    } else if (registerName == 'SCHEDULER.DAILY_EVERY_PERIOD') {
      SCHEDULER_WEEKLY_1_EVERY_WEEK = 0;
      SCHEDULER_DAILY_ONCE_EVERY_DAYS = 0;
      if (SCHEDULER_DAILY_EVERY_PERIOD !== '0') {
        setisValueCheck(false)
      }
    }
    return (
      <div className="flex justify-start mb-2">
        <div className="w-36">
          <label className="Text_Secondary Input_Label mr-2">
            {labelName}
            <span style={{ color: "red" }}> *</span>
          </label>
        </div>
        <div className="w-36 mr-2">
          <Field
            controller={{
              name: registerName,
              control: control,
              render: ({ field }: any) => {
                const register_split = registerName?.substring(registerName.indexOf('.') + 1);
                return (
                  <InputField
                    {...register(registerName,

                      {
                        required: t("Please fill the required fields."),
                        validate: (fieldValue: any) => {

                          if (parseInt(fieldValue) === 0) {
                            var val = validation?.NonZeroNumber(
                              parseInt(fieldValue),
                              registerName,
                              setValue
                            );
                            return val;
                          }
                          if (parseInt(fieldValue) === undefined || fieldValue == '') {
                            return "Please fill the required fields";
                          }
                          if (validationType == 'onlyDay') {

                            return validation?.onlyDay(
                              parseInt(fieldValue),
                              registerName,
                              setValue
                            );
                          }
                          if (validationType == 'onlyHours') {

                            return validation?.onlyHours(
                              parseInt(fieldValue),
                              registerName,
                              setValue
                            );
                          }
                          if (validationType == 'onlyWeek') {

                            return validation?.onlyWeek(
                              parseInt(fieldValue),
                              registerName,
                              setValue
                            );
                          }
                          if (validationType == 'onlyMonth') {

                            return validation?.onlyMonth(
                              parseInt(fieldValue),
                              registerName,
                              setValue
                            );
                          }

                          return validation?.onlyNumber(
                            parseInt(fieldValue),
                            registerName,
                            setValue
                          );

                        },
                      })}
                    require={true}
                    setValue={setValue}
                    invalid={errors?.["SCHEDULER"]?.[register_split]}
                    {...field}
                  />
                );
              },
            }}
          />
        </div>
        {lastLabel && (
          <div className="w-36">
            <label className="Text_Secondary Input_Label mr-2">
              {lastLabel}
            </label>
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    setWeek({
      week: data,
      SCHEDULER_WEEKLY_1_EVERY_WEEK: SCHEDULER_WEEKLY_1_EVERY_WEEK,
      SCHEDULER_PERIOD: SCHEDULER_PERIOD.PERIOD,
    });
    LABELS.weekDataLabel?.map((week: any) => {
      if (watchScheduler?.WEEKLY_1_WEEKDAY === week?.DAY_CODE) {
        setWeek({
          week: week,
          SCHEDULER_WEEKLY_1_EVERY_WEEK:
            SCHEDULER_WEEKLY_1_EVERY_WEEK,
        });
        setData(week);
      }
    });
  }, [data, SCHEDULER_WEEKLY_1_EVERY_WEEK, SCHEDULER_PERIOD]);

  useEffect(() => {
    setStartEndDate({
      data: {
        startDate: SCHEDULER_DAILY_EVERY_STARTAT,
        endDate: SCHEDULER_DAILY_EVERY_ENDAT,
      },
      SCHEDULER_DAILY_ONCE_EVERY: SCHEDULER_DAILY_ONCE_EVERY,
      SCHEDULER_PERIOD: SCHEDULER_PERIOD.PERIOD,
    });
  }, [
    data,
    SCHEDULER_PERIOD,
    SCHEDULER_DAILY_ONCE_EVERY,
    SCHEDULER_DAILY_EVERY_STARTAT,
    SCHEDULER_DAILY_EVERY_ENDAT,
  ]);


  const radioElement = (
    labelHead: any,
    registerName: any,
    options: any,
    selectedData: any
  ) => {
    return (
      <div className="flex justify-start mb-2">
        <div className="w-36">
          <label className="Text_Secondary Input_Label mr-2">{labelHead}</label>
        </div>
        <div className="w-80">
          <Field
            controller={{
              name: registerName,
              control: control,
              render: ({ field }: any) => {
                return (
                  <>
                    <Radio
                      {...register(registerName, {
                        required: t("Please fill the required fields.."),
                      })}
                      options={options}
                      selectedData={selectedData}
                      setValue={setValue}
                      {...field}
                    />
                  </>
                );
              },
            }}
          />
        </div>
      </div>
    );
  };

  useEffect(() => {


    setValue(
      "SCHEDULER.WEEKLY_1_PREFERED_TIME",
      selectedData.length !== 0
        ? convertTime(selectedData?.WEEKLY_1_PREFERED_TIME)
        : convertTime("08:00:00")
    );

    setValue(
      "SCHEDULER.MONTHLY_1_PREFERED_TIME",
      selectedData.length !== 0
        ? convertTime(selectedData?.MONTHLY_1_PREFERED_TIME)
        : convertTime("08:00:00")
    );
    setValue(
      "SCHEDULER.MONTHLY_2ND_PREFERED_TIME",
      selectedData.length !== 0
        ? convertTime(selectedData?.MONTHLY_2ND_PREFERED_TIME)
        : convertTime("08:00:00")
    );
    setValue(
      "SCHEDULER.MONTHLY_2_WEEK_PREFERED_TIME",
      selectedData.length !== 0
        ? convertTime(selectedData?.MONTHLY_2_WEEK_PREFERED_TIME)
        : convertTime("08:00:00")
    );
    setValue(
      "SCHEDULER.DAILY_ONCE_AT_TIME",
      selectedData.length !== 0
        ? convertTime(selectedData?.DAILY_ONCE_AT_TIME)
        : convertTime("08:00:00")
    );
  }, [SCHEDULER_PERIOD]);

  const getScheduleOption = (selectedData: any) => {
    if (selectedData) {
      //Schedule Name
      setValue(
        "SCHEDULER.SCHEDULE_NAME",
        selectedData !== "0" ? selectedData?.SCHEDULE_NAME : ""
      );
      // Periodic Daily
      //// Once
      ////// Times in Days
      // setValue(
      //   "SCHEDULER.DAILY_ONCE_EVERY",
      //   selectedData !== "0" ? selectedData?.DAILY_ONCE_EVERY : "O"
      // );
      ////// AT


      setValue(
        "SCHEDULER.DAILY_ONCE_AT_TIME",
        selectedData !== "0"
          ? convertTime(selectedData?.DAILY_ONCE_AT_TIME)
          : "00:00"
      );
      // Every
      setValue(
        "SCHEDULER.DAILY_ONCE_EVERY_DAYS",
        selectedData !== "0" ? selectedData?.DAILY_ONCE_EVERY_DAYS : 0
      );

      //// Multiple
      setValue(
        "SCHEDULER.DAILY_EVERY_PERIOD",
        selectedData !== "0" ? selectedData?.DAILY_EVERY_PERIOD : 0
      );
      setValue(
        "SCHEDULER.DAILY_EVERY_STARTAT",
        selectedData !== "0"
          ? convertTime(selectedData?.DAILY_EVERY_STARTAT)
          : "00:00"
      );
      setValue(
        "SCHEDULER.DAILY_EVERY_ENDAT",
        selectedData !== "0"
          ? convertTime(selectedData?.DAILY_EVERY_ENDAT)
          : "00:00"
      );

      //Periodic Weekly
      //// On
      setValue(
        "SCHEDULER.WEEKLY_1_WEEKDAY",
        selectedData !== "0" ? selectedData?.WEEKLY_1_WEEKDAY : "0"
      );
      //// Every
      setValue(
        "SCHEDULER.WEEKLY_1_EVERY_WEEK",
        selectedData !== "0" ? selectedData?.WEEKLY_1_EVERY_WEEK : "0"
      );




      //// Prefered Time
      setValue(
        "SCHEDULER.WEEKLY_1_PREFERED_TIME",
        selectedData !== "0"
          ? convertTime(selectedData?.WEEKLY_1_PREFERED_TIME)
          : "00:00"
      );

      /// Periodic Monthly
      //// Month Option
      if (selectedData?.MONTHLY_1_MONTHDAY) {
      } else if (selectedData?.MONTHLY_2_WEEK_NUM) {
      }
      setValue(
        "SCHEDULER.MONTHLY_1_MONTHDAY",
        selectedData !== "0" ? selectedData?.MONTHLY_1_MONTHDAY : "0"
      );
      setValue(
        "SCHEDULER.MONTHLY_1_MONTH_NUM",
        selectedData !== "0" ? selectedData?.MONTHLY_1_MONTH_NUM : "0"
      );
      setValue(
        "SCHEDULER.MONTHLY_1_PREFERED_TIME",
        selectedData !== "0"
          ? convertTime(selectedData?.MONTHLY_1_PREFERED_TIME)
          : "00:00"
      );
      setValue(
        "SCHEDULER.MONTHLY_2ND_MONTHDAY",
        selectedData !== "0" ? selectedData?.MONTHLY_2ND_MONTHDAY : "0"
      );
      setValue(
        "SCHEDULER.MONTHLY_2ND_MONTH_NUM",
        selectedData !== "0" ? selectedData?.MONTHLY_2ND_MONTH_NUM : "0"
      );
      setValue(
        "SCHEDULER.MONTHLY_2ND_PREFERED_TIME",
        selectedData !== "0"
          ? convertTime(selectedData?.MONTHLY_2ND_PREFERED_TIME)
          : "00:00"
      );
      ////Week
      setValue(
        "SCHEDULER.MONTHLY_2_WEEK_NUM",
        selectedData !== "0" ? selectedData?.MONTHLY_2_WEEK_NUM : "0"
      );
      setValue(
        "SCHEDULER.MONTHLY_2_WEEKDAY",
        selectedData !== "0" ? selectedData?.MONTHLY_2_WEEKDAY : "0"
      );
      setValue(
        "SCHEDULER.MONTHLY_2_MONTH_NUM",
        selectedData !== "0" ? selectedData?.MONTHLY_2_MONTH_NUM : "0"
      );
      setValue(
        "SCHEDULER.MONTHLY_2_WEEK_PREFERED_TIME",
        selectedData !== "0"
          ? convertTime(selectedData?.MONTHLY_2_WEEK_PREFERED_TIME)
          : "00:00"
      );

      //Run Hour Based
      setValue(
        "SCHEDULER.RUN_HOURS",
        selectedData !== "0" ? selectedData?.RUN_HOURS : "0"
      );
      setValue(
        "SCHEDULER.RUN_AVG_DAILY",
        selectedData !== "0" ? selectedData?.RUN_AVG_DAILY : "0"
      );
      setValue(
        "SCHEDULER.RUN_THRESHOLD_MAIN_TRIGGER",
        selectedData !== "0" ? selectedData?.RUN_THRESHOLD_MAIN_TRIGGER : "0"
      );
      setValue("SCHEDULER.SCHEDULE_ID", selectedData?.SCHEDULE_ID || "0");
    }
  };

  const getScheduleDetails = async () => {
    if (watchAll?.TYPE !== null || watchAll?.TYPE !== "") {
      const res = await callPostAPI(ENDPOINTS.GET_SCHEDULE_DETAILS, {
        SCHEDULE_ID: scheduleWatch,
      });
      if (res?.FLAG === 1) {
        getScheduleOption(res?.SCHEDULEDETAILS[0]);
        setSelectedData(res?.SCHEDULEDETAILS[0]);
        setEditSelectedData(res?.SCHEDULEDETAILS);
        await getTaskList(res?.TASkDETAILS);
        // getTaskList(res?.TASkDETAILS);
      }
    }
  };



  const getTaskList = async (taskDetails: any) => {
    try {
      if (watchAll?.TYPE?.ASSETTYPE_ID) {
        const payload = {
          ASSETTYPE_ID: watchAll?.TYPE?.ASSETTYPE_ID,
        };

        const res = await callPostAPI(ENDPOINTS.TASK_LIST, payload);

        let task: any = res?.TASKLIST;
        if (taskDetails?.length > 0) {
          task?.forEach((task: any) => {
            task.isChecked = taskDetails?.some(
              (scheduleTask: any) => scheduleTask.TASK_ID === task.TASK_ID
            );
          });
          // setTask(res?.TASKLIST);
          setTaskList(task);
        }
        if (taskDetails?.length > 0) {
          task?.forEach((task: any) => {
            task.isChecked = taskDetails?.some(
              (scheduleTask: any) => scheduleTask.TASK_ID === task.TASK_ID
            );
          });
          // setTask(res?.TASKLIST);
          setTaskList(task);
        }
        else {
          setTaskList(task)
        }
      }
    } catch (error) { }
  };

  useEffect(() => {
    if (watchAll?.SCHEDULE_ID !== 0 && watchAll?.TYPE !== null) {
      (async function () {
        await getScheduleDetails()
      })();
    }
  }, [watchAll?.TYPE, watchAll?.SCHEDULE_ID]);

  useEffect(() => {
    if (
      watchAll?.SCHEDULER !== "" ||
      watchAll?.SCHEDULER?.SCHEDULE_NAME !== "" ||
      watchAll?.SCHEDULER?.PERIOD !== ""
    ) {
      setError(false);
      setErrorName(false);
    }
    if (watchAll?.SCHEDULE_ID === 0) {
      setTaskList(task);
      // setValue("SCHEDULER.SCHEDULE_TASK_D",[])
    }
  }, [watchAll]);



  return (
    <div className="mt-1 grid grid-cols-1 gap-3 md:grid-cols-3 lg:grid-cols-3">
      {/* Schedule List */}
      <Card className="mt-2">
        <h6 className=" Text_Primary mb-2" style={{ fontSize: "16px" }}>
          {t("Create Schedule")}
        </h6>
        <div className=" flex justify-between">



          <div className="flex">


          </div>
          <div className="mt-2 grid grid-cols-1 gap-1 md:grid-cols-1 lg:grid-cols-1">

            {/* dRopfdown */}


            {/* SCHEDULER.PERIOD */}
            <div className="flex justify-start mb-2">
              <div className="w-36">
                <label className="Text_Secondary Input_Label mr-2">
                  {t("Repeat")}
                  <span className="text-red-600"> *</span>
                </label>
              </div>
              <div className="w-80">
                <Field
                  controller={{
                    name: "SCHEDULER.PERIOD",
                    control: control,
                    render: ({ field }: any) => {
                      return (
                        <Select
                          options={OPTIONS?.scheduleList}
                          {...register("SCHEDULER.PERIOD", {
                            validate: () => {
                              if (
                                !watchAll?.SCHEDULE_ID &&
                                !watchScheduler?.PERIOD
                              ) {
                                return t("Please fill the required fields.");
                              }
                              return true;
                            },
                          })}
                          optionLabel="SCHEDULE_DESC"
                          findKey={"PERIOD"}
                          selectedData={selectedData?.PERIOD}
                          setValue={setValue}
                          invalid={errors?.SCHEDULER?.PERIOD}

                          {...field}
                          value={
                            OPTIONS?.scheduleList?.filter(
                              (f: any) =>
                                f.PERIOD === watchScheduler?.PERIOD?.PERIOD
                            )[0]
                          }
                        />
                      );
                    },
                  }}
                />
              </div>
            </div>

            {/* PERIODIC DAILY */}

            {watchScheduler?.PERIOD?.PERIOD === "D" && (
              <>
                <hr className="mb-2"></hr>
                {/* RADIO BUTTON SCHEDULER.DAILY_ONCE_EVERY */}
                {radioElement(
                  "Time in Days",
                  "SCHEDULER.DAILY_ONCE_EVERY",
                  OPTIONS?.ScheduleDailyLabel,
                  selectedData?.DAILY_ONCE_EVERY || "O"
                )}

                {/* ONCE-PERIODIC DAILY */}
                {watchScheduler?.DAILY_ONCE_EVERY?.key === "O" && (
                  <div>
                    {/* SCHEDULER.DAILY_ONCE_AT_TIME */}
                    {timeInputField("At", "SCHEDULER.DAILY_ONCE_AT_TIME")}

                    {/* SCHEDULER.DAILY_ONCE_EVERY_DAYS */}
                    {inputElement(
                      "Every",
                      "SCHEDULER.DAILY_ONCE_EVERY_DAYS",
                      "Day(s)",
                      "onlyDay",
                      // "DAILY_ONCE_EVERY_DAYS"
                    )}
                  </div>
                )}

                {/* MULTIPLE-PERIODIC DAILY */}
                {watchScheduler?.DAILY_ONCE_EVERY?.key === "E" && (
                  <div>
                    {/* SCHEDULER.DAILY_EVERY_PERIOD */}
                    {inputElement(
                      "Hours",
                      "SCHEDULER.DAILY_EVERY_PERIOD",
                      "Hr(s)",
                      "onlyHours",
                      // "DAILY_EVERY_PERIOD"
                    )}

                    {/* SCHEDULER.DAILY_EVERY_STARTAT */}
                    {timeInputField(
                      "Starting Time",
                      "SCHEDULER.DAILY_EVERY_STARTAT"
                    )}

                    {/* SCHEDULER.DAILY_EVERY_ENDAT */}
                    {timeInputField(
                      "Ending Time",
                      "SCHEDULER.DAILY_EVERY_ENDAT"
                    )}
                  </div>
                )}
              </>
            )}

            {/* PERIODIC WEEKLY */}

            {watchScheduler?.PERIOD?.PERIOD === "W" && (
              <div>
                <hr className="mb-2"></hr>
                {/* Week Display Sunday Monday */}
                <div className="flex justify-start mb-2">
                  <div className="w-36">
                    <label className="Text_Secondary Input_Label mr-2">
                      On<span style={{ color: "red" }}> *</span>
                    </label>
                  </div>
                  <div
                    className="w-80"
                    {...register("SCHEDULER.WEEKLY_1_WEEKDAY", {})}
                  >
                    {LABELS.weekDataLabel?.map((week: any) => {
                      return (
                        <Buttons
                          className={`Secondary_Button mr-1 ${watchScheduler?.WEEKLY_1_WEEKDAY ===
                            week?.DAY_CODE && "!bg-[#8e724a] !text-white"
                            }`}
                          label={week?.DAY_DESC}
                          type="button"
                          onClick={() => {
                            setWeek({
                              week: week,
                              SCHEDULER_WEEKLY_1_EVERY_WEEK:
                                SCHEDULER_WEEKLY_1_EVERY_WEEK,
                            });
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

                {inputElement(
                  "Every",
                  "SCHEDULER.WEEKLY_1_EVERY_WEEK",
                  "Week(s)",
                  "onlyWeek",

                )}

                {timeInputField(
                  "Prefered Time",
                  "SCHEDULER.WEEKLY_1_PREFERED_TIME"
                )}
              </div>
            )}

            {/* Completed */}
            {/* PERIODIC MONTHLY */}

            {watchScheduler?.PERIOD?.PERIOD === "M" && (
              <>
                <hr className="mb-2"></hr>
                <div className="flex justify-start mb-2">
                  {/* Watch the FIXED DAY Or FIXED WEEK DAY   */}
                  <div className="w-36">
                    <label className="Text_Secondary Input_Label mr-2">
                      Month Option
                    </label>
                  </div>

                  <div className="w-80">
                    <Field
                      controller={{
                        name: "SCHEDULER.MONTH_OPTION",
                        control: control,
                        render: ({ field }: any) => {
                          return (
                            <Select
                              {...register("SCHEDULER.MONTH_OPTION")}
                              options={OPTIONS?.monthList}
                              optionLabel="MONTH_DESC"
                              findKey={"MONTH_OPTION"}
                              selectedData={selectedData?.MONTH_OPTION}
                              setValue={setValue}
                              {...field}
                              value={
                                OPTIONS?.monthList?.filter(
                                  (f: any) =>
                                    f.MONTH_OPTION ===
                                    watchScheduler?.MONTH_OPTION?.MONTH_OPTION
                                )[0]
                              }
                            />
                          );
                        },
                      }}
                    />
                  </div>
                </div>

                {/* When Select on FIXED DAY of Month Option OF PERIODIC MONTHLY */}

                {watchScheduler?.MONTH_OPTION?.MONTH_OPTION === "1" && (
                  <>
                    {radioElement(
                      "Type",
                      "SCHEDULER.MONTHLYONCETWICE",
                      OPTIONS?.ScheduleMonthLabel,
                      selectedData?.MONTHLY_2ND_MONTHDAY !== 0 ? "T" : "O"

                    )}

                    {/* MONHLY ONCE SELECT OF PERIODIC MONTHLY*/}

                    {inputElement(
                      "Day",
                      "SCHEDULER.MONTHLY_1_MONTHDAY",
                      "of",
                      "onlyDay"
                    )}
                    {inputElement(
                      "Every",
                      "SCHEDULER.MONTHLY_1_MONTH_NUM",
                      "Month(s)",
                      "onlyMonth"
                    )}
                    {timeInputField(
                      "Prefered Time",
                      "SCHEDULER.MONTHLY_1_PREFERED_TIME"
                    )}

                    {/* MONHLY TWICE SELECT OF PERIODIC MONTHLY */}

                    {watchScheduler?.MONTHLYONCETWICE?.key === "T" && (
                      <>
                        <hr className="mb-2"></hr>
                        {inputElement(
                          "Day",
                          "SCHEDULER.MONTHLY_2ND_MONTHDAY",
                          "of",
                          "onlyDay"
                        )}
                        {inputElement(
                          "Every",
                          "SCHEDULER.MONTHLY_2ND_MONTH_NUM",
                          "Month(s)",
                          "onlyMonth"
                        )}
                        {timeInputField(
                          "Prefered Time",
                          "SCHEDULER.MONTHLY_2ND_PREFERED_TIME"
                        )}
                      </>
                    )}
                  </>
                )}

                {/* FIXED WEEK DAY of Month Option OF PERIODIC MONTHLY */}

                {watchScheduler?.MONTH_OPTION?.MONTH_OPTION === "2" && (
                  <>
                    {/* Week  Day Display Sunday Monday */}
                    <div className="flex justify-start mb-2">
                      <div className="w-36">
                        <label className="Text_Secondary Input_Label mr-2">
                          On
                        </label>
                      </div>
                      <div className="w-80 flex">
                        <div className="w-20 mr-2">
                          <Field
                            controller={{
                              name: "SCHEDULER.MONTHLY_2_WEEK_NUM",
                              control: control,
                              render: ({ field }: any) => {
                                return (
                                  <Select
                                    {...register(
                                      "SCHEDULER.MONTHLY_2_WEEK_NUM"
                                    )}
                                    options={OPTIONS?.weekNumList}
                                    optionLabel="VIEW"
                                    findKey="MONTHLY_2_WEEK_NUM"
                                    selectedData={
                                      selectedData?.MONTHLY_2_WEEK_NUM
                                    }
                                    setValue={setValue}
                                    {...field}
                                    value={
                                      OPTIONS?.weekNumList?.filter(
                                        (f: any) =>
                                          f.MONTHLY_2_WEEK_NUM ===
                                          watchScheduler?.MONTHLY_2_WEEK_NUM
                                            ?.MONTHLY_2_WEEK_NUM
                                      )[0]
                                    }
                                  />
                                );
                              },
                            }}
                          />
                        </div>

                        <div
                          className=""
                          {...register("SCHEDULER.MONTHLY_2_WEEKDAY", {})}
                        >
                          {/* This is WEEK DAY */}
                          {LABELS?.weekDataLabel?.map(
                            (week: any) => {
                              return (
                                <Buttons
                                  className={`Secondary_Button weekButton mr-1 ${watchScheduler?.MONTHLY_2_WEEKDAY ===
                                    week?.DAY_CODE &&
                                    "!bg-[#8e724a] !text-white"
                                    }`}
                                  label={week?.DAY_DESC}
                                  type="button"
                                  onClick={() => {
                                    handleSelectWeekChange(
                                      week,
                                      "SCHEDULER.MONTHLY_2_WEEKDAY"
                                    );
                                  }}
                                />
                              );
                            }
                          )}
                        </div>
                      </div>
                    </div>
                    {inputElement(
                      "Every",
                      "SCHEDULER.MONTHLY_2_MONTH_NUM",
                      "Months",
                      "onlyMonth"
                    )}

                    {timeInputField(
                      "Prefered Time",
                      "SCHEDULER.MONTHLY_2_WEEK_PREFERED_TIME"
                    )}
                  </>
                )}
              </>
            )}

            {/* RUN HOUR BASED */}

            {watchScheduler?.PERIOD?.FREQUENCY_TYPE === "R" && (
              <>
                <hr className="mb-2"></hr>
                <div className="flex justify-start mb-2">
                  <div className="w-36">
                    <label className="Text_Secondary Input_Label mr-2">
                      Run hours <span className="text-red-600"> *</span>
                    </label>
                  </div>
                  <div className="w-80">
                    <Field
                      controller={{
                        name: "SCHEDULER.RUN_HOURS",
                        control: control,
                        render: ({ field }: any) => {
                          return (
                            <InputField
                              {...register("SCHEDULER.RUN_HOURS", {
                                required: t("Please fill the required fields."),
                                validate: (value: any) => {
                                  if (parseInt(value) === 0) {
                                    var val = validation?.NonZeroNumber(
                                      parseInt(value),
                                      "SCHEDULER.RUN_HOURS",
                                      setValue
                                    );
                                    return val;
                                  }
                                  if (parseInt(value) === undefined || value == '') {
                                    return "Please fill the required fields";
                                  }
                                  return validation?.onlyNumber(
                                    parseInt(value),
                                    "SCHEDULER.RUN_HOURS",
                                    setValue
                                  );
                                }

                              })}
                              require={true}
                              invalid={errors?.SCHEDULER?.RUN_HOURS}
                              {...field}
                            />
                          );
                        },
                      }}

                    />
                  </div>
                </div>

                <div className="flex justify-start mb-2">
                  <div className="w-36">
                    <label className="Text_Secondary Input_Label mr-2">
                      Avg Daily Runhours
                      {/* <span className="text-red-600"> *</span> */}
                    </label>
                  </div>
                  <div className="w-80">
                    <Field
                      controller={{
                        name: "SCHEDULER.RUN_AVG_DAILY",
                        control: control,
                        render: ({ field }: any) => {
                          return (
                            <InputField
                              {...register("SCHEDULER.RUN_AVG_DAILY", {
                                validate: (value: any) => {
                                  return validation?.onlyHours(
                                    parseInt(value),
                                    "SCHEDULER.RUN_AVG_DAILY",
                                    setValue
                                  );
                                }
                              })}

                              invalid={errors?.SCHEDULER?.RUN_AVG_DAILY}
                              {...field}
                            />
                          );
                        },
                      }}
                    />
                  </div>
                </div>

                <div className="flex justify-start mb-2">
                  <div className="w-36">
                    <label className="Text_Secondary Input_Label mr-2">
                      Threshold % Maintainance Trigger
                    </label>
                  </div>
                  <div className="w-80">
                    <Field
                      controller={{
                        name: "SCHEDULER.RUN_THRESHOLD_MAIN_TRIGGER",
                        control: control,
                        render: ({ field }: any) => {
                          return (
                            <InputField
                              {...register(
                                "SCHEDULER.RUN_THRESHOLD_MAIN_TRIGGER",
                                // {
                                //   required: "Please fill the required fields.",
                                //   //  validate: (value: any) => +value !== 0 || "Please fill the required fields."

                                // }
                              )}
                              require={true}
                              // invalid={
                              //   errors?.SCHEDULER?.RUN_THRESHOLD_MAIN_TRIGGER
                              // }
                              {...field}
                            />
                          );
                        },
                      }}
                      error={errors?.RUN_THRESHOLD_MAIN_TRIGGER?.message}
                    />
                  </div>
                </div>
              </>
            )}

            {/* RUN HOUR BASED */}
            {watchScheduler?.PERIOD?.FREQUENCY_TYPE === "F" && (
              <div className="flex content-center justify-center p-2">
                <i className="pi pi-info-circle mr-2 "></i>
                <p className="Text_Secondary Input_Label">No Schedule</p>
              </div>
            )}
          </div>
          <div className="flex justify-center mt-2">

          </div>

        </div>
      </Card>
      {taskList?.length > 0 ? (
        <Card className="col-span-2 mt-2">
          <div>
            <TaskAndDoc
              errors={errors}
              setValue={setValue}
              register={register}
              control={control}
              watchAll={watchAll}
              tasklistOptions={taskList}
              taskList={taskList}
              watch={watch}
              selectedData={taskList}
              getValues={getValues}
              disabled={false}
              AccessKey="Equipment"
            />
          </div>
        </Card>
      ) : (
        <>
          <Card className="col-span-2 mt-2">
            <h6 className=" Text_Primary mb-2" style={{ fontSize: "18px" }}>
              {t("Task Details")}
            </h6>
            <div className="flex items-center mt-2 justify-center w-full">
              <label
                htmlFor="dropzone-file"
                className="flex flex-col items-center justify-center w-full h-54 border-2
               border-gray-200 border rounded-lg  "
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <img src={noDataIcon} alt="" className="w-12" />
                  <p className="mb-2 mt-2 text-sm text-gray-500  dark:text-gray-400">
                    <span className="Text_Primary Input_Label">
                      {t("No task to show")}{" "}
                    </span>
                  </p>
                </div>
              </label>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};
export default AssetSchedule;
