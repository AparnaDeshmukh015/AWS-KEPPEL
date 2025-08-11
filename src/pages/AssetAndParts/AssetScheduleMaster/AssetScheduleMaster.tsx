import { useEffect } from "react";
import { toast } from "react-toastify";
import Table from "../../../components/Table/Table";
import { callPostAPI } from "../../../services/apis";
import { ENDPOINTS } from "../../../utils/APIEndpoints";
import { useLocation, useOutletContext } from "react-router-dom";
import TableListLayout from "../../../layouts/TableListLayout/TableListLayout";
import AssetScheduleMasterForm from "./AssetScheduleMasterForm";
import InfraAssetSchedule from "../../../components/pageComponents/AssetSchedule/InfraAssetSchedule";
import NewInfraScheduleMaster from "./NewInfraScheduleMaster";

const AssetScheduleMaster = (props: any) => {
  let { pathname } = useLocation();
  const [selectedFacility, menuList]: any = useOutletContext();
  const currentMenu = menuList
    ?.flatMap((menu: any) => menu?.DETAIL)
    .filter((detail: any) => detail.URL === pathname)[0];
  //API Function

  const getAPI = async () => {
    try {
      const res = await callPostAPI(
        ENDPOINTS.GET_ASSET_MASTER_LIST,
        null,
        currentMenu?.FUNCTION_CODE
      );
      props?.setData(res?.ASSESTMASTERSLIST || []);

      localStorage.setItem('currentMenu', JSON.stringify(currentMenu))
    } catch (error: any) {
      toast.error(error);
    }
  };
  const FACILITY: any = localStorage.getItem("FACILITYID");
  const FACILITYID: any = JSON.parse(FACILITY);
  if (FACILITYID) {
    var facility_type: any = FACILITYID?.FACILITY_TYPE;

  }
  useEffect(() => {
    if (currentMenu?.FUNCTION_CODE) {
      (async function () {
        await getAPI()
      })();
    }
  }, [selectedFacility, currentMenu]);
  return !props?.search ? (
    facility_type == "R" ? (
      <Table
        tableHeader={{
          headerName: currentMenu?.FUNCTION_DESC,
          search: true,
        }}
        dataKey={currentMenu?.FUNCTION_DESC}
        columnTitle={["SCHEDULE_NAME", "ACTION"]}
        customHeader={["Schedule Name", "Action"]}
        columnData={props?.data}
        clickableColumnHeader={[""]}
        filterFields={facility_type === "I" ? [""] : ["SCHEDULE_NAME"]}
        isClick={props?.isForm}
        handelDelete={props?.handelDelete}
        getAPI={getAPI}
        deleteURL={ENDPOINTS.DELETE_ASSETTASKANDSCHEDULE}
        DELETE_ID="SCHEDULE_ID"
      />) : (<><NewInfraScheduleMaster /></>)
  )

    : (facility_type === "I" ?
      <InfraAssetSchedule

        headerName={currentMenu?.FUNCTION_DESC}
        setData={props?.setData}
        getAPI={getAPI}
        selectedData={props?.selectedData}
        isClick={props?.isForm}
        functionCode={currentMenu?.FUNCTION_CODE} /> :
      <AssetScheduleMasterForm
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
      <AssetScheduleMaster />
    </TableListLayout>
  );
};

export default Index;
