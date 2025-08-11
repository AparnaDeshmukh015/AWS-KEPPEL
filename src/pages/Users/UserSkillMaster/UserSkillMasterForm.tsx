
import { Card } from "primereact/card";
import { useForm } from "react-hook-form";
import Field from "../../../components/Field";
import Select from "../../../components/Dropdown/Dropdown";
import { callPostAPI } from "../../../services/apis";
import { ENDPOINTS } from "../../../utils/APIEndpoints";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import MultiSelects from "../../../components/MultiSelects/MultiSelects";
import { useTranslation } from "react-i18next";
import FormHeader from "../../../components/FormHeader/FormHeader";
import { saveTracker } from "../../../utils/constants";
import { useLocation, useOutletContext } from "react-router-dom";

const UserSkillMasterForm = (props: any) => {
  const { t } = useTranslation();
  let { pathname } = useLocation();
  const { search } = useLocation();
  const [, menuList]: any = useOutletContext();
  const currentMenu = menuList
    ?.flatMap((menu: any) => menu?.DETAIL)
    .filter((detail: any) => detail.URL === pathname)[0];
  const [userskilloptions, setUserskilloptions] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [usersListOptions, setUsersListOptions] = useState([]);
  const [userRoleList, setUserRoleList] = useState<any | null>([])
  const [userList, setUserList] = useState<any | null>([])

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      MODE: props?.selectedData ? "E" : "A",
      PARA: props?.selectedData
        ? { para1: `${props?.headerName}`, para2: "Updated" }
        : { para1: `${props?.headerName}`, para2: "Added" },
      USER_LIST: props?.selectedData?.USER_LIST,
      SKILL_LIST: "",
      USER_ROLE: "",
    },
    mode: "onSubmit",
  });

  const watchUSER_ROLE: any = watch('USER_ROLE')
  const getOptions = async () => {
    const skillPayload = {
      SELECTED_USER_ID: props?.selectedData?.USER_ID,
    };
    const res = await callPostAPI(ENDPOINTS.getUserSkillMasterList);
    setUserskilloptions(res?.SKILLLIST);
    setUsersListOptions(res?.USER_LIST);
    setUserRoleList(res?.ROLELIST)
    const response = await callPostAPI(
      ENDPOINTS.getUserSkillDetails,
      skillPayload
    );

    setSelectedSkills(response?.USER_SKILL_DETAILS);
  };

  const onSubmit = async (payload: any) => {
    payload.SKILL_LIST = payload?.SKILL_LIST?.map((item: any) => ({
      SKILL_ID: item?.SKILL_ID,
    }));
    payload.SELECTED_USER_ID = payload?.USER_LIST?.USER_ID;
    delete payload.USER_ROLE;
    delete payload?.USER_LIST
    try {
      const res = await callPostAPI(ENDPOINTS.saveUserSkillMaster, payload);

      if (res?.FLAG === true) {
        toast?.success(res?.MSG);
        props?.getAPI();
        props?.isClick();
      }
      else {
        toast?.error(res?.MSG);
      }
    } catch (error: any) {
      toast?.error(error);
    }

  };
  useEffect(() => {
    getOptions();
    saveTracker(currentMenu)
  }, []);

  useEffect(() => {
    if (!isSubmitting && Object?.values(errors)[0]?.type === "required") {
      const check: any = Object?.values(errors)[0]?.message;
      toast?.error(t(check));
    }
  }, [isSubmitting]);

  useEffect(() => {

    if (watchUSER_ROLE) {
      const roleWiseList: any = usersListOptions?.filter((f: any) => f.ROLE_ID === watchUSER_ROLE?.ROLE_ID)
      setUserList(roleWiseList)
    }
  }, [watchUSER_ROLE])

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
                name: "USER_ROLE",
                control: control,
                render: ({ field }: any) => {
                  return (
                    <Select
                      options={userRoleList}
                      {...register("USER_ROLE", {
                        required: t("Please fill the required fields."),
                      })}
                      label="User Role"
                      require={true}
                      optionLabel="ROLE_NAME"
                      findKey={"ROLE_ID"}
                      disabled={search === '?edit=' ? true : false}
                      selectedData={props?.selectedData?.ROLE_ID}
                      invalid={errors?.USER_ROLE}
                      setValue={setValue}
                      {...field}
                    />
                  );
                },
              }}
            />
            <Field
              controller={{
                name: "USER_LIST",
                control: control,
                render: ({ field }: any) => {
                  return (
                    <Select
                      options={userList}
                      {...register("USER_LIST", {
                        required: t("Please fill the required fields."),
                      })}
                      label="User Name List"
                      optionLabel="USER_NAME"
                      require={true}
                      findKey={"USER_ID"}
                      disabled={search === '?edit=' ? true : false}
                      selectedData={props?.selectedData?.USER_ID}
                      setValue={setValue}
                      invalid={errors.USER_LIST}
                      {...field}
                    />
                  );
                },
              }}
              error={errors?.USER_LIST?.message}
            />
            <Field
              controller={{
                name: "SKILL_LIST",
                control: control,
                render: ({ field }: any) => {
                  return (
                    <MultiSelects
                      options={userskilloptions}
                      {...register("SKILL_LIST", {
                        required: t("Please fill the required fields."),
                      })}
                      selectedData={selectedSkills}
                      label="Skill Name"
                      optionLabel="SKILL_NAME"
                      require={true}

                      invalid={errors.SKILL_LIST}
                      setValue={setValue}
                      findKey={"SKILL_NAME"}
                      {...field}
                    />
                  );
                },
              }}
              error={errors?.SKILL_LIST?.message}
            />
          </div>
        </Card>
      </form>
    </section>
  );
};

export default UserSkillMasterForm;
