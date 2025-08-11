import React, { useEffect, useState } from "react";
import InputField from "../../../components/Input/Input";
import Buttons from "../../../components/Button/Button";
import { Card } from "primereact/card";
import { toast } from "react-toastify";

import { SubmitErrorHandler, useForm } from "react-hook-form";
import Field from "../../../components/Field";
import { callPostAPI } from "../../../services/apis";
import { ENDPOINTS } from "../../../utils/APIEndpoints";
import Checkboxs from "../../../components/Checkbox/Checkbox";
import { useTranslation } from "react-i18next";
import { useLocation, useOutletContext } from 'react-router-dom';
import { EMAIL_REGEX } from "../../../utils/regEx";
import {
  eventNotification,
  helperEventNotification,
} from "../../../utils/eventNotificationParameter";
import FormHeader from "../../../components/FormHeader/FormHeader";
import { saveTracker } from "../../../utils/constants";
import { validation } from "../../../utils/validation";

const VendorMasterForm = (props: any) => {
  const { t } = useTranslation();
  const { search } = useLocation();
  const getId: any = localStorage.getItem("Id")
  const dataId = JSON.parse(getId)
  let { pathname } = useLocation();
  const [, menuList]: any = useOutletContext();
  const[error,setError] = useState<any|null>(false)
  const currentMenu = menuList
    ?.flatMap((menu: any) => menu?.DETAIL)
    .filter((detail: any) => detail.URL === pathname)[0];
  
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      MODE: props?.selectedData || search === '?edit=' ? "E" : "A",
      PARA: props?.selectedData || search === '?edit='
        ? { para1: `${props?.headerName}`, para2: "Updated" }
        : { para1: `${props?.headerName}`, para2: "Added" },

      VENDOR_NAME: props?.selectedData ? props?.selectedData?.VENDOR_NAME : search === '?edit=' ? dataId?.VENDOR_NAME : '',
      VENDOR_ADDRESS: props?.selectedData ? props?.selectedData?.VENDOR_ADDRESS : search === '?edit=' ? dataId?.VENDOR_ADDRESS : '',
      VENDOR_CONTACT_PERSON: props?.selectedData ? props?.selectedData?.VENDOR_CONTACT_PERSON : search === '?edit=' ? dataId?.VENDOR_CONTACT_PERSON : '',
      VENDOR_MOBILE: props?.selectedData ? props?.selectedData?.VENDOR_MOBILE : search === '?edit=' ? dataId?.VENDOR_MOBILE : '',
      VENDOR_PHONE: props?.selectedData ? props?.selectedData?.VENDOR_PHONE : search === '?edit=' ? dataId?.VENDOR_PHONE : '',
      VENDOR_EMAIL: props?.selectedData ? props?.selectedData?.VENDOR_EMAIL : search === '?edit=' ? dataId?.VENDOR_EMAIL : '',
      ACTIVE:
        props?.selectedData?.ACTIVE !== undefined
          ? props.selectedData.ACTIVE
          : true,
      VENDOR_ID: props?.selectedData ? props?.selectedData?.VENDOR_ID : search === '?edit=' ? dataId?.VENDOR_ID : 0,
    },
    mode: "all",
  });

  const onSubmit = async (payload: any) => {

    try {
      payload.ACTIVE = payload?.ACTIVE === true ? 1 : 0;
      let isValid: boolean = false;
      let msg: any = ''
     
      // if (alphabetPattern.test(payload?.MOBILE_NO)) {
      //   msg = "Please Enter valid email or phone number"
      //   isValid = false
      //   setError(true)
      // } else {
  
      const phonePattern = /^[+]{1}(?:[0-9\-\\(\\)\\/.]\s?){6,15}[0-9]{1}$/; // Basic international format
      if (phonePattern.test(payload?.VENDOR_MOBILE)) {
       
      if (payload?.VENDOR_MOBILE?.length < 6 || payload?.VENDOR_MOBILE?.length > 16) {
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
      if (isValid === true) {
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
        helperEventNotification(eventPayload);
        props?.getAPI();
        props?.isClick();
      } else {
        toast?.error(res?.MSG);
      }
    } else {
      toast.error(msg)
    }
    } catch (error: any) {
      toast.error(error);
    }
  };

  const onError: SubmitErrorHandler<any> = (errors, _) => {
    if (errors?.VENDOR_EMAIL) {
      toast.error(errors.VENDOR_EMAIL?.message?.toString())
    }
    else if (errors?.VENDOR_MOBILE) {
      toast.error(errors.VENDOR_MOBILE?.message?.toString())
    }
    else {
      toast.error('Please fill all the required field')
    }
  };
  useEffect(() => {
    saveTracker(currentMenu)
  }, [])
  return (
    <>
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
                  name: "VENDOR_NAME",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <InputField
                        {...register("VENDOR_NAME", {
                          required: "Please fill the required fields.",
                          validate: value => value.trim() !== "" || "Please fill the required fields."

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
                        {...register("VENDOR_ADDRESS", {
                        })}
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
              /></div>
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
                          validate: value => value.trim() !== "" || "Please fill the required fields.",
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
            </div>
          </Card>
        </form>
      </section>
    </>
  );
};

export default VendorMasterForm;
