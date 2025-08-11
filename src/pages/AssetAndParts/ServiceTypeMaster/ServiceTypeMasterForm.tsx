import InputField from "../../../components/Input/Input";
import { Card } from "primereact/card";
import { useForm } from "react-hook-form";
import Field from "../../../components/Field";
import Checkboxs from "../../../components/Checkbox/Checkbox";
import { callPostAPI } from "../../../services/apis";
import { ENDPOINTS } from "../../../utils/APIEndpoints";
import { toast } from "react-toastify";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  eventNotification,
  helperEventNotification,
} from "../../../utils/eventNotificationParameter";
import Select from "../../../components/Dropdown/Dropdown";
import FormHeader from "../../../components/FormHeader/FormHeader";
import { saveTracker } from "../../../utils/constants";
import { useLocation, useOutletContext } from "react-router-dom";
import { decryptData } from "../../../utils/encryption_decryption";

const ServiceTypeMasterForm = (props: any) => {
  const [options, setOptions] = useState<any | null>([]);
  const [IsSubmit, setIsSubmit] = useState<any|null>(false);
  const { t } = useTranslation();
  const { search } = useLocation();
  const getId: any = localStorage.getItem("Id")
  const dataId = JSON.parse(getId)
  let { pathname } = useLocation();
  const [, menuList]: any = useOutletContext();
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
      MODE: props?.selectedData || search === '?edit=' ? "E" : "A",
      PARA: props?.selectedData || search === '?edit='
        ? { para1: `${props?.headerName}`, para2: t("Updated") }
        : { para1: `${props?.headerName}`, para2: t("Added") },
      ASSETTYPE_ID: props?.selectedData ? props?.selectedData?.ASSETTYPE_ID : search === '?edit=' ? dataId?.ASSETTYPE_ID : 0,
      ASSETTYPE: "N",
      ASSETTYPE_NAME: props?.selectedData ? props?.selectedData?.ASSETTYPE_NAME : search === '?edit=' ? dataId?.ASSETTYPE_NAME : '',
      ACTIVE:search === '?edit=' ? dataId?.ACTIVE  : true,
      ASSETGROUP_ID: props?.selectedData ? props?.selectedData?.ASSETGROUP_NAME : search === '?edit=' ? dataId?.ASSETGROUP_NAME : '',
    },
    mode: "onSubmit",
  });
  
  const User_Name = decryptData((localStorage.getItem("USER_NAME")))
  const watchGroup: any = watch("ASSETGROUP_ID")
  const onSubmit = useCallback(async (payload: any) => {
    if(IsSubmit) return true
    setIsSubmit(true)
    payload.ACTIVE = payload?.ACTIVE ? 1 : 0;
    payload.ASSETGROUP_ID = payload?.ASSETGROUP_ID?.ASSETGROUP_ID
    try {
      const res = await callPostAPI(ENDPOINTS.SAVE_ASSET_TYPE_MASTER, payload);
      if (res.FLAG === true) {
        toast?.success(res?.MSG);
        const notifcation: any = {
          "FUNCTION_CODE": currentMenu?.FUNCTION_CODE,
          "EVENT_TYPE": "M",
          "STATUS_CODE": search === "?edit=" ? 2 : 1,
          "PARA1": search === "?edit=" ? User_Name : User_Name,
          "PARA2": payload?.ASSETTYPE_NAME,
          "PARA3": watchGroup?.ASSETGROUP_NAME
        };

        const eventPayload = { ...eventNotification, ...notifcation };
        await helperEventNotification(eventPayload);
        props?.getAPI();
        props?.isClick();
      } else {
        toast?.error(res?.MSG);
      }
    } catch (error: any) {
      toast?.error(error);
    }finally{
      setIsSubmit(false)
    }
  },[IsSubmit, search, props, eventNotification, toast]);

  const getOptions = async () => {
    const payload = {
      ASSETTYPE: "N",
    };
    try {
      const res = await callPostAPI(ENDPOINTS.GETASSETMASTEROPTIONS, payload);
      setOptions({
        assetGroup: res?.ASSESTGROUPLIST,
      });
    } catch (error) { }
  };

  useEffect(() => {
    if (!isSubmitting && Object?.values(errors)[0]?.type === "required") {
      const check: any = Object?.values(errors)[0]?.message;
      toast?.error(t(check));
    } else {
    }
  }, [isSubmitting]);

  useEffect(() => {
    (async function () {
      await getOptions();
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
        />
        <Card className="mt-2">
          <div className="mt-1 grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-3 lg:grid-cols-3">
            <Field
              controller={{
                name: "ASSETTYPE_NAME",
                control: control,
                render: ({ field }: any) => {
                  return (
                    <InputField
                      {...register("ASSETTYPE_NAME", {
                        required: t("Please fill the required fields."),
                      })}
                      label="Service Type Name"
                      require={true}
                      invalid={errors.ASSETTYPE_NAME}
                      {...field}
                    />
                  );
                },
              }}
              error={errors?.ASSETTYPE_NAME?.message}
            />
            <Field
              controller={{
                name: "ASSETGROUP_ID",
                control: control,
                render: ({ field }: any) => {
                  return (
                    <Select
                      options={options?.assetGroup}
                      {...register("ASSETGROUP_ID", {
                        required: t("Please fill the required fields.")
                      })}
                      label="Service Group"
                      require={true}
                      optionLabel="ASSETGROUP_NAME"
                      findKey={"ASSETGROUP_ID"}
                      invalid={errors?.ASSETGROUP_ID}
                      selectedData={search === "?edit=" ?dataId?.ASSETGROUP_ID:""}
                      setValue={setValue}
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
                        // checked={}
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

export default ServiceTypeMasterForm;
