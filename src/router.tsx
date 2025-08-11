import { createBrowserRouter, Navigate } from "react-router-dom";
import { PATH } from "./utils/pagePath";
import ProtectedRoute from "./auth/ProtectedRoute";
import { lazy } from "react";
import { basename } from "path";

//Import Lazy Loading Pages Here

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
    import(
      "./pages/Configurations/RectifyCommentMaster/RectifyCommentMaster"
    )
);


const LazyAnanlyticsFddMaster = lazy(
  () => import("./pages/AssetAndParts/AnanlyticsFddMaster/AnanlyticsFddMaster")
);

const LazyReasonMaster = lazy(
  () => import("./pages/Configurations/ReasonMaster/ReasonMaster")
);
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
      element: <p> Page Not Found </p>,
      path: PATH.PAGE_NOT_FOUND,
    },
    {
      element: (
        <ProtectedRoute check={"Gawresh"}>
          <LazyPostLogin />
        </ProtectedRoute>
      ),
      children: [
        {
          path: PATH.DASHBOARD,
          element: <LazyDashboard />,
        },
        {
          path: PATH.USERROLEMASTER,
          element: <LazyUserRoleMaster />,
        },
        {
          path: PATH.SKILLMASTER,
          element: <LazySkillsMaster />,
        },
        {
          path: PATH.USERMASTER,
          element: <LazyUserMaster />,
        },
        {
          path: PATH.USERROLE_RIGHT,
          element: <LazyUserRoleRights />,
        },
        {
          path: `${PATH.USERSKILLMSATER}`,
          element: <LazyUserSkillMaster />,
        },
        {
          path: PATH.LANGUAGECHANGE,
          element: <LazyLanguageChange />,
        },
        //Building
        {
          path: PATH.LOCATIONTYPE,
          element: <LazyLocationTypeMaster />,
        },
        {
          path: PATH.ADDBUILDING,
          element: <LazyAddBuilding />,
        },
        {
          path: PATH.BUILDINGSETUP,
          element: <LazyBuildingSetUp />,
        },
        {
          path: PATH.ADDLOCATION,
          element: <LazyAddLocation />,
        },

        // Asset
        {
          path: PATH.MAKEMASTER,
          element: <LazyMakeMaster />,
        },
        {
          path: PATH.TASKMASTER,
          element: <LazyTaskMaster />,
        },
        {
          path: PATH.MODELMASTER,
          element: <LazyAssetModelMaster />,
        },
        {
          path: PATH.ASSETGROUPMASTER,
          element: <LazyAssetGroupMaster />,
        },
        {
          path: PATH.SERVICEGROUPMASTER,
          element: <LazyAssetGroupMaster />,
        },
        {
          path: PATH.ASSETTYPEMASTER,
          element: <LazyAssetTypeMaster />,
        },
        {
          path: PATH.SERVICETYPEMASTER,
          element: <LazyServiceTypeMaster />,
        },
        {
          path: PATH.UOMMASTER,
          element: <LazyUomMaster />,
        },
        {
          path: PATH.SEVERITYMASTER,
          element: <LazySeverityMaster />,
        },
        {
          path: PATH.WORKORDERTYPE,
          element: <LazyWorkOrderType />,
        },
        {
          path: PATH.WORKORDERSTATUS,
          element: <LazyWorkOrderStatus />,
        },
        {
          path: PATH.CURRENTSTATUSCONFIG,
          element: <LazyCurrentStatsConfig />,
        },
        {
          path: PATH.STOREMASTER,
          element: <LazyStoreMaster />,
        },
        {
          path: PATH.RACKMASTER,
          element: <LazyRackMaster />,
        },
        {
          path: PATH.ASSETMASTER,
          element: <LazyAssetMaster />,
        },
        {
          path: PATH.PARTMASTER,
          element: <LazyPartMaster />,
        },
        {
          path: PATH.WEEKOFMASTER,
          element: <LazyWeekOFMaster />,
        },
        {
          path: PATH.REQDESCRIPTIONMASTER,
          element: <LazyReqDescriptionMaster />,
        },
        {
          path: PATH.WORKORDERMASTER,
          element: <LazyWorkorderMasterMaster />,
        },
        {
          path: PATH.SAVENUMBERRANGECONFIG,
          element: <LazySaveNumberRangeConfig />,
        },
        {
          path: PATH.ASSETMASTERCONFIGURATION,
          element: <LazyAssetMasterConfiguration />,
        },
        {
          path: PATH.VENDORMASTER,
          element: <LazyVendorMaster />,
        },
        {
          path: PATH.SERVICEMASTER,
          element: <LazyServiceMaster />,
        },
        {
          path: PATH.TEAMMASTER,
          element: <LazyTeamMaster />,
        },
        {
          path: PATH.EVENTMASTER,
          element: <LazyEventMaster />,
        },
        {
          path: PATH.ESCALATIONMATRIX,
          element: <LazyEscalationMatrix />,
        },
        {
          path: PATH.PPMSCHEDULE,
          element: <LazyPPMSchedule />,
        },
        {
          path: PATH.MATERIALREQUEST,
          element: <LazyMaterialRequest />,
        },
        {
          path: PATH.ISSUEMATERIAL,
          element: <LazyIssueMaterial />,
        },
        {
          path: PATH.RETURNMATERIAL,
          element: <LazyReturnMaterial />,
        },
        {
          path: PATH.STORETOSTORE,
          element: <LazyStoreToStore />,
        },
        {
          path: PATH.SERVICEREQUEST,
          element: <LazyServiceRequest />,
        },
        { path: PATH.INVENTORYMASTER, element: <LazyInventoryMaster /> },
        {
          path: PATH.PPMSCHEDULEDETAILS,
          element: <LazyPpmScheduleDetails />,
        },
        {
          path: PATH.ASSETSCHEDULEMASTER,
          element: <LazyAssetScheduleMaster />,
        },
        {
          path: PATH.MATERIALREQUESTPROVISION,
          element: <LazyMaterialRequestProvision />,
        },
        {
          path: PATH.ANALYTICSPLATEFORMASSETLINK,
          element: <LazyAnalyticsPlateformAssetLIST />,
        },
        {
          path: PATH.ANANLYTICSFDD,
          element: <LazyAnanlyticsFddMaster />,
        },
        {
          path: PATH.REASONMASTER,
          element: <LazyReasonMaster />,
        },
        {
          path: PATH.RECTIFIEDCOMMENT,
          element: <LazyRectifiedCommentMaster />,
        },
      ],
    },

      //  ],)
      ], { basename: process.env.REACT_APP_CUSTOM_VARIABLE });