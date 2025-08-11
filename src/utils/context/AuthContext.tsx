import { createContext } from "react"

const AuthContext = createContext({ status: '', login: () => { }, logout: () => { } });
export default AuthContext