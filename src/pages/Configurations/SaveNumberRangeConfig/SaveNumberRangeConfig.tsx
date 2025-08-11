import { useEffect, useState } from 'react'
import Table from '../../../components/Table/Table';
import { ENDPOINTS } from '../../../utils/APIEndpoints';
import { callPostAPI } from '../../../services/apis';
import { useLocation, useOutletContext } from 'react-router-dom';
import { toast } from 'react-toastify';
import SaveNumberRangeConfigForm from './SaveNumberRangeConfigForm';
import TableListLayout from '../../../layouts/TableListLayout/TableListLayout';

const SaveNumberRangeConfig = (props: any) => {
    let { pathname } = useLocation();
    const [selectedFacility, menuList]: any = useOutletContext();
    const currentMenu = menuList?.flatMap((menu: any) => menu?.DETAIL).filter((detail: any) => detail.URL === pathname)[0]
    const getAPI = async () => {
        try {
            const res = await callPostAPI(ENDPOINTS.getConfigurationsMastersList, {}, currentMenu?.FUNCTION_CODE)
            props?.setData(res?.CONFIGURATIONSMASTERSLIST || []);
            localStorage.setItem('currentMenu', JSON.stringify(currentMenu))
        } catch (error: any) {
            toast.error(error)
        }
    }
    useEffect(() => {
        if (currentMenu?.FUNCTION_CODE) {
            getAPI()
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
                columnTitle={["DOC_DESC", "DOC_TYPE"]}
                customHeader={["Document Description", "Document Type",]}
                columnData={props?.data}
                clickableColumnHeader={["DOC_DESC"]}
                filterFields={["DOC_DESC", "DOC_TYPE"]}
                setSelectedData
                isClick={props?.isForm}
                handelDelete={props?.handelDelete}
                getAPI={getAPI}
                deleteURL={ENDPOINTS.DELETE_SKILLMASTER}
                DELETE_ID="SKILL_ID"
            /> :
            <SaveNumberRangeConfigForm
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
            <SaveNumberRangeConfig />
        </TableListLayout>
    );
}

export default Index