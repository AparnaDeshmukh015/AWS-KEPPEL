import React, { useEffect, useState } from 'react';
import useIdle from "./useIdleTimeout";
import { useNavigate } from 'react-router-dom';
import { COOKIES, removeLocalStorage } from './constants';
import { Cookies } from 'react-cookie';
import { PATH } from './pagePath';
import { confirmDialog, ConfirmDialog } from 'primereact/confirmdialog';

const IdleTimer = (props:any) => {
    const navigate = useNavigate();
    const [visible, setVisible] = useState(false);
    const handleIdle = () => {
        setVisible(true);
    }
    const { idleTimer } = useIdle({ onIdle: handleIdle,  idleTime: 10 * 1000})//After 15 min show pop up

    const accept = () => {
        props?.setIdealTimeStatus(false)
        props?.setLastActivityTime(Date.now())
        setVisible(false);
        idleTimer.reset()
    }

    const reject = () => {
        localStorage.removeItem("token");
        let cookies = new Cookies();
        cookies.remove(COOKIES.ACCESS_TOKEN, { path: `${process.env.REACT_APP_CUSTOM_VARIABLE}` });
        removeLocalStorage();
        setTimeout(() => {
            navigate(PATH.LOGIN);
            window.location.reload();
        }, 500);
        setVisible(false)
    }

    useEffect(() => {
        let autoLogoutTimer:any='';
          confirmDialog({
            message: 'Your Session is about to expire. You will be automatically signed out.To continue your session select yes',
            header: 'Need More Time?',
            icon: 'pi pi-clock',
            defaultFocus: 'accept',
            accept,
            reject,
            
        });
    
        autoLogoutTimer = setTimeout(reject, 1200 * 1000);//after pop up 5 min automatically logout 
        return () => {
            clearTimeout(autoLogoutTimer);
        };
    }, []);

    return (
        <>
            <ConfirmDialog visible={visible}
                style={{ width: '30vw' }}
                breakpoints={{ '1100px': '75vw', '960px': '100vw' }}
                
                />
        </>

    )
}

export default IdleTimer;