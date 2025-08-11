import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import Field from "../../../components/Field";
import InputField from "../../../components/Input/Input";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Calendar } from "primereact/calendar";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import * as XLSX from "xlsx";
import moment from "moment";
import { toast } from "react-toastify";
import "../../../components/Table/Table.css";
import "../../../components/Checkbox/Checkbox.css";
import "../../../components/Button/Button.css";
import { saveAs } from "file-saver";
import SplitButtons from "../../../components/SplitButton/SplitButton";
import { dateFormat } from "../../../utils/constants";
const HolidayList = ({
  setHolidayList,
  disabled,
  HOLIDAYLIST

}: any) => {
  const { t } = useTranslation();
  const [visible, setVisible] = useState<boolean>(false);
  const [date, setDate] = useState<any | null>();
  const [excelFile, setExcelFile] = useState<any | null>(null);
  //const [typeError, setTypeError] = useState<any | null>(null);

  // submit state
  // const [excelData, setExcelData] = useState<any | null>(null);
  const [HolidayData, setHolidayData] = useState<any | null>(
    HOLIDAYLIST ? HOLIDAYLIST : []
  );
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      HOLIDAY_DATE: "",
      HOLIDAY_NAME: "",
    },
    mode: "onSubmit",
  });


  const Actionitems = [
    {
      label: "Upload Data",
      icon: "pi pi-upload",
      visible: true,
      command: () => {
        setVisible(true);
      },
    },
    {
      label: "Download Template",
      icon: "pi pi-download",
      command: () => {
        downloadExcel()
      },
    }]

  const onSubmit = (payload: any) => {


    const itemDate = new Date(payload.HOLIDAY_DATE).getTime();
    const isDuplicate = HolidayData.some((existing: any) => {
      const existingDate = new Date(existing.HOLIDAY_DATE).getTime();
      return existingDate === itemDate;
    });

    if (!isDuplicate) {
      setHolidayData((prevTableData: any) => [...prevTableData, payload]);
      setHolidayList((prevTableData: any) => [...prevTableData, payload]);
      toast.success("Holiday added successfully.");
    } else {
      // Optionally, show a message or feedback to the user that the holiday already exists
      toast.error('Duplicate entries are not allowed.');
    }

    reset({
      HOLIDAY_DATE: "",
      HOLIDAY_NAME: "",
    });
  };
  const setDialogVisible = () => {
    setVisible(!visible);
    //props?.setValue(props?.visible)
  };

  const handlerDelete = (e: any, rowData: any, rowIndex: any) => {
    let removeData: any = HOLIDAYLIST.filter(
      (data: any, index: any) => {
        return (index !== rowIndex)
      }
    );

    setHolidayData(removeData);
    setHolidayList(removeData);
  };


  const downloadExcel = () => {

    const data: any = [["HOLIDAY_DATE", "HOLIDAY_NAME"], ["", ""]];
    const wb = XLSX.utils.book_new();
    const ws: any = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
    const blob = new Blob([s2ab(wbout)], { type: 'application/octet-stream' });
    function s2ab(s: string) {
      const buf = new ArrayBuffer(s.length);
      const view = new Uint8Array(buf);
      for (let i = 0; i < s.length; i++) {
        view[i] = s.charCodeAt(i) & 0xFF;
      }
      return buf;
    }

    saveAs(blob, 'HolidayList.xlsx');

  }

  const handleFile = (e: any) => {
    let fileTypes = [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/csv",
    ];

    let selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile && fileTypes.includes(selectedFile.type)) {
        // setTypeError(null);
        let reader = new FileReader();
        reader.readAsArrayBuffer(selectedFile);
        reader.onload = (e: any) => {
          setExcelFile(e.target.result);
        };
      } else {
        //setTypeError("Please select only excel file types");
        toast.error("Please select only excel file types");
        setExcelFile(null);
      }
    } else {
      toast.error("Please select your file");
    }
  };

  const handleFileSubmit = (e: any) => {
    e.preventDefault();
    if (excelFile !== null) {
      const workbook = XLSX.read(excelFile, {
        type: "binary",
        cellDates: true,
      });
      const worksheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[worksheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { raw: false });


      // Check if there are any missing or invalid dates in the Excel file
      const invalidData = data.find((item: any) => {

        if (!item.HOLIDAY_DATE || item.HOLIDAY_DATE === "" || item.HOLIDAY_DATE === undefined || item.HOLIDAY_NAME
          === '' || item.HOLIDAY_NAME === undefined || !item.HOLIDAY_NAME) {
          return true;  // Found an entry with invalid or missing date
        }
        return false;
      });
      if (invalidData) {
        // If any date is missing or invalid, show an error and stop the upload process
        toast?.error("Invaid Data entered in excel.");
        setVisible(false);
        return;
      }
      // Proceed with filtering and uploading the data if all dates are valid
      const newHolidays = data.filter((item: any) => {
        const itemDate = new Date(item.HOLIDAY_DATE).getTime(); // Format as YYYY-MM-DD
        return !HolidayData.some((existing: any) => {
          const existingDate = new Date(existing.HOLIDAY_DATE).getTime();
          return existingDate === itemDate;
        });
      });

      setVisible(false);
      if (newHolidays.length > 0) {
        setVisible(false);
        setHolidayList((prevState: any) => [...prevState, ...newHolidays]);
        setHolidayData((prevState: any) => [...prevState, ...newHolidays]);
        toast.success("Holidays uploaded successfully.");
      } else {
        toast.error("Duplicate entries are not allowed.");
      }
    }
  };

  return (
    <>
      <div className=" grid grid-cols-1 gap-3 md:grid-cols-3 lg:grid-cols-3">
        <div className={`${errors?.HOLIDAY_DATE ? "errorBorder" : ""}`}>
          <label className="Text_Secondary Input_Label" htmlFor="buttondisplay">
            {t("Holiday Date")}{" "}
          </label>
          <Field
            controller={{
              name: "HOLIDAY_DATE",
              control: control,
              render: ({ field }: any) => {
                return (
                  <Calendar
                    {...register("HOLIDAY_DATE", {
                      required: "Holiday date is Required.",

                      onChange: (e: any) => {
                        setDate(e.value);
                      },
                    })}
                    disabled={disabled}
                    value={new Date(date)}
                    minDate={new Date()}
                    label="Holiday Date"
                    showIcon
                    {...field}
                  />
                );
              },
            }}

          />
        </div>

        <div className={`${errors?.HOLIDAY_NAME ? "errorBorder" : ""}`}>
          <Field
            controller={{
              name: "HOLIDAY_NAME",
              control: control,
              render: ({ field }: any) => {
                return (
                  <InputField
                    {...register("HOLIDAY_NAME", {
                      required: t("Please fill the required fields.."),
                      validate: (value) =>
                        value.trim() !== "" ||
                        "Please fill the required fields.",
                    })}
                    label="Holiday Name"
                    invalid={errors.HOLIDAY_NAME}
                    {...field}
                    disabled={disabled}
                  />
                );
              },
            }}
          // error={errors?.HOLIDAY_NAME?.message}
          />
        </div>

        <div>
          <Button
            className="Primary_Button md:mt-5 w-20 "
            disabled={disabled}
            label={t("Add")}
            onClick={handleSubmit(onSubmit)}
          />

          <SplitButtons
            className="Secondary_Button md:mt-5 ml-2"
            disabled={disabled}
            label={t("Action")}
            model={Actionitems}
          />
          <Dialog
            header="Holiday List Upload"
            visible={visible}
            style={{ width: "50vw" }}
            onHide={() => setVisible(false)}
          >
            <div>
              <input
                type="file"
                className="form-control"
                required
                onChange={handleFile}
              />
            </div>
            <div>
              <Button
                type="button"
                className="Secondary_Button md:mt-6 w-20"
                label={t("Upload")}
                onClick={(e) => handleFileSubmit(e)}
              />
              <Button
                className="Secondary_Button w-28 "
                label={"Cancel"}
                onClick={setDialogVisible}
              />
              {/* <Button
                className="Secondary_Button w-28 "
                label={"Download"}
                onClick={()=>downloadExcel()}
              /> */}
            </div>
            {/* <Button> */}
          </Dialog>
        </div>
      </div>
      <div className="mt-2">
        <DataTable
          value={HOLIDAYLIST ? HOLIDAYLIST : HolidayData}
          disabled={disabled}
          showGridlines
        >
          {/* <Column>{dateFormat()}</Column> */}
          <Column
            field="HOLIDAY_DATE"
            header={t("Date")}
            body={(rowData: any) => {

              return <>{moment(rowData.HOLIDAY_DATE).format(dateFormat())}</>;
            }}
          ></Column>
          <Column field="HOLIDAY_NAME" header={t("Holiday")}
            body={(rowData: any) => {

              return <>{rowData.HOLIDAY_NAME}</>;
            }}></Column>
          <Column
            field=""
            header={t("Action")}
            body={(rowData: any, { rowIndex }: any) => {
              return (
                <button
                  type="button"
                  onClick={(e: any) => handlerDelete(e, rowData, rowIndex)}
                >
                  <i className="pi pi-trash"></i>
                </button>
              );
            }}
          ></Column>
        </DataTable>
      </div>
    </>
  );
};

export default HolidayList;
