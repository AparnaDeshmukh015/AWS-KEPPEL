import { useCallback, useEffect, useState } from "react";
import { callPostAPI } from "../../../services/apis";
import { ENDPOINTS } from "../../../utils/APIEndpoints";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import InputField from "../../../components/Input/Input";
import { Card } from "primereact/card";
import Field from "../../../components/Field";
import Checkboxs from "../../../components/Checkbox/Checkbox";
import { decryptData} from "../../../utils/encryption_decryption";

import {
  eventNotification,
  helperEventNotification,
} from "../../../utils/eventNotificationParameter";
import FormHeader from "../../../components/FormHeader/FormHeader";
import { saveTracker } from "../../../utils/constants";
import { useLocation, useOutletContext } from "react-router-dom";



const SkillsMasterForm = (props: any) => {
  const { t} = useTranslation();
  let { pathname } = useLocation();
  const [, menuList]: any = useOutletContext();
  const [IsSubmit, setIsSubmit] = useState<any | null>(false)
  const currentMenu = menuList
    ?.flatMap((menu: any) => menu?.DETAIL)
    .filter((detail: any) => detail.URL === pathname)[0];
  const { search } = useLocation();
  const getId: any = localStorage.getItem("Id")
  const dataId = JSON.parse(getId)
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
      SKILL_ID: props?.selectedData ? props?.selectedData?.SKILL_ID : search === '?edit=' ? dataId?.SKILL_ID : 0,
      SKILL_NAME: props?.selectedData ? props?.selectedData?.SKILL_NAME : search === '?edit=' ? dataId?.SKILL_NAME : "",
      ACTIVE:search === '?edit=' ? dataId?.ACTIVE  : true,
    },
    mode: "onSubmit",
  });

  const User_Name = decryptData((localStorage.getItem("USER_NAME")))

  const onSubmit = useCallback(async (payload: any) => {
    if(IsSubmit) return true
    setIsSubmit(true)
    payload.ACTIVE = payload?.ACTIVE ? 1 : 0;
    payload.SKILL_NAME = payload?.SKILL_NAME?.trim();

    try {
      const res = await callPostAPI(ENDPOINTS.SAVE_SKILL_MASTER, payload);

      if (res?.FLAG === true) {
        toast?.success(res?.MSG);
        const notifcation: any = {
          "FUNCTION_CODE": props?.functionCode,
          "EVENT_TYPE": "M",
          "STATUS_CODE": search === "?edit=" ? 2 : 1,
          "PARA1": search === "?edit=" ? User_Name : User_Name,
          PARA2: payload?.SKILL_NAME,
        };

        const eventPayload = { ...eventNotification, ...notifcation };
        await helperEventNotification(eventPayload);
        props?.getAPI();

        setIsSubmit(false)
        props?.isClick();
      } else {
        toast?.error(res?.MSG)
        setIsSubmit(false)
      }
    } catch (error: any) {
      
      toast?.error(error);
    }finally{
      setIsSubmit(false)
    }
  },[IsSubmit, search, props, eventNotification, toast]);

  useEffect(() => {
    if ((!isSubmitting && Object?.values(errors)[0]?.type === "required") || (!isSubmitting && Object?.values(errors)[0]?.type === "validate")) {
      const check: any = Object?.values(errors)[0]?.message;
      toast?.error(t(check));
    }
  }, [isSubmitting]);
  
  useEffect(() => {
    (async function () {
      await saveTracker(currentMenu)
     })();
  }, []);
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
          <div className="mt-1 grid grid-cols-1 gap-x-4 gap-y-4 md:grid-cols-4 lg:grid-cols-4">
            <div className={`${errors?.SKILL_NAME ? "errorBorder" : ""}`}>
              <Field
                controller={{
                  name: "SKILL_NAME",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <InputField
                        {...register("SKILL_NAME", {
                          required: t("Please fill the required fields."),
                          validate: value => value.trim() !== "" || t("Please fill the required fields.")
                        })}
                        label="Skill Name"
                        require={true}
                        invalid={errors.SKILL_NAME}
                        {...field}
                      />
                    );
                  },
                }}
                error={errors?.SKILL_NAME?.message}
              />
            </div>
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
      </form>
    </section>
  );
};

export default SkillsMasterForm;
