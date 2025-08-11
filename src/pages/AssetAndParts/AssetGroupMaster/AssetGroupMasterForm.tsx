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
import { useLocation, useOutletContext } from "react-router-dom";
import FormHeader from "../../../components/FormHeader/FormHeader";
import LoaderS from "../../../components/Loader/Loader";
import { saveTracker } from "../../../utils/constants";
import { decryptData } from "../../../utils/encryption_decryption";

const AssetGroupMasterForm = (props: any) => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const [showLoader, setShowLoader] = useState<boolean>(false);
  const [IsSubmit, setIsSubmit] = useState<any|null>(false);
 
  const [, menuList]: any = useOutletContext();
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
        ? { para1: `${props?.headerName}`, para2: t("Updated") }
        : { para1: `${props?.headerName}`, para2: t("Added") },
      ASSETGROUP_ID: props?.selectedData ? props?.selectedData?.ASSETGROUP_ID : search === '?edit=' ? dataId?.ASSETGROUP_ID : 0,
      ASSETGROUP_NAME: props?.selectedData ? props?.selectedData?.ASSETGROUP_NAME : search === '?edit=' ? dataId?.ASSETGROUP_NAME : "",
      ACTIVE:search === '?edit=' ? dataId?.ACTIVE  : true,
      // ASSETGROUP_TYPE: pathname === "/servicegroupmaster" ? "N" : "A",
      ASSETGROUP_TYPE: currentMenu?.FUNCTION_CODE === "AS0011" ? "N" : "A",
    },
    mode: "onSubmit",
  });

  const User_Name = decryptData((localStorage.getItem("USER_NAME")))
  const onSubmit = useCallback(async (payload: any) => {
    setShowLoader(true);
    setIsSubmit(true)
    payload.ACTIVE = payload?.ACTIVE ? 1 : 0;
    try {
      const res = await callPostAPI(ENDPOINTS.SAVE_ASSET_GROUP_MASTER, payload);
      if (res.FLAG === true) {
        setShowLoader(false);
        toast?.success(res?.MSG);
        const notifcation: any = {
          "FUNCTION_CODE": currentMenu?.FUNCTION_CODE,
          "EVENT_TYPE": "M",
          "STATUS_CODE": search === "?edit=" ? 2 : 1,
          "PARA1": search === "?edit=" ? User_Name : User_Name,
          PARA2: payload?.ASSETGROUP_NAME,
        };

        const eventPayload = { ...eventNotification, ...notifcation };
          await helperEventNotification(eventPayload);
        props?.getAPI();
        props?.isClick();
      } else {
        setIsSubmit(false)
        setShowLoader(false);
        toast?.error(res?.MSG);
      }
    } catch (error: any) {
      setIsSubmit(false)
      setShowLoader(false);
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
    
  }, [])

  return (
    <section className="w-full">
      {showLoader ? (
        <LoaderS />
      ) : (
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
                  name: "ASSETGROUP_NAME",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <InputField
                        {...register("ASSETGROUP_NAME", {
                          required: t("Please fill the required fields."),
                          validate: value => value.trim() !== "" || t("Please fill the required fields")
                        })}
                        label="Group Name"
                        require={true}
                        invalid={errors.ASSETGROUP_NAME}
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
                          className="md:mt-7"
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
      )}
    </section>
  );
};

export default AssetGroupMasterForm;
