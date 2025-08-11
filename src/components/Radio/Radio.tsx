import { RadioButton } from 'primereact/radiobutton'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next';
import "./Radio.css"
const Radio = (props: any) => {
    const { t } = useTranslation();
    const [selectedCategory, setSelectedCategory] = useState<any>("");
    useEffect(() => {
        if (props?.selectedData) {
            setSelectedCategory(props?.options?.filter((label: any) => label?.key === props?.selectedData)[0])
            props?.setValue(props?.name, props?.options?.filter((label: any) => label?.key === props?.selectedData)[0])
        }
    }, [props?.selectedData])

    return (
        <>
            <label className='Text_Secondary Input_Label'> {props?.labelHead && t(`${props?.labelHead}`)}</label>
            <div className='flex flex-wrap gap-5 mt-1'>
                {props?.options?.map((category: any) => {
                    return (
                        <div key={category.key} className="flex align-items-center">
                            <RadioButton inputId={category.key} name={category?.name} value={category}
                                // {...props}
                                onChange={(e) => {

                                    props?.setValue(props?.name, e?.value)
                                    setSelectedCategory(e?.value)
                                }}
                                disabled={props?.disabled}
                                checked={selectedCategory?.key === category?.key}
                            />
                            <label htmlFor={category?.key} className="ml-2 Text_Secondary Input_Label">{t(`${category?.name}`)}</label>
                        </div>
                    );
                })}
            </div>
        </>
    )
}

export default Radio