import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { IconField } from "primereact/iconfield";
import { InputText } from "primereact/inputtext";
import "../Input/Input.css";
import "../Checkbox/Checkbox.css";
import React, { useEffect, useState, useRef, useCallback } from "react";
import "./HierarchyDialog.css";
import { Checkbox } from "primereact/checkbox";
import { useLocation, useOutletContext } from "react-router-dom";

interface TreeNode {
  id: string;
  label: string;
  name?: string;
  node_id?: string;
  children?: TreeNode[];
}

interface CheckedNode {
  id: string;
  node_id?: string;
  label?: string;
  name?: string;
}

interface TreeNodeProps {
  node: TreeNode;
  checked: CheckedNode[];
  indeterminate: string[];
  onCheck: (node: TreeNode) => void;
  onToggle: (nodeId: string) => void;
  expandedNodes: string[];
}

const TreeNode: React.FC<TreeNodeProps> = ({
  node,
  checked,
  indeterminate,
  onCheck,
  onToggle,
  expandedNodes,
}) => {
  const checkboxRef = useRef<any | null>(null);
  const isChecked = checked.some((item) => item.id === node.id);
  const isIndeterminate = indeterminate.includes(node.id);
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedNodes.includes(node.id);

  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = isIndeterminate;
    }
  }, [isIndeterminate]);

  return (
    <div className="tree-node" style={{ marginLeft: `${1 * 16}px` }}>
      <div className="tree-node-header ">
        {hasChildren && (
          <button onClick={() => onToggle(node.id)} className="tree-toggle">
            {isExpanded ? (
              <i className="pi pi-angle-down tree-icon tree-arrow-icon" />
            ) : (
              <i className="pi pi-angle-right tree-icon tree-arrow-icon" />
            )}
          </button>
        )}
        {!hasChildren && (
          <span style={{ width: 30, display: "inline-block" }}></span>
        )}

        <Checkbox
          checked={isChecked}
          ref={checkboxRef}
          onChange={() => onCheck(node)}
          style={{ marginRight: 5 }}
          className="tree-checkbox"
        />
        <span className="hierarchy-label">{node.label}</span>
      </div>

      {hasChildren && isExpanded && (
        <div className="tree-node-children ml-[20px]">
          {node?.children?.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              checked={checked}
              indeterminate={indeterminate}
              onCheck={onCheck}
              onToggle={onToggle}
              expandedNodes={expandedNodes}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const LocationHierarchyDialog = ({
  visibleEquipmentlist,
  showEquipmentlist,
  selectedKey,
  setSelectedKey,
  setValue,
  nodes,
  locationFilteredData,
  setLocationFilteredData,
  setNodes,
  assetTreeDetails,
  setAssetTreeDetails,
  onNodeClick,
  getDashboardDetails,
  setLocationName,
  handleLocationFilter,
  locationResetStatus,
  setLocationResetStatus,
  clearLocationFilter,
  LOCATIONID,
  locationUrl,
  setLOCATIONID,
  clearLocation,
  setLocationCheckData,
  locationCheckData,
}: any) => {
  let { pathname } = useLocation();
  const [selectedFacility, menuList]: any = useOutletContext();
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [checked, setChecked] = useState<CheckedNode[]>([]);
  const [indeterminate, setIndeterminate] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [expandedNodes, setExpandedNodes] = useState<string[]>([]);
  const [forceExpandedNodes, setForceExpandedNodes] = useState<string[]>([]);
  const [nodecollapse, setnodecollapse] = useState<boolean>(false);

  const [initialCheckedKeys, setInitialCheckedKeys] = useState<string[]>([]); // St

  // const [assetTreeDetails, setAssetTreeDetails] = useState<any | null>([]);

  const [originalNodes, setOriginalNodes] = useState<any | null>([]);
  const [locationList, setLocationList] = useState<any | null>([]);

  const clearSelection = () => {
    if (pathname === "/workorderlist") {
      setLocationName([]);
      collapseAll();
      setSearch("");
      setLocationList([]);
      setChecked([]);
      clearLocationFilter([]);
    } else if (pathname === "/servicerequestlist") {
      // setLocationName([]);
      setChecked([]);
      collapseAll();
    } else {
      setChecked([]);
      // setLocationName([]);
      collapseAll();
    }
  };

  function transformTree(dataList: any[]): TreeNode[] {
    return dataList.map((node) => ({
      id: node.key,
      label: node.label.trim(),
      name: node?.name,
      node_id: node?.node_id,
      children: node.children ? transformTree(node.children) : [],
    }));
  }

  useEffect(() => {
    console.log(555);
    if (nodes) {
      const mapData = (
        inputNode: any,
        parentKey = "",
        parentName = ""
      ): any => {
        const currentKey = parentKey
          ? `${parentKey}-${inputNode.node_id}`
          : `${inputNode.node_id}`;
        const currentName = parentName
          ? `${parentName}>${inputNode.node_name}`
          : `${inputNode.node_name}`;

        const isAsset = inputNode.node_type_id === 4; // Room type is equipment

        return {
          key: currentKey,
          label: inputNode.node_name,
          isAsset: isAsset ? 1 : 0,
          name: currentName,
          children:
            inputNode.node_child?.map((child: any) =>
              mapData(child, currentKey, currentName)
            ) || [],

          ...inputNode,
        };
      };

      const mappedNodes = nodes.map((node: any) => mapData(node));
      const mappedData = transformTree(mappedNodes);
      setTreeData(mappedData);
      setOriginalNodes(mappedData);
      setLocationFilteredData(mappedData);
      setnodecollapse(true);
    }
  }, [nodes, setLocationFilteredData]);

  const findNodeAndParents = (
    nodes: TreeNode[],
    id: string,
    parents: string[] = []
  ): { node: TreeNode; parents: string[] } | null => {
    for (const node of nodes) {
      if (node.id === id) return { node, parents };
      if (node.children) {
        const found = findNodeAndParents(node.children, id, [
          ...parents,
          node.id,
        ]);
        if (found) return found;
      }
    }
    return null;
  };

  const getAllChildIds = (node: TreeNode): CheckedNode[] => {
    let ids: CheckedNode[] = [];
    if (node.children) {
      for (let child of node.children) {
        ids.push(
          {
            id: child.id,
            node_id: child.node_id,
            label: child?.label,
            name: child?.name,
          },
          ...getAllChildIds(child)
        );
      }
    }
    return ids;
  };

  const updateCheckStates = useCallback(
    (node: TreeNode) => {
      const allChildIds = getAllChildIds(node);
      let newChecked = [...checked];

      if (checked.some((item) => item.id === node.id)) {
        const idsToUncheck = [node.id, ...allChildIds.map((child) => child.id)];
        newChecked = newChecked.filter(
          (item) => !idsToUncheck.includes(item.id)
        );
      } else {
        const itemsToAdd = [
          {
            id: node.id,
            node_id: node.node_id,
            label: node?.label,
            name: node?.name,
          },
          ...allChildIds,
        ];
        // Prevent duplicates using id
        const existingIds = new Set(newChecked.map((item) => item.id));
        const filteredItemsToAdd = itemsToAdd.filter(
          (item) => !existingIds.has(item.id)
        );
        newChecked = [...newChecked, ...filteredItemsToAdd];
      }

      setChecked(newChecked);
    },
    [checked, setChecked, getAllChildIds]
  );

  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) =>
      prev.includes(nodeId)
        ? prev.filter((id) => id !== nodeId)
        : [...prev, nodeId]
    );
  };
  const getEffectiveExpandedNodes = (): string[] => {
    if (!search.trim()) return expandedNodes;
    return Array.from(new Set([...expandedNodes, ...forceExpandedNodes]));
  };

  useEffect(() => {
    const newIndeterminate: string[] = [];
    let newChecked = [...checked];

    const checkNodeState = (node: TreeNode) => {
      if (!node.children || node.children.length === 0) return;

      node.children.forEach(checkNodeState);

      const allChildrenChecked = node.children.every((child) =>
        newChecked.some((item) => item.id === child.id)
      );
      const someChildrenChecked = node.children.some((child) =>
        newChecked.some((item) => item.id === child.id)
      );

      if (
        allChildrenChecked &&
        !newChecked.some((item) => item.id === node.id)
      ) {
        newChecked.push({
          id: node.id,
          node_id: node.node_id,
          label: node?.label,
          name: node?.name,
        });
      } else if (
        !allChildrenChecked &&
        newChecked.some((item) => item.id === node.id)
      ) {
        newChecked = newChecked.filter((item) => item.id !== node.id);
      }

      if (someChildrenChecked && !allChildrenChecked) {
        newIndeterminate.push(node.id);
      }
    };

    treeData?.forEach(checkNodeState);

    if (JSON.stringify(newChecked) !== JSON.stringify(checked)) {
      setChecked(newChecked);
    }
    setIndeterminate(newIndeterminate);
  }, [checked, treeData]);

  const filterTree = (nodes: any[], query: string): TreeNode[] => {
    if (!query.trim()) return nodes || [];

    const queryLower = query.toLowerCase();
    return nodes
      .map((node) => {
        const matchesSelf = node.label.toLowerCase().includes(queryLower);
        const childNodes = node.children
          ? filterTree(node.children, query)
          : [];
        const matchesChildren = childNodes.length > 0;

        if (matchesSelf || matchesChildren) {
          return {
            ...node,
            children: matchesSelf ? node.children : childNodes,
          };
        }

        return null;
      })
      .filter((node): node is TreeNode => node !== null);
  };

  const visibleTree = search ? filterTree(treeData, search) : treeData;
  const effectiveExpandedNodes = getEffectiveExpandedNodes();
  const expandAll = () => {
    const getAllIds = (nodes: TreeNode[]): string[] => {
      let ids: string[] = [];
      for (const node of nodes) {
        ids.push(node.id);
        if (node.children) {
          ids.push(...getAllIds(node.children));
        }
      }
      return ids;
    };
    setnodecollapse(true);
    setExpandedNodes(getAllIds(treeData));
  };

  const collapseAll = () => {
    setnodecollapse(false);
    setExpandedNodes([]);
  };

  // When search changes, find all matching nodes and expand their parents
  useEffect(() => {
    if (!search.trim()) {
      setnodecollapse(true);
      expandAll();
      return;
    }
    const searchLower = search.toLowerCase();
    const matchingNodes: TreeNode[] = [];
    const nodesToExpand = new Set<string>();

    const findMatchingNodes = (nodes: TreeNode[]) => {
      nodes.forEach((node) => {
        if (node.label.toLowerCase().includes(searchLower)) {
          matchingNodes.push(node);
          // Get all parent IDs for this node
          const { parents } = findNodeAndParents(treeData, node.id) || {};
          if (parents) {
            parents.forEach((id) => nodesToExpand.add(id));
          }
        }
        if (node.children) {
          findMatchingNodes(node.children);
        }
      });
      setnodecollapse(true);
    };

    findMatchingNodes(treeData);
    setForceExpandedNodes(Array.from(nodesToExpand));
  }, [search, treeData]);

  const fetchDashboardDetails = async () => {
    const locationData: any = checked?.map((item: any) => {
      return { LOCATION_ID: item?.node_id };
    });

    const locationNames = checked?.map((item: any) => item?.label).join(", ");
    const locationwithHierarchicalNames = checked
      ?.map((item: any) => item?.name)
      .join(", ");

    if (pathname === "/dashboard") {
      setLocationName(locationNames);
      setLocationCheckData(checked);
      await getDashboardDetails(true, locationData);
    } else {
      setLocationResetStatus(false);
      if (locationUrl === "/servicerequestlist?add=") {
        setLocationName(locationNames);
        setLocationResetStatus(false);
        handleLocationFilter(locationData, checked);
      } else {
        if (locationData?.length > 0) {
          setLocationName(locationwithHierarchicalNames);
          handleLocationFilter(locationData);
        } else {
          clearLocationFilter();
        }
      }
    }
    showEquipmentlist(false);
  };

  const handleInputDialogBox = () => {
    fetchDashboardDetails();
  };

  const handleCancel = () => {
    showEquipmentlist(false);
  };

  useEffect(() => {
    if (visibleEquipmentlist) {
      if (locationResetStatus === true) {
        console.log(111);
        collapseAll();
        setChecked([]);
      } else {
        if (locationUrl === "/servicerequestlist?add=") {
          setChecked(LOCATIONID);
        } else if (pathname === "/dashboard") {
          setChecked(locationCheckData);
        } else {
          setChecked([...checked]);
        }
      }
    } else {
      if (visibleEquipmentlist === false && pathname === "/workorderlist") {
        console.log(clearLocation, "clearLocation");
        if (clearLocation === true) {
          // collapseAll();
          // setCheckedKeys([]);
          setLocationName(null);
          // handleLocationFilter([]);
          setLocationList([]);
          setChecked([]);
        } else {
          const locationData: any =
            checked &&
            checked?.map((item: any) => {
              return { LOCATION_ID: item?.node_id };
            });

          const locationwithHierarchicalNames = checked
            ?.map((item: any) => item?.name)
            .join(", ");
          if (locationData?.length > 0) {
            setLocationName(locationwithHierarchicalNames);
            handleLocationFilter(locationData);
          }
        }
      }
    }
  }, [visibleEquipmentlist, locationResetStatus]);

  useEffect(() => {
    setChecked([]);

    setInitialCheckedKeys([]);
  }, [selectedFacility]);

  const onHideDialog = () => {
    showEquipmentlist(false);
    if (pathname === "/dashboard") {
      setChecked([]);
    } else if (locationUrl === "/servicerequestlist?add=") {
      setChecked([]);
    }
  };
  return (
    <>
      <Dialog
        onHide={onHideDialog}
        visible={visibleEquipmentlist}
        style={{ width: "700px", height: "750px" }}
        className="dialogBoxTreeStyle"
        dismissableMask
        content={() => (
          <div
            className="serviceEquipment bg-white p-4"
            style={{ maxHeight: "750px", overflow: "auto" }}
          >
            <div className=" flex w-full gap-3 px-6 justify-between">
              <div className="w-4/5">
                <IconField iconPosition="left" className="">
                  <InputText
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
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
                <Button
                  onClick={() => {
                    handleCancel();
                  }}
                >
                  <i className="pi pi-times x-button hover"></i>
                </Button>
              </div>
            </div>
            <div className=" serviceHeirarchy1">
              <div className="treeNodeList">
                {visibleTree.length > 0 ? (
                  visibleTree.map((node) => (
                    <TreeNode
                      key={node.id}
                      node={node}
                      checked={checked}
                      indeterminate={indeterminate}
                      onCheck={updateCheckStates}
                      onToggle={toggleNode}
                      expandedNodes={effectiveExpandedNodes}
                    />
                  ))
                ) : (
                  <p>No nodes found matching your search.</p>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center p-4 px-[24px] py-[12px] border-t border-gray-200">
              <div className="">
                <a
                  className="status-subheading cursor-pointer"
                  onClick={() => clearSelection()}
                >
                  Clear Selection
                </a>
              </div>
              {pathname !== "/workorderlist" && (
                <Button
                  type="button"
                  className="Primary_Button w-28 me-2"
                  label={"Apply"}
                  onClick={handleInputDialogBox}
                />
              )}
            </div>
          </div>
        )} // Use
      ></Dialog>
    </>
  );
};

export default LocationHierarchyDialog;
