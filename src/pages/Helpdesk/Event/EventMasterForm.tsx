import React, { useEffect, useRef, useState } from "react";
import InputField from "../../../components/Input/Input";
import Buttons from "../../../components/Button/Button";
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
 
import Editor from 'react-simple-wysiwyg';
const EventMasterForm = (props: any) => {
  const location: any = useLocation();
  const navigate: any = useNavigate();
  const [selectedDetails, setSelectedDetails] = useState<any>([]);
  const [options, setOptions] = useState<any | null>([]);
  const [eventOptions, setEventOptions] = useState<any | null>([]);
  const [paraOption, setParaOption] = useState<any | null>([]);
  const [eventType, setEventType] = useState("");
  const [showWorkOrderRoleStatus, setShowWorkOrderRoleStatus] = useState(true);
  const [IsSubmit, setIsSubmit] = useState(false);
  const [SEND_APP_TEXT, setAppValue] = useState("");
  const { t } = useTranslation();
  let { pathname } = useLocation();
  const [, menuList]: any = useOutletContext();
  const [html, setHtml] = useState("");
  const currentMenu = menuList
    ?.flatMap((menu: any) => menu?.DETAIL)
    .filter((detail: any) => detail.URL === pathname)[0];
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
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
      FUNCTION_CODE: props?.selectedData?.FUNCTION_CODE !== undefined
        ? props?.selectedData?.FUNCTION_CODE
        : false,
      STATUS_CODE: props?.selectedData?.STATUS_CODE !== undefined
        ? props?.selectedData?.STATUS_CODE
        : false,
      ACTIVE:
        props?.selectedData?.ACTIVE !== undefined
          ? props?.selectedData?.ACTIVE
          : true,
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
      SELECTED_ROLE_MASTER_LIST: [],
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
    },
  });
  const eventTypeDropdownWatch: any = watch("EVENT_TYPE");
  const toWoCheckWatch: any = watch("TO_WO");
  const toUSerCheckWatch: any = watch("TO_USER");
  const toRoleCheckWatch: any = watch("TO_ROLE");
  const sendEmailCheckWatch: any = watch("SEND_EMAIL");
  const sendAppNotifyCheckWatch: any = watch("SEND_APP_NOTIF");
  const sendAppNotifytextWatch: any = watch("SEND_APP_NOTIF_TEXT");
 
  const useRef1 = useRef<any>();
  const useRef2 = useRef<any>();
  const onDragStart = (event: any, data: any) => {
    event.dataTransfer.setData("text", data);
  };
 
  const onDrop = (event: any) => {
    event.preventDefault();
    const data = event.dataTransfer.getData("text");
    const merge = useRef1?.current?.value + " " + data;
    setValue("SEND_APP_NOTIF_TEXT", merge);
  };
  const onDropEmail = (event: any) => {
    event.preventDefault();
    const data = event.dataTransfer.getData("text");
    const merge = useRef2?.current?.value + " " + data;
    setValue("SEND_EMAIL_TEXT", merge);
  };
  const onDragOver = (event: any) => {
    event.preventDefault();
  };
  // console.log(errors, 'error')
  function dropAPP(event: any) {
    event.preventDefault();
 
    // var data = para;
    var data = event.dataTransfer.getData("text");
    // if (document.getElementById('AppText').disabled) {
    // return;
    // }
 
    var text = document.getElementById("AppText");
    const d = SEND_APP_TEXT;
    // text.value = text.value + document.getElementById(data).innerText;
    // para = "";
  }
  const watchAll = watch();
 
  const editorRef = useRef<any>();
  const [SEND_NOTIFY_TEXT, setNotifyValue] = useState("");
  let setText = useRef<any | null>();
  const handleEditorChange = (e: any, editor: any) => {
    setText = editor.getContent({ format: "html" });
    setNotifyValue(setText.toString());
 
  };
 
  // const sendSMS: any = watch("SEND_SMS");
  const onSubmit = async (payload: any) => {
    setIsSubmit(true)
    // return
    const roleList: any =
      payload?.SELECTED_ROLE_MASTER_LIST?.length != 0
        ? payload?.SELECTED_ROLE_MASTER_LIST?.map(({ ROLE_ID }: any) => ({
          ROLE_ID,
        }))
        : [];
    const UserRole: any =
      payload?.SELECTED_USER_MASTER_LIST?.length != 0
        ? payload?.SELECTED_USER_MASTER_LIST?.map(({ USER_ID }: any) => ({
          USER_ID,
        }))
        : [];
    const woList: any =
      payload?.SELECTED_WO_USER_MASTER_LIST?.length != 0
        ? payload?.SELECTED_WO_USER_MASTER_LIST?.map(({ ROLE_ID }: any) => ({
          ROLE_ID,
        }))
        : [];
    payload.EVENT_TYPE = payload?.EVENT_TYPE?.EVENT_TYPE;
    payload.STATUS_CODE = payload.STATUS_CODE?.STATUS_CODE;
    payload.FUNCTION_CODE = payload?.FUNCTION_CODE?.FUNCTION_CODE;
    payload.TO_ROLE = payload.TO_ROLE ? 1 : 0;
    payload.TO_USER = payload.TO_USER ? 1 : 0;
    payload.TO_WO = payload.TO_WO ? 1 : 0;
    payload.SEND_SMS = payload.SEND_SMS ? 1 : 0;
    payload.SEND_EMAIL = payload.SEND_EMAIL ? 1 : 0;
    payload.SEND_APP_NOTIF = payload.SEND_APP_NOTIF ? 1 : 0;
 
    if (roleList.length === 0) {
      payload.ROLE_EVENT = woList;
    } else {
      payload.ROLE_EVENT = roleList;
    }
    // payload.ROLE_EVENT = roleList ?? woList ?? [];
    payload.USER_EVENT = payload?.TO_USER ? UserRole : [];
    payload.SEND_EMAIL_TEXT = replaceHtmlEntities(html);
    //payload.ROLE_EVENT = payload.TO_WO ? woList : [];
    delete payload?.SELECTED_USER_MASTER_LIST;
    delete payload?.SELECTED_ROLE_MASTER_LIST;
    delete payload?.SELECTED_WO_USER_MASTER_LIST;
    // console.log("payload", payload)
    // return
    try {
      const res = await callPostAPI(ENDPOINTS?.SAVE_EVENTMASTER, payload);
      if (res?.FLAG === true) {
        setIsSubmit(false)
        toast?.success(res?.MSG);
        if (location?.state !== null) {
          if (location?.state?.OBJ_ID !== 0) {
            navigate(PATH.EDIT_ESCALATIONMATRIX, {
              state: { OBJ_ID: location?.state?.OBJ_ID },
            });
            setIsSubmit(false)
 
          } else {
            localStorage.setItem(
              "ALL_ASSETTYPE",
              location?.state?.ALL_ASSETTYPE
            );
            navigate(PATH.ADD_ESCALATIONMATRIX, {
              state: { data: location?.state },
            });
            setIsSubmit(false)
 
          }
        } else {
          setIsSubmit(false)
 
          props?.getAPI();
          props?.isClick();
 
        }
      } else {
        setIsSubmit(false)
 
        toast?.error(res?.MSG);
      }
    } catch (error: any) {
      setIsSubmit(false)
 
      toast?.error(error);
    }
  };
  const getParaList = async (EVENT_TYPE: any, FUNCTION_CODE: any) => {
    const res1 = await callPostAPI(
      ENDPOINTS.GET_EVENTMASTER_PARALIST,
      {
        EVENT_TYPE: EVENT_TYPE,
      },
      FUNCTION_CODE
    );
 
    if (res1?.FLAG === 1) {
      setParaOption(res1?.PARALIST);
    }
    if (res1?.FLAG === 0) {
      setParaOption([]);
    }
  };
 
  const handlerChange = async (e: any) => {
    const { value } = e.target;
    getParaList(value?.EVENT_TYPE, value?.FUNCTION_CODE);
  };
  const handlerDrag = (e: any, rowData: any) => { };
 
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
      }
    } catch (error: any) {
      toast.error(error);
    }
  };
 
  const getOptionDetails = async () => {
 
    const res = await callPostAPI(ENDPOINTS.EDIT_EVENTMASTER_OPTION, {
      EVENT_ID: props?.selectedData?.EVENT_ID,
    });
 
    if (res?.FLAG === 1) {
      // console.log(res, 'res')
      setSelectedDetails({
        event: res?.EVENTDETAILS[0],
        userRoles: res?.ROLELIST,
        UserLists: res?.USERLIST,
        worklist: res?.ROLELIST,
      });
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
      //setValue()
      setValue("SEND_APP_NOTIF_TITLE", res?.NOTIFICATIONLIST[0]?.SEND_APP_NOTIF_TITLE)
      setValue("TO_ROLE", res?.NOTIFICATIONLIST[0]?.TO_ROLE);
      setValue("TO_USER", res?.NOTIFICATIONLIST[0]?.TO_USER);
      setValue("TO_WO", res?.NOTIFICATIONLIST[0]?.TO_WO);
      setNotifyValue(res?.NOTIFICATIONLIST[0]?.SEND_EMAIL_TEXT);
      setHtml(res?.NOTIFICATIONLIST[0]?.SEND_EMAIL_TEXT)
      getParaList(
        res?.EVENTDETAILS[0]?.EVENT_TYPE,
        res?.EVENTDETAILS[0]?.FUNCTION_CODE
      );
    }
 
  };
 
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
        if (props?.selectedData !== undefined) {
          getOptionDetails();
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
    // console.log("eventTypeDropdownWatch", props?.selectedData)
    getStatusOptions(eventTypeDropdownWatch, props?.selectedData);
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
    getOptions();
 
    setShowWorkOrderRoleStatus(true);
    saveTracker(currentMenu);
  }, []);
 
  useEffect(() => {
    setEventType(location?.state?.EVENT_TYPE);
  }, [location?.state]);
 
 
  function onChange(e: any) {
    setHtml(e.target.value);
  }
 
 
  useEffect(() => {
    if (!isSubmitting && Object?.values(errors)[0]?.type === "required") {
      const check: any = Object?.values(errors)[0]?.message;
      toast?.error(t(check));
    }
  }, [isSubmitting]);
 
  // const [content, setContent] = useState("");
 
  // const handleEditorChange = (e:any) => {
  //   console.log(e.target.value)
  //   setContent(content);
  // };
  const replaceHtmlEntities = (str: any) => {
    return str
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&sol;/g, '/')
      .replace(/&quot;/g, '"')
      // .replace(/&apos;/g, ''')
      .replace(/&amp;/g, '&')
      .replace(/&copy;/g, '"')
      .replace(/&nbsp;/g, ' ')
      .replace(/&quot/g, '"')
 
    // You can add more replacements as needed
  };
  return (
    <>
      <section className="w-full">
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormHeader
            headerName={props?.headerName}
            isSelected={props?.selectedData ? true : false}
            isClick={props?.isClick}
            isSubmit={IsSubmit}
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
                            setNotifyValue('');
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
                            handlerChange(e);
                            setValue("STATUS_CODE", "");
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
                        })}
                        label="Status Code"
                        require={true}
                        optionLabel="STATUS_DESC"
                        findKey={"STATUS_CODE"}
                        selectedData={selectedDetails?.event?.STATUS_CODE}
                        // selectedData={props?.selectedData?.STATUS_CODE}
                        setValue={setValue}
                        invalid={errors.STATUS_CODE}
                        {...field}
                      />
                    );
                  },
                }}
              />
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
                            props?.selectedData?.ACTIVE === true
                              ? true
                              : false || false
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
                                  // {...register("TO_WO")}
                                  // checked={toWoCheckWatch}
                                  // // disabled={
                                  // //   toUSerCheckWatch || toRoleCheckWatch||toWoCheckWatch ? false : true
 
                                  {...register("TO_WO", {
                                    required: toUSerCheckWatch === true || toRoleCheckWatch === true ? false : "Please select atleast one notification checkbox",
                                    // validate: (value) =>
                                    //   value.trim() !== "" ||
                                    //   "Please fill the required fields.",
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
                                    toWoCheckWatch ? options?.woRoleList : []
                                  }
                                  {...register("SELECTED_WO_USER_MASTER_LIST", {
                                    required: toWoCheckWatch === false ? "" : t("Please fill the required fields.."),
                                  })}
                                  optionLabel="ROLE_NAME"
                                  setValue={setValue}
                                  disabled={toWoCheckWatch ? false : true}
                                  selectedData={selectedDetails?.worklist}
                                  findKey={"ROLE_ID"}
                                  invalid={errors.SELECTED_WO_USER_MASTER_LIST}
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
                                // {...register("TO_USER"),{
 
                                // }}
                                {...register("TO_USER", {
                                  required: toWoCheckWatch === true || toRoleCheckWatch === true ? false : "Please select one of the notification Checkbox",
                                  // validate: (value) =>
                                  //   value.trim() !== "" ||
                                  //   "Please fill the required fields.",
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
                                  toUSerCheckWatch ? options?.userList : []
                                }
                                {...register("SELECTED_USER_MASTER_LIST", {
                                  required: toUSerCheckWatch === false ? "" : t("Please fill the required fields.."),
                                })}
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
                                  // {...register("TO_ROLE")}
                                  {...register("TO_ROLE", {
                                    required: toWoCheckWatch === true || toUSerCheckWatch === true ? false : "Please select one of the notification Checkbox",
                                    // validate: (value) =>
                                    //   value.trim() !== "" ||
                                    //   "Please fill the required fields.",
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
                                  {...register("SELECTED_ROLE_MASTER_LIST", {
                                    required: toRoleCheckWatch === false ? "" : t("Please fill the required fields."),
                                  })}
                                  disabled={toRoleCheckWatch ? false : true}
                                  optionLabel="ROLE_NAME"
                                  setValue={setValue}
                                  selectedData={selectedDetails?.userRoles}
                                  invalid={errors.SELECTED_ROLE_MASTER_LIST}
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
                                  required: sendAppNotifyCheckWatch === false ? "Please select notification checkbox" : false,
                                })}
                                checked={
                                  props?.selectedData?.SEND_EMAIL === true
                                    ? true
                                    : false || false
                                }
                                disabled={
                                  toUSerCheckWatch ||
                                    toRoleCheckWatch ||
                                    toWoCheckWatch
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
                                  required: sendEmailCheckWatch === true ? "Please fill the required fields." : false
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
                    <div className="">
                      <Editor value={html} onChange={onChange} />
                    </div>
                  </div>
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
                                  required: sendEmailCheckWatch === false ? "Please select notification checkbox" : false,
                                })}
                                checked={sendAppNotifytextWatch ? true : false}
                                disabled={
                                  toUSerCheckWatch ||
                                    toRoleCheckWatch ||
                                    toWoCheckWatch
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
                                  required: sendAppNotifyCheckWatch === true ? "Please fill the required fields." : false
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
                    <div className={`${errors?.SEND_APP_NOTIF_TEXT ? "errorBorder" : ""}`}>
                      <Field
                        controller={{
                          name: "SEND_APP_NOTIF_TEXT",
                          control: control,
                          render: ({ field }: any) => {
                            return (
                              <InputTextarea
                                id="AppText"
                                {...register("SEND_APP_NOTIF_TEXT", {
                                  required: sendAppNotifyCheckWatch === true ? "Please fill the required fields." : false
                                })}
                                value={SEND_APP_TEXT}
                                disabled={
                                  sendAppNotifyCheckWatch ? false : true
                                }
                                onChange={(e) => setAppValue(e.target.value)}
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
              </div>
            </div>
          </Card>
        </form>
      </section>
    </>
  );
};
 
export default EventMasterForm;