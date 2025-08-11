import React, { useEffect, useState } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { Card } from 'primereact/card';
import { LOCALSTORAGE } from '../../../utils/constants';
import { ENDPOINTS } from '../../../utils/APIEndpoints';
import { callPostAPI } from '../../../services/apis';
import { useTranslation } from "react-i18next";
import { Button } from 'primereact/button';
import { toast } from 'react-toastify';

const LanguageChange = () => {
    const [selectedLanguage, setSelectedLanguage] = useState();
    const [languageData, setLanguageData] = useState()
    const [code, setCode] = useState();
    const { t, i18n } = useTranslation();

    const getLanguageList = async () => {
        const res = await callPostAPI(ENDPOINTS?.GET_LANGUAGE, {}, '');
        if (res?.FLAG === 1) {
            setLanguageData(res?.languageList)
        }
    }


    const handlerSubmit = async () => {
        const Payload: any =
        {
            "LANGUAGE_CODE": code,
        }
        const res = await callPostAPI(ENDPOINTS?.SAVE_LANGUAGE, Payload, '');
        if (res?.FLAG === true) {
            toast.success(res?.MSG)
        }
        const languageValue: any = code
        localStorage.setItem(`${LOCALSTORAGE?.LANGUAGE}`, languageValue)
        i18n.changeLanguage(languageValue);
        // window.location.reload();

    }

    useEffect(() => {
      
        (async function () {
            await getLanguageList()
           })();
    }, [])
    return (
        <>
        <section className="w-full">

                <div className="flex justify-between mt-1">
                    <div>
                        <h6 className="Text_Primary">Language Change</h6>
                    </div>
                    <div className='flex'>
                        <Button className='Primary_Button  w-20 me-2' label={t('Save')} onClick={() => handlerSubmit()} />
                    </div>
                </div>
                <Card className='mt-2'>
                    <div className="mt-1 grid grid-cols-1 gap-x-4 gap-y-4 md:grid-cols-4 lg:grid-cols-4">

                        <div>
                            <label className='Text_Secondary Input_Label'>Language Change </label>
                            <Dropdown value={selectedLanguage}
                                options={languageData}
                                name="Language"
                                optionLabel="LANGUAGE_DESCRIPTION"
                                onChange={(e) => {
                                    setSelectedLanguage(e.target.value);
                                    setCode(e.target.value.LANGUAGE_CODE)
                                }}
                                editable placeholder="Select a language "
                                className="w-full md:w-14rem" />
                        </div>
                    </div>

                </Card>
            </section>

        </>

    )
}

export default LanguageChange;