import React from "react";
import { Column } from "primereact/column";
import { FilterMatchMode } from "primereact/api";
import { memo, useState } from "react";
import { DataTable, DataTableFilterMeta } from "primereact/datatable";
import TableHeader from "../Table/TableHeader";
import { Paginator } from "primereact/paginator";
import "../Input/Input.css";
import "./Table.css";
import { Checkbox } from "primereact/checkbox";
import { dateFormat, LOCALSTORAGE, ROLETYPECODE } from "../../utils/constants";
import { toast } from "react-toastify";
import DialogBox from "../DialogBox/DialogBox";
import { callPostAPI } from "../../services/apis";
import { useTranslation } from "react-i18next";
import { useLocation, useOutletContext } from "react-router-dom";
import moment from "moment";
import { decryptData } from "../../utils/encryption_decryption";
const WoTable = (props: any) => {
  const {   } = useTranslation();

  const [selectedWoList, setSelectedWoList] = useState<any>(null);
  const [rowClick, setRowClick] = useState<boolean>(true);

  let { pathname } = useLocation();
  const [selectedFacility, menuList]: any = useOutletContext();
  const currentMenu = menuList
    ?.flatMap((menu: any) => menu?.DETAIL)
    ?.filter((detail: any) => detail?.URL === pathname)[0];
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(15);
  const defaultFilters: DataTableFilterMeta = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  };
  let customHeader: any = {};
  props?.columnTitle.forEach((head: any, index: number) => {
    customHeader = {
      ...customHeader,
      [head]: props?.customHeader[index],
    };
  });
  const [filters, setFilters] = useState<DataTableFilterMeta>(defaultFilters);
  const [loading, setLoading] = useState<boolean>(false);
  const onPageChange = (event: any) => {
    setFirst(event.first);
    setRows(event.rows);
  };
  let userRole: any = props?.tableHeader?.headerName === "User Role Master";
  let tableHeader: any = props?.tableHeader?.headerName !== "User Role Master";
  return (
    <>
      <DataTable
        className="primeTable"
        value={props?.columnData?.slice(first, first + rows)}
        showGridlines
        emptyMessage={ ("No Data found.")}
        dataKey={props?.dataKey}
        key={props?.dataKey}
        loading={loading}
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
        selectionMode={rowClick ? null : "checkbox"}
        selection={selectedWoList}
        onSelectionChange={(e: any) => setSelectedWoList(e.value)}
      >
        {props?.columnTitle?.map((title: any) => {
          if (title === "WO_ID") {
            return (
              <Column
                selectionMode="multiple"
                headerStyle={{ width: "3rem" }}
              ></Column>
            );
          } else if (props?.clickableColumnHeader?.includes(title)) {
            return (
              <Column
                key={title?.id}
                field={title}
                header={ (`${customHeader[title]}`)}
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
                              decryptData(localStorage.getItem(LOCALSTORAGE?.ROLETYPECODE)) ===
                              ROLETYPECODE?.SYSTEM_ADMIN) ? (
                            <p
                              className="cursor-pointer"
                              onClick={() => {
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
          } else {
            return (
              <Column
                key={title}
                field={title}
                header={ (`${customHeader[title]}`)}
                sortable
              ></Column>
            );
          }
        })}
      </DataTable>
      <Paginator
        first={first}
        rows={rows}
        totalRecords={props?.columnData?.length}
        onPageChange={onPageChange}
        currentPageReportTemplate="Items per Page:-"
        rowsPerPageOptions={[15, 25, 50]}
        alwaysShow={false}
        template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
      ></Paginator>
    </>
  );
};

export default WoTable;
