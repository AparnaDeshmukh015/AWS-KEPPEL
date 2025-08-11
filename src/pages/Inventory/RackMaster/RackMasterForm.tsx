import React, { useCallback, useState } from "react";
import Checkboxs from "../../../components/Checkbox/Checkbox";
import Select from "../../../components/Dropdown/Dropdown";
import InputField from "../../../components/Input/Input";
import { Card } from "primereact/card";
import { toast } from "react-toastify";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import Field from "../../../components/Field";
import { callPostAPI } from "../../../services/apis";
import { ENDPOINTS } from "../../../utils/APIEndpoints";
import { useTranslation } from "react-i18next";
import { useLocation, useOutletContext } from "react-router-dom";
import {
  eventNotification,
  helperEventNotification,
} from "../../../utils/eventNotificationParameter";
import FormHeader from "../../../components/FormHeader/FormHeader";
import { saveTracker } from "../../../utils/constants";

const RackMasterForm = (props: any) => {
  const { t } = useTranslation();
  let { pathname } = useLocation();
  const [, menuList]: any = useOutletContext();
  const [IsSubmit, setIsSubmit] = useState<any | null>(false);

  const currentMenu = menuList
    ?.flatMap((menu: any) => menu?.DETAIL)
    .filter((detail: any) => detail.URL === pathname)[0];
  let [storeOptions, setStoreOptions] = useState([]);
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
      MODE:search === '?edit=' ? "E" : "A",
      PARA: search === '?edit='
        ? { para1: `${props?.headerName}`, para2: "Updated" }
        : { para1: `${props?.headerName}`, para2: "Added" },
      RACK_ID: search === '?edit=' ? dataId?.RACK_ID : 0,
      RACK_NAME:  search === '?edit=' ? dataId?.RACK_NAME : '',
      STORE:  search === '?edit=' ? dataId?.STORE_NAME : '',
      ACTIVE:
        props?.selectedData?.ACTIVE !== undefined
          ? props.selectedData.ACTIVE
          : true,
    },
    mode: "onSubmit",
  });

  const onSubmit = useCallback(async (payload: any) => {
    if (IsSubmit) return true
    setIsSubmit(true)
    try {
      payload.ACTIVE = payload?.ACTIVE === true ? "1" : "0";
      payload.LOCATION_ID = payload?.STORE?.LOCATION_ID;
      payload.STORE_ID = payload?.STORE?.STORE_ID;
      delete payload?.STORE;
      const res = await callPostAPI(ENDPOINTS.RACKMASTER_SAVE, payload);
      if (res?.FLAG === true) {
        toast?.success(res?.MSG);
        const notifcation: any = {
          FUNCTION_CODE: props?.functionCode,
          EVENT_TYPE: "M",
          STATUS_CODE: props?.selectedData ? 2 : 1,
          PARA1: props?.selectedData
            ? "updated_by_user_name"
            : "created_by_user_name",
          PARA2: "rack_name",
          PARA3: "store_name",
        };

        const eventPayload = { ...eventNotification, ...notifcation };
        await helperEventNotification(eventPayload);
        props?.getAPI();

        props?.isClick();
      } else {
        setIsSubmit(false)
        toast?.error(res?.MSG);
      }
    } catch (error: any) {

      toast.error(error);
    } finally {
      setIsSubmit(false)
    }
  }, [IsSubmit, props?.functionCode, props?.selectedData, props?.getAPI, props?.isClick, callPostAPI, toast, eventNotification, helperEventNotification,]);


  const getOptions = async () => {
    const payload = {
      FORM_TYPE: "FORM",
    };
    const res = await callPostAPI(
      ENDPOINTS.STOREMASTER_LIST,
      payload,
      currentMenu?.FUNCTION_CODE
    );
    setStoreOptions(res?.INVENTORYMASTERSLIST);
  };

  useEffect(() => {
    (async function () {
      await  getOptions();
      await saveTracker(currentMenu)
     })();
  }, []);
  useEffect(() => {
    if (!isSubmitting && Object?.values(errors)[0]?.type === "required") {
      const check: any = Object?.values(errors)[0]?.message;
      toast?.error(t(check));
    } else {
    }
  }, [isSubmitting]);

  return (
    <section className="w-full">
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormHeader
          headerName={props?.headerName}
          isSelected={search === "?edit=" ? true : false}
          isClick={props?.isClick}
          IsSubmit={IsSubmit}
        />
        <Card className="mt-2">
          <div className="mt-1 grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-3 lg:grid-cols-3">
            <Field
              controller={{
                name: "RACK_NAME",
                control: control,
                render: ({ field }: any) => {
                  return (
                    <InputField
                      {...register("RACK_NAME", {
                        required: "Please fill the required fields.",
                        validate: value => value.trim() !== "" || "Please fill the required fields."
                      })}
                      label="Rack Name"
                      require={true}
                      invalid={errors.RACK_NAME}
                      {...field}
                    />
                  );
                },
              }}
            />
            <Field
              controller={{
                name: "STORE",
                control: control,
                render: ({ field }: any) => {
                  return (
                    <Select
                      options={storeOptions}
                      {...register("STORE", {
                        required: "Please fill the required fields.",
                      })}
                      label="Store Name"
                      require={true}
                      findKey={"STORE_NAME"}
                      optionLabel="STORE_NAME"
                      selectedData={search === "?edit=" ? dataId?.STORE_NAME : props?.selectedData?.STORE_NAME}
                      setValue={setValue}
                      invalid={errors.STORE}
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
                          dataId?.ACTIVE === true
                            ? true
                            : false 
                        }
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
    </section>
  );
};

export default RackMasterForm;
