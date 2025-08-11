
import { useLocation, useOutletContext } from "react-router-dom";
import TableListLayout from "../../../layouts/TableListLayout/TableListLayout";
import WorkOrderDetailForm from "./WorkOrderDetailForm";
import InfraWorkOrderForm from "./InfraWorkOrderForm";
import WorkOrderMasterInfra from "./WorkOrderMasterInfra";

const WorkorderMaster = (props: any) => {
  const FACILITY: any = localStorage.getItem("FACILITYID");
  const FACILITYID: any = JSON.parse(FACILITY);

  if (FACILITYID) {
    var facility_type: any = FACILITYID?.FACILITY_TYPE;
  }

  let { pathname } = useLocation();
  const [selectedFacility, menuList]: any = useOutletContext();

  const currentMenu = menuList
      ?.flatMap((menu: any) => menu?.DETAIL)
      .filter((detail: any) => detail.URL === pathname)[0];
      
  return !props?.search ? (
    <>
      <WorkOrderMasterInfra/>
    </>
  ) : (
    <>
      {facility_type === "I" ? (
        <InfraWorkOrderForm
          headerName={currentMenu?.FUNCTION_DESC}
          setData={props?.setData}
          selectedData={props?.selectedData}
          isClick={props?.isForm}
           functionCode={currentMenu?.FUNCTION_CODE}
        />
      ) : (
        <WorkOrderDetailForm
           headerName={currentMenu?.FUNCTION_DESC}
          setData={props?.setData}
          selectedData={props?.selectedData}
          isClick={props?.isForm}
           functionCode={currentMenu?.FUNCTION_CODE}
        />
      )}
    </>
    
  );
};

const Index: React.FC = () => {
  return (
    <TableListLayout>
      <WorkorderMaster />
    </TableListLayout>
  );
};

export default Index;
