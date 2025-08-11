import InputField from "../../../components/Input/Input";
import { Card } from "primereact/card";
import { useForm } from "react-hook-form";
import Field from "../../../components/Field";
import Checkboxs from "../../../components/Checkbox/Checkbox";
import { callPostAPI } from "../../../services/apis";
import { ENDPOINTS } from "../../../utils/APIEndpoints";
import { toast } from "react-toastify";
import { useCallback, useEffect, useState } from "react";
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
import Select from "../../../components/Dropdown/Dropdown";

const UserMasterForm = (props: any) => {
  const [color, setColor] = useState("#ffffff");
  const { t } = useTranslation();
  let { pathname } = useLocation();
  const [, menuList]: any = useOutletContext();
  const currentMenu = menuList
    ?.flatMap((menu: any) => menu?.DETAIL)
    .filter((detail: any) => detail.URL === pathname)[0];
  const [IsSubmit, setIsSubmit] = useState<any | null>(false);
  const priorityIcon: any = [{ "ICON_ID": 1, "ICON_NAME": "pi pi-angle-down" },
  { "ICON_ID": 2, "ICON_NAME": "pi pi-angle-double-up" }, { "ICON_ID": 3, "ICON_NAME": "pi pi-equals" }, { "ICON_ID": 4, "ICON_NAME": "pi pi-angle-up" }]

  const { search } = useLocation();
  const getId: any = localStorage.getItem("Id")
  const dataId = JSON.parse(getId)
  const FACILITY: any = localStorage.getItem("FACILITYID");
  const FACILITYID: any = JSON.parse(FACILITY);

  if (FACILITYID) {
    var facility_type: any = FACILITYID?.FACILITY_TYPE;

  }

  const {
    register,
    handleSubmit,
    control,
    reset,
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
      SEVERITY_DESC_D: props?.selectedData ? props?.selectedData?.SEVERITY_DESC_D : search === '?edit=' ? dataId?.SEVERITY_DESC_D : "",
      MODE: props?.selectedData || search === '?edit=' ? "E" : "A",
      SEVERITY_ID: props?.selectedData ? props?.selectedData?.SEVERITY_ID : 0,
      PARA: props?.selectedData || search === '?edit='
        ? { para1: `${props?.headerName}`, para2: "Updated" }
        : { para1: `${props?.headerName}`, para2: "Added" },
      ICON_ID: props?.selectedData ? props?.selectedData?.ICON_ID : search === '?edit=' ? dataId?.ICON_ID : "",
    },

    mode: "onSubmit",
  });

  const onSubmit = useCallback(async (payload: any) => {
    if (IsSubmit) return true
    setIsSubmit(true)
    payload.ACTIVE = payload?.ACTIVE ? 1 : 0;
    payload.ICON_ID = payload?.ICON_ID?.ICON_ID
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
      await helperEventNotification(eventPayload);
      props?.getAPI();

      props?.isClick();
    } catch (error: any) {
      toast?.error(error);

    } finally {
      setIsSubmit(false)
    }
  }, [IsSubmit, callPostAPI, toast, props?.getAPI, props?.isClick, props?.functionCode, props?.selectedData, helperEventNotification]);

  const selectedLocationTemplate = (option: any, props: any) => {
    if (option) {
      // option.LOCATION_DESCRIPTION = null;
      return (
        <div className="flex align-items-center">
          <div><i className={`${option.ICON_NAME} mr-2 `} ></i>{option.ICON_NAME !== null ? option.ICON_NAME : ''}</div>
        </div>
      );
    }

    return <span>{props.placeholder}</span>;
  };

  const locationOptionTemplate = (option: any) => {
    return (
      <div className="align-items-center">
        <div className="Text_Primary Table_Header"><i className={`${option.ICON_NAME} mr-2`} ></i>{option.ICON_NAME}</div>
        {/* <div className=" Text_Secondary Helper_Text">
        
          {option.ICON_NAME !== null ? option.ICON_NAME : ""
          }
        </div> */}
      </div>
    );
  };
  // useEffect(() => {
  //   if (dataId) {
  //     reset({
  //       SEVERITY_NAME: dataId.SEVERITY || "",
  //       ACTIVE: dataId.ACTIVE !== undefined ? dataId.ACTIVE : true,
  //       COLORS: dataId.COLORS || "#ffffff",
  //       SEVERITY_DESC_D: dataId.SEVERITY_DESC_D || "",
  //       MODE: "E",
  //       SEVERITY_ID: dataId.SEVERITY_ID || 0,
  //       PARA: { para1: props?.headerName, para2: "Updated" },
  //       ICON_ID: priorityIcon.find((icon:any) => icon.ICON_ID === dataId.ICON_ID) || null,
  //     });
  //     setColor(dataId.COLORS || "#ffffff");
  //   }
  // }, [reset]);
  useEffect(() => {

    const selectedPriorityIcon = priorityIcon?.find((icon: any) => icon?.ICON_ID === dataId?.ICON_ID) || [];

    if (selectedPriorityIcon && search === '?edit=') {
      setValue("ICON_ID", selectedPriorityIcon);
    } else {
      setValue("ICON_ID", []);
    }

  }, [search]);
  useEffect(() => {
    if ((!isSubmitting && Object?.values(errors)[0]?.type === "required") || (!isSubmitting && Object?.values(errors)[0]?.type === "validate")) {
      const check: any = Object?.values(errors)[0]?.message;
      toast?.error(check);
    }
  }, [isSubmitting]);
  useEffect(() => {
    (async function () {
      await saveTracker(currentMenu)
    })();
  }, [])
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
                name: "SEVERITY_DESC_D",
                control: control,
                render: ({ field }: any) => {
                  return (
                    <InputField
                      {...register("SEVERITY_DESC_D", {
                        required: "Please fill the required fields",

                      })}
                      label="Description"
                      require={true}
                      invalid={errors.SEVERITY_DESC_D}
                      {...field}
                    />
                  );
                },
              }}
              error={errors?.SEVERITY_DESC_D?.message}
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
            {facility_type === "I" && (
              <Field
                controller={{
                  name: "ICON_ID",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <Select
                        options={priorityIcon}
                        {...register("ICON_ID", {
                          required: facility_type === "I" ? "Please fill the required fields" : "",
                        })}
                        label="Icon"
                        require={facility_type === "I" ? true : false}
                        optionLabel={"ICON_NAME"
                        }
                        filter={true}
                        valueTemplate={selectedLocationTemplate}
                        itemTemplate={locationOptionTemplate}
                        findKey={"ICON_ID"}
                        selectedData={dataId?.ICON_ID}
                        setValue={setValue}
                        invalid={facility_type === "I" ? errors.ICON_ID : ""}
                        className="locationDropdown w-full"

                        {...field}
                      />
                    );
                  },
                }}
              />)}
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
