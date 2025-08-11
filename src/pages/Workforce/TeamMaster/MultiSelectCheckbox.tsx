import React, { useEffect, useState } from "react";
import { Checkbox } from "primereact/checkbox";
import { useTranslation } from "react-i18next";

const MultiSelectCheckbox = ({ teamMasterCheckbox, setTeamMasterCheckbox, selectedCheckboxes, handleCheckboxChange, type,
  assetNonAsset, setWorkforceTypes,
  workForceTypes
}: any) => {
  const { t } = useTranslation();
  const [isCheckAll, setIsCheckAll] = useState<any>(false);
  const [list, setList] = useState<any>([]);

  const handleSelectAll = (e: any) => {
    const selectAllChecked = e.target.checked;
    const updatedList = list.map((item: any) => ({
      ...item,
      select: selectAllChecked === true ? 1 : 0,
    }));

    setList(updatedList);
    if (type === 'assetType') {

      setTeamMasterCheckbox((prevState: any) =>
        prevState.map((item: any) => ({
          ...item,
          // select: item.assetType === assetNonAsset?.key && e?.target.checked ? 1 : 0,
          select: item.assetType === assetNonAsset?.key && selectAllChecked === true ? 1 : 0,
        }))
      );
      handleCheckboxChange(updatedList?.filter((item: any) => item?.select === 1));
      setIsCheckAll(selectAllChecked);
    } else if (type === 'workForce') {

      // setTeamMasterCheckbox((prevState: any) =>
      //   prevState.map((item: any) => ({
      //     ...item,
      //     select: e?.target.checked === true ? 1 : 0,
      //   }))
      // );
      setWorkforceTypes((prevState: any) =>
        prevState.map((item: any) => ({
          ...item,
          select: e?.target.checked === true ? 1 : 0,
        }))
      );
      handleCheckboxChange(updatedList?.filter((item: any) => item?.select === 1));
      setIsCheckAll(selectAllChecked);
    }

  };
 
  const handleClick = (e: any) => {
    const { id, checked } = e.target;
    const updatedList = list.map((item: any) => ({
      ...item,
      select: item.assettype_id === id ? (checked ? 1 : 0) : item.select,
    }));
    setList(updatedList);


    if (type === 'assetType') {
      setTeamMasterCheckbox((prevState: any) =>
        prevState.map((item: any) => ({
          ...item,
          select: item.assettype_id === id ? (checked ? 1 : 0) : type === 'assetType' && assetNonAsset.key !== item?.assetType ? 0 : item?.select,
        }))
      );
      handleCheckboxChange(updatedList?.filter((item: any) => item.select === 1));
      setIsCheckAll(updatedList?.every((item: any) => item.select === 1));
    } else {
      setTeamMasterCheckbox((prevState: any) =>
        prevState.map((item: any) => ({
          ...item,
          select: item.assettype_id === id ? (checked ? 1 : 0) : item?.select,
        }))
      );
      setWorkforceTypes((prevState: any) =>
        prevState.map((item: any) => ({
          ...item,
          select: item.assettype_id === id ? (checked ? 1 : 0) : item?.select,
        }))
      );
      handleCheckboxChange(updatedList?.filter((item: any) => item.select === 1));
      setIsCheckAll(updatedList?.every((item: any) => item.select === 1));
    }

  };


  useEffect(() => {
    const teamAssign: any = teamMasterCheckbox?.filter((f: any) => f?.type === type)

    if (assetNonAsset?.key === 'A') {

      const assetType = teamAssign?.filter((f: any) => f?.assetType === "A")
      const assetAllSelect: any = assetType.map((asset: any) => asset?.select === 1)
      setIsCheckAll(assetAllSelect.every((val: any) => val === true ? 1 : 0))
      setList(assetType);

    } else if (assetNonAsset?.key === 'N') {
      const assetType = teamAssign?.filter((f: any) => f?.assetType === "N")
      const assetAllSelect: any = assetType.map((asset: any) => asset?.select === 1)
      setIsCheckAll(assetAllSelect.every((val: any) => val === true ? 1 : 0))
      setList(assetType);

    } else if (type === 'workForce') {
      setList(workForceTypes)
      const assetAllSelect: any = workForceTypes.map((asset: any) => asset?.select === 1)
      setIsCheckAll(assetAllSelect.every((val: any) => val === true ? 1 : 0))
    }
    // else {
    //   const assetAllSelect: any = teamAssign.map((asset: any) => asset?.select === 1)
    //    setIsCheckAll(assetAllSelect.every((val: any) => val === true ? 1 : 0))
    //   setList(teamAssign);

    // }


  }, [selectedCheckboxes, assetNonAsset, teamMasterCheckbox]);

  return (
    <>
      <div className="p-4">

        <ul>
          <li>
            <div>
              <div className="flex align-items-center">
                <Checkbox
                  inputId=""
                  name="selectAll"
                  id="selectAll"
                  value=""
                  onChange={handleSelectAll}
                  checked={isCheckAll}
                />
                <label htmlFor="selectAll" className="ml-2">{t("Select All")}</label>
              </div>
              <hr className="mb-2"></hr>
              <div className="flex w-full flex-wrap ">
                {list?.length > 0 ?
                  <>
                    {list?.map(({ assettype_id, assettype_name, type, select }: any) => {
                      return (
                        <>
                          <div className=" flex mt-2 w-96">
                            <Checkbox
                              key={assettype_id}
                              type="checkbox"
                              name={assettype_name}
                              id={assettype_id}
                              onChange={handleClick}
                              className="mr-2"
                              checked={select === 1}
                              value={type}
                            />
                            <label className="Text_Secondary Input_Label">
                              {assettype_name}
                            </label>
                          </div>
                        </>
                      );
                    })}
                  </> : ""}
              </div>
            </div>
          </li>
        </ul>
      </div>
    </>
  );
};

export default MultiSelectCheckbox;