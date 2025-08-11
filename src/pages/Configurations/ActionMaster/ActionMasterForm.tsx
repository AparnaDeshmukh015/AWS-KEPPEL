import { useCallback, useEffect, useState } from "react";
import InputField from "../../../components/Input/Input";
import { Card } from "primereact/card";
import { useForm } from "react-hook-form";
import Field from "../../../components/Field";
import { callPostAPI } from "../../../services/apis";
import { ENDPOINTS } from "../../../utils/APIEndpoints";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import FormHeader from "../../../components/FormHeader/FormHeader";
import { saveTracker } from "../../../utils/constants";
import { useLocation, useOutletContext } from "react-router-dom";

const ActionSetupConfigForm = (props: any) => {
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
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {

      ACTION_STATUS_ID: props?.selectedData ? props?.selectedData?.ACTION_STATUS_ID : search === '?edit=' ? dataId?.ACTION_STATUS_ID : 0,
      ACTION_ID: props?.selectedData ? props?.selectedData?.ACTION_ID : search === '?edit=' ? dataId?.ACTION_ID : 0,
      ACTION_DESC: props?.selectedData ? props?.selectedData?.ACTION_DESC : search === '?edit=' ? dataId?.ACTION_DESC : "",
      ACTION_DISPLAY_DESC: props?.selectedData ? props?.selectedData?.ACTION_DISPLAY_DESC : search === '?edit=' ? dataId?.ACTION_DISPLAY_DESC : "",
      ACTION_STATUS_DESC: props?.selectedData ? props?.selectedData?.ACTION_STATUS_DESC : search === '?edit=' ? dataId?.ACTION_STATUS_DESC : "",
      ACTION_STATUS_DISPLAY_DESC: props?.selectedData ? props?.selectedData?.ACTION_STATUS_DISPLAY_DESC : search === '?edit=' ? dataId?.ACTION_STATUS_DISPLAY_DESC : "",
      MODE: props?.selectedData || search === '?edit=' ? "E" : "A",
      PARA: props?.selectedData || search === '?edit='
        ? { para1: `${props?.headerName}`, para2: "Updated" }
        : { para1: `${props?.headerName}`, para2: "Added" },
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
    payload.ACTIVE = payload?.ACTIVE ? 1 : 0;
    payload.ACTION_DETAILS = [{
      ACTION_STATUS_ID: props?.selectedData ? props?.selectedData?.ACTION_STATUS_ID : search === '?edit=' ? dataId?.ACTION_STATUS_ID : 0,
      ACTION_ID: props?.selectedData ? props?.selectedData?.ACTION_ID : search === '?edit=' ? dataId?.ACTION_ID : 0,
      ACTION_DESC: props?.selectedData ? props?.selectedData?.ACTION_DESC : search === '?edit=' ? dataId?.ACTION_DESC : "",
      ACTION_DISPLAY_DESC: payload?.ACTION_DISPLAY_DESC,
      ACTION_STATUS_DESC: props?.selectedData ? props?.selectedData?.ACTION_STATUS_DESC : search === '?edit=' ? dataId?.ACTION_STATUS_DESC : "",
      ACTION_STATUS_DISPLAY_DESC: payload?.ACTION_STATUS_DISPLAY_DESC,
    }]
    delete payload?.ACTION_STATUS_ID;
    delete payload?.ACTION_ID;
    delete payload?.ACTION_DESC;
    delete payload?.ACTION_DISPLAY_DESC;
    delete payload?.ACTION_STATUS_DESC;
    delete payload?.ACTION_STATUS_DISPLAY_DESC;

    try {
      // if (!deleteItem) {
      const res = await callPostAPI(
        ENDPOINTS.UPDATEACTIONSTATUSDETAILS,
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
  }, [IsSubmit, callPostAPI, toast, props])

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
            <div >
              <Field
                controller={{
                  name: "ACTION_DESC",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <InputField
                        disabled={true}
                        label="Action Description"
                        require={false}
                        invalid={errors.ACTION_DESC}
                        {...field}
                      />
                    );
                  },
                }}
              />
            </div>
            <div className={`${errors?.ACTION_DISPLAY_DESC ? "errorBorder" : ""}`}>
              <Field
                controller={{
                  name: "ACTION_DISPLAY_DESC",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <InputField
                        {...register("ACTION_DISPLAY_DESC", {
                          required: "Please fill the required fields",
                          validate: value => value.trim() !== "" || t("Please fill the required fields.")
                        })}
                        label="Action Display Description"
                        require={true}
                        invalid={errors.ACTION_DISPLAY_DESC}
                        {...field}
                      />
                    );
                  },
                }}
              />
            </div>
            <div >
              <Field
                controller={{
                  name: "ACTION_STATUS_DESC",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <InputField
                        // {...register("ACTION_STATUS_DESC", {
                        //   required: "Please fill the required fields",
                        //   validate: value => value.trim() !== "" || t("Please fill the required fields.")
                        // })}
                        label=" Status Description"
                        require={false}
                        disabled={true}
                        invalid={errors.ACTION_STATUS_DESC}
                        {...field}
                      />
                    );
                  },
                }}
              />
            </div>

            <div className={`${errors?.ACTION_STATUS_DISPLAY_DESC ? "errorBorder" : ""}`}>
              <Field
                controller={{
                  name: "ACTION_STATUS_DISPLAY_DESC",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <InputField
                        {...register("ACTION_STATUS_DISPLAY_DESC", {
                          required: "Please fill the required fields",
                          validate: value => value.trim() !== "" || t("Please fill the required fields.")
                        })}
                        label="Action Status Description"
                        require={true}
                        invalid={errors.ACTION_STATUS_DISPLAY_DESC}
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

export default ActionSetupConfigForm;
