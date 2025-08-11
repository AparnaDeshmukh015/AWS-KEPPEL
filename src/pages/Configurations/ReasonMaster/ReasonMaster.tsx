import React from 'react'
import { useEffect} from "react";
import { toast } from 'react-toastify'
import Table from "../../../components/Table/Table";
import { callPostAPI } from "../../../services/apis";
import { ENDPOINTS } from "../../../utils/APIEndpoints";
import { useLocation, useOutletContext } from "react-router-dom";
import TableListLayout from "../../../layouts/TableListLayout/TableListLayout";
import ReasonMasterForm from './ReasonMasterForm';
import ReasonCommentMasterForm from './ReasonCommentMasterForm';
const ReasonMaster = (props: any) => {
    let { pathname } = useLocation();
    const [selectedFacility, menuList]: any = useOutletContext();
    const currentMenu = menuList?.flatMap((menu: any) => menu?.DETAIL).filter((detail: any) => detail.URL === pathname)[0];
    const FACILITY: any = localStorage.getItem("FACILITYID");
  const FACILITYID: any = JSON.parse(FACILITY);

  if (FACILITYID) {
    var facility_type: any = FACILITYID?.FACILITY_TYPE;

  }
    const getAPI = async () => {
        try {
           let apiURL:any=facility_type === "I" ?ENDPOINTS.GETREASONALLLISTINFRA:ENDPOINTS.getConfigurationsMastersList ;
            const res = await callPostAPI(apiURL, null, currentMenu?.FUNCTION_CODE)

            props?.setData(facility_type === "I"?res?.REASONMASTERSLIST:res?.CONFIGURATIONSMASTERSLIST || []);
            localStorage.setItem('currentMenu', JSON.stringify(currentMenu))
        } catch (error: any) {
            toast.error(error)
        }
    }
    useEffect(() => {
        if (currentMenu?.FUNCTION_CODE) {
            // API Calling Done here
            (async function () {
                await getAPI()
               })();
        }
    }, [selectedFacility, currentMenu]);

    return !props?.search ? (
        <>
            
                <Table
                    tableHeader={{
                        headerName: currentMenu?.FUNCTION_DESC,
                        search: true,
                    }}
                    dataKey={currentMenu?.FUNCTION_DESC}
                    columnTitle={facility_type === "I"?["STATUS_DESC","SUB_STATUS_DESC", "REASON_DESCRIPTION", "ACTIVE"]:["STATUS_DESC", "REASON_DESC", "ACTION"]}
                    customHeader={facility_type === "I"?["Status","Sub Status", "Reason", "ACTIVE"]:["Substatus", "Reason", "Action"]}
                    columnData={props?.data}
                    clickableColumnHeader={["STATUS_DESC"]}
                    filterFields={facility_type === "I"?["STATUS_DESC","SUB_STATUS_DESC", "REASON_DESCRIPTION"]:["STATUS_DESC", "REASON_DESC"]}
                    setSelectedData
                    isClick={props?.isForm}
                    handelDelete={props?.handelDelete}
                    getAPI={getAPI}
                    deleteURL={ENDPOINTS.DELETE_REASON_MASTER}
                    DELETE_ID="REASON_ID"
                />
        </>
    ) : (
        (facility_type === "I") ?<ReasonCommentMasterForm
            headerName={currentMenu?.FUNCTION_DESC}
            setData={props?.setData}
            getAPI={getAPI}
            selectedData={props?.selectedData}
            isClick={props?.isForm}
            functionCode={currentMenu?.FUNCTION_CODE}/>
            :
        <ReasonMasterForm
            headerName={currentMenu?.FUNCTION_DESC}
            setData={props?.setData}
            getAPI={getAPI}
            selectedData={props?.selectedData}
            isClick={props?.isForm}
            functionCode={currentMenu?.FUNCTION_CODE}
        />
    );
};

const Index: React.FC = () => {
    return (
        <TableListLayout>
            <ReasonMaster />
        </TableListLayout>
    );
};

export default Index;
