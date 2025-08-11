import React, { useCallback, useEffect, useRef, useState } from "react";
import InputField from "../../../components/Input/Input";
import { Card } from "primereact/card";
import { useForm } from "react-hook-form";
import Field from "../../../components/Field";
import Checkboxs from "../../../components/Checkbox/Checkbox";
import Select from "../../../components/Dropdown/Dropdown";
import MultiSelects from "../../../components/MultiSelects/MultiSelects";
import { useTranslation } from "react-i18next";
import { InputTextarea } from "primereact/inputtextarea";
import "../Event/EventMaster.css";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { toast } from "react-toastify";
import { callPostAPI } from "../../../services/apis";
import { ENDPOINTS } from "../../../utils/APIEndpoints";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import FormHeader from "../../../components/FormHeader/FormHeader";
import { saveTracker } from "../../../utils/constants";
import { PATH } from "../../../utils/pagePath";
import sanitizeHtml from "sanitize-html";
import { validation } from "../../../utils/validation";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const EventMasterForm = (props: any) => {
  const location: any = useLocation();
  const navigate: any = useNavigate();
  const { search } = useLocation();
  const getId: any = localStorage.getItem("Id");
  const dataId = JSON.parse(getId);
  const [selectedDetails, setSelectedDetails] = useState<any>([]);
  const [options, setOptions] = useState<any | null>([]);
  const [eventOptions, setEventOptions] = useState<any | null>([]);
  const [paraOption, setParaOption] = useState<any | null>([]);
  const [eventType, setEventType] = useState("");
  const [showWorkOrderRoleStatus, setShowWorkOrderRoleStatus] = useState(true);
  const [IsSubmit, setIsSubmit] = useState(false);
  const [codeStatus, setCodeStatus] = useState<any | null>(null);
  const [subStatusList, setSubStatusList] = useState<any | null>([]);
  const [SEND_APP_TEXT, setAppValue] = useState("");
  const [redirectApprovalStatus, setRedirectApprovalStatus] = useState<
    any | null
  >(false);
  const [approveStatus, setApproveStatus] = useState<any | null>(false);
  const [functionCode, setFunctionCode] = useState<any | null>(null);
  const [approveId, setApproveId] = useState<any | null>(null);
  const [statusId, setStatusId] = useState<any | null>(null);
  const { t } = useTranslation();
  let { pathname } = useLocation();
  const [approveList, setApporveList] = useState<any | null>([]);
  const [, menuList]: any = useOutletContext();
  const [html, setHtml] = useState("");
  const [error, setError] = useState<any | null>(false);
  const [ppmScheduleStatus, setPPMScheduleStatus] = useState<any | null>(false);
  const [infraSubStatus, setInfraSubStatus] = useState<any | null>([]);
  const currentMenu = menuList
    ?.flatMap((menu: any) => menu?.DETAIL)
    .filter((detail: any) => detail.URL === pathname)[0];
  const FACILITY: any = localStorage.getItem("FACILITYID");
  const FACILITYID: any = JSON.parse(FACILITY);

  if (FACILITYID) {
    var facility_type: any = FACILITYID?.FACILITY_TYPE;
  }
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      EVENT_ID: props?.selectedData ? props?.selectedData?.EVENT_ID : 0,
      PARA: props?.selectedData
        ? { para1: `${props?.headerName}`, para2: "Updated" }
        : { para1: `${props?.headerName}`, para2: "Added" },
      MODE: props?.selectedData ? "E" : "A",
      EVENT_NAME: "",
      EVENT_TYPE: "",
      FUNCTION_CODE:
        props?.selectedData?.FUNCTION_CODE !== undefined
          ? props?.selectedData?.FUNCTION_CODE
          : false,
      STATUS_CODE:
        props?.selectedData?.STATUS_CODE !== undefined
          ? props?.selectedData?.STATUS_CODE
          : false,
      ACTIVE: search === "?edit=" ? dataId?.ACTIVE : true,
      TO_WO:
        props?.selectedData?.TO_WO !== undefined
          ? props?.selectedData?.TO_WO
          : false,
      SELECTED_WO_USER_MASTER_LIST: "",
      TO_USER:
        props?.selectedData?.TO_USER !== undefined
          ? props?.selectedData?.TO_USER
          : false,
      SELECTED_USER_MASTER_LIST: "",
      TO_ROLE:
        props?.selectedData?.TO_ROLE !== undefined
          ? props?.selectedData?.TO_ROLE
          : false,
      SELECTED_ROLE_MASTER_LIST: "",
      SEND_SMS:
        props?.selectedData?.SEND_SMS !== undefined
          ? props?.selectedData?.SEND_SMS
          : false,
      SEND_EMAIL:
        props?.selectedData?.SEND_EMAIL !== undefined
          ? props?.selectedData?.SEND_EMAIL
          : false,
      SEND_EMAIL_TEXT: "",
      SEND_EMAIL_SUBJECT: "",
      SEND_APP_NOTIF_TITLE: "",
      SEND_APP_NOTIF:
        props?.selectedData?.SEND_APP_NOTIFY !== undefined
          ? props?.selectedData?.SEND_APP_NOTIFY
          : false,
      SEND_APP_NOTIF_TEXT: "",
      SEND_SMS_TEXT: "",
      SUB_STATUS_CODE: "",
      APPROVAL_ID: "",
      ISSUPERVISOR: search === "?edit=" ? dataId?.ISISSUPERVISOR : false,
      ISTECHNICIAN: search === "?edit=" ? dataId?.ISTECHNICIAN : false,
      NOTIFYDAYSBEFORE: "",
      ISWEEKLY: false,
      ISMONTHLY: false,
      AUTH_USER: false,
    },
    mode: "all",
  });

  const eventTypeDropdownWatch: any = watch("EVENT_TYPE");
  const toWoCheckWatch: any = watch("TO_WO");
  const toUSerCheckWatch: any = watch("TO_USER");
  const toRoleCheckWatch: any = watch("TO_ROLE");
  const sendEmailCheckWatch: any = watch("SEND_EMAIL");
  const sendAppNotifyCheckWatch: any = watch("SEND_APP_NOTIF");
  const sendAppNotifytextWatch: any = watch("SEND_APP_NOTIF_TEXT");
  const watchTechnician: any = watch("ISTECHNICIAN");
  const watchSupervisor: any = watch("ISSUPERVISOR");
  const watchAuthUser: any = watch("AUTH_USER");
  const useRef1 = useRef<any>();
  // const useRef2 = useRef<any>();
  const onDragStart = (event: any, data: any) => {
    event.dataTransfer.setData("text", data);
  };

  const onDrop = (event: any) => {
    event.preventDefault();
    const data = event.dataTransfer.getData("text");
    const merge = useRef1?.current?.value + " " + data;
    setValue("SEND_APP_NOTIF_TEXT", merge);
  };

  const onDragOver = (event: any) => {
    event.preventDefault();
  };

  //const sendSMS: any = watch("SEND_SMS");
  const onSubmit = useCallback(
    async (payload: any) => {
      // if (IsSubmit) {
      //   return true
      // }
      // setIsSubmit(true)

      let notifyDayBefore: number = parseInt(payload?.NOTIFYDAYSBEFORE);

      if (payload.ISMONTHLY === true) {
        if (notifyDayBefore < 1 || notifyDayBefore > 15) {
          toast.error("Please enter a number between 1 and 15"); // Check if the number is within the valid range
          setError(true);
          setIsSubmit(false);
          return true;
        }
      }
      if (payload.ISWEEKLY === true) {
        if (notifyDayBefore < 1 || notifyDayBefore > 5) {
          toast.error("Please enter a number between 1 and 5"); // Check if the number is within the valid range
          setError(true);
          setIsSubmit(false);
          return true;
        }
      }
      const roleList: any =
        redirectApprovalStatus === false && approveStatus === false
          ? payload?.SELECTED_ROLE_MASTER_LIST?.length != 0
            ? payload?.SELECTED_ROLE_MASTER_LIST?.map(({ ROLE_ID }: any) => ({
                ROLE_ID,
              }))
            : []
          : [];
      const UserRole: any =
        redirectApprovalStatus === false && approveStatus === false
          ? payload?.SELECTED_USER_MASTER_LIST?.length != 0
            ? payload?.SELECTED_USER_MASTER_LIST?.map(({ USER_ID }: any) => ({
                USER_ID,
              }))
            : []
          : [];
      const woList: any =
        redirectApprovalStatus === false && approveStatus === false
          ? payload?.SELECTED_WO_USER_MASTER_LIST?.length != 0
            ? payload?.SELECTED_WO_USER_MASTER_LIST?.map(
                ({ ROLE_ID }: any) => ({
                  ROLE_ID,
                })
              )
            : []
          : [];

      payload.APPROVAL_ID =
        redirectApprovalStatus === true || approveStatus === true
          ? payload.APPROVAL_ID.APPROVAL_ID
          : null;
      payload.SUB_STATUS_CODE =
        redirectApprovalStatus === true
          ? payload?.SUB_STATUS_CODE?.SUB_STATUS_CODE
          : null;
      payload.ISSUPERVISOR =
        redirectApprovalStatus === true || approveStatus === true
          ? payload.ISSUPERVISOR
          : false;
      payload.ISTECHNICIAN =
        redirectApprovalStatus === true || approveStatus === true
          ? payload.ISTECHNICIAN
          : false;
      payload.EVENT_TYPE = payload?.EVENT_TYPE?.EVENT_TYPE;
      payload.STATUS_CODE = payload.STATUS_CODE?.STATUS_CODE;
      payload.FUNCTION_CODE = payload?.FUNCTION_CODE?.FUNCTION_CODE;
      payload.TO_ROLE =
        redirectApprovalStatus === false && approveStatus === false
          ? payload.TO_ROLE
            ? 1
            : 0
          : 0;
      payload.TO_USER =
        redirectApprovalStatus === false && approveStatus === false
          ? payload.TO_USER
            ? 1
            : 0
          : 0;
      payload.TO_WO =
        redirectApprovalStatus === false && approveStatus === false
          ? payload.TO_WO
            ? 1
            : 0
          : 0;
      payload.SEND_SMS = payload.SEND_SMS ? 1 : 0;
      payload.SEND_EMAIL = payload.SEND_EMAIL ? 1 : 0;
      payload.SEND_APP_NOTIF_TEXT =
        ppmScheduleStatus === false ? payload?.SEND_APP_NOTIF_TEXT : null;

      payload.SEND_APP_NOTIF =
        ppmScheduleStatus === false ? (payload.SEND_APP_NOTIF ? 1 : 0) : 0;
      payload.SEND_APP_NOTIF_TITLE =
        ppmScheduleStatus === false ? payload?.SEND_APP_NOTIF_TITLE : null;
      payload.NOTIFYDAYSBEFORE =
        ppmScheduleStatus === true ? notifyDayBefore : null;
      payload.ISWEEKLY = ppmScheduleStatus === true ? payload.ISWEEKLY : false;
      payload.ISMONTHLY =
        ppmScheduleStatus === true ? payload.ISMONTHLY : false;
      payload.AUTH_USER =
        redirectApprovalStatus === true && facility_type === "I"
          ? payload.AUTH_USER
          : false;
      if (roleList.length === 0) {
        payload.ROLE_EVENT = woList;
      } else {
        payload.ROLE_EVENT = roleList;
      }

      payload.USER_EVENT = payload?.TO_USER ? UserRole : [];
      if (sendEmailCheckWatch && !html) {
        toast.error("Please fill the required fields.");
        return;
      } else {
        payload.SEND_EMAIL_TEXT = getSanitizeCode(html);
      }

      delete payload?.SELECTED_USER_MASTER_LIST;
      delete payload?.SELECTED_ROLE_MASTER_LIST;
      delete payload?.SELECTED_WO_USER_MASTER_LIST;

      try {
        const res = await callPostAPI(ENDPOINTS?.SAVE_EVENTMASTER, payload);
        if (res?.FLAG === true) {
          setIsSubmit(false);
          toast?.success(res?.MSG);
          if (location?.state !== null) {
            if (location?.state?.OBJ_ID !== 0) {
              navigate(PATH.EDIT_ESCALATIONMATRIX, {
                state: { OBJ_ID: location?.state?.OBJ_ID },
              });
              setIsSubmit(false);
            } else {
              localStorage.setItem(
                "ALL_ASSETTYPE",
                location?.state?.ALL_ASSETTYPE
              );
              navigate(PATH.ADD_ESCALATIONMATRIX, {
                state: { data: location?.state },
              });
            }
          } else {
            setIsSubmit(false);

            props?.getAPI();
            props?.isClick();
          }
        } else {
          setIsSubmit(false);

          toast?.error(res?.MSG);
        }
      } catch (error: any) {
        toast?.error(error);
      } finally {
        setIsSubmit(false);
      }
    },
    [
      IsSubmit,
      location,
      toast,
      navigate,
      props,
      redirectApprovalStatus,
      approveStatus,
      eventTypeDropdownWatch,
      toUSerCheckWatch,
      toRoleCheckWatch,
      sendEmailCheckWatch,
      sendAppNotifyCheckWatch,
      sendAppNotifytextWatch,
      html,
      ppmScheduleStatus,
    ]
  );

  const getParaList = async (
    EVENT_TYPE: any,
    FUNCTION_CODE: any,
    state?: any
  ) => {
    const res1 = await callPostAPI(
      ENDPOINTS.GET_EVENTMASTER_PARALIST,
      {
        EVENT_TYPE: EVENT_TYPE,
      },
      FUNCTION_CODE
    );

    if (res1?.FLAG === 1) {
      setParaOption(res1?.PARALIST);
      if (state === true) {
        if (
          (FUNCTION_CODE === "HD001" ||
            selectedDetails?.event?.FUNCTION_CODE === "HD001") &&
          codeStatus === 8
        ) {
          setApproveStatus(true);
          setRedirectApprovalStatus(true);
        } else if (
          (FUNCTION_CODE === "INV005" ||
            selectedDetails?.event?.FUNCTION_CODE === "INV005") &&
          codeStatus === 8
        ) {
          setRedirectApprovalStatus(false);
          setApproveStatus(true);
        } else if (
          (FUNCTION_CODE === "MS002" ||
            selectedDetails?.event?.FUNCTION_CODE === "MS002") &&
          codeStatus === 16
        ) {
          setPPMScheduleStatus(true);
        } else {
          setRedirectApprovalStatus(false);
          setApproveStatus(false);
        }
      }
    }
    if (res1?.FLAG === 0) {
      setParaOption([]);
    }
  };

  const handlerChange = async (e: any) => {
    const { value } = e.target;
    await getParaList(value?.EVENT_TYPE, value?.FUNCTION_CODE, true);
    setFunctionCode(value?.FUNCTION_CODE);
  };

  const getStatusOptions = async (eventType: any, selectedEvent: any) => {
    try {
      const res = await callPostAPI(ENDPOINTS.GET_EVENTMASTER_STATUS, {
        EVENT_TYPE: eventType?.EVENT_TYPE || selectedEvent?.EVENT_TYPE,
      });

      if (res?.FLAG === 1) {
        setEventOptions({
          functionList: res?.FUNCTIONLIST,
          statusList: res?.STATUSLIST,
        });
        setSubStatusList(res?.SUBSTATUSLIST);
        setApporveList(res?.APPROVALLIST);
        setSubStatusList(res?.SUBSTATUSLIST);
        setApporveList(res?.APPROVALLIST);
      }
    } catch (error: any) {
      toast.error(error);
    }
  };

  const getOptionDetails = async () => {
    const res = await callPostAPI(ENDPOINTS.EDIT_EVENTMASTER_OPTION, {
      EVENT_ID: dataId?.EVENT_ID,
    });

    if (res?.FLAG === 1) {
      setSelectedDetails({
        event: res?.EVENTDETAILS[0],
        userRoles: res?.ROLELIST,
        UserLists: res?.USERLIST,
        worklist: res?.ROLELIST,
      });
      if (
        res?.EVENTDETAILS[0]?.FUNCTION_CODE === "HD001" &&
        facility_type === "I"
      ) {
        setRedirectApprovalStatus(true);
        setStatusId(res?.EVENTDETAILS[0]?.SUB_STATUS_CODE);
      } else if (
        res?.EVENTDETAILS[0]?.FUNCTION_CODE === "HD001" &&
        res?.EVENTDETAILS[0]?.STATUS_CODE === 8
      ) {
        setRedirectApprovalStatus(true);
        setApproveStatus(true);
        setApproveId(res?.EVENTDETAILS[0]?.APPROVAL_ID);
        setStatusId(res?.EVENTDETAILS[0]?.SUB_STATUS_CODE);
      } else if (
        res?.EVENTDETAILS[0]?.FUNCTION_CODE === "INV005" &&
        res?.EVENTDETAILS[0]?.STATUS_CODE === 8
      ) {
        setRedirectApprovalStatus(false);
        setApproveStatus(true);
        setApproveId(res?.EVENTDETAILS[0]?.APPROVAL_ID);
      } else if (
        res?.EVENTDETAILS[0]?.FUNCTION_CODE === "MS002" &&
        res?.EVENTDETAILS[0]?.STATUS_CODE === 16
      ) {
        setPPMScheduleStatus(true);
      }
      setValue(
        "AUTH_USER",
        res?.EVENTDETAILS[0]?.AUTH_USER === true ? true : false
      );
      setValue("NOTIFYDAYSBEFORE", res?.EVENTDETAILS[0]?.NOTIFYDAYSBEFORE);
      setValue(
        "ISMONTHLY",
        res?.EVENTDETAILS[0]?.ISMONTHLY === true ? true : false
      );
      setValue(
        "ISWEEKLY",
        res?.EVENTDETAILS[0]?.ISWEEKLY === true ? true : false
      );
      setValue(
        "ISSUPERVISOR",
        res?.EVENTDETAILS[0]?.ISSUPERVISOR === true ? true : false
      );
      setValue(
        "ISTECHNICIAN",
        res?.EVENTDETAILS[0]?.ISTECHNICIAN === true ? true : false
      );
      setValue("EVENT_NAME", res?.EVENTDETAILS[0]?.EVENT_NAME);
      setValue("SEND_APP_NOTIF", res?.NOTIFICATIONLIST[0]?.SEND_APP_NOTIF);
      setValue(
        "SEND_APP_NOTIF_TEXT",
        res?.NOTIFICATIONLIST[0]?.SEND_APP_NOTIF_TEXT
      );
      setValue("SEND_EMAIL", res?.NOTIFICATIONLIST[0]?.SEND_EMAIL);
      setValue(
        "SEND_EMAIL_SUBJECT",
        res?.NOTIFICATIONLIST[0]?.SEND_EMAIL_SUBJECT
      );
      setValue("SEND_EMAIL_TEXT", res?.NOTIFICATIONLIST[0]?.SEND_EMAIL_TEXT);
      setValue("SEND_SMS", res?.NOTIFICATIONLIST[0]?.SEND_SMS);
      setValue("SEND_SMS_TEXT", res?.NOTIFICATIONLIST[0]?.SEND_SMS_TEXT);
      setValue(
        "SEND_APP_NOTIF_TITLE",
        res?.NOTIFICATIONLIST[0]?.SEND_APP_NOTIF_TITLE
      );
      setValue("TO_ROLE", res?.NOTIFICATIONLIST[0]?.TO_ROLE);
      setValue("TO_USER", res?.NOTIFICATIONLIST[0]?.TO_USER);
      setValue("TO_WO", res?.NOTIFICATIONLIST[0]?.TO_WO);
      // setNotifyValue(res?.NOTIFICATIONLIST[0]?.SEND_EMAIL_TEXT);
      setHtml(res?.NOTIFICATIONLIST[0]?.SEND_EMAIL_TEXT);
      await getParaList(
        res?.EVENTDETAILS[0]?.EVENT_TYPE,
        res?.EVENTDETAILS[0]?.FUNCTION_CODE,
        false
      );
    }
  };

  useEffect(() => {
    if (
      selectedDetails &&
      selectedDetails.worklist &&
      selectedDetails.worklist.length > 0
    ) {
      const selectedData = selectedDetails.worklist.map((item: any) => ({
        ROLE_ID: item.ROLE_ID,
        ROLE_NAME: item.ROLE_NAME,
      }));
      setValue("SELECTED_WO_USER_MASTER_LIST", selectedData);
    }
  }, [selectedDetails, setValue]);

  const getOptions = async () => {
    try {
      const res = await callPostAPI(ENDPOINTS.GET_EVENTMASTER_OPTIONS, {});
      if (res?.FLAG === 1) {
        setOptions({
          eventTypeList: res?.EVENTTYPELIST,
          roleLIst: res?.ROLELIST,
          technicianList: res?.TECHNICIANLIST,
          userList: res?.USERLIST,
          woRoleList: res?.WOROLELIST,
        });
        if (search === "?edit=") {
          await getOptionDetails();
        }
      }
    } catch (error: any) {
      toast.error(error);
    }
  };

  useEffect(() => {
    const array: any = [];
    if (toWoCheckWatch) {
      setValue("TO_USER", false);
      setValue("TO_ROLE", false);
      setValue("SELECTED_ROLE_MASTER_LIST", array);
      setValue("SELECTED_USER_MASTER_LIST", array);
    }
  }, [toWoCheckWatch, setValue]);

  useEffect(() => {
    const array: any = [];
    if (toUSerCheckWatch) {
      setValue("TO_WO", false);
      setValue("TO_ROLE", false);
      setValue("SELECTED_ROLE_MASTER_LIST", array);
      setValue("SELECTED_WO_USER_MASTER_LIST", array);
    }
  }, [toUSerCheckWatch, setValue]);

  useEffect(() => {
    const array: any = [];
    if (toRoleCheckWatch) {
      setValue("TO_WO", false);
      setValue("TO_USER", false);
      setValue("SELECTED_WO_USER_MASTER_LIST", array);
      setValue("SELECTED_USER_MASTER_LIST", array);
    }
  }, [toRoleCheckWatch, setValue]);

  useEffect(() => {
    (async function () {
      await getStatusOptions(eventTypeDropdownWatch, props?.selectedData);
    })();
    if (
      eventTypeDropdownWatch?.EVENT_TYPE === "I" ||
      eventTypeDropdownWatch?.EVENT_TYPE === "E" ||
      eventTypeDropdownWatch?.EVENT_TYPE === "W" ||
      eventTypeDropdownWatch?.EVENT_TYPE === "S"
    ) {
      setShowWorkOrderRoleStatus(true);
    } else {
      setShowWorkOrderRoleStatus(false);
    }
  }, [eventTypeDropdownWatch, watch]);

  useEffect(() => {
    if (
      subStatusList?.length > 0 &&
      facility_type === "I" &&
      search === "?edit=" &&
      selectedDetails?.event?.FUNCTION_CODE === "HD001"
    ) {
      const subData: any = subStatusList?.filter(
        (item: any) => item.MAIN_STATUS === selectedDetails?.event?.STATUS_CODE
      );
      setInfraSubStatus(subData);
    }
  }, [subStatusList]);

  useEffect(() => {
    (async function () {
      await getOptions();
      setShowWorkOrderRoleStatus(true);
      await saveTracker(currentMenu);
    })();
  }, []);

  useEffect(() => {
    setEventType(location?.state?.EVENT_TYPE);
  }, [location?.state]);

  const getSanitizeCode = (data: any) => {
    const sanitizedContent = sanitizeHtml(data, {
      allowedTags: [
        "b",
        "i",
        "em",
        "strong",
        "p",
        "ul",
        "ol",
        "li",
        "a",
        "h1",
        "h2",
        "h3",
        "br",
      ], // Define allowed tags
      allowedAttributes: {
        "*": ["href", "title"],
      },
      allowedStyles: {},
    });

    let htmldata = replaceHtmlEntities(sanitizedContent);
    return htmldata;
  };
  const handleQuillChange = (value: any) => {
    const cleanValue =
      value.trim() === "<p><br></p>" || value === "<p><br></p>\n" ? "" : value;
    setHtml(cleanValue);
  };

  useEffect(() => {
    if (!isSubmitting && Object?.values(errors)[0]?.type === "required") {
      const check: any = Object?.values(errors)[0]?.message;
      toast?.error(t(check));
    } else if (
      !isSubmitting &&
      Object?.values(errors)[0]?.type === "atLeastOneChecked"
    ) {
      const check: any = Object?.values(errors)[0]?.message;
      toast?.error(t(check));
    }
  }, [isSubmitting]);

  const replaceHtmlEntities = (str: any) => {
    return str
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .replace(/&sol;/g, "/")
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, "&")
      .replace(/&copy;/g, '"');
  };

  return (
    <>
      <section className="w-full">
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormHeader
            headerName={props?.headerName}
            isSelected={props?.selectedData ? true : false}
            isClick={props?.isClick}
            IsSubmit={IsSubmit}
          />

          <Card className="mt-2">
            <div className="headingConainer">
              <p>{t("Master Details")}</p>
            </div>
            <div className="mt-1 grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-3 lg:grid-cols-3">
              <Field
                controller={{
                  name: "EVENT_NAME",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <InputField
                        {...register("EVENT_NAME", {
                          required: "Please fill the required fields",
                          validate: (value) =>
                            value.trim() !== "" ||
                            "Please fill the required fields.",
                        })}
                        label="Name"
                        require={true}
                        invalid={errors.EVENT_NAME}
                        {...field}
                      />
                    );
                  },
                }}
              />
              <Field
                controller={{
                  name: "EVENT_TYPE",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <Select
                        options={options?.eventTypeList}
                        {...register("EVENT_TYPE", {
                          required: "Please fill the required fields",
                          onChange: () => {
                            setValue("FUNCTION_CODE", "");
                            setValue("STATUS_CODE", "");
                            // setNotifyValue('');
                            setValue("SUB_STATUS_CODE", "");
                            setValue("APPROVAL_ID", "");
                            setRedirectApprovalStatus(false);
                            setApproveStatus(false);
                            setPPMScheduleStatus(false);
                          },
                        })}
                        label="Event Type"
                        require={true}
                        optionLabel="EVENTTYPE_NAME"
                        findKey={"EVENT_TYPE"}
                        selectedData={
                          eventType
                            ? eventType
                            : selectedDetails?.event?.EVENT_TYPE
                        }
                        setValue={setValue}
                        invalid={errors.EVENT_TYPE}
                        {...field}
                      />
                    );
                  },
                }}
              />
              <Field
                controller={{
                  name: "FUNCTION_CODE",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <Select
                        options={eventOptions?.functionList}
                        {...register("FUNCTION_CODE", {
                          required: "Please fill the required fields",
                          onChange: (e: any) => {
                            (async function () {
                              await handlerChange(e);
                            })();
                            // setValue("STATUS_CODE", "");
                            // setRedirectApprovalStatus(false)
                            // setApproveStatus(false)
                            setValue("SUB_STATUS_CODE", "");
                            setValue("APPROVAL_ID", "");
                          },
                        })}
                        label="Function Code"
                        require={true}
                        optionLabel="FUNCTION_DESC"
                        findKey={"FUNCTION_CODE"}
                        selectedData={selectedDetails?.event?.FUNCTION_CODE}
                        // selectedData={props?.selectedData?.FUNCTION_CODE}
                        setValue={setValue}
                        invalid={errors.FUNCTION_CODE}
                        {...field}
                      />
                    );
                  },
                }}
              />

              <Field
                controller={{
                  name: "STATUS_CODE",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <Select
                        options={eventOptions?.statusList}
                        {...register("STATUS_CODE", {
                          required: "Please fill the required fields",
                          onChange: (e: any) => {
                            setCodeStatus(e.target.value.STATUS_CODE);
                            if (
                              facility_type === "I" &&
                              (functionCode === "HD001" ||
                                selectedDetails?.event?.FUNCTION_CODE ===
                                  "HD001")
                            ) {
                              const subData: any = subStatusList?.filter(
                                (item: any) =>
                                  item.MAIN_STATUS ===
                                  e?.target?.value?.STATUS_CODE
                              );

                              setInfraSubStatus(subData);
                              setRedirectApprovalStatus(true);
                            } else if (
                              (functionCode === "HD001" ||
                                selectedDetails?.event?.FUNCTION_CODE ===
                                  "HD001") &&
                              e.target.value.STATUS_CODE === 8
                            ) {
                              setApproveStatus(true);
                              setRedirectApprovalStatus(true);
                            } else if (
                              (functionCode === "INV005" ||
                                selectedDetails?.event?.FUNCTION_CODE ===
                                  "INV005") &&
                              e.target.value.STATUS_CODE === 8
                            ) {
                              setRedirectApprovalStatus(false);
                              setApproveStatus(true);
                            } else if (
                              (functionCode === "MS002" ||
                                selectedDetails?.event?.FUNCTION_CODE ===
                                  "MS002") &&
                              e?.target?.value?.STATUS_CODE === 16
                            ) {
                              setPPMScheduleStatus(true);
                            } else {
                              setRedirectApprovalStatus(false);
                              setApproveStatus(false);
                              setPPMScheduleStatus(false);
                            }
                          },
                        })}
                        label="Status Code"
                        require={true}
                        optionLabel="STATUS_DESC"
                        findKey={"STATUS_CODE"}
                        selectedData={selectedDetails?.event?.STATUS_CODE}
                        setValue={setValue}
                        invalid={errors.STATUS_CODE}
                        {...field}
                      />
                    );
                  },
                }}
              />
              {redirectApprovalStatus && (
                <Field
                  controller={{
                    name: "SUB_STATUS_CODE",
                    control: control,
                    render: ({ field }: any) => {
                      return (
                        <Select
                          options={
                            facility_type === "I"
                              ? infraSubStatus
                              : subStatusList
                          }
                          {...register("SUB_STATUS_CODE", {
                            required:
                              redirectApprovalStatus === true
                                ? "Please fill the required fields"
                                : "",
                          })}
                          label="Sub Status"
                          require={
                            redirectApprovalStatus === true ? true : false
                          }
                          optionLabel="STATUS_DESC"
                          findKey={"SUB_STATUS_CODE"}
                          setValue={setValue}
                          selectedData={statusId}
                          // selectedData={props?.selectedData?.FUNCTION_CODE}

                          invalid={
                            redirectApprovalStatus === true
                              ? errors.SUB_STATUS_CODE
                              : ""
                          }
                          {...field}
                        />
                      );
                    },
                  }}
                />
              )}
              {redirectApprovalStatus === true && approveStatus === true && (
                <Field
                  controller={{
                    name: "APPROVAL_ID",
                    control: control,
                    render: ({ field }: any) => {
                      return (
                        <Select
                          options={approveList}
                          {...register("APPROVAL_ID", {
                            required:
                              redirectApprovalStatus === true
                                ? "Please fill the required fields"
                                : "",
                          })}
                          label="Approve"
                          require={redirectApprovalStatus === true ? true : ""}
                          optionLabel="APPROVAL_DESC"
                          findKey={"APPROVAL_ID"}
                          setValue={setValue}
                          selectedData={approveId}
                          invalid={
                            redirectApprovalStatus === true
                              ? errors.APPROVAL_ID
                              : ""
                          }
                          {...field}
                        />
                      );
                    },
                  }}
                />
              )}
              {approveStatus === true && redirectApprovalStatus === false && (
                <Field
                  controller={{
                    name: "APPROVAL_ID",
                    control: control,
                    render: ({ field }: any) => {
                      return (
                        <Select
                          options={approveList}
                          {...register("APPROVAL_ID", {
                            required:
                              redirectApprovalStatus === true
                                ? "Please fill the required fields"
                                : "",
                          })}
                          label="Approve"
                          require={true}
                          optionLabel="APPROVAL_DESC"
                          findKey={"APPROVAL_ID"}
                          setValue={setValue}
                          selectedData={approveId}
                          {...field}
                        />
                      );
                    },
                  }}
                />
              )}

              {ppmScheduleStatus && (
                <>
                  <div className={error ? "errorBorder" : ""}>
                    <Field
                      controller={{
                        name: "NOTIFYDAYSBEFORE",
                        control: control,
                        render: ({ field }: any) => {
                          return (
                            <InputField
                              {...register("NOTIFYDAYSBEFORE", {
                                required:
                                  ppmScheduleStatus === true
                                    ? "Please fill the required fields"
                                    : "",
                                validate: (fieldValue: any) => {
                                  return validation?.onlyNumber(
                                    fieldValue,
                                    "NOTIFYDAYSBEFORE",
                                    setValue
                                  );
                                },
                                onChange: () => {
                                  setError(false);
                                },
                              })}
                              label="Day Before"
                              require={true}
                              type=""
                              invalid={errors.NOTIFYDAYSBEFORE}
                              {...field}
                            />
                          );
                        },
                      }}
                    />
                  </div>
                  <div></div>

                  <Field
                    controller={{
                      name: "ISWEEKLY",
                      control: control,
                      render: ({ field }: any) => {
                        return (
                          <Checkboxs
                            {...register("ISWEEKLY", {
                              validate: {
                                atLeastOneChecked: () => {
                                  if (!field.value && !getValues("ISMONTHLY")) {
                                    return "Please fill the required fields"; // Custom error message
                                  }
                                  return true;
                                },
                              },
                            })}
                            className="md:mt-7"
                            label="Weekly"
                            setValue={(name: any, value: any) => {
                              setValue(name, value);
                              if (value) {
                                setValue("ISMONTHLY", false);
                              }
                            }}
                            invalid={errors.ISWEEKLY}
                            {...field}
                          />
                        );
                      },
                    }}
                  />
                  <Field
                    controller={{
                      name: "ISMONTHLY",
                      control: control,
                      render: ({ field }: any) => {
                        return (
                          <Checkboxs
                            {...register("ISMONTHLY", {
                              validate: {
                                atLeastOneChecked: () => {
                                  if (!field.value && !getValues("ISWEEKLY")) {
                                    return "Please fill the required fields"; // Custom error message
                                  }
                                  return true;
                                },
                              },
                            })}
                            className="md:mt-7"
                            label="Monthly"
                            setValue={(name: any, value: any) => {
                              setValue(name, value);
                              if (value) {
                                setValue("ISWEEKLY", false);
                              }
                            }}
                            invalid={errors.ISWEEKLY}
                            {...field}
                          />
                        );
                      },
                    }}
                  />
                </>
              )}

              <div className="flex align-items-center">
                <Field
                  controller={{
                    name: "ACTIVE",
                    control: control,
                    render: ({ field }: any) => {
                      return (
                        <Checkboxs
                          {...register("ACTIVE")}
                          checked={
                            props?.selectedData?.ACTIVE === true ? true : false
                          }
                          className="md:mt-7"
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
            </div>
          </Card>
          <Card className="mt-2">
            <div className="mt-2 grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-4 lg:grid-cols-4">
              <div className="border-slate-300 border-r">
                <div>
                  <DataTable
                    value={paraOption}
                    showGridlines
                    scrollable
                    scrollHeight="340px"
                  >
                    <Column
                      field="PARA"
                      header={t("Key")}
                      sortable
                      //  onDragStart = {}
                      body={(rowData: any) => {
                        return (
                          <p
                            draggable={true}
                            id="text"
                            onDragStart={(e) => onDragStart(e, rowData?.PARA)}
                          >
                            {rowData?.PARA}
                          </p>
                          // <p
                          //   className="cursor-pointer"
                          //   onDragStart={(e) => handlerDrag(e, rowData)}
                          // >
                          //   {rowData?.PARA}
                          // </p>
                        );
                      }}
                    ></Column>
                    <Column
                      field="PARA_DESC"
                      header={t("Description")}
                    ></Column>
                  </DataTable>
                </div>
              </div>
              <div className="col-span-3">
                <div className="noteContainer flex flex-wrap">
                  <div className="ml-3">
                    <p>
                      {t(
                        "Note : Keys are event paramaters, you can drag and drop it in your event text"
                      )}
                    </p>
                  </div>
                </div>

                <div className="grid mt-2 grid-cols-1 gap-x-2 gap-y-2 md:grid-cols-3 lg:grid-cols-3">
                  {(redirectApprovalStatus === true ||
                    approveStatus === true) && (
                    <div className="mb-2">
                      {" "}
                      <Field
                        controller={{
                          name: "ISSUPERVISOR",
                          control: control,
                          render: ({ field }: any) => {
                            return (
                              <Checkboxs
                                {...register("ISSUPERVISOR", {
                                  required:
                                    (redirectApprovalStatus === true ||
                                      approveStatus === true) &&
                                    watchTechnician === false &&
                                    watchSupervisor === false &&
                                    watchAuthUser === false
                                      ? "Please fill the required fields"
                                      : "",
                                })}
                                className="md:mt-7"
                                label="Supervisor"
                                setValue={setValue}
                                invalid={
                                  (redirectApprovalStatus === true ||
                                    approveStatus === true) &&
                                  watchTechnician === false &&
                                  watchSupervisor === false &&
                                  watchAuthUser === false
                                    ? errors?.ISSUPERVISOR
                                    : ""
                                }
                                {...field}
                              />
                            );
                          },
                        }}
                      />
                    </div>
                  )}

                  {(redirectApprovalStatus === true ||
                    approveStatus === true) && (
                    <div className="mb-2">
                      <Field
                        controller={{
                          name: "ISTECHNICIAN",
                          control: control,
                          render: ({ field }: any) => {
                            return (
                              <Checkboxs
                                {...register("ISTECHNICIAN", {
                                  required:
                                    (redirectApprovalStatus === true ||
                                      approveStatus === true) &&
                                    watchTechnician === false &&
                                    watchSupervisor === false &&
                                    watchAuthUser === false
                                      ? "Please fill the required fields"
                                      : "",
                                })}
                                className="md:mt-7"
                                label="Technician"
                                setValue={setValue}
                                invalid={
                                  (redirectApprovalStatus === true ||
                                    approveStatus === true) &&
                                  watchTechnician === false &&
                                  watchSupervisor === false &&
                                  watchAuthUser === false
                                    ? errors?.ISTECHNICIAN
                                    : ""
                                }
                                {...field}
                              />
                            );
                          },
                        }}
                      />
                    </div>
                  )}
                  {redirectApprovalStatus === true && facility_type === "I" && (
                    <div className="mb-2">
                      <Field
                        controller={{
                          name: "AUTH_USER",
                          control: control,
                          render: ({ field }: any) => {
                            return (
                              <Checkboxs
                                {...register("AUTH_USER", {
                                  required:
                                    redirectApprovalStatus === true &&
                                    facility_type === "I" &&
                                    watchTechnician === false &&
                                    watchSupervisor === false &&
                                    watchAuthUser === false
                                      ? "Please fill the required fields"
                                      : "",
                                  onChange: (e) => {
                                    // setValue("ISTECHNICIAN", true);
                                    // setValue("ISSUPERVISOR", true);
                                  },
                                })}
                                className="md:mt-7"
                                label="Auth User"
                                setValue={setValue}
                                invalid={
                                  redirectApprovalStatus === true &&
                                  facility_type === "I" &&
                                  watchTechnician === false &&
                                  watchSupervisor === false &&
                                  watchAuthUser === false
                                    ? errors?.AUTH_USER
                                    : ""
                                }
                                {...field}
                              />
                            );
                          },
                        }}
                      />
                    </div>
                  )}

                  {redirectApprovalStatus === false &&
                    approveStatus === false && (
                      <>
                        {showWorkOrderRoleStatus && (
                          <div className="">
                            <div className="flex gap-2">
                              <Field
                                controller={{
                                  name: "TO_WO",
                                  control: control,
                                  render: ({ field }: any) => {
                                    return (
                                      <Checkboxs
                                        {...register("TO_WO", {
                                          required:
                                            toUSerCheckWatch === true ||
                                            toRoleCheckWatch === true
                                              ? false
                                              : "Please select atleast one notification checkbox",
                                        })}
                                        className=""
                                        label="To Work Order"
                                        // require={true}
                                        setValue={setValue}
                                        invalid={errors.TO_WO}
                                        {...field}
                                      />
                                    );
                                  },
                                }}
                              />
                            </div>
                            <div className="mt-2">
                              <Field
                                controller={{
                                  name: "SELECTED_WO_USER_MASTER_LIST",
                                  control: control,
                                  render: ({ field }: any) => {
                                    return (
                                      <MultiSelects
                                        options={
                                          toWoCheckWatch
                                            ? options?.woRoleList
                                            : []
                                        }
                                        {...register(
                                          "SELECTED_WO_USER_MASTER_LIST",
                                          {
                                            required:
                                              toWoCheckWatch === false
                                                ? ""
                                                : t(
                                                    "Please fill the required fields.."
                                                  ),
                                          }
                                        )}
                                        optionLabel="ROLE_NAME"
                                        findKey={"ROLE_ID"}
                                        disabled={toWoCheckWatch ? false : true}
                                        // selectedData={selectedDetails?.worklist}

                                        invalid={
                                          errors.SELECTED_WO_USER_MASTER_LIST
                                        }
                                        setValue={setValue}
                                        {...field}
                                      />
                                    );
                                  },
                                }}
                              />
                            </div>
                          </div>
                        )}
                        <div className="mb-2">
                          <div className="">
                            <Field
                              controller={{
                                name: "TO_USER",
                                control: control,
                                render: ({ field }: any) => {
                                  return (
                                    <Checkboxs
                                      {...register("TO_USER", {
                                        required:
                                          toWoCheckWatch === true ||
                                          toRoleCheckWatch === true
                                            ? false
                                            : "Please select one of the notification Checkbox",
                                      })}
                                      checked={toUSerCheckWatch}
                                      // require={true}
                                      className=""
                                      label="To User"
                                      setValue={setValue}
                                      invalid={errors.TO_USER}
                                      {...field}
                                    />
                                  );
                                },
                              }}
                            />
                          </div>
                          <div className="mt-2">
                            <Field
                              controller={{
                                name: "SELECTED_USER_MASTER_LIST",
                                control: control,
                                render: ({ field }: any) => {
                                  return (
                                    <MultiSelects
                                      options={
                                        toUSerCheckWatch
                                          ? options?.userList
                                          : []
                                      }
                                      {...register(
                                        "SELECTED_USER_MASTER_LIST",
                                        {
                                          required:
                                            toUSerCheckWatch === false
                                              ? ""
                                              : t(
                                                  "Please fill the required fields.."
                                                ),
                                        }
                                      )}
                                      disabled={toUSerCheckWatch ? false : true}
                                      optionLabel="USER_NAME"
                                      findKey={"USER_ID"}
                                      selectedData={selectedDetails?.UserLists}
                                      invalid={errors.SELECTED_USER_MASTER_LIST}
                                      setValue={setValue}
                                      {...field}
                                    />
                                  );
                                },
                              }}
                            />
                          </div>
                        </div>
                        <div className="mb-2">
                          <div className="">
                            <div className="flex  mr-2 align-items-center">
                              <Field
                                controller={{
                                  name: "TO_ROLE",
                                  control: control,
                                  render: ({ field }: any) => {
                                    return (
                                      <Checkboxs
                                        {...register("TO_ROLE", {
                                          required:
                                            toWoCheckWatch === true ||
                                            toUSerCheckWatch === true
                                              ? false
                                              : "Please select one of the notification Checkbox",
                                        })}
                                        checked={toRoleCheckWatch}
                                        className=""
                                        // require={true}
                                        label="To Role"
                                        setValue={setValue}
                                        invalid={errors.TO_ROLE}
                                        {...field}
                                      />
                                    );
                                  },
                                }}
                              />
                            </div>
                            <div className="mt-2">
                              <Field
                                controller={{
                                  name: "SELECTED_ROLE_MASTER_LIST",
                                  control: control,
                                  render: ({ field }: any) => {
                                    return (
                                      <MultiSelects
                                        options={
                                          toRoleCheckWatch === true
                                            ? options?.roleLIst
                                            : []
                                        }
                                        {...register(
                                          "SELECTED_ROLE_MASTER_LIST",
                                          {
                                            required:
                                              toRoleCheckWatch === false
                                                ? ""
                                                : t(
                                                    "Please fill the required fields."
                                                  ),
                                          }
                                        )}
                                        disabled={
                                          toRoleCheckWatch ? false : true
                                        }
                                        optionLabel="ROLE_NAME"
                                        setValue={setValue}
                                        selectedData={
                                          selectedDetails?.userRoles
                                        }
                                        invalid={
                                          errors.SELECTED_ROLE_MASTER_LIST
                                        }
                                        findKey={"ROLE_ID"}
                                        {...field}
                                      />
                                    );
                                  },
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                </div>
                <div className="grid mt-2 grid-cols-1 gap-x-2 gap-y-2 md:grid-cols-3 lg:grid-cols-3">
                  <div className="border border-slate-300 p-4 rounded-md">
                    <div className="flex align-items-center justify-center mb-2">
                      <Field
                        controller={{
                          name: "SEND_EMAIL",
                          control: control,
                          render: ({ field }: any) => {
                            return (
                              <Checkboxs
                                {...register("SEND_EMAIL", {
                                  required:
                                    (toRoleCheckWatch === true ||
                                      toUSerCheckWatch == true ||
                                      toWoCheckWatch === true ||
                                      redirectApprovalStatus === true ||
                                      approveStatus === true) &&
                                    sendAppNotifyCheckWatch === false
                                      ? "Please select notification checkbox"
                                      : false,
                                })}
                                checked={
                                  props?.selectedData?.SEND_EMAIL === true
                                    ? true
                                    : false
                                }
                                disabled={
                                  toUSerCheckWatch ||
                                  toRoleCheckWatch ||
                                  toWoCheckWatch ||
                                  redirectApprovalStatus ||
                                  approveStatus
                                    ? false
                                    : true
                                }
                                className=""
                                label="Email Notification"
                                setValue={setValue}
                                invalid={errors?.SEND_EMAIL}
                                {...field}
                              />
                            );
                          },
                        }}
                        error={errors?.SEND_EMAIL?.message}
                      />
                    </div>
                    <div className="">
                      <Field
                        controller={{
                          name: "SEND_EMAIL_SUBJECT",
                          control: control,
                          render: ({ field }: any) => {
                            return (
                              <InputField
                                {...register("SEND_EMAIL_SUBJECT", {
                                  required:
                                    sendEmailCheckWatch === true
                                      ? "Please fill the required fields."
                                      : false,
                                })}
                                disabled={sendEmailCheckWatch ? false : true}
                                setValue={setValue}
                                placeholder={"Email Subject"}
                                invalid={errors?.SEND_EMAIL_SUBJECT}
                                {...field}
                              />
                            );
                          },
                        }}
                      />
                    </div>
                    {/* className={`${props?.invalid ? 'errorBorder' : ''}`} */}
                    <div
                      className={`${
                        sendEmailCheckWatch === true && html === ""
                          ? "errorEditor"
                          : ""
                      }`}
                    >
                      {/* No external or inline styles, relying on browser defaults */}
                      {/* <Editor

                        value={html} onChange={onChange}

                      /> */}
                      <ReactQuill
                        value={html}
                        onChange={handleQuillChange}
                        readOnly={!sendEmailCheckWatch}
                      />
                    </div>
                  </div>
                  {ppmScheduleStatus === false && (
                    <div className="border border-slate-300 p-4 rounded-md">
                      <div className="flex align-items-center justify-center mb-2">
                        <Field
                          controller={{
                            name: "SEND_APP_NOTIF",
                            control: control,
                            render: ({ field }: any) => {
                              return (
                                <Checkboxs
                                  {...register("SEND_APP_NOTIF", {
                                    required:
                                      (toRoleCheckWatch === true ||
                                        toUSerCheckWatch == true ||
                                        toWoCheckWatch === true) &&
                                      sendEmailCheckWatch === false
                                        ? "Please select notification checkbox"
                                        : false,
                                  })}
                                  checked={
                                    sendAppNotifytextWatch ? true : false
                                  }
                                  disabled={
                                    toUSerCheckWatch ||
                                    toRoleCheckWatch ||
                                    toWoCheckWatch ||
                                    redirectApprovalStatus ||
                                    approveStatus
                                      ? false
                                      : true
                                  }
                                  className=""
                                  label="APP Notification"
                                  setValue={setValue}
                                  invalid={errors?.SEND_APP_NOTIF}
                                  {...field}
                                />
                              );
                            },
                          }}
                        />
                      </div>

                      <div className="">
                        <Field
                          controller={{
                            name: "SEND_APP_NOTIF_TITLE",
                            control: control,
                            render: ({ field }: any) => {
                              return (
                                <InputField
                                  {...register("SEND_APP_NOTIF_TITLE", {
                                    required:
                                      sendAppNotifyCheckWatch === true
                                        ? "Please fill the required fields."
                                        : false,
                                  })}
                                  disabled={
                                    sendAppNotifyCheckWatch ? false : true
                                  }
                                  setValue={setValue}
                                  placeholder={"Notification Title"}
                                  invalid={errors?.SEND_APP_NOTIF_TITLE}
                                  {...field}
                                />
                              );
                            },
                          }}
                        />
                      </div>
                      <div
                        className={`${
                          errors?.SEND_APP_NOTIF_TEXT ? "errorBorder" : ""
                        }`}
                      >
                        <div
                          className={`${
                            errors?.SEND_APP_NOTIF_TEXT ? "errorBorder" : ""
                          }`}
                        >
                          <Field
                            controller={{
                              name: "SEND_APP_NOTIF_TEXT",
                              control: control,
                              render: ({ field }: any) => {
                                return (
                                  <InputTextarea
                                    id="AppText"
                                    {...register("SEND_APP_NOTIF_TEXT", {
                                      required:
                                        sendAppNotifyCheckWatch === true
                                          ? "Please fill the required fields."
                                          : false,
                                    })}
                                    {...register("SEND_APP_NOTIF_TEXT", {
                                      required:
                                        sendAppNotifyCheckWatch === true
                                          ? "Please fill the required fields."
                                          : false,
                                    })}
                                    value={SEND_APP_TEXT}
                                    disabled={
                                      sendAppNotifyCheckWatch ? false : true
                                    }
                                    onChange={(e) =>
                                      setAppValue(e.target.value)
                                    }
                                    rows={5}
                                    placeholder={"APP Notification"}
                                    setValue={setValue}
                                    onDrop={onDrop}
                                    onDragOver={onDragOver}
                                    invalid={errors.SEND_APP_NOTIF_TEXT}
                                    {...field}
                                    ref={useRef1}
                                  />
                                );
                              },
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </form>
      </section>
    </>
  );
};

export default EventMasterForm;
