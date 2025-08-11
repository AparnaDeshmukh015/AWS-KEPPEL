import { useEffect } from 'react'
import Table from '../../../components/Table/Table';
import { ENDPOINTS } from '../../../utils/APIEndpoints';
import { callPostAPI } from '../../../services/apis';
import { useLocation, useOutletContext } from 'react-router-dom';
import TableListLayout from '../../../layouts/TableListLayout/TableListLayout'
import { toast } from 'react-toastify';
import MaterialRequestForm from '../MaterialRequest/MaterialRequestForm';
//import InventoryMasterForm from './InventoryMasterForm';

const MaterialRequisitionProvision = (props: any) => {
    let { pathname } = useLocation();
    const [selectedFacility, menuList]: any = useOutletContext();
    const currentMenu = menuList?.flatMap((menu: any) => menu?.DETAIL).filter((detail: any) => detail.URL === pathname)[0]
    //Changes in API

    const getAPI = async () => {
        try {

            const res = await callPostAPI(ENDPOINTS.GETINVENTORYMASTERSLIST, null, currentMenu?.FUNCTION_CODE)
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
                columnTitle={["MATREQ_NO", "MATREQ_DATE", "STORE_NAME", "USER_NAME", "WO_NO", "STATUS_DESC"]}
                customHeader={["Request No", "MR Date", "Store Name", "Raised By", "Work Order No", "Status"]}
                columnData={props?.data}
                clickableColumnHeader={["MATREQ_NO"]}
                filterFields={["MATREQ_NO", "MATREQ_DATE", "STORE_NAME", "MATREQ_RAISEDBY", "WO_NO", "STATUS_DESC"]}
                setSelectedData
                isClick={props?.isForm}
                handelDelete={props?.handelDelete}
                getAPI={getAPI}
                deleteURL={ENDPOINTS.DELETE_RACKMASTER}
                DELETE_ID="RACK_ID"
            /> :
            <MaterialRequestForm
                headerName={currentMenu?.FUNCTION_DESC}
                setData={props?.setData}
                getAPI={getAPI}
                selectedData={props?.selectedData}
                isClick={props?.isForm}
            />

    )
}


const Index: React.FC = () => {
    return (
        <TableListLayout>
            <MaterialRequisitionProvision />
        </TableListLayout>
    );
}

export default Index