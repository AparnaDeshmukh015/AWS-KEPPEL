import { useCallback, useEffect, useState } from "react";
import { InputText } from "primereact/inputtext";
import { Checkbox } from "primereact/checkbox";
import { Card } from "primereact/card";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import InputField from "../../../components/Input/Input";
import { useTranslation } from "react-i18next";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { ENDPOINTS } from "../../../utils/APIEndpoints";
import { callPostAPI } from "../../../services/apis";
import Field from "../../../components/Field";
import { Button } from "primereact/button";
import { Link, useLocation } from "react-router-dom";
import { useOutletContext } from "react-router-dom";
import "../../../components/Table/Table.css";
import "../../../components/Checkbox/Checkbox.css";
import "../../../components/Button/Button.css";
import { saveTracker } from "../../../utils/constants";
import { appName } from "../../../utils/pagePath";

const LocationTypeMaster = () => {
  const { t } = useTranslation();
  const { pathname }: any = useLocation();
  const [selectedFacility, menuList]: any = useOutletContext();
  const currentMenu = menuList
    ?.flatMap((menu: any) => menu?.DETAIL)
    .filter((detail: any) => detail.URL === pathname)[0];
  const [checked, setChecked] = useState(true);
  const [locationMasterList, setLocationMasterList] = useState();
  const [edit, setEdit] = useState(false);
  const [color, setColor] = useState("#ffffff");
  const [IsSubmit, setIsSubmit] = useState<any | null>(false);

  const [editData, setEditData] = useState({
    locationName: "",
    sequenceNo: "",
    locationTypeId: "0",
  });

  const handleEditClick = (data: any) => {
    setEdit(true);
    setEditData({
      ...editData,
      locationName: data?.LOCATIONTYPE_NAME,
      sequenceNo: data?.SEQ_NO,
      locationTypeId: data?.LOCATIONTYPE_ID,
    });
    setColor(data?.COLORS);
    setChecked(data?.ACTIVE);
  };

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: editData,
    values: editData,
    mode: "onSubmit",
  });

  const onSubmit = useCallback(async (data: any) => {
    if (IsSubmit) return true
    setIsSubmit(true)
    const payload: any = {
      LOCATIONTYPE_ID: edit ? data?.locationTypeId : 0,
      LOCATIONTYPE_NAME: data?.locationName,
      COLOURS: color,
      LOCATION_ICON: "",
      SEQ_NO: data?.sequenceNo,
      MODE: edit ? "E" : "A",
      ACTIVE: checked ? 1 : 0,

      PARA: edit ? { para1: "Location Type", para2: t(" Updated ") } : { para1: "Location Type", para2: t(" inserted ") },
    };
    try {
      const res = await callPostAPI(ENDPOINTS?.LOCATIONTYPE_SAVE, payload);

      if (res?.FLAG === true) {
        toast.success(res?.MSG);
        setEditData({
          locationName: "",
          sequenceNo: "",
          locationTypeId: "0",
        });
       getCommonLocationMasterList().then((res2) =>
          setLocationMasterList(res2?.LOCATIONTYPELIST)
        );
      
      } else if (res?.FLAG === false) {
        setIsSubmit(false)
        toast.error(res?.MSG);
      }
    } catch (error: any) {
      toast.error(error)
    } finally {
      setIsSubmit(false)
    }
  }, [IsSubmit, callPostAPI, toast, edit, color, checked, setLocationMasterList]);

  const getCommonLocationMasterList = async () => {
    const res = await callPostAPI(ENDPOINTS.LOCATIONTYPE_MASTER, {});
    return res;
  };

  useEffect(() => {
    localStorage.removeItem("edit");
    localStorage.setItem("edit", "false");
    if (selectedFacility !== null) {
      getCommonLocationMasterList().then((res) =>
        setLocationMasterList(res?.LOCATIONTYPELIST)
      );
  
    } else {
      toast.error(t("Please_select_Building"));
    }
  }, [selectedFacility]);

  useEffect(() => {
    if (!isSubmitting && Object?.values(errors)[0]?.type === "required") {
      const check: any = Object?.values(errors)[0]?.message;
      toast?.error(t(check));
    }
  }, [isSubmitting]);

  useEffect(() => {
    (async function () {
    
     await saveTracker(currentMenu)
     })();
  }, []);
  return (
    <>
      <section className="w-full">
        <form>
          <div className="flex justify-between mt-1">
            <div>
              <h6 className="Text_Primary">{currentMenu?.FUNCTION_DESC}</h6>
            </div>
            <div className="flex">
              <Button
                className="Primary_Button  w-20 me-2"
                label={t("Save")}
                onClick={handleSubmit(onSubmit)}
                disabled={IsSubmit}
              />
            </div>
          </div>
          <Card className="mt-2 mb-2">
            <div className=" grid grid-cols-1 gap-x-4 gap-y-4 md:grid-cols-4 lg:grid-cols-4">
              <div className={`${errors?.locationName ? "errorBorder" : ""}`}>
                <Field
                  controller={{
                    name: "locationName",
                    control: control,
                    render: ({ field }: any) => {
                      return (
                        <InputField
                          {...register("locationName", {
                            required: t("Please fill the required fields."),
                          })}
                          require={true}
                          label="Location"
                          invalid={errors.locationName}
                          {...field}
                        />
                      );
                    },
                  }}
                />
              </div>
              <div className={`${errors?.sequenceNo ? "errorBorder" : ""}`}>
                <Field
                  controller={{
                    name: "sequenceNo",
                    control: control,
                    render: ({ field }: any) => {
                      return (
                        <InputField
                          {...register("sequenceNo", {
                            required: t("Please fill the required fields."),
                          })}
                          require={true}
                          label="Sequence No"
                          invalid={errors.sequenceNo}
                          {...field}
                        />
                      );
                    },
                  }}
                />
              </div>
              <div>
                <span className="Text_Secondary Input_Label">
                  {t("Color")}{" "}
                </span>
                <InputText
                  type={"color"}
                  name={"color"}
                  value={color}
                  onChange={(e: any) => setColor(e.target.value)}
                  className={"colorpicker"}
                />
              </div>

              <div className="flex align-items-center">
                <Checkbox
                  checked={checked}
                  onChange={(e: any) => setChecked(e.target.checked)}
                  className="md:mt-7"

                ></Checkbox>
                <label htmlFor="Active" className="ml-2 md:mt-7 Text_Secondary Input_Label">{t("Active")}</label>
              </div>
            </div>
          </Card>
        </form>

        <div className="card">
          <LocationMasterTable
            locationMasterList={locationMasterList}
            handleEditClick={handleEditClick}
          />
        </div>
      </section>
    </>
  );
};

const LocationMasterTable = ({ locationMasterList, handleEditClick }: any) => {
  const { t } = useTranslation();
  return (
    <DataTable
      dataKey="id"
      showGridlines
      value={locationMasterList}
      globalFilterFields={[
        "LOCATIONTYPE_ID",
        "LOCATIONTYPE_NAME",
        "LOCATION_ICON",
        "SEQ_NO",
        "COLORS",
        "ACTIVE",
      ]}
      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
      emptyMessage={t("No Data found.")}
      currentPageReportTemplate="Items per Page:-"
    >
      <Column
        field="LOCATIONTYPE_NAME"
        sortable
        header={t("Location")}
        body={(rowData: any) => {
          return (
            <>
              <p>
                <Link
                  to={`${appName}/locationtype?edit=`}
                  onClick={() => handleEditClick(rowData)}
                >
                  {rowData?.LOCATIONTYPE_NAME}
                </Link>
              </p>
            </>
          );
        }}
      ></Column>
      <Column field="SEQ_NO" sortable header={t("Sequence No")}></Column>
      <Column
        field="COLORS"
        sortable
        header={t("Color")}
        body={(rowData: any) => {
          return (
            <>
              <div
                style={{
                  backgroundColor: `${rowData.COLORS}`,
                  height: "5px",
                  width: "100px",
                }}
              ></div>
            </>
          );
        }}
      ></Column>
      <Column
        field="ACTIVE"
        sortable
        header={t("Active")}
        body={(rowData: any) => {
          return <>{rowData?.ACTIVE === true ? "Yes" : "No"}</>;
        }}
      ></Column>
    </DataTable>
  );
};
export default LocationTypeMaster;
