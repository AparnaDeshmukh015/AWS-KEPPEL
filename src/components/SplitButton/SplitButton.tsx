import React from 'react'
import { SplitButton } from 'primereact/splitbutton'
import { twMerge } from 'tailwind-merge'

const SplitButtons = (props: any) => {
    return (
        <SplitButton
            className={twMerge(`${props?.className} Primary_SplitButton`)}
            label={props?.label}
            model={props?.model}
            disabled ={props?.disabled ? true :false}
            onClick={props?.handlerDownload}
        />
    )
}

export default SplitButtons