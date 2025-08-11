import { OverlayPanel } from "primereact/overlaypanel";
import { useRef } from "react";
import { COOKIES, LOCALSTORAGE, removeLocalStorage } from "../../utils/constants";
import { Cookies } from "react-cookie";
import { useLocation, useNavigate } from "react-router-dom";
import { PATH } from "../../utils/pagePath";
import Field from "../../components/Field";
import Select from "../../components/Dropdown/Dropdown";
import { useForm } from "react-hook-form";
import { callPostAPI } from "../../services/apis";
import { ENDPOINTS } from "../../utils/APIEndpoints";
import { decryptData } from "../../utils/encryption_decryption";
const Topbar = (props: any) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  let { search } = useLocation();
  const op: any = useRef(null);
  const facilityData = JSON.parse(((localStorage.getItem(LOCALSTORAGE.FACILITY)))!);
  const Currentfacility = JSON.parse(((localStorage.getItem(LOCALSTORAGE.FACILITYID)))!);
  let facilityCheck: any = pathname === '/addfacilitysetup?edit=' ? true : "";
 
  const {
    register,
    control,
    setValue
  } = useForm({
    defaultValues: {

      facility: props?.selected
    },
    mode: "onChange",
  });
  const onChangeLanguage = (e: any) => {
    navigate('/languageChange');
  }


  const handleFacilityChange = async (e: any, field: any) => {
    field.onChange(e);
    const res2 = await callPostAPI(ENDPOINTS?.BUILDING_GET, {});

    const payload = {
      FACILITY_ID: e?.target?.value?.FACILITY_ID
    }
    await callPostAPI(ENDPOINTS?.DefaultFacility, payload)

    props?.setSelected(e?.target?.value)
    localStorage.setItem(LOCALSTORAGE?.FACILITYID, JSON.stringify(e?.target?.value));
  }
  const handlerLogOut = (e: any) => {
    e.preventDefault();
    let cookies = new Cookies();
    cookies.remove(COOKIES.ACCESS_TOKEN, { path:`${process.env.REACT_APP_CUSTOM_VARIABLE}`});
    cookies.remove(COOKIES.REFERESH_TOKEN, { path: `${process.env.REACT_APP_CUSTOM_VARIABLE}`});
    localStorage.setItem("logout", new Date().toString());
    window.location.href = "/login";  // Redirect to login page
    removeLocalStorage()
    setTimeout(() => {
      navigate(PATH.LOGIN);
      window.location.reload();
    }, 500);
  }

  window.addEventListener("storage", (event) => {
    if (event.key === "logout") {
      window.location.href = "/login";  // Redirect to login page
    }
  });

  const profileName = decryptData(localStorage.getItem(LOCALSTORAGE.USER_NAME) ?? '')

  let facilityId: any = localStorage.getItem('FACILITY_ID')
  let Id: any = parseInt(facilityId)
  return (
    <nav className="layout-navbar navbar navbar-expand-xl navbar-detached align-items-center bg-navbar-theme container-fluid">
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
                      options={

                        facilityData}
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

                      selectedData={Currentfacility?.FACILITY_ID}
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
                            {decryptData(localStorage.getItem("ROLE_NAME"))}
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
                        onClick={(e) => onChangeLanguage(e)}
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
