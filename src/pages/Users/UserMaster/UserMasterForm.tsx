import InputField from "../../../components/Input/Input";
import { Card } from "primereact/card";
import { SubmitErrorHandler, useForm } from "react-hook-form";
import Field from "../../../components/Field";
import Checkboxs from "../../../components/Checkbox/Checkbox";
import { callPostAPI } from "../../../services/apis";
import { ENDPOINTS } from "../../../utils/APIEndpoints";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import Radio from "../../../components/Radio/Radio";
import Select from "../../../components/Dropdown/Dropdown";
import MultiSelects from "../../../components/MultiSelects/MultiSelects";
import { useTranslation } from "react-i18next";
import {
  eventNotification,
  helperEventNotification,
} from "../../../utils/eventNotificationParameter";
import FormHeader from "../../../components/FormHeader/FormHeader";
import { validation } from "../../../utils/validation";
import { useLocation, useOutletContext } from "react-router-dom";
import { LOCALSTORAGE, saveTracker, VALIDATION } from "../../../utils/constants";
import { EMAIL_REGEX } from "../../../utils/regEx";
import { decryptData } from "../../../utils/encryption_decryption";


const UserMasterForm = (props: any) => {
  const { t } = useTranslation();
  const { search } = useLocation();
  const getId: any = localStorage.getItem("Id");
  const dataId = JSON.parse(getId);
  const [userroleOptions, setUserroleOptions] = useState([]);
  const [workForce, setWorkForce] = useState<any | null>([]);
  const [buildingOptions, setBuildingOptions] = useState<any | null>([]);
  const [workforceOptions, setWorkforceOptions] = useState([]);
  const [vendorNameOptions, setVendorNameOptions] = useState([]);
  const [selectedDetails, setSelectedDetails] = useState<any>([]);
  const [languageOptions, setLanguageOptions] = useState<any | null>([]);
  const [selectedF, setSelectedF] = useState<any | null>([]);
  const[error,setError]=useState<any|null>(false)
  const [showLoader, setShowLoader] = useState<boolean>(true);
  const userTypeLabel: any = [
    { name: "Internal", key: "I" },
    { name: "External", key: "E" },
  ];
  let { pathname } = useLocation();
  const [selectedFacility, menuList]: any = useOutletContext();
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
      MODE: props?.selectedData ? "E" : "A",
      PARA: props?.selectedData
        ? { para1: `${props?.headerName}`, para2: "Updated" }
        : { para1: `${props?.headerName}`, para2: "Added" },
      USER_NAME: props?.selectedData?.USER_NAME || "",
      EMAIL_ID: props?.selectedData?.USER_EMAILID,
      MOBILE_NO: props?.selectedData?.USER_MOBILENO,
      USER_ROLE: props?.selectedData?.USER_ROLE,
      FACILITY_LIST: "",
      EMPLOYEE_VENDOR: {},
      VENDOR_NAME: props?.selectedData?.VENDOR_NAME,
      EMPLOYEE_CODE: props?.selectedData?.EMPLOYEE_CODE ?? "",
      DEFAULT_LANGUAGE: "",
      USER_TYPE: "",
      ACTIVE:
        props?.selectedData?.ACTIVE !== undefined
          ? props.selectedData.ACTIVE
          : true,
    },
    mode: "all",
  });
  const User_Name = decryptData((localStorage.getItem("USER_NAME")))
  const EMPLOYEE_VENDOR: any = watch("EMPLOYEE_VENDOR");
  const USER_ROLE: any = watch("USER_ROLE");
  const EMPLOYEE_CODE: any = watch("EMPLOYEE_CODE");
  const VENDOR_NAME: any = watch("VENDOR_NAME");
  const USER_TYPEwatch: any = watch("USER_TYPE");

  const onSubmit = async (payload: any) => {
    let userID:any='';
     if(search === '?edit='){
      userID=selectedDetails?.USER_ID
     }
   
    payload.ACTIVE = payload?.ACTIVE ? 1 : 0;
    payload.ROLE_ID = payload?.USER_ROLE?.ROLE_ID;
    payload.NEW_USER_ID = search === '?edit=' ? userID : 0;
    payload.DEFAULT_LANGUAGE = payload?.DEFAULT_LANGUAGE?.LANGUAGE_CODE;
    payload.EMPLOYEE_VENDOR = payload?.EMPLOYEE_VENDOR?.WORKFORCE_TYPE;
    payload.VENDOR_CODE = payload?.VENDOR_NAME?.VENDOR_ID;
    payload.USER_NAME = payload?.USER_NAME?.trim();

    payload.USER_TYPE = payload?.USER_TYPE?.key === "I" ? "I" : "E";
    delete payload.USER_ROLE;
    delete payload.VENDOR_NAME;
    payload.MODE = props?.selectedData || search === "?edit=" ? "E" : "A";
    payload.PARA =
      props?.selectedData || search === "?edit="
        ? { para1: `${props?.headerName}`, para2: "Updated" }
        : { para1: `${props?.headerName}`, para2: "Added" };

        let isValid: boolean = false;
        let msg: any = ''
       
        // if (alphabetPattern.test(payload?.MOBILE_NO)) {
        //   msg = "Please Enter valid email or phone number"
        //   isValid = false
        //   setError(true)
        // } else {
    
        const phonePattern = /^[+]{1}(?:[0-9\-\\(\\)\\/.]\s?){6,15}[0-9]{1}$/; // Basic international format
        if (phonePattern.test(payload?.MOBILE_NO)) {
         
        if (payload?.MOBILE_NO?.length < 6 || payload?.MOBILE_NO?.length > 16) {
          msg = 'Please Enter valid Mobile Number'
              isValid = false
              setError(true)
        } else {
          isValid = true
        }}
        else {
          msg = 'Please Enter valid Mobile Number'
          isValid = false
          setError(true)
        }
            // if(payload?.MOBILE_NO?.length < 6 || payload?.MOBILE_NO?.length <16 ){
            //   isValid = true
            // } else {
            //   msg = 'Please Enter valid Mobile Number'
            //   isValid = false
            //   setError(true)
            // }
    
         
        // }
      
        if (isValid === true) {


    try {
      const filtered = payload?.FACILITY_LIST.filter((e: any) => e.FACILITY_ID === selectedFacility.FACILITY_ID);
      if (filtered.length !== 0 || User_Name !== payload.USER_NAME) {
       
        
        const res = await callPostAPI(ENDPOINTS?.USERMASTER_SAVE, payload, "A23");
        if (res?.FLAG) {
          toast?.success(res?.MSG);
          const res1 = await callPostAPI(ENDPOINTS?.BUILDING_GET, {});
          

          if (res1?.FLAG === 1) {
            localStorage.setItem(
              LOCALSTORAGE.FACILITY,
              JSON.stringify(res1?.FACILITYLIST)
            );
          }

          const notifcation: any = {
            "FUNCTION_CODE": props?.functionCode,
            "EVENT_TYPE": "M",
            "STATUS_CODE": search === "?edit=" ? 2 : 1,
            "PARA1": search === "?edit=" ? User_Name : User_Name,
            PARA2: payload?.USER_NAME,
            PARA3: payload?.EMAIL_ID,
            PARA4: payload?.MOBILE_NO,
            PARA5: USER_ROLE?.ROLE_NAME,
            PARA6: USER_TYPEwatch?.name
          };
          const eventPayload = { ...eventNotification, ...notifcation };
          helperEventNotification(eventPayload);
          props?.getAPI();
          props?.isClick();
        } else {
          toast?.error(res?.MSG);
        }
      } else {
        toast?.error(`${selectedFacility?.FACILITY_NAME ?? ''} facility is in use and cannot be unselected`);
      }


    } catch (error: any) {
      toast?.error('Something went wrong!');
    }} else {
       toast.error(msg)
    }
  };
  const onError: SubmitErrorHandler<any> = (errors, _) => {
    if (errors?.EMAIL_ID) {
      toast.error(errors.EMAIL_ID?.message?.toString())
    }
    else {
      toast.error('Please fill all the required field')
    }
  };
  const getUserDetails = async () => {
    setShowLoader(true);
    const getId: any = localStorage.getItem("Id");
    const assetId: any = JSON.parse(getId);
    const payload: any = {
      NEW_USER_ID:
        props?.selectedData === null
          ? assetId?.USER_ID
          : props?.selectedData?.USER_ID,
      ROLE_ID:
        props?.selectedData === null
          ? assetId?.ROLE_ID
          : props?.selectedData?.ROLE_ID,
    };

    try {
      const response = await callPostAPI(
        ENDPOINTS.getUserDetailsList,
        payload,
        props?.FUNCTION_CODE
      );

      if (response.FLAG === 1) {
        setSelectedF(response?.FACILITYLIST);
        setSelectedDetails(response?.USERDETAILS[0]);
        setValue(
          "EMPLOYEE_CODE",
          response?.USERDETAILS[0]?.EMPLOYEE_CODE ?? ""
        );
        setValue("VENDOR_NAME", response?.USERDETAILS[0]?.VENDOR_CODE);
        setValue("USER_NAME", response?.USERDETAILS[0]?.USER_NAME);
        setValue("EMAIL_ID", response?.USERDETAILS[0]?.USER_EMAILID);
        setValue("MOBILE_NO", response?.USERDETAILS[0]?.USER_MOBILENO);
      }
      setShowLoader(false);
    } catch (error) { }
  };

  const getOptions = async () => {
    const payload = {
      NEW_USER_ID: 0,
    };
    try {
      const res = await callPostAPI(ENDPOINTS.GETUSEROPTIONS, payload);
      setUserroleOptions(res?.ROLELIST);
      setBuildingOptions(res?.FACILITYLIST);
      setWorkforceOptions(res?.WORKFORCELIST);
      setVendorNameOptions(res?.VENDORLIST);
      setLanguageOptions(res?.LANGUAGELIST);
      if (search === "?edit=") {
        getUserDetails();
      }
    } catch (error) { }
  };

  useEffect(() => {
    if (USER_ROLE) {
      if (USER_ROLE?.ROLETYPE_CODE === "T") {
        setWorkForce(workforceOptions);
      } else {
        const workFoceData: any = workforceOptions.filter(
          (f: any) => f.WORKFORCE_TYPE !== "V"
        );
        setWorkForce(workFoceData);
      }
    }
  }, [USER_ROLE]);
  useEffect(() => {
    getOptions();
    saveTracker(currentMenu);
  }, []);

  // useEffect(() => {
  //   if (
  //     (!isSubmitting && Object?.values(errors)[0]?.type === "required")

  //   ) {
  //     const check: any = Object?.values(errors)[0]?.message;
  //     toast?.error(t(check));
  //   } else {
  //   }
  // }, [isSubmitting]);

  useEffect(() => {
    setValue("EMPLOYEE_CODE", EMPLOYEE_CODE);
    setValue("VENDOR_NAME", VENDOR_NAME);
  }, [EMPLOYEE_VENDOR]);

  return (
    <section className="w-full">
      <form onSubmit={handleSubmit(onSubmit, onError)}>
        <FormHeader
          headerName={props?.headerName}
          isSelected={props?.selectedData ? true : false}
          isClick={props?.isClick}
        />

        <Card className="mt-2">
          <div className="mt-1 grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-3 lg:grid-cols-3">
            <Field
              controller={{
                name: "USER_NAME",
                control: control,
                render: ({ field }: any) => {
                  return (
                    <InputField
                      {...register("USER_NAME", {
                        required: t("Please fill the required fields."),
                        validate: value => value.trim() !== "" || t("Please fill the required fields.")

                      })}
                      label="User Name"
                      require={true}
                      placeholder={t("Please Enter")}
                      invalid={errors.USER_NAME}
                      // invalidMessage={errors.MOBILE_NO?.message}
                      {...field}
                    />
                  );
                },
              }}
            />
            <Field
              controller={{
                name: "EMAIL_ID",
                control: control,
                render: ({ field }: any) => {
                  return (
                    <InputField
                      {...register("EMAIL_ID", {
                        required: t("Please fill the required fields."),
                        pattern: {
                          value: EMAIL_REGEX,
                          message: "Invalid email format",
                        },
                        maxLength: {
                          value: VALIDATION.Max_EMAIL_LENGTH,
                          message: `Max ${VALIDATION.Max_EMAIL_LENGTH} Characters Only`,
                        },
                      })}
                      label="Email Id"
                      require={true}
                      placeholder={t("Please Enter")}
                      invalid={errors.EMAIL_ID}
                      // invalidMessage={errors.EMAIL_ID?.message}
                      {...field}
                      setValue={setValue}
                    />
                  );
                },
              }}
            />
            <div className={error === true ? "errorBorder" : ""}>
            <Field
              controller={{
                name: "MOBILE_NO",
                control: control,
                render: ({ field }: any) => {
                  return (
                    <InputField
                      {...register("MOBILE_NO", {
                        required: true,
                        onChange:((e:any)=>{
                          setError(false)
                        }),
                        validate: (fieldValue: any) => {
                          return validation?.phoneWithInternationNumber(
                            fieldValue,
                            "MOBILE_NO",
                            setValue
                          );
                        },
       
                      })}
                      label="Mobile"
                      require={true}
                      placeholder={t("Please Enter")}
                      invalid={error === false ?errors.MOBILE_NO:''}
                      invalidMessage={errors.MOBILE_NO?.message}
                      {...field}
                      setValue={setValue}
                    />
                  );
                },
              }}
            />
            </div>
            <Field
              controller={{
                name: "USER_ROLE",
                control: control,
                render: ({ field }: any) => {
                  return (
                    <Select
                      options={userroleOptions}
                      {...register("USER_ROLE", {
                        required: t("Please fill the required fields."),
                      })}
                      label="User Role"
                      optionLabel="ROLE_NAME"
                      placeholder={t("Please Select")}
                      require={true}
                      findKey={"ROLE_ID"}
                      selectedData={selectedDetails?.ROLE_ID}
                      invalid={errors.USER_ROLE}
                      setValue={setValue}
                      {...field}
                    />
                  );
                },
              }}
            />
            <Field
              controller={{
                name: "FACILITY_LIST",
                control: control,
                render: ({ field }: any) => {
                  return (
                    <MultiSelects
                      options={buildingOptions}
                      {...register("FACILITY_LIST", {
                        required: t("Please fill the required fields."),
                      })}
                      label="Building Name"
                      optionLabel="FACILITY_NAME"
                      require={true}
                      setValue={setValue}
                      selectedData={selectedF}
                      findKey={"FACILITY_NAME"}
                      invalid={errors.FACILITY_LIST}
                      {...field}
                    />
                  );
                },
              }}
            />
            <Field
              controller={{
                name: "EMPLOYEE_VENDOR",
                control: control,
                render: ({ field }: any) => {
                  return (
                    <Select
                      options={workforceOptions}
                      {...register("EMPLOYEE_VENDOR", {
                        required: t("Please fill the required fields."),
                      })}
                      label="Workforce Type"
                      optionLabel="WORKFORCE_NAME"
                      placeholder={t("Please Select")}
                      findKey={"WORKFORCE_TYPE"}
                      require={true}
                      selectedData={selectedDetails?.EMPLOYEE_VENDOR}
                      setValue={setValue}
                      invalid={errors.EMPLOYEE_VENDOR}
                      {...field}
                    />
                  );
                },
              }}
            />

            {EMPLOYEE_VENDOR?.WORKFORCE_TYPE === "E" ? (
              <Field
                controller={{
                  name: "EMPLOYEE_CODE",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <InputField
                        {...register("EMPLOYEE_CODE", {
                          //   required: "Please fill the required fields.",
                        })}
                        label="Employee Code"
                        placeholder={t("Please Enter")}
                        invalid={errors.EMPLOYEE_CODE}
                        {...field}
                      />
                    );
                  },
                }}
              />
            ) : (
              <Field
                controller={{
                  name: "VENDOR_NAME",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <Select
                        {...register("VENDOR_NAME", {
                          required: t("Please fill the required fields."),
                        })}
                        label="Vendor Name"
                        options={vendorNameOptions}
                        optionLabel="VENDOR_NAME"
                        placeholder={t("Please Select")}
                        findKey={"VENDOR_ID"}
                        require={true}
                        selectedData={selectedDetails?.VENDOR_CODE}
                        setValue={setValue}
                        invalid={errors.VENDOR_NAME}
                        {...field}
                      />
                    );
                  },
                }}
              />
            )}
            <Field
              controller={{
                name: "DEFAULT_LANGUAGE",
                control: control,
                render: ({ field }: any) => {
                  return (
                    <Select
                      {...register("DEFAULT_LANGUAGE", {
                        required: t("Please fill the required fields."),
                      })}
                      options={languageOptions}
                      label="Default Language"
                      optionLabel="LANGUAGE_DESCRIPTION"
                      placeholder={t("Please Select")}
                      findKey={"LANGUAGE_CODE"}
                      require={true}
                      selectedData={selectedDetails?.DEFAULT_LANGUAGE}
                      setValue={setValue}
                      invalid={errors.DEFAULT_LANGUAGE}
                      {...field}
                    />
                  );
                },
              }}
            />

            <Field
              controller={{
                name: "USER_TYPE",
                control: control,
                render: ({ field }: any) => {
                  return (
                    <>
                      <Radio
                        {...register("USER_TYPE", {
                          required: t("Please fill the required fields."),
                        })}
                        labelHead="User Type"
                        options={userTypeLabel}
                        selectedData={selectedDetails?.USER_TYPE || "E"}
                        setValue={setValue}
                        {...field}
                      />
                    </>
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
                        checked={props?.selectedData?.ACTIVE || false}
                        label="Active"
                        setValue={setValue}
                        {...field}
                      />
                    );
                  },
                }}
              />
            </div>
          </div>
        </Card>
      </form>
    </section>
  );
};

export default UserMasterForm;
