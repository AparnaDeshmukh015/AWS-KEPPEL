import { useEffect } from 'react'
import Table from '../../../components/Table/Table';
import VendorMasterForm from './VendorMasterForm';
import { ENDPOINTS } from '../../../utils/APIEndpoints';
import { callPostAPI } from '../../../services/apis';
import { useLocation, useOutletContext } from 'react-router-dom';
import { toast } from 'react-toastify';
import TableListLayout from '../../../layouts/TableListLayout/TableListLayout'

const VendorMaster = (props: any) => {
    let { pathname } = useLocation();
    const [selectedFacility, menuList]: any = useOutletContext();
    const currentMenu = menuList?.flatMap((menu: any) => menu?.DETAIL)?.filter((detail: any) => detail.URL === pathname)[0]
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
                columnTitle={["VENDOR_NAME", "VENDOR_CONTACT_PERSON", "VENDOR_PHONE", "VENDOR_EMAIL", "VENDOR_MOBILE", "ACTIVE", "ACTION"]}

                customHeader={["Name", "Contact Person", "Phone No", "Email Id", "Mobile No", "Active", "Action"]}
                columnData={props?.data}
                clickableColumnHeader={["VENDOR_NAME"]}
                filterFields={["VENDOR_NAME", "VENDOR_ADDRESS", "VENDOR_CONTACT_PERSON", "VENDOR_PHONE", "VENDOR_EMAIL", "VENDOR_MOBILE"]}
                setSelectedData
                isClick={props?.isForm}
                handelDelete={props?.handelDelete}
                getAPI={getAPI}
                deleteURL={ENDPOINTS.DELETE_VENDORMASTER}
                DELETE_ID="VENDOR_ID"
            /> :
            // Change the component 
            <VendorMasterForm
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
            <VendorMaster />
        </TableListLayout>
    );
}

export default Index