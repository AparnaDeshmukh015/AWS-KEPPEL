import InputField from "../../../components/Input/Input";
import { Card } from "primereact/card";
import { SubmitErrorHandler, useFieldArray, useForm } from "react-hook-form";
import Field from "../../../components/Field";
import { callPostAPI } from "../../../services/apis";
import { ENDPOINTS } from "../../../utils/APIEndpoints";
import Select from "../../../components/Dropdown/Dropdown";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import Radio from "../../../components/Radio/Radio";
import { useCallback, useEffect, useState } from "react";
import { useLocation, useOutletContext } from "react-router-dom";
import FormHeader from "../../../components/FormHeader/FormHeader";
import { Button } from "primereact/button";
import "./TaskMaster.css"
import { saveTracker } from "../../../utils/constants";

interface TaskOption {
  TASK_ID: any;
  TASK_NAME: any;
}

interface FormData {
  MODE: string;
  PARA: {
    para1: string;
    para2: string;
  };
  SKILL_NAME: string;
  ASSEST_TYPE: string;
  ASSEST_TYPE_NAME: string;
  TASK_LIST: TaskOption[];
}

const TaskMasterForm = (props: any) => {
  let { pathname } = useLocation();
  const [IsSubmit, setIsSubmit] = useState<any | null>(false);
  let { search } = useLocation();
  const [selected, menuList]: any = useOutletContext();
  const currentMenu = menuList
    ?.flatMap((menu: any) => menu?.DETAIL)
    .filter((detail: any) => detail.URL === pathname)[0];
  const assestTypeLabel: any = [
    { name: "Equipment ", key: "A" },
    { name: "Soft Service", key: "N" },
  ];
  const { t } = useTranslation();
  const [options, setOptions] = useState<any>([]);
  // const [taskoption, setTaskOptions] = useState<any | null>([
  //   { TASK_ID: 0, TASK_NAME: "" },
  // ]);
  //const [selectedDetails, setSelectedDetails] = useState<any>([]);
  const getId: any = localStorage.getItem("Id")
  const dataId = JSON.parse(getId)
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      MODE: props?.selectedData ? "E" : "A",
      PARA: props?.selectedData
        ? { para1: `${props?.headerName}`, para2: t("Updated") }
        : { para1: `${props?.headerName}`, para2: t("Added") },
      SKILL_NAME: props?.selectedData?.SKILL_NAME || "",

      ASSEST_TYPE: "",
      ASSEST_TYPE_NAME: "",
      TASK_LIST: [{ TASK_ID: 0, TASK_NAME: "" }],

    },
    mode: "onSubmit",
  });

  const { fields, append } = useFieldArray({
    name: "TASK_LIST",
    control,
  });
  const assestType: any = watch("ASSEST_TYPE");

  const getOptions = async () => {
    try {
      const res = await callPostAPI(
        ENDPOINTS.getTaskMasterList,
        null,
        currentMenu?.FUNCTION_CODE
      );

      setOptions({
        skillOptions: res?.SKILLLIST,
        assestOptions: res?.ASSETTYPELIST?.filter(
          (item: any) => item?.ASSETTYPE === "A"
        ),
        softServicesOptions: res?.ASSETTYPELIST?.filter(
          (item: any) => item?.ASSETTYPE === "N"
        ),
      });
      if (res?.FLAG === 1) {
        if (props?.selectedData?.ASSETTYPE_ID || dataId?.ASSETTYPE_ID) {
          await getTaskDetailsList();
        }
      }
    } catch (error) { }
  };

  const setPushList = (task_list: any) => {
    var isempty: boolean = false;
    for (let i = 0; i < task_list.length; i++) {

      if (task_list[i]?.TASK_NAME === "" || task_list[i]?.TASK_NAME === undefined) {
        toast.error("Please fill task name")
        isempty = true;
      }

    }

    if (!isempty) {

      const newField: any = {
        TASK_ID: 0,
        TASK_NAME: ""
      };
      append(newField);

    }

  }

  const taskList = watch('TASK_LIST');

  const handelDelete = async (selectedData: any, index: any) => {
    try {
      if (selectedData?.TASK_ID !== 0) {
        const payLoadFinal = {
          TASK_ID: selectedData?.TASK_ID,
          PARA: { para1: `${selectedData?.TASK_NAME}`, para2: "Deleted" },
        };

        const res = await callPostAPI(
          ENDPOINTS.DELETE_TASKMASTER,
          payLoadFinal
        );
        if (res?.FLAG === true) {
          toast.success(res?.MSG);
          await getTaskDetailsList();
        } else {
          toast.error(res?.MSG)
        }
      } else {
        const data: any = taskList.filter((task: any, i: any) => i !== index);
        //  setTaskOptions(data);
        setValue("TASK_LIST", data)
      }
    } catch (error: any) {
      toast?.error(error);
    }
  };

  const getTaskDetailsList = async () => {
    try {
      const payload = {
        ASSETTYPE_ID: search === "?edit=" ? dataId?.ASSETTYPE_ID : "",
      };
      const response = await callPostAPI(
        ENDPOINTS.GET_TASK_MASTER_DETAILS,
        payload,
        props?.FUNCTION_CODE
      );

      // setTaskOptions(response?.TASKLIST);
      setValue("TASK_LIST", response?.TASKLIST)
    } catch (error: any) { }
  };

  const assetType: any = watch('ASSEST_TYPE')
  const onSubmit = useCallback(async (payload: any) => {
    if (IsSubmit) return true
    setIsSubmit(true)
    const uniq = taskList.map((name: any) => {
      return {
        count: 1,
        name: name?.TASK_NAME
      };
    }).reduce((result: any, b) => {
      result[b.name] = (result[b.name] || 0) + b.count;
      return result;
    }, {});
    const duplicates = Object.keys(uniq).filter((a: any) => uniq[a] > 1);

    if (duplicates?.length > 0) {
      toast?.error("Task name already exist")
      setIsSubmit(false)
      return
    }
    try {
      const TASKOPTION_LIST: any = taskList?.map((task: any, index: any) => {
        return {
          TASK_ID: task?.TASK_ID,
          TASK_NAME: task?.TASK_NAME,
          SEQ_NO: index + 1,
        };
      });
      payload.TASK_LIST = TASKOPTION_LIST;

      const payLoadFinal = {
        ASSEST_TYPE: assetType?.key ? assetType?.key : assetType,
        ASSETTYPE_ID: payload?.ASSEST_TYPE_NAME?.ASSETTYPE_ID,
        MODE: payload.MODE,
        PARA: payload.PARA,
        TASK_LIST: TASKOPTION_LIST,
      };

      if (payload?.TASK_LIST?.length > 0) {
        const res = await callPostAPI(ENDPOINTS.saveTaskMaster, payLoadFinal);
        if (res?.FLAG === true) {
          toast?.success(res?.MSG);
          props?.getAPI();
          // setIsSubmit(false)
          props?.isClick();
        } else if (res?.FLAG === false) {
          // setIsSubmit(false)
          toast?.error(res?.MSG);
        }
      } else {
        toast.error("Please add at least on task")
      }
    } catch (error: any) {

      toast?.error(error);
    } finally {
      setIsSubmit(false)
    }
  }, [IsSubmit, search, props, toast, taskList]);
  useEffect(() => {
    (async function () {
      await getOptions();
      await saveTracker(currentMenu)
    })()
  }, [selected]);



  const onError: SubmitErrorHandler<FormData> = () => {
    toast.error(t("Please fill the required fields."))
  };

  return (
    <section className="w-full">
      <form onSubmit={handleSubmit(onSubmit, onError)}>
        <FormHeader
          headerName={props?.headerName}
          isSelected={props?.selectedData ? true : false}
          isClick={props?.isClick}
          IsSubmit={IsSubmit}
        />
        <Card className="mt-2">
          <div className="mt-1 grid grid-cols-1 gap-x-4 gap-y-4 md:grid-cols-5 lg:grid-cols-5">
            <Field
              controller={{
                name: "ASSEST_TYPE",
                control: control,
                render: ({ field }: any) => {
                  return (
                    <>
                      <Radio
                        {...register("ASSEST_TYPE", {
                          required: t("Please fill the required fields."),
                        })}
                        labelHead="Type"
                        disabled={
                          search === "?edit="
                            ? true
                            : false
                        }
                        options={assestTypeLabel}
                        selectedData={dataId?.ASSETTYPE || "A"}
                        setValue={setValue}
                        {...field}
                      />
                    </>
                  );
                },
              }}
              error={errors?.ASSEST_TYPE?.message}
            />
            <div className="col-span-2">
              <Field
                controller={{
                  name: "ASSEST_TYPE_NAME",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <Select
                        options={
                          assestType?.key === "A"
                            ? options?.assestOptions
                            : options?.softServicesOptions
                        }
                        {...register("ASSEST_TYPE_NAME", {
                          required: t("Please fill the required fields."),
                        })}
                        label={`${assestType?.key === "A" ? "Equipment " : "Soft Service"
                          } Type `}
                        optionLabel="ASSETTYPE_NAME"
                        disabled={search === "?edit=" ? true : false}
                        require={true}
                        findKey={"ASSETTYPE_ID"}
                        selectedData={search === "?edit=" ? dataId?.ASSETTYPE_ID : ""}
                        invalid={errors.ASSEST_TYPE_NAME}
                        setValue={setValue}
                        {...field}
                      />
                    );
                  },
                }}
                error={errors?.ASSEST_TYPE_NAME?.message}
              />
            </div>


          </div>
        </Card>
        <Card className="mt-2">
          <div >
            <div className="flex flex-wrap gap-2">
              <label
                className="Text_Secondary Input_Label col-span-2 me-2"
              >
                {t(`Task Name`)}
                <span className="text-red-600"> *</span>
              </label>
              <Button
                type="button"
                icon="pi pi-plus"
                label="Add Task"
                text
                className="Text_Main addListButton"
                onClick={() => setPushList(taskList)}
              />

            </div>

            {fields.map((item, index) => (
              <>
                <div key={item.id} className=" grid grid-cols-1 gap-x-4 gap-y-4 md:grid-cols-3 md:mt-2 lg:grid-cols-3">
                  <div className="col-span-2">
                    <Field
                      controller={{
                        name: `TASK_LIST.${index}.TASK_NAME`,
                        control: control,
                        render: ({ field }: any) => {
                          return (
                            <InputField
                              {...register(
                                `TASK_LIST.${index}.TASK_NAME` as any,
                                {
                                  required: t("Please fill the required fields."),
                                  validate: value => value.trim() !== "" || t("Please fill the required fields.")
                                }
                              )}

                              // label="Task Name"
                              require={true}
                              invalid={errors.TASK_LIST?.[index]?.TASK_NAME}
                              setValue={setValue}

                              {...field}
                            />
                          );
                        },
                      }}
                    />

                  </div>

                  {index > 0 && (<Button
                    type="button"
                    icon="pi pi-trash"
                    onClick={() => handelDelete(item, index)}
                  />)}
                </div>
              </>
            ))}
          </div>
        </Card>
      </form>
    </section >
  );
};

export default TaskMasterForm;
