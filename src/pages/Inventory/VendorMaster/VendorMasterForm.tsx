import { useCallback, useEffect, useState } from "react";
import InputField from "../../../components/Input/Input";
import Buttons from "../../../components/Button/Button";
import { Card } from "primereact/card";
import { toast } from "react-toastify";

import { useForm } from "react-hook-form";
import Field from "../../../components/Field";
import { callPostAPI } from "../../../services/apis";
import { ENDPOINTS } from "../../../utils/APIEndpoints";
import Checkboxs from "../../../components/Checkbox/Checkbox";
import { useTranslation } from "react-i18next";
import { useLocation, useOutletContext } from 'react-router-dom';
import { EMAIL_REGEX } from "../../../utils/regEx";
import DateCalendar from "../../../components/Calendar/Calendar";
import Editor from 'react-simple-wysiwyg';
import {
  eventNotification,
  helperEventNotification,
} from "../../../utils/eventNotificationParameter";
import FormHeader from "../../../components/FormHeader/FormHeader";
import { dateFormat, onlyDateFormat, saveTracker } from "../../../utils/constants";
import { validation } from "../../../utils/validation";
import Table from "../../../components/Table/Table";
import DocumentUpload from "../../../components/pageComponents/DocumentUpload/DocumentUpload";
import moment from "moment";
import MultiSelects from "../../../components/MultiSelects/MultiSelects";


let EMAIL_BODY = ''
let CONTRACT_END_REMINDER_DATE: any = "";
let EMAIL_SUBJECT: any = "";
let CONTRACT_DESC: any = "";
let end_date: any = "";
let CONTRACT_ID = 0
const VendorMasterForm = (props: any) => {
  const [addvendor, setAddVendor] = useState(false);
  const [sendemail, setSendEmail] = useState(true);
  const [showcontra, setShowContra] = useState(false);
  // const [updatevendor, setUpdateVendor] = useState(false);
  // const [showruser, setShowuser] = useState(false);
  // const [showrrole, setShowrole] = useState(false);
  const [contractlist, setContractList] = useState([]);
  const [rolelist, setRoleList] = useState([]);
  // const [userlist, setUserList] = useState([]);
  const [ContractList1, setContractList1] = useState<any>([]);
  const { t } = useTranslation();
  const { search } = useLocation();
  const getId: any = localStorage.getItem("Id")
  const dataId = JSON.parse(getId)
  let { pathname } = useLocation();
  const [, menuList]: any = useOutletContext();
  const [IsSubmit, setIsSubmit] = useState<any | null>(false);
  const [html, setHtml] = useState("");
  const [error, setError] = useState<any | null>(false)
  const currentMenu = menuList
    ?.flatMap((menu: any) => menu?.DETAIL)
    .filter((detail: any) => detail.URL === pathname)[0];
  function onChange(e: any) {
    const ht = replaceHtmlEntities(e.target.value);
    setHtml(ht)
    EMAIL_BODY = html;
  }
  const {
    register,
    handleSubmit,
    control, getValues,
    setValue, watch, reset, resetField,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      MODE: props?.selectedData || search === '?edit=' ? "E" : "A",
      PARA: props?.selectedData || search === '?edit='
        ? { para1: `${props?.headerName}`, para2: "Updated" }
        : { para1: `${props?.headerName}`, para2: "Added" },

      VENDOR_NAME:  search === '?edit=' ? dataId?.VENDOR_NAME : '',
      VENDOR_ADDRESS: search === '?edit=' ? dataId?.VENDOR_ADDRESS : '',
      VENDOR_CONTACT_PERSON: search === '?edit=' ? dataId?.VENDOR_CONTACT_PERSON : '',
      VENDOR_MOBILE: search === '?edit=' ? dataId?.VENDOR_MOBILE : '',
      VENDOR_PHONE:  search === '?edit=' ? dataId?.VENDOR_PHONE : '',
      VENDOR_EMAIL:  search === '?edit=' ? dataId?.VENDOR_EMAIL : '',
      ACTIVE:search === '?edit=' ? dataId?.ACTIVE : true,
      
      VENDOR_ID:  search === '?edit=' ? dataId?.VENDOR_ID : 0,
      CONTRACT_NAME: "",
      EMAIL_SUBJECT: "",
      CONTRACT_END_REMINDER_DATE: "",
      IS_NOTIFICATION: props?.selectedData?.IS_NOTIFICATION !== undefined
        ? props.selectedData.IS_NOTIFICATION
        : false,
      END_DATE: "",
      START_DATE: "",
      DOC_LIST: [],
      PO_DATE: "",
      FINANCIAL_YEAR: "",
      CONTRACT_COST: "",
      PO_NUMBER: "",
      SERVICE_PRODUCT: "",
      TO_USER: props?.selectedData?.TO_USER !== undefined
        ? props.selectedData.TO_USER
        : false,
      TO_ROLE: props?.selectedData?.TO_ROLE !== undefined
        ? props.selectedData.TO_ROLE
        : false,
      SELECTED_ROLE_MASTER_LIST: []
    },
    mode: "all",
  });

  const isNotifywatch: any = watch("IS_NOTIFICATION")

  // const isUserwatch: any = watch("TO_USER")
  const isRolewatch: any = watch("TO_ROLE")
  // const roleListwatch: any = watch('SELECTED_ROLE_MASTER_LIST')

  const StartdateWatch: any = watch("START_DATE")
  const EnddateWatch: any = watch("END_DATE")
  const CONTRACT_NAMEWatch: any = watch("CONTRACT_NAME")



  const onSubmit = useCallback(async (payload: any) => {

    if (IsSubmit) return true
    setIsSubmit(true)
    try {
      payload.ACTIVE = payload?.ACTIVE === true ? 1 : 0;
      let isValid: boolean;
      let msg: any = ''


      const phonePattern = /^[+]{1}(?:[0-9\-\\/.]\s?){6,15}[0-9]{1}$/; // Basic international format
      if (phonePattern.test(payload?.VENDOR_MOBILE)) {

        if (payload?.VENDOR_MOBILE?.length < 6 || payload?.VENDOR_MOBILE?.length > 16) {
          msg = 'Please Enter valid Mobile Number'
          isValid = false
          setError(true)
        } else {
          isValid = true
        }
      }
      else {
        msg = 'Please Enter valid Mobile Number'
        isValid = false
        setError(true)
      }
      if (isValid) {
        const res = await callPostAPI(ENDPOINTS.VENDORMASTER_SAVE, payload);
        if (res?.FLAG === true) {
          toast?.success(res?.MSG);
          const notifcation: any = {
            FUNCTION_CODE: props?.functionCode,
            EVENT_TYPE: "M",
            STATUS_CODE: props?.selectedData ? 2 : 1,
            PARA1: props?.selectedData
              ? "updated_by_user_name"
              : "created_by_user_name",
            PARA2: "vendor_name",
            PARA3: "email",
            PARA4: "address",
            PARA5: "contact_person",
            PARA6: "phone",
            PARA7: "mobile",
          };

          const eventPayload = { ...eventNotification, ...notifcation };
          await helperEventNotification(eventPayload);
          props?.getAPI();

          props?.isClick();
        } else {
          setIsSubmit(false)
          toast?.error(res?.MSG);
        }
      } else {
        setIsSubmit(false)
        toast.error(msg)
      }
    } catch (error: any) {
      toast.error(error);
    } finally {
      setIsSubmit(false)
    }
  }, [IsSubmit,
    toast,
    props?.functionCode,
    props?.selectedData,
    props?.getAPI,
    props?.isClick,
    eventNotification,
    setError]);

  function onCancel() {
    setAddVendor(false)
    setSendEmail(true)
    resetField("IS_NOTIFICATION")
    // resetField("DOC_LIST")
    setHtml("")
    setShowContra(true)
    setValue("DOC_LIST", [])
    setValue("SELECTED_ROLE_MASTER_LIST", [])
    setValue("EMAIL_SUBJECT", "")
    resetField("SELECTED_ROLE_MASTER_LIST")
    resetField("EMAIL_SUBJECT")
    resetField("SELECTED_ROLE_MASTER_LIST")
    setValue("SELECTED_ROLE_MASTER_LIST", [])
    setContractList1([])
    CONTRACT_ID = 0
    // setValue("DOC",[])
    reset()
  }
  
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



  const onSubmitVendor = useCallback(async (payload1: any) => {




    // return
    const roleList: any =
      payload1?.SELECTED_ROLE_MASTER_LIST?.length != 0
        ? payload1?.SELECTED_ROLE_MASTER_LIST?.map(({ ROLE_ID }: any) => ({
          ROLE_ID,
        }))
        : [];
    const UserRole: any =
      payload1?.SELECTED_USER_MASTER_LIST?.length != 0
        ? payload1?.SELECTED_USER_MASTER_LIST?.map(({ USER_ID }: any) => ({
          USER_ID,
        }))
        : [];


    if (IsSubmit) return true
    setIsSubmit(true)
    try {


      // if (EMAIL_BODY == undefined || EMAIL_BODY === "") {
      //   toast.error("Please Enter Email Body");
      //   return;
      // }

      const payload = {
        CONTRACT_ID: CONTRACT_ID == 0 ? 0 : CONTRACT_ID,
        MODE: CONTRACT_ID == 0 ? "A" : "E",
        PARA: CONTRACT_ID == 0 ? { "para1": `Contract Details`, "para2": t('Added') }
          : { "para1": `Contract Details`, "para2": t('Updated') },
        VENDOR_ID: dataId?.VENDOR_ID,
        CONTRACT_NAME: payload1.CONTRACT_NAME,
        START_DATE: payload1.START_DATE
          ? moment(payload1.START_DATE).format(dateFormat())
          : "",
        END_DATE: payload1.END_DATE
          ? moment(payload1.END_DATE).format(dateFormat())
          : "",
        CONTRACT_END_REMINDER_DATE: payload1.CONTRACT_END_REMINDER_DATE
          ? moment(payload1.CONTRACT_END_REMINDER_DATE).format(dateFormat())
          : "",
        IS_NOTIFICATION: payload1.IS_NOTIFICATION ?? false,
        EMAIL_SUBJECT: payload1.EMAIL_SUBJECT,
        EMAIL_BODY: EMAIL_BODY,
        ACTIVE: payload1.ACTIVE,
        SERVICE_PRODUCT: payload1.SERVICE_PRODUCT,
        CONTRACT_COST: payload1.CONTRACT_COST,
        FINANCIAL_YEAR: payload1.FINANCIAL_YEAR,
        PO_NUMBER: payload1.PO_NUMBER,
        PO_DATE: payload1.PO_DATE
          ? moment(payload1.PO_DATE).format(dateFormat())
          : "",
        DOC_LIST: payload1.DOC_LIST,
        TO_ROLE: payload1.TO_ROLE ? 1 : 0,
        TO_USER: payload1.TO_USER ? 1 : 0,
        ROLE_EVENT: roleList,
        USER_EVENT: UserRole
      };



      const res = await callPostAPI(ENDPOINTS.SAVECONTRACTMASTER, payload);


      if (res?.FLAG === true) {
        onCancel()
        setAddVendor(false);

        toast?.success(res?.MSG);
        await getAPI()
      } else {
        setIsSubmit(false)
        toast?.error(res?.MSG);
      }
    } catch (error: any) {
      setIsSubmit(false)
      toast.error(error);
    } finally {
      setIsSubmit(false)
    }
  }, [IsSubmit, props.selectedData, props.functionCode, props.isClick, callPostAPI, toast, helperEventNotification, dateFormat, search,]);
  const getAPI = async () => {
    try {
      const payload = {
        FORM_TYPE: "LIST",
        VENDOR_ID: dataId?.VENDOR_ID,
      }
      const res = await callPostAPI(ENDPOINTS.GETCONTRACTLIST, payload, currentMenu?.FUNCTION_CODE)

      if (res) {
        setShowContra(true)
        const cList = res?.CONTRACTLIST
        for (let i = 0; i < cList.length; i++) {
          cList[i].START_DATE = onlyDateFormat(cList[i].START_DATE);
          cList[i].END_DATE = onlyDateFormat(cList[i].END_DATE);
          cList[i].CONTRACT_END_REMINDER_DATE = onlyDateFormat(cList[i].CONTRACT_END_REMINDER_DATE);
        }
        if (cList.length !== 0) {
          setContractList(cList)
        }
      }
    } catch (error: any) {
      toast.error(error)
    }
  }
  const getOptions = async () => {
    try {
      const res = await callPostAPI(ENDPOINTS.GET_EVENTMASTER_OPTIONS, {});


      if (res?.FLAG === 1) {

        if (res) {

          const rList = res?.ROLELIST
          // const uList = res?.USERLIST

          if (rList.length !== 0) {

            if (rList?.length !== 0) {
              setRoleList(rList);

            }

          }
          // setUserList(uList)

          if (!addvendor) {

            await GETCONTRACTMASTERDETAILS()

          } else {
            // setShowuser(false)
            // setShowrole(false)
          }
        }

      }
    } catch (error: any) {
      toast.error(error);
    }
  };

  const GETCONTRACTMASTERDETAILS = async () => {


    try {
      const payload = {
        CONTRACT_ID: CONTRACT_ID,
        VENDOR_ID: dataId?.VENDOR_ID,
      }

      const res = await callPostAPI(ENDPOINTS.GETCONTRACTMASTERDETAILS, payload, currentMenu?.FUNCTION_CODE)
      if (res?.FLAG === 1) {
        // setRoleList(rList)
        setValue("DOC_LIST", res?.CONTRACTDOCSLIST)
        setAddVendor(true);
        setShowContra(false);
        // setUpdateVendor(true);
        setContractList1(res?.ROLELIST)
        if (res?.ROLELIST.length != 0) {
          setValue("TO_ROLE", true)
          // setShowuser(true);
        }
        if (res?.USERLIST.length != 0) {
          setValue("TO_USER", true)
          // setShowrole(true);
        }

      }
    } catch (error: any) {
      toast.error(error)
    }
  }


  const checkemail = () => {
    if (isNotifywatch === true) {
      setSendEmail(true)
      setValue("CONTRACT_END_REMINDER_DATE", "");

      setValue("EMAIL_SUBJECT", "");
      setHtml("");
      EMAIL_BODY = "";
    } else {

      // setValue("EMAIL_SUBJECT", EMAIL_SUBJECT);

      let enddate: any = moment(EnddateWatch).format('DD/MMM/YYYY');
      // setValue("CONTRACT_END_REMINDER_DATE", CON);


      EMAIL_BODY = "  Hi Team , \n \n <br/>   <br/>    This is to inform you that '" + CONTRACT_NAMEWatch + " ' " + "for " + props?.selectedData?.VENDOR_NAME + " is about to expire on " + enddate + ".Please take note <br/> <br/> Thanks <br/> <br/> Klik+FM team";
      setHtml("  Hi Team , \n \n  <br/>  <br/>  This is to inform you that '" + CONTRACT_NAMEWatch + " ' " + "for " + props?.selectedData?.VENDOR_NAME + " is about to expire on " + enddate + ".Please take note <br/> <br/>   Thanks <br/> <br/> Klik+FM team")
      setSendEmail(false)
      // setValue("CONTRACT_END_REMINDER_DATE", CONTRACT_END_REMINDER_DATE)
    }
  };


  // const checkuser = () => {
  //   if (isUserwatch === false) {

  //     // setShowrole(true)
  //     setRoleList([])
  //     setContractList1([])
  //   } else {
  //     setShowrole(false)

  //   }
  // }
  // const checkrole = () => {
  //   if (isRolewatch === false) {
  //     setShowuser(true)
  //   } else {
  //     setShowuser(false)
  //   }
  // }

  useEffect(() => {

    if (search === '?edit=') {
      (async function () {
        await getAPI()
        await saveTracker(currentMenu);

      })()
    }
  }, [search])



  useEffect(() => {
    if (isNotifywatch || currentMenu || isRolewatch) {
      if (rolelist?.length !== 0) {
        const role: any = rolelist?.filter((f: any) => f?.ROLE_ID === f?.ROLE_ID)

        setRoleList(role)

        // setContractList1(roleListwatch)

        if (ContractList1 && ContractList1?.length !== 0) {
          const filteredArray: { ROLE_ID: number, ROLE_NAME: string }[] = ContractList1?.map((item: any) => ({
            ROLE_ID: item.ROLE_ID,
            ROLE_NAME: item.ROLE_NAME
          }));

          setContractList1(filteredArray)
        }
      }
    }
  }, [isNotifywatch, isRolewatch, currentMenu])

  useEffect(() => {
    if (currentMenu) {
      (async function () {
        await getOptions()
      })()


    }
  }, [currentMenu])

  useEffect(() => {
    if ((!isSubmitting && Object?.values(errors)[0]?.type === "required") || (!isSubmitting && Object?.values(errors)[0]?.type === "validate")) {
      const check: any = Object?.values(errors)[0]?.message;
      toast?.error(t(check));
    }
  }, [isSubmitting]);


  
  return (
    <>
      <section className="w-full">
        {!addvendor ? (
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
                    name: "VENDOR_NAME",
                    control: control,
                    render: ({ field }: any) => {
                      return (
                        <InputField
                          {...register("VENDOR_NAME", {
                            required: "Please fill the required fields.",
                            validate: (value) =>
                              value.trim() !== "" ||
                              "Please fill the required fields.",
                          })}
                          label="Vendor Name"
                          require={true}
                          placeholder={t("Please_Enter")}
                          invalid={errors.VENDOR_NAME}
                          {...field}
                        />
                      );
                    },
                  }}
                  error={errors?.VENDOR_NAME?.message}
                />
                <Field
                  controller={{
                    name: "VENDOR_ADDRESS",
                    control: control,
                    render: ({ field }: any) => {
                      return (
                        <InputField
                          {...register("VENDOR_ADDRESS", {})}
                          label="Address"
                          {...field}
                        />
                      );
                    },
                  }}
                />
                <Field
                  controller={{
                    name: "VENDOR_CONTACT_PERSON",
                    control: control,
                    render: ({ field }: any) => {
                      return (
                        <InputField
                          {...register("VENDOR_CONTACT_PERSON")}
                          label="Contact Person"
                          placeholder={t("Please_Enter")}
                          {...field}
                        />
                      );
                    },
                  }}
                  error={errors?.VENDOR_CONTACT_PERSON?.message}
                />
                <div className={error === true ? "errorBorder" : ""}>
                  <Field
                    controller={{
                      name: "VENDOR_MOBILE",
                      control: control,
                      render: ({ field }: any) => {
                        return (
                          // <InputField
                          //   {...register("VENDOR_MOBILE", {
                          //     // validate: (fieldValue: any) => {
                          //     //   const sanitizedValue = fieldValue
                          //     //     ?.toString()
                          //     //     ?.replace(/[^0-9]/g, "");
                          //     //   setValue("VENDOR_MOBILE", sanitizedValue);

                          //     //   return true || "Please enter numeric value";
                          //     // },
                          //   })}
                          //   label={"Mobile No"}
                          //   placeholder={t("Please_Enter")}
                          //   invalidMessage={errors.VENDOR_MOBILE?.message}
                          //   {...field}
                          // />
                          <InputField
                            {...register("VENDOR_MOBILE", {
                              required: "Please fill the required fields.",
                              validate: (fieldValue: any) => {
                                return validation?.phoneWithInternationNumber(
                                  fieldValue,
                                  "VENDOR_MOBILE",
                                  setValue
                                );
                              },
                            })}
                            label={"Mobile No"}
                            require={true}
                            placeholder={t("Please_Enter")}
                            // invalidMessage={errors.VENDOR_MOBILE?.message}
                            invalid={errors.VENDOR_MOBILE}
                            {...field}
                          />
                        );
                      },
                    }}
                    error={errors?.VENDOR_MOBILE?.message}
                  />
                </div>
                <Field
                  controller={{
                    name: "VENDOR_PHONE",
                    control: control,
                    render: ({ field }: any) => {
                      return (
                        <InputField
                          {...register("VENDOR_PHONE", {
                            // validate: (fieldValue: any) => {
                            //   return validation?.phoneNumber(
                            //     fieldValue,
                            //     "VENDOR_PHONE",
                            //     setValue
                            //   );
                            // },
                          })}
                          label={"Phone No"}
                          // require={true}
                          placeholder={t("Please_Enter")}
                          // invalid={errors.VENDOR_PHONE}
                          // invalidMessage={errors.VENDOR_PHONE?.message}
                          {...field}
                        />
                      );
                    },
                  }}
                // error={errors?.VENDOR_PHONE?.message}
                />

                <Field
                  controller={{
                    name: "VENDOR_EMAIL",
                    control: control,
                    render: ({ field }: any) => {
                      return (
                        <InputField
                          {...register("VENDOR_EMAIL", {
                            required: "Please fill the required fields.",
                            validate: (value) =>
                              value.trim() !== "" ||
                              "Please fill the required fields.",
                            pattern: {
                              value: EMAIL_REGEX,
                              message: "Invalid email format",
                            },
                          })}
                          label="Email Id"
                          require={true}
                          placeholder={t("Please_Enter")}
                          invalid={errors.VENDOR_EMAIL}
                          // invalidMessage={errors?.VENDOR_EMAIL?.message}
                          {...field}
                        />
                      );
                    },
                  }}
                  error={errors?.VENDOR_EMAIL?.message}
                />
                <div className="flex gap-10">
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
                                : false
                            }
                            // className="md:mt-7"
                            label="Active"
                            setValue={setValue}
                            {...field}
                          />
                        );
                      },
                    }}
                  // error={errors?.ACTIVE?.message}
                  />

                  <Buttons
                    className="Primary_Button me-2"
                    label={t("Add Contract")}
                    icon="pi pi-plus"
                    onClick={() => {
                      setAddVendor(true);
                      setShowContra(false);

                      // getOptions()
                    }}
                  />
                </div>
              </div>
            </Card>
          </form>
        ) : (
          <>
            <div className="flex align-items-end justify-between items-center">
              <h6 style={{ paddingBottom: 20 }}>{`${CONTRACT_ID === 0 ? "Add" : "Edit"
                } Contract Details`}</h6>
              <p className="Sub_Header_Text Text_Secondary">
                {props?.selectedData?.VENDOR_NAME}
              </p>
              <div>
                <Buttons
                  className="Secondary_Button me-2"
                  label={t("Cancel")}
                  onClick={onCancel}
                />
                <Buttons
                  className="Primary_Button me-2"
                  label={t("Save")}
                  onClick={handleSubmit(onSubmitVendor)}
                />
              </div>
            </div>
            <Card>
              <div className="mt-1 grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-3 lg:grid-cols-3">
                <Field
                  controller={{
                    name: "SERVICE_PRODUCT",
                    control: control,
                    render: ({ field }: any) => {
                      return (
                        <InputField
                          {...register("SERVICE_PRODUCT", {
                            required: "Please fill the required fields.",
                            validate: (value) =>
                              value.trim() !== "" ||
                              "Please fill the required fields.",
                          })}
                          label="Service/Product"
                          require={true}
                          setValue={setValue}
                          placeholder={t("Please_Enter")}
                          invalid={errors.SERVICE_PRODUCT}
                          {...field}
                        />
                      );
                    },
                  }}
                  error={errors?.SERVICE_PRODUCT?.message}
                />
                <Field
                  controller={{
                    name: "CONTRACT_COST",
                    control: control,
                    render: ({ field }: any) => {
                      return (
                        <InputField
                          // {...register("CONTRACT_COST", {
                          //   required: "Please fill the required fields.",
                          //   validate: value => value.trim() !== "" || "Please fill the required fields."

                          // })}
                          label="Contract Cost"
                          require={false}
                          setValue={setValue}
                          placeholder={t("Please_Enter")}
                          // invalid={errors.CONTRACT_COST}
                          {...field}
                        />
                      );
                    },
                  }}
                // error={errors?.CONTRACT_NAME?.message}
                />
                <Field
                  controller={{
                    name: "FINANCIAL_YEAR",
                    control: control,
                    render: ({ field }: any) => {
                      return (
                        <InputField
                          // {...register("CONTRACT_COST", {
                          //   required: "Please fill the required fields.",
                          //   validate: value => value.trim() !== "" || "Please fill the required fields."

                          // })}
                          label="FY"
                          require={false}
                          setValue={setValue}
                          placeholder={t("Please_Enter")}
                          // invalid={errors.CONTRACT_COST}
                          {...field}
                        />
                      );
                    },
                  }}
                // error={errors?.CONTRACT_NAME?.message}
                />
                <Field
                  controller={{
                    name: "CONTRACT_NAME",
                    control: control,
                    render: ({ field }: any) => {
                      return (
                        <InputField
                          {...register("CONTRACT_NAME", {
                            required: "Please fill the required fields.",
                            validate: (value) =>
                              value.trim() !== "" ||
                              "Please fill the required fields.",
                          })}
                          label="Contract Name"
                          require={true}
                          setValue={setValue}
                          placeholder={t("Please_Enter")}
                          invalid={errors.CONTRACT_NAME}
                          {...field}
                        />
                      );
                    },
                  }}
                  error={errors?.CONTRACT_NAME?.message}
                />
                <Field
                  controller={{
                    name: "START_DATE",
                    control: control,
                    render: ({ field }: any) => {
                      return (
                        <DateCalendar
                          {...register("START_DATE", {
                            required: "Please fill the required fields",
                          })}
                          label="Start Date"
                          setValue={setValue}
                          // disabled={disableFields}
                          require={true}
                          invalid={errors.START_DATE}
                          showIcon
                          {...field}
                        />
                      );
                    },
                  }}
                />
                <Field
                  controller={{
                    name: "END_DATE",
                    control: control,
                    render: ({ field }: any) => {
                      return (
                        <DateCalendar
                          {...register("END_DATE", {
                            required: "Please fill the required fields",
                          })}
                          label="End Date"
                          setValue={setValue}
                          // disabled={disableFields}
                          require={true}
                          minDate={StartdateWatch}
                          invalid={errors.END_DATE}
                          showIcon
                          {...field}
                        />
                      );
                    },
                  }}
                />
                <Field
                  controller={{
                    name: "PO_NUMBER",
                    control: control,
                    render: ({ field }: any) => {
                      return (
                        <InputField
                          // {...register("CONTRACT_COST", {
                          //   required: "Please fill the required fields.",
                          //   validate: value => value.trim() !== "" || "Please fill the required fields."

                          // })}
                          label="PO Number"
                          require={false}
                          setValue={setValue}
                          placeholder={t("Please_Enter")}
                          // invalid={errors.CONTRACT_COST}
                          {...field}
                        />
                      );
                    },
                  }}
                // error={errors?.CONTRACT_NAME?.message}
                />
                <Field
                  controller={{
                    name: "PO_DATE",
                    control: control,
                    render: ({ field }: any) => {
                      return (
                        <DateCalendar
                          // {...register("PO_DATE", {
                          //   required: "Please fill the required fields",
                          // })}
                          label="PO Date"
                          setValue={setValue}
                          // disabled={disableFields}
                          require={false}
                          // invalid={errors.PO_DATE}
                          showIcon
                          {...field}
                        />
                      );
                    },
                  }}
                />
              </div>

              <div className="border border-slate-300 p-4 rounded-md mt-2">
                <div className=" grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-3 lg:grid-cols-3">
                  <div className="col-span-3">
                    <Field
                      controller={{
                        name: "IS_NOTIFICATION",
                        control: control,
                        render: ({ field }: any) => {
                          return (
                            <Checkboxs
                              {...register("IS_NOTIFICATION", {
                                required: false,
                              })}
                              checked={
                                props?.selectedData?.IS_NOTIFICATION == true
                                  ? false
                                  : true
                              }
                              // disabled={
                              //   toUSerCheckWatch ||
                              //     toRoleCheckWatch ||
                              //     toWoCheckWatch
                              //     ? false
                              //     : true
                              // }

                              label="Email Notification"
                              setValue={setValue}
                              onClick={checkemail}
                              invalid={errors?.IS_NOTIFICATION}
                              {...field}
                            />
                          );
                        },
                      }}
                    // error={errors?.SEND_EMAIL?.message}
                    />
                  </div>

                  <Field
                    controller={{
                      name: "CONTRACT_END_REMINDER_DATE",
                      control: control,
                      render: ({ field }: any) => {
                        return (
                          <DateCalendar
                            {...register("CONTRACT_END_REMINDER_DATE", {
                              required: isNotifywatch
                                ? "Please fill the required fields"
                                : false,
                            })}
                            label="Contract End Reminder Date"
                            setValue={setValue}
                            disabled={sendemail}
                            minDate={StartdateWatch}
                            maxDate={EnddateWatch}
                            require={false}
                            invalid={errors.CONTRACT_END_REMINDER_DATE}
                            showIcon
                            {...field}
                          />
                        );
                      },
                    }}
                  />
                  <div className="">
                    <div>
                      <Field
                        controller={{
                          name: "TO_ROLE",
                          control: control,
                          render: ({ field }: any) => {
                            return (
                              <Checkboxs
                                // {...register("TO_ROLE")}
                                {...register("TO_ROLE", {
                                  required: isNotifywatch
                                    ? "Please fill the required fields"
                                    : false,
                                  // validate: (value) =>
                                  //   value.trim() !== "" ||
                                  //   "Please fill the required fields.",
                                })}
                                //checked={toRoleCheckWatch}
                                className=""
                                disabled={sendemail}
                                // require={true}
                                label="To Role"
                                // onClick={checkrole}
                                setValue={setValue}
                                invalid={errors.TO_ROLE}
                                {...field}
                              />
                            );
                          },
                        }}
                      />
                      <Field
                        controller={{
                          name: "SELECTED_ROLE_MASTER_LIST",
                          control: control,
                          render: ({ field }: any) => {
                            return (
                              <MultiSelects
                                options={rolelist}
                                {...register("SELECTED_ROLE_MASTER_LIST", {
                                  required:
                                    isRolewatch && isNotifywatch
                                      ? t("Please fill the required fields.")
                                      : false,
                                })}
                                disabled={isRolewatch === false}
                                optionLabel="ROLE_NAME"
                                findKey={"ROLE_ID"}
                                selectedData={ContractList1}
                                setValue={setValue}
                                invalid={errors.SELECTED_ROLE_MASTER_LIST}
                                {...field}
                              />
                            );
                          },
                        }}
                      />
                    </div>
                    <div>
                      {/* <Field
                        controller={{
                          name: "TO_USER",
                          control: control,
                          render: ({ field }: any) => {
                            return (
                              <Checkboxs
                                // {...register("TO_ROLE")}
                                {...register("TO_USER", {
                                  required: isNotifywatch && isRolewatch ? false : true,

                                })}
                                //checked={toRoleCheckWatch}
                                className=""
                                disabled={sendemail}

                                onClick={checkuser}
                                // require={true}
                                label="To User"
                                setValue={setValue}
                                invalid={errors.TO_ROLE}
                                {...field}
                              />
                            );
                          },
                        }}
                      /> */}
                      {/* <Field
                        controller={{
                          name: "SELECTED_USER_MASTER_LIST",
                          control: control,
                          render: ({ field }: any) => {
                            return (
                              <MultiSelects
                                options={
                                  userlist
                                }
                                // {...register("SELECTED_ROLE_MASTER_LIST", {
                                //   required: toRoleCheckWatch === false ? "" : t("Please fill the required fields."),
                                // })}
                                // disabled={toRoleCheckWatch ? false : true}
                                optionLabel="USER_NAME"
                                setValue={setValue}
                                disabled={sendemail || showruser}

                                //  selectedData={s}
                                // invalid={errors.SELECTED_ROLE_MASTER_LIST}
                                findKey={"USER_ID"}
                                {...field}
                              />
                            );
                          },
                        }}
                      /> */}
                    </div>
                  </div>
                </div>

                <div className="grid mt-2 grid-cols-1 gap-x-2 gap-y-2 md:grid-cols-3 lg:grid-cols-3">
                  <div className="col-span-2">
                    <Field
                      controller={{
                        name: "EMAIL_SUBJECT",
                        control: control,
                        render: ({ field }: any) => {
                          return (
                            <InputField
                              {...register("EMAIL_SUBJECT", {
                                required: isNotifywatch
                                  ? "Please fill the required fields"
                                  : false,
                              })}
                              // disabled={sendEmailCheckWatch ? false : true}
                              setValue={setValue}
                              disabled={sendemail}
                              placeholder={"Email Subject"}
                              invalid={errors?.EMAIL_SUBJECT}
                              {...field}
                            />
                          );
                        },
                      }}
                    />
                    <div className="">
                      <Editor
                        value={html}
                        disabled={sendemail}
                        onChange={onChange}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
            <Card className="mt-2">
              <Field
                controller={{
                  name: "DOC",
                  control: control,
                  render: () => {
                    return (
                      <div>
                        <div className="col-span-2">
                          <DocumentUpload
                            register={register}
                            control={control}
                            setValue={setValue}
                            watch={watch}
                            getValues={getValues}
                            errors={errors}
                          />
                        </div>
                      </div>
                    );
                  },
                }}
              />
            </Card>
          </>
        )}
        {showcontra ? (
          <Table
            dataKey={currentMenu?.FUNCTION_DESC}
            columnTitle={[
              "SERVICE_PRODUCT",
              "CONTRACT_NAME",
              "START_DATE",
              "END_DATE",
              "FINANCIAL_YEAR",
            ]}
            customHeader={[
              "Service/Prodcut",
              "Contract Name",
              "Start Date",
              "End Date",
              "Finacial Year",
            ]}
            columnData={contractlist}
            clickableColumnHeader={["CONTRACT_NAME"]}
            filterFields={[
              "SERVICE_PRODUCT",
              "CONTRACT_NAME",
              "START_DATE",
              "END_DATE",
              "FINANCIAL_YEAR",
            ]}
            setSelectedData
            isClick={async (e: any) => {
              if (e.rowItem) {
                CONTRACT_ID = e.rowItem.CONTRACT_ID;
                await getOptions();

                CONTRACT_END_REMINDER_DATE = new Date(
                  e.rowItem.CONTRACT_END_REMINDER_DATE
                );
                const start_date: any = new Date(e.rowItem.START_DATE);
                end_date = new Date(e.rowItem.END_DATE);
                const po_date: any =
                  e.rowItem.PO_DATE == undefined
                    ? ""
                    : new Date(e.rowItem.PO_DATE);
                setValue("CONTRACT_NAME", e.rowItem.CONTRACT_NAME);
                setValue("START_DATE", start_date);
                setValue("END_DATE", end_date);
                setValue(
                  "CONTRACT_END_REMINDER_DATE",
                  CONTRACT_END_REMINDER_DATE
                );
                EMAIL_SUBJECT = e.rowItem.EMAIL_SUBJECT;
                CONTRACT_DESC = e.rowItem.CONTRACT_NAME;
                setValue("EMAIL_SUBJECT", e.rowItem.EMAIL_SUBJECT);
                setValue("IS_NOTIFICATION", e.rowItem.IS_NOTIFICATION);
                setValue("PO_NUMBER", e.rowItem.PO_NUMBER);
                setValue("CONTRACT_COST", e.rowItem.CONTRACT_COST);
                setValue("SERVICE_PRODUCT", e.rowItem.SERVICE_PRODUCT);
                setValue("FINANCIAL_YEAR", e.rowItem.FINANCIAL_YEAR);
                setValue("PO_DATE", po_date);

                // setValue("SELECTED_ROLE_MASTER_LIST", e.rowItem?.ROLELIST?.map(({ ROLE_ID }: any) => ({
                //   ROLE_ID
                // })))
                EMAIL_BODY = e.rowItem.EMAIL_BODY;
                setHtml(e.rowItem.EMAIL_BODY);
              }
            }}
            handelDelete={props?.handelDelete}
            // deleteURL={ENDPOINTS.DELETE_VENDORMASTER}
            DELETE_ID="CONTRACT_NAME"
          />
        ) : (
          <></>
        )}
      </section>
    </>
  );
}

export default VendorMasterForm;
