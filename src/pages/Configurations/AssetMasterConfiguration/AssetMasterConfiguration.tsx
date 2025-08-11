import React, { useCallback, useEffect, useState } from "react";
import { useLocation, useOutletContext } from "react-router-dom";
import Buttons from "../../../components/Button/Button";
import { Card } from "primereact/card";
import { SubmitErrorHandler, useFieldArray, useForm } from "react-hook-form";
import Field from "../../../components/Field";
import Radio from "../../../components/Radio/Radio";
import InputField from "../../../components/Input/Input";
import { callPostAPI } from "../../../services/apis";
import { ENDPOINTS } from "../../../utils/APIEndpoints";
import { toast } from "react-toastify";
import { Checkbox } from "primereact/checkbox";
import "../../../components/Radio/Radio.css";
import { useTranslation } from "react-i18next";
import { saveTracker } from "../../../utils/constants";

const AssetMasterConfiguration = () => {
  const { t } = useTranslation();
  let { pathname } = useLocation();
  const [, menuList] = useOutletContext<any | null>();
  
  const [IsSubmit, setIsSubmit] = useState<any|null>(false);
 
  const currentMenu = menuList
    ?.flatMap((menu: any) => menu?.DETAIL)
    ?.filter((detail: any) => detail.URL === pathname)[0];
  const [configList, setConfigList] = useState<ConfigListItem[]>([
    { id: "", FIELDNAME: "COL_1", COLUMN_CAPTION: "", ACTIVE: false },
    { id: "", FIELDNAME: "COL_2", COLUMN_CAPTION: "", ACTIVE: false },
    { id: "", FIELDNAME: "COL_3", COLUMN_CAPTION: "", ACTIVE: false },
    { id: "", FIELDNAME: "COL_4", COLUMN_CAPTION: "", ACTIVE: false },
    { id: "", FIELDNAME: "COL_5", COLUMN_CAPTION: "", ACTIVE: false },
  ]);

  const assetTypeLabel: any = [
    { name: " All Equipment", key: "AS007" },
    { name: "All Soft Service", key: "AS0010" },
    { name: "Part", key: "AS008" },
    { name: "Building Set up", key: "DYN01" },
  ];

  const {
    register,
    handleSubmit,
    control,
    setValue,
    trigger,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      ASSET_NONASSET: "",
      CONFIGLIST: configList,
      PARA: { para1: `${currentMenu?.FUNCTION_DESC}`, para2: "Added" },
    },
    mode: "onSubmit",
  });
  const { fields } = useFieldArray({
    name: "CONFIGLIST",
    control,
    rules: {
      required: "Please append at least 1 item",
    },
  });

  const ASSET_NONASSET: any = watch("ASSET_NONASSET");
 
  // const radioHandlerChange = (e: any) => {
  //   setType(e.target.value);

  //   const filterData: any = apiResponse?.filter(
  //     (res: any) => res?.ASSET_NONASSET === e.target.value
  //   );
  //   const updatedArray = filterData.map((obj: any) => {
  //     const { ASSET_NONASSET, ...rest } = obj;
  //     return rest;
  //   });

  //   setValue("CONFIGLIST", updatedArray);
  //   setConfigList(updatedArray);
  // };

  const handlerChange = (e: any, index: any) => {
    const updatedData: any = configList?.map((config: any, id: any) => {
      if (index === id) {
        return {
          ...config,
          ACTIVE: e.target.checked === true ? true : false,
          COLUMN_CAPTION:
            e.target.checked === true ? config?.COLUMN_CAPTION : "",
        };
      }
      return config;
    });
    setValue("CONFIGLIST", updatedData);
    setConfigList((prevConfigList) => {
      return prevConfigList.map((config, id) => {
        if (index === id) {
          return {
            ...config,
            ACTIVE: e.target.checked === true ? true : false,
            COLUMN_CAPTION:
              e.target.checked === true ? config?.COLUMN_CAPTION : "",
          };
        }
        return config;
      });
    });
  };
  const handleChangeColumn = (e: any, index: any) => {

    const updatedData: any = configList?.map((config: any, id: any) => {
      if (index === id) {
        return {

          ...config,

          COLUMN_CAPTION: e.target.value,
        };
      }
      return config;
    });
    setValue("CONFIGLIST", updatedData);

    setConfigList((prevConfigList) => {
      return prevConfigList.map((config, id) => {
        if (index === id) {
          return {
            ...config,
            COLUMN_CAPTION: e.target.value,
          };
        }
        return config;
      });
    });
  };

  const onSubmit =  useCallback(async (payload: any) => {
    if(IsSubmit) return true
    setIsSubmit(true)
    payload.FUNCTION_CODE = ASSET_NONASSET?.key;
    delete payload.ASSET_NONASSET;
    const updatedList: any = payload?.CONFIGLIST?.map((config: any) => ({
      FIELDNAME: config?.FIELDNAME,
      COLUMN_CAPTION: config?.COLUMN_CAPTION,
      ACTIVE: config?.ACTIVE,
    }));
    payload.CONFIGLIST = updatedList;
   
    
    try {
      const res = await callPostAPI(
        ENDPOINTS.ASSETMASTERCONFIGURATION_SAVE,
        payload,
        currentMenu?.FUNCTION_CODE
      );
      if (res?.FLAG === true) {
        toast.success(res?.MSG);
      
       await getAPI()
      } else {
        toast.error(res?.MSG);
        
      }

    } catch (error: any) {
      
      toast.error(error);
    }finally{
      setIsSubmit(false)
    }

  },  [IsSubmit, currentMenu?.FUNCTION_CODE, ASSET_NONASSET]);

  const getAPI = async () => {
    try {
      const payload: any = {
        FORM_FUNCTION_CODE: ASSET_NONASSET ? ASSET_NONASSET?.key : "AS007",
      };

      const res = await callPostAPI(
        ENDPOINTS.WORKODRDERTYPE_LIST,
        payload,
        currentMenu?.FUNCTION_CODE
      );

      setValue("CONFIGLIST", res?.CONFIGURATIONSMASTERSLIST);
      setConfigList(res?.CONFIGURATIONSMASTERSLIST);
     
    } catch (error: any) {
      toast.error(error);
    }
  };

  useEffect(() => {
    if (currentMenu?.FUNCTION_CODE && ASSET_NONASSET !== "") {
      (async function () {
        await getAPI()
        await saveTracker(currentMenu);
       })();
    }
  }, [currentMenu]);

  useEffect(() => {
    (async function () {
      await getAPI();
    })()
  }, [ASSET_NONASSET]);

 
  const onError: SubmitErrorHandler<FormData> = () => {
    toast.error(t("Please fill the required fields."))
  };
  // useEffect(() => {
   
  // }, []);
  return (
    <section className="w-full">
      <form>
        <div className="flex justify-between mt-1">
          <div>
            <h6 className="Text_Primary">
              {t(`${currentMenu?.FUNCTION_DESC}`)}{" "}
            </h6>
          </div>
          <div className="flex">
            <Buttons
              className="Primary_Button  w-20 me-2"
              label="Save"
              onClick={handleSubmit(onSubmit, onError)}
              IsSubmit={IsSubmit}
            />
          </div>
        </div>
        <Card className="mt-2">
          <div className="mt-1 grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-3 lg:grid-cols-3">
            <div className="col-span-3">
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
                          options={assetTypeLabel}
                          selectedData={"AS007"}
                          setValue={setValue}
                          {...field}
                        />
                      </>
                    );
                  },
                }}
              />
            </div>

            {fields.map((field, index) => {
             
              let checkStatus: boolean = field.ACTIVE ? true : false;
              return (
                <React.Fragment key={field.id}>

                  <div>
                    <Field
                      controller={{
                        name: `CONFIGLIST[${index}].FIELDNAME`,
                        control: control,
                        render: ({ field }: any) => {
                          return (
                            <InputField
                              {...register(`CONFIGLIST.${index}.FIELDNAME`, {})}
                              label="Field Name"
                              disabled={true}
                              placeholder={"Please Enter"}
                              {...field}
                            />
                          );
                        },
                      }}
                    />
                  </div>
                  <>{field?.ACTIVE === true ? true : false}</>
                  <div>
                    <Field
                      controller={{
                        name: `CONFIGLIST.[${index}].COLUMN_CAPTION`,
                        control: control,
                        render: ({ field }: any) => {


                          return (
                            <InputField
                              {...register(
                                `CONFIGLIST.${index}.COLUMN_CAPTION`,
                                {
                                  required: checkStatus ? t("Please fill the required fields.") : false,

                                  onBlur: (e: any) => {
                                    handleChangeColumn(e, index);
                                    trigger(`CONFIGLIST.${index}.COLUMN_CAPTION`); // Trigger validation
                                  },
                                }
                              )}
                              require={checkStatus ? true : ""}
                              label="Column Caption"
                              invalid={checkStatus && errors.CONFIGLIST?.[index]?.COLUMN_CAPTION}
                              disabled={checkStatus ? false : true}
                              placeholder={"Please Enter"}
                              {...field}
                            />
                          );
                        },
                      }}
                    />
                  </div>
                  <div>
                    {/* <label>Active</label> */}
                    <Field
                      controller={{
                        name: `CONFIGLIST[${index}].ACTIVE`,
                        control: control,
                        render: ({ field }: any) => {
                          return (
                            <Checkbox
                              {...register(`CONFIGLIST.${index}.ACTIVE`)}
                              className="md:mt-7"
                              label="Active"
                              {...field}
                              checked={checkStatus}
                              setValue={setValue}
                              onChange={(e: any) => handlerChange(e, index)}
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
      </form>
    </section>
  );
};

export default AssetMasterConfiguration;
interface ConfigListItem {
  id: string;
  FIELDNAME: string;
  COLUMN_CAPTION: string;
  ACTIVE: boolean;
}
