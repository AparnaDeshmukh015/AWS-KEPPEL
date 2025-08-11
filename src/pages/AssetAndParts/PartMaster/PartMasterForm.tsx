import { useFieldArray, useForm } from "react-hook-form";
import InputField from "../../../components/Input/Input";
import { Card } from "primereact/card";
import Select from "../../../components/Dropdown/Dropdown";
import Field from "../../../components/Field";
import Checkboxs from "../../../components/Checkbox/Checkbox";
import "../PartMaster/PartMaster.css";
import DocumentUpload from "../../../components/pageComponents/DocumentUpload/DocumentUpload";
import { ENDPOINTS } from "../../../utils/APIEndpoints";
import { callPostAPI } from "../../../services/apis";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { validation } from "../../../utils/validation";
import {
  eventNotification,
  helperEventNotification,
} from "../../../utils/eventNotificationParameter";
import FormHeader from "../../../components/FormHeader/FormHeader";
import { useLocation, useOutletContext } from "react-router-dom";
import { saveTracker } from "../../../utils/constants";
import { decryptData } from "../../../utils/encryption_decryption";

const PartMasterForm = (props: any) => {
  let { search } = useLocation();
  const { t } = useTranslation();
  const getId: any = localStorage.getItem("Id")
  const dataId = JSON.parse(getId)
  const [IsSubmit, setIsSubmit] = useState<any | null>(false);
  const [options, setOptions] = useState<any>({});
  const [selectedDetails, setSelectedDetails] = useState<any>([]);
  const [typeList, setTypeList] = useState<any | null>([])
  let { pathname } = useLocation();
  const [, menuList]: any = useOutletContext();
  const [assetNonAsset, setAssetNonAsset] = useState<any | null>('A')
  const currentMenu = menuList
    ?.flatMap((menu: any) => menu?.DETAIL)
    .filter((detail: any) => detail.URL === pathname)[0];
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
      MODE: search === "?edit=" ? "E" : "A",
      PARA: search === "?edit="
        ? { para1: `${props?.headerName}`, para2: t("Updated") }
        : { para1: `${props?.headerName}`, para2: t("Added") },
      PART_ID:search === "?edit="? dataId.PART_ID :0,
      PART_CODE: "", PART_NAME: "",
      ASSETTYPE_ID: "",
      MAKE_ID: "",
      MODEL_ID: "",
      UOM_ID: "",
      CAPACITY_SIZE: "",
      MAINTAIN_INVENTORY:search === "?edit="? dataId?.MAINTAIN_INVENTORY :false,
      STORE_ID: "",
      RACK_ID: "",
      MIN_STOCK: "",
      MAX_STOCK: "",
      REORDER_LEVEL: "",
      ACTIVE:
       search === "?edit="
          ? dataId.ACTIVE
          : true,
      DOC_LIST: [],
      ASSETGROUP_ID: "",
      EXTRA_COL_LIST: [""],
    },
    mode: "all",
  });

  const User_Name = decryptData((localStorage.getItem("USER_NAME")))

  // const { append } = useFieldArray({
  //   control,
  //   name: "DOC_LIST",
  // });
  const { fields, append: colAppend } = useFieldArray({
    name: "EXTRA_COL_LIST",
    control,
  });
  const MAINTAIN_INVENTORY = watch("MAINTAIN_INVENTORY")
  const storeName: any = watch("STORE_ID")
  const assetGroup: any = watch('ASSETGROUP_ID')
  const assetType: any = watch('ASSETTYPE_ID')

  const onSubmit = useCallback(async (payload: any) => {
    if (IsSubmit) return;
    setIsSubmit(true)
    const updateColList: any = payload?.EXTRA_COL_LIST?.filter(
      (item: any) => item?.VALUE
    ).map((data: any) => ({
      [data?.FIELDNAME]: data?.VALUE,
    }));
    payload.EXTRA_COL_LIST = updateColList || [];
    payload.ACTIVE = payload?.ACTIVE ? 1 : 0;
    payload.ASSETTYPE_ID = payload?.ASSETTYPE_ID?.ASSETTYPE_ID || "";
    payload.ASSETGROUP_ID = payload?.ASSETGROUP_ID?.ASSETGROUP_ID || ""
    payload.MAKE_ID = assetNonAsset === "A" ? payload?.MAKE_ID?.MAKE_ID : "0"
    payload.MODEL_ID = assetNonAsset === "A" ? payload?.MODEL_ID?.MODEL_ID : "0"
    payload.UOM_ID = payload?.UOM_ID?.UOM_ID || ""
    if (!payload?.MAINTAIN_INVENTORY) {
      payload.STORE_ID = ""
      payload.RACK_ID = ""
      payload.MIN_STOCK = ""
      payload.MAX_STOCK = ""
      payload.REORDER_LEVEL = ""
    } else {
      payload.STORE_ID = payload?.STORE_ID?.STORE_ID || ""
      payload.RACK_ID = payload?.RACK_ID?.RACK_ID || ""
    }

    try {

      const res = await callPostAPI(ENDPOINTS.savePartMaster, payload)
      if (res?.FLAG === true) {
        toast?.success(res?.MSG)
        const notifcation: any = {
          "FUNCTION_CODE": currentMenu?.FUNCTION_CODE,
          "EVENT_TYPE": "M",
          "STATUS_CODE": search === "?edit=" ? 2 : 1,
          "PARA1": search === "?edit=" ? User_Name : User_Name,
          "PARA2": payload?.PART_CODE,
          "PARA3": payload?.PART_NAME,
          "PARA4": assetType?.ASSETTYPE_NAME
        }

        const eventPayload = { ...eventNotification, ...notifcation }
        await helperEventNotification(eventPayload)
        props?.getAPI()

        props?.isClick()
      } else {

        toast?.error(res?.MSG)
      }

    } catch (error: any) {

      toast.error(error)
    } finally {
      setIsSubmit(false)
    }
  }, [IsSubmit, search, props, eventNotification, toast])
  const getPartDetailsList = async (columnCaptions: any) => {
    const payload = {
      PART_ID: search === "?edit=" ? dataId?.PART_ID : selectedDetails?.PART_ID,
    };
    
    const response = await callPostAPI(
      ENDPOINTS.getPartDetailsList,
      payload,
      props?.FUNCTION_CODE
    );
    try {
      if (response.FLAG === 1) {
        const configList = response.CONFIGLIST[0];
        for (let key in configList) {
          if (configList[key] === null) {
            delete configList[key];
          }
        }

        const previousColumnCaptions: any = columnCaptions.map((item: any) => ({
          ...item,
          VALUE: configList[item.FIELDNAME],
        }));
        colAppend(previousColumnCaptions);
        setSelectedDetails(response?.PARTDETAILSLIST[0])
        setValue("DOC_LIST", response?.PARTDOCLIST)
        setValue("PART_CODE", response?.PARTDETAILSLIST[0]?.PART_CODE)
        setValue("PART_NAME", response?.PARTDETAILSLIST[0]?.PART_NAME)
        setValue("CAPACITY_SIZE", response?.PARTDETAILSLIST[0]?.CAPACITY_SIZE)
        setValue("MIN_STOCK", response?.PARTDETAILSLIST[0]?.MIN_STOCK ? response?.PARTDETAILSLIST[0]?.MIN_STOCK : '')
        setValue("MAX_STOCK", response?.PARTDETAILSLIST[0]?.MAX_STOCK)
        setValue("REORDER_LEVEL", response?.PARTDETAILSLIST[0]?.REORDER_LEVEL)
      }
    } catch (error) {
    }
  }

  const getOptions = async () => {
    const payload = {
      ASSETTYPE: "P",
    };

    try {
      const res = await callPostAPI(ENDPOINTS.getAssestMasterList, payload, currentMenu?.FUNCTION_CODE);
      setOptions({
        assetType: res?.ASSESTTYPELIST,
        assetMake: res?.MAKELIST,
        assetModel: res?.MODELLIST,
        unit: res?.UOMLIST,
        storeList: res?.ASSESTSTORELIST,
        rackName: res?.RACKLIST,
        assetGroup: res?.ASSESTGROUPLIST,
      });
      const columnCaptions = res?.CONFIGLIST.map((item: any) => ({
        FIELDNAME: item.FIELDNAME,
        LABEL: item?.COLUMN_CAPTION,
        VALUE: "",
      }));
      if (res?.FLAG === 1) {
        if (dataId?.PART_ID) {
          await getPartDetailsList(columnCaptions)
        } else {
          colAppend(columnCaptions);
        }
      }
    } catch (error) {
    }
  }

  useEffect(() => {
    (async function () {
      await getOptions();
    await saveTracker(currentMenu)})();
  }, [menuList]);

  useEffect(() => {
    const assetList: any = options?.assetType?.filter(
      (f: any) => f.ASSETGROUP_ID === assetGroup?.ASSETGROUP_ID
    )

    setTypeList(assetList)
    if (assetGroup?.ASSETGROUP_TYPE === "A") {
      setAssetNonAsset("A")
    }
    if (assetGroup?.ASSETGROUP_TYPE === "N") {
      setAssetNonAsset("N")
    }

  }, [assetGroup]);

  useEffect(() => {
    setOptions({
      ...options,
      currentRackName: options?.rackName?.filter(
        (item: any) => item?.STORE_ID === storeName?.STORE_ID
      ),
    });
  }, [storeName]);

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
          <div className="headingConainer">
            <p>{t("Part Details")}</p>
          </div>
          <div className="mt-1 grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-3 lg:grid-cols-3">
            <Field
              controller={{
                name: "PART_CODE",
                control: control,
                render: ({ field }: any) => {
                  return (
                    <InputField
                      {...register("PART_CODE", {
                        validate: (fieldValue: any) => {
                          const sanitizedValue = fieldValue
                            ?.toString()
                            ?.replace(/[^0-9]/g, "");
                          setValue("PART_CODE", sanitizedValue);
                          return true;
                        },
                      })}
                      label="Part Code"
                      disabled={search === '?edit=' ? true : false}
                      {...field}
                    />
                  );
                },
              }}
            />
            <Field
              controller={{
                name: "PART_NAME",
                control: control,
                render: ({ field }: any) => {
                  return (
                    <InputField
                      {...register("PART_NAME", {
                        required: t("Please fill the required fields."),
                        validate: value => value.trim() !== "" || t("Please fill the required fields.")

                      })}
                      label="Part Name"
                      require={true}
                      invalid={errors?.PART_NAME}
                      {...field}
                    />
                  );
                },
              }}
            />
            <Field
              controller={{
                name: "ASSETGROUP_ID",
                control: control,
                render: ({ field }: any) => {
                  return (
                    <Select
                      options={options?.assetGroup}
                      {...register("ASSETGROUP_ID", {
                        required: t("Please fill the required fields."),
                      })}
                      label={assetNonAsset === "A" ? "Equipment Group" : "Soft Service Group"}
                      optionLabel="ASSETGROUP_NAME"
                      require={true}
                      invalid={errors.ASSETGROUP_ID}
                      findKey={"ASSETGROUP_ID"}
                      selectedData={selectedDetails?.ASSETGROUP_ID}
                      setValue={setValue}
                      {...field}
                    />
                  );
                },
              }}
            />
            <Field
              controller={{
                name: "ASSETTYPE_ID",
                control: control,
                render: ({ field }: any) => {
                  return (
                    <Select
                      options={typeList}
                      {...register("ASSETTYPE_ID", {
                        required: t("Please fill the required fields.")
                      })}
                      label={assetNonAsset === "A" ? "Equipment Type" : "Soft Service Type"}
                      optionLabel="ASSETTYPE_NAME"
                      require={true}
                      invalid={errors.ASSETTYPE_ID}
                      findKey={'ASSETTYPE_ID'}
                      selectedData={selectedDetails?.ASSETTYPE_ID}
                      setValue={setValue}
                      {...field}
                    />
                  );
                },
              }}
            />
            {assetNonAsset === "A" && (<>
              <Field
                controller={{
                  name: "MAKE_ID",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <Select
                        options={options?.assetMake}
                        {...register("MAKE_ID", {
                        })}
                        label="Equipment Make"
                        optionLabel="MAKE_NAME"
                        findKey={'MAKE_ID'}
                        selectedData={selectedDetails?.MAKE_ID}
                        setValue={setValue}
                        {...field}
                      />
                    );
                  },
                }}
              />
              <Field
                controller={{
                  name: "MODEL_ID",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <Select
                        options={options?.assetModel}
                        {...register("MODEL_ID", {
                        })}
                        label="Equipment Model"
                        optionLabel="MODEL_NAME"
                        findKey={'MODEL_ID'}
                        selectedData={selectedDetails?.MODEL_ID}
                        setValue={setValue}
                        {...field}
                      />
                    );
                  },
                }}
              /></>)}
            <Field
              controller={{
                name: "UOM_ID",
                control: control,
                render: ({ field }: any) => {
                  return (
                    <Select
                      options={options?.unit}
                      {...register("UOM_ID")}
                      label="UOM"
                      optionLabel="UOM_NAME"
                      findKey={"UOM_ID"}
                      selectedData={selectedDetails?.UOM_CODE}
                      setValue={setValue}
                      {...field}
                    />
                  );
                },
              }}
            />
            <Field
              controller={{
                name: "CAPACITY_SIZE",
                control: control,
                render: ({ field }: any) => {
                  return (
                    <InputField
                      {...register("CAPACITY_SIZE",
                        {
                          validate: (fieldValue: any) => {
                            return validation?.onlyAlphaNumeric(
                              fieldValue,
                              "CAPACITY_SIZE",
                              setValue
                            );
                          },
                        }
                      )}
                      label="Capacity Size"
                      {...field}
                    />
                  );
                },
              }}
            />
            {MAINTAIN_INVENTORY && (
              <>
                <Field
                  controller={{
                    name: "STORE_ID",
                    control: control,
                    render: ({ field }: any) => {
                      return (
                        <Select
                          options={options?.storeList}
                          {...register("STORE_ID")}
                          label="Default Store Name"
                          optionLabel="STORE_NAME"
                          findKey={"STORE_ID"}
                          selectedData={selectedDetails?.STORE_ID}
                          setValue={setValue}
                          {...field}
                        />
                      );
                    },
                  }}
                />
                <Field
                  controller={{
                    name: "RACK_ID",
                    control: control,
                    render: ({ field }: any) => {
                      return (
                        <Select
                          options={options?.currentRackName}
                          {...register("RACK_ID")}
                          label="Default Rack Name"
                          optionLabel="RACK_NAME"
                          findKey={"RACK_ID"}
                          selectedData={selectedDetails?.RACK_ID}
                          setValue={setValue}
                          {...field}
                        />
                      );
                    },
                  }}
                />
                <Field
                  controller={{
                    name: "MIN_STOCK",
                    control: control,
                    render: ({ field }: any) => {
                      return (
                        <InputField
                          {...register("MIN_STOCK", {
                            required: MAINTAIN_INVENTORY === true ? t("Please fill the required fields.") : "",
                            validate: (fieldValue: any) => {
                              return validation?.onlyNumber(
                                fieldValue,
                                "MIN_STOCK",
                                setValue
                              );
                            },
                          })}
                          label="Min Stock"
                          require={MAINTAIN_INVENTORY === true ? true : false}
                          invalid={MAINTAIN_INVENTORY === true ? errors?.MIN_STOCK : ''}
                          {...field}
                        />
                      );
                    },
                  }}
                />
                <Field
                  controller={{
                    name: "MAX_STOCK",
                    control: control,
                    render: ({ field }: any) => {
                      return (
                        <InputField
                          {...register("MAX_STOCK", {
                            validate: (fieldValue: any) => {
                              const sanitizedValue = fieldValue
                                ?.toString()
                                ?.replace(/[^0-9]/g, "");
                              setValue("MAX_STOCK", sanitizedValue);
                              return true
                            },
                          })}
                          label="Max Stock"
                          {...field}
                        />
                      );
                    },
                  }}
                />
                <Field
                  controller={{
                    name: "REORDER_LEVEL",
                    control: control,
                    render: ({ field }: any) => {
                      return (
                        <InputField
                          {...register("REORDER_LEVEL", {
                            required: MAINTAIN_INVENTORY === true ? t("Please fill the required fields.") : "",
                            validate: (fieldValue: any) => {
                              const sanitizedValue = fieldValue
                                ?.toString()
                                ?.replace(/[^0-9]/g, "");
                              setValue("REORDER_LEVEL", sanitizedValue);
                              return (
                                (sanitizedValue >= +getValues("MIN_STOCK")) || "Reorder Level Should be greater than Min stock"

                              );
                            },
                          })}
                          label="Reorder Level"
                          require={MAINTAIN_INVENTORY === true ? true : false}
                          invalid={MAINTAIN_INVENTORY === true ? errors?.REORDER_LEVEL : ""}
                          {...field}
                        />
                      );
                    },
                  }}
                />
              </>
            )}
            <div className="flex align-items-center">
              <Field
                controller={{
                  name: "MAINTAIN_INVENTORY",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <Checkboxs
                        {...register("MAINTAIN_INVENTORY")}
                        checked={dataId?.MAINTAIN_INVENTORY || false}
                        className={`md:mt-7`}
                        label={"Inventory To Be Maintained"}
                        isTooltip={true}
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
                        checked={dataId?.ACTIVE || false}
                        className={`${MAINTAIN_INVENTORY && "md:mt-7"}`}
                        label="Active"
                        setValue={setValue}
                        {...field}
                      />
                    );
                  },
                }}
              />
            </div>
            {fields.map((arrayField: any, index: number) => {
              return (
                <React.Fragment key={arrayField?.FIELDNAME}>
                  <div>
                    <Field
                      controller={{
                        name: `EXTRA_COL_LIST.${index}.VALUE`,
                        control: control,
                        render: ({ field }: any) => {
                          return (
                            <InputField
                              {...register(`EXTRA_COL_LIST.${index}`, {})}
                              label={arrayField?.LABEL}
                              placeholder={"Please Enter"}
                              {...field}
                            />
                          );
                        },
                      }}
                    />
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </Card>
        <Card className="mt-2">
          <DocumentUpload
            register={register}
            control={control}
            setValue={setValue}
            watch={watch}
            getValues={getValues}
            errors={errors}
          />
        </Card>
      </form>
    </section>
  );
};
export default PartMasterForm;
