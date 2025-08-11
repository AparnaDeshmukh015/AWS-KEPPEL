
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
const RectifyCommentMasterForm = (props: any) => {
  const { t } = useTranslation();
  const { search } = useLocation();
  const [IsSubmit, setIsSubmit] = useState<any | null>(false);
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
      MODE: props?.selectedData || search === '?edit=' ? 'E' : 'A',
      PARA: props?.selectedData || search === '?edit=' ? { "para1": `${props?.headerName}`, "para2": t('Updated') }
        : { "para1": `${props?.headerName}`, "para2": t('Added') },
      RECT_ID: props?.selectedData ? props?.selectedData?.RECT_ID : search === '?edit=' ? dataId?.RECT_ID : 0,
      COMMENT_DESC: props?.selectedData ? props?.selectedData?.COMMENT_DESC : search === '?edit=' ? dataId?.COMMENT_DESC : "",
      ACTIVE: search === "?edit=" ? dataId?.ACTIVE : true,
    },
    mode: "onSubmit",
  });

  const onSubmit = useCallback(async (payload: any) => {
    if (IsSubmit) return true
    setIsSubmit(true)
    payload.ACTIVE = payload?.ACTIVE ? 1 : 0;
    payload.COMMENT_DESC = payload?.COMMENT_DESC?.trim();
    try {
      const res = await callPostAPI(ENDPOINTS.SAVE_RECTIFIEDMASTER, payload)

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

  useEffect(() => {
    (async function () {
        await saveTracker(currentMenu)
       })();
}, [])

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
          <Card className='mt-2'>
            <div className={`${errors?.COMMENT_DESC ? "errorBorder" : ""}`}>
              <label className="Text_Secondary Input_Label">{t("Comment")} <span className="text-red-600"> *</span></label>
              <div className="mt-1 grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-3 lg:grid-cols-3">
                <Field
                  controller={{
                    name: "COMMENT_DESC",
                    control: control,
                    render: ({ field }: any) => {
                      return (
                        <InputTextarea
                          {...register("COMMENT_DESC", {
                            required: t("Please fill the required fields."),
                            validate: value => value.trim() !== "" || t("Please fill the required fields.")
                          })}
                          require={true}
                          label="Comment"
                          invalid={errors.COMMENT_DESC}
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
                            className='md:mt-7'
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

            </div>
          </Card>
        </form>
      </section>
    </>
  )
}

export default RectifyCommentMasterForm
