import InputField from "../../../components/Input/Input";
import { Card } from "primereact/card";
import { useForm } from "react-hook-form";
import Field from "../../../components/Field";
import Checkboxs from "../../../components/Checkbox/Checkbox";
import { callPostAPI } from "../../../services/apis";
import { ENDPOINTS } from "../../../utils/APIEndpoints";
import { toast } from "react-toastify";
import Radio from "../../../components/Radio/Radio";
import Select from "../../../components/Dropdown/Dropdown";
import { useTranslation } from "react-i18next";
import { useCallback, useEffect, useState } from "react";
import { useLocation, useOutletContext } from "react-router-dom";
import FormHeader from "../../../components/FormHeader/FormHeader";
import { saveTracker } from "../../../utils/constants";
import MultiSelects from "../../../components/MultiSelects/MultiSelects";
import { eventNotification, helperEventNotification } from "../../../utils/eventNotificationParameter";
import { decryptData } from "../../../utils/encryption_decryption";

const RequestDescriptionMasterForm = (props: any) => {
  const { t } = useTranslation();
  const { search } = useLocation();
  let { pathname } = useLocation();
  const [selected, menuList]: any = useOutletContext();
  const [assetType, setAssetType] = useState<any | null>([]);
  const [IsSubmit, setIsSubmit] = useState<any | null>()
  const currentMenu = menuList
    ?.flatMap((menu: any) => menu?.DETAIL)
    .filter((detail: any) => detail.URL === pathname)[0];
  const [options, setOptions] = useState<any>([]);
  const assestTypeLabel: any = [
    { name: "Equipment ", key: "A" },
    { name: "Soft Services", key: "N" },
  ];
  const getId: any = localStorage.getItem("Id");
  const dataId = JSON.parse(getId);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      MODE: search === "?edit="  ? "E" : "A",
      PARA: search === "?edit=" 
        ? { para1: `${props?.headerName}`, para2: "Updated" }
        : { para1: `${props?.headerName}`, para2: "Added" },
      REQ_DESC:search === "?edit=" ?dataId?.REQ_DESC : "",
      ASSET_NONASSET: "",
      ASSETTYPE: "",
      SKILL: "",
      SOFT_SERVICE: "",
      ACTIVE:search === "?edit=" ?dataId?.ACTIVE : true,
      REQ_ID:search === "?edit=" ? dataId?.REQ_ID : 0,
    },
    mode: "onSubmit",
  });

  const ASSET_NONASSET: any = watch("ASSET_NONASSET");
  const User_Name = decryptData((localStorage.getItem("USER_NAME")))
  const watchAll: any = watch()
  useEffect(() => {
    if (ASSET_NONASSET) {
      setAssetType([])
    }

  }, [ASSET_NONASSET])

  const onSubmit = useCallback(async (payload: any) => {
    if (IsSubmit) return true
    setIsSubmit(true)
    payload.ACTIVE = payload?.ACTIVE ? 1 : 0;
    payload.SKILL_ID = payload?.SKILL?.SKILL_ID;
    payload.ASSETGROUP_LIST = payload?.ASSETTYPE;
    payload.ASSET_NONASSET = payload?.ASSET_NONASSET?.key;
    delete payload.SKILL;
    delete payload.SOFT_SERVICE;
    delete payload.ASSETTYPE;
    try {
      const res = await callPostAPI(
        ENDPOINTS.MASTERREQUESTDESCRIPTION_SAVE,
        payload
      );
      if (res.FLAG === true) {
        toast?.success(res?.MSG);
        const assetNames = watchAll?.ASSETTYPE?.map((asset: any) => asset.ASSETTYPE_NAME).join(', ');
        const notifcation: any = {
          "FUNCTION_CODE": currentMenu?.FUNCTION_CODE,
          "EVENT_TYPE": "M",
          "STATUS_CODE": search === "?edit=" ? 2 : 1,
          "PARA1": search === "?edit=" ? User_Name : User_Name,
          PARA2: payload?.REQ_DESC,
          PARA3: payload?.ASSET_NONASSET,
          PARA4: watchAll?.SKILL?.SKILL_NAME,
          PARA5: assetNames
        };

        const eventPayload = { ...eventNotification, ...notifcation };
        await helperEventNotification(eventPayload);
        props?.getAPI();
        props?.isClick();
      } else {
        setIsSubmit(false)
        toast?.error(res?.MSG);
      }
    } catch (error: any) {
      toast?.error(error);
    } finally {
      setIsSubmit(false)
    }
  }, [IsSubmit,
    setIsSubmit,
    toast,
    callPostAPI,
    ENDPOINTS,
    watchAll,
    currentMenu,
    search,
    User_Name,
    eventNotification,
    helperEventNotification,
    props]);

  const getReqDetailsList = async () => {
    try {
      const res = await callPostAPI(
        ENDPOINTS.GET_REQUEST_DETAILS,
        { REQ_ID: search === "?edit=" ? dataId?.REQ_ID : 0 },
        currentMenu?.FUNCTION_CODE
      );
      if (res?.FLAG === 1) {
        setAssetType(res?.REQDESCASSETYPELIST)
      }
    } catch (error: any) {
      toast.error(error)
    }
  }

  const getOptions = async () => {
    try {
      const res = await callPostAPI(
        ENDPOINTS.GET_REQUEST_DESCRIPTION_MASTERLIST,
        null,
        currentMenu?.FUNCTION_CODE
      );

      setOptions({
        skillOptions: res?.SKILLLIST,
        assestOptions: res?.ASSETGROUPLIST?.filter(
          (item: any) => item?.ASSETGROUP_TYPE === "A"
        ),
        softServicesOptions: res?.ASSETGROUPLIST?.filter(
          (item: any) => item?.ASSETGROUP_TYPE === "N"
        ),
      });
      if (search === "?edit=") {
        await getReqDetailsList();
      }
    } catch (error) { }
  };

  useEffect(() => {
    (async function () {
      await  getOptions();
      await saveTracker(currentMenu)
     })();
  }, [selected]);

  useEffect(() => {
    if (!isSubmitting && Object?.values(errors)[0]?.type === "required") {
      const check: any = Object?.values(errors)[0]?.message;
      toast?.error(t(check));
    } else {
    }
  }, [isSubmitting]);

  return (
    <section className="w-full">
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormHeader
          headerName={props?.headerName}
          isSelected={props?.selectedData ? true : false}
          isClick={props?.isClick}
          IsSubmit={IsSubmit}
        />
        <Card className="mt-2">
          <div className="mt-1 grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-3 lg:grid-cols-3">
            <Field
              controller={{
                name: "REQ_DESC",
                control: control,
                render: ({ field }: any) => {
                  return (
                    <InputField
                      {...register("REQ_DESC", {
                        required: t("Please fill the required fields."),
                      })}
                      label="Request Description"
                      require={true}
                      selectedData={search === "?edit=" ?dataId?.REQ_ID : ""
                      }
 
                      invalid={errors.REQ_DESC}
                      {...field}
                    />
                  );
                },
              }}
            />
            <Field
              controller={{
                name: "ASSET_NONASSET",
                control: control,
                render: ({ field }: any) => {
                  return (
                    <>
                      <Radio
                        {...register("ASSET_NONASSET", {
                          required: t("Please fill the required fields"),
                        })}
                        labelHead="Type"
                        require={true}
                        options={assestTypeLabel}
                        selectedData={
                          search === "?edit=" ? dataId?.ASSET_NONASSET :  "A"
                        }
                        setValue={setValue}
                        {...field}
                      />
                    </>
                  );
                },
              }}
            />

            <Field
              controller={{
                name: "ASSETTYPE",
                control: control,
                render: ({ field }: any) => {
                  return (
                    <MultiSelects
                      options={
                        ASSET_NONASSET?.key === "A"
                          ? options?.assestOptions
                          : options?.softServicesOptions
                      }
                      {...register("ASSETTYPE", {
                        required: t("Please fill the required fields"),
                      })}
                      label={
                        ASSET_NONASSET?.key === "A"
                          ? "Equipment Group"
                          : "Soft Service Group"
                      }
                      optionLabel="ASSETGROUP_NAME"
                      findKey={"ASSETGROUP_ID"}
                      require={true}
                      selectedData={assetType}
                      setValue={setValue}
                      invalid={errors.ASSETTYPE}
                      {...field}
                    />
                  );
                },
              }}
            />

            <Field
              controller={{
                name: "SKILL",
                control: control,
                render: ({ field }: any) => {
                  return (
                    <Select
                      options={options?.skillOptions}
                      {...register("SKILL", {
                        required: t("Please fill the required fields"),
                      })}
                      label="Skill Name"
                      optionLabel="SKILL_NAME"
                      findKey={"SKILL_NAME"}
                      require={true}
                      selectedData={search === "?edit=" ? dataId?.SKILL_NAME : props?.selectedData?.SKILL_NAME}
                      invalid={errors.SKILL}
                      setValue={setValue}
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
                        // checked={}
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
  );
};

export default RequestDescriptionMasterForm;