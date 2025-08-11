import { useTranslation } from "react-i18next";
// import { useFieldArray } from "react-hook-form";
import { useEffect} from "react";
import { Checkbox } from "primereact/checkbox";

const TaskAndDoc = ({
  setValue,
  // watchAll,
  // register,
  // control,
  tasklistOptions,
  // selectedData,
  // taskList,
  disabled,
  AccessKey = ''
}: any) => {
  // const {fields }: any = useFieldArray({
  //   name: "SCHEDULER.SCHEDULE_TASK_D",
  //   control,
  // });
  const { t } = useTranslation();
  //const [tasklist, setTasklistOptions] = useState<any | null>([]);

  
  useEffect(() => {
    if (AccessKey === 'Equipment') {
      const updatedTasklistOptions: any = tasklistOptions.filter(
        (task: any) => task.isChecked === true
      );
     // setTasklistOptions(updatedTasklistOptions);
      setValue("SCHEDULER.SCHEDULE_TASK_D", updatedTasklistOptions);
    }


  }, []);

  // Handle change event
  const onTaskChange = (e: any) => {
    const updatedTasklistOptions = tasklistOptions.map((task: any) => {
      if (task.TASK_ID === e.value) {
        task.isChecked = e.checked;
      }
      return task;
    });

  //  setTasklistOptions(updatedTasklistOptions);
    setValue("SCHEDULER.SCHEDULE_TASK_D", updatedTasklistOptions);
  };



  return (
    <>
      {tasklistOptions?.length !== 0 && (
        <div className="">
          <h6 className=" Text_Primary mb-2" style={{ fontSize: "18px" }}>
            {t("Task Details")}
          </h6>

          <div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3 lg:grid-cols-3">
              {tasklistOptions &&
                tasklistOptions.map((category: any, index: any) => {
                  return (
                    <div key={index} className="flex align-items-center">
                      <Checkbox
                        inputId={category.TASK_ID.toString()}
                        value={category.TASK_ID}
                        onChange={onTaskChange}
                        disabled={disabled === true ? true : false}
                        checked={category.isChecked}
                      />
                      <label htmlFor={category.TASK_NAME} className="ml-2">
                        {category.TASK_NAME}
                      </label>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TaskAndDoc;
