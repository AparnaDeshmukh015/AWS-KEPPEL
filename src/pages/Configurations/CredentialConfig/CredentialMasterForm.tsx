import InputField from "../../../components/Input/Input";
import { Card } from "primereact/card";
import { useForm } from "react-hook-form";
import Field from "../../../components/Field";
import { callPostAPI } from "../../../services/apis";
import { ENDPOINTS } from "../../../utils/APIEndpoints";
import { toast } from "react-toastify";
import { useCallback, useEffect, useState } from "react";
import { saveTracker } from "../../../utils/constants";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import { validation } from "../../../utils/validation";
import Button from "../../../components/Button/Button";
import { appName } from "../../../utils/pagePath";

// import { colors } from "@mui/material";

const CredentialConfigMasterForm = (props: any) => {
    const navigate: any = useNavigate();
    let { pathname } = useLocation();
    const [, menuList]: any = useOutletContext();
    const currentMenu = menuList
        ?.flatMap((menu: any) => menu?.DETAIL)
        .filter((detail: any) => detail.URL === pathname)[0];
    const [IsSubmit, setIsSubmit] = useState<any | null>(false);

    const { search } = useLocation();
    const getId: any = localStorage.getItem("Id")
    const dataId = JSON.parse(getId)
    const {
        register,
        handleSubmit,
        control,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: {
            USER_NAME:
                props?.selectedData ? props?.selectedData?.USER_NAME : search === '?edit=' ? dataId?.USER_NAME : "",
            PASSWORD:
                props?.selectedData ? props?.selectedData?.PASSWORD : search === '?edit=' ? dataId?.PASSWORD : "",
            ACTIVE:
                props?.selectedData?.ACTIVE !== undefined
                    ? props.selectedData.ACTIVE
                    : true,
            CONFIG_ID: props?.selectedData ? props?.selectedData?.CONFIG_ID : 0,
            PASS_ID: props?.selectedData ? props?.selectedData?.PASS_ID : 0,
            MODE: props?.selectedData || search === '?edit=' ? "E" : "A",
            PARA: props?.selectedData || search === '?edit='
                ? { para1: `${props?.headerName}`, para2: "Updated" }
                : { para1: `${props?.headerName}`, para2: "Added" },
        },
        mode: "onSubmit",
    });

    const onSubmit = useCallback(async (payload: any) => {
        if (IsSubmit) return true
        setIsSubmit(true)
        payload.ACTIVE = payload?.ACTIVE ? 1 : 0;
        try {
            const res = await callPostAPI(ENDPOINTS.updatePasswordConfigMaster, payload, props?.functionCode);
            if (res?.FLAG === true) {
                toast?.success(res?.MSG);
                props?.getAPI();

                props?.isClick();
            } else {

                toast?.error(res?.MSG);
            }

            // const notifcation: any = {
            //     FUNCTION_CODE: props?.functionCode,
            //     EVENT_TYPE: "M",
            //     STATUS_CODE: props?.selectedData ? 2 : 1,
            //     PARA1: props?.selectedData
            //         ? "updated_by_user_name"
            //         : "created_by_user_name",
            //     PARA2: "severity",
            // };

            // const eventPayload = { ...eventNotification, ...notifcation };
            // helperEventNotification(eventPayload);
            props?.getAPI();

            props?.isClick();
        } catch (error: any) {
            toast?.error(error);

        } finally {
            setIsSubmit(false)
        }
    }, [IsSubmit, callPostAPI, toast, props?.getAPI, props?.isClick, props?.functionCode, props?.selectedData]);

    const GetOpenList = () => {
        navigate(`${appName}/credentiaconfigllist`);
    };
    useEffect(() => {
        if ((!isSubmitting && Object?.values(errors)[0]?.type === "required") || (!isSubmitting && Object?.values(errors)[0]?.type === "validate")) {
            const check: any = Object?.values(errors)[0]?.message;
            toast?.error(check);
        }
    }, [isSubmitting]);
    useEffect(() => {
        (async function () {
            await saveTracker(currentMenu)
           })();
    }, [])

    return (
        <section className="w-full">
            <div style={{ display: "flex", justifyContent: "end" }}>
                <Button
                    label={"List"}
                    className=" Primary_Button  me-2 ml-50"
                    type="button"

                    onClick={GetOpenList}
                />
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
                {/* <FormHeader
                    headerName={props?.headerName}
                    isSelected={props?.selectedData ? true : false}
                    isClick={props?.isClick}
                //  IsSubmit={IsSubmit}
                /> */}

                <Card className="mt-2">
                    <div className="mt-1 grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-3 lg:grid-cols-3">
                        <Field
                            controller={{
                                name: "USER_NAME",
                                control: control,
                                render: ({ field }: any) => {
                                    return (
                                        <InputField
                                            {...register("USER_NAME", {
                                                required: "Please fill the required fields",
                                                // validate: (fieldValue: any) => {
                                                //     return validation?.onlyAlphaNumeric(
                                                //         fieldValue,
                                                //         "USER_NAME",
                                                //         setValue
                                                //     );
                                                // },
                                            })}
                                            label="Username"
                                            require={true}
                                            invalid={errors.USER_NAME}
                                            {...field}
                                        />
                                    );
                                },
                            }}
                            error={errors?.USER_NAME?.message}
                        />

                        <Field
                            controller={{
                                name: "PASSWORD",
                                control: control,
                                render: ({ field }: any) => {
                                    return (
                                        <InputField
                                            {...register("PASSWORD", {
                                                required: "Please fill the required fields",
                                                validate: (fieldValue: any) => {
                                                    return validation?.onlyAlphaNumeric(
                                                        fieldValue,
                                                        "PASSWORD",
                                                        setValue
                                                    );
                                                },
                                            })}
                                            label="Password"
                                            require={true}
                                            invalid={errors.PASSWORD}
                                            {...field}
                                            disabled={true}
                                        />
                                    );
                                },
                            }}
                            error={errors?.PASSWORD?.message}
                        />



                        <div className="flex align-items-center">
                            <Button
                                type="submit"
                                className="Primary_Button w-20 h-10 mt-5"
                                label={"Generate Password"}

                            />
                            {/* <Field
                                controller={{
                                    name: "ACTIVE",
                                    control: control,
                                    render: ({ field }: any) => {
                                        return (
                                            <Checkboxs
                                                {...register("ACTIVE")}
                                                checked={
                                                    props?.selectedData?.ACTIVE === true
                                                        ? true
                                                        : false || false
                                                }
                                                className="md:mt-7"
                                                label="Active"
                                                setValue={setValue}
                                                {...field}
                                            />
                                        );
                                    },
                                }}
                                error={errors?.ACTIVE?.message}
                            /> */}
                        </div>
                    </div>
                </Card>
            </form>
        </section>
    );
};

export default CredentialConfigMasterForm;
