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

import { saveTracker } from '../../../utils/constants';
import { useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import Buttons from "../../../components/Button/Button";
import { PATH } from '../../../utils/pagePath';

const AssetHierarchyMasterForm = (props: any) => {
    const location = useLocation();
    const { selectedNode } = location.state || {}; // Access the selectedNode passed from the previous page
    const navigate: any = useNavigate();
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
    // const [assetTypes, setassetTypes] = useState<any | []>([]);


    const {
        register,
        handleSubmit,
        control,
        setValue,

        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: {
            PARA: props?.selectedData || search === '?edit='
                ? { para1: "Equipment Hierarchy", para2: t("Updated") }
                : { para1: "Equipment Hierarchy", para2: t("Added") },
            // ASSET_FOLDER_ID: props?.selectedData
            //     ? props?.selectedData?.ASSET_FOLDER_ID
            //     : search === '?edit='
            //         ? dataId?.ASSET_FOLDER_ID
            //         : selectedNode?.key || "",
            ASSET_FOLDER_ID: props?.selectedData ? props?.selectedData?.ASSET_FOLDER_ID : search === '?edit=' ? dataId?.ASSET_FOLDER_ID : 0,
            PARENT_ASSET_FOLDER_ID: '',
            ASSET_FOLDER_NAME: props?.selectedData ? props?.selectedData?.ASSET_FOLDER_NAME : search === '?edit=' ? dataId?.ASSET_FOLDER_NAME : "",
            // ASSET_FOLDER_NAME: props?.selectedData
            //     ? props?.selectedData?.ASSET_FOLDER_NAME
            //     : search === '?edit='
            //         ? dataId?.ASSET_FOLDER_NAME
            //         : selectedNode?.label || "",
            MODE: props?.selectedData || search === '?edit=' ? 'E' : 'A',
            ACTIVE: search === '?edit=' ? dataId?.ACTIVE : true,
            ASSET_FOLDER_DESCRIPTION: "",
            ASSETGROUP_ID: '',
            ASSETTYPE_ID: '',


        },
        mode: "onSubmit",
    });

    const onSubmit = useCallback(async (payload: any) => {

        if (IsSubmit) return;
        setIsSubmit(true)

        payload.ACTIVE = payload?.ACTIVE ? 1 : 0;
        payload.ASSETGROUP_ID = payload?.ASSETGROUP_ID?.ASSETGROUP_ID ?? 0
        payload.ASSETTYPE_ID = payload?.ASSETTYPE_ID?.ASSETTYPE_ID ?? 0
        payload.ASSET_FOLDER_DESCRIPTION = payload?.PARENT_ASSET_FOLDER_ID?.ASSET_FOLDER_DESCRIPTION
        payload.PARENT_ASSET_FOLDER_ID = payload?.PARENT_ASSET_FOLDER_ID?.ASSET_FOLDER_ID ?? 0





        // return

        try {
            const res = await callPostAPI(ENDPOINTS.SAVE_EQUIPMENT_HIERARCHY, payload)
            if (res?.FLAG === true) {
                toast?.success(res?.MSG)
                await callPostAPI(ENDPOINTS.UPDATE_HIERARCHY_LIST)
                navigate(PATH.ASSET_HIERARCHY)
            }
            else {
                toast?.error(res?.MSG)
                setIsSubmit(false)
            }

        } catch (error: any) {
            toast?.error(error)
            setIsSubmit(false)
        }
        finally {
            setIsSubmit(false)
        }
    }, [IsSubmit, search, props, toast]);

    const getOptions = async () => {
        try {
            const res = await callPostAPI(
                ENDPOINTS.GET_EQUIPMENT_HIERARCHY,

            );

            setOptions({
                // assestGroupOptions: res?.EQUIPMENTGROUPLIST,
                // assestTypeOptions: res?.EQUIPMENTTYPELIST,
                assetHierarchyList: res?.EQUIPMENTHIERARCHYLIST?.filter((item: any) => item?.ASSET_FOLDER_DESCRIPTION !== null)
            });
        } catch (error) { }
    };




    useEffect(() => {
        if ((!isSubmitting && Object?.values(errors)[0]?.type === "required")) {
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

    function addHeirarchy() {
        navigate(PATH.ASSET_HIERARCHY);
    }
    return (
        <>
            <section className="w-full">
                <div><h6>Add Equipment Hierarchy</h6></div>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className='flex justify-end w-full '>
                        <Buttons
                            type="submit"
                            disabled={IsSubmit}
                            className="Primary_Button  w-20 me-2 justify-self-end"
                            label={"Save"}

                        />
                        <Buttons
                            type="button"
                            // disabled={IsSubmit}
                            className="Primary_Button  w-20 me-2 justify-self-end"
                            label={"List"}
                            onClick={addHeirarchy}

                        />
                    </div>

                    <Card className='mt-2'>
                        <div className="mt-1 grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-3 lg:grid-cols-3">
                            <Field
                                controller={{
                                    name: "ASSET_FOLDER_NAME",
                                    control: control,
                                    render: ({ field }: any) => {
                                        return (
                                            <InputField
                                                {...register("ASSET_FOLDER_NAME", {
                                                    required: t("Please fill required fields."),
                                                    // validate: value => value.trim() !== "" || t("Please fill the required fields.")
                                                })}
                                                require={true}
                                                label="Equipment Folder Name"

                                                invalid={errors.ASSET_FOLDER_NAME}
                                                {...field}
                                            />
                                        );
                                    },
                                }}
                            />

                            {/* <Field
                                controller={{
                                    name: "ASSETGROUP_ID",
                                    control: control,
                                    render: ({ field }: any) => {
                                        return (
                                            <Select
                                                options={options?.assestGroupOptions}
                                                {...register("ASSETGROUP_ID", {
                                                    required: t("Please fill the required fields."),
                                                })}
                                                label="Equipment Gruop"
                                                require={true}
                                                optionLabel="ASSETGROUP_NAME"
                                                findKey={"ASSETGROUP_ID"}

                                                selectedData={search === "?edit=" ? dataId?.ASSETGROUP_ID : props?.selectedData?.ASSETGROUP_ID}

                                                setValue={setValue}
                                                invalid={errors.ASSETGROUP_ID}
                                                {...field}
                                            />
                                        );
                                    },
                                }}
                            /> */}
                            {/* <Field
                                controller={{
                                    name: "ASSETTYPE_ID",
                                    control: control,
                                    render: ({ field }: any) => {
                                        return (
                                            <Select
                                                options={assetTypes}
                                                {...register("ASSETTYPE_ID", {
                                                    required: t("Please fill the required fields."),
                                                })}
                                                label="Equipment Type"
                                                require={true}
                                                optionLabel="ASSETTYPE_NAME"
                                                findKey={"ASSETTYPE_ID"}

                                                selectedData={search === "?edit=" ? dataId?.ASSETTYPE_ID : props?.selectedData?.ASSETTYPE_ID}

                                                setValue={setValue}
                                                invalid={errors.ASSETTYPE_ID}
                                                {...field}
                                            />
                                        );
                                    },
                                }}
                            /> */}
                            <Field
                                controller={{
                                    name: "PARENT_ASSET_FOLDER_ID",
                                    control: control,
                                    render: ({ field }: any) => {
                                        return (
                                            <Select
                                                options={options?.assetHierarchyList}
                                                {...register("PARENT_ASSET_FOLDER_ID", {
                                                    // required: t("Please fill the required fields."),
                                                })}
                                                label="Parent Folder Name"
                                                // require={true}
                                                optionLabel="ASSET_FOLDER_DESCRIPTION"
                                                findKey={"ASSET_FOLDER_ID"}

                                                // selectedData={search === "?edit=" ? dataId?.ASSET_FOLDER_ID : props?.selectedData?.ASSET_FOLDER_ID}
                                                selectedData={selectedNode?.key}
                                                disabled={selectedNode?.key ? true : false}
                                                setValue={setValue}
                                                invalid={errors.PARENT_ASSET_FOLDER_ID}
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
export default AssetHierarchyMasterForm;

