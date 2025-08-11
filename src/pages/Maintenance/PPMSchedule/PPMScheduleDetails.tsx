import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Field from "../../../components/Field";
import Buttons from "../../../components/Button/Button";
import { Card } from "primereact/card";
import DateCalendar from "../../../components/Calendar/Calendar";
import InputField from "../../../components/Input/Input";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { useLocation, useNavigate } from "react-router-dom";
import { ENDPOINTS } from "../../../utils/APIEndpoints";
import { callPostAPI } from "../../../services/apis";
import { convertTime, dateFormat, helperNullDate, onlyDateFormat } from "../../../utils/constants";
import moment from "moment";
import TimeCalendar from "../../../components/Calendar/TimeCalendar";
import CancelDialogBox from "../../../components/DialogBox/CancelDialogBox";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { eventNotification, helperEventNotification } from "../../../utils/eventNotificationParameter";
import { appName, PATH } from "../../../utils/pagePath";
import { decryptData } from "../../../utils/encryption_decryption";
import MultiSelects from "../../../components/MultiSelects/MultiSelects";

const PPMScheduleDetails = (props: any) => {
  const location: any = useLocation()
  const navigate: any = useNavigate();
  const { t } = useTranslation();
  const [options, setOptions] = useState<any | null>([])
  const [assigneeStatus, setAssigneeStatus] = useState<any | null>(false)
  const [technicianList, setTechnicianList] = useState<any | null>([])
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
      TECH_ID: ""
    },
  });

  const onSubmit = async (payload: any, e: any) => {
    try {
      setAssigneeStatus(false)
      const buttonMode: any = e?.nativeEvent?.submitter?.name;
      payload.PPM_ID = location?.state?.schedule_id;
      payload.SER_REQ_NO = "";
      payload.MODE = buttonMode === 'CANCEL' ? "CANCEL" : "UPDATE";
      payload.SCHEDULE_DATE = moment(payload.DATE).format('YYYY-MM-DD');
      payload.SCHEDULE_TIME = moment(payload.TIME).format('HH:mm A');
      payload.PARA = buttonMode === 'CANCEL' ? { para1: `PPM Schedule `, para2: "Cancelled" } :
        { para1: `PPM Schedule `, para2: "Updated" }
      payload.REMARKS = "Test";
      payload.TECH_LIST = payload.TECH_ID;
      delete payload.DATE;
      delete payload.TIME;
      delete payload.InputName
      delete payload.TECH_ID;

      const res = await callPostAPI(ENDPOINTS.UPDATE_PPM_SCHEDULE_DETAILS, payload)
      if (res?.FLAG) {
        toast.success(res?.MSG)
        const notifcation: any = {
          FUNCTION_CODE: location?.state?.functionCode,
          EVENT_TYPE: "P",
          STATUS_CODE: 2,
          PARA1: decryptData(localStorage.getItem("USER_NAME")),
          PARA2: options?.ppmSchedular?.ASSET_NAME,
          PARA3: payload.SCHEDULE_DATE,
          PARA4: moment(options?.ppmSchedular?.SCHEDULE_DATE).format('DD-MM-YYYY'),
          PARA5: options?.ppmSchedular?.SCHEDULE_NAME,
        };

        const eventPayload = { ...eventNotification, ...notifcation };
        helperEventNotification(eventPayload);
        navigate(PATH?.PPMSCHEDULE)
      } else {
        toast.error(res?.MSG.toString())
      }
    } catch (error) {
      toast.error(error === null ? 'Something went wrong' : error?.toString())
    }



  };

  const getOptions = async () => {
    const res = await callPostAPI(ENDPOINTS.GET_PPM_SCHEDULE_DETAILS, { "PPM_ID": location?.state?.schedule_id })

    if (res?.FLAG === 1) {
      let ppmDate: any = new Date(res?.PPMDETAILS[0]?.SCHEDULE_DATE)
      let ppmTime: any = convertTime(res?.PPMDETAILS[0]?.SCHEDULE_TIME)
      setOptions({
        ppmSchedular: res?.PPMDETAILS[0],
        assetDetails: res?.ASSETDETAILS[0],
        assetDocDetails: res?.ASSETDOCDETAILS,
        scheduleDetails: res?.SCHEDULETASKDETAILS,
        woDetails: res?.WODETAILS
      })
      setValue("NAME", res?.PPMDETAILS[0]?.SCHEDULE_NAME)
      setValue("DATE", ppmDate)
      setValue("TIME", ppmTime)

    }
    getEquipmentGroup(res?.ASSETDETAILS[0]?.ASSETGROUP_ID, res?.ASSETDETAILS[0]?.ASSET_ID)
  }


  const getEquipmentGroup = async (groupId?: any, assetId?: any) => {
    try {

      const res1 = await callPostAPI(ENDPOINTS?.GET_ASSETGROUPTEAMLIST, {
        ASSETGROUP_ID: groupId,
        WO_ID: 0,
        TYPE: "PPM",
        ASSET_ID: assetId
      });


      if (res1?.FLAG === 1) {
        setTechnicianList(res1?.TECHLIST)
      } else {
        setTechnicianList([])
      }
    } catch (e: any) {
      console.log(e ?? 'error', "e")
    }

  };

  const changeAssigneeStatus = () => {
    setAssigneeStatus(true)
  }
  useEffect(() => {
    getOptions()
  }, [location?.state])


  return (
    <section className="w-full">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-wrap justify-between mt-1">
          <div>
            <h6 className="Text_Primary">
              {/* {props?.selectedData ? "Edit" : "Add"} {props?.headerName}{" "} */}
              PPM Schedule Details
            </h6>
          </div>
          <div className="flex">
            <Buttons
              type="submit"
              className="Primary_Button  w-20 me-2"
              label={"Save"}
            />
            <Buttons
              className="Secondary_Button w-20 me-2"
              label={"List"}
              type="button"
              onClick={() => navigate(PATH?.PPMSCHEDULE)}
            />

            <CancelDialogBox
              header={"Cancel PPM Schedule"}
              control={control}
              setValue={setValue}
              register={register}
              paragraph={"Are you sure you want to cancel the PPM Schedule?"}
              watch={watch}
              REMARK={"REMARK"}
              errors={errors}
            />
          </div>
        </div>
        <Card className="mt-2">
          <div className="headingConainer">
            <p>Schedule Details</p>
          </div>
          <div className="mt-1 grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-5 lg:grid-cols-5">
            <div>
              <Field
                controller={{
                  name: "NAME",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <InputField
                        {...register("NAME", {})}
                        label="Name"
                        disabled={true}
                        setValue={setValue}
                        {...field}
                      />
                    );
                  },
                }}
              />
            </div>
            <div>
              <Field
                controller={{
                  name: "DATE",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <DateCalendar
                        {...register("DATE")}
                        label="Date"
                        setValue={setValue}
                        showIcon
                        {...field}
                        minDate={new Date()}
                      />
                    );
                  },
                }}
              />
            </div>
            <div>
              <Field
                controller={{
                  name: "TIME",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <TimeCalendar
                        {...register("TIME", {

                        })}
                        label="Time"
                        setValue={setValue}
                        {...field}

                      />
                    );
                  },
                }}
                error={errors?.TIME?.message}
              />
            </div>
          </div>
        </Card>
        <Card className="mt-2">
          <div className="headingConainer">
            <p>{t("Equipment Details")}</p>
          </div>
          <div className="mt-2 grid grid-cols-1 gap-x-2 gap-y-2 md:grid-cols-3 lg:grid-cols-3">

            <div className="flex">
              <label className="Text_Secondary Input_Label mr-2">
                Code : {options?.assetDetails?.ASSET_CODE}
              </label>
              {/* <label className="Text_Primary Input_Label">AS0323</label> */}
            </div>
            <div className="flex">
              <label className="Text_Secondary Input_Label mr-2">
                Group : {options?.assetDetails?.ASSETGROUP_NAME}
              </label>

            </div>
            <div className="flex">
              <label className="Text_Secondary Input_Label mr-2">
                Make : {options?.assetDetails?.MAKE_NAME}
              </label>
              {/* <label className="Text_Primary Input_Label">
                  STANDARD MAKE:{options?.assetDetails?.MAKE_NAME}
                </label> */}
            </div>
            <div className="flex">
              <label className="Text_Secondary Input_Label mr-2">
                Warranty End date : {
                  helperNullDate(options?.assetDetails?.WARRANTY_END_DATE) === "" ? "NA" :
                    // moment(options?.assetDetails?.WARRANTY_END_DATE).format(dateFormat())}
                    onlyDateFormat(options?.assetDetails?.WARRANTY_END_DATE)}
              </label>

            </div>
            <div className="flex">
              <label className="Text_Secondary Input_Label mr-2">
                Name : {options?.assetDetails?.ASSET_NAME}
              </label>

            </div>
            <div className="flex">
              <label className="Text_Secondary Input_Label mr-2">
                Type : {options?.assetDetails?.ASSETTYPE_NAME}
              </label>

            </div>
            <div className="flex">
              <label className="Text_Secondary Input_Label mr-2">
                Model : {options?.assetDetails?.MODEL_NAME}
              </label>

            </div>
            <div className="flex">
              <label className="Text_Secondary Input_Label mr-2">
                Location : {options?.assetDetails?.LOCATION_NAME}
              </label>

            </div>
            <div className="flex">
              <label className="Text_Secondary Input_Label mr-2">
                Under AMC : {options?.assetDetails?.USERAMC}
              </label>

            </div>
            <div className="flex">
              <label className="Text_Secondary Input_Label mr-2">
                AMC Vendor : {options?.assetDetails?.VENDOR_NAME}
              </label>

            </div>
            <div className="flex">
              <label className="Text_Secondary Input_Label mr-2">
                AMC Expiry : {helperNullDate(options?.assetDetails?.AMC_EXPIRY_DATE) === "" ? "NA" :
                  onlyDateFormat(options?.assetDetails?.AMC_EXPIRY_DATE)}

              </label>

            </div>
            <div className=" mb-2">
              <label className="flex Text_Secondary Input_Label mr-2">
                Technician Name : {options?.ppmSchedular?.TECH_NAMES ? (
                  <button className="tech-button" type="button">
                    {options.ppmSchedular.TECH_NAMES}
                    <span className="pi pi-pencil Menu_Active ml-2 cursor-pointer"
                      onClick={() => setAssigneeStatus(!assigneeStatus)}
                    ></span>
                  </button>
                ) : (
                  "NA"
                )}
              </label>
              {assigneeStatus === true && (<Field
                controller={{
                  name: "TECH_ID",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <MultiSelects
                        options={technicianList}
                        {...register("TECH_ID", {

                        })}
                        optionLabel="USER_NAME"
                        findKey={"USER_ID"}
                        setValue={setValue}
                        {...field}
                      />
                    );
                  },
                }}
              />)}
            </div>
          </div>
        </Card>
        <Card className="mt-2">
          <div className="headingConainer">
            <p>Previous Work Order</p>
          </div>
          <div>
            <DataTable value={options?.woDetails} showGridlines
              emptyMessage={t("No Data found.")} scrollable scrollHeight="400px">
              <Column field="WO_TYPE" sortable header="Type"></Column>
              <Column field="WO_NO" sortable header="Work Order No."></Column>
              <Column field="WO_DATE" header="Date" sortable body={(rowData: any) => {

                return (
                  <>
                    {onlyDateFormat(rowData?.WO_DATE)}
                  </>
                )
              }}></Column>
              <Column field="RREQ_DESC" sortable header="Request Title"></Column>
              <Column field="REMARKS" header="Remarks"></Column>
              <Column field="COMPLETED_AT" header="Resolved On"></Column>
            </DataTable>
          </div>
        </Card>
        <Card className="mt-2">
          <div className="headingConainer">
            <p>Task Details</p>
          </div>
          <div>
            <DataTable value={options?.scheduleDetails} showGridlines
              emptyMessage={t("No Data found.")} scrollable scrollHeight="400px">
              <Column field="TASK_DESC" sortable header="Task Description"></Column>
              <Column field="TASK_TIME" header="Hours/min"></Column>
              <Column field="SKILL_NAME" header="Skill Required" sortable ></Column>
            </DataTable>
          </div>
        </Card>
        <Card className="mt-2">
          <div className="headingConainer">
            <p>{t("Equipment Documents")}</p>
          </div>
          <div>
            <DataTable value={options?.assetDocDetails} showGridlines
              emptyMessage={t("No Data found.")} scrollable scrollHeight="400px">
              <Column field="DOC_ORIG_NAME" sortable header="Document Name"></Column>
            </DataTable>
          </div>
        </Card>
      </form>
    </section>
  );
};

export default PPMScheduleDetails;
