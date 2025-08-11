import { Checkbox } from 'primereact/checkbox'
import React, { memo } from 'react'
import "./Checkbox.css"
import { twMerge } from 'tailwind-merge'
import { useTranslation } from 'react-i18next'
import { Tooltip } from 'primereact/tooltip'
const Checkboxs = (props: any) => {
    const { t } = useTranslation();
    const handleChange = (e: any) => {
        props?.setValue(props?.name, e.target.checked)
    }
   
    return (
        <>
            <div className={`  ${props?.invalid ? 'Required' : ''}`}>
                <Checkbox
                    id={props?.name}
                    className={twMerge(`${props?.className}`)}
                    {...props}
                    onChange={(e) => { handleChange(e) }}
                    // onBlur={e => false}
                    checked={props?.value}
                ></Checkbox>
                <label htmlFor={props?.name} className="ml-2 md:mt-7 Text_Secondary Input_Label"> {t(`${props?.label}`)}
                    {props?.require && <span className='text-red-600'> *</span>}</label>
            </div>


            {props?.isTooltip &&
                <>
                    <i className="ml-2 pi pi-info-circle cursor-pointer custom-target-icon" data-pr-tooltip="It refers to the exact storage location inventory"></i>
                    <Tooltip target=".custom-target-icon" />
                </>

            }
        </>

        // </Checkbox>
    )
}

export default memo(Checkboxs)