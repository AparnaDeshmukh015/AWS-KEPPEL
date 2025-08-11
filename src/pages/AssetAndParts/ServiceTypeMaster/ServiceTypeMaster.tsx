import { useEffect } from 'react'
import Table from '../../../components/Table/Table';
import { ENDPOINTS } from '../../../utils/APIEndpoints';
import { callPostAPI } from '../../../services/apis';
import { useLocation, useOutletContext } from 'react-router-dom';
import TableListLayout from '../../../layouts/TableListLayout/TableListLayout'
import { toast } from 'react-toastify';
import ServiceTypeMasterForm from './ServiceTypeMasterForm';

const ServiceTypeMaster = (props: any) => {
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
                columnTitle={["ASSETTYPE_NAME", "ASSETGROUP_NAME", "ACTIVE", "ACTION"]}
                customHeader={["Service Type", "Service Group", "Active", "Action"]}
                columnData={props?.data}
                clickableColumnHeader={["ASSETTYPE_NAME"]}
                filterFields={['ASSETTYPE_NAME', "ASSETGROUP_NAME"]}
                setSelectedData
                isClick={props?.isForm}
                handelDelete={props?.handelDelete}
                getAPI={getAPI}


                deleteURL={ENDPOINTS?.DELETE_ASSETTYPEMASTER}
                DELETE_ID="ASSETTYPE_ID"
            /> :
            // Change the component 
            <ServiceTypeMasterForm
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
            <ServiceTypeMaster />
        </TableListLayout>
    );
}

export default Index