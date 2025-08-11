import React from 'react'
import { useEffect } from 'react'
import Table from '../../../components/Table/Table'
import { callPostAPI } from '../../../services/apis'
import { ENDPOINTS } from '../../../utils/APIEndpoints'
import { useLocation, useOutletContext } from 'react-router-dom'
import TableListLayout from '../../../layouts/TableListLayout/TableListLayout'
import { toast } from 'react-toastify'
import ServiceMasterForm from './ServiceMasterForm'
const ServiceMaster = (props: any) => {
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
                columnTitle={["ASSET_NAME", "ASSETTYPE_NAME", "LOCATION_NAME", "ACTIVE", "ACTION"]}
                customHeader={["Service Name", "Service Type", "Location", "Active", "Action"
                ]}
                columnData={props?.data}
                clickableColumnHeader={["ASSET_NAME"]}
                filterFields={['ASSET_NAME', "ASSETTYPE_NAME", "LOCATION_NAME",]}
                setSelectedData
                isClick={props?.isForm}
                handelDelete={props?.handelDelete}
                getAPI={getAPI}
                deleteURL={ENDPOINTS.DELETE_ASSETMASTER}
                DELETE_ID="ASSET_ID"
            /> :
            <ServiceMasterForm
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
            <ServiceMaster />
        </TableListLayout>
    );
}

export default Index