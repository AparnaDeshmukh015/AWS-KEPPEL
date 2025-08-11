import { useEffect, useState } from "react";
import { toast } from 'react-toastify'
import Table from "../../../components/Table/Table";
import { callPostAPI } from "../../../services/apis";
import { ENDPOINTS } from "../../../utils/APIEndpoints";
import { useLocation, useOutletContext } from "react-router-dom";
import TableListLayout from "../../../layouts/TableListLayout/TableListLayout";
import AssetGroupMasterForm from "./AssetGroupMasterForm";
import LoaderS from "../../../components/Loader/Loader";
const AssetGroupMaster = (props: any) => {
  let { pathname } = useLocation();
  const [selectedFacility, menuList]: any = useOutletContext();
  const currentMenu = menuList?.flatMap((menu: any) => menu?.DETAIL).filter((detail: any) => detail.URL === pathname)[0];
  const [showLoader, setShowLoader] = useState<boolean>(false);

 
  const getAPI = async () => {
    try {
      setShowLoader(true);
      const payload: any = {
        ASSETGROUP_TYPE: currentMenu?.FUNCTION_CODE ===  "AS0011" ? 'N' : 'A'
      }
      const res = await callPostAPI(ENDPOINTS.GET_ASSET_MASTER_LIST, payload, currentMenu?.FUNCTION_CODE);
      if (res?.FLAG === 1) {
        props?.setData(res?.ASSESTMASTERSLIST || []);
        localStorage.setItem('currentMenu', JSON.stringify(currentMenu))
        setShowLoader(false);
      } else {
        setShowLoader(false);
      }

    } catch (error: any) {
      toast?.error(error)
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
    <>
      {showLoader ?
        <><LoaderS /></>
        :
        <Table
          tableHeader={{
            headerName: currentMenu?.FUNCTION_DESC,
            search: true,
          }}
          dataKey={currentMenu?.FUNCTION_DESC}
          columnTitle={["ASSETGROUP_NAME", "ACTIVE", "ACTION"]}
          customHeader={[currentMenu?.FUNCTION_CODE ===  "AS0011"? "Service Group" : "Equipment Group", "Active", "Action"]}
          columnData={props?.data}
          clickableColumnHeader={["ASSETGROUP_NAME"]}
          filterFields={["ASSETGROUP_NAME"]}
          setSelectedData
          isClick={props?.isForm}
          handelDelete={props?.handelDelete}
          getAPI={getAPI}
          deleteURL={ENDPOINTS.DELETE_ASSETGROUPMASTER}
          DELETE_ID="ASSETGROUP_ID"
        />}</>
  ) : (
    <AssetGroupMasterForm
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
      <AssetGroupMaster />
    </TableListLayout>
  );
};

export default Index;
