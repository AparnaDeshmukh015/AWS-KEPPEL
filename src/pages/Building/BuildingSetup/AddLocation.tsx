import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import "../../../components/Button/Button.css";
import { Button } from "primereact/button";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import InputField from "../../../components/Input/Input";
import { Checkbox } from "primereact/checkbox";
import { Card } from "primereact/card";
import { RadioButton } from "primereact/radiobutton";
import { toast } from "react-toastify";
import { ENDPOINTS } from "../../../utils/APIEndpoints";
import { callPostAPI } from "../../../services/apis";
import { useFieldArray, useForm } from "react-hook-form";
import Field from "../../../components/Field";
import Select from "../../../components/Dropdown/Dropdown";
import HolidayList from "./HolidayList";
import moment from "moment";
import { saveTracker } from "../../../utils/constants";
import { eventNotification, helperEventNotification } from "../../../utils/eventNotificationParameter";
import { appName } from "../../../utils/pagePath";
import { decryptData } from "../../../utils/encryption_decryption";

const AddLocation = () => {
  const { t } = useTranslation();
  const [, menuList]: any = useOutletContext();
  const { search } = useLocation();
  const [locationList, setLocationList] = useState([]);
  const [weekList, setWeekList] = useState([]);
  const [parentId, setParentId] = useState<any | null>();
  const [checked, setChecked] = useState(true);
  const [HOLIDAYLIST, setHolidayList] = useState([]);
  const [PPM_SCHEDULAR, setPPM_SCHEDULAR] = useState("S");
  const navigate: any = useNavigate();
  const location: any = useLocation();
  const currentMenu = menuList
    ?.flatMap((menu: any) => menu?.DETAIL)
    .filter((detail: any) => detail.URL === location?.pathname)[0];
  const [sameParent, setSameParent] = useState(true);
  const [selectedDetails, setSelectedDetails] = useState<any>([]);
  const [IsSubmit, setIsSubmit] = useState<any | null>(false);
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      LOCATION: "",
      LOCATIONTYPE_ID:
        location?.state?.addHeaderName === "Edit Location"
          ? location?.state?.locationTypeId
          : "",
      LOCATION_ID:
        location?.state?.addHeaderName === "Add Location"
          ? 0
          : location?.state?.locationId,
      INHERIT_HOLIDAY: "",
      WEEKOFF: "",
      WEEKOFF_ID: "",
      GROSS_AREA: "",
      PARENT_LOCATION_ID: "",
      MAX_OCCUPANCY: "",
      LOCATION_NAME: "",
      INHERIT_WORKING: "",
      MODE: location?.state?.addHeaderName === "Add Location" ? "A" : "E",
      ACTIVE: checked,
      PPM_SCHEDULAR: PPM_SCHEDULAR,
      PARA:
        location?.state?.addHeaderName === "Add Location"
          ? {
            para1: "Location Master",
            para2: t("Added"),
          }
          : {
            para1: "Location Master",
            para2: t("Updated"),
          },

      EXTRA_COL_LIST: [""],
    },

    mode: "onSubmit",
  });
  const User_Name = decryptData((localStorage.getItem("USER_NAME")))
  const { fields, append: colAppend } = useFieldArray({
    name: "EXTRA_COL_LIST",
    control,
  });
  const showHandler = (e: any) => {
    e.preventDefault();
    navigate(`${appName}/facilitydetail`);
  };

  const watchLocation: any = watch('LOCATION')
  const onSubmit = useCallback(async (payload: any) => {
    if (IsSubmit) return true
    setIsSubmit(true)
    const updateColList: any = payload?.EXTRA_COL_LIST?.filter(
      (item: any) => item?.VALUE
    ).map((data: any) => ({
      [data?.FIELDNAME]: data?.VALUE,
    }));
    const holiday: any = HOLIDAYLIST?.map((holi: any) => {
      return {
        HOLIDAY_DATE: moment(holi.HOLIDAY_DATE).format('DD-MM-YYYY'),
        HOLIDAY_NAME: holi.HOLIDAY_NAME,
      };
    });
    payload.EXTRA_COL_LIST = updateColList || [];
    payload.LOCATIONTYPE_ID = payload?.LOCATION?.LOCATIONTYPE_ID;
    payload.PARENT_LOCATION_ID = parentId;
    payload.WEEKOFF_ID = payload?.WEEKOFF?.WEEKOFF_ID;
    payload.INHERIT_HOLIDAY = sameParent;
    payload.INHERIT_WORKING = sameParent;
    payload.PPM_SCHEDULAR = !sameParent ? PPM_SCHEDULAR : "S";
    payload.LOCATION_HOLIDAY_D = holiday;
    delete payload?.LOCATION;
    delete payload?.WEEKOFF;

    try {
      const res = await callPostAPI(ENDPOINTS?.LOCATION_SAVE, payload);
      if (res?.FLAG === true) {
         const response = await callPostAPI(ENDPOINTS?.COMMON_LOCATION_LIST, {});
        toast.success(res?.MSG);
        const notifcation: any = {
          "FUNCTION_CODE": currentMenu?.FUNCTION_CODE,
          "EVENT_TYPE": "M",
          "STATUS_CODE": search === "?edit=" ? 2 : 1,
          "PARA1": search === "?edit=" ? User_Name : User_Name,
          PARA2: payload?.LOCATION_NAME,
          PARA3: watchLocation?.LOCATIONTYPE_NAME?.LOCATIONTYPE_NAME,
          PARA4: payload?.GROSS_AREA,
          PARA5: payload?.MAX_OCCUPANCY,


        };

        const eventPayload = { ...eventNotification, ...notifcation };
        await helperEventNotification(eventPayload);
        // setIsSubmit(false)
        navigate(`${appName}/facilitydetail`);
      } else {
        setIsSubmit(false)
        toast.error(res?.MSG);
      }
    } catch (error: any) {
      setIsSubmit(false)
      toast.error(error);
    } finally {
      setIsSubmit(false)
    }
  }, [IsSubmit, HOLIDAYLIST, callPostAPI, toast, parentId, sameParent, PPM_SCHEDULAR, currentMenu, search, eventNotification, navigate,]);

  const handlerChange = (e: any) => {
    setSameParent(e.target.checked);
    setValue("WEEKOFF", "");
  };
  const getCommonLocation = async (mode: any, locationId: any) => {
    const payload: any = {
      LOCATIONTYPE_ID: locationId,
      MODE: mode,
      FUNCTION_CODE: location?.state?.currentMenu?.FUNCTION_CODE,
    };

    const res = await callPostAPI(ENDPOINTS?.GETLOCATIONTYPE, payload);
    if (res?.FLAG === 1) {
      const columnCaptions = res?.CONFIGLIST.map((item: any) => ({
        FIELDNAME: item.FIELDNAME,
        LABEL: item?.COLUMN_CAPTION,
        VALUE: "",
      }));

      // colAppend(columnCaptions);

      setLocationList(res?.LOCATIONTYPELIST);
      setWeekList(res?.WEEKOFFLIST);
      if (res?.FLAG === 1) {
        if (mode === "E") {
          await locationDetails(columnCaptions);
        } else {
          colAppend(columnCaptions);
        }
      }
    }
  };

  useEffect(() => {
    (async function () {
      if (location?.state?.addHeaderName === "Add Location") {
      await getCommonLocation("A", location?.state?.locationTypeId);
      if (location?.state?.parentId !== undefined) {
        setParentId(localStorage.getItem('parentId'))
      } else {
        setParentId(localStorage.getItem('parentId'))
      }
    } else {
      await getCommonLocation("E", location?.state?.locationTypeId);
    }
    await saveTracker(currentMenu)})()

  }, [location?.state]);

  const locationDetails = async (columnCaptions: any) => {
    if (location?.state?.addHeaderName === "Edit Location") {
      const payload: any = {
        LOCATION_ID: location?.state?.locationId,
        PARA: { para1: "Location Master ", para2: " Details" },
        FUNCTION_CODE: location?.state?.currentMenu?.FUNCTION_CODE,
      };

      const res = await callPostAPI(
        ENDPOINTS?.LOCATION_DETAILS,
        payload,
        location?.state?.currentMenu?.FUNCTION_CODE
      );

      if (res?.FLAG === 1) {
        const configList = res.CONFIGLIST[0];
        for (let key in configList) {
          if (configList[key] === null) {
            delete configList[key];
          }
        }

        const previousColumnCaptions: any = columnCaptions.map((item: any) => ({
          ...item,
          VALUE: configList[item.FIELDNAME],
        }));
        colAppend(previousColumnCaptions);
        setSelectedDetails(res.LOCATIONDETAILSLIST[0]);
        let structureList: any = locationList?.find(
          (location: any) =>
            location?.LOCATIONTYPE_ID ===
            res.LOCATIONDETAILSLIST[0]?.LOCATIONTYPE_ID
        );
        let weekData: any = weekList?.find(
          (week: any) =>
            week?.WEEKOFF_ID === res.LOCATIONDETAILSLIST[0]?.WEEKOFF_ID
        );
        setPPM_SCHEDULAR(res?.LOCATIONDETAILSLIST[0]?.PPM_SCHEDULAR)
        setValue("LOCATION_NAME", res.LOCATIONDETAILSLIST[0]?.LOCATION_NAME);
        setValue("LOCATION", structureList);
        setValue("GROSS_AREA", res.LOCATIONDETAILSLIST[0]?.GROSS_AREA);
        setValue("MAX_OCCUPANCY", res.LOCATIONDETAILSLIST[0]?.GROSS_AREA);
        setValue("WEEKOFF", weekData);
        // setValue("PARENT_LOCATION_ID", '')
        setParentId(res.LOCATIONDETAILSLIST[0]?.PARENT_LOCATION_ID);
        setSameParent(res.LOCATIONDETAILSLIST[0]?.INHERIT_HOLIDAY);
        setHolidayList(res?.HOLIDAYLIST);
      }
    }
  };

  useEffect(() => {
    if (!isSubmitting && Object?.values(errors)[0]?.type === "required") {
      const check: any = Object?.values(errors)[0]?.message;
      toast?.error(t(check));
    }
  }, [isSubmitting]);

  return (
    <>
      {/* {loading ? "loading": */}
      <section className="w-full">
        <form>
          <div className="flex justify-between mt-1">
            <div>
              <h6 className="Text_Primary">{location?.state?.addHeaderName}</h6>
            </div>
            <div className="flex">

              <Button
                className="Primary_Button  w-20 me-2"
                label={t("Save")}
                onClick={handleSubmit(onSubmit)}
                disabled={IsSubmit}
              />
              <Button
                className="Secondary_Button  w-20"
                label={t("List")}
                onClick={(e) => showHandler(e)}
              />
            </div>
          </div>
          <Card className="mt-2">
            <div className=" grid grid-cols-1 gap-x-4 gap-y-4 md:grid-cols-3 lg:grid-cols-3">
              <Field
                controller={{
                  name: "LOCATION_NAME",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <InputField
                        {...register("LOCATION_NAME", {
                          required: t("Please fill the required fields."),
                        })}
                        placeholder={"Please enter"}
                        label="Location"
                        setValue={setValue}
                        require={true}
                        invalid={errors.LOCATION_NAME}
                        {...field}
                      />
                    );
                  },
                }}
                error={{
                  errorMessage: errors?.LOCATION_NAME?.message,
                }}
              />
              <Field
                controller={{
                  name: "LOCATION",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <Select
                        options={locationList}
                        optionLabel="LOCATIONTYPE_NAME"
                        {...register("LOCATION", {
                          required: t("Please fill the required fields."),
                        })}
                        disabled={
                          location?.state?.addHeaderName === "Edit Location"
                            ? true
                            : false
                        }
                        label={"Structure Type"}
                        require={true}
                        invalid={
                          location?.state?.addHeaderName === "Edit Location"
                            ? ""
                            : errors?.LOCATION
                        }
                        placeholder={"Please enter"}
                        findKey={"LOCATIONTYPE_ID"}
                        selectedData={selectedDetails?.LOCATIONTYPE_ID}
                        setValue={setValue}
                        {...field}
                      />
                    );
                  },
                }}
                error={{}}
              />
              <Field
                controller={{
                  name: "GROSS_AREA",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <InputField
                        {...register("GROSS_AREA", {
                          required: "",
                        })}
                        placeholder={t("Please_Enter")}
                        label={"Gross Area"}
                        setValue={setValue}
                        invalid={""}
                        {...field}
                      />
                    );
                  },
                }}
              />
              <Field
                controller={{
                  name: "MAX_OCCUPANCY",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <InputField
                        {...register("MAX_OCCUPANCY", {
                          required: "",
                        })}
                        label={"Max Occupancy"}
                        placeholder={t("Please_Enter")}
                        setValue={setValue}
                        invalid={""}
                        {...field}
                      />
                    );
                  },
                }}
              />

              <div className="flex align-items-center">
                <Checkbox
                  onChange={(e: any) => setChecked(e.target.checked)}
                  checked={checked}
                  className="md:mt-7"
                ></Checkbox>
                <label
                  htmlFor="Active"
                  className="ml-2 md:mt-7 Text_Secondary Input_Label"
                >
                  Active
                </label>
              </div>
              {fields.map((arrayField: any, index: number) => {
                return (
                  <React.Fragment key={arrayField?.FIELDNAME}>
                    <div>
                      <Field
                        controller={{
                          name: `EXTRA_COL_LIST.${index}.VALUE`,
                          control: control,
                          render: ({ field }: any) => {
                            return (
                              <InputField
                                {...register(`EXTRA_COL_LIST.${index}`, {})}
                                label={arrayField?.LABEL}
                                placeholder={"Please Enter"}
                                {...field}
                              />
                            );
                          },
                        }}
                      />
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </Card>

          <div className=" grid grid-cols-1 gap-3">
            <div className="">
              <Card className="mt-2">
                <div className=" grid grid-cols-1 gap-3 md:grid-cols-3 lg:grid-cols-3">
                  <div className="col-span-2 border-r">
                    <div className="">
                      <h6>{t("Working Schedule")}</h6>
                    </div>
                    <div>
                      <div className="flex align-items-center">
                        <Checkbox
                          onChange={(e: any) => handlerChange(e)}
                          checked={sameParent}
                          className="md:mt-2"
                        ></Checkbox>
                        <label
                          htmlFor="Active"
                          className="ml-2 md:mt-2 Text_Secondary Input_Label"
                        >
                          Keep working schedule same as parent
                        </label>
                      </div>
                    </div>
                    <hr className="mt-2"></hr>

                    <HolidayList
                      setHolidayList={setHolidayList}
                      disabled={sameParent ? true : false}
                      HOLIDAYLIST={HOLIDAYLIST}
                    />
                  </div>
                  <div>
                    <div>

                      <Field
                        controller={{
                          name: "WEEKOFF",
                          control: control,
                          render: ({ field }: any) => {
                            return (
                              <Select
                                options={weekList}
                                optionLabel="WEEKOFF_DESC"
                                {...register("WEEKOFF", {
                                  required: !sameParent ? t("Please fill the required fields.") : "",
                                })}
                                // placeholder={t("Please_Enter")}
                                disabled={sameParent}
                                findKey={"WEEKOFF_ID"}
                                require={!sameParent ? true : false}
                                label={"Weekoff"}
                                selectedData={selectedDetails?.WEEKOFF_ID}
                                setValue={setValue}
                                invalid={!sameParent ? errors?.WEEKOFF : ""}
                                {...field}
                              />
                            );
                          },
                        }}
                        error={{}}
                      />
                    </div>
                    <hr className="mt-2"></hr>
                    <div className="mb-2">
                      <label className="Text_Primary Table_Header">
                        {t("If PPM schedule date is on week off or holiday")}
                        {!sameParent ? (
                          <span className="text-red-600">*</span>
                        ) : (
                          ""
                        )}
                      </label>
                    </div>
                    <div>
                      <div className="flex align-items-center mb-2">
                        <RadioButton
                          inputId="WeekOff1"
                          name="PPM_SCHEDULAR"
                          value="B"
                          checked={PPM_SCHEDULAR === "B"}
                          onChange={(e: any) =>
                            setPPM_SCHEDULAR(e.target.value)
                          }
                          disabled={sameParent}
                        />
                        <label
                          htmlFor="WeekOff1"
                          className="ml-2 Text_Secondary Input_Label"
                        >
                          {t("Prepone A Day Before")}
                        </label>
                      </div>

                      <div className="flex align-items-center mb-2">
                        <RadioButton
                          inputId="WeekOff2"
                          name="PPM_SCHEDULAR"
                          value="A"
                          checked={PPM_SCHEDULAR === "A"}
                          onChange={(e: any) =>
                            setPPM_SCHEDULAR(e.target.value)
                          }
                          disabled={sameParent}
                        />
                        <label
                          htmlFor="WeekOff2"
                          className="ml-2 Text_Secondary Input_Label"
                        >
                          {t("Postpone A Day After")}
                        </label>
                      </div>
                      <div className="flex align-items-center">
                        <RadioButton
                          inputId="WeekOff3"
                          name="PPM_SCHEDULAR"
                          value="S"
                          checked={PPM_SCHEDULAR === "S"}
                          onChange={(e: any) =>
                            setPPM_SCHEDULAR(e.target.value)
                          }
                          disabled={sameParent}
                        />
                        <label
                          htmlFor="WeekOff3"
                          className="ml-2 Text_Secondary Input_Label"
                        >
                          {t("Keep On Same Day")}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </form>
      </section>
    </>
  );
};

export default AddLocation;
