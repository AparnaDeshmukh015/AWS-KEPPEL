import { useEffect } from 'react'
import { toast } from 'react-toastify'
import Table from '../../../components/Table/Table'
import { callPostAPI } from '../../../services/apis'
import { ENDPOINTS } from '../../../utils/APIEndpoints'
import { useLocation, useOutletContext } from 'react-router-dom'
import TableListLayout from '../../../layouts/TableListLayout/TableListLayout'
import TeamMasterForm from './TeamMasterForm'

const TeamMaster = (props: any) => {
    let { pathname } = useLocation();
    const [selectedFacility, menuList]: any = useOutletContext();
    const currentMenu = menuList?.flatMap((menu: any) => menu?.DETAIL).filter((detail: any) => detail.URL === pathname)[0]
    const getAPI = async () => {
        try {
            const res = await callPostAPI(ENDPOINTS.WEEKOFMASTERLIST, null, currentMenu?.FUNCTION_CODE)
            props?.setData(res?.WORKFORCEMASTERSLIST)
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
                columnTitle={["TEAM_NAME", "ACTIVE", "ACTION"]}
                customHeader={["Team Name", "Active", "Action"]}
                columnData={props?.data}
                clickableColumnHeader={["TEAM_NAME"]}
                filterFields={['TEAM_NAME']}
                setSelectedData
                isClick={props?.isForm}
                handelDelete={props?.handelDelete}
                getAPI={getAPI}
                deleteURL={ENDPOINTS.GET_WORKFORCE_DELETE}
                DELETE_ID="TEAM_ID"
            /> :
            <TeamMasterForm
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
            <TeamMaster />
        </TableListLayout>
    );
}

export default Index