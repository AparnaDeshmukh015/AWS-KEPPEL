// import { GETLOCALSTORAGE} from '../../../utils/constants';
import { ENDPOINTS } from '../../../utils/APIEndpoints';
import { callPostAPI } from '../../../services/apis';

export const getBuildingDetails = async(locationId:any, facilityId:any) =>{
    
    let payload :any= {
        // "USER_ID": GETLOCALSTORAGE?.USER_ID,
        // "ROLE_ID": GETLOCALSTORAGE?.ROLE_ID,
        // "LANGUAGE_CODE": GETLOCALSTORAGE?.LANGUAGE,
        "FACILITY_ID":facilityId,
        // "PORTFOLIO_ID":1,
        "LOCATION_ID":locationId ,
        "LOGIN_TYPE": "W",
      
       }
       
       const res = await callPostAPI(ENDPOINTS?.BUILDING_DETAILS, payload)
       
       return res;
}