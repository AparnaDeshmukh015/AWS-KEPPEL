import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import Table from '../../../components/Table/Table';
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
import { InputIcon } from 'primereact/inputicon';
// import "../../../components/Table/Table.css";
import "../../../components/Table/Table.css";
// import "../Input/Input.css";
import "../../../components/Input/Input.css";
import { PATH } from '../../../utils/pagePath';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import MultiSelects from '../../../components/MultiSelects/MultiSelects';
import Select from "../../../components/Dropdown/Dropdown";



import Field from '../../../components/Field';
import { set, useForm } from 'react-hook-form';
interface ActionData {
    ACTION_ID: number;
    ACTION_DESC: string;
    ACTIVITY_ACTION_DESC: string;
    STATUS_CODE: number;
    STATUS_DESC: string;
    SUB_STATUS_CODE: number;
    SUB_STATUS_DESC: string;
    ACTIVITY_SUBSTATUS_DESC: string;
    ACTION_PERFORM_BY: string;
}


const statusListoption = [
    {
        STATUS_CODE: 32,
        STATUS_DESC: "Pending Closure"

    },
    {
        STATUS_CODE: 31,
        STATUS_DESC: "Closed"
    }
]
const UserActionMaster = (props: any) => {
    let { pathname } = useLocation();
    const [selectedFacility, menuList]: any = useOutletContext();
    let [tableData, setTableData] = useState<any>();
    const navigate: any = useNavigate();
    const [originalTableData, setOriginalTableData] = useState<any[]>([]);
    let [roletypeOptions, setRoletypeOptions] = useState([]);
    const currentMenu = menuList?.flatMap((menu: any) => menu?.DETAIL).filter((detail: any) => detail.URL === pathname)[0]
    //API calling Done here
    const getAPI = async () => {
        try {
            const res = await callPostAPI(ENDPOINTS.getConfigurationsMastersList, null, currentMenu?.FUNCTION_CODE)
            // const filterUser = res?.USER_SKILL_LIST?.filter((skillList: any) => skillList?.SKILL_NAME !== "")
            props?.setData(res?.CONFIGURATIONSMASTERSLIST || [])
            setOriginalTableData(res?.CONFIGURATIONSMASTERSLIST || [])
            setTableData(res?.CONFIGURATIONSMASTERSLIST || [])
            localStorage.setItem('currentMenu', JSON.stringify(currentMenu))
        } catch (error: any) {
            toast.error(error)
        }
    }
    const getOptions = async () => {
        const payload = {
            NEW_USER_ID: 0,
            FUNCTION_CODE: currentMenu?.FUNCTION_CODE
        };
        const excludedCodes = ["BM", "O", "SM", "TL"];
        const res = await callPostAPI(ENDPOINTS.GETROLETYPE, payload);
        const filteredList = res?.ROLETYPEMASTERLIST.filter(
            (role: any) => !excludedCodes.includes(role.ROLETYPE_CODE)
        );

        console.log(filteredList, "filteredList")
        if (filteredList?.length > 0) {
            setRoletypeOptions(filteredList);
        }


    };
    const filterDefaultValues: any = {
        ACTION_ID: { value: null, matchMode: FilterMatchMode.CONTAINS },
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        ACTIVITY_ACTION_DESC: { value: null, matchMode: FilterMatchMode.IN },
        STATUS_DESC: { value: null, matchMode: FilterMatchMode.IN },
        ACTIVITY_SUBSTATUS_DESC: { value: null, matchMode: FilterMatchMode.IN },
        ACTION_PERFORM_BY: { value: null, matchMode: FilterMatchMode.IN },

    };

    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(15);
    const [globalFilterValue, setGlobalFilterValue] = useState("");
    const [filters, setFilters] = useState(filterDefaultValues);
    const [selectedRow, setSelectedRow] = useState<ActionData>();
    const [isDialogVisible, setIsDialogVisible] = useState(false);
    const [editedValue, setEditedValue] = useState<string[]>([]);

    const [pendingClosureEdit, setPendingClosureEdit] = useState(false);

    const onPageChange = (event: any) => {
        setFirst(event.first);
        setRows(event.rows);
    };

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
            ACTION_ID: null,

            PARA: { "para1": `${props?.FUNCTION_DESC}`, "para2": ('Updated') },



            ROLETYPE_LIST: null,
            STATUS_CODE: null
        },
        mode: "onSubmit",
    });


    const onSubmit = async (payload: any) => {
        if (pendingClosureEdit) {
            payload.STATUS_CODE = payload?.STATUS_CODE?.STATUS_CODE
            delete payload?.ROLETYPE_LIST
        } else {
            delete payload?.STATUS_CODE
        }
        payload.ACTION_ID = selectedRow?.ACTION_ID;

        try {
            const res = await callPostAPI(ENDPOINTS.USER_ACTION_STATUS, payload);

            if (res?.FLAG === true) {
                toast?.success(res?.MSG);
                setIsDialogVisible(false);
                setPendingClosureEdit(false)
                setGlobalFilterValue("")
                await getAPI()

            } else {
                toast?.error(res?.MSG);
            }
        } catch (error: any) {
            toast?.error(error);
        } finally {

        }
    };


    useEffect(() => {
        if ((!isSubmitting && Object?.values(errors)[0]?.type === "required") || (!isSubmitting && Object?.values(errors)[0]?.type === "validate")) {
            const check: any = Object?.values(errors)[0]?.message;
            toast?.error((check));
        }
    }, [isSubmitting]);

    useEffect(() => {
        if (currentMenu?.FUNCTION_CODE) {
            (async function () {
                await getAPI()
                await getOptions()
            })();
        }

    }, [selectedFacility, currentMenu])
    const onGlobalFilterChange = (e: any) => {
        const value = e.target.value?.toLowerCase();
        setGlobalFilterValue(value);
        if (value === "") {

            setTableData(originalTableData);
        } else {

            const filteredData = originalTableData?.filter((item: any) => {
                // console.log(item, "item")
                console.log(value, "value")
                return (
                    item.ACTION_ID?.toString().toLowerCase().includes(value) ||
                    item.ACTIVITY_ACTION_DESC?.toString().toLowerCase().includes(value) ||
                    item.STATUS_DESC?.toString().toLowerCase().includes(value) ||
                    item.ACTIVITY_SUBSTATUS_DESC?.toString().toLowerCase().includes(value) ||
                    item.ACTION_PERFORM_BY?.toString().toLowerCase().includes(value)
                );
            });
            console.log(filteredData, "filteredData")
            setTableData(filteredData);
        }

    };

    useEffect(() => {
        if (selectedRow && editedValue !== undefined && !pendingClosureEdit) {
            const filteredList: any = roletypeOptions.filter((role: any) =>
                editedValue?.map((value: any) => value?.trim())?.includes(role?.ROLETYPE_NAME)
            );

            if (filteredList) {
                setValue("ROLETYPE_LIST", filteredList);
            }
        }

        if (pendingClosureEdit && selectedRow !== undefined) {
            const selecteddata: any = statusListoption?.filter((f: any) => f?.STATUS_CODE === selectedRow?.SUB_STATUS_CODE)
            setValue("STATUS_CODE", selecteddata[0])
        }
    }, [selectedRow, pendingClosureEdit, isDialogVisible])

    const handleCancelEdit = () => {
        setIsDialogVisible(false); // Close the dialog
        setPendingClosureEdit(false)
        reset(); // Optional: reset input
    };
    useEffect(() => {
        if (tableData) {
            setTableData(tableData);
        }
    }, [filters, tableData, globalFilterValue]);
    return (
        !props?.search ?
            <>
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
                        </div>

                    </div>
                </Card>
                <DataTable
                    value={tableData?.slice(first, first + rows)}
                    // header={currentMenu?.FUNCTION_DESC}
                    showGridlines
                    emptyMessage={("No Data found.")}
                    globalFilterFields={[
                        "ACTION_ID",
                        "ACTIVITY_ACTION_DESC",
                        "STATUS_DESC",
                        "ACTIVITY_SUBSTATUS_DESC",
                        "ACTION_PERFORM_BY"
                    ]}

                >
                    <Column
                        field="ACTION_ID"
                        header="Action Id"

                    ></Column>
                    <Column
                        field="ACTIVITY_ACTION_DESC"

                        header="Action Description"

                    ></Column>
                    <Column
                        field="STATUS_DESC"
                        header="Status"

                    ></Column>


                    <Column
                        field="ACTIVITY_SUBSTATUS_DESC"
                        header="Substatus"
                        body={(rowData) => (


                            rowData?.ACTION_ID === 133 ? <div style={{ display: 'flex', alignItems: 'center' }}>
                                <span>{rowData.ACTIVITY_SUBSTATUS_DESC}</span>
                                <Button
                                    icon="pi pi-pencil"
                                    className="p-button-text p-button-sm"
                                    style={{ marginLeft: '7px', }}
                                    onClick={() => {
                                        setSelectedRow(rowData);
                                        setEditedValue(rowData.ACTION_PERFORM_BY?.split(","));
                                        setIsDialogVisible(true);
                                        setPendingClosureEdit(true)
                                    }}
                                    aria-label="Edit Role"
                                />
                            </div> : <span>{rowData.ACTIVITY_SUBSTATUS_DESC}</span>
                        )}


                    ></Column>
                    <Column
                        field="ACTION_PERFORM_BY"
                        header="Action Perform By Roletype"
                        body={(rowData) => (
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <span>{rowData.ACTION_PERFORM_BY}</span>
                                <Button
                                    icon="pi pi-pencil"
                                    className="p-button-text p-button-sm"
                                    style={{ marginLeft: '7px', }}
                                    onClick={() => {
                                        setSelectedRow(rowData);
                                        setEditedValue(rowData.ACTION_PERFORM_BY?.split(","));
                                        setIsDialogVisible(true);
                                    }}
                                    aria-label="Edit Role"
                                />
                            </div>
                        )}
                    />

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
                    header={pendingClosureEdit ? "Edit substatus" : "Edit Action Perform By"}
                    visible={isDialogVisible}
                    style={{ width: '50vw' }}
                    modal
                    onHide={() => handleCancelEdit()}

                >
                    <form onSubmit={handleSubmit(onSubmit)}>
                        {pendingClosureEdit ?
                            <Field
                                controller={{
                                    name: "STATUS_CODE",
                                    control: control,
                                    render: ({ field }: any) => {
                                        return (
                                            <Select
                                                options={statusListoption}
                                                {...register("STATUS_CODE", {
                                                    required: "Please fill the required fields",

                                                })}
                                                label="Substatus"
                                                require={true}
                                                optionLabel={"STATUS_DESC"}
                                                filter={true}


                                                findKey={"STATUS_CODE"}

                                                setValue={setValue}
                                                // selectedData={selectedDetails?.STATUS_CODE}
                                                invalid={errors.STATUS_CODE}


                                                {...field}

                                            />
                                        );
                                    },
                                }}
                            />
                            :
                            <div >
                                <Field
                                    controller={{
                                        name: "ROLETYPE_LIST",
                                        control: control,
                                        render: ({ field }: any) => {
                                            return (
                                                <MultiSelects
                                                    options={roletypeOptions}
                                                    {...register("ROLETYPE_LIST", {
                                                        required: pendingClosureEdit === false ? "Please fill the required fields." : false,
                                                    })}
                                                    label="Role Type"
                                                    optionLabel="ROLETYPE_NAME"
                                                    findKey={"ROLETYPE_CODE"}
                                                    // selectedData={selectedRow?.ACTION_PERFORM_BY}
                                                    require={true}
                                                    invalid={errors.ROLETYPE_LIST}
                                                    setValue={setValue}
                                                    {...field}
                                                />
                                            );
                                        },
                                    }}
                                />
                            </div>
                        }

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '9rem', }}>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <Button
                                    type="button"
                                    label="Cancel"
                                    className="p-button-text"
                                    onClick={() => {
                                        handleCancelEdit()
                                    }}
                                    style={{ height: '40px', border: '1px solid #E5E4E2', padding: '14px 20px', }}
                                />
                                <Button
                                    type="submit"
                                    label="Save"
                                    // icon="pi pi-check"
                                    className="p-button-text"
                                    style={{ height: '40px', border: '1px solid #E5E4E2', backgroundColor: "#8e724a", color: "white", padding: '14px 20px', }}
                                />
                            </div>

                        </div>
                    </form>
                </Dialog>
            </>

            : <></>

    )
}



const Index: React.FC = () => {
    return (
        <TableListLayout>
            <UserActionMaster />
        </TableListLayout>
    );
}
export default Index
