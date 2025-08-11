import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import "../Button/Button.css";
import InputField from "../../components/Input/Input";
import Field from "../../components/Field";
const InputDialogBox = (props: any) => {
  const [visible, setVisible] = useState<boolean>(false);
  const setInputDialogVisible = (e: any) => {
    setVisible(!visible);
    //props?.setValue(props?.visible)
  };
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      INPUTNAME: "",
    },
  });
  const handleInputDialogBox = () => {
    setVisible(!visible);
  };

  return (
    <>
      <Button
        className="dialogButton"
        label=""
        icon="pi pi-plus"
        onClick={() => setInputDialogVisible(true)}
      />
      <Dialog
        header={props?.inputName + "Master"}
        visible={visible}
        style={{ width: "30vw" }}
        onHide={() => setInputDialogVisible(false)}
      >
        <div>
          <Field
            controller={{
              name: "INPUTNAME",
              control: control,
              render: ({ field }: any) => {
                return (
                  <InputField
                    {...register("INPUTNAME")}
                    label={props?.inputName}
                    invalid={errors.INPUTNAME}
                    {...field}
                  />
                );
              },
            }}
            error={errors?.INPUTNAME?.message}
          />
        </div>
        <div className="flex justify-center mt-2">
          <Button
            type="button"
            className="Primary_Button  w-28 me-2"
            label={"Add"}
            onClick={handleInputDialogBox}
          />
          <Button
            className="Secondary_Button w-28 "
            label={"Cancel"}
            onClick={setInputDialogVisible}
          />
        </div>
      </Dialog>
    </>
  );
};

export default InputDialogBox;
