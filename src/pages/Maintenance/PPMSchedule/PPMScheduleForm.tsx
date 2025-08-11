import React from "react";
import { useForm } from "react-hook-form";
import { callPostAPI } from "../../../services/apis";
import { ENDPOINTS } from "../../../utils/APIEndpoints";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import InputField from "../../../components/Input/Input";
import Buttons from "../../../components/Button/Button";
import { Card } from "primereact/card";
import Field from "../../../components/Field";
import Select from "../../../components/Dropdown/Dropdown";
import Radio from "../../../components/Radio/Radio";
import DateCalendar from "../../../components/Calendar/Calendar";
import { useNavigate } from "react-router-dom";
import { PATH } from "../../../utils/pagePath";
const PPMScheduleForm = (props: any) => {
  const navigate: any = useNavigate();
  const assestTypeLabel: any = [
    { name: "Equipment", key: "A" },
    { name: "Soft Services", key: "N" },
  ];
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      MODE: props?.selectedData ? "E" : "A",
      PARA: props?.selectedData
        ? { para1: `${props?.headerName}`, para2: "Updated" }
        : { para1: `${props?.headerName}`, para2: "Added" },

      ASSET_NONASSET: "",
      LOCATION_ID: "",
      REQUESTTITLE_ID: "",
      DESCRIPTION: "",
      SEVERITY_CODE: "",
      PRIORITY_ID: "",
      ASSETTYPE: "",
      DOC_LIST: [],
      DATE: "",
    },
    mode: "onSubmit",
  });
  const onSubmit = async (payload: any) => { };
  return (
    <section className="w-full">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex justify-between mt-1">
          <div>
            <h6 className="Text_Primary">
              {props?.selectedData ? "Edit" : "Add"} {props?.headerName}{" "}
            </h6>
          </div>
          <div className="flex">
            <Buttons
              type="submit"
              className="Primary_Button  w-20 me-2"
              label={"Save"}
            />
            <Buttons
              className="Secondary_Button w-20 "
              label={"List"}
              type="button"
              onClick={() => navigate(PATH.ADD_PPMSCHEDULE)}
            />
          </div>
        </div>
        <Card className="mt-2">
          <div className="mt-1 grid grid-cols-1 gap-x-4 gap-y-4 md:grid-cols-4 lg:grid-cols-4">
            <Field
              controller={{
                name: "LOCATION_ID",
                control: control,
                render: ({ field }: any) => {
                  return (
                    <Select
                      options={[]}
                      {...register("LOCATION_ID", {})}
                      label="Location "
                      optionLabel="EVENTTYPE_NAME"
                      findKey={"EVENT_TYPE"}
                      // selectedData={eventType ? eventType : selectedDetails?.event?.EVENT_TYPE}
                      // setValue={setValue}
                      // invalid={errors.EVENT_TYPE}
                      {...field}
                    />
                  );
                },
              }}
            />
            <Field
              controller={{
                name: "ASSET_NONASSET",
                control: control,
                render: ({ field }: any) => {
                  return (
                    <>
                      <Radio
                        {...register("ASSET_NONASSET", {
                          required: "Please fill the required fields",
                        })}
                        labelHead="Type"
                        require={true}
                        options={assestTypeLabel}
                        selectedData={
                          props?.selectedData?.ASSET_NONASSET || "A"
                        }
                        setValue={setValue}
                        {...field}
                      />
                    </>
                  );
                },
              }}
            />
            <Field
              controller={{
                name: "ASSETTYPE",
                control: control,
                render: ({ field }: any) => {
                  return (
                    <Select
                      // options={ASSET_NONASSET?.key === "A" ? options?.assestOptions : options?.softServicesOptions}
                      options={[]}
                      {...register("ASSETTYPE", {
                        required: "Please fill the required fields",
                      })}
                      label={"Request Title"}
                      optionLabel="ASSETTYPE_NAME"
                      placeholder={"Please_Select"}
                      findKey={"ASSETTYPE_NAME"}
                      require={true}
                      selectedData={props?.selectedData?.ASSETTYPE_NAME}
                      setValue={setValue}
                      invalid={errors.ASSETTYPE}
                      {...field}
                    />
                  );
                },
              }}
            />
            <Field
              controller={{
                name: "LAST_DATE",
                control: control,
                render: ({ field }: any) => {
                  return (
                    <DateCalendar
                      {...register("DATE")}
                      label="Last Maintenance date"
                      showIcon
                      // setValue={setValue}
                      {...field}
                    />
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
export default PPMScheduleForm;
