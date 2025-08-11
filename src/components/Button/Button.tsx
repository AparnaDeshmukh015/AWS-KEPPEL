import React, { memo } from "react";
import "./Button.css";
import { Button } from 'primereact/button';
import { useTranslation } from "react-i18next";
const Buttons = (props: any) => {
  const { t } = useTranslation();
  return (
    <Button
      {...props}
      type={props?.type || "button"}
      className={`${props?.className}`}
      disabled={props?.disabled ? props.disabled : false}
      label={t(`${props?.label}`)}
    />

  );
};

export default memo(Buttons);
