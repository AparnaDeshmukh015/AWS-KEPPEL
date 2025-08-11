import { useCallback, useEffect, useState } from "react";
import InputField from "../../../components/Input/Input";
import { Card } from "primereact/card";
import { useForm } from "react-hook-form";
import Field from "../../../components/Field";
import Checkboxs from "../../../components/Checkbox/Checkbox";
import { callPostAPI } from "../../../services/apis";
import { ENDPOINTS } from "../../../utils/APIEndpoints";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import FormHeader from "../../../components/FormHeader/FormHeader";
import { saveTracker } from "../../../utils/constants";
import { useLocation, useOutletContext } from "react-router-dom";

const CurrentStatusConfigForm = (props: any) => {
  const { t } = useTranslation();
  //const [deleteItem, setDeleteItem] = useState(false);
  let { pathname } = useLocation();
  const [, menuList]: any = useOutletContext();
  const currentMenu = menuList
    ?.flatMap((menu: any) => menu?.DETAIL)
    .filter((detail: any) => detail.URL === pathname)[0];
  const { search } = useLocation();
  const [IsSubmit, setIsSubmit] = useState<any | null>(false);
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
      CS_ID: props?.selectedData ? props?.selectedData?.CS_ID : search === '?edit=' ? dataId?.CS_ID : 0,
      MODE: props?.selectedData || search === '?edit=' ? "E" : "A",
      PARA: props?.selectedData || search === '?edit='
        ? { para1: `${props?.headerName}`, para2: "Updated" }
        : { para1: `${props?.headerName}`, para2: "Added" },
      CS_DESC: props?.selectedData ? props?.selectedData?.CS_DESC : search === '?edit=' ? dataId?.CS_DESC : "",
      ACTIVE: search === '?edit='  ? dataId?.ACTIVE  : true,
    },
    mode: "onSubmit",
  });

  const onSubmit = useCallback(async (payload: any) => {
    if (IsSubmit) return true
    setIsSubmit(true)
    payload.ACTIVE = payload?.ACTIVE ? 1 : 0;
    try {
      // if (!deleteItem) {
        const res = await callPostAPI(
          ENDPOINTS.CURRENTCONFIGSTATUSAVE,
          payload
        );
        toast?.success(res?.MSG);
        props?.getAPI();

        props?.isClick();
      // }
    } catch (error: any) {

      toast?.error(error);
    } finally {
      setIsSubmit(false)
    }
  }, [IsSubmit,callPostAPI, toast, props])

  // const deleteSpecificItem = async () => {
  //   setDeleteItem(true);
  //   let payLoad: any = {
  //     CS_ID: props?.selectedData?.CS_ID,
  //     PARA: { para1: `${props?.headerName}`, para2: "deleted" },
  //   };

  //   const res = await callPostAPI(
  //     ENDPOINTS.CURRENTCONFIGSTATUS_DELETE,
  //     payLoad
  //   );
  //   if (res?.FLAG === true) {
  //     toast?.success(res?.MSG);
  //     props?.getAPI();
  //     props?.isClick();
  //     setDeleteItem(false);
  //   } else {
  //     toast?.error(res?.MSG);
  //   }
  // };

  useEffect(() => {
    if ((!isSubmitting && Object?.values(errors)[0]?.type === "required") || ((!isSubmitting && Object?.values(errors)[0]?.type === "validate"))) {
      const check: any = Object?.values(errors)[0]?.message;
      toast?.error(t(check));
    } else {
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
          <div className="mt-1 grid grid-cols-1 gap-x-4 gap-y-4 md:grid-cols-4 lg:grid-cols-4">
            <div className={`${errors?.CS_DESC ? "errorBorder" : ""}`}>
              <Field
                controller={{
                  name: "CS_DESC",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <InputField
                        {...register("CS_DESC", {
                          required: "Please fill the required fields",
                          validate: value => value.trim() !== "" || t("Please fill the required fields.")
                        })}
                        label="Status Description"
                        require={true}
                        invalid={errors.CS_DESC}
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

export default CurrentStatusConfigForm;
