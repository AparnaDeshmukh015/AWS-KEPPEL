import { useEffect, useState } from 'react'
import './Navbar.css'
import { Link, Outlet } from 'react-router-dom';
import 'primeicons/primeicons.css';
import { toast } from "react-toastify";
import { callPostAPI } from '../../services/apis';
import { ENDPOINTS } from '../../utils/APIEndpoints';
import { LOCALSTORAGE } from '../../utils/constants';
import Topbar from './Topbar';
import Navbar from './Navbar';
import LoaderS from '../../components/Loader/Loader';
import IdleTimer from '../../utils/IdealTimer';
const Layout = () => {
  
  const [selectedFacility, setSelectedFacility] = useState(JSON.parse(((localStorage?.getItem(LOCALSTORAGE.FACILITYID)))!) || [])
  const [menuList, setMenuList] = useState([]);
  const [isNavBar, setIsNavBar] = useState(true);
  const[loading, setLoading] =useState<any|null>(false)
  const getMenuListAPI = async () => {
    setLoading(true)
    try {
      const res: any = await callPostAPI(ENDPOINTS.GET_MENU, {IS_MOBILE:0})
     
      setMenuList(res?.MENU_LIST)
      setLoading(false)
    } catch (error: any) {
      setLoading(false)
      toast.error(error)
    }
  }

  const getFacilityListApi = async()=>{
    const res2 = await callPostAPI(ENDPOINTS?.BUILDING_GET, {});
    if (res2?.FLAG === 1) {
      localStorage.setItem(
        LOCALSTORAGE.FACILITY,
        JSON.stringify(res2?.FACILITYLIST)
      );

  }
}
  useEffect(() => {
    getMenuListAPI()
    getFacilityListApi()
  }, [])
  return (
    <>
      {/* <IdleTimer/> */}
      <div className="layout-wrapper layout-content-navbar flex">
        <div className="layout-container">
          <Navbar menuList={menuList} open={isNavBar} setOpen={setIsNavBar} />
          <div
            className={`layout-page ${
              !isNavBar ? "left-container duration-300" : "duration-300"
            }`}
          >
            <Topbar
              selected={selectedFacility}
              setSelected={setSelectedFacility}
            />
            <div className="content-wrapper">
              <>
                {loading  ? (
                  <LoaderS />
                ) : (
                  <div className="grow px-7 py-2 w-full">
                    <Outlet context={[selectedFacility, menuList]} />
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
}
export default Layout;