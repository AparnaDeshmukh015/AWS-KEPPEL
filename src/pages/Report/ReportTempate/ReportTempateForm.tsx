import InputField from '../../../components/Input/Input'
import { Card } from 'primereact/card';
import { useForm } from 'react-hook-form';
import Field from '../../../components/Field';
import { callPostAPI } from '../../../services/apis';
import { ENDPOINTS } from '../../../utils/APIEndpoints';
import { toast } from 'react-toastify';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import FormHeader from '../../../components/FormHeader/FormHeader';
import Select from "../../../components/Dropdown/Dropdown";
import { useLocation, useOutletContext } from 'react-router-dom';
import Checkboxs from "../../../components/Checkbox/Checkbox";
import { saveTracker } from '../../../utils/constants';
import { InputTextarea } from 'primereact/inputtextarea';
import MultiSelects from '../../../components/MultiSelects/MultiSelects';
interface Options {
    teamList: any[];
    priorityList: any[];
    columnList: any[];
    wotypeList: any[];
    statusList: any[];
    reportList?: any[]
}
const ReportTemplateForm = (props: any) => {
    const { t } = useTranslation();
    let { pathname } = useLocation();
    const [, menuList]: any = useOutletContext();
    const currentMenu = menuList
        ?.flatMap((menu: any) => menu?.DETAIL)
        .filter((detail: any) => detail.URL === pathname)[0];

    const [options, setOptions] = useState<Options>();

    const { search } = useLocation();
    const getId: any = localStorage.getItem("Id");
    const selectedDatalist = JSON.parse(getId);
    const [IsSubmit, setIsSubmit] = useState<any | null>(false);
    const [filteredcolList, setfilteredcolList] = useState<any | number>([]);


    const {
        register,
        handleSubmit,
        control,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: {
            MODE: search === '?edit=' ? "E" : "A",
            PARA: search === '?edit=' ? { "para1": `${currentMenu?.FUNCTION_DESC}`, "para2": t('Updated') }
                : { "para1": `${currentMenu?.FUNCTION_DESC}`, "para2": t('Added') },
            TEMPLATE_ID: search === '?edit=' ? selectedDatalist?.TEMPLATE_ID : 0,
            ACTIVE: search === '?edit=' ? selectedDatalist?.ACTIVE : 0,
            TEMPLATE_NAME: search === '?edit=' ? selectedDatalist?.TEMPLATE_NAME : "",
            COL_LIST: [],
            WO_TYPE_LIST: [],
            PRIORITY_LIST: [],
            STATUS_LIST: [],
            TEAM_LIST: [],
            REPORT_LIST: []
        },
        mode: "onSubmit",
    });


    const onSubmit = async (payload: any) => {
        // setIsSubmit(true)
        payload.REPORT_ID = payload?.REPORT_LIST?.REPORT_ID
        payload.ACTIVE = payload?.ACTIVE ? 1 : 0;
        delete payload?.REPORT_LIST


        try {
            const res = await callPostAPI(ENDPOINTS.SAVE_REPORT_TEMPLATE, payload);
            // console.log(res, "res111")
            if (res?.FLAG === true) {
                toast?.success(res?.MSG);
                props?.getAPI();
                setIsSubmit(false)
                props?.isClick();
            }
            else {
                toast.error(res?.MSG)
                setIsSubmit(false)
            }

        } catch (error: any) {
            setIsSubmit(false)
            toast?.error(error);
        }
    };
    const getOption = async () => {
        let payload = {}
        if (search == "?edit=") {
            payload = {
                TEMPLATE_ID: props?.selectedData?.TEMPLATE_ID
            }
        }
        const res = await callPostAPI(ENDPOINTS.REPORT_TEMPLATE_MASTER_LIST, payload);



        if (res?.FLAG === 1) {
            setOptions({
                teamList: res?.TEAMLIST,
                priorityList: res?.PRIORITYLIST,
                columnList: res?.COLUMNLIST,
                wotypeList: res?.WOTYPELIST,
                statusList: res?.STATUSLIST,
                reportList: res?.REPORTLIST

            });
        }
    };

    useEffect(() => {
        (async function () {
            await getOption()
            await saveTracker(currentMenu)
        })();

    }, [])

    const filteredColumnlist = (reportId: any) => {
        if (options?.columnList?.length) {
            const filteredoptioncolumn: any = options?.columnList?.filter(item => item?.REPORT_ID === reportId)

            setfilteredcolList(filteredoptioncolumn)
            if (filteredoptioncolumn && filteredoptioncolumn?.length > 0) {
                const selectedColumnlist: any = filteredoptioncolumn?.filter((item: any) => item?.SELECT === 1)

                setValue("COL_LIST", selectedColumnlist)
            }
        }

    }

    useEffect(() => {
        if ((!isSubmitting && Object?.values(errors)[0]?.type === "required") || (!isSubmitting && Object?.values(errors)[0]?.type === "validate")) {
            const check: any = Object?.values(errors)[0]?.message;
            toast?.error(t(check));
        }
    }, [isSubmitting]);

    useEffect(() => {
        if (selectedDatalist?.REPORT_ID && search === '?edit=') {
            filteredColumnlist(selectedDatalist?.REPORT_ID)
        }

    }, [options])

    useEffect(() => {
        if (search === '?edit=') {



            if (options?.wotypeList && options?.wotypeList?.length > 0) {
                const selectedwotypeList: any = options?.wotypeList?.filter(item => item?.SELECT === 1)
                setValue("WO_TYPE_LIST", selectedwotypeList)

            }
            if (options?.statusList && options?.statusList?.length > 0) {
                const selectedstatusList: any = options?.statusList?.filter(item => item?.SELECT === 1)

                setValue("STATUS_LIST", selectedstatusList)
            }
            if (options?.teamList && options?.teamList?.length > 0) {
                const selectedteamList: any = options?.teamList?.filter(item => item?.SELECT === 1)

                setValue("TEAM_LIST", selectedteamList)
            }
            if (options?.priorityList && options?.priorityList?.length > 0) {
                const selectedpriorityList: any = options?.priorityList?.filter(item => item?.SELECT === 1)

                setValue("PRIORITY_LIST", selectedpriorityList)
            }

        }

    }, [options])

    return (
        <section className="w-full">
            <form onSubmit={handleSubmit(onSubmit)}>
                <FormHeader
                    headerName={props?.headerName}
                    isSelected={search === "?edit=" ? true : false}
                    isClick={props?.isClick}
                    IsSubmit={IsSubmit}
                />
                <Card className="mt-2">
                    <div className="mt-1 grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-3 lg:grid-cols-3">

                        <Field
                            controller={{
                                name: "TEMPLATE_NAME",
                                control: control,
                                render: ({ field }: any) => {
                                    return (
                                        <InputField
                                            {...register("TEMPLATE_NAME", {
                                                required: t("Please fill the required fields."),

                                            })}
                                            require={true}
                                            label="Report Template Name"
                                            invalid={errors.TEMPLATE_NAME}
                                            maxLength={50}
                                            {...field}
                                        />
                                    );
                                },
                            }}
                        />

                        <Field
                            controller={{
                                name: "REPORT_LIST",
                                control: control,
                                render: ({ field }: any) => {
                                    return (
                                        <Select
                                            options={options?.reportList}
                                            {...register("REPORT_LIST", {
                                                required: t("Please fill the required fields"),
                                                onChange(event) {
                                                    filteredColumnlist(event?.target?.value?.REPORT_ID)
                                                },
                                            })}
                                            label="Report List"
                                            require={true}
                                            optionLabel="REPORT_NAME"
                                            findKey={"REPORT_ID"}

                                            selectedData={search === '?edit=' ? selectedDatalist?.REPORT_ID : 0}
                                            setValue={setValue}
                                            invalid={errors.REPORT_LIST}
                                            {...field}
                                        />
                                    );
                                },
                            }}
                        />

                        <Field
                            controller={{
                                name: "COL_LIST",
                                control: control,
                                render: ({ field }: any) => {
                                    return (
                                        <MultiSelects
                                            options={filteredcolList ?? []}
                                            {...register("COL_LIST", {
                                                required: t("Please fill the required fields"),
                                            })}
                                            label="Columns"
                                            require={true}
                                            optionLabel="COLUMN_NAME"
                                            findKey={"COL_ID"}

                                            selectedData={props?.selectedData?.COL_ID}
                                            setValue={setValue}
                                            invalid={errors.COL_LIST}
                                            {...field}
                                        />
                                    );
                                },
                            }}
                        />

                        <Field
                            controller={{
                                name: "WO_TYPE_LIST",
                                control: control,
                                render: ({ field }: any) => {
                                    return (
                                        <MultiSelects
                                            options={options?.wotypeList}
                                            {...register("WO_TYPE_LIST", {
                                                required: t("Please fill the required fields"),
                                            })}
                                            label="Wo Type"
                                            require={true}
                                            optionLabel="WO_TYPE_NAME"
                                            findKey={"WO_CODE"}

                                            selectedData={search === '?edit=' ? selectedDatalist?.WO_CODE : props?.selectedData?.WO_CODE}
                                            setValue={setValue}
                                            invalid={errors.WO_TYPE_LIST}
                                            {...field}
                                        />
                                    );
                                },
                            }}
                        />
                        <Field
                            controller={{
                                name: "STATUS_LIST",
                                control: control,
                                render: ({ field }: any) => {
                                    return (
                                        <MultiSelects
                                            options={options?.statusList}
                                            {...register("STATUS_LIST", {
                                                required: t("Please fill the required fields"),
                                            })}
                                            label="Status"
                                            require={true}
                                            optionLabel="STATUS_DESC"
                                            findKey={"STATUS_CODE"}

                                            selectedData={props?.selectedData?.STATUS_CODE}
                                            setValue={setValue}
                                            invalid={errors.STATUS_LIST}
                                            {...field}
                                        />
                                    );
                                },
                            }}
                        />
                        <Field
                            controller={{
                                name: "TEAM_LIST",
                                control: control,
                                render: ({ field }: any) => {
                                    return (
                                        <MultiSelects
                                            options={options?.teamList}
                                            {...register("TEAM_LIST", {
                                                required: t("Please fill the required fields"),
                                            })}
                                            label="Team"
                                            require={true}
                                            optionLabel="TEAM_NAME"
                                            findKey={"TEAM_ID"}
                                            selectedData={search === '?edit=' ? selectedDatalist?.TEAM_ID : props?.selectedData?.TEAM_ID}
                                            setValue={setValue}
                                            invalid={errors.TEAM_LIST}
                                            {...field}
                                        />
                                    );
                                },
                            }}
                        />
                        <Field
                            controller={{
                                name: "PRIORITY_LIST",
                                control: control,
                                render: ({ field }: any) => {
                                    return (
                                        <MultiSelects
                                            options={options?.priorityList}
                                            {...register("PRIORITY_LIST", {
                                                required: t("Please fill the required fields"),
                                            })}
                                            label="Priority"
                                            require={true}
                                            optionLabel="SEVERITY"
                                            findKey={"PRIORITY_ID"}

                                            selectedData={props?.selectedData?.PRIORITY_ID}
                                            setValue={setValue}
                                            invalid={errors.PRIORITY_LIST}
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
                                                label="Active"
                                                className='md:mt-7'
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
}

export default ReportTemplateForm

