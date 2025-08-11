import { useEffect } from "react";
import Table from "../../../components/Table/Table";
import { ENDPOINTS } from "../../../utils/APIEndpoints";
import { callPostAPI } from "../../../services/apis";
import { useLocation, useOutletContext } from 'react-router-dom';
import TableListLayout from '../../../layouts/TableListLayout/TableListLayout'
import { toast } from "react-toastify";
import ActionSetupConfigForm from "./ActionMasterForm";


const ActionSetupConfig = (props: any) => {
  let { pathname } = useLocation();
  const [selectedFacility, menuList]: any = useOutletContext();
  const currentMenu = menuList?.flatMap((menu: any) => menu?.DETAIL).filter((detail: any) => detail.URL === pathname)[0]
  const getAPI = async () => {
   
    try {
      const res = await callPostAPI(
        ENDPOINTS.GETACTIONSTATUSDETAILS,
        null,
        currentMenu?.FUNCTION_CODE
      );
     
      props.setData(res?.ACTION_STATUS_LIST || []);
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
        columnTitle={["ACTION_DESC", "ACTION_DISPLAY_DESC", "ACTION_STATUS_DESC", "ACTION_STATUS_DISPLAY_DESC"]}
        customHeader={["Action Description", "Action Display Description", "Status  Description", "Status Display Description"]}
        columnData={props?.data}
        clickableColumnHeader={["ACTION_DESC"]}
        filterFields={["ACTION_DESC", "ACTION_DISPLAY_DESC", "ACTION_STATUS_DESC", "ACTION_STATUS_DISPLAY_DESC"]}
        setSelectedData
        isClick={props?.isForm}
        handelDelete={props?.handelDelete}
        getAPI={getAPI}
        deleteURL={ENDPOINTS.DELETE_CURRENTSTATUS}
        DELETE_ID="ACTION_ID"
      /> :
      // Change the component 
      <ActionSetupConfigForm
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
      <ActionSetupConfig />
    </TableListLayout>
  );
}

export default Index
