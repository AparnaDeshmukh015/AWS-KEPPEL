import { useEffect } from "react";
import Table from "../../../components/Table/Table";
import { ENDPOINTS } from "../../../utils/APIEndpoints";
import { callPostAPI } from "../../../services/apis";
import { useLocation, useOutletContext } from "react-router-dom";
import TableListLayout from "../../../layouts/TableListLayout/TableListLayout";
import { toast } from "react-toastify";
import InventoryMasterForm from "./InventoryMasterForm";
const InventoryMaster = (props: any) => {
  let { pathname } = useLocation();
  const [selectedFacility, menuList]: any = useOutletContext();
  const currentMenu = menuList
    ?.flatMap((menu: any) => menu?.DETAIL)
    .filter((detail: any) => detail.URL === pathname)[0];
  //Changes in API
  const getAPI = async () => {
    try {
      const payload = {
        FORM_TYPE: "LIST",
      };
      const res = await callPostAPI(
        ENDPOINTS.GETINVENTORYMASTERSLIST,
        null,
        currentMenu?.FUNCTION_CODE
      );
      props?.setData(res?.INVENTORYMASTERSLIST || []);
      localStorage.setItem('currentMenu', JSON.stringify(currentMenu))
    } catch (error: any) {
      toast.error(error);
    }
  };
  useEffect(() => {
    if (currentMenu?.FUNCTION_CODE) {
      getAPI();
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
        "VENDOR_NAME",
        "BILL_NO",
        "CNCL_IND",
      ]}
      customHeader={[
        "Doc No",
        "Doc Date",
        "Store Name",
        "Vendor Name",
        "Bill No",
        "Status",
      ]}
      columnData={props?.data}
      clickableColumnHeader={["DOC_NO"]}
      filterFields={["DOC_NO", "STORE_NAME", "VENDOR_NAME", "BILL_NO", "CNCL_IND"]}
      setSelectedData={"E"}
      isClick={props?.isForm}
      handelDelete={props?.handelDelete}
      getAPI={getAPI}
      deleteURL={ENDPOINTS.DELETE_RACKMASTER}
      DELETE_ID="DOC_NO"
    />
  ) : (
    <InventoryMasterForm
      headerName={"Inventory Master"}
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
      <InventoryMaster />
    </TableListLayout>
  );
};

export default Index;
