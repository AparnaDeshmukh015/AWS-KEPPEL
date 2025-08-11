import InputField from "../../../components/Input/Input";
import { Card } from "primereact/card";
import { useForm } from "react-hook-form";
import Field from "../../../components/Field";
import Checkboxs from "../../../components/Checkbox/Checkbox";
import { callPostAPI } from "../../../services/apis";
import { ENDPOINTS } from "../../../utils/APIEndpoints";
import { TabPanel, TabView } from "primereact/tabview";
import Radio from "../../../components/Radio/Radio";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import MultiSelectCheckbox from "./MultiSelectCheckbox";
import { useTranslation } from "react-i18next";
import FormHeader from "../../../components/FormHeader/FormHeader";
import { saveTracker } from "../../../utils/constants";
import { useLocation, useOutletContext } from "react-router-dom";
import MultiSelects from "../../../components/MultiSelects/MultiSelects";

const TeamMasterForm = (props: any) => {
  const [selectedDetails, setSelectedDetails] = useState<any>([]);
  const [options, setOptions] = useState<any>([]);
  const [assetTypeList, setAssetTypeList] = useState<any | null>([]);
  const [teamMasterCheckbox, setTeamMasterCheckbox] = useState<any | null>([]);
  const [teamList, setTeamList] = useState<any | null>([]);
  const [assetNon, setAssetNon] = useState<any | null>("A");
  const [IsSubmit, setIsSubmit] = useState<any | null>(false);
  const { t } = useTranslation();
  const assestTypeLabel: any = [
    { name: "Equipment", key: "A" },
    { name: "Soft Services", key: "N" },
  ];
  let { pathname } = useLocation();
  const [, menuList]: any = useOutletContext();
  const [workForceTypes, setWorkforceTypes] = useState<any | null>([]);
  const currentMenu: any = menuList
    ?.flatMap((menu: any) => menu?.DETAIL)
    .filter((detail: any) => detail.URL === pathname)[0];
  const { search } = useLocation();
  const getId: any = localStorage.getItem("Id");
  const dataId = JSON.parse(getId);
  const FACILITY: any = localStorage.getItem("FACILITYID");
  const FACILITY_ID: any = JSON.parse(FACILITY);
  if (FACILITY_ID) {
    var facility_type: any = FACILITY_ID?.FACILITY_TYPE;
  }
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      MODE: props?.selectedData || search === "?edit=" ? "E" : "A",
      PARA:
        props?.selectedData || search === "?edit="
          ? { para1: `${props?.headerName}`, para2: "Updated" }
          : { para1: `${props?.headerName}`, para2: "Added" },
      TEAM_NAME: props?.selectedData
        ? props?.selectedData?.TEAM_NAME
        : search === "?edit="
        ? dataId?.TEAM_NAME
        : "",
      TEAMLEAD: "",
      TEAM_CODE:
        facility_type === "I" && search === "?edit=" ? dataId?.TEAM_CODE : "",
      ACTIVE:
        props?.selectedData?.ACTIVE !== undefined
          ? props.selectedData.ACTIVE
          : true,
      ASSET_NONASSET: "",
      TEAM_ID: props?.selectedData
        ? props?.selectedData?.TEAM_ID
        : search === "?edit="
        ? dataId?.TEAM_ID
        : 0,
    },
    mode: "onSubmit",
  });

  const ASSET_NONASSET: any = watch("ASSET_NONASSET");
  //const TEAM_LEAD_ID: any = watch("TEAMLEAD");

  const onSubmit = async (payload: any) => {
    if (IsSubmit) return true;
    setIsSubmit(true);
    const assetList = teamMasterCheckbox
      .filter((item: any) => item.select === 1 && item.type === "assetType")
      .map((asset: any) => ({
        ASSETGROUP_ID: asset.assettype_id,
        ASSETGROUP_NAME: asset.assettype_name,
      }));

    const workForceList = workForceTypes
      .filter((item: any) => item.select === 1 && item.type === "workForce")
      .map((user: any) => ({
        USER_ID: user.assettype_id,
        USER_NAME: user.assettype_name,
      }));
    //  payload.TEAM_CODE=facility_type === "I" ?
    payload.ACTIVE = payload?.ACTIVE ? 1 : 0;
    payload.TEAMLEAD_LIST = payload?.TEAMLEAD;
    payload.ASSETGROUP_LIST = assetList;
    payload.WORKFORCE_LIST = workForceList;
    payload.TEAM_NAME = payload?.TEAM_NAME?.trim();
    delete payload?.TEAMLEAD;
    delete payload?.ASSET_NONASSET;
    try {
      const res = await callPostAPI(ENDPOINTS.SAVE_TEAMMASTER, payload);
      if (res?.FLAG === true) {
        toast?.success(res?.MSG);
        props?.getAPI();
        props?.isClick();
      } else {
        setIsSubmit(false);
        toast?.error(res?.MSG);
      }
    } catch (error: any) {
      toast?.error(error);
    } finally {
      setIsSubmit(false);
    }
  };

  const handleCheckboxChange = (selectedCheckboxes: any[]) => {
    setSelectedDetails(selectedCheckboxes);
  };

  useEffect(() => {
    if (
      (!isSubmitting && Object?.values(errors)[0]?.type === "required") ||
      (!isSubmitting && Object?.values(errors)[0]?.type === "validate")
    ) {
      const check: any = Object?.values(errors)[0]?.message;
      toast?.error(t(check));
    } else {
    }
  }, [isSubmitting]);

  const getWorkForceOption = async (teamLeadId: any, assetList: any) => {
    const pay: any = {
      TEAM_ID: search === "?edit=" ? dataId?.TEAM_ID : 0,
      TEAM_LEAD_ID: teamLeadId ? teamLeadId : 0,
    };

    const res2 = await callPostAPI(ENDPOINTS.GET_WORKFORCELISTOPTION, pay);
    if (res2?.FLAG === 1) {
      const workForceList: any = res2?.WORKFORCELIST?.map((workForce: any) => ({
        assettype_id: workForce?.USER_ID,
        assettype_name: workForce?.USER_NAME,
        select: teamLeadId === 0 ? 0 : workForce?.SELECT,
        type: "workForce",
      }));
      //
      const mergedArray = [...(assetList || []), ...(workForceList || [])];
      setTeamMasterCheckbox(mergedArray);
      setWorkforceTypes(workForceList);
    } else {
      const mergedArray = [...(assetList || []), ...[]];
      setTeamMasterCheckbox(mergedArray);
      setWorkforceTypes([]);
    }
  };

  const handleChange = () => {
    // getWorkForceOption(e.target?.value?.USER_ID,assetTypeList)
  };

  const getDetailsOption = async () => {
    const payload = {
      TEAM_ID: dataId?.TEAM_ID,
    };
    try {
      const res = await callPostAPI(ENDPOINTS.GETLOCATIONTEAMOPTION, payload);
      if (res?.FLAG === 1) {
        const assetNonData: any = res?.ASSETGROUPLIST?.filter(
          (assetGroup: any) => assetGroup?.SELECT === 1
        )[0];
        setAssetNon(assetNonData?.ASSETGROUP_TYPE);
        const assetType: any = res?.ASSETGROUPLIST?.map((assetType: any) => ({
          assettype_id: assetType?.ASSETGROUP_ID,
          assettype_name: assetType?.ASSETGROUP_NAME,
          assetType: assetType?.ASSETGROUP_TYPE,
          select: assetType?.SELECT,
          type: "assetType",
        }));
        const teamData: any = res?.TEAMLEADLIST?.filter(
          (f: any) => f.SELECT === 1
        );
        setTeamList(teamData);
        setAssetTypeList([...assetTypeList, ...assetType]);
        setTeamMasterCheckbox(assetType);
        setOptions({
          teamLead: res?.TEAMLEADLIST,
        });
        // setEditDetails()

        await getWorkForceOption(props?.selectedData?.TEAM_LEAD_ID, assetType);
      }
    } catch (error) {}
  };

  const getOptions = async () => {
    try {
      if (props?.selectedData === undefined) {
        const res = await callPostAPI(ENDPOINTS.GETLOCATIONTEAMOPTION, {
          TEAM_ID: 0,
        });

        if (res?.FLAG === 1) {
          const assetTypeList: any = res?.ASSETGROUPLIST?.map(
            (assetType: any) => ({
              assettype_id: assetType?.ASSETGROUP_ID,
              assettype_name: assetType?.ASSETGROUP_NAME,
              assetType: assetType?.ASSETGROUP_TYPE,
              select: 0,
              type: "assetType",
            })
          );

          setTeamMasterCheckbox(assetTypeList);
          await getWorkForceOption(0, assetTypeList);
          setOptions({ teamLead: res?.TEAMLEADLIST });
        }
      }
      if (search === "?edit=") {
        await getDetailsOption();
      }
    } catch (error) {}
  };

  useEffect(() => {
    (async function () {
      await getOptions();
      await saveTracker(currentMenu);
    })();
  }, []);

  return (
    <section className="w-full">
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormHeader
          headerName={props?.headerName}
          isSelected={props?.selectedData ? true : false}
          isClick={props?.isClick}
          IsSubmit={IsSubmit}
        />
        <Card className="mt-2">
          <div className="mt-1 grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-3 lg:grid-cols-3">
            {facility_type === "I" && (
              <Field
                controller={{
                  name: "TEAM_CODE",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <InputField
                        {...register("TEAM_CODE", {
                          required: "Please fill the required fields.",
                          validate: (value) =>
                            value.trim() !== "" ||
                            "Please fill the required fields.",
                        })}
                        require={true}
                        label="Team Code"
                        invalid={errors.TEAM_CODE}
                        maxLength={5}
                        {...field}
                      />
                    );
                  },
                }}
              />
            )}
            <Field
              controller={{
                name: "TEAM_NAME",
                control: control,
                render: ({ field }: any) => {
                  return (
                    <InputField
                      {...register("TEAM_NAME", {
                        required: "Please fill the required fields.",
                        validate: (value) =>
                          value.trim() !== "" ||
                          "Please fill the required fields.",
                      })}
                      require={true}
                      label="Team Name"
                      invalid={errors.TEAM_NAME}
                      {...field}
                    />
                  );
                },
              }}
            />
            <Field
              controller={{
                name: "TEAMLEAD",
                control: control,
                render: ({ field }: any) => {
                  return (
                    <MultiSelects
                      options={options?.teamLead}
                      {...register("TEAMLEAD", {
                        required: "Please fill the required fields.",
                        onChange: () => {
                          handleChange();
                        },
                      })}
                      label="Team Supervisor"
                      require={true}
                      optionLabel="USER_NAME"
                      findKey={"USER_ID"}
                      selectedData={teamList}
                      setValue={setValue}
                      invalid={errors.TEAMLEAD}
                      resetFilterOnHide={true}
                      {...field}
                    />
                  );
                },
              }}
            />
            <div className="flex align-items-center">
              <Field
                controller={{
                  name: "ACTIVE",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <Checkboxs
                        {...register("ACTIVE")}
                        className="md:mt-7"
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
        <div className="mt-2">
          <TabView className=" ">
            <TabPanel header={t("Equipment Group to Team")}>
              <div className="p-4">
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
                            labelHead="Group"
                            require={true}
                            options={assestTypeLabel}
                            selectedData={assetNon === "N" ? "N" : "A"}
                            setValue={setValue}
                            {...field}
                          />
                        </>
                      );
                    },
                  }}
                />
              </div>
              <div>
                <MultiSelectCheckbox
                  teamMasterCheckbox={teamMasterCheckbox}
                  setTeamMasterCheckbox={setTeamMasterCheckbox}
                  selectedCheckboxes={selectedDetails}
                  handleCheckboxChange={handleCheckboxChange}
                  type={"assetType"}
                  assetNonAsset={ASSET_NONASSET}
                  setWorkforceTypes={setWorkforceTypes}
                  workForceTypes={workForceTypes}
                />
              </div>
            </TabPanel>
            <TabPanel header={t("Assignee to Team")}>
              <MultiSelectCheckbox
                teamMasterCheckbox={teamMasterCheckbox}
                setTeamMasterCheckbox={setTeamMasterCheckbox}
                selectedCheckboxes={selectedDetails}
                handleCheckboxChange={handleCheckboxChange}
                type={"workForce"}
                assetNonAsset={null}
                setWorkforceTypes={setWorkforceTypes}
                workForceTypes={workForceTypes}
              />
            </TabPanel>
          </TabView>
        </div>
      </form>
    </section>
  );
};

export default TeamMasterForm;
