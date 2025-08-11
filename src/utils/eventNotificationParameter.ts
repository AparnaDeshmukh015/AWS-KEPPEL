
import { callPostAPI } from "../services/apis";
import { ENDPOINTS } from "./APIEndpoints";
import { LOCALSTORAGE } from "./constants";
import { decryptData } from "./encryption_decryption";

const userId: any = decryptData(localStorage.getItem("USER_ID"));
function f() {
  return JSON.parse(
    localStorage.getItem(`${LOCALSTORAGE.FACILITYID}`)!
  )?.FACILITY_ID
}

export const eventNotification: any = {
  USER_ID: parseInt(userId),
  FACILITY_ID: "",
  EVENT_TYPE: "",
  FUNCTION_CODE: "",
  STATUS_CODE: "",
  WO_NO: "",
  MR_NO: "",
  PARA1: "",
  PARA2: "",
  PARA3: "",
  PARA4: "",
  PARA5: "",
  PARA6: "",
  PARA7: "",
  PARA8: "",
  PARA9: "",
  PARA10: "",
  PARA11: "",
  PARA12: "",
  PARA13: "",
  PARA14: "",
  PARA15: "",
  PARA16: "",
  PARA17: "",
  PARA18: "",
  PARA19: "",
  PARA20: "",
  PARA21: "",
  PARA22: "",
  PARA23: "",
  PARA24: "",
  PARA25: "",
};

export const helperEventNotification = async (eventPayload: any) => {
 
  const fd = f()
  eventPayload.FACILITY_ID = fd;
 
  try {
    const res: any = await callPostAPI(
      ENDPOINTS.EVENT_NOTIFICATION,
      eventPayload
    );
    if (res?.FLAG === true) {
    } else {
    }
  } catch (error: any) {
  }
};
