import { useEffect } from 'react'
import Table from '../../../components/Table/Table'
import { callPostAPI } from '../../../services/apis'
import { ENDPOINTS } from '../../../utils/APIEndpoints'
import { useLocation, useOutletContext } from 'react-router-dom'
import TableListLayout from '../../../layouts/TableListLayout/TableListLayout'
import { toast } from 'react-toastify';
import PartMasterForm from './PartMasterForm'

const PartMaster = (props: any) => {

    let { pathname } = useLocation();
    const [selectedFacility, menuList]: any = useOutletContext();
    const currentMenu = menuList?.flatMap((menu: any) => menu?.DETAIL).filter((detail: any) => detail.URL === pathname)[0]
    const getAPI = async () => {
        try {
            const res = await callPostAPI(ENDPOINTS.GET_ASSET_MASTER_LIST, null, currentMenu?.FUNCTION_CODE)
            let updatedPartMasterList = formatPartMasterList(res?.ASSESTMASTERSLIST)
            localStorage.setItem('currentMenu', JSON.stringify(currentMenu))
            props?.setData(updatedPartMasterList || []);
        } catch (error: any) {
            toast.error(error)
        }

    }

    const formatPartMasterList = (list: any) => {
        let PartMasterList = list;
        PartMasterList = PartMasterList.map((element: any) => {
            return {
                ...element,
                MAINTAIN_INVENTORY1: element?.MAINTAIN_INVENTORY === false ? "No" : "Yes"
            }
        })
        return PartMasterList
 
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
                columnTitle={["PART_NAME", "ASSETGROUP_NAME", "ASSETTYPE_NAME", "CURRUNT_STOCK", "MAINTAIN_INVENTORY1", "ACTIVE", "ACTION"]}
                customHeader={["Part Name", "Equipment/Soft Service Group", "Equipment/Soft Service Type", "Current Stock", "Maintain Inventory", "Active", "Action"]}
                columnData={props?.data}
                clickableColumnHeader={["PART_NAME"]}
                filterFields={['PART_NAME', "ASSETGROUP_NAME", "ASSETTYPE_NAME", "CURRUNT_STOCK", "MAINTAIN_INVENTORY1"]}
                isClick={props?.isForm}
                handelDelete={props?.handelDelete}
                getAPI={getAPI}
                deleteURL={ENDPOINTS.DELETE_PARTMASTER}
                DELETE_ID="PART_ID"
                currentMenu={currentMenu}
            /> :
            <PartMasterForm
                headerName={currentMenu?.FUNCTION_DESC}
                setData={props?.setData}
                getAPI={getAPI}
                selectedData={props?.selectedData}
                setSelectedData={props?.setSelectedData}
                isClick={props?.isForm}
                functionCode={currentMenu?.FUNCTION_CODE}
            />

    )
}


const Index: React.FC = () => {
    return (
        <TableListLayout>
            <PartMaster />
        </TableListLayout>
    );
}

export default Index