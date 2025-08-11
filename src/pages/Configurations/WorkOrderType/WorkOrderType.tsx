import { useEffect } from 'react'
import Table from '../../../components/Table/Table';
import { ENDPOINTS } from '../../../utils/APIEndpoints';
import { callPostAPI } from '../../../services/apis';
import { useLocation, useOutletContext } from 'react-router-dom';
import TableListLayout from '../../../layouts/TableListLayout/TableListLayout'
import { toast } from 'react-toastify';
import WorkOrderForm from './WorkOrderForm';

const WorkOrderType = (props: any) => {
    let { pathname } = useLocation();
    const [selectedFacility, menuList]: any = useOutletContext();
    const currentMenu = menuList?.flatMap((menu: any) => menu?.DETAIL).filter((detail: any) => detail.URL === pathname)[0]

    const getAPI = async () => {
        try {
            const res = await callPostAPI(ENDPOINTS.WORKODRDERTYPE_LIST, null, currentMenu?.FUNCTION_CODE);
            props?.setData(res?.CONFIGURATIONSMASTERSLIST || [])
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
            <>

                <Table
                    tableHeader={{
                        headerName: currentMenu?.FUNCTION_DESC,
                        search: true
                    }}
                    dataKey={currentMenu?.FUNCTION_DESC}
                    columnTitle={["WO_TYPE_CODE", "WO_TYPE_NAME", "COLORS"]}
                    customHeader={["Type Code", "Description", "Color"]}
                    columnData={props?.data}
                    clickableColumnHeader={["WO_TYPE_CODE"]}
                    filterFields={["WO_TYPE_CODE", "WO_TYPE_NAME", "COLORS"]}
                    setSelectedData
                    isClick={props?.isForm}
                    handelDelete={props?.handelDelete}
                    getAPI={getAPI}
                    deleteURL={ENDPOINTS.DELETE_SKILLMASTER}
                    DELETE_ID="SKILL_ID"
                /> </> :

            <WorkOrderForm
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
            <WorkOrderType />
        </TableListLayout>
    );
}

export default Index