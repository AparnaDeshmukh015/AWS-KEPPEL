import InputField from "../../../components/Input/Input";
import { Card } from "primereact/card";
import { useForm } from "react-hook-form";
import Field from "../../../components/Field";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Select from "../../../components/Dropdown/Dropdown";
import { useLocation, useOutletContext } from "react-router-dom";
import FormHeader from "../../../components/FormHeader/FormHeader";
import Radio from "../../../components/Radio/Radio";
import AssetSchedule from "./AssetSchedule";
import { ENDPOINTS } from "../../../utils/APIEndpoints";
import { callPostAPI } from "../../../services/apis";
import moment from "moment";
import { saveTracker } from "../../../utils/constants";
import { eventNotification, helperEventNotification } from "../../../utils/eventNotificationParameter";
import { decryptData } from "../../../utils/encryption_decryption";

const AssetScheduleMasterForm = (props: any) => {
  const [selectedDetails, setSelectedDetails] = useState<any>([]);
  const [task, setTask] = useState<any | null>([]);
  const [scheduleData, setScheduleData] = useState<any | null>([]);
  const [issueList, setIssueList] = useState<any | null>([])
  const [selectedIssue, setSelectedIssue] = useState<any | null>()
  const [softService, setSoftService] = useState<any | null>([]);
  const [assetData, setAsset] = useState<any | null>([])
  const [IsSubmit, setIsSubmit] = useState<any | null>(false);


  const { t } = useTranslation();
  let { pathname } = useLocation();
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
  const [selected, menuList]: any = useOutletContext();
  const currentMenu = menuList
    ?.flatMap((menu: any) => menu?.DETAIL)
    .filter((detail: any) => detail.URL === pathname)[0];
  const [options, setOptions] = useState<any>([]);
  const [isValueCheck, setisValueCheck] = useState<boolean>(false);
  const assestTypeLabel: any = [
    { name: "Equipment ", key: "A" },
    { name: "Soft Services", key: "N" },
  ];
  // const [selectedScheduleTaskDetails, setSelectedScheduleTaskDetails] = useState<any>();
  const { search } = useLocation();
  const getId: any = localStorage.getItem("Id")
  const dataId = JSON.parse(getId)

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
      MODE: props?.selectedData ? "E" : "A",
      PARA: props?.selectedData
        ? { para1: `${props?.headerName}`, para2: "Updated" }
        : { para1: `${props?.headerName}`, para2: "Added" },
      ASSET_NONASSET: "",
      TYPE: null,
      SCHEDULE_NAME: props?.selectedData ? props?.selectedData?.SCHEDULE_NAME : search === '?edit=' ? dataId?.SCHEDULE_NAME : "",
      SOFT_SERVICE: "",
      MAKE: props?.selectedData?.MAKE_ID || "",
      MODEL: props?.selectedData?.MODEL_ID || "",
      REQ_ID: "",
      SCHEDULE_ID: props?.selectedData ? props?.selectedData?.SCHEDULE_ID : search === '?edit=' ? dataId?.SCHEDULE_ID : 0,
      SCHEDULER: {
        MODE: "A",
        TEAM_LEAD_ID: 0,
        TEAM_ID: 0,
        SCHEDULE_ID: "0",
        SCHEDULE_NAME: props?.selectedData?.SCHEDULE_NAME || "",
        FREQUENCY_TYPE: "",
        PERIOD: "",
        DAILY_ONCE_EVERY: "O",
        DAILY_ONCE_AT_TIME: "00:00",
        DAILY_ONCE_EVERY_DAYS: 0,
        DAILY_EVERY_PERIOD: 0,
        DAILY_EVERY_PERIOD_UOM: "H",
        DAILY_EVERY_STARTAT: "00:00",
        DAILY_EVERY_ENDAT: "00:00",
        WEEKLY_1_WEEKDAY: "0",
        WEEKLY_1_EVERY_WEEK: "0",
        WEEKLY_1_PREFERED_TIME: "08:00",
        WEEKLY_2_WEEKDAY: "0",
        WEEKLY_2_EVERY_WEEK: "00",
        WEEKLY_2_PREFERED_TIME: "00:00",
        MONTH_OPTION: 0,
        MONTHLY_1_MONTHDAY: "0",
        MONTHLY_1_MONTH_NUM: "0",
        MONTHLY_2_WEEK_NUM: "0",
        MONTHLY_2_WEEKDAY: "0",
        MONTHLY_2_MONTH_NUM: "0",
        RUN_HOURS: "0",
        ACTIVE: 1,
        RUN_AVG_DAILY: "0",
        RUN_THRESHOLD_MAIN_TRIGGER: "0",
        MONTHLY_2ND_MONTHDAY: "0",
        MONTHLY_2ND_MONTH_NUM: "0",
        MONTHLY_1_PREFERED_TIME: "00:00",
        MONTHLY_2ND_PREFERED_TIME: "00:00",
        MONTHLY_2_WEEK_PREFERED_TIME: "00:00",
        SCHEDULE_TASK_D: [
          {
            TASK_ID: 0,
            TASK_DESC: "",
            TASK_TIME: "00:00",
            TIME_UOM_CODE: 0,
            SKILL_ID: 0,
            ACTIVE: 1,
          },
        ],
      },
    },
    mode: "all",
  });

  const User_Name = decryptData((localStorage.getItem("USER_NAME")))
  const watchAll: any = watch();
  const ASSET_NONASSET: any = watch("ASSET_NONASSET");
  //const SCHEDULER_WEEKLY_1_WEEKDAY: any = watch("SCHEDULER.WEEKLY_1_WEEKDAY");
  const SCHEDULER_DAILY_ONCE_EVERY_DAYS: any = watch(
    "SCHEDULER.DAILY_ONCE_EVERY_DAYS"
  );
  //const SCHEDULER_PERIOD = watch("SCHEDULER.PERIOD");

  const getOptions = async () => {
    const payload = {
      ASSETTYPE: "P",
    };
    try {
      await callPostAPI(
        ENDPOINTS.GET_REQUEST_DESCRIPTION_MASTERLIST,
        null,
        currentMenu?.FUNCTION_CODE
      );
      const res1 = await callPostAPI(
        ENDPOINTS.GETASSETMASTEROPTIONS,
        payload,
        props?.functionCode
      );

      setOptions({
        assetMake: res1?.MAKELIST,
        assetModel: res1?.MODELLIST,
        assestOptions: res1?.ASSESTTYPELIST?.filter(
          (item: any) => item?.ASSETTYPE === "A"
        ),
        softServicesOptions: res1?.ASSESTTYPELIST?.filter(
          (item: any) => item?.ASSETTYPE === "N"
        ),
      });
      setAsset(res1?.ASSESTTYPELIST?.filter(
        (item: any) => item?.ASSETTYPE === "A"
      ))
      setSoftService(res1?.ASSESTTYPELIST?.filter(
        (item: any) => item?.ASSETTYPE === "N"))
      if (search === "?edit=") {
        await getScheduleDetails();
      }
    } catch (error) { }
  };

  const getScheduleDetails = async () => {
    try {
      const res = await callPostAPI(ENDPOINTS.GET_SCHEDULE_DETAILS, {
        SCHEDULE_ID: props?.selectedData ? props?.selectedData?.SCHEDULE_ID : search === '?edit=' ? dataId?.SCHEDULE_ID : 0,
      });

      if (res?.FLAG === 1) {

        await getTaskList();
        await getRequestList(res?.SCHEDULEDETAILS[0]?.ASSETGROUP_ID, res?.SCHEDULEDETAILS[0]?.ASSET_NONASSET, res?.SCHEDULEDETAILS[0]?.REQ_ID)
        setSelectedDetails(res?.SCHEDULEDETAILS[0]);
        setScheduleData(res?.SCHEDULEDETAILS[0]);
        // setSelectedTaskDetailsList(res?.TASkDETAILS)
        if (res?.TASkDETAILS?.length > 0) {
          task?.forEach((task: any) => {
            task.isChecked = res?.TASkDETAILS.some(
              (scheduleTask: any) => scheduleTask.TASK_ID === task.TASK_ID
            );
          });

        }
      }
    } catch (error) { }
  };

  const onSubmit = async (payload: any) => {
    if (IsSubmit) return true
    setIsSubmit(true)
    if (week?.week === undefined && week?.SCHEDULER_PERIOD === "W") {
      toast.error("Please select the week");
      setIsSubmit(false)
      return;
    }
    if (
      week?.SCHEDULER_WEEKLY_1_EVERY_WEEK === "0" &&
      week?.SCHEDULER_PERIOD === "W"
    ) {
      setisValueCheck(true)
      toast.error(" Please add number of weeks required");
      setIsSubmit(false)
      return;
    }
    if (
      SCHEDULER_DAILY_ONCE_EVERY_DAYS === "0" &&
      week?.SCHEDULER_PERIOD === "O"
    ) {
      setisValueCheck(true)
      toast.error(" Please add number of weeks required");
      setIsSubmit(false)
      return;
    }
    if (
      startEndDate?.SCHEDULER_DAILY_ONCE_EVERY?.key === "E" &&
      startEndDate.data.startDate === "00:00" &&
      startEndDate.SCHEDULER_PERIOD === "D"
    ) {
      toast.error("Select start date");
      setIsSubmit(false)
      return;
    }
    if (
      startEndDate?.SCHEDULER_DAILY_ONCE_EVERY?.key === "E" &&
      startEndDate.data.endDate === "00:00" &&
      startEndDate.SCHEDULER_PERIOD === "D"
    ) {
      toast.error("Select end date");
      setIsSubmit(false)
      return;
    }
    if (startEndDate?.SCHEDULER_DAILY_ONCE_EVERY?.key === "E" && startEndDate.SCHEDULER_PERIOD === "D" && !moment(startEndDate?.data.endDate).isAfter(startEndDate?.data.startDate)) {
      toast.error("Ending time should be more the starting time");
      setIsSubmit(false)
      return;
    }
    if (payload?.SCHEDULER?.RUN_AVG_DAILY == null
      || payload?.SCHEDULER?.RUN_AVG_DAILY == '') {
      payload.SCHEDULER.RUN_AVG_DAILY = 0;
    }
    // if (payload?.SCHEDULER?.RUN_AVG_DAILY == undefined || payload?.SCHEDULER?.RUN_AVG_DAILY == null
    //   || payload?.SCHEDULER?.RUN_AVG_DAILY == '') {
    //   payload.SCHEDULER.RUN_AVG_DAILY = 0;
    // }
    if (payload?.SCHEDULER?.RUN_THRESHOLD_MAIN_TRIGGER == null
      || payload?.SCHEDULER?.RUN_THRESHOLD_MAIN_TRIGGER == '') {
      payload.SCHEDULER.RUN_THRESHOLD_MAIN_TRIGGER = 0;
    }
    // if (payload?.SCHEDULER?.RUN_THRESHOLD_MAIN_TRIGGER == undefined || payload?.SCHEDULER?.RUN_THRESHOLD_MAIN_TRIGGER == null
    //   || payload?.SCHEDULER?.RUN_THRESHOLD_MAIN_TRIGGER == '') {
    //   payload.SCHEDULER.RUN_THRESHOLD_MAIN_TRIGGER = 0;
    // }
    try {
      const schedulerData = payload.SCHEDULER;
      const updatedTaskList: any = payload?.SCHEDULER?.SCHEDULE_TASK_D?.filter(
        (task: any) => task.isChecked === true
      );
      const tasksWithoutIsChecked = updatedTaskList.map(
        ({ isChecked, ...rest }: any) => rest
      );
      schedulerData.ASSET_NONASSET = payload?.ASSET_NONASSET?.key;
      schedulerData.MAKE_ID =
        schedulerData.ASSET_NONASSET === "A" ? payload.MAKE?.MAKE_ID : "";
      schedulerData.MODEL_ID =
        schedulerData.ASSET_NONASSET === "A" ? payload?.MODEL?.MODEL_ID : "";
      schedulerData.SCHEDULE_NAME = payload?.SCHEDULER.SCHEDULE_NAME;
      schedulerData.ASSETTYPE_ID = payload?.TYPE?.ASSETTYPE_ID;

      schedulerData.FREQUENCY_TYPE =
        schedulerData?.PERIOD?.FREQUENCY_TYPE || "";
      schedulerData.PERIOD = schedulerData?.PERIOD?.VALUE || "";
      schedulerData.DAILY_ONCE_EVERY =
        schedulerData?.DAILY_ONCE_EVERY?.key || "";
      schedulerData.MONTHLY_2_WEEK_NUM =
        schedulerData?.MONTHLY_2_WEEK_NUM?.MONTHLY_2_WEEK_NUM || "0";
      schedulerData.MONTHLYONCETWICE = schedulerData?.MONTHLYONCETWICE?.key;
      schedulerData.MODE = !!payload.SCHEDULE_ID ? "E" : "A";
      schedulerData.REQ_ID = payload?.REQ_ID?.REQ_ID;

      const timeConvert = [
        "DAILY_ONCE_AT_TIME",
        "DAILY_EVERY_STARTAT",
        "DAILY_EVERY_ENDAT",
        "WEEKLY_1_PREFERED_TIME",
        "MONTHLY_1_PREFERED_TIME",
        "MONTHLY_2_WEEK_PREFERED_TIME",
        "MONTHLY_2ND_PREFERED_TIME",
      ];

      timeConvert.forEach((elem: any) => {
        if (moment(schedulerData[elem])?.isValid()) {
          schedulerData[elem] = moment(schedulerData[elem]).format("HH:mm");
        }
      });

      schedulerData.MONTH_OPTION =
        schedulerData?.MONTH_OPTION?.MONTH_OPTION || "";
      schedulerData.SCHEDULE_TASK_D = tasksWithoutIsChecked
        ? tasksWithoutIsChecked
        : [];

      const schedulerPayload: any = {
        ...payload?.SCHEDULER,
        // ASSETTYPE_ID: payload?.TYPE?.ASSETTYPE_ID,
        ASSET_NONASSET: payload?.ASSET_NONASSET.key,
        PARA: props?.selectedData
          ? { para1: `${props?.headerName}`, para2: "Updated" }
          : { para1: `${props?.headerName}`, para2: "Added" },
      };
      delete payload?.MAKE;
      delete payload?.MODEL;
      delete payload?.SOFT_SERVICE;
      delete payload?.ASSETTYPE;
      delete payload?.TYPE;
      delete payload?.SCHEDULE_NAME;
      delete payload?.ASSET_NONASSET;
      delete payload?.REQ_ID;

      const res1 = await callPostAPI(ENDPOINTS.SCHEDULE_SAVE, schedulerPayload);
      payload.SCHEDULE_ID = res1?.SCHEDULE_ID;
      if (res1.FLAG === true) {
        toast?.success(res1?.MSG);
        const notifcation: any = {
          FUNCTION_CODE: currentMenu?.FUNCTION_CODE,
          EVENT_TYPE: "S",
          STATUS_CODE: search === '?edit=' ? 2 : 1,
          "PARA1": search === "?edit=" ? User_Name : User_Name,
          "PARA2": schedulerPayload?.SCHEDULE_NAME
        };
        const eventPayload = { ...eventNotification, ...notifcation };
        await helperEventNotification(eventPayload);
        props?.getAPI();
        props?.isClick();
      } else {
        toast?.error(res1?.MSG);
      }
    } catch (error: any) {

      toast?.error(error);
    } finally {
      setIsSubmit(false)
    }
  };

  //const reqWatch: any = watch("REQ_ID")
  const getRequestList = async (ASSETGROUP_ID: any, ASSET_NONASSET?: any, reqId?: any) => {
    const payload: any = {
      ASSETGROUP_ID: ASSETGROUP_ID,
      ASSET_NONASSET: ASSET_NONASSET
    };

    const res = await callPostAPI(
      ENDPOINTS.GET_SERVICEREQUEST_WORKORDER,
      payload, null
    );

    if (res?.FLAG === 1) {
      setIssueList(res?.WOREQLIST)
      if (search === "?edit=") {
        setSelectedIssue(reqId)
      }
    } else {
      setIssueList([])
    }
  }

  useEffect(() => {
    setIssueList([])
    setValue("REQ_ID", "")
    setValue("TYPE", null);
  }, [ASSET_NONASSET])

  useEffect(() => {
    (async function () {
      await getOptions();
      await saveTracker(currentMenu)
    })();
  }, [selected]);

  const getTaskList = async () => {
    try {
      if (watchAll?.TYPE?.ASSETTYPE_ID) {
        const payload = {
          ASSETTYPE_ID: watchAll?.TYPE?.ASSETTYPE_ID,
        };

        const res = await callPostAPI(ENDPOINTS.TASK_LIST, payload);

        setTask(res?.TASKLIST);
      }
    } catch (error) { }
  };
  useEffect(() => {
    (async function () { await getTaskList() })();
  }, [watchAll?.TYPE]);

  useEffect(() => {
    const nestedErrors: any = errors?.SCHEDULER || {};
    const firstError: any = Object?.values(nestedErrors)[0];
    if (
      !isSubmitting &&
      (Object?.values(errors)[0]?.type === "required" ||
        Object?.values(errors)[0]?.type === "validate")
    ) {
      const check: any = Object?.values(errors)[0]?.message;
      toast?.error(t(check));
    } else if (
      !isSubmitting &&
      (firstError?.type === "required" || firstError?.type === "validate")
    ) {
      const check: any = firstError?.message;
      toast?.error(t(check));
    }
  }, [isSubmitting]);
  return (
    <section className="w-full">
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormHeader
          headerName={props?.headerName}
          isSelected={props?.selectedData ? true : false}
          isClick={props?.isClick}
          IsSubmit={IsSubmit}
        />
        <Card className="mt-2">
          <div className="mt-1 grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-3 lg:grid-cols-3">
            <Field
              controller={{
                name: "SCHEDULER.SCHEDULE_NAME",
                control: control,
                render: ({ field }: any) => {
                  return (
                    <InputField
                      {...register("SCHEDULER.SCHEDULE_NAME", {
                        required: "Please fill the required fields.",
                        validate: value => value.trim() !== "" || "Please fill the required fields."
                      })}
                      label="Schedule Name"
                      require={true}
                      invalid={errors?.SCHEDULER?.SCHEDULE_NAME}
                      {...field}
                    />
                  );
                },
              }}
            />
            <Field
              controller={{
                name: "ASSET_NONASSET",
                control: control,
                render: ({ field }: any) => {
                  return (
                    <>
                      <Radio
                        {...register("ASSET_NONASSET", {
                          required: "Please fill the required fields",
                          onChange: (() => {
                            setIssueList([]);
                            setValue("REQ_ID", "")
                            setValue("TYPE", null);
                          })
                        })}
                        labelHead="Type"
                        require={true}
                        options={assestTypeLabel}
                        selectedData={
                          props?.selectedData?.ASSET_NONASSET || "A"
                        }
                        setValue={setValue}
                        {...field}
                      />
                    </>
                  );
                },
              }}
            />

            <Field
              controller={{
                name: "TYPE",
                control: control,
                render: ({ field }: any) => {
                  return (
                    <Select
                      options={
                        ASSET_NONASSET?.key === "A"
                          ? assetData
                          : softService
                      }
                      {...register("TYPE", {
                        required: "Please fill the required fields",
                        onChange: async (e: any) => {
                          await getRequestList(
                            e?.target?.value?.ASSETGROUP_ID,
                            e?.target?.value?.ASSETTYPE
                          );
                        },
                      })}
                      label={
                        ASSET_NONASSET?.key === "A"
                          ? "Equipment Type"
                          : "Soft Service Type"
                      }
                      optionLabel="ASSETTYPE_NAME"
                      findKey={"ASSETTYPE_ID"}
                      require={true}
                      selectedData={selectedDetails?.ASSETTYPE_ID}
                      setValue={setValue}
                      invalid={errors.TYPE}
                      {...field}
                    />
                  );
                },
              }}
            />

            {ASSET_NONASSET?.key === "A" ? (
              <>
                <Field
                  controller={{
                    name: "MAKE",
                    control: control,
                    render: ({ field }: any) => {
                      return (
                        <Select
                          options={options?.assetMake}
                          {...register("MAKE", {
                          })}
                          label="Make"
                          optionLabel="MAKE_NAME"
                          findKey={"MAKE_ID"}
                          // require={true}
                          selectedData={selectedDetails?.MAKE_ID}
                          setValue={setValue}
                          // invalid={errors.MAKE}
                          {...field}
                        />
                      );
                    },
                  }}
                />
                <Field
                  controller={{
                    name: "MODEL",
                    control: control,
                    render: ({ field }: any) => {
                      return (
                        <Select
                          options={options?.assetModel}
                          {...register("MODEL", {
                          })}
                          label="Model"
                          optionLabel="MODEL_NAME"
                          findKey={"MODEL_ID"}
                          selectedData={selectedDetails?.MODEL_ID}
                          setValue={setValue}
                          {...field}
                        />
                      );
                    },
                  }}
                />
              </>
            ) : (
              ""
            )}

            <Field
              controller={{
                name: "REQ_ID",
                control: control,
                render: ({ field }: any) => {
                  return (
                    <Select
                      options={issueList}
                      //options={[]}
                      {...register("REQ_ID", {
                        required: "Please fill the required fields",
                      })}
                      label={"Issue"}
                      optionLabel="REQ_DESC"
                      findKey={"REQ_ID"}
                      require={true}
                      selectedData={selectedIssue}
                      setValue={setValue}
                      invalid={errors.REQ_ID}
                      {...field}
                    />
                  );
                },
              }}
            />
          </div>

        </Card>

        <AssetSchedule
          control={control}
          errors={errors}
          setValue={setValue}
          invalid={errors}
          watch={watch}
          watchAll={watchAll}
          register={register}
          // selectedData={selectedScheduleTaskDetails}
          resetField={resetField}
          // scheduleTaskList={scheduleTaskList}
          scheduleId={props?.selectedData ? props?.selectedData?.SCHEDULE_ID : search === '?edit=' ? dataId?.SCHEDULE_ID : 0}
          getValues={getValues}
          isSubmitting={isSubmitting}
          // setEditStatus={setEditStatus}
          // setEditData={setEditData}
          AssetSchedule={false}
          scheduleData={scheduleData}
          task={task}
          setWeek={setWeek}
          require={true}
          setStartEndDate={setStartEndDate}
          isValueCheck={isValueCheck}
          setisValueCheck={setisValueCheck}
        />
      </form>
    </section>
  );
};

export default AssetScheduleMasterForm;
