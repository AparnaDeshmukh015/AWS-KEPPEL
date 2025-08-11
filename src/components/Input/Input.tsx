import React, { memo } from 'react'
import './Input.css'
import { twMerge } from 'tailwind-merge'
import { InputText } from 'primereact/inputtext';
import { useTranslation } from 'react-i18next';

const InputField = (props: any) => {
    const { t } = useTranslation();

    return (

        <div className={`${props?.invalid ? 'errorBorder' : ''}`}>
            <div className={twMerge(props?.containerclassname)}>
                <span className="p-input-icon-left w-full">
                    {props?.type === "search" && <i className="pi pi-search ml-3" />}
                    {props?.label &&
                        <label className='Text_Secondary Input_Label'>
                            {t(`${props?.label}`)}
                            {props?.require && <span className='text-red-600'> *</span>}
                        </label>
                    }
                    <InputText
                        {...props}
                        placeholder={props?.placeholder === true ? t(`Select Equipment`) : props?.placeholder === "role" ? t(`Select Building & Role`) : t(`Please Enter`)}
                        className={twMerge(props.className, `${props?.error && "requiredField"}`)}
                        disabled={props?.disabled === true ? "disabled" : ""}
                        type={props?.type}
                    />
                    <p className='Helper_Text mt-1 text-red-600'> {props?.invalidMessage} </p>
                </span>
            </div>
        </div>
    )
}

export default memo(InputField)