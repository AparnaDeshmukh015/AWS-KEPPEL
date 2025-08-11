import React, { memo, useState } from 'react';
import { useLocation, useOutletContext, useSearchParams } from 'react-router-dom';
interface ChildProps {
    FUNCTION_DESC: string | undefined;
    data: any[];
    setData: React.Dispatch<React.SetStateAction<any[]>>;
    columnTitle: string[] | undefined;
    setColumnTitle: React.Dispatch<React.SetStateAction<string[] | undefined>>;
    customHeader: any;
    FUNCTION_CODE: any;
    setCustomHeader: React.Dispatch<React.SetStateAction<any>>;
    selectedData: any;
    setSelectedData: React.Dispatch<React.SetStateAction<any>>;
    isForm: (selected: any) => void;
    search: string;
}

interface TableListLayoutProps {
    children: React.ReactElement<ChildProps> | React.ReactElement<ChildProps>[];
}

const TableListLayout: React.FC<TableListLayoutProps> = ({ children }) => {
    let { pathname } = useLocation();
    const [, menuList]: any = useOutletContext();
    let { search } = useLocation();
    let [, setSearchParams] = useSearchParams();
    const currentMenu = menuList?.flatMap((menu: any) => menu?.DETAIL).filter((detail: any) => detail.URL === pathname)[0]
    const [data, setData] = useState<any[]>([]);
    // const [columnTitle, setColumnTitle] = useState<string[]>();
    // const [customHeader, setCustomHeader] = useState<any>([])
    const [selectedData, setSelectedData] = useState<any>(null)
   
    const [isFormClick, setIsFormClick] = useState<boolean>((search === "?add=" || search === "?edit=") ? true : false)
    const isForm = (selected: any) => {
        if (isFormClick) {
            setSearchParams("")
        } else {
            selected?.rowItem ? setSearchParams("edit") : setSearchParams("add")
        }
        setSelectedData(selected?.rowItem)
        setIsFormClick(!isFormClick)
    }

    return (
        <React.Fragment>
            {React.Children.map(children, child => {
                if (React.isValidElement(child)) {
                    return React.cloneElement(child, {
                        FUNCTION_DESC: currentMenu?.FUNCTION_DESC,
                        FUNCTION_CODE: currentMenu?.FUNCTION_CODE,
                        data,
                        setData,
                        // columnTitle,
                        // setColumnTitle,
                        // customHeader,
                        // setCustomHeader,
                        selectedData,
                        setSelectedData,
                        isForm,
                        search,
                    });
                }
                return child;
            })}
        </React.Fragment>
    );
}

export default memo(TableListLayout);
