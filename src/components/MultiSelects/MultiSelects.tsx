import React, { useEffect } from 'react'
import './MultiSelects.css'
import { MultiSelect } from 'primereact/multiselect'
import { useTranslation } from 'react-i18next';

const MultiSelects = (props: any) => {
    const { t } = useTranslation();

    useEffect(() => {
        if (props?.selectedData) {
            props?.setValue(props?.name, props?.options?.filter((item: any) => props?.selectedData.find((check: any) => item[props?.findKey] === check[props?.findKey])))
        }
    }, [props?.selectedData])
    return (
        <>
            <label className='Text_Secondary Input_Label'>
                {props?.label && t(`${props?.label}`)} {props?.require && <span className="text-red-600"> *</span>}
            </label>
            <div className={`${props?.invalid ? "errorBorder" : ""}`}>
                <MultiSelect
                    className={`${props?.className} w-full md:w-20rem`}
                    options={props?.options}
                    optionLabel={props?.optionLabel}
                    filter
                    placeholder={props?.isLocation ? t(`Select Location`) : t(`Please Select`)}
                    // maxSelectedLabels={props?.maxSelectedLabels || 4}
                    {...props}
                />
            </div>
        </>
    )
}

export default MultiSelects