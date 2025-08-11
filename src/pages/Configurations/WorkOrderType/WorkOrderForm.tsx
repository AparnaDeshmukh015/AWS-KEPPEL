import { useCallback, useEffect, useState } from "react";
import InputField from "../../../components/Input/Input";
import { Card } from "primereact/card";
import { useForm } from "react-hook-form";
import Field from "../../../components/Field";
import { callPostAPI } from "../../../services/apis";
import { ENDPOINTS } from "../../../utils/APIEndpoints";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { InputText } from "primereact/inputtext";
import FormHeader from "../../../components/FormHeader/FormHeader";
import { useLocation, useOutletContext } from 'react-router-dom';
import { saveTracker } from "../../../utils/constants";
import Checkboxs from '../../../components/Checkbox/Checkbox';
const WorkOrderForm = (props: any) => {
  const { t } = useTranslation();
  const [color, setColor] = useState("000");
  const { search } = useLocation();
  const getId: any = localStorage.getItem("Id")
  const dataId = JSON.parse(getId)
  let { pathname } = useLocation();
  const [, menuList]: any = useOutletContext();
  const [IsSubmit, setIsSubmit] = useState<any | null>(false);

  const currentMenu = menuList
    ?.flatMap((menu: any) => menu?.DETAIL)
    .filter((detail: any) => detail.URL === pathname)[0];
  const FACILITY: any = localStorage.getItem("FACILITYID")
  const FACILITYID: any = JSON.parse(FACILITY)

  if (FACILITYID) {
    var facility_type: any = FACILITYID?.FACILITY_TYPE

  }

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      MODE: props?.selectedData || search === '?edit=' ? 'E' : 'A',
      PARA:
        props?.selectedData || search === "?edit="
          ? { para1: `${props?.headerName}`, para2: "Updated" }
          : { para1: `${props?.headerName}`, para2: "Added" },
      FORM_TYPE: "WT",

      DESCRIPTION: props?.selectedData
        ? props?.selectedData?.WO_TYPE_NAME
        : search === "?edit="
          ? dataId?.WO_TYPE_NAME
          : "",
      COLORS: props?.selectedData
        ? props?.selectedData?.COLORS
        : search === "?edit="
          ? dataId?.COLORS
          : color,
      ISPM: props?.selectedData ? props?.selectedData?.ISPM : search === '?edit=' ? dataId?.ISPM : false,
      ACTIVE: props?.selectedData?.ACTIVE !== undefined ? props.selectedData.ACTIVE : true,
      WO_CODE: props?.selectedData ? props?.selectedData?.WO_TYPE_CODE : search === '?edit=' ? dataId?.WO_TYPE_CODE : '',
    },
    mode: "onSubmit",
  });

  const onSubmit = useCallback(async (payload: any) => {
    if (IsSubmit) {
      return true
    }
    setIsSubmit(true)
    // payload.ACTIVE = "";
    payload.COLORS = payload?.COLORS === '000' ? "#000000" : payload?.COLORS

    // return
    try {
      // return
      const res = await callPostAPI(ENDPOINTS?.WORKORDERTYPE_STATUS, payload, currentMenu?.FUNCTION_CODE);
      if (res?.FLAG === true) {
        toast?.success(res?.MSG);
      } else {
        toast?.error(res?.MSG);
      }
      props?.getAPI();

      props?.isClick();
    } catch (error: any) {

      toast?.error(error);
    } finally {
      setIsSubmit(false)
    }
  }, [IsSubmit, isSubmitting, callPostAPI, toast, props?.getAPI, props?.isClick]);

  useEffect(() => {
    (async function () {
      await saveTracker(currentMenu)
    })();
  }, [])

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
          IsSubmit={IsSubmit}
        />
        <Card className="mt-2">
          <div className="mt-1 grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-3 lg:grid-cols-3">
            <div>
              <Field
                controller={{
                  name: "WO_CODE",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <InputField
                        {...register("WO_CODE", {
                          required: "Please fill the required fields",
                        })}
                        maxLength={7}
                        label={t("Type code")}
                        disabled={search === "?edit="}
                        invalid={errors.WO_CODE}
                        require={true}
                        setValue={setValue}
                        {...field}
                      />
                    );
                  },
                }}
              />
            </div>
            <div>
              <Field
                controller={{
                  name: "DESCRIPTION",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <InputField
                        {...register("DESCRIPTION", {
                          required: "Please fill the required fields",
                        })}
                        disabled={search === '?edit=' && (facility_type === "I" && props?.selectedData?.FACILITY_ID === 0)}
                        label={t("Description")}
                        invalid={errors?.DESCRIPTION}
                        require={true}
                        setValue={setValue}
                        {...field}
                      />
                    );
                  },
                }}
              />
            </div>
            <Field
              controller={{
                name: "COLORS",
                control: control,
                render: ({ field }: any) => {
                  return (
                    <div>
                      <span className="Text_Secondary Input_Label">
                        {t("Color")}{" "}
                      </span>
                      <InputText
                        type={"color"}
                        {...register("COLORS", {
                          required: "Please fill the required fields",
                        })}
                        name={"color"}
                        value={color}
                        onChange={(e: any) => setColor(e.target.value)}
                        className={"colorpicker"}
                        setValue={setValue}
                        disabled={search === '?edit=' && (facility_type === "I" && props?.selectedData?.FACILITY_ID === 0)}
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
                  name: "ISPM",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <Checkboxs
                        {...register("ISPM")}
                        className='md:mt-7'
                        label="Is Show Schedule"

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
                        className='md:mt-7'
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
export default WorkOrderForm;
