import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import Buttons from "../../../components/Button/Button";
import { useLocation, useOutletContext } from "react-router-dom";
import FormHeader from "../../../components/FormHeader/FormHeader";
import { Card } from "primereact/card";
import Select from "../../../components/Dropdown/Dropdown";
import InputField from "../../../components/Input/Input";
import { Calendar } from "primereact/calendar";
import Field from "../../../components/Field";
import { useTranslation } from "react-i18next";
import { InputTextarea } from "primereact/inputtextarea";
import DocumentUpload from "../../../components/pageComponents/DocumentUpload/DocumentUpload";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { toast } from "react-toastify";
import { callPostAPI } from "../../../services/apis";
import { ENDPOINTS } from "../../../utils/APIEndpoints";
import VendorSorDialogBox from "../../../components/DialogBox/VendorSorDialogBox";
import moment from "moment";

type VENDORSORHEADERProps = {
  "SOR_ID": number,
  "FACILITY_ID": number,
  "VENDOR_ID": number,
  "SOR_FROM_DATE": string | null,
  "SOR_TO_DATE": string | null,
  "REMARKS": string
}

type VENDORSORPARTLISTProps = {
  "SOR_ID": number | null,
  "SR_NO": number | null,
  "PART_ID": number | null,
  "SOR": number | null,
  "MIN_QTY": number | null,
  "UOM_ID": number | null,
  "WARRANTY_PERIOD": number | null
}


type FormValues = {

  sorDate: Date[];
  SOR_ID: number
  ACTIVE: number,
  PART_NAME: any,
  SOR_COST: any,
  SOR_VALIDITY: any,
  YEARLY_COST: any,
  WARRENTY_DUR: any,
  REMARKS: any,
  STORE_ID: string;
  ASSETTYPE_NAME: any,
  ASSETGROUP_NAME: any,
  DOC_LIST: VENDORSORDOCLISTProps[],
  SOR_DETAILS: VENDORSORPARTLISTProps[];
  // SOR_DOC_DETAILS: []
  MODE: string;
  PARA: { para1: string; para2: string };
  SOR_FROM_DATE: any,
  SOR_TO_DATE: any,
  MATREQ_ID: number;
};

type VENDORSORDOCLISTProps = any[]


type GetVendorSorDetailsProps = {
  FLAG: number,
  VENDORSORDOCLIST: VENDORSORDOCLISTProps,
  VENDORSORHEADER: VENDORSORHEADERProps[];
  VENDORSORPARTLIST: VENDORSORPARTLISTProps[];
}



const VendorManagementForm = (props: any) => {
  const { search } = useLocation();
  const { t } = useTranslation();
  const [IsSubmit, setIsSubmit] = useState<any | null>(false);
  const [sorDate, setSORDate] = useState<(Date | null)[]>([]);
  const [isDateSelected, setisDateSelected] = useState<(boolean)>(true);
  const [assetGroup, setassetGroup] = useState<(any)[]>([]);
  const [assetType, setassetType] = useState<(null)[]>([]);
  let [partOptions, setPartOptions] = useState([]);
  let [uomOptions, setUOMoptions] = useState<(any)[]>([]);
  let { pathname } = useLocation();
  const [, menuList]: any = useOutletContext();
  const currentMenu = menuList
    ?.flatMap((menu: any) => menu?.DETAIL)
    .filter((detail: any) => detail.URL === pathname)[0];
  const {
    register,
    handleSubmit,
    control,
    getValues,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {

      sorDate: [],
      SOR_DETAILS: [],

      MODE: "A",
      DOC_LIST: [],

      ACTIVE: 1,
      SOR_ID: search === "?edit=" ? props?.selectedData?.SOR_ID : 0,
      PARA: props?.selectedData || search === '?edit=' ? { "para1": `${props?.headerName}`, "para2": t('Updated') }
        : { "para1": `${props?.headerName}`, "para2": t('Added') },

    },
    mode: "all",
  });


  const SOR_DETAILS: any = watch("SOR_DETAILS")


  const { fields, remove, append } = useFieldArray({
    name: "SOR_DETAILS",
    control
  });

  const [selectedParts, setSelectedParts] = useState<VENDORSORPARTLISTProps[]>([]);
  const getpartlist = async () => {

    const res = await callPostAPI(ENDPOINTS.GET_INVENTORY_PARTLIST);

    const PartMasterList: any = res?.STORELIST.map((element: any, index: any) => {
      return {
        ...element,
        SOR: "",
        SR_NO: index + 1,
        MIN_QTY: "",
        WARRANTY_PERIOD: "",
        UOM_ID: ''
      }
    })

    setPartOptions(PartMasterList);
  };


  const getOptionsAssets = async () => {
    const payload = {
      ASSETTYPE: "P",
    };

    try {
      const res = await callPostAPI(ENDPOINTS.getAssestMasterList, payload, currentMenu?.FUNCTION_CODE);

      if (res?.FLAG === 1) {
        setUOMoptions(res?.UOMLIST)
        setassetGroup(res?.ASSESTGROUPLIST)
        setassetType(res?.ASSESTTYPELIST)

      }
    } catch (error) {
    }
  }



  useEffect(() => {
    (async function () {
      await getOptionsAssets()
    })()
  }, [])



  const getSorDetails = async () => {
    const payload = {
      SOR_ID: props?.selectedData?.SOR_ID
    }
    try {
      const res: GetVendorSorDetailsProps | undefined = await callPostAPI(ENDPOINTS.VENDOR_SOR_DETAILS, payload);
    
      if (res) {
        if (res?.FLAG === 1) {

          const remarks = res?.VENDORSORHEADER[0].REMARKS ?? ''
          const sorFromDate = new Date(res?.VENDORSORHEADER[0].SOR_FROM_DATE ?? '');
          const sorToDate = new Date(res?.VENDORSORHEADER[0].SOR_TO_DATE ?? "");
          setSORDate([sorFromDate, sorToDate]);

          setValue("SOR_DETAILS", res.VENDORSORPARTLIST)
          setValue("DOC_LIST", res?.VENDORSORDOCLIST)
          setSelectedParts(res.VENDORSORPARTLIST)


          setValue("REMARKS", remarks)
        }
      }

    } catch (error) {

    }

  }



  useEffect(() => {
    if (uomOptions)
      (async function () {
        await getSorDetails()
      })()
  }, [search === "?edit="])

  const handlerShow = (index: any, rowData: any) => {

    remove(index);


    const data: any = selectedParts?.filter((f: any) => f?.PART_ID !== rowData?.PART_ID)

    setSelectedParts(data);
  }


  const saveFuc = () => {
    if (selectedParts)
      if (SOR_DETAILS?.length < selectedParts?.length) {
        const data: any = [];
        const partListIds = new Set(SOR_DETAILS.map((part: any) => part.PART_ID));
        selectedParts.forEach((part: any) => {
          if (!partListIds.has(part.PART_ID)) {
            data.push(part);
          }
        });
        if (data?.length === 0) {
          if (selectedParts)
            setValue("SOR_DETAILS", selectedParts);
        } else {
          append(data)
        }
      } else {

        const selectedPartIds = new Set(selectedParts.map((part: any) => part.PART_ID));
        const matchingParts = selectedParts.filter((part: any) => selectedPartIds.has(part.PART_ID));



        const updatedMatchingParts = matchingParts.map((part: any, index: any) => {
          const matchedPart = SOR_DETAILS.find((listPart: any) => listPart.PART_ID === part.PART_ID);
          if (matchedPart) {
            return { ...part, SR_NO: index + 1 };
          }

          return { ...part, SR_NO: index + 1 };
        });

        setValue("SOR_DETAILS", updatedMatchingParts);
      }

  };

  useEffect(() => {
    (async function () {
      await getpartlist()
    })()

  }, [])
  const onSubmit = async (payload: any) => {
    if (IsSubmit) return;
    setIsSubmit(true);
    if (sorDate && sorDate.length === 2 && sorDate[0] && sorDate[1]) {

      payload.SOR_TO_DATE = moment(sorDate[1]).format('YYYY-MM-DD')
      payload.SOR_FROM_DATE = moment(sorDate[0]).format('YYYY-MM-DD')

      payload.SOR_DETAILS = payload?.SOR_DETAILS.map((part: any) => {
        return {
          ...part,  // Keep the other fields unchanged
          UOM_ID: part?.UOM_ID?.UOM_ID  // Extract only the numeric UOM_ID value
        };
      })


    }
    else {
      setisDateSelected(false)
      toast?.error("Please fill required fields")
      setIsSubmit(false)
      return
    }
  
    try {

      if (fields?.length > 0) {
        const res = await callPostAPI(ENDPOINTS.SAVE_VENDOR_SOR, payload);

        if (res?.FLAG === true) {
          toast?.success(res?.MSG);
          props?.getAPI()
          props?.isClick();
          setSORDate([])

        } else {
          toast?.error(res?.MSG);
          setIsSubmit(false)
        }
      }
      else {
        toast.error("Please select at least one part list");
        setIsSubmit(false)
      }

    } catch (error) {
      setIsSubmit(false)
    }
    finally {
      setIsSubmit(false)
    }
  }
  useEffect(() => {
    const nestedErrors: any = errors?.SOR_DETAILS || {};
    const firstError: any = Object?.values(nestedErrors)[0];
    if ((!isSubmitting && Object?.values(errors)[0]?.type === "required") || (!isSubmitting && Object?.values(errors)[0]?.type === "validate")) {
      setisDateSelected(false)
      const check: any = Object?.values(errors)[0]?.message;
      toast?.error(t(check));
    } else if (!isSubmitting && (firstError?.MIN_QTY?.type === "required" || firstError?.MIN_QTY?.type === "validate" || firstError?.SOR?.type === "required" || firstError?.SOR?.type === "validate" || firstError?.WARRANTY_PERIOD?.type === "required" || firstError?.WARRANTY_PERIOD?.type === "validate")) {
      const check: any = firstError?.MIN_QTY?.message || firstError?.SOR?.message || firstError?.WARRANTY_PERIOD?.message;
      toast?.error(t(check));
    }
  }, [isSubmitting]);

  return (
    <>
      <section className="w-full">
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormHeader
            headerName={props?.headerName}
            isSelected={props?.selectedData ? true : false}
            isClick={props?.isClick}
            IsSubmit={IsSubmit}
          />

          <Card className="mt-2">
            <div className="mt-1 grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-5 lg:grid-cols-5">
              <div>
                <label className="Text_Secondary Input_Label">
                  SOR Validity<span className="text-red-600"> *</span>
                </label>
                <div className={`${sorDate?.length === 0 && !isDateSelected ? 'errorBorder' : ''}`}>
                  <Calendar
                    value={sorDate}
                    onChange={(e) => {
                      setSORDate(e.value ?? [])

                    }}
                    selectionMode="range"
                    readOnlyInput
                    hideOnRangeSelection
                    placeholder="dd-mm-yyyy"
                    minDate={new Date()}
                    invalid

                  />
                </div>
              </div>

              <div className="col-span-2">
                <label className="Text_Secondary Input_Label">
                  Why we should consider you?
                </label>
                <Field
                  controller={{
                    name: "REMARKS",
                    control: control,
                    render: ({ field }: any) => {
                      return (
                        <InputTextarea
                          {...register("REMARKS", {

                          })}
                          invalid={errors?.REMARKS}
                          rows={1}
                          setValue={setValue}
                          maxLength={250}
                          {...field}
                        />
                      );
                    },
                  }}
                />
              </div>
              <div className="flex justify-center items-center mt-5">
                <VendorSorDialogBox
                  getpartlist={getpartlist}
                  partList={partOptions}
                  saveFuc={saveFuc}

                  selectedParts={selectedParts}
                  setSelectedParts={setSelectedParts}
                  assetGroup={assetGroup}
                  assetType={assetType}
                  setassetGroup={setassetGroup}
                  setassetType={setassetType}
                />
              </div>

            </div>
          </Card>
          <Card className="mt-2">
            <DataTable
              value={fields}
              key={fields?.length - 1}
              showGridlines
              emptyMessage={t("No Data found.")}

            >
              <Column
                field="SR_NO"
                header={t("Sr No")}
                className="w-40"
                body={(rowData, { rowIndex }) => {
                  return <>{rowIndex + 1}</>;
                }}

              ></Column>
              <Column
                field="PART_CODE"
                header={t("Part Code")}
                className="w-40"
              ></Column>
              <Column
                field="PART_NAME"
                header={t("Part Name")}
                className=""
              ></Column>

              <Column
                field="SOR"
                header={
                  <>
                    {t("SOR")}
                    <span className="text-red-500"> *</span>
                  </>
                }
                className="w-40"
                body={(rowData, { rowIndex }) => {
                  return (
                    <>
                      <Field
                        controller={{
                          name: `SOR_DETAILS.[${rowIndex}].SOR`,
                          control: control,
                          render: ({ field }: any) => {
                            return (
                              <InputField
                                {...register(
                                  `SOR_DETAILS.[${rowIndex}].SOR` as any,
                                  {
                                    required: "Please fill the Required fields",
                                    validate: (value) => {
                                      if (parseInt(value, 10) < 0 || parseInt(value, 10) === 0) {
                                        return (t("Should be greater than 0"));
                                      } else if (parseInt(value, 10) === 0) {
                                        return (t("Please enter the number"))
                                      } else {
                                        const sanitizedValue = value?.toString()?.replace(/[^0-9]/g, "");
                                        setValue(`SOR_DETAILS.[${rowIndex}].SOR` as any, sanitizedValue);
                                        return true;

                                      }
                                    },
                                  }
                                )}
                                errors
                                require={true}

                                setValue={setValue}
                                invalid={errors?.SOR_DETAILS?.[rowIndex]?.SOR}

                                {...field}
                              />
                            );
                          },
                        }}
                      />
                    </>
                  );
                }}
              ></Column>

              <Column
                field="QTY"
                header={
                  <>
                    {t("Min Qty")}
                    <span className="text-red-500"> *</span>
                  </>

                }
                className="w-40"
                body={(rowData, { rowIndex }) => {
                  return (
                    <>
                      <Field
                        controller={{
                          name: `SOR_DETAILS.[${rowIndex}].MIN_QTY`,
                          control: control,
                          render: ({ field }: any) => {
                            return (
                              <InputField
                                {...register(
                                  `SOR_DETAILS.[${rowIndex}].MIN_QTY` as any,
                                  {
                                    required: "Please fill the Required fields",
                                    validate: (value) => {
                                      if (parseInt(value, 10) < 0 || parseInt(value, 10) === 0) {
                                        return (t("Should be greater than 0"));
                                      } else if (parseInt(value, 10) === 0) {
                                        return (t("Please enter the number"))
                                      } else {
                                        const sanitizedValue = value?.toString()?.replace(/[^0-9]/g, "");
                                        setValue(`SOR_DETAILS.[${rowIndex}].MIN_QTY` as any, sanitizedValue);
                                        return true;

                                      }
                                    },
                                  }
                                )}
                                errors
                                require={true}

                                setValue={setValue}
                                invalid={errors?.SOR_DETAILS?.[rowIndex]?.MIN_QTY}

                                {...field}
                              />
                            );
                          },
                        }}
                      />
                    </>
                  );
                }}
              ></Column>
              <Column
                field="WARRANTY_PERIOD"
                header={
                  <>
                    {t("Warranty Duration (In Months)")}
                    <span className="text-red-500"> *</span>
                  </>

                }
                className="w-40"
                body={(rowData, { rowIndex }) => {
                  return (
                    <>
                      <Field
                        controller={{
                          name: `SOR_DETAILS.[${rowIndex}].WARRANTY_PERIOD`,
                          control: control,
                          render: ({ field }: any) => {
                            return (
                              <InputField
                                {...register(
                                  `SOR_DETAILS.[${rowIndex}].WARRANTY_PERIOD` as any,
                                  {
                                    required: "Please fill the Required fields",
                                    validate: (value) => {
                                      if (parseInt(value, 10) < 0 || parseInt(value, 10) === 0) {
                                        return (t("Should be greater than 0"));
                                      } else if (parseInt(value, 10) === 0) {
                                        return (t("Please enter the number"))
                                      } else {
                                        const sanitizedValue = value?.toString()?.replace(/[^0-9]/g, "");
                                        setValue(`SOR_DETAILS.[${rowIndex}].WARRANTY_PERIOD` as any, sanitizedValue);
                                        return true;

                                      }
                                    },
                                  }
                                )}
                                errors
                                require={true}

                                setValue={setValue}
                                invalid={errors?.SOR_DETAILS?.[rowIndex]?.WARRANTY_PERIOD}
                                {...field}
                              />
                            );
                          },
                        }}
                      />
                    </>
                  );
                }}
              ></Column>
              <Column
                field="UOM_NAME"
                header={
                  <>
                    {t("UOM")}
                    <span className="text-red-500"> *</span>
                  </>
                }
                className="w-40"
                body={(rowData, { rowIndex }) => {

                  return (
                    <>
                      <Field
                        controller={{
                          name: `SOR_DETAILS.[${rowIndex}].UOM_ID`,
                          control: control,
                          render: ({ field }: any) => {

                            const Id: any = SOR_DETAILS[rowIndex]?.UOM_ID?.UOM_ID


                            return (
                              <Select
                                options={uomOptions}
                                {...register(`SOR_DETAILS.${rowIndex}.UOM_ID`, {
                                  required: t("Please fill the required fields."),
                                })}

                                optionLabel="UOM_NAME"

                                invalid={errors?.SOR_DETAILS?.[rowIndex]?.UOM_ID}
                                findKey={"UOM_ID"}

                                selectedData={rowData?.UOM_ID}

                                setValue={setValue}

                                {...field}
                                value={Id !== undefined ? uomOptions?.filter((f: any) => f.UOM_ID === Id)[0] : ""}
                              />

                            );
                          },
                        }}
                      />
                    </>
                  );
                }}
              ></Column>
              {props?.selectedData === undefined && (
                <Column
                  field="Action"
                  header={t("Action")}
                  className="w-40"
                  body={(rowData: any, { rowIndex }) => {
                    return (
                      <>
                        <Buttons
                          type="button"
                          label=""
                          icon="pi pi-trash"
                          className="deleteButton"
                          onClick={() => {
                            handlerShow(rowIndex, rowData);
                          }}
                        />
                      </>
                    );
                  }}
                ></Column>
              )}
            </DataTable>
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
    </>
  );
};

export default VendorManagementForm;
