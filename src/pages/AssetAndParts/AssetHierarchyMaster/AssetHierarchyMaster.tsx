import { useEffect, useState, useRef, memo } from "react";
import { toast } from "react-toastify";
import { callPostAPI } from "../../../services/apis";
import { ENDPOINTS } from "../../../utils/APIEndpoints";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import { TreeExpandedKeysType } from "primereact/tree";
import { ContextMenu } from "primereact/contextmenu"; // Correct import for ContextMenu
import Button from "../../../components/Button/Button";
import { Dialog } from "primereact/dialog"; // Import the Dialog for form
import { InputText } from "primereact/inputtext"; // Import InputText for form input
import "./assetHierarchy.css";
import { PATH } from "../../../utils/pagePath";
import SplitButtons from "../../../components/SplitButton/SplitButton";
import {
  readUploadFile,
  TemplateBuildingDownload,
} from "../../../components/TemplateDownload/TemplateDownload";
import { FileUpload } from "primereact/fileupload";
import "../../../components/Input/Input.css";
import "primeicons/primeicons.css";
import LoaderFileUpload from "../../../components/Loader/LoaderFileUpload";
import LoaderShow from "../../../components/Loader/LoaderShow";

const folder = (
  <>
    <i className="pi pi-angle-right tree-icon tree-arrow-icon" />
    <i className="pi pi-folder folder-image tree-icon" />
  </>
);

const TreeNode = memo(
  ({ node, expandedKeys, toggleNode, onNodeRightClick }: any) => {
    const isExpanded = expandedKeys[node.key];
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div className="tree-node">
        <div
          className={`tree-node-header ${
            hasChildren ? "" : "tree-node-header-default"
          }`}
          onClick={() => hasChildren && toggleNode(node.key)}
          onContextMenu={(e) => {
            onNodeRightClick(e, node);
          }}
        >
          {hasChildren ? (
            isExpanded ? (
              <>{folder}</>
            ) : (
              <>{folder}</>
            )
          ) : (
            <>{folder}</>
          )}
          <div className="hierarchy-label"> {node.label} </div>
        </div>
        {hasChildren && isExpanded && (
          <div>
            {node.children.map((child: any) => (
              <TreeNode
                key={child.key}
                node={child}
                expandedKeys={expandedKeys}
                toggleNode={toggleNode}
                onNodeRightClick={onNodeRightClick}
              />
            ))}
          </div>
        )}
      </div>
    );
  }
);

var _expandedKeys: TreeExpandedKeysType = {};
const AssetHierarchyMaster = () => {
  let { pathname } = useLocation();
  const [selectedFacility, menuList]: any = useOutletContext();
  const currentMenu = menuList
    ?.flatMap((menu: any) => menu?.DETAIL)
    .filter((detail: any) => detail.URL === pathname)[0];

  const navigate = useNavigate();
  const cm = useRef<any>(null);
  const [selectedKey, setSelectedKey] = useState("");
  const [expandedKeys, setExpandedKeys] = useState<any | null>({
    "0": true,
    "0-0": true,
  });
  const [nodes, setNodes] = useState<any | null>();
  const [filteredData, setFilteredData] = useState<any | null>();
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [isEditDialogVisible, setIsEditDialogVisible] = useState(false);
  const [editLabel, setEditLabel] = useState("");
  const [visible, setVisible] = useState<boolean>(false);
  const [nodecollapse, setnodecollapse] = useState<boolean>(false);
  const [loading, setLoading] = useState<any | null>(false);
  const [filterText, setFilterText] = useState("");
  const [originalList, setOriginalList] = useState<any | null>([]);
  const setDialogVisible = () => {
    setVisible(!visible);
  };

  const getAPI = async () => {
    setLoading(true);
    try {
      const payload = {
        ASSET_EQUIPMENT_ID: 0,
      };

      const res = await callPostAPI(ENDPOINTS.HierarchyList, payload);
      if (res?.FLAG === 1) {
        setNodes(res?.EQUIPMENTHIERARCHYLIST);
        setFilteredData(res?.EQUIPMENTHIERARCHYLIST);
        setLoading(false);
        setOriginalList(res?.EQUIPMENTHIERARCHYLIST);
        for (let node of res?.EQUIPMENTHIERARCHYLIST) {
          expandNode(node, _expandedKeys);
        }
      } else {
        toast?.error(res?.MSG);
        setLoading(false);
      }
    } catch (error: any) {
      toast?.error(error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentMenu?.FUNCTION_CODE) {
      (async function () {
        await getAPI();
      })();
    }
  }, [selectedFacility, currentMenu]);

  const onNodeRightClick = (event: any, node: any) => {
    event.preventDefault();
    setSelectedNode(node);
    cm.current.show(event);
  };

  const handleAdd = () => {
    if (selectedNode) {
      navigate(PATH.ADD_ASSET_HIERARCHY, { state: { selectedNode } });
    } else {
      toast.error("Please select a node to add.");
    }
  };

  const handleEdit = async () => {
    setEditLabel(selectedNode.label);
    setIsEditDialogVisible(true);
  };

  const handleDelete = async () => {
    if (selectedNode) {
      try {
        const payload = {
          ASSET_FOLDER_ID: selectedNode?.key,
          PARA: {
            para1: `${currentMenu?.FUNCTION_DESC ?? ""}`,
            para2: "Deleted",
          },
        };
        const res = await callPostAPI(
          ENDPOINTS.DELETE_EQUIPMENT_HIERARCHY,
          payload
        );
        if (res?.FLAG) {
          toast?.success(res?.MSG);
          await callPostAPI(ENDPOINTS.UPDATE_HIERARCHY_LIST);
          await getAPI();
        } else {
          toast?.error(res?.MSG);
        }
      } catch (error: any) {
        toast?.error(error.message);
      }
    } else {
    }
  };

  const handleSaveEdit = async () => {
    if (selectedNode) {
      const payload = {
        MODE: "E",
        PARA: {
          para1: `${currentMenu?.FUNCTION_DESC ?? ""}`,
          para2: "Updated",
        },
        ACTIVE: 1,
        ASSET_FOLDER_ID: selectedNode?.key,
        ASSET_FOLDER_NAME: editLabel,
      };

      try {
        const res = await callPostAPI(
          ENDPOINTS.SAVE_EQUIPMENT_HIERARCHY,
          payload
        );
        if (res?.FLAG === true) {
          setIsEditDialogVisible(false);
          toast?.success(res?.MSG);
          await callPostAPI(ENDPOINTS.UPDATE_HIERARCHY_LIST);
          await getAPI();
        } else {
          toast?.error(res?.MSG);
        }
      } catch (error: any) {
        toast?.error(error);
      } finally {
      }
    }
  };
  const handleCancelEdit = () => {
    setIsEditDialogVisible(false);
  };

  const expandAll = () => {
    const keys: TreeExpandedKeysType = {};
    const expandAllNodes = (node: any) => {
      if (node.children && node.children.length) {
        keys[node.key] = true;
        node.children.forEach(expandAllNodes);
      }
    };

    nodes?.forEach(expandAllNodes);
    setExpandedKeys(keys);
    setnodecollapse(true);
  };

  const collapseAll = () => {
    setExpandedKeys({});
    setnodecollapse(false);
  };

  const expandNode = (node: any, _expandedKeys: TreeExpandedKeysType) => {
    if (node.children && node.children.length) {
      _expandedKeys[node.key] = true;
      for (let child of node.children) {
        expandNode(child, _expandedKeys);
      }
    }
  };

  const isUploadData = () => {
    setVisible(true);
  };
  const getDownloadTemp = async () => {
    try {
      const res = await callPostAPI(
        ENDPOINTS.GETEXCELTEMPLATECOMMON,
        null,
        currentMenu?.FUNCTION_CODE
      );
      TemplateBuildingDownload(
        res?.DATALIST,
        res?.JDATALIST,
        currentMenu?.FUNCTION_DESC
      );
    } catch (error: any) {
      toast.error(error);
    }
  };
  const Actionitems = [
    {
      label: "Upload Data",
      icon: "pi pi-upload",
      visible: true,
      command: () => {
        isUploadData();
      },
    },
    {
      label: "Download Template",
      icon: "pi pi-download",
      command: async () => {
        await getDownloadTemp();
      },
    },
  ];

  const contextMenuItems = [
    {
      label: "Add",
      icon: "pi pi-plus",
      command: handleAdd,
    },
    {
      label: "Edit",
      icon: "pi pi-pencil",
      command: handleEdit,
    },
    {
      label: "Delete",
      icon: "pi pi-trash",
      command: handleDelete,
    },
  ];
  const toggleNode = (key: any) => {
    setExpandedKeys((prev: any) => ({
      ...prev,
      [key]: !prev?.[key],
    }));
  };

  useEffect(() => {
    const filterNodes = (nodes: any): any => {
      return nodes
        .map((node: any) => {
          const matchesSearch = node.label
            .toLowerCase()
            .includes(filterText.toLowerCase());

          // Filter children recursively
          const filteredChildren = node.children
            ? filterNodes(node.children)
            : undefined;

          // Include node if it matches or has matching children
          if (
            matchesSearch ||
            (filteredChildren && filteredChildren.length > 0)
          ) {
            // CHANGE: Add parent nodes to expanded set when searching
            if (node.children && node.children.length > 0) {
              //   expandNode(node.children, node.key)
              expandAll();
            }

            return {
              ...node,
              children: filteredChildren,
            };
          }

          return null;
        })
        .filter(Boolean) as any;
    };
    if (filterText?.trim()) {
      setFilteredData(filterNodes(nodes));
    } else {
      collapseAll();
      setFilteredData(originalList);
    }
  }, [filterText, nodes]);

  return (
    <div className="w-full h-full p-4">
      <div className="mb-3 flex gap-2 pb-4">
        <div className="w-full">
          <div className="flex justify-between mt-1">
            <div>
              <h6 className="Text_Primary">
                {currentMenu?.FUNCTION_DESC ?? ""}
              </h6>
            </div>

            <div className="flex">
              <Button
                type="button"
                className="Primary_Button w-20 me-2"
                label={"+ Add New"}
                onClick={() => navigate(PATH.ADD_ASSET_HIERARCHY)}
              />
              <SplitButtons
                label={"Action"}
                model={Actionitems}
                className={"mr-2"}
              />
              {filteredData?.length > 0 && (
                <Button
                  type="button"
                  className="Secondary_Button w-20"
                  label={nodecollapse ? "Collapse All" : "Expand All"}
                  onClick={nodecollapse ? collapseAll : expandAll}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <ContextMenu ref={cm} model={contextMenuItems} />
      <div
        className="input-wrapper"
        style={{
          position: "relative",
          maxWidth: "500px",
          paddingBottom: "3px",
        }}
      >
        <InputText
          placeholder="Search"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value?.trimStart())}
          className="input-with-icon"
          style={{ width: "100%", paddingRight: "2rem" }} // space for the icon
        />

        <i
          className={`pi ${
            filterText !== "" ? "pi-times" : "pi-search"
          } input-icon`}
          onClick={() => setFilterText("")}
          style={{
            position: "absolute",
            top: "50%",
            right: "10px",
            transform: "translateY(-50%)",
            cursor: "pointer",
            color: "#6c757d",
          }}
        ></i>
        {/* )} */}
      </div>

      <div className="scrollContainer bg-white assetHierarchy">
        {loading === true ? (
          <LoaderShow />
        ) : (
          <>
            <div>
              {filteredData?.length > 0 &&
                filteredData?.map((node: any) => (
                  <TreeNode
                    key={node.key}
                    node={node}
                    expandedKeys={expandedKeys}
                    toggleNode={toggleNode}
                    onNodeRightClick={onNodeRightClick}
                  />
                ))}
            </div>
          </>
        )}
      </div>

      <Dialog
        visible={isEditDialogVisible}
        style={{ width: "400px", minHeight: "300px" }}
        header="Edit Equipment Hierarchy"
        modal
        footer={
          <div className="flex justify-end gap-2">
            <Button
              label="Cancel"
              onClick={handleCancelEdit}
              className="p-button-text"
              style={{ height: "40px", border: "1px solid #E5E4E2" }}
            />
            <Button
              label="Save"
              onClick={handleSaveEdit}
              className="p-button-primary"
              style={{
                height: "40px",
                border: "1px solid #E5E4E2",
                backgroundColor: "#8e724a",
                color: "white",
              }}
            />
          </div>
        }
        onHide={handleCancelEdit}
        className="custom-dialog"
      >
        <div className="field">
          <label htmlFor="editLabel" className="text-lg">
            Equipment Hierarchy Label
          </label>
          <InputText
            id="editLabel"
            value={editLabel}
            onChange={(e) => setEditLabel(e.target.value)}
            required
            className="p-inputtext-sm w-full mt-2 p-3 border-1 border-grey-300 rounded"
            style={{ height: "40px", border: "1px solid #E5E4E2" }}
          />
        </div>
      </Dialog>

      <Dialog
        header="Bulk Upload"
        visible={visible}
        style={{ width: "30vw" }}
        onHide={() => setDialogVisible()}
      >
        <div className="bg-regal-red">
          <FileUpload
            mode="basic"
            name="demo[]"
            accept="xlsx/*"
            maxFileSize={1000000}
            className="ml-2 bg-regal-red"
            onSelect={async (e: any) => {
              try {
                const response: any = await readUploadFile(
                  e,
                  currentMenu?.FUNCTION_CODE,
                  setVisible
                );
                if (response?.flag || response?.FLAG) {
                  toast?.success(response?.MSG);
                  await getAPI();
                } else {
                  toast?.error(response?.MSG);
                }
              } catch (error: any) {
                toast?.error(error);
              }
            }}
          />
        </div>
      </Dialog>
    </div>
  );
};

export default AssetHierarchyMaster;
