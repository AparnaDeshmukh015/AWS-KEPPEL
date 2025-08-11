import React, { memo, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import deleteIcon from "../../assest/images/icon-delete.png";
import "./DialogBox.css";

const DialogBox = (props: any) => {
  const [visible, setVisible] = useState<boolean>(false);
  const [filteredList, setFilteredList] = useState<string | undefined>();
  // let filteredList: string[] = [];
  const setDialogVisible = () => {
    setVisible(!visible);
    const obj = props?.data;
    const keys = Object.keys(obj);
    const filteredListData = keys.filter((e: any) => e.includes("NAME"));
    for (const [key, value] of Object.entries(obj)) {
      if (filteredListData[0] === key) {
        setFilteredList(value?.toString());
      }
    }
  };
  const handleDelete = () => {
    props?.handelDelete(props?.data);
    setVisible(!visible);
  };

  return (
    <>
      <Button
        type="button"
        label=""
        icon="pi pi-trash"
        className="deleteButton"
        onClick={() => setDialogVisible()}
      />
      <Dialog
      // blockScroll={true}
        header={props?.data.MAKE_NAME}
        visible={visible}
        style={{ width: "20vw" }}
        onHide={() => setDialogVisible()}
      >
        <div className="grid justify-items-center">
          <div className="">
            <img src={deleteIcon} alt="" />
          </div>
          <div className="mt-2 ">
            <h6 className="Text_Primary">Are you sure you want to delete</h6>
            <h6 className="Text_Primary text-center mb-2">
              {filteredList?.toString()}
            </h6>
            <p className="Input_Text text-center">All changes will be lost </p>
            <div className="flex justify-center mt-4">
              <Button
                type="button"
                className="Primary_Button  w-28 me-2"
                label={"Confirm"}
                onClick={handleDelete}
              />
              <Button
                className="Secondary_Button w-28 "
                label={"Cancel"}
                onClick={setDialogVisible}
              />
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default memo(DialogBox);
