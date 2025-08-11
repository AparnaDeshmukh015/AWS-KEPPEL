
import { Card } from 'primereact/card';
import { useForm } from 'react-hook-form';
import { InputTextarea } from "primereact/inputtextarea";
import Field from '../../../components/Field';
import Checkboxs from '../../../components/Checkbox/Checkbox';
import { callPostAPI } from '../../../services/apis';
import { ENDPOINTS } from '../../../utils/APIEndpoints';
import { toast } from 'react-toastify';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import FormHeader from '../../../components/FormHeader/FormHeader';
import { useLocation, useOutletContext } from 'react-router-dom';
import { saveTracker } from '../../../utils/constants';
import Select from "../../../components/Dropdown/Dropdown";

const ReasonCommentMasterForm = (props: any) => {
  const { t } = useTranslation();
  const { search } = useLocation();
  const [IsSubmit, setIsSubmit] = useState<any | null>(false);
  const getId: any = localStorage.getItem("Id")
  const dataId = JSON.parse(getId)
  const [options, setOptions] = useState<any>([]);
  let { pathname } = useLocation();
  const [, menuList]: any = useOutletContext();
  const[subStatus, setSubStatus] = useState<any>([])
  const[subSelectedId, setSubSelectedId] = useState<any|null>()
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
      REASON_ID:search === '?edit=' ? dataId?.REASON_ID: 0,
      STATUS_CODE:search === '?edit=' ? dataId?.STATUS_CODE: "",
      MODE: search === '?edit=' ? 'E' : 'A',
            PARA: search === '?edit=' ? { "para1": `${props?.headerName}`, "para2": "Updated" }
                : { "para1": `${props?.headerName}`, "para2": "Added" },
        SUB_STATUS_CODE: search === '?edit=' ? dataId?.SUB_STATUS_CODE : null,
        REASON_DESCRIPTION: search === '?edit=' ? dataId?.REASON_DESCRIPTION: "",
            ACTIVE: search === '?edit=' ? dataId?.ACTIVE : true,
          
    },
    mode: "onSubmit",
  });

  const onSubmit = useCallback(async (payload: any) => {
    if (IsSubmit) return true
    setIsSubmit(true)
    
    payload.ACTIVE = payload?.ACTIVE ? 1 : 0;
    payload.REASON_DESCRIPTION = payload?.REASON_DESCRIPTION?.trim();
    payload.STATUS_CODE=payload?.STATUS_CODE?.STATUS_CODE;
    payload.SUB_STATUS_CODE=payload?.SUB_STATUS_CODE !== null ?payload?.SUB_STATUS_CODE?.SUB_STATUS_CODE :"";
   
    try {
      const res = await callPostAPI(ENDPOINTS.MASTERIINFRAREASONSAVE, payload)

      if (res?.FLAG === true) {
        toast?.success(res?.MSG)
        props?.getAPI()

        props?.isClick()
      } else {

        toast?.error(res?.MSG)
      }

    } catch (error: any) {

      toast?.error(error)
    } finally {
      setIsSubmit(false)
    }
  }, [IsSubmit, callPostAPI, toast, props?.getAPI, props?.isClick])

  useEffect(() => {
    if ((!isSubmitting && Object?.values(errors)[0]?.type === "required") || (!isSubmitting && Object?.values(errors)[0]?.type === "validate")) {
      const check: any = Object?.values(errors)[0]?.message;
      toast?.error(t(check));
    }
  }, [isSubmitting]);

  const getOptions = async () => {
    try {
        const res = await callPostAPI(
            ENDPOINTS.MASTERREASONLISTINFRA,
            null,
            currentMenu?.FUNCTION_CODE
        );
     
         setOptions({
          statusList: res?.STATUSLIST ?? [],
          subStatusList: res?.SUBSTATUSLIST ?? [],
        //     assestOptions: res?.STATUSLIST ?? []
         });

         if(search === '?edit='){
        
          const filterData:any=res?.SUBSTATUSLIST?.filter((fun:any) => {
           return (fun?.MAIN_STATUS=== dataId?.STATUS_CODE)})
          setSubStatus(filterData)
         }
    } catch (error) { }
};


  useEffect(() => {
    (async function () {
        await saveTracker(currentMenu)
        getOptions()
       })();
}, [])


useEffect(() => {
  if (search === '?edit=' && subStatus.length > 0) {
    const selectedSubStatus = subStatus.find((sub: any) => {
      return (+sub.SUB_STATUS_CODE === dataId?.SUB_STATUS_CODE)});
    if (selectedSubStatus) {
      setSubSelectedId(selectedSubStatus.SUB_STATUS_CODE);
    }
  }
}, [subStatus, options]);

return (
  <section className="w-full">
      <form onSubmit={handleSubmit(onSubmit)}>
          <FormHeader
              headerName={props?.headerName}
              isSelected={props?.selectedData ? true : false}
              isClick={props?.isClick}
              IsSubmit={IsSubmit}
          />
          <Card className='mt-2'>
              <div className="mt-1 grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-3 lg:grid-cols-3">
              <Field
                      controller={{
                          name: "STATUS_CODE",
                          control: control,
                          render: ({ field }: any) => {
                              return (
                                  <Select
                                      // options={opt}
                                      options={options?.statusList}
                                      {...register("STATUS_CODE", {
                                          required: "Please fill the required fields",
                                          onChange: (event:any) => {
                                             const filterData:any=options?.subStatusList?.filter((fun:any) => {
                                             return (fun?.MAIN_STATUS===event?.target?.value?.STATUS_CODE)})
                                           setSubStatus(filterData)
                                          }
                                      })}
                                      label="Status Code"
                                      require={true}
                                      optionLabel="STATUS_DESC"
                                      findKey={"STATUS_CODE"}
                                      selectedData={props?.selectedData?.STATUS_CODE}
                                      setValue={setValue}
                                      invalid={errors.STATUS_CODE}
                                      {...field}
                                  />
                              );
                          },
                      }}
                  />
                  <Field
                      controller={{
                          name: "SUB_STATUS_CODE",
                          control: control,
                          render: ({ field }: any) => {
                              return (
                                  <Select
                                    
                                      options={subStatus}
                                      {...register("SUB_STATUS_CODE", {
                                         // required: "Please fill the required fields",
                                      })}
                                      label="Sub Status"
                                     // require={true}
                                      optionLabel="SUB_STATUS_DESC"
                                      findKey={"SUB_STATUS_CODE"}
                                      selectedData={subSelectedId}
                                      setValue={setValue}
                                     // invalid={errors.SUB_STATUS_CODE}
                                      {...field}
                                  />
                              );
                          },
                      }}
                  />
                  <div className={`${errors?.REASON_DESCRIPTION ? "errorBorder" : ""}`}>
                      <label className="Text_Secondary Input_Label">{t("Reason")}<span className="text-red-600"> *</span></label>
                      <Field

                          controller={{
                              name: "REASON_DESCRIPTION",
                              control: control,
                              render: ({ field }: any) => {
                                  return (
                                      <InputTextarea
                                          {...register("REASON_DESCRIPTION", {
                                              required: t("Please fill the required fields."),
                                          })}
                                          require={true}
                                        //  value={SEND_APP_TEXT}
                                          label="Reason"
                                       //   onChange={(e) => setAppValue(e.target.value)}
                                          rows={3}
                                          invalid={errors.REASON_DESCRIPTION}

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
                                          checked={props?.selectedData?.ACTIVE || false}
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
)
}

export default ReasonCommentMasterForm
