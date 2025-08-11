import React from 'react'
import { useEffect } from 'react'
import { toast } from 'react-toastify';
import Table from '../../../components/Table/Table';
import { ENDPOINTS } from '../../../utils/APIEndpoints';
import { callPostAPI } from '../../../services/apis';
import { useLocation, useOutletContext } from 'react-router-dom';
import TableListLayout from '../../../layouts/TableListLayout/TableListLayout'
import VendorManagementForm from './VendorManagementForm';
import { decryptData } from '../../../utils/encryption_decryption';
import { onlyDateFormat } from '../../../utils/constants';

const VendorManagement = (props: any) => {
    let { pathname } = useLocation();
    const [selectedFacility, menuList]: any = useOutletContext();
    const currentMenu = menuList?.flatMap((menu: any) => menu?.DETAIL).filter((detail: any) => detail.URL === pathname)[0]
  
    const user_id = decryptData(localStorage.getItem("USER_ID"))
    const facility_id = JSON.parse(localStorage.getItem("FACILITYID") ?? "")
    const payload = {
        USER_ID: user_id,
        FACILITY_ID: facility_id?.FACILITY_ID
    }
    const getAPI = async () => {
        try {
            const res = await callPostAPI(ENDPOINTS.VENDORE_SOR_MANAGEMENTLIST, payload, currentMenu?.FUNCTION_CODE)
            let updatedVendorList = formatVendoreList(res?.VENDORMANAGEMENTMASTERSLIST)
            props?.setData(updatedVendorList || []);
            localStorage.setItem('currentMenu', JSON.stringify(currentMenu))

        } catch (error: any) {
            toast.error(error)
        }
    }



    const formatVendoreList = (list: any) => {
        let updatedVendorList = list;
        updatedVendorList = updatedVendorList.map((element: any) => {
            return {
                ...element,
                SOR_FROM_DATE: onlyDateFormat(element?.SOR_FROM_DATE),
                SOR_TO_DATE: onlyDateFormat(element?.SOR_TO_DATE)
            }
        })
        return updatedVendorList

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
                columnTitle={["SOR_FROM_DATE", "SOR_TO_DATE", "REMARKS",
                    // "ACTIVE", 
                    "ACTION"
                ]}
                customHeader={["From Date", "To Date", "Remarks",
                    //  "Active",
                ]}
                columnData={props?.data}
                clickableColumnHeader={["SOR_FROM_DATE"]}
                filterFields={['REMARKS', "SOR_FROM_DATE", "SOR_TO_DATE"]}
                setSelectedData
                isClick={props?.isForm}
                handelDelete={props?.handelDelete}
                getAPI={getAPI}
            // deleteURL={ENDPOINTS.DELETE_MAKEMASTER}
            // DELETE_ID="MAKE_ID"
            /> :
            <VendorManagementForm
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
            <VendorManagement />
        </TableListLayout>
    );
}

export default Index