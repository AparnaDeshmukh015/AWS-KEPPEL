import React from 'react'

import { useEffect } from "react";
import { toast } from 'react-toastify'
import Table from "../../../components/Table/Table";
import { callPostAPI } from "../../../services/apis";
import { ENDPOINTS } from "../../../utils/APIEndpoints";
import { useLocation, useOutletContext } from "react-router-dom";
import TableListLayout from "../../../layouts/TableListLayout/TableListLayout";
import ReportTemplateForm from './ReportTempateForm';


const ReportTemplate = (props: any) => {
    let { pathname } = useLocation();
    const [selectedFacility, menuList]: any = useOutletContext();
    const currentMenu = menuList?.flatMap((menu: any) => menu?.DETAIL).filter((detail: any) => detail.URL === pathname)[0];
    //const [showLoader, setShowLoader] = useState<boolean>(false);

    const getAPI = async () => {
        try {
            const res = await callPostAPI(ENDPOINTS.getConfigurationsMastersList, null, currentMenu?.FUNCTION_CODE)
            console.log(res, "reslist")
            props?.setData(res?.CONFIGURATIONSMASTERSLIST || []);
            localStorage.setItem('currentMenu', JSON.stringify(currentMenu))
        } catch (error: any) {
            toast.error(error)
        }
    }
    useEffect(() => {
        if (currentMenu?.FUNCTION_CODE) {
            //API Calling Done here
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
                columnTitle={["TEMPLATE_NAME", "ACTIVE"]}
                customHeader={["Template Name", "Active"]}
                columnData={props?.data}
                clickableColumnHeader={["TEMPLATE_NAME"]}
                filterFields={["TEMPLATE_ID", "TEMPLATE_NAME", "REPORT_ID"]}
                setSelectedData
                isClick={props?.isForm}
                handelDelete={props?.handelDelete}
                getAPI={getAPI}
                // deleteURL={ENDPOINTS.DELETE_ASSETGROUPMASTER}
                DELETE_ID="FDD_ID"
            /></>
    ) : (
        <ReportTemplateForm
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
            <ReportTemplate />
        </TableListLayout>
    );
};

export default Index;


// export default ReportTemplate;