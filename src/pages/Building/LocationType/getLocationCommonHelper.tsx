
import { ENDPOINTS } from '../../../utils/APIEndpoints';
import { callPostAPI } from '../../../services/apis';

export const getCommonLocationMasterList = async() =>{
    const payload : any= { }
    const res = await callPostAPI(ENDPOINTS?.LOCATIONTYPE_MASTER, payload);
    return res;

}