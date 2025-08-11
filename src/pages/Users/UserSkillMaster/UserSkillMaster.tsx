import { useEffect } from 'react'
import { toast } from 'react-toastify'
import Table from '../../../components/Table/Table';
import { callPostAPI } from '../../../services/apis';
import { ENDPOINTS } from '../../../utils/APIEndpoints';
import { useLocation, useOutletContext } from 'react-router-dom';
import TableListLayout from '../../../layouts/TableListLayout/TableListLayout'
import UserSkillMasterForm from './UserSkillMasterForm';

const SkillsMaster = (props: any) => {
    let { pathname } = useLocation();
    const [selectedFacility, menuList]: any = useOutletContext();
    const currentMenu = menuList?.flatMap((menu: any) => menu?.DETAIL).filter((detail: any) => detail.URL === pathname)[0]
    //API calling Done here
    const getAPI = async () => {
        try {
            const res = await callPostAPI(ENDPOINTS.USERSKILLMASTER, null, currentMenu?.FUNCTION_CODE)
            const filterUser = res?.USER_SKILL_LIST?.filter((skillList: any) => skillList?.SKILL_NAME !== "")
            props?.setData(filterUser || [])
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
                columnTitle={["USER_NAME", "ROLE_NAME", "SKILL_NAME"]}
                customHeader={["User Name", "Role Name", "Skill Name"]}
                columnData={props?.data}
                clickableColumnHeader={["USER_NAME"]}
                filterFields={["USER_NAME", "ROLE_NAME", "SKILL_NAME"]}
                setSelectedData
                isClick={props?.isForm}
                handelDelete={props?.handelDelete}
                getAPI={getAPI}
                deleteURL={ENDPOINTS.DELETE_SKILLMASTER}
                DELETE_ID="SKILL_ID"
            /> :
            // Change the component 
            <UserSkillMasterForm
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
            <SkillsMaster />
        </TableListLayout>
    );
}

export default Index