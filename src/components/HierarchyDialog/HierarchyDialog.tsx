import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { InputText } from "primereact/inputtext";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { callPostAPI } from "../../services/apis";
import { toast } from "react-toastify";
import { ENDPOINTS } from "../../utils/APIEndpoints";
import "./HierarchyDialog.css";
import LoaderFileUpload from "../Loader/LoaderFileUpload";
import { useLocation, useOutletContext } from "react-router-dom";
import LocationHierarchyDialog from "./LocationHierarchyDialog";
import { LOCALSTORAGE } from "../../utils/constants";
import LoaderShow from "../Loader/LoaderShow";
import { Checkbox } from "primereact/checkbox";
import { node } from "@sentry/core";

const folder = (
  <>
    <i className="pi pi-angle-down tree-icon tree-arrow-icon" />
    <i className="pi pi-folder folder-image tree-icon" />
  </>
);

const openFolder = (
  <>
    <i className="pi pi-angle-right tree-icon tree-arrow-icon" />
    <i className="pi pi-folder-open folder-image tree-icon" />
  </>
);

const equipment = <i className="pi pi-wrench folder-image tree-icon" />;

const TreeNode = ({
  node,
  level = 0,
  onNodeClick,
  selectedKey,
  expandedKeys,
  toggleExpand,
  setSelectedEquipment,
  setSelectedKey,
  setSelectedAssetsnodes,
  isCheckbox,
  seselectedassetid,
  selectedAssetsnodes
}: any) => {
  const isExpanded = expandedKeys[node.key];
  const hasChildren = node.children && node.children.length > 0;
  const isChecked = useMemo(
    () => selectedKey.includes(node?.asset_id),
    [selectedKey, node?.asset_id]
  );
  const handleCheckboxChange = useCallback(

    (e: any) => {


      if (e.checked) {

        setSelectedKey((prev: any) => [...prev, node?.asset_id]);
      } else {
        setSelectedKey((prev: any) =>
          prev.filter((id: any) => id !== node?.asset_id)
        );
      }
    },
    [node.asset_id, setSelectedKey]
  );
  return (
    <div className="tree-node">
      <div
        className={`tree-node-header ${selectedKey === node.key ? "node-tree-node-header-default" : ""
          }`}
        onClick={() => {
          if (node.isAsset === 1) {
            onNodeClick(node);
          } else {
            toggleExpand(node.key);
          }
        }}
      >
        {hasChildren ? (
          isExpanded ? (
            <>{openFolder}</>
          ) : (
            <>{openFolder}</>
          )
        ) : (
          <>{node.isAsset === 1 ? <>{equipment}</> : <>{openFolder}</>}</>
        )}
        <div className="hierarchy-label">
          {node.isAsset === 1 && isCheckbox && (
            <Checkbox
              inputId={node.asset_id}
              checked={isChecked}

              onChange={handleCheckboxChange}
              className="tree-checkbox"
            />
          )}{" "}
          {node.label}{" "}
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="tree-node-children">
          {node.children.map((child: any) => (
            <TreeNode
              key={child.key}
              node={child}
              level={level + 1}
              onNodeClick={onNodeClick}
              selectedKey={selectedKey}
              expandedKeys={expandedKeys}
              toggleExpand={toggleExpand}
              setSelectedEquipment={setSelectedEquipment}
              setSelectedKey={setSelectedKey}
              seselectedassetid={seselectedassetid}
              isCheckbox={isCheckbox}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const HierarchyDialog = ({
  visibleEquipmentlist,
  showEquipmentlist,
  selectedKey,
  setSelectedKey,
  setValue,
  nodes,
  filteredData,
  setFilteredData,
  setNodes,
  assetTreeDetails,
  setAssetTreeDetails,
  onNodeClick,
  hierachyFirstDate,
  hierachyLastDate,
  setselectedNodeKey,
  handleNodeSelection,
  isCheckbox,
  seselectedassetid,
  setSelectedAssetsnodes,
  selectedAssetsnodes
}: any) => {


  const [selectedEquipmentKey, setSelectedEquipmentKey] = useState("");
  const [nodecollapse, setnodecollapse] = useState<boolean>(false);
  const [expandLoader, setExpandLoader] = useState<boolean>(false);
  const [filterText, setFilterText] = useState("");
  const [locationName, setLocationName] = useState<any | null>(null);
  const [selectedFacility, menuList]: any = useOutletContext();
  const [loading, setLoading] = useState<boolean>(false);
  const [locationNode, setLocationNode] = useState<any | null>([]);
  const [locationDialog, setLocationDialog] = useState<boolean>(false);
  // const [assetTreeDetails, setAssetTreeDetails] = useState<any | null>([]);
  const [locationFilteredData, setLocationFilteredData] = useState<any[]>([]);
  const [locationResetStatus, setLocationResetStatus] = useState<any>(false);
  const [selectedapplynoodes, setselectedapplynoodes] = useState<any[]>(selectedAssetsnodes);
  const [expandedKeys, setExpandedKeys] = useState<any | null>({
    "0": true,
    "0-0": true,
  });
  const [LOCATIONID, setLOCATIONID] = useState<any | null>([]);
  const filterNodes = (nodes: any, query: any) => {
    return nodes
      .map((node: any) => {
        if (node.label.toLowerCase().includes(query.toLowerCase())) {
          return node;
        }
        if (node.children) {
          const filteredChildren = filterNodes(node.children, query);
          if (filteredChildren.length > 0) {
            return { ...node, children: filteredChildren };
          }
        }
        return null;
      })
      .filter(Boolean);
  };

  useEffect(() => {
    if (selectedAssetsnodes?.length) {
      setselectedapplynoodes(selectedAssetsnodes);
    }
  }, [selectedAssetsnodes]);

  const findKey = (data: any, targetKey: any) => {
    if (data.key === targetKey) {
      return data;
    }

    if (data.children) {
      for (let child of data.children) {
        const result: any = findKey(child, targetKey);
        if (result) {
          return result;
        }
      }
    }

    return;
  };


  const setSelectedEquipment = (e: any, value: any, nodeData?: any) => {
    const targetKey = value;
    const nodeFromFilteredData: any = findRootNode(filteredData, targetKey);
    const result = findKey(nodeFromFilteredData, targetKey);
    if (result) {
      setSelectedEquipmentKey(""); // Reset first to trigger change
      setTimeout(() => {
        setSelectedEquipmentKey(result?.label);
        setValue("EQUIPMENT_NAME", result?.label);
        if (result?.isAsset === 1) {
          getAssetDetailsList(result?.asset_id);
          showEquipmentlist(false);
        }
      }, 0);
    }
  };
  const findNodeByKey = (nodes: any, key: any) => {
    for (let node of nodes) {
      if (node.key === key) {
        return node;
      }
      // Recursively check the children
      if (node.children && node.children.length > 0) {
        const foundNode: any = findNodeByKey(node.children, key);
        if (foundNode) return foundNode;
      }
    }
    return null; // If no node is found
  };

  const findParent: any = (nodes: any, key: any) => {
    for (let node of nodes) {
      if (
        node.children &&
        node.children.some((child: any) => child.key === key)
      ) {
        return node;
      }

      if (node.children && node.children.length > 0) {
        const parentNode = findParent(node.children, key);
        if (parentNode) return parentNode;
      }
    }
    return null; // If no parent is found
  };

  const findRootNode = (nodes: any, key: any) => {
    let currentNode: any = findNodeByKey(nodes, key);
    while (currentNode) {
      const parent: any = findParent(nodes, currentNode.key);
      if (!parent) {
        return currentNode;
      }
      currentNode = parent;
    }
    return null;
  };

  const expandAll = () => {
    setExpandLoader(true);
    setTimeout(() => {
      const keys: Record<string, boolean> = {};
      const stack = [...filteredData]; // Start with top-level nodes

      while (stack.length > 0) {
        const node = stack.pop();
        if (!node) continue;

        keys[node.key] = true; // Mark as expanded

        if (node.children) {
          stack.push(...node.children); // Process children iteratively
        }
      }

      setExpandedKeys(keys);
      setnodecollapse(true);
      setExpandLoader(false);
    }, 0);
  };

  const collapseAll = () => {
    setExpandedKeys({});
    setnodecollapse(false);
  };

  const applySelectedNodes = () => {

    if (selectedapplynoodes) {
      setSelectedAssetsnodes(selectedapplynoodes)
      showEquipmentlist(false);
    }

  }
  const getAssetDetailsList = async (assetid: any) => {
    try {
      const payload = {
        ASSET_ID: assetid ?? 0,
      };
      const res = await callPostAPI(ENDPOINTS.GET_INFRA_ASSET_DETAILS, payload);
      if (res?.FLAG === 1) {
        setAssetTreeDetails(res?.ASSETDETAILSLIST);
      } else {
        toast?.error(res?.MSG);
      }
    } catch (error: any) {
      toast?.error(error.message);
    }
  };

  const toggleExpand = (key: string) => {
    setExpandedKeys((prev: any) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleNodeClickCombined = async (node: any) => {
    if (node?.isAsset === 1) {
      // setSelectedKey((prev: any) => {
      //   return [...prev, node.asset_id];
      // });
      // setSelectedKey(node.asset_id);
      if (seselectedassetid) {
        seselectedassetid(node?.asset_id)
      }

      if (handleNodeSelection) {

        setselectedapplynoodes((prev) => {
          if (!Array.isArray(prev)) prev = [];

          const alreadySelected = prev?.some((item) => item?.asset_id === node?.asset_id);
          if (!alreadySelected) {
            return [...prev, node];
          }
          return prev;
        });
        setValue("EQUIPMENT_NAME", "");
      } else {
        setValue("EQUIPMENT_NAME", node.label);
        showEquipmentlist(false);
      }

      setSelectedEquipmentKey(node.label);

      await getAssetDetailsList(node.asset_id);
    } else {
      toast.error("Please select an equipment item, not a folder.");
    }

    // 2. Then, call the parent's handler (if provided)
    if (onNodeClick) {
      onNodeClick({ node });
    }
  };




  const filterTree = useCallback(
    (nodeList: any[], PATHs?: any) => {
      return nodeList
        ?.map((node: any) => {
          const currentPath = PATHs ? `${PATHs} > ${node.label}` : node.label;
          const children: any = node?.children
            ? filterTree(node.children, currentPath)
            : [];

          const normalizedPath = currentPath
            .toLowerCase()
            .replace(/\s+/g, " ")
            .trim();

          const normalizedFilter = filterText
            .toLowerCase()
            .replace(/\s+/g, " ")
            .trim();

          const isMatch = normalizedPath.includes(normalizedFilter);

          if (children?.length > 0) {
            return {
              ...node,
              children,
              expanded: true,
            };
          } else {
            if (isMatch) {
              return {
                ...node,
                children: [],
                expanded: false,
              };
            }
          }
          return null;
        })
        .filter(Boolean);
    },
    [filterText]
  ); // Only recreate when filterText changes

  useEffect(() => {
    if (!nodes) return;

    if (filterText?.trim()) {
      const filtered = filterTree(nodes, "");
      setFilteredData(filtered);

      expandAll();
    } else {
      setFilteredData(nodes);
      setExpandedKeys({});
      setnodecollapse(false);
    }
  }, [filterText, nodes, setFilteredData, filterTree]);

  const { pathname } = useLocation();

  const getEquimentHierarchy = useCallback(
    async (locationData?: any) => {
      try {
        const payload = {
          LOCATION_LIST: locationData ?? [],
          ASSET_EQUIPMENT_ID: 0,
          START_DATE: pathname === "/ppmSchedule" ? hierachyFirstDate : "",
          END_DATE: pathname === "/ppmSchedule" ? hierachyLastDate : "",
          FUNCTION_CODE:
            pathname === "/ppmSchedule"
              ? "MS002"
              : pathname === "/servicerequestlist"
                ? "HD004"
                : "AS0012",
        };
        setLoading(true);

        const res = await callPostAPI(
          ENDPOINTS.Location_Hierarchy_List,
          payload
        );
        setLoading(false);
        if (res?.FLAG === 1) {
          setNodes(res?.EQUIPMENTHIERARCHYLIST);
          setFilteredData(res?.EQUIPMENTHIERARCHYLIST);
        } else {
          toast?.error(res?.MSG);
          setFilteredData([]);
        }
      } catch (error: any) {
        toast?.error(error.message);
        setLoading(false);
      } finally {
        setLoading(false);
      }
    },
    [setNodes, setFilteredData, hierachyFirstDate, hierachyLastDate]
  );

  const getLocation = async () => {
    let Currentfacility = JSON.parse(
      localStorage.getItem(LOCALSTORAGE.FACILITY)!
    );
    let filterFacility: any = Currentfacility.filter(
      (f: any) => f?.FACILITY_ID === selectedFacility?.FACILITY_ID
    );
    const payload: any = {
      LOCATION_ID: filterFacility[0]?.LOCATION_ID,
      ISLOCATIONFILTERFLAG: 1,
    };

    const res = await callPostAPI(ENDPOINTS?.GETHIRARCHY_LIST, payload);
    if (res?.FLAG === 1) {
      setLocationNode(res?.LOCATIONHIERARCHYLIST);
    }
  };

  const handleLocationFilter = (locationData: any, locationList?: any) => {
    setLOCATIONID(locationList);
    getEquimentHierarchy(locationData);
  };
  useEffect(() => {
    setLocationDialog(false);
    if (visibleEquipmentlist === true) {
      if (locationName === null) {
        getLocation();
        getEquimentHierarchy();
      }

      // getLocation();
    }
  }, [
    visibleEquipmentlist,
    getEquimentHierarchy,
    hierachyFirstDate,
    hierachyLastDate,
  ]);

  return (
    <>
      {" "}
      {loading ? (
        <LoaderShow />
      ) : (
        <Dialog
          visible={visibleEquipmentlist}
          style={{ width: "650px", height: "720px" }}
          className="dialogBoxTreeStyle bg-white"
          dismissableMask
          closable={false}
          onHide={() => { }}
          draggable={false}
          resizable={false}
          contentStyle={{
            overflow: "hidden",
            padding: "0", // Remove default padding if needed
          }}
        >
          <div
            className="serviceEquipment bg-white p-4"
            style={{ maxHeight: "750px" }}
          >
            <div className="px-2 pb-4 flex w-full gap-3 justify-between">
              {pathname === "/servicerequestlist" && (
                <div>
                  <InputText
                    placeholder="Search Location"
                    value={locationName}
                    onClick={(e: any) => setLocationDialog(true)}
                    readOnly
                    className="width-1/5"
                  />
                  <LocationHierarchyDialog
                    showEquipmentlist={setLocationDialog}
                    visibleEquipmentlist={locationDialog}
                    selectedKey={selectedKey}
                    setSelectedKey={setSelectedKey}
                    nodes={locationNode}
                    locationFilteredData={locationFilteredData}
                    setLocationFilteredData={setLocationFilteredData}
                    setNodes={setLocationNode}
                    setValue={setValue}
                    // getDashboardDetails={getDashboardDetails}
                    setLocationName={setLocationName}
                    handleLocationFilter={handleLocationFilter}
                    locationResetStatus={locationResetStatus}
                    setLocationResetStatus={setLocationResetStatus}
                    LOCATIONID={LOCATIONID}
                    locationUrl={"/servicerequestlist?add="}
                    setLOCATIONID={setLOCATIONID}
                  />
                </div>
              )}
            </div>
            <div className="px-2 pb-4 flex w-full gap-3 justify-between">
              <div className="w-4/5">
                <IconField iconPosition="left">
                  <InputIcon className="pi pi-search" />
                  <InputText
                    type="search"
                    value={filterText}
                    onChange={(e) =>
                      setFilterText(e?.target?.value?.trimStart())
                    }
                    placeholder="Search"
                  />
                </IconField>
              </div>

              <div className="gap-3 flex hehe">
                <Button
                  type="button"
                  className="Secondary_Button hierarchy-button"
                  label={nodecollapse ? "Collapse All" : "Expand All"}
                  onClick={nodecollapse ? collapseAll : expandAll}
                />
                {(
                  <Button
                    onClick={() => {
                      showEquipmentlist(false);
                      setSelectedKey([])
                      setselectedapplynoodes([])
                    }}
                  >
                    <i className="pi pi-times x-button"></i>
                  </Button>
                )}
              </div>
            </div>

            {expandLoader ? (
              <>
                <LoaderShow />
              </>
            ) : (
              <div
                className="serviceHeirarchy relative"
                style={{ maxHeight: "500px", overflowY: "auto" }}
              >
                {filteredData?.length > 0 ? (
                  <>
                    {filteredData?.map((node: any) => (
                      <TreeNode
                        key={node.key}
                        node={node}
                        onNodeClick={handleNodeClickCombined}
                        selectedKey={selectedKey}
                        expandedKeys={expandedKeys}
                        toggleExpand={toggleExpand}
                        setSelectedEquipment={setSelectedEquipment}
                        setSelectedKey={setSelectedKey}
                        isCheckbox={isCheckbox}
                      />
                    ))}
                  </>
                ) : (
                  <p>No Data Found</p>
                )}
              </div>
            )}
            {(isCheckbox && selectedKey?.length > 0) && (
              <div className="flex justify-end pr-[77px]  pt-[59px] ">
                <Button
                  type="button"
                  className="Primary_Button"
                  label="Apply"
                  onClick={applySelectedNodes}
                />
                {/* <Button
                  type="button"
                  className="Primary_Button"
                  label="Cancel"
                  onClick={() => showEquipmentlist(false)}
                /> */}
              </div>
            )}
          </div>
        </Dialog>
      )}
    </>
  );
};

export default HierarchyDialog;
