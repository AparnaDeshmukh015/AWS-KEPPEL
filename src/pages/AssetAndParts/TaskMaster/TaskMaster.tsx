import { useEffect } from "react";
import Table from "../../../components/Table/Table";
import { callPostAPI } from "../../../services/apis";
import { ENDPOINTS } from "../../../utils/APIEndpoints";
import { useLocation, useOutletContext } from "react-router-dom";
import TableListLayout from "../../../layouts/TableListLayout/TableListLayout";
import { toast } from "react-toastify";
import TaskMasterForm from "./TaskMasterForm";

const UserMaster = (props: any) => {
  let { pathname } = useLocation();
  const [selectedFacility, menuList]: any = useOutletContext();
  const currentMenu = menuList
    ?.flatMap((menu: any) => menu?.DETAIL)
    .filter((detail: any) => detail.URL === pathname)[0];

  const getAPI = async () => {
    try {
      const res = await callPostAPI(
        ENDPOINTS.GET_ASSET_MASTER_LIST,
        null,
        currentMenu?.FUNCTION_CODE
      );
      let updatedInventoryMasterList= formatTaskMasterList(res?.ASSESTMASTERSLIST)
      props?.setData(updatedInventoryMasterList || []);
      localStorage.setItem('currentMenu', JSON.stringify(currentMenu))
    } catch (error: any) {
      toast.error(error);
    }
  };
  const formatTaskMasterList = (list: any) => {
    let taskMasterList = list;
    taskMasterList = taskMasterList.map((element: any) => {
      return {
       ...element,
       ASSET_TYPE:element?.ASSETTYPE === "A" ? "Equipment" : "Soft Service"

      }
    })
   return taskMasterList
   
    }
  useEffect(() => {
    if (currentMenu?.FUNCTION_CODE) {
      (async function () {
        await getAPI()
       })();
    }
  }, [selectedFacility, currentMenu]);


  return !props?.search ? (
    <Table
      tableHeader={{
        headerName: currentMenu?.FUNCTION_DESC,
        search: true,
      }}
      dataKey={currentMenu?.FUNCTION_DESC}
      columnTitle={["ASSETTYPE_NAME", "ASSET_TYPE"]}
      customHeader={["Equipment/Soft Service Type", "Equipment/Soft Service"]}
      columnData={props?.data}
      clickableColumnHeader={["ASSETTYPE_NAME"]}
      // Change as per requirement
      filterFields={["ASSETTYPE_NAME", "ASSET_TYPE"]}
      
      setSelectedData
      isClick={props?.isForm}
      handelDelete={props?.handelDelete}
      getAPI={getAPI}
      deleteURL={ENDPOINTS.DELETE_TASKMASTER}
      DELETE_ID="ASSETTYPE_ID"
    />
  ) : (
    // Change the component
    <TaskMasterForm
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
      {/* Add Above Component  */}
      <UserMaster />
    </TableListLayout>
  );
};

export default Index;
