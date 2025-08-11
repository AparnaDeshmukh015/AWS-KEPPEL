import React, { useEffect, useState } from "react";
import Button from "../../../../components/Button/Button";
import { Dialog } from "primereact/dialog";
import { useTranslation } from "react-i18next";
import Field from "../../../../components/Field";
import MultiSelects from "../../../../components/MultiSelects/MultiSelects";
import { Chip } from "primereact/chip";
import noDataIcon from "../../../../assest/images/nodatafound.png";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { SplitButton } from 'primereact/splitbutton';
import { Dropdown } from "primereact/dropdown";
import SuccessDialog from "./SuccessDialog";
import success from "../../../../assest/images/success.gif";
import Select from "../../../../components/Dropdown/Dropdown";
import { AutoComplete, AutoCompleteCompleteEvent } from "primereact/autocomplete";


interface Assignees {
  name: string;
  code: string;
}
const AssignWoDialog_old = ({
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
  const [visibleConfirmDialog, setVisibleConfirmDialog] = useState<boolean>(false);
  const [visibleSucessDialog, setVisibleSuccessDialog] = useState<boolean>(false);
  const [selectedDetails, setSelectedDetails] = useState<any>([]);
  const [selectedDetailsAssigne, setselectedDetailsAssigne] = useState<any>([]);
  const [roles, setRoles] = useState<any>([]);
  const [loginName, setLoginName] = useState<any>([]);
  const [ptwDelete, setPtwDelete] = useState<any>(false)
  const [visibleChangePTWDialog, setVisibleChangePTWDialog] = useState<boolean>(false);
  const[ptwAssigneeStatus, setPTWAssigneeStatus]=useState<any|null>(false)
  const [selectedAssignee, setSelectedAssignee] = useState(null);
  const [AssignValue, setAssignValue] = useState<string>('');
  const OpenAssignPopUp = () => {

    setSelectedDetails(selectedTechList)
    setVisible(!visible);
    // setValue("TECH_ID1", selectedTechList || []);
    // setSelectedTechList(technicianList)
    let assignee: any = {
      label: 'Assignee',
      code: "A",
    }
    let ptw: any = {
      label: 'PTW Holder',
      code: "P",
    }

    if (header === "Assign") {
      const updatedArray = technicianList.map((item: any) => {
        const newAssignRole = assignee;
        return {
          ...item,
          sub_roles: newAssignRole,

        };
      });

      setAssigneeTechList(updatedArray)
      setValue("TECH_ID1", assigneeTechList || []);
    }
    if (header === "Edit" || header === "Edit Assign") {
      const updatedArray = technicianList.map((item: any) => {
        const newAssignRole = item.ASSING_ROLE === "P" ? ptw : assignee;
        return {
          ...item,
          sub_roles: newAssignRole,
        };
      });

      setAssigneeTechList(updatedArray)

      setValue("TECH_ID1", assigneeTechList || []);
    }
  };

  useEffect(() => {
    const selectedassignee = assigneeTechList?.filter((item: any) => item?.SELECT === 1)
   setselectedDetailsAssigne(selectedassignee)
    setValue("TECH_ID1", selectedassignee || []);
  }, [assigneeTechList, visible])

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
      label: 'Assignee',
      code: "A",
    }, {
      label: 'PTW Holder',
      code: "P",
    },]
  let TechWatch: any = watch("TECH_ID1");

  const CloseAssignPopUp = () => {
    setValue("TECH_ID1", selectedDetails || []);
    setAssigneeTechList([])
    //setSelectedselectedSubRole([])
    setVisible(!visible);
    setSelectedTechList(technicianList)
  };
  // let techData1: any
  // let techData1: any = [];
  // const handleRemove = (removeTechnician: any) => {
  //   const updatedTechList = selectedTechList?.filter(
  //     (f: any) => (f.USER_ID !== removeTechnician?.USER_ID)
  //   );

  //   setValue("TECH_ID1", techData1);
  //   setSelectedTechList(updatedTechList)
  //   setTechList(AssigneeList);
  // };


  const saveAssignee = async () => {
  
    if (!assigneeTechList || assigneeTechList?.length === 0) {
      toast?.error("Please fill the required field")
    } else {
   
      const roleExists = assigneeTechList?.filter((user: any) => user?.ASSING_ROLE === "P").length;
      
      if (roleExists === 1) {
      
        if (header === "Assign") {
          setaddAssigneeAction(101);
          setData('ACTION_ID', 101)
      
          await updateWoDetails()
        }
        else if (header === "Edit") {
          setData('ACTION_ID', 106)
          setaddAssigneeAction(106);
          // setVisibleChangePTWDialog(true);
          if(ptwAssigneeStatus === true) {
          setVisible(false);

          setVisibleChangePTWDialog(true);
          setPTWAssigneeStatus(false)
          }
          else {
            setVisible(false);
            await updateWoDetails()
          }
        }
        else if (header === "Edit Assign") {
          setData('ACTION_ID', 105)
          setaddAssigneeAction(105);

        }

      } else if (roleExists === 0) {
        toast?.error("Please select at least one PTW Holder")
      } else if (roleExists > 1) { 
        toast?.error("Please select only one PTW Holder")
      } 
      else if(roleExists === 1 && header === "Edit"){
        setVisible(false);
        setVisibleChangePTWDialog(true);
      }
    }

  }



  const handleAssigneeChange = (index: number, value: any) => {
    if(value.code === "P")
    {
      setPTWAssigneeStatus(true)
    }
    setAssigneeTechList((prevTechWatch: any) =>
      prevTechWatch.map((tech: any, i: any) =>
        i === index ? {
          ...tech,
          ASSING_ROLE: value?.code,
          sub_roles: value
        } : tech
      )
    );
    // const updatedTechWatch: any = assigneeTechList?.map((tech: any, i: any) => {
    //   if (index === i) {
    //     return {
    //       ...tech,
    //       ASSING_ROLE: value?.code,
    //       sub_roles: value,
    //     };
    //   }
    //   return tech;
    // });

    //  setValue(techData1, updatedTechWatch);
    //   TechWatch = updatedTechWatch;
    setTechList((prevTechWatch: any) =>
      prevTechWatch.map((tech: any, i: any) =>
        i === index ? {
          ...tech, sub_roles: value,
          ASSING_ROLE: value?.code,
        } : tech
      )
    );
    // setTechnicianList((prevTechWatch:any) =>
    //   prevTechWatch.map((tech:any, i:any) =>
    //     i === index ? { ...tech, sub_roles: value,
    //       ASSING_ROLE:value?.code,
    //      } : tech
    //   )
    // );
  };

  const RemoveAssigneeChange = (tech: any) => {

    setRoles(tech?.ASSING_ROLE)
    setLoginName(tech.LOGIN_NAME)
    //   setSelectedselectedSubRole(value)
    setVisibleConfirmDialog(true);
    setPtwDelete(tech?.ASSING_ROLE === "P" ? true : false)
    let Data: any = assigneeTechList?.filter((item: any) => item?.USER_ID !== tech?.USER_ID);
    setSelectedTechList(Data)
    setAssigneeTechList(Data)
    setValue("TECH_ID1", Data)
    setVisible(false);
  };
  const RemoveAssigneeChangeList = (tech: any) => {

    let Data: any = assigneeTechList?.filter((item: any) => item?.USER_ID !== tech?.USER_ID);
    setSelectedTechList(Data)
    setAssigneeTechList(Data)
    setValue("TECH_ID1", Data)
  };


  const CloseRemoveAssigneeChange = () => {
    setVisibleConfirmDialog(false);
  };
  const CloseChangePTW = () => {
    setVisibleChangePTWDialog(false);
  };


  const ShowSuccessPopup = async() => {
    setVisibleChangePTWDialog(false);
    setVisibleConfirmDialog(false);
    setValue("TECH_ID1", selectedTechList)
    await updateWoDetails()
   
    
    // setVisible(true);
   
  };
  const CloseSuccessPopup = () => {
    setVisibleSuccessDialog(false);
  };

  const [filteredItems, setFilteredItems] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedAssigneeUser, setSelectedAssigneeUser] = useState([]);
    const [ASSIGN_LIST, SetASSIGN_LIST] = useState([]);
    const SAMPEL_ASSIGN_LIST:any = [];



    const handlerChangeAssignee =(e:any)=>{
      setSelectedUser(null)
      SAMPEL_ASSIGN_LIST.push(e)
      SetASSIGN_LIST(SAMPEL_ASSIGN_LIST)
    }

  const search = (event:any) => {
    let filtered;
    let query = event.query.toLowerCase();
    if (!event.query.trim().length) {
      filtered = [...AssigneeList];
    }
    else {
       filtered = AssigneeList.filter((item:any) => item.LOGIN_NAME.toLowerCase().includes(query));
    }
        setFilteredItems(filtered);
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
            <div>
              <Field
                controller={{
                  name: "TECH_ID1",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <MultiSelects
                        options={AssigneeList}
                        {...register("TECH_ID1", {
                          required: "Please fill the required fields",
                          onChange: (event) => {

                            let ptw: any = {
                              label: 'PTW Holder',
                              code: 'P'
                            };
                            let assignee1: any = {
                              label: 'Assignee',
                              code: 'A'
                            };
                            const techData: any = event?.target?.value;
                            const UpdatedData: any = techData?.map((user: any) => ({
                              ...user,
                              sub_roles: ptwDelete === true ? assignee1 : (user?.ASSING_ROLE === "P" ? ptw : assignee1),
                              ASSING_ROLE: user?.ASSING_ROLE === null ? "A" : user?.ASSING_ROLE,
                              SELECT: 1,
                            }));

                            setAssigneeTechList(UpdatedData);
                          },
                        })}
                        label="Assignee"
                        optionLabel="LOGIN_NAME"
                        require={true}
                        findKey={"USER_ID"}
                        selectedData={selectedDetailsAssigne}
                        setValue={setValue}
                        invalid={errors?.TECH_ID1}
                        {...field}
                      />
                    );
                  },
                }}
              />

            </div>



            {/* new code */}

            <div className="custom-dropdown-wrapper" style={{ position: 'relative' }}>
            <AutoComplete
                field="LOGIN_NAME"
                value={selectedUser}
                suggestions={filteredItems}
                completeMethod={search}
                onChange={(e:any) =>
                {
                  setSelectedUser(e.value)
                  handlerChangeAssignee(e.value)
                 }}
                //  onClick={(e:any) => handlerChangeAssignee(e.value)}
                placeholder="Search Assignee"
            />

                {/* Custom Search Icon */}
                <i className="pi pi-search custom-icon" style={{
                    position: 'absolute',
                    top: '50%',
                    right: '10px',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                    color: '#6b7280' // Tailwind slate-500 color for reference
                }}></i>
            </div>
            <div></div>
          </div>

          <div className="grid grid-cols-1 pt-6 pb-9">
              <div className="ScrollViewAssigneeTab border-b-2 mb-4 border-gray-200">

              {assigneeTechList?.length > 0 && <label className="Sub_Header_Text">SELECTED ASSIGNEES</label>}
              
               {assigneeTechList?.map((tech: any, index: any) => {
                const data = tech?.LOGIN_NAME?.split(' ');
                const firstLetter = data[0]?.charAt(0) || " ";
                const secondLetter = data[1]?.charAt(0) || " ";
                const initials = firstLetter + secondLetter
                return (
                  <>
                    <div className="flex flex-wrap justify-between mt-3">
                      <div className="flex">
                        <div className="AvtarInitials">
                        {/* {initials} */}
                        </div>
                        <div className="ml-2">
                          <label className="Text_Primary Input_Text">{tech?.LOGIN_NAME}</label>
                          <p className="Secondary_Primary Helper_Text">{TEAM_NAME}</p>
                        </div>
                      </div>
                      <div className="assignDropdown flex flex-wrap gap-2 mb-1" key={index}>
                        <Dropdown
                          name="ASSIGN_SUBROLE"
                          id={`ASSIGN_SUBROLE_${index}`}
                          value={tech?.sub_roles}
                          // }
                          checkmark={true}
                          onChange={(e: any) => {
                            {
                            handleAssigneeChange(index, e.value);
                            }
                           
                          }
                          }
                          options={items} optionLabel="label"
                          placeholder="Select" className=""
                          invalid
                        />
                        <div>
                          {header === "Assign" ? (
                            <>
                              <a><i className="pi pi-times Open mt-3"
                              onClick={(e: any) =>
                              RemoveAssigneeChangeList(tech)
                            }
                          ></i></a>
                            </>
                          ):(
                            <>
                            <a><i className="pi pi-times Open mt-3"
                            onClick={(e: any) =>
                              RemoveAssigneeChange(tech)
                            }
                          ></i></a>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )
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
              {roles === 'P' ? (
                 <>
                 <h6 className="Text_Primary text-center mb-3">Remove PTW Holder?</h6>
                 <p className="Input_Text text-center"> {loginName} is the current PTW Holder.
                    Removing them will revoke their role and reset the approval process. Proceed with removal?</p>
               </>
              ) : (
                <>
                  <h6 className="Text_Primary text-center mb-3">Remove Assignee?</h6>
                  <p className="Input_Text text-center">You're about to remove {loginName} from this work order. They'll be unassigned and no longer responsible. Proceed with removal?</p>
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
                label= "Confirm"
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
                      {roles === 'P' ? (
                        <>
                          <p className="Input_Text text-center">The PTW Holder has been changed, and the approval process has restarted.</p>
                        </>
                      ) : (
                        <>
                          <p className="Input_Text text-center">This Assignee has been updated successfully.</p>
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
                 <h6 className="Text_Primary text-center mb-3">Confirm PTW Holder Change</h6>
                 <p className="Input_Text text-center">You are about to change the PTW Holder to Jarvis Toh. This will restart the
                   approval process and reset the current work progress. Do you want to proceed?</p>
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
                label= "Confirm & Restart Approval"
                onClick={() => ShowSuccessPopup()}
              />

            </div>
          </div>
        </form>
      </Dialog>
    </>
  );
};

export default AssignWoDialog_old;
