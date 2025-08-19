import React, { useEffect, useState } from 'react'
import { callPostAPI } from '../../../services/apis';
import { ENDPOINTS } from '../../../utils/APIEndpoints';
import { useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import TableListLayout from '../../../layouts/TableListLayout/TableListLayout'
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Card } from 'reactstrap';
import { Paginator } from 'primereact/paginator';
import { IconField } from 'primereact/iconfield';
import { InputText } from 'primereact/inputtext';
import { FilterMatchMode } from 'primereact/api';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import MultiSelects from '../../../components/MultiSelects/MultiSelects';
import { toast } from 'react-toastify';
import DialogBox from '../../../components/DialogBox/DialogBox';
import HierarchyDialog from '../../../components/HierarchyDialog/HierarchyDialog';
import { useForm } from 'react-hook-form';
import Field from '../../../components/Field';
import { useTranslation } from 'react-i18next';
import InputField from "../../../components/Input/Input";
import SplitButton from '../../../components/SplitButton/SplitButton';
import { readUploadFile, TemplateBuildingDownload, TemplateDownload } from '../../../components/TemplateDownload/TemplateDownload';
import { FileUpload } from 'primereact/fileupload';
import { PATH } from '../../../utils/pagePath';
const NewInfraScheduleMaster = (props: any) => {
    const {   } = useTranslation();
    let { pathname } = useLocation();
    const [selectedFacility, menuList]: any = useOutletContext();
    const currentMenu = menuList?.flatMap((menu: any) => menu?.DETAIL).filter((detail: any) => detail.URL === pathname)[0]

    const FACILITY: any = localStorage.getItem("FACILITYID");
    const FACILITYID: any = JSON.parse(FACILITY);
    if (FACILITYID) {
        var facility_type: any = FACILITYID?.FACILITY_TYPE;

    }
    const filterDefaultValues: any = {
        SCHEDULE_NAME: { value: null, matchMode: FilterMatchMode.CONTAINS },
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },


    };


    let [tableData, setTableData] = useState<any>();
    const navigate: any = useNavigate();
    const [originalTableData, setOriginalTableData] = useState<any[]>([]);
    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(15);
    const [globalFilterValue, setGlobalFilterValue] = useState("");
    const [filters, setFilters] = useState(filterDefaultValues);
    const [showEquipmentDialog, setShowEquipmentDialog] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState<any>(null);
    const [visibleEquipmentlist, showEquipmentlist] = useState(false);
    const [selectedKey, setSelectedKey] = useState<string[]>([]);
    const [selectedNodeKey, setselectedNodeKey] = useState("");
    const [nodes, setNodes] = useState<any | null>([]);
    const [filteredData, setFilteredData] = useState<any | null>(nodes);
    const [assetTreeDetails, setAssetTreeDetails] = useState<any | null>([]);
    const [loading, setLoading] = useState<any | null>(false)
    const [selectedAssetsnodes, setSelectedAssetsnodes] = useState<{ label: string; asset_id: number }[]>([]);
    const [hasAsset, setHasAsset] = useState<any | null>(false)
    const [visible, setVisible] = useState<boolean>(false);
    const [isfunctionCode, setIsfunctionCode] = useState<boolean>(false);
    const setDialogVisible = () => {
        setVisible(!visible);
        setIsfunctionCode(false)
    };
    const isUploadData = () => {
        setVisible(true);
        setIsfunctionCode(false)
    };

    const isUploadData_Eqlink = (functioncode: any) => {
        setIsfunctionCode(true)
        setVisible(true);
    };



    const handelDelete = async (selectedData: any, index: any, rowData: any) => {

        let payload = {
            SCHEDULE_ID: selectedData?.SCHEDULE_ID,
            PARA: {
                "para1": currentMenu?.FUNCTION_DESC,
                "para2": "Deleted"
            }
        };

        // return
        try {
            const res = await callPostAPI(ENDPOINTS?.DELETE_ASSETTASKANDSCHEDULE, payload);
            if (res?.FLAG === true) {
                toast.success(res?.MSG);
                getAPI();
            } else {
                toast.error(res?.MSG);
                getAPI();
            }
        } catch (error: any) {
            toast?.error(error);
        }

    };
    // console.log(selectedNodeKey, "selectedNodeKey")


    const {
        register,
        handleSubmit,
        control,
        setValue,
        getValues,
        resetField,
        watch,
        reset,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: {

            REMARKS: '',
            EQUIPMENT_NAME: ""
        },
        mode: "onSubmit",
    });
    const Actionitems = [
        {
            label: "Upload Data -Schedule Equipment Link",
            icon: "pi pi-upload",
            visible: true,
            command: () => {
                isUploadData_Eqlink("");
            },
        },
        {
            label: "Upload Data",
            icon: "pi pi-upload",
            visible: true,
            command: () => {
                isUploadData();
            },
        },
        {
            label: "Download Template",
            icon: "pi pi-download",
            command: async () => {
                await getExcelTemplate();


            },
        },
        {
            label: "Download Template-Schedule Equipment Link",
            icon: "pi pi-download",
            command: async () => {
                await getExcelTemplate("AS0012_L");


            },
        },
        // {
        //   label: "Download Data",
        //   icon: "pi pi-download",
        //   command: () => {
        //     ExportCSV(props?.columnData, currentMenu?.FUNCTION_DESC+new Date());
        //   },
        // },
    ];

    const handleScheduleClick = (rowData: any) => {
        localStorage.setItem("scheduleId", rowData?.SCHEDULE_ID);
        navigate(PATH?.INFRA_SCHEDULE_EDIT, {
            state: {
                scheduleId: rowData.SCHEDULE_ID,

            },
        });
    };
    const handleEquipmentClick = (rowData: any, hasAssets: boolean) => {

        setHasAsset(hasAssets)

        // return

        if (rowData?.ASSETS !== "" && rowData?.ASSETS !== null && rowData?.ASSETS !== undefined && rowData?.ASSETS?.length > 0) {
            setSelectedAssetsnodes(rowData?.ASSETS?.map((asset: any) => ({
                label: asset?.ASSET_NAME,
                asset_id: asset?.ASSET_ID
            })))
        } else {
            setSelectedAssetsnodes([])
        }

        setSelectedSchedule(rowData); // optional
        setShowEquipmentDialog(true); // optional
    };

    const removeSelectedItem = (keyToRemove: number) => {
        setSelectedAssetsnodes(prev => prev?.filter(item => item?.asset_id !== keyToRemove));
    };

    const getExcelTemplate = async (function_code?: any) => {
        try {
            const res = await callPostAPI(
                ENDPOINTS.GETEXCELTEMPLATECOMMON,
                null,
                function_code ?? currentMenu?.FUNCTION_CODE

            );
            if (res) {

            }


            TemplateDownload(res?.DATALIST, res?.JDATALIST, currentMenu?.FUNCTION_DESC, 2000);
        } catch (error: any) {
            toast.error(error);
        }
    };

    const getAPI = async () => {
        try {
            const res = await callPostAPI(
                ENDPOINTS.GET_ASSET_MASTER_LIST,
                null,
                currentMenu?.FUNCTION_CODE
            );
            setOriginalTableData(res?.ASSESTMASTERSLIST || [])
            setTableData(res?.ASSESTMASTERSLIST || [])
            localStorage.setItem('currentMenu', JSON.stringify(currentMenu))

        } catch (error: any) {
            toast.error(error);
        }
    };
    const onPageChange = (event: any) => {
        setFirst(event.first);
        setRows(event.rows);
    };
    useEffect(() => {
        if (tableData) {
            setTableData(tableData);
        }
    }, [filters, tableData, globalFilterValue]);
    useEffect(() => {
        if (currentMenu?.FUNCTION_CODE) {
            (async function () {
                await getAPI()
            })();
        }
    }, [selectedFacility, currentMenu]);

    const handleNodeSelection = (node: any) => {


        const newItem = {
            label: node?.label,
            asset_id: node?.asset_id,
        };

        // Check if already selected (prevent duplicates)
        const exists = selectedAssetsnodes && selectedAssetsnodes?.some(item => item?.asset_id === newItem?.asset_id);

        if (!exists) {
            // setSelectedKey(selectedAssetsnodes.map(item => String(item.asset_id)));
            setSelectedAssetsnodes(prev => [...prev, newItem]);

        }


    };

    useEffect(() => {

    }, [selectedAssetsnodes]);

    const onGlobalFilterChange = (e: any) => {
        const value = e.target.value?.toLowerCase();
        setGlobalFilterValue(value);
        if (value === "") {

            setTableData(originalTableData);
        } else {

            const filteredData = originalTableData?.filter((item: any) => {

                return (
                    item.SCHEDULE_NAME?.toString().toLowerCase().includes(value)

                );
            });

            setTableData(filteredData);
        }

    };

    const handleSaveEquipment = async () => {


        const payload = {
            MODE: hasAsset ? "E" : "A",
            ASSET_LIST: selectedAssetsnodes?.map(item => ({
                ASSET_ID: item.asset_id ?? 0
            })),
            SCHEDULE_ID: selectedSchedule?.SCHEDULE_ID,
            PARA: hasAsset
                ? { para1: `Equipment has been`, para2:  ("Updated") }
                : { para1: `Equipment has been`, para2:  ("Added") },
        }

        // return
        try {
            const res = await callPostAPI(ENDPOINTS?.INFRA_SAVE_SCHEDULE_LIST, payload);

            if (res?.FLAG === true) {
                setShowEquipmentDialog(false)
                toast.success(res?.MSG);
                setSelectedKey([])

                getAPI();
            } else {
                toast.error(res?.MSG);

            }
        } catch (error: any) {
            toast?.error(error);
        }

    }

    const handleCancelEquipment = () => {
        setShowEquipmentDialog(false)
        setSelectedAssetsnodes([])
        setSelectedKey([])
    }



    return (
        <>

            <Dialog
                // header="Equipment Details"
                visible={showEquipmentDialog}
                onHide={() => setShowEquipmentDialog(false)}
                style={{ width: '40vw' }}
                modal
                footer={
                    <div className="flex justify-end gap-2">
                        <Button
                            label="Cancel"
                            className="p-button-text"
                            onClick={handleCancelEquipment}
                            style={{ height: '40px', border: '1px solid #E5E4E2', padding: '14px 20px', }}
                        />
                        <Button
                            label="Save"
                            onClick={handleSaveEquipment}
                            style={{ height: '40px', border: '1px solid #E5E4E2', backgroundColor: "#8e724a", color: "white", padding: '14px 20px', }}
                        />
                    </div>
                }
            >
                <div className='flex flex-col align-items-center p-2'>
                    <div className=' pb-6'>
                        <h6>Equipment Details</h6>
                    </div>
                    <p className=' pb-6'> Schedule Name : {selectedSchedule?.SCHEDULE_NAME}</p>
                    <Field
                        controller={{
                            name: "EQUIPMENT_NAME",
                            control: control,
                            render: ({ field }: any) => {
                                return (
                                    <InputField
                                        {...register("EQUIPMENT_NAME", {

                                        })}
                                        // require={true}
                                        label="Equipment"
                                        // invalid={errors.EQUIPMENT_NAME}
                                        readOnly={true}
                                        placeholder={true}
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
                </div>
                <HierarchyDialog
                    showEquipmentlist={showEquipmentlist}
                    visibleEquipmentlist={visibleEquipmentlist}
                    selectedKey={selectedKey}
                    setSelectedKey={setSelectedKey}
                    setValue={setValue}
                    nodes={nodes}
                    filteredData={filteredData}
                    setFilteredData={setFilteredData}
                    setNodes={setNodes}
                    assetTreeDetails={assetTreeDetails}
                    setAssetTreeDetails={setAssetTreeDetails}
                    // setselectedNodeKey={setselectedNodeKey}
                    setSelectedAssetsnodes={setSelectedAssetsnodes}
                    selectedAssetsnodes={selectedAssetsnodes}
                    handleNodeSelection={handleNodeSelection}
                    isCheckbox={true}
                    loading={loading}
                />
                {selectedAssetsnodes && selectedAssetsnodes?.length > 0 ? (
                    <ul className="p-0 m-0 list-none">
                        {selectedAssetsnodes?.map((item, index) => (
                            <li
                                key={item?.asset_id}
                                className="p-2 border-b flex justify-between items-center"
                            >
                                <span>
                                    <strong>{index + 1}.</strong> {item?.label}
                                </span>
                                <Button
                                    icon="pi pi-trash"
                                    className="p-button-rounded p-button-danger p-button-text"
                                    onClick={() => removeSelectedItem(item?.asset_id)}
                                    tooltipOptions={{ position: "left" }}
                                />
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p style={{ color: "#a08b6dff", paddingLeft: "10px" }}>Please select the equipment from the dropdown above to proceed.</p>
                )}
            </Dialog>
            <Card style={{ padding: "1rem", marginBottom: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <h6>{currentMenu?.FUNCTION_DESC}</h6>
                    <div className="flex flex-wrap gap-2">
                        <IconField iconPosition="left" className="w-64">

                            <InputText
                                type="search"
                                value={globalFilterValue}
                                onChange={onGlobalFilterChange}
                                placeholder="Search"
                                className="w-64"
                            />
                        </IconField>
                        <Button
                            type="button"
                            className="Primary_Button w-20 me-2"
                            label={"Add New"}
                            icon="pi pi-plus"
                            onClick={() => navigate(PATH.INFRA_SCHEDULE_ADD)}
                        />
                        <SplitButton
                            label={ ("Action")}
                            className="Primary_SplitButton mr-2"
                            model={Actionitems}
                        />

                    </div>

                </div>
            </Card>

            <DataTable
                value={tableData?.slice(first, first + rows)}
                // header={currentMenu?.FUNCTION_DESC}
                showGridlines
                emptyMessage={("No Data found.")}
                globalFilterFields={[
                    "SCHEDULE_NAME", "ASSETS"

                ]}

            >
                <Column
                    header="Schedule Name"
                    body={(rowData) => (
                        <span
                            className="text-[#8e724a] cursor-pointer hover:underline"
                            onClick={() => handleScheduleClick(rowData)}

                        >
                            {rowData?.SCHEDULE_NAME}
                        </span>
                    )}
                />

                <Column
                    header="Equipment"
                    body={(rowData) => {

                        const hasAssets = rowData.ASSETS?.length > 0;
                        const assetNames = rowData.ASSETS?.map((asset: any) => asset.ASSET_NAME).join(", ");
                        return (
                            <div className="flex justify-between items-start">

                                <span className='w-4/5'>{assetNames ?? 'NA'}</span>


                                <Button
                                    icon={hasAssets ? "pi pi-pencil" : "pi pi-plus"}
                                    className="p-button-sm p-button-text ml-2 mt-1 w-1/5"
                                    label={hasAssets ? "Edit Equipment" : "Add Equipment"}// optional: remove if you want icons only

                                    onClick={() => handleEquipmentClick(rowData, hasAssets)}

                                />
                            </div>
                        );
                    }}
                />



                <Column
                    key={""}
                    className="w-28"
                    field={""}
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

            </DataTable>
            <Paginator
                first={first}
                rows={rows}
                totalRecords={tableData?.length}
                onPageChange={onPageChange}
                currentPageReportTemplate="Items per Page:-"
                rowsPerPageOptions={[15, 25, 50]}
                alwaysShow={false}
                template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
            ></Paginator>

            <Dialog
                header="Bulk Upload"
                visible={visible}
                style={{ width: "30vw" }}
                onHide={() => setDialogVisible()}
            >
                <div className="bg-regal-red">
                    <FileUpload
                        mode="basic"
                        name="demo[]"
                        accept="xlsx/*"
                        maxFileSize={1000000}
                        className="ml-2 bg-regal-red"
                        onSelect={async (e: any) => {
                            try {
                                const response: any = await readUploadFile(
                                    e,
                                    isfunctionCode ? "AS0012_L" : currentMenu?.FUNCTION_CODE,
                                    setVisible
                                );
                                if (response?.flag || response?.FLAG) {
                                    toast?.success(response?.MSG);
                                    await getAPI();
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
    )


}


export default NewInfraScheduleMaster