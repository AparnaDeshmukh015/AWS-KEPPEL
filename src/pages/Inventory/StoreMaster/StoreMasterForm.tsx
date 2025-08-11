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
import { useLocation, useOutletContext } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import { Dropdown } from "primereact/dropdown";
import FormHeader from "../../../components/FormHeader/FormHeader";
import { saveTracker } from "../../../utils/constants";

const StoreListForm = (props: any) => {
  const { t } = useTranslation();
  let [locationtypeOptions, setlocationtypeOptions] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState<any | null>(null);
  const [locationName, setLocationName] = useState();
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
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      MODE: props?.selectedData || search === '?edit=' ? "E" : "A",
      PARA: props?.selectedData || search === '?edit='
        ? { para1: `${props?.headerName}`, para2: "Updated" }
        : { para1: `${props?.headerName}`, para2: "Added" },
      STORE_ID: props?.selectedData ? props?.selectedData?.STORE_ID : search === '?edit=' ? dataId?.STORE_ID : 0,
      ACTIVE:
        props?.selectedData?.ACTIVE !== undefined
          ? props.selectedData.ACTIVE
          : true,
      STORE_NAME: props?.selectedData ? props?.selectedData?.STORE_NAME : search === '?edit=' ? dataId?.STORE_NAME : '',
      LOCATION_ID: props?.selectedData ? props?.selectedData?.LOCATION_ID : search === '?edit=' ? dataId?.LOCATION_ID : 0,
      LOCATION: props?.selectedData
        ? locationtypeOptions?.find(
          (location: any) =>
            location?.LOCATION_ID === props?.selectedData?.LOCATION_ID || 0
        )
        : "",
    },
    mode: "onSubmit",
  });

  const onSubmit = async (payload: any) => {
    try {
      payload.LOCATION_ID = payload?.LOCATION?.LOCATION_ID;
      payload.ACTIVE = payload?.ACTIVE === true ? "1" : "0";
      delete payload.LOCATION;

      const res = await callPostAPI(ENDPOINTS.STOREMASTER_SAVE, payload);
      if (res?.FLAG === true) {
        toast?.success(res?.MSG);
        props?.getAPI();
        props?.isClick();
      } else {
        toast?.error(res?.MSG);
      }
    } catch (error: any) {
      toast.error(error);
    }
  };

  const getOptions = async () => {
    const res = await callPostAPI(ENDPOINTS.LOCATION_HIERARCHY_LIST, null);
    setlocationtypeOptions(res?.LOCATIONHIERARCHYLIST);
    setValue(
      "LOCATION",
      res?.LOCATIONHIERARCHYLIST?.find(
        (location: any) =>
          location?.LOCATION_ID === props?.selectedData?.LOCATION_ID || 0
      )
    );
  };
  useEffect(() => {
    if ((!isSubmitting && Object?.values(errors)[0]?.type === "required") || (!isSubmitting && Object?.values(errors)[0]?.type === "validate")) {
      const check: any = Object?.values(errors)[0]?.message;
      toast?.error(t(check));
    }
  }, [isSubmitting]);

  useEffect(() => {
    getOptions();
    saveTracker(currentMenu)
  }, []);
  const selectedLocationTemplate = (option: any, props: any) => {
    if (option) {
      return (
        <div className="flex align-items-center">
          <div>{option.LOCATION_DESCRIPTION}</div>
        </div>
      );
    }

    return <span>{props.placeholder}</span>;
  };

  const locationOptionTemplate = (option: any) => {
    return (
      <div className="align-items-center">
        <div className="Text_Primary Input_Label">{option.LOCATION_NAME}</div>
        <div className=" Text_Secondary Helper_Text">
          {option.LOCATION_DESCRIPTION}
        </div>
      </div>
    );
  };

  const panelFooterTemplate = () => {
    return (
      <div className="py-2 px-3">
        {selectedLocation ? (
          <span>
            <b>{selectedLocation.LOCATIONTYPE_NAME}</b> selected.
          </span>
        ) : (
          "No country selected."
        )}
      </div>
    );
  };
  // useEffect(() => {
  //   saveTracker(props?.headerName)
  // }, [])
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
            <div className={`${errors?.STORE_NAME ? "errorBorder" : ""}`}>
              <Field
                controller={{
                  name: "STORE_NAME",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <InputField
                        {...register("STORE_NAME", {
                          required: "Please fill the required fields.",
                          validate: value => value.trim() !== "" || "Please fill the required fields."
                        })}
                        require={true}
                        label="Store Name"
                        invalid={errors.STORE_NAME}
                        // disabled={props.selectedData ? true : false}
                        {...field}
                      />
                    );
                  },
                }}
                error={errors?.STORE_NAME?.message}
              />
            </div>
            <div className={`${errors?.LOCATION ? "errorBorder" : ""}`}>
              <Field
                controller={{
                  name: "LOCATION",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <Select
                        options={locationtypeOptions}
                        {...register("LOCATION", {
                          required: "Please fill the required fields.",
                        })}
                        label="Location"
                        require={true}
                        optionLabel="LOCATION_NAME"
                        valueTemplate={selectedLocationTemplate}
                        itemTemplate={locationOptionTemplate}

                        filter
                        setValue={setValue}
                        {...field}
                      />
                    );
                  },
                }}
                error={errors?.LOCATION?.message}
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
                        checked={
                          props?.selectedData?.ACTIVE === true
                            ? true
                            : false || false
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

export default StoreListForm;
