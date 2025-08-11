import { Column } from "primereact/column";
import { FilterMatchMode } from "primereact/api";
import { memo, useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import TableHeader from "../Table/TableHeader";
import { Paginator } from "primereact/paginator";
import "../Input/Input.css";
import "./Table.css";
import { Checkbox } from "primereact/checkbox";
import {
  formateDate,
  LOCALSTORAGE,
  onlyDateFormat,
  ROLETYPECODE,
} from "../../utils/constants";
import { toast } from "react-toastify";
import DialogBox from "../DialogBox/DialogBox";
import { callPostAPI } from "../../services/apis";
import { useTranslation } from "react-i18next";
import { useLocation, useOutletContext } from "react-router-dom";

import { decryptData } from "../../utils/encryption_decryption";
import { ENDPOINTS } from "../../utils/APIEndpoints";

const Table = (props: any) => {
  const { t } = useTranslation();
  let { pathname } = useLocation();
  const [, menuList]: any = useOutletContext();
  const currentMenu = menuList
    ?.flatMap((menu: any) => menu?.DETAIL)
    ?.filter((detail: any) => detail?.URL === pathname)[0];
  const [filterData, setFilterData] = useState<any | null>([]);

  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(15);
  let customHeader: any = {};
  props?.columnTitle.forEach((head: any, index: number) => {
    customHeader = {
      ...customHeader,
      [head]: props?.customHeader[index],
    };
  });
  const [filters, setFilters] = useState<any>({
    global: { value: "", matchMode: FilterMatchMode.CONTAINS },
  });

  const onPageChange = (event: any) => {
    setFirst(event.first);
    setRows(event.rows);
  };
  let userRole: any = props?.tableHeader?.headerName === "User Role Master";
  let tableHeader: any = props?.tableHeader?.headerName !== "User Role Master";

  const handleFileDownload = (
    base64Data: any,
    fileName: any,
    fileExtension: any
  ) => {
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName}.${fileExtension}`;

    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
  };

  const handelDelete = async (selectedData: any, index: any, rowData: any) => {
    let payload = {};
    if (pathname === "/workordertypelist") {
      payload = {
        MODE: "D",
        PARA: { para1: `Type setup`, para2: "deleted" },
        FORM_TYPE: "WT",
        DESCRIPTION: rowData?.WO_TYPE_NAME,
        COLORS: rowData?.COLORS,
        ACTIVE: rowData.ACTIVE,
        WO_CODE: rowData?.WO_TYPE_CODE,
        FUNCTION_CODE: currentMenu?.FUNCTION_CODE,
      };
      try {
        const res = await callPostAPI(ENDPOINTS?.WORKORDERTYPE_STATUS, payload);
        if (res?.FLAG === true) {
          toast?.success(res?.MSG);
          props?.getAPI();
        } else {
          toast?.error(res?.MSG);
        }
      } catch (error: any) {
        toast.error(error);
      }
    } else if (props?.isDocumentDelete) {
      props?.handleFileDelete(selectedData, index);
    } else {
      if (props?.dataKey === "User Master") {
        payload = {
          NEW_USER_ID: selectedData[props?.DELETE_ID],
          PARA: { para1: `${props?.dataKey}`, para2: "Deleted" },
        };
      } else {
        payload = {
          [props?.DELETE_ID]: selectedData[props?.DELETE_ID],
          PARA: { para1: `${props?.dataKey}`, para2: "Deleted" },
        };
      }

      try {
        const res = await callPostAPI(props?.deleteURL, payload);
        if (res?.FLAG === true) {
          toast.success(res?.MSG);
          props?.getAPI();
        } else {
          toast.error(res?.MSG);
          props?.getAPI();
        }
      } catch (error: any) {
        toast?.error(error);
      }
    }
  };

  const getFilterData = () => {
    if (!filterData || !filters.global.value) return filterData;
    const value: any = filters?.global?.value?.toLowerCase();
    return props?.columnData?.filter((item: any) => {
      return Object.values(item)?.some((val: any) =>
        val?.toString()?.toLowerCase().includes(value)
      );
    });
  };

  useEffect(() => {
    if (filters?.global?.value === "") {
      setFilterData(props?.columnData);
    } else {
      const data: any = getFilterData();
      setFilterData(data);
    }
  }, [filters?.global?.value, props?.columnData]);

  useEffect(() => {
    setFirst(0);
  }, [filterData, rows]);

  return (
    <>
      <DataTable
        className="primeTable"
        value={filterData?.slice(first, first + rows)}
        showGridlines
        emptyMessage={t("No Data found.")}
        dataKey={props?.dataKey}
        key={props?.dataKey}
        // loading={loading}
        scrollHeight={props?.scrollHeight}
        header={
          props?.tableHeader && (
            <TableHeader
              filters={filters}
              setFilters={setFilters}
              isClick={props?.isClick}
              getAPI={props?.getAPI}
              header={props?.tableHeader?.headerName}
              search={props?.tableHeader?.search}
              wo_list={props?.tableHeader?.wo_list}
              columnData={props?.columnData}
              currentMenu={currentMenu}
            />
          )
        }
        filters={filters}
        tableStyle={{ minWidth: "20rem" }}
        globalFilterFields={props?.filterFields}
        first={first}
        rows={rows}
      >
        {props?.columnTitle?.map((title: any) => {
          if (props?.clickableColumnHeader?.includes(title)) {
            return (
              <Column
                key={title?.id}
                field={title}
                header={t(`${customHeader[title]}`)}
                sortable
                body={(rowData: any) => {
                  const rowItem: any = { ...rowData };
                  return (
                    <>
                      {tableHeader ? (
                        <p
                          className="cursor-pointer"
                          onClick={() => {
                            props?.isClick({ rowItem });
                            localStorage.setItem("Id", JSON.stringify(rowItem));
                          }}
                        >
                          {rowData[title]}
                        </p>
                      ) : (
                        <>
                          {userRole &&
                          (rowData.FACILITY_GENERIC === "Y" ||
                            decryptData(
                              localStorage.getItem(LOCALSTORAGE?.ROLETYPECODE)
                            ) === ROLETYPECODE?.SYSTEM_ADMIN) ? (
                            <p
                              className="cursor-pointer"
                              onClick={() => {
                                localStorage.setItem(
                                  "Id",
                                  JSON.stringify(rowItem)
                                );
                                props?.isClick({ rowItem });
                              }}
                            >
                              {rowData[title]}
                            </p>
                          ) : (
                            <p
                              className="cursor-pointer"
                              onClick={() => {
                                toast.error(
                                  "You have no permission to edit role "
                                );
                              }}
                            >
                              {rowData[title]}
                            </p>
                          )}
                        </>
                      )}
                    </>
                  );
                }}
              ></Column>
            );
          } else if (props?.downloadColumnHeader === title) {
            return (
              <Column
                key={title}
                field={title}
                header={t(`${customHeader[title]}`)}
                body={(rowData: any) => {
                  return (
                    <>
                      <p
                        className="cursor-pointer"
                        onClick={() => {
                          handleFileDownload(
                            rowData?.DOC_DATA,
                            rowData?.DOC_NAME,
                            rowData?.DOC_EXTENTION
                          );
                        }}
                      >
                        {" "}
                        {rowData?.DOC_NAME}{" "}
                      </p>
                    </>
                  );
                }}
              ></Column>
            );
          } else if (title === "COLORS") {
            return (
              <Column
                key={title}
                field={title}
                sortable
                header={t(`${customHeader[title]}`)}
                body={(rowData: any) => {
                  return (
                    <>
                      <div
                        style={{
                          backgroundColor: `${rowData[title]}`,
                          width: "100px",
                          height: "8px",
                        }}
                      ></div>
                    </>
                  );
                }}
              ></Column>
            );
          } else if (title === "WO_CREATED_TIME") {
            return (
              <Column
                key={title}
                className="w-28"
                field={title}
                header={t(`${customHeader[title]}`)}
                body={(rowData: any) => {
                  return <>{formateDate(rowData?.WO_CREATED_TIME)}</>;
                }}
              ></Column>
            );
          } else if (title === "SERVICE_CREATED_TIME") {
            return (
              <Column
                key={title}
                className="w-28"
                field={title}
                header={t(`${customHeader[title]}`)}
                body={(rowData: any) => {
                  return <>{formateDate(rowData?.WO_CREATED_TIME)}</>;
                }}
              ></Column>
            );
          } else if (title === "DOC_DATE" || title === "MATREQ_DATE") {
            return (
              <Column
                key={title}
                className="w-28"
                field={title}
                header={t(`${customHeader[title]}`)}
                body={(rowData: any) => {
                  return <>{onlyDateFormat(rowData?.DOC_DATE)}</>;
                }}
              ></Column>
            );
          } else if (title === "ACTIVE" || title === "Active") {
            return (
              <Column
                key={title}
                className="w-28"
                field={title}
                header={t(`${customHeader[title]}`)}
                body={(rowData: any) => {
                  return (
                    <>
                      <Checkbox
                        checked={rowData?.ACTIVE === true ? true : false}
                      />
                    </>
                  );
                }}
              ></Column>
            );
          } else if (
            title === "FACILITY_GENERIC" ||
            title === "MAINTAIN_INVENTORY"
          ) {
            return (
              <Column
                key={title}
                field={title}
                sortable
                header={t(`${customHeader[title]}`)}
                body={(rowData: any) => {
                  if (
                    rowData[title] === "Y" ||
                    rowData[title] === "N" ||
                    rowData[title] === "YES" ||
                    rowData[title] === "NO"
                  ) {
                    return (
                      <>
                        {rowData[title] === "Y" || rowData[title] === "YES"
                          ? "Yes"
                          : "No"}
                      </>
                    );
                  } else {
                    return <>{rowData[title] ? "Yes" : "No"}</>;
                  }
                }}
              ></Column>
            );
          } else if (title === "SEVERITY" || title === "Severity") {
            return (
              <Column
                key={title}
                className="w-28"
                field={title}
                header={t(`${customHeader[title]}`)}
                body={(rowData: any) => {
                  if (rowData?.SEVERITY === "High") {
                    return (
                      <>
                        <label>
                          <i
                            className="pi pi-chevron-circle-down mr-2 "
                            style={{ color: "#DC2020" }}
                          ></i>
                          {rowData?.SEVERITY}
                        </label>
                      </>
                    );
                  } else if (rowData?.SEVERITY === "Medium") {
                    return (
                      <>
                        <label>
                          <i
                            className="pi pi-chevron-circle-down mr-2 "
                            style={{ color: "#FFAB00" }}
                          ></i>
                          {rowData?.SEVERITY}
                        </label>
                      </>
                    );
                  } else {
                    return (
                      <>
                        <label>
                          <i
                            className="pi pi-chevron-circle-down mr-2 "
                            style={{ color: "#71DD37" }}
                          ></i>
                          {rowData?.SEVERITY}
                        </label>
                      </>
                    );
                  }
                }}
              ></Column>
            );
          } else if (title === "CNCL_IND") {
            return (
              <Column
                key={title}
                className="w-28"
                field={title}
                header={t(`${customHeader[title]}`)}
                body={(rowData: any) => {
                  return (
                    <>{rowData[title] === true ? "Cancelled" : "Received"}</>
                  );
                }}
              ></Column>
            );
          } else if (title === "ASSETTYPE") {
            return (
              <Column
                key={title}
                field={title}
                header={t(`${customHeader[title]}`)}
                body={(rowData: any) => {
                  return (
                    <>{rowData[title] === "A" ? "Equipment" : "Soft Service"}</>
                  );
                }}
              ></Column>
            );
          } else if (title === "ICON_NAME") {
            return (
              <Column
                key={title}
                field={title}
                header={t(`${customHeader[title]}`)}
                body={(rowData: any) => {
                  return (
                    <>
                      <i
                        className={`${rowData[title]} mr-2 `}
                        style={{ color: rowData?.COLORS }}
                      ></i>
                      {rowData[title]}
                    </>
                  );
                }}
              ></Column>
            );
          } else if (
            title === "ACTION" &&
            currentMenu?.DELETE_RIGHTS === "True"
          ) {
            return (
              <Column
                key={title}
                className="w-28"
                field={title}
                header={"Action"}
                body={(rowData: any, rowDetails: any) => {
                  const rowItem: any = { ...rowData };

                  return (
                    <>
                      <DialogBox
                        data={rowData}
                        handelDelete={async () => {
                          await handelDelete(
                            { ...rowItem },
                            rowDetails?.rowIndex,
                            rowData
                          );
                        }}
                      />
                    </>
                  );
                }}
              ></Column>
            );
          } else {
            return (
              <Column
                key={title}
                field={title}
                header={t(`${customHeader[title]}`)}
                sortable
              ></Column>
            );
          }
        })}
      </DataTable>
      <div className="flex p-4 bg-white flex-row gap-3a justify-between ">
        {filterData?.length > 0 && (
          <div className="mt-3 Text_Secondary Input_label">
            {`Showing ${first + 1} - ${
              filterData?.slice(first, first + rows).length + first
            } of ${filterData?.length}`}
          </div>
        )}

        <Paginator
          first={first}
          rows={rows}
          totalRecords={filterData?.length}
          onPageChange={onPageChange}
          currentPageReportTemplate="Items per Page:-"
          rowsPerPageOptions={[15, 25, 50, 75].filter(
            (option) => option <= filterData?.length
          )}
          alwaysShow={false}
          template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
        ></Paginator>
      </div>
    </>
  );
};

export default memo(Table);
