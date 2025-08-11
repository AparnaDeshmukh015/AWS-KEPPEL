import moment from "moment";
import { callPostAPI } from "../services/apis";
import { ENDPOINTS } from "./APIEndpoints";
import axios from "axios";
import { toast } from "react-toastify";

export const COOKIES = {
  ACCESS_TOKEN: "accessToken",
  REFERESH_TOKEN: "refreshToken",
  FIRST_NAME: "firstName",
  LAST_NAME: "lastName",
  EMAIL_ADDRESS: "emailAddress",
  PROFILE_COLOR: "profileColor",
  APPLICATION_TOKEN: "applicationToken",
  JOBPROFILE: "jobprofile",
  COMPANY_ID: "companyid",
  USER_ID: "userid",
  PERMISSIONS: "permissions",
};

export const LOCALSTORAGE = {
  FACILITY: "FACILITY",
  USER_ID: "USER_ID",
  ROLE_ID: "ROLE_ID",
  LANGUAGE: "LANGUAGE",
  FACILITYID: "FACILITYID",
  ROLE_HIERARCHY_ID: "ROLE_HIERARCHY_ID",
  ROLETYPECODE: "ROLETYPECODE",
  USER_NAME: "USER_NAME",
  ROLE_NAME: "ROLE_NAME",
  TEAM_ID: "TEAM_ID",
  ROLE_TYPE_CODE: "ROLETYPE_CODE",
  ISASSIGN: "ISASSIGN",
  REOPEN_ADD: "REOPEN_ADD",
  ACCESS_TOKEN: "accessToken",
  REFERESH_TOKEN: "refreshToken",
  LOGIN_TYPE: "loginType",
};
export const ROLETYPECODE = {
  SYSTEM_ADMIN: "SA",
  SUPERVISOR: "S"
};
export const VALIDATION = {
  MIN_NUM: 8,
  MAX_NUM: 12,
  MAX_LENGTH: 20,
  MAX_COMPANY_NAME_LENGTH: 50,
  MIN_SKILLS: 2,
  MAX_SKILLS: 30,
  PASSWORD_MIN_LENGTH: 8,
  Max_EMAIL_LENGTH: 250,
  MAX_AGENCY_lENGTH: 100,
  MAX_QUALIFICATION_lENGTH: 100,
  MAX_POSITION_lENGTH: 50,
  MAX_NAME_LENGTH: 20,
};

export const API_STATUS = {
  SUCCESS: "Success",
  FAILED: "Failed",
};

export const LABELS = {
  ScheduleDailyLabel: [
    { name: "Once", key: "O" },
    { name: "Multiple", key: "M" },
  ],
  ScheduleMonthLabel: [
    { name: "Once", key: "O" },
    { name: "Twice", key: "T" },
  ],
  weekDataLabel: [
    { DAY_DESC: "S", DAY_CODE: 1 },
    { DAY_DESC: "M", DAY_CODE: 2 },
    { DAY_DESC: "T", DAY_CODE: 3 },
    { DAY_DESC: "W", DAY_CODE: 4 },
    { DAY_DESC: "T", DAY_CODE: 5 },
    { DAY_DESC: "F", DAY_CODE: 6 },
    { DAY_DESC: "S", DAY_CODE: 7 },
  ],
};

export const OPTIONS = {
  ScheduleDailyLabel: [
    { name: "Once", key: "O" },
    { name: "Multiple", key: "E" },
  ],
  ScheduleMonthLabel: [
    { name: "Once", key: "O" },
    { name: "Twice", key: "T" },
  ],
  scheduleList: [
    {
      SCHEDULE_DESC: "Periodic Daily",
      PERIOD: "D",
      FREQUENCY_TYPE: "P",
      VALUE: "D",
    },
    {
      SCHEDULE_DESC: "Periodic Weekly",
      PERIOD: "W",
      FREQUENCY_TYPE: "P",
      VALUE: "W",
    },
    {
      SCHEDULE_DESC: "Periodic Monthly",
      PERIOD: "M",
      FREQUENCY_TYPE: "P",
      VALUE: "M",
    },
    {
      SCHEDULE_DESC: "Run Hour Based",
      PERIOD: "R",
      FREQUENCY_TYPE: "R",
      VALUE: "R",
    },
    {
      SCHEDULE_DESC: "Run to Fail",
      PERIOD: "F",
      FREQUENCY_TYPE: "F",
      VALUE: "F",
    },
  ],
  monthList: [
    { MONTH_DESC: "Fixed Day", MONTH_OPTION: "1" },
    { MONTH_DESC: "Fixed Week Day", MONTH_OPTION: "2" },
  ],
  weekNumList: [
    { MONTHLY_2_WEEK_NUM: 1, VIEW: "1st" },
    { MONTHLY_2_WEEK_NUM: 2, VIEW: "2nd" },
    { MONTHLY_2_WEEK_NUM: 3, VIEW: "3rd" },
    { MONTHLY_2_WEEK_NUM: 4, VIEW: "4th" },
    { MONTHLY_2_WEEK_NUM: 5, VIEW: "5th" },
  ],
};

export const convertTime = (time: any = null) => {
  const date = new Date();
  let [hours, minutes, seconds] = time ? time?.split(":") : "0:0:0";
  date.setHours(hours);
  date.setMinutes(minutes);
  if (seconds) {
    date.setSeconds(seconds);
  }
  return date;

};


export const dateFormat = () => {

  const facilityData: any = JSON.parse(
    localStorage.getItem(LOCALSTORAGE.FACILITYID)!
  );
  return facilityData?.DATE_FORMAT;
};
// export const dateFormat = () => {
//   try {
//     const facilityData = JSON.parse(localStorage.getItem(LOCALSTORAGE.FACILITYID)!);
//     return facilityData?.DATE_FORMAT || 'YYYY-MM-DD'; // Default format if none found
//   } catch (error) {
//     console.error("Error parsing facility data from local storage:", error);
//     return 'YYYY-MM-DD'; // Fallback to a default format
//   }
// };


export const dateFormat1 = () => {

  const facilityData: any = JSON.parse(
    localStorage.getItem(LOCALSTORAGE.FACILITYID)!
  );

  return facilityData?.DATE_FORMAT?.split('-YYYY')[0];
};

export const dateFormatYear = () => {

  const facilityData: any = JSON.parse(
    localStorage.getItem(LOCALSTORAGE.FACILITYID)!
  );

  return facilityData?.DATE_FORMAT?.split('-YYYY')[0];
};

// export const helperNullDate = (date: any) => {
//   const dateCheck: any = date?.split("T")[0];
//   console.log(dateCheck, "datecheck")
//   if (dateCheck === "1900-01-01") {
//     return "";
//   } else {
//     // const formattedDate: any = moment(date)?.format("DD-MM-YYYY");
//     // console.log(typeof (formattedDate))
//     // console.log(formattedDate, "formattedDate")
//     const dateObj = new Date(date);

//     return dateObj
//   }
// };


//Anand Verma 14/10/2024
export const helperNullDate = (date: any) => {
  // Check if date is null or undefined
  // console.log(date,'date')
  if (!date) return "";

  const dateCheck = date.split("T")[0];
  if (dateCheck === "1900-01-01") {
    return ""; // Return null for the specific date
  } else {
    // console.log(dateCheck, 'date')
    // const format = dateFormat();
    // const dateObj = moment(dateCheck, format);
    // console.log(dateObj, 'dateObj')
    // if (!dateObj.isValid()) {
    //   return ""; // Return empty string for invalid dates
    // }
    //changes by Aparna Deshmukh25/102/2024
  // console.log(new Date(date), 'dat')
    return new Date(date); // Return the Date object
  }
};

export const saveTracker = async (data: any) => {
  let formData: any =
    localStorage.getItem("currentMenu") !== undefined
      ? localStorage.getItem("currentMenu")
      : "";

  let payloadData: any = formData !== undefined ? JSON.parse(formData) : "";

  // return;
  const payload = {
    FORM_NAME: payloadData?.FUNCTION_DESC ?? "",
  };

  const res = await callPostAPI(
    ENDPOINTS.SAVE_ACTIVITY_TRACKER,
    payload,
    payloadData?.FUNCTION_CODE ?? ""
  );
};


export function formateDate(date: string) {
  const facilityDetails: any = JSON.parse(
    localStorage.getItem(LOCALSTORAGE.FACILITYID)!
  );
  if (date === '') {
    return ''
  } else {
    return moment(date, `${facilityDetails?.DATE_FORMAT ?? 'DD-MM-YYYY'} hh:mm:ss A`).format(`${facilityDetails?.DATE_FORMAT ?? 'DD/MM/YYY'}, HH:mm`);
  }
}

export function onlyDateFormat(date: string) {
  const facilityDetails: any = JSON.parse(
    localStorage.getItem(LOCALSTORAGE.FACILITYID)!
  );
  if (date === '') {
    return ''
  } else {
    return moment(date).format(facilityDetails?.DATE_FORMAT);
  }
}

export const removeLocalStorage = () =>{
  localStorage.removeItem(LOCALSTORAGE?.LANGUAGE);
  localStorage.removeItem(LOCALSTORAGE?.ROLE_ID);
  localStorage.removeItem(LOCALSTORAGE?.USER_ID);
  localStorage.removeItem(LOCALSTORAGE?.FACILITYID);
  localStorage.removeItem(LOCALSTORAGE?.ROLETYPECODE);
  localStorage.removeItem(LOCALSTORAGE?.ROLE_HIERARCHY_ID);
  localStorage.removeItem('USER_NAME');
  localStorage.removeItem('Id');
  localStorage.removeItem('USER')
  localStorage.removeItem('MAKE_ID')
  localStorage.removeItem('ROLE_NAME')
  localStorage.removeItem('currentMenu')
  localStorage.removeItem('TEAM_ID')
  localStorage.clear();
  
}

export const scanfileAPI = async (binary: string) => {

  const finalPayload = {file: binary}
  const config = {
    headers: { 'Authorization': `Basic Zjk1NzNmNTVlNTdkMDMzMjM1OTU3MTMwYWQwZDM0MWY6NTdmNGY3YjE1`,  "Content-Type":"multipart/form-data" }
};
  try {
      const res:any = await axios.post("https://api-us1.scanii.com/v2.2/files", finalPayload, config);
      if(res.data.findings.length === 0){
        return true;
      }else{
        toast.error( 'A virus was detected in the uploaded file')
      return false;
      }
  } catch (error: any) {
     toast.error(error)
  }
};