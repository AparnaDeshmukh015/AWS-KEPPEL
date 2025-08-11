import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { Card } from "primereact/card";
import Field from "../../../components/Field";
import Select from "../../../components/Dropdown/Dropdown";
import { DataTable, } from "primereact/datatable";
import { Column } from "primereact/column";
import { callPostAPI } from "../../../services/apis";
import { ENDPOINTS } from "../../../utils/APIEndpoints";
import { useLocation, useOutletContext } from "react-router-dom";

const VendorSorCompare = () => {

  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { },
  } = useForm({
    defaultValues: {
      PART_NAME: ""
    },
    mode: "all",
  });

  const [part, setPart] = useState<any>([]);
  const [selectedPart, setselectedPart] = useState<any>();
  const [vendorComparisionList, setvendorComparisionList] = useState<any>([]);
  const [, menuList]: any = useOutletContext();
  let { pathname } = useLocation();
  const currentMenu = menuList
    ?.flatMap((menu: any) => menu?.DETAIL)
    .filter((detail: any) => detail.URL === pathname)[0];

  const getpartlist = async () => {
    try {
      const res = await callPostAPI(ENDPOINTS.GET_INVENTORY_PARTLIST);
      if (res?.FLAG === 1) {
        setPart(res?.STORELIST)
      }

    } catch (error) {

    }

  };



  const getSORcomparisonDetais = async (partId: any) => {
    let payload;
    if (selectedPart) {
      payload = {

        PART_ID: partId
      }
    }
    const res = await callPostAPI(ENDPOINTS.VENDOR_SOR_COMPARISION_LIST, payload);
    if (res?.FLAG === 1) {
      // setPart(res?.STORELIST)
      setvendorComparisionList(res?.VENDORMANAGEMENTMASTERSLIST)
    } else {
      setvendorComparisionList([])
    }
  };
  useEffect(() => {
    if (currentMenu?.FUNCTION_CODE) {
      (async function () {
        await getpartlist()
      })();
    }
  }, [])


  useEffect(() => {
    if (currentMenu?.FUNCTION_CODE) {
      (async function () {
        if (selectedPart)
          await getSORcomparisonDetais(selectedPart?.PART_ID)
      })();
    }
  }, [selectedPart, currentMenu])


  const onSubmit = useCallback(async () => { }, []);
  return (
    <>
      <section className="w-full">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex justify-between mt-1">
            <div>
              <h6 className="Text_Primary">Vendor SOR Comparison</h6>
            </div>
            {/* <Button
              type="submit"
              className="Primary_Button  w-20 me-2"
              label={"Save"}
            /> */}
          </div>
          <Card className="mt-2">
            <div className="mt-1 grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-3 lg:grid-cols-3">
              <Field
                controller={{
                  name: "PART_NAME",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <Select
                        options={part}
                        {...register("PART_NAME", {
                          onChange: (e: any) => {
                            setselectedPart(e.target.value)

                          },
                        }
                        )}
                        label={"Part Name"}
                        optionLabel="PART_NAME"
                        require={true}
                        setValue={setValue}
                        {...field}
                        value={selectedPart}
                      />
                    );
                  },
                }}
              />
            </div>
          </Card>
          <Card className="mt-2">
            <div className="">
              <DataTable
                value={vendorComparisionList}
                showGridlines
                emptyMessage={t("No Data found.")}
                dataKey="VENDOR_ID"
              >
                <Column field="VENDOR_NAME" header={t("Vendor Name")}></Column>
                <Column field="SOR" header={t("SOR(In SGD)")}></Column>
                <Column field="MIN_QTY" header={t("Min order")}></Column>
                {/* <Column
                  field="SOR_VALIDITY"
                  header={t("SOR Validity")}
                ></Column> */}
                <Column field="SOR_FROM_DATE" header={t("From Date")}></Column>
                <Column field="SOR_TO_DATE" header={t("To Date")}></Column>
                <Column
                  field="WARRANTY_DUR"
                  header={t("Warranty Duration)")}
                ></Column>
                <Column field="REMARKS" header={t("Remarks")}></Column>
                <Column field="UOM_NAME" header={t("UOM")}></Column>
              </DataTable>
            </div>
          </Card>
        </form>
      </section>
    </>
  );
};

export default VendorSorCompare;
