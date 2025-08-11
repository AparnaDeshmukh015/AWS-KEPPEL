
import { Card } from 'primereact/card';
import { useForm } from 'react-hook-form';
import Field from '../../../components/Field';
import { callPostAPI } from '../../../services/apis';
import { ENDPOINTS } from '../../../utils/APIEndpoints';
import { toast } from 'react-toastify';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import FormHeader from '../../../components/FormHeader/FormHeader';
import Select from "../../../components/Dropdown/Dropdown";
import { useLocation, useOutletContext } from 'react-router-dom';
import Checkboxs from "../../../components/Checkbox/Checkbox";
import { InputTextarea } from "primereact/inputtextarea";
import { saveTracker } from "../../../utils/constants";

const ReasonMasterForm = (props: any) => {
    const { t } = useTranslation();
    let { pathname } = useLocation();
    const { search } = useLocation();
    const [, menuList]: any = useOutletContext();
    const [SEND_APP_TEXT, setAppValue] = useState("");
    const getId: any = localStorage.getItem("Id");
    const dataId = JSON.parse(getId);
    const currentMenu = menuList?.flatMap((menu: any) => menu?.DETAIL)?.filter((detail: any) => detail.URL === pathname)[0];
    const [options, setOptions] = useState<any>([]);
    const [IsSubmit, setIsSubmit] = useState<any | null>(false);
    const {
        register,
        handleSubmit,
        control,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: {
            MODE: search === '?edit=' ? 'E' : 'A',
            PARA: search === '?edit=' ? { "para1": `${props?.headerName}`, "para2": "Updated" }
                : { "para1": `${props?.headerName}`, "para2": "Added" },
            STATUS_DESC: search === '?edit=' ? dataId?.STATUS_DESC : "",
            REASON_DESC: search === '?edit=' ? dataId?.REASON_DESC : "",
            ACTIVE: search === '?edit=' ? dataId?.ACTIVE : true,

            REASON_ID: search === '?edit=' ? dataId?.REASON_ID : 0

        },
        mode: "onSubmit",
    });
    const onSubmit = useCallback(async (payload: any) => {
        payload.ACTIVE = payload?.ACTIVE ? 1 : 0;
        payload.STATUS_CODE = payload?.STATUS_DESC?.STATUS_CODE;
        if (IsSubmit) return true
        setIsSubmit(true)
        try {
            const res = await callPostAPI(ENDPOINTS.SAVE_REASON_MASTER, payload)
            if (res.FLAG === true) {
                toast?.success(res?.MSG)
                props?.getAPI()
                setIsSubmit(false)
                props?.isClick()
            } else {
                setIsSubmit(false)
                toast?.error(res?.MSG)
            }

        } catch (error: any) {
            setIsSubmit(false)
            toast?.error(error)
        }
    }, [IsSubmit, callPostAPI, toast, props?.getAPI, props?.isClick])
    const getOptions = async () => {
        try {
            const res = await callPostAPI(
                ENDPOINTS.GET_SERVICEREQUST_MASTERLIST,
                null,
                currentMenu?.FUNCTION_CODE
            );

            setOptions({
                assestOptions: res?.STATUSLIST ?? []
            });
        } catch (error) { }
    };

    useEffect(() => {
        (async function () {
            await getOptions()
           await saveTracker(currentMenu)
           })();
       
    }, [setOptions]);

    useEffect(() => {
        if (!isSubmitting && Object?.values(errors)[0]?.type === "required") {
            const check: any = Object?.values(errors)[0]?.message
            toast?.error(t(check));
        } else {
        }
    }, [isSubmitting])

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
                                name: "STATUS_DESC",
                                control: control,
                                render: ({ field }: any) => {
                                    return (
                                        <Select
                                            // options={opt}
                                            options={options?.assestOptions?.filter((e: any) => ['1', '4'].includes(e.STATUS_CODE))}
                                            {...register("STATUS_DESC", {
                                                required: "Please fill the required fields",
                                            })}
                                            label="Substatus"
                                            require={true}
                                            optionLabel="STATUS_DESC"
                                            findKey={"STATUS_DESC"}
                                            selectedData={props?.selectedData?.STATUS_DESC}
                                            setValue={setValue}
                                            invalid={errors.STATUS_DESC}
                                            {...field}
                                        />
                                    );
                                },
                            }}
                        />
                        <div className={`${errors?.REASON_DESC ? "errorBorder" : ""}`}>
                            <label className="Text_Secondary Input_Label">{t("Reason")}<span className="text-red-600"> *</span></label>
                            <Field

                                controller={{
                                    name: "REASON_DESC",
                                    control: control,
                                    render: ({ field }: any) => {
                                        return (
                                            <InputTextarea
                                                {...register("REASON_DESC", {
                                                    required: t("Please fill the required fields."),
                                                })}
                                                require={true}
                                                value={SEND_APP_TEXT}
                                                label="Reason"
                                                onChange={(e) => setAppValue(e.target.value)}
                                                rows={3}
                                                invalid={errors.REASON_DESC}

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

export default ReasonMasterForm