import React, { useRef } from 'react';
import { Menu } from 'primereact/menu';

const CustomMenu = React.forwardRef((props: any, ref: any) => {
    const menuRef: any = useRef(null);

    // Intercepting onBlur and onFocus events
    const handleBlur = () => {
    //    e?.stop
    };

    const handleFocus = () => {
        // Do nothing or handle it as per your requirement
    };

    return (
        <Menu {...props} ref={(el) => { menuRef.current = el; if (ref) ref.current = el; }} onBlur={handleBlur} onFocus={handleFocus} />
    );
});

export default CustomMenu;
