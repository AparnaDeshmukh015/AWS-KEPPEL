import { Dialog } from "primereact/dialog";
import React, { useEffect, useState } from "react";
import Button from "../../../../components/Button/Button";
import SuccessDialog from "./SuccessDialog";
import Safe from "../../../../assest/images/Safe.png";
import Suspend from "../../../../assest/images/Suspend.png";
import { InputTextarea } from "primereact/inputtextarea";
import Field from "../../../../components/Field";

import { IconField } from "primereact/iconfield";

import { useForm } from "react-hook-form";
import { InputText } from "primereact/inputtext";
import { callPostAPI } from "../../../../services/apis";
import { ENDPOINTS } from "../../../../utils/APIEndpoints";
import { Checkbox } from "primereact/checkbox";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { set } from "date-fns";
var payload: any;
var getindex: number = 0;
let indexgetStatus: any;
let data: any = [];
const NormalizeToTest = ({
  header,
  paragraph,
  getOptions,
  updateWOStatusInfra,
  Active_code,
}: any) => {
  const navigate: any = useNavigate();
  const [visible, setVisible] = useState<boolean>(false);
  const [searchText, setSearchText] = useState("");
  const [visibleConfirmPTW, setVisibleConfirmPTW] = useState<boolean>(false);
  const [visibleSafeForTest, setvisibleSafeForTest] = useState<boolean>(false);
  const [Remarklength, setRemrksCount] = useState<number>(0);
  const [visibleSuspendTesting, setVisibleSuspendTesting] =
    useState<boolean>(false);
  const [visibleShowDetails, handlerShowDetails] = useState<boolean>(false);
  const [visibleMainHeader, setVisibleMainHeader] = useState<string>("");
  const [visibleSubHeader, setVisibleSubHeader] = useState<string>("");
  const [visibleBtnText, setVisibleBtnText] = useState<string>("");
  const [WorkorderList, setWorkorderList] = useState<any>([]);
  const [originalWorkOrderList, setOriginalWorkOrderList] = useState<
    any | null
  >([]);
  const [loading, setLoading] = useState<any | null>(false);
  const [selectedWorkorders, setSelectedWorkorders] = useState<any[]>([]);
  const [addRemarks, setAddRemarks] = useState<any>([]);
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,

    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      REMARKS: "",
    },
    mode: "onSubmit",
  });
  let payload = { WO_ID: "" };
  useEffect(() => {
    getWOListInfra(payload);
  }, []);

  const getWOListInfra = async (payload: any) => {
    let WO_ID = localStorage.getItem("WO_ID");
    payload.WO_ID = WO_ID;
    setLoading(true);
    try {
      let res: any = await callPostAPI(
        ENDPOINTS.GETWOACTIVELISTINFRA,
        payload,
        "HD001"
      );

      if (res.FLAG === 1) {
        setWorkorderList(res?.WOACTIVELIST);
        setOriginalWorkOrderList(res?.WOACTIVELIST);
        setLoading(false);
      } else {
        setOriginalWorkOrderList(res?.WOACTIVELIST);
      }
    } catch (error: any) {
    } finally {
    }
  };

  const handleCheckboxChange = (index: number) => {
    setSelectedWorkorders((prevSelected) => {
      if (prevSelected?.includes(index)) {
        return prevSelected?.filter((i) => i !== index);
      } else {
        return [...prevSelected, index];
      }
    });
    const woIds: any = data.map((item: any) => item?.WO_ID);
    const isMatch: any = woIds?.includes(index);
    if (isMatch) {
      const updatedData: any = data?.filter(
        (item: any) => item?.WO_ID !== index
      );
      data = updatedData;
      indexgetStatus = { ACTION_ID: 124, Remarks: addRemarks, WO_LIST: data };
    } else {
      data.push({ WO_ID: index });
    }
  };

  const OpenNormalizeTestPopUp = () => {
    setVisible(!visible);
  };
  const CloseNormalizeTestPopUp = () => {
    setVisible(!visible);
  };
  const CloseConfirmPTWPopUp = () => {
    setVisibleConfirmPTW(!visibleConfirmPTW);
    setValue("REMARKS", "");
    setSearchText("")
    setRemrksCount(0)
    setSelectedWorkorders([]);

  };
  const OpenConfirmPTWPopUp = () => {
    setVisibleConfirmPTW(!visibleConfirmPTW);
  };

  const CloseConfirmSuspend = () => {
    setVisibleSuspendTesting(!visibleSuspendTesting);
    setValue("REMARKS", "");
    setRemrksCount(0);
    setSearchText("")
    setSelectedWorkorders([]);
  };
  const OpenVisibleNormalizeTest = (
    headerText: any,
    value: any,
    para: any,
    btntext: any
  ) => {
    if (value === "SFT") {
      // updateWOStatusInfra({ ACTION_ID: 123 }, paragraph);
      // indexgetStatus = { ACTION_ID: 123, REMARKS: "" };
      setvisibleSafeForTest(true);
      CloseNormalizeTestPopUp();
    } else {
      setVisibleSuspendTesting(!visibleSuspendTesting);
    }
  };

  const ClosevisibleSafeForTest = () => {
    setvisibleSafeForTest(false);
  };

  const onSubmit = (data: any) => {
    setVisibleSuspendTesting(false);
    setVisible(false);
    OpenConfirmPTWPopUp();
  };
  const handlerShowDetailstab = (value: any) => {
    if (value === true) {
      handlerShowDetails(true);
    } else {
      handlerShowDetails(false);
    }
  };

  const handleInputChange = (event: any) => {
    const charLenth = event?.target?.value;
    data = [];
    selectedWorkorders.forEach((workOrder) => {
      data.push({ WO_ID: workOrder });
    });
    setAddRemarks(charLenth);
    indexgetStatus = { ACTION_ID: 124, REMARKS: charLenth, WO_LIST: data };
    setRemrksCount(charLenth.length);
  };

  const handlerInputSearch = (e: any) => {
    const value: any = e;
    setSearchText(value);
    const data: any = originalWorkOrderList?.filter((item: any) => {
      return Object.values(item).some((val: any) => {
        if (typeof val === "string") {
          return val.toLowerCase().includes(value.toLowerCase());
        }
        return false;
      });
    });
    if (value !== "") {
      console.log(data, "data");
      setWorkorderList(data);
    } else {
      setWorkorderList(originalWorkOrderList);
    }
  };

  console.log(searchText, "searchText");
  useEffect(() => {
    handlerInputSearch(searchText);
  }, [searchText, WorkorderList, originalWorkOrderList]);

  const handleCancel = () => {
    setSearchText("");
    setWorkorderList(originalWorkOrderList);
  };
  useEffect(() => {
    if (
      (!isSubmitting && Object?.values(errors)[0]?.type === "required") ||
      (!isSubmitting && Object?.values(errors)[0]?.type === "validate")
    ) {
      const check: any = Object?.values(errors)[0]?.message;
      toast?.error(check);
    }
  }, [isSubmitting]);
  return (
    <>
      <Button
        type="button"
        label={header}
        className="Primary_Button mr-2 "
        onClick={() => OpenNormalizeTestPopUp()}
      />
      <Dialog
        header=""
        visible={visible}
        style={{ width: "900px" }}
        className="normalizeDialogBOx"
        onHide={() => CloseNormalizeTestPopUp()}

      >

        <form>
          <div className="grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-3 lg:grid-cols-3">
            <div
              className={`${visibleShowDetails === true
                ? "col-span-2 duration-300"
                : "col-span-3 duration-300"
                }`}
            >
              <div className="grid justify-items-center">
                <div className="mt-2 ">
                  <h6 className="Text_Primary text-center mb-2">
                    Equipment in Use: Proceed with Caution
                  </h6>
                  <p className="Input_Text text-center">
                    Please choose how you want to proceed:
                  </p>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-4 md:grid-cols-2 lg:grid-cols-2">
                  <div
                    className=" border-2 p-6
                          border-gray-200 border rounded-lg mb-2 redirectContainer"
                    onClick={() =>
                      OpenVisibleNormalizeTest(
                        "Safe for Testing",
                        "SFT",
                        "Are you sure you want to proceed with the testing?",
                        "Proceed"
                      )
                    }
                  >
                    <div>
                      <div className="flex justify-center mb-3">
                        <img
                          src={Safe}
                          alt=""
                          style={{ width: "40px", height: "40px" }}
                        />
                      </div>
                      <p className=" Text_Primary text-center Header_Text mb-2">
                        Safe for Testing
                      </p>
                      <p className="Text_Secondary Helper_Text text-center">
                        Confirm that it is safe to proceed without affecting
                        ongoing work.
                      </p>
                    </div>
                  </div>
                  <div
                    className=" border-2 p-6
                          border-gray-200 border rounded-lg mb-2 redirectContainer"
                    onClick={() =>
                      OpenVisibleNormalizeTest(
                        "Suspend Testing",
                        "ST",
                        "Are you sure you want to suspend testing?",
                        "Suspend"
                      )
                    }
                  >
                    <div>
                      <div className="flex justify-center  mb-2">
                        <img
                          src={Suspend}
                          alt=""
                          style={{ width: "40px", height: "40px" }}
                        />
                      </div>
                      <p className=" Text_Primary text-center Header_Text mb-2">
                        Suspend Testing
                      </p>
                      <p className="Text_Secondary Helper_Text text-center">
                        Pause testing until conflicts are resloved
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <label className="Text_Secondary Helper_Text">
                    <i className="pi pi-exclamation-triangle mr-2"></i>
                    {`Ensure all safety measures are met before ${visibleShowDetails ? "approval" : "Selection"}.`}
                  </label>
                </div>
              </div>
              <div className="mt-6 text-end">
                {visibleShowDetails === false ? (
                  <>
                    <Button
                      className="Border_Button Secondary_Button "
                      label="Show Active Work Orders"
                      iconPos="right"
                      icon="pi pi-angle-double-right"
                      onClick={() => {
                        handlerShowDetailstab(true);
                      }}
                    />
                  </>
                ) : (
                  <>
                    <Button
                      className="Border_Button Secondary_Button "
                      label="Hide Active Work Orders"
                      iconPos="right"
                      icon="pi pi-angle-double-left"
                      onClick={() => {
                        handlerShowDetailstab(false);
                      }}
                    />
                  </>
                )}
              </div>
            </div>

            {/* {visibleShowDetails === true && (
              <>

                {originalWorkOrderList?.length > 0 ? (
                  <div className="highlightedSection relative">
                    <div className="absolute top-4 right-2 z-50">
                      <Button
                        onClick={() => {
                          handlerShowDetailstab(false);
                        }}
                        name={""}
                        label=""
                      >

                        <i className="pi pi-times x-button hover"></i>
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 gap-3">


                      <div >
                        <label className="normalizeheadertext mb-3">
                          Active Work Orders
                        </label>

                      </div>
                      {originalWorkOrderList?.map((originalList: any) => {
                        return (
                          <div>
                            <label className="normalizemaintext">
                              {originalList?.WO_NO}
                            </label>
                            <p className="normalizesubtext ">
                              {originalList?.Column1}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="highlightedSection">
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <label className="normalizeheadertext mb-3">
                          Active Work Order:{" "}
                          <span style={{ display: "block" }}>NA</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )} */}

            {/* added by anand  */}
            {visibleShowDetails === true && (
              <div className="highlightedSectionActiveWo relative">

                {/* Always visible Close Icon */}
                <div className="absolute top-4 right-2 z-50">
                  <Button
                    onClick={() => handlerShowDetailstab(false)}
                    name=""
                    label=""
                  >
                    <i className="pi pi-times x-button hover"></i>
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="normalizeheadertext mb-3">
                      Active Work Orders
                    </label>
                  </div>

                  {/* Work Order List or NA */}
                  <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                    {originalWorkOrderList?.length > 0 ? (
                      originalWorkOrderList.map((originalList: any, index: number) => (
                        <div key={index} className="p-1">
                          <label className="normalizemaintext ">{originalList?.WO_NO}</label>
                          <p className="normalizesubtext ">{originalList?.Column1}</p>
                        </div>
                      ))

                    ) : (
                      <div>
                        <label className=" mb-3">

                          <span style={{ display: "block" }}>No Data found</span>
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>
        </form>
      </Dialog>

      {/* After Suspend testing select */}

      <Dialog
        header="Suspend Testing"
        visible={visibleSuspendTesting}
        style={{ width: "900px" }}
        className="editWoDialogBox"
        onHide={() => CloseConfirmSuspend()}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-3 lg:grid-cols-3 border-b-2 border-gray-200">
            <div className="pt-4 pe-5">
              <div className="mb-6">
                <p className="Text_Secondary Helper_Text">
                  Provide the necessary details to suspend the testing process
                  due to an active work order.
                </p>
              </div>
              <div>
                <p className="Text_Secondary Input_Label">
                  Reason for Suspension
                  <span className="text-red-600"> *</span>
                </p>
                <div className={`${errors?.REMARKS ? "errorBorder" : ""}`}>
                  <Field
                    controller={{
                      name: "REMARKS",
                      control: control,
                      render: ({ field }: any) => {
                        return (
                          <InputTextarea
                            {...register("REMARKS", {
                              required: "Please fill the requried fields",
                              onChange: (e: any) => handleInputChange(e),
                            })}
                            invalid={errors?.REMARKS}
                            rows={7}
                            placeholder="Provide additional details"
                            setValue={setValue}
                            {...field}
                          />
                        );
                      },
                    }}
                  />
                </div>
                <label
                  className={` ${Remarklength === 400 ? "text-red-600" : "Text_Secondary"
                    } Helper_Text`}
                >
                  {`${Remarklength}/400 characters.`}
                </label>
                {/* <label className="Text_Secondary Helper_Text">
                  Up to 0/400 characters.
                </label> */}
              </div>
            </div>
            <div className="col-span-2 pt-4 border-gray-200 border-l-2 ps-5">
              <div className="grid grid-cols-1 gap-5 ">
                <label className="normalizeheadertext">
                  Select related active work order
                </label>
                <div>
                  <IconField iconPosition="right">
                    <div className="relative w-full">
                      {/* Search Icon (left) */}
                      {!searchText && <span className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400">
                        <i className="pi pi-search"></i>
                      </span>
                      }
                      {/* Clear (X) button (right) */}
                      {searchText && (
                        <button
                          onClick={handleCancel}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          ✖
                        </button>
                      )}

                      <InputText
                        placeholder="Search Keywords"
                        value={searchText}
                        onChange={(e: any) => setSearchText(e.target.value)}
                        className="w-full pl-8 pr-8" // pl for left icon, pr for right button
                      />
                    </div>
                  </IconField>
                </div>
                <div className="scrollContainerSuspend">
                  <div className="mb-1 flex flex-col gap-3 align-items-center">
                    {
                      WorkorderList?.length > 0 ?
                        WorkorderList?.map((category: any, index: number) => (
                          <div className="flex gap-5 w-full">
                            <Checkbox
                              className=""
                              onChange={() => handleCheckboxChange(category.WO_ID)}
                              checked={selectedWorkorders.includes(category.WO_ID)}
                            ></Checkbox>

                            <div className="flex flex-col w-full">
                              <label className="ml-2 w-full Text_Secondary wotext">
                                {" "}
                                {category.WO_NO}
                              </label>
                              <p className="ml-2  w-full  Text_Primary Helper_Text ">
                                {" "}
                                {category.Column1}
                              </p>
                            </div>

                            <div className="justify-end">
                              <a
                                href={`${process.env.REACT_APP_REDIRECT_URL}workorderlist?edit=:/${category.WO_ID}`}
                                onClick={() => { }}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <i className="pi pi-arrow-up-right mt-4 mr-2"></i>
                              </a>
                            </div>
                          </div>
                        )) : "No Data found"}
                    {/* <div>
                      <p className="Text_Primary Alert_Title ml-8">
                        To replace the CO2 detectorNOX cartridge and IR source
                        for
                      </p>
                    </div> */}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap justify-between mt-4">
            <div>
              <p className="Text_Secondary Helper_Text">
                {WorkorderList?.length > 0
                  ? selectedWorkorders?.length + " " + "Items Selected."
                  : ""}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                name="Cancel"
                className="Secondary_Button mr-2"
                type="button"
                label={"Back"}
                onClick={() => CloseConfirmSuspend()}
              />
              <Button
                name="Suspend"
                className="Primary_Button w-28 "
                type="submit"
                label={"Submit"}
              // onClick={() => OpenConfirmPTWPopUp()}
              />
            </div>
          </div>
        </form>
      </Dialog>

      {/*Confirm Approval - Isolation Not Required --Or--Isolation Required  */}
      <Dialog
        header=""
        visible={visibleConfirmPTW}
        style={{ width: "550px" }}
        className="dialogBoxStyle"
        onHide={() => CloseConfirmPTWPopUp()}
      >
        <form>
          <div className="grid justify-items-center">
            <div className="">{/* <img src={SuccessIcon} alt="" /> */}</div>
            <div className="">
              <h6 className="Text_Primary text-center mb-3">
                Confirm Suspend Testing
              </h6>

              <p className="Input_Text text-center">
                Are you sure you want to suspend testing?
              </p>
            </div>
            <div className="flex justify-end mt-[35px] gap-3">
              <Button
                name="Cancel"
                className="Cancel_Button"
                type="button"
                label={"Cancel"}
                onClick={() => CloseConfirmPTWPopUp()}
              />
              <SuccessDialog
                header={"Suspend"}
                control={control}
                setValue={setValue}
                register={register}
                paragraph={"Your response has been updated successfully."}
                watch={watch}
                errors={errors}
                Actioncode={124}
                payload={indexgetStatus}
                CloseConfirmPTWPopUp={CloseConfirmPTWPopUp}
                updateWOStatusInfra={updateWOStatusInfra}
              />
            </div>
          </div>
        </form>
      </Dialog>

      <Dialog
        header=""
        visible={visibleSafeForTest}
        style={{ width: "550px" }}
        className="dialogBoxStyle"
        onHide={() => ClosevisibleSafeForTest()}
      >
        <form>
          <div className="grid justify-items-center">
            <div className="">{/* <img src={SuccessIcon} alt="" /> */}</div>
            <div className="">
              <h6 className="Text_Primary text-center mb-3">
                Confirm Safe for Testing
              </h6>

              <p className="Input_Text text-center">
                Are you sure you want to proceed with the testing?
              </p>
            </div>
            <div className="flex justify-end mt-[35px] gap-3">
              <Button
                name="Cancel"
                className="Cancel_Button"
                type="button"
                label={"Cancel"}
                onClick={() => ClosevisibleSafeForTest()}
              />
              <SuccessDialog
                header={"Proceed"}
                control={control}
                setValue={setValue}
                register={register}
                paragraph={"Your response has been updated successfully."}
                watch={watch}
                errors={errors}
                Actioncode={123}
                payload={{ ACTION_ID: 123, REMARKS: "" }}
                CloseConfirmPTWPopUp={ClosevisibleSafeForTest}
                updateWOStatusInfra={updateWOStatusInfra}
              />
            </div>
          </div>
        </form>
      </Dialog>
    </>
  );
};

export default NormalizeToTest;
