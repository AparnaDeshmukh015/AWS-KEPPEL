import InputField from '../../../components/Input/Input'
import { Card } from 'primereact/card';
import { useForm } from 'react-hook-form';
import Field from '../../../components/Field';
import { callPostAPI } from '../../../services/apis';
import { ENDPOINTS } from '../../../utils/APIEndpoints';
import { toast } from 'react-toastify';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import FormHeader from '../../../components/FormHeader/FormHeader';
import Select from "../../../components/Dropdown/Dropdown";
import { useLocation, useOutletContext } from 'react-router-dom';
import Checkboxs from "../../../components/Checkbox/Checkbox";
import { saveTracker } from '../../../utils/constants';
import { InputTextarea } from 'primereact/inputtextarea';

const AnanlyticsFddMasterForm = (props: any) => {
  const { t } = useTranslation();
  let { pathname } = useLocation();
  const [, menuList]: any = useOutletContext();
  const currentMenu = menuList
    ?.flatMap((menu: any) => menu?.DETAIL)
    .filter((detail: any) => detail.URL === pathname)[0];
  const [options, setOptions] = useState<any>([]);
  const { search } = useLocation();
  const getId: any = localStorage.getItem("Id");
  const dataId = JSON.parse(getId);
  const [IsSubmit, setIsSubmit] = useState<any | null>(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      MODE: props?.selectedData || search === "?edit=" ? "E" : "A",
      PARA:
        props?.selectedData || search === "?edit="
          ? { para1: `${props?.headerName}`, para2: t("Updated") }
          : { para1: `${props?.headerName}`, para2: t("Added") },
      FDD_ID: props?.selectedData
        ? props?.selectedData?.FDD_ID
        : search === "?edit="
          ? dataId?.FDD_ID
          : "",
      FDD_DESC: props?.selectedData
        ? props?.selectedData?.FDD_DESC
        : search === "?edit="
          ? dataId?.FDD_DESC
          : "",
      TYPE: props?.selectedData
        ? props?.selectedData?.ASSETTYPE_NAME
        : search === "?edit="
          ? dataId?.ASSETTYPE_NAME
          : "",
      FDD_NAME: props?.selectedData
        ? props?.selectedData?.FDD_NAME
        : search === "?edit="
          ? dataId?.FDD_NAME
          : "",
      ACTIVE:search === '?edit=' ? dataId?.ACTIVE  : true,
    },
    mode: "all",
  });

  const onSubmit = async (payload: any) => {
    setIsSubmit(true)
    payload.ASSETTYPE_ID = payload?.TYPE?.ASSETTYPE_ID;
    payload.ACTIVE = payload?.ACTIVE ? 1 : 0;
    delete payload?.TYPE;
    try {
      const res = await callPostAPI(ENDPOINTS.SAVE_FDDASSETMASTER, payload);
      if (res?.FLAG === true) {
        toast?.success(res?.MSG);
        props?.getAPI();
        setIsSubmit(false)
        props?.isClick();
      }
      else {
        toast.error(res?.MSG)
        setIsSubmit(false)
      }

    } catch (error: any) {
      setIsSubmit(false)
      toast?.error(error);
    }
  };
  const getOptions = async () => {
    try {
      const res = await callPostAPI(
        ENDPOINTS.getTaskMasterList,
        null,
        currentMenu?.FUNCTION_CODE
      );
      setOptions({
        assestOptions: res?.ASSETTYPELIST,
      });
    } catch (error) { }
  };

  useEffect(() => {
    (async function () {
        await getOptions()
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
          isSelected={search === "?edit=" ? true : false}
          isClick={props?.isClick}
          IsSubmit={IsSubmit}
        />
        <Card className="mt-2">
          <div className="mt-1 grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-3 lg:grid-cols-3">
            <Field
              controller={{
                name: "FDD_ID",
                control: control,
                render: ({ field }: any) => {
                  return (
                    <InputField
                      {...register("FDD_ID", {
                        required: t("Please fill the required fields."),
                        validate: (fieldValue: any) => {
                          const sanitizedValue = fieldValue
                            ?.toString()
                            ?.replace(/[^0-9]/g, "");
                          setValue("FDD_ID", sanitizedValue);
                          return true;
                        },

                      })}
                      label="FDD ID"
                      require={true}
                      invalid={errors.FDD_ID}
                      disabled={props?.selectedData ? true : false}
                      {...field}
                    />
                  );
                },
              }}
            />
            <Field
              controller={{
                name: "FDD_NAME",
                control: control,
                render: ({ field }: any) => {
                  return (
                    <InputField
                      {...register("FDD_NAME", {
                        required: t("Please fill the required fields."),
                        validate: (value) =>
                          value.trim() !== "" ||
                          t("Please fill the required fields."),
                      })}
                      require={true}
                      label="FDD Name"
                      invalid={errors.FDD_NAME}
                      {...field}
                    />
                  );
                },
              }}
            />
            <div className={`${errors?.FDD_DESC ? "errorBorder" : ""}`}>
              <label className="Text_Secondary Input_Label ">FDD Description<span className="text-red-600"> *</span></label>
              <Field
                controller={{
                  name: "FDD_DESC",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <InputTextarea
                        {...register("FDD_DESC", {
                          required: t("Please fill the required fields."),
                          validate: (value) =>
                            value.trim() !== "" ||
                            t("Please fill the required fields."),
                        })}
                        require={true}
                        label="FDD Description"
                        invalid={errors.FDD_DESC}
                        {...field}
                      />
                    );
                  },
                }}
              />
            </div>
            <Field
              controller={{
                name: "TYPE",
                control: control,
                render: ({ field }: any) => {
                  return (
                    <Select
                      options={options?.assestOptions?.filter((f: any) => f?.ASSETTYPE === "A")}
                      {...register("TYPE", {
                        required: t("Please fill the required fields"),
                      })}
                      label="Equipment Type"
                      require={true}
                      optionLabel="ASSETTYPE_NAME"
                      findKey={"ASSETTYPE_ID"}
                      disabled={search === '?edit=' ? true : false}
                      selectedData={search === '?edit=' ? dataId?.ASSETTYPE_ID : props?.selectedData?.ASSETTYPE_ID}
                      setValue={setValue}
                      invalid={errors.TYPE}
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
                        label="Active"
                        className='md:mt-7'
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
}

export default AnanlyticsFddMasterForm