import { useEffect, useState } from "react";
import { Sidebar } from "primereact/sidebar";
import Buttons from "../../../../components/Button/Button";
import "../../../../components/Button/Button.css";
import AssignWoDialog from "./AssignWoDialog";

import ProceedPTWDialog from "./ProceedPTWDialog";
import DeclinePTWDialog from "./DeclinePTWDialog";
import PTWApprovalDialog from "./PTWApprovalDialog";
import AddResolutionDialog from "./AddResolutionDialog";
import SuccessDialog from "./SuccessDialog";
import { formateDate } from "../../../../utils/constants";
const InfraSidebarVisibal = ({
  header,
  control,
  setValue,
  headerTemplate,
  MATERIAL_LIST,
  PART_LIST,
  subStatus,
  ASSIGNTECHLIST,
  WORKORDER_DETAILS,
  getOptions,
  watch,
  register,
  btnText,
  errors,
  Actioncode,
  updateWOStatusInfra,
  MapButtons,
  selectedDetails,
  WOAcativeList,
  //for assignee edit 
  AssigneeList,
  setTechList,
  assigneeTechList,
  setAssigneeTechList,
  setSelectedTechList,
  updateWoDetails,
  selectedTechList,
  TEAM_NAME,
  setaddAssigneeAction,
  docOption,
  assigneeActionCode,
  technicianList,
  setTestingOnHold
}: any) => {

  const [sidebarVisible, setSidebarVisible] = useState<boolean>(false);
  const REMARKS = watch("REMARKS");
  // const [selectedDetails, setSelectedDetails] = useState<any>([]);
  console.log(Actioncode, 'Actioncode111')
  const reviewReassignRequest = () => {
    setSidebarVisible(!sidebarVisible);
  };

  const CloseSidebarVisible = () => {
    setSidebarVisible(!sidebarVisible);
  };


  const customHeader = (
    <>
      <div className=" gap-2">
        <p className="Helper_Text Menu_Active">
          {" "}
          {[113, 114, 115, 118, 120, 121, 141, 142].some((num) =>
            MapButtons?.includes(num)
          )
            ? "Work Order /" : selectedDetails?.PREVIOUS_ACTION === 121 || selectedDetails?.PREVIOUS_ACTION === 120 || selectedDetails?.PREVIOUS_ACTION === 113 ? "Work Order /"
              : [132, 148].some((num) => MapButtons?.includes(num))
                ? "Work Order / Resolution"
                : (selectedDetails?.PREVIOUS_ACTION === 140 || selectedDetails?.PREVIOUS_ACTION === 128 || selectedDetails?.PREVIOUS_ACTION === 142) ? "Work Order"
                  : "Redirect /"}{" "}
        </p>
        <h6 className="sidebarHeaderText mb-2">
          {[141, 142].some((num) => MapButtons?.includes(num)) || selectedDetails?.PREVIOUS_ACTION === 125
            ? "Normalize to Test"
            : [132, 148].some((num) => MapButtons?.includes(num))
              ? "Edits Required"
              : [113, 114, 115].some((num) => MapButtons?.includes(num))
                ? "PTW Approval Request"
                : [118].some((num) => MapButtons?.includes(num))
                  ? " Suspension Approval Request"
                  : [120, 121].some((num) => MapButtons?.includes(num)) || (selectedDetails?.PREVIOUS_ACTION === 120 || selectedDetails?.PREVIOUS_ACTION === 121)
                    ? " Resume Approval Request" :
                    selectedDetails?.PREVIOUS_ACTION === 113
                      ? "PTW Approval Request"
                      : (selectedDetails?.PREVIOUS_ACTION === 140 || selectedDetails?.PREVIOUS_ACTION === 128 || selectedDetails?.PREVIOUS_ACTION === 142) ? "Test Result"
                        : "Reassignment Request"}
          {/* {WORKORDER_DETAILS?.STATUS_DESC} Request */}
          {/* Reassignment Request */}
        </h6>
      </div>
    </>
  );

  return (
    <>
      <Buttons
        className="Review_Button"
        type="button"
        icon="pi pi-arrow-right"
        label={btnText}
        iconPos="right"
        onClick={() => reviewReassignRequest()}
      />

      <Sidebar
        className="w-full md:w-1/3"
        position="right"
        header={customHeader}
        visible={sidebarVisible}
        onHide={() => {
          CloseSidebarVisible();
        }}
      >
        <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2">

          {(selectedDetails?.PREVIOUS_ACTION === 140 || selectedDetails?.PREVIOUS_ACTION === 128 || selectedDetails?.PREVIOUS_ACTION === 142) && (
            <>
              <div className="col-span-2">
                <label className="Text_Secondary Helper_Text  ">Status</label>
                <p
                  className="Open Helper_Text"
                >
                  Fail
                </p>
              </div>
            </>
          )}

          {selectedDetails?.PREVIOUS_ACTION === 113 ? (
            <>
              <div className="col-span-2">
                <label className="Text_Secondary Helper_Text  ">Status</label>
                <p
                  className="Open Helper_Text"
                >
                  Declined
                </p>
              </div>
            </>
          ) : (
            <>
              {(selectedDetails?.PREVIOUS_ACTION !== 142) && <div className="col-span-2">
                <label className="Text_Secondary Helper_Text  ">Status</label>
                <p
                  className={`Helper_Text ${(subStatus === "Decline") || (subStatus === "Declined")
                    ? "Open"
                    : subStatus?.includes("Approved")
                      ? "Completed"
                      : subStatus?.includes("Pending") && selectedDetails?.PREVIOUS_ACTION !== 124
                        ? "Rectified"
                        : subStatus?.includes("Fail")
                          ? "Open"
                          : subStatus?.includes("Return")
                            ? "Rectified"
                            : (subStatus?.includes("Pending") && selectedDetails?.PREVIOUS_ACTION === 124)
                              ? "Open"
                              : (selectedDetails?.SUB_STATUS_REVIEW?.includes("Pending Suspension Approval"))
                                ? "Rectified" : ""
                    }`}
                >
                  {selectedDetails?.PREVIOUS_ACTION === 125 ? "On Hold" :
                    selectedDetails?.PREVIOUS_ACTION === 124 ? "Testing Suspended" :
                      (selectedDetails?.PREVIOUS_ACTION === 108 || selectedDetails?.PREVIOUS_ACTION === 110
                        || selectedDetails?.PREVIOUS_ACTION === 109 || selectedDetails?.PREVIOUS_ACTION === 111
                      ) ? selectedDetails?.SUB_STATUS_REVIEW : subStatus}
                </p>

              </div>}
            </>
          )}


          {[113, 114, 115].some((num) => Actioncode?.includes(num)) && (
            <div className="col-span-2">
              <label className="Text_Secondary Helper_Text  ">Request</label>
              <p className="Text_Primary Alert_Title">
                {" "}
                {selectedDetails?.IS_ISOLATION_REQUIRED == false
                  ? " Isolation Not Required"
                  : "With Isolation"}
              </p>
            </div>
          )}
          {(selectedDetails?.PREVIOUS_ACTION === 113) ?
            <><div>
              <label className="Text_Secondary Helper_Text  ">Decline by</label>
              <p className="Text_Primary Alert_Title">
                {/* {selectedDetails?.PREVIOUS_ACTION === 121 ? selectedDetails?.REQUESTED_BY : selectedDetails?.LAST_MODIFIED_BY} */}
                {selectedDetails?.REQUESTED_BY}
                {/* {selectedDetails?.REQUESTED_BY} */}
              </p>
            </div>
              <div>
                <label className="Text_Secondary Helper_Text  "> Declined Date & Time</label>
                <p className="Text_Primary Alert_Title">
                  {/* {formateDate(WORKORDER_DETAILS?.["REQ_DATE"])} */}
                  {formateDate(selectedDetails?.REQUESTED_ON)}
                </p>
              </div></> : <></>}
          {(selectedDetails?.PREVIOUS_ACTION === 114) ?
            <><div>
              <label className="Text_Secondary Helper_Text  ">Approve by</label>
              <p className="Text_Primary Alert_Title">
                {/* {selectedDetails?.PREVIOUS_ACTION === 121 ? selectedDetails?.REQUESTED_BY : selectedDetails?.LAST_MODIFIED_BY} */}
                {selectedDetails?.REQUESTED_BY}
                {/* {selectedDetails?.REQUESTED_BY} */}
              </p>
            </div>
              <div>
                <label className="Text_Secondary Helper_Text  "> Approve Date & Time</label>
                <p className="Text_Primary Alert_Title">
                  {/* {formateDate(WORKORDER_DETAILS?.["REQ_DATE"])} */}
                  {formateDate(selectedDetails?.REQUESTED_ON)}
                </p>
              </div></> : <></>}

          <div >
            <label className="Text_Secondary Helper_Text  ">{(selectedDetails?.PREVIOUS_ACTION === 142) ? "Submitter" : "Requestor"}</label>
            <p className="Text_Primary Alert_Title">
              {/* {selectedDetails?.PREVIOUS_ACTION === 121 ? selectedDetails?.REQUESTED_BY : selectedDetails?.LAST_MODIFIED_BY} */}
              {selectedDetails?.LAST_MODIFIED_BY}
              {/* {selectedDetails?.REQUESTED_BY} */}
            </p>
          </div>
          <div>
            <label className="Text_Secondary Helper_Text  ">{(selectedDetails?.PREVIOUS_ACTION === 142) ? "Submission Date & Time " : "Request Date & Time"}</label>
            <p className="Text_Primary Alert_Title">
              {/* {formateDate(WORKORDER_DETAILS?.["REQ_DATE"])} */}
              {formateDate(selectedDetails?.LAST_MODIFIED_ON)}
            </p>
          </div>

          {selectedDetails?.PREVIOUS_ACTION === 121 && (
            <div className="col-span-2 mt-6">
              <b>Review Information</b>

              <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2   sidebarhighlightContainer">
                <div>
                  <label className="Text_Secondary Helper_Text  ">Decline By</label>
                  <p className="Text_Primary Alert_Title">
                    {selectedDetails?.REQUESTED_BY}
                    {/* {selectedDetails?.LAST_MODIFIED_BY} */}
                  </p>
                </div>
                <div>
                  <label className="Text_Secondary Helper_Text  ">Request Date & Time</label>
                  <p className="Text_Primary Alert_Title">
                    {formateDate(selectedDetails?.REQUESTED_ON)}
                  </p>
                </div>
                <div className="col-span-2">
                  <label className="Text_Secondary Helper_Text  ">Decline Remarks</label>
                  <p className="Text_Primary Alert_Title">
                    {selectedDetails?.LAST_REMARKS}
                  </p>
                </div>

              </div>
            </div>

          )}
          {selectedDetails?.PREVIOUS_ACTION === 120 && (
            <div className="col-span-2 mt-6">
              <b>Review Information</b>

              <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2   sidebarhighlightContainer">
                <div>
                  <label className="Text_Secondary Helper_Text  ">Approved By</label>
                  <p className="Text_Primary Alert_Title">
                    {selectedDetails?.REQUESTED_BY}
                  </p>
                </div>
                <div>
                  <label className="Text_Secondary Helper_Text  ">Request Date & Time</label>
                  <p className="Text_Primary Alert_Title">
                    {formateDate(selectedDetails?.REQUESTED_ON)}
                  </p>
                </div>

              </div>
            </div>

          )}

          {[140, 141, 142].some((num) => MapButtons?.includes(num) || selectedDetails?.PREVIOUS_ACTION === 125) && (
            <div>
              <label className="Text_Secondary Helper_Text  ">Remarks</label>
              <p className="Text_Primary Alert_Title">
                {selectedDetails?.LAST_REMARKS}

              </p>
            </div>
          )}

          {/* //ANAND */}
          {([132, 148].some((num) => MapButtons?.includes(num)) && (selectedDetails?.ISEDITCOMMENTS === 1)) && (
            <div className="col-span-2 ">
              <label className="Text_Secondary Helper_Text  ">Comments</label>
              <p className="Text_Primary Alert_Title">
                {selectedDetails?.LATEST_REMARKS}

              </p>
            </div>
          )}
          {([132].some((num) => MapButtons?.includes(num)) && (selectedDetails?.ISEDITCOMMENTS === 0)) && (
            <div className="col-span-2">
              <label className="Text_Secondary Helper_Text  ">Comments</label>
              <p className="Text_Primary Alert_Title">
                {selectedDetails?.LATEST_REMARKS}
              </p>
            </div>
          )}
          {[105, 118].some((num) => MapButtons?.includes(num)) && (
            <div className="col-span-2">
              <label className="Text_Secondary Helper_Text  ">Remarks</label>

              {[105].some((num) => MapButtons?.includes(num)) && (
                <p className="Text_Primary Alert_Title">
                  <b> {selectedDetails?.REASON_DESCRIPTION}</b>
                </p>
              )}
              <p className="Text_Primary Alert_Title">
                {selectedDetails?.LAST_REMARKS}
              </p>
            </div>
          )}
          {(selectedDetails?.PREVIOUS_ACTION === 113 || selectedDetails?.PREVIOUS_ACTION === 140 ||
            selectedDetails?.PREVIOUS_ACTION === 128 || selectedDetails?.PREVIOUS_ACTION === 142) && (
              <div className="col-span-2">
                <label className="Text_Secondary Helper_Text  ">Remarks</label>

                <p className="Text_Primary Alert_Title">
                  {selectedDetails?.LAST_REMARKS ?? "NA"}
                </p>

              </div>
            )}
          {[118].some((num) => MapButtons?.includes(num)) && (
            <SuccessDialog
              header={"Approve"}
              control={control}
              setValue={setValue}
              register={register}
              paragraph="Your approval has been updated successfully."
              watch={watch}
              errors={errors}
              payload={{ ACTION_ID: 118 }}
              Actioncode={118}
              updateWOStatusInfra={updateWOStatusInfra}
            />
          )}
          {/* Resume Approval Request to show below container */}
          {/* <div className="col-span-2">
            <label className="Header_Text">Review Information</label>

            <div className="mt-2 grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-2 lg:grid-cols-2 highlightContainer">
              <div>
                <label className="Text_Secondary Helper_Text  ">
                  Approved By
                </label>
                <p className="Text_Primary Alert_Title">Amit Srinyaka</p>
              </div>
              <div>
                <label className="Text_Secondary Helper_Text  ">Date</label>
                <p className="Text_Primary Alert_Title">09/12/2023, 12:15PM</p>
              </div> */}
          {/* Resume Approval Request to show below container after decline */}
          {/* <div className="col-span-2">
                <label className="Text_Secondary Helper_Text  ">
                  Declined Remarks
                </label>
                <p className="Text_Primary Alert_Title">
                  The boiler is currently in scheduled maintenance and can only
                  be resumed once the maintenance is complete.
                </p>
              </div>
            </div>
          </div> */}

          {/* only shown Reassignment request as an engineer user */}
          {[105].some((num) => MapButtons?.includes(num)) && (
            <div className="col-span-2">
              <AssignWoDialog
                header={"Edit Assign"}
                cssClass={"Secondary_Button mr-2"}
                control={control}
                setData={setValue}
                register={register}
                paragraph={""}
                watch={watch}
                errors={errors}
                TECH_ID={"TECH_ID"}
                AssigneeList={AssigneeList}
                setTechList={setTechList}
                assigneeTechList={assigneeTechList}
                setAssigneeTechList={setAssigneeTechList}
                setSelectedTechList={setSelectedTechList}
                updateWoDetails={updateWoDetails}
                selectedTechList={selectedTechList}
                TEAM_NAME={TEAM_NAME}
                setaddAssigneeAction={setaddAssigneeAction}
                technicianList={technicianList}
              />
            </div>
          )}

          {/* only shown PTW Approval Request as an authorized user*/}
          {[113, 114, 115].some((num) => Actioncode?.includes(num)) && (
            <div className="col-span-2">
              {[113].some((num) => Actioncode?.includes(num)) &&
                <DeclinePTWDialog
                  header={"Decline"}
                  control={control}
                  setValue={setValue}
                  register={register}
                  paragraph={"Your decline has been updated successfully."}
                  watch={watch}
                  errors={errors}
                  Action_Code={Actioncode}
                  updateWOStatusInfra={updateWOStatusInfra}
                  setTestingOnHold={setTestingOnHold}

                />
              }
              {/* <ProceedPTWDialog
                header={"Approve"}
                control={control}
                setValue={setValue}
                paragraph={""}
                watch={watch}
                errors={errors}
                updateWOStatusInfra={updateWOStatusInfra}
              /> */}
              {/* new code writeen by priyanka 17-03-25 */}

              {[114].some((num) => Actioncode?.includes(num)) &&
                selectedDetails?.IS_ISOLATION_REQUIRED == false && (
                  <>
                    {/* <PTWApprovalDialog
                      header={"Approve"}
                      control={control}
                      setValue={setValue}
                      register={register}
                      cssStyle="Primary_Button mr-2"
                      headerText={"Confirm Approval - Isolation Not Required"}
                      paragraph={
                        "Are you sure isolation is not required for this work order?"
                      }
                      sccusspara={
                        "Your approval has been updated successfully."
                      }
                      watch={watch}
                      errors={errors}
                      Actioncode={114}
                      updateWOStatusInfra={updateWOStatusInfra}
                      selectedDetails={selectedDetails}
                    /> */}
                    <ProceedPTWDialog
                      header={"Approve"}
                      control={control}
                      setValue={setValue}
                      register={register}
                      cssStyle="Primary_Button mr-2"
                      headerText={"Confirm Approval - Isolation Not Required"}
                      paragraph={
                        "Are you sure isolation is not required for this work order?"
                      }
                      sccusspara={
                        "Your approval has been updated successfully."
                      }
                      watch={watch}
                      errors={errors}
                      Actioncode={114}
                      updateWOStatusInfra={updateWOStatusInfra}
                    />
                  </>
                )}

              {[115].some((num) => Actioncode?.includes(num)) &&
                selectedDetails?.IS_ISOLATION_REQUIRED == true && (
                  <>
                    {/* <PTWApprovalDialog
                      header={"Approve"}
                      control={control}
                      setValue={setValue}
                      register={register}
                      cssStyle="Primary_Button mr-2"
                      headerText={"Confirm Approval - Isolation Required"}
                      paragraph={
                        "Are you sure isolation is required for this work order?"
                      }
                      sccusspara={
                        "Your approval has been updated successfully."
                      }
                      watch={watch}
                      errors={errors}
                      Actioncode={115}
                      updateWOStatusInfra={updateWOStatusInfra}
                      selectedDetails={selectedDetails}
                    /> */}
                    <ProceedPTWDialog
                      header={"Approve"}
                      control={control}
                      setValue={setValue}
                      register={register}
                      cssStyle="Primary_Button mr-2"
                      headerText={"Confirm Approval - Isolation  Required"}
                      paragraph={
                        "Are you sure isolation is  required for this work order?"
                      }
                      sccusspara={
                        "Your approval has been updated successfully."
                      }
                      watch={watch}
                      errors={errors}
                      Actioncode={114}
                      updateWOStatusInfra={updateWOStatusInfra}
                    />
                  </>
                )}
            </div>
          )}
          {/* Approve Resume Request */}

          {[120, 121].some((num) => Actioncode?.includes(num)) && (
            <div className="col-span-2">
              <DeclinePTWDialog
                header={"Decline"}
                control={control}
                setValue={setValue}
                register={register}
                paragraph={"Your decline has been updated successfully."}
                watch={watch}
                errors={errors}
                Action_Code={Actioncode}
                updateWOStatusInfra={updateWOStatusInfra}
                setTestingOnHold={setTestingOnHold}
              />

              <PTWApprovalDialog
                header={"Approve"}
                control={control}
                setValue={setValue}
                register={register}
                cssStyle="Primary_Button mr-2"
                headerText={"Confirm Approval"}
                paragraph={
                  "Are you sure you want to approve this resume request?"
                }
                sccusspara={"Your approval has been updated successfully."}
                watch={watch}
                errors={errors}
                Action_Code={Actioncode}
                updateWOStatusInfra={updateWOStatusInfra}
              />
            </div>
          )}
          {/* after click on resolution review now btn Edits Required  */}

          {/*  */}
          {([132, 148].some((num) => MapButtons?.includes(num)) && (selectedDetails?.ISEDITCOMMENTS === 0)) && (
            <div className="col-span-2">
              <AddResolutionDialog
                header={"Edit Comments"}
                control={control}
                setValue={setValue}
                register={register}
                paragraph={""}
                watch={watch}
                errors={errors}
                updateWOStatusInfra={updateWOStatusInfra}
                selectedDetails={selectedDetails}
                DOC_LIST_DATA={docOption}
                Actioncode={MapButtons}
              />
            </div>
          )}
          {([132, 148].some((num) => MapButtons?.includes(num)) && (selectedDetails?.ISEDITCOMMENTS === 1)) && (
            <div className="col-span-2 mt-6">
              <DeclinePTWDialog
                header={"Edit Comments"}
                control={control}
                setValue={setValue}
                register={register}
                paragraph={"Your request has been updated successfully."}
                watch={watch}
                errors={errors}
                updateWOStatusInfra={updateWOStatusInfra}
                setTestingOnHold={setTestingOnHold}
                selectedComments={selectedDetails?.LATEST_REMARKS}
              />
            </div>)}


          {/*  */}
          {/* <AddResolutionDialog
            header={"Edit Resolution"}
            control={control}
            setValue={setValue}
            register={register}
            paragraph={""}
            watch={watch}
            errors={errors}
          /> */}

          {/* After suspend view work order  */}

          {/* ); */}

          <div className="col-span-2 mt-4">
            {[141, 142].some((num) => MapButtons?.includes(num)) && (
              // <div className="col-span-2">
              <div className="">
                <h6 className="Header_Text mb-1">Related Active Work Orders</h6>
                <div className="w-full flex flex-col gap-6">
                  {WOAcativeList.map((order: any) => (
                    <div className="flex flex-wrap gap-x-3 gap-y-5 w-full justify-between">
                      <div className="flex flex-wrap flex-col">
                        <label className="Text_Secondary Helper_Text mb-1 max-w-72">
                          {order?.WO_NO}
                        </label>
                        <label className="Text_Primary Alert_Title  max-w-72">
                          {order?.ISSUE_DESCRIPTION}{" "}
                        </label>
                      </div>

                      <div
                        style={{
                          backgroundColor: "#FBD999",
                          borderRadius: "1rem",
                          padding: "0.25rem",
                          textAlign: "center",
                          width: "120px",
                          height: "32px",
                        }}
                      >
                        <p>{order?.STATUS_DESC}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              // </div>
            )}
          </div>
        </div>
      </Sidebar>
    </>
  );
};

export default InfraSidebarVisibal;
