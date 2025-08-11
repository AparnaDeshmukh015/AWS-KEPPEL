import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { callPostAPI } from "../../../services/apis";
import { ENDPOINTS } from "../../../utils/APIEndpoints";
import Button from "../../../components/Button/Button";
import { Card } from "primereact/card";
import Field from "../../../components/Field";
import Select from "../../../components/Dropdown/Dropdown";
import { TabPanel, TabView } from "primereact/tabview";
import { useLocation, useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import "../../../components/Checkbox/Checkbox.css";
import Cracker from "../../../assest/images/Text.png";
import "../../../components/Table/Table.css";
import { getChildrenValues, convertApiResponse } from "./helperRolesandRight";
import TreeTableRight from "./TreeTableRight";
import SplitButtons from "../../../components/SplitButton/SplitButton";
import { ExportCSV } from "../../../utils/helper";
import { saveTracker } from "../../../utils/constants";
import { decryptData } from "../../../utils/encryption_decryption";

const UserRoleRights = () => {
  const { t } = useTranslation();
  const [nodes, setNodes] = useState<any | null>([]);
  const { pathname }: any = useLocation();
  const [roleId, setRoleId] = useState();
  const [activeIndex, setActiveIndex] = useState(0);
  const [excelData, setExcelData] = useState<any | null>([])
  const [selectedFacility, menuList]: any = useOutletContext();
  const [roles, SetRoles] = useState<any | null>([]);
  const [roleName, setRoleName] = useState<any | null>()
  const currentMenu = menuList
    ?.flatMap((menu: any) => menu?.DETAIL)
    .filter((detail: any) => detail.URL === pathname)[0];

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      USER_ROLE: "",
      MODE: "A",
      ROLERIGHTS_LIST: "",
      PARA: { para1: "User Roles and Rights", para2: " Updated " },
    },
    mode: "onSubmit",
  });

  const handleChange = async (e: any) => {
    try {

      setRoleId(e.target.value.ROLE_ID);
      setRoleName(e?.target?.value?.ROLE_NAME)
      if (e.target.value.ROLE_ID !== 0) {
        const payload: any = {
          ROLE_ID: e.target.value.ROLE_ID,
          ROLETYPE_CODE: e.target.value.ROLETYPE_CODE
        };

        const res = await callPostAPI(ENDPOINTS?.Roles_Right, payload);
        if (res?.FLAG === 1) {
          if (res?.MENU_LIST?.length > 0)
            setNodes(convertApiResponse(res?.MENU_LIST));
        } else {
          if (nodes?.length > 0) {
            const newData = nodes.map((parent: any) => {
              return {
                ...parent,
                data: {
                  ...parent.data,
                  noAccess: true,
                  view: false,
                  add: false,
                  delete: false,
                  update: false,
                },
                children: parent.children.map((child: any) => {
                  return {
                    ...child,
                    data: {
                      ...child.data,
                      noAccess: true,
                      view: false,
                      add: false,
                      delete: false,
                      update: false,
                    },
                  };
                }),
              };
            });

            setNodes(newData);
          }
        }
        const data: any = []
        const trasactionData: any = []
        res?.MENU_LIST?.forEach((menu: any, index: any) => {
          menu.DETAIL?.forEach((m: any, id: any) => {
            if (m?.NO_ACCESS === "False" && activeIndex === 0 && m.ISTRANSACTION === "False") {
              const payload: any = {
                ModuleRight: menu?.MODULE_DESCRIPTION,
                FUNCTION_DESC: m?.FUNCTION_DESC,
                FUNCTION_CODE: m?.FUNCTION_CODE,
                NO_ACCESS: m?.NO_ACCESS,
                VIEW_RIGHTS: m?.VIEW_RIGHTS,
                ADD_RIGHTS: m?.ADD_RIGHTS,
                DELETE_RIGHTS: m?.DELETE_RIGHTS,
                UPDATE_RIGHTS: m?.UPDATE_RIGHTS
              }
              data.push(payload)
            }
          })
        })
        setExcelData(data)
        res?.MENU_LIST?.forEach((menu: any, index: any) => {
          menu.DETAIL?.forEach((m: any, id: any) => {
            if (m?.NO_ACCESS === "False" && activeIndex === 1 && m.ISTRANSACTION === "True") {
              const payload: any = {
                ModuleRight: menu?.MODULE_DESCRIPTION,
                FUNCTION_DESC: m?.FUNCTION_DESC,
                FUNCTION_CODE: m?.FUNCTION_CODE,
                NO_ACCESS: m?.NO_ACCESS,
                ACCESS: m?.VIEW_RIGHTS,

              }
              trasactionData.push(payload)
            }
          })
        })
        setExcelData(trasactionData)

      }
    } catch (error: any) {
      toast.error(error);
    }
  };

  const onSubmit = async (payload: any) => {
    const rolesList: any = [];
    nodes?.forEach((nodes: any) => {
      nodes?.children?.forEach((child: any) => {
        rolesList.push({
          FUNCTION_CODE: child?.data?.functionCode,
          VIEW_RIGHTS: child?.data?.view === true ? 1 : 0,
          ADD_RIGHTS: child?.data?.add === true ? 1 : 0,
          UPDATE_RIGHTS: child?.data?.update === true ? 1 : 0,
          DELETE_RIGHTS: child?.data?.delete === true ? 1 : 0,
          NO_ACCESS: child?.data?.noAccess === true ? 1 : 0,
        });
      });
    });

    payload.ROLE_ID = payload?.USER_ROLE?.ROLE_ID;
    payload.ROLERIGHTS_LIST = rolesList;

    const res = await callPostAPI(ENDPOINTS?.ROLES_RIGHT_SAVE, payload);
    if (res?.FLAG === true) {
      toast.success(res?.MSG);
      window.location.reload();
    } else {
      toast.error(res?.MSG);
    }
  };

  const newHandleChange = (event: any, { key, data, children = [] }: any) => {
    let keyName = event.target.value;
    const isChecked = event.target.checked;

    if (children.length > 0) {
      if (keyName === "view" && isChecked === false) {
        const updatedNode = [
          {
            key,
            data: Object.assign({}, data, {
              noAccess: true,
              view: false,
              add: false,
              update: false,
              delete: false,
            }),

            children: children.map((child: any) => ({
              key: child.key,
              data: Object.assign({}, child.data, {
                noAccess: true,
                view: false,
                add: false,
                update: false,
                delete: false,
              }),
            })),
          },
        ];

        const index = nodes.findIndex((item: any) =>
          updatedNode.some((entry) => entry.key === item.key)
        );
        nodes[index] = updatedNode[0];
        const clonedArr = [...nodes];
        setNodes(clonedArr);
      } else if (keyName === "noAccess") {
        const updatedNode = [
          {
            key,
            data: Object.assign({}, data, {
              [keyName]: !data[keyName],
              view: false,
              add: false,
              update: false,
              delete: false,
            }),

            children: children.map((child: any) => ({
              key: child.key,
              data: Object.assign({}, child.data, {
                [keyName]: !data[keyName],
                view: false,
                add: false,
                update: false,
                delete: false,
              }),
            })),
          },
        ];
        const index = nodes.findIndex((item: any) =>
          updatedNode.some((entry) => entry.key === item.key)
        );
        nodes[index] = updatedNode[0];
        const clonedArr = [...nodes];
        setNodes(clonedArr);
      } else {
        const updatedNode = [
          {
            key,
            data: Object.assign({}, data, {
              [keyName]: !data[keyName],
              noAccess: false,
              view: true,
            }),

            children: children.map((child: any) => ({
              key: child.key,
              data: Object.assign({}, child.data, {
                [keyName]: !data[keyName],
                noAccess: false,
                view: true,
              }),
            })),
          },
        ];
        const index = nodes.findIndex((item: any) =>
          updatedNode.some((entry) => entry.key === item.key)
        );
        nodes[index] = updatedNode[0];
        const clonedArr = [...nodes];
        setNodes(clonedArr);
      }
    } else {
      const parentKey = key.split("-")[0];
      let parentData = nodes.find((parentElem: any) => {
        return parentElem.key === parseInt(parentKey);
      });
      const updatedChildren = getChildrenValues(
        parentData,
        isChecked,
        keyName,
        key
      );

      const updatedNode = [
        {
          key: parseInt(parentKey),
          data: Object.assign({}, parentData.data, { [keyName]: true }),
          children: updatedChildren,
        },
      ];

      nodes[parentKey] = updatedNode[0];

      let colonedArray = [...nodes];

      let updateChild: any = colonedArray?.map((cloned: any, index: any) => {
        let noAccessData: any = cloned?.children?.map(
          (f: any) => f.data?.noAccess === true
        );
        let viewData: any = cloned?.children?.map(
          (f: any) => f.data?.view === true
        );
        let addData: any = cloned?.children?.map(
          (f: any) => f.data?.add === true
        );
        let updateData: any = cloned?.children?.map(
          (f: any) => f.data?.update === true
        );
        let deleteData: any = cloned?.children?.map(
          (f: any) => f.data?.delete === true
        );
        return {
          ...cloned,
          data: {
            name: cloned?.data?.name,
            noAccess:
              noAccessData.every((val: any) => val !== true) === true
                ? false
                : true,
            view:
              viewData.every((val: any) => val !== true) === true
                ? false
                : true,
            add:
              addData.every((val: any) => val !== true) === true ? false : true,
            update:
              updateData.every((val: any) => val !== true) === true
                ? false
                : true,
            delete:
              deleteData.every((val: any) => val !== true) === true
                ? false
                : true,
          },
          children: cloned?.children,
        };
      });
      setNodes(updateChild);
    }
  };

  const showRight = async () => {
    const res = await callPostAPI(ENDPOINTS?.Roles_Right, { ROLE_ID: "0", ACTION: "D" });
    if (res?.FLAG === 1) {
      SetRoles(res?.ROLELIST);

      setNodes(convertApiResponse(res?.MENU_LIST));
    }
  };

  const ActionDownloaditems = [
    {
      label: "Download Data",
      icon: "pi pi-download",
      command: () => {
        if (roleId !== undefined) {
          ExportCSV(excelData, currentMenu?.FUNCTION_DESC, roleName);
        } else {
          toast.error(t("Please select Role "))
        }
      },
    },
  ]


  useEffect(() => {
    if (selectedFacility) {
      showRight();
      saveTracker(currentMenu)
    }
  }, [selectedFacility]);

  useEffect(() => {
    if (!isSubmitting && Object?.values(errors)[0]?.type === "required") {
      const check: any = Object?.values(errors)[0]?.message;
      toast?.error(t(check));
    }
  }, [isSubmitting]);

  return (
    <section className="w-full">
      <div className="flex justify-between mt-1">
        <div>
          <h6 className="Text_Primary">{currentMenu?.FUNCTION_DESC}</h6>
        </div>
        <div className="flex">
          <>
            <Button
              className="Primary_Button  w-20 me-2"
              label={"Save"}
              onClick={handleSubmit(onSubmit)}
            />
            <SplitButtons label={t("Action")} model={ActionDownloaditems}
            />
          </>
        </div>
      </div>

      <Card className="mt-2">
        <div className="grid md:grid-cols-2">
          <div className="">
            <div className="flex flex-wrap">
              <h5 className="Text_Main">
                {"Welcome"} {decryptData((localStorage.getItem("USER_NAME")))}{" "}
              </h5>
              <img src={Cracker} alt="" className="w-6 h-6 ms-2 mt-2" />
            </div>

            <div className={`${errors?.USER_ROLE ? "errorBorder" : ""}`}>
              <Field
                controller={{
                  name: "USER_ROLE",
                  control: control,
                  render: ({ field }: any) => {
                    return (
                      <Select
                        options={roles}
                        {...register("USER_ROLE", {
                          required: t("Please fill the required fields."),
                          onChange: (e: any) => {
                            handleChange(e);
                          },
                        })}
                        label="User Role"
                        require={true}
                        optionLabel="ROLE_NAME"
                        className="sm:w-full md:w-1/2 lg:w-1/2 mt-1"
                        {...field}
                      />
                    );
                  },
                }}
              />
            </div>
          </div>
        </div>
      </Card>

      <div className="mt-2">
        <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
          <TabPanel header={t("Master Rights")}>
            <TreeTableRight
              setNodes={setNodes}
              nodes={nodes}
              newHandleChange={newHandleChange}
              type="nonWorkForce"
            />
          </TabPanel>
         {/* <TabPanel header={t("Transaction Rights")}>
            <TreeTableRight
              setNodes={setNodes}
              nodes={nodes}
              newHandleChange={newHandleChange}
              type="workFlow"
            />
          </TabPanel> */}
        </TabView>
      </div>
    </section>
  );
};

export default UserRoleRights;
