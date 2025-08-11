import React, { useState } from "react";
import Checkboxs from "../../../components/Checkbox/Checkbox";
import Select from "../../../components/Dropdown/Dropdown";
import InputField from "../../../components/Input/Input";
import Buttons from "../../../components/Button/Button";
import { Card } from "primereact/card";
import { toast } from "react-toastify";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import Field from "../../../components/Field";
import { callPostAPI } from "../../../services/apis";
import { ENDPOINTS } from "../../../utils/APIEndpoints";
import Radio from "../../../components/Radio/Radio";
import { useTranslation } from "react-i18next";
import { LOCALSTORAGE, ROLETYPECODE, saveTracker } from "../../../utils/constants";
import {
  eventNotification,
  helperEventNotification,
} from "../../../utils/eventNotificationParameter";
import FormHeader from "../../../components/FormHeader/FormHeader";
import { useLocation, useOutletContext } from "react-router-dom";
import { decryptData } from "../../../utils/encryption_decryption";


const UserRoleMasterForm = (props: any) => {
  var isDisabled: boolean = false;
  if (props?.selectedData === undefined) {
    isDisabled = false;
  } else {
    isDisabled = props?.isDisabled;
  }
  const { t } = useTranslation();

  let [roletypeOptions, setRoletypeOptions] = useState([]);
  const genericLabel = [
    { name: "Yes", key: "Y" },
    { name: "No", key: "N" },
  ];

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
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      MODE: props?.selectedData || search === '?edit=' ? "E" : "A",
      PARA: props?.selectedData || search === '?edit='
        ? { para1: `${props?.headerName}`, para2: "Updated" }
        : { para1: `${props?.headerName}`, para2: "Added" },
      ROLE_ID: props?.selectedData ? props?.selectedData?.ROLE_ID : search === '?edit=' ? dataId?.ROLE_ID : 0,
      ROLE_NAME: props?.selectedData ? props?.selectedData?.ROLE_NAME : search === '?edit=' ? dataId?.ROLE_NAME : "",
      ROLE_TYPE: props?.selectedData ? props?.selectedData?.ROLETYPE_NAME : dataId?.ROLETYPE_NAME
        ? roletypeOptions.filter(
          (item: any) =>
            item?.ROLETYPE_NAME === props?.selectedData ? props?.selectedData?.ROLETYPE_NAME : dataId?.ROLETYPE_NAME
        )[0]
        : " ",
      ASSIGN_ADD: props?.selectedData?.ASSIGN_ADD
        ? props.selectedData.ASSIGN_ADD
        : false,
      ACTIVE:
        props?.selectedData?.ACTIVE !== undefined
          ? props.selectedData.ACTIVE
          : true,
      FACILITY_GENERIC: props?.selectedData ? props?.selectedData?.FACILITY_GENERIC : search === '?edit=' ? dataId?.FACILITY_GENERIC : "",
    },
    mode: "onSubmit",
  });
  const User_Name = decryptData((localStorage.getItem("USER_NAME")))
  const getOptions = async () => {
    const payload = {
      NEW_USER_ID: 0,
    };
    const res = await callPostAPI(ENDPOINTS.GETROLETYPE, payload);
    setRoletypeOptions(res?.ROLETYPEMASTERLIST);
  };

  const ROLE_TYPE: any = watch("ROLE_TYPE");
  const onSubmit = async (payload: any) => {
    if (props?.selectedData === undefined) {
      payload.FACILITY_GENERIC =
        payload?.FACILITY_GENERIC?.key === "N" ? "N" : "Y";
    } else if (props?.selectedData?.FACILITY_GENERIC === "YES") {
      payload.FACILITY_GENERIC = payload.FACILITY_GENERIC === "Y" ?"Y":"N";
    } else if (props?.selectedData?.FACILITY_GENERIC === "NO") {
      payload.FACILITY_GENERIC = payload.FACILITY_GENERIC === "Y" ?"Y":"N";
    }

    payload.ROLETYPE_CODE = payload?.ROLE_TYPE?.ROLETYPE_CODE;
    payload.ROLE_NAME = payload.ROLE_NAME.trim();

    delete payload?.ROLE_TYPE;
    payload.ACTIVE = payload?.ACTIVE ? 1 : 0;
    payload.ASSIGN_ADD = payload?.ASSIGN_ADD ? 1 : 0;

    // return
    try {
      const res = await callPostAPI(ENDPOINTS.saveUserRoleMaster, payload);
      if (res?.FLAG === true) {
    
        toast?.success(res?.MSG);
        const notifcation: any = {
          "FUNCTION_CODE": props?.functionCode,
          "EVENT_TYPE": "M",
          "STATUS_CODE": search === "?edit=" ? 2 : 1,
          "PARA1": search === "?edit=" ? User_Name : User_Name,
          PARA2: payload?.ROLE_NAME,
          PARA3: ROLE_TYPE?.ROLETYPE_NAME,
        };

        const eventPayload = { ...eventNotification, ...notifcation };
        helperEventNotification(eventPayload);
        props?.getAPI();
        props?.isClick();
      } else {
       
        toast?.success(res?.MSG)
      }
    } catch (error: any) {
      toast.error(error);
    }
  };
  useEffect(() => {
    getOptions();

    saveTracker(currentMenu)

  }, []);

  useEffect(() => {
    if ((!isSubmitting && Object?.values(errors)[0]?.type === "required") || (!isSubmitting && Object?.values(errors)[0]?.type === "validate")) {
      const check: any = Object?.values(errors)[0]?.message;
      toast?.error(t(check));
    }
  }, [isSubmitting]);

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
            <div className={`${errors?.ROLE_NAME ? "errorBorder" : ""}`}>
              <Field
                controller={{
                  name: "ROLE_NAME",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <InputField
                        {...register("ROLE_NAME", {
                          required: t("Please fill the required fields."),
                          validate: value => value.trim() !== "" || t("Please fill the required fields.")

                        })}
                        require={true}
                        label="User Role"
                        invalid={errors.ROLE_NAME}
                        {...field}
                      />
                    );
                  },
                }}
                error={errors?.ROLE_NAME?.message}
              />
            </div>
            <div className={`${errors?.ROLE_TYPE ? "errorBorder" : ""}`}>
              <Field
                controller={{
                  name: "ROLE_TYPE",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <Select
                        options={roletypeOptions}
                        {...register("ROLE_TYPE", {
                          required: t("Please fill the required fields."),
                        })}
                        label="Role Type"
                        require={true}
                        optionLabel="ROLETYPE_NAME"
                        invalid={errors.ROLE_TYPE}
                        findKey={"ROLETYPE_NAME"}
                        disabled={isDisabled}
                        selectedData={props?.selectedData?.ROLETYPE_NAME}
                        setValue={setValue}
                        {...field}
                      />
                    );
                  },
                }}
                error={errors?.ROLE_TYPE?.message}
              />
            </div>
            {props?.selectedData?.FACILITY_ID !== 0 && (
              <Field
                controller={{
                  name: "FACILITY_GENERIC",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <>
                        <Radio
                          {...register("FACILITY_GENERIC", {
                            required: t("Please fill the required fields."),
                          })}
                          labelHead="Building Generic"
                          options={genericLabel}
                          selectedData={
                            props?.selectedData?.FACILITY_GENERIC || "Y"
                          }
                          disabled={
                            ((decryptData(localStorage.getItem(LOCALSTORAGE?.ROLETYPECODE)) !== ROLETYPECODE?.SYSTEM_ADMIN) && (decryptData(localStorage.getItem(LOCALSTORAGE?.ROLETYPECODE)) !== ROLETYPECODE?.SUPERVISOR))
                          }
                          setValue={setValue}
                          {...field}
                        />
                      </>
                    );
                  },
                }}
              />
            )}


            <div className="flex items-center">
              <Field
                controller={{
                  name: "ASSIGN_ADD",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <Checkboxs
                        {...register("ASSIGN_ADD", {

                        })}
                        className=""
                        label="Add Assignee"
                        checked={props?.selectedData?.ASSIGN_ADD || false}
                        setValue={setValue}
                        {...field}
                      />
                    );
                  },
                }}
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
                        className=""
                        label="Active"
                        disabled={isDisabled}
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

export default UserRoleMasterForm;
