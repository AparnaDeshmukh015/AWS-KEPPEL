import { useEffect } from "react";
import Table from "../../../components/Table/Table";
import { ENDPOINTS } from "../../../utils/APIEndpoints";
import { callPostAPI } from "../../../services/apis";
import { useLocation, useOutletContext } from 'react-router-dom';
import TableListLayout from '../../../layouts/TableListLayout/TableListLayout'
import { toast } from "react-toastify";
import SeverityMasterForm from "./SeverityMasterForm";

const UserMaster = (props: any) => {
    let { pathname } = useLocation();
    const priorityIcon:any =[{"ICON_ID":1, "ICON_NAME":"pi pi-angle-down"},
        {"ICON_ID":2, "ICON_NAME":"pi pi-angle-double-up"}, {"ICON_ID":3, "ICON_NAME":"pi pi-equals"}, {"ICON_ID":4, "ICON_NAME":"pi pi-angle-up"}]
    const [selectedFacility, menuList]: any = useOutletContext();
    const currentMenu = menuList?.flatMap((menu: any) => menu?.DETAIL).filter((detail: any) => detail.URL === pathname)[0]
    const getAPI = async () => {
        try {
            const res = await callPostAPI(ENDPOINTS.getConfigurationsMastersList, {}, currentMenu?.FUNCTION_CODE)
            const updateSeverity:any = res?.CONFIGURATIONSMASTERSLIST.map((item:any) => {
                const icon = priorityIcon.filter((icon:any) => icon.ICON_ID === item?.ICON_ID)[0]
                return {
                    ...item,
                    ICON_NAME: icon?.ICON_NAME,
                }
            })
         
            props?.setData(updateSeverity)
            localStorage.setItem('currentMenu', JSON.stringify(currentMenu))
        } catch (error: any) {
            toast.error(error)
        }
    }
  
    useEffect(() => {
        if (currentMenu) {
            (async function () {
                await getAPI()
               })();
        }
    }, [selectedFacility, currentMenu])
    return (
        !props?.search ?
            <Table
                tableHeader={{
                    headerName: currentMenu?.FUNCTION_DESC,
                    search: true
                }}
                dataKey={currentMenu?.FUNCTION_DESC}
                columnTitle={["SEVERITY", "COLORS", "ICON_NAME", "ACTIVE"]}
                customHeader={["Priority", "Color","Icon Name", "Active"]}
                columnData={props?.data}
                clickableColumnHeader={["SEVERITY"]}
                filterFields={['SEVERITY']}
                setSelectedData
                isClick={props?.isForm}
                handelDelete={props?.handelDelete}
                getAPI={getAPI}
                deleteURL={ENDPOINTS.deleteSeverityMaster}
                DELETE_ID="SEVERITY_ID"
            /> :
            // Change the component 
            <SeverityMasterForm
                headerName={currentMenu?.FUNCTION_DESC}
                setData={props?.setData}
                getAPI={getAPI}
                selectedData={props?.selectedData}
                isClick={props?.isForm}
                functionCode={currentMenu?.FUNCTION_CODE}
            />

    )
}


const Index: React.FC = () => {
    return (
        <TableListLayout>
            <UserMaster />
        </TableListLayout>
    );
}

export default Index
