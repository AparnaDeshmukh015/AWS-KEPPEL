import InputField from "../../../components/Input/Input";
import { Card } from "primereact/card";
import { useForm } from "react-hook-form";
import Field from "../../../components/Field";
import Checkboxs from "../../../components/Checkbox/Checkbox";
import { callPostAPI } from "../../../services/apis";
import { ENDPOINTS } from "../../../utils/APIEndpoints";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import { InputText } from "primereact/inputtext";
import { useTranslation } from "react-i18next";
import FormHeader from "../../../components/FormHeader/FormHeader";
import {
  eventNotification,
  helperEventNotification,
} from "../../../utils/eventNotificationParameter";
import { saveTracker } from "../../../utils/constants";
import { useLocation, useOutletContext } from "react-router-dom";
import { validation } from "../../../utils/validation";

// import { colors } from "@mui/material";

const UserMasterForm = (props: any) => {
  const [color, setColor] = useState("#ffffff");
  const { t } = useTranslation();
  let { pathname } = useLocation();
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
      SEVERITY_NAME:
        props?.selectedData ? props?.selectedData?.SEVERITY : search === '?edit=' ? dataId?.SEVERITY : "",
      ACTIVE:
        props?.selectedData?.ACTIVE !== undefined
          ? props.selectedData.ACTIVE
          : true,
      COLORS: props?.selectedData ? props?.selectedData?.COLORS : search === '?edit=' ? dataId?.COLORS : color,
      MODE: props?.selectedData || search === '?edit=' ? "E" : "A",
      SEVERITY_ID: props?.selectedData ? props?.selectedData?.SEVERITY_ID : 0,
      PARA: props?.selectedData || search === '?edit='
        ? { para1: `${props?.headerName}`, para2: "Updated" }
        : { para1: `${props?.headerName}`, para2: "Added" },
    },
    mode: "onSubmit",
  });

  const onSubmit = async (payload: any) => {
    payload.ACTIVE = payload?.ACTIVE ? 1 : 0;
    try {
      const res = await callPostAPI(ENDPOINTS.saveSeverityMaster, payload);
      if (res?.FLAG === true) {
        toast?.success(res?.MSG);
        props?.getAPI();
        props?.isClick();
      } else {
        toast?.error(res?.MSG);
      }

      const notifcation: any = {
        FUNCTION_CODE: props?.functionCode,
        EVENT_TYPE: "M",
        STATUS_CODE: props?.selectedData ? 2 : 1,
        PARA1: props?.selectedData
          ? "updated_by_user_name"
          : "created_by_user_name",
        PARA2: "severity",
      };

      const eventPayload = { ...eventNotification, ...notifcation };
      helperEventNotification(eventPayload);
      props?.getAPI();
      props?.isClick();
    } catch (error: any) {
      toast?.error(error);
    }
  };

  useEffect(() => {
    if ((!isSubmitting && Object?.values(errors)[0]?.type === "required") || (!isSubmitting && Object?.values(errors)[0]?.type === "validate")) {
      const check: any = Object?.values(errors)[0]?.message;
      toast?.error(check);
    }
  }, [isSubmitting]);
  useEffect(() => {
    saveTracker(currentMenu)
  }, [])

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
                name: "SEVERITY_NAME",
                control: control,
                render: ({ field }: any) => {
                  return (
                    <InputField
                      {...register("SEVERITY_NAME", {
                        required: "Please fill the required fields",
                        validate: (fieldValue: any) => {
                          return validation?.onlyAlphaNumeric(
                            fieldValue,
                            "SEVERITY_NAME",
                            setValue
                          );
                        },
                      })}
                      label="Priority"
                      require={true}
                      invalid={errors.SEVERITY_NAME}
                      {...field}
                    />
                  );
                },
              }}
              error={errors?.SEVERITY_NAME?.message}
            />

            <Field
              controller={{
                name: "COLORS",
                control: control,
                render: ({ field }: any) => {
                  return (
                    <div>
                      <span className="Text_Secondary Input_Label">
                        {t("Color")}
                      </span>
                      <InputText
                        type={"color"}
                        {...register("COLORS", {
                        })}
                        name={"color"}
                        value={color}
                        onChange={(e: any) => setColor(e.target.value)}
                        className={"colorpicker"}
                        placeholder={t("Please_Enter")}
                        {...field}
                      />
                    </div>
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
      </form>
    </section>
  );
};

export default UserMasterForm;
