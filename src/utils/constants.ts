import moment from "moment";
import { callPostAPI } from "../services/apis";
import { ENDPOINTS } from "./APIEndpoints";
import { toast } from "react-toastify";
import { decryptData } from "./encryption_decryption";
import { parse, startOfDay } from "date-fns";
global.Buffer = require('buffer').Buffer;

export const enCryptionFlag: boolean = false;
export const COOKIES = {
  ACCESS_TOKEN: "accessToken",
  REFERESH_TOKEN: "refreshToken",
  LOGIN_TYPE: "loginType",
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
  OCCUPANT_VALIDITY: "OCCUPANT_VALIDITY"
};
export const ROLETYPECODE = {
  SYSTEM_ADMIN: "SA",
  SUPERVISOR: "S",
  TECHNICIAN: "T",
  OCCUPANT: "O",
  HELPDESK: "H"
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

export const INFRS_EQUIPMENT_OPTIONS = {
  dayNumList: [
    { DAY_NUM: 1, VIEW: "1" },
    { DAY_NUM: 2, VIEW: "2" },
    { DAY_NUM: 3, VIEW: "3" },
    { DAY_NUM: 4, VIEW: "4" },
    { DAY_NUM: 5, VIEW: "5" },
    { DAY_NUM: 6, VIEW: "6" },
    { DAY_NUM: 7, VIEW: "7" },
    { DAY_NUM: 8, VIEW: "8" },
    { DAY_NUM: 9, VIEW: "9" },
    { DAY_NUM: 10, VIEW: "10" },
    { DAY_NUM: 11, VIEW: "11" },
    { DAY_NUM: 12, VIEW: "12" },
    { DAY_NUM: 13, VIEW: "13" },
    { DAY_NUM: 14, VIEW: "14" },
    { DAY_NUM: 15, VIEW: "15" },
    { DAY_NUM: 16, VIEW: "16" },
    { DAY_NUM: 17, VIEW: "17" },
    { DAY_NUM: 18, VIEW: "18" },
    { DAY_NUM: 19, VIEW: "19" },
    { DAY_NUM: 20, VIEW: "20" },
    { DAY_NUM: 21, VIEW: "21" },
    { DAY_NUM: 22, VIEW: "22" },
    { DAY_NUM: 23, VIEW: "23" },
    { DAY_NUM: 24, VIEW: "24" },
    { DAY_NUM: 25, VIEW: "25" },
    { DAY_NUM: 26, VIEW: "26" },
    { DAY_NUM: 27, VIEW: "27" },
    { DAY_NUM: 28, VIEW: "28" },
    { DAY_NUM: 29, VIEW: "29" },
    { DAY_NUM: 30, VIEW: "30" },
    { DAY_NUM: 31, VIEW: "31" },
  ],
  InfraScheduledayNumList: [
    { DAY_NUM: 1, VIEW: "1" },
    { DAY_NUM: 2, VIEW: "2" },
    { DAY_NUM: 3, VIEW: "3" },
    { DAY_NUM: 4, VIEW: "4" },
    { DAY_NUM: 5, VIEW: "5" },
    { DAY_NUM: 6, VIEW: "6" },
    { DAY_NUM: 7, VIEW: "7" },
    { DAY_NUM: 8, VIEW: "8" },
    { DAY_NUM: 9, VIEW: "9" },
    { DAY_NUM: 10, VIEW: "10" },
    { DAY_NUM: 11, VIEW: "11" },
    { DAY_NUM: 12, VIEW: "12" },
    { DAY_NUM: 13, VIEW: "13" },
    { DAY_NUM: 14, VIEW: "14" },
    { DAY_NUM: 15, VIEW: "15" },
    { DAY_NUM: 16, VIEW: "16" },
    { DAY_NUM: 17, VIEW: "17" },
    { DAY_NUM: 18, VIEW: "18" },
    { DAY_NUM: 19, VIEW: "19" },
    { DAY_NUM: 20, VIEW: "20" },
    { DAY_NUM: 21, VIEW: "21" },
    { DAY_NUM: 22, VIEW: "22" },
    { DAY_NUM: 23, VIEW: "23" },
    { DAY_NUM: 24, VIEW: "24" },
    { DAY_NUM: 25, VIEW: "25" },
    { DAY_NUM: 26, VIEW: "26" },
    { DAY_NUM: 27, VIEW: "27" },
    { DAY_NUM: 28, VIEW: "28" },
    { DAY_NUM: 29, VIEW: "29" },
    { DAY_NUM: 30, VIEW: "30" },
    { DAY_NUM: 31, VIEW: "31" },
  ],
  weekNumList: [
    { MONTHLY_WEEK_NUM: 1, VIEW: "1st" },
    { MONTHLY_WEEK_NUM: 2, VIEW: "2nd" },
    { MONTHLY_WEEK_NUM: 3, VIEW: "3rd" },
    { MONTHLY_WEEK_NUM: 4, VIEW: "4th" },
    { MONTHLY_WEEK_NUM: 5, VIEW: "5th" },
  ],
  monthNumList: [
    { MONTH_NUM: 1, VIEW1: "1st", VIEW: "January" },
    { MONTH_NUM: 2, VIEW1: "2nd", VIEW: "February" },
    { MONTH_NUM: 3, VIEW1: "3rd", VIEW: "March" },
    { MONTH_NUM: 4, VIEW1: "4th", VIEW: "April" },
    { MONTH_NUM: 5, VIEW1: "5th", VIEW: "May" },
    { MONTH_NUM: 6, VIEW1: "6th", VIEW: "June" },
    { MONTH_NUM: 7, VIEW1: "7th", VIEW: "July" },
    { MONTH_NUM: 8, VIEW1: "8th", VIEW: "Augest" },
    { MONTH_NUM: 9, VIEW1: "9th", VIEW: "September" },
    { MONTH_NUM: 10, VIEW1: "10th", VIEW: "October" },
    { MONTH_NUM: 11, VIEW1: "11th", VIEW: "November" },
    { MONTH_NUM: 12, VIEW1: "12th", VIEW: "December" },
  ],
  monthNumList1: [
    { MONTH_NUM: 1, VIEW: "1st" },
    { MONTH_NUM: 2, VIEW: "2nd" },
    { MONTH_NUM: 3, VIEW: "3rd" },
    { MONTH_NUM: 4, VIEW: "4th" },
    { MONTH_NUM: 5, VIEW: "5th " },
    { MONTH_NUM: 6, VIEW: "6th" },
    { MONTH_NUM: 7, VIEW: "7th" },
    { MONTH_NUM: 8, VIEW: "8th" },
    { MONTH_NUM: 9, VIEW: "9th" },
    { MONTH_NUM: 10, VIEW: "10th" },
    { MONTH_NUM: 11, VIEW: "11th" },
    { MONTH_NUM: 12, VIEW: "12th" },
  ],
  weekDataLabel: [
    { VIEW: "Sunday", DAY_CODE: 1 },
    { VIEW: "Monday", DAY_CODE: 2 },
    { VIEW: "Tuesday", DAY_CODE: 3 },
    { VIEW: "Wednesday", DAY_CODE: 4 },
    { VIEW: "Thursday", DAY_CODE: 5 },
    { VIEW: "Friday", DAY_CODE: 6 },
    { VIEW: "Saturday", DAY_CODE: 7 },
  ],
  RepeatUntil: [
    { REPEAT_NAME: "No. Of Occurenece", REPEAT_ID: 1 },
    { REPEAT_NAME: "End date", REPEAT_ID: 2 },
    { REPEAT_NAME: "No End Date", REPEAT_ID: 3 }
  ],
};

export const IdealTimeConfiguration = {
  SETACTIVITYTIME: 900000,
  SETCURRENTTIME: Date.now(),
  SETINTERVAL: 3000,
  SETAFTERACTIVITYTIME: 1200000,
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
  const facilityData = JSON.parse(localStorage.getItem(LOCALSTORAGE.FACILITY)!);
  const facilityDetails: any =
    facilityData?.length !== 0
      ? JSON.parse(localStorage.getItem(LOCALSTORAGE.FACILITYID)!)
      : "";
  return facilityDetails?.DATE_FORMAT;
};

export const dateFormat1 = () => {
  const facilityData = JSON.parse(localStorage.getItem(LOCALSTORAGE.FACILITY)!);
  const facilityDetails: any =
    facilityData?.length !== 0
      ? JSON.parse(localStorage.getItem(LOCALSTORAGE.FACILITYID)!)
      : "";

  return facilityDetails?.DATE_FORMAT?.split("-YYYY")[0];
};

export const dateFormatYear = () => {
  const facilityData: any = JSON.parse(
    localStorage.getItem(LOCALSTORAGE.FACILITYID)!
  );

  return facilityData?.DATE_FORMAT?.split("-YYYY")[0];
};



//Anand Verma 14/10/2024
export const helperNullDate = (date: any) => {
  if (!date) return "";

  const dateCheck = date.split("T")[0];
  if (dateCheck === "1900-01-01") {
    return ""; // Return null for the specific date
  } else {

    return new Date(date); // Return the Date object
  }
};

export const saveTracker = async (data: any) => {
  data = "";
  let formData: any =
    localStorage.getItem("currentMenu") !== undefined
      ? localStorage.getItem("currentMenu")
      : "";

  let payloadData: any = formData !== undefined ? JSON.parse(formData) : "";

  // return;
  const payload = {
    FORM_NAME: payloadData?.FUNCTION_DESC ?? "",
  };
  try {
    await callPostAPI(
      ENDPOINTS.SAVE_ACTIVITY_TRACKER,
      payload,
      payloadData?.FUNCTION_CODE ?? ""
    );
  } catch (error: any) {
    console.log(error, data);
  }
};


export function formateDate(date: string) {
  const facilityData = JSON.parse(((localStorage.getItem(LOCALSTORAGE.FACILITY)))!);
  const facilityDetails: any = facilityData?.length !== 0 ? JSON.parse(
    localStorage.getItem(LOCALSTORAGE.FACILITYID)!
  ) : "";
  if (date === '') {
    return ''
  } else {
    return moment(date, `${facilityDetails?.DATE_FORMAT ?? 'DD-MM-YYYY'} hh:mm:ss A`).format(`${facilityDetails?.DATE_FORMAT ?? 'DD/MM/YYY'}, HH:mm`);
  }
}

export function onlyDateFormat(date: string) {
  const facilityData = JSON.parse(((localStorage.getItem(LOCALSTORAGE.FACILITY)))!);
  const facilityDetails: any = facilityData?.length !== 0 ? JSON.parse(
    localStorage.getItem(LOCALSTORAGE.FACILITYID)!
  ) : '';
  if (date === '') {
    return ""
  } else {
    return moment(date).format(facilityDetails?.DATE_FORMAT);
  }
}

export const removeLocalStorage = () => {
  localStorage.removeItem(LOCALSTORAGE?.LANGUAGE);
  localStorage.removeItem(LOCALSTORAGE?.ROLE_ID);
  localStorage.removeItem(LOCALSTORAGE?.USER_ID);
  localStorage.removeItem(LOCALSTORAGE?.FACILITYID);
  localStorage.removeItem(LOCALSTORAGE?.ROLETYPECODE);
  localStorage.removeItem(LOCALSTORAGE?.ROLE_HIERARCHY_ID);
  localStorage.removeItem('USER_NAME');
  localStorage.removeItem('Id');
  localStorage.removeItem('USER');
  localStorage.removeItem('MAKE_ID');
  localStorage.removeItem('ROLE_NAME');
  localStorage.removeItem('currentMenu');
  localStorage.removeItem('TEAM_ID');
  localStorage.removeItem('LOCATIONNAME');
  localStorage.clear();

}

// export const scanfileAPI = async (binary: string) => 

//   const finalPayload = { file: binary }
//   const config = {
//     headers: { 'Authorization': `Basic ${process.env.REACT_APP_SCANNI_API_KEY}`, "Content-Type": "multipart/form-data" }
//   };
//   try {
//     // setLoading(true)
//     const res: any = await axios.post(`${process.env.REACT_APP_SCANNED_FILE_URL}`, finalPayload, config);
//     if (res.data.findings.length === 0) {
//       // setLoading(false)
//       return true;
//     } else {
//       toast.error('A virus was detected in the uploaded file')
//       // setLoading(false)
//       return false;
//       }
//   } catch (error: any) {

//     toast.error(error)
//   }finally{
//       //  setLoading(false)
//   }
// };

export const base64ToBinary = (base64: string) => {
  try {
    const buffer = Buffer.from(base64, 'base64').toString('binary');
    return buffer;
  } catch (error: any) {
    toast.error(error)
    return '';
  }
};

export const scanfileAPI = async (base64: string, filename?: string) => {
  let updatebase64 = base64.replace(/^.*base64,/, '');

  const binary = base64ToBinary(updatebase64);
  const finalPayload = { FILE_NAME: filename, DOC_DATA: updatebase64 }

  try {
    const res: any = await callPostAPI(`${ENDPOINTS.DOC_UPLOAD_CHECK}`, finalPayload, 'AS067', true);

    if (res.FLAG === true) {
      return true;
    } else {
      if (res.APIMSG !== "") {
        toast.error('A virus was detected in the uploaded file')
      }
      else {
        toast.error(res.APIMSG)
      }
      return false;
    }
  } catch (error: any) {

    toast.error(error)
  } finally {
    //  setLoading(false)
  }
};

export const priorityIconList: any = [
  { "ICON_ID": 1, "ICON_NAME": "pi pi-angle-down" },
  { "ICON_ID": 2, "ICON_NAME": "pi pi-angle-double-up" },
  { "ICON_ID": 3, "ICON_NAME": "pi pi-equals" },
  { "ICON_ID": 4, "ICON_NAME": "pi pi-angle-up" }
]

export const dateFormatDropDownList = (dateDataList: any) => {
  const data: any = dateDataList?.map((list: any) => {
    return (
      {
        ...list,
        SUB_DATE_DESC: list?.DATE_SEQNO === "CU" ? "" : `${moment(list.FROM_DATE).format(dateFormat1())} - ${moment(list.TO_DATE).format(dateFormat())}`

      }
    )
  })
  return data;
}


export const isOccupantValidityToday = (): boolean => {
  const format = "dd-MM-yyyy";
  const storedDateStr = decryptData(localStorage.getItem(LOCALSTORAGE?.OCCUPANT_VALIDITY));
  // const storedDateStr1 = parse(storedDateStr, format.replace("DD-MM-YYYY", "dd-MM-yyyy"), new Date());


  if (storedDateStr === null || storedDateStr === "" || storedDateStr === undefined) {
    return true
  } else {
    const finalDate = startOfDay(parse(storedDateStr, format, new Date()));
    const today = startOfDay(new Date());
    return today <= finalDate;
  }
}