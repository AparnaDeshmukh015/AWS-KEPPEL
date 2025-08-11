import { useEffect } from "react";
import Table from "../../../components/Table/Table";
import { ENDPOINTS } from "../../../utils/APIEndpoints";
import { callPostAPI } from "../../../services/apis";
import { useLocation, useOutletContext } from "react-router-dom";
import TableListLayout from "../../../layouts/TableListLayout/TableListLayout";
import { toast } from "react-toastify";
import MaterialRequestForm from "./MaterialRequestForm";
import { onlyDateFormat } from "../../../utils/constants";

const MaterialRequest = (props: any) => {
  let { pathname } = useLocation();
  const [selectedFacility, menuList]: any = useOutletContext();
  const currentMenu = menuList
    ?.flatMap((menu: any) => menu?.DETAIL)
    .filter((detail: any) => detail.URL === pathname)[0];
  //Changes in API

  const getAPI = async () => {
    try {
      const res = await callPostAPI(
        ENDPOINTS.GETINVENTORYMASTERSLIST,
        null,
        currentMenu?.FUNCTION_CODE
      );


      let updatedMaterialRequestList = formatMaterialRequestList(res?.INVENTORYMASTERSLIST)
      props?.setData(updatedMaterialRequestList || []);
      localStorage.setItem('currentMenu', JSON.stringify(currentMenu))
    } catch (error: any) {
      toast.error(error);
    }
  };
  const formatMaterialRequestList = (list: any) => {
    let MaterialRequestList = list;
    MaterialRequestList = MaterialRequestList.map((element: any) => {
      return {
        ...element,
        MATREQS_DATE: onlyDateFormat(element?.MATREQ_DATE)
      }
    })
    return MaterialRequestList

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
      columnTitle={[
        "MATREQ_NO",
        "MATREQS_DATE",
        "STORE_NAME",
        "USER_NAME",
        "WO_NO",
        "STATUS_DESC",
        // "ACTION",
      ]}
      customHeader={[
        "Request No",
        "MR Date",
        "Store Name",
        "Raised By",
        "Work Order No",
        "Status",
        // "Action",
      ]}
      columnData={props?.data}
      clickableColumnHeader={["MATREQ_NO"]}
      filterFields={["MATREQ_NO", "MATREQS_DATE", "STORE_NAME", "USER_NAME", "WO_NO", "STATUS_DESC"]}
      setSelectedData
      isClick={props?.isForm}
      handelDelete={props?.handelDelete}
      getAPI={getAPI}
      deleteURL={ENDPOINTS.DELETE_RACKMASTER}
      DELETE_ID="MATREQ_NO"
    />
  ) : (
    <MaterialRequestForm
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
      <MaterialRequest />
    </TableListLayout>
  );
};

export default Index;
