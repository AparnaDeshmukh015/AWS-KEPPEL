import { useEffect } from "react";
import Table from "../../../components/Table/Table";
import { ENDPOINTS } from "../../../utils/APIEndpoints";
import { callPostAPI } from "../../../services/apis";
import { useLocation, useOutletContext } from "react-router-dom";
import TableListLayout from "../../../layouts/TableListLayout/TableListLayout";
import { toast } from "react-toastify";
import IssueMaterialForm from "./IssueMaterialForm";
import { onlyDateFormat } from "../../../utils/constants";




const IssueMaterial = (props: any) => {
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
      let updatedIssueMasterList = formatIssueMasterList(res?.INVENTORYMASTERSLIST)
      props?.setData(updatedIssueMasterList || []);
      localStorage.setItem('currentMenu', JSON.stringify(currentMenu))
    } catch (error: any) {
      toast.error(error);
    }
  };
  const formatIssueMasterList = (list: any) => {
    let IssueMasterList = list;
    IssueMasterList = IssueMasterList.map((element: any) => {
      return {
        ...element,
        DOC_DATE: onlyDateFormat(element?.DOC_DATE)
      }
    })
    return IssueMasterList

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
        "DOC_NO",
        "DOC_DATE",
        "STORE_NAME",
        "USER_NAME",
        "WO_NO",
        "CNCL_IND",
      ]}
      customHeader={[
        "Doc No",
        "MR Date",
        "Store Name",
        "Raised By",
        "Work Order No",
        "Status",
      ]}
      columnData={props?.data}
      clickableColumnHeader={["DOC_NO"]}
      filterFields={["DOC_NO", "DOC_DATE", "STORE_NAME", "USER_NAME", "WO_NO", "CNCL_IND"]}
      setSelectedData
      isClick={props?.isForm}
      handelDelete={props?.handelDelete}
      getAPI={getAPI}
      deleteURL={ENDPOINTS.DELETE_RACKMASTER}
      DELETE_ID="DOC_NO"
    />
  ) : (

    <IssueMaterialForm
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
      <IssueMaterial />
    </TableListLayout>
  );
};

export default Index;

