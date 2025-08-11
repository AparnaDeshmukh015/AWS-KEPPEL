import { useEffect, useState } from "react";
import InputField from "../../../components/Input/Input";
import Buttons from "../../../components/Button/Button";
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
const WorkOrderForm = (props: any) => {
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
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
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
      ACTIVE: props?.selectedData?.ACTIVE ? true : false,
      WO_ID: props?.selectedData ? props?.selectedData?.WO_TYPE_CODE : search === '?edit=' ? dataId?.WO_TYPE_CODE : '',
    },
    mode: "onSubmit",
  });

  const onSubmit = async (payload: any) => {
    payload.ACTIVE = "";
    try {
      const res = await callPostAPI(ENDPOINTS?.WORKORDERTYPE_STATUS, payload);
      if (res?.FLAG === true) {
        toast?.success(res?.MSG);
      } else {
        toast?.error(res?.MSG);
      }
      props?.getAPI();
      props?.isClick();
    } catch (error: any) {
      toast?.error(error);
    }
  };

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
            <div>
              <Field
                controller={{
                  name: "WO_ID",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <InputField
                        {...register("WO_ID", {
                          required: "",
                        })}
                        label={t("Type code")}
                        disabled={true}
                        invalid={errors.WO_ID}
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
                          required: "",
                        })}
                        disabled={true}
                        label={t("Description")}
                        invalid={errors?.DESCRIPTION}
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
export default WorkOrderForm;
