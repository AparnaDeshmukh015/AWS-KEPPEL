import { useEffect } from 'react'
import Table from '../../../components/Table/Table';
import { ENDPOINTS } from '../../../utils/APIEndpoints';
import { callPostAPI } from '../../../services/apis';
import { useLocation, useOutletContext } from 'react-router-dom';
import TableListLayout from '../../../layouts/TableListLayout/TableListLayout'
import { toast } from 'react-toastify';
import RackMasterForm from './RackMasterForm';

const StoreMasterList = (props: any) => {
    let { pathname } = useLocation();
    const [selectedFacility, menuList]: any = useOutletContext();
    const currentMenu = menuList?.flatMap((menu: any) => menu?.DETAIL).filter((detail: any) => detail.URL === pathname)[0]
    const getAPI = async () => {
        try {
            const payload = {
                FORM_TYPE: "LIST",
            }
            const res = await callPostAPI(ENDPOINTS.STOREMASTER_LIST, payload, currentMenu?.FUNCTION_CODE)
            props?.setData(res?.INVENTORYMASTERSLIST || [])
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
                columnTitle={["RACK_NAME", "STORE_NAME", "ACTIVE", "ACTION"]}
                customHeader={["Rack Name", "Store Name", "Active", "Action"]}
                columnData={props?.data}
                clickableColumnHeader={["RACK_NAME"]}
                filterFields={["RACK_NAME", "STORE_NAME", "ACTIVE"]}
                setSelectedData
                isClick={props?.isForm}
                handelDelete={props?.handelDelete}
                getAPI={getAPI}
                deleteURL={ENDPOINTS.DELETE_RACKMASTER}
                DELETE_ID="RACK_ID"
            /> :

            <RackMasterForm
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
            <StoreMasterList />
        </TableListLayout>
    );
}

export default Index