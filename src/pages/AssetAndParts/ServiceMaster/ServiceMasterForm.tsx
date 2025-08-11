import { useFieldArray, useForm } from "react-hook-form";
import React, { useCallback, useEffect, useState } from "react";
import InputField from "../../../components/Input/Input";
import Buttons from "../../../components/Button/Button";
import { Card } from "primereact/card";
import DateCalendar from "../../../components/Calendar/Calendar";
import Select from "../../../components/Dropdown/Dropdown";
import Field from "../../../components/Field";
import Checkboxs from "../../../components/Checkbox/Checkbox";
import DocumentUpload from "../../../components/pageComponents/DocumentUpload/DocumentUpload";
import AssetSchedule from "../../../components/pageComponents/AssetSchedule/AssetScheduleForm";
import { ENDPOINTS } from "../../../utils/APIEndpoints";
import { callPostAPI } from "../../../services/apis";
import "../../../components/Table/Table.css";
import "../../../components/DialogBox/DialogBox.css";
import moment from "moment";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import {
  helperNullDate,
  saveTracker,
} from "../../../utils/constants";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import { InputTextarea } from "primereact/inputtextarea";
import { eventNotification, helperEventNotification } from "../../../utils/eventNotificationParameter";
import { appName } from "../../../utils/pagePath";
import { decryptData } from "../../../utils/encryption_decryption";


const ServiceMasterForm = (props: any) => {
  const { search } = useLocation();
  const navigate = useNavigate();
  const location: any = useLocation();
  const { t } = useTranslation();
  const [options, setOptions] = useState<any>({});
  const [selectedDetails, setSelectedDetails] = useState<any>([]);

  const [scheduleTaskList, setScheduleTaskList] = useState([]);
  const [editStatus, setEditStatus] = useState<any | null>(false);
  const [schedId, setScheId] = useState<any | null>(0)
  // const [, setEditData] = useState<any | null>([]);
  //const [selectedTaskDetailsList, setSelectedTaskDetailsList] = useState([]);
  const [typeList, setTypeList] = useState<any | null>([]);
  const [Descriptionlength, setDescriptionlength] = useState(0);

  const [issueList, setIssueList] = useState<any | null>([])
  const [selectedScheduleTaskDetails, setSelectedScheduleTaskDetails] =
    useState<any>();
  const [assetTypeState, setAssetTypeState] = useState<any | null>(false)
  const [IsSubmit, setIsSubmit] = useState<any | null>(false);
  const [selectedSchedule, setSelectedSchedule] = useState<any | null>(null)
  // const[idSchedule, setIdSchedule]=useState<any|null>(null)
  const getId: any = localStorage.getItem("Id");
  const assetId: any = JSON.parse(getId);
  let { pathname } = useLocation();
  const [, menuList]: any = useOutletContext();
  const currentMenu = menuList
    ?.flatMap((menu: any) => menu?.DETAIL)
    .filter((detail: any) => detail.URL === pathname)[0];
  const handleInputChange = (event: any) => {
    const value = event.target.value;
    setDescriptionlength(value.length);
  };
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
      LOCATION: "",
      ASSET_CODE: props?.selectedData?.ASSET_CODE || "",
      ASSET_NAME: props?.selectedData?.NAME || "",
      GROUP: "",
      TYPE: null,
      BAR_CODE: "",
      CURRENT_STATE: "",
      ACTIVE:
        props?.selectedData?.ACTIVE !== undefined
          ? props?.selectedData?.ACTIVE
          : true,
      ASSET_DESC: "",
      UNDERAMC: props?.selectedData ? props?.selectedData?.UNDERAMC : assetId?.UNDERAMC,
      AMC_EXPIRY_DATE: "",
      AMC_VENDOR: "",
      ASSET_COST: 0,
      VENDOR_NAME: "",
      COMMISSIONING_DATE: "",
      ASSET: "",
      CAPACITY_SIZE: "",
      SERIAL_NUMBER: "",
      BENCHMARK_VALUE: 0,
      MTBF_HOURS: 0,
      ASSET_ID:
        props?.selectedData === null
          ? assetId?.ASSET_ID
          : props?.selectedData?.ASSET_ID,
      MODE: props?.selectedData || search === "?edit=" ? "E" : "A",
      ASSET_NONASSET: "N",
      PARA:
        props?.selectedData || search === "?edit="
          ? { para1: `${props?.headerName}`, para2: t("Updated") }
          : { para1: `${props?.headerName}`, para2: t("Added") },
      SCHEDULE_ID: 0,
      SCHEDULER: {
        ASSET_NONASSET: "N",
        MODE: "A",
        TEAM_LEAD_ID: 0,
        TEAM_ID: 0,
        SCHEDULE_ID:
          props?.selectedData === null
            ? assetId?.SCHEDULE_ID
            : props?.selectedData?.SCHEDULE_ID,
        SCHEDULE_NAME: selectedScheduleTaskDetails?.SCHEDULE_NAME || null,
        FREQUENCY_TYPE: "",
        PERIOD: "",
        Record: "",
        DAILY_ONCE_EVERY: "O",
        DAILY_ONCE_AT_TIME: "00:00",
        DAILY_ONCE_EVERY_DAYS: 0,
        DAILY_EVERY_PERIOD: 0,
        DAILY_EVERY_PERIOD_UOM: "H",
        DAILY_EVERY_STARTAT: "00:00",
        DAILY_EVERY_ENDAT: "00:00",
        WEEKLY_1_WEEKDAY: "0",
        WEEKLY_1_EVERY_WEEK: "0",
        WEEKLY_1_PREFERED_TIME: "00:00",
        WEEKLY_2_WEEKDAY: "0",
        WEEKLY_2_EVERY_WEEK: "0",
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
      TASK_ID: "",
      SKILL_NAME: "",
      SHOW_ACTUALTIME: "",
      EXTRA_COL_LIST: [""],

      DOC_LIST: [],
    },
    mode: "all",
  });
  const User_Name = decryptData((localStorage.getItem("USER_NAME")))
  const watchAll: any = watch();
  const MANINTENANCE: any = watch("UNDERAMC");
  const onSubmit = useCallback(async (payload: any) => {
    if (IsSubmit) return true
    setIsSubmit(true)
    let schedule_id: any = "0"
    try {
      if (!payload.SCHEDULE_ID || editStatus) {
        const schedulerData = payload.SCHEDULER;
        const updatedTaskList: any =
          payload?.SCHEDULER?.SCHEDULE_TASK_D?.filter(
            (task: any) => task.isChecked === true
          );
        const tasksWithoutIsChecked = updatedTaskList.map(
          ({ isChecked, ...rest }: any) => rest
        );

        schedulerData.ASSET_NONASSET = "N";

        schedulerData.MAKE_ID = payload?.MAKE_ID;
        schedulerData.MODEL_ID = payload?.MODEL_ID;
        schedulerData.FREQUENCY_TYPE =
          schedulerData?.PERIOD?.FREQUENCY_TYPE || "";
        schedulerData.PERIOD = schedulerData?.PERIOD?.VALUE || "";
        schedulerData.DAILY_ONCE_EVERY =
          schedulerData?.DAILY_ONCE_EVERY?.key || "";
        schedulerData.MONTHLY_2_WEEK_NUM =
          schedulerData?.MONTHLY_2_WEEK_NUM?.MONTHLY_2_WEEK_NUM || "0";
        schedulerData.MONTHLYONCETWICE = schedulerData?.MONTHLYONCETWICE?.key;
        schedulerData.MODE = !!payload.SCHEDULE_ID ? "E" : "A";
        const timeConvert = [
          "DAILY_ONCE_AT_TIME",
          "DAILY_EVERY_STARTAT",
          "DAILY_EVERY_ENDAT",
          "WEEKLY_1_PREFERED_TIME",
          "MONTHLY_1_PREFERED_TIME",
          "MONTHLY_2_WEEK_PREFERED_TIME",
          "MONTHLY_2ND_PREFERED_TIME",
        ];

        timeConvert?.forEach((elem: any) => {
          if (moment(schedulerData[elem])?.isValid()) {
            schedulerData[elem] = moment(schedulerData[elem]).format("HH:mm");
          }
        });
        timeConvert.forEach((elem: any) => {
          if (moment(schedulerData[elem])?.isValid()) {
            schedulerData[elem] = moment(schedulerData[elem]).format("HH:mm");
          }
        });

        schedulerData.MONTH_OPTION =
          schedulerData?.MONTH_OPTION?.MONTH_OPTION || "";
        schedulerData.SCHEDULE_TASK_D =
          tasksWithoutIsChecked === false ? [] : tasksWithoutIsChecked;
        const schedulerPayload: any = {
          ...payload?.SCHEDULER,
          ASSETTYPE_ID: payload?.TYPE?.ASSETTYPE_ID,
          REQ_ID: schedulerData?.Record?.REQ_ID
        };

        if (schedulerData?.SCHEDULE_NAME !== null) {
          const res1 = await callPostAPI(
            ENDPOINTS.SCHEDULE_SAVE,
            schedulerPayload
          );
          schedule_id = res1?.SCHEDULE_ID;
        }
      }

      delete payload?.SCHEDULER;
      const updateColList: any = payload?.EXTRA_COL_LIST?.filter(
        (item: any) => item?.VALUE
      ).map((data: any) => ({
        [data?.FIELDNAME]: data?.VALUE,
      }));
      //  payload.SCHEDULE_ID = payload?.SCHEDULE_ID !== 0 ? payload?.SCHEDULE_ID : 0;
      payload.SCHEDULE_ID = selectedSchedule === null ? schedule_id : selectedSchedule;
      payload.EXTRA_COL_LIST = updateColList || [];
      payload.ACTIVE = payload?.ACTIVE === true ? 1 : 0;
      payload.LOCATION_ID = payload?.LOCATION?.LOCATION_ID;
      payload.ASSETGROUP_ID = payload?.GROUP?.ASSETGROUP_ID;
      payload.ASSETTYPE_ID = payload?.TYPE?.ASSETTYPE_ID;
      payload.MAKE_ID = "";
      payload.MODEL_ID = "";
      payload.UNDERAMC = payload.UNDERAMC === true ? 1 : 0;
      payload.CS_ID = payload?.CURRENT_STATE?.CS_ID;
      payload.VENDOR_ID = payload?.VENDOR_NAME?.VENDOR_ID || "";
      payload.OBEM_ASSET_ID = "";
      payload.OWN_LEASE = payload?.ASSET?.key || "";
      payload.AMC_VENDOR = payload?.UNDERAMC
        ? payload?.AMC_VENDOR?.VENDOR_ID
        : "";
      payload.AMC_EXPIRY_DATE = payload?.UNDERAMC
        ? moment(payload.AMC_EXPIRY_DATE).format("YYYY-MM-DD")
        : "";
      payload.COMMISSIONING_DATE = payload.COMMISSIONING_DATE
        ? moment(payload.COMMISSIONING_DATE).format("YYYY-MM-DD")
        : "";
      payload.WARRANTY_END_DATE = payload.WARREANTY_DATE
        ? moment(payload.WARREANTY_DATE).format("YYYY-MM-DD")
        : "";
      payload.LAST_MAINTANCE_DATE = payload.LAST_DATE
        ? moment(payload.LAST_DATE).format("YYYY-MM-DD")
        : "";

      delete payload?.LOCATION;
      delete payload?.GROUP;
      delete payload?.TYPE;
      delete payload?.MODEL;
      delete payload?.MAKE;
      delete payload?.CURRENT_STATE;
      delete payload?.VENDOR_NAME;
      delete payload?.LINK_OBEM;
      delete payload.LAST_DATE;
      delete payload?.WARREANTY_DATE;
      delete payload?.AMC_DATE;
      delete payload?.ASSET;
      payload.ASSET_ID = search === "?edit=" ? selectedDetails?.ASSET_ID : "";
      const res = await callPostAPI(ENDPOINTS.ASSETMASTER_SAVE, payload);
      if (res?.FLAG === true) {
        toast?.success(res?.MSG);
        const notifcation: any = {
          FUNCTION_CODE: currentMenu?.FUNCTION_CODE,
          "EVENT_TYPE": "M",
          "STATUS_CODE": search === "?edit=" ? 2 : 1,
          "PARA1": search === "?edit=" ? User_Name : User_Name,
          PARA2: payload?.ASSET_CODE,
          PARA3: payload?.ASSET_NAME,
          PARA4: watchAll?.GROUP?.ASSETGROUP_NAME,
          PARA5: watchAll?.TYPE?.ASSETTYPE_NAME,
          PARA6: payload?.UNDERAMC ? moment(payload.AMC_EXPIRY_DATE).format("YYYY-MM-DD") : "",
          PARA7: payload?.UNDERAMC
            ? payload?.AMC_VENDOR?.VENDOR_ID : "",
          // PARA8: "asset_nonasset",
        };

        const eventPayload = { ...eventNotification, ...notifcation };
        await helperEventNotification(eventPayload);
        if (location?.state === null) {
          props?.getAPI();

          props?.isClick();
        }
      } else {

        toast?.error(res?.MSG);
      }
      // } else {
      //   toast.error("Please select  schedule or create new schedule");
      // }
    } catch (error: any) {
      toast?.error(error);
    } finally {
      setIsSubmit(true)
    }
  }, [IsSubmit, props, selectedDetails, search, watchAll, location, currentMenu, eventNotification, User_Name, selectedSchedule])

  const { fields, append: colAppend } = useFieldArray({
    name: "EXTRA_COL_LIST",
    control,
  });
  const ASSET_DESCWatch: any = watch("ASSET_DESC")


  useEffect(() => {
    if (ASSET_DESCWatch)
      setDescriptionlength(ASSET_DESCWatch.length);
  }, [ASSET_DESCWatch]);



  const getScheduleList = async () => {
    try {
      if (watchAll?.TYPE?.ASSETTYPE_ID) {
        const payload = {
          ASSETTYPE_ID: watchAll?.TYPE?.ASSETTYPE_ID,
        };
        const res = await callPostAPI(ENDPOINTS.SCHEDULE_LIST, payload);
        setScheduleTaskList(res?.SCHEDULELIST);
        if (search === "?edit=") {
          setSelectedSchedule(res?.SCHEDULELIST[0]?.SCHEDULE_ID || 0)
          setValue("SCHEDULE_ID", res?.SCHEDULELIST[0]?.SCHEDULE_ID || 0);
          setValue("SCHEDULER.SCHEDULE_ID", res?.SCHEDULELIST[0]?.SCHEDULE_ID)
        }
      }
    } catch (error) { }
  };


  const getRequestList = async (ASSETGROUP_ID: any, ASSET_NONASSET?: any) => {
    const payload: any = {
      ASSETGROUP_ID: ASSETGROUP_ID,
      ASSET_NONASSET: ASSET_NONASSET?.key
        ? ASSET_NONASSET?.key
        : ASSET_NONASSET,
    };

    const res = await callPostAPI(
      ENDPOINTS.GET_SERVICEREQUEST_WORKORDER,
      payload, null
    );

    if (res?.FLAG === 1) {
      setIssueList(res?.WOREQLIST)
      if (search === "?edit=") {
        //  setSelectedIssue(reqId)
      }
    } else {
      setIssueList([])
    }
  }

  const getAssetDetails = async (columnCaptions: any, ASSET_ID?: any) => {

    const payload: any = {
      ASSET_NONASSET: "N",
      ASSET_ID:
        location?.state !== null
          ? ASSET_ID
          : props?.selectedData === null
            ? assetId?.ASSET_ID
            : props?.selectedData?.ASSET_ID,
    };

    try {

      const res = await callPostAPI(
        ENDPOINTS.ASSETMASTER_DETAILS,
        payload
      );

      if (res?.FLAG === 1) {
        setScheId(res?.ASSETDETAILSLIST[0]?.SCHEDULE_ID !== null ? res?.ASSETDETAILSLIST[0]?.SCHEDULE_ID : 0)
        await getRequestList(res?.ASSETDETAILSLIST[0]?.ASSETGROUP_ID, res?.ASSETDETAILSLIST[0]?.ASSET_NONASSET)

        const configList = res.CONFIGLIST[0];
        for (let key in configList) {
          if (configList[key] === null) {
            delete configList[key];
          }
        }

        const previousColumnCaptions: any = columnCaptions.map((item: any) => ({
          ...item,
          VALUE: configList[item.FIELDNAME],
        }));
        colAppend(previousColumnCaptions);
        const amcDate: any = helperNullDate(
          res?.ASSETDETAILSLIST[0]?.AMC_EXPIRY_DATE
        );

        // const lastDate: any = helperNullDate(
        //   res?.ASSETDETAILSLIST[0]?.LAST_MAINTANCE_DATE
        // );
        const commissioningDate: any = helperNullDate(
          res?.ASSETDETAILSLIST[0]?.COMMISSIONING_DATE
        );
        // const warrantyDate: any = helperNullDate(
        //   res?.ASSETDETAILSLIST[0]?.WARRANTY_END_DATE
        // );
        setSelectedDetails(res?.ASSETDETAILSLIST[0]);

        setSelectedScheduleTaskDetails(res?.SCHEDULELIST[0]);
        // setSelectedTaskDetailsList(res?.SCHEDULETASKLIST);
        setValue("DOC_LIST", res?.ASSETDOCLIST);
        setValue("ASSET_CODE", res?.ASSETDETAILSLIST[0]?.ASSET_CODE);
        setValue("BAR_CODE", res?.ASSETDETAILSLIST[0]?.BAR_CODE);
        setValue("ASSET_NAME", res?.ASSETDETAILSLIST[0]?.ASSET_NAME);
        setValue("CAPACITY_SIZE", res?.ASSETDETAILSLIST[0]?.CAPACITY_SIZE);
        setValue("SERIAL_NUMBER", res?.ASSETDETAILSLIST[0]?.SERIAL_NUMBER);
        setValue("ASSET_COST", res?.ASSETDETAILSLIST[0]?.ASSET_COST);
        setValue("BENCHMARK_VALUE", res?.ASSETDETAILSLIST[0]?.BENCHMARK_VALUE);
        setValue("MTBF_HOURS", res?.ASSETDETAILSLIST[0]?.MTBF_HOURS);
        setValue("AMC_EXPIRY_DATE", amcDate);
        setValue("ASSET_DESC", res?.ASSETDETAILSLIST[0]?.ASSET_DESC);
        setValue("COMMISSIONING_DATE", commissioningDate);
        setValue("SCHEDULER.SCHEDULE_TASK_D", res?.SCHEDULETASKLIST);
        setValue("UNDERAMC", res?.ASSETDETAILSLIST[0]?.UNDERAMC);
        setValue("AMC_VENDOR", res?.VENDORELIST[0]?.VENDOR_NAME);
        setValue("SCHEDULE_ID", props?.selectedData?.SCHEDULE_ID || 0);
      }
    } catch (error: any) {
      toast?.error(error);
    } finally {

    }
  };


  const getOptions = async () => {
    const payload = {
      ASSETTYPE: "N",
    };
    try {

      const res = await callPostAPI(
        ENDPOINTS.GETASSETMASTEROPTIONS,
        payload

      );

      const res1 = await callPostAPI(ENDPOINTS.LOCATION_HIERARCHY_LIST, null, "AS0010");
      setOptions({
        assetGroup: res?.ASSESTGROUPLIST,
        assetType: res?.ASSESTTYPELIST,
        assetMake: res?.MAKELIST,
        assetModel: res?.MODELLIST,
        unit: res?.UOMLIST,
        currentState: res?.CURRENTSTATUSLIST,
        obemList: res?.OBMASSETLIST,
        vendorList: res?.VENDORELIST,
        location: res1?.LOCATIONHIERARCHYLIST,
        configList: res?.CONFIGLIST,
      });


      const columnCaptions = res?.CONFIGLIST.map((item: any) => ({
        FIELDNAME: item.FIELDNAME,
        LABEL: item?.COLUMN_CAPTION,
        VALUE: "",
      }));

      if (res?.FLAG === 1) {
        if (search === "?edit=") {

          if (location?.state !== null) {
            await getAssetDetails(columnCaptions, location?.state?.ASSET_ID);
          } else { await getAssetDetails(columnCaptions); }
        } else {
          colAppend(columnCaptions);
        }
      }
    } catch (error) { }
    finally {

    }
  };

  const selectedLocationTemplate = (option: any, props: any) => {
    if (option) {
      return (
        <div className="flex align-items-center">
          <div>{option.LOCATION_DESCRIPTION}</div>
        </div>
      );
    }

    return <span>{props.placeholder}</span>;
  };

  const locationOptionTemplate = (option: any) => {
    return (
      <div className="align-items-center">
        <div className="Text_Primary Input_Label">{option.LOCATION_NAME}</div>
        <div className=" Text_Secondary Helper_Text">
          {option.LOCATION_DESCRIPTION}
        </div>
      </div>
    );
  };
  const handlerShowService = () => {
    navigate(`${appName}/servicerequestlist?edit=`, { state: location?.state?.WO_ID });
  };
  useEffect(() => {
    if (watchAll?.GROUP) {
      const assetTypeList: any = options?.assetType?.filter(
        (f: any) => f.ASSETGROUP_ID === watchAll?.GROUP?.ASSETGROUP_ID
      );
      setTypeList(assetTypeList);
    }
  }, [watchAll?.GROUP]);
  useEffect(() => {
    if (watchAll?.TYPE !== null) {
      (async function () {
        if (currentMenu || location.state !== null) {
          await getScheduleList();

        }
      })();

    }
    // getTaskList()
  }, [watchAll?.TYPE]);

  useEffect(() => {
    (async function () {
      if (currentMenu || location.state !== null) {
        await getOptions();
        await saveTracker(currentMenu)
      }
    })();
  }, []);

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

  // if (loading) {
  //   return <LoaderS />
  // }

  return (
    <>
      <section className="w-full">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex justify-between mt-1">
            <div>
              <h6 className="Text_Primary">
                {t(`${search === "?edit=" ? "Edit" : "Add"}`)}{" "}
                {props?.headerName}{" "}
              </h6>
            </div>
            <div className="flex">
              {location?.state !== null && (
                <Buttons
                  type="submit"
                  className="Primary_Button   me-2"
                  label={"Show Service Request"}
                  onClick={() => handlerShowService()}
                />
              )}
              <Buttons
                type="submit"
                className="Primary_Button  w-20 me-2"
                disabled={IsSubmit}
                label={"Save"}
              />
              <Buttons
                className="Secondary_Button w-20 "
                label={"List"}
                onClick={props?.isClick}
              />
            </div>
          </div>

          <Card className="mt-2">
            <div className="headingConainer">
              <p>{t("Service Details")}</p>
            </div>
            <div className="mt-1 grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-3 lg:grid-cols-3">
              <Field
                controller={{
                  name: "LOCATION",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <Select
                        options={options?.location}
                        {...register("LOCATION", {
                          required: t("Please fill the required fields."),
                        })}
                        label="Location"
                        require={true}
                        optionLabel="LOCATION_NAME"
                        valueTemplate={selectedLocationTemplate}
                        itemTemplate={locationOptionTemplate}
                        invalid={errors.LOCATION}
                        filter
                        findKey={"LOCATION_ID"}
                        selectedData={selectedDetails?.LOCATION_ID}
                        setValue={setValue}
                        {...field}
                      />
                    );
                  },
                }}
              />
              <Field
                controller={{
                  name: "ASSET_CODE",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <InputField
                        {...register("ASSET_CODE", {})}
                        label="Code"
                        disabled={props.selectedData ? true : false}
                        {...field}
                      />
                    );
                  },
                }}
              />
              <Field
                controller={{
                  name: "ASSET_NAME",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <InputField
                        {...register("ASSET_NAME", {
                          required: t("Please fill the required fields."),
                        })}
                        label="Name"
                        require={true}
                        invalid={errors.ASSET_NAME}
                        {...field}
                      />
                    );
                  },
                }}
                error={errors?.ASSET_NAME?.message}
              />
              <Field
                controller={{
                  name: "GROUP",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <Select
                        options={options?.assetGroup}
                        {...register("GROUP", {
                          required: t("Please fill the required fields."),
                          onChange: async (e: any) => {

                            await getRequestList(
                              e?.target?.value?.ASSETGROUP_ID,
                              e?.target?.value?.ASSETGROUP_TYPE

                            );
                          },
                        })}
                        label="Group"
                        require={true}
                        optionLabel="ASSETGROUP_NAME"
                        invalid={errors.GROUP}
                        findKey={"ASSETGROUP_ID"}
                        selectedData={selectedDetails?.ASSETGROUP_ID}
                        setValue={setValue}
                        {...field}
                      />
                    );
                  },
                }}
                error={errors?.GROUP?.message}
              />
              <Field
                controller={{
                  name: "TYPE",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <Select
                        options={typeList}
                        {...register("TYPE", {
                          required: t("Please fill the required fields."),
                          onChange: () => {
                            setAssetTypeState(true)
                            // setIdSchedule(0)
                          }
                        })}
                        label="Type"
                        // require={true}
                        optionLabel="ASSETTYPE_NAME"
                        require={true}
                        invalid={errors.TYPE}
                        findKey={"ASSETTYPE_ID"}
                        selectedData={selectedDetails?.ASSETTYPE_ID}
                        setValue={setValue}
                        {...field}
                      />
                    );
                  },
                }}
              />
              <div className="col-span-1">
                <label className="Text_Secondary Input_Label">{t("Description")}</label>
                <Field
                  controller={{
                    name: "ASSET_DESC",
                    control: control,
                    render: ({ field }: any) => {
                      return (
                        <InputTextarea
                          {...register("ASSET_DESC", {
                            onChange: (e: any) => handleInputChange(e),
                          })}
                          // label="Description"
                          maxLength={400}
                          setValue={setValue}
                          {...field}
                        />
                      );
                    },
                  }}
                />
                <label className={` ${Descriptionlength === 400 ? "text-red-600" : "Text_Secondary"} Helper_Text`}>
                  {t(`Up to ${Descriptionlength}/400 characters.`)}
                </label>
              </div>
              <div className="flex align-items-center gap-4">
                <Field
                  controller={{
                    name: "UNDERAMC",
                    control: control,
                    render: ({ field }: any) => {
                      return (
                        <Checkboxs
                          {...register("UNDERAMC")}
                          checked={selectedDetails?.UNDERAMC === true ? true : false}
                          className={`${MANINTENANCE && "md:mt-7"}`}
                          label="Maintenance"
                          setValue={setValue}
                          {...field}
                        />
                      );
                    },
                  }}
                  error={errors?.UNDERAMC?.message}
                />
                <Field
                  controller={{
                    name: "ACTIVE",
                    control: control,
                    render: ({ field }: any) => {
                      return (
                        <Checkboxs
                          {...register("ACTIVE")}
                          checked={props?.selectedData?.ACTIVE || false}
                          className={`${MANINTENANCE && "md:mt-7"}`}
                          label="Active"
                          setValue={setValue}
                          {...field}
                        />
                      );
                    },
                  }}
                  error={errors?.ACTIVE?.message}
                />
              </div>
              {MANINTENANCE && (
                <>
                  <Field
                    controller={{
                      name: "AMC_EXPIRY_DATE",
                      control: control,
                      render: ({ field }: any) => {
                        return (
                          <DateCalendar
                            {...register("AMC_EXPIRY_DATE", {
                              required:
                                MANINTENANCE === true
                                  ? t("Please Fill the Required Fields.")
                                  : "",
                            })}
                            label="AMC Expiry Date"
                            require={MANINTENANCE === true ? true : false}
                            showIcon
                            setValue={setValue}
                            invalid={
                              MANINTENANCE === true
                                ? errors?.AMC_EXPIRY_DATE
                                : ""
                            }
                            {...field}
                          />
                        );
                      },
                    }}
                    error={errors?.AMC_EXPIRY_DATE?.message}
                  />
                  <Field
                    controller={{
                      name: "AMC_VENDOR",
                      control: control,
                      render: ({ field }: any) => {
                        return (
                          <Select
                            options={options?.vendorList}
                            {...register("AMC_VENDOR", {
                              required:
                                MANINTENANCE === true
                                  ? t("Please fill the required fields.")
                                  : "",
                            })}
                            label="AMC Vendor"
                            optionLabel="VENDOR_NAME"
                            invalid={
                              MANINTENANCE === true ? errors.AMC_VENDOR : ""
                            }
                            findKey={"VENDOR_ID"}
                            require={MANINTENANCE === true ? true : false}
                            selectedData={selectedDetails?.AMC_VENDOR}
                            setValue={setValue}
                            //invalid={MANINTENANCE === true? errors?.AMC_VENDOR:""}
                            {...field}
                          />
                        );
                      },
                    }}
                    error={errors?.AMC_VENDOR?.message}
                  />
                </>
              )}
            </div>
          </Card>
          <AssetSchedule
            errors={errors}
            setValue={setValue}
            watchAll={watchAll}
            register={register}
            control={control}
            resetField={resetField}
            scheduleTaskList={scheduleTaskList}
            scheduleId={search === '?edit=' && assetTypeState === true ? 0 : search === '?edit=' ? schedId : 0}
            getValues={getValues}
            setEditStatus={setEditStatus}
            isSubmitting={isSubmitting}
            AssetSchedule={true}
            issueList={issueList}
            setScheduleTaskList={setScheduleTaskList}
            setAssetTypeState={setAssetTypeState}
            assetTypeState={assetTypeState}
            setSelectedSchedule={setSelectedSchedule}
          />
          <Card className="mt-2 ">
            <DocumentUpload
              register={register}
              // handleSubmit ={handleSubmit}
              control={control}
              setValue={setValue}
              watch={watch}
              getValues={getValues}
              errors={errors}

            />
          </Card>

          <Card className="mt-2">
            <div className="headingConainer">
              <p>Other Details</p>
            </div>
            <div className="mt-1 grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-3 lg:grid-cols-3">
              <Field
                controller={{
                  name: "ASSET_COST",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <InputField
                        {...register("ASSET_COST", {
                          validate: (fieldValue: any) => {
                            const sanitizedValue = fieldValue
                              ?.toString()
                              ?.replace(/[^0-9]/g, "");

                            setValue("BENCHMARK_VALUE", sanitizedValue);
                            return true;
                          },
                        })}
                        label="Approximate Cost"
                        // invalid={errors.ASSET_COST}
                        {...field}
                      />
                    );
                  },
                }}
              />
              <Field
                controller={{
                  name: "VENDOR_NAME",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <Select
                        options={options?.vendorList}
                        {...register("VENDOR_NAME", {
                        })}
                        label="Vendor Name"
                        optionLabel="VENDOR_NAME"
                        findKey={"VENDOR_ID"}
                        selectedData={selectedDetails?.VENDOR_ID}
                        setValue={setValue}
                        {...field}
                      />
                    );
                  },
                }}
              />
              <Field
                controller={{
                  name: "COMMISSIONING_DATE",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <DateCalendar
                        {...register("COMMISSIONING_DATE", {})}
                        label={t("Commissioning Date")}
                        showIcon
                        setValue={setValue}
                        {...field}
                      />
                    );
                  },
                }}
              />
              {fields.map((arrayField: any, index: number) => {
                return (
                  <React.Fragment key={arrayField?.FIELDNAME}>
                    <div>
                      <Field
                        controller={{
                          name: `EXTRA_COL_LIST.${index}.VALUE`,
                          control: control,
                          render: ({ field }: any) => {
                            return (
                              <InputField
                                {...register(`EXTRA_COL_LIST.${index}`, {})}
                                label={arrayField?.LABEL}
                                placeholder={"Please Enter"}
                                {...field}
                              />
                            );
                          },
                        }}
                      />
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </Card>
        </form>
      </section>
    </>
  );
};

export default ServiceMasterForm;

