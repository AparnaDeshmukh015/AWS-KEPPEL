import { useEffect, } from 'react'
import Table from '../../../components/Table/Table';
import WeekOfMasterForm from './WeekOfMasterForm';
import { ENDPOINTS } from '../../../utils/APIEndpoints';
import { callPostAPI } from '../../../services/apis';
import { useLocation, useOutletContext, } from 'react-router-dom';
import TableListLayout from '../../../layouts/TableListLayout/TableListLayout'
import { toast } from 'react-toastify';

const WeekOfMaster = (props: any) => {
    let { pathname } = useLocation();
    const [selectedFacility, menuList]: any = useOutletContext();
    const currentMenu = menuList?.flatMap((menu: any) => menu?.DETAIL).filter((detail: any) => detail.URL === pathname)[0]
    //Changes in API
    const getAPI = async () => {
        try {
            const res = await callPostAPI(ENDPOINTS.WEEKOFMASTERLIST, null, currentMenu?.FUNCTION_CODE)
            props?.setData(res?.WORKFORCEMASTERSLIST)
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
                columnTitle={["WEEKOFF_DESC", "ACTIVE", "ACTION"]}
                customHeader={["Week Off Description", "Active", "Action"]}
                columnData={props?.data}
                clickableColumnHeader={["WEEKOFF_DESC"]}
                filterFields={["WEEKOFF_DESC", "ACTIVE"]}
                setSelectedData
                isClick={props?.isForm}
                handelDelete={props?.handelDelete}
                getAPI={getAPI}
                deleteURL={ENDPOINTS.DELETE_WEEKOFMASTER}
                DELETE_ID="WEEKOFF_ID"
            /> :
            <WeekOfMasterForm
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
            <WeekOfMaster />
        </TableListLayout>
    );
}

export default Index