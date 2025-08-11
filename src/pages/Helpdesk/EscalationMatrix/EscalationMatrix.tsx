import { useEffect } from 'react'
import { toast } from 'react-toastify'
import Table from '../../../components/Table/Table'
import { callPostAPI } from '../../../services/apis'
import { ENDPOINTS } from '../../../utils/APIEndpoints'
import { useLocation, useOutletContext } from 'react-router-dom'
import TableListLayout from '../../../layouts/TableListLayout/TableListLayout'
import EscalationMatrixForm from './EscalationMatrixForm'

const EscalationMatrix = (props: any) => {

    let { pathname } = useLocation();
    const [selectedFacility, menuList]: any = useOutletContext();
    const currentMenu = menuList?.flatMap((menu: any) => menu?.DETAIL).filter((detail: any) => detail.URL === pathname)[0]
    const getAPI = async () => {
        try {
            const res = await callPostAPI(ENDPOINTS.GET_EVENTMASTER, null, currentMenu?.FUNCTION_CODE)
            props?.setData(res?.HELPDESKMASTERSLIST || []);
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
                columnTitle={["SLA_NAME", "STATUS_DESC_FROM", "STATUS_DESC_TO", "ACTIVE", "ACTION"]}
                customHeader={["SLA Name", "Status From", "Status To", "Active", "Action"]}
                columnData={props?.data}
                clickableColumnHeader={["SLA_NAME"]}
                filterFields={['SLA_NAME', '"STATUS_DESC_FROM', 'STATUS_DESC_TO']}
                setSelectedData
                isClick={props?.isForm}
                handelDelete={props?.handelDelete}
                getAPI={getAPI}
                deleteURL={ENDPOINTS.DELETE_ESCALALTION}
                DELETE_ID="OBJ_ID"
            /> :
            <EscalationMatrixForm
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
            <EscalationMatrix />
        </TableListLayout>
    );
}

export default Index