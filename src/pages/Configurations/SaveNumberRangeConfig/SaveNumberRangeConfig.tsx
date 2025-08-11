import { useCallback, useEffect, useState } from "react";
import { ENDPOINTS } from "../../../utils/APIEndpoints";
import { callPostAPI } from "../../../services/apis";
import { useLocation, useOutletContext } from "react-router-dom";
import { toast } from "react-toastify";
import TableListLayout from "../../../layouts/TableListLayout/TableListLayout";
import Select from "../../../components/Dropdown/Dropdown";
import Field from "../../../components/Field";
import { SubmitErrorHandler, useForm } from "react-hook-form";
import InputField from "../../../components/Input/Input";
import Buttons from "../../../components/Button/Button";
import { Card } from "primereact/card";
import React from "react";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import "./numberranges.css";
import { saveTracker } from "../../../utils/constants";
import { useTranslation } from "react-i18next";

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
  DOC_TYPE1: string;

  PART_COUNT: any;
  DOCTYPE_CONFIG_LIST: PartConfig[];
  MODE: string;
  PARA: any;
}

const SaveNumberRangeConfig = () => {
  let { pathname } = useLocation();
  // const navigate: any = useNavigate();
  const [selectedFacility, menuList]: any = useOutletContext();
  const [numberRangeOpt, setnumberRangeOpt] = useState<any | null>([]);
  const [selectedData, setselectedData] = useState<any | null>([]);
  const [doctType, setDocType] = useState<any | null>();
  const [isVisible, setisVisible] = useState<boolean>(false);

  const FACILITY: any = localStorage.getItem("FACILITYID");
  const FACILITY_ID: any = JSON.parse(FACILITY);
  if (FACILITY_ID) {
    var facility_type: any = FACILITY_ID?.FACILITY_TYPE;
  }
  const currentMenu = menuList
    ?.flatMap((menu: any) => menu?.DETAIL)
    .filter((detail: any) => detail.URL === pathname)[0];
  const getAPI = async () => {
    try {
      const res = await callPostAPI(
        ENDPOINTS.getConfigurationsMastersList,
        {},
        currentMenu?.FUNCTION_CODE
      );

      setnumberRangeOpt(res?.CONFIGURATIONSMASTERSLIST);
      const rangeData: any = res?.CONFIGURATIONSMASTERSLIST?.filter(
        (f: any) => f?.DOC_TYPE === doctType?.DOC_TYPE
      );
      setDocType(rangeData[0]);
      getCommonConfiguration(rangeData[0]);
      localStorage.setItem("currentMenu", JSON.stringify(currentMenu));
    } catch (error: any) {
      toast.error(error);
    }
  };

  useEffect(() => {
    if (currentMenu?.FUNCTION_CODE) {
      (async function () {
        await getAPI();
      })();
    }
  }, [selectedFacility, currentMenu, facility_type]);
  const { t } = useTranslation();

  const [IsSubmit, setIsSubmit] = useState<any | null>(false);

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
  const infraPartCharacter: Part[] = [
    { name: "date", code: "DD" },
    { name: "month", code: "MM" },
    { name: "MonthName", code: "MMM" },
    { name: "twoDigit", code: "YY" },
    { name: "Year", code: "YYYY" },
    { name: "Team", code: "TM" },
    { name: "WorkOrder", code: "WT" },
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

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      DOC_DESC: selectedData?.DOC_DESC,
      DOC_TYPE1: "",

      PART_COUNT: selectedData?.PART_COUNT,
      DOCTYPE_CONFIG_LIST: DOCTYPE_CONFIG_LIST,
      MODE: "E",
      PARA: { para1: `Configuration`, para2: "Updated" },
    },
    mode: "onSubmit",
  });

  useEffect(() => {
    if (selectedData) {
      setValue("DOC_DESC", selectedData?.DOC_DESC);
      setValue("DOC_TYPE1", selectedData?.DOC_TYPE);
      setValue("PART_COUNT", selectedData?.PART_COUNT);
    }
  }, [selectedData]);

  const PART_COUNT: any = watch("PART_COUNT");

  const onSubmit = useCallback(
    async (payload: any) => {
      if (IsSubmit) return true;
      setIsSubmit(true);
      const updatedDocType: any = DOCTYPE_CONFIG_LIST?.map(
        (doc: any, index: any) => {
          if (index < PART_COUNT) {
            return {
              PART_NO: index + 1,
              PART_TYPE: doc?.PART_TYPE,
              PART_CHAR: doc?.PART_CHAR,
              // doc?.PART_TYPE?.code === "P" ? doc?.PART_CHAR?.code : doc?.PART_CHAR,
            };
          }
        }
      ).filter((item: any) => item !== undefined);
      payload.DOCTYPE_CONFIG_LIST = updatedDocType;

      // return

      try {
        const res = await callPostAPI(ENDPOINTS.saveNumberRangeConfig, payload);
        toast?.success(res?.MSG);

        await getAPI();

        // isClick();
      } catch (error: any) {
        toast?.error(error);
      } finally {
        setIsSubmit(false);
      }
    },
    [
      IsSubmit,
      DOCTYPE_CONFIG_LIST,
      PART_COUNT,
      callPostAPI,
      toast,
      doctType,
      setValue,
      getAPI,
      ENDPOINTS,
    ]
  );

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
  const getPartCountSet = () => {
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
            PART_NO: "",
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
  };

  useEffect(() => {
    setselectedData(selectedData);
    getCommonConfiguration(selectedData);
  }, [selectedData]);

  const onError: SubmitErrorHandler<FormData> = () => {
    toast.error("Please fill the required fields.");
  };

  useEffect(() => {
    (async function () {
      await saveTracker(currentMenu);
    })();
  }, []);

  const handleSelectChange = (selectedOption: any) => {
    if (selectedOption) {
      setselectedData(selectedOption);
      setDocType(selectedOption);
    }
  };
  useEffect(() => {
    if (doctType) {
    }
  }, [doctType]);

  const customOnChange = (e: any) => {
    e.preventDefault();

    const selectedValue = e.value;
    setisVisible(true);

    setDocType(selectedValue);

    setValue("PART_COUNT", "");
    handleSelectChange(selectedValue); // Navigate or do other logic
  };

  return (
    <>
      <div>
        <h6 className="Text_Primary">Edit Configuration</h6>
      </div>
      <div style={{ width: "25%", marginTop: 20 }}>
        <Field
          controller={{
            name: "DOC_TYPE",
            control: control,
            render: ({ field }: any) => {
              return (
                <Select
                  options={numberRangeOpt}
                  {...field}
                  onChange={(e: any) => {
                    customOnChange(e);
                  }}
                  label="Doc Type"
                  optionLabel="DOC_DESC"
                  placeholder="Please Select"
                  value={doctType}
                  require={true}
                />
              );
            },
          }}
        />
      </div>

      {isVisible && (
        <section className="w-full">
          <form onSubmit={handleSubmit(onSubmit, onError)}>
            {/* <div className="flex justify-between mt-1"> */}

            <div className="flex justify-end">
              <Buttons
                type="submit"
                className="Primary_Button  w-20 me-2"
                label={"Save"}
                IsSubmit={IsSubmit}
              />
              {/* <Buttons
                                type="button"
                                className="Secondary_Button w-20 "
                                label={"List"}
                                onClick={() => {
                                    navigate("/numberrangeconfig");
                                }}
                            /> */}
            </div>
            {/* </div> */}
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
                        className={`${errors.DOC_DESC ? "errorBorder" : ""}`}
                        {...field}
                      />
                    ),
                  }}
                  error={errors?.DOC_DESC?.message}
                />
                <Field
                  controller={{
                    name: "DOC_TYPE1",
                    control: control,
                    render: ({ field }: any) => (
                      <InputField
                        {...register("DOC_TYPE1", {
                          required: "Please fill the required fields",
                        })}
                        label="Document Type"
                        // selectedData={selectedData?.DOC_TYPE}
                        require={true}
                        placeholder={t("Please_Enter")}
                        // invalid={errors.DOC_TYPE}

                        className={`${errors.DOC_TYPE1 ? "errorBorder" : ""}`}
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
                let parttype: any = partType?.filter(
                  (f: any) => f.code === el?.PART_TYPE
                )[0];
                let partcharacter: any =
                  facility_type === "I"
                    ? infraPartCharacter?.filter(
                        (f: any) => f.code === el?.PART_CHAR
                      )[0]
                    : partCharacter?.filter(
                        (f: any) => f.code === el?.PART_CHAR
                      )[0];

                return (
                  <div
                    className="mt-1 grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-2 lg:grid-cols-2"
                    key={el?.id}
                  >
                    <div>
                      <label className="Text_Secondary Input_Label">
                        Part Type<span className="text-red-600"> *</span>{" "}
                      </label>
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
                              {...field}
                              optionLabel="code"
                              onChange={(e: any) => {
                                handleChange(e, i);
                                field.onChange(e);
                              }}
                              value={parttype}
                              className={`w-full md:w-14rem ${
                                errors.DOCTYPE_CONFIG_LIST?.[i]?.PART_TYPE
                                  ? "errorBorder"
                                  : ""
                              }`}
                            />
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
                                Part Char{" "}
                                <span className="text-red-600"> *</span>{" "}
                              </label>
                              <Field
                                controller={{
                                  name: `DOCTYPE_CONFIG_LIST.${i}.PART_CHAR`,
                                  control,
                                  render: ({ field }: any) => (
                                    <Dropdown
                                      options={
                                        facility_type === "I"
                                          ? infraPartCharacter
                                          : partCharacter
                                      }
                                      {...register(
                                        `DOCTYPE_CONFIG_LIST.${i}.PART_CHAR` as any,
                                        {
                                          required:
                                            "Please fill the required fields",
                                        }
                                      )}
                                      {...field}
                                      optionLabel="code"
                                      onChange={(e: any) => {
                                        handleChangePART_CHAR(e, i);
                                        field.onChange(e);
                                      }}
                                      value={partcharacter}
                                      className={`w-full md:w-14rem ${
                                        errors.DOCTYPE_CONFIG_LIST?.[i]
                                          ?.PART_CHAR
                                          ? "errorBorder"
                                          : ""
                                      }`}
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
                                Part Char
                                <span className="text-red-600"> *</span>{" "}
                              </label>
                              <Field
                                controller={{
                                  name: `DOCTYPE_CONFIG_LIST.[${i}].PART_CHAR`,
                                  control: control,
                                  render: ({ field }: any) => (
                                    <InputText
                                      {...register(
                                        `DOCTYPE_CONFIG_LIST.${i}.PART_CHAR`,
                                        {
                                          required:
                                            el?.PART_TYPE !== "P"
                                              ? "Please fill the required fields"
                                              : "",
                                        }
                                      )}
                                      {...field}
                                      value={el?.PART_CHAR}
                                      onChange={(e: any) => {
                                        handleChangePART_CHAR(e, i);
                                        field.onChange(e);
                                      }}
                                      className={`w-full md:w-14rem ${
                                        errors.DOCTYPE_CONFIG_LIST?.[i]
                                          ?.PART_CHAR
                                          ? "errorBorder"
                                          : ""
                                      }`}
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
      )}
    </>
  );
};

const Index: React.FC = () => {
  return (
    <TableListLayout>
      <SaveNumberRangeConfig />
    </TableListLayout>
  );
};

export default Index;
