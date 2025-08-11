import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Field from "../../../components/Field";
import Buttons from "../../../components/Button/Button";
import { Card } from "primereact/card";
import DateCalendar from "../../../components/Calendar/Calendar";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import { ENDPOINTS } from "../../../utils/APIEndpoints";
import { callPostAPI } from "../../../services/apis";
import moment from "moment";
import TimeCalendar from "../../../components/Calendar/TimeCalendar";
import Select from "../../../components/Dropdown/Dropdown";
import Radio from "../../../components/Radio/Radio";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import {
  eventNotification,
  helperEventNotification,
} from "../../../utils/eventNotificationParameter";
import { saveTracker } from "../../../utils/constants";
import { PATH } from "../../../utils/pagePath";
import { decryptData } from "../../../utils/encryption_decryption";

const PPMAddForm = (props: any) => {
  let { pathname } = useLocation();
  const { t } = useTranslation();
  const [, menuList]: any = useOutletContext();
  const[selectedDetails, setSelectedDetails]=useState<any|null>()
  const currentMenu = menuList
    ?.flatMap((menu: any) => menu?.DETAIL)
    .filter((detail: any) => detail.URL === pathname)[0];
  const assestTypeLabel: any = [
    { name: "Equipment", key: "A" },
    { name: "Soft Services", key: "N" },
  ];

  const location: any = useLocation();
  const[IsSubmit, setIsSubmit] = useState<any|null>(false)
  const navigate: any = useNavigate();
  const [options, setOptions] = useState<any | null>([]);
  //let [locationtypeOptions, setlocationtypeOptions] = useState([]);
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      TIME: "",
      DATE: "",
      NAME: "",
      ASSET_NONASSET: "",
      LOCATION_ID: "",
      ASSET_ID: "",
      PARA: { para1: `${currentMenu?.FUNCTION_CODE}`, para2: t("Added") },
    },
  });
  const ASSET_NONASSET: any = watch("ASSET_NONASSET");
  const watchAll: any = watch()
  console.log(errors, 'error')
  const onSubmit = useCallback(async (payload: any) => {
    if(IsSubmit) return true
    setIsSubmit(true)
    try{
    payload.SCHEDULE_DATE = moment(payload.DATE).format("DD-MM-YYYY");
    payload.SCHEDULE_TIME = moment(payload.TIME).format("HH:mm");
    payload.ASSET_ID = payload.ASSET_ID?.ASSET_ID;
    payload.PARA = { para1: `${currentMenu?.FUNCTION_DESC}`, para2: "created" };
    delete payload.LOCATION_ID;
    delete payload.ASSET_NONASSET;
    delete payload.DATE;
    delete payload.TIME;
    delete payload.NAME;
    const res = await callPostAPI(ENDPOINTS?.ADD_PPM_SCHEDULE, payload);
    if (res?.FLAG === true) {
      toast.success(res?.MSG);
      const notifcation: any = {
        FUNCTION_CODE: currentMenu?.FUNCTION_CODE,
        EVENT_TYPE: "P",
        STATUS_CODE: 1,
        PARA1: decryptData(localStorage.getItem("USER_NAME")),
        PARA2: watchAll?.ASSET_ID?.ASSET_NAME,
        PARA3: payload.SCHEDULE_DATE,
        PARA4: "",
        PARA5: "",
      };

      const eventPayload = { ...eventNotification, ...notifcation };
      await helperEventNotification(eventPayload);

      props?.setShowForm(false);
      let month: any = moment(new Date()).format("MM");
      let year: any = moment(new Date()).format("YYYY");
      let firstDate = moment(new Date(year, parseInt(month) - 1, 1)).format(
        "MM-DD-YYYY"
      );
      let lastDate = moment(new Date(year, parseInt(month), 1)).format(
        "MM-DD-YYYY"
      );
      props?.getOptions(firstDate, lastDate);
      navigate(PATH.PPMSCHEDULE);
    }else {
      toast.error(res?.MSG);
    }
  }catch(error:any){
    toast.error(error)
  }finally{
 setIsSubmit(false)
  }
  },[ IsSubmit,
    currentMenu,
    eventNotification,
    props,
    watchAll,
    setIsSubmit,  
    navigate,]);

  const selectedLocationTemplate = (option: any, props: any) => {
    if (option) {
      return (
        <div className="flex align-items-center">
          <div>{option.LOCATION_DESCRIPTION}</div>
        </div>
      );
    }

    return <span>{props.placeholder}</span>;
  };

  const locationOptionTemplate = (option: any) => {
    return (
      <div className="align-items-center">
        <div className="Text_Primary Input_Label">{option.LOCATION_NAME}</div>
        <div className=" Text_Secondary Helper_Text">
          {option.LOCATION_DESCRIPTION}
        </div>
      </div>
    );
  };

  const getOptions = async () => {
    try {
      const res = await callPostAPI(ENDPOINTS.GET_SERVICEREQUST_MASTERLIST, {});
      const res1 = await callPostAPI(ENDPOINTS.LOCATION_HIERARCHY_LIST, null);
      if (res?.FLAG === 1) {
       // setlocationtypeOptions(res1?.LOCATIONHIERARCHYLIST);
      
        setOptions({
          assestOptions: res?.ASSETLIST.filter(
            (f: any) => f?.ASSET_NONASSET === "A"
          ),
          serviceOptions: res?.ASSETLIST.filter(
            (f: any) => f?.ASSET_NONASSET === "N"
          ),
          locationList: res1?.LOCATIONHIERARCHYLIST,
        });
      }
    } catch (error: any) {
      toast.error(error);
    }
  };

  useEffect(() => {
    (async function () {
         await  getOptions();
         await saveTracker(currentMenu)
        })();
  }, [location?.state]);

  useEffect(() => {
    if (!isSubmitting && Object?.values(errors)[0]?.type === "required") {
      const check: any = Object?.values(errors)[0]?.message;
      toast?.error(t(check));
    }
  }, [isSubmitting]);

  return (
    <section className="w-full">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex justify-between mt-1">
          <div>
            <h6 className="Text_Primary">
              {t("Add")} {currentMenu?.FUNCTION_DESC}{" "}
            </h6>
          </div>
          <div className="flex">
            <Buttons
              type="submit"
              className="Primary_Button  w-20 me-2"
              label={"Save"}
              disabled={IsSubmit}
            />
            <Buttons
              className="Secondary_Button w-20 "
              label={"List"}
              onClick={() => {
                navigate(PATH.PPMSCHEDULE);
                props?.setShowForm(false);
              }}
            />
          </div>
        </div>
        <Card className="mt-2">
          <div className="headingConainer">
            <p>{t("Schedule Details")}</p>
          </div>
          <div className="mt-1 grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-3 lg:grid-cols-3">
            <Field
              controller={{
                name: "ASSET_NONASSET",
                control: control,
                render: ({ field }: any) => {
                  return (
                    <>
                      <Radio
                        {...register("ASSET_NONASSET", {
                          required: "Please fill the required fields",
                        })}
                        labelHead="Type"
                        require={true}
                        options={assestTypeLabel}
                        selectedData={
                          props?.selectedData?.ASSET_NONASSET || "A"
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
                name: "ASSET_ID",
                control: control,
                render: ({ field }: any) => {
                  return (
                    <Select
                      options={
                        ASSET_NONASSET?.key === "A"
                          ? options?.assestOptions
                          : options?.serviceOptions
                      }
                      {...register("ASSET_ID", {
                        required: "Please fill the required fields.",
                        onChange:((e:any)=>
                        
                           setSelectedDetails(e?.target.value?.LOCATION_ID)
                         )
                      })}
                      label={
                        ASSET_NONASSET?.key === "A"
                          ? "Equipment"
                          : "Soft Service"
                      }
                      require={true}

                      optionLabel="ASSET_NAME"
                      placeholder="Please Select"
                      findKey={"LOCATION_ID"}
                      setValue={setValue}
                      filter={true}
                      invalid={errors?.ASSET_ID}
                      {...field}
                    />
                  );
                },
              }}
            />

            <Field
              controller={{
                name: "LOCATION_ID",
                control: control,
                render: ({ field }: any) => {
                  return (
                    <Select
                      options={options?.locationList}
                      {...register("LOCATION_ID", {})}
                      label="Location "
                      optionLabel="LOCATIONTYPE_NAME"
                      placeholder="Please Select"
                      valueTemplate={selectedLocationTemplate}
                      itemTemplate={locationOptionTemplate}

                      findKey={"LOCATION_ID"}
                      selectedData={selectedDetails}
                      setValue={setValue}
                      {...field}
                    />
                  );
                },
              }}
            />

            <Field
              controller={{
                name: "DATE",
                control: control,
                render: ({ field }: any) => {
                  return (
                    <DateCalendar
                      {...register("DATE", {
                        required: "Please fill the required fields.",
                      })}
                      label="Date"
                      setValue={setValue}
                      require={true}
                      invalid={errors?.DATE}
                      showIcon
                      {...field}
                      minDate={new Date()}
                    />
                  );
                },
              }}
            />
            <Field
              controller={{
                name: "TIME",
                control: control,
                render: ({ field }: any) => {
                  return (
                    <TimeCalendar
                      {...register("TIME", {
                        required: "Please fill the required fields.",
                      })}
                      require={true}
                      invalid={errors?.TIME}
                      label={t("Time")}
                      setValue={setValue}
                      {...field}
                    />
                  );
                },
              }}
              error={errors?.TIME?.message}
            />
          </div>
        </Card>
      </form>
    </section>
  );
};

export default PPMAddForm;
