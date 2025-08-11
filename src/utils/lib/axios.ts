import axios from "axios";
import { API } from "../APIEndpoints";

export default axios.create({
    baseURL: API,
    headers: { 'Content-Type': 'application/json' },
})