import React, { useEffect, useRef, useState } from 'react'
import "./FacilitySetup.css"
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { useTranslation } from "react-i18next";
import { SplitButton } from 'primereact/splitbutton';
import { Menu } from 'primereact/menu';
import { useNavigate, useLocation } from 'react-router-dom';
import { ENDPOINTS } from '../../../utils/APIEndpoints';
import { callPostAPI } from '../../../services/apis';
import { getCommonLocationMasterList } from '../LocationType/getLocationCommonHelper';
import { toast } from 'react-toastify';
import "../../../components/Button/Button.css"
import { useOutletContext } from 'react-router-dom';
const BuildingSet = () => {
  const { pathname }: any = useLocation();
  const [selected, menuList]: any = useOutletContext();
  const currentMenu = menuList?.flatMap((menu: any) => menu?.DETAIL).filter((detail: any) => detail.URL === pathname)[0];
  const { t } = useTranslation();
  const menuLeft: any = useRef(null);
  const navigate: any = useNavigate();
  const menu: any = useRef(null);
  const [locationId, setLocationId] = useState()
  const [level2, setLevel2] = useState();
  const [facilityData, setFacilityData] = useState();
  const [copyFacilityData, setCopyFacilityData] = useState({});
  const [loading, setLoading] = useState(true);
  const [cutAction, setCutAction] = useState(false);
  const [menuToggle, SetMenu] = useState([])

  const [pasteAction, setPasteAction] = useState(false)
  const [copyAction, setCopyAction] = useState(false)
  const [locationCopy, setLocationCopy] = useState({})
  const [facilityDetails, setFacilityDetails] = useState({
    name: '',
    color: '',
    typeId: '',
    locationId: ''
  });
  const [locationList, setLocationList] = useState([])

  const buildingSetUp = async () => {

    let payload: any = {
      "LOCATION_ID": '0',
    }
    const res = await callPostAPI(ENDPOINTS?.BUILDING_DETAILS, payload)

    setFacilityDetails({
      ...facilityDetails,
      name: res?.FACILITYDETAILS[0]?.FACILITY_NAME,
      color: res?.FACILITYDETAILS[0]?.COLORS,
      typeId: res?.FACILITYDETAILS[0]?.LOCATIONTYPE_ID,
      locationId: res?.FACILITYDETAILS[0]?.LOCATION_ID
    })
  }


  const getHierarchyList = async () => {
    const payload: any = {
      "LOCATION_ID": facilityDetails?.locationId,
    }
    const res = await callPostAPI(ENDPOINTS?.GETHIRARCHY_LIST, payload)
    if (res?.FLAG === 1) {
      SetMenu(res?.LOCATIONHIERARCHYLIST)
    }

    setLoading(false);
  }

  //Get HierarList
  useEffect(() => {
    if (selected !== null) {
      getHierarchyList();
    }
  }, [facilityDetails, selected])

  const Actionitems = [
    {
      label: 'Download Template',
      icon: 'pi pi-download'
    }
  ];


  //Main Facility Action
  let LevelActionList = [
    {
      label: 'Create', icon: 'pi pi-plus',
      command: () => {
        localStorage.removeItem('edit')
        navigate('/addlocation');

      }
    },
    {
      label: 'Edit', icon: 'pi pi-file-edit',
      command: () => {
        let id: any = locationId;
        localStorage.setItem('edit', "true")
        let editMode: any = true;
        let addHeaderName: any = `Edit ${currentMenu?.FUNCTION_DESC}`;
        navigate('/addfacilitysetup', { state: addHeaderName })
      },
    },
    {
      separator: true
    },
    {
      label: 'Delete', icon: 'pi pi-trash',
      command: async () => {
      }
    }
  ]

  //nested Hierarchy action 
  let Level1ActionList = [
    {
      label: 'Create', icon: 'pi pi-plus',
      command: () => {
        localStorage.removeItem('edit')
        let addHeaderName: any = `Add Location`;
        navigate('/addlocation', { state: addHeaderName });
      }
    },
    {
      label: 'Edit', icon: 'pi pi-file-edit',
      command: () => {
        localStorage.setItem('edit', "true")
        let addHeaderName: any = `Edit Location`;
        navigate('/addlocation', { state: addHeaderName });
      }
    },
    {
      label: 'Copy', icon: 'pi pi-copy',
      command: () => {
        setCopyAction(true)

      }
    },
    {
      label: 'Cut', icon: 'pi pi-times',
      command: () => {
        setCutAction(true);
        setCopyAction(true)
      }
    },
    {
      separator: true
    },
    {
      label: 'Delete', icon: 'pi pi-trash',
      color: '#ddd',
      command: async () => {
        let id: any = localStorage.getItem("id")
        const payload: any =
        {
          "LOCATION_ID": localStorage.getItem('id'),
        }
        const Payload: any = {
          "LOCATION_ID": locationId,
        }

        const res = await callPostAPI(ENDPOINTS?.DELETE_LOCATION, payload)
        if (res?.FLAG === true) {
          toast.success(res?.MSG)
          const res1 = await callPostAPI(ENDPOINTS?.GETHIRARCHY_LIST, Payload)

          if (res1?.FLAG === 1) {
            getHierarchyList()
          }
        } else {
          toast.error(res?.MSG)
        }
      }
    }

  ];

  let Level2ActionList = [
    {
      label: 'Cancel', icon: 'pi pi-clipboard', command: () => {
        setCopyAction(false);
        setPasteAction(false);
        setCopyFacilityData({})
      }
    },

    {
      label: 'Paste', icon: 'pi pi-clipboard',
      command: async () => {
        const copyData: any = locationCopy;
        const pasteData: any = facilityData;

        const Payload: any = {
          "LOCATION_ID": locationId,
        }
        const payload: any = {
          "FROM_LOCATION_ID": copyData?.node_id === undefined ? copyData?.items?.node_id : copyData?.node_id,
          "FROM_LOCATION_TYPE_ID": copyData?.node_type_id === undefined ? copyData?.items?.node_type_id : copyData?.node_type_id,
          "TO_LOCATION_ID": localStorage.getItem("id"),
          "TO_LOCATION_TYPE_ID": localStorage.getItem("typeId"),
          "MODE": cutAction ? "X" : "C",   //FOR PASTE SEND "X"
          "PARA": { "para1": "Location ", "para2": " Copied" }
        }

        const res = await callPostAPI(ENDPOINTS?.PASTE_LOCATION, payload)
        if (res?.FLAG === true) {
          setCopyFacilityData({})
          setCopyAction(false);
          setPasteAction(false);
          toast.success(res.MSG)
          const res1 = await callPostAPI(ENDPOINTS?.GETHIRARCHY_LIST, Payload)

          if (res1?.FLAG === 1) {
            getHierarchyList()
          }
        } else {
          setCopyAction(false);
          setPasteAction(false);
          toast.error(res.MSG)
        }


      }
    },

  ];

  let Level3ActionList = [
    {
      label: 'Cancel', icon: 'pi pi-clipboard', command: () => {

        setPasteAction(false)
        setCopyAction(false);
        setCopyFacilityData({})
      }
    },
  ]



  const onClickAction = (items: any, idx: any) => {

    setFacilityData(items)
    setPasteAction(false)


    const data: any = { items, ...copyFacilityData };
    let copiedData: any = { ...copyFacilityData };


    if (copyAction) {
      if (Object.keys(copiedData).length > 0) {


        if (parseInt(copiedData?.node_type_id) === parseInt(items?.node_type_id)) {
          setPasteAction(true)
        }
        if (parseInt(copiedData?.node_type_id) > parseInt(items?.node_type_id)) {

          setPasteAction(false)
          setCopyAction(true)
        }

      }

    } else {
      setCopyAction(false)
      setPasteAction(false)
    }
    setLocationCopy(data)
    //  setCopyFacilityData(data);
  }



  const setLevel1Toggle = (index: any, node_id: any) => {
    SetMenu((prevMenus: any) =>
      prevMenus.map((level1: any, i: any, nodeid: any) => {
        if (i === index) {
          return { ...level1, node_show: !level1.node_show };
        }
        return level1;
      })
    );
  };

  const setLevel2Toggle = (index: any, Index1: any) => {

    SetMenu((prevMenus: any) => prevMenus?.map((level1: any) => ({
      ...level1,
      node_child: level1?.node_child?.map((level2: any) => (

        {
          ...level2,
          node_show: !level2?.node_show,

        }))
    })))
  };

  const setLevel3Toggle = (J: any, I: any, K: any) => {

    SetMenu((prevMenus: any) => prevMenus?.map((level1: any) => ({
      ...level1,
      node_child: level1?.node_child?.map((level2: any) => ({
        ...level2,
        // node_show: !level2?.node_show,
        node_child: level2?.node_child?.map((level3: any, i: any) => ({
          ...level3,
          node_show: (i === K ? !level3?.node_show : level3?.node_show)
        }))
      }))
    })))

  }

  const setLevel4Toggle = () => {

    SetMenu((prevMenus: any) => prevMenus?.map((level1: any) => ({
      ...level1,
      node_child: level1?.node_child?.map((level2: any) => ({
        ...level2,
        // node_show: !level2?.node_show,
        node_child: level2?.node_child?.map((level3: any, i: any) => ({
          ...level3,
          node_child: level3?.node_child?.map((level4: any, i: any) => ({
            ...level4,
            node_show: !level4?.node_show
          }))
        }))
      }))
    })))

  }

  useEffect(() => {

    if (selected !== null) {
      buildingSetUp();
      getCommonLocationMasterList().then((res) => (
        setLocationList(res?.LOCATIONTYPELIST)
      ))
    }
    else {
      toast.error(t('Please_select_Building'))
    }

  }, [selected])

  return (




    <Card className='facility-card mt-2 h-100'>
      <div className="grid grid-cols-1 md:grid-cols-8">
        <div className='border-r'>
          <div className='p-4 text-center border-b'>

          </div>

          <div className='p-4'>
            <label className='Text_Secondary'>Legend</label>


            {locationList !== undefined && locationList?.map((location: any, index: any): any => {

              if (location?.ACTIVE) {
                return (
                  <div className='flex mt-3' key={index}>
                    <span className='w-6 h-6 rounded-md' style={{ backgroundColor: `${location?.COLORS}` }}></span>
                    <label className='ml-3 Text_Primary'>{location?.LOCATIONTYPE_NAME}</label>
                  </div>

                )
              }
            })}

          </div>
          {/* :""} */}
        </div>
        <div className="col-span-7">
          <div className="flex justify-between p-4 border-b">
            <div>
              <h6 className="Text_Primary mb-1">{currentMenu?.FUNCTION_DESC}</h6>
            </div>
            <div>
              <SplitButton label={t("Action")} className='Primary_SplitButton' model={Actionitems} />
            </div>
          </div>


          <div className=''>
            <div className="vertical-tree">
              <div className='px-4'>
                {copyAction === false ?
                  <>
                    <Menu model={LevelActionList} popup ref={menuLeft} id="popup_menu_left" />
                    {facilityDetails?.name !== '' ? <Button className='buildingBtn' style={{ backgroundColor: `${facilityDetails?.color}`, color: "white" }}
                      onClick={(event) => {
                        menuLeft?.current.toggle(event)

                        localStorage.setItem('typeId', facilityDetails?.typeId)
                        localStorage.setItem('id', facilityDetails?.locationId)
                      }}

                      aria-controls="popup_menu_left" aria-haspopup>{facilityDetails?.name}</Button> : ""}
                  </> :
                  <>
                    <Menu model={Level2ActionList} popup ref={menuLeft} id="popup_menu_left" />
                    {facilityDetails?.name !== '' ? <Button className='buildingBtn' style={{ backgroundColor: `${facilityDetails?.color}`, color: "white" }}
                      onClick={(event) => {
                        menuLeft?.current.toggle(event)

                        localStorage.setItem('typeId', facilityDetails?.typeId)
                        localStorage.setItem('id', facilityDetails?.locationId)
                      }}

                      aria-controls="popup_menu_left" aria-haspopup>{facilityDetails?.name}</Button> : ""}
                  </>}

              </div>

              <ul className='flex tree-container mt-2'>

                {menuToggle?.length > -1 ?
                  <>
                    {menuToggle && menuToggle.map((LEVEL1: any, I: any) => {

                      return (
                        <li className='border border-slate-400  mr-2' id={I}>
                          <div className='flex'>
                            <span className={`pi pi-angle-down mt-2 mr-2 cursor-pointer duration-300 ${(LEVEL1.node_show ? "" : "rotate-90")}`}
                              onClick={(e) => { setLevel1Toggle(I, LEVEL1.node_id) }} ></span>
                            <a href="javascript:void(0);" aria-controls="popup_menu_left" key={I} onClick={(e) => {
                              menu.current.toggle(e);

                              onClickAction(LEVEL1, I);
                              localStorage.setItem('id', LEVEL1.node_id)
                              localStorage.setItem('typeId', LEVEL1?.node_type_id)
                              setCopyFacilityData(LEVEL1)
                              setFacilityData(LEVEL1)
                            }}
                              aria-haspopup className='text-white' style={{ backgroundColor: `${LEVEL1.node_color}` }}>{LEVEL1.node_name}
                            </a>

                          </div>
                          {pasteAction === true ?
                            <Menu model={Level3ActionList} popup ref={menu} id="popup_menu_left" /> :
                            <>
                              {copyAction === true ?

                                <Menu model={Level2ActionList} popup ref={menu} id="popup_menu_left" /> :
                                <Menu model={Level1ActionList} popup ref={menu} id="popup_menu_left" />
                              }
                            </>
                          }
                          {LEVEL1.node_child && LEVEL1.node_show && (
                            <ul>
                              {LEVEL1.node_child.map((LEVEL2: any, J: any) => {

                                return (
                                  <li >
                                    <div className='flex'>
                                      <span className={`pi pi-angle-down mt-2 mr-2 cursor-pointer duration-300 ${(LEVEL2?.node_show ? "" : "rotate-90")}`}
                                        onClick={(e) => { setLevel2Toggle(J, I) }}

                                      ></span>
                                      <a href="javascript:void(0);" className='text-white'
                                        style={{ backgroundColor: `${LEVEL2?.node_color}` }}
                                        key={J}
                                        onClick={(e) => {
                                          menu.current.toggle(e); onClickAction(LEVEL2, J);
                                          setLevel2(LEVEL2?.node_id)
                                          localStorage.setItem('id', LEVEL2?.node_id)
                                          localStorage.setItem('typeId', LEVEL2?.node_type_id)
                                          setFacilityData(LEVEL2)
                                          setCopyFacilityData(LEVEL2)
                                          localStorage.setItem('node', LEVEL2)
                                        }}
                                      >{LEVEL2?.node_name}</a>
                                      {pasteAction === true ?
                                        <Menu model={Level3ActionList} popup ref={menu} id="popup_menu_left" /> :
                                        <>
                                          {copyAction === true ?

                                            <Menu model={Level2ActionList} popup ref={menu} id="popup_menu_left" /> :
                                            <Menu model={Level1ActionList} popup ref={menu} id="popup_menu_left" />
                                          }
                                        </>
                                      }
                                    </div>

                                    <ul className={`${(LEVEL2?.node_show ? "" : "hidden")}`}>
                                      {LEVEL2.node_child.map((LEVEL3: any, K: any) => {
                                        return (
                                          <li>
                                            <div className='flex'>
                                              <span className={`pi pi-angle-down mt-2 mr-2 cursor-pointer duration-300 ${(LEVEL3.node_show ? "" : "rotate-90")}`}
                                                onClick={(e) => { setLevel3Toggle(J, I, K) }}
                                              ></span>
                                              <a href="javascript:void(0);" className='text-white'
                                                style={{ backgroundColor: `${LEVEL3?.node_color}` }}
                                                key={J}
                                                onClick={(e) => {
                                                  menu.current.toggle(e); onClickAction(LEVEL3, J);
                                                  setLevel2(LEVEL3?.node_id)
                                                  localStorage.setItem('typeId', LEVEL3?.node_type_id)

                                                  localStorage.setItem('id', LEVEL3?.node_id)
                                                  setCopyFacilityData(LEVEL3)
                                                }}
                                              >{LEVEL3?.node_name}</a>
                                              {pasteAction === true ?
                                                <Menu model={Level3ActionList} popup ref={menu} id="popup_menu_left" /> :
                                                <>
                                                  {copyAction === true ?

                                                    <Menu model={Level2ActionList} popup ref={menu} id="popup_menu_left" /> :
                                                    <Menu model={Level1ActionList} popup ref={menu} id="popup_menu_left" />
                                                  }
                                                </>
                                              }
                                            </div>

                                            <ul className={`child-tree-node ${(LEVEL3?.node_show ? "" : "hidden")}`}>
                                              {LEVEL3?.node_child.map((LEVEL4: any, L: any) => {
                                                return (
                                                  <li>
                                                    <div className='flex'>
                                                      <span className={`pi pi-angle-down mt-2 mr-2 cursor-pointer duration-300 ${(LEVEL4.node_show ? "" : "rotate-90")}`}
                                                        onClick={(e) => { setLevel4Toggle() }}
                                                      ></span>
                                                      <a href="javascript:void(0);" className='text-white'
                                                        style={{ backgroundColor: `${LEVEL4?.node_color}` }}
                                                        key={J}
                                                        onClick={(e) => {
                                                          menu.current.toggle(e); onClickAction(LEVEL4, J);
                                                          setLevel2(LEVEL4?.node_id)
                                                          localStorage.setItem('typeId', LEVEL4?.node_type_id)
                                                          localStorage.setItem('id', LEVEL4?.node_id)
                                                          setCopyFacilityData(LEVEL4)
                                                        }}
                                                      >{LEVEL4.node_name}</a>
                                                      {pasteAction === true ?
                                                        <Menu model={Level3ActionList} popup ref={menu} id="popup_menu_left" /> :
                                                        <>
                                                          {copyAction === true ?

                                                            <Menu model={Level2ActionList} popup ref={menu} id="popup_menu_left" /> :
                                                            <Menu model={Level1ActionList} popup ref={menu} id="popup_menu_left" />
                                                          }
                                                        </>
                                                      }
                                                    </div>

                                                    <ul className={`child-tree-node ${(LEVEL4?.node_show ? "" : "hidden")}`}>
                                                      {LEVEL4?.node_child?.map((LEVEL5: any, M: any) => {
                                                        return (
                                                          <li>
                                                            <div className='flex'>
                                                              <span className={`pi pi-angle-down mt-2 mr-2 cursor-pointer duration-300 ${(LEVEL5.node_show ? "" : "rotate-90")}`}
                                                              ></span>
                                                              <a href="javascript:void(0);" className='text-white'
                                                                style={{ backgroundColor: `${LEVEL5?.node_color}` }}
                                                                key={M}
                                                                onClick={(e) => {
                                                                  menu.current.toggle(e); onClickAction(LEVEL5, M);
                                                                  setLevel2(LEVEL5?.node_id)

                                                                  localStorage.setItem('typeId', LEVEL5?.node_type_id)
                                                                  localStorage.setItem('id', LEVEL5?.node_id)
                                                                }}
                                                              >{LEVEL5.node_name}</a>
                                                              {copyAction === true ?
                                                                <Menu model={Level2ActionList} popup ref={menu} id="popup_menu_left" /> :
                                                                <Menu model={Level1ActionList} popup ref={menu} id="popup_menu_left" />
                                                              }
                                                            </div>
                                                            <ul className={`child-tree-node ${(LEVEL5?.node_show ? "" : "hidden")}`}>
                                                              {LEVEL5?.node_child?.map((LEVEL6: any, N: any) => {
                                                                return (
                                                                  <li>
                                                                    <div className='flex'>
                                                                      <span className={`pi pi-angle-down mt-2 mr-2 cursor-pointer duration-300 ${(LEVEL6.node_show ? "" : "rotate-90")}`}
                                                                      ></span>
                                                                      <a href="javascript:void(0);" className='text-white'
                                                                        style={{ backgroundColor: `${LEVEL6?.node_color}` }}
                                                                        key={N}
                                                                        onClick={(e) => {
                                                                          menu.current.toggle(e); onClickAction(LEVEL6, N);
                                                                          setLevel2(LEVEL6?.node_id)

                                                                          localStorage.setItem('id', LEVEL6?.node_id)
                                                                        }}
                                                                      >{LEVEL5.node_name}</a>
                                                                      {/* {facilityAction?.copyAction === false || cutAction === false ?
                                                                        <Menu model={Level1ActionList} popup ref={menu} id="popup_menu_left" /> :
                                                                        <Menu model={Level2ActionList} popup ref={menu} id="popup_menu_left" />} */}
                                                                    </div>
                                                                    <ul className={`child-tree-node ${(LEVEL6?.node_show ? "" : "hidden")}`}>
                                                                      {LEVEL6?.node_child?.map((LEVEL7: any, O: any) => {
                                                                        return (
                                                                          <li>
                                                                            <a href="javascript:void(0);" className='Text_Secondary' style={{ backgroundColor: `${LEVEL7?.node_color}` }}>{LEVEL7?.node_name}</a>
                                                                            <ul className='child-tree-node'>
                                                                              {LEVEL7?.node_child?.map((LEVEL8: any, P: any) => {
                                                                                return (
                                                                                  <li>
                                                                                    <a href="javascript:void(0);" className='Text_Secondary' style={{ backgroundColor: `${LEVEL8?.node_color}` }}>{LEVEL8?.node_name}</a>
                                                                                  </li>
                                                                                )
                                                                              })}
                                                                            </ul>
                                                                          </li>
                                                                        )
                                                                      })}
                                                                    </ul>
                                                                  </li>
                                                                )
                                                              })}
                                                            </ul>

                                                          </li>
                                                        )
                                                      })}
                                                    </ul>
                                                  </li>
                                                )
                                              })}
                                            </ul>
                                          </li>
                                        )
                                      })}
                                    </ul>

                                  </li>
                                )
                              })}
                            </ul>
                          )}
                        </li>
                      )
                    })}
                  </> : ''}
              </ul>
            </div>



          </div>
        </div>
      </div>
    </Card>


  )
}

export default BuildingSet