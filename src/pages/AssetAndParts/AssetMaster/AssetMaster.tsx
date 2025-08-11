import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Table from "../../../components/Table/Table";
import { callPostAPI } from "../../../services/apis";
import { ENDPOINTS } from "../../../utils/APIEndpoints";
import { useLocation, useOutletContext } from "react-router-dom";
import TableListLayout from "../../../layouts/TableListLayout/TableListLayout";
import AssetMasterForm from "./AssetMasterForm";
import { clearScheduleTaskList } from "../../../store/scheduleTaskListStore";
import { useDispatch } from "react-redux";
import { appName } from "../../../utils/pagePath";
import LoaderFileUpload from "../../../components/Loader/LoaderFileUpload";
import LoaderS from "../../../components/Loader/Loader";
const AssetMaster = (props: any) => {
  const dispatch = useDispatch()
  let { pathname, search, location }: any = useLocation();
  const [selectedFacility, menuList]: any = useOutletContext();
  const[loading, setLoading] = useState<any| null>(false)
  const currentMenu = menuList
    ?.flatMap((menu: any) => menu?.DETAIL)
    .filter((detail: any) => detail.URL === pathname)[0];
  //API Function
  const getAPI = async () => {
    try {
      setLoading(true)
      const res = await callPostAPI(
        ENDPOINTS.GET_ASSET_MASTER_LIST,
        null,
        "AS007"
      );
      
      if (res?.FLAG === 1) {
        props?.setData(res?.ASSESTMASTERSLIST || []);
        localStorage.setItem("currentMenu", JSON.stringify(currentMenu));
           localStorage.removeItem("scheduleId")
        localStorage.removeItem("assetDetails")
         setLoading(false)
      } else {
   setLoading(false)
        props?.setData([]);
      }
    } catch (error: any) {
       setLoading(false)
      toast?.error(error);

    } finally {
      setLoading(false)
    }
  };
  useEffect(() => {
    if (currentMenu?.FUNCTION_CODE) {
      (async function () {
        sessionStorage.removeItem("formData");
        await getAPI()
      })();
    }
  }, [selectedFacility, currentMenu, search]);

  useEffect(() => {
   
    if (search === "" || search === undefined) {
      dispatch(clearScheduleTaskList());
     
    }




  }, [search]);
  return !props?.search ? (
    <>
      {loading ? <LoaderS /> :
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
      }
    </>
  ) : (
    <AssetMasterForm
      headerName={currentMenu?.FUNCTION_DESC}
      setData={props?.setData}
     
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


