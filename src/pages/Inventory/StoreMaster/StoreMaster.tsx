import { useEffect } from 'react'
import Table from '../../../components/Table/Table';
import { ENDPOINTS } from '../../../utils/APIEndpoints';
import { callPostAPI } from '../../../services/apis';
import { useLocation, useOutletContext } from 'react-router-dom';
import TableListLayout from '../../../layouts/TableListLayout/TableListLayout'
import { toast } from 'react-toastify';
import StoreListForm from './StoreMasterForm';

const StoreMasterList = (props: any) => {
    let { pathname } = useLocation();
    const [selectedFacility, menuList]: any = useOutletContext();
    const currentMenu = menuList?.flatMap((menu: any) => menu?.DETAIL).filter((detail: any) => detail.URL === pathname)[0]
    //Changes in API
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
                columnTitle={["STORE_NAME", "LOCATION_NAME", "ACTIVE", "ACTION"]}
                customHeader={["Store Name", "Location Name", "Active", "Action"]}
                columnData={props?.data}
                clickableColumnHeader={["STORE_NAME"]}
                filterFields={["STORE_NAME", "LOCATION_NAME", "ACTIVE"]}
                setSelectedData
                isClick={props?.isForm}
                handelDelete={props?.handelDelete}
                getAPI={getAPI}
                deleteURL={ENDPOINTS.DELETE_STOREMASTER}
                DELETE_ID="STORE_ID"
            /> :
            <StoreListForm
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