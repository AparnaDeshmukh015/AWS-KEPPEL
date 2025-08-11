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
import { saveTracker } from "../../../utils/constants";
import { useLocation, useOutletContext } from 'react-router-dom';


const WorkOrderStatusForm = (props: any) => {
  const { t } = useTranslation();
  const [color, setColor] = useState("000");
  const { search } = useLocation();
  const getId: any = localStorage.getItem("Id")
  const dataId = JSON.parse(getId)
  let { pathname } = useLocation();
  const [, menuList]: any = useOutletContext();
  const currentMenu = menuList
    ?.flatMap((menu: any) => menu?.DETAIL)
    .filter((detail: any) => detail.URL === pathname)[0];
  const [IsSubmit, setIsSubmit] = useState<any | null>(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      PARA: props?.selectedData || search === '?edit='
        ? { para1: `${props?.headerName}`, para2: "Updated" }
        : { para1: `${props?.headerName}`, para2: "Added" },
      FORM_TYPE: "WS",

      DESCRIPTION: props?.selectedData ? props?.selectedData?.STATUS_DESC : search === '?edit=' ? dataId?.STATUS_DESC : '',
      COLORS: props?.selectedData ? props?.selectedData?.COLORS : search === '?edit=' ? dataId?.COLORS : "",
      ACTIVE: search === '?edit=' ? dataId?.ACTIVE : true,
      STATUS: props?.selectedData ? props?.selectedData?.STATUS : search === '?edit=' ? dataId?.STATUS : "",
      WO_CODE: props?.selectedData ? props?.selectedData?.STATUS_CODE : "",
    },
    mode: "onSubmit",
  });

  const onSubmit = useCallback(async (payload: any) => {
    payload.ACTIVE = "";
    setIsSubmit(true)
    // return
    try {
      const res = await callPostAPI(ENDPOINTS?.WORKORDERTYPE_STATUS, payload, currentMenu?.FUNCTION_CODE);
      if (res?.FLAG === true) {
        toast?.success(res?.MSG);
        props?.getAPI();
        setIsSubmit(false)
        props?.isClick();
      } else {
        toast?.error(res?.MSG);
      }
    } catch (error: any) {
      setIsSubmit(false)
      toast?.error(error);
    }
  }, [IsSubmit, callPostAPI, toast, props?.getAPI, props?.isClick]);

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
            <div className={`${errors?.WO_CODE ? "errorBorder" : ""}`}>
              <Field
                controller={{
                  name: "STATUS",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <InputField
                        {...register("STATUS", {
                          required: "",
                        })}
                        label="Status"
                        disabled={true}
                        invalid={errors.STATUS}
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
                          required: "",
                        })}
                        label="Status Description"
                        invalid={errors?.DESCRIPTION}
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
                        placeholder={t("Please_Enter")}
                        {...field}
                      />
                    </div>
                  );
                },
              }}
            />
          </div>
        </Card>
      </form>
    </section>
  );
};
export default WorkOrderStatusForm;
