import InputField from "../../../components/Input/Input";
import Buttons from "../../../components/Button/Button";
import { Card } from "primereact/card";
import { useForm } from "react-hook-form";
import { Button } from "primereact/button";
import "../../../components/Button//Button.css";
import Field from "../../../components/Field";
import { useTranslation } from "react-i18next";
import { useCallback, useEffect, useState } from "react";
import { callPostAPI } from "../../../services/apis";
import { ENDPOINTS } from "../../../utils/APIEndpoints";
import { toast } from "react-toastify";
import Select from "../../../components/Dropdown/Dropdown";
import moment from "moment";
import Radio from "../../../components/Radio/Radio";
import CancelDialogBox from "../../../components/DialogBox/CancelDialogBox";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import {
  LOCALSTORAGE,
  saveTracker,
  formateDate,
  onlyDateFormat,
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
import "./ServiceRequest.css";
import { appName } from "../../../utils/pagePath";
import { decryptData } from "../../../utils/encryption_decryption";
import LoaderS from "../../../components/Loader/Loader";
import ReopenDialogBox from "../../../components/DialogBox/ReopenDialogBox";
import WorkCompletion from "../../../components/DialogBox/WorkCompletion";
import LoaderFileUpload from "../../../components/Loader/LoaderFileUpload";
import ImageGalleryComponent from "../ImageGallery/ImageGallaryComponent";
import LoaderShow from "../../../components/Loader/LoaderShow";

const ServiceRequestDetailForm = (props: any) => {
  let [CURRENT_STATUS, setCurrentStatus] = useState<any>(0);
  const [selectedFacility, menuList]: any = useOutletContext();
  const [transactionStatus, setTransactionStatus] = useState<any | null>();
  const { t } = useTranslation();
  const navigate: any = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const [Descriptionlength, setDescriptionlength] = useState(0);
  const [options, setOptions] = useState<any | null>([]);

  const [TeamList, setTeamList] = useState<any | null>([]);
  const [workOrderOption, setWorkOrderOption] = useState<any | null>([]);
  const [technician, setTechnician] = useState<any | null>([]);
  const [Currenttechnician, setCurrentTechnician] = useState<any | null>([]);
  const [selectedDetails, setSelectedDetails] = useState<any>([]);
  const [assignStatus, setAssignStatus] = useState(false);
  const [technicianStatus, setTechnicianStatus] = useState<any | null>();
  const [locationtypeOptions, setlocationtypeOptions] = useState([]);
  const [technicianData, setTechnicianData] = useState<any | null>([]);
  const [loading, setLoading] = useState<any | null>(false);
  const [isloading, setisloading] = useState<any | null>(false);
  const [editStatus, setEditStatus] = useState(true);
  const [PriorityEditStatus, setPriorityEditStatus] = useState(false);
  const [IsSubmit, setIsSubmit] = useState<any | null>(false);
  const [IsGenerateWorkOrder, setIsGenerateWorkOrder] = useState<any | null>(
    false
  );

  const [docOption, setDocOption] = useState<any | null>([]);
  const [signatureDoc, setSignatureDoc] = useState<any | null>([]);
  const [type, setType] = useState<any | null>([]);
  const [technicianList, setTechnicianList] = useState<any | null>([]);
  const [ActivityTimeLineList, setActivityTimeLineList] = useState<any | null>(
    []
  );
  const [severity, setSeverity] = useState<any | null>([]);
  const [assetList, setAssetList] = useState<any | null>([]);

  const getId: any = localStorage.getItem("Id");
  const dataId = JSON.parse(getId);
  const [error, setError] = useState<any | null>(false);
  const [locationId, setLocationId] = useState<any | null>("");
  const [cancelError, setCancelError] = useState<any | null>(false);
  const [uploadSupportMandatory, setUploadSupportMandatory] = useState<
    any | null
  >(false);
  let { pathname } = useLocation();
  const [uploadError, setUploadError] = useState<any | null>(false);
  const [iseditDetails, setiseditDetails] = useState<any | null>(false);
  const [isShowAssignee, setisShowAssignee] = useState<any | null>(false);
  const [isPreCondition, setIsPreCondtion] = useState<any | null>(false);

  const [isPreConditionStatus, setIsPreConditionStatus] = useState<any | null>(
    false
  );
  const [Remarklength, setReamrkLength] = useState<any | null>(0);

  let locationData: any = localStorage.getItem("LOCATIONNAME");
  const IsAssignAdd = decryptData(localStorage.getItem(LOCALSTORAGE?.ISASSIGN));
  console.log(IsAssignAdd, "IsAssignAdd");
  let locationIdData: any = JSON.parse(locationData);

  let showdetails = true;
  const currentMenu = menuList
    ?.flatMap((menu: any) => menu?.DETAIL)
    .filter((detail: any) => {
      if (detail?.FUNCTION_CODE === "AS007") {
        showdetails = false;
      }
      return detail.URL === pathname;
    })[0];

  const currentWorkOrderRights = menuList
    ?.flatMap((menu: any) => menu?.DETAIL)
    .filter((detail: any) => {
      return detail.URL === "/workorderlist";
    })[0];

  const assestTypeLabel: any = [
    { name: "Equipment", key: "A" },
    { name: "Soft Services", key: "N" },
  ];

  const { search } = useLocation();
  const [visibleImage, setVisibleImage] = useState<boolean>(false);
  const [showImage, setShowImage] = useState<any>([]);
  const handleInputChange = (event: any) => {
    const value = event.target.value;
    setDescriptionlength(value?.length);
  };
  const [uploadMandatroy, setUploadMandatroy] = useState<any | null>(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    resetField,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      WO_ID: search === "?add=" ? 0 : localStorage.getItem("WO_ID"),
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
      LOCATION_ID: search === "?add=" && locationIdData,
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
      // CancelRemark:""
    },
    mode: "onSubmit",
  });

  const doclist = watch("DOC_LIST");

  useEffect(() => {
    const sevrityList: any = severity?.filter(
      (f: any) => f.SEVERITY_ID === f?.SEVERITY_ID
    );
    setSeverity(sevrityList);
  }, [PriorityEditStatus]);

  const OpenPriorityDropDown = () => {
    if (PriorityEditStatus) {
      setPriorityEditStatus(false);
    } else if (!PriorityEditStatus) {
      setValue("SEVERITY_CODE", selectedDetails?.SEVERITY_CODE);
      setPriorityEditStatus(true);
    }
  };

  const onClickEditButton = () => {
    setiseditDetails(!iseditDetails);
    setisShowAssignee(!isShowAssignee);
    setAssignStatus(!assignStatus);
  };

  const OpenAssignUserPopUp = () => {
    if (!assignStatus) {
      setEditStatus(true);
      setAssignStatus(true);
      setisShowAssignee(true);
    } else if (assignStatus) {
      setEditStatus(false);
      setAssignStatus(false);
      setisShowAssignee(false);
    }
  };

  const onClickCancelButton = () => {
    setisShowAssignee(false);
    setValue("TECH_ID", []);
    setValue("ASSIGN_TEAM_ID", "");
    handleClearAll();
    if (editStatus && assignStatus && !PriorityEditStatus) {
      setAssignStatus(false);
      setiseditDetails(false);
      return;
    } else if (
      editStatus &&
      assignStatus &&
      !PriorityEditStatus &&
      search === "?add="
    ) {
      setAssignStatus(false);
      navigate("/servicerequestlist");
      return;
    } else if (editStatus && !assignStatus && PriorityEditStatus) {
      setValue("SEVERITY_CODE", "");
      setPriorityEditStatus(false);
      return;
    } else if (editStatus && assignStatus && PriorityEditStatus) {
      setAssignStatus(false);
      setPriorityEditStatus(false);
      return;
    } else if (
      editStatus &&
      assignStatus &&
      !PriorityEditStatus &&
      search === "?edit="
    ) {
      setValue("ASSIGN_TEAM_ID", "");
      setAssignStatus(false);
      return;
    } else {
      navigate("/servicerequestlist");
    }
  };

  const isOnlySpaces = (str: any) => {
    if (str?.length === 0) {
      return true;
    } else {
      return str.trim() === "";
    }
  };

  const ASSET_NONASSET: any = watch("ASSET_NONASSET");
  const watchAll: any = watch();

  const onSubmit = useCallback(
    async (payload: any, e: any) => {
      setIsSubmit(true);
      if (IsGenerateWorkOrder === true && search === "?edit=") {
        return true;
      }
      setIsGenerateWorkOrder(true);

      if (search === "?add=" && uploadSupportMandatory) {
        if (payload?.DOC_LIST?.length === 0) {
          toast.error("Please select required fields");

          setUploadError(true);
          setIsSubmit(false);
          return true;
        }
      }
      setAssignStatus(false);
      setisShowAssignee(false);
      setiseditDetails(false);

      const buttonMode: any = e?.nativeEvent?.submitter?.name;
      if (
        buttonMode === "PRECANCEL" &&
        technicianList?.length === 0 &&
        payload?.REMARKS?.trim() === ""
      ) {
        toast?.error("Please fill the required field");
        setCancelError(true);
        setError(false);
        setIsSubmit(false);
        setIsGenerateWorkOrder(false);
        return;
      }
      setUploadError(false);

      if (buttonMode === "Accept" || buttonMode === "Reopen") {
        return;
      }
      if (search === "?add=" && IsAssignAdd && technicianList?.length === 0) {
        toast?.error("Please fill the required field");
        setError(true);
        setIsSubmit(false);
        setIsGenerateWorkOrder(false);
        return;
      }
      if (buttonMode === "CONVERT" && technicianList?.length === 0) {
        toast?.error("Please fill the required field");
        setError(true);
        setIsSubmit(false);
        setIsGenerateWorkOrder(false);
        return;
      }
      if (
        buttonMode === "CONVERT" &&
        technicianList?.length === 0 &&
        assignStatus
      ) {
        toast?.error("Please fill the required field");
        setIsSubmit(false);
        setIsGenerateWorkOrder(false);
        return;
      }

      let isValid: any = true;
      payload.ASSET_NONASSET = ASSET_NONASSET?.key
        ? ASSET_NONASSET?.key
        : ASSET_NONASSET;
      payload.ASSET_ID =
        iseditDetails === true
          ? payload?.ASSET_ID?.ASSET_ID
          : payload?.ASSET_ID?.ASSET_ID !== undefined
          ? payload?.ASSET_ID?.ASSET_ID
          : selectedDetails?.ASSET_ID;

      payload.LOCATION_ID =
        payload?.LOCATION_ID?.LOCATION_ID !== undefined
          ? payload?.LOCATION_ID?.LOCATION_ID
          : selectedDetails?.LOCATION_ID;

      payload.CONTACT_NAME =
        search === "?edit="
          ? selectedDetails?.CONTACT_NAME
          : payload?.REPORTER_NAME;
      payload.CONTACT_EMAIL =
        search === "?edit="
          ? selectedDetails?.CONTACT_EMAIL
          : payload?.REPORTER_EMAIL;
      payload.CONTACT_PHONE =
        search === "?edit="
          ? selectedDetails?.CONTACT_PHONE
          : payload?.REPORTER_MOBILE;
      payload.REQ_ID =
        payload?.REQ_ID?.REQ_ID !== undefined
          ? payload?.REQ_ID?.REQ_ID
          : selectedDetails?.REQ_ID;

      payload.SEVERITY_CODE = payload?.SEVERITY_CODE?.SEVERITY_ID
        ? payload?.SEVERITY_CODE?.SEVERITY_ID
        : selectedDetails?.SEVERITY_CODE;

      payload.ACTIVE = 1;
      payload.ASSIGN_TEAM_ID =
        payload.ASSIGN_TEAM_ID?.TEAM_ID !== undefined
          ? payload.ASSIGN_TEAM_ID?.TEAM_ID
          : selectedDetails?.TEAM_ID;

      payload.ASSETGROUP_ID =
        payload?.GROUP?.ASSETGROUP_ID !== undefined
          ? payload?.GROUP?.ASSETGROUP_ID
          : selectedDetails?.ASSETGROUP_ID;

      payload.ASSETTYPE_ID =
        iseditDetails === true
          ? payload?.TYPE?.ASSETTYPE_ID
          : payload?.TYPE?.ASSETTYPE_ID !== undefined
          ? payload?.TYPE?.ASSETTYPE_ID
          : selectedDetails?.ASSETTYPE_ID;

      payload.SER_REQ_NO = selectedDetails?.SER_REQ_NO
        ? selectedDetails?.SER_REQ_NO
        : buttonMode === "CONVERT"
        ? selectedDetails?.SER_REQ_NO
        : selectedDetails?.SER_REQ_NO;
      if (locationtypeOptions?.length > 0) {
        locationtypeOptions.forEach((element: any) => {
          if (payload?.LOCATION_ID === element?.LOCATION_ID) {
            payload.LOCATION_DESCRIPTION = element?.LOCATION_DESCRIPTION;
          } else {
          }
        });
      } else {
        payload.LOCATION_DESCRIPTION = selectedDetails?.LOCATION_DESCRIPTION;
      }

      setError(false);
      payload.WO_DATE =
        search === "?edit="
          ? props?.selectedData?.WO_DATE
          : moment(new Date()).format("DD-MM-YYYY");
      payload.MODE =
        buttonMode !== "" ? buttonMode : search === "?edit=" ? "E" : "A";
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
        buttonMode === "PRECANCEL"
          ? {
              para1: `Service Request has been`,
              para2: "Cancelled-Preconditional",
            }
          : buttonMode === "CANCEL"
          ? { para1: `${t("Service Request")}`, para2: "Cancelled" }
          : buttonMode === "CONVERT"
          ? { para1: `${t("Work Order")}`, para2: "Generated" }
          : search === "?edit="
          ? { para1: `${t("Service Request")}`, para2: "Updated" }
          : technicianStatus === "A"
          ? { para1: `${t("Work Order")}`, para2: "Generated" }
          : { para1: `${t("Service Request")}`, para2: "Created" };

      if (buttonMode === "CANCEL") {
        if (
          payload?.REMARKS === undefined ||
          payload?.REMARKS === " " ||
          payload?.REMARKS === null
        ) {
          toast.error("Please enter the remarks");
          setIsGenerateWorkOrder(false);
          setIsSubmit(false);
          return;
        }
        if (isOnlySpaces(payload?.REMARKS)) {
          toast.error("Please enter the remarks");
          setIsGenerateWorkOrder(false);
          setIsSubmit(false);
          return;
        }
      }

      const TECH_DATA = payload?.TECH_ID?.filter(
        (f: any) => f.TEAM_ID === payload?.ASSIGN_TEAM_ID
      );

      if (TECH_DATA?.length === technicianList?.length) {
        const sameUserIds = TECH_DATA.map((t: any) => t.USER_ID)
          .sort((a: any, b: any) => a - b)
          .every(
            (id: any, index: any) =>
              id ===
              technicianList
                .map((t: any) => t.USER_ID)
                .sort((a: any, b: any) => a - b)[index]
          );
        if (sameUserIds) {
          payload.TECH_ID = [];
        }
      } else {
        payload.TECH_ID =
          payload?.TECH_ID?.length > 0 ? TECH_DATA : technicianList;
      }

      if (
        technicianStatus === "M" &&
        decryptData(localStorage.getItem(LOCALSTORAGE?.ROLETYPECODE)) !== "T" &&
        decryptData(localStorage.getItem(LOCALSTORAGE?.ISASSIGN)) === true
      ) {
        if (!PriorityEditStatus) {
          if (TECH_DATA === 0) {
            isValid = false;
          }
        }
      }

      if (isValid === true) {
        try {
          const res = await callPostAPI(
            ENDPOINTS.SAVE_SERVICEREQUEST,
            payload,
            "HD004"
          );
          if (res?.FLAG === true) {
            const resService = await callPostAPI(
              ENDPOINTS.GET_SERVICEREQUEST_DETAILS,
              {
                WO_NO: res?.WO_NO,
                WO_ID: 0,
              }
            );
            setCurrentStatus(
              resService?.SERVICEREQUESTDETAILS[0]?.CURRENT_STATUS
            );
            if (buttonMode !== "CONVERT" && technicianStatus === "M") {
              if (resService?.FLAG === 1) {
                // setIsSubmit(false);
                // setIsGenerateWorkOrder(false);
                const notifcation: any = {
                  FUNCTION_CODE: currentMenu?.FUNCTION_CODE,
                  EVENT_TYPE: buttonMode === "CONVERT" ? "W" : "S",
                  AddToServiceRequest: "",
                  STATUS_CODE:
                    buttonMode === "CANCEL"
                      ? 8
                      : buttonMode === "PRECANCEL"
                      ? 18
                      : buttonMode === "CONVERT"
                      ? 1
                      : search === "?edit="
                      ? 2
                      : 1,
                  WO_ID: search === "?edit=" ? selectedDetails?.WO_ID : 0,
                  WO_NO:
                    buttonMode === "CONVERT" ||
                    buttonMode === "CANCEL" ||
                    search === "?edit="
                      ? selectedDetails?.WO_NO
                      : res?.WO_NO,
                  PARA1:
                    search === "?edit="
                      ? decryptData(localStorage.getItem("USER_NAME"))
                      : decryptData(localStorage.getItem("USER_NAME")),
                  PARA2:
                    search === "?edit="
                      ? formateDate(selectedDetails?.SERVICEREQ_CREATE_TIME)
                      : formateDate(
                          resService?.SERVICEREQUESTDETAILS[0]
                            ?.SERVICEREQ_CREATE_TIME
                        ),
                  PARA3:
                    search === "?edit="
                      ? selectedDetails?.SER_REQ_NO
                      : res?.WO_NO,
                  PARA4:
                    search === "?add="
                      ? resService?.SERVICEREQUESTDETAILS[0]?.ASSET_NONASSET ===
                        "A"
                        ? "Equipment"
                        : "Soft Services"
                      : search === "?edit="
                      ? selectedDetails?.ASSET_NONASSET === "A"
                        ? "Equipment"
                        : "Soft Services"
                      : "",
                  PARA5:
                    search === "?add="
                      ? resService?.SERVICEREQUESTDETAILS[0]
                          ?.LOCATION_DESCRIPTION
                      : search === "?edit="
                      ? selectedDetails?.LOCATION_DESCRIPTION
                      : "",
                  PARA6:
                    search === "?add="
                      ? resService?.SERVICEREQUESTDETAILS[0]?.ASSET_NAME
                      : search === "?edit="
                      ? selectedDetails?.ASSET_NAME
                      : "",
                  PARA7:
                    search === "?add="
                      ? resService?.SERVICEREQUESTDETAILS[0]?.REQ_DESC
                      : search === "?edit="
                      ? selectedDetails?.REQ_DESC
                      : "",
                  PARA8:
                    search === "?add="
                      ? resService?.SERVICEREQUESTDETAILS[0]?.WO_REMARKS
                      : search === "?edit="
                      ? selectedDetails?.WO_REMARKS
                      : "",
                  PARA9:
                    search === "?add="
                      ? resService?.SERVICEREQUESTDETAILS[0]?.SEVERITY_DESC
                      : PriorityEditStatus
                      ? watchAll?.SEVERITY_CODE?.SEVERITY
                      : search === "?edit="
                      ? selectedDetails?.SEVERITY_DESC
                      : "",
                  PARA10:
                    search === "?add="
                      ? resService?.SERVICEREQUESTDETAILS[0]?.SEVERITY_DESC
                      : PriorityEditStatus
                      ? watchAll?.SEVERITY_CODE?.SEVERITY
                      : search === "?edit="
                      ? selectedDetails?.SEVERITY_DESC
                      : "",
                };

                const eventPayload = { ...eventNotification, ...notifcation };

                await helperEventNotification(eventPayload);
                setIsGenerateWorkOrder(false);
                setIsSubmit(false);
              }
              //  else if (buttonMode === "PRECANCEL") {
              //   const notifcation: any = {
              //     FUNCTION_CODE: currentMenu?.FUNCTION_CODE,
              //     EVENT_TYPE: "S",
              //     AddToServiceRequest: "",
              //     STATUS_CODE: 18,

              //     WO_ID: selectedDetails?.WO_ID ?? 0,
              //     WO_NO:
              //       buttonMode === "PRECANCEL" ||
              //         search === "?edit="
              //         ? selectedDetails?.WO_NO
              //         : res?.WO_NO,
              //     PARA1:
              //       search === "?edit="
              //         ? decryptData(localStorage.getItem("USER_NAME"))
              //         : decryptData(localStorage.getItem("USER_NAME")),
              //     PARA2:
              //       search === "?edit="
              //         ? formateDate(selectedDetails?.SERVICEREQ_CREATE_TIME)
              //         : formateDate(
              //           resService?.SERVICEREQUESTDETAILS[0]
              //             ?.SERVICEREQ_CREATE_TIME
              //         ),
              //     PARA3:
              //       search === "?edit="
              //         ? selectedDetails?.SER_REQ_NO
              //         : res?.WO_NO,
              //     PARA4:
              //       search === "?edit="
              //         ? selectedDetails?.ASSET_NONASSET === "A"
              //           ? "Equipment"
              //           : "Soft Services"
              //         : "",
              //     PARA5:
              //       search === "?edit="
              //         ? selectedDetails?.LOCATION_DESCRIPTION
              //         : "",
              //     PARA6: search === "?edit=" ? selectedDetails?.ASSET_NAME : "",
              //     PARA7: search === "?edit=" ? selectedDetails?.REQ_DESC : "",
              //     PARA8: search === "?edit=" ? selectedDetails?.WO_REMARKS : "",
              //     PARA9: PriorityEditStatus
              //       ? watchAll?.SEVERITY_CODE?.SEVERITY
              //       : search === "?edit="
              //         ? selectedDetails?.SEVERITY_DESC
              //         : "",
              //     PARA10: PriorityEditStatus
              //       ? watchAll?.SEVERITY_CODE?.SEVERITY
              //       : search === "?edit="
              //         ? selectedDetails?.SEVERITY_DESC
              //         : "",
              //   };

              //   const eventPayload = { ...eventNotification, ...notifcation };

              //   await helperEventNotification(eventPayload);
              //   setIsGenerateWorkOrder(false);
              //   setIsSubmit(false);
              // }
            } else {
              const resWork: any = await callPostAPI(
                ENDPOINTS.GET_WORKORDER_DETAILS,
                {
                  WO_ID:
                    technicianStatus === "A" &&
                    resService?.SERVICEREQUESTDETAILS[0]?.ISSERVICEREQ === false
                      ? resService?.SERVICEREQUESTDETAILS[0]?.WO_ID
                      : selectedDetails?.WO_ID,
                }
              );
              if (resWork?.FLAG === 1) {
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
                  PARA3:
                    resWork?.WORKORDERDETAILS[0]?.WO_DATE === null
                      ? ""
                      : onlyDateFormat(resWork?.WORKORDERDETAILS[0]?.WO_DATE),
                  PARA4: resWork?.WORKORDERDETAILS[0]?.USER_NAME,
                  PARA5: resWork?.WORKORDERDETAILS[0]?.LOCATION_DESCRIPTION,
                  PARA6: resWork?.WORKORDERDETAILS[0]?.ASSET_NAME,
                  PARA7: resWork?.WORKORDERDETAILS[0]?.REQ_DESC,
                  PARA8: resWork?.WORKORDERDETAILS[0]?.SEVERITY_DESC,
                  PARA9:
                    resWork?.WORKORDERDETAILS[0]?.REPORTED_AT === null
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

                await helperEventNotification(eventPayload);
                setIsSubmit(false);
                setIsGenerateWorkOrder(false);
              }
            }

            toast?.success(res?.MSG);
            setIsSubmit(false);
            if (
              resService?.SERVICEREQUESTDETAILS[0]?.WO_ASSIGN === "A" &&
              resService?.SERVICEREQUESTDETAILS[0]?.ISSERVICEREQ === false
            ) {
              localStorage.setItem(
                "WO_ID",
                resService?.SERVICEREQUESTDETAILS[0]?.WO_ID
              );
              setIsGenerateWorkOrder(false);

              if (
                decryptData(
                  localStorage.getItem(LOCALSTORAGE?.ROLETYPECODE)
                ) === "O"
              ) {
                navigate(`${appName}/servicerequestlist`);
                props?.getAPI();
              } else {
                // navigate(`${appName}/servicerequestlist`);
                setTimeout(() => {
                  navigate(`${appName}/servicerequestlist?edit=`);
                }, 1000);
              }
            } else if (buttonMode === "CONVERT") {
              setIsGenerateWorkOrder(false);
              navigate(`${appName}/servicerequestlist`);
            } else if (
              (PriorityEditStatus === true || assignStatus === true) &&
              search === "?edit="
            ) {
              setPriorityEditStatus(false);
              setAssignStatus(false);
              setEditStatus(true);
              setError(false);
              setIsSubmit(false);
              setIsGenerateWorkOrder(false);
              getOptionDetails();
              setiseditDetails(false);
              navigate(`${appName}/servicerequestlist?edit=`);
            } else {
              navigate(`${appName}/servicerequestlist`);
            }
          } else {
            setIsSubmit(false);
            setIsGenerateWorkOrder(false);
            toast.error(res?.MSG);
          }
        } catch (error: any) {
          setIsSubmit(false);
          setIsGenerateWorkOrder(false);
          toast?.error(error);
        }
      } else {
        if (PriorityEditStatus) {
          setPriorityEditStatus(false);
          setAssignStatus(false);
          setEditStatus(true);
          setError(false);
          setIsSubmit(false);
          setIsGenerateWorkOrder(false);
        } else {
          setIsSubmit(false);
          setIsGenerateWorkOrder(false);
          setError(true);
          toast.error("Please fill the required fields");
        }
      }
    },
    [
      ASSET_NONASSET,
      technicianList,
      assignStatus,
      selectedDetails,
      PriorityEditStatus,
      locationtypeOptions,
      search,
      props,
      t,
      currentMenu,
      decryptData,
      helperEventNotification,
      navigate,
      eventNotification,
      isOnlySpaces,
      formateDate,
      localStorage,
      setIsSubmit,
      setIsGenerateWorkOrder,
      setError,
      setPriorityEditStatus,
      setAssignStatus,
      setEditStatus,
      toast,
      callPostAPI,
      ENDPOINTS,
    ]
  );

  const GetOpenList = () => {
    navigate(`${appName}/servicerequestlist`, { state: "workorder" });
  };
  const getDocmentList = async (WO_ID: any) => {
    setisloading(true);
    try {
      // setisloading(true)
      const res = await callPostAPI(
        ENDPOINTS.GET_DOCLIST,
        {
          WO_ID: WO_ID,
        },
        "AS067"
      );

      setValue("DOC_LIST", res?.WORKORDERDOCLIST);
      if (res?.FLAG === 1) {
        setDocOption(res?.WORKORDERDOCLIST);
        setSignatureDoc(res?.DIGITAlSIGNLIST);
      }
    } catch (error: any) {
      setisloading(false);
    } finally {
      setisloading(false);
    }
  };

  const getOptionDetails = async () => {
    try {
      setLoading(true);
      const res = await callPostAPI(
        ENDPOINTS.GET_SERVICEREQUEST_DETAILS,
        { WO_ID: localStorage.getItem("WO_ID") },
        "HD004"
      );

      if (res?.FLAG === 1) {
        setTechnicianList(res?.ASSIGNTECHLIST);
        if (res?.SERVICEREQUESTDETAILS?.length > 0) {
          setSelectedDetails(res?.SERVICEREQUESTDETAILS[0]);
        } else {
          toast.error("No Data Found");
        }
        if (locationtypeOptions?.length > 0) {
          const selectedLoaction: any = locationtypeOptions?.filter(
            (f: any) =>
              f.LOCATION_ID === res?.SERVICEREQUESTDETAILS[0]?.LOCATION_ID
          );

          if (selectedLoaction?.length > 0) {
            setValue("LOCATION_ID", selectedLoaction[0]);
          }
        }
        if (
          options?.assetGroup?.length > 0 ||
          options?.serviceGroup?.length > 0
        ) {
          if (selectedDetails?.ASSET_NONASSET === "A") {
            const selectedGroupa: any = options?.assetGroup?.filter(
              (f: any) =>
                f?.ASSETGROUP_ID ===
                res?.SERVICEREQUESTDETAILS[0]?.ASSETGROUP_ID
            );

            setValue("GROUP", selectedGroupa[0]);
          } else {
            const selectedGroupn: any = options?.serviceGroup?.filter(
              (f: any) =>
                f?.ASSETGROUP_ID ===
                res?.SERVICEREQUESTDETAILS[0]?.ASSETGROUP_ID
            );

            setValue("GROUP", selectedGroupn[0]);
          }
        }

        await getWoOrderList(
          res?.SERVICEREQUESTDETAILS[0]?.ASSETGROUP_ID,
          res?.SERVICEREQUESTDETAILS[0]?.ASSET_NONASSET
        );

        if (workOrderOption?.length > 0) {
          const selectedissue: any = workOrderOption?.filter(
            (f: any) => f?.REQ_ID === res?.SERVICEREQUESTDETAILS[0]?.REQ_ID
          );

          setValue("REQ_ID", selectedissue[0]);
        }
        setValue(
          "ASSET_NONASSET",
          res?.SERVICEREQUESTDETAILS[0]?.ASSET_NONASSET
        );
        if (assetList?.length > 0) {
          const selectedAsset: any = assetList?.filter(
            (f: any) => f?.ASSET_ID === res?.SERVICEREQUESTDETAILS[0]?.ASSET_ID
          );

          setValue("ASSET_ID", selectedAsset[0]);
        }
        if (type?.length > 0) {
          const selectedType: any = type?.filter(
            (f: any) =>
              f?.ASSETTYPE_ID === res?.SERVICEREQUESTDETAILS[0]?.ASSETTYPE_ID
          );

          setValue("TYPE", selectedType[0]);
        }
        setValue(
          "ASSET_NONASSET",
          res?.SERVICEREQUESTDETAILS[0]?.ASSET_NONASSET
        );
        setValue("WO_REMARKS", res?.SERVICEREQUESTDETAILS[0]?.WO_REMARKS);
        setDescriptionlength(res?.SERVICEREQUESTDETAILS[0]?.WO_REMARKS?.length);
        setValue(
          "WO_DATE",
          onlyDateFormat(res?.SERVICEREQUESTDETAILS[0]?.WO_DATE)
        );
        if (TeamList?.length > 0) {
          const selectedTeam: any = TeamList?.filter(
            (f: any) => f?.TEAM_ID === res?.SERVICEREQUESTDETAILS[0]?.TEAM_ID
          );

          setValue("ASSIGN_TEAM_ID", selectedTeam[0]);
        }

        if (Currenttechnician?.length > 0 && res?.ASSIGNTECHLIST?.length > 0) {
          // const selectedtech: any = Currenttechnician?.filter((f: any) => f?.USER_ID === res?.ASSIGNTECHLIST[0]?.USER_ID)

          const selectedTechs = Currenttechnician?.filter((tech: any) =>
            res?.ASSIGNTECHLIST?.some(
              (assign: any) => assign?.USER_ID === tech?.USER_ID
            )
          );

          setValue("TECH_ID", selectedTechs);
          setTechnicianData(selectedTechs);
        }
        if (options?.severityLIST?.length > 0) {
          const selectedSeverity: any = options?.severityLIST?.filter(
            (f: any) =>
              f.SEVERITY_ID === res?.SERVICEREQUESTDETAILS[0]?.SEVERITY_CODE
          );

          setValue("SEVERITY_CODE", selectedSeverity[0]);
        }

        setActivityTimeLineList(res?.ACTIVITYTIMELINELIST);
        setValue("DOC_LIST", res?.WODOCLIST);

        setCurrentStatus(res?.SERVICEREQUESTDETAILS[0]?.CURRENT_STATUS);
        if (props?.selectedData?.STATUS_DESC === "Cancelled") {
          // setStatus(false);
        } else {
          // setStatus(true);
        }
        let ASSETGROUP_ID = res?.SERVICEREQUESTDETAILS[0]?.ASSETGROUP_ID;
        await GET_ASSETGROUPTEAMLIST(ASSETGROUP_ID);
      } else {
        toast.error("No Data Found");
      }
    } catch (error: any) {
      toast.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getOptions = async () => {
    try {
      setLoading(true);
      const res = await callPostAPI(
        ENDPOINTS?.GET_SERVICEREQUST_MASTERLIST,
        {},
        "HD004"
      );
      if (res?.FLAG === 1) {
        setOptions({
          userList: res?.USERLIST,
          severityLIST: res?.SEVERITYLIST,
          wo_list: res?.WORIGHTSLIST,
          assetGroup: res?.ASSETGROUPLIST?.filter(
            (f: any) => f?.ASSETGROUP_TYPE === "A"
          ),
          serviceGroup: res?.ASSETGROUPLIST.filter(
            (f: any) => f?.ASSETGROUP_TYPE === "N"
          ),
          assetType: res?.ASSETTYPELIST,
          assestOptions: res?.ASSETLIST,
          userMaster: res?.USERLIST,
        });
        setTeamList(res?.TEAMLIST);
        setSeverity(res?.SEVERITYLIST);
        //setUserId(parseInt(id));
        const userData: any = decryptData(localStorage?.getItem("USER"));
        const userDetails: any = userData;
        setValue("REPORTER_NAME", userDetails?.USER_NAME);
        setValue("REPORTER_EMAIL", userDetails?.USER_EMAILID);
        setValue("REPORTER_MOBILE", userDetails?.USER_MOBILENO);
        setTransactionStatus({
          cancel: res?.WORIGHTSLIST?.find(
            (f: any) => f?.FUNCTION_CODE === "SR002"
          ),
        });
        setLocationId(locationIdData);
        if (search === "?edit=") {
          await getOptionDetails();
          await getDocmentList(localStorage.getItem("WO_ID"));
        }
      }
    } catch (error: any) {
      toast?.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (locationtypeOptions?.length > 0 && selectedDetails?.LOCATION_ID) {
      const selectedLoaction: any = locationtypeOptions?.filter(
        (f: any) => f?.LOCATION_ID === selectedDetails?.LOCATION_ID
      );

      if (selectedLoaction?.length > 0) {
        setValue("LOCATION_ID", selectedLoaction[0]);
      }
    }
  }, [selectedDetails?.LOCATION_ID, iseditDetails, locationtypeOptions]);

  useEffect(() => {
    const selectedSeverity =
      options?.severityLIST?.length >= 1
        ? options?.severityLIST.find(
            (option: any) => option?.SEVERITY === "Low"
          )
        : null;

    setValue("SEVERITY_CODE", selectedSeverity);
  }, [options]);

  const getWoOrderList = async (ASSETGROUP_ID: any, ASSET_NONASSET?: any) => {
    const payload: any = {
      ASSETGROUP_ID: ASSETGROUP_ID,
      ASSET_NONASSET: ASSET_NONASSET?.key
        ? ASSET_NONASSET?.key
        : ASSET_NONASSET,
    };

    const res = await callPostAPI(
      ENDPOINTS.GET_SERVICEREQUEST_WORKORDER,
      payload,
      "HD004"
    );

    if (res?.FLAG === 1) {
      setValue("REQ_ID", "");
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
    if (search === "?add=" || search === "?edit=") {
      await GET_ASSETGROUPTEAMLIST(ASSETGROUP_ID);
    }
  };

  useEffect(() => {
    if (watchAll?.ASSET_NONASSET?.key !== undefined) {
      if (selectedDetails?.ASSET_NONASSET === watchAll?.ASSET_NONASSET?.key) {
        setValue("TYPE", "");
        setValue("ASSET_ID", "");
        setType([]);
        setAssetList([]);
      } else {
        setValue("TYPE", "");
        setValue("ASSET_ID", "");
        setType([]);
        setAssetList([]);
        setValue("REQ_ID", "");
        setValue("WO_REMARKS", "");
      }
      //
    }
  }, [watchAll?.ASSET_NONASSET]);

  const statusColor = (element: any) => {
    const baseStatus = element?.split(" (Re-open)")[0];
    let data: any = localStorage?.getItem("statusColorCode");
    const dataColor: any = JSON?.parse(data);
    return dataColor.find((item: any) => item?.STATUS_DESC === baseStatus)
      ?.COLORS;
  };
  const GET_ASSETGROUPTEAMLIST = async (ASSETGROUP_ID: any) => {
    const payload: any = {
      ASSETGROUP_ID: ASSETGROUP_ID,
    };
    const res = await callPostAPI(
      ENDPOINTS?.GET_ASSETGROUPTEAMLIST,
      payload,
      "HD004"
    );

    if (res?.FLAG === 1) {
      setTeamList(res?.TEAMLIST);
      setTechnician(res?.TECHLIST);
      setCurrentTechnician(res?.TECHLIST);
    } else {
      setTeamList([]);
      setTechnician([]);
    }
  };

  useEffect(() => {
    if (watchAll?.ASSET_NONASSET) {
      setValue("TYPE", "");
      setValue("ASSET_ID", "");
      setType([]);
      setAssetList([]);
    }
  }, [watchAll?.ASSET_NONASSET]);
  console.log(IsSubmit, "setIsSubmit");
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
          <div>
            {option?.LOCATION_DESCRIPTION !== null
              ? option?.LOCATION_DESCRIPTION
              : ""}
          </div>
        </div>
      );
    }

    return <span>{props?.placeholder}</span>;
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
        <div className="Text_Primary Table_Header">{option?.LOCATION_NAME}</div>
        <div className=" Text_Secondary Helper_Text">
          {option?.LOCATION_DESCRIPTION !== null
            ? option?.LOCATION_DESCRIPTION
            : ""}
        </div>
      </div>
    );
  };

  const GetAddAssignee = (e: any) => {
    if (e?.target?.value !== "" || e?.target?.value !== undefined) {
      setCurrentTechnician(technician);
    }
  };

  let techData: any = [];
  let techData1: any = [];

  const handleRemove = (removeTechnician: any) => {
    techData = watchAll.TECH_ID;
    setValue("TECH_ID", techData1);
    watchAll.TECH_ID = watchAll?.TECH_ID?.filter(
      (f: any) => f?.USER_ID !== removeTechnician?.USER_ID
    );
    setTechnicianData(watchAll?.TECH_ID);
  };

  const handleClearAll = () => {
    setTechnicianData([]);
  };
  const getLocation = async () => {
    if (search === "?add=" || iseditDetails) {
      const res1 = await callPostAPI(
        ENDPOINTS.LOCATION_HIERARCHY_LIST,
        null,
        "HD004"
      );
      if (res1?.FLAG === 1) {
        setlocationtypeOptions(res1?.LOCATIONHIERARCHYLIST);
      }
    }
  };
  useEffect(() => {
    if (currentMenu || iseditDetails) {
      setCurrentStatus(props?.selectedData?.CURRENT_STATUS);
      (async function () {
        if (search === "?add=" || iseditDetails) {
          await getLocation();
        }
        await getOptions();
        await saveTracker(currentMenu);
      })();
    }
  }, [currentMenu, iseditDetails]);

  useEffect(() => {
    if (
      (!isSubmitting && Object?.values(errors)[0]?.type === "required") ||
      (!isSubmitting && Object?.values(errors)[0]?.type === "maxLength")
    ) {
      if (search === "?add=" && uploadSupportMandatory === true) {
        if (doclist?.length === 0) {
          const check: any = Object?.values(errors)[0]?.message;
          toast?.error(t(check));
          setUploadError(true);
        }
      } else {
        const check: any = Object?.values(errors)[0]?.message;
        toast?.error(t(check));
      }
      if (
        technicianStatus === "M" &&
        decryptData(localStorage.getItem(LOCALSTORAGE?.ROLETYPECODE)) !== "T"
      ) {
        if (watchAll?.TECH_ID?.length <= 0) {
          console.log(5555);
          setError(true);
        }
      }
    }
  }, [isSubmitting]);
  console.log(watchAll?.TECH_ID, "watchAll?.TECH_ID");

  const customizedContent = (item: any) => {
    return (
      <div className="flex justify-between mb-3 gap-3">
        <div className="mb-2">
          <p className=" Text_Primary flex Input_Label mb-2">
            {item?.title}
            <p className="Menu_Active Input_Label  ml-2 ">
              {item?.DOC_NO ?? ""}
            </p>
          </p>
          <p className="  Text_Secondary Helper_Text ">{item?.subtitle}</p>
          {item?.ISREMARKS === 1 ? (
            <p className="  Text_Secondary Helper_Text ">
              <b>Remarks:</b> {item?.TIMELINE_REMARKS}
            </p>
          ) : (
            <></>
          )}
        </div>
        <p className="Text_Secondary Helper_Text mt-4">
          {formateDate(item.date)}
        </p>
      </div>
    );
  };

  const getFacility = async () => {
    const res = await callPostAPI(ENDPOINTS?.BUILDING_DETAILS, {}, "HD004");
    setTechnicianStatus(res?.FACILITYDETAILS[0]?.WO_ASSIGN);

    setUploadSupportMandatory(
      res?.FACILITYDETAILS[0]?.isImgRequired === true ? true : false
    );
    setUploadMandatroy(
      res?.FACILITYDETAILS[0]?.isImgRequired === true ? true : false
    );
    setIsPreCondtion(
      res?.FACILITYDETAILS[0]?.ISPRECONDITION === true ? true : false
    );
  };

  useEffect(() => {
    (async function () {
      await getFacility();
    })();
  }, [selectedFacility]);

  if (loading) {
    return <LoaderS />;
  }

  return (
    <>
      <section className="w-full">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Card className="fixedContainer">
            <div className="flex justify-between">
              <div>
                <p className="Helper_Text Menu_Active flex mb-1">
                  {`Service Request`}
                  {search === "?add=" && (
                    <p className="Helper_Text Menu_Active ">
                      {" "}
                      Add / New Service Request
                    </p>
                  )}
                </p>
                {search === "?add=" && (
                  <h6 className=" Text_Primary Main_Service_Header_Text mb-1">
                    {t("Add Service Request")}
                  </h6>
                )}
                {search === "?edit=" && (
                  <div className="flex gap-2">
                    <h6 className="Text_Primary  Main_Service_Header_Text mb-1">
                      {selectedDetails?.ASSETGROUP_NAME} &gt;{" "}
                      {selectedDetails?.REQ_DESC?.length > 100
                        ? `${selectedDetails?.REQ_DESC?.slice(0, 100)}...`
                        : selectedDetails?.REQ_DESC}
                    </h6>
                    <p
                      style={{
                        backgroundColor: statusColor(
                          selectedDetails?.CURRENT_STATUS_DESC
                        ),
                        borderRadius: "50px",
                        padding: "0.5rem 0.8rem ",
                        textAlign: "center",
                        width: "auto",
                        fontSize: "12px",
                      }}
                    >
                      {selectedDetails?.CURRENT_STATUS_DESC ?? ""}
                    </p>
                  </div>
                )}
                {search === "?edit=" && (
                  <>
                    <div className="flex gap-2">
                      <p className="Sub_Service_Header_Text Text_Secondary ">
                        {selectedDetails?.SER_REQ_NO}
                      </p>
                    </div>
                  </>
                )}
              </div>
              <div>
                {((search === "?add=" && editStatus) ||
                  (search === "?edit=" &&
                    (assignStatus || PriorityEditStatus))) &&
                  CURRENT_STATUS !== 6 &&
                  selectedDetails?.ISSERVICEREQ !== false && (
                    <Buttons
                      className="Secondary_Button w-20 me-2"
                      label={"Cancel"}
                      // onClick={props?.isClick}
                      onClick={() => {
                        onClickCancelButton();
                      }}
                    />
                  )}

                {((search === "?add=" && editStatus) ||
                  (search === "?edit=" &&
                    (assignStatus || PriorityEditStatus || iseditDetails))) &&
                  CURRENT_STATUS !== 6 &&
                  selectedDetails?.ISSERVICEREQ !== false && (
                    <Buttons
                      disabled={IsSubmit}
                      type="submit"
                      className="Primary_Button  w-20 me-2"
                      label={"Submit"}
                    />
                  )}

                {decryptData(
                  localStorage.getItem(LOCALSTORAGE?.ROLETYPECODE)
                ) !== "T" &&
                  (decryptData(
                    localStorage.getItem(LOCALSTORAGE?.ROLETYPECODE)
                  ) === "S" ||
                    decryptData(
                      localStorage.getItem(LOCALSTORAGE?.ROLETYPECODE)
                    ) === "SA") &&
                  CURRENT_STATUS !== 6 &&
                  selectedDetails?.ISSERVICEREQ === true &&
                  transactionStatus !== undefined &&
                  editStatus &&
                  !PriorityEditStatus &&
                  technicianList?.length > 0 &&
                  !iseditDetails && (
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
                      IsSubmit={IsSubmit}
                      setIsSubmit={setIsSubmit}
                    />
                  )}
                {search === "?edit=" &&
                  editStatus &&
                  !PriorityEditStatus &&
                  CURRENT_STATUS !== 6 &&
                  selectedDetails?.WO_ASSIGN === "A" &&
                  !assignStatus &&
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
                  selectedDetails?.ISSERVICEREQ === true &&
                  editStatus &&
                  !assignStatus &&
                  !PriorityEditStatus &&
                  decryptData(localStorage.getItem(LOCALSTORAGE?.ISASSIGN)) ===
                    true &&
                  !iseditDetails &&
                  isPreCondition &&
                  technicianList?.length === 0 && (
                    <Buttons
                      className="Primary_Button me-2"
                      type="button"
                      label={"Cancel - Pre Conditional"}
                      // name="CONVERT"

                      onClick={() => setIsPreConditionStatus(true)}
                    />
                  )}
                {search === "?edit=" &&
                  CURRENT_STATUS !== 6 &&
                  selectedDetails?.WO_ASSIGN === "M" &&
                  selectedDetails?.ISSERVICEREQ === true &&
                  editStatus &&
                  !assignStatus &&
                  !PriorityEditStatus &&
                  decryptData(localStorage.getItem(LOCALSTORAGE?.ISASSIGN)) ===
                    true &&
                  !iseditDetails &&
                  // (decryptData(
                  //   localStorage.getItem(LOCALSTORAGE?.ROLETYPECODE)
                  // ) === "S" ||
                  //   decryptData(
                  //     localStorage.getItem(LOCALSTORAGE?.ROLETYPECODE)
                  //   ) === "SA") &&
                  !iseditDetails && (
                    <Buttons
                      className="Primary_Button me-2"
                      type="submit"
                      label={"Generate Work Order"}
                      name="CONVERT"
                      disabled={IsGenerateWorkOrder}
                    />
                  )}

                {search === "?edit=" &&
                  CURRENT_STATUS === 7 &&
                  selectedDetails?.IS_ACCEPTED === false &&
                  decryptData(
                    localStorage.getItem(LOCALSTORAGE?.REOPEN_ADD)
                  ) === true && (
                    <>
                      {selectedDetails?.WO_TYPE === "CM" && (
                        <ReopenDialogBox
                          header={"Re-open"}
                          control={control}
                          setValue={setValue}
                          register={register}
                          watch={watch}
                          REMARK={"REMARK"}
                          errors={errors}
                          reopentype="2"
                          getList={props?.getAPI}
                          formType={"Service Request"}
                          getAPI={props?.getAPI}
                          functionCode={"HD004"}
                        />
                      )}

                      {selectedDetails?.WO_TYPE === "CM" && (
                        <WorkCompletion
                          header={"Accept Work Completion"}
                          control={control}
                          setValue={setValue}
                          register={register}
                          watch={watch}
                          errors={errors}
                          getOptions={getOptions}
                        />
                      )}
                    </>
                  )}
                {iseditDetails && !assignStatus && (
                  <Buttons
                    label={"Cancel"}
                    className=" Secondary_Button  me-2"
                    type="button"
                    onClick={onClickEditButton}
                  />
                )}
                <Buttons
                  label={"List"}
                  className=" Secondary_Button  me-2"
                  type="button"
                  name="LIST"
                  onClick={GetOpenList}
                />
              </div>
            </div>
          </Card>
          {search === "?add=" || iseditDetails ? (
            <div className="h-24"></div>
          ) : (
            <div className="h-28"></div>
          )}
          <div className=" mt-3 grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-3">
            <div className="col-span-2 woTabview">
              {(search === "?add=" || iseditDetails) && (
                <>
                  <Card>
                    <div className="flex flex-wrap justify-between mb-3">
                      <h6 className="Service_Header_Text">
                        {t("Request Details")}
                      </h6>
                    </div>
                    <div className=" grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2 lg:grid-cols-2">
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
                                      onChange: () => {
                                        let data: any = {};
                                        setValue("GROUP", data);
                                        setValue("TYPE", "");
                                        resetField("GROUP");
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
                                  onChange: (e) => {
                                    let location: any = JSON.stringify(
                                      e?.target?.value
                                    );
                                    setLocationId(e?.target?.value);
                                    localStorage.setItem(
                                      "LOCATIONNAME",
                                      location
                                    );
                                  },
                                })}
                                label="Location"
                                require={true}
                                optionLabel={
                                  field?.value?.LOCATION_DESCRIPTION !== null
                                    ? "LOCATION_DESCRIPTION"
                                    : "LOCATION_NAME"
                                }
                                filter={true}
                                valueTemplate={selectedLocationTemplate}
                                itemTemplate={locationOptionTemplate}
                                findKey={"LOCATION_ID"}
                                setValue={setValue}
                                invalid={errors?.LOCATION_ID}
                                className="locationDropdown w-full"
                                value={locationId}
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
                                  onChange: async (e: any) => {
                                    await getWoOrderList(
                                      e?.target?.value?.ASSETGROUP_ID,
                                      e?.target?.value?.ASSETGROUP_TYPE
                                    );

                                    setValue("WO_REMARKS", "");
                                  },
                                })}
                                label={
                                  ASSET_NONASSET?.key === "A" ||
                                  ASSET_NONASSET === "A"
                                    ? "Equipment Group"
                                    : "Service Group"
                                }
                                require={true}
                                filter={true}
                                optionLabel="ASSETGROUP_NAME"
                                findKey={"ASSETGROUP_ID"}
                                selectedData={selectedDetails?.ASSETGROUP_ID}
                                setValue={setValue}
                                invalid={errors.GROUP}
                                disabled={technicianList?.length > 0}
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
                                {...register("TYPE", {})}
                                label={
                                  ASSET_NONASSET?.key === "A" ||
                                  ASSET_NONASSET === "A"
                                    ? "Equipment Type"
                                    : "Service Type"
                                }
                                optionLabel="ASSETTYPE_NAME"
                                filter={true}
                                findKey={"ASSETTYPE_ID"}
                                selectedData={selectedDetails?.ASSETTYPE_ID}
                                setValue={setValue}
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
                                {...register("ASSET_ID", {})}
                                label={
                                  ASSET_NONASSET?.key === "A" ||
                                  ASSET_NONASSET === "A"
                                    ? "Equipment"
                                    : "Soft Service"
                                }
                                optionLabel="ASSET_NAME"
                                filter={true}
                                findKey={"ASSET_ID"}
                                selectedData={selectedDetails?.ASSET_ID}
                                setValue={setValue}
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
                                {...register("REQ_ID", {
                                  required: "Please fill the required fields",
                                })}
                                label={"Issue"}
                                optionLabel="REQ_DESC"
                                findKey={"REQ_ID"}
                                require={true}
                                filter={true}
                                setValue={setValue}
                                invalid={errors?.REQ_ID}
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
                                filter={true}
                                selectedData={selectedDetails?.SEVERITY_CODE}
                                setValue={setValue}
                                invalid={errors?.SEVERITY_CODE}
                                {...field}
                              />
                            );
                          },
                        }}
                      />

                      <div className="col-span-2">
                        <label className="Text_Secondary Input_Label">
                          {t("Description (max 400 characters)")}
                        </label>

                        <Field
                          controller={{
                            name: "WO_REMARKS",
                            control: control,
                            render: ({ field }: any) => {
                              return (
                                <InputTextarea
                                  {...register("WO_REMARKS", {
                                    onChange: (e: any) => {
                                      handleInputChange(e);
                                    },
                                  })}
                                  rows={5}
                                  maxLength={400}
                                  invalid={errors?.WO_REMARKS}
                                  setValue={setValue}
                                  {...field}
                                />
                              );
                            },
                          }}
                        />
                        <label
                          className={` ${
                            Descriptionlength === 400
                              ? "text-red-600"
                              : "Text_Secondary"
                          } Helper_Text`}
                        >
                          {t(`${Descriptionlength}/400 characters`)}
                        </label>
                      </div>

                      <div className={"col-span-2"}>
                        {isloading ? (
                          <LoaderShow />
                        ) : (
                          <WoDocumentUpload
                            register={register}
                            control={control}
                            setValue={setValue}
                            watch={watch}
                            getValues={getValues}
                            errors={errors}
                            uploadtype="W"
                            uploadLabel="Upload Supporting files"
                            setIsSubmit={setIsSubmit}
                            uploadError={uploadError}
                            uploadSupportMandatory={uploadSupportMandatory}
                          />
                        )}
                      </div>
                    </div>
                  </Card>
                  <Card className="mt-4">
                    <div className="flex flex-wrap justify-between mb-3">
                      <h6 className="Service_Header_Text">
                        {t("Reporter Details")}
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
                                {...register("REPORTER_NAME", {})}
                                label="Reporter Name"
                                disabled={true}
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
                                {...register("REPORTER_EMAIL", {})}
                                label="Reporter Email"
                                disabled={true}
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
                                {...register("REPORTER_MOBILE", {})}
                                label="Reporter Mobile Number"
                                disabled={true}
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
              {search === "?edit=" && !iseditDetails && (
                <div className="serviceTabview">
                  <TabView
                    activeIndex={activeIndex}
                    onTabChange={(e) => setActiveIndex(e.index)}
                  >
                    <TabPanel header="Details">
                      <Card className="mt-3">
                        <div className="flex flex-wrap justify-between mb-3">
                          <h6 className="Service_Header_Text">
                            {t("Service Request Details")}
                          </h6>
                          {selectedDetails?.ISSERVICEREQ &&
                            selectedDetails?.ISEDITSRQ === 1 &&
                            currentMenu?.UPDATE_RIGHTS === "True" &&
                            selectedDetails?.CURRENT_STATUS !== 6 && (
                              <Buttons
                                className="Secondary_Button w-20 me-2"
                                label={
                                  iseditDetails ? "Cancel" : "Edit Details"
                                }
                                icon="pi pi-pencil"
                                onClick={() => {
                                  onClickEditButton();
                                }}
                              />
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-3 lg:grid-cols-3">
                          <div className=" flex flex-col gap-4">
                            <div className="">
                              <div className="flex flex-wrap ">
                                <label className="Text_Secondary Helper_Text">
                                  {t("Priority")}
                                  {PriorityEditStatus && (
                                    <>
                                      <span className="text-red-600"> *</span>
                                    </>
                                  )}
                                </label>
                              </div>

                              {!PriorityEditStatus && (
                                <>
                                  <div className="flex flex-wrap">
                                    <p className="Text_Primary Service_Alert_Title  ">
                                      {selectedDetails?.SEVERITY_DESC}
                                    </p>
                                  </div>
                                </>
                              )}

                              {PriorityEditStatus && (
                                <p className="Text_Primary Service_Alert_Title  ">
                                  <Field
                                    controller={{
                                      name: "SEVERITY_CODE",
                                      control: control,
                                      render: ({ field }: any) => {
                                        return (
                                          <Select
                                            options={severity ?? []}
                                            {...register("SEVERITY_CODE", {
                                              required:
                                                "Please fill the required fields",
                                            })}
                                            optionLabel="SEVERITY"
                                            findKey={"SEVERITY_ID"}
                                            filter={true}
                                            selectedData={
                                              selectedDetails?.SEVERITY_CODE
                                            }
                                            setValue={setValue}
                                            invalid={errors?.SEVERITY_CODE}
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
                            <div className="">
                              <label className="Text_Secondary Helper_Text">
                                Type
                              </label>

                              {selectedDetails?.ASSET_NONASSET === "A" ? (
                                <>
                                  <p className="Text_Primary Service_Alert_Title  ">
                                    Equipment{" "}
                                  </p>
                                </>
                              ) : (
                                <>
                                  <p className="Text_Primary Service_Alert_Title  ">
                                    Soft Services
                                  </p>
                                </>
                              )}
                            </div>
                            <div className="">
                              <label className="Text_Secondary Helper_Text">
                                Reporter
                              </label>
                              {selectedDetails?.USER_NAME === null ||
                              selectedDetails?.USER_NAME === "" ? (
                                <>
                                  <p className="Text_Main Service_Alert_Title  ">
                                    NA
                                  </p>
                                </>
                              ) : (
                                <>
                                  <p className="Text_Main Service_Alert_Title  ">
                                    {selectedDetails?.USER_NAME}
                                  </p>
                                </>
                              )}
                            </div>
                            <div className="">
                              <label className="Text_Secondary Helper_Text">
                                Reported Date & Time
                              </label>
                              {selectedDetails?.REPORTED_AT === null ||
                              selectedDetails?.REPORTED_AT === "" ? (
                                <>
                                  <p className="Text_Primary Service_Alert_Title  ">
                                    NA
                                  </p>
                                </>
                              ) : (
                                <>
                                  <p className="Text_Primary Service_Alert_Title ">
                                    {selectedDetails?.REPORTED_AT
                                      ? formateDate(
                                          selectedDetails?.REPORTED_AT
                                        )
                                      : "NA"}
                                  </p>
                                </>
                              )}
                            </div>
                            {selectedDetails?.ISSERVICEREQ === false && (
                              <div className=" flex flex-col gap-1">
                                <label className="Text_Secondary Helper_Text">
                                  Work Order ID
                                </label>
                                {selectedDetails?.WO_NO === null ||
                                selectedDetails?.WO_NO === "" ? (
                                  <>
                                    <p className="Text_Primary Alert_Title  ">
                                      NA
                                    </p>
                                  </>
                                ) : (
                                  <>
                                    {currentWorkOrderRights?.VIEW_RIGHTS ===
                                    "True" ? (
                                      <p className="Menu_Active Alert_Title  ">
                                        <a
                                          href={`${window?.location?.origin}${process.env.REACT_APP_CUSTOM_VARIABLE}/workorderlist?edit=`}
                                          target="_blank"
                                          onClick={() => {
                                            localStorage.setItem(
                                              "WO_ID",
                                              JSON.stringify(
                                                selectedDetails?.WO_ID
                                              )
                                            );
                                          }}
                                        >
                                          {selectedDetails?.WO_NO}
                                        </a>
                                      </p>
                                    ) : (
                                      <p className="Menu_Active Alert_Title  ">
                                        {selectedDetails?.WO_NO}
                                      </p>
                                    )}
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="col-span-2">
                            <div className=" flex flex-col gap-4">
                              <div className="">
                                <label className="Text_Secondary Helper_Text">
                                  Location
                                </label>
                                {selectedDetails?.LOCATION_NAME === null ||
                                selectedDetails?.LOCATION_NAME === "" ? (
                                  <>
                                    <p className="Text_Primary Service_Alert_Title  ">
                                      NA
                                    </p>
                                  </>
                                ) : (
                                  <>
                                    <p className="Text_Primary Service_Alert_Title  ">
                                      {selectedDetails?.LOCATION_DESCRIPTION}
                                    </p>
                                  </>
                                )}
                              </div>
                              <div className="">
                                <label className="Text_Secondary Helper_Text">
                                  Description
                                </label>
                                {selectedDetails?.WO_REMARKS === null ||
                                selectedDetails?.WO_REMARKS === "" ? (
                                  <>
                                    <p className="Text_Primary Service_Alert_Title  ">
                                      NA
                                    </p>
                                  </>
                                ) : (
                                  <>
                                    <p className="Text_Primary Service_Alert_Title  ">
                                      {selectedDetails?.WO_REMARKS}
                                    </p>
                                  </>
                                )}
                              </div>
                              <div className="">
                                <label className="Text_Secondary Helper_Text">
                                  {/* {isloading.toString()}{' '} */}
                                  Supporting Files({" "}
                                  {
                                    docOption?.filter(
                                      (e: any) => e?.UPLOAD_TYPE === "W"
                                    )?.length
                                  }
                                  )
                                </label>

                                {isloading === true ? (
                                  <div className="imageContainer  flex justify-center items-center z-400">
                                    <>
                                      <LoaderFileUpload IsScannig={false} />
                                    </>
                                  </div>
                                ) : docOption?.filter(
                                    (e: any) => e?.UPLOAD_TYPE === "W"
                                  )?.length > 0 ? (
                                  <>
                                    <ImageGalleryComponent
                                      uploadType="W"
                                      docOption={docOption}
                                      Title={"Service Request"}
                                    />
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
                            <h6 className="Service_Header_Text">
                              Equipment Summary
                            </h6>
                            {CURRENT_STATUS !== 7 &&
                              selectedDetails?.ASSETGROUP_ID !== null &&
                              selectedDetails?.ASSETTYPE_ID !== null &&
                              selectedDetails?.ASSETTYPE_ID1 !== null && (
                                <Buttons
                                  className="Border_Button Secondary_Button "
                                  disabled={showdetails}
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
                                  <p className="Text_Primary Service_Alert_Title  ">
                                    NA
                                  </p>
                                </>
                              ) : (
                                <>
                                  <p className="Text_Primary Service_Alert_Title  ">
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
                                  <p className="Text_Primary Service_Alert_Title  ">
                                    NA
                                  </p>
                                </>
                              ) : (
                                <>
                                  {selectedDetails?.OWN_LEASE === "O" ? (
                                    <>
                                      <p className="Text_Primary Service_Alert_Title  ">
                                        Owned
                                      </p>
                                    </>
                                  ) : (
                                    <>
                                      <p className="Text_Primary Service_Alert_Title  ">
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
                                  <p className="Text_Primary Service_Alert_Title  ">
                                    NA
                                  </p>
                                </>
                              ) : (
                                <>
                                  <p className="Text_Primary Service_Alert_Title  ">
                                    {onlyDateFormat(
                                      selectedDetails?.LAST_MAINTANCE_DATE
                                    )}
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
                                  <p className="Text_Primary Service_Alert_Title  ">
                                    NA
                                  </p>
                                </>
                              ) : (
                                <>
                                  <p className="Text_Primary Service_Alert_Title  ">
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
                                  <p className="Text_Primary Service_Alert_Title  ">
                                    NA
                                  </p>
                                </>
                              ) : (
                                <>
                                  <p className="Text_Primary Service_Alert_Title  ">
                                    {" "}
                                    {onlyDateFormat(
                                      selectedDetails?.WARRANTY_END_DATE
                                    )}
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
                                  <p className="Text_Primary Service_Alert_Title  ">
                                    NA
                                  </p>
                                </>
                              ) : (
                                <>
                                  <p className="Text_Primary Service_Alert_Title  ">
                                    {onlyDateFormat(
                                      selectedDetails?.UPCOMING_SCHEDULE_DATE
                                    )}
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
                                  <p className="Text_Primary Service_Alert_Title  ">
                                    NA
                                  </p>
                                </>
                              ) : (
                                <>
                                  <p className="Text_Primary Service_Alert_Title  ">
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
                                  <p className="Text_Primary Service_Alert_Title  ">
                                    NA
                                  </p>
                                </>
                              ) : (
                                <>
                                  <p className="Text_Primary Service_Alert_Title  ">
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
                            <h6 className="Service_Header_Text">
                              Soft Service Summary
                            </h6>
                            {selectedDetails?.ASSET_NAME === null ||
                            selectedDetails?.ASSET_NAME === "" ? (
                              <></>
                            ) : (
                              <>
                                <Buttons
                                  className="Border_Button Secondary_Button "
                                  disabled={showdetails}
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
                                  <p className="Text_Primary Service_Alert_Title  ">
                                    NA
                                  </p>
                                </>
                              ) : (
                                <>
                                  <p className="Text_Primary Service_Alert_Title  ">
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
                                  <p className="Text_Primary Service_Alert_Title  ">
                                    NA
                                  </p>
                                </>
                              ) : (
                                <>
                                  <p className="Text_Primary Service_Alert_Title  ">
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
                                  <p className="Text_Primary Service_Alert_Title  ">
                                    NA
                                  </p>
                                </>
                              ) : (
                                <>
                                  <p className="Text_Primary Service_Alert_Title  ">
                                    {selectedDetails?.ASSET_NAME}
                                  </p>
                                </>
                              )}
                            </div>
                          </div>
                        </Card>
                      )}
                      {CURRENT_STATUS === 4 ||
                      CURRENT_STATUS === 7 ||
                      selectedDetails?.IS_REOPEN === true ? (
                        <Card className="mt-2">
                          <div className="flex flex-wrap justify-between">
                            <h6 className="Service_Header_Text">
                              Rectified Details
                            </h6>
                          </div>

                          <div className="mt-2 grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-3 lg:grid-cols-3">
                            <div className="">
                              {selectedDetails?.RECTIFIED_AT !== null && (
                                <div>
                                  <label className="Text_Secondary Helper_Text  ">
                                    Rectified by
                                  </label>
                                  <p className="Text_Primary Service_Alert_Title  ">
                                    {selectedDetails?.RECTIFIED_BY_NAME}
                                  </p>
                                </div>
                              )}
                              {selectedDetails?.RECTIFIED_AT !== null && (
                                <div>
                                  <div>
                                    <label className="Text_Secondary Helper_Text  ">
                                      Rectified Date & Time
                                    </label>
                                  </div>
                                  <p className="Text_Primary Service_Alert_Title  ">
                                    {formateDate(selectedDetails?.RECTIFIED_AT)}
                                  </p>
                                </div>
                              )}
                            </div>
                            <div className="col-span-2">
                              <div className="">
                                {selectedDetails?.RECTIFIED_AT !== null && (
                                  <div>
                                    <label className="Text_Secondary Helper_Text  ">
                                      Rectification Comment
                                    </label>
                                    {selectedDetails?.RECTIFIED_REMARKS ===
                                      null ||
                                    selectedDetails?.RECTIFIED_REMARKS ===
                                      "" ? (
                                      <>
                                        <p className="Text_Primary Service_Alert_Title  ">
                                          NA
                                        </p>
                                      </>
                                    ) : (
                                      <>
                                        <p className="Text_Primary Service_Alert_Title  ">
                                          {selectedDetails?.RECTIFIED_REMARKS}
                                        </p>
                                      </>
                                    )}
                                  </div>
                                )}
                                <div>
                                  <div>
                                    <label className="Text_Secondary Helper_Text  ">
                                      Before Files(
                                      {
                                        docOption?.filter(
                                          (e: any) => e?.UPLOAD_TYPE === "B"
                                        )?.length
                                      }
                                      )
                                    </label>
                                    {isloading === true ? (
                                      <div className="imageContainer  flex justify-center items-center z-400">
                                        <>
                                          <LoaderFileUpload IsScannig={false} />
                                        </>
                                      </div>
                                    ) : docOption?.filter(
                                        (e: any) => e?.UPLOAD_TYPE === "B"
                                      )?.length > 0 ? (
                                      <>
                                        <ImageGalleryComponent
                                          uploadType="B"
                                          docOption={docOption}
                                          Title={"Before"}
                                        />
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
                                                <span className="Text_Primary Service_Alert_Title">
                                                  {t("No items to show")}{" "}
                                                </span>
                                              </p>
                                            </div>
                                          </label>
                                        </div>
                                      </>
                                    )}

                                    <Dialog
                                      visible={visibleImage}
                                      style={{ width: "50vw" }}
                                      onHide={() => {
                                        setVisibleImage(false);
                                      }}
                                    >
                                      <img
                                        src={showImage}
                                        alt=""
                                        className="w-full bg-cover"
                                      />
                                    </Dialog>
                                  </div>
                                  <div>
                                    <label className="Text_Secondary Helper_Text  ">
                                      After Files(
                                      {
                                        docOption?.filter(
                                          (e: any) => e.UPLOAD_TYPE === "A"
                                        )?.length
                                      }
                                      )
                                    </label>
                                    {isloading === true ? (
                                      <div className="imageContainer  flex justify-center items-center z-400">
                                        <>
                                          <LoaderFileUpload IsScannig={false} />
                                        </>
                                      </div>
                                    ) : docOption?.filter(
                                        (e: any) => e.UPLOAD_TYPE === "A"
                                      )?.length > 0 ? (
                                      <>
                                        <ImageGalleryComponent
                                          uploadType="A"
                                          docOption={docOption}
                                          Title={"After"}
                                        />
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
                                                <span className="Text_Primary Service_Alert_Title">
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
                          </div>
                        </Card>
                      ) : (
                        <></>
                      )}
                      {CURRENT_STATUS === 7 &&
                      selectedDetails?.IS_REOPEN === true ? (
                        <Card className="mt-2">
                          <div className="flex flex-wrap justify-between">
                            <h6 className="Service_Header_Text">
                              Completion Details
                            </h6>
                          </div>

                          <div className="mt-2 grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-3 lg:grid-cols-3">
                            <div className="">
                              {selectedDetails?.COMPLETED_AT !== null && (
                                <div>
                                  <label className="Text_Secondary Helper_Text  ">
                                    Verified by
                                  </label>
                                  {selectedDetails?.VERIFY_BY === null ||
                                  selectedDetails?.VERIFY_BY === "" ? (
                                    <>
                                      <p className="Text_Primary Service_Alert_Title  ">
                                        NA
                                      </p>
                                    </>
                                  ) : (
                                    <>
                                      <p className="Menu_Active Service_Alert_Title  ">
                                        {selectedDetails?.VERIFY_BY}
                                      </p>
                                    </>
                                  )}
                                </div>
                              )}

                              {selectedDetails?.COMPLETED_AT !== null && (
                                <div>
                                  <label className="Text_Secondary Helper_Text  ">
                                    Completed by
                                  </label>
                                  {selectedDetails?.COMPLETED_BY_NAME ===
                                    null ||
                                  selectedDetails?.COMPLETED_BY_NAME === "" ? (
                                    <>
                                      <p className="Text_Primary Service_Alert_Title  ">
                                        NA
                                      </p>
                                    </>
                                  ) : (
                                    <>
                                      <p className="Menu_Active Service_Alert_Title  ">
                                        {selectedDetails?.COMPLETED_BY_NAME}
                                      </p>
                                    </>
                                  )}
                                </div>
                              )}
                              {selectedDetails?.COMPLETED_AT !== null && (
                                <div>
                                  <div>
                                    <label className="Text_Secondary Helper_Text  ">
                                      Verified Date & Time
                                    </label>
                                  </div>
                                  <p className="Text_Primary Service_Alert_Title  ">
                                    {formateDate(selectedDetails?.COMPLETED_AT)}
                                  </p>
                                </div>
                              )}
                            </div>
                            <div className="col-span-2">
                              <div className="">
                                {selectedDetails?.COMPLETED_AT !== null && (
                                  <div>
                                    <label className="Text_Secondary Helper_Text  ">
                                      Completed Remarks
                                    </label>
                                    {selectedDetails?.COMPLETED_REMARKS ===
                                      null ||
                                    selectedDetails?.COMPLETED_REMARKS ===
                                      "" ? (
                                      <>
                                        <p className="Text_Primary Service_Alert_Title  ">
                                          NA
                                        </p>
                                      </>
                                    ) : (
                                      <>
                                        <p className="Text_Primary Service_Alert_Title  ">
                                          {selectedDetails?.COMPLETED_REMARKS}
                                        </p>
                                      </>
                                    )}
                                  </div>
                                )}
                                {selectedDetails?.COMPLETED_AT !== null && (
                                  <div>
                                    <label className="Text_Secondary Helper_Text  ">
                                      Signature
                                    </label>
                                    <div
                                      className="justify-center flex w-full h-[100px] p-4 border-2
                border-gray-200 border rounded-lg "
                                    >
                                      {isloading === true ? (
                                        <div className="imageContainer  flex justify-center items-center z-400">
                                          <>
                                            <LoaderFileUpload
                                              IsScannig={false}
                                            />
                                          </>
                                        </div>
                                      ) : (
                                        signatureDoc?.map((imgSource: any) => {
                                          let source: any =
                                            "data:image/png;base64," +
                                            imgSource?.DOC_DATA;
                                          return (
                                            <img
                                              src={source}
                                              className="w-[102px] h-[65px] bg-contain "
                                            />
                                          );
                                        })
                                      )}
                                    </div>
                                  </div>
                                )}
                                <div></div>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ) : (
                        <></>
                      )}
                      {selectedDetails?.IS_ACCEPTED ? (
                        <Card className="mt-2">
                          <div className="flex flex-wrap justify-between">
                            <h6 className="Service_Header_Text">
                              Acceptance Details
                            </h6>
                          </div>
                          <div className="mt-2 grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-2 lg:grid-cols-2">
                            <div className=" flex justify-between">
                              {selectedDetails?.ACCEPTED_BY !== null && (
                                <div>
                                  <label className="Text_Secondary Helper_Text  ">
                                    Accepted by
                                  </label>
                                  {selectedDetails?.ACCEPTED_BY === null ||
                                  selectedDetails?.ACCEPTED_BY === "" ? (
                                    <>
                                      <p className="Text_Primary Service_Alert_Title  ">
                                        NA
                                      </p>
                                    </>
                                  ) : (
                                    <>
                                      <p className="Menu_Active Service_Alert_Title  ">
                                        {selectedDetails?.ACCEPTED_BY}
                                      </p>
                                    </>
                                  )}
                                </div>
                              )}
                              {selectedDetails?.ACCEPTED_ON !== null && (
                                <div>
                                  <div>
                                    <label className="Text_Secondary Helper_Text  ">
                                      Accepted Date & Time
                                    </label>
                                  </div>
                                  <p className="Text_Primary Service_Alert_Title ">
                                    {/* {moment(selectedDetails?.ACCEPTED_ON).format(`${dateFormat()} HH:mm A`)} */}
                                    {formateDate(selectedDetails?.ACCEPTED_ON)}
                                    {/* {new Date(selectedDetails?.ACCEPTED_ON).toLocaleString().replaceAll("/", "-")} */}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </Card>
                      ) : (
                        <></>
                      )}
                      <Card className="mt-4">
                        <div className="flex flex-wrap justify-between mb-3">
                          <h6 className="Service_Header_Text">
                            {t("Reporter Details")}
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
                                <p className="Text_Primary Service_Alert_Title  ">
                                  NA
                                </p>
                              </>
                            ) : (
                              <>
                                <p className="Text_Primary Service_Alert_Title  ">
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
                                <p className="Text_Primary Service_Alert_Title  ">
                                  NA
                                </p>
                              </>
                            ) : (
                              <>
                                <p className="Text_Primary Service_Alert_Title  ">
                                  {selectedDetails?.CONTACT_EMAIL}
                                </p>
                              </>
                            )}
                          </div>
                          <div>
                            <label className="Text_Secondary Helper_Text">
                              Reporter Mobile Number
                            </label>
                            {selectedDetails?.CONTACT_PHONE === null ||
                            selectedDetails?.CONTACT_PHONE === "" ? (
                              <>
                                <p className="Text_Primary Service_Alert_Title  ">
                                  NA
                                </p>
                              </>
                            ) : (
                              <>
                                <p className="Text_Primary Service_Alert_Title  ">
                                  {selectedDetails?.CONTACT_PHONE}
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                      </Card>
                    </TabPanel>

                    <TabPanel header="Activity Timeline">
                      {ActivityTimeLineList?.length === 0 ? (
                        <Card className="mt-2">
                          <h6 className="Service_Header_Text">
                            Activity Timeline
                          </h6>
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
                          <Card className="mt-2">
                            <h6 className="Service_Header_Text mb-3">
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
              {(search === "?edit=" &&
                !assignStatus &&
                decryptData(
                  localStorage.getItem(LOCALSTORAGE?.ROLETYPECODE)
                ) !== "T" &&
                selectedDetails?.CURRENT_STATUS === 1 &&
                selectedDetails?.ISSERVICEREQ === true &&
                // decryptData(
                //   localStorage.getItem(LOCALSTORAGE?.ROLETYPECODE)
                // ) === "S" &&
                decryptData(localStorage.getItem(LOCALSTORAGE?.ISASSIGN)) ===
                  true &&
                technicianList?.length === 0) ||
              (search === "?add=" &&
                !assignStatus &&
                decryptData(localStorage.getItem(LOCALSTORAGE?.ISASSIGN)) ===
                  true &&
                decryptData(
                  localStorage.getItem(LOCALSTORAGE?.ROLETYPECODE)
                ) === "S" &&
                technicianList?.length === 0 &&
                technicianStatus === "A") ||
              (search === "?add=" &&
                !assignStatus &&
                decryptData(localStorage.getItem(LOCALSTORAGE?.ISASSIGN)) ===
                  true &&
                technicianList?.length === 0 &&
                technicianStatus === "M") ||
              (search === "?edit=" &&
                !assignStatus &&
                decryptData(localStorage.getItem(LOCALSTORAGE?.ISASSIGN)) ===
                  true &&
                selectedDetails?.CURRENT_STATUS === 1 &&
                selectedDetails?.ISSERVICEREQ === true &&
                // decryptData(
                //   localStorage.getItem(LOCALSTORAGE?.ROLETYPECODE)
                // ) === "SA" &&
                technicianList?.length === 0 &&
                technicianStatus === "M") ||
              (search === "?add=" &&
                !assignStatus &&
                decryptData(localStorage.getItem(LOCALSTORAGE?.ISASSIGN)) ===
                  true &&
                decryptData(
                  localStorage.getItem(LOCALSTORAGE?.ROLETYPECODE)
                ) === "SA" &&
                technicianList?.length === 0 &&
                technicianStatus === "A") ||
              (search === "?add=" &&
                !assignStatus &&
                decryptData(localStorage.getItem(LOCALSTORAGE?.ISASSIGN)) ===
                  false &&
                decryptData(
                  localStorage.getItem(LOCALSTORAGE?.ROLETYPECODE)
                ) === "T" &&
                technicianList?.length === 0 &&
                technicianStatus === "A") ? (
                <>
                  <Card className="">
                    <h6 className="Service_Header_Text">
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
                          {technicianStatus === "M" &&
                          decryptData(
                            localStorage.getItem(LOCALSTORAGE?.ROLETYPECODE)
                          ) !== "T" &&
                          decryptData(
                            localStorage.getItem(LOCALSTORAGE?.ISASSIGN)
                          ) === true ? (
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
              ) : (
                ((search === "?add=" &&
                  !assignStatus &&
                  technicianStatus === "M") ||
                  (search === "?edit=" &&
                    technicianList?.length === 0 &&
                    !assignStatus &&
                    technicianStatus === "M")) && (
                  <>
                    {selectedDetails?.CURRENT_STATUS === 6 ? (
                      <></>
                    ) : (
                      <Card className="">
                        <h6 className="Service_Header_Text">
                          Assignee will be Assigned by supervisor
                        </h6>
                      </Card>
                    )}
                  </>
                )
              )}

              {(((search === "?add=" || search === "?edit=") &&
                assignStatus &&
                technicianStatus === "M" &&
                IsAssignAdd) ||
                (search === "?edit=" &&
                  assignStatus &&
                  technicianStatus === "M" &&
                  technicianList?.length !== 0 &&
                  IsAssignAdd)) && (
                <Card className="">
                  <h6 className="Service_Header_Text">{t("Assign To")}</h6>
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
                                onChange: (e: any) => GetAddAssignee(e),
                                required:
                                  technicianStatus === "M" &&
                                  decryptData(
                                    localStorage.getItem(
                                      LOCALSTORAGE?.ROLETYPECODE
                                    )
                                  ) !== "T" &&
                                  decryptData(
                                    localStorage.getItem(LOCALSTORAGE?.ISASSIGN)
                                  ) === true
                                    ? "Please fill the required fields"
                                    : "",
                              })}
                              label={"Team"}
                              optionLabel="TEAM_NAME"
                              findKey={"TEAM_ID"}
                              require={
                                technicianStatus === "M" &&
                                decryptData(
                                  localStorage.getItem(
                                    LOCALSTORAGE?.ROLETYPECODE
                                  )
                                ) !== "T" &&
                                decryptData(
                                  localStorage.getItem(LOCALSTORAGE?.ISASSIGN)
                                ) === true
                                  ? true
                                  : false
                              }
                              setValue={setValue}
                              invalid={
                                technicianStatus === "M" &&
                                decryptData(
                                  localStorage.getItem(
                                    LOCALSTORAGE?.ROLETYPECODE
                                  )
                                ) !== "T" &&
                                decryptData(
                                  localStorage.getItem(LOCALSTORAGE?.ISASSIGN)
                                ) === true
                                  ? errors.ASSIGN_TEAM_ID
                                  : ""
                              }
                              selectedData={selectedDetails?.TEAM_ID}
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
                                required: "Please fill the required fields",
                              })}
                              label="Assignee"
                              optionLabel="USER_NAME"
                              require={
                                technicianStatus === "M" &&
                                decryptData(
                                  localStorage.getItem(
                                    LOCALSTORAGE?.ROLETYPECODE
                                  )
                                ) !== "T" &&
                                decryptData(
                                  localStorage.getItem(LOCALSTORAGE?.ISASSIGN)
                                ) === true
                                  ? true
                                  : false
                              }
                              invalid={
                                technicianStatus === "M" &&
                                decryptData(
                                  localStorage.getItem(
                                    LOCALSTORAGE?.ROLETYPECODE
                                  )
                                ) !== "T" &&
                                decryptData(
                                  localStorage.getItem(LOCALSTORAGE?.ISASSIGN)
                                ) === true
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
                      resetFilterOnHide={true}
                    />
                    <div className="flex flex-wrap gap-1">
                      {watchAll.TECH_ID?.map((tech: any) => {
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
                        className="Text_Main Service_Alert_Title"
                        onClick={() => handleClearAll()}
                      >
                        {t("Clear All Selection")}
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* )} */}

              {!iseditDetails &&
                ((technicianStatus === "A" && technicianList?.length > 0) ||
                  (technicianStatus === "M" && technicianList?.length > 0)) && (
                  <Card className="">
                    <h6 className="Service_Header_Text">
                      {t("Assignees")} ({technicianList?.length})
                    </h6>
                    <div className="ScrollViewAssigneeTab">
                      {technicianList?.map((tech: any, index: any) => {
                        const nameParts = tech?.USER_NAME?.split(" ");
                        const initials =
                          nameParts?.length > 1
                            ? `${nameParts[0]?.charAt(0)}${nameParts[1]?.charAt(
                                0
                              )}`
                            : `${nameParts[0]?.charAt(0)}`;
                        return (
                          <div className="flex justify-start mt-2" key={index}>
                            <div className="w-10 h-10 flex items-center justify-center bg-[#F7ECFA] rounded-full text-[#272B30] font-bold">
                              {initials?.toUpperCase()}
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
        <Dialog
          // blockScroll={true}
          header={"Cancel - Pre Conditional"}
          visible={isPreConditionStatus}
          style={{ width: "30vw" }}
          onHide={() => {
            setIsPreConditionStatus(false);
            setValue("REMARKS", "");
            setReamrkLength(0);
          }}
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            <label className="Text_Secondary Input_Label ">
              Remarks (max 250 characters)
              <span className="text-red-600"> *</span>
            </label>
            <div className={` ${cancelError ? "border-red-600" : ""}`}>
              <Field
                controller={{
                  name: "REMARKS",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <InputTextarea
                        {...register("REMARKS", {
                          required:
                            isPreCondition === true
                              ? "Please fill the required field."
                              : false,
                          onChange: (e: any) => {
                            setReamrkLength(e?.target?.value?.length);
                            setCancelError(false);
                            setError(false);
                          },
                        })}
                        rows={4}
                        Label={"Remarks"}
                        require={true}
                        maxlength={250}
                        placeholder={
                          isPreCondition
                            ? `Provide additional details`
                            : "Provide additional details(optional)"
                        }
                        setValue={setValue}
                        // invalid={errors?.CancelRemark}
                        {...field}
                      />
                    );
                  },
                }}
              />
              <label
                className={` ${
                  Remarklength === 250 ? "text-red-600" : "Text_Secondary"
                } Helper_Text`}
              >
                {t(`${Remarklength}/250 characters.`)}
              </label>
            </div>
            <div className="flex justify-end mt-5">
              <Buttons
                name="PRECANCEL"
                className="Primary_Button me-2"
                type="submit"
                label={"Submit"}
              />
              <Button
                className="Cancel_Button  me-2"
                type="button"
                label={"Cancel"}
                onClick={() => {
                  // setVisible(false);
                  setIsPreConditionStatus(false);
                  setValue("REMARKS", "");
                  setReamrkLength(0);
                }}
              />
            </div>
          </form>
        </Dialog>
      </section>
    </>
  );
};

export default ServiceRequestDetailForm;
