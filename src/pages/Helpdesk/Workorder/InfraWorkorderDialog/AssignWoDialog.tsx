import React, { useRef, useState } from "react";
import Button from "../../../../components/Button/Button";
import { Dialog } from "primereact/dialog";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Dropdown } from "primereact/dropdown";
import success from "../../../../assest/images/success.gif";
import { AutoComplete } from "primereact/autocomplete";

const AssignWoDialog = ({
  header,
  cssClass,
  AssigneeList,
  paragraph,
  getOptions,
  TECH_ID,
  setTechList,
  assigneeTechList,
  setAssigneeTechList,
  updateWoDetails,
  selectedTechList,
  setSelectedTechList,
  TEAM_NAME,
  setaddAssigneeAction,
  setData,
  technicianList,
}: any) => {
  const [visible, setVisible] = useState<boolean>(false);
  const [visibleConfirmDialog, setVisibleConfirmDialog] =
    useState<boolean>(false);
  const [visibleSucessDialog, setVisibleSuccessDialog] =
    useState<boolean>(false);
  const [selectedDetails, setSelectedDetails] = useState<any>([]);
  const [roles, setRoles] = useState<any>([]);
  const [loginName, setLoginName] = useState<any>([]);
  const [ptwDelete, setPtwDelete] = useState<any>(false);
  const [visibleChangePTWDialog, setVisibleChangePTWDialog] =
    useState<boolean>(false);
  const [ptwAssigneeStatus, setPTWAssigneeStatus] = useState<any | null>(false);

  const [selectedUser, setSelectedUser] = useState(null);
  const [filteredItems, setFilteredItems] = useState([]);
  const autoCompleteRef = useRef<AutoComplete>(null);
  const [techToRemove, setTechToRemove] = useState<any>([]);

  const OpenAssignPopUp = () => {
    setSelectedDetails(selectedTechList);
    setVisible(!visible);
    let assignee: any = {
      label: "Assignee",
      code: "A",
    };
    let ptw: any = {
      label: "PTW Holder",
      code: "P",
    };

    if (header === "Assign") {
      const updatedArray = technicianList.map((item: any) => {
        const newAssignRole = item.ASSING_ROLE === "P" ? assignee : assignee;
        return {
          ...item,
          ASSING_ROLE: "A",
          sub_roles: newAssignRole,
        };
      });

      setAssigneeTechList(updatedArray);
      setValue("TECH_ID1", updatedArray || []);
    }
    if (header === "Edit" || header === "Edit Assign") {
      const updatedArray = technicianList.map((item: any) => {
        const newAssignRole = item.ASSING_ROLE === "P" ? ptw : assignee;
        return {
          ...item,
          sub_roles: newAssignRole,
        };
      });

      setAssigneeTechList(updatedArray);

      setValue("TECH_ID1", assigneeTechList || []);
    }
  };

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      TECH_ID1: [],
      ASSIGN_SUBROLE: [],
    },

    mode: "onSubmit",
  });
  const items = [
    {
      label: "Assignee",
      code: "A",
    },
    {
      label: "PTW Holder",
      code: "P",
    },
  ];

  const CloseAssignPopUp = () => {
    setValue("TECH_ID1", selectedDetails || []);
    setAssigneeTechList([]);
    setVisible(!visible);
    setSelectedTechList(technicianList);
  };

  const saveAssignee = async () => {
    if (!assigneeTechList || assigneeTechList?.length === 0) {
      toast?.error("Please fill the required field");
    } else {
      if (header === "Assign") {
        setaddAssigneeAction(101);
        setData("ACTION_ID", 101);

        await updateWoDetails();
      } else if (header === "Edit") {
        setData("ACTION_ID", 106);
        setaddAssigneeAction(106);
        await updateWoDetails();
        setVisible(false);
      } else if (header === "Edit Assign") {
        setData("ACTION_ID", 105);
        setaddAssigneeAction(105);
        await updateWoDetails();
        setVisible(false);
      }
    }
  };

  const handleAssigneeChange = (index: number, value: any) => {
    if (value.code === "P") {
      setPTWAssigneeStatus(true);
    }
    setAssigneeTechList((prevTechWatch: any) =>
      prevTechWatch.map((tech: any, i: any) =>
        i === index
          ? {
              ...tech,
              ASSING_ROLE: value?.code,
              sub_roles: value,
            }
          : tech
      )
    );
  };

  const RemoveAssigneeChange = (tech: any) => {
    setRoles(tech?.ASSING_ROLE);
    setLoginName(tech.LOGIN_NAME);
    setVisibleConfirmDialog(true);
    setPtwDelete(tech?.ASSING_ROLE === "P" ? true : false);
    setTechToRemove(tech);
    setData("ACTION_ID", 106);
  };
  const RemoveAssigneeChangeList = (tech: any) => {
    let Data: any = assigneeTechList?.filter(
      (item: any) => item?.USER_ID !== tech?.USER_ID
    );
    setSelectedTechList(Data);
    setAssigneeTechList(Data);
    setValue("TECH_ID1", Data);
    setData("ACTION_ID", 106);
  };

  const CloseRemoveAssigneeChange = () => {
    setVisibleConfirmDialog(false);
  };
  const CloseChangePTW = () => {
    setVisibleChangePTWDialog(false);
  };

  const ShowSuccessPopup = async () => {
    debugger;
    if (!techToRemove || techToRemove?.length === 0) return;

    const updatedList = assigneeTechList?.filter(
      (item: any) => item?.USER_ID !== techToRemove?.USER_ID
    );

    setSelectedTechList(updatedList);
    setAssigneeTechList(updatedList);
    setValue("TECH_ID1", updatedList);
    setData("ACTION_ID", 106);
    setVisibleConfirmDialog(false);
    setVisibleChangePTWDialog(false);
    setVisibleConfirmDialog(false);
    setValue("TECH_ID1", selectedTechList);
    setTechToRemove([]);
  };
  const CloseSuccessPopup = () => {
    setVisibleSuccessDialog(false);
  };

  const search = (event: any) => {
    let filtered;
    const query = event.query.toLowerCase();
    if (!event.query.trim().length) {
      filtered = [...AssigneeList];
    } else {
      filtered = AssigneeList.filter((item: any) =>
        item.LOGIN_NAME.toLowerCase().includes(query)
      );
    }
    setFilteredItems(filtered);
  };

  const handlerChangeAssignee = (value: any) => {
    if (value !== null) {
      setAssigneeTechList((prevList: any[]) => {
        const alreadyExists = prevList.some(
          (item) => item.USER_ID === value.USER_ID
        );
        if (!alreadyExists) {
          return [...prevList, value];
        }
        return prevList;
      });
      setSelectedUser(null);
    }
  };

  const handleChange = (e: any) => {
    const value = e.value;
    setSelectedUser(e.value);
    if (value && typeof value === "object") {
      handlerChangeAssignee(e.value);
      setSelectedUser(null);
      setTimeout(() => {
        if (autoCompleteRef.current) {
          autoCompleteRef.current.getInput().blur();
        }
      }, 10);
    }
  };

  return (
    <>
      <Button
        type="button"
        label={header}
        className={cssClass}
        icon={header === "Edit" && "pi pi-pencil"}
        onClick={OpenAssignPopUp}
      />
      <Dialog
        visible={visible}
        style={{ width: "600px" }}
        onHide={CloseAssignPopUp}
      >
        <form>
          <div className="grid grid-cols-1 gap-3">
            <div>
              <h5 className="Text_Primary">Assign</h5>
            </div>
            <div>
              <label className="Text_Secondary Input_Label">Team</label>
              <p className="Text_Primary Alert_Title  ">{TEAM_NAME}</p>
            </div>
            {/* new code */}

            <div>
              <label className="Text_Secondary Input_Label">
                Assignee <span className="text-red-600"> *</span>
              </label>

              <div
                className="custom-dropdown-wrapper"
                style={{ position: "relative" }}
              >
                <AutoComplete
                  ref={autoCompleteRef}
                  value={selectedUser}
                  suggestions={filteredItems}
                  completeMethod={search}
                  field="LOGIN_NAME"
                  onChange={handleChange}
                  placeholder="Search Assignee"
                  forceSelection
                  onFocus={() => {
                    search({ query: "" });
                    autoCompleteRef.current?.show();
                  }}
                  onSelect={() => {
                    setSelectedUser(null);
                    setTimeout(() => {
                      if (autoCompleteRef.current) {
                        autoCompleteRef.current.getInput().blur();
                      }
                    }, 10);
                  }}
                />

                <i
                  className="pi pi-search custom-icon"
                  style={{
                    position: "absolute",
                    top: "50%",
                    right: "10px",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                    color: "#6b7280",
                  }}
                ></i>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 pt-6 border-b-2 border-gray-200 pb-9">
            <div className="ScrollViewAssigneeTab  mb-4 ">
              {assigneeTechList?.length > 0 && (
                <label className="Sub_Header_Text">SELECTED ASSIGNEES</label>
              )}

              {assigneeTechList?.length > 0 &&
                assigneeTechList?.map((tech: any, index: any) => {
                  const data = tech?.LOGIN_NAME?.split(" ");
                  const firstLetter = data[0]?.charAt(0) || " ";
                  const secondLetter = data[1]?.charAt(0) || " ";
                  const initials = firstLetter + secondLetter;
                  return (
                    <>
                      <div className="flex flex-wrap justify-between mt-3">
                        <div className="flex">
                          <div className="AvtarInitials">{initials}</div>
                          <div className="ml-2">
                            <label className="Text_Primary Input_Text">
                              {tech?.LOGIN_NAME}
                            </label>
                            <p className="Secondary_Primary Helper_Text">
                              {tech?.ROLE_NAME}
                            </p>
                          </div>
                        </div>
                        <div
                          className="assignDropdown flex flex-wrap gap-2 mb-1 mr-4"
                          key={index}
                        >
                          <Dropdown
                            name="ASSIGN_SUBROLE"
                            id={`ASSIGN_SUBROLE_${index}`}
                            value={tech?.sub_roles}
                            // }
                            checkmark={true}
                            onChange={(e: any) => {
                              handleAssigneeChange(index, e.value);
                            }}
                            options={items}
                            optionLabel="label"
                            placeholder="Select"
                            className=""
                            invalid
                          />
                          <div>
                            {header === "Assign" ? (
                              <>
                                <a>
                                  <i
                                    className="pi pi-times Open mt-3"
                                    onClick={(e: any) =>
                                      RemoveAssigneeChangeList(tech)
                                    }
                                  ></i>
                                </a>
                              </>
                            ) : (
                              <>
                                <a>
                                  <i
                                    className="pi pi-times Open mt-3"
                                    onClick={(e: any) =>
                                      RemoveAssigneeChange(tech)
                                    }
                                  ></i>
                                </a>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  );
                })}
            </div>
          </div>

          <div className="flex justify-end mt-6 gap-3">
            <Button
              name="Cancel"
              className="Cancel_Button"
              type="button"
              label={"Cancel"}
              onClick={() => CloseAssignPopUp()}
            />
            <Button
              name="Save"
              className="Primary_Button w-28 "
              type="submit"
              label={"Add"}
              onClick={saveAssignee}
            />
          </div>
        </form>
      </Dialog>

      <Dialog
        header=""
        visible={visibleConfirmDialog}
        style={{ width: "550px" }}
        className="dialogBoxStyle"
        onHide={() => CloseRemoveAssigneeChange()}
      >
        <form>
          <div className="grid justify-items-center">
            <div className="">
              {roles === "P" ? (
                <>
                  <h6 className="Text_Primary text-center mb-3">
                    Remove PTW Holder?
                  </h6>
                  <p className="Input_Text text-center">
                    You're about to remove {loginName} from this work order.
                    They'll be unassigned and no longer responsible. Proceed
                    with removal?
                  </p>
                </>
              ) : (
                <>
                  <h6 className="Text_Primary text-center mb-3">
                    Remove Assignee?
                  </h6>
                  <p className="Input_Text text-center">
                    You're about to remove {loginName} from this work order.
                    They'll be unassigned and no longer responsible. Proceed
                    with removal?
                  </p>
                </>
              )}
            </div>
            <div className="flex justify-end mt-[35px] gap-3">
              <Button
                name="Cancel"
                className="Cancel_Button "
                type="button"
                label={"Cancel"}
                onClick={() => CloseRemoveAssigneeChange()}
              />
              <Button
                name="Confirm"
                className="Primary_Button"
                type="button"
                // label={roles === 'P' ? "Confirm & Restart Approval" : "Confirm"}
                label="Confirm"
                onClick={() => ShowSuccessPopup()}
              />

              <Dialog
                header=""
                visible={visibleSucessDialog}
                style={{ width: "550px" }}
                className="dialogBoxStyle"
                onHide={() => CloseSuccessPopup()}
              >
                <form>
                  <div className="grid justify-items-center mb-3">
                    <div className="">
                      {<img src={success} alt="" height={60} width={60} />}
                    </div>
                    <div className="mt-3 ">
                      <h6 className="Text_Primary text-center mb-3">
                        Success!
                      </h6>
                      {roles === "P" ? (
                        <>
                          <p className="Input_Text text-center">
                            The PTW Holder has been changed, and the approval
                            process has restarted.
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="Input_Text text-center">
                            This Assignee has been updated successfully.
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </form>
              </Dialog>
            </div>
          </div>
        </form>
      </Dialog>

      <Dialog
        header=""
        visible={visibleChangePTWDialog}
        style={{ width: "550px" }}
        className="dialogBoxStyle"
        onHide={() => CloseChangePTW()}
      >
        <form>
          <div className="grid justify-items-center">
            <div className="">
              <>
                <h6 className="Text_Primary text-center mb-3">
                  Confirm PTW Holder Change
                </h6>
                <p className="Input_Text text-center">
                  You are about to change the PTW Holder to {loginName}. This
                  will restart the approval process and reset the current work
                  progress. Do you want to proceed?
                </p>
              </>
            </div>
            <div className="flex justify-end mt-[35px] gap-3">
              <Button
                name="Cancel"
                className="Cancel_Button "
                type="button"
                label={"Cancel"}
                onClick={() => CloseChangePTW()}
              />
              <Button
                name="Confirm"
                className="Primary_Button"
                type="button"
                // label={roles === 'P' ? "Confirm & Restart Approval" : "Confirm"}
                label="Confirm & Restart Approval"
                onClick={() => ShowSuccessPopup()}
              />
            </div>
          </div>
        </form>
      </Dialog>
    </>
  );
};

export default AssignWoDialog;
