import { OverlayPanel } from "primereact/overlaypanel";
import { useRef } from "react";
import {
  COOKIES,
  LOCALSTORAGE,
  removeLocalStorage,
} from "../../utils/constants";
import { Cookies } from "react-cookie";
import { useLocation, useNavigate } from "react-router-dom";
import { PATH } from "../../utils/pagePath";
import Field from "../../components/Field";
import Select from "../../components/Dropdown/Dropdown";
import { useForm } from "react-hook-form";
import { callPostAPI } from "../../services/apis";
import { ENDPOINTS } from "../../utils/APIEndpoints";
import { decryptData, encryptData } from "../../utils/encryption_decryption";
// import DialogBox from "../../components/DialogBox/DialogBox";
// import { Dialog } from "primereact/dialog";
// import { Button } from "primereact/button";
const Topbar = (props: any) => {
  // const [visible, setVisible] = useState<boolean>(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  let { search } = useLocation();
  const location = pathname + search;
  const op: any = useRef(null);
  const facilityData = JSON.parse(localStorage.getItem(LOCALSTORAGE.FACILITY)!);
  const Currentfacility =
    facilityData?.length > 0
      ? JSON.parse(localStorage.getItem(LOCALSTORAGE.FACILITYID)!)
      : [];

  const { register, control, setValue } = useForm({
    defaultValues: {
      facility: props?.selected,
    },
    mode: "onChange",
  });

  const onChangeLanguage = () => {
    navigate("/languageChange");
  };

  const handleFacilityChange = async (e: any, field: any) => {
    try {
      field.onChange(e);
      await callPostAPI(ENDPOINTS?.BUILDING_GET, {});

      const payload = {
        FACILITY_ID: e?.target?.value?.FACILITY_ID,
      };
      await callPostAPI(ENDPOINTS?.DefaultFacility, payload);

      props?.setSelected(e?.target?.value);
      localStorage.setItem(
        LOCALSTORAGE?.FACILITYID,
        JSON.stringify(e?.target?.value)
      );
      let buildingData: any = e.target.value;
      const Role_Name: any = encryptData(
        JSON.stringify(buildingData?.ROLE_NAME)
      );

      localStorage.setItem(LOCALSTORAGE.ROLE_NAME, Role_Name);
      const Role_Id: any = encryptData(JSON.stringify(buildingData?.ROLE_ID));
      localStorage.setItem(LOCALSTORAGE.ROLE_ID, Role_Id);

      const ISASSIGN: any = encryptData(JSON.stringify(buildingData?.ISASSIGN));
      localStorage.setItem(LOCALSTORAGE.ISASSIGN, ISASSIGN);

      const REOPEN_ADD: any = encryptData(
        JSON.stringify(buildingData?.REOPEN_ADD)
      );
      localStorage.setItem(LOCALSTORAGE.REOPEN_ADD, REOPEN_ADD);

      // localStorage.setItem( LOCALSTORAGE.LANGUAGE,res?.USERLIST[0]?.DEFAULT_LANGUAGE);
      const Roletype_Code: any = encryptData(
        JSON.stringify(buildingData?.ROLETYPECODE)
      );
      localStorage.setItem(LOCALSTORAGE.ROLETYPECODE, Roletype_Code);

      const Role_Hierarchy_Id: any = encryptData(
        JSON.stringify(buildingData?.ROLE_HIERARCHY_ID)
      );
      localStorage.setItem(LOCALSTORAGE.ROLE_HIERARCHY_ID, Role_Hierarchy_Id);
    } catch (error: any) {
    } finally {
    }
  };
  const handlerLogOut = (e: any) => {
    e.preventDefault();
    let cookies = new Cookies();
    cookies.remove(COOKIES.ACCESS_TOKEN, {
      path: `${process.env.REACT_APP_CUSTOM_VARIABLE}`,
    });
    cookies.remove(COOKIES.REFERESH_TOKEN, {
      path: `${process.env.REACT_APP_CUSTOM_VARIABLE}`,
    });
    cookies.remove(COOKIES.LOGIN_TYPE, {
      path: `${process.env.REACT_APP_CUSTOM_VARIABLE}`,
    });
    localStorage.setItem("logout", new Date().toString());
    window.location.href = `${process.env.REACT_APP_B2B_LOGIN_REDIRECT_URL}`; // Redirect to login page
    removeLocalStorage();
    setTimeout(() => {
      navigate(PATH.LOGIN);
      window.location.reload();
    }, 500);
  };

  window.addEventListener("storage", (event) => {
    if (event.key === "logout") {
      window.location.href = `${process.env.REACT_APP_B2B_LOGIN_REDIRECT_URL}`; // Redirect to login page
    }
  });

  const profileName =
    facilityData !== null
      ? decryptData(localStorage.getItem(LOCALSTORAGE.USER_NAME) ?? "")
      : "";

  return (
    <nav
      className={` layout-navbar navbar navbar-expand-xl  align-items-center bg-navbar-theme container-fluid ${
        location === "/workorderlist?edit="
          ? "navbar-detached-remove "
          : "navbar-detached"
      }`}
    >
      <div className="navbar-nav-right flex align-items-center">
        <div className="navbar-nav align-items-center w-72">
          <>
            <Field
              controller={{
                name: "facility",
                control: control,
                render: ({ field }: any) => {
                  return (
                    <Select
                      options={facilityData !== null ? facilityData : []}
                      optionLabel="FACILITY_NAME"
                      {...register("facility", {
                        required: "Facility is required.",
                      })}
                      placeholder={`Select Building`}
                      className="w-full dashboardDropdown"
                      disabled={
                        pathname === "/locationtype" ||
                        pathname === "/ppmSchedule" ||
                        pathname === "/ppmscheduledetails" ||
                        search
                          ? true
                          : false
                      }
                      findKey={"FACILITY_ID"}
                      selectedData={
                        facilityData !== null
                          ? Currentfacility?.FACILITY_ID
                          : ""
                      }
                      setValue={setValue}
                      {...field}
                      onChange={(e: any) => handleFacilityChange(e, field)}
                    />
                  );
                },
              }}
            />
          </>
        </div>
        <div className="navbar-nav flex-row align-items-center ms-auto">
          <div className="w-10 h-10 justify-center items-start gap-2.5 inline-flex">
            <div className=" hide-arrow" onClick={(e) => op.current.toggle(e)}>
              <div className="avatar avatar-online">
                <i
                  className="pi pi-user w-px-40 h-auto rounded-circle"
                  style={{ color: "#708090" }}
                ></i>
                <OverlayPanel ref={op}>
                  <ul
                    className="dropdown-menu dropdown-menu-end show"
                    data-bs-popper="static"
                  >
                    <li className="py-2 ">
                      <div className="flex">
                        <div className="shrink-0 me-3">
                          <div className=" hide-arrow">
                            <div className="avatar avatar-online">
                              <i
                                className="pi pi-user w-px-40 h-auto rounded-circle"
                                style={{ color: "#708090" }}
                              ></i>
                            </div>
                          </div>
                        </div>
                        <div className="grow">
                          <span className="block Table_Header Text_Primary">
                            <p>{profileName}</p>
                            {/* {localStorage.getItem(LOCALSTORAGE.USER_NAME)} */}
                          </span>
                          <small className="text-muted Helper_Text">
                            {facilityData !== null
                              ? decryptData(localStorage.getItem("ROLE_NAME"))
                              : ""}
                          </small>
                        </div>
                      </div>
                    </li>
                    <li>
                      <hr></hr>
                    </li>
                    <li className="py-2 cursor-pointer">
                      <button
                        className="dropdown-item"
                        onClick={() => onChangeLanguage()}
                      >
                        <i className="pi pi-language me-2"></i>
                        <span className="align-middle Table_Header">
                          Change Language
                        </span>
                      </button>
                    </li>
                    <li>
                      <hr></hr>
                    </li>
                    {/* <li className="py-2 cursor-pointer">
                      <button
                        className="dropdown-item"
                        onClick={() => setVisible(true)}
                      >
                        <i className="pi pi-trash me-2"></i>
                        <span className="align-middle Table_Header">
                          Delete Account
                        </span>
                      </button>
                    </li> */}
                    <li>
                      <hr></hr>
                    </li>
                    <li className="py-2 cursor-pointer">
                      <button className="dropdown-item" onClick={handlerLogOut}>
                        <i className="pi pi-sign-out me-2"></i>
                        <span className="align-middle Table_Header">
                          Logout
                        </span>
                      </button>
                    </li>
                  </ul>
                </OverlayPanel>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Topbar;
