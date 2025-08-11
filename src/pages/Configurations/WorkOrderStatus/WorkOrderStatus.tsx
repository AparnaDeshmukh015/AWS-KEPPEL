import { useEffect } from 'react'
import Table from '../../../components/Table/Table';
import { ENDPOINTS } from '../../../utils/APIEndpoints';
import { callPostAPI } from '../../../services/apis';
import { useLocation, useOutletContext } from 'react-router-dom';
import TableListLayout from '../../../layouts/TableListLayout/TableListLayout'
import { toast } from 'react-toastify';
import WorkOrderStatusForm from './WorkOrderStatusForm';
import {updatedConfigureColor} from '../../../store/configureStatusColor';
import { useDispatch } from 'react-redux';

const WorkOrderStatus = (props: any) => {
    let { pathname } = useLocation();
    const dispatch :any=useDispatch()
    const [selectedFacility, menuList]: any = useOutletContext();
    const currentMenu = menuList?.flatMap((menu: any) => menu?.DETAIL).filter((detail: any) => detail.URL === pathname)[0]
    const getAPI = async () => {
        try {
            const res = await callPostAPI(ENDPOINTS.WORKODRDERTYPE_LIST, null, currentMenu?.FUNCTION_CODE)
            localStorage.setItem("statusColorCode", JSON.stringify(res?.CONFIGURATIONSMASTERSLIST))
            props?.setData(res?.CONFIGURATIONSMASTERSLIST)
            dispatch(updatedConfigureColor(res?.CONFIGURATIONSMASTERSLIST))
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
                columnTitle={["STATUS_DESC", "COLORS",]}
                customHeader={["Status Description", "Color"]}
                columnData={props?.data}
                clickableColumnHeader={["STATUS_DESC"]}
                filterFields={["STATUS_DESC", "COLORS"]}
                setSelectedData
                isClick={props?.isForm}

                handelDelete={props?.handelDelete}
                getAPI={getAPI}
                deleteURL={ENDPOINTS.DELETE_SKILLMASTER}
                DELETE_ID="SKILL_ID"

            /> :

            <WorkOrderStatusForm
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
            {/* Add Above Component  */}
            <WorkOrderStatus />
        </TableListLayout>
    );
}

export default Index