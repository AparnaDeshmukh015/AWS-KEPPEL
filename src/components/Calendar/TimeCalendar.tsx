import { Calendar } from "primereact/calendar";
import { memo, useEffect, useState } from "react";
import "./Calendar.css";
import { twMerge } from "tailwind-merge";
import { convertTime } from "../../utils/constants";

const TimeCalendar = (props: any) => {
  const [timeValue, setTimeValue] = useState<any | null>(props?.value || null);
  const handleMinuteChange = (value: Date, change: any) => {
    const minutes = value.getMinutes();
    let newMinutes = minutes;
    if (change === "forward") {
      if (minutes > 0 && minutes < 15) {
        newMinutes = 15;
      } else if (minutes > 15 && minutes < 30) {
        newMinutes = 30;
      } else if (minutes > 30 && minutes < 45) {
        newMinutes = 45;
      } else if (minutes > 45) {
        if (minutes === 59 && timeValue?.getMinutes() === 0) {
          newMinutes = 45;
        } else {
          newMinutes = 0;
        }
      }
    } else if (change === "backward") {
      if (minutes > 0 && minutes < 15) {
        newMinutes = 0;
      } else if (minutes > 15 && minutes < 30) {
        newMinutes = 15;
      } else if (minutes > 30 && minutes < 45) {
        newMinutes = 30;
      } else if (minutes > 45) {
        newMinutes = 45;
      }
    }

    const newValue: any = new Date(value);
    newValue.setMinutes(newMinutes);
    setTimeValue(newValue);
    props?.setValue(props?.name, newValue);
  };

  const handleChange = (e: any) => {
    let date: any = timeValue;
    if ("00:00" === timeValue) {
      date = convertTime(timeValue);
    }

    const newValue: any = new Date(e?.value);
    if (newValue > date) {
      handleMinuteChange(newValue, "forward");
    } else if (newValue <= date) {
      handleMinuteChange(newValue, "backward");
    }
  };
  useEffect(() => {
    setTimeValue(props?.value);
  }, [props?.value]);

  return (
    <div className={`${props?.invalid ? "errorBorder" : ""}`}>
      <div className={twMerge(props?.containerclassname)}>
        <span className="p-input-icon-left w-full">
          <label
            className="Text_Secondary Input_Label"
            htmlFor={"calendar-timeonly"}
          >
            {props?.label}
            {props?.require && <span className="text-red-600"> *</span>}
          </label>
          <Calendar
            // dateFormat={"dd/mm/yy"}
            placeholder="Please Select"
            id="calendar-timeonly"
            timeOnly
            hourFormat={props?.id === "calendar-24" ? "24" : "12"}
            showIcon
            icon={() => <i className="pi pi-clock" />}
            {...props}
            value={timeValue ? timeValue : new Date()}
            onChange={handleChange}
          />
        </span>
      </div>

    </div>
  );
};

export default memo(TimeCalendar);
