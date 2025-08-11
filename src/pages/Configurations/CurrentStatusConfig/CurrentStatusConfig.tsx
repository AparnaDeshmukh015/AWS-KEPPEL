import { useEffect } from "react";
import Table from "../../../components/Table/Table";
import { ENDPOINTS } from "../../../utils/APIEndpoints";
import { callPostAPI } from "../../../services/apis";
import { useLocation, useOutletContext } from 'react-router-dom';
import TableListLayout from '../../../layouts/TableListLayout/TableListLayout'
import { toast } from "react-toastify";
import CurrentStatusConfigForm from "./CurrentStatusConfigForm";

const CurrentStatusConfig = (props: any) => {
  let { pathname } = useLocation();
  const [selectedFacility, menuList]: any = useOutletContext();
  const currentMenu = menuList?.flatMap((menu: any) => menu?.DETAIL).filter((detail: any) => detail.URL === pathname)[0]
  const getAPI = async () => {
    try {
      const res = await callPostAPI(
        ENDPOINTS.WORKODRDERTYPE_LIST,
        null,
        currentMenu?.FUNCTION_CODE
      );

      props.setData(res?.CONFIGURATIONSMASTERSLIST || []);
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
        columnTitle={["CS_DESC", "ACTIVE"]}
        customHeader={["Status Description", "Active"]}
        columnData={props?.data}
        clickableColumnHeader={["CS_DESC"]}
        filterFields={["CS_DESC", "ACTIVE"]}
        setSelectedData
        isClick={props?.isForm}
        handelDelete={props?.handelDelete}
        getAPI={getAPI}
        deleteURL={ENDPOINTS.DELETE_CURRENTSTATUS}
        DELETE_ID="CS_ID"
      /> :
      // Change the component 
      <CurrentStatusConfigForm
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
      <CurrentStatusConfig />
    </TableListLayout>
  );
}

export default Index
