import { useEffect } from 'react'
import { toast } from 'react-toastify';
import Table from '../../../components/Table/Table';
import { callPostAPI } from '../../../services/apis';
import { ENDPOINTS } from '../../../utils/APIEndpoints';
import { useLocation, useOutletContext } from 'react-router-dom';
import TableListLayout from '../../../layouts/TableListLayout/TableListLayout'
import UserRoleMasterForm from './UserRoleMasterForm';

const UserRoleMaster = (props: any) => {
    let { pathname } = useLocation();
    const [selectedFacility, menuList]: any = useOutletContext();
    const currentMenu = menuList?.flatMap((menu: any) => menu?.DETAIL).filter((detail: any) => detail.URL === pathname)[0]
    //API calling Done here
    const getAPI = async () => {
        try {
            const res = await callPostAPI(ENDPOINTS.SKILL_MASTER, null, currentMenu?.FUNCTION_CODE)
            props?.setData(res?.USERMASTERLIST || []);
            localStorage.setItem('currentMenu', JSON.stringify(currentMenu))
        } catch (error: any) {
            toast.error(error)
        }
    }

    useEffect(() => {
        if (currentMenu?.FUNCTION_CODE) {
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
                columnTitle={["ROLE_NAME", "ROLETYPE_NAME", "FACILITY_GENERIC", "ACTIVE"]}
                customHeader={["User Role", "Role Type", "Building Generic", "Active"]}
                columnData={props?.data}
                clickableColumnHeader={["ROLE_NAME"]}
                filterFields={["ROLETYPE_NAME", "ROLE_NAME", "FACILITY_GENERIC"]}
                setSelectedData
                isClick={props?.isForm}
                handelDelete={props?.handelDelete}
                getAPI={getAPI}
                deleteURL={ENDPOINTS.DELETE_SKILLMASTER}
                DELETE_ID="SKILL_ID"
            /> :
            <UserRoleMasterForm
                headerName={currentMenu?.FUNCTION_DESC}
                setData={props?.setData}
                getAPI={getAPI}
                selectedData={props?.selectedData}
                isClick={props?.isForm}
                functionCode={currentMenu?.FUNCTION_CODE}
                isDisabled={true}
            />

    )
}


const Index: React.FC = () => {
    return (
        <TableListLayout>
            <UserRoleMaster />
        </TableListLayout>
    );
}

export default Index