 import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { DataTable, DataTableFilterMeta } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import "../../components/Checkbox/Checkbox.css";

const PartDetailsDialogBox = ({
  partList,
  getpartlist,
  saveFuc,
  selectedParts,
  setSelectedParts,
}: any) => {
  const defaultFilters: DataTableFilterMeta = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    'PART_CODE': {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
    },
    'PART_NAME': {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
    },
    'ASSETTYPE_NAME': {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
    },
    'STORE_NAME': {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
    },


  };
  const { t } = useTranslation();
  const [cancleSelectedData, setCancelSelectedData] = useState<any | null>()
  const [visible, setVisible] = useState<boolean>(false);
  //const [rowClick, setRowClick] = useState<boolean>(false);
  const [part, setPart] = useState<any | null>([]);
  const [globalFilterValue, setGlobalFilterValue] = useState<string>("");

 
  const [filters, setFilters] = useState<DataTableFilterMeta>(defaultFilters);

  const setDialogVisible = () => {
    setVisible(!visible);
    setCancelSelectedData(selectedParts)
    setSelectedParts(selectedParts)
  };
  const handleCancel = () => {
    setVisible(!visible);
    setSelectedParts(cancleSelectedData)
  }
  const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    let _filters = { ...filters };

    // @ts-ignore
    _filters["global"].value = value;

    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  // const initFilters = () => {
  //   setFilters(defaultFilters);
  //   setGlobalFilterValue('');
  // };


  const handlerPartSave = (e: any) => {
    e.preventDefault()
    if (selectedParts?.length !== 0) {
      saveFuc();
      setVisible(false);
    } else {
      toast.error("Please select at least one part")
    }
  }
  useEffect(() => {
    getpartlist!();
  }, []);

  useEffect(() => {
    setPart(partList);
  }, [partList]);

  return (
    <>
      <div className="">
        <Button
          type="button"
          className="Primary_Button "
          label={t("Add Part")}
          onClick={() => setDialogVisible()}
        />
      </div>
      <Dialog
      // blockScroll={true}
        visible={visible}
        style={{ width: "50vw" }}
        onHide={() => setDialogVisible()}
      >
        <div className="">
          <div className="">
            <div className="flex flex-wrap justify-between mb-2">
              <h6>{t("Part Details")}</h6>
              <span className="p-input-icon-left">
                <i className="pi pi-search ml-3"></i>
                <InputText
                  type="search"
                  value={globalFilterValue}
                  onChange={onGlobalFilterChange}
                  className="min-w-80 Search-Input"
                  placeholder={"Search"}
                />
              </span>
            </div>

            <div className="">
              <DataTable
                value={part}
                showGridlines
                emptyMessage={t("No Data found.")}
                // selectionMode={rowClick ? null : "multiple"}
                selection={selectedParts}
                onSelectionChange={(e: any) => setSelectedParts(e.value)}
                dataKey="PART_ID"

                filters={filters}
                globalFilterFields={['PART_CODE', 'PART_NAME', 'ASSETTYPE_NAME', 'STORE_NAME']}
              >
                <Column
                  selectionMode="multiple"
                  headerStyle={{ width: "3rem" }}
                ></Column>
                <Column field="PART_CODE" header={t("Part Code")}></Column>
                <Column field="PART_NAME" header={t("Part Name")} ></Column>
                <Column field="ASSETTYPE_NAME" header={t("Equipment Type")}></Column>
                <Column field="STORE_NAME" header={t("Store Name")} ></Column>
              </DataTable>
            </div>
          </div>
          <div className="mt-2 ">
            <div className="flex justify-center mt-2">
              <Button
                type="button"
                className="Primary_Button  w-28 me-2"
                label={t("Save")}
                onClick={(e: any) => {
                  handlerPartSave(e)

                }}
              />
              <Button
                className="Secondary_Button w-28 "
                label={t("Cancel")}
                onClick={handleCancel}
              />
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default PartDetailsDialogBox;
