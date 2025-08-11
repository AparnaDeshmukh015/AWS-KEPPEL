
import { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";

import "./Navbar.css";

import { Link, NavLink, useNavigate } from "react-router-dom";

import "primeicons/primeicons.css";

import LeftAngle from "../../assest/images/SidebarMenuImg/bxs-chevron-left.png";

import SidebarLogo from "../../assest/images/SidebarMenuImg/klik-plus-fm-logo.svg";

import { useLocation } from "react-router-dom";

import { Tooltip } from "primereact/tooltip";

import { appName } from "../../utils/pagePath";

import Dashboard from "../../pages/Dashboard";
import { callPostAPI } from "../../services/apis";
import { ENDPOINTS } from "../../utils/APIEndpoints";
import { LOCALSTORAGE } from "../../utils/constants";

const Navbar = (props: any) => {



  const [selectedMenu, setSelectedMenu] = useState<string>();

  const { t } = useTranslation();

  const [show, setShow] = useState(true);

  const [activeMenuName, setActiveMenuName] = useState<string | null>(null);

  const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null);

  let { pathname } = useLocation();
  const currentMenu = props?.menuList?.flatMap((menu: any) => menu?.DETAIL)?.filter((detail: any) => detail?.URL === pathname)[0]
  const navigate = useNavigate();

  const [open, setOpen] = useState(true)



  const setHighlighted = (items: any, idx: any, name: string) => {
    const isDashboard = name === "dashboard";
    if (isDashboard === false) {
      setShow(isDashboard);
      setOpen(!open)
      setActiveMenuName(isDashboard ? null : name);

    } else {
      setShow(isDashboard);

      setOpen(!open)

      setActiveMenuName(isDashboard ? null : name);
    }



    // Highlight the module based on pathname

    const currentModule = items?.MODULE_CODE || null;

    const isActive = pathname.includes(currentModule);

    if (isActive) {

      setActiveMenuName(currentModule);

    }

  };



  const setSubHighlighted = (name: string, idxchild: any) => {

    setActiveSubMenu(name);

  };



  const gotToNewPage = (items: any, idx: any, name: string) => {

    const mainList = items.DETAIL?.filter((e: any) => e);

    if (mainList.length > 0) {

      setSelectedMenu(mainList[0].URL);

      navigate(mainList[0].URL);

    }

  };

  const refreshFacility = async () => {
    const res2 = await callPostAPI(ENDPOINTS?.BUILDING_GET, {});
    if (res2?.FLAG === 1) {
      localStorage.setItem(
        LOCALSTORAGE.FACILITY,
        JSON.stringify(res2?.FACILITYLIST)
      );

      navigate(`${appName}/facilitydetail`);
    }
  }

  useEffect(() => {

    // Highlight the correct menu based on the current pathname

    // props?.menuList?.forEach((menu: any) => {

    //   if (menu.DETAIL.some((detail: any) => detail.URL === pathname)) {

    //     setActiveMenuName(menu.MODULE_CODE);

    //     setActiveSubMenu(pathname); // Optionally highlight the submenu

    //   }

    // });
    // refreshFacility()
    if (currentMenu) {
      // refreshFacility()
      setActiveMenuName(currentMenu.MODULE_CODE);
      setActiveSubMenu(pathname); // Optionally highlight the submenu
      setShow(false)
      setOpen(false)
    } else {
      if (pathname === "/dashboard") {
        setShow(true)
        setOpen(true)
      }
    }
  }, [currentMenu, pathname]);




  return (

    <aside

      id="layout-menu"

      className={`${props?.open ? "w-64" : "w-20 hideContainer"} pt-4 duration-300 relative bg-white layout-menu menu-vertical menu bg-menu-theme`}

    >

      <img

        src={LeftAngle}

        alt=""

        className={`absolute cursor-pointer rounded-full z-10  -right-3 top-6 w-8 border-8 bg-8E724A border-f1eee9 ${!props?.open && "rotate-180"

          }`}

        onClick={() => props?.setOpen(!props?.open)}

      />



      <div className="flex gap-x-4 item-center p-5 py-2">

        <img

          src={SidebarLogo}

          alt="KEPPEL CMMS"

          className={`origin-left cursor-pointer duration-300 ${!props?.open && "scale-0"

            }`}

        />

      </div>

      {/* Sidebar Logo and Menu Items */}

      <div className="mt-2">

        <ul className={`${props?.open ? "scrollcontainer" : ""} menu-inner py-1 ps`}>

          <li className={`menu-item w-full ${show ? "active duration-300" : ""}`}>

            <div className="menu-link" onClick={() => setHighlighted(null, null, "dashboard")}>

              <i className="menu-icon pi pi-home"></i>

              <div className="text-truncate" data-i18n="dashboard">

                <Link to={`${appName}/dashboard`}>{t("Dashboard")}</Link>

              </div>

            </div>

          </li>

          {props?.menuList?.map((menu: any, index: any) => (

            <li

              className={`menu-item w-full ${activeMenuName === menu?.MODULE_CODE ? "active" : ""}`}

              key={index}

            >

              <div

                className="menu-link"

                onClick={() => {

                  // setShow(false);







                  setHighlighted(menu, index, menu?.MODULE_CODE);

                  gotToNewPage(menu, index, menu?.MODULE_CODE);

                }}

              >

                <i className={`menu-icon ${menu?.ICON}`}></i>

                <>{show}</>

                <div className={`content-between w-full ${props?.open ? "flex" : "hidden"}`}>

                  <div className="text-truncate">{menu?.MODULE_DESCRIPTION}</div>

                  <i className={`ms-auto mt-1 pi pi-angle-right ${activeMenuName === menu?.MODULE_CODE && open === false && "rotate-90"}`}></i>

                </div>

              </div>

              {menu?.DETAIL && activeMenuName === menu?.MODULE_CODE && open === false && (

                <ul className={`dropdown${activeMenuName === menu?.MODULE_CODE

                  ? "menu-sub"

                  : ""

                  }`}>

                  {menu.DETAIL.map((item: any, subIndex: any) => (

                    <li className={`menu-item ${item.URL === pathname ? "active" : ""}`} key={subIndex}>

                      <NavLink

                        to={item.URL}

                        className="menu-link"

                        onClick={() => {

                          setSubHighlighted(item?.URL, subIndex);

                          setShow(false);

                        }}

                      >

                        <div className={`text-truncate ${activeSubMenu === item?.FUNCTION_DESC ? "Text_Primary font-semibold" : ""}`}>

                          {item.FUNCTION_DESC}

                        </div>

                      </NavLink>

                    </li>

                  ))}

                </ul>

              )}

            </li>

          ))}

          <div className="cover-bar"></div>

        </ul>

      </div>

    </aside>

  );

}

export default Navbar;




