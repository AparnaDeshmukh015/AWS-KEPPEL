import InputField from "../../../components/Input/Input";
import Buttons from "../../../components/Button/Button";
import { Card } from "primereact/card";
import { useFieldArray, useForm } from "react-hook-form";
import Field from "../../../components/Field";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { callPostAPI } from "../../../services/apis";
import { ENDPOINTS } from "../../../utils/APIEndpoints";
import { toast } from "react-toastify";
import Select from "../../../components/Dropdown/Dropdown";
import moment from "moment";
import Radio from "../../../components/Radio/Radio";
import CancelDialogBox from "../../../components/DialogBox/CancelDialogBox";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import {
  dateFormat,
  LOCALSTORAGE,
  saveTracker,
  formateDate,
  onlyDateFormat
} from "../../../utils/constants";
import {
  eventNotification,
  helperEventNotification,
} from "../../../utils/eventNotificationParameter";
import { InputTextarea } from "primereact/inputtextarea";
import userIcon from "../../../assest/images/Avatar.png";
import "../Workorder/WorkorderMaster.css";
import { TabView, TabPanel } from "primereact/tabview";
import noDataIcon from "../../../assest/images/nodatafound.png";
import MultiSelects from "../../../components/MultiSelects/MultiSelects";
import WoDocumentUpload from "../../../components/pageComponents/DocumentUpload/WoDocumentUpload";
import { Timeline } from "primereact/timeline";
import { Dialog } from "primereact/dialog";
import { Chip } from "primereact/chip";
import "./ServiceRequest.css"
import { appName } from "../../../utils/pagePath";
import { decryptData } from "../../../utils/encryption_decryption";
import { PATH } from "../../../utils/pagePath";
import LoaderS from "../../../components/Loader/Loader";

const ServiceRequestDetailForm = (props: any) => {
  let [CURRENT_STATUS, setCurrentStatus] = useState<any>(0);

  const facilityData: any = JSON?.parse(
    localStorage.getItem(LOCALSTORAGE?.FACILITY)!
  );
  const Currentfacility: any = JSON.parse(((localStorage.getItem(LOCALSTORAGE.FACILITYID)))!);
  const [selectedFacility, menuList]: any = useOutletContext();
  const [transactionStatus, setTransactionStatus] = useState<any | null>()
  const { t } = useTranslation();
  const navigate: any = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const [userId, setUserId] = useState<any | null>();
  const [Descriptionlength, setDescriptionlength] = useState(0);

 console.log(Currentfacility, 'Currentfacility')
  const [options, setOptions] = useState<any | null>([]);

  const [TeamList, setTeamList] = useState<any | null>([]);
  const [workOrderOption, setWorkOrderOption] = useState<any | null>([]);
  const [technician, setTechnician] = useState<any | null>([]);
  const [Currenttechnician, setCurrentTechnician] = useState<any | null>([]);
  const [selectedDetails, setSelectedDetails] = useState<any>([]);
  const [technicianDetails, setTechnicianDetails] = useState<any>([]);
  const [status, setStatus] = useState<any | null>(false);
  const [assignStatus, setAssignStatus] = useState(false);
  const [technicianStatus, setTechnicianStatus] = useState<any | null>();
  const [locationtypeOptions, setlocationtypeOptions] = useState([]);
  const [technicianData, setTechnicianData] = useState<any | null>([])
  const [loading, setLoading] = useState<any | null>(false)
  const [editStatus, setEditStatus] = useState(true);
  const [PriorityEditStatus, setPriorityEditStatus] = useState(false);
  const [IsSubmit, setIsSubmit] = useState<any | null>(false);
  const [IsGenerateWorkOrder, setIsGenerateWorkOrder] = useState<any | null>(false);

  const [docOption, setDocOption] = useState<any | null>([]);
  const [type, setType] = useState<any | null>([]);
  const [technicianList, setTechnicianList] = useState<any | null>([]);
  const [ActivityTimeLineList, setActivityTimeLineList] = useState<any | null>([]);
  const [severity, setSeverity] = useState<any | null>([])
  const [assetList, setAssetList] = useState<any | null>([]);
  const id: any = decryptData(localStorage.getItem("USER_ID"));
  const [error, setError] = useState<any | null>(false)
  let { pathname } = useLocation();
  const location: any = useLocation();
  const currentMenu = menuList
    ?.flatMap((menu: any) => menu?.DETAIL)
    .filter((detail: any) => detail.URL === pathname)[0];
  const assestTypeLabel: any = [
    { name: "Equipment", key: "A" },
    { name: "Soft Services", key: "N" },
  ];

  const { search } = useLocation();
  const [visibleImage, setVisibleImage] = useState<boolean>(false);
  const [showImage, setShowImage] = useState<any>([]);
  const handleInputChange = (event: any) => {
    const value = event.target.value;
    setDescriptionlength(value.length);
  };



  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      // WO_ID: props?.selectedData ? props?.selectedData?.WO_ID : 0,
      WO_ID: search === '?add=' ? 0 : localStorage.getItem("WO_ID"),
      SER_REQ_NO: props?.selectedData ? props?.selectedData?.SER_REQ_NO : "",
      REQ_ID: "",
      ASSET_ID: "",
      GROUP: "",
      TYPE: "",
      MODE: props?.selectedData ? "E" : "A",
      PARA: "",
      WO_TYPE: "CM",
      RAISEDBY_ID: decryptData(localStorage.getItem("USER_ID")),
      ASSET_NONASSET: "",
      LOCATION_ID: "",
      REQUESTTITLE_ID: "",
      SEVERITY_CODE: props?.selectedData?.SEVERITY_CODE ?? 3,
      ASSETTYPE: "",
      WO_DATE: props?.selectedData
        ? props?.selectedData?.WO_DATE
        : moment(new Date()).format("DD-MM-YYYY"),
      WO_REMARKS: "",
      ASSIGN_TEAM_ID: "",
      ASSIGN_WORKFORCE_ID: "",
      DOC_LIST: [],
      TECH_ID: [],
      EMAIL_ID: "",
      PHONE_NO: "",
      RAISED_BY: decryptData(localStorage.getItem("USER_ID")),
      REPORTER_NAME: "",
      REPORTER_EMAIL: "",
      REPORTER_MOBILE: "",
      REMARKS: "",

    },

    mode: "onSubmit",
  });


  const { append, remove } = useFieldArray({
    name: "DOC_LIST",
    control,
  });
  useEffect(() => {
    const sevrityList: any = severity?.filter((f: any) => f.SEVERITY_ID === f?.SEVERITY_ID)
    setSeverity(sevrityList)
  }, [PriorityEditStatus])

  const OpenPriorityDropDown = () => {
    if (PriorityEditStatus === true) {
      setPriorityEditStatus(false);
    } else if (PriorityEditStatus === false) {

      setValue('SEVERITY_CODE', selectedDetails?.SEVERITY_CODE)
      setPriorityEditStatus(true);
    }
  };

  const ClosePriorityPopUp = () => {
    if (PriorityEditStatus === true) {
      setPriorityEditStatus(false);
    }
  };

  const OpenAssignUserPopUp = () => {
    if (assignStatus === false) {
      setEditStatus(true);
      setAssignStatus(true);
    } else if (assignStatus === true) {
      setEditStatus(false);
      setAssignStatus(false);
    }
  };

  const onClickCancelButton = () => {
    setValue('TECH_ID', []);
    handleClearAll()

    if (editStatus === true && assignStatus === false && PriorityEditStatus === false) {
      navigate('/servicerequestlist')
      return
    } else if (editStatus === true && assignStatus === true && PriorityEditStatus === false && search === "?add=") {
      setAssignStatus(false);
      navigate('/servicerequestlist')
      return
    } else if (editStatus === true && assignStatus === false && PriorityEditStatus === true) {
      setValue('SEVERITY_CODE', '')
      setPriorityEditStatus(false);
      return
    } else if (editStatus === true && assignStatus === true && PriorityEditStatus === true) {
      setAssignStatus(false);
      setPriorityEditStatus(false);
      return
    } else if (editStatus === true && assignStatus === true && PriorityEditStatus === false && search === "?edit=") {
      setValue('ASSIGN_TEAM_ID', '')
      setAssignStatus(false);
      return
    }

  };


  const isOnlySpaces = (str: any) => {
    if (str.length === 0) {
      return true
    } else {
      return str.trim() === "";
    }
  };

  const ASSET_NONASSET: any = watch("ASSET_NONASSET");
  const watchAll: any = watch();
  const onSubmit = async (payload: any, e: any) => {
    console.log(payload, 'payload')
    setIsSubmit(true)
    setIsGenerateWorkOrder(true)
    const buttonMode: any = e?.nativeEvent?.submitter?.name;
    if (buttonMode === 'CONVERT' && technicianList.length === 0 && assignStatus === true) {
      toast?.error('Please fill the required filled');
      return
    }
    let isValid: any = true;
    payload.ASSET_NONASSET = ASSET_NONASSET?.key
      ? ASSET_NONASSET?.key
      : ASSET_NONASSET;
    payload.ASSET_ID = payload?.ASSET_ID?.ASSET_ID
      ? payload?.ASSET_ID?.ASSET_ID
      : selectedDetails?.ASSET_ID;
    payload.LOCATION_ID = payload?.LOCATION_ID?.LOCATION_ID
      ? payload?.LOCATION_ID?.LOCATION_ID
      : selectedDetails?.LOCATION_ID;
    payload.CONTACT_NAME = search === "?edit=" ? selectedDetails?.CONTACT_NAME : payload?.REPORTER_NAME;
    payload.CONTACT_EMAIL = search === "?edit=" ? selectedDetails?.CONTACT_EMAIL : payload?.REPORTER_EMAIL;
    payload.CONTACT_PHONE = search === "?edit=" ? selectedDetails?.CONTACT_PHONE : payload?.REPORTER_MOBILE;
    payload.REQ_ID =
      payload?.REQ_ID?.REQ_ID !== undefined
        ? payload?.REQ_ID?.REQ_ID
        : selectedDetails?.REQ_ID;
    payload.SEVERITY_CODE =
      payload.SEVERITY_CODE !== undefined &&
        payload.SEVERITY_CODE.SEVERITY_ID !== undefined
        ? payload.SEVERITY_CODE.SEVERITY_ID
        : selectedDetails?.SEVERITY_CODE;
    payload.ACTIVE = 1;
    payload.ASSIGN_TEAM_ID =
      payload.ASSIGN_TEAM_ID.TEAM_ID !== undefined
        ? payload.ASSIGN_TEAM_ID.TEAM_ID
        : selectedDetails?.ASSIGN_TEAM_ID;
    payload.ASSETGROUP_ID =
      payload?.GROUP?.ASSETGROUP_ID !== undefined 
        ? payload?.GROUP?.ASSETGROUP_ID
        : selectedDetails?.ASSETGROUP_ID;
    payload.ASSETTYPE_ID = search === "?edit=" ? selectedDetails.ASSETTYPE_ID: payload?.TYPE?.ASSETTYPE_ID 
      ? payload?.TYPE?.ASSETTYPE_ID
      : selectedDetails.ASSETTYPE_ID;
    payload.SER_REQ_NO = selectedDetails?.SER_REQ_NO
      ? selectedDetails?.SER_REQ_NO
      : "";

    locationtypeOptions.forEach((element: any) => {
      if (payload?.LOCATION_ID == element.LOCATION_ID) {
        payload.LOCATION_DESCRIPTION = element.LOCATION_DESCRIPTION
      }
    })

    payload.WO_DATE =
      search === "?edit="
        ? props?.selectedData?.WO_DATE
        : moment(new Date()).format("DD-MM-YYYY");
    payload.MODE =
      buttonMode !== "" ? buttonMode : props?.selectedData ? "E" : "A";
    delete payload?.ASSETTYPE;
    delete payload?.DOC;
    delete payload?.REQUESTTITLE_ID;
    delete payload?.RAISEDBY_ID;
    delete payload?.GROUP;
    delete payload?.TYPE;
    delete payload?.REPORTER_MOBILE;
    delete payload?.REPORTER_NAME;
    delete payload?.REPORTER_EMAIL;
    payload.TYPE = "13";
    payload.PARA =
      buttonMode === "CANCEL"
        ? { para1: `${t("Service Request")}`, para2: "Cancelled" }
        : buttonMode === "CONVERT"
          ? { para1: `${t("Work Order")}`, para2: "Generated" }
          : props?.selectedData
            ? { para1: `${t("Service Request")}`, para2: "Updated" }
            : technicianStatus === "A" ?
              { para1: `${t("Work Order")}`, para2: "Generated" } :
              { para1: `${t("Service Request")}`, para2: "Created" };

    if (buttonMode === "CANCEL") {
      if (payload.REMARKS === undefined || payload.REMARKS === " " || payload.REMARKS === null) {
        toast.error("Please enter the remarks");
        return
      }
      if (isOnlySpaces(payload.REMARKS) === true) {
        toast.error("Please enter the remarks");
        return
      }
    }

    const TECH_DATA = payload?.TECH_ID?.filter(
      (f: any) => f.TEAM_ID === payload?.ASSIGN_TEAM_ID
    );
    payload.TECH_ID = payload?.TECH_ID?.length > 0 ? TECH_DATA : technicianList;
    if (
      technicianStatus === "M" &&
      decryptData(localStorage.getItem(LOCALSTORAGE?.ROLETYPECODE)) !== "T" &&
      decryptData(localStorage.getItem(LOCALSTORAGE?.ISASSIGN)) === true
    ) {
      if (payload?.TECH_ID?.length <= 0) {
        isValid = false;
      }
    }

    if (payload?.DOC_LIST.length > 0) {
      const filterDocData = payload?.DOC_LIST?.filter(
        (doc: any) => doc.UPLOAD_TYPE === "W"
      );
      payload.DOC_LIST = filterDocData;
    }


    let woID: any = '';
    if (isValid === true) {
      try {

        const res = await callPostAPI(ENDPOINTS.SAVE_SERVICEREQUEST, payload);
        if (res?.FLAG === true) {
          setIsSubmit(false)
          const resService = await callPostAPI(ENDPOINTS.GET_SERVICEREQUEST_DETAILS, {

            WO_NO: res?.WO_NO,
            WO_ID: 0
          });
           if(search === "?add=") {
           
           }
          else if (buttonMode !== "CONVERT" && Currentfacility?.WO_ASSIGN !== "A") {
            // const resService = await callPostAPI(ENDPOINTS.GET_SERVICEREQUEST_DETAILS, {

            //   WO_NO: res?.WO_NO,
            //   WO_ID: 0
            // });
            if (resService?.FLAG === 1) {
              setIsSubmit(false)
              setIsGenerateWorkOrder(false)
              const notifcation: any = {
                FUNCTION_CODE: currentMenu?.FUNCTION_CODE,
                EVENT_TYPE: buttonMode === "CONVERT" ? "W" : "S",
                AddToServiceRequest: "",
                STATUS_CODE:
                  buttonMode === "CANCEL" ? 8 : buttonMode === "CONVERT" ? 1 : search === "?edit=" ? 2 : 1,
                WO_ID: search === "?edit=" ? selectedDetails?.WO_ID : 0,
                WO_NO: buttonMode === "CONVERT" || buttonMode === "CANCEL" || search === "?edit=" ? selectedDetails?.WO_NO : res?.WO_NO,
                PARA1:
                  search === "?edit="
                    ? decryptData(localStorage.getItem("USER_NAME"))
                    : decryptData(localStorage.getItem("USER_NAME")),
                PARA2: search === "?edit=" ? formateDate(selectedDetails?.SERVICEREQ_CREATE_TIME) : formateDate(resService?.SERVICEREQUESTDETAILS[0]?.SERVICEREQ_CREATE_TIME),
                PARA3: search === "?edit=" ? props?.selectedData?.SER_REQ_NO : res?.WO_NO,
                PARA4: search === "?add=" ? resService?.SERVICEREQUESTDETAILS[0]?.ASSET_NONASSET === "A" ? "Equipment" : "Soft Services" : selectedDetails?.ASSET_NONASSET === "A" ? "Equipment" : "Soft Services",
                PARA5: search === "?add=" ? resService?.SERVICEREQUESTDETAILS[0]?.LOCATION_NAME : selectedDetails?.LOCATION_NAME,
                PARA6: search === "?add=" ? resService?.SERVICEREQUESTDETAILS[0]?.ASSET_NAME : selectedDetails?.ASSET_NAME,
                PARA7: search === "?add=" ? watchAll?.REQ_ID?.REQ_DESC : selectedDetails?.REQ_DESC,
                PARA8: search === "?add=" ? watchAll?.WO_REMARKS : selectedDetails?.WO_REMARKS,
                PARA9: search === "?add=" ? watchAll?.SEVERITY_CODE?.SEVERITY : selectedDetails?.SEVERITY_DESC,
                PARA10: search === "?add=" ? watchAll?.SEVERITY_CODE?.SEVERITY : selectedDetails?.SEVERITY_DESC,
              };

              const eventPayload = { ...eventNotification, ...notifcation };

              helperEventNotification(eventPayload);
            }
          } else {
            const resWork: any = await callPostAPI(
              ENDPOINTS.GET_WORKORDER_DETAILS,
              { WO_ID: Currentfacility?.WO_ASSIGN === "A" && resService?.SERVICEREQUESTDETAILS[0]?.ISSERVICEREQ === false ? resService?.SERVICEREQUESTDETAILS[0]?.WO_ID : selectedDetails?.WO_ID }
            );
            if (resWork?.FLAG === 1) {
              setIsSubmit(false)
              setIsGenerateWorkOrder(false)
              woID = resWork?.WORKORDERDETAILS[0]?.WO_ID
              const notifcation: any = {
                FUNCTION_CODE: "HD001",
                WO_NO: resWork?.WORKORDERDETAILS[0]?.WO_NO,

                EVENT_TYPE: "W",
                STATUS_CODE: resWork?.WORKORDERDETAILS[0]?.CURRENT_STATUS,
                PARA1:
                  search === "?edit="
                    ? decryptData(localStorage.getItem("USER_NAME"))
                    : decryptData(localStorage.getItem("USER_NAME")),
                PARA2: resWork?.WORKORDERDETAILS[0]?.WO_NO,
                PARA3: resWork?.WORKORDERDETAILS[0]?.WO_DATE === null
                  ? ""
                  : onlyDateFormat(resWork?.WORKORDERDETAILS[0]?.WO_DATE),

                // resWork?.WORKORDERDETAILS[0]?.WO_DATE,
                PARA4: resWork?.WORKORDERDETAILS[0]?.USER_NAME,
                PARA5: resWork?.WORKORDERDETAILS[0]?.LOCATION_NAME,
                PARA6: resWork?.WORKORDERDETAILS[0]?.ASSET_NAME,
                PARA7: resWork?.WORKORDERDETAILS[0]?.WO_REMARKS,
                PARA8: resWork?.WORKORDERDETAILS[0]?.SEVERITY_DESC,
                PARA9: resWork?.WORKORDERDETAILS[0]?.REPORTED_AT === null
                  ? ""
                  : formateDate(resWork?.WORKORDERDETAILS[0]?.REPORTED_AT),



                PARA10: resWork?.WORKORDERDETAILS[0]?.ACKNOWLEDGED_AT,

                PARA11: resWork?.WORKORDERDETAILS[0]?.ATTEND_AT,
                PARA12: resWork?.WORKORDERDETAILS[0]?.RECTIFIED_AT,
                PARA13: resWork?.WORKORDERDETAILS[0]?.COMPLETED_AT,
                PARA14: resWork?.WORKORDERDETAILS[0]?.CANCELLED_AT,
                PARA15: "",
                PARA16: resWork?.WORKORDERDETAILS[0]?.ACKNOWLEDGED_BY_NAME,
                PARA17: "",
                PARA18: resWork?.WORKORDERDETAILS[0]?.RECTIFIED_BY_NAME,
                PARA19: resWork?.WORKORDERDETAILS[0]?.COMPLETED_BY_NAME,
                PARA20: resWork?.WORKORDERDETAILS[0]?.CANCELLED_BY_NAME, //cancelled BY
                PARA21: "", //approve on
                PARA22: "", //approve by,
                PARA23: "", //denied on,
                PARA24: "", //denied by
              };

              const eventPayload = { ...eventNotification, ...notifcation };

              helperEventNotification(eventPayload);
            }
          }
          if (resService?.SERVICEREQUESTDETAILS[0]?.WO_ASSIGN === "A" && resService?.SERVICEREQUESTDETAILS[0]?.ISSERVICEREQ === false) {
            // console.log(woID, 'woID')
            localStorage.setItem("WO_ID", resService?.SERVICEREQUESTDETAILS[0]?.WO_ID);
            setIsGenerateWorkOrder(false)
            // toast?.success(res?.MSG);
            navigate(PATH?.WORKORDERMASTER)
          } else if (
            selectedDetails?.WO_ASSIGN === "M" &&
            buttonMode === "CONVERT"
          ) {
            //toast?.success(res?.MSG);
            setIsGenerateWorkOrder(false)
            navigate(`${appName}/workorderlist`);
          }
          if (search === "?edit=" && buttonMode !== "CONVERT") {
            setIsGenerateWorkOrder(false)
            props?.getAPI();
            getOptionDetails();
            if (buttonMode !== "CONVERT") {
              setIsGenerateWorkOrder(false)
              toast?.success(res?.MSG);
            }
            // props?.isClick();
          } else if (Currentfacility?.WO_ASSIGN !== "A") {
            props?.getAPI();
            props?.isClick();
            toast?.success(res?.MSG);
          }
        } else {
          setIsSubmit(true)
          setIsGenerateWorkOrder(false)
          toast.error(res?.MSG)

        }
        if (buttonMode === "CANCEL") {
          navigate(`/servicerequestlist`);
        }

        if (PriorityEditStatus === true) {
          setPriorityEditStatus(false);
          setAssignStatus(false);
          setEditStatus(true);
        } else if (assignStatus === true || editStatus === true) {
          setEditStatus(true);
          setAssignStatus(false);
          setPriorityEditStatus(false);
        }
        setIsSubmit(false)
        setIsGenerateWorkOrder(false)
      } catch (error: any) {
        setIsSubmit(false)
        setIsGenerateWorkOrder(false)
        toast?.error(error);
      }
    } else {
      setIsSubmit(false)
      setIsGenerateWorkOrder(false)
      setError(true);
      toast.error("Please fill the required fields");
    }
  };


  const getOptionDetails = async () => {
    try {
      setLoading(true)
      const res = await callPostAPI(ENDPOINTS.GET_SERVICEREQUEST_DETAILS, { WO_ID: localStorage.getItem("WO_ID") }, "HD004");

      if (res?.FLAG === 1) {
        setDocOption(res?.WODOCLIST);
        setTechnicianList(res?.ASSIGNTECHLIST);
        // if (selectedDetails.length > 0) {
        //   setLoading(false);
        // }
        setSelectedDetails(res?.SERVICEREQUESTDETAILS[0]);
        setValue("ASSET_NONASSET", res?.SERVICEREQUESTDETAILS[0]?.ASSET_NONASSET);
        setValue("ASSET_ID", res?.SERVICEREQUESTDETAILS[0]?.ASSET_ID);
        setValue("ASSETTYPE", res?.SERVICEREQUESTDETAILS[0]?.ASSETTYPE);
        //setValue("DOC_LIST", res?.DOCLIST);
        setValue("ASSET_NONASSET", res?.SERVICEREQUESTDETAILS[0]?.ASSET_NONASSET);
        setValue("WO_REMARKS", res?.SERVICEREQUESTDETAILS[0]?.WO_REMARKS);
        setValue(
          "WO_DATE",
          onlyDateFormat(res?.SERVICEREQUESTDETAILS[0]?.WO_DATE)
        );
        setUserId(res?.SERVICEREQUESTDETAILS[0]?.RAISED_BY);
        setActivityTimeLineList(res?.ACTIVITYTIMELINELIST);
        setValue("DOC_LIST", res?.WODOCLIST);
        getWoOrderList(
          res?.SERVICEREQUESTDETAILS[0]?.ASSETTYPE_ID,
          res?.SERVICEREQUESTDETAILS[0]?.ASSET_NONASSET
        );
        setCurrentStatus(res?.SERVICEREQUESTDETAILS[0]?.CURRENT_STATUS);
        if (props?.selectedData?.STATUS_DESC === "Cancelled") {
          setStatus(false);
        } else {
          setStatus(true);
        }
        let ASSETGROUP_ID = res?.SERVICEREQUESTDETAILS[0]?.ASSETGROUP_ID
        GET_ASSETGROUPTEAMLIST(ASSETGROUP_ID)
      }
    } catch (error: any) {
      toast.error(error)
    } finally {
      setLoading(false)
    }
  };

  const getOptions = async () => {
    try {
      setLoading(true)
      const res = await callPostAPI(ENDPOINTS.GET_SERVICEREQUST_MASTERLIST, {}, "HD004");

      if (res?.FLAG === 1) {
        const res1 = await callPostAPI(ENDPOINTS.LOCATION_HIERARCHY_LIST, null, "HD004");
        if (res1?.FLAG === 1) {
          setlocationtypeOptions(res1?.LOCATIONHIERARCHYLIST);

          setOptions({
            userList: res?.USERLIST,
            severityLIST: res?.SEVERITYLIST,
            wo_list: res?.WORIGHTSLIST,
            assetGroup: res?.ASSETGROUPLIST.filter(
              (f: any) => f.ASSETGROUP_TYPE === "A"
            ),
            serviceGroup: res?.ASSETGROUPLIST.filter(
              (f: any) => f.ASSETGROUP_TYPE === "N"
            ),
            assetType: res?.ASSETTYPELIST,
            assestOptions: res?.ASSETLIST,
            userMaster: res?.USERLIST,
          });
          setTeamList(res?.TEAMLIST)
          setSeverity(res?.SEVERITYLIST)
          setUserId(parseInt(id));
          const userData: any = decryptData(localStorage.getItem("USER"));
          const userDetails: any = (userData);
          setValue("REPORTER_NAME", userDetails?.USER_NAME);
          setValue("REPORTER_EMAIL", userDetails?.USER_EMAILID);
          setValue("REPORTER_MOBILE", userDetails?.USER_MOBILENO);
          setTransactionStatus({
            cancel: res?.WORIGHTSLIST?.find((f: any) => f?.FUNCTION_CODE === "SR002"),
          })
          if (search === "?edit=") {
            getOptionDetails();
          }
        }
      }
    } catch (error: any) {
      toast.error(error);
    } finally {
      setLoading(false)
    }
  };

  useEffect(() => {

    const selectedSeverity =
      options?.severityLIST?.length >= 1
        ? options?.severityLIST.find((option: any) => option.SEVERITY === 'Low')
        : null;

    setValue("SEVERITY_CODE", selectedSeverity)
  }, [options])

  const getWoOrderList = async (ASSETGROUP_ID: any, ASSET_NONASSET?: any) => {
    const payload: any = {
      ASSETGROUP_ID: ASSETGROUP_ID,
      ASSET_NONASSET: ASSET_NONASSET?.key
        ? ASSET_NONASSET?.key
        : ASSET_NONASSET,
    };

    const res = await callPostAPI(
      ENDPOINTS.GET_SERVICEREQUEST_WORKORDER,
      payload, "HD004"
    );
    if (res?.FLAG === 1) {
      setWorkOrderOption(res?.WOREQLIST);
      setCurrentTechnician([]);
      setTechnicianData([]);
      watchAll.TECH_ID = [];
    } else if (res?.FLAG === 0) {
      setWorkOrderOption([]);
      setCurrentTechnician([]);
      setTechnicianData([]);
      watchAll.TECH_ID = [];
    }
    GET_ASSETGROUPTEAMLIST(ASSETGROUP_ID)
  };

  const GET_ASSETGROUPTEAMLIST = async (ASSETGROUP_ID: any) => {
    const payload: any = {
      ASSETGROUP_ID: ASSETGROUP_ID
    };
    const res = await callPostAPI(
      ENDPOINTS.GET_ASSETGROUPTEAMLIST,
      payload, "HD004"
    );

    if (res?.FLAG === 1) {
      setValue('ASSIGN_TEAM_ID', '')
      setTeamList(res?.TEAMLIST);
      setTechnician(res.TECHLIST);
    }
  }

  useEffect(() => {
    if (watchAll?.ASSET_NONASSET) {
      setValue("TYPE", "");
      setValue("ASSET_ID", "");
      // reset({"ASSET_ID": ""})
      setType([]);
      setAssetList([]);
    }
  }, [watchAll?.ASSET_NONASSET]);

  useEffect(() => {
    if (watchAll?.GROUP) {
      setValue("ASSET_ID", "");
      const assetGroupId: any = watchAll?.GROUP?.ASSETGROUP_ID
        ? watchAll?.GROUP?.ASSETGROUP_ID
        : watchAll?.GROUP?.ASSETGROUP_ID;
      const assetTypeList: any = options?.assetType?.filter(
        (f: any) => f?.ASSETGROUP_ID === assetGroupId
      );
      setType(assetTypeList);
    }
  }, [watchAll?.GROUP]);

  useEffect(() => {
    if (watchAll?.TYPE) {
      const assetTypeId = watchAll?.TYPE?.ASSETTYPE_ID
        ? watchAll?.TYPE?.ASSETTYPE_ID
        : watchAll?.TYPE?.ASSETTYPE_ID;
      const assetList: any = options?.assestOptions?.filter(
        (f: any) => f.ASSETTYPE_ID === assetTypeId
      );

      setAssetList(assetList);
    }
  }, [watchAll?.TYPE]);



  const selectedLocationTemplate = (option: any, props: any) => {
    if (option) {
      return (
        <div className="flex align-items-center">
          <div>{option.LOCATION_DESCRIPTION}</div>
        </div>
      );
    }

    return <span>{props.placeholder}</span>;
  };

  const handlerShowDetails = () => {
    const payload = {
      ASSET_ID: selectedDetails?.ASSET_ID,
      WO_ID: props?.selectedData?.WO_ID,
    };
    if (selectedDetails?.ASSET_NONASSET === "A") {
      navigate(`${appName}/assetmasterlist?edit=`, { state: payload });
    } else {
      navigate(`${appName}/servicemasterlist?edit=`, { state: payload });
    }
  };

  const locationOptionTemplate = (option: any) => {
    return (
      <div className="align-items-center">
        <div className="Text_Primary Table_Header">{option.LOCATION_NAME}</div>
        <div className=" Text_Secondary Helper_Text">
          {option.LOCATION_DESCRIPTION}
        </div>
      </div>
    );
  };

  const GetAddAssignee = (e: any) => {
    if (e.target.value !== "" || e.target.value !== undefined) {
      setCurrentTechnician(technician)
    } else {
      setCurrentTechnician([])
    }
  }

  let techData: any = [];
  let techData1: any = [];

  const handleRemove = (removeTechnician: any) => {
    techData = watchAll.TECH_ID;
    setValue('TECH_ID', techData1);
    watchAll.TECH_ID = watchAll?.TECH_ID?.filter(
      (f: any) => f.USER_ID !== removeTechnician?.USER_ID
    );
    setTechnicianData(watchAll.TECH_ID);
  };

  const handleClearAll = () => {
    setTechnicianData([]);
  };

  useEffect(() => {
    setCurrentStatus(props?.selectedData?.CURRENT_STATUS);
    (async function () {
      getOptions();
    })();

    saveTracker(currentMenu);
  }, []);

  useEffect(() => {
    if (
      (!isSubmitting && Object?.values(errors)[0]?.type === "required") ||
      (!isSubmitting && Object?.values(errors)[0]?.type === "maxLength")
    ) {
      const check: any = Object?.values(errors)[0]?.message;
      toast?.error(t(check));
      if (
        technicianStatus === "M" &&
        decryptData(localStorage.getItem(LOCALSTORAGE?.ROLETYPECODE)) !== "T"
      ) {
        if (watchAll?.TECH_ID?.length <= 0) {
          setError(true);
        }
      }
    }
  }, [isSubmitting]);

  const customizedContent = (item: any) => {
    return (
      <div className="flex justify-between mb-3 gap-3">
        <div className="mb-2">
          <p className=" Text_Primary flex Alert_Title mb-2">
            {item.title}

          </p>
          <p className="  Text_Secondary Helper_Text ">{item.subtitle}</p>
        </div>
        <p className="Text_Secondary Helper_Text mt-4">
          {formateDate(item.date)}

        </p>
      </div>
    );
  };

  const setHandelImage = (item: any) => {
    setVisibleImage(true);
    setShowImage(item);
  };
   console.log(technicianStatus, '555')
  const getFacility = async () => {
    const res = await callPostAPI(ENDPOINTS?.BUILDING_DETAILS, {}, "HD004");
    setTechnicianStatus(res?.FACILITYDETAILS[0]?.WO_ASSIGN);
  };

  useEffect(() => {
    getFacility();
  }, [selectedFacility]);

  // useEffect(()=>{

  // },[SEVERITY_CODE])


  if (loading) {
    return <LoaderS />
  }
  return (
    <>

      <section className="w-full">
        <form onSubmit={handleSubmit(onSubmit)}>

          <Card className="fixedContainer">
            <div className="flex justify-between">
              {/* when add new service request then show below code */}
              <div>
                <p className="Helper_Text Menu_Active flex mb-1">
                  Service Request /
                  {search === "?add=" && (
                    <p className="Helper_Text Menu_Active ">
                      {" "}
                      Add New Service Request
                    </p>
                  )}
                </p>
                {search === "?add=" && (
                  <h6 className=" Text_Primary Main_Header_Text mb-1">
                    {t("Add Service Request")}
                  </h6>
                )}
                {search === "?edit=" && (
                  <h6 className="Text_Primary  Main_Header_Text mb-1">
                    {selectedDetails?.ASSETGROUP_NAME} &gt; {selectedDetails?.REQ_DESC}
                  </h6>
                )}
                {search === "?edit=" && (
                  <p className="Sub_Header_Text  ">
                    {selectedDetails?.SER_REQ_NO}
                  </p>
                )}
              </div>
              <div>
                {
                  ((search === "?add=" && editStatus === true) ||
                    (search === "?edit=" && (assignStatus === true || PriorityEditStatus === true)))
                  && CURRENT_STATUS !== 6 && (selectedDetails.ISSERVICEREQ !== false) && (
                    <Buttons
                      className="Secondary_Button w-20 me-2"
                      label={'Cancel'}
                      // onClick={props?.isClick}
                      onClick={() => {
                        onClickCancelButton();
                      }}
                    />
                  )}

                <>{IsSubmit}</>
                {((search === "?add=" && editStatus === true) ||
                  (search === "?edit=" && (assignStatus === true || PriorityEditStatus === true))) &&
                  CURRENT_STATUS !== 6 && (selectedDetails.ISSERVICEREQ !== false) && (
                    <Buttons
                      disabled={IsSubmit}
                      type="submit"
                      className="Primary_Button  w-20 me-2"
                      label={"Submit"}
                    />
                  )}
                {/* {(search === "?add="&&<Buttons
                      disabled={IsSubmit}
                      type="submit"
                      className="Primary_Button  w-20 me-2"
                      label={"Submit"}
                    />
                  )} */}
                {decryptData(localStorage.getItem(LOCALSTORAGE?.ROLETYPECODE)) !== "T" &&
                  CURRENT_STATUS !== 6 && selectedDetails?.ISSERVICEREQ === true &&
                  (transactionStatus !== undefined &&
                    transactionStatus?.cancel?.NO_ACCESS === false
                    && editStatus === true &&
                    PriorityEditStatus !== true) && technicianList.length > 0 && (
                    <CancelDialogBox
                      header={"Cancel Service Request"}
                      control={control}
                      setValue={setValue}
                      register={register}
                      paragraph={
                        "Are you sure you want to cancel the service request?"
                      }
                      watch={watch}
                      errors={errors}
                    />
                  )}
                {search === "?edit=" &&
                  editStatus === true &&
                  PriorityEditStatus !== true &&
                  CURRENT_STATUS !== 6 &&
                  selectedDetails?.WO_ASSIGN === "A" && assignStatus !== true &&
                  selectedDetails?.ISSERVICEREQ === true && (
                    <Buttons
                      className="Primary_Button me-2"
                      type="submit"
                      label={"View Work Order"}
                      name="CONVERT"
                    />
                  )}
                {search === "?edit=" &&
                  CURRENT_STATUS !== 6 &&
                  selectedDetails?.WO_ASSIGN === "M" &&
                  selectedDetails?.ISSERVICEREQ === true && editStatus === true
                  && assignStatus !== true && PriorityEditStatus !== true && (
                    <Buttons
                      className="Primary_Button me-2"
                      type="submit"
                      label={"Generate Work Order"}
                      name="CONVERT"
                      disabled={IsGenerateWorkOrder}
                    />
                  )}
                {selectedDetails?.ISSERVICEREQ === false && (<Buttons
                  className="Secondary_Button w-20 me-2"
                  label={"List"}
                  onClick={props?.isClick}
                />)}

              </div>
            </div>
          </Card>
          {search === "?add=" ? (
            <div className="h-24"></div>
          ) : (
            <div className="h-28"></div>
          )}
          <div className=" mt-3 grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-3">
            <div className="col-span-2 woTabview">
              {search === "?add=" && (
                <>
                  <Card>
                    <div className="flex flex-wrap justify-between mb-3">
                      <h6 className="Header_Text">{t("Request Details")}</h6>
                    </div>
                    <div className=" grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-2 lg:grid-cols-2">
                      <div className="col-span-2">
                        <Field
                          controller={{
                            name: "ASSET_NONASSET",
                            control: control,
                            render: ({ field }: any) => {
                              return (
                                <>
                                  <Radio
                                    {...register("ASSET_NONASSET", {
                                      // required: "Please fill the required fields",
                                      onChange: () => {
                                        let data: any = {};
                                        setValue("GROUP", data);
                                        setValue("TYPE", "");
                                        setType([]);
                                        setAssetList([]);
                                        setWorkOrderOption([]);
                                      },
                                    })}
                                    labelHead="Work Order Category"
                                    options={assestTypeLabel}
                                    selectedData={
                                      selectedDetails?.ASSET_NONASSET || "A"
                                    }
                                    setValue={setValue}
                                    {...field}
                                  />
                                </>
                              );
                            },
                          }}
                        />
                      </div>

                      <Field
                        controller={{
                          name: "LOCATION_ID",
                          control: control,
                          render: ({ field }: any) => {
                            return (
                              <Select
                                options={locationtypeOptions}
                                {...register("LOCATION_ID", {
                                  required: "Please fill the required fields",
                                })}
                                label="Location"
                                require={true}

                                optionLabel="LOCATION_DESCRIPTION"
                                filter={true}
                                valueTemplate={selectedLocationTemplate}
                                itemTemplate={locationOptionTemplate}
                                findKey={"LOCATION_ID"}
                                invalid={errors.LOCATION_ID}
                                className="locationDropdown w-full"

                                setValue={setValue}
                                {...field}
                              />
                            );
                          },
                        }}
                      />
                      <Field
                        controller={{
                          name: "GROUP",
                          control: control,
                          render: ({ field }: any) => {
                            return (
                              <Select
                                options={
                                  ASSET_NONASSET?.key === "A" ||
                                    ASSET_NONASSET === "A"
                                    ? options?.assetGroup
                                    : options?.serviceGroup
                                }
                                {...register("GROUP", {
                                  required: "Please fill the required fields",
                                  onChange: (e: any) => {
                                    getWoOrderList(
                                      e?.target?.value?.ASSETGROUP_ID,
                                      e?.target?.value?.ASSETGROUP_TYPE
                                    );
                                  },
                                })}
                                label={
                                  ASSET_NONASSET?.key === "A" ||
                                    ASSET_NONASSET === "A"
                                    ? "Equipment Group"
                                    : "Service Group"
                                }
                                require={true}
                                optionLabel="ASSETGROUP_NAME"
                                findKey={"ASSETGROUP_ID"}
                                selectedData={selectedDetails?.ASSETGROUP_ID}
                                setValue={setValue}
                                invalid={errors.GROUP}
                                {...field}
                              />
                            );
                          },
                        }}
                      />
                      <Field
                        controller={{
                          name: "TYPE",
                          control: control,
                          render: ({ field }: any) => {
                            return (
                              <Select
                                options={type}
                                {...register("TYPE", {

                                })}
                                label={
                                  ASSET_NONASSET?.key === "A" ||
                                    ASSET_NONASSET === "A"
                                    ? "Equipment Type"
                                    : "Service Type"
                                }
                                // require={true}
                                optionLabel="ASSETTYPE_NAME"
                                findKey={"ASSETTYPE_ID"}
                                selectedData={selectedDetails?.ASSETTYPE_ID}
                                setValue={setValue}
                                // invalid={errors.TYPE}
                                {...field}
                              />
                            );
                          },
                        }}
                      />
                      <Field
                        controller={{
                          name: "ASSET_ID",
                          control: control,
                          render: ({ field }: any) => {
                            return (
                              <Select
                                options={assetList}
                                {...register("ASSET_ID", {
                                  // required: "Please fill the required fields",
                                })}
                                label={
                                  ASSET_NONASSET?.key === "A" ||
                                    ASSET_NONASSET === "A"
                                    ? "Equipment"
                                    : "Soft Service"
                                }
                                optionLabel="ASSET_NAME"
                                // require={true}
                                findKey={"ASSET_ID"}
                                selectedData={selectedDetails?.ASSET_ID}
                                setValue={setValue}
                                // invalid={errors?.ASSET_ID}
                                {...field}
                              />
                            );
                          },
                        }}
                      />
                      <Field
                        controller={{
                          name: "REQ_ID",
                          control: control,
                          render: ({ field }: any) => {
                            return (
                              <Select
                                options={workOrderOption}
                                //options={[]}
                                {...register("REQ_ID", {
                                  required: "Please fill the required fields",
                                })}
                                label={"Issue"}
                                optionLabel="REQ_DESC"
                                findKey={"REQ_ID"}
                                require={true}
                                selectedData={selectedDetails?.REQ_ID}
                                setValue={setValue}
                                invalid={errors.REQ_ID}
                                {...field}
                              />
                            );
                          },
                        }}
                      />

                      <Field
                        controller={{
                          name: "SEVERITY_CODE",
                          control: control,
                          render: ({ field }: any) => {

                            const selectedSeverity = selectedDetails?.SEVERITY_CODE ?? 2;


                            return (
                              <Select

                                options={options?.severityLIST}
                                {...register("SEVERITY_CODE", {
                                  required: "Please fill the required fields",
                                })}
                                label={"Priority"}
                                optionLabel="SEVERITY"
                                findKey="SEVERITY_ID"
                                require={true}
                                selectedData={selectedDetails?.SEVERITY_CODE}
                                setValue={setValue}
                                invalid={errors.SEVERITY_CODE}
                                {...field}
                              />
                            );
                          },
                        }}
                      />
                      {/* <Field
                        controller={{
                          name: "SEVERITY_CODE",
                          control: control,
                          render: ({ field }: any) => {
                            return (
                              <Select
                                options={options?.severityLIST}
                                {...register("SEVERITY_CODE", {
                                  required: t("Please fill the required fields."),
                                })}
                                label="Priority"
                                require={true}
                                findKey={"SEVERITY_ID"}
                                optionLabel="SEVERITY"
                                selectedData={props?.selectedData ? props?.selectedData?.SEVERITY_CODE : selectedSeverity?.SEVERITY_ID}
                                setValue={setValue}
                                // disabled={search === "?edit=" ? true : false}
                                // onChange={getpartlist} // Replace this with the appropriate function for severity
                                invalid={errors.SEVERITY_CODE}
                                {...field}
                              />
                            );
                          },
                        }}
                      /> */}

                      <div className="col-span-2">
                        <label className="Text_Secondary Input_Label">
                          {t("Description")}
                        </label>

                        <Field
                          controller={{
                            name: "WO_REMARKS",
                            control: control,
                            render: ({ field }: any) => {
                              return (
                                <InputTextarea
                                  {...register("WO_REMARKS", {
                                    onChange: (e: any) => handleInputChange(e),
                                  })}
                                  // label={props?.inputName}

                                  rows={5}
                                  maxLength={400}
                                  invalid={errors.WO_REMARKS}
                                  setValue={setValue}
                                  // onChange={(e: any) => { handleInputChange(e) }}

                                  {...field}
                                />
                              );
                            },
                          }}
                        />
                        <label
                          className={` ${Descriptionlength === 400
                            ? "text-red-600"
                            : "Text_Secondary"
                            } Helper_Text`}
                        >
                          {t(`Up to ${Descriptionlength}/400 characters.`)}
                        </label>
                      </div>
                      <div className="col-span-2">
                        <WoDocumentUpload
                          register={register}
                          control={control}
                          setValue={setValue}
                          watch={watch}
                          getValues={getValues}
                          errors={errors}
                          uploadtype="W"
                          uploadLabel="Upload Supporting Images"
                          setIsSubmit={setIsSubmit}
                        />
                      </div>
                    </div>
                  </Card>
                  <Card className="mt-4">
                    <div className="flex flex-wrap justify-between mb-3">
                      <h6 className="Header_Text">
                        {t("Reporter Details (Optional)")}
                      </h6>
                    </div>
                    <div className=" grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-3 lg:grid-cols-3">
                      <Field
                        controller={{
                          name: "REPORTER_NAME",
                          control: control,
                          render: ({ field }: any) => {
                            return (
                              <InputField
                                {...register("REPORTER_NAME", {
                                  // required: "Please fill the required fields",
                                })}
                                label="Reporter Name"
                                // require={true}
                                // invalid={errors.REPORTER_NAME}
                                {...field}
                              />
                            );
                          },
                        }}
                      />
                      <Field
                        controller={{
                          name: "REPORTER_EMAIL",
                          control: control,
                          render: ({ field }: any) => {
                            return (
                              <InputField
                                {...register("REPORTER_EMAIL", {
                                  //required: "Please fill the required fields",
                                })}
                                label="Reporter Email"
                                // require={true}
                                // invalid={errors.REPORTER_EMAIL}
                                {...field}
                              />
                            );
                          },
                        }}
                      />
                      <Field
                        controller={{
                          name: "REPORTER_MOBILE",
                          control: control,
                          render: ({ field }: any) => {
                            return (
                              <InputField
                                {...register("REPORTER_MOBILE", {
                                  //required: "Please fill the required fields",
                                })}
                                label="Reporter Mobile Number"
                                // require={true}
                                // invalid={errors.REPORTER_MOBILE}
                                {...field}
                              />
                            );
                          },
                        }}
                      />
                    </div>
                  </Card>
                </>
              )}
              {search === "?edit=" && (

                <div className="serviceTabview">
                  <TabView
                    activeIndex={activeIndex}
                    onTabChange={(e) => setActiveIndex(e.index)}
                  >
                    <TabPanel header="Details">
                      <Card className="mt-3">
                        <div className="flex flex-wrap justify-between mb-3">
                          <h6 className="Header_Text">
                            {t("Service Request Details")}
                          </h6>
                        </div>

                        <div className="grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-3 lg:grid-cols-3">
                          <div className=" flex flex-col gap-4">
                            <div className=" flex flex-col gap-1">
                              <div className="flex flex-wrap ">
                                <label className="Text_Se condary Helper_Text">
                                  {t("Priority")}
                                  {
                                    PriorityEditStatus === true && (
                                      <>
                                        <span className="text-red-600"> *</span>
                                      </>
                                    )
                                  }

                                </label>
                              </div>

                              {PriorityEditStatus === false && (
                                <>
                                  <div className="flex flex-wrap">
                                    <p className="Text_Primary Alert_Title  ">
                                      {selectedDetails?.SEVERITY_DESC}
                                    </p>

                                    {/* {CURRENT_STATUS === 1 &&
                                    CURRENT_STATUS !== 7 && ( */}
                                    {(selectedDetails?.ISSERVICEREQ === true &&
                                      selectedDetails?.CURRENT_STATUS !== 6 &&
                                      selectedDetails?.CURRENT_STATUS !== 7) && (
                                        <span
                                          className="pi pi-pencil Menu_Active ml-2 cursor-pointer"
                                          onClick={() => OpenPriorityDropDown()}
                                        ></span>
                                      )}
                                  </div>
                                </>
                              )}

                              {PriorityEditStatus === true && (
                                <p className="Text_Primary Alert_Title  ">
                                  <Field
                                    controller={{
                                      name: "SEVERITY_CODE",
                                      control: control,
                                      render: ({ field }: any) => {
                                        return (
                                          <Select
                                            // options={options?.severityLIST}
                                            options={severity ?? []}
                                            {...register("SEVERITY_CODE", {
                                              required:
                                                "Please fill the required fields",
                                            })}
                                            // label={"Priority"}
                                            optionLabel="SEVERITY"
                                            findKey={"SEVERITY_ID"}
                                            // require={true}
                                            selectedData={
                                              selectedDetails?.SEVERITY_CODE
                                            }
                                            setValue={setValue}
                                            invalid={errors.SEVERITY_CODE}
                                            {...field}
                                          />
                                        );
                                      },
                                    }}
                                  />
                                </p>
                              )}
                              {/* )} */}
                            </div>
                            <div className=" flex flex-col gap-1">
                              <label className="Text_Secondary Helper_Text">
                                Type
                              </label>

                              {selectedDetails?.ASSET_NONASSET === "A" ? (
                                <>
                                  <p className="Text_Primary Alert_Title  ">
                                    Equipment{" "}
                                  </p>
                                </>
                              ) : (
                                <>
                                  <p className="Text_Primary Alert_Title  ">
                                    Soft Services
                                  </p>
                                </>
                              )}
                            </div>
                            <div className=" flex flex-col gap-1">
                              <label className="Text_Secondary Helper_Text">
                                Reporter
                              </label>
                              {selectedDetails?.USER_NAME === null ||
                                selectedDetails?.USER_NAME === "" ? (
                                <>
                                  <p className="Text_Main Alert_Title  ">NA</p>
                                </>
                              ) : (
                                <>
                                  <p className="Text_Main Alert_Title  ">
                                    {selectedDetails?.USER_NAME}
                                  </p>
                                </>
                              )}
                            </div>
                            <div className=" flex flex-col gap-1">
                              <label className="Text_Secondary Helper_Text">
                                Reported Date
                              </label>
                              {selectedDetails?.REPORTED_AT === null ||
                                selectedDetails?.REPORTED_AT === "" ? (
                                <>
                                  <p className="Text_Primary Alert_Title  ">NA</p>
                                </>
                              ) : (
                                <>
                                  <p className="Text_Primary Alert_Title ">
                                    {selectedDetails?.REPORTED_AT
                                      ? formateDate(selectedDetails?.REPORTED_AT)
                                      : "NA"}
                                    {/* {moment(selectedDetails?.REPORTED_AT).format(
                                    dateFormat() + ",  " + "hh:mmA"
                                  )} */}
                                  </p>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="col-span-2">
                            <div className=" flex flex-col gap-4">
                              <div className=" flex flex-col gap-1">
                                <label className="Text_Secondary Helper_Text">
                                  Location
                                </label>
                                {selectedDetails?.LOCATION_NAME === null ||
                                  selectedDetails?.LOCATION_NAME === "" ? (
                                  <>
                                    <p className="Text_Primary Alert_Title  ">
                                      NA
                                    </p>
                                  </>
                                ) : (
                                  <>
                                    <p className="Text_Primary Alert_Title  ">
                                      {/* {selectedDetails?.LOCATION_NAME} */}
                                      {selectedDetails?.LOCATION_DESCRIPTION}
                                    </p>
                                  </>
                                )}
                              </div>
                              <div className=" flex flex-col gap-1">
                                <label className="Text_Secondary Helper_Text">
                                  Description
                                </label>
                                {selectedDetails?.WO_REMARKS === null ||
                                  selectedDetails?.WO_REMARKS === "" ? (
                                  <>
                                    <p className="Text_Primary Alert_Title  ">
                                      NA
                                    </p>
                                  </>
                                ) : (
                                  <>
                                    <p className="Text_Primary Alert_Title  ">
                                      {selectedDetails?.WO_REMARKS}
                                    </p>
                                  </>
                                )}
                              </div>
                              <div className=" flex flex-col gap-1">
                                <label className="Text_Secondary Helper_Text">
                                  Supporting Images({docOption.length})
                                </label>
                                {docOption.length > 0 ? (
                                  <>
                                    <div className="flex flex-wrap gap-3">
                                      {docOption?.map((doc: any, index: any) => {
                                        const docData: any =
                                          "data:image/png;base64," +
                                          doc?.DOC_DATA;
                                        return (
                                          <>
                                            <div
                                              onClick={() => {
                                                setHandelImage(docData);
                                              }}
                                            >
                                              <img
                                                src={docData}
                                                alt=""
                                                className="w-16 h-16 rounded-xl"
                                              />
                                            </div>
                                            {/* setHandelImage */}
                                          </>
                                        );
                                      })}
                                    </div>
                                    <Dialog
                                      visible={visibleImage}
                                      style={{ width: "50vw", height: "60vh" }}
                                      onHide={() => {
                                        setVisibleImage(false);
                                      }}
                                    >
                                      <img
                                        src={showImage}
                                        alt=""
                                        className="w-full h-full"
                                      />
                                    </Dialog>
                                  </>
                                ) : (
                                  <>
                                    <div className="flex items-center mt-2 justify-center w-full">
                                      <label
                                        htmlFor="dropzone-file"
                                        className="flex flex-col items-center justify-center w-full h-24 border-2
                                      border-gray-200 border rounded-lg  "
                                      >
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                          <img
                                            src={noDataIcon}
                                            alt=""
                                            className="w-12"
                                          />
                                          <p className="mb-2 mt-2 text-sm ">
                                            <span className="Text_Primary Input_Label">
                                              {t("No items to show")}{" "}
                                            </span>
                                          </p>
                                        </div>
                                      </label>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>

                      {/* Equipment section */}
                      {selectedDetails?.ASSET_NONASSET === "A" && (
                        <Card className="mt-4">
                          <div className="flex flex-wrap justify-between mb-3">
                            <h6 className="Header_Text">Equipment Summary</h6>
                            {CURRENT_STATUS !== 7 &&
                              selectedDetails?.ASSETGROUP_ID !== null &&
                              selectedDetails?.ASSETTYPE_ID !== null &&
                              selectedDetails?.ASSETTYPE_ID1 !== null && (
                                <Buttons
                                  className="Border_Button Secondary_Button "
                                  label={"Show Details"}
                                  onClick={() => {
                                    handlerShowDetails();
                                  }}
                                />
                              )}
                          </div>

                          <div className="grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-3 lg:grid-cols-3">
                            <div>
                              <label className="Text_Secondary Helper_Text">
                                Equipment Group
                              </label>
                              {selectedDetails?.ASSETGROUP_NAME === null ||
                                selectedDetails?.ASSETGROUP_NAME === "" ? (
                                <>
                                  <p className="Text_Primary Alert_Title  ">NA</p>
                                </>
                              ) : (
                                <>
                                  <p className="Text_Primary Alert_Title  ">
                                    {selectedDetails?.ASSETGROUP_NAME}
                                  </p>
                                </>
                              )}
                            </div>
                            <div>
                              <label className="Text_Secondary Helper_Text">
                                Ownership Status
                              </label>
                              {selectedDetails?.OWN_LEASE === null ||
                                selectedDetails?.OWN_LEASE === "" ? (
                                <>
                                  <p className="Text_Primary Alert_Title  ">NA</p>
                                </>
                              ) : (
                                <>
                                  {selectedDetails?.OWN_LEASE === "O" ? (
                                    <>
                                      <p className="Text_Primary Alert_Title  ">
                                        Owned
                                      </p>
                                    </>
                                  ) : (
                                    <>
                                      <p className="Text_Primary Alert_Title  ">
                                        Leased
                                      </p>
                                    </>
                                  )}
                                </>
                              )}
                            </div>
                            <div>
                              <label className="Text_Secondary Helper_Text">
                                Last Maintenance Date
                              </label>
                              {selectedDetails?.LAST_MAINTANCE_DATE === null ||
                                selectedDetails?.LAST_MAINTANCE_DATE === "" ? (
                                <>
                                  <p className="Text_Primary Alert_Title  ">NA</p>
                                </>
                              ) : (
                                <>
                                  <p className="Text_Primary Alert_Title  ">
                                    {/* {moment(
                                      selectedDetails?.LAST_MAINTANCE_DATE
                                    ).format(dateFormat() + "," + "HH:mm")} */}
                                    {onlyDateFormat(selectedDetails?.LAST_MAINTANCE_DATE)}
                                  </p>
                                </>
                              )}
                            </div>
                            <div>
                              <label className="Text_Secondary Helper_Text">
                                Equipment Type
                              </label>
                              {selectedDetails?.ASSETTYPE_NAME === null ||
                                selectedDetails?.ASSETTYPE_NAME === "" ? (
                                <>
                                  <p className="Text_Primary Alert_Title  ">NA</p>
                                </>
                              ) : (
                                <>
                                  <p className="Text_Primary Alert_Title  ">
                                    {selectedDetails?.ASSETTYPE_NAME}
                                  </p>
                                </>
                              )}
                            </div>
                            <div>
                              <label className="Text_Secondary Helper_Text">
                                Warranty End Date
                              </label>
                              {selectedDetails?.WARRANTY_END_DATE === null ||
                                selectedDetails?.WARRANTY_END_DATE === "" ? (
                                <>
                                  <p className="Text_Primary Alert_Title  ">NA</p>
                                </>
                              ) : (
                                <>
                                  <p className="Text_Primary Alert_Title  ">
                                    {" "}
                                    {/* {moment(
                                      selectedDetails?.WARRANTY_END_DATE
                                    ).format(dateFormat() + "," + "HH:mm")} */}
                                    {onlyDateFormat(selectedDetails?.WARRANTY_END_DATE)}
                                  </p>
                                </>
                              )}
                            </div>
                            <div>
                              <label className="Text_Secondary Helper_Text">
                                Upcoming Schedule
                              </label>
                              {selectedDetails?.ASSETTYPE_NAME === null ||
                                selectedDetails?.ASSETTYPE_NAME === "" ? (
                                <>
                                  <p className="Text_Primary Alert_Title  ">NA</p>
                                </>
                              ) : (
                                <>
                                  <p className="Text_Primary Alert_Title  ">
                                    {onlyDateFormat(selectedDetails?.UPCOMING_SCHEDULE_DATE)}
                                    {/* {selectedDetails?.UPCOMING_SCHEDULE_DATE !== "" ? selectedDetails?.UPCOMING_SCHEDULE_DATE : "NA"} */}
                                  </p>
                                </>
                              )}
                            </div>
                            <div>
                              <label className="Text_Secondary Helper_Text">
                                Equipment Name
                              </label>
                              {selectedDetails?.ASSET_NAME === null ||
                                selectedDetails?.ASSET_NAME === "" ? (
                                <>
                                  <p className="Text_Primary Alert_Title  ">NA</p>
                                </>
                              ) : (
                                <>
                                  <p className="Text_Primary Alert_Title  ">
                                    {selectedDetails?.ASSET_NAME}
                                  </p>
                                </>
                              )}
                            </div>
                            <div>
                              <label className="Text_Secondary Helper_Text">
                                Vendor Name
                              </label>
                              {selectedDetails?.VENDOR_NAME === null ||
                                selectedDetails?.VENDOR_NAME === "" ? (
                                <>
                                  <p className="Text_Primary Alert_Title  ">NA</p>
                                </>
                              ) : (
                                <>
                                  <p className="Text_Primary Alert_Title  ">
                                    {selectedDetails?.VENDOR_NAME}
                                  </p>
                                </>
                              )}
                            </div>
                          </div>
                        </Card>
                      )}
                      {/* Soft Service Section */}
                      {selectedDetails?.ASSET_NONASSET === "N" && (
                        <Card className="mt-4">
                          <div className="flex flex-wrap justify-between mb-3">
                            <h6 className="Header_Text">Soft Service Summary</h6>
                            {selectedDetails?.ASSET_NAME === null ||
                              selectedDetails?.ASSET_NAME === "" ? (
                              <>
                              </>
                            ) : (
                              <>
                                <Buttons
                                  className="Border_Button Secondary_Button "
                                  label={"Show Details"}
                                  onClick={() => {
                                    handlerShowDetails();
                                  }}
                                />
                              </>
                            )}
                          </div>

                          <div className="grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-3 lg:grid-cols-3">
                            <div>
                              <label className="Text_Secondary Helper_Text">
                                Service Group
                              </label>
                              {selectedDetails?.ASSETGROUP_NAME === null ||
                                selectedDetails?.ASSETGROUP_NAME === "" ? (
                                <>
                                  <p className="Text_Primary Alert_Title  ">NA</p>
                                </>
                              ) : (
                                <>
                                  <p className="Text_Primary Alert_Title  ">
                                    {selectedDetails?.ASSETGROUP_NAME}
                                  </p>
                                </>
                              )}
                            </div>
                            <div>
                              <label className="Text_Secondary Helper_Text">
                                Service Type
                              </label>
                              {selectedDetails?.ASSETTYPE_NAME === null ||
                                selectedDetails?.ASSETTYPE_NAME === "" ? (
                                <>
                                  <p className="Text_Primary Alert_Title  ">NA</p>
                                </>
                              ) : (
                                <>
                                  <p className="Text_Primary Alert_Title  ">
                                    {selectedDetails?.ASSETTYPE_NAME}
                                  </p>
                                </>
                              )}
                            </div>
                            <div>
                              <label className="Text_Secondary Helper_Text">
                                Service Name
                              </label>
                              {selectedDetails?.ASSET_NAME === null ||
                                selectedDetails?.ASSET_NAME === "" ? (
                                <>
                                  <p className="Text_Primary Alert_Title  ">NA</p>
                                </>
                              ) : (
                                <>
                                  <p className="Text_Primary Alert_Title  ">
                                    {selectedDetails?.ASSET_NAME}
                                  </p>
                                </>
                              )}
                            </div>
                          </div>
                        </Card>
                      )}
                      <Card className="mt-4">
                        <div className="flex flex-wrap justify-between mb-3">
                          <h6 className="Header_Text">
                            {t("Reporter Details (Optional)")}
                          </h6>
                        </div>
                        <div className=" grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-3 lg:grid-cols-3">
                          <div>
                            <label className="Text_Secondary Helper_Text">
                              Reporter Name
                            </label>
                            {selectedDetails?.CONTACT_NAME === null ||
                              selectedDetails?.CONTACT_NAME === "" ? (
                              <>
                                <p className="Text_Primary Alert_Title  ">NA</p>
                              </>
                            ) : (
                              <>
                                <p className="Text_Primary Alert_Title  ">
                                  {selectedDetails?.CONTACT_NAME}
                                </p>
                              </>
                            )}
                          </div>
                          <div>
                            <label className="Text_Secondary Helper_Text">
                              Reporter Email
                            </label>
                            {selectedDetails?.CONTACT_EMAIL === null ||
                              selectedDetails?.CONTACT_EMAIL === "" ? (
                              <>
                                <p className="Text_Primary Alert_Title  ">NA</p>
                              </>
                            ) : (
                              <>
                                <p className="Text_Primary Alert_Title  ">
                                  {selectedDetails?.CONTACT_EMAIL}
                                </p>
                              </>
                            )}
                          </div>
                          <div>
                            <label className="Text_Secondary Helper_Text">
                              Reporter Phone
                            </label>
                            {selectedDetails?.CONTACT_PHONE === null ||
                              selectedDetails?.CONTACT_PHONE === "" ? (
                              <>
                                <p className="Text_Primary Alert_Title  ">NA</p>
                              </>
                            ) : (
                              <>
                                <p className="Text_Primary Alert_Title  ">
                                  {selectedDetails?.CONTACT_PHONE}
                                </p>
                              </>
                            )}
                          </div>
                          <div>
                            <label className="Text_Secondary Helper_Text">
                              Account
                            </label>
                            {selectedDetails?.SALESFROCE_ACCOUNT === null ||
                              selectedDetails?.SALESFROCE_ACCOUNT === "" ? (
                              <>
                                <p className="Text_Primary Alert_Title  ">NA</p>
                              </>
                            ) : (
                              <>
                                <p className="Text_Primary Alert_Title  ">
                                  {selectedDetails?.SALESFROCE_ACCOUNT}
                                </p>
                              </>
                            )}
                          </div>

                        </div>
                      </Card>
                    </TabPanel>

                    <TabPanel header="Activity Timeline">
                      {ActivityTimeLineList.length === 0 ? (
                        <Card className="mt-2">
                          <h6 className="Header_Text">Activity Timeline</h6>
                          <div className="flex items-center mt-2 justify-center w-full">
                            <label
                              htmlFor="dropzone-file"
                              className="flex flex-col items-center justify-center w-full h-54 border-2
                                   border-gray-200 border rounded-lg  "
                            >
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <img src={noDataIcon} alt="" className="w-12" />

                                <p className="mb-2 mt-2 text-sm text-gray-500 dark:text-gray-400">
                                  <span className="Text_Primary Input_Label">
                                    {t("No items to show")}{" "}
                                  </span>
                                </p>
                              </div>
                            </label>
                          </div>
                        </Card>
                      ) : (
                        <>
                          <Card className="mt-2" >
                            <h6 className="mb-2">
                              Activity Timeline
                            </h6>
                            <Timeline
                              value={ActivityTimeLineList}
                              className="customized-timeline"
                              content={customizedContent}
                            />
                          </Card>
                        </>
                      )}
                    </TabPanel>
                  </TabView>
                </div>
              )}
            </div>
            <div className="">

              {
                // search === "?add=" &&
                // assignStatus === false &&
                // decryptData(localStorage.getItem(LOCALSTORAGE?.ROLETYPECODE)) !== "T" 
                (
                  (search === "?edit=" && assignStatus === false &&
                    decryptData(localStorage.getItem(LOCALSTORAGE?.ROLETYPECODE)) !== "T" &&
                    decryptData(localStorage.getItem(LOCALSTORAGE?.ROLETYPECODE)) === "S" &&
                    decryptData(localStorage.getItem(LOCALSTORAGE?.ISASSIGN)) === true &&
                    technicianList?.length === 0) ||
                  (search === "?add=" && assignStatus === false &&
                    decryptData(localStorage.getItem(LOCALSTORAGE?.ISASSIGN)) === true &&
                    decryptData(localStorage.getItem(LOCALSTORAGE?.ROLETYPECODE)) === "S" &&
                    technicianList?.length === 0 && technicianStatus === "A"
                  ) ||
                  (search === "?add=" && assignStatus === false &&
                    decryptData(localStorage.getItem(LOCALSTORAGE?.ISASSIGN)) === true &&
                    technicianList?.length === 0 && technicianStatus === "M"
                  ) ||
                  (search === "?edit=" && assignStatus === false &&
                    decryptData(localStorage.getItem(LOCALSTORAGE?.ISASSIGN)) === true &&
                    decryptData(localStorage.getItem(LOCALSTORAGE?.ROLETYPECODE)) === "SA" &&
                    technicianList?.length === 0 && technicianStatus === "M"
                  ) ||
                  (search === "?add=" && assignStatus === false &&
                    decryptData(localStorage.getItem(LOCALSTORAGE?.ISASSIGN)) === true &&
                    decryptData(localStorage.getItem(LOCALSTORAGE?.ROLETYPECODE)) === "SA" &&
                    technicianList?.length === 0 && technicianStatus === "A"
                  ) ||
                  (search === "?add=" && assignStatus === false &&
                    decryptData(localStorage.getItem(LOCALSTORAGE?.ISASSIGN)) === false &&
                    decryptData(localStorage.getItem(LOCALSTORAGE?.ROLETYPECODE)) === "T" &&
                    technicianList?.length === 0 && technicianStatus === "A"
                  )
                )
                  ? (
                    <>
                      <Card className="">
                        <h6 className="Header_Text">
                          {t("Assignees ")} <span className="text-red-600"> *</span>
                        </h6>
                        <div className="items-center mt-2 justify-center w-full">
                          <label
                            // htmlFor="dropzone-file"
                            className={`flex flex-col items-center
                       justify-center w-full h-54 border-2 
                        ${error ? "border-red-600" : "border-gray-200 border"}`}
                          >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              {
                                technicianStatus === "M" &&
                                  decryptData(localStorage.getItem(LOCALSTORAGE?.ROLETYPECODE)) !== "T" &&
                                  decryptData(localStorage.getItem(LOCALSTORAGE?.ISASSIGN)) === true
                                  ? (
                                    <>
                                      <img src={noDataIcon} alt="" className="w-12" />

                                      <p className="mb-2 mt-2 text-sm text-gray-500 dark:text-gray-400">
                                        <span className=" Text_Primary Input_Label">
                                          {t("No assignees yet")}{" "}
                                        </span>
                                      </p>
                                      <label className="Text_Secondary Helper_Text mb-4">
                                        {t(
                                          "Add assignees to work on this service request."
                                        )}
                                      </label>

                                      <Buttons
                                        className="Secondary_Button"
                                        icon="pi pi-plus"
                                        label={t("Add Assignee")}
                                        onClick={() => {
                                          OpenAssignUserPopUp();
                                        }}
                                      />
                                    </>
                                  ) : (
                                    <>
                                      <img src={userIcon} alt="" className="w-12" />

                                      <p className="mb-2 mt-2 text-sm text-gray-500  dark:text-gray-400">
                                        <div className="Text_Secondary Helper_Text">
                                          {t("Technician will be added automatically")}{" "}
                                        </div>
                                      </p>
                                    </>
                                  )}
                            </div>
                          </label>
                        </div>
                      </Card>
                    </>

                  ) : ((search === "?add=" && assignStatus === false && technicianStatus === "M") ||
                    (search === "?edit=" && technicianList?.length === 0 && assignStatus === false && technicianStatus === "M")) && (
                    <Card className="">
                      <h6 className="Header_Text">
                        Assignee will be Assigned by supervisor
                      </h6>
                    </Card>
                  )
              }

              {(assignStatus === true && technicianList?.length === 0) && (
                <Card className="">
                  <h6 className="Header_Text">{t("Assign To")}</h6>
                  <div className=" grid grid-cols-1 gap-x-3 gap-y-3 ">
                    <Field
                      controller={{
                        name: "ASSIGN_TEAM_ID",
                        control: control,
                        render: ({ field }: any) => {
                          return (
                            <Select
                              options={TeamList}
                              {...register("ASSIGN_TEAM_ID", {
                                onChange: ((e: any) => GetAddAssignee(e)),
                                required:
                                  (
                                    technicianStatus === "M" &&
                                    decryptData(localStorage.getItem(
                                      LOCALSTORAGE?.ROLETYPECODE
                                    )) !== "T" &&
                                    decryptData(localStorage.getItem(LOCALSTORAGE?.ISASSIGN)) === true
                                  )
                                    ? "Please fill the required fields"
                                    : "",
                              })}
                              label={"Team"}
                              optionLabel="TEAM_NAME"
                              findKey={"TEAM_ID"}
                              require={
                                (
                                  technicianStatus === "M" &&
                                  decryptData(localStorage.getItem(
                                    LOCALSTORAGE?.ROLETYPECODE
                                  )) !== "T" &&
                                  decryptData(localStorage.getItem(LOCALSTORAGE?.ISASSIGN)) === true
                                )
                                  ? true
                                  : false
                              }

                              setValue={setValue}
                              invalid={
                                (
                                  technicianStatus === "M" &&
                                  decryptData(localStorage.getItem(
                                    LOCALSTORAGE?.ROLETYPECODE
                                  )) !== "T" &&
                                  decryptData(localStorage.getItem(LOCALSTORAGE?.ISASSIGN)) === true
                                )
                                  ? errors.ASSIGN_TEAM_ID
                                  : ""
                              }
                              {...field}
                            />
                          );
                        },
                      }}
                    />

                    <Field
                      controller={{
                        name: "TECH_ID",
                        control: control,
                        render: ({ field }: any) => {
                          return (
                            <MultiSelects
                              options={Currenttechnician}
                              {...register("TECH_ID", {
                                // onChange: (() => getAssgineeData(field.value)),
                                required: "Please fill the required fields",
                              })}
                              label="Assignee"
                              optionLabel="USER_NAME"
                              require={
                                (
                                  technicianStatus === "M" &&
                                  decryptData(localStorage.getItem(
                                    LOCALSTORAGE?.ROLETYPECODE
                                  )) !== "T" &&
                                  decryptData(localStorage.getItem(LOCALSTORAGE?.ISASSIGN)) === true
                                )
                                  ? true
                                  : false
                              }
                              invalid={
                                (
                                  technicianStatus === "M" &&
                                  decryptData(localStorage.getItem(
                                    LOCALSTORAGE?.ROLETYPECODE
                                  )) !== "T" &&
                                  decryptData(localStorage.getItem(LOCALSTORAGE?.ISASSIGN)) === true
                                )
                                  ? errors.TECH_ID
                                  : ""
                              }
                              findKey={"USER_ID"}
                              selectedData={technicianData}
                              setValue={setValue}
                              {...field}
                            />
                          );
                        },
                      }}
                    />
                    <div className="flex flex-wrap gap-1">
                      {watchAll.TECH_ID?.map((tech: any, index: any) => {
                        return (
                          <>
                            <Chip
                              label={tech?.USER_NAME}
                              removable
                              onRemove={() => handleRemove(tech)}
                            />
                          </>
                        );
                      })}
                    </div>
                    {watchAll?.TECH_ID?.length > 0 && (
                      <div
                        className="Text_Main Alert_Title"
                        onClick={() => handleClearAll()}
                      >
                        {t("Clear All Selection")}
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {((technicianStatus === "A" && technicianList?.length > 0) || (technicianStatus === "M" && technicianList?.length > 0)) && (

                <Card className="">

                  <h6 className="Header_Text">
                    {t("Assignees")} ({technicianList?.length})
                  </h6>
                  <div className="ScrollViewAssigneeTab">
                    {technicianList?.map((tech: any, index: any) => {
                      const nameParts = tech?.USER_NAME?.split(" ");
                      const initials =
                        nameParts.length > 1
                          ? `${nameParts[0]?.charAt(
                            0
                          )}${nameParts[1]?.charAt(0)}`
                          : `${nameParts[0]?.charAt(0)}`;
                      return (
                        <div
                          className="flex justify-start mt-2"
                          key={index}
                        >
                          <div className="w-10 h-10 flex items-center justify-center bg-[#F7ECFA] rounded-full text-[#272B30] font-bold">
                            {initials.toUpperCase()}
                          </div>
                          <div className="ml-2">
                            <p className="Text_Primary Input_Text">
                              {tech?.USER_NAME}
                            </p>
                            <label className=" Text_Secondary Helper_Text">
                              {tech?.TEAM_NAME}
                            </label>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              )}

            </div>
          </div>
        </form>
      </section>
    </>
  );
};

export default ServiceRequestDetailForm;
function async() {
  throw new Error("Function not implemented.");
}
