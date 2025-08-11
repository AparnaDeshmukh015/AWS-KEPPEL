import { useEffect, useState } from "react";
import "./Navbar.css";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import "primeicons/primeicons.css";
import { toast } from "react-toastify";
import { callPostAPI } from "../../services/apis";
import { ENDPOINTS } from "../../utils/APIEndpoints";
import { dateFormatDropDownList, LOCALSTORAGE } from "../../utils/constants";
import Topbar from "./Topbar";
import Navbar from "./Navbar";
import LoaderS from "../../components/Loader/Loader";
import { encryptData } from "../../utils/encryption_decryption";
import { Card } from "primereact/card";
const Layout = () => {
  const facilityData = JSON.parse(localStorage.getItem(LOCALSTORAGE.FACILITY)!);
  const [selectedFacility, setSelectedFacility] = useState(
    facilityData?.length > 0
      ? JSON.parse(localStorage?.getItem(LOCALSTORAGE.FACILITYID)!)
      : []
  );
  const Currentfacility =
    facilityData?.length > 0
      ? JSON.parse(localStorage.getItem(LOCALSTORAGE.FACILITYID)!)
      : [];

  const [menuList, setMenuList] = useState<any[]>();
  const [isNavBar, setIsNavBar] = useState(true);
  const [loading, setLoading] = useState<any | null>(false);
  const { pathname }: any = useLocation();
  let { search } = useLocation();
  const location = pathname + search;
  const navigate: any = useNavigate();
  const [menuRight, setMenuRight] = useState<boolean>(false);
  const getMenuListAPI = async () => {
    // setLoading(true);

    try {
      const res: any = await callPostAPI(ENDPOINTS.GET_MENU, { IS_MOBILE: 0 });
      if (res && res?.FLAG === 1) {
        // setMenuRight(true);
        const updatedData = res?.MENU_LIST.map((module: any) => {
          if (module.MODULE_CODE === "DYNAM") {
            const newFunction = {
              URL: "/location",
            };

            // Add the new function to the DETAIL array
            module.DETAIL.push(newFunction);
          }
          if (module.MODULE_CODE === "ASSET") {
            const newFunction = {
              URL: "/infraschedule",
            };

            // Add the new function to the DETAIL array
            module.DETAIL.push(newFunction);
          }
          if (module.MODULE_CODE === "ASSET") {
            const newFunction = {
              URL: "/addequipmenthierarch",
            };

            // Add the new function to the DETAIL array
            module.DETAIL.push(newFunction);
          }
          if (module.MODULE_CODE === "REPO") {
            const newFunction = {
              URL: "/pdfreport",
            };

            // Add the new function to the DETAIL array
            module.DETAIL.push(newFunction);
          }
          if (module?.MODULE_CODE === "MAINT") {
            const newFunction = {
              URL: "/ppmscheduledetails",
            };

            // Add the new function to the DETAIL array
            module.DETAIL.push(newFunction);
          }

          if (module?.MODULE_CODE === "MAINT") {
            const newFunction = {
              URL: "/infrappmscheduledetails",
            };

            // Add the new function to the DETAIL array
            module.DETAIL.push(newFunction);
          }

          if (module?.MODULE_CODE === "MAINT") {
            const newFunction = {
              URL: "/servicerequestlist?add=",
            };

            // Add the new function to the DETAIL array
            module.DETAIL.push(newFunction);
          }

          if (module?.MODULE_CODE === "REPO") {
            const newFunction = {
              URL: "/reporttemplateconfig",
            };

            // Add the new function to the DETAIL array
            module.DETAIL.push(newFunction);
          }
          return module;
        });

        setMenuList(updatedData);
        // setLoading(false);
        const isValidURL = res?.MENU_LIST?.some((module: any) =>
          module?.DETAIL?.some((detail: any) => detail?.URL === pathname)
        );

        if (isValidURL) {
          return;
        }
        const isWorkOrderListAvailable = res?.MENU_LIST?.some((module: any) =>
          module?.DETAIL?.some(
            (detail: any) => detail?.URL === "/workorderlist"
          )
        );

        if (isWorkOrderListAvailable) {
          navigate("/workorderlist");
        } else {
          navigate("/servicerequestlist");
        }
      } else {
        setMenuRight(false);
        setMenuList([]);
        // setLoading(false);
        // alert("No rights");
      }
    } catch (error: any) {
      // setLoading(false);
      toast.error(error);
    }
  };

  const getFacilityListApi = async () => {
    try {
      // setLoading(true);
      const res2 = await callPostAPI(ENDPOINTS?.BUILDING_GET, {});
      if (res2?.FLAG === 1) {
        localStorage.setItem(
          LOCALSTORAGE.FACILITY,
          JSON.stringify(res2?.FACILITYLIST)
        );

        let filterDataList: any = res2?.FACILITYLIST?.filter(
          (f: any) => f?.FACILITY_ID === Currentfacility?.FACILITY_ID
        );

        if (filterDataList?.length === 0) {
          localStorage.setItem(
            LOCALSTORAGE.FACILITYID,
            JSON.stringify(res2?.FACILITYLIST[0])
          );

          const Role_Name: any = encryptData(
            JSON.stringify(res2?.FACILITYLIST[0]?.ROLE_NAME)
          );

          localStorage.setItem(LOCALSTORAGE.ROLE_NAME, Role_Name);
          const Role_Id: any = encryptData(
            JSON.stringify(res2?.FACILITYLIST[0]?.ROLE_ID)
          );
          localStorage.setItem(LOCALSTORAGE.ROLE_ID, Role_Id);

          const ISASSIGN: any = encryptData(
            JSON.stringify(res2?.FACILITYLIST[0]?.ISASSIGN)
          );
          localStorage.setItem(LOCALSTORAGE.ISASSIGN, ISASSIGN);

          const REOPEN_ADD: any = encryptData(
            JSON.stringify(res2?.FACILITYLIST[0]?.REOPEN_ADD)
          );
          localStorage.setItem(LOCALSTORAGE.REOPEN_ADD, REOPEN_ADD);

          // localStorage.setItem( LOCALSTORAGE.LANGUAGE,res?.USERLIST[0]?.DEFAULT_LANGUAGE);
          const Roletype_Code: any = encryptData(
            JSON.stringify(res2?.FACILITYLIST[0].ROLETYPECODE)
          );
          localStorage.setItem(LOCALSTORAGE.ROLETYPECODE, Roletype_Code);

          const Role_Hierarchy_Id: any = encryptData(
            JSON.stringify(res2?.FACILITYLIST[0].ROLE_HIERARCHY_ID)
          );
          localStorage.setItem(
            LOCALSTORAGE.ROLE_HIERARCHY_ID,
            Role_Hierarchy_Id
          );
        } else {
          const Role_Name: any = encryptData(
            JSON.stringify(filterDataList[0]?.ROLE_NAME)
          );

          localStorage.setItem(LOCALSTORAGE.ROLE_NAME, Role_Name);
          const Role_Id: any = encryptData(
            JSON.stringify(filterDataList[0]?.ROLE_ID)
          );
          localStorage.setItem(LOCALSTORAGE.ROLE_ID, Role_Id);

          const ISASSIGN: any = encryptData(
            JSON.stringify(filterDataList[0]?.ISASSIGN)
          );
          localStorage.setItem(LOCALSTORAGE.ISASSIGN, ISASSIGN);

          const REOPEN_ADD: any = encryptData(
            JSON.stringify(filterDataList[0]?.REOPEN_ADD)
          );
          localStorage.setItem(LOCALSTORAGE.REOPEN_ADD, REOPEN_ADD);

          const Roletype_Code: any = encryptData(
            JSON.stringify(filterDataList[0].ROLETYPECODE)
          );
          localStorage.setItem(LOCALSTORAGE.ROLETYPECODE, Roletype_Code);

          const Role_Hierarchy_Id: any = encryptData(
            JSON.stringify(filterDataList[0]?.ROLE_HIERARCHY_ID)
          );
          localStorage.setItem(
            LOCALSTORAGE.ROLE_HIERARCHY_ID,
            Role_Hierarchy_Id
          );
          const OccupantValidityDate: any = encryptData(
            JSON.stringify(filterDataList[0]?.VALIDITY_DATE)
          );

          localStorage.setItem(
            LOCALSTORAGE.OCCUPANT_VALIDITY,
            OccupantValidityDate
          );
        }
        // setLoading(false);
      }
    } catch (error: any) {
      // setLoading(false);
      toast.error(error);
    } finally {
      // setLoading(false);
    }
  };

  const getConfiguration = async () => {
    try {
      // setLoading(true);
      const res3 = await callPostAPI(
        ENDPOINTS.WORKODRDERTYPE_LIST,
        null,
        "CF003"
      );
      localStorage.setItem(
        "statusColorCode",
        JSON.stringify(res3?.CONFIGURATIONSMASTERSLIST)
      );
    } catch (error: any) {
      // setLoading(false);
      toast.error(error);
    } finally {
      // setLoading(false);
    }
  };

  async function getDashboardMasterDetails() {
    try {
      const res = await callPostAPI(ENDPOINTS.GET_DASHBOARD_MASTER, {}, null);
      const responeDate: any = dateFormatDropDownList(res?.DATEFILTERLIST);
      localStorage.setItem("DateData", JSON.stringify(responeDate));
      // setDateFilterList(responeDate);
    } catch (error: any) {
      toast.error(error);
    }
  }
  useEffect(() => {
    try {
      setLoading(true);
      (async function () {
        await getConfiguration();
        await getDashboardMasterDetails();
        await getFacilityListApi();

        await getMenuListAPI();
      })();
    } catch (error: any) {
      toast.error(error);
    } finally {
      setLoading(false);
    }
  }, [selectedFacility]);
  if (loading) {
    return <LoaderS />;
  }

  return (
    <>
      <div className="layout-wrapper layout-content-navbar flex">
        <div className="layout-container">
          <Navbar
            menuList={menuList}
            open={isNavBar}
            setOpen={setIsNavBar}
            selected={selectedFacility}
          />
          <div
            className={`layout-page ${
              !isNavBar ? "left-container duration-300" : "duration-300"
            }`}
          >
            <Topbar
              selected={selectedFacility}
              setSelected={setSelectedFacility}
              menuList={menuList}
            />
            <div className="content-wrapper">
              <>
                {loading || !menuList ? (
                  <LoaderS />
                ) : (
                  <div className="grow px-5 py-2 w-full">
                    {menuList && menuList?.length > 0 ? (
                      <Outlet context={[selectedFacility, menuList]} />
                    ) : (
                      <Card className="w-full">
                        <div className="text-center ">
                          <h3 className="Text_Main">
                            OOPS
                            <i
                              className="pi pi-exclamation-triangle Text_Maintext-amber-500"
                              style={{ fontSize: "2.5rem" }}
                            ></i>
                          </h3>
                          <h4 className="Text_Secondary">
                            {`You do not have permission to access any page in 
                            ${Currentfacility?.FACILITY_NAME}.`}
                          </h4>
                          <h6 className="Text_Secondary">
                            Please contact your administrator for assistance.
                          </h6>
                        </div>
                      </Card>
                    )}
                  </div>
                )}
              </>

              <footer className="content-footer footer bg-footer-theme">
                <div className="flex flex-wrap justify-between py-2 px-6 flex-md-row flex-column ">
                  <div className="mb-2 mb-md-0">
                    <span className="Text_Secondary">
                      Copyright © 2024{" "}
                      <Link
                        to="https://www.keppel.com"
                        className="footer-link Text_Main font-medium"
                        target="_blank"
                      >
                        Keppel Ltd.
                      </Link>{" "}
                    </span>
                  </div>
                  <div className="d-none d-lg-inline-block">
                    <Link
                      to="https://www.keppel.com/realestate/Privacy-Policy"
                      className="footer-link Text_Main me-4"
                      target="_blank"
                    >
                      Privacy Policy
                    </Link>
                    <Link
                      to="https://www.keppel.com/realestate/Terms-and-Conditions"
                      className="footer-link Text_Main"
                      target="_blank"
                    >
                      Terms and Conditions
                    </Link>
                  </div>
                </div>
              </footer>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default Layout;
