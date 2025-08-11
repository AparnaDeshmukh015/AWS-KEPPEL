import { useEffect, useState } from "react";
import "./Navbar.css";
import { NavLink, useNavigate } from "react-router-dom";
import "primeicons/primeicons.css";
import LeftAngle from "../../assest/images/SidebarMenuImg/bxs-chevron-left.png";
import SidebarLogo from "../../assest/images/SidebarMenuImg/klik-plus-fm-logo.svg";
import { useLocation } from "react-router-dom";
import { PATH } from "../../utils/pagePath";
import {
  IdealTimeConfiguration,
  COOKIES,
  removeLocalStorage,
} from "../../utils/constants";
import IdleTimer from "../../utils/IdealTimer";
import { Cookies } from "react-cookie";
import { clearFilters } from "../../store/filterstore";
import { useDispatch } from "react-redux";

const Navbar = (props: any) => {
  const [idealTimerStatus, setIdealTimeStatus] = useState<any | null>(false);
  const [show, setShow] = useState(true);
  const [activeMenuName, setActiveMenuName] = useState<string | null>(null);
  const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null);
  const [lastActivityTime, setLastActivityTime] = useState(Date.now());
  let { pathname } = useLocation();
  const currentMenu = props?.menuList
    ?.flatMap((menu: any) => menu?.DETAIL)
    ?.filter((detail: any) => detail?.URL === pathname)[0];

  const hasSerRequest = props?.menuList
    ?.flatMap((menu: any) => menu?.DETAIL || [])
    ?.some((detail: any) => detail?.MODULE_CODE === "SERREQUEST");

  const navigate = useNavigate();
  const [open, setOpen] = useState(true);
  const dispatch: any = useDispatch();
  const setHighlighted = (items: any, idx: any, name: string) => {
    const isDashboard = name === "dashboard";
    if (!isDashboard) {
      setShow(isDashboard);
      setOpen(!open);
      setActiveMenuName(isDashboard ? null : name);
    } else {
      setShow(isDashboard);
      setOpen(!open);
      setActiveMenuName(isDashboard ? null : name);
    }

    // Highlight the module based on pathname

    const currentModule = items?.MODULE_CODE || null;
    const isActive = pathname.includes(currentModule);
    if (isActive) {
      setActiveMenuName(currentModule);
    }
  };

  const setSubHighlighted = (name: string) => {
    setActiveSubMenu(name);
  };

  const gotToNewPage = (items: any) => {
    const mainList = items.DETAIL?.filter((e: any) => e);
    if (mainList.length > 0) {
      navigate(mainList[0].URL);
    }
  };

  useEffect(() => {
    if (currentMenu) {
      setActiveMenuName(currentMenu.MODULE_CODE);
      setActiveSubMenu(pathname);
      setShow(false);
      setOpen(false);
    } else {
    }
  }, [currentMenu, pathname]);

  const handleActivity = () => {
    setLastActivityTime(Date.now());
  };
  const reject = () => {
    localStorage.removeItem("token");
    let cookies = new Cookies();
    cookies.remove(COOKIES.ACCESS_TOKEN, {
      path: `${process.env.REACT_APP_CUSTOM_VARIABLE}`,
    });
    removeLocalStorage();
    setTimeout(() => {
      navigate(PATH.LOGIN);
      window.location.reload();
    }, 500);
  };
  const checkInactivity = () => {
    const currentTime = Date.now();
    let activityTime: any = IdealTimeConfiguration?.SETACTIVITYTIME;
    let TotalTime: any = currentTime - lastActivityTime;
    let afterActivityTime: any = IdealTimeConfiguration?.SETAFTERACTIVITYTIME;
    if (parseInt(TotalTime) > parseInt(activityTime)) {
      if (parseInt(TotalTime) > parseInt(afterActivityTime)) {
        reject();
      } else {
        setIdealTimeStatus(true);
      }
    }
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);
    const intervalId = setInterval(
      checkInactivity,
      IdealTimeConfiguration?.SETINTERVAL
    );
    return () => {
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      clearInterval(intervalId);
      setIdealTimeStatus(false);
    };
  }, [lastActivityTime]);

  return (
    <>
      {idealTimerStatus && (
        <IdleTimer
          setIdealTimeStatus={setIdealTimeStatus}
          setLastActivityTime={setLastActivityTime}
        />
      )}
      <aside
        id="layout-menu"
        className={`${
          props?.open ? "w-64" : "w-20 hideContainer"
        } pt-4 duration-300 relative bg-white layout-menu menu-vertical menu bg-menu-theme`}
      >
        <img
          src={LeftAngle}
          alt=""
          className={`absolute cursor-pointer rounded-full z-10  -right-3 top-6 w-8 border-8 bg-8E724A border-f1eee9 ${
            !props?.open && "rotate-180"
          }`}
          onClick={() => props?.setOpen(!props?.open)}
        />
        <div className="flex gap-x-4 item-center p-5 py-2">
          <img
            src={SidebarLogo}
            alt="KEPPEL CMMS"
            className={`origin-left cursor-pointer duration-300 ${
              !props?.open && "scale-0"
            }`}
          />
        </div>

        <div className="mt-2">
          <ul
            className={`${
              props?.open ? "scrollcontainer" : ""
            } menu-inner py-1 ps`}
          >
            {props?.menuList?.map((menu: any, index: any) => {
              return (
                <li
                  className={`menu-item w-full ${
                    activeMenuName === menu?.MODULE_CODE ? "active" : ""
                  }`}
                  key={index}
                >
                  <div
                    className="menu-link"
                    onClick={() => {
                      setHighlighted(menu, index, menu?.MODULE_CODE);
                      gotToNewPage(menu);
                    }}
                  >
                    <i className={`menu-icon ${menu?.ICON}`}></i>
                    <>{show}</>

                    <div
                      className={`content-between w-full ${
                        props?.open ? "flex" : "hidden"
                      }`}
                    >
                      <div className="text-truncate">
                        {menu?.MODULE_DESCRIPTION}
                      </div>
                      {menu?.MODULE_CODE !== "DASH" && (
                        <i
                          className={`ms-auto mt-1 pi pi-angle-right ${
                            activeMenuName === menu?.MODULE_CODE &&
                            !open &&
                            "rotate-90"
                          }`}
                        ></i>
                      )}
                    </div>
                  </div>
                  {menu?.MODULE_CODE !== "DASH" && (
                    <>
                      {menu?.DETAIL &&
                        activeMenuName === menu?.MODULE_CODE &&
                        !open && (
                          <ul
                            className={`dropdown${
                              activeMenuName === menu?.MODULE_CODE
                                ? "menu-sub"
                                : ""
                            }`}
                          >
                            {menu.DETAIL.map((item: any, subIndex: any) => (
                              <li
                                className={`menu-item ${
                                  item.URL === pathname ? "active" : ""
                                }`}
                                key={subIndex}
                              >
                                <>
                                  {(hasSerRequest ||
                                    item.URL !== "/servicerequestlist?add=") &&
                                    item.URL !== "/location" &&
                                    item.URL !== "/ppmscheduledetails" &&
                                    item.URL !== "/pdfreport" &&
                                    item.URL !== "/addequipmenthierarch" &&
                                    item.URL !== "/infraschedule" &&
                                    item.url !== "/infrappmscheduledetails" && (
                                      <li
                                        className={`menu-item ${
                                          item.URL === pathname ? "active" : ""
                                        }`}
                                        key={subIndex}
                                      >
                                        <NavLink
                                          to={item.URL}
                                          className="menu-link"
                                          onClick={() => {
                                            setSubHighlighted(item?.URL);
                                            setShow(false);
                                            dispatch(clearFilters());
                                          }}
                                        >
                                          <div
                                            className={`text-truncate ${
                                              activeSubMenu ===
                                              item?.FUNCTION_DESC
                                                ? "Text_Primary font-semibold"
                                                : ""
                                            }`}
                                          >
                                            {item.FUNCTION_DESC}
                                          </div>
                                        </NavLink>
                                      </li>
                                    )}
                                </>
                              </li>
                            ))}
                          </ul>
                        )}
                    </>
                  )}
                </li>
              );
            })}
            <div className="cover-bar"></div>
          </ul>
        </div>
      </aside>
    </>
  );
};

export default Navbar;
