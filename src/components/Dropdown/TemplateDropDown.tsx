import { Dropdown } from "primereact/dropdown";
import "./Dropdown.css";
import { memo, useEffect } from "react";
import { useTranslation } from "react-i18next";
const SelectTemplate = (props: any) => {
  const { t } = useTranslation();
  const selectedDropDownTemplate = (option: any, props: any) => {
    if (option) {
      return (
        <div className="flex align-items-center">
          <div>{option.ASSET_NAME}</div>
        </div>
      );
    }

    return <span>{props.placeholder}</span>;
  };

  const selectOptionTemplate = (option: any) => {
    return (
      <div className="flex align-items-center">
        <div>{option.ASSET_NAME}</div>
        <div>{option.LOCATION}</div>
      </div>
    );
  };

  useEffect(() => {
    if ((props?.setValue || props?.selectedData)) {
      props?.setValue(props?.name, props?.options?.filter((item: any) => item[props?.findKey] === props?.selectedData)[0])
    }
  }, [props?.options, props?.selectedData])
  return (
    <>

      <label className='Text_Secondary Input_Label'>{props?.label}
        {props?.require && <span className='text-red-600'> *</span>}
      </label>
      <div className={`${props?.invalid ? 'errorBorder' : ''}`}>
        <Dropdown
          className={`${props?.className} w-full`}
          valueTemplate={selectedDropDownTemplate}
          itemTemplate={selectOptionTemplate}
          placeholder={t(`Please Select`)}
          filter
          {...props}
          options={props?.options || []}
        />
      </div>
    </>
  );
};

export default memo(SelectTemplate);
