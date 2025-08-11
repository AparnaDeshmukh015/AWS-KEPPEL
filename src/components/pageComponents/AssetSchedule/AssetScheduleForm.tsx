import Field from "../../Field";
import InputField from "../../Input/Input";
import Select from "../../Dropdown/Dropdown";
import Radio from "../../Radio/Radio";
import { useTranslation } from "react-i18next";
import Buttons from "../../../components/Button/Button";
import "./AssetScheduleForm.css";
import { validation } from "../../../utils/validation";
import { LABELS, OPTIONS, convertTime } from "../../../utils/constants";
import { useEffect, useState } from "react";
import TimeCalendar from "../../Calendar/TimeCalendar";
import { Card } from "primereact/card";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import TaskAndDoc from "../TaskAndDoc/TaskAndDoc";
import { ENDPOINTS } from "../../../utils/APIEndpoints";
import { callPostAPI } from "../../../services/apis";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { toast } from "react-toastify";
import moment from "moment";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { appName } from "../../../utils/pagePath";
const AssetSchedule = ({
  ASSET_FOLDER_DATA,
  register,
  control,
  watchAll,
  // watch,
  errors,
  setValue,
  // resetField,
  scheduleTaskList,
  scheduleId,
  getValues,
  setEditStatus,
  // isSubmitting,
  AssetSchedule,
  issueList,
  setScheduleTaskList,
  setAssetTypeState,
  assetTypeState,
  setSelectedSchedule,
  infraScheduleData,
  typewatch,
  setScheduleGroupStatus,
  getSelectedScheduleId,
  selectedLocationSchedule,
  Mode,
  allFieldsFilled,
  setLocationError,
  setTypeError,
  setGroupError,
  setAssetNameError
}: any) => {
  const { t } = useTranslation();
  const watchScheduler = watchAll?.SCHEDULER;

  // let scheduleWatch: any = scheduleId ? scheduleId : watchAll?.SCHEDULE_ID;
  let { search } = useLocation();
  const [selectedData, setSelectedData] = useState<any | null>([]);
  const [editSelectedData, setEditSelectedData] = useState<any | null>([]);
  //const [errorData, setError] = useState<any | null>(false);
  const [errorName, setErrorName] = useState<any | null>(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(
    scheduleId
  );
  const [options, setOptions] = useState<any>({});
  const [status, setStatus] = useState<any | null>();
  const handleSelectWeekChange = (week: any, fieldName: any) => {
    setValue(fieldName, week?.DAY_CODE);
  };
  const [visible, setVisible] = useState<boolean>(false);
  const [disabled, setDisabled] = useState<boolean>(true);

  const fromEdit = scheduleTaskList[0]?.SCHEDULE_ID ?? 0;

  const [data, setData] = useState<{ DAY_CODE: number; DAY_DESC: string }>();
  const { watch } = useForm();
  const SCHEDULER_PERIOD: any = watch("SCHEDULER.PERIOD");

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
    return (
      <div className="flex justify-start mb-2">
        <div className="w-36">
          <label className="Text_Secondary Input_Label mr-2">{labelName}</label>
        </div>
        <div className="w-36 mr-2">
          <Field
            controller={{
              name: registerName,
              control: control,
              render: ({ field }: any) => {
                return (
                  <InputField
                    {...register(registerName, {
                      validate: (fieldValue: any) => {
                        return validation[validationType](
                          fieldValue,
                          registerName,
                          setValue
                        );
                      },
                    })}
                    require={true}
                    invalid={errors?.registerName}
                    setValue={setValue}
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

  const getTaskList = async () => {
    try {
      if (watchAll?.TYPE?.ASSETTYPE_ID) {
        const payload = {
          ASSETTYPE_ID: watchAll?.TYPE?.ASSETTYPE_ID,
        };

        const res = await callPostAPI(ENDPOINTS.TASK_LIST, payload, "AS067");
        if (res?.FLAG === 1) {
          setOptions({ ...options, tasklistOptions: res?.TASKLIST });
        } else {
          setOptions({ ...options, tasklistOptions: [] });
        }
      }
    } catch (error) { }
  };

  const [week, setWeek] = useState<{
    week: { DAY_CODE: number; DAY_DESC: string };
    SCHEDULER_WEEKLY_1_EVERY_WEEK: number | string;
    SCHEDULER_PERIOD: string;
  }>();
  const [startEndDate, setStartEndDate] = useState<{
    data: { startDate: any; endDate: any };
    SCHEDULER_DAILY_ONCE_EVERY: { key: string; name: string };
    SCHEDULER_PERIOD: string;
  }>();

  const SCHEDULER_WEEKLY_1_EVERY_WEEK = watch("SCHEDULER.WEEKLY_1_EVERY_WEEK");
  // JSX Elements

  const SCHEDULER_DAILY_EVERY_STARTAT = watch("SCHEDULER.DAILY_EVERY_STARTAT"); // Start time
  const SCHEDULER_DAILY_EVERY_ENDAT = watch("SCHEDULER.DAILY_EVERY_ENDAT");
  const SCHEDULER_DAILY_ONCE_EVERY = watch("SCHEDULER.DAILY_ONCE_EVERY");

  useEffect(() => {
    setWeek({
      week: data!,
      SCHEDULER_WEEKLY_1_EVERY_WEEK: SCHEDULER_WEEKLY_1_EVERY_WEEK,
      SCHEDULER_PERIOD: SCHEDULER_PERIOD?.PERIOD,
    });
  }, [data, SCHEDULER_WEEKLY_1_EVERY_WEEK, SCHEDULER_PERIOD]);

  useEffect(() => {
    setStartEndDate({
      data: {
        startDate: SCHEDULER_DAILY_EVERY_STARTAT,
        endDate: SCHEDULER_DAILY_EVERY_ENDAT,
      },
      SCHEDULER_DAILY_ONCE_EVERY: SCHEDULER_DAILY_ONCE_EVERY,
      SCHEDULER_PERIOD: SCHEDULER_PERIOD?.PERIOD,
    });
  }, [
    data,
    SCHEDULER_PERIOD,
    SCHEDULER_DAILY_ONCE_EVERY,
    SCHEDULER_DAILY_EVERY_STARTAT,
    SCHEDULER_DAILY_EVERY_ENDAT,
  ]);

  const onSubmit = () => {
    if (week?.week === undefined && week?.SCHEDULER_PERIOD === "W") {
      toast.error("Please select the week");
      return;
    }
    if (
      week?.SCHEDULER_WEEKLY_1_EVERY_WEEK === "0" &&
      week?.SCHEDULER_PERIOD === "W"
    ) {
      toast.error(" Please add number of weeks required");
      return;
    }
    // const startDate = moment(startEndDate?.data.startDate).format('hh:mm');
    // const endDate = moment(startEndDate?.data.endDate).format('hh:mm');

    if (
      startEndDate?.SCHEDULER_DAILY_ONCE_EVERY?.key === "E" &&
      startEndDate.data.startDate === "00:00" &&
      startEndDate.SCHEDULER_PERIOD === "D"
    ) {
      toast.error("Select start date");
      return;
    }
    if (
      startEndDate?.SCHEDULER_DAILY_ONCE_EVERY?.key === "E" &&
      startEndDate.data.endDate === "00:00" &&
      startEndDate.SCHEDULER_PERIOD === "D"
    ) {
      toast.error("Select end date");
      return;
    }

    if (
      startEndDate?.SCHEDULER_DAILY_ONCE_EVERY?.key === "E" &&
      startEndDate.SCHEDULER_PERIOD === "D" &&
      !moment(startEndDate?.data.endDate).isAfter(startEndDate?.data.startDate)
    ) {
      toast.error("Ending time should be more the starting time");
      return;
    }

    handleFormSubmit();
  };

  useEffect(() => {
    setValue(
      "SCHEDULER.WEEKLY_1_PREFERED_TIME",
      selectedData === 0
        ? convertTime(selectedData?.WEEKLY_1_PREFERED_TIME)
        : convertTime("08:00:00")
    );

    setValue(
      "SCHEDULER.MONTHLY_1_PREFERED_TIME",
      selectedData === 0
        ? convertTime(selectedData?.MONTHLY_1_PREFERED_TIME)
        : convertTime("08:00:00")
    );
    setValue(
      "SCHEDULER.MONTHLY_2ND_PREFERED_TIME",
      selectedData === 0
        ? convertTime(selectedData?.MONTHLY_2ND_PREFERED_TIME)
        : convertTime("08:00:00")
    );
    setValue(
      "SCHEDULER.MONTHLY_2_WEEK_PREFERED_TIME",
      selectedData === 0
        ? convertTime(selectedData?.MONTHLY_2_WEEK_PREFERED_TIME)
        : convertTime("08:00:00")
    );
    setValue(
      "SCHEDULER.DAILY_ONCE_AT_TIME",
      selectedData === 0
        ? convertTime(selectedData?.DAILY_ONCE_AT_TIME)
        : convertTime("08:00:00")
    );
  }, [SCHEDULER_PERIOD]);

  const getScheduleOption = (selectedData: any) => {
    if (selectedData) {
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
      setValue("SCHEDULER.SCHEDULE_ID", selectedData?.SCHEDULE_ID || "");
    }
  };

  const getScheduleDetails = async (

    id?: any,
    scheduleList?: any,
    typeStatus?: any
  ) => {



    if (watchAll?.TYPE !== null || watchAll?.TYPE !== "") {
      const res = await callPostAPI(
        ENDPOINTS.GET_SCHEDULE_DETAILS,
        {
          SCHEDULE_ID: id ? id : scheduleId,
        },
        "AS067"
      );

      if (res?.FLAG === 1) {
        getScheduleOption(res?.SCHEDULEDETAILS[0]);
        setSelectedData(res?.SCHEDULEDETAILS[0]);
        if (scheduleList === "scheduleId") {
          setSelectedScheduleId(id);
        }


        getSelectedScheduleId(res?.SCHEDULEDETAILS[0]?.SCHEDULE_ID ?? fromEdit ?? 0);

        setEditSelectedData(res?.SCHEDULEDETAILS);
        // let tasklistOptionsData: any = options ? options?.tasklistOptions : [];
        const payload = {
          ASSETTYPE_ID: watchAll?.TYPE?.ASSETTYPE_ID,
        };

        const res1 = await callPostAPI(ENDPOINTS.TASK_LIST, payload, "AS067");
        let tasklistOptionsData = res1?.TASKLIST;
        //  }

        if (
          res?.TASkDETAILS?.length > 0 &&
          tasklistOptionsData?.length > 0 &&
          typeStatus === true
        ) {
          const taskIdsSet: any = new Set(
            res?.TASkDETAILS?.map((task: any) => task?.TASK_ID)
          );
          const resultArray: any = [
            ...res?.TASkDETAILS.map((task: any) => ({
              ACTIVE: task?.ACTIVE,
              SKILL_ID: task?.SKILL_ID,
              SKILL_NAME: task?.SKILL_NAME,
              TASK_ID: task?.TASK_ID,
              TASK_NAME: task?.TASK_DESC,
              isChecked: taskIdsSet.has(task.TASK_ID),
            })),
            ...tasklistOptionsData
              ?.filter((task: any) => !taskIdsSet.has(task.TASK_ID))
              .map(
                ({
                  TASK_ID,
                  TASK_NAME,
                  ACTIVE,
                  SKILL_ID,
                  SKILL_NAME,
                }: any) => ({
                  TASK_ID,
                  TASK_NAME: TASK_NAME,
                  ACTIVE,
                  SKILL_ID,
                  SKILL_NAME,
                })
              ),
          ];

          setValue("SCHEDULER.SCHEDULE_TASK_D", resultArray);
          setOptions({ ...options, tasklistOptions: resultArray });
        } else {
          setValue("SCHEDULER.SCHEDULE_TASK_D", []);
          setOptions({ ...options, tasklistOptions: res1?.TASKLIST });
        }
      }
    }
  };



  useEffect(() => {
    (async function () {
      if (watchAll?.TYPE !== null && scheduleId === 0) {
        if (search === "?add=") {
          setValue("SCHEDULER.SCHEDULE_ID", 0);
          setValue("SCHEDULE_ID", 0);
          setScheduleTaskList([]);
          setOptions({ ...options, tasklistOptions: [] });
          // await getTaskList();
          getScheduleOption(0);
          setSelectedData(0);
        }
      } else if (scheduleId !== 0 && watchAll?.TYPE !== null) {
        if (search === "?edit=" && assetTypeState === false) {

          await getScheduleDetails("", "", true);
        } else {
          if (status === "create") {
            setSelectedScheduleId(0);
            await getScheduleDetails();
          }
        }
      }
    })();
  }, [watchAll?.TYPE, watchAll?.SCHEDULE_ID]);

  const handleCreate = (status: any) => {
    if (status === "create" && watchAll?.SCHEDULE_ID !== 0) {
      getScheduleOption("0");
      setValue("SCHEDULER.SCHEDULE_NAME", "");
      setSelectedData("0");
      setStatus(status);
      setDisabled(false);
    } else {
      if (editSelectedData?.length > 0) {
        setStatus("edit");

        setSelectedScheduleId(editSelectedData[0]?.SCHEDULE_ID);
        getScheduleOption(editSelectedData[0]);
        setSelectedData(editSelectedData[0]);
        setDisabled(false);
        setValue(
          "SCHEDULER.DAILY_ONCE_EVERY",
          selectedData !== "0" ? editSelectedData[0]?.DAILY_ONCE_EVERY : "O"
        );
      } else {
        setStatus("create");
        setSelectedData("0");
        setDisabled(false);
        getScheduleOption("0");
        setValue(
          "SCHEDULER.DAILY_ONCE_EVERY",
          selectedData !== "0" ? editSelectedData[0]?.DAILY_ONCE_EVERY : "O"
        );
      }
    }
  };



  const handleFormSubmit = () => {
    if (!watchAll?.SCHEDULER?.SCHEDULE_NAME && !watchAll?.SCHEDULER?.PERIOD) {
      toast.error("Please fill in all required fields.");
      // setError(true);
      setErrorName(true);
    } else if (!watchAll?.SCHEDULER?.SCHEDULE_NAME) {
      toast.error("Please fill in all required fields.");
      setErrorName(true);
    } else if (!watchAll?.SCHEDULER?.PERIOD) {
      toast.error("Please fill in all required fields.");
    } else {
      setVisible(false);
    }
  };

  const navigate: any = useNavigate();
  const handleRedirect = () => {
    setScheduleGroupStatus(true)
    localStorage.setItem("schedulePage", "assetSchedule")
    navigate(`${appName}/infraschedule`, { state: { typewatch: typewatch, Mode: Mode } });
  };
  const handleCalendarRedirect = () => {
    navigate(`${appName}/ppmSchedule`);
  };

  useEffect(() => {
    if (
      watchAll?.SCHEDULER !== "" ||
      watchAll?.SCHEDULER?.SCHEDULE_NAME !== "" ||
      watchAll?.SCHEDULER?.PERIOD !== ""
    ) {
      setErrorName(false);
    }
  }, [watchAll]);

  useEffect(() => {
    setValue("TYPE", null);
    setValue("SCHEDULER.SCHEDULE_ID", 0);
    setValue("SCHEDULE_ID", 0);
    setOptions({ ...options, tasklistOptions: [] });
  }, [watchAll?.GROUP]);


  // chnages by priyanka

  const FACILITY: any = localStorage.getItem("FACILITYID");
  const FACILITYID: any = JSON.parse(FACILITY);

  if (FACILITYID) {
    var facility_type: any = FACILITYID?.FACILITY_TYPE;

  }

  return (
    <div className="mt-1 grid grid-cols-1">
      {/* Schedule List */}
      <Card className="mt-2">
        <div>
          <div className="headingConainer flex justify-between">
            {AssetSchedule === true ? <p>Schedule List</p> : <p></p>}
            <div className="flex">
              {scheduleId === 0 && selectedScheduleId === 0 && (
                <>
                  {facility_type === "I" ? (
                    <>
                      <p
                        className="mr-2 mt-2"
                        onClick={() => {
                          handleCalendarRedirect();
                        }}
                      >
                        <i className="pi pi-calendar mr-2"></i>
                        Calendar view
                      </p>

                      <Buttons
                        className="Primary_Button"
                        onClick={() => {
                          if (allFieldsFilled === false) {

                            toast.error("Please select required field");
                            const locationStatus = watchAll?.LOCATION === "" ? true : false;
                            setLocationError(locationStatus);
                            let groupStatus = watchAll?.GROUP === "" ? true : false
                            setGroupError(groupStatus);
                            const typeStatus = watchAll?.TYPE === null ? true : false;
                            setTypeError(typeStatus)
                            const assetNameStatus = watchAll?.ASSET_NAME === "" ? true : false;
                            setAssetNameError(assetNameStatus)
                          } else {
                            handleRedirect();
                          }
                        }}
                        label={"Add Schedule"}
                      />
                    </>
                  ) : (
                    <>
                      <Buttons
                        className="Primary_Button  w-20 mr-2"
                        onClick={() => {
                          setVisible(true);
                          setValue("SCHEDULER.SCHEDULE_NAME", "");
                          handleCreate("create");
                          getScheduleOption("0");
                          setSelectedData("0");
                          setStatus("create");
                        }}
                        label={"Create"}
                      />
                    </>
                  )}
                </>
              )}

              {(scheduleId !== 0 || selectedScheduleId !== 0) && (
                <>
                  {facility_type === "I" ? (
                    <>
                      <p
                        className="mr-2 mt-2"
                        onClick={() => {
                          handleCalendarRedirect();
                        }}
                      >
                        <i className="pi pi-calendar mr-2"></i>
                        Calendar view
                      </p>
                      {scheduleId !== 0 || selectedScheduleId !== 0 || fromEdit !== 0 ?
                        <Buttons
                          className="Primary_Button  w-20 mr-2"
                          label={"Edit Schedule"}
                          onClick={() => {
                            localStorage.setItem("schedulePage", "assetSchedule")
                            navigate(`${appName}/infraschedule`, { state: { selectformscheduleId: selectedScheduleId ? selectedScheduleId : scheduleId, Mode: Mode, selectedLocationSchedule: selectedLocationSchedule, ASSET_FOLDER_DATA: ASSET_FOLDER_DATA } });
                          }}
                        /> : <Buttons
                          type="submit"
                          className="Primary_Button"
                          onClick={() => {

                            handleRedirect();
                          }}
                          label={"Add Schedule"}
                        />}
                    </>
                  ) : (
                    <>
                      <Buttons
                        className="Primary_Button  w-20 mr-2"
                        label={"Edit"}
                        onClick={() => {
                          setValue(
                            "SCHEDULER.SCHEDULE_NAME",
                            editSelectedData[0]?.SCHEDULE_NAME
                          );
                          setVisible(true);
                          setEditStatus(true);
                          handleCreate("edit");
                        }}
                      />
                    </>
                  )}
                </>
              )}
            </div>
          </div>
          <div>
            {AssetSchedule === true && (
              <DataTable
                value={scheduleTaskList}
                showGridlines
                scrollable
                scrollHeight="200px"
                emptyMessage={t("No Data found.")}
              >
                <Column
                  field=""
                  header="#"
                  body={(rowData: any) => {

                    return (
                      <Field
                        controller={{
                          name: "SCHEDULE_ID",
                          control: control,
                          render: ({ field }: any) => {
                            return (
                              <input
                                {...register("SCHEDULE_ID", {})}
                                {...field}
                                type="radio"
                                value={rowData?.SCHEDULE_ID}
                                checked={
                                  facility_type === "R" ? 
                                  rowData?.SCHEDULE_ID ===
                                  (selectedScheduleId
                                    ? selectedScheduleId
                                    : scheduleId) : 
                                    rowData?.SCHEDULE_ID ===scheduleId
                                }
                                onChange={async () => {
                                  setAssetTypeState(true);
                                  await getScheduleDetails(
                                    rowData?.SCHEDULE_ID,
                                    "scheduleId",
                                    true
                                  );
                                  setSelectedScheduleId(rowData?.SCHEDULE_ID);
                                  setSelectedSchedule(rowData?.SCHEDULE_ID);
                                  await getTaskList()
                                }}
                              />
                            );
                          },
                        }}
                        error={errors?.SCHEDULE_ID?.message}
                      />
                    );
                  }}
                />

                <Column
                  field="SCHEDULE_NAME"
                  header={t("Schedule Name")}
                  body={(rowData: any) => {
                    return <label> {rowData?.SCHEDULE_NAME}</label>;
                  }}
                />
                <Column
                  field="FREQUENCY_DESC"
                  className="w-96"
                  header={t("Frequency")}
                  body={(rowData: any) => {
                    return <label> {rowData?.FREQUENCY_DESC}</label>;
                  }}
                />

                <Column
                  field="OCCURS"
                  className="w-96"
                  header={t("Occurs")}
                  body={(rowData: any) => {
                    return <label> {rowData?.OCCURS}</label>;
                  }}
                />

                {/* {facility_type === "I" && <Column
                  field="FREQUENCY_TYPE"
                  className="w-96"
                  header={t("Frequency")}
                  body={(rowData: any) => {
                    return <label> {rowData?.FREQUENCY_TYPE}</label>;
                  }}
                />
                } */}
                {/* {
                  facility_type === "I" && <Column
                    field="PERIOD"
                    className="w-96"
                    header={t("Occurs")}
                    body={(rowData: any) => {
                      return <label> {rowData?.PERIOD}</label>;
                    }}
                  />
                } */}


              </DataTable>
            )}
          </div>
          <Dialog
            header={t("Schedule Details")}
            visible={visible}
            style={{ width: "40vw" }}
            breakpoints={{ "960px": "75vw", "641px": "100vw" }}
            onHide={() => {
              if (!visible) return;
              setVisible(false);
            }}
          >
            <div className=" grid grid-cols-1 ">
              <div className="flex justify-start mb-2">
                <div className="w-36">
                  <label className="Text_Secondary Input_Label mr-2">
                    {t("Schedule Name")}
                    <span className="text-red-600"> *</span>
                  </label>
                </div>
                <div className={"w-80"}>
                  <Field
                    controller={{
                      name: "SCHEDULER.SCHEDULE_NAME",
                      control: control,
                      render: ({ field }: any) => {
                        return (
                          <InputField
                            {...register("SCHEDULER.SCHEDULE_NAME", {
                              required: "Please fill the required fields.",
                            })}
                            invalid={errorName === true ? "error" : ""}
                            setValue={setValue}
                            require={true}
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
                    {t("Issue")}
                    <span className="text-red-600"> *</span>
                  </label>
                </div>
                <div className="w-80">
                  <Field
                    controller={{
                      name: "SCHEDULER.Record",
                      control: control,
                      render: ({ field }: any) => {
                        return (
                          <Select
                            options={issueList}
                            {...register("SCHEDULER.REQ_ID" as any, {
                              validate: () => {
                                if (
                                  !watchAll?.SCHEDULE_ID &&
                                  !watchScheduler?.Record
                                ) {
                                  return t("Please fill the required fields.");
                                }
                                return true;
                              },
                            })}
                            optionLabel="REQ_DESC"
                            findKey={"REQ_ID"}
                            selectedData={
                              status === "create" ? "0" : selectedData?.REQ_ID
                            }
                            setValue={setValue}
                            {...field}
                            value={
                              issueList?.filter(
                                (f: any) =>
                                  f.REQ_ID === watchScheduler?.Record?.REQ_ID
                              )[0]
                            }
                          />
                        );
                      },
                    }}
                  />
                </div>
              </div>
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
                            {...register("SCHEDULER.PERIOD" as any, {
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
                            selectedData={
                              status === "create" ? "0" : selectedData?.PERIOD
                            }
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
              <hr className="mb-2"></hr>

              {watchScheduler?.PERIOD?.PERIOD === "D" && (
                <>
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
                        "onlyDay"
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
                        "onlyHours"
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
                  {/* Week Display Sunday Monday */}
                  <div className="flex justify-start mb-2">
                    <div className="w-36">
                      <label className="Text_Secondary Input_Label mr-2">
                        On
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
                    "onlyWeek"
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
                        // selectedData?.MONTHLY_2ND_MONTHDAY  || ""
                        status === "create"
                          ? "O"
                          : selectedData?.MONTHLY_2ND_MONTHDAY === 0
                            ? "O"
                            : "T"
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
                            {LABELS?.weekDataLabel?.map((week: any) => {
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
                            })}
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
                                  required: t(
                                    "Please fill the required fields."
                                  ),
                                  validate: (value: any) =>
                                    +value !== 0 ||
                                    t("Please fill the required fields."),
                                })}
                                invalid={errors?.SCHEDULER?.RUN_HOURS}
                                {...field}
                              />
                            );
                          },
                        }}
                        error={errors?.SCHEDULER?.RUN_HOURS?.message}
                      />
                    </div>
                  </div>

                  <div className="flex justify-start mb-2">
                    <div className="w-36">
                      <label className="Text_Secondary Input_Label mr-2">
                        Avg Daily Runhours
                        <span className="text-red-600">*</span>
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
                                  required: t(
                                    "Please fill the required fields."
                                  ),
                                  validate: (value: any) =>
                                    +value !== 0 ||
                                    t("Please fill the required fields."),
                                })}
                                require={true}
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
                        <span className="text-red-600"> *</span>
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
                                  {
                                    required: t(
                                      "Please fill the required fields."
                                    ),
                                    validate: (value: any) =>
                                      +value !== 0 ||
                                      t("Please fill the required fields."),
                                  }
                                )}
                                require={true}
                                invalid={
                                  errors?.SCHEDULER?.RUN_THRESHOLD_MAIN_TRIGGER
                                }
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
              <Button
                type="button"
                className="Primary_Button w-28 me-2"
                label={t("Ok")}
                onClick={onSubmit}
              />
              <Button
                className="Secondary_Button w-28 "
                label={t("Cancel")}
                onClick={() => {
                  if (!visible) return;
                  setVisible(false);
                }}
              />
            </div>
          </Dialog>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3 lg:grid-cols-3">
          <div className="col-span-3">
            <TaskAndDoc
              errors={errors}
              setValue={setValue}
              // register={register}
              control={control}
              // watchAll={watchAll}
              tasklistOptions={options?.tasklistOptions}
              // taskList={taskList}
              watch={watch}
              // selectedData={taskList}
              getValues={getValues}
              disabled={disabled}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};
export default AssetSchedule;
