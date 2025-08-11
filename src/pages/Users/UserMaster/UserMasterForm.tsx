import InputField from "../../../components/Input/Input";
import { Card } from "primereact/card";
import { SubmitErrorHandler, useForm } from "react-hook-form";
import Field from "../../../components/Field";
import Checkboxs from "../../../components/Checkbox/Checkbox";
import { callPostAPI } from "../../../services/apis";
import { ENDPOINTS } from "../../../utils/APIEndpoints";
import { toast } from "react-toastify";
import { useCallback, useEffect, useState } from "react";
import Radio from "../../../components/Radio/Radio";
import Select from "../../../components/Dropdown/Dropdown";
import MultiSelects from "../../../components/MultiSelects/MultiSelects";
import "../../../components/MultiSelects/MultiSelects.css";
import { useTranslation } from "react-i18next";
import {
  eventNotification,
  helperEventNotification,
} from "../../../utils/eventNotificationParameter";

import FormHeader from "../../../components/FormHeader/FormHeader";
import { validation } from "../../../utils/validation";
import { useLocation, useOutletContext } from "react-router-dom";
import { dateFormat, formateDate, helperNullDate, LOCALSTORAGE, onlyDateFormat, saveTracker, VALIDATION } from "../../../utils/constants";
import { EMAIL_REGEX } from "../../../utils/regEx";
import { decryptData } from "../../../utils/encryption_decryption";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";

import DateCalendar from "../../../components/Calendar/Calendar";
import moment from "moment";
import { get } from "http";
import { debug } from "console";

const UserMasterForm = (props: any) => {
  const { t } = useTranslation();
  const { search } = useLocation();
  const getId: any = localStorage.getItem("Id");
  const dataId = JSON.parse(getId);
  const [userroleOptions, setUserroleOptions] = useState([]);
  // const [workForce, setWorkForce] = useState<any | null>([]);
  const [buildingOptions, setBuildingOptions] = useState<any | null>([]);
  const [workforceOptions, setWorkforceOptions] = useState([]);
  const [vendorNameOptions, setVendorNameOptions] = useState([]);
  const [selectedDetails, setSelectedDetails] = useState<any>([]);
  const [languageOptions, setLanguageOptions] = useState<any | null>([]);
  const [selectedF, setSelectedF] = useState<any | null>([]);
  const [error, setError] = useState<any | null>(false)
  const [locationtypeOptions, setlocationtypeOptions] = useState([]);
  const [selectedLocationListid, setSelectedLocationListid] = useState<any>([]);
  const [visibleEquipmentlist, showEquipmentlist] = useState(false);
  const [buildingfilteredRoleList, setbuildingfilteredRoleList] = useState<any>([]);
  const [finalselectedfaciltyRole, setfinalselectedfaciltyRole] = useState<any>([]);
  const [isEdit, setIsEdit] = useState<{ isEdit: boolean, index: number }>({ isEdit: false, index: -1 });
  const [errorss, setErrorss] = useState<any | null>(false)
  const [selectedOccupLocation, setselectedOccupLocation] = useState<any>([]);
  const [occupLocationAssigned, setoccupLocationAssigned] = useState<any>([]);
  const [hasOccupant, setHasOccupant] = useState<boolean>(false);

  // const [showLoader, setShowLoader] = useState<boolean>(true);
  const [selectedRoleListandBuilding, setSelectedRoleListandBuilding] = useState<any>([]);
  const [isAllValid, setisAllValid] = useState<any | null>(false)
  const userTypeLabel: any = [
    { name: "Internal", key: "I" },
    { name: "External", key: "E" },
  ];
  let { pathname } = useLocation();
  const [selectedFacility, menuList]: any = useOutletContext();
  const currentMenu = menuList
    ?.flatMap((menu: any) => menu?.DETAIL)
    .filter((detail: any) => detail.URL === pathname)[0];
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    resetField,
    trigger,
    formState: { errors },
  } = useForm({
    defaultValues: {
      MODE: props?.selectedData ? "E" : "A",
      PARA: props?.selectedData
        ? { para1: `${props?.headerName}`, para2: "Updated" }
        : { para1: `${props?.headerName}`, para2: "Added" },
      USER_NAME: props?.selectedData?.USER_NAME || "",
      EMAIL_ID: props?.selectedData?.USER_EMAILID,
      MOBILE_NO: props?.selectedData?.USER_MOBILENO,
      USER_ROLE: '',
      FACILITY_LIST: "",
      FACILITY_LIST1: [],
      EMPLOYEE_VENDOR: {},
      VENDOR_NAME: props?.selectedData?.VENDOR_NAME,
      EMPLOYEE_CODE: props?.selectedData?.EMPLOYEE_CODE ?? "",
      DEFAULT_LANGUAGE: "",
      USER_TYPE: "",
      VALIDITY_DATE: "",
      ACTIVE: search === '?edit=' ? dataId?.ACTIVE : true,
      LOCATION_LIST: [],
      // LOCATION_LIST1: []
    },
    mode: "all",
  });
  const User_Name = decryptData((localStorage.getItem("USER_NAME")))
  const currentSelectedFacilityId = JSON.parse(localStorage.getItem("FACILITYID") ?? '')

  const EMPLOYEE_VENDOR: any = watch("EMPLOYEE_VENDOR");
  const USER_ROLE: any = watch("USER_ROLE");

  const EMPLOYEE_CODE: any = watch("EMPLOYEE_CODE");
  const VENDOR_NAME: any = watch("VENDOR_NAME");
  const USER_TYPEwatch: any = watch("USER_TYPE");

  const selectedFacilityName = selectedFacility?.FACILITY_NAME || '';
  const onSubmit = useCallback(async (payload: any) => {
    let userID: any = '';
    if (search === '?edit=') {
      userID = selectedDetails?.USER_ID
    }
    debugger;
    payload.ACTIVE = payload?.ACTIVE ? 1 : 0;
    // payload.ROLE_ID = payload?.USER_ROLE?.ROLE_ID;
    payload.NEW_USER_ID = search === '?edit=' ? userID : 0;
    payload.DEFAULT_LANGUAGE = payload?.DEFAULT_LANGUAGE?.LANGUAGE_CODE;
    payload.EMPLOYEE_VENDOR = payload?.EMPLOYEE_VENDOR?.WORKFORCE_TYPE;
    payload.VENDOR_CODE = payload?.VENDOR_NAME?.VENDOR_ID;
    payload.USER_NAME = payload?.USER_NAME?.trim();
    // if (USER_ROLE?.ROLETYPE_CODE === "O") {
    //   payload.LOCATION_LIST = payload?.LOCATION_LIST?.map((e: any) => ({
    //     LOCATION_ID: e?.LOCATION_ID,
    //   }))
    // } else {
    //   payload.LOCATION_LIST = [];
    // }
    // payload.LOCATION_LIST = occupLocationAssigned
    if (hasOccupant) {
      payload.LOCATION_LIST = payload?.LOCATION_LIST
      payload.VALIDITY_DATE = moment(payload?.VALIDITY_DATE).format("DD-MM-YYYY");
    } else {
      payload.LOCATION_LIST = [];
      payload.VALIDITY_DATE = '';
    }
    payload.FACILITY_LIST = finalselectedfaciltyRole
    payload.USER_TYPE = payload?.USER_TYPE?.key === "I" ? "I" : "E";

    delete payload.USER_ROLE;
    delete payload.VENDOR_NAME;
    payload.MODE = props?.selectedData || search === "?edit=" ? "E" : "A";
    payload.PARA =
      props?.selectedData || search === "?edit="
        ? { para1: `${props?.headerName}`, para2: "Updated" }
        : { para1: `${props?.headerName}`, para2: "Added" };

    let isValid: boolean;
    let msg: any = ''

    const phonePattern = /^[+]{1}(?:[0-9\-\\/.]\s?){6,15}[0-9]{1}$/;
    if (phonePattern.test(payload?.MOBILE_NO)) {

      if (payload?.MOBILE_NO?.length < 6 || payload?.MOBILE_NO?.length > 16) {
        msg = 'Please Enter valid Mobile Number'
        isValid = false
        setError(true)

      } else {
        isValid = true
      }
    }
    else {
      msg = 'Please Enter valid Mobile Number'
      isValid = false
      setError(true)
    }


    if (isValid) {


      try {
        const filtered = payload?.FACILITY_LIST.filter((e: any) => e?.FACILITY_ID === selectedFacility?.FACILITY_ID);
        if (filtered?.length !== 0 || User_Name !== payload?.USER_NAME) {


          // return
          const res = await callPostAPI(ENDPOINTS?.USERMASTER_SAVE, payload, "A23");
          if (res?.FLAG) {
            toast?.success(res?.MSG);
            const res1 = await callPostAPI(ENDPOINTS?.BUILDING_GET, {});


            if (res1?.FLAG === 1) {
              localStorage.setItem(
                LOCALSTORAGE.FACILITY,
                JSON.stringify(res1?.FACILITYLIST)
              );
            }

            const notifcation: any = {
              "FUNCTION_CODE": props?.functionCode,
              "EVENT_TYPE": "M",
              "STATUS_CODE": search === "?edit=" ? 2 : 1,
              "PARA1": search === "?edit=" ? User_Name : User_Name,
              PARA2: payload?.USER_NAME,
              PARA3: payload?.EMAIL_ID,
              PARA4: payload?.MOBILE_NO,
              PARA5: USER_ROLE?.ROLE_NAME,
              PARA6: USER_TYPEwatch?.name
            };
            const eventPayload = { ...eventNotification, ...notifcation };
            await helperEventNotification(eventPayload);
            props?.getAPI();
            props?.isClick();
          } else {
            toast?.error(res?.MSG);
          }
        } else {
          toast?.error(`${selectedFacility?.FACILITY_NAME ?? ''} facility is in use and cannot be unselected`);
        }


      } catch (error: any) {
        toast?.error('Something went wrong!');
      }
    } else {
      toast.error(msg)
    }
  }, [props?.selectedData, selectedFacility, search, props?.headerName, User_Name, USER_ROLE, USER_TYPEwatch, eventNotification, props?.functionCode, props?.getAPI, props?.isClick, finalselectedfaciltyRole]);

  const onError: SubmitErrorHandler<any> = (errors, _) => {

    if (errors?.EMAIL_ID) {
      toast.error(errors.EMAIL_ID?.message?.toString())
    }
    else {
      toast.error('Please fill all the required field')
    }
  };
  const getUserDetails = async () => {
    // setShowLoader(true);
    const getId: any = localStorage.getItem("Id");
    const assetId: any = JSON.parse(getId);
    const payload: any = {
      NEW_USER_ID:
        props?.selectedData === null
          ? assetId?.USER_ID
          : props?.selectedData?.USER_ID,
      ROLE_ID:
        props?.selectedData === null
          ? assetId?.ROLE_ID
          : props?.selectedData?.ROLE_ID,
    };

    try {
      const response = await callPostAPI(
        ENDPOINTS.getUserDetailsList,
        payload,
        props?.FUNCTION_CODE
      );

      if (response.FLAG === 1) {
        const format = dateFormat()
        setSelectedF(response?.FACILITYLIST);
        setSelectedDetails(response?.USERDETAILS[0]);
        setValue(
          "EMPLOYEE_CODE",
          response?.USERDETAILS[0]?.EMPLOYEE_CODE ?? ""
        );
        setValue("VENDOR_NAME", response?.USERDETAILS[0]?.VENDOR_CODE);
        setValue("USER_NAME", response?.USERDETAILS[0]?.USER_NAME);
        setValue("EMAIL_ID", response?.USERDETAILS[0]?.USER_EMAILID);
        setValue("MOBILE_NO", response?.USERDETAILS[0]?.USER_MOBILENO);
        // setValue(
        //   "VALIDITY_DATE",
        //   response?.USERDETAILS[0]?.VALIDITY_DATE
        //     ? moment(response?.USERDETAILS[0]?.VALIDITY_DATE, format).toDate().toISOString()
        //     : ""
        // );

        // setValue(
        //   "VALIDITY_DATE",
        //   response?.USERDETAILS[0]?.VALIDITY_DATE ? moment(response?.USERDETAILS[0]?.VALIDITY_DATE).format() : ""
        // );
        // const dat = moment(response?.USERDETAILS[0]?.VALIDITY_DATE, format).toDate().toISOString();
        // console.log(dat, "dat")
        // const parsedDate: any = new Date(response?.USERDETAILS[0]?.VALIDITY_DATE);
        // console.log(parsedDate, response?.USERDETAILS[0]?.VALIDITY_DATE, " parsedDate")
        // setValue("VALIDITY_DATE", response?.USERDETAILS[0]?.VALIDITY_DATE ? moment(response?.USERDETAILS[0]?.VALIDITY_DATE, format).toDate() : '');
      }
      setSelectedLocationListid(response?.LOCATIONLIST)
      setSelectedRoleListandBuilding(response?.FACILITYLIST);
      // setShowLoader(false);
    } catch (error) { }
  };

  useEffect(() => {
    // debugger;
    const format = dateFormat()



    const newdate: any = selectedDetails?.VALIDITY_DATE ? moment(selectedDetails?.VALIDITY_DATE, format).toDate() : '';

    setValue("VALIDITY_DATE", newdate);

  }, [selectedDetails, setValue, search]);
  useEffect(() => {
    if (selectedLocationListid && selectedLocationListid.length > 0 && locationtypeOptions && locationtypeOptions?.length > 0) {
      const selectedlocationList: any = locationtypeOptions.filter((store: any) => (

        selectedLocationListid.find((e: any) => e.LOCATION_ID === store.LOCATION_ID)
      ));

      // setlocationtypeOptions(selectedlocationList);
      if (selectedlocationList?.length > 0) {
        setValue("LOCATION_LIST", selectedlocationList);
      } else {
        setValue("LOCATION_LIST", []);
      }
    }
  }, [selectedLocationListid, locationtypeOptions, setValue]);
  const getOptions = async () => {
    const payload = {
      NEW_USER_ID: 0,
    };
    try {
      const res = await callPostAPI(ENDPOINTS.GETUSEROPTIONS, payload);
      setUserroleOptions(res?.ROLELIST);
      setBuildingOptions(res?.FACILITYLIST);
      setWorkforceOptions(res?.WORKFORCELIST);
      setVendorNameOptions(res?.VENDORLIST);
      setLanguageOptions(res?.LANGUAGELIST);
      if (search === "?edit=") {
        await getUserDetails();
      }
    } catch (error) { }
  };
  const getLocation = async () => {

    const res1 = await callPostAPI(
      ENDPOINTS.LOCATION_HIERARCHY_LIST,
      null,
      "HD004"
    );


    if (res1?.FLAG === 1) {

      setlocationtypeOptions(res1?.LOCATIONHIERARCHYLIST);
    }
  }




  const [selectedbuilding, setselectedbuilding] = useState<any | []>([]);
  const [selectedrole, setselectedrole] = useState<any | []>([]);
  const [selectedList, setSelectedList] = useState<any | []>([]);
  const [selectedValidity, setselectedValidity] = useState<any>();


  const watchSelectedBuilding: any = watch("FACILITY_LIST");

  const watchSelectedRole: any = watch("USER_ROLE");
  const watchLocation: any = watch("LOCATION_LIST")
  useEffect(() => {
    if (selectedList?.length > 0) {
      const hasOccupant = selectedList?.some((item: any) => {

        return item.role?.ROLETYPE_CODE === "O" && item?.building?.FACILITY_ID === currentSelectedFacilityId?.FACILITY_ID;
      });
      setHasOccupant(hasOccupant);
    }
  }, [selectedList]);



  // console.log(watchSelectedBuilding, typeof (watchSelectedBuilding), "<---watchSelectedBuilding", watchSelectedRole, "<---watchSelectedRole");
  // console.log(error, "error");
  const handleAdd = async (e: any) => {

    e.preventDefault();

    // if ((!watchSelectedBuilding || watchSelectedBuilding === "" || watchSelectedBuilding === null) && (!watchSelectedRole || watchSelectedRole === "" || watchSelectedRole === null)) {
    //   toast.error("Please fill the required fields.");
    //   return;
    // }
    if ((!watchSelectedBuilding || watchSelectedBuilding === "" || watchSelectedBuilding === null)
      || (!watchSelectedRole || watchSelectedRole === "" || watchSelectedRole === null)) {
      setErrorss(true);
      toast.error("Please fill the required fields.");
      return;
    }

    const isOccupationRequired = selectedrole?.ROLETYPE_CODE === "O";
    if (isOccupationRequired && (watchLocation || watchLocation?.length > 0)) {
      // await getLocation(watchSelectedBuilding?.FACILITY_ID);
    }
    // const hasOccupationLocation = !!selectedOccupLocation
    // // const hasselectedValidity = !!selectedValidity
    // console.log(hasselectedValidity, "hasselectedValidity")
    if (selectedbuilding && selectedrole) {
      setErrorss(false);
      const entry = {
        building: selectedbuilding,
        role: selectedrole,
        // ...(isOccupationRequired && hasOccupationLocation && { occupationLocation: selectedOccupLocation }),
        // ...(isOccupationRequired && hasOccupationLocation && {
        //   validity: onlyDateFormat(selectedValidity),
        // })


      };



      // Avoid duplicates if needed
      const exists = selectedList?.some(
        (item: any) =>
          (item.building?.FACILITY_ID === selectedbuilding?.FACILITY_ID)

      );

      if (!exists) {
        setSelectedList((prev: any) => [...prev, entry]);
      } else {
        toast.error("This building or role  already exists.");
      }

      // Reset dropdowns if needed
      // setselectedbuilding(null);
      // setselectedrole(null);

      // Clear values from form as well if needed
      setValue("FACILITY_LIST", "");
      setValue("USER_ROLE", '');
    }
  };


  const handleRemove = (indexToRemove: number, e: any) => {
    e.preventDefault();

    const updatedList = selectedList.filter((_: any, index: any) => index !== indexToRemove);
    setSelectedList(updatedList);

    setfinalselectedfaciltyRole(updatedList?.map((item: any) => ({
      FACILITY_ID: item.building?.FACILITY_ID,
      ROLE_ID: item.role?.ROLE_ID,
      ROLETYPE_CODE: item.role?.ROLETYPE_CODE,
      // VALIDITY_DATE: typeof (item?.validity) === "string" ? item?.validity : onlyDateFormat(item?.validity ?? "")

    })))
    setValue("FACILITY_LIST1", updatedList?.map((item: any) => item?.building?.FACILITY_NAME).join(", ") || []);


  };


  // const handleSave = async (e: any) => {
  //   e.preventDefault();
  //   if (selectedList && selectedList?.length > 0) {
  //     const fieldNames = selectedList
  //       .filter((item: any) => item?.role?.ROLETYPE_CODE === 'O')
  //       .map((item: any) => `LOCATION_LIST_${item.building?.FACILITY_ID}`);

  //     const validationResults = await Promise?.all(fieldNames?.map((name: any) => trigger(name)));
  //     const allValid = validationResults?.every(Boolean);

  //     if (!allValid) {
  //       setisAllValid(true)
  //       toast.error("Please fill required fields.");
  //       return;
  //     }

  //     setValue("FACILITY_LIST1", selectedList?.map((item: any) => item?.building?.FACILITY_NAME)?.join(", ") || []);

  //     setValue("FACILITY_LIST", "")
  //     setValue("USER_ROLE", "")
  //     showEquipmentlist(false);
  //   } else {
  //     setErrorss(true);

  //   }
  // }

  useEffect(() => {
    selectedList.forEach((item: any, index: number) => {
      const format = dateFormat()
      const dynamicvalidityName = `VALIDITY_DATE_${index}`;

      if (item?.validity) {

        // if ((item?.validity === moment(new Date()).format(format))) {
        //   setValue(dynamicvalidityName as any, "");
        // } else {


        const parsedDate = moment(item.validity, format).toDate();
        setValue(dynamicvalidityName as any, parsedDate);
        // }


      }
    });
  }, [selectedList, setValue]);


  const handleSave = async (e: any) => {
    e.preventDefault();

    if (!selectedList || selectedList.length === 0) {
      setErrorss(true);
      return;
    }

    // Only collect validation field names for entries with ROLETYPE_CODE === 'O'
    // const validationFieldNames = selectedList
    //   .map((item: any, index: number) => {
    //     if (item?.role?.ROLETYPE_CODE === 'O') {
    //       return {
    //         location: `LOCATION_LIST_${item.building?.FACILITY_ID}`,
    //         validity: `VALIDITY_DATE_${index}`
    //       };
    //     }
    //     return null;
    //   })
    //   .filter(Boolean); // Remove nulls
    // console.log(validationFieldNames, 'validationFieldNames')
    // // Flatten field names into a single array for validation
    // const allFieldsToValidate = validationFieldNames.flatMap((f: any) => [f.location, f.validity]);

    // // Trigger validation for each relevant field
    // const validationResults = await Promise.all(
    //   allFieldsToValidate.map((name: any) => trigger(name))
    // );

    // const allValid = validationResults.every(Boolean);

    // if (!allValid) {
    //   setisAllValid(true);
    //   toast.error("Please fill the required fields.");
    //   return;
    // }

    // Set the selected facility names in FACILITY_LIST1
    setValue(
      "FACILITY_LIST1",
      selectedList
        .map((item: any) => item?.building?.FACILITY_NAME)
        .join(", ") || ""
    );

    // Reset form values as needed
    setValue("FACILITY_LIST", "");
    setValue("USER_ROLE", "");

    // Close the equipment list popup
    showEquipmentlist(false);
  };



  const handleCancel = async (e: any) => {
    e.preventDefault();
    showEquipmentlist(false);
    setValue("FACILITY_LIST", "")
    setValue("USER_ROLE", "")
    setErrorss(false)



  }


  useEffect(() => {
    // Step 1: Set FACILITY + ROLE mapping for backend
    if (selectedList?.length > 0) {
      setfinalselectedfaciltyRole(
        selectedList.map((item: any) => ({
          FACILITY_ID: item?.building?.FACILITY_ID,
          ROLE_ID: item.role?.ROLE_ID,
          ROLETYPE_CODE: item?.role?.ROLETYPE_CODE,
          // VALIDITY_DATE: typeof (item?.validity) === "string" ? item?.validity : onlyDateFormat(item?.validity ?? "")
        }))
      );
    }

    // Step 2: Construct full LOCATION assignments
    const facilityLocationPairs = selectedList?.flatMap((item: any) => {
      const facilityId = item?.building?.FACILITY_ID;

      // ✅ If user updated dropdown, use occupationLocation
      if (Array.isArray(item?.occupationLocation) && item.occupationLocation?.length > 0) {
        return item.occupationLocation?.map((location: any) => ({
          FACILITY_ID: facilityId,
          LOCATION_ID: location.LOCATION_ID,
          ROLETYPE_CODE: "O", // Hardcoded as requested
        }))
      }

      // ✅ Else fallback to selectedLocationListid (data from backend)
      return selectedLocationListid
        .filter((loc: any) => loc.FACILITY_ID === facilityId)
        .map((loc: any) => ({
          FACILITY_ID: loc.FACILITY_ID,
          LOCATION_ID: loc.LOCATION_ID,
          ROLETYPE_CODE: "O", // Also hardcoded here
        }));
    });

    // Step 3: Deduplicate by FACILITY_ID + LOCATION_ID
    const uniquePairs = facilityLocationPairs.filter(
      (pair: any, index: any, self: any) =>
        index === self?.findIndex(
          (p: any) => p.FACILITY_ID === pair?.FACILITY_ID && p?.LOCATION_ID === pair?.LOCATION_ID
        )
    );

    // Step 4: Set the final list
    setoccupLocationAssigned(uniquePairs);


  }, [selectedList, selectedLocationListid]);





  const filteredRoleList = (buildingId: any) => {
    const filteredFacilityRoleList = userroleOptions?.filter(
      (item: any) =>
        item?.FACILITY_ID === 0 || item?.FACILITY_ID === buildingId
    );

    setbuildingfilteredRoleList(filteredFacilityRoleList);
    return filteredFacilityRoleList;
  };

  useEffect(() => {
    if (selectedList && selectedList?.length > 0) {

      const SELECTED_FACILITY_LIST_ROLE = selectedList && selectedList?.map((item: any) => ({
        FACILITY_ID: item?.building?.FACILITY_ID,
        ROLE_ID: item?.role?.ROLE_ID,
        ROLETYPE_CODE: item?.role?.ROLETYPE_CODE,

        // VALIDITY_DATE: typeof (item?.validity) === "string" ? item?.validity : onlyDateFormat(item?.validity ?? "")

      }));

      if (SELECTED_FACILITY_LIST_ROLE && SELECTED_FACILITY_LIST_ROLE?.length > 0) {
        setfinalselectedfaciltyRole(SELECTED_FACILITY_LIST_ROLE);
      }
    }

    setValue("FACILITY_LIST1", selectedList?.map((item: any) => item?.building?.FACILITY_NAME).join(", ") || []);

    if (search === '?edit=') {
      if (buildingOptions && buildingOptions?.length > 0 && selectedRoleListandBuilding && selectedRoleListandBuilding?.length > 0 && userroleOptions && userroleOptions?.length > 0) {

        const matchedList = selectedRoleListandBuilding.map((item: any) => {
          const building = buildingOptions.find((b: any) => b.FACILITY_ID === item.FACILITY_ID);
          const role = userroleOptions?.find((r: any) => r.ROLE_ID === item.ROLE_ID);
          return {
            building,
            role,
            // ...(item.VALIDITY_DATE && { validity: item.VALIDITY_DATE })
          };
        });

        if (matchedList && matchedList?.length > 0) {
          setSelectedList(matchedList);
          setValue("FACILITY_LIST1", matchedList?.map((item: any) => item?.building?.FACILITY_NAME).join(", ") || []);
        }
      }
    }
  }, [selectedRoleListandBuilding, setSelectedList, setValue, search === '?edit=',]);



  useEffect(() => {
    (async function () {
      await getOptions();
      await saveTracker(currentMenu)
      await getLocation();

    })();
  }, []);

  useEffect(() => {
    setValue("EMPLOYEE_CODE", EMPLOYEE_CODE);
    setValue("VENDOR_NAME", VENDOR_NAME);
  }, [EMPLOYEE_VENDOR]);

  return (
    <section className="w-full">
      <form onSubmit={handleSubmit(onSubmit, onError)}>
        <FormHeader
          headerName={props?.headerName}
          isSelected={props?.selectedData ? true : false}
          isClick={props?.isClick}
        />

        <Card className="mt-2">
          <div className="mt-1 grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-3 lg:grid-cols-3">
            <Field
              controller={{
                name: "USER_NAME",
                control: control,
                render: ({ field }: any) => {
                  return (
                    <InputField
                      {...register("USER_NAME", {
                        required: t("Please fill the required fields."),
                        validate: value => value.trim() !== "" || t("Please fill the required fields.")

                      })}
                      label="User Name"
                      require={true}
                      placeholder={t("Please Enter")}
                      invalid={errors.USER_NAME}
                      // invalidMessage={errors.MOBILE_NO?.message}
                      {...field}
                    />
                  );
                },
              }}
            />
            <Field
              controller={{
                name: "EMAIL_ID",
                control: control,
                render: ({ field }: any) => {
                  return (
                    <InputField
                      {...register("EMAIL_ID", {
                        required: t("Please fill the required fields."),
                        pattern: {
                          value: EMAIL_REGEX,
                          message: "Invalid email format",
                        },
                        maxLength: {
                          value: VALIDATION.Max_EMAIL_LENGTH,
                          message: `Max ${VALIDATION.Max_EMAIL_LENGTH} Characters Only`,
                        },
                      })}
                      label="Email Id"
                      require={true}
                      placeholder={t("Please Enter")}
                      invalid={errors.EMAIL_ID}
                      // invalidMessage={errors.EMAIL_ID?.message}
                      {...field}
                      setValue={setValue}
                    />
                  );
                },
              }}
            />
            <div className={error === true ? "errorBorder" : ""}>
              <Field
                controller={{
                  name: "MOBILE_NO",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <InputField
                        {...register("MOBILE_NO", {
                          required: true,
                          onChange: (() => {
                            setError(false)
                          }),
                          validate: (fieldValue: any) => {
                            return validation?.phoneWithInternationNumber(
                              fieldValue,
                              "MOBILE_NO",
                              setValue
                            );
                          },

                        })}
                        label="Mobile"
                        require={true}
                        placeholder={t("Please Enter")}
                        invalid={error === false ? errors.MOBILE_NO : ''}
                        invalidMessage={errors.MOBILE_NO?.message}
                        {...field}
                        setValue={setValue}
                      />
                    );
                  },
                }}
              />
            </div>
            {/* <Field
              controller={{
                name: "USER_ROLE",
                control: control,
                render: ({ field }: any) => {
                  return (
                    <Select
                      options={userroleOptions}
                      {...register("USER_ROLE", {
                        required: t("Please fill the required fields."),
                      })}
                      label="User Role"
                      optionLabel="ROLE_NAME"
                      placeholder={t("Please Select")}
                      require={true}
                      findKey={"ROLE_ID"}
                      selectedData={selectedDetails?.ROLE_ID}
                      invalid={errors.USER_ROLE}
                      setValue={setValue}
                      {...field}
                    />
                  );
                },
              }}
            /> */}
            {/* <Field
              controller={{
                name: "FACILITY_LIST",
                control: control,
                render: ({ field }: any) => {
                  return (
                    <MultiSelects
                      options={buildingOptions}
                      {...register("FACILITY_LIST", {
                        required: t("Please fill the required fields."),
                      })}
                      label="Building Name"
                      optionLabel="FACILITY_NAME"
                      require={true}
                      setValue={setValue}
                      selectedData={selectedF}
                      findKey={"FACILITY_NAME"}
                      invalid={errors.FACILITY_LIST}
                      {...field}
                    />
                  );
                },
              }}
            /> */}
            <Field
              controller={{
                name: "FACILITY_LIST1",
                control: control,
                render: ({ field }: any) => {
                  return (
                    <InputField
                      {...register("FACILITY_LIST1", {
                        required: t(
                          "Please fill the required fields.111"
                        ),
                        // validate: (value) =>
                        //   value.trim() !== "" ||
                        //   t("Please fill the required fields."),
                      })}
                      require={true}
                      label="Select Building"
                      invalid={errors.FACILITY_LIST1}
                      readOnly={true}
                      placeholder={"role"}
                      setValue={setValue}
                      onClick={(e: any) =>
                        showEquipmentlist(true)
                      }
                      {...field}
                    />
                  );
                },
              }}
            />


            <Field
              controller={{
                name: "EMPLOYEE_VENDOR",
                control: control,
                render: ({ field }: any) => {
                  return (
                    <Select
                      options={workforceOptions}
                      {...register("EMPLOYEE_VENDOR", {
                        required: t("Please fill the required fields."),
                      })}
                      label="Workforce Type"
                      optionLabel="WORKFORCE_NAME"
                      placeholder={t("Please Select")}
                      findKey={"WORKFORCE_TYPE"}
                      require={true}
                      selectedData={selectedDetails?.EMPLOYEE_VENDOR}
                      setValue={setValue}
                      invalid={errors.EMPLOYEE_VENDOR}
                      {...field}
                    />
                  );
                },
              }}
            />

            {EMPLOYEE_VENDOR?.WORKFORCE_TYPE === "E" ? (
              <Field
                controller={{
                  name: "EMPLOYEE_CODE",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <InputField
                        {...register("EMPLOYEE_CODE", {
                          //   required: "Please fill the required fields.",
                        })}
                        label="Employee Code"
                        placeholder={t("Please Enter")}
                        invalid={errors.EMPLOYEE_CODE}
                        {...field}
                      />
                    );
                  },
                }}
              />
            ) : (
              <Field
                controller={{
                  name: "VENDOR_NAME",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <Select
                        {...register("VENDOR_NAME", {
                          required: "Please fill the required fields.",
                          validate: {
                            // Custom validation for checking if the value is 0 or blank
                            checkValue: value => {
                              if (!value || value === '0') {
                                return "Please select a valid vendor name.";
                              }
                              return true; // Valid
                            }
                          }
                        })}
                        label="Vendor Name"
                        options={vendorNameOptions}
                        optionLabel="VENDOR_NAME"
                        placeholder={t("Please Select")}
                        findKey={"VENDOR_ID"}
                        require={true}
                        selectedData={selectedDetails?.VENDOR_CODE}
                        setValue={setValue}
                        invalid={errors.VENDOR_NAME}

                        {...field}
                      />
                    );
                  },
                }}
              />
            )}
            <Field
              controller={{
                name: "DEFAULT_LANGUAGE",
                control: control,
                render: ({ field }: any) => {
                  return (
                    <Select
                      {...register("DEFAULT_LANGUAGE", {
                        required: t("Please fill the required fields."),
                      })}
                      options={languageOptions}
                      label="Default Language"
                      optionLabel="LANGUAGE_DESCRIPTION"
                      placeholder={t("Please Select")}
                      findKey={"LANGUAGE_CODE"}
                      require={true}
                      selectedData={selectedDetails?.DEFAULT_LANGUAGE}
                      setValue={setValue}
                      invalid={errors.DEFAULT_LANGUAGE}
                      {...field}
                    />
                  );
                },
              }}
            />
            {selectedList?.length > 0 && hasOccupant && (
              <div>

                <Field
                  controller={{
                    name: "LOCATION_LIST",
                    control: control,
                    render: ({ field }: any) => {

                      return (
                        <MultiSelects
                          options={locationtypeOptions}
                          {...register("LOCATION_LIST", {
                            required: hasOccupant === true ? t("Please fill the required fields.") : false,
                          })}
                          label="Location"
                          optionLabel="LOCATION_DESCRIPTION"
                          findKey={"LOCATION_ID"}
                          require={true}
                          maxSelectedLabels={4}
                          selectedData={selectedLocationListid || []}
                          setValue={setValue}
                          invalid={errors.LOCATION_LIST}
                          {...field}
                        />
                      );
                    },
                  }}
                />
              </div>
            )}
            {selectedList?.length > 0 && hasOccupant && <div >
              <Field
                controller={{
                  name: "VALIDITY_DATE",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <DateCalendar
                        {...register("VALIDITY_DATE", {
                          required: hasOccupant === true ? t("Please fill the required fields.") : false,
                        })}
                        label="Validity Date"
                        setValue={setValue}
                        // disabled={disableFields}
                        require={true}
                        invalid={errors.VALIDITY_DATE}
                        showIcon
                        minDate={new Date()}
                        {...field}
                      />
                    );
                  },
                }}
              />
            </div>
            }

            {/* {USER_ROLE?.ROLETYPE_CODE === "O" && (
              <div className="w-full">
                <Field
                  controller={{
                    name: "LOCATION_LIST",
                    control: control,
                    render: ({ field }: any) => {
                      return (
                        <MultiSelects
                          // className="location-dropdown"
                          options={locationtypeOptions}
                          {...register("LOCATION_LIST", {
                            required: USER_ROLE?.ROLETYPE_CODE === "O" ? t("Please fill the required fields.") : false,
                            // onChange: (e: any) => {
                            //   const selectedOptions = e.target.value;
                            //   const updatedLocations = selectedOptions.map((location: any) => ({
                            //     LOCATION_ID: location.LOCATION_ID,

                            //   }));
                            //   // setLocation(updatedLocations);
                            //   let locationStatus: any = true;
                            //   // getDashboardDetails(locationStatus, updatedLocations);
                            // },
                          })}
                          placeholder="Select Location"
                          label="Location"
                          optionLabel="LOCATION_DESCRIPTION"
                          //findKey={"USER_ID"}
                          isLocation={true}
                          require={true}
                          invalid={errors.LOCATION_LIST}
                          //  selectedData={assigneeList}
                          // maxSelectedLabels={3}
                          findKey={"LOCATION_ID"}
                          //  selectedData={selectedLocationListid}
                          setValue={setValue}
                          {...field}
                        />
                      );
                    },
                  }}
                />
              </div>)} */}

            <Field
              controller={{
                name: "USER_TYPE",
                control: control,
                render: ({ field }: any) => {
                  return (
                    <>
                      <Radio
                        {...register("USER_TYPE", {
                          required: t("Please fill the required fields."),
                        })}
                        labelHead="User Type"
                        options={userTypeLabel}
                        selectedData={selectedDetails?.USER_TYPE || "E"}
                        setValue={setValue}
                        {...field}
                      />
                    </>
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
                        checked={props?.selectedData?.ACTIVE || false}
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
      </form>

      <Dialog
        visible={visibleEquipmentlist}
        style={{ width: "800px", height: "800px" }}
        className="dialogBoxTreeStyle"
        dismissableMask
        // header="Select Building and Role"
        onHide={() => {
          if (!visibleEquipmentlist) return;
          showEquipmentlist(false);
        }}
      >
        {/* <div className="serviceEquipment"> */}
        <div className=" h-full px-3 py-3 flex w-full gap-3  ">
          <form className="w-full flex flex-col   h-full">
            <div className="flex flex-col gap-3">
              <h6>Edit Building and Role</h6>
              <div className="flex gap-3 ">
                <div className="grow">
                  <div className={`${errorss === true && (watchSelectedBuilding === "" || watchSelectedBuilding === null || watchSelectedBuilding === undefined) ? "errorBorder" : ""}`}>
                    <Field
                      controller={{
                        name: "FACILITY_LIST",
                        control: control,
                        render: ({ field }: any) => {
                          return (
                            <Select
                              options={buildingOptions}
                              {...register("FACILITY_LIST", {
                                // required: t("Please fill the required fields."),
                                onChange: (e: any) => {

                                  setselectedbuilding(e?.target?.value);
                                  // setselectedrole([]);
                                  filteredRoleList(e?.target?.value?.FACILITY_ID);
                                  // setValue("USER_ROLE", "");
                                  // setBuilding(e?.target?.value);
                                  setValue("FACILITY_LIST", e?.target?.value);
                                }
                              })}
                              label="Building Name"

                              optionLabel="FACILITY_NAME"
                              require={true}
                              setValue={setValue}
                              selectedData={selectedF}
                              findKey={"FACILITY_NAME"}
                              // invalid={errors.FACILITY_LIST}
                              {...field}

                            />
                          );
                        },
                      }}
                    />
                  </div>


                </div>

                <div className="grow">
                  <div className={`${errorss === true && (watchSelectedRole === "" || watchSelectedRole === null || watchSelectedRole === undefined) ? "errorBorder" : ""}`}>
                    <Field
                      controller={{
                        name: "USER_ROLE",
                        control: control,
                        render: ({ field }: any) => {
                          return (
                            <Select
                              options={buildingfilteredRoleList}
                              {...register("USER_ROLE", {
                                // required: t("Please fill the required fields."),
                                onChange: (e: any) => {

                                  setselectedrole(e?.target?.value);
                                  // setValue("USER_ROLE", e?.target?.value);
                                }
                              })}
                              label="User Role"
                              optionLabel="ROLE_NAME"
                              placeholder={t("Please Select")}
                              require={true}
                              findKey={"ROLE_ID"}
                              // selectedData={selectedDetails?.ROLE_ID}
                              // invalid={errors.USER_ROLE}
                              setValue={setValue}
                              {...field}
                            />
                          );
                        },
                      }}
                    />
                  </div>


                </div>
                <div className="flex justify-end mt-6">
                  <Button
                    icon="pi pi-plus"
                    // label={isEdit.isEdit ? "Update" : "Add"}
                    label="Add"
                    onClick={handleAdd}
                    className="p-button-text"
                    style={{ height: '40px', border: '1px solid #E5E4E2', backgroundColor: "#8e724a", color: "white", padding: '14px 20px', }}
                  />
                </div>

              </div>
              {/* {watchSelectedRole?.ROLETYPE_CODE === "O" && (
                <div className={`${errorss === true && (watchLocation === "" || watchLocation === null || watchLocation === undefined || watchLocation?.length === 0) ? "errorBorder" : ""}`}>
                  <Field
                    controller={{
                      name: "LOCATION_LIST",
                      control: control,
                      render: ({ field }: any) => {
                        return (
                          <MultiSelects
                            // className="location-dropdown"
                            options={locationtypeOptions}
                            {...register("LOCATION_LIST", {
                              // required: USER_ROLE?.ROLETYPE_CODE === "O" ? t("Please fill the required fields.") : false,
                              onChange: (e: any) => {
                                const selectedOptions = e.target.value;
                                setselectedOccupLocation(e.target.value)
                                //   const updatedLocations = selectedOptions.map((location: any) => ({
                                //     LOCATION_ID: location.LOCATION_ID,

                                //   }));
                                //   // setLocation(updatedLocations);

                                //   let locationStatus: any = true;
                                //   // getDashboardDetails(locationStatus, updatedLocations);
                              },
                            })}
                            placeholder="Select Location"
                            label="Location"
                            optionLabel="LOCATION_DESCRIPTION"
                            //findKey={"USER_ID"}
                            isLocation={true}
                            require={true}
                            // invalid={errors.LOCATION_LIST}
                            //  selectedData={assigneeList}
                            maxSelectedLabels={4}
                            findKey={"LOCATION_ID"}
                            //  selectedData={selectedLocationListid}
                            setValue={setValue}
                            {...field}
                          />
                        );
                      },
                    }}
                  />

                </div>)} */}



            </div>
            <div style={{ flex: 1, overflowY: 'auto' }} className="mt-4">
              {selectedList.length > 0 && (
                <div className="mt-4">
                  {/* Header Row */}
                  <div className="flex justify-between font-semibold border-b pb-2 mb-2 px-2">
                    <div >Building</div>
                    <div >Role</div>

                    <div className="w-24 text-right">Action</div>
                  </div>

                  {/* List of selected items */}
                  <ul className="space-y-2">
                    {selectedList.map((item: any, index: number) => {

                      // const facilityId = item.building?.FACILITY_ID;
                      // const dynamicFieldName = `LOCATION_LIST_${facilityId}`;
                      // const dynamicvalidityName = `VALIDITY_DATE_${index}`


                      // const defaultSelected = selectedLocationListid
                      //   .filter((loc: any) => loc.FACILITY_ID === facilityId)
                      //   .map((loc: any) =>
                      //     locationtypeOptions.find((opt: any) => opt.LOCATION_ID === loc.LOCATION_ID)
                      //   )

                      //   .filter(Boolean);
                      // console.log(defaultSelected, "defaultSelected")


                      return (
                        <li
                          key={index}
                          className="flex justify-between items-center bg-gray-50 p-2 rounded border"
                        >
                          <div className="flex-1">{item.building?.FACILITY_NAME}</div>
                          <div className="flex-1 ml-[3rem]">{item.role?.ROLE_NAME}</div>
                          {/* 
                          <div className="flex-1">
                            {(item.role?.ROLETYPE_CODE === 'O') && (
                              <Field
                                controller={{
                                  name: dynamicFieldName,
                                  control: control,
                                  rules: {
                                    required: "Location is required",
                                    validate: (value: any) => value?.length > 0 || "Please select at least one location",
                                  },
                                  defaultValue: defaultSelected,
                                  render: ({ field, fieldState }: any) => (
                                    <div className={`${fieldState.error ? "errorBorder" : ""}`}>
                                      <MultiSelects
                                        {...field}
                                        value={field.value || []}
                                        options={locationtypeOptions}
                                        placeholder="Select Location"
                                        label="Location"
                                        optionLabel="LOCATION_DESCRIPTION"
                                        isLocation={true}
                                        require={true}
                                        error={!!fieldState.error}
                                        findKey="LOCATION_ID"
                                        maxSelectedLabels={1}
                                        onChange={(e: any) => {
                                          const selectedOptions = e.target.value;


                                          field.onChange(selectedOptions);
                                          setValue(dynamicFieldName as any, selectedOptions);

                                          const updatedList = [...selectedList];
                                          updatedList[index].occupationLocation = selectedOptions;

                                          setSelectedList(updatedList);
                                        }}
                                      />
                                    </div>
                                  ),
                                }}
                              />

                            )}
                          </div>
                          <div className="flex-1 p-2">
                            {(item.role?.ROLETYPE_CODE === 'O') && (
                              <Field
                                controller={{
                                  name: dynamicvalidityName,
                                  control: control,
                                  rules: {
                                    required: "Please fill the required fields."
                                  },

                                  render: ({ field, fieldState }: any) => (
                                    <DateCalendar
                                      {...field}
                                      label="Validity Date"
                                      value={field.value || null}
                                      showIcon
                                      require={true}
                                      setValue={setValue}
                                      invalid={!!fieldState.error}
                                      minDate={new Date()}
                                      onChange={(date: any) => {
                                        field.onChange(date);

                                        setselectedValidity((date?.value))
                                        const updatedList = [...selectedList];
                                        updatedList[index].validity = date?.value || date;
                                        setSelectedList(updatedList);

                                      }}
                                    />
                                  )
                                }}
                              />

                            )}
                          </div> */}

                          <div className="w-24 flex justify-end gap-2">
                            <Button
                              icon="pi pi-times"
                              className="p-button-rounded p-button-text p-button-danger"
                              onClick={(e) => handleRemove(index, e)}
                            />
                          </div>
                        </li>
                      );
                    })}

                  </ul>
                </div>
              )}
            </div>



            <div style={{
              display: 'flex', justifyContent: 'flex-end', marginTop: "auto",
              paddingTop: "10px"
            }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <Button
                  type="button"
                  label="Cancel"
                  className="p-button-text"
                  onClick={handleCancel}
                  style={{ height: '40px', border: '1px solid #E5E4E2', padding: '14px 20px', }}
                />
                <Button
                  type="button"
                  label="Save"
                  // icon="pi pi-check"
                  onClick={handleSave}
                  className="p-button-text"
                  style={{ height: '40px', border: '1px solid #E5E4E2', backgroundColor: "#8e724a", color: "white", padding: '14px 20px', }}
                />
              </div>

            </div>
          </form>

        </div>
        {/* </div> */}

      </Dialog >
    </section >
  );
};

export default UserMasterForm;
