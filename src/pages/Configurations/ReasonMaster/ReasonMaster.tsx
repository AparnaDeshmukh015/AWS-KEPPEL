import React from 'react'
import { useEffect, useState } from "react";
import { toast } from 'react-toastify'
import Table from "../../../components/Table/Table";
import { callPostAPI } from "../../../services/apis";
import { ENDPOINTS } from "../../../utils/APIEndpoints";
import { useLocation, useOutletContext } from "react-router-dom";
import TableListLayout from "../../../layouts/TableListLayout/TableListLayout";
import ReasonMasterForm from './ReasonMasterForm';
import LoaderS from "../../../components/Loader/Loader";

const ReasonMaster = (props: any) => {
    let { pathname } = useLocation();
    const [selectedFacility, menuList]: any = useOutletContext();
    const currentMenu = menuList?.flatMap((menu: any) => menu?.DETAIL).filter((detail: any) => detail.URL === pathname)[0];
    const [showLoader, setShowLoader] = useState<boolean>(false);

    const getAPI = async () => {
        try {
            const res = await callPostAPI(ENDPOINTS.getConfigurationsMastersList, null, currentMenu?.FUNCTION_CODE)
            props?.setData(res?.CONFIGURATIONSMASTERSLIST || []);
            localStorage.setItem('currentMenu', JSON.stringify(currentMenu))
        } catch (error: any) {
            toast.error(error)
        }
    }
    useEffect(() => {
        if (currentMenu?.FUNCTION_CODE) {
            // API Calling Done here
            getAPI();
        }
    }, [selectedFacility, currentMenu]);

    return !props?.search ? (
        <>
            {showLoader ?
                <><LoaderS /></>
                :
                <Table
                    tableHeader={{
                        headerName: currentMenu?.FUNCTION_DESC,
                        search: true,
                    }}
                    dataKey={currentMenu?.FUNCTION_DESC}
                    columnTitle={["STATUS_DESC", "REASON_DESC", "ACTION"]}
                    customHeader={["Substatus", "Reason"]}
                    columnData={props?.data}
                    clickableColumnHeader={["STATUS_DESC"]}
                    filterFields={["STATUS_DESC", "REASON_DESC"]}
                    setSelectedData
                    isClick={props?.isForm}
                    handelDelete={props?.handelDelete}
                    getAPI={getAPI}
                    deleteURL={ENDPOINTS.DELETE_REASON_MASTER}
                    DELETE_ID="REASON_ID"
                />}
        </>
    ) : (
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
