import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Table from "../../../components/Table/Table";
import { callPostAPI } from "../../../services/apis";
import { ENDPOINTS } from "../../../utils/APIEndpoints";
import { useLocation, useOutletContext } from "react-router-dom";
import TableListLayout from "../../../layouts/TableListLayout/TableListLayout";
import AssetMasterForm from "./AssetMasterForm";
import LoaderS from "../../../components/Loader/Loader";

const AssetMaster = (props: any) => {
  let { pathname } = useLocation();
  const [selectedFacility, menuList]: any = useOutletContext();
  const [showLoader, setShowLoader] = useState<boolean>(true);
  const currentMenu = menuList
    ?.flatMap((menu: any) => menu?.DETAIL)
    .filter((detail: any) => detail.URL === pathname)[0];
  //API Function
  const getAPI = async () => {
    try {
      // setShowLoader(true);
      const res = await callPostAPI(
        ENDPOINTS.GET_ASSET_MASTER_LIST,
        null,
       "AS007"
      );

      if (res?.FLAG === 1) {
        props?.setData(res?.ASSESTMASTERSLIST || []);
        localStorage.setItem("currentMenu", JSON.stringify(currentMenu));
        setShowLoader(false);
      } else {
        setShowLoader(false);
        props?.setData([]);
      }
    } catch (error: any) {
      toast?.error(error);
      
    }
  };
  useEffect(() => {
    if (currentMenu?.FUNCTION_CODE) {
      getAPI();
    }
  }, [selectedFacility, currentMenu]);
  return !props?.search ? (
    <>
     
        <Table
          tableHeader={{
            headerName: currentMenu?.FUNCTION_DESC,
            search: true,
          }}
          dataKey={currentMenu?.FUNCTION_DESC}
          columnTitle={[
            "ASSET_NAME",
            "ASSETTYPE_NAME",
            "LOCATION_NAME",
            "ACTIVE",
            "ACTION",
          ]}
          customHeader={[
            "Equipment Name",
            "Equipment Type",
            "Location",
            "Active",
            "Action",
          ]}
          clickableColumnHeader={["ASSET_NAME"]}
          filterFields={["ASSET_NAME", "ASSETTYPE_NAME", "LOCATION_NAME"]}
          deleteURL={ENDPOINTS.DELETE_ASSETMASTER}
          DELETE_ID="ASSET_ID"
          getAPI={getAPI}
          columnData={props?.data}
          isClick={props?.isForm}
          handelDelete={props?.handelDelete}
        />
     
    </>
  ) : (
    <AssetMasterForm
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
      <AssetMaster />
    </TableListLayout>
  );
};

export default Index;
