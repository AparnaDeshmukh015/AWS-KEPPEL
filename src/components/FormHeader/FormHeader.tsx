import React from 'react'
import Buttons from '../Button/Button'
import { useLocation, useOutletContext } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PATH } from '../../utils/pagePath';

const FormHeader = (props: any) => {
    let { pathname } = useLocation();
    const location: any = useLocation();
    const { t } = useTranslation()
    const [selectedFacility, menuList]: any = useOutletContext();
    const currentMenu = menuList?.flatMap((menu: any) => menu?.DETAIL)?.filter((detail: any) => detail?.URL === pathname)[0]
    let { search } = useLocation();
    return (
        <div className="flex flex-wrap justify-between mt-1">
            <div>
                <h6 className="Text_Primary">
                    {t(`${props?.isSelected ? "Edit" : "Add"}`)} {props?.headerName}  {location?.pathname === PATH?.CURRENTSTATUSCONFIG
                        || location?.pathname === PATH?.ASSETMASTERCONFIGURATION
                        || location?.pathname === PATH?.SAVENUMBERRANGECONFIG
                        ? "Configuration" : ""}{" "}
                </h6>
            </div>
            <div className="flex">
                {search === '?edit=' ?
                    <>

                        {currentMenu?.UPDATE_RIGHTS === "True" && (<Buttons
                            type="submit"
                            className="Primary_Button  w-20 me-2"
                            label={"Save"}
                            disabled={props.isSubmit}
                        />)}</> :
                    <>
                        {search === '?add=' ? <Buttons
                            type="submit"
                            className="Primary_Button  w-20 me-2"
                            label={"Save"}
                        /> : ""}</>}
                <Buttons
                    className="Secondary_Button w-20 "
                    label={"List"}
                    onClick={props?.isClick}
                />
            </div>
        </div>
    )
}

export default FormHeader
