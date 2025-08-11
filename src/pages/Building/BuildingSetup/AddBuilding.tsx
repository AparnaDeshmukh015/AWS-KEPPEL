
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "primereact/button";
import { useNavigate, useOutletContext } from "react-router-dom";
import InputField from "../../../components/Input/Input";
import { Card } from "primereact/card";
import { toast } from "react-toastify";
import moment from "moment";
import { ENDPOINTS } from "../../../utils/APIEndpoints";
import { dateFormat, LOCALSTORAGE, saveTracker, VALIDATION } from "../../../utils/constants";
import { callPostAPI } from "../../../services/apis";
import { useForm } from "react-hook-form";
import Field from "../../../components/Field";
import Checkboxs from "../../../components/Checkbox/Checkbox";
import Select from "../../../components/Dropdown/Dropdown";
import { useLocation } from "react-router-dom";
import HolidayList from "./HolidayList";
import { RadioButton } from "primereact/radiobutton";
import "../../../components/Radio/Radio.css";
import { validation } from "../../../utils/validation";
import { eventNotification, helperEventNotification } from "../../../utils/eventNotificationParameter";
import { appName } from "../../../utils/pagePath";
import { decryptData, encryptData } from "../../../utils/encryption_decryption";
import { EMAIL_REGEX } from "../../../utils/regEx";

const AddBuilding = () => {
  let location: any = useLocation();

  const { search } = useLocation()
  const [selectedFacility, menuList]: any = useOutletContext();
  const [selectedDetails, setSelectedDetails] = useState<any>([]);
  const currentMenu = menuList
    ?.flatMap((menu: any) => menu?.DETAIL)
    .filter((detail: any) => detail.URL === location?.pathname)[0];
  const { t } = useTranslation();
  const [currencyList, setCurrencyList] = useState([]);
  const [timeZone, setTimeZone] = useState([]);
  const [dateFormatType, setDateFormatType] = useState([]);
  const [weekList, setWeekList] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [checked, setChecked] = useState<any | null>(true);
  const [HOLIDAYLIST, setHolidayList] = useState([]);
  const [PPM_SCHEDULAR, setPPM_SCHEDULAR] = useState<any | null>();
  const navigate: any = useNavigate();
  const [error, setError] = useState<any | null>(false)
  const [errorEmail, setErrorEmail] = useState<any | null>(false)
  const assestTypeLabel: any = [
    { name: "Auto", key: "A" },
    { name: "Manual", key: "M" },
  ];
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,

    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      FACILITY_ID: location?.state !== null ? location?.state.facilityId : 0,
      MODE: location?.state !== null ? "E" : "A",
      FACILITY_NAME: "",
      FACILITY_LEGAL_NAME: "",
      CURRENCY: "",
      DATEFORMAT: "",
      FACILITY_ADDRESS: "",
      FACILITY_CITY: "",
      FACILITY_STATE: "",
      FACILITY_ZIP: "",
      FACILITY_COUNTRY: "",
      TIMEZONE: "",
      FACILITY_TIMEZONE: "",
      FACILITY_EMAIL_ID: "",
      FACILITY_CONTACT_NUMBER: "",
      AREA_UNIT: "",
      LOCATIONTYPE_ID: "1",
      WEEKOFF: "",
      ACTIVE: "",
      LOCATION_HOLIDAY_D: "",
      PORTFOLIO: "",
      WO_ASSIGN: "",
      PARA:
        location?.state !== null
          ? { para1: "Building set up", para2: t("Updated") }
          : { para1: "Building set up", para2: t("created") },
      // PPM_SCHEDULAR: PPM_SCHEDULAR,
      INHERIT_HOLIDAY: false,
      INHERIT_WORKING: false,
      REDIRECT_APPROVAL: false,
      MATREQ_APPROVAL: false,
      OBEM_INTEG_REQUIRED: false
    },
    // values:editData,
    mode: "all",
  });


  const User_Name = decryptData((localStorage.getItem("USER_NAME")))
  const showHandler = (e: any) => {
    // e.preventDefault();
    navigate(`${appName}/facilitydetail`);
  };



  const onSubmit = async (payload: any) => {
    try {
      let isValid: boolean = false;
      let isEmailValid: boolean = false;
      let msg: any = ''
      const holiday: any = HOLIDAYLIST?.map((holi: any) => {
        return {
          HOLIDAY_DATE: moment(holi.HOLIDAY_DATE).format('DD-MM-YYYY'),
          HOLIDAY_NAME: holi.HOLIDAY_NAME,
        };
      });
      payload.ACTIVE = payload?.ACTIVE ? 1 : 0;
      payload.CURRENCY_CODE = payload?.CURRENCY?.CURRENCY_CODE;
      payload.DATE_FORMAT = payload?.DATEFORMAT?.DATE_FORMAT;
      payload.FACILITY_TIMEZONE = payload?.TIMEZONE?.TIMEZONE_NAME;
      payload.FACILITY_OFFSET = payload?.TIMEZONE?.current_utc_offset;
      payload.FACILITY_UTS_MINUTES = payload?.TIMEZONE?.utc_minutes;
      payload.WEEKOFF_ID = payload?.WEEKOFF?.WEEKOFF_ID;
      // payload.ACTIVE = true;
      payload.LOCATION_HOLIDAY_D = holiday;
      payload.WO_ASSIGN = payload?.WO_ASSIGN?.key;
      payload.PORTFOLIO_ID = payload?.PORTFOLIO?.PORTFOLIO_ID;
      payload.PPM_SCHEDULAR = PPM_SCHEDULAR;
      payload.REDIRECT_APPROVAL = payload.REDIRECT_APPROVAL;
      payload.MATREQ_APPROVAL = payload.MATREQ_APPROVAL;
      payload.OBEM_INTEG_REQUIRED = payload.OBEM_INTEG_REQUIRED;
      payload.PARA=
      location?.state !== null
        ? { para1: "Building set up", para2: t("Updated") }
        : { para1: "Building set up", para2: t("created") };
         payload.FACILITY_ID= location?.state !== null ? location?.state.facilityId : 0;
         payload.MODE= location?.state !== null ? "E" : "A";
      delete payload.CURRENCY;
      delete payload.DATEFORMAT;
      delete payload?.WEEKOFF;
      delete payload?.TIMEZONE;
      delete payload?.PORTFOLIO;

      if (payload?.FACILITY_EMAIL_ID === '' || payload?.FACILITY_EMAIL_ID === undefined) {
        isEmailValid = true
      } else {
        const emailPattern =
          /^\s*[^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))\s*$/;
        if (emailPattern.test(payload?.FACILITY_EMAIL_ID)) {
          isEmailValid = true;
        } else {
          msg = "Please enter valid email.";

          isEmailValid = false;
          setErrorEmail(true);

        }
      }
      const phonePattern = /^[+]{1}(?:[0-9\-\\(\\)\\/.]\s?){6,15}[0-9]{1}$/; // Basic international format
      if (payload?.FACILITY_CONTACT_NUMBER === '' || payload?.FACILITY_CONTACT_NUMBER === undefined) {
        isValid = true
      }
      else if (phonePattern.test(payload?.FACILITY_CONTACT_NUMBER)) {

        if (payload?.FACILITY_CONTACT_NUMBER?.length < 6 || payload?.FACILITY_CONTACT_NUMBER?.length > 16) {
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
      console.log(payload, 'payload')
 
      if (isValid === true && isEmailValid === true) {
        const res = await callPostAPI(ENDPOINTS?.BUILDING_SAVE, payload);


        if (res?.FLAG === true) {
          toast.success(res?.MSG);
          const notifcation: any = {
            "FUNCTION_CODE": currentMenu?.FUNCTION_CODE,
            "EVENT_TYPE": "M",
            "STATUS_CODE": search === "?edit=" ? 2 : 1,
            "PARA1": search === "?edit=" ? User_Name : User_Name,
            "PARA2": payload?.FACILITY_NAME,
            PARA3: "",
            PARA4: payload?.AREA_UNIT,
            PARA5: "",
          };

          const eventPayload = { ...eventNotification, ...notifcation };
          helperEventNotification(eventPayload);
          const res1 = await callPostAPI(ENDPOINTS?.BUILDING_DETAILS);
          if (res1?.FLAG === 1) {
            localStorage.setItem(LOCALSTORAGE.FACILITYID, JSON.stringify(res1?.FACILITYDETAILS[0]))
            // const Facility_Id:any=encryptData(JSON.stringify(res1?.FACILITYDETAILS[0])) 

            // localStorage.setItem(LOCALSTORAGE.FACILITYID,Facility_Id)
            const res2 = await callPostAPI(ENDPOINTS?.BUILDING_GET, {});
            if (res2?.FLAG === 1) {
              localStorage.setItem(
                LOCALSTORAGE.FACILITY,
              JSON.stringify(res2?.FACILITYLIST)
              );

              navigate(`${appName}/facilitydetail`);
            }
            //  localStorage.setItem(LOCALSTORAGE.FACILITYID, JSON.stringify(res?.FACILITYDETAILS[0]))
          }

          // if (location?.state === null) {
          //   const res1 = await callPostAPI(ENDPOINTS?.BUILDING_GET, {});
          //   if (res1?.FLAG === 1) {
          //     localStorage.setItem(
          //       LOCALSTORAGE.FACILITY,
          //       JSON.stringify(res1?.FACILITYLIST)
          //     );
          //     navigate(`${appName}/facilitydetail`);
          //   }
          // }

        }

        if (res?.FLAG === false) {
          toast.error(res?.MSG);
        }
      } else {
        toast.error(msg)
      }
    } catch (error: any) {
      toast.error(error);
    }
  };

  const getCommonFacility = async () => {
    try {
      let payload: any = {
        LOCATION_ID: "0",
      };
      const res = await callPostAPI(ENDPOINTS.FACILITYSETUPLIST, payload);

      if (res?.FLAG === 1) {
        setCurrencyList(res?.CURRENCYLIST);
        setDateFormatType(res?.DATEFORMATELIST);
        setTimeZone(res?.TIMEZONELIST);
        setWeekList(res?.WEEKOFFLIST);
        setPortfolio(res?.PORFOLIOLIST);
        if (location?.state === null) {
          setChecked(true);
          setValue("ACTIVE", checked);

          setPPM_SCHEDULAR("S");
        }

        if (search === "?edit=") {
          // console.log(location?.state, "location ststu")
          getFacilityDetails()

        }
      }
    } catch (error: any) {
      toast.error(error);
    }
  };


  const getFacilityDetails = async () => {

    if (location?.state !== null) {
      let editData: any = location?.state;

      let payload: any = {
        FACILITY_ID: editData?.facilityId,
        LOCATION_ID: editData?.locationId,
      }


      const res = await callPostAPI(ENDPOINTS?.BUILDING_DETAILS, payload);
      if (res.FLAG === 1) {

        setSelectedDetails(res.FACILITYDETAILS[0]);
        setChecked(res?.FACILITYDETAILS[0]?.ACTIVE === true ? true : false);
        setValue("ACTIVE", res?.FACILITYDETAILS[0]?.ACTIVE);
        setHolidayList(res?.HOLIDAYLIST);
        setValue("FACILITY_NAME", res.FACILITYDETAILS[0]?.FACILITY_NAME);
        setValue(
          "FACILITY_LEGAL_NAME",
          res.FACILITYDETAILS[0]?.LEGAL_ENTITY_NAME
        );

        setValue("FACILITY_ADDRESS", res?.FACILITYDETAILS[0]?.FACILITY_ADDRESS);

        setValue("FACILITY_CITY", res.FACILITYDETAILS[0]?.FACILITY_CITY);
        setValue("FACILITY_STATE", res.FACILITYDETAILS[0]?.FACILITY_STATE);
        setValue("FACILITY_ZIP", res.FACILITYDETAILS[0]?.FACILITY_ZIP);
        setValue(
          "FACILITY_COUNTRY",
          res.FACILITYDETAILS[0]?.FACILITY_COUNTRY_CODE
        );

        setValue("FACILITY_EMAIL_ID", res.FACILITYDETAILS[0]?.EMAIL_ID);
        setValue(
          "FACILITY_CONTACT_NUMBER",
          res.FACILITYDETAILS[0]?.CONTACT_NUMBER
        );
        setValue("AREA_UNIT", res.FACILITYDETAILS[0]?.AREA_UNIT);
        setValue("REDIRECT_APPROVAL", res.FACILITYDETAILS[0]?.REDIRECT_APPROVAL === true ? true : false)
        setValue("MATREQ_APPROVAL", res.FACILITYDETAILS[0]?.MATREQ_APPROVAL === true ? true : false)
        setValue("OBEM_INTEG_REQUIRED", res.FACILITYDETAILS[0]?.OBEM_INTEG_REQUIRED === true ? true : false)

        setPPM_SCHEDULAR(res.FACILITYDETAILS[0]?.PPM_SCHEDULAR);
      }
    }
  };

  console.log(selectedDetails, "set")
  // useEffect(() => {
  //   getCommonFacility();
  //   saveTracker(currentMenu)
  // }, [selectedFacility]);
  console.log(location?.state, search, '555')
  useEffect(() => {
    getCommonFacility();
    if (location?.state === null || search === "") {
      reset({
        WO_ASSIGN: "",
        WEEKOFF: "",
        TIMEZONE: "",

      });
      setSelectedDetails([]);
      console.log(selectedDetails, "selectedDetails")
      setHolidayList([]);

      setChecked(false);
      // setValue("ACTIVE", );
      setHolidayList([]);
      setValue("FACILITY_NAME", "");
      setValue(
        "FACILITY_LEGAL_NAME",
        ""
      );

      setValue("FACILITY_ADDRESS", "");

      setValue("FACILITY_CITY", "");
      setValue("FACILITY_STATE", "");
      setValue("FACILITY_ZIP", "");
      setValue(
        "FACILITY_COUNTRY",
        ""
      );

      setValue("FACILITY_EMAIL_ID", "");
      setValue(
        "FACILITY_CONTACT_NUMBER",
        ""
      );
      setValue("AREA_UNIT", "");
      setValue("REDIRECT_APPROVAL", false)
      setValue("MATREQ_APPROVAL", false)
      setValue("OBEM_INTEG_REQUIRED", false)

      setPPM_SCHEDULAR([]);
    }
    saveTracker(currentMenu);
  }, [location, selectedFacility]);

  useEffect(() => {
    if (!isSubmitting && Object?.values(errors)[0]?.type === "required") {
      const check: any = Object?.values(errors)[0]?.message;
      toast?.error(t(check));
    }
  }, [isSubmitting]);



  return (
    <>
      <section className="w-full">
        <form autoComplete="on">
          <div className="flex justify-between mt-1">
            <div>
              <h6 className="Text_Primary">
                {location?.state === null
                  ? currentMenu?.FUNCTION_DESC
                  : location?.state?.addHeaderName}{" "}
              </h6>
            </div>
            <div className="flex">
              <>
                {search === "?edit=" ?
                  <>
                    {currentMenu?.UPDATE_RIGHTS === "True" && (<Button
                      className="Primary_Button  w-20 me-2"
                      label={t("Save")}
                      onClick={handleSubmit(onSubmit)}
                    />)}
                  </>
                  :
                  <>
                    {currentMenu?.ADD_RIGHTS === "True" && (<Button
                      className="Primary_Button  w-20 me-2"
                      label={t("Save")}
                      onClick={handleSubmit(onSubmit)}
                    />)}
                  </>
                }
              </>
              <Button
                className="Secondary_Button  w-20"
                label={t("List")}
                onClick={(e) => showHandler(e)}
              />
            </div>
          </div>
          <Card className="mt-2">
            <div className=" grid grid-cols-1 gap-x-4 gap-y-4 md:grid-cols-3 lg:grid-cols-3">
              <Field
                controller={{
                  name: "FACILITY_NAME",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <InputField
                        {...register("FACILITY_NAME", {
                          required: t("Please fill the required fields."),
                        })}
                        label={"Building Name"}
                        require={true}
                        setValue={setValue}
                        invalid={errors.FACILITY_NAME}
                        {...field}
                      />
                    );
                  },
                }}
                error={errors?.FACILITY_NAME?.message}
              />

              <Field
                controller={{
                  name: "FACILITY_LEGAL_NAME",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <InputField
                        {...register("FACILITY_LEGAL_NAME", {
                          required: t("Please fill the required fields."),
                        })}
                        setValue={setValue}
                        require={true}
                        label={"Legal_Building_Entity_Name"}
                        invalid={errors.FACILITY_LEGAL_NAME}
                        {...field}
                      />
                    );
                  },
                }}
                error={errors?.FACILITY_LEGAL_NAME?.message}
              />
              <Field
                controller={{
                  name: "PORTFOLIO",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <Select
                        options={portfolio}
                        optionLabel="PORTFOLIO_NAME"
                        {...register("PORTFOLIO", {
                          required: "",
                        })}
                        label={"Portfolio"}
                        selectedData={search === "?edit=" ? selectedDetails?.PORTFOLIO_ID : ""}
                        findKey={"PORTFOLIO_ID"}
                        setValue={setValue}
                        {...field}
                      />
                    );
                  },
                }}
                error={{}}
              />
              <div className={errorEmail === true ? "errorBorder" : ""}>
                <Field
                  controller={{
                    name: "FACILITY_EMAIL_ID",
                    control: control,
                    render: ({ field }: any) => {
                      return (
                        <InputField
                          {...register("FACILITY_EMAIL_ID", {
                            onChange: ((e: any) => {
                              setErrorEmail(false)
                              // setError(false)
                            }),


                          })}
                          label={"Email Id"}
                          setValue={setValue}
                          // invalid={errors.FACILITY_EMAIL_ID}
                          {...field}
                        />
                      );
                    },
                  }}
                  error={{}}
                /></div>
              <div className={error === true ? "errorBorder" : ""}>
                <Field
                  controller={{
                    name: "FACILITY_CONTACT_NUMBER",
                    control: control,
                    render: ({ field }: any) => {
                      return (
                        <InputField
                          {...register("FACILITY_CONTACT_NUMBER", {
                            onChange: ((e: any) => {
                              setError(false)
                            }),
                            validate: (fieldValue: any) => {
                              return validation?.onlyPhoneWithInternationNumber(
                                fieldValue,
                                "FACILITY_CONTACT_NUMBER",
                                setValue
                              );
                            },

                          })}
                          label={"Contact Number"}
                          // setValue={setValue}
                          invalid={""}
                          invalidMessage={
                            errors?.FACILITY_CONTACT_NUMBER?.message
                          }
                          {...field}
                        />
                      );
                    },
                  }}
                /></div>

              <Field
                controller={{
                  name: "DATEFORMAT",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <Select
                        options={dateFormatType}
                        optionLabel="DATE_FORMAT"
                        {...register("DATEFORMAT", {
                          required: t("Please fill the required fields."),
                        })}
                        label={"Date Format"}
                        findKey={"DATE_FORMAT"}
                        require={true}
                        selectedData={search === "?edit=" || selectedDetails?.length > 0 ? selectedDetails?.DATE_FORMAT : ""}
                        setValue={setValue}
                        invalid={errors?.DATEFORMAT}
                        {...field}
                      />
                    );
                  },
                }}
              />
              <Field
                controller={{
                  name: "CURRENCY",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <Select
                        options={currencyList}
                        label={"Currency"}
                        optionLabel="CURRENCY_LONGNAME"
                        filter={true}
                        {...register("CURRENCY", {})}
                        findKey={"CURRENCY_CODE"}
                        selectedData={selectedDetails?.CURRENCY_CODE}
                        setValue={setValue}
                        {...field}
                      />
                    );
                  },
                }}
              />
              <Field
                controller={{
                  name: "AREA_UNIT",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <InputField
                        {...register("AREA_UNIT", {
                          required: "",
                        })}
                        label={"Area"}
                        setValue={setValue}
                        invalid={""}
                        {...field}
                      />
                    );
                  },
                }}
              />

              <Field
                controller={{
                  name: "FACILITY_ADDRESS",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <InputField
                        {...register("FACILITY_ADDRESS", {
                          required: t("Please fill the required fields."),
                        })}
                        require={true}
                        label={"Address"}
                        setValue={setValue}
                        invalid={errors.FACILITY_ADDRESS}
                        {...field}
                      />
                    );
                  },
                }}
                error={errors?.FACILITY_ADDRESS?.message}
              />
              <Field
                controller={{
                  name: "FACILITY_CITY",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <InputField
                        {...register("FACILITY_CITY", {
                          required: "",
                          validate: (fieldValue: any) => {
                            return validation?.onlyAlphabet(
                              fieldValue,
                              "FACILITY_CITY",
                              setValue
                            );
                          },
                        })}
                        label={"City"}
                        setValue={setValue}
                        invalidMessage={
                          errors?.FACILITY_CITY?.message
                        }
                        invalid={""}
                        {...field}
                      />
                    );
                  },
                }}
                error={{}}
              />
              <Field
                controller={{
                  name: "FACILITY_STATE",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <InputField
                        {...register("FACILITY_STATE", {
                          required: "",
                          validate: (fieldValue: any) => {
                            return validation?.onlyAlphabet(
                              fieldValue,
                              "FACILITY_STATE",
                              setValue
                            );
                          },
                        })}
                        label={"State"}
                        setValue={setValue}
                        invalid={""}
                        invalidMessage={
                          errors?.FACILITY_CITY?.message
                        }
                        {...field}
                      />
                    );
                  },
                }}
              />
              <Field
                controller={{
                  name: "FACILITY_COUNTRY",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <InputField
                        {...register("FACILITY_COUNTRY", {
                          required: t("Please fill the required fields."),
                          validate: (fieldValue: any) => {
                            return validation?.onlyAlphabet(
                              fieldValue,
                              "FACILITY_COUNTRY",
                              setValue
                            );
                          },
                        })}
                        require={true}
                        label={"Country"}
                        setValue={setValue}
                        invalid={errors.FACILITY_COUNTRY}
                        {...field}
                      />
                    );
                  },
                }}
              />
              <Field
                controller={{
                  name: "FACILITY_ZIP",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <InputField
                        {...register("FACILITY_ZIP", {
                          required: t("Please fill the required fields."),
                          validate: (fieldValue: any) => {
                            return validation?.onlyNumber(
                              fieldValue,
                              "FACILITY_ZIP",
                              setValue
                            );
                          },

                        })}
                        label={"Zip"}
                        require={true}

                        invalid={errors.FACILITY_ZIP}
                        {...field}

                      />
                    );
                  },
                }}
                error={errors?.FACILITY_ZIP?.message}
              />

              <Field
                controller={{
                  name: "TIMEZONE",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <Select
                        options={timeZone}
                        optionLabel="TIMEZONE_NAME"
                        {...register("TIMEZONE", {
                          required: t("Please fill the required fields."),
                        })}
                        label={"Time Zone"}
                        require={true}
                        filter={true}
                        findKey={"TIMEZONE_NAME"}
                        selectedData={search === "?edit=" ? selectedDetails?.TIME_ZONE : ""
                        }
                        setValue={setValue}
                        invalid={errors?.TIMEZONE
                        }
                        {...field}
                      />
                    );
                  },
                }}
              />
              <Field
                controller={{
                  name: "WO_ASSIGN",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <Select
                        {...register("WO_ASSIGN", {
                          required: t("Please fill the required fields."),
                        })}
                        options={assestTypeLabel}
                        label={"Work Order Assign"}
                        optionLabel="name"
                        require={true}

                        findKey={"key"}
                        selectedData={selectedDetails?.WO_ASSIGN}
                        setValue={setValue}
                        invalid={errors.WO_ASSIGN}
                        {...field}
                      />
                    );
                  },
                }}
              />
              <Field
                controller={{
                  name: "REDIRECT_APPROVAL",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <Checkboxs
                        {...register("REDIRECT_APPROVAL", {

                        })}
                        className=""
                        label="Redirect Approval"
                        checked={selectedDetails?.REDIRECT_APPROVAL === true ? true : false}
                        setValue={setValue}
                        {...field}
                      />
                    );
                  },
                }}
              />


              <Field
                controller={{
                  name: "MATREQ_APPROVAL",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <Checkboxs
                        {...register("MATREQ_APPROVAL", {

                        })}
                        className=""
                        label="Material Approval"
                        checked={selectedDetails?.MATREQ_APPROVAL === true ? true : false}
                        setValue={setValue}
                        {...field}
                      />
                    );
                  },
                }}
              />

              <Field
                controller={{
                  name: "OBEM_INTEG_REQUIRED",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <Checkboxs
                        {...register("OBEM_INTEG_REQUIRED", {

                        })}
                        className=""
                        label="Obem Integration Required"
                        checked={selectedDetails?.OBEM_INTEG_REQUIRED === true ? true : false}
                        setValue={setValue}
                        {...field}
                      />
                    );
                  },
                }}
              />
              <Field
                controller={{
                  name: "ACTIVE",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <Checkboxs
                        {...register("ACTIVE")}
                        className=""
                        label="Active"
                        checked={checked || false}
                        setValue={setValue}
                        {...field}
                      />
                    );
                  },
                }}
              />
            </div>
          </Card>

          <div className=" grid grid-cols-1 gap-3">
            <div className="">
              <Card className="mt-2">
                <div className=" grid grid-cols-1 gap-3 md:grid-cols-3 lg:grid-cols-3">
                  <div className="col-span-2 border-r">
                    <div className="">
                      <h6>{t("Working Schedule")}</h6>
                    </div>

                    <HolidayList
                      setHolidayList={setHolidayList}
                      disabled={false}
                      HOLIDAYLIST={HOLIDAYLIST}
                    />
                  </div>
                  <div className="mt-2">
                    <Field
                      controller={{
                        name: "WEEKOFF",
                        control: control,
                        render: ({ field }: any) => {
                          return (
                            <Select
                              options={weekList}
                              optionLabel="WEEKOFF_DESC"
                              {...register("WEEKOFF", {
                                required: t("Please fill the required fields."),
                              })}
                              require={true}
                              label={"Weekoff"}
                              findKey={"WEEKOFF_ID"}
                              selectedData={selectedDetails?.WEEKOFF_ID}
                              setValue={setValue}
                              invalid={errors.WEEKOFF}
                              {...field}
                            />
                          );
                        },
                      }}
                      error={{}}
                    />

                    <hr className="mt-2"></hr>
                    <div className="mb-2">
                      <label className="Text_Primary Table_Header">
                        {t("If PPM schedule date is on week off or holiday")}
                      </label>
                    </div>

                    <div>
                      <div className="flex align-items-center mb-2">
                        <RadioButton
                          inputId="WeekOff1"
                          name="PPM_SCHEDULAR"
                          value="B"
                          checked={PPM_SCHEDULAR === "B"}
                          onChange={(e: any) =>
                            setPPM_SCHEDULAR(e?.target?.value)
                          }
                        />

                        <label
                          htmlFor="WeekOff1"
                          className="ml-2 Text_Secondary Input_Label"
                        >
                          {t("Prepone A Day Before")}
                        </label>
                      </div>

                      <div className="flex align-items-center mb-2">
                        <RadioButton
                          inputId="WeekOff2"
                          name="PPM_SCHEDULAR"
                          value="A"
                          checked={PPM_SCHEDULAR === "A"}
                          onChange={(e: any) =>
                            setPPM_SCHEDULAR(e.target.value)
                          }
                        />

                        <label
                          htmlFor="WeekOff2"
                          className="ml-2 Text_Secondary Input_Label"
                        >
                          {t("Postpone A Day After")}
                        </label>
                      </div>

                      <div className="flex align-items-center">
                        <RadioButton
                          inputId="WeekOff3"
                          name="PPM_SCHEDULAR"
                          value="S"
                          checked={PPM_SCHEDULAR === "S"}
                          onChange={(e: any) =>
                            setPPM_SCHEDULAR(e.target.value)
                          }
                        />

                        <label
                          htmlFor="WeekOff3"
                          className="ml-2 Text_Secondary Input_Label"
                        >
                          {t("Keep On Same Day")}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </form>
      </section>
    </>
  );
};

export default AddBuilding;
