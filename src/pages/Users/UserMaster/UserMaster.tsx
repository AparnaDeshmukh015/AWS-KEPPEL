import { useEffect } from "react";
import { toast } from "react-toastify";
import Table from "../../../components/Table/Table";
import { callPostAPI } from "../../../services/apis";
import { ENDPOINTS } from "../../../utils/APIEndpoints";
import { useLocation, useOutletContext } from "react-router-dom";
import TableListLayout from "../../../layouts/TableListLayout/TableListLayout";
import UserMasterForm from "./UserMasterForm";

const UserMaster = (props: any) => {
  let { pathname } = useLocation();
  const [selectedFacility, menuList]: any = useOutletContext();
  const currentMenu = menuList
    ?.flatMap((menu: any) => menu?.DETAIL)
    .filter((detail: any) => detail.URL === pathname)[0];
  const getAPI = async () => {
    try {
      const res = await callPostAPI(
        ENDPOINTS.SKILL_MASTER,
        null,
        currentMenu?.FUNCTION_CODE
      );
      props?.setData(res?.USERMASTERLIST || []);
      localStorage.setItem('currentMenu', JSON.stringify(currentMenu))
    } catch (error: any) {
      toast.error(error);
    }
  };

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
      columnTitle={[
        "USER_NAME",
        "ROLE_NAME",
        "USER_EMAILID",
        "USER_MOBILENO",
         "ACTION",
      ]}
      customHeader={["User Name", "User Role", "Email Id", "Mobile",
         "Action"
      ]}
      columnData={props?.data}
      clickableColumnHeader={["USER_NAME"]}
      filterFields={["USER_NAME", "ROLE_NAME", "USER_EMAILID", "USER_MOBILENO",]}
      setSelectedData
      isClick={props?.isForm}
      handelDelete={props?.handelDelete}
      getAPI={getAPI}
      deleteURL={ENDPOINTS?.DELETE_USERMASTER}
      DELETE_ID="USER_ID"
    />
  ) : (
    <UserMasterForm
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
      <UserMaster />
    </TableListLayout>
  );
};
export default Index;
