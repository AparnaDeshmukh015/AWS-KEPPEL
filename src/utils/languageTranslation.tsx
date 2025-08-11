import { useTranslation } from "react-i18next";
export const LanguageTranslation = () => {
    const { i18n } = useTranslation();
    const language: any = localStorage.getItem('language') ? localStorage.getItem('language') : 'EN';
    i18n.changeLanguage(language);
    return (<></>)
}