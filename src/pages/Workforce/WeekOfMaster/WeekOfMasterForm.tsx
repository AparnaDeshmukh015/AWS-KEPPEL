import React, { useRef, useState } from "react";
import Checkboxs from "../../../components/Checkbox/Checkbox";
import InputField from "../../../components/Input/Input";
import { Card } from "primereact/card";
import { toast } from "react-toastify";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import Field from "../../../components/Field";
import { callPostAPI } from "../../../services/apis";
import { ENDPOINTS } from "../../../utils/APIEndpoints";
import { useTranslation } from "react-i18next";
import Button from "../../../components/Button/Button";
import { Checkbox } from "primereact/checkbox";
import { useLocation, useOutletContext } from "react-router-dom";
import { initialWeekDay, updatedWeekDay } from "./helperWorkMaster";
import FormHeader from "../../../components/FormHeader/FormHeader";
import { saveTracker } from "../../../utils/constants";

const WeekOfMasterForm = (props: any) => {
  const [selectedIndex, setSelectedIndex] = useState<any | null>(null);
  const listRef = useRef<any | null>(null);
  const { t } = useTranslation();
  let { pathname } = useLocation();
  const [, menuList]: any = useOutletContext();
  const { search } = useLocation();
  const currentMenu = menuList
    ?.flatMap((menu: any) => menu?.DETAIL)
    .filter((detail: any) => detail.URL === pathname)[0];

  const getId: any = localStorage.getItem("Id")
  const dataId = JSON.parse(getId)

  const [weekData, setWeekData] = useState<any | null>(
    props?.selectedData !== undefined ? updatedWeekDay : initialWeekDay
  );

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      MODE:search === '?edit='  ? "E" : "A",
      PARA: search === '?edit=' 
        ? { para1: `${props?.headerName}`, para2: t("Updated") }
        : { para1: `${props?.headerName}`, para2: t("Added") },
      WEEKOFF_ID:search === '?edit='  ? dataId?.WEEKOFF_ID : 0,
      ACTIVE:search === '?edit='  ? dataId?.ACTIVE  : true,
      WEEKOFF_DESC: search === '?edit='  ? dataId?.WEEKOFF_DESC: "",
      WEEKOFF_DAY: [],
    },
    mode: "onSubmit",
  });

  const onSubmit = async (payload: any) => {
    var checkflag = 0;
    for (let i = 0; i < weekData.length; i++) {
      if (weekData[i].Day === true) {
        checkflag = 1;
      }
    }
    if (checkflag === 0) {
      toast.error(t("Atleast 1 day should be selected"));
      return;
    }
    for (let i = 0; i < weekData.length; i++) {
      if (weekData[i].Day === true && weekData[i].count.length === 0) {
        toast.error(t("Atleast 1 week should be selected inside a day"));
        return;
      }
    }

    payload.ACTIVE = payload.ACTIVE === true ? 1 : 0;
    const resultWeekDay: any = weekData?.reduce(
      (acc: any, item: any, index: any) => {
        acc[`DAY${index + 1}`] = item.Day === true ? 1 : 0;
        acc[`OFFTYPE${index + 1}`] = item.count.toString();
        return acc;
      },
      {}
    );
    const data: any = [];
    data.push(resultWeekDay);
    payload.WEEKOFF_DAY = data;
    try {
      const res = await callPostAPI(
        ENDPOINTS.SAVEWEEKOFMASTER,
        payload,
        currentMenu?.FUNCTION_CODE
      );

      if (res?.FLAG === true) {
        toast.success(res?.MSG);
        props?.getAPI();
        props?.isClick();
       
      } else {
        toast.error(res?.MSG);
      }

    } catch (error: any) {
      toast.error(error)

    }

  };
  const handleDayClick = (e: any, index: any) => {
    e.preventDefault();
    setSelectedIndex(index === selectedIndex ? null : index)


  };

  const checkHandler = (e: any, dayIndex: any, weekIndex: any, week: any) => {
    const data: any = [];

    if (week?.value === "all") {
      setWeekData((prevSchedule: any) => {
        const updatedSchedule = [...prevSchedule];
        updatedSchedule[dayIndex].weekList = updatedSchedule[
          dayIndex
        ].weekList.map((week: any, index: any) => {
          if (e.target.checked === true) {
            data.push(index + 1);
          }
          return { ...week, checked: e.target.checked };
        });

        const checkedCount = updatedSchedule[dayIndex].weekList?.filter(
          (week: any) => week.checked === true
        );
        updatedSchedule[dayIndex].count = data
          ? data
          : checkedCount?.length > 0
            ? ""
            : checkedCount;
        updatedSchedule[dayIndex].Day = updatedSchedule[dayIndex].weekList.some(
          (week: any) => week.checked
        );
        return updatedSchedule;
      });
    } else {
      setWeekData((prevSchedule: any) => {
        const updatedSchedule = [...prevSchedule];
        updatedSchedule[dayIndex].weekList = updatedSchedule[
          dayIndex
        ].weekList.map((week: any, index: any) => {
          if (index === weekIndex) {
            return { ...week, checked: e.target.checked };
          }
          return week;
        });

        updatedSchedule.forEach((day: any) => {
          const checkedWeeks = day.weekList
            .map((week: any, index: any) => (week.checked ? index : null))
            .filter((index: any) => index !== null);

          day.count = checkedWeeks;
          day.Day = day.weekList.some((week: any) => week.checked);
        });

        return updatedSchedule;
      });
    }
  };

  const uploadScheduleData = () => {
    const data: any = ["1", "2", "3", "4", "5", "6"];
    if (dataId !== undefined) {
      const updatedWeekDay = weekData.map((day: any, index: any) => {
        const dayKey = `DAY${index + 1}`;
        let countKey = `OFFTYPE${index + 1}`;
        const dayStatus = dataId[dayKey];
        let countStatus = dataId[countKey]?.split(",");
        if (countStatus?.length >= 5) {
          countStatus = data;
        }
        const updatedWeekList = day.weekList.map((week: any, index: any) => {
          const isChecked = countStatus?.includes(index.toString());

          return { ...week, checked: isChecked };
        });
        return {
          ...day,
          Day: dayStatus,
          count: countStatus,
          weekList: updatedWeekList,
        };
      });
      setWeekData(updatedWeekDay);
    }
  };

  useEffect(() => {
    if (dataId !== null) {
      uploadScheduleData();
    }
  }, []);

  useEffect(() => {
    if (props?.selectedData === undefined) {
      const updatedData = initialWeekDay.map((item: any) => {
        const newItem = { ...item, count: [] };
        newItem.Day = false;
        newItem.weekList = newItem.weekList.map((week: any) => ({
          ...week,
          checked: false,
        }));
        return newItem;
      });

      setWeekData(updatedData);
    }
  }, []);

  useEffect(() => {
    if (!isSubmitting && Object?.values(errors)[0]?.type === "required") {
      const check: any = Object?.values(errors)[0]?.message;
      toast?.error(t(check));
    }
  }, [isSubmitting]);

  useEffect(() => {
    (async function () {
      await saveTracker(currentMenu)})()
  }, [currentMenu]);



  return (
    <section className="w-full">
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormHeader
          headerName={props?.headerName}
          isSelected={props?.selectedData ? true : false}
          isClick={props?.isClick}
        />
        <Card className="mt-2">
          <div className="mt-1 grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-3 lg:grid-cols-3">
            <Field
              controller={{
                name: "WEEKOFF_DESC",
                control: control,
                render: ({ field }: any) => {
                  return (
                    <InputField
                      {...register("WEEKOFF_DESC", {
                        required: t("Please fill the required fields."),
                      })}
                      label="Week Off Description"
                      require={true}
                      invalid={errors.WEEKOFF_DESC}
                      {...field}
                    />
                  );
                },
              }}
              error={errors?.WEEKOFF_DESC?.message}
            />

            <div>
              <div>
                <label className="Text_Secondary Input_Label">
                  {t("Select Day")}
                </label>
              </div>

              <div className="flex flex-wrap gap-4">
                {weekData?.map((day: any, index: any) => {
                  let Bgcolor = day?.Day ? "#8e724a" : "";
                  let color = day?.Day ? "#fff" : "";
                  return (
                    <div
                      key={index}
                      className="flex flex-col items-center relative"
                    >
                      <Button
                        label={day.day}
                        type="button"
                        data-ripple-light="true"
                        data-popover-target="menu"
                        className="select-none py-3 px-6 text-center weekButton"
                        style={{
                          backgroundColor: `${Bgcolor}`,
                          color: `${color}`,
                        }}

                        onClick={(e: any) => handleDayClick(e, index)}
                      />

                      {selectedIndex === index && (
                        <ul
                          ref={listRef}
                          className="absolute top-full z-10 mt-2 py-2 px-3 rounded-md border border-gray-300 bg-white shadow-lg"
                        >
                          {day.weekList.map((w: any, weekIndex: any) => (

                            <li
                              key={weekIndex}
                              className="py-1 hover:bg-gray-100 z-10 cursor-pointer flex items-center"

                            >
                              <label className="flex items-center">
                                <Checkbox
                                  inputId={w?.value}
                                  name={w}
                                  value={w?.name}
                                  checked={w?.checked}
                                  onChange={(e: any) =>
                                    checkHandler(e, index, weekIndex, w)
                                  }
                                />
                                <span className="ml-2">{w.name}</span>
                              </label>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <Field
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
                            : false 
                        }
                        className="md:mt-6"
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
  );
};

export default WeekOfMasterForm;
