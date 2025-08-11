import { useEffect } from 'react'
import { toast } from 'react-toastify'
import Table from '../../../components/Table/Table'
import { callPostAPI } from '../../../services/apis'
import { ENDPOINTS } from '../../../utils/APIEndpoints'
import { useLocation, useOutletContext } from 'react-router-dom'
import TableListLayout from '../../../layouts/TableListLayout/TableListLayout'
import EventMasterForm from './EventMasterForm'


const EventMaster = (props: any) => {

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
                columnTitle={["EVENT_NAME", "EVENTTYPE_NAME", "FUNCTION_DESCRIPTION", "ACTIVE", "ACTION"]}
                customHeader={["Event Name", "Event Type", "Function Code", "Active", "Action"]}
                columnData={props?.data}
                clickableColumnHeader={["EVENT_NAME"]}
                filterFields={['EVENT_NAME', "EVENTTYPE_NAME", "FUNCTION_DESCRIPTION"]}
                setSelectedData
                isClick={props?.isForm}
                handelDelete={props?.handelDelete}
                getAPI={getAPI}
                deleteURL={ENDPOINTS.DELETE_EVENTMASTER}
                DELETE_ID="EVENT_ID"
            /> :
            <EventMasterForm
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
            <EventMaster />
        </TableListLayout>
    );
}

export default Index