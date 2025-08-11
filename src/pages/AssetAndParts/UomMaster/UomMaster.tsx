import { useEffect } from 'react'
import { toast } from 'react-toastify';
import Table from '../../../components/Table/Table';
import { ENDPOINTS } from '../../../utils/APIEndpoints';
import { callPostAPI } from '../../../services/apis';
import { useLocation, useOutletContext } from 'react-router-dom';
import TableListLayout from '../../../layouts/TableListLayout/TableListLayout'
import UomMasterForm from './UomMasterForm';

const UomMaster = (props: any) => {
    let { pathname } = useLocation();
    const [selectedFacility, menuList]: any = useOutletContext();
    const currentMenu = menuList?.flatMap((menu: any) => menu?.DETAIL).filter((detail: any) => detail.URL === pathname)[0]
    const getAPI = async () => {
        try {
            const res = await callPostAPI(ENDPOINTS.GET_ASSET_MASTER_LIST, null, currentMenu?.FUNCTION_CODE)
            props?.setData(res?.ASSESTMASTERSLIST || []);
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
                columnTitle={["UOM_NAME", "ACTIVE", "ACTION"]}
                customHeader={["UOM Name", "Active", "Action"]}
                columnData={props?.data}
                clickableColumnHeader={["UOM_NAME"]}
                filterFields={['UOM_NAME']}
                setSelectedData
                isClick={props?.isForm}
                handelDelete={props?.handelDelete}
                getAPI={getAPI}
                deleteURL={ENDPOINTS.DELETE_UOMMASTER}
                DELETE_ID="UOM_ID"
            /> :
            // Change the component 
            <UomMasterForm
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
            {/* Add Above Component  */}
            <UomMaster />
        </TableListLayout>
    );
}

export default Index