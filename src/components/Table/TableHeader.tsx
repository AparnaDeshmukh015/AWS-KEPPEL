import React, { memo, useState } from "react";
import Buttons from "../Button/Button";
import InputField from "../Input/Input";
import SplitButtons from "../SplitButton/SplitButton";
import { useLocation, useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { callPostAPI } from "../../services/apis";
import { ENDPOINTS } from "../../utils/APIEndpoints";
import { toast } from "react-toastify";
import { Dialog } from "primereact/dialog";
import {
  TemplateDownload,
  readUploadFile,
  upploadexceljson,
} from "../TemplateDownload/TemplateDownload";
import { FileUpload } from "primereact/fileupload";
import { SplitButton } from "primereact/splitbutton";
import * as xlsx from "xlsx";
import FileSaver from "file-saver";
import { appName } from "../../utils/pagePath";
import { PATH } from '../../utils/pagePath';
import { loadavg } from "os";


type TableProps = {
  fucCode: string;
};

const TableHeader = (props: any, { fucCode }: TableProps) => {
  const pagePath: any = [PATH?.SKILLMASTER,
  PATH?.MAKEMASTER,
  PATH?.MODELMASTER, PATH?.ASSETGROUPMASTER,
  PATH.SERVICEGROUPMASTER,
  PATH.ASSETTYPEMASTER,
  PATH.SERVICETYPEMASTER,
  PATH?.UOMMASTER,
  PATH?.ANALYTICSPLATEFORMASSETLINK,
  PATH?.ANANLYTICSFDD,
  PATH?.REASONMASTER,
  PATH?.WORKORDERTYPE,
  PATH?.WORKORDERSTATUS,
  PATH?.CURRENTSTATUSCONFIG,
  PATH?.SERVICEMASTER,
  PATH?.ASSETMASTER,
  PATH?.REQDESCRIPTIONMASTER]

  const location: any = useLocation();
  const { t } = useTranslation();
  const [globalFilterValue, setGlobalFilterValue] = useState<string>("");
  const [globalValue, setglobalValue] = useState<string>("");

  const [fileValue, setFileValue] = useState<string>("");
  const [, menuList]: any = useOutletContext();
  const [visible, setVisible] = useState<boolean>(false);
  const setDialogVisible = (e: any) => {
    setVisible(!visible);
  };
  const currentMenu = menuList
    ?.flatMap((menu: any) => menu?.DETAIL)
    ?.filter((detail: any) => detail.URL === location?.pathname)[0];
  const clearFilter = () => {
    // Reset to default filters
    props?.setFilters(...props?.filters);
    setGlobalFilterValue('');   // Clear global filter value
    props?.setboolValue(false)
  };
  const onGlobalFilterChange = (e: any) => {
    const value = e.target.value;
    let _filters = { ...props?.filters };
    // // @ts-ignore
    _filters["global"].value = value;
    props?.setFilters(_filters);
    setGlobalFilterValue(value);
    setglobalValue(value)
  };
  const getAPI = async () => {
    try {
      const res = await callPostAPI(
        ENDPOINTS.GETEXCELTEMPLATECOMMON,
        null,
        currentMenu?.FUNCTION_CODE
      );
      TemplateDownload(res?.DATALIST, res?.JDATALIST, props?.header);
    } catch (error: any) {
      toast.error(error);
    }
  };
  const Actionitems = [
    {

      label: t("Upload Data"),
      icon: "pi pi-upload",
      visible: true,
      command: () => {
        isUploadData();
      },
    },
    {
      label: t("Download Template"),
      icon: "pi pi-download",
      command: () => {
        getAPI();
      },
    },
    {
      label: t("Download Data"),
      icon: "pi pi-download",
      command: () => {
        handlerDownload();
      },
    },
  ];
  const isUploadData = () => {
    setVisible(true);
  };

  const ActionDownloaditems = [
    {
      label: "Download Data",
      icon: "pi pi-download",
      command: () => {
        handlerDownload();
      },
    },
  ];

  const ExportCSV = (csvData: any, fileName: any) => {
    const fileType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    const fileExtension = ".xlsx";


    for (let key in csvData) {
      delete csvData[key].SKILL_ID;
      delete csvData[key].FACILITY_ID;
      delete csvData[key].PART_ID;
      delete csvData[key].MAKE_ID;
      delete csvData[key].WO_ID;
      delete csvData[key].ASSETTYPE_ID;
      delete csvData[key].ASSET_ID;
      delete csvData[key].ASSETGROUP_ID;
      delete csvData[key].SCHEDULE_ID;
      delete csvData[key].TASK_ID;
      delete csvData[key].MODEL_ID;
      delete csvData[key].UOM_ID;
      delete csvData[key].USER_ID;
      delete csvData[key].ROLE_ID;
      delete csvData[key].SKILL_ID;
      delete csvData[key].TEAM_ID;
      delete csvData[key].LOCATIONTYPE_ID;
      delete csvData[key].LOCATION_ID;
      delete csvData[key].DOC_ID;
      delete csvData[key].STORE_ID;
      delete csvData[key].VENDOR_ID;
      delete csvData[key].MATREQ_ID;
      delete csvData[key].REQ_ID;
      delete csvData[key].EVENT_ID;
      delete csvData[key].EVENT_TYPE;
      delete csvData[key].OBJ_ID;
      delete csvData[key].STATUS_CODE;
    }

    const ws = xlsx.utils.json_to_sheet(csvData);
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = xlsx.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(data, fileName + fileExtension);
  };
  const handlerDownload = async () => {
    if (pagePath?.toString()?.includes(location?.pathname)) {
      const payload: any = {
        FUNCTION_CODE: currentMenu?.FUNCTION_CODE
      }
      const res = await callPostAPI(ENDPOINTS.GET_EXCEL_DOWNLOADDATA, payload);
      if (res?.FLAG === 1) {
        if (res?.DOWNLOADDATA?.length > 0) {
          ExportCSV(res?.DOWNLOADDATA, currentMenu?.FUNCTION_DESC);
        } else {
          toast.error("No Data Found");
        }
      } else {
        toast.error("No Data found")
      }
    } else {
      if (props?.columnData.length > 0) {
        ExportCSV(props?.columnData, currentMenu?.FUNCTION_DESC);
      } else {
        toast.error("No Data Found");
      }
    }

  };

  return (
    <>
      <div className="flex flex-wrap justify-between">
        <div>
          <h6 className="Text_Primary mr-2">{t(props?.header)} {location?.pathname === PATH?.CURRENTSTATUSCONFIG
            || location?.pathname === PATH?.ASSETMASTERCONFIGURATION
            || location?.pathname === PATH?.SAVENUMBERRANGECONFIG
            ? "Configuration" : ""}</h6>
          {/* {props?.wo_list} */}
        </div>

        <div className="flex flex-wrap">
          {props?.search && (
            <span className="p-input-icon-left me-2">
              <InputField
                type="search"
                value={globalFilterValue}
                onChange={onGlobalFilterChange}
                className="w-80 Search-Input"
                placeholder={t("Search")}
              />
            </span>
          )}
          <div>
            {
              location?.pathname === PATH?.WORKORDERTYPE ||
                location?.pathname === PATH?.WORKORDERSTATUS ||
                location?.pathname === PATH?.SAVENUMBERRANGECONFIG ||

                location?.pathname === `${appName}/materialrequestapprovelist` ||
                location?.pathname === `${appName}/workorderlist`
                ? (
                  ""
                ) : (
                  <>
                    <div className="iconButton flex ">
                      {currentMenu?.ADD_RIGHTS === "True" && (
                        <Buttons
                          className="Primary_Button me-2"
                          label={t("Add New")}
                          icon="pi pi-plus"
                          onClick={props?.isClick}
                        />
                      )}
                      <>
                        {location?.pathname === `${appName}/currentstatusconfig` ||
                          location?.pathname === `${appName}/severitylist` ||
                          location?.pathname === PATH?.WEEKOFMASTER ||
                          location?.pathname === PATH?.TASKMASTER ||
                          location?.pathname === PATH?.USERROLEMASTER ||
                          location?.pathname === PATH?.RACKMASTER ||
                          location?.pathname === PATH?.VENDORMASTER ||
                          location?.pathname === PATH?.STOREMASTER ||
                          location?.pathname === PATH?.SERVICEREQUEST ||
                          location?.pathname === PATH?.WORKORDERMASTER ||
                          location?.pathname === `${appName}/assettaskschedulelist` ? (
                          ""
                        ) : (
                          <>
                            {" "}
                            {location?.pathname === PATH?.RACKMASTER ||
                              location?.pathname === PATH?.VENDORMASTER ||
                              location?.pathname === PATH?.STOREMASTER ||
                              location?.pathname === PATH?.SERVICEREQUEST ||
                              location?.pathname === PATH?.WORKORDERMASTER ? (
                              ""
                            ) : (
                              <SplitButtons
                                label={t("Action")}
                                model={
                                  location?.pathname === PATH?.EVENTMASTER ||
                                    location?.pathname === PATH?.ESCALATIONMATRIX ||
                                    location?.pathname === PATH?.USERROLEMASTER ||
                                    location?.pathname === PATH?.TEAMMASTER ||
                                    location?.pathname === PATH?.INVENTORYMASTER ||
                                    location?.pathname === PATH?.MATERIALREQUEST ||
                                    // location?.pathname === PATH?.REQDESCRIPTIONMASTER ||
                                    location?.pathname === PATH?.USERSKILLMSATER ||
                                    location?.pathname === PATH?.TASKMASTER ||
                                    location?.pathname === PATH?.REASONMASTER ||
                                    location?.pathname === PATH?.RECTIFIEDCOMMENT

                                    ? ActionDownloaditems
                                    : Actionitems
                                }
                              />
                            )}
                          </>
                        )}
                      </>
                    </div>
                  </>
                )}
          </div>
        </div>
      </div>

      <Dialog
        header="Bulk Upload"
        visible={visible}
        style={{ width: "30vw" }}
        onHide={() => setDialogVisible(false)}
      >
        <div className="">
          <FileUpload
            mode="basic"
            name="demo[]"
            accept="xlsx/*"
            maxFileSize={1000000}
            className="ml-2"
            onSelect={async (e) => {
              try {
                const response: any = await readUploadFile(e, currentMenu?.FUNCTION_CODE, setVisible);
                if (response?.flag || response?.FLAG) {
                  toast?.success(response?.MSG);
                  props?.getAPI();
                } else {
                  toast?.error(response?.MSG);
                }
              } catch (error: any) {
                toast?.error(error);
              }

            }}
          />
        </div>
      </Dialog>
    </>
  );
};

export default memo(TableHeader);