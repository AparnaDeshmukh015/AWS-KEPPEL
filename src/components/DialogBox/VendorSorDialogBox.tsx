import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { DataTable, DataTableFilterMeta } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import Field from "../Field";
import { useForm } from "react-hook-form";
import Select from "../Dropdown/Dropdown";



const VendorSorDialogBox = ({
    partList,
    getpartlist,
    saveFuc,

    selectedParts,
    setSelectedParts,
    assetGroup,
    assetType,


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
    // const [rowClick, setRowClick] = useState<boolean>(false);
    const [part, setPart] = useState<any | null>([]);
    const [globalFilterValue, setGlobalFilterValue] = useState<string>("");
    const [selectedAssetTypeID, setSelectedAssetType] = useState<string | null>(null);
    const [assetTypes, setassetTypes] = useState<any | []>([]);
    const [filters, setFilters] = useState<DataTableFilterMeta>(defaultFilters);
    const rowClick = false;
    const setDialogVisible = () => {
        setVisible(!visible);
        setCancelSelectedData(selectedParts)
        setSelectedParts(selectedParts)
        resetField("ASSETGROUP_NAME")
        resetField("ASSETTYPE_NAME")
        setPart(partList)

    };

    const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        let _filters = { ...filters };

        // @ts-ignore
        _filters["global"].value = value;

        setFilters(_filters);
        setGlobalFilterValue(value);
    };

    // const initFilters = () => {
    //     setFilters(defaultFilters);
    //     setGlobalFilterValue('');
    // };

    // const clearFilter = () => {
    //     initFilters();
    // };

    const {
        register,

        control,
        setValue,
        watch,

        resetField,
        formState: { },
    } = useForm({
        defaultValues: {
            ASSETGROUP_NAME: '',
            ASSETTYPE_NAME: "",
        },
        mode: "all",
    });

    const assetGroups: any = watch('ASSETGROUP_NAME')


    const handlerPartSave = (e: any) => {
        e.preventDefault()
        if (selectedParts?.length !== 0) {
            saveFuc();
            resetField("ASSETTYPE_NAME")
            resetField("ASSETGROUP_NAME")
            setVisible(false);
        } else {
            toast.error("Please select at least one part")
        }
    }

    const handleCancel = () => {
        setVisible(!visible);
        setSelectedParts(cancleSelectedData)
        resetField("ASSETGROUP_NAME")
        resetField("ASSETTYPE_NAME")
        setPart(partList)

    }
    useEffect(() => {
        getpartlist!();
    }, []);

    useEffect(() => {

        const assetList: any = assetType?.filter(
            (f: any) => f.ASSETGROUP_ID === assetGroups?.ASSETGROUP_ID
        )
        setassetTypes(assetList)


    }, [assetGroups]);


    useEffect(() => {
        let filteredParts = partList;
        if (selectedAssetTypeID) {
            filteredParts = filteredParts.filter((part: any) => part.ASSETTYPE_ID === selectedAssetTypeID);
        }
        setPart(filteredParts);

    }, [selectedAssetTypeID, partList, assetGroups]);




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
                            <div className="flex gap-2">
                                <Field
                                    controller={{
                                        name: "ASSETGROUP_NAME",
                                        control: control,
                                        render: ({ field }: any) => {
                                            return (
                                                <Select
                                                    options={assetGroup}
                                                    {...register("ASSETGROUP_NAME", {
                                                        required:
                                                            "Please fill the required fields.",

                                                    })}

                                                    findKey={"ASSETGROUP_ID"}
                                                    optionLabel="ASSETGROUP_NAME"

                                                    setValue={setValue}
                                                    placeholder="Equipment Group"

                                                    {...field}
                                                />
                                            );
                                        },
                                    }}
                                />
                                <Field
                                    controller={{
                                        name: "ASSETTYPE_NAME",
                                        control: control,
                                        render: ({ field }: any) => {
                                            return (
                                                <Select
                                                    options={assetTypes}
                                                    {...register("ASSETTYPE_NAME", {
                                                        required:
                                                            "Please fill the required fields.",
                                                        onChange(event) {
                                                            setSelectedAssetType(event.target.value.ASSETTYPE_ID);
                                                        },
                                                    })}

                                                    findKey={"ASSETTYPE_ID"}
                                                    optionLabel="ASSETTYPE_NAME"

                                                    setValue={setValue}
                                                    placeholder="Equipment Type"

                                                    {...field}
                                                />
                                            );
                                        },
                                    }}
                                />
                            </div>
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
                                selectionMode={rowClick ? null : "multiple"}
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

export default VendorSorDialogBox;