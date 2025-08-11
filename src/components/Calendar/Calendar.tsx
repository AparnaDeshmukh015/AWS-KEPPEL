import { Calendar } from "primereact/calendar";
import React, { memo, useEffect, useState } from "react";
import "./Calendar.css";
import { twMerge } from "tailwind-merge";
import { dateFormat, LOCALSTORAGE } from "../../utils/constants";
import { useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";
import moment from "moment";
const DateCalendar = (props: any) => {
  const { t } = useTranslation()
  const [selectedFacility, menuList]: any = useOutletContext();
  const [date, setDate] = useState<any | null>(null);
  const [format, setFormat] = useState<any | null>()




  const dateFormatJOSN: any = [
    { DATE_FORMAT: "DD-MM-YYYY", DATE_CONVERTER: "103", FORMAT_DATE: "dd-mm-yy" },

    { DATE_FORMAT: "MM-DD-YYYY", DATE_CONVERTER: "103", FORMAT_DATE: "mm-dd-yy" },
    { DATE_FORMAT: "DD-MMM-YYYY", DATE_CONVERTER: "103", FORMAT_DATE: "dd-MM-yy" }
  ]

  useEffect(() => {
    if (selectedFacility) {
      const formatDate: any = dateFormatJOSN?.find((f: any) => f.DATE_FORMAT === dateFormat())
      setFormat(formatDate?.FORMAT_DATE)
    }
  }, [selectedFacility])

  return (
    <div className={`${props?.invalid ? "errorBorder" : ""}`}>
      <div className={twMerge(props?.containerclassname)}>
        <span className="p-input-icon-left w-full">
          <label className="Text_Secondary Input_Label" htmlFor={props?.id}>
            {t(`${props?.label}`)}
            {props?.require && <span className="text-red-600"> *</span>}
          </label>

          <Calendar
            onSelect={() => console.log('clo')
            }
            value={props?.value}
            dateFormat={format}
            placeholder={"Please Select"}
            {...props}
          />
        </span>
      </div>
    </div>
  );
};

export default memo(DateCalendar);
