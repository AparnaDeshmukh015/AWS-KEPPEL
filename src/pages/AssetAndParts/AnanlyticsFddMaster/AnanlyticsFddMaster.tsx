import { useEffect} from "react";
import { toast } from 'react-toastify'
import Table from "../../../components/Table/Table";
import { callPostAPI } from "../../../services/apis";
import { ENDPOINTS } from "../../../utils/APIEndpoints";
import { useLocation, useOutletContext } from "react-router-dom";
import TableListLayout from "../../../layouts/TableListLayout/TableListLayout";
import AnanlyticsFddMasterForm from "./AnanlyticsFddMasterForm";

const AnanlyticsFddMaster = (props: any) => {
    let { pathname } = useLocation();
    const [selectedFacility, menuList]: any = useOutletContext();
    const currentMenu = menuList?.flatMap((menu: any) => menu?.DETAIL).filter((detail: any) => detail.URL === pathname)[0];
    //const [showLoader, setShowLoader] = useState<boolean>(false);

    const getAPI = async () => {
        try {
            const res = await callPostAPI(ENDPOINTS.GET_ASSET_MASTER_LIST, null, currentMenu?.FUNCTION_CODE)
           props?.setData(res?.ASSESTMASTERSLIST || []);
            localStorage.setItem('currentMenu', JSON.stringify(currentMenu))
        } catch (error: any) {
            toast.error(error)
        }
    }
    useEffect(() => {
        if (currentMenu?.FUNCTION_CODE) {
            //API Calling Done here
            (async function () {
                await getAPI()
               })();
        }
    }, [selectedFacility, currentMenu]);
    return !props?.search ? (
        <>
           
                <Table
                    tableHeader={{
                        headerName: currentMenu?.FUNCTION_DESC,
                        search: true,
                    }}
                    dataKey={currentMenu?.FUNCTION_DESC}
                    columnTitle={["FDD_ID", "FDD_NAME", "ASSETTYPE_NAME", "ACTIVE"]}
                    customHeader={["FDD ID", "FDD NAME", "Equipment Type", "Active"]}
                    columnData={props?.data}
                    clickableColumnHeader={["FDD_ID"]}
                    filterFields={["FDD_ID", "FDD_NAME", "ASSETTYPE_NAME"]}
                    setSelectedData
                    isClick={props?.isForm}
                    handelDelete={props?.handelDelete}
                    getAPI={getAPI}
                    // deleteURL={ENDPOINTS.DELETE_ASSETGROUPMASTER}
                    DELETE_ID="FDD_ID"
                /></>
    ) : (
        <AnanlyticsFddMasterForm
            headerName={currentMenu?.FUNCTION_DESC}
            setData={props?.setData}
            getAPI={getAPI}
            selectedData={props?.selectedData}
            isClick={props?.isForm}
            functionCode={currentMenu?.FUNCTION_CODE}
        />
    );
};

const Index: React.FC = () => {
    return (
        <TableListLayout>
            <AnanlyticsFddMaster />
        </TableListLayout>
    );
};

export default Index;
