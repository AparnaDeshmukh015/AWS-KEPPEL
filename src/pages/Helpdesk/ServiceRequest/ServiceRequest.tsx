import { useLocation, useOutletContext, useNavigate } from "react-router-dom";
import TableListLayout from "../../../layouts/TableListLayout/TableListLayout";
import ServiceRequestDetailForm from "./ServiceRequestDetailForm";
import { Button } from "primereact/button";
import "../../../components/MultiSelects/MultiSelects.css";
import "../../../components/Table/Table.css";
import InfraServiceRequest from "./InfraServiceRequest";
import ServiceRequestReal from "./ServiceRequestReal";
import WorkOrderMasterInfra from "../Workorder/WorkOrderMasterInfra";

const ServiceRequest = (props: any) => {
  const location :any=useLocation();
  const FACILITY: any = localStorage.getItem("FACILITYID");
  const FACILITYID: any = JSON.parse(FACILITY);
  const {pathname} =useLocation();
  if (FACILITYID) {
    var facility_type: any = FACILITYID?.FACILITY_TYPE;

  }
  const [selectedFacility, menuList]: any = useOutletContext();
  const currentMenu = menuList
    ?.flatMap((menu: any) => menu?.DETAIL)
    ?.filter((detail: any) => detail.URL === pathname)[0];

  return !props?.search ? (
    <>
      <>
        {/* {facility_type === "I" ? */}
        <WorkOrderMasterInfra/>
        {/* :
        <ServiceRequestReal/>
         }  */}
      </>
    </>
  ) : (
    <>{facility_type === "I" ?
      <InfraServiceRequest
      headerName={currentMenu?.FUNCTION_DESC}
      setData={props?.setData}
      // getAPI={getAPI}
      selectedData={props?.selectedData}
      isClick={props?.isForm}
    />
      :<ServiceRequestDetailForm
      headerName={currentMenu?.FUNCTION_DESC}
      setData={props?.setData}
      // getAPI={getAPI}
      selectedData={props?.selectedData}
      isClick={props?.isForm}
    />}
    </>
  );
};

const Index: React.FC = () => {
  return (
    <TableListLayout>
      <ServiceRequest />
    </TableListLayout>
  );
};

export default Index;