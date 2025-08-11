import { Checkbox } from "primereact/checkbox";
import { Column } from "primereact/column";
import { TreeTable } from "primereact/treetable";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
const TreeTableRight = ({ nodes, newHandleChange, type }: any) => {
  const { t } = useTranslation();
  const [nodeList, setNodeList] = useState<any>([]);
  const [showColumn, setShowColumn] = useState<any>(false);
  
  useEffect(() => {
    if (type === "workFlow") {
      const filterTrasactionList: any = nodes?.filter(
        (f: any): any =>
          f?.data?.name === "Workorder Flow" ||
          f?.data?.name === "Service Request"
      );
      setNodeList(filterTrasactionList);
      setShowColumn(false);
    } else {
      const filterMasterList: any = nodes?.filter(
        (f: any): any =>
          f?.data?.name !== "Workorder Flow" &&
          f?.data?.name !== "Service Request"
      );

      setNodeList(filterMasterList);
      setShowColumn(true);
    }
  }, [nodes, type]);
  return (
    <>
      {nodeList?.length > 0 && (
        <TreeTable
          scrollable
          scrollHeight="480px"
          value={nodeList}
          className="mt-2"
        >
          <Column
            field="name"
            className="w-80"
            header={t("Module Name")}
            expander
          ></Column>
          <Column
            field="noAccess"
            header={t("No Access")}
            className="w-36"
            body={(rowData) => {
              return (
                <Checkbox
                  value="noAccess"
                  inputId="ingredient1"
                  checked={rowData.data.noAccess}
                  onChange={(e) => newHandleChange(e, rowData)}
                />
              );
            }}
          ></Column>
          <Column
            field="view"
            header={`${showColumn === true ? t("View") : t("Access")}`}
            className="w-36"
            body={(rowData) => {
              return (
                <Checkbox
                  value="view"
                  inputId="ingredient2"
                  checked={rowData.data.view}
                  onChange={(e) => newHandleChange(e, rowData)}
                />
              );
            }}
          ></Column>

          {showColumn === true && (
            <Column
              field="add"
              header={t("Add")}
              className="w-36"
              body={(rowData) => {
                return (
                  <Checkbox
                    value="add"
                    inputId="ingredient3"
                    checked={rowData.data.add}
                    onChange={(e) => newHandleChange(e, rowData)}
                  />
                );
              }}
            ></Column>
          )}
          {showColumn === true && (
            <Column
              field="update"
              header={t("Update")}
              className="w-36"
              body={(rowData) => {
                return (
                  <Checkbox
                    value="update"
                    inputId="ingredient4"
                    checked={rowData.data.update}
                    onChange={(e) => newHandleChange(e, rowData)}
                    type="checkbox"
                  />
                );
              }}
            ></Column>
          )}
          {showColumn === true && (
            <Column
              field="delete"
              header={t("Delete")}
              className="w-40"
              body={(rowData) => {
                return (
                  <Checkbox
                    value="delete"
                    inputId="ingredient4"
                    checked={rowData.data.delete}
                    onChange={(e) => newHandleChange(e, rowData)}
                    type="checkbox"
                  />
                );
              }}
            ></Column>
          )}
        </TreeTable>
      )}
    </>
  );
};

export default TreeTableRight;
