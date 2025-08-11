import InputField from "../../../components/Input/Input";
import { Card } from "primereact/card";
import { useForm } from "react-hook-form";
import Field from "../../../components/Field";
import Checkboxs from "../../../components/Checkbox/Checkbox";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import FormHeader from "../../../components/FormHeader/FormHeader";

const OnHoldSubStatusConfigMaster = (props: any) => {
  const { t } = useTranslation();
  const [IsSubmit, setIsSubmit] = useState<any|null>(false);
 
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      MODE: props?.selectedData ? "E" : "A",
      PARA: props?.selectedData
        ? { para1: `${props?.headerName}`, para2: "Updated" }
        : { para1: `${props?.headerName}`, para2: "Added" },

      ON_HOLD_SUBSTATUS: props?.selectedData?.ON_HOLD_SUBSTATUS || "",
      ACTIVE:
        props?.selectedData?.ACTIVE !== undefined
          ? props.selectedData.ACTIVE
          : true,
    },
    mode: "onSubmit",
  });
  const onSubmit = async () => {
    setIsSubmit(true)
   };
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
          isSelected={props?.selectedData ? true : false}
          isClick={props?.isClick}
          IsSubmit={IsSubmit}
        />
        <Card className="mt-2">
          <div className="mt-1 grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-3 lg:grid-cols-3">
            <Field
              controller={{
                name: "ON_HOLD_SUBSTATUS",
                control: control,
                render: ({ field }: any) => {
                  return (
                    <InputField
                      {...register("ON_HOLD_SUBSTATUS", {
                        required: t("Please fill the required fields."),
                      })}
                      require={true}
                      label="On Hold Substatus Name"
                      invalid={errors.ON_HOLD_SUBSTATUS}
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

export default OnHoldSubStatusConfigMaster;
