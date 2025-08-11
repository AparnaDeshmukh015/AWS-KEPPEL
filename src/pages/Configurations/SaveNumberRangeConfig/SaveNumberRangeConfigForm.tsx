import { useEffect, useState } from "react";
import InputField from "../../../components/Input/Input";
import Buttons from "../../../components/Button/Button";
import { Card } from "primereact/card";
import { SubmitErrorHandler, useFieldArray, useForm } from "react-hook-form";
import Field from "../../../components/Field";
import { useTranslation } from "react-i18next";
import { callPostAPI } from "../../../services/apis";
import { ENDPOINTS } from "../../../utils/APIEndpoints";
import { toast } from "react-toastify";
import { saveTracker } from "../../../utils/constants";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import React from "react";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
 import './numberranges.css'
 
interface Part {
  name: string;
  code: string;
}
 
interface PartConfig {
  PART_NO: number;
  PART_TYPE?: string;
  PART_CHAR?: string;
}
 
interface FormData {
  DOC_DESC: string;
  DOC_TYPE: string;
  PART_COUNT: number;
  DOCTYPE_CONFIG_LIST: PartConfig[];
  MODE: string;
  PARA: any;
}
 
const SaveNumberRangeConfigForm: React.FC<any> = (props) => {
  const { t } = useTranslation();
  const [configData, setconfigData] = useState([])
  const { search } = useLocation();
  const navigate: any = useNavigate();
  const getId: any = localStorage.getItem("Id")
  const dataId = JSON.parse(getId)
 
  const filterId: any = dataId.DOC_TYPE
 
  const [numberRange, setnumberRange] = useState<any | null>(false)
  const [partCount, setPartCount] = useState<any | null>(0)
  const partType: Part[] = [
    { name: "FNAME", code: "F" },
    { name: "PNAME", code: "P" },
  ];
 
  const partCharacter: Part[] = [
    { name: "date", code: "DD" },
    { name: "month", code: "MM" },
    { name: "MonthName", code: "MMM" },
    { name: "twoDigit", code: "YY" },
    { name: "Year", code: "YYYY" },
  ];
  type DocTypeProps = {
    PART_NO?: any;
    PART_TYPE?: any;
    PART_CHAR?: any;
  };
  const [DOCTYPE_CONFIG_LIST, DOCTYPE_CONFIG_LIST_SET] = useState<
    DocTypeProps[]
  >([
    {
      PART_NO: "",
      PART_TYPE: "",
      PART_CHAR: "",
    },
  ]);
  let { pathname } = useLocation();
  const [, menuList]: any = useOutletContext();
  const currentMenu = menuList
    ?.flatMap((menu: any) => menu?.DETAIL)
    .filter((detail: any) => detail.URL === pathname)[0];
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
 
      DOC_DESC: props?.selectedData ? props?.selectedData?.DOC_DESC : search === '?edit=' ? dataId?.DOC_DESC : "",
      DOC_TYPE: props?.selectedData ? props?.selectedData?.DOC_TYPE : search === '?edit=' ? dataId?.DOC_TYPE : "",
      PART_COUNT: props?.selectedData ? props?.selectedData?.PART_COUNT : search === '?edit=' ? dataId?.PART_COUNT : "",
      DOCTYPE_CONFIG_LIST: DOCTYPE_CONFIG_LIST,
      MODE: props?.selectedData ? "E" : "A",
      PARA: props?.selectedData
        ? { para1: `${props?.headerName}`, para2: "Updated" }
        : { para1: `${props?.headerName}`, para2: "Added" },
    },
    mode: "onSubmit",
  });
 
  const { fields } = useFieldArray({
    name: "DOCTYPE_CONFIG_LIST",
    control,
  });

  const PART_COUNT: number = watch("PART_COUNT");
 
  const onSubmit = async (payload: any) => {
    const updatedDocType: any = DOCTYPE_CONFIG_LIST?.map((doc: any, index: any) => {
    
      if (index < PART_COUNT) {
        return {
          PART_NO: index + 1,
          PART_TYPE: doc?.PART_TYPE,
          PART_CHAR: doc?.PART_CHAR
          // doc?.PART_TYPE?.code === "P" ? doc?.PART_CHAR?.code : doc?.PART_CHAR,
        };
      }
    }).filter((item: any) => item !== undefined);
    payload.DOCTYPE_CONFIG_LIST = updatedDocType;
    
    try {
      const res = await callPostAPI(ENDPOINTS.saveNumberRangeConfig, payload);
      toast?.success(res?.MSG);
      props?.getAPI();
      props?.isClick();
 
    } catch (error: any) {
      toast?.error(error);
    }
  };
  const DOCTYPE_CONFIG_LIST1 = watch("DOCTYPE_CONFIG_LIST");
 
  const handleChange = (e: any, index: any) => {
    const updatedData: any = DOCTYPE_CONFIG_LIST?.map((field: any, id: any) => {
      if (id === index) {
        return {
          ...field,
          PART_TYPE: e.target.value.code,
          PART_CHAR: "",
        };
      }
      return field;
    });
  
    DOCTYPE_CONFIG_LIST_SET(updatedData);
  };
 
  const handleChangePART_CHAR = (e: any, index: any) => {
 
    DOCTYPE_CONFIG_LIST_SET((prevState) =>
      prevState.map((field, id) => {
        if (id === index) {
 
          return {
            ...field,
            PART_CHAR:
              field.PART_TYPE === "P" ? e.target.value.code : e.target.value,
          };
        }
        return field;
      })
    );
  };
  const getPartCountSet = (e: any) => {
    setnumberRange(false)
    setPartCount(DOCTYPE_CONFIG_LIST.length)
    let calLength: number = PART_COUNT - DOCTYPE_CONFIG_LIST.length;
    let totalLength: number = DOCTYPE_CONFIG_LIST.length;
    if (PART_COUNT < totalLength) {
      const updatedList = [...DOCTYPE_CONFIG_LIST].slice(0, PART_COUNT);
      DOCTYPE_CONFIG_LIST_SET(updatedList);
 
    } else {
      for (let i: number = 0; i < calLength; i++) {
        DOCTYPE_CONFIG_LIST_SET((prevState) => [
          ...prevState,
          {
        
           PART_NO:"",
            PART_TYPE: "",
          },
        ]);
      }
    }
  };
 
 
  const getCommonConfiguration = (propsData: any) => {
    const newObject = { ...propsData };
    delete newObject?.DOC_DESC;
    delete newObject?.DOC_TYPE;
    delete newObject?.RESET_NUMBER;
    delete newObject?.PART_COUNT;
 
    const nonNullData: any = Object.entries(newObject)
      .filter(([_, value]) => value !== null)
      .reduce((acc: any, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {});
 
    const updatedParts = Object.entries(nonNullData)
 
      .map(([key, value], index) => ({
        PART_NO: index + 1,
        PART_TYPE: nonNullData[`PARTTYPE_${index + 1}`],
        PART_CHAR: nonNullData[`PART_CHAR_${index + 1}`],
      }))
      .filter((data) => data.PART_TYPE !== undefined);
   
     setValue("DOCTYPE_CONFIG_LIST", updatedParts);
    DOCTYPE_CONFIG_LIST_SET(updatedParts);
  }
 
  useEffect(() => {
    if (props?.selectedData) {
      setnumberRange(true)
      getCommonConfiguration(props?.selectedData)
    } else if (props.selectedData === null || props.selectedData === undefined) {
      getCommonConfiguration(dataId)
    }
 
 
  }, [])
 
 

  const onError: SubmitErrorHandler<FormData> = (errors, e) => {
    toast.error(t("Please fill the required fields."))
  };

  useEffect(() => {
    saveTracker(currentMenu);
  }, []);
 
  return (
    <section className="w-full">
      <form onSubmit={handleSubmit(onSubmit, onError)}>
        <div className="flex justify-between mt-1">
          <div>
            <h6 className="Text_Primary">
              {props?.selectedData ? "Edit" : "Edit"} {props?.headerName}{" "}Configuration
            </h6>
          </div>
          <div className="flex">
            <Buttons
              type="submit"
              className="Primary_Button  w-20 me-2"
              label={"Save"}
            />
            <Buttons
              type="button"
              className="Secondary_Button w-20 "
              label={"List"}
              onClick={() => {
                navigate("/numberrangeconfig");
              }}
            />
          </div>
        </div>
        <Card className="mt-2">
          <div className="mt-1 grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-4 lg:grid-cols-4">
            <Field
              controller={{
                name: "DOC_DESC",
                control: control,
                render: ({ field }: any) => (
                  <InputField
                    {...register("DOC_DESC", {
                      required: "Please fill the required fields",
                    })}
                    label="Document Description"
                    require={true}
                    placeholder={t("Please_Enter")}
                    // invalid={errors.DOC_DESC}
                    className={`${errors.DOC_DESC ? "errorBorder" : ""}`}
                    {...field}
                  />
                ),
              }}
              error={errors?.DOC_DESC?.message}
            />
            <Field
              controller={{
                name: "DOC_TYPE",
                control: control,
                render: ({ field }: any) => (
                  <InputField
                    {...register("DOC_TYPE", {
                      required: "Please fill the required fields",
                    })}
                    label="Document Type"
                    require={true}
                    placeholder={t("Please_Enter")}
                    // invalid={errors.DOC_TYPE}
                    className={`${errors.DOC_TYPE ? "errorBorder" : ""}`}
                    {...field}
                  />
                ),
              }}
            // error={errors?.DOC_TYPE?.message}
            />
            <Field
              controller={{
                name: "PART_COUNT",
                control: control,
                render: ({ field }: any) => (
                  <InputField
                    {...register("PART_COUNT", {
                      required: "Please fill the required fields",
                      pattern: {
                        value: /^[0-9]+$/,
                        message: "Please enter a number",
                      },
                      minLength: {
                        value: 1,
                        message: "Minimum 1 digit required",
                      },
                      maxLength: {
                        value: 2,
                        message: "Max 2 digit allowed",
                      },
                    })}
                    label="Part Count"
                    require={true}
                    placeholder={t("Please_Enter")}
                    // invalid={errors.PART_COUNT}
                    className={`${errors.PART_COUNT ? "errorBorder" : ""}`}
                    {...field}
                  />
                ),
              }}
              error={errors?.PART_COUNT?.message}
            />
 
            <Buttons
              title="Generate"
              label="Generate"
              onClick={getPartCountSet}
              className="bg-[#8E724A] w-24 text-white h-10 mt-auto"
            />
          </div>
 
          {DOCTYPE_CONFIG_LIST?.map((el: any, i: any) => {
            let parttype: any = partType?.filter((f: any) => f.code === el?.PART_TYPE)[0]
            let partcharacter: any = partCharacter?.filter((f: any) => f.code === el?.PART_CHAR)[0]
             
            return (
 
              <div
                className="mt-1 grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-2 lg:grid-cols-2"
                key={el?.id}
              >
             
 
                <div >
                  <label className="Text_Secondary Input_Label">
                    Part Type <span className="text-red-600"> *</span> </label>
                  <Field
                    controller={{
                      name: `DOCTYPE_CONFIG_LIST.${i}.PART_TYPE`,
                      control,
                      render: ({ field }: any) => (
                        <Dropdown
                          options={partType}
                          {...register(
                            `DOCTYPE_CONFIG_LIST.${i}.PART_TYPE` as any,
                            {
                              required: "Please fill the required fields",
                            }
                          )}
                          optionLabel="code"
                          onChange={(e: any) => {
                            handleChange(e, i);
                          }}
                          value={parttype}
 
                          className={`w-full md:w-14rem ${errors.DOCTYPE_CONFIG_LIST?.[i]?.PART_TYPE ? "errorBorder" : ""}`} />
                      ),
                    }}
              
                  />
                </div>
 
                {el?.PART_TYPE !== "" ? (
                  <>
                    {el?.PART_TYPE === "P" ? (
                      <>
                        <div>
                          <label className="Text_Secondary Input_Label">
                            Part Char <span className="text-red-600"> *</span> </label>
                          <Field
                            controller={{
                              name: `DOCTYPE_CONFIG_LIST.${i}.PART_CHAR`,
                              control,
                              render: ({ field }: any) => (
                                <Dropdown
                                  options={partCharacter}
                                  {...register(
                                    `DOCTYPE_CONFIG_LIST.${i}.PART_CHAR` as any,
                                    {
                                      required: "Please fill the required fields",
                                    }
                                  )}
                                  optionLabel="code"
                                  onChange={(e: any) => {
                                    handleChangePART_CHAR(e, i);
                                  }}
 
                                  value={partcharacter}
 
                                  className={`w-full md:w-14rem ${errors.DOCTYPE_CONFIG_LIST?.[i]?.PART_CHAR ? "errorBorder" : ""}`}
                                />
                              ),
                            }}
                          // error={errors?.DOCTYPE_CONFIG_LIST?.[i]?.PART_TYPE?.message} // Display the specific error message
                          />
                        </div>
 
                      </>
                    ) : (
                      <>
                       <div>
                          <label className="Text_Secondary Input_Label">
                            Part Char <span className="text-red-600"> *</span> </label>
                        <Field
                          controller={{
                            name: `DOCTYPE_CONFIG_LIST.[${i}].PART_CHAR`,
                            control: control,
                            render: ({ field }: any) => (
                              <InputText
                              {...register(
                                `DOCTYPE_CONFIG_LIST.${i}.PART_CHAR`,
                                {
                                  required: el?.PART_TYPE !== "P" ? "Please fill the required fields" : "",
                                 
                                }
                              )}
                               value={el?.PART_CHAR}
                               onChange={ (e: any) => {
                                handleChangePART_CHAR(e, i);
                              }}
                              className={`w-full md:w-14rem ${errors.DOCTYPE_CONFIG_LIST?.[i]?.PART_CHAR ? "errorBorder" : ""}`}
                              />
                            ),
                          }}
                          error={"error"}
                        />
                        </div>
                      </>
                    )}{" "}
                  </>
                ) : (
                  ""
                )}
              </div>
 
            );
          })}
 
        </Card>
      </form>
    </section>
  );
};
 
export default SaveNumberRangeConfigForm;