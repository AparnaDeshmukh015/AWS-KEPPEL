import InputField from '../../../components/Input/Input'
import { Card } from 'primereact/card';
import { useForm } from 'react-hook-form';
import Field from '../../../components/Field';
import Checkboxs from '../../../components/Checkbox/Checkbox';
import { callPostAPI } from '../../../services/apis';
import { ENDPOINTS } from '../../../utils/APIEndpoints';
import { toast } from 'react-toastify';
import Select from "../../../components/Dropdown/Dropdown";
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import FormHeader from '../../../components/FormHeader/FormHeader';
import { saveTracker } from '../../../utils/constants';
import { useLocation, useOutletContext } from 'react-router-dom';

const AnalyticsPlateformAssetLink = (props: any) => {
    const { t } = useTranslation();
    let { pathname } = useLocation();
    const [, menuList]: any = useOutletContext();
    const currentMenu = menuList
        ?.flatMap((menu: any) => menu?.DETAIL)
        .filter((detail: any) => detail.URL === pathname)[0];
    const [options, setOptions] = useState<any>([]);
    const { search } = useLocation();
    const getId: any = localStorage.getItem("Id")
    const dataId = JSON.parse(getId)
    const [IsSubmit, setIsSubmit] = useState<any | null>(false);
    const {
        register,
        handleSubmit,
        control,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: {
            MODE: props?.selectedData || search === '?edit=' ? 'E' : 'A',
            PARA: props?.selectedData || search === '?edit=' ? { "para1": `${props?.headerName}`, "para2": t("Updated") }
                : { "para1": `${props?.headerName}`, "para2": t("Added") },

            ACTIVE: search === '?edit=' ? dataId?.ACTIVE  : true,
            OBEM_ASSET_ID: props?.selectedData ? props?.selectedData?.OBEM_ASSET_ID : search === '?edit=' ? dataId?.OBEM_ASSET_ID : '',
            OBEM_ASSET_NAME: props?.selectedData ? props?.selectedData?.OBEM_ASSET_NAME : search === '?edit=' ? dataId?.OBEM_ASSET_NAME : '',
            SPACE_ID: props?.selectedData ? props?.selectedData?.SPACE_ID : search === '?edit=' ? dataId?.SPACE_ID : '',
            SPACE_NAME: props?.selectedData ? props?.selectedData?.SPACE_NAME : search === '?edit=' ? dataId?.SPACE_NAME : '',
            ASSET: props?.selectedData ? props?.selectedData?.ASSET_ID : search === '?edit=' ? dataId?.ASSET_ID : '',

        },
        mode: "onSubmit",
    });
    const onSubmit = useCallback(async (payload: any) => {
        if (IsSubmit) return;
        setIsSubmit(true)
        payload.ASSET_ID = payload?.ASSET?.ASSET_ID;
        payload.ACTIVE = payload?.ACTIVE ? 1 : 0;
        try {
            const res = await callPostAPI(ENDPOINTS.saveObemAssetMaster, payload)
            if (res?.FLAG === true) {
                toast?.success(res?.MSG)
                props?.getAPI()
                props?.isClick()
            }
            else {
                toast?.error(res?.MSG)
            }

        } catch (error: any) {
            toast?.error(error)
        }
        finally {
            setIsSubmit(false)
        }
    }, [IsSubmit, search, props, toast]);

    const getOptions = async () => {
        try {
            const res = await callPostAPI(
                ENDPOINTS.GET_SERVICEREQUST_MASTERLIST,
                null,
                currentMenu?.FUNCTION_CODE
            );
            setOptions({
                assestOptions: res?.ASSETLIST
            });
        } catch (error) { }
    };

    useEffect(() => {
        if ((!isSubmitting && Object?.values(errors)[0]?.type === "required") || (!isSubmitting && Object?.values(errors)[0]?.type === "validate")) {
            const check: any = Object?.values(errors)[0]?.message;
            toast?.error(t(check));
        }
    }, [isSubmitting]);

    useEffect(() => {
        (async function () {
            await getOptions()
           await saveTracker(currentMenu)
           })();
       
    }, [])

    return (
        <>
            <section className="w-full">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <FormHeader
                        headerName={props?.headerName}
                        isSelected={search === "?edit=" ? true : false}
                        isClick={props?.isClick}
                        IsSubmit={IsSubmit}
                    />
                    <Card className='mt-2'>
                        <div className="mt-1 grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-3 lg:grid-cols-3">
                            <Field
                                controller={{
                                    name: "OBEM_ASSET_ID",
                                    control: control,
                                    render: ({ field }: any) => {
                                        return (
                                            <InputField
                                                {...register("OBEM_ASSET_ID", {
                                                    required: t("Please fill required fields."),
                                                    validate: value => value.trim() !== "" || t("Please fill the required fields.")
                                                })}
                                                require={true}
                                                label="Obem Equipment Id"
                                                disabled={props?.selectedData ? true : false}
                                                invalid={errors.OBEM_ASSET_ID}
                                                {...field}
                                            />
                                        );
                                    },
                                }}
                            />
                            <Field
                                controller={{
                                    name: "OBEM_ASSET_NAME",
                                    control: control,
                                    render: ({ field }: any) => {
                                        return (
                                            <InputField
                                                {...register("OBEM_ASSET_NAME", {
                                                    required: t("Please fill required fields."),
                                                    validate: value => value.trim() !== "" || t("Please fill the required fields.")
                                                })}
                                                require={true}
                                                label="Obem Equipment Name"
                                                invalid={errors.OBEM_ASSET_NAME}
                                                {...field}
                                            />
                                        );
                                    },
                                }}
                            />
                            <Field
                                controller={{
                                    name: "SPACE_ID",
                                    control: control,
                                    render: ({ field }: any) => {
                                        return (
                                            <InputField
                                                {...register("SPACE_ID", {
                                                    required: t("Please fill required fields."),
                                                    validate: value => value.trim() !== "" || t("Please fill the required fields.")
                                                })}
                                                require={true}
                                                label="Space Id"
                                                invalid={errors.SPACE_ID}
                                                {...field}
                                            />
                                        );
                                    },
                                }}
                            />
                            <Field
                                controller={{
                                    name: "SPACE_NAME",
                                    control: control,
                                    render: ({ field }: any) => {
                                        return (
                                            <InputField
                                                {...register("SPACE_NAME", {
                                                    required: t("Please fill required fields."),
                                                    validate: value => value.trim() !== "" || t("Please fill the required fields.")
                                                })}
                                                require={true}
                                                label="Space Name"
                                                invalid={errors.SPACE_NAME}
                                                {...field}
                                            />
                                        );
                                    },
                                }}
                            />
                            <Field
                                controller={{
                                    name: "ASSET",
                                    control: control,
                                    render: ({ field }: any) => {
                                        return (
                                            <Select
                                                options={options?.assestOptions?.filter((f: any) => f?.ASSET_NONASSET === "A")}
                                                {...register("ASSET", {
                                                    required: t("Please fill the required fields."),
                                                })}
                                                label="Equipment"
                                                require={true}
                                                optionLabel="ASSET_NAME"
                                                findKey={"ASSET_ID"}

                                                selectedData={search === "?edit=" ? dataId?.ASSET_ID : props?.selectedData?.ASSET_ID}

                                                setValue={setValue}
                                                invalid={errors.ASSET}
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
                    </Card>
                </form>
            </section>
        </>
    )
}
export default AnalyticsPlateformAssetLink;

