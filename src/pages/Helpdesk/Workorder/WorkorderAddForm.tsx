import { useEffect, useState } from "react";
import { callPostAPI } from "../../../services/apis";
import { ENDPOINTS } from "../../../utils/APIEndpoints";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import InputField from "../../../components/Input/Input";
import Buttons from "../../../components/Button/Button";
import { Card } from "primereact/card";
import Field from "../../../components/Field";
import Select from "../../../components/Dropdown/Dropdown";
import Radio from "../../../components/Radio/Radio";
import DocumentUpload from "../../../components/pageComponents/DocumentUpload/DocumentUpload";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { dateFormat } from "../../../utils/constants";
import { decryptData } from "../../../utils/encryption_decryption";

const WorkorderAddForm = (props: any) => {
  const { t } = useTranslation();
  const [options, setOptions] = useState<any | null>([]);
  const navigate: any = useNavigate();
  const [userId, setUserId] = useState<any | null>();
  const [workOrderOption, setWorkOrderOption] = useState<any | null>([]);
  const [selectedDetails, setSelectedDetails] = useState<any>([]);
  let [locationtypeOptions, setlocationtypeOptions] = useState([]);
  const [technician, setTechnician] = useState<any | null>([]);
  const id: any = decryptData(localStorage.getItem("USER_ID"));
  const assestTypeLabel: any = [
    { name: "Equipment", key: "A" },
    { name: "Soft Services", key: "N" },
  ];

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      WO_ID: props?.selectedData ? props?.selectedData?.WO_ID : 0,
      SER_REQ_NO: "",
      WO_TYPE: "CM",
      REQ_ID: "",
      ASSET_ID: "",
      MODE: props?.selectedData ? "E" : "A",
      PARA: props?.selectedData
        ? { para1: `${props?.headerName}`, para2: "Updated" }
        : { para1: `${props?.headerName}`, para2: "Added" },
      RAISEDBY_ID: "",
      ASSET_NONASSET: "",
      LOCATION_ID: "",
      REQUESTTITLE_ID: "",
      DESCRIPTION: "",
      SEVERITY_CODE: "",
      ASSETTYPE: "",
      WO_DATE: moment(new Date()).format(dateFormat()),
      WO_REMARKS: "",
      CURRENT_STATUS: 1,
      DOC_LIST: [],
      ASSIGN_TEAM_ID: "",
      TECH_ID: 0,
    },
    mode: "onSubmit",
  });
  const { append, remove } = useFieldArray({
    name: "DOC_LIST",
    control,
  });

  const ASSET_NONASSET: any = watch("ASSET_NONASSET");
  const ASSET_ID: any = watch("ASSET_ID");

  const onSubmit = async (payload: any) => {
    payload.ASSET_NONASSET = payload?.ASSET_NONASSET?.key;
    payload.ASSETTYPE_ID = payload?.ASSET_ID?.ASSETTYPE_ID;
    payload.ASSET_ID = payload?.ASSET_ID?.ASSET_ID;
    payload.LOCATION_ID = payload?.LOCATION_ID?.LOCATION_ID;
    payload.RAISED_BY = payload?.RAISEDBY_ID?.USER_ID;
    payload.REQ_ID = payload?.REQ_ID?.REQ_ID;
    payload.SEVERITY_CODE = payload?.SEVERITY_CODE?.SEVERITY_ID;
    payload.ASSIGN_TEAM_ID = payload?.ASSIGN_TEAM_ID?.TEAM_ID;
    payload.TECH_ID = payload?.TECH_ID?.USER_ID;
    payload.ACTIVE = 1;
    delete payload?.DOC;
    delete payload?.ASSETTYPE;
    delete payload?.REQUESTTITLE_ID;
    delete payload?.RAISEDBY_ID;
    delete payload?.STATUS_CODE;
    try {
      const res = await callPostAPI(ENDPOINTS.SAVE_WORKORDER, payload);
      if (props?.selectedData !== undefined) {
        props?.setEditStatus(true);
        toast?.success(res?.MSG);
      } else {
        toast?.success(res?.MSG);
        props?.getAPI();
        // props?.isClick();
        navigate("/workorderlist");
      }
    } catch (error: any) {
      toast?.error(error);
    }
  };
  const getWoOrderList = async () => {
    const payload: any = {
      ASSETTYPE_ID: ASSET_ID?.ASSETTYPE_ID,
      ASSET_NONASSET:
        ASSET_NONASSET?.key !== undefined
          ? ASSET_NONASSET?.key
          : ASSET_NONASSET,
    };

    const res = await callPostAPI(
      ENDPOINTS.GET_SERVICEREQUEST_WORKORDER,
      payload
    );
    if (res?.FLAG === 1) {
      setWorkOrderOption(res?.WOREQLIST);
    }
  };
  useEffect(() => {
    if (ASSET_ID) {
      getWoOrderList();
    }
  }, [ASSET_ID]);

  const ASSIGN_TEAM_ID1: any = watch("ASSIGN_TEAM_ID");
  const getTechnicianList = async () => {
    const res = await callPostAPI(ENDPOINTS?.GET_TECHNICIANLIST, {
      TEAM_ID: ASSIGN_TEAM_ID1?.TEAM_ID,
    });

    if (res?.FLAG === 1) {
      setTechnician(res?.TECHLIST);
    }
  };

  const getOptionDetails = async () => {
    const payload: any = { WO_ID: props?.selectedData?.WO_ID };
    const res: any = await callPostAPI(
      ENDPOINTS.GET_WORKORDER_DETAILS,
      payload
    );
    if (res?.FLAG === 1) {
      setSelectedDetails(res?.WORKORDERDETAILS[0]);
      setValue("WO_REMARKS", res?.WORKORDERDETAILS[0]?.WO_REMARKS);
      setValue("DOC_LIST", res?.WORKORDERDOCLIST);
      setValue("ASSET_NONASSET", res?.WORKORDERDETAILS[0]?.ASSET_NONASSET);
      setUserId(res?.WORKORDERDETAILS[0]?.RAISED_BY);
    }
  };

  const getOptions = async () => {
    try {
      const res = await callPostAPI(ENDPOINTS.GET_SERVICEREQUST_MASTERLIST, {});
      const res1 = await callPostAPI(ENDPOINTS.LOCATION_HIERARCHY_LIST, null);

      if (res?.FLAG === 1) {
        setlocationtypeOptions(res1?.LOCATIONHIERARCHYLIST);
        setOptions({
          userList: res?.USERLIST,
          severityLIST: res?.SEVERITYLIST,
          wo_list: res?.WORIGHTSLIST,
          assestOptions: res?.ASSETLIST?.filter(
            (item: any) => item?.ASSET_NONASSET === "A"
          ),
          softServicesOptions: res?.ASSETLIST?.filter(
            (item: any) => item?.ASSET_NONASSET === "N"
          ),

          teamList: res?.TEAMLIST,
        });
      }
      setUserId(parseInt(id));
      if (props?.selectedData?.WO_ID !== 0) {
        getOptionDetails();
      }
    } catch (error: any) {
      toast.error(error);
    }
  };

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
  useEffect(() => {
    if (ASSIGN_TEAM_ID1) {
      getTechnicianList();
    }
  }, [ASSIGN_TEAM_ID1]);

  useEffect(() => {
    getOptions();
  }, []);
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
              {props?.selectedData ? "Edit" : "Add"} {props?.headerName}{" "}
            </h6>
          </div>
          <div className="flex">
            <Buttons
              type="submit"
              className="Primary_Button  w-20 me-2"
              label={"Save"}
            />
            <Buttons
              type="button"
              className="Secondary_Button w-20 "
              label={"List"}
              onClick={() => {
                navigate("/workorderlist");
              }}
            />
          </div>
        </div>
        <Card className="mt-2">
          <div className="mt-1 grid grid-cols-1 gap-x-4 gap-y-4 md:grid-cols-3 lg:grid-cols-3">
            <Field
              controller={{
                name: "RAISEDBY_ID",
                control: control,
                render: ({ field }: any) => {
                  return (
                    <Select
                      options={options?.userList}
                      {...register("RAISEDBY_ID", {
                        required: "Please fill the required fields",
                      })}
                      label="Raised By"
                      optionLabel="USER_NAME"
                      invalid={errors.RAISEDBY_ID}
                      require={true}
                      findKey={"USER_ID"}
                      selectedData={userId}
                      setValue={setValue}
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
                      options={locationtypeOptions}
                      {...register("LOCATION_ID", {
                        required: "Please fill the required fields",
                      })}
                      label="Location "
                      optionLabel="LOCATION_DESCRIPTION"
                      invalid={errors.LOCATION_ID}
                      require={true}
                      valueTemplate={selectedLocationTemplate}
                      itemTemplate={locationOptionTemplate}
                      findKey={"LOCATION_ID"}
                      selectedData={selectedDetails?.LOCATION_ID}
                      setValue={setValue}
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
                        ASSET_NONASSET?.key === "A" || ASSET_NONASSET === "A"
                          ? options?.assestOptions
                          : options?.softServicesOptions
                      }
                      {...register("ASSET_ID", {
                        required: "Please fill the required fields",
                      })}
                      label={
                        ASSET_NONASSET?.key === "A" || ASSET_NONASSET === "A"
                          ? "Equipment"
                          : "Soft Service"
                      }
                      optionLabel="ASSET_NAME"
                      invalid={errors.ASSET_ID}
                      require={true}
                      findKey={"ASSET_ID"}
                      selectedData={props?.selectedData?.ASSET_ID}
                      setValue={setValue}
                      {...field}
                    />
                  );
                },
              }}
            />
            <Field
              controller={{
                name: "REQ_ID",
                control: control,
                render: ({ field }: any) => {
                  return (
                    <Select
                      options={workOrderOption}
                      {...register("REQ_ID", {
                        required: "Please fill the required fields",
                      })}
                      label={"Request Title"}
                      optionLabel="REQ_DESC"
                      invalid={errors.REQ_ID}
                      findKey={"REQ_ID"}
                      require={true}
                      selectedData={selectedDetails?.REQ_ID}
                      setValue={setValue}
                      {...field}
                    />
                  );
                },
              }}
            />
            <Field
              controller={{
                name: "WO_REMARKS",
                control: control,
                render: ({ field }: any) => {
                  return (
                    <InputField
                      {...register("WO_REMARKS", {
                        required: "Please fill the required fields",
                      })}
                      label="Description"
                      invalid={errors.WO_REMARKS}
                      require={true}
                      setValue={setValue}
                      {...field}
                    />
                  );
                },
              }}
            />
            <Field
              controller={{
                name: "SEVERITY_CODE",
                control: control,
                render: ({ field }: any) => {
                  return (
                    <Select
                      options={options?.severityLIST}
                      //options={[]}
                      {...register("SEVERITY_CODE", {
                        required: "Please fill the required fields",
                      })}
                      label={"Severity"}
                      optionLabel="SEVERITY"
                      invalid={errors.SEVERITY_CODE}
                      findKey={"SEVERITY_ID"}
                      require={true}
                      selectedData={props?.selectedData?.SEVERITY_CODE}
                      setValue={setValue}
                      {...field}
                    />
                  );
                },
              }}
            />
            <Field
              controller={{
                name: "ASSIGN_TEAM_ID",
                control: control,
                render: ({ field }: any) => {
                  let teamId: any = "";
                  if (decryptData(localStorage.getItem("ROLE_NAME")) === "Technician") {
                    let teamId: any = localStorage.getItem("TEMA_ID");
                  } else {
                    const singleTeam =
                      options?.teamList?.length === 1
                        ? options?.teamList[0]
                        : null;
                    let teamId = singleTeam?.TEAM_ID;
                  }
                  return (
                    <Select
                      options={options?.teamList}
                      {...register("ASSIGN_TEAM_ID", {
                        required: "Please fill the required fields",
                      })}
                      label={"Team"}
                      optionLabel="TEAM_NAME"
                      invalid={errors.ASSIGN_TEAM_ID}
                      findKey={"TEAM_ID"}
                      require={true}
                      selectedData={
                        selectedDetails?.ASSIGN_TEAM_ID || parseInt(teamId)
                      }
                      setValue={setValue}
                      {...field}
                    />
                  );
                },
              }}
            />
            <Field
              controller={{
                name: "TECH_ID",
                control: control,
                render: ({ field }: any) => {
                  let userId: any = decryptData(localStorage.getItem("USER_ID"));
                  return (
                    <Select
                      options={technician}
                      {...register("TECH_ID", {
                        required:
                          props.selectedData !== undefined
                            ? "Please fill the required fields"
                            : "",
                      })}
                      label={"Technician Name"}
                      optionLabel="USER_NAME"
                      findKey={"USER_ID"}
                      require={true}
                      selectedData={
                        selectedDetails?.TECH_ID || parseInt(userId)
                      }
                      setValue={setValue}
                      invalid={
                        props.selectedData !== undefined ? errors.TECH_ID : ""
                      }
                      {...field}
                    />
                  );
                },
              }}
            />
          </div>
        </Card>
        <Card className="mt-2 col-span-2">
          <Card className="mt-2">
            <DocumentUpload
              register={register}
              control={control}
              setValue={setValue}
              watch={watch}
              getValues={getValues}
              errors={errors}
            />
          </Card>
        </Card>
      </form>
    </section>
  );
};

export default WorkorderAddForm;
