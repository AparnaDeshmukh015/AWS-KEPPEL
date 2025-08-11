import React, { useEffect, useState } from "react";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import { Card } from "primereact/card";
import Buttons from "../../../components/Button/Button";
import { useForm } from "react-hook-form";
import Field from "../../../components/Field";
import MultiSelects from "../../../components/MultiSelects/MultiSelects";
import { useTranslation } from "react-i18next";
import "./PPMSchedule.css"
import Select from "../../../components/Dropdown/Dropdown";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import { callPostAPI } from "../../../services/apis";
import { ENDPOINTS } from "../../../utils/APIEndpoints";

import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import { toast } from "react-toastify";
import PPMAddForm from "./PPMAddForm";
import { eventNotification, helperEventNotification } from "../../../utils/eventNotificationParameter";
import { PATH } from "../../../utils/pagePath";
import { decryptData } from "../../../utils/encryption_decryption";
import InfraPPMSchedule from "./InfraPPMSchedule";


const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(Calendar);
const PPMSchedule = (props: any) => {
  let location: any = useLocation();
  const [, menuList]: any = useOutletContext();
  const currentMenu = menuList
    ?.flatMap((menu: any) => menu?.DETAIL)
    .filter((detail: any) => detail.URL === location?.pathname)[0];
  // const [selectedDetails, setSelectedDetails] = useState<any>([]);
  const [showForm, setShowForm] = useState<any | null>(false)
  const [scheduleData, setScheduleData] = useState<any | null>([]);
  const { t } = useTranslation();
  const navigate: any = useNavigate();
  const [options, setOptions] = useState<any | false>([])
  const [locationtypeOptions, setlocationtypeOptions] = useState([]);
  const [assetOption, setAssetOption] = useState<any | null>([])
  const [type, setType] = useState<any | null>([])
  const {
    register,
    handleSubmit,
    control,
    setValue,

    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      LOCATION_ID: "",
      ASSETGROUP_ID: "",
      ASSETTYPE_ID: "",
      SEL_FACILITY: "",
      SEL_LOCATION: "",
      SEL_ASSETGROUP: "",
      SEL_ASSETTYPE: "",
      ASSETNAME: ""
    },
  });
  const watchAllFields: any = watch()
  const onSubmit = async () => {
  };
  const handleSelectedEvent = (event: any) => {

    navigate(PATH.PPMSCHEDULEDETAILS, { state: { schedule_id: event?.schedule_id, functionCode: currentMenu?.FUNCTION_CODE } })
  }

  console.log(currentMenu, "currentMenu")
  const FACILITY: any = localStorage.getItem("FACILITYID");
  const FACILITYID: any = JSON.parse(FACILITY);

  if (FACILITYID) {
    var facility_type: any = FACILITYID?.FACILITY_TYPE;

  }
  const onEventDrop = async (data: any) => {
    const { start, event } = data;
    setScheduleData((prevEvents: any) =>
      prevEvents.map((prevEvent: any) => {

        return (
          prevEvent?.id === event?.id
            ? { ...event, start }
            : prevEvent
        )
      }
      ));

    if (start >= new Date()) {
      const payload: any = {
        "ACTIVE": 1,
        "PPM_ID": event?.schedule_id,
        "SER_REQ_NO": "",
        "MODE": "UPDATE",
        "SCHEDULE_DATE": moment(start).format('YYYY-MM-DD'),
        "SCHEDULE_DATETIME": moment(start).format("HH:mm"),
        "REMARKS": "Test",
        "PARA": { para1: `${currentMenu?.FUNCTION_DESC}`, para2: "Changed" }
      }
      if (facility_type === "R") {
        const res = await callPostAPI(ENDPOINTS.UPDATE_PPM_SCHEDULE_DETAILS, payload)
        if (res?.FLAG === true) {
          toast.success(res?.MSG)
          let month: any = moment(start).format("MM");
          let year: any = moment(start).format('YYYY')
          let firstDate = moment(new Date(year, parseInt(month) - 1, 1)).format("MM-DD-YYYY");
          let lastDate = moment(new Date(year, parseInt(month), 1)).format("MM-DD-YYYY");
          await getOptions(firstDate, lastDate);
          const notifcation: any = {
            FUNCTION_CODE: currentMenu?.FUNCTION_CODE,
            EVENT_TYPE: "P",
            STATUS_CODE: 2,
            PARA1: decryptData(localStorage.getItem("USER_NAME")),
            PARA2: data?.title,
            PARA3: moment(start).format('DD-MM-YYYY'),
            PARA4: moment(data?.schedule_date).format('DD-MM-YYYY'),
            PARA5: data?.schedule_name,
          };

          const eventPayload = { ...eventNotification, ...notifcation };
          await helperEventNotification(eventPayload);
        }
      } else {
        toast.error("Please select current or future date")
        let month: any = moment(start).format("MM");
        let year: any = moment(start).format('YYYY')
        let firstDate = moment(new Date(year, parseInt(month) - 1, 1)).format("MM-DD-YYYY");
        let lastDate = moment(new Date(year, parseInt(month), 1)).format("MM-DD-YYYY");
        await getOptions(firstDate, lastDate);


      }
    }
  };
  const statusOfMonth = async (date: any) => {
    let month: any = moment(date).format("MM");
    let year: any = moment(date).format('YYYY')
    let firstDate = moment(new Date(year, parseInt(month) - 1, 1)).format("MM-DD-YYYY");
    let lastDate = moment(new Date(year, parseInt(month), 1)).format("MM-DD-YYYY");

    await getOptions(firstDate, lastDate)
  }

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

  const getOptions = async (firstDate: any, lastDate: any) => {
    const data: any = []
    const payload: any = {
      "SCHEDULE_VIEW": 0,
      "START_DATE": firstDate,
      "END_DATE": lastDate,
      "P_W_D": 0,
      "N_W_D": 0,
      "LOCATION": watchAllFields?.ASSETNAME?.length > 0 ? [watchAllFields?.LOCATION_ID] : data,
      "ASSETGROUP": watchAllFields?.ASSETNAME?.length > 0 ? [watchAllFields?.ASSETGROUP_ID] : data,
      "ASSETTYPE": watchAllFields?.ASSETNAME?.length > 0 ? [watchAllFields?.ASSETTYPE_ID] : data,
      "ASSETNAME": watchAllFields?.ASSETNAME?.length > 0 ? watchAllFields?.ASSETNAME : data

    }

    try {
      if (facility_type === "R") {
        const res = await callPostAPI(ENDPOINTS.GET_PPM_SCHEDULE_DASHBOARD, payload)
        if (res?.FLAG === 1) {
          const updatedSchedule: any = res?.PPMSCHEDULEDETAILS?.map((schedule: any) => {
            return (
              {
                ...schedule,
                start: new Date(schedule?.start),
                end: new Date(schedule?.end)
              }
            )
          })
          setScheduleData(updatedSchedule)
        }
      }
    } catch (error: any) {

    }
  }

  //Get Asset List
  const getOptionFilter = async () => {
    const payload = {
      LOCATION_ID: watchAllFields?.LOCATION_ID !== undefined ? watchAllFields?.LOCATION_ID?.LOCATION_ID : null,
      ASSETGROUP_ID: watchAllFields?.ASSETGROUP_ID !== undefined ? watchAllFields?.ASSETGROUP_ID?.ASSETGROUP_ID : null,
      ASSETTYPE_ID: watchAllFields?.ASSETTYPE_ID !== undefined ? watchAllFields?.ASSETTYPE_ID?.ASSETTYPE_ID : null
    }

    if (payload?.ASSETTYPE_ID !== undefined) {
      const res = await callPostAPI(ENDPOINTS?.GET_ASSETNAME, payload)
      setAssetOption(res?.ASSETLIST)
    }
  }

  useEffect(() => {
    if (watchAllFields?.ASSETGROUP_ID) {
      const dataField: any = options?.assetType?.filter((f: any) => f.ASSETGROUP_ID === watchAllFields?.ASSETGROUP_ID?.ASSETGROUP_ID)
      setType(dataField)
      setValue("ASSETTYPE_ID", "");
      setValue("ASSETNAME", "");
    }
  }, [watchAllFields?.ASSETGROUP_ID])

  useEffect(() => {
    if (watchAllFields?.ASSETTYPE_ID !== "" || watchAllFields?.ASSETTYPE_ID !== null) {
      (async function () {
        await getOptionFilter()
      })()
    }

  }, [watchAllFields?.ASSETTYPE_ID])



  const getFilterPPM = async () => {
    let month: any = moment(new Date()).format("MM");
    let year: any = moment(new Date()).format('YYYY')
    let firstDate = moment(new Date(year, parseInt(month) - 1, 1)).format("MM-DD-YYYY");
    let lastDate = moment(new Date(year, parseInt(month), 1)).format("MM-DD-YYYY");
    await getOptions(firstDate, lastDate);
  }

  useEffect(() => {
    if (watchAllFields?.ASSETNAME !== "") {
      (async function () {
        await getFilterPPM()
      })()
    }
  }, [watchAllFields?.ASSETNAME])


  useEffect(() => {
    (async function () {
      let month: any = moment(new Date()).format("MM");
      let year: any = moment(new Date()).format('YYYY')
      let firstDate = moment(new Date(year, parseInt(month) - 1, 1)).format("MM-DD-YYYY");
      let lastDate = moment(new Date(year, parseInt(month), 1)).format("MM-DD-YYYY");
      await getOptions(firstDate, lastDate);
    })()
  }, [])

  const getMasterDetails = async () => {
    const res1 = await callPostAPI(ENDPOINTS.LOCATION_HIERARCHY_LIST, null);
    const res2 = await callPostAPI(
      ENDPOINTS.GETASSETMASTEROPTIONS,
      { ASSETTYPE: "P", },
      props?.functionCode
    );
    if (res1?.FLAG === 1) {
      setlocationtypeOptions(res1?.LOCATIONHIERARCHYLIST);
      setOptions({
        assetGroup: res2?.ASSESTGROUPLIST,
        assetType: res2?.ASSESTTYPELIST,
      })
    }
  }

  useEffect(() => {
    (async function () {
      await getMasterDetails()
    })()
  }, [])


  return (
    <>
      {!showForm ?
        <>{facility_type === "R" ?
          <section className="w-full">
            <form onSubmit={handleSubmit(onSubmit)}>
              <Card className="mt-2">
                <div className="mt-1 grid grid-cols-1 gap-x-5 md:grid-cols-4 lg:grid-cols-5">
                  <div className="">
                    <div className="">
                      {currentMenu?.ADD_RIGHTS === "True" && <Buttons
                        type="button"
                        className="Primary_Button mb-2  w-full"
                        label="Add PPM"
                        onClick={() => {
                          navigate(PATH.ADD_PPMSCHEDULE)
                          setShowForm(true)
                        }}
                      />
                      }
                      <hr></hr>
                    </div>
                    <div className="">


                      <Field
                        controller={{
                          name: "LOCATION_ID",
                          control: control,
                          render: ({ field }: any) => {
                            return (
                              <Select
                                options={locationtypeOptions}
                                {...register("LOCATION_ID", {
                                  onChange: (async () => {
                                    setValue("ASSETGROUP_ID", "")
                                    setValue("ASSETTYPE_ID", "");
                                    setValue("ASSETNAME", "");
                                    watchAllFields.ASSETGROUP_ID = "";
                                    watchAllFields.ASSETTYPE_ID = "";
                                    watchAllFields.ASSETNAME = "";
                                    await getFilterPPM()
                                  })
                                })}
                                label="Location"
                                optionLabel="LOCATION_DESCRIPTION"
                                valueTemplate={selectedLocationTemplate}
                                itemTemplate={locationOptionTemplate}
                                findKey={"LOCATION_ID"}
                                require={true}
                                filter={true}
                                // selectedData={
                                //   selectedDetails?.LOCATION_ID
                                // }
                                setValue={setValue}
                                {...field}
                              />
                            );
                          },
                        }}
                      />

                      <Field
                        controller={{
                          name: "ASSETGROUP_ID",
                          control: control,
                          render: ({ field }: any) => {
                            return (
                              <Select
                                options={options?.assetGroup}
                                {...register("ASSETGROUP_ID", {
                                  required: "Please fill the required fields",
                                })}
                                label="Group"
                                require={true}
                                optionLabel="ASSETGROUP_NAME"
                                findKey={"ASSETGROUP_ID"}
                                // selectedData={selectedDetails?.ASSETGROUP_ID}
                                setValue={setValue}
                                invalid={errors.ASSETGROUP_ID}
                                {...field}
                              />
                            );
                          },
                        }}
                      />

                      <Field
                        controller={{
                          name: "ASSETTYPE_ID",
                          control: control,
                          render: ({ field }: any) => {
                            return (
                              <Select
                                options={type}
                                {...register("ASSETTYPE_ID", {
                                  required: "Please fill the required fields",
                                })}
                                label="Type"
                                require={true}
                                optionLabel="ASSETTYPE_NAME"
                                findKey={"ASSETTYPE_ID"}
                                // selectedData={selectedDetails?.ASSETTYPE_ID}
                                setValue={setValue}
                                invalid={errors.ASSETTYPE_ID}
                                {...field}
                              />
                            );
                          },
                        }}
                      />

                      <Field
                        controller={{
                          name: "ASSETNAME",
                          control: control,
                          render: ({ field }: any) => {
                            return (
                              <MultiSelects
                                options={assetOption}
                                {...register("ASSETNAME", {
                                  required: t("Please fill the required fields.."),
                                })}
                                label="Equipment/Service Name"
                                className=" w-full"
                                optionLabel="ASSET_NAME"
                                setValue={setValue}
                                // selectedData={selectedDetails?.SEL_ASSETNAME}
                                findKey={"ASSET_NAME"}
                                invalid={errors.ASSETNAME}
                                {...field}
                              />
                            );
                          },
                        }}
                      />
                    </div>
                  </div>
                  <div className="col-span-4 custom-calendar" style={{ height: "530pt" }}>
                    <DnDCalendar
                      events={scheduleData}
                      localizer={localizer}
                      allDayMaxRows={7}
                      popup={true}
                      resizable
                      selectable
                      onNavigate={async (date: any) => {
                        await statusOfMonth(date);

                      }}
                      onSelectEvent={(event: any) => handleSelectedEvent(event)}
                      onEventDrop={onEventDrop}
                    // onEventResize={onEventResize}
                    />
                  </div>
                </div>
              </Card>
            </form>
          </section> : <InfraPPMSchedule />}
        </>
        :
        <PPMAddForm
          setShowForm={setShowForm}
          getOptions={getOptions}

        />}


    </>

  )

};

export default PPMSchedule;
