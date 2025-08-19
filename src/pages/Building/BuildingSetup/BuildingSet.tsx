import { useEffect, useRef, useState } from "react";
import "./FacilitySetup.css";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { useTranslation } from "react-i18next";
import { SplitButton } from "primereact/splitbutton";
import { Menu } from "primereact/menu";
import { useNavigate, useLocation } from "react-router-dom";
import { ENDPOINTS } from "../../../utils/APIEndpoints";
import { callPostAPI } from "../../../services/apis";
import { getCommonLocationMasterList } from "../LocationType/getLocationCommonHelper";
import "../../../components/Button/Button.css";
import { useOutletContext } from "react-router-dom";
import { toast } from "react-toastify";
import { OverlayPanel } from "primereact/overlaypanel";
import {
  TemplateBuildingDownload,
  readUploadFile,
} from "../../../components/TemplateDownload/TemplateDownload";
import { Dialog } from "primereact/dialog";
import { FileUpload } from "primereact/fileupload";
import { saveTracker } from "../../../utils/constants";
import { appName } from "../../../utils/pagePath";

function RecursiveNode({
  nodes,
  selectedMenu,
  setSelectedNode,
  selectedNode,
  setSelectedMenu,
  MenuList,
  handleCopyCut,
  pasteData,
  setPasteData,
  collapseLastLevel,
  toggleCollapse,
  searchText,
}: any) {
  const menuRef: any = useRef(null);
  const [visibleNodes, setVisibleNodes] = useState<{ [key: number]: boolean }>(
    {}
  );

  const filterNodes = (nodes: any[]): any[] => {
    return nodes
      .map((node: any) => {
        const childMatches = filterNodes(node.node_child || []);
        const selfMatches = node.node_name
          ?.toLowerCase()
          .includes(searchText?.toLowerCase());

        if (selfMatches || childMatches.length > 0) {
          return {
            ...node,
            node_child: childMatches,
          };
        }

        return null;
      })
      .filter(Boolean);
  };

  const filteredNodes = searchText ? filterNodes(nodes) : nodes;
  const toggleVisibility = (nodeId: number) => {
    setVisibleNodes({
      ...visibleNodes,
      [nodeId]: !visibleNodes[nodeId],
    });
  };
  const handleMenu = (e: any, node: any) => {
    localStorage.setItem("parentId", node.node_id);
    menuRef?.current?.toggle(e);
    if (handleCopyCut) {
      setPasteData(node);
      if (selectedNode?.node_type_id > node?.node_type_id) {
        setSelectedMenu(MenuList?.Paste);
      } else {
        setSelectedMenu(MenuList?.Cancel);
      }
    } else {
      if (node?.node_child?.length) {
        setSelectedMenu(MenuList?.AllList);
        setSelectedNode(node);
      } else {
        setSelectedMenu(MenuList?.Delete);
        setSelectedNode(node);
      }
    }
  };

  const getExpandedNodeIds = (
    nodes: any[],
    searchText: string,
    parentChain: number[] = []
  ): number[] => {
    let matchedIds: number[] = [];

    for (const node of nodes) {
      const nodeMatches = node.node_name
        ?.toLowerCase()
        .includes(searchText.toLowerCase());
      const childMatches = getExpandedNodeIds(
        node.node_child || [],
        searchText,
        [...parentChain, node.node_id]
      );

      if (nodeMatches || childMatches.length > 0) {
        matchedIds.push(...parentChain, node.node_id, ...childMatches);
      }
    }

    return Array.from(new Set(matchedIds));
  };

  useEffect(() => {
    const expandAllNodes = (nodes: any[]): { [key: number]: boolean } => {
      return nodes.reduce((acc: any, node: any) => {
        acc[node.node_id] = true;
        if (node.node_child?.length) {
          Object.assign(acc, expandAllNodes(node.node_child));
        }
        return acc;
      }, {});
    };

    const collapseAll = () => setVisibleNodes({});

    if (searchText) {
      const idsToExpand = getExpandedNodeIds(nodes, searchText);
      const expandedMap = idsToExpand.reduce((acc: any, id: number) => {
        acc[id] = true;
        return acc;
      }, {});
      setVisibleNodes(expandedMap);
    } else if (collapseLastLevel) {
      collapseAll();
    } else {
      const expanded = expandAllNodes(nodes);
      setVisibleNodes(expanded);
    }
  }, [collapseLastLevel, nodes, searchText]);

  return filteredNodes?.map((node: any) => {
    const isLastLevel = node?.node_child?.length === 0;
    return (
      <>
        <div></div>
        <ul className="sm:w-full md:w-60 border-slate-400" key={node.node_id}>
          <Menu model={selectedMenu} popup ref={menuRef} />
          <li className="">
            <span className=" flex mt-2">
              <span
                className={`pi pi-angle-${
                  visibleNodes[node.node_id] ? "down" : "left"
                } mt-2 mr-2 cursor-pointer duration-300`}
                onClick={() => {
                  toggleVisibility(node.node_id);
                }}
              ></span>
              <a
                aria-controls="popup_menu_left"
                key={node.node_id}
                onClick={(e: any) => {
                  handleMenu(e, node);
                }}
                aria-haspopup
                className="text-white child-node"
                title={node?.node_name}
                style={{ backgroundColor: `${node.node_color}` }}
              >
                {node?.node_name}
              </a>
            </span>

            {visibleNodes[node.node_id] &&
              node.node_child &&
              node.node_child.length > 0 && (
                <RecursiveNode
                  nodes={node.node_child}
                  selectedNode={selectedNode}
                  setSelectedNode={setSelectedNode}
                  selectedMenu={selectedMenu}
                  setSelectedMenu={setSelectedMenu}
                  MenuList={MenuList}
                  handleCopyCut={handleCopyCut}
                  pasteData={pasteData}
                  setPasteData={setPasteData}
                  collapseLastLevel={collapseLastLevel} // Pass the collapseLastLevel prop
                  toggleCollapse={toggleCollapse}
                />
              )}
          </li>
        </ul>
      </>
    );
  });
}

const BuildingSet = (props: any) => {
  const buildingOverlay: any = useRef<OverlayPanel>(null);
  const { pathname }: any = useLocation();
  const [selectedFacility, menuList]: any = useOutletContext();
  const currentMenu = menuList
    ?.flatMap((menu: any) => menu?.DETAIL)
    .filter((detail: any) => detail.URL === pathname)[0];
  const {   } = useTranslation();
  const FACILITY: any = localStorage.getItem("FACILITYID");
  const FACILITYID: any = JSON.parse(FACILITY);

  if (FACILITYID) {
    var facility_type: any = FACILITYID?.FACILITY_TYPE;
  }
  const scrollTopRef = useRef<HTMLDivElement | null>(null);
  const scrollContentRef = useRef<HTMLDivElement | null>(null);
  const menuLeft: any = useRef(null);
  const navigate: any = useNavigate();
  const [handleCopyCut, setHandleCopyCut] = useState<any>();
  const [buildingNode, setBuildingNode] = useState([]);
  const [facilityDetails, setFacilityDetails] = useState<any>();
  const [locationList, setLocationList] = useState([]);
  const [selectedNode, setSelectedNode] = useState<any>([]);
  const [isClickOn, setIsClickOn] = useState<string>("");
  const [pasteData, setPasteData] = useState<any>(null);
  const [visibleNodes, setVisibleNodes] = useState<{ [key: number]: boolean }>(
    {}
  );
  const [collapseLastLevel, setCollapseLastLevel] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [contentWidth, setContentWidth] = useState(0);
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
        await getAPI();
      },
    },
  ];
  const toggleCollapseAll = () => {
    setCollapseLastLevel(!collapseLastLevel);
  };
  const getAPI = async () => {
    try {
      const res = await callPostAPI(
        ENDPOINTS.GETEXCELTEMPLATECOMMON,
        null,
        currentMenu?.FUNCTION_CODE
      );
      if (res) {
      }

      TemplateBuildingDownload(res?.DATALIST, res?.JDATALIST, "Building Setup");
    } catch (error: any) {
      toast.error(error);
    }
  };

  const [visible, setVisible] = useState<boolean>(false);
  const setDialogVisible = () => {
    setVisible(!visible);
  };
  const isUploadData = () => {
    setVisible(true);
  };

  let FacilityList = [
    {
      label: "Create",
      icon: "pi pi-plus",
      command: () => {
        let payload = {
          addHeaderName: `Add Location`,
          facilityId: facilityDetails?.facilityId,
          locationId: facilityDetails?.locationId,
          locationTypeId: facilityDetails?.typeId,
          mode: "A",
        };

        navigate(`${appName}/location?add=`, { state: payload });
      },
    },
    {
      label: "Edit",
      icon: "pi pi-file-edit",
      command: () => {
        let payload = {
          addHeaderName: `Edit Building`,
          facilityId: facilityDetails?.facilityId,
          locationId: facilityDetails?.locationId,
          locationTypeId: facilityDetails?.typeId,
          requestApproval: facilityDetails?.requestApproval,
          materialApproval: facilityDetails?.materialApproval,
          mode: "E",
        };
        navigate(`${appName}/addfacilitysetup?edit=`, { state: payload });
      },
    },
  ];

  let AllList = [
    {
      label: "Create",
      icon: "pi pi-plus",
      command: () => {
        setIsClickOn("A");
      },
    },
    {
      label: "Edit",
      icon: "pi pi-file-edit",
      command: () => {
        setIsClickOn("E");
      },
    },
    {
      label: "Copy",
      icon: "pi pi-copy",
      command: () => {
        setHandleCopyCut("C");
      },
    },
    {
      label: "Cut",
      icon: "pi pi-times",
      command: () => {
        setHandleCopyCut("X");
      },
    },
  ];

  const [selectedMenu, setSelectedMenu] = useState(AllList);

  let Delete = [
    ...AllList,
    {
      label: "Delete",
      icon: "pi pi-trash",
      color: "#ddd",
      command: async () => {
        setIsClickOn("D");
      },
    },
  ];

  let Cancel = [
    {
      label: "Cancel",
      icon: "pi pi-times",
      command: () => {
        setHandleCopyCut(null);
        setPasteData(null);
        setSelectedNode(null);
      },
    },
  ];

  let Paste = [
    {
      label: "Paste",
      icon: "pi pi-clipboard",
      command: async () => {
        setIsClickOn("P");
      },
    },
    ...Cancel,
  ];

  const getHierarchyList = async (locationId: any) => {
    const payload: any = {
      LOCATION_ID: locationId,
    };

    const res = await callPostAPI(ENDPOINTS?.GETHIRARCHY_LIST, payload);
    if (res?.FLAG === 1) {
      setBuildingNode(res?.LOCATIONHIERARCHYLIST);
    }
  };

  useEffect(() => {
    if (scrollContentRef.current) {
      setContentWidth(scrollContentRef.current.scrollWidth);
    }
  }, [buildingNode, searchText]);

  useEffect(() => {
    const handleScroll = (e: any) => {
      if (scrollTopRef.current && scrollContentRef.current) {
        scrollTopRef.current.scrollLeft = scrollContentRef.current.scrollLeft;
      }
    };

    const handleTopScroll = (e: any) => {
      if (scrollContentRef.current && scrollTopRef.current) {
        scrollContentRef.current.scrollLeft = scrollTopRef.current.scrollLeft;
      }
    };

    const content = scrollContentRef.current;
    const top = scrollTopRef.current;

    if (content) {
      content.addEventListener("scroll", handleScroll);
    }
    if (top) {
      top.addEventListener("scroll", handleTopScroll);
    }

    return () => {
      if (content) {
        content.removeEventListener("scroll", handleScroll);
      }
      if (top) {
        top.removeEventListener("scroll", handleTopScroll);
      }
    };
  }, []);

  const buildingSetUp = async () => {
    try {
      const res = await callPostAPI(ENDPOINTS?.BUILDING_DETAILS);

      setFacilityDetails({
        ...facilityDetails,
        name: res?.FACILITYDETAILS[0]?.FACILITY_NAME,
        color: res?.FACILITYDETAILS[0]?.COLORS,
        typeId: res?.FACILITYDETAILS[0]?.LOCATIONTYPE_ID,
        locationId: res?.FACILITYDETAILS[0]?.LOCATION_ID,
        facilityId: res?.FACILITYDETAILS[0]?.FACILITY_ID,
        requestApproval: res?.FACILITYDETAILS[0]?.REDIRECT_APPROVAL,
        materialApproval: res?.FACILITYDETAILS[0]?.MATREQ_APPROVAL,
      });

      await getHierarchyList(res?.FACILITYDETAILS[0]?.LOCATION_ID);
    } catch (error: any) {
      toast.error(error);
    }
  };
  //

  const onClickAction = async () => {
    const payload: any = {
      FROM_LOCATION_ID: selectedNode?.node_id,
      FROM_LOCATION_TYPE_ID: selectedNode?.node_type_id,
      TO_LOCATION_ID: pasteData?.node_id,
      TO_LOCATION_TYPE_ID: pasteData?.node_type_id,
      MODE: handleCopyCut === "X" ? "X" : "C",
      PARA: { para1: "Location ", para2: " Copied" },
    };

    const res = await callPostAPI(ENDPOINTS?.PASTE_LOCATION, payload);
    if (res?.FLAG) {
      setHandleCopyCut(null);
      await getHierarchyList(facilityDetails?.locationId);
      const response = await callPostAPI(ENDPOINTS?.COMMON_LOCATION_LIST, {});
    } else {
      toast?.error(res?.MSG);
    }
    setIsClickOn("");
  };

  const onDelete = async () => {
    const payload: any = {
      LOCATION_ID: selectedNode?.node_id,
    };
    const res = await callPostAPI(ENDPOINTS?.DELETE_LOCATION, payload);
    if (res?.FLAG === true) {
      const response = await callPostAPI(ENDPOINTS?.COMMON_LOCATION_LIST, {});
      toast.success(res?.MSG);
      await getHierarchyList(facilityDetails?.locationId);
    } else {
      toast.error(res?.MSG);
    }
    setIsClickOn("");
  };

  const onClickAddLocation = (mode: string, headerName: string) => {
    let payload = {
      addHeaderName: headerName,
      locationId: selectedNode?.node_id,
      locationTypeId: selectedNode?.node_type_id,
      mode: mode,
      currentMenu: currentMenu,
    };
    if (mode === "A") {
      navigate(`${appName}/location?add=`, { state: payload });
    } else {
      navigate(`${appName}/location?edit=`, { state: payload });
    }
  };

  useEffect(() => {
    (async function () {
      await buildingSetUp();
      getCommonLocationMasterList().then((res) =>
        setLocationList(res?.LOCATIONTYPELIST)
      );
      await saveTracker(currentMenu);
    })();
  }, [selectedFacility]);
  useEffect(() => {
    (async function () {
      if (isClickOn === "D") {
        await onDelete();
      }
      if (isClickOn === "P") {
        await onClickAction();
      }
      if (isClickOn === "A") {
        onClickAddLocation("A", "Add Location");
      }
      if (isClickOn === "E") {
        onClickAddLocation("E", "Edit Location");
      }
    })();
  }, [isClickOn]);

  return (
    <>
      <Card className="facility-card mt-2 h-100">
        <div className="grid grid-cols-1">
          <div>
            <div className="flex justify-between px-4 py-2">
              <div>
                <h6 className="Text_Primary mb-1">
                  {currentMenu?.FUNCTION_DESC}
                </h6>
              </div>

              <div></div>
              <div>
                <input
                  type="text"
                  placeholder="Search nodes"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className=" border rounded  h-10  mr-2 border-gray-300 p-2"
                />
                <SplitButton
                  label={ ("Action")}
                  className="Primary_SplitButton mr-2"
                  model={Actionitems}
                />
                <Button
                  type="button"
                  icon="pi pi-map"
                  label="Legends"
                  className="Secondary_Button mr-2 "
                  onClick={(e) => buildingOverlay.current.toggle(e)}
                />

                <OverlayPanel ref={buildingOverlay} showCloseIcon>
                  <div className="px-4">
                    <label className="Text_Secondary">Legend</label>
                    {locationList?.map((location: any, index: any): any => {
                      if (location?.ACTIVE) {
                        return (
                          <div className="flex mt-3" key={index}>
                            <span
                              className="w-6 h-6 rounded-md"
                              style={{ backgroundColor: `${location?.COLORS}` }}
                            ></span>
                            <label className="ml-3 Text_Primary">
                              {location?.LOCATIONTYPE_NAME}
                            </label>
                          </div>
                        );
                      }
                    })}
                  </div>
                </OverlayPanel>

                <Button
                  type="button"
                  label={collapseLastLevel ? "Expand All " : "Collapse All "}
                  className="Secondary_Button"
                  onClick={toggleCollapseAll}
                />
              </div>
            </div>

            <div className=" tree-scroll-wrapper relative w-full">
              <div
                ref={scrollTopRef}
                className="absolute top-9 left-0 right-0 h-4 overflow-x-auto overflow-y-hidden z-10"
              >
                <div style={{ width: contentWidth }} />
              </div>
            </div>
            <div className="">
              <div className="vertical-tree">
                <div className="px-4">
                  <Menu
                    model={handleCopyCut ? Paste : FacilityList}
                    popup
                    ref={menuLeft}
                    id="popup_menu_left"
                  />
                  <Button
                    className="buildingBtn"
                    title={facilityDetails?.name}
                    style={{
                      backgroundColor: `${facilityDetails?.color}`,
                      color: "white",
                      width: "auto",
                    }}
                    onClick={(event) => {
                      localStorage.setItem(
                        "parentId",
                        facilityDetails?.locationId
                      );
                      if (selectedNode && handleCopyCut) {
                        setPasteData({
                          node_id: facilityDetails?.locationId,
                          node_type_id: facilityDetails?.typeId,
                        });
                      }
                      menuLeft?.current.toggle(event);
                    }}
                    aria-controls="popup_menu_left"
                    aria-haspopup
                  >
                    {facilityDetails?.name}
                  </Button>
                </div>

                <div
                  ref={scrollContentRef}
                  className={`flex tree-container border- -2  border-slate-400 ${
                    contentWidth > 1860 ? "m-5 p-2" : "m-2 p-1"
                  }`}
                  style={{ maxWidth: "99%" }}
                >
                  <div className="flex">
                    <RecursiveNode
                      nodes={buildingNode}
                      selectedNode={selectedNode}
                      setSelectedNode={setSelectedNode}
                      selectedMenu={selectedMenu}
                      setSelectedMenu={setSelectedMenu}
                      MenuList={{ AllList, Paste, Delete, Cancel }}
                      handleCopyCut={handleCopyCut}
                      pasteData={pasteData}
                      setPasteData={setPasteData}
                      collapseLastLevel={collapseLastLevel}
                      toggleCollapse={collapseLastLevel}
                      searchText={searchText}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Dialog
        header="Bulk Upload"
        visible={visible}
        style={{ width: "30vw" }}
        onHide={() => setDialogVisible()}
      >
        <div className="">
          <FileUpload
            mode="basic"
            name="demo[]"
            accept="xlsx/*"
            maxFileSize={1000000}
            className="ml-2"
            onSelect={async (e) => {
              try {
                const response: any = await readUploadFile(
                  e,
                  currentMenu?.FUNCTION_CODE,
                  setVisible
                );
                if (response?.flag || response?.FLAG) {
                  const response = await callPostAPI(
                    ENDPOINTS?.COMMON_LOCATION_LIST,
                    {}
                  );
                  await getHierarchyList(facilityDetails?.locationId);
                  // toast?.success(response?.MSG);
                  toast?.success("Location uploaded successfully");
                  props?.getAPI();
                } else {
                  toast?.error(response?.MSG);
                }
              } catch (error) {}
              // readUploadFile(e,currentMenu?.FUNCTION_CODE ,setVisible);
            }}
          />
        </div>
      </Dialog>
    </>
  );
};

export default BuildingSet;
