import { createBrowserRouter, Navigate } from "react-router-dom";
import { PATH } from "./utils/pagePath";
import ProtectedRoute from "./auth/ProtectedRoute";
import { lazy } from "react";
import { ErrorBoundary, useErrorBoundary } from "react-error-boundary";

//Import Lazy Loading Pages Here
function ErrorFallback({ error }: any) {
  const { resetBoundary } = useErrorBoundary();

  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre style={{ color: "red" }}>{error.message}</pre>
      <button onClick={resetBoundary}>Try again</button>
    </div>
  );
}

const LazyPostLogin = lazy(() => import("./layouts/MainLayout/Layout"));
const LazyLogin = lazy(() => import("./pages/Login/Login"));
const LazyDashboard = lazy(() => import("./pages/Dashboard"));
const LazyUserRoleMaster = lazy(
  () => import("./pages/Users/UserRoleMaster/UserRoleMaster")
);
const LazySkillsMaster = lazy(
  () => import("./pages/Users/SkillsMaster/SkillsMaster")
);
const LazyUserMaster = lazy(
  () => import("./pages/Users/UserMaster/UserMaster")
);
const LazyUserRoleRights = lazy(
  () => import("./pages/Users/UserRoleRights/UserRoleRights")
);
const LazyUserSkillMaster = lazy(
  () => import("./pages/Users/UserSkillMaster/UserSkillMaster")
);
const LazyAddBuilding = lazy(
  () => import("./pages/Building/BuildingSetup/AddBuilding")
);
const LazyBuildingSetUp = lazy(
  () => import("./pages/Building/BuildingSetup/BuildingSet")
);
const LazyAddLocation = lazy(
  () => import("./pages/Building/BuildingSetup/AddLocation")
);
const LazyLocationTypeMaster = lazy(
  () => import("./pages/Building/LocationType/LocationTypeMaster")
);

const LazySeverityMaster = lazy(
  () => import("./pages/Configurations/SeverityMaster/SeverityMaster")
);
const LazyConfigCredentialMaster = lazy(
  () => import("./pages/Configurations/CredentialConfig/CredentialMaster")
);

const LazySaveNumberRangeConfig = lazy(
  () =>
    import("./pages/Configurations/SaveNumberRangeConfig/SaveNumberRangeConfig")
);

const LazyLanguageChange = lazy(
  () => import("./pages/Users/LanguageChange/UserLanguageChange")
);
const LazyMakeMaster = lazy(
  () => import("./pages/AssetAndParts/MakeMaster/MakeMaster")
);
const LazyTaskMaster = lazy(
  () => import("./pages/AssetAndParts/TaskMaster/TaskMaster")
);
const LazyAssetModelMaster = lazy(
  () => import("./pages/AssetAndParts/ModelMaster/ModelMaster")
);
const LazyAssetGroupMaster = lazy(
  () => import("./pages/AssetAndParts/AssetGroupMaster/AssetGroupMaster")
);
const LazyAssetTypeMaster = lazy(
  () => import("./pages/AssetAndParts/AssetTypeMaster/AssetTypeMaster")
);
const LazyServiceTypeMaster = lazy(
  () => import("./pages/AssetAndParts/ServiceTypeMaster/ServiceTypeMaster")
);
const LazyUomMaster = lazy(
  () => import("./pages/AssetAndParts/UomMaster/UomMaster")
);
const LazyWorkOrderType = lazy(
  () => import("./pages/Configurations/WorkOrderType/WorkOrderType")
);
const LazyWorkOrderStatus = lazy(
  () => import("./pages/Configurations/WorkOrderStatus/WorkOrderStatus")
);
const LazyCurrentStatsConfig = lazy(
  () => import("./pages/Configurations/CurrentStatusConfig/CurrentStatusConfig")
);
const LazyStoreMaster = lazy(
  () => import("./pages/Inventory/StoreMaster/StoreMaster")
);
const LazyRackMaster = lazy(
  () => import("./pages/Inventory/RackMaster/RackMaster")
);
const LazyAssetMaster = lazy(
  () => import("./pages/AssetAndParts/AssetMaster/AssetMaster")
);
const LazyPartMaster = lazy(
  () => import("./pages/AssetAndParts/PartMaster/PartMaster")
);
const LazyWeekOFMaster = lazy(
  () => import("./pages/Workforce/WeekOfMaster/WeekOfMaster")
);
const LazyAssetMasterConfiguration = lazy(
  () =>
    import(
      "./pages/Configurations/AssetMasterConfiguration/AssetMasterConfiguration"
    )
);
const LazyReqDescriptionMaster = lazy(
  () =>
    import("./pages/Maintenance/RequestDescription/RequestDescriptionMaster")
);
// const LazyWorkorderMasterMaster = lazy(
//   () => import("./pages/Helpdesk/Workorder/WorkorderMaster")
// );
const LazyWorkorderMasterMaster = lazy(
  () => import("./pages/Helpdesk/Workorder/WorkorderMaster")
);
const LazyVendorMaster = lazy(
  () => import("./pages/Inventory/VendorMaster/VendorMaster")
);

//const LazyVendorContractmaster = lazy(() =>import("./pages/Inventory/VendorMaster/VendorContract"))
const LazyVendorManagement = lazy(
  () => import("./pages/Inventory/VendorMaster/VendorManagement")
);
const LazyVendorSorComparision = lazy(
  () => import("./pages/Inventory/VendorMaster/VendorSorCompare")
);
const LazyServiceMaster = lazy(
  () => import("./pages/AssetAndParts/ServiceMaster/ServiceMaster")
);
const LazyTeamMaster = lazy(
  () => import("./pages/Workforce/TeamMaster/TeamMaster")
);
const LazyEventMaster = lazy(
  () => import("./pages/Helpdesk/Event/EventMaster")
);
const LazyEscalationMatrix = lazy(
  () => import("./pages/Helpdesk/EscalationMatrix/EscalationMatrix")
);
const LazyPPMSchedule = lazy(
  () => import("./pages/Maintenance/PPMSchedule/PPMSchedule")
);
const LazyInfraPPMSchedule = lazy(
  () => import("./pages/Maintenance/PPMSchedule/InfraNewPPMSchedule")
);
const LazyMaterialRequest = lazy(
  () => import("./pages/Inventory/MaterialRequest/MaterialRequest")
);
const LazyIssueMaterial = lazy(
  () => import("./pages/Inventory/IssueMaterial/IssueMaterial")
);
const LazyReturnMaterial = lazy(
  () => import("./pages/Inventory/ReturnMaterial/ReturnMaterial")
);
const LazyStoreToStore = lazy(
  () => import("./pages/Inventory/StoreToStore/StoreToStoreMaster")
);
const LazyServiceRequest = lazy(
  () => import("./pages/Helpdesk/ServiceRequest/ServiceRequest")
);
const LazyInventoryMaster = lazy(
  () => import("./pages/Inventory/InventoryMaster/InventoryMaster")
);
const LazyPpmScheduleDetails = lazy(
  () => import("./pages/Maintenance/PPMSchedule/PPMScheduleDetails")
);

const LazyInfraPpmScheduleDetails = lazy(
  () => import("./pages/Maintenance/PPMSchedule/InfraPPmScheduleDetails")
);
const LazyAssetScheduleMaster = lazy(
  () => import("./pages/AssetAndParts/AssetScheduleMaster/AssetScheduleMaster")
);
const LazyMaterialRequestProvision = lazy(
  () =>
    import(
      "./pages/Inventory/MaterailRequestProvision/MaterialRequestProvision"
    )
);
const LazyAnalyticsPlateformAssetLIST = lazy(
  () =>
    import(
      "./pages/AssetAndParts/AnalyticsPlateformAssetLink/AnalyticsPlateformAssetList"
    )
);
const LazyRectifiedCommentMaster = lazy(
  () =>
    import("./pages/Configurations/RectifyCommentMaster/RectifyCommentMaster")
);

const LazyAnanlyticsFddMaster = lazy(
  () => import("./pages/AssetAndParts/AnanlyticsFddMaster/AnanlyticsFddMaster")
);

const LazyReasonMaster = lazy(
  () => import("./pages/Configurations/ReasonMaster/ReasonMaster")
);

const LazyLogDetails = lazy(
  () => import("./pages/Report/LogDetails/LogDetails")
);

const LazyPageNotFound = lazy(
  () => import("./pages/ErrorComponenet/ErrorPage")
);

const LazyInfraAssetSchedule = lazy(
  () => import("./components/pageComponents/AssetSchedule/InfraAssetSchedule")
);

const LazyAssetHierarchyMaster = lazy(
  () =>
    import(
      "./pages/AssetAndParts/AssetHierarchyMaster/AssetHierarchyMaster"
    )
);
const LazyAssetHierarchyMasterForm = lazy(
  () =>
    import(
      "./pages/AssetAndParts/AssetHierarchyMaster/AssetHierarchyMasterForm"
    )
);
const LazyInfraServiceRequestForm = lazy(
  () => import("./pages/Helpdesk/ServiceRequest/InfraServiceRequest")
);

const LazyActionDetailsMaster = lazy(
  () => import("./pages/Configurations/ActionMaster/ActionMaster")
);
const LazyActionMaster = lazy(
  () => import("./pages/Users/UserActionMaster/UserActionMaster")
);

const LazyPdfReport = lazy(() =>
  import(
    "./pages/Report/PdfReport/PdfReport"));

const LazyReport = lazy(() =>
  import("./pages/Report/ReportList/Report"));

const LazyReportTemplate = lazy(() =>
  import("./pages/Report/ReportTempate/ReportTemplate"));


//Add Custom Paths Here
export const router = createBrowserRouter(
  [
    {
      path: PATH.DEFAULT,
      element: <Navigate to={PATH.LOGIN} replace />,
    },
    {
      path: PATH.LOGIN,
      element: <LazyLogin />,
    },
    {
      path: PATH.PAGE_NOT_FOUND,
      element: <LazyPageNotFound />,
    },
    {
      element: (
        <ProtectedRoute check={"Gawresh"}>
          {/* <ErrorBoundary FallbackComponent={ErrorFallback}> */}
          <LazyPostLogin />
          {/* </ErrorBoundary> */}
        </ProtectedRoute>
      ),
      children: [
        {
          path: PATH.DASHBOARD,
          element: (
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              {" "}
              <LazyDashboard />
            </ErrorBoundary>
          ),
          //  element:<LazyDashboard />
        },
        {
          path: PATH.USERROLEMASTER,
          element: (
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <LazyUserRoleMaster />
            </ErrorBoundary>
          ),
          // element:<LazyUserRoleMaster />
        },
        {
          path: PATH.SKILLMASTER,
          element: (
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <LazySkillsMaster />
            </ErrorBoundary>
          ),
          // element:<LazySkillsMaster />
        },
        {
          path: PATH.USERMASTER,
          element: (
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              {" "}
              <LazyUserMaster />
            </ErrorBoundary>
          ),
        },
        {
          path: PATH.USERROLE_RIGHT,
          element: (
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <LazyUserRoleRights />
            </ErrorBoundary>
          ),
        },
        {
          path: `${PATH.USERSKILLMSATER}`,
          element: (
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              {" "}
              <LazyUserSkillMaster />
            </ErrorBoundary>
          ),
        },
        {
          path: PATH.LANGUAGECHANGE,
          element: (
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <LazyLanguageChange />
            </ErrorBoundary>
          ),
        },
        //Building
        {
          path: PATH.LOCATIONTYPE,
          element: (
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <LazyLocationTypeMaster />
            </ErrorBoundary>
          ),
        },
        {
          path: PATH.ADDBUILDING,
          element: (
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <LazyAddBuilding />
            </ErrorBoundary>
          ),
        },
        {
          path: PATH.BUILDINGSETUP,
          element: (
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <LazyBuildingSetUp />
            </ErrorBoundary>
          ),
        },
        {
          path: PATH.ADDLOCATION,
          element: (
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <LazyAddLocation />
            </ErrorBoundary>
          ),
        },

        // Asset
        {
          path: PATH.MAKEMASTER,
          element: (
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <LazyMakeMaster />
            </ErrorBoundary>
          ),
        },
        {
          path: PATH.TASKMASTER,
          element: (
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              {" "}
              <LazyTaskMaster />
            </ErrorBoundary>
          ),
        },
        {
          path: PATH.MODELMASTER,
          element: (
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <LazyAssetModelMaster />
            </ErrorBoundary>
          ),
        },
        {
          path: PATH.ASSETGROUPMASTER,
          element: (
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <LazyAssetGroupMaster />
            </ErrorBoundary>
          ),
        },
        {
          path: PATH.SERVICEGROUPMASTER,
          element: (
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <LazyAssetGroupMaster />
            </ErrorBoundary>
          ),
        },
        {
          path: PATH.ASSETTYPEMASTER,
          element: (
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <LazyAssetTypeMaster />
            </ErrorBoundary>
          ),
        },
        {
          path: PATH.SERVICETYPEMASTER,
          element: (
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <LazyServiceTypeMaster />
            </ErrorBoundary>
          ),
        },
        {
          path: PATH.UOMMASTER,
          element: (
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <LazyUomMaster />
            </ErrorBoundary>
          ),
        },
        {
          path: PATH.SEVERITYMASTER,
          element: (
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <LazySeverityMaster />
            </ErrorBoundary>
          ),
        },
        {
          path: PATH.CREDENTIALCONFIGMASTER,
          element: (
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <LazyConfigCredentialMaster />
            </ErrorBoundary>
          ),
        },
        {
          path: PATH.CREDENTIALCONFIGMASTER,
          element: (
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <LazyConfigCredentialMaster />
            </ErrorBoundary>
          ),
        },
        {
          path: PATH.WORKORDERTYPE,
          element: (
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              {" "}
              <LazyWorkOrderType />
            </ErrorBoundary>
          ),
        },
        {
          path: PATH.WORKORDERSTATUS,
          element: (
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <LazyWorkOrderStatus />
            </ErrorBoundary>
          ),
        },
        {
          path: PATH.CURRENTSTATUSCONFIG,
          element: (
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <LazyCurrentStatsConfig />
            </ErrorBoundary>
          ),
        },
        {
          path: PATH.STOREMASTER,
          element: (
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <LazyStoreMaster />
            </ErrorBoundary>
          ),
        },
        {
          path: PATH.RACKMASTER,
          element: (
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <LazyRackMaster />
            </ErrorBoundary>
          ),
        },
        {
          path: PATH.ASSETMASTER,
          element: (
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <LazyAssetMaster />
            </ErrorBoundary>
          ),
        },
        {
          path: PATH.PARTMASTER,
          element: (
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              {" "}
              <LazyPartMaster />
            </ErrorBoundary>
          ),
        },
        {
          path: PATH.WEEKOFMASTER,
          element: (
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <LazyWeekOFMaster />
            </ErrorBoundary>
          ),
        },
        {
          path: PATH.REQDESCRIPTIONMASTER,
          element: (
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <LazyReqDescriptionMaster />
            </ErrorBoundary>
          ),
        },
        {
          path: PATH.WORKORDERMASTER,
          element: (
            // <ErrorBoundary FallbackComponent={ErrorFallback}>
            <LazyWorkorderMasterMaster />
            // </ErrorBoundary>
          ),
        },
        {
          path: PATH.WORKORDERMASTER_DETAILS,
          element: (
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <LazyWorkorderMasterMaster />
            </ErrorBoundary>
          ),
        },
        {
          path: PATH.SAVENUMBERRANGECONFIG,
          element: (
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <LazySaveNumberRangeConfig />
            </ErrorBoundary>
          ),
        },
        {
          path: PATH.ASSETMASTERCONFIGURATION,
          element: (
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <LazyAssetMasterConfiguration />
            </ErrorBoundary>
          ),
        },
        {
          path: PATH.VENDORMASTER,
          element: (
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <LazyVendorMaster />
            </ErrorBoundary>
          ),
        },
        // {
        //   path: PATH.VENDOR_CONTRACT,
        //   element: <ErrorBoundary FallbackComponent={ErrorFallback}><LazyVendorContractmaster /></ErrorBoundary>,
        // },
        // {
        //   path: PATH.VENDOR_CONTRACT,
        //   element: <ErrorBoundary FallbackComponent={ErrorFallback}><LazyVendorContractmaster /></ErrorBoundary>,
        // },
        {
          path: PATH.VENDORMANAGEMENT,
          element: (
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <LazyVendorManagement />
            </ErrorBoundary>
          ),
        },
        {
          path: PATH.VENDORSORCOMPARISION,
          element: (
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <LazyVendorSorComparision />
            </ErrorBoundary>
          ),
        },
        {
          path: PATH.SERVICEMASTER,
          element: (
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <LazyServiceMaster />
            </ErrorBoundary>
          ),
        },
        {
          path: PATH.TEAMMASTER,
          element: (
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <LazyTeamMaster />
            </ErrorBoundary>
          ),
        },
        {
          path: PATH.EVENTMASTER,
          element: (
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <LazyEventMaster />
            </ErrorBoundary>
          ),
        },
        {
          path: PATH.ESCALATIONMATRIX,
          element: (
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <LazyEscalationMatrix />
            </ErrorBoundary>
          ),
        },
        {
          path: PATH.PPMSCHEDULE,
          element: (
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <LazyPPMSchedule />
            </ErrorBoundary>
          ),
        },
        {
          path: PATH.INFRAPPMSCHEDULE,
          element: (
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <LazyInfraPPMSchedule />
            </ErrorBoundary>
          ),
        },
        {
          path: PATH.MATERIALREQUEST,
          element: (
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <LazyMaterialRequest />
            </ErrorBoundary>
          ),
        },
        {
          path: PATH.ISSUEMATERIAL,
          element: (
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <LazyIssueMaterial />
            </ErrorBoundary>
          ),
        },
        {
          path: PATH.RETURNMATERIAL,
          element: (
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <LazyReturnMaterial />
            </ErrorBoundary>
          ),
        },
        {
          path: PATH.STORETOSTORE,
          element: (
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <LazyStoreToStore />
            </ErrorBoundary>
          ),
        },
        {
          path: PATH.SERVICEREQUEST,
          element: (
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              {" "}
              <LazyServiceRequest />
            </ErrorBoundary>
          ),
        },
        {
          path: PATH.INVENTORYMASTER,
          element: (
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <LazyInventoryMaster />{" "}
            </ErrorBoundary>
          ),
        },
        {
          path: PATH.PPMSCHEDULEDETAILS,
          element: (
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <LazyPpmScheduleDetails />
            </ErrorBoundary>
          ),
        },

        {
          path: PATH.INFR_PPMSCHEDULEDETAILS,
          element: (
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <LazyInfraPpmScheduleDetails />
            </ErrorBoundary>
          ),
        },
        {
          path: PATH.ASSETSCHEDULEMASTER,
          element: (
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <LazyAssetScheduleMaster />
            </ErrorBoundary>
          ),
        },
        {
          path: PATH.MATERIALREQUESTPROVISION,
          element: (
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <LazyMaterialRequestProvision />
            </ErrorBoundary>
          ),
        },
        {
          path: PATH.ANALYTICSPLATEFORMASSETLINK,
          element: (
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <LazyAnalyticsPlateformAssetLIST />
            </ErrorBoundary>
          ),
        },
        {
          path: PATH.ANANLYTICSFDD,
          element: (
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <LazyAnanlyticsFddMaster />
            </ErrorBoundary>
          ),
        },
        {
          path: PATH.REASONMASTER,
          element: (
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <LazyReasonMaster />
            </ErrorBoundary>
          ),
        },
        {
          path: PATH.RECTIFIEDCOMMENT,
          element: (
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <LazyRectifiedCommentMaster />
            </ErrorBoundary>
          ),
        },
        {
          path: PATH.LOGDETAILS,
          element: (
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <LazyLogDetails />
            </ErrorBoundary>
          ),
        },
        {
          path: PATH.INFRASCEDULE,
          element: <LazyInfraAssetSchedule />,
        },

        {
          path: PATH.ASSET_HIERARCHY,
          element: <LazyAssetHierarchyMaster />,
        },
        {
          path: PATH.ADD_ASSET_HIERARCHY,
          element: (
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <LazyAssetHierarchyMasterForm />
            </ErrorBoundary>
          ),
        },
        {
          path: PATH.INFRA_SERVICE_REQUEST,
          element: (
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <LazyInfraServiceRequestForm />
            </ErrorBoundary>
          ),
        },

        {
          path: PATH.USER_ACTION_DETAILS,
          element: (
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <LazyActionMaster />
            </ErrorBoundary>
          ),
        },
        {
          path: PATH.ACTION_MASTER,
          element: (
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <LazyActionDetailsMaster />
            </ErrorBoundary>
          ),
        },
        {
          path: PATH.PDF_REPORT,
          element: <LazyPdfReport />,
        },
        {
          path: PATH.REPORT,
          element: <LazyReport />,
        },

        {
          path: PATH.INFRA_REPORT_TEMPLATE,
          element: (
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <LazyReportTemplate />
            </ErrorBoundary>
          ),
        },
      ],
    },

    //  ],)
  ],
  { basename: process.env.REACT_APP_CUSTOM_VARIABLE }
);