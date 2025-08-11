import React, { useEffect, useState } from "react";
import Login_BG from "../../assest/images/LoginFrame.png";
import Keppel_Logo from "../../assest/images/keppel_logo.svg";
import Klik_Logo from "../../assest/images/SidebarMenuImg/klik-plus-fm-logo.svg";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Buttons from "../../components/Button/Button";
import { toast } from "react-toastify";
import InputField from "../../components/Input/Input";
import { useForm } from "react-hook-form";
import Field from "../../components/Field";
import { LOCALSTORAGE } from "../../utils/constants";
import {
  getAccessTokenForlogin,
  loginUser,
  UserCheck,
} from "../../services/Login/services";
import { PATH } from "../../utils/pagePath";
import PublicRoute from "../../auth/PublicRoute";
import "./Login.css";
import { encryptData } from "../../utils/encryption_decryption";
import { jwtDecode } from "jwt-decode";
import LoaderS from "../../components/Loader/Loader";

import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../../utils/B2BLogin";

const Login: React.FC<any> = () => {
  const { instance, inProgress } = useMsal();
  const [loading, setLoading] = useState<any | null>(false);
  let curr_loc = useLocation();
  const [error, setError] = useState<any | null>(false);
  const [errorMsg, setErrorMsg] = useState<any>();
  let B2BLoginSuccess: any = false;
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      email: "",
      contact: "",
    },
    mode: "all",
  });

  const onSubmit = async (data: any, e: any = "secondcheck") => {
    let Logincheck: any = e?.nativeEvent?.submitter?.name;
    const payload = {
      EMAIL_ID: data?.email?.trim(),
      LANGUAGE_CODE: "EN",
      LOGIN_TYPE: "W",
      MOBILEIP_ADDRESS: "",
      MOBILE_NO: data?.MOBILE_NO === undefined ? "" : data?.MOBILE_NO,
      USER_CHECK: data?.TOKEN === undefined ? true : false,
      USER_ID: 0,
    };
    let isValid: boolean;
    let isMobile: boolean = false;
    let isEmail: boolean = false;
    let isMobileOREmail: boolean = false;
    let msg: any = "";
    const alphabetPattern = /^[A-Za-z]+$/;

    if (alphabetPattern.test(payload?.EMAIL_ID)) {
      msg = "Please Enter valid email or phone number";
      isMobileOREmail = true;
      isValid = false;
      setError(true);
    } else if (payload?.EMAIL_ID.includes("@")) {
      const emailPattern =
        /^\s*[^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))\s*$/;
      if (emailPattern.test(payload?.EMAIL_ID)) {
        isEmail = true;
        isValid = true;
      } else {
        msg = "We can’t find an account with this email address.";
        isEmail = true;
        isValid = false;
        setError(true);
        setErrorMsg(msg);
      }
    } else {
      const phonePattern = /^[+]{1}(?:[0-9\-\\/.]\s?){6,15}[0-9]{1}$/; // Basic international format
      if (phonePattern.test(payload?.EMAIL_ID)) {
        isMobile = true;
        isValid = true;
      } else {
        // msg = 'Please Enter valid Mobile Number'
        msg = " We can’t find an account with this mobile number.";
        isMobile = true;
        isValid = false;
        setError(true);
        setErrorMsg(msg);
      }
    }

    if (inProgress === "none") {
      if (isValid) {
        try {
          if (Logincheck === "firstcheck") {
            const usercheck = await UserCheck(payload);
            let e_type = usercheck?.USER_DETAILS[0]?.USER_TYPE;

            if (e_type === "I") {
              const loginType: any = encryptData(JSON.stringify("B2B"));
              localStorage.setItem(LOCALSTORAGE.LOGIN_TYPE, loginType);
            }
            if (e_type === "E") {
              const loginType: any = encryptData(JSON.stringify("B2C"));
              localStorage.setItem(LOCALSTORAGE.LOGIN_TYPE, loginType);
            }

            if (e_type === "E" && curr_loc?.search === "") {
              // local
              window.location.href =
                `${process.env.REACT_APP_LOGIN_URL}` +
                data.email.toString().replace(/\+/g, "%2b").trim();
              window.location.href =
                `${process.env.REACT_APP_LOGIN_URL}` +
                data.email.toString().replace(/\+/g, "%2b").trim();
            }

            if (e_type === "I" && B2BLoginSuccess === false) {
              // setIsB2BLogin(true);
              B2BLoginSuccess = true;

              await instance
                .loginPopup(loginRequest)
                .then(async (res) => {
                  let new_data = {
                    email: data?.email?.trim(),
                    MOBILE_NO: "",
                    TOKEN: res?.idToken,
                    USER_CHECK: false,
                  };

                  const decodedToken: any = jwtDecode(res?.idToken);

                  const expirationTime = decodedToken?.exp; // Convert to milliseconds
                  //  const timeLeft = expirationTime - Date.now();

                  let expiresIn: any = {
                    not_before: 0,
                    id_token_expires_in: expirationTime,
                  };
                  localStorage.setItem("expiresIn", JSON.stringify(expiresIn));

                  const AccountDetails: any = encryptData(
                    JSON.stringify(res?.account)
                  );
                  localStorage.setItem("AccountDetails", AccountDetails);
                  await onSubmit(new_data);
                })
                .catch((error: any) => {
                  B2BLoginSuccess = false;
                  toast.error("B2B Authentication failed. Please try again.");
                });
            }
          } else {
            const res = await loginUser(payload, data?.TOKEN);
            //  if(res && res?.FACILITYLIST?.length !== 0 ){

            if (res?.USERLIST[0]?.USER_TYPE === "I") {
              const loginType: any = encryptData(JSON.stringify("B2B"));
              localStorage.setItem(LOCALSTORAGE.LOGIN_TYPE, loginType);
            }
            if (res?.USERLIST[0]?.USER_TYPE === "E") {
              const loginType: any = encryptData(JSON.stringify("B2C"));
              localStorage.setItem(LOCALSTORAGE.LOGIN_TYPE, loginType);
            }

            localStorage.setItem(
              LOCALSTORAGE.FACILITY,
              JSON.stringify(res?.FACILITYLIST)
            );

            const facilityId: any =
              res?.FACILITYLIST?.filter((facility: any) => {
                return (
                  facility?.FACILITY_ID === +res?.USERLIST[0]?.DEFAULT_FACILITY
                );
              })[0] || res?.FACILITYLIST[0];
            localStorage.setItem(
              LOCALSTORAGE.FACILITYID,
              JSON.stringify(facilityId)
            );

            const Userdata: any = encryptData(JSON.stringify(res?.USERLIST[0]));
            localStorage.setItem("USER", Userdata);
            const User_Id: any = encryptData(
              JSON.stringify(res?.USERLIST[0]?.USER_ID)
            );

            localStorage.setItem(LOCALSTORAGE.USER_ID, User_Id);
            const User_Name: any = encryptData(
              JSON.stringify(res?.USERLIST[0]?.USER_NAME)
            );

            localStorage.setItem(LOCALSTORAGE.USER_NAME, User_Name);

            const Role_Name: any = encryptData(
              JSON.stringify(facilityId?.ROLE_NAME)
            );
            localStorage.setItem(LOCALSTORAGE.ROLE_NAME, Role_Name);
            localStorage.setItem(LOCALSTORAGE.ROLE_ID, facilityId?.ROLE_ID);
            const Role_Id: any = encryptData(
              JSON.stringify(facilityId?.ROLE_ID)
            );
            localStorage.setItem(LOCALSTORAGE.ROLE_ID, Role_Id);

            const ISASSIGN: any = encryptData(
              JSON.stringify(res?.USERLIST[0]?.ISASSIGN)
            );
            localStorage.setItem(LOCALSTORAGE.ISASSIGN, ISASSIGN);

            const REOPEN_ADD: any = encryptData(
              JSON.stringify(res?.USERLIST[0]?.REOPEN_ADD)
            );
            localStorage.setItem(LOCALSTORAGE.REOPEN_ADD, REOPEN_ADD);

            localStorage.setItem(
              LOCALSTORAGE.LANGUAGE,
              res?.USERLIST[0]?.DEFAULT_LANGUAGE
            );
            const Roletype_Code: any = encryptData(
              JSON.stringify(facilityId?.ROLETYPECODE)
            );
            localStorage.setItem(LOCALSTORAGE.ROLETYPECODE, Roletype_Code);

            const Role_Hierarchy_Id: any = encryptData(
              JSON.stringify(facilityId?.ROLE_HIERARCHY_ID)
            );
            localStorage.setItem(
              LOCALSTORAGE.ROLE_HIERARCHY_ID,
              Role_Hierarchy_Id
            );

            localStorage.setItem(
              LOCALSTORAGE.TEAM_ID,
              res?.USERLIST[0]?.TEAM_ID
            );
            // }
            let e_type = res?.USERLIST[0]?.USER_TYPE;

            if (e_type === "E" && curr_loc?.search !== "") {
              // cookies.set(COOKIES.LOGIN_TYPE, "B2C", {
              //   // path: PATH.DEFAULT,
              //   path: `${process.env.REACT_APP_CUSTOM_VARIABLE}`,
              //   secure: true,
              //   sameSite: "strict"
              // });

              const loginType: any = encryptData(JSON.stringify("B2C"));
              localStorage.setItem(LOCALSTORAGE.LOGIN_TYPE, loginType);

              // cookies.set(COOKIES.ACCESS_TOKEN, res?.RESULTLIST[0]?.TOKEN, {
              //   // path: PATH.DEFAULT,
              //   path: `${process.env.REACT_APP_CUSTOM_VARIABLE}`,
              //   secure: true,
              //   sameSite: "strict",
              //   // httpOnly:true
              // });

              const accesstoken: any = encryptData(JSON.stringify(data?.TOKEN));
              localStorage.setItem(LOCALSTORAGE.ACCESS_TOKEN, accesstoken);
            }

            if (e_type === "I" && curr_loc?.search === "" && B2BLoginSuccess) {
              let access_token = data?.TOKEN;
              let refresh_token = data?.TOKEN;

              // cookies.set(COOKIES.REFERESH_TOKEN, refresh_token, {
              //   path: `${process.env.REACT_APP_CUSTOM_VARIABLE}`,
              //   secure: true,
              //   sameSite: "strict"
              // });

              const refreshtoken: any = encryptData(
                JSON.stringify(refresh_token)
              );
              localStorage.setItem(LOCALSTORAGE.REFERESH_TOKEN, refreshtoken);

              // cookies.set(COOKIES.LOGIN_TYPE, "B2B", {
              //   path: `${process.env.REACT_APP_CUSTOM_VARIABLE}`,
              //   secure: true,
              //   sameSite: "strict"
              // });
              const loginType: any = encryptData(JSON.stringify("B2B"));
              localStorage.setItem(LOCALSTORAGE.LOGIN_TYPE, loginType);

              // cookies.set(COOKIES.ACCESS_TOKEN, access_token, {
              //   path: `${process.env.REACT_APP_CUSTOM_VARIABLE}`,
              //   secure: true,
              //   sameSite: "strict"
              // });
              const accesstoken: any = encryptData(
                JSON.stringify(access_token)
              );
              localStorage.setItem(LOCALSTORAGE.ACCESS_TOKEN, accesstoken);

              B2BLoginSuccess = true;
              navigate(PATH?.WORKORDERMASTER);
            }
          }

          //   cookies.set(COOKIES.ACCESS_TOKEN, res?.RESULTLIST[0]?.TOKEN, {
          //     httpOnly: true,
          //     secure: true,
          //     sameSite: "strict",
          //     path: `${process.env.REACT_APP_CUSTOM_VARIABLE}`,
          //   });
          // }

          // navigate(PATH?.WORKORDERMASTER); // Commented by Gauresh

          // toast.success(res?.RESULTLIST[0].MSG)
        } catch (err: any) {
          if (isMobileOREmail) {
            msg = "Please Enter valid email or phone number.";
            setErrorMsg(msg);
            return;
          } else if (isEmail) {
            msg = "We can’t find an account with this email id.";
            setErrorMsg(msg);
            return;
          } else if (isMobile) {
            msg = "We can’t find an account with this mobile number.";
            setErrorMsg(msg);
            return;
          }
          //  toast.error(err);
        } finally {
          setLoading(false);
        }
      }
      // }
      else {
        setErrorMsg(msg);
        // toast.error(msg)
      }
    } else {
      toast.error(
        "B2B Authentication is already in progress,  Please ensure that this process has been completed before login again ."
      );
    }
  };

  const handleInputChange = (event: any) => {
    if (event.target.value === "" || event.target.value === undefined) {
      setErrorMsg("");
      setError(false);
      return;
    }
  };

  useEffect(() => {
    if (
      (!isSubmitting && Object?.values(errors)[0]?.type === "required") ||
      (!isSubmitting && Object?.values(errors)[0]?.type === "validate")
    ) {
      const check: any = Object?.values(errors)[0]?.message;
      toast?.error(check);
    }
  }, [isSubmitting]);

  useEffect(() => {
    (async function () {
      if (curr_loc?.search !== "") {
        if (curr_loc?.pathname === "/login") {
          setLoading(true);
          //searchParams.get("acces_key")
          //   localStorage.setItem("LOC_KEY", window?.location?.search);

          if (window?.location?.search !== "") {
            try {
              let token_data = window.location.search.replace("?code=", "");

              let token_payload = {
                TOKEN: `${token_data}`,
              };
              let res: any = await getAccessTokenForlogin(token_payload);
              let refresh_token = res?.data?.refresh_token;
              let id_token: any = res?.data?.id_token;
              // localStorage.setItem("REFRESH_TOKEN", refresh_token);
              // cookies.set(COOKIES.REFERESH_TOKEN, refresh_token, {
              //   // path: PATH.DEFAULT,
              //   path: `${process.env.REACT_APP_CUSTOM_VARIABLE}`,
              //   secure: true,
              //   sameSite: "strict"
              // });
              const refreshtoken: any = encryptData(
                JSON.stringify(refresh_token)
              );
              localStorage.setItem(LOCALSTORAGE.REFERESH_TOKEN, refreshtoken);

              let expiresIn: any = {
                not_before: res?.data?.not_before,
                id_token_expires_in: res?.data?.id_token_expires_in,
              };
              localStorage.setItem("expiresIn", JSON.stringify(expiresIn));
              let decode: any = jwtDecode(id_token);
              let data = {
                email: decode?.email,
                MOBILE_NO: decode?.signInNames?.phoneNumber,
                TOKEN: id_token,
              };
              await onSubmit(data);
            } catch (error: any) {
              setLoading(false);

              toast.error("Somthing went wrong.");
              navigate(PATH.LOGIN);
            }
          }
        }
      }
    })();
  }, [curr_loc?.search !== ""]);

  return (
    <>
      <PublicRoute>
        {loading === true ? (
          <LoaderS />
        ) : (
          <div className="flex items-center min-h-screen p-4 bg-gray-100 lg:justify-center">
            <div className="flex flex-col overflow-hidden bg-white rounded-md shadow-lg max md:flex-row md:flex-1 h-[700px] w-1/2 lg:max-w-screen-lg">
              <div className="p-4 py-6 Text_Primary lime-background md:w-3/5 md:flex-shrink-0 md:flex md:flex-col justify-center  md:justify-between">
                <div className="w-[250px] h-[25px]">
                  <img src={Klik_Logo} alt="" />
                  {/* <h6><b>KEPPEL-CMMS</b></h6> */}
                </div>
                <div className="hidden  lg:flex flex-col items-center justify-center w-full ">
                  <img className="w-[500px] h-[]" src={Login_BG} alt="" />
                  <img className="w-[50px] h-[17px]" src={Keppel_Logo} alt="" />
                  <span className="font-medium mt-3 text-black ms-1 text-[15px]">
                    Version: 1.0.1
                  </span>
                </div>
              </div>
              <div className="p-12 grid place-items-center  bg-white md:flex-1 ">
                <div
                  className="bg-light-background-paper flex flex-col
                            gap-[12.86px] items-start justify-center shrink-0 w-full relative overflow-hidden"
                >
                  <div className="flex flex-col gap-[15px] items-start justify-start self-stretch shrink-0 relative">
                    <div className="flex flex-col gap-[8.82px] items-center justify-start self-stretch shrink-0 relative">
                      <div
                        className="text-content-text-primary font-['Lato-Medium',_sans-serif] text-left  text-[28px] leading-[34px] font-bold relative self-stretch flex items-center justify-start"
                        style={{
                          opacity: "0.8399999737739563",
                          color: "#272B30",
                        }}
                      >
                        Login
                      </div>
                      <div
                        className="Text_Secondary text-left font-['Lato-Regular',_sans-serif]  text-[16px] leading-6
                                        font-normal relative self-stretch"
                      >
                        Enter your email or mobile number (e.g
                        <br />
                        john.doe@gmail.com or +6512345678).
                      </div>
                    </div>
                    {/* AD-Login */}
                    <form onSubmit={handleSubmit(onSubmit)} className="w-full">
                      <div className={`${error === true ? "errorBorder" : ""}`}>
                        <Field
                          controller={{
                            name: "email",
                            control: control,
                            render: ({ field }: any) => {
                              return (
                                <InputField
                                  {...register("email", {
                                    required:
                                      "Please fill the required fields.",
                                    onChange: (e: any) => handleInputChange(e),
                                    // validate: validateContact,
                                  })}
                                  placeholder="user@example.com or +1234567890"
                                  className="w-full"
                                  invalid={error === false ? errors.email : ""}
                                  // invalidMessage={errors?.email?.message}
                                  {...field}
                                />
                              );
                            },
                          }}
                        />

                        <small className="Text_Error">{errorMsg}</small>
                      </div>

                      <div className="w-full mt-2 mb-3 Login-Button">
                        <Buttons
                          type="submit"
                          label="Login"
                          className="w-full font-['Lato-Regular',_sans-serif] font-normal"
                          name="firstcheck"
                        />
                        {/* <Buttons
                        type="submit"
                        label="External Login"
                        className="w-full font-['Lato-Regular',_sans-serif] font-normal"
                        name="external"
                      /> */}
                        <br />
                        <br />
                        {/* {<Buttons
                          type="submit"
                          label="Internal Login"
                          className="w-full font-['Lato-Regular',_sans-serif] font-normal"
                          name="internal"
                        />} */}
                      </div>
                    </form>

                    <div className="w-full">
                      <hr className="m-0 w-full border-1" />
                    </div>
                  </div>
                  {/*  */}
                  {/* <button
                    type="button"
                    onClick={() => {
                      throw new Error("Sentry Test Error");
                    }}
                  >
                    Break the world
                  </button>; */}

                  <div className="text-left font-['Lato-Regular',_sans-serif] text-[12px] leading-[12.04px] font-normal flex justify-between self-stretch">
                    <span>
                      <p className="text-left Text_Secondary font-['Lato-Regular',_sans-serif] text-[12px] leading-[18px] font-normal">
                        By continuing with the Login process, we may send you a
                        one-time verification code via text message to the phone
                        number associated with your account. Message and data
                        rates may apply.
                        <Link to="https://www.keppel.com/realestate/Terms-and-Conditions">
                          <span className="font-semibold text-slate Text_Primary ms-1 text-[12px] leading-[18px]">
                            Terms & Conditions |
                          </span>
                        </Link>
                        <Link to="https://www.keppel.com/realestate/Privacy-Policy">
                          <span className="font-semibold text-slate Text_Primary ms-1 text-[12px] leading-[18px]">
                            Privacy Policy.
                          </span>
                        </Link>
                      </p>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </PublicRoute>
    </>
  );
};

export default Login;
