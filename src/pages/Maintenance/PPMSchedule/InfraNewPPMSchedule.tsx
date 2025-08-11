import { Card } from 'primereact/card'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import Buttons from "../../../components/Button/Button";
import { InputText } from "primereact/inputtext";
import { Accordion, AccordionTab } from 'primereact/accordion';
import { Checkbox } from 'primereact/checkbox';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import "../../../components/Checkbox/Checkbox.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import moment from "moment";
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import { Calendar as BigCalendar, Components, dateFnsLocalizer, momentLocalizer, ToolbarProps, View, Views } from 'react-big-calendar';
import { CalendarDateTemplateEvent, Calendar as PrimeCalendar } from 'primereact/calendar';
import { PATH } from "../../../utils/pagePath";
import "../PPMSchedule/PPMScheduleExtra.css";
// import { format } from "date-fns";
import "./PPMSchedule.css";
import { useTranslation } from 'react-i18next';
import PPMAddForm from './PPMAddForm';
import { callPostAPI } from '../../../services/apis';
import { ENDPOINTS } from "../../../utils/APIEndpoints";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import { toast } from "react-toastify";
import { eventNotification, helperEventNotification } from "../../../utils/eventNotificationParameter";
import { decryptData } from "../../../utils/encryption_decryption";
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Tree, TreeDragDropEvent, TreeExpandedKeysType } from 'primereact/tree';
import "../../../components/DialogBox/DialogBox.css"
import { Sidebar } from 'primereact/sidebar';



const localizer = momentLocalizer(moment);

const DnDCalendar = withDragAndDrop(BigCalendar);
const views = [{
    month: true,
    week: true,
    day: true,
    agenda: true
}]

const InfraNewPPMSchedule = (props: any) => {
    const [date, setDate] = useState<Date | null>(null);
    const [checked, setChecked] = useState<boolean>(false);
    const [scheduleData, setScheduleData] = useState<any | null>([]);
    const [view, setView] = useState<View>('month');
    const [visibleEquipmentlist, showEquipmentlist] = useState(false);
    const [selectedEquipmentKey, setSelectedEquipmentKey] = useState("");
    const [nodecollapse, setnodecollapse] = useState<boolean>(false);
    const handleNavigate = (newDate: Date) => {
        setDate(newDate);
    };

    const CustomToolbar: React.FC<ToolbarProps> = (props) => {
        const { date, onNavigate, label, view, onView } = props;

        // Format the date for the sub-header
        const formattedDate = moment(date).format('dddd, D MMMM YYYY');

        return (
            <div className="rbc-toolbar">
                <div className="rbc-btn-group px-4">
                    <button type="button" onClick={() => onNavigate('TODAY')}>Today</button>
                    <button type="button" className='navigate-btn' onClick={() => onNavigate('PREV')}><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M13.2929 6.29297L7.58594 12L13.2929 17.707L14.7069 16.293L10.4139 12L14.7069 7.70697L13.2929 6.29297Z" fill="#272B30" />
                    </svg></button>
                    <button type="button" className='navigate-btn' onClick={() => onNavigate('NEXT')}><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M10.707 17.707L16.414 12L10.707 6.29297L9.29297 7.70697L13.586 12L9.29297 16.293L10.707 17.707Z" fill="#272B30" />
                    </svg></button>
                </div>
                <div className="rbc-toolbar-label">{label}</div>
                <div className="rbc-btn-group px-4">
                    <button type="button" className={view === 'month' ? 'rbc-active' : ''} onClick={() => onView('month')}>Month</button>
                    <button type="button" className={view === 'week' ? 'rbc-active' : ''} onClick={() => onView('week')}>Week</button>
                    <button type="button" className={view === 'day' ? 'rbc-active' : ''} onClick={() => onView('day')}>Day</button>
                    <button type="button" className={view === 'agenda' ? 'rbc-active' : ''} onClick={() => onView('agenda')}>Agenda</button>
                </div>
                <div className="thin-line1"></div>
                {/* Sub-header with formatted date */}{view === 'month' ? '' :
                    <div className="rbc-date-subheader px-4 py-1">
                        {formattedDate}
                    </div>}
            </div>
        );
    };
    const CustomTimeGutterHeader = () => {
        return (
            <div
                className="rbc-time-header-gutter"
            >
                All Day
            </div>
        );
    };

    // const CustomTimeGutter = (props: any) => {
    //   // Extract time from props
    //   const time = props.date || new Date();
    //   const formattedTime = moment(time).format('h A');

    //   return (
    //     <div 
    //       className="rbc-label" 
    //       style={{ 
    //         fontSize: '12px',
    //         fontWeight: 'normal',
    //         color: '#666',
    //         textAlign: 'center',
    //         padding: '5px'
    //       }}
    //     >
    //       {formattedTime}
    //     </div>
    //   );
    // };
    const timeGutterFormat = (date: Date, culture?: string) => {
        return moment(date).format('h A');
    };

    // Custom time slot wrapper - adjusted to match expected props
    const CustomTimeSlotWrapper = (props: any) => {
        return (
            <div
                className="rbc-time-slot"
                style={{
                    borderBottom: '1px solid #eee',
                    height: '48px',

                }}
            >
                {props.children}
            </div>
        );
    };




    // priyanka code start

    let location: any = useLocation();
    const [, menuList]: any = useOutletContext();
    const currentMenu = menuList
        ?.flatMap((menu: any) => menu?.DETAIL)
        .filter((detail: any) => detail.URL === location?.pathname)[0];
    // const [selectedDetails, setSelectedDetails] = useState<any>([]);
    const [showForm, setShowForm] = useState<any | null>(false)
    const [options, setOptions] = useState<any | false>([])
    const [locationtypeOptions, setlocationtypeOptions] = useState([]);
    const [assetOption, setAssetOption] = useState<any | null>([])
    const [type, setType] = useState<any | null>([]);
    const [currentView, setCurrentView] = useState<any | null>(false);
    const [startDate, setStartDate] = useState(new Date());
    const [visible, setVisible] = useState(true);
    const navigate: any = useNavigate();
    const [selectedKey, setSelectedKey] = useState("");
    const [visibleSidebar, setVisibleSidebar] = useState<boolean>(false);
    const [sidebarDetail, setSidebarDetail] = useState<any | null>([]);
    const [expandedKeys, setExpandedKeys] = useState<any | null>({
        "0": true,
        "0-0": true,
    });
    const [nodes, setNodes] = useState<any | null>([]);
    const [filteredData, setFilteredData] = useState<any | null>(nodes);
    const [searchQuery, setSearchQuery] = useState("");
    const events = [
        {
            title: 'Meeting',
            start: new Date(2025, 4, 20, 10, 0),
            end: new Date(2025, 4, 20, 12, 0),
        },
    ];
    const {
        register,
        handleSubmit,
        control,
        setValue,
        watch,
        formState: { errors },
    } = useForm({
        defaultValues: {
            LOCATION_ID: "",
            ASSETGROUP_ID: "",
            ASSETTYPE_ID: "",
            SEL_FACILITY: "",
            SEL_LOCATION: "",
            SEL_ASSETGROUP: "",
            SEL_ASSETTYPE: "",
            ASSETNAME: ""
        },
    });
    const watchAllFields: any = watch()
    const onSubmit = async () => { };


    const handleSelectedEvent = (event: any) => {
        setVisibleSidebar(true);
        setSidebarDetail(["state", { schedule_id: event?.schedule_id, functionCode: currentMenu?.FUNCTION_CODE }])
        // navigate(PATH.PPMSCHEDULEDETAILS, { state: { schedule_id: event?.schedule_id, functionCode: currentMenu?.FUNCTION_CODE } })
    }


    const onEventDrop = async (data: any) => {
        const { start, event } = data;
        setScheduleData((prevEvents: any) =>
            prevEvents.map((prevEvent: any) => {
                return (
                    prevEvent?.id === event?.id
                        ? { ...event, start }
                        : prevEvent
                )
            }
            ));

        if (start >= new Date()) {
            const payload: any = {
                "ACTIVE": 1,
                "PPM_ID": event?.schedule_id,
                "SER_REQ_NO": "",
                "MODE": "UPDATE",
                "SCHEDULE_DATE": moment(start).format('YYYY-MM-DD'),
                "SCHEDULE_DATETIME": moment(start).format("HH:mm"),
                "REMARKS": "Test",
                "PARA": { para1: `${currentMenu?.FUNCTION_DESC}`, para2: "Changed" }
            }

            const res = await callPostAPI(ENDPOINTS.UPDATE_PPM_SCHEDULE_DETAILS, payload)
            if (res?.FLAG === true) {
                toast.success(res?.MSG)
                let month: any = moment(start).format("MM");
                let year: any = moment(start).format('YYYY')
                let firstDate = moment(new Date(year, parseInt(month) - 1, 1)).format("MM-DD-YYYY");
                let lastDate = moment(new Date(year, parseInt(month), 1)).format("MM-DD-YYYY");
                await getOptions(firstDate, lastDate);
                const notifcation: any = {
                    FUNCTION_CODE: currentMenu?.FUNCTION_CODE,
                    EVENT_TYPE: "P",
                    STATUS_CODE: 2,
                    PARA1: decryptData(localStorage.getItem("USER_NAME")),
                    PARA2: data?.title,
                    PARA3: moment(start).format('DD-MM-YYYY'),
                    PARA4: moment(data?.schedule_date).format('DD-MM-YYYY'),
                    PARA5: data?.schedule_name,
                };

                const eventPayload = { ...eventNotification, ...notifcation };
                await helperEventNotification(eventPayload);
            }
        } else {
            toast.error("Please select current or future date")
            let month: any = moment(start).format("MM");
            let year: any = moment(start).format('YYYY')
            let firstDate = moment(new Date(year, parseInt(month) - 1, 1)).format("MM-DD-YYYY");
            let lastDate = moment(new Date(year, parseInt(month), 1)).format("MM-DD-YYYY");
            await getOptions(firstDate, lastDate);
        }
    };
    const statusOfMonth = async (date: any) => {
        let month: any = moment(date).format("MM");
        let year: any = moment(date).format('YYYY')
        let firstDate = moment(new Date(year, parseInt(month) - 1, 1)).format("MM-DD-YYYY");
        let lastDate = moment(new Date(year, parseInt(month), 1)).format("MM-DD-YYYY");
        await getOptions(firstDate, lastDate)
    }

    const selectedLocationTemplate = (option: any, props: any) => {
        if (option) {
            return (
                <div className="flex align-items-center">
                    <div>{option.LOCATION_DESCRIPTION}</div>
                </div>
            );
        }

        return <span>{props.placeholder}</span>;
    };

    const locationOptionTemplate = (option: any) => {
        return (
            <div className="align-items-center">
                <div className="Text_Primary Input_Label">{option.LOCATION_NAME}</div>
                <div className=" Text_Secondary Helper_Text">
                    {option.LOCATION_DESCRIPTION}
                </div>
            </div>
        );
    };

    const getOptions = async (firstDate: any, lastDate: any) => {
        const data: any = []
        const payload: any = {
            "SCHEDULE_VIEW": 0,
            "START_DATE": firstDate,
            "END_DATE": lastDate,
            "P_W_D": 0,
            "N_W_D": 0,
            "LOCATION": watchAllFields?.ASSETNAME?.length > 0 ? [watchAllFields?.LOCATION_ID] : data,
            "ASSETGROUP": watchAllFields?.ASSETNAME?.length > 0 ? [watchAllFields?.ASSETGROUP_ID] : data,
            "ASSETTYPE": watchAllFields?.ASSETNAME?.length > 0 ? [watchAllFields?.ASSETTYPE_ID] : data,
            "ASSETNAME": watchAllFields?.ASSETNAME?.length > 0 ? watchAllFields?.ASSETNAME : data

        }

        try {
            const res = await callPostAPI(ENDPOINTS.GET_PPM_SCHEDULE_DASHBOARD, payload)
            if (res?.FLAG === 1) {
                const updatedSchedule: any = res?.PPMSCHEDULEDETAILS?.map((schedule: any) => {
                    return (
                        {
                            ...schedule,
                            start: new Date(schedule?.start),
                            end: new Date(schedule?.end)
                        }
                    )
                })
                setScheduleData(updatedSchedule)
            }
        } catch (error: any) {

        }
    }

    //Get Asset List
    const getOptionFilter = async () => {
        const payload = {
            LOCATION_ID: watchAllFields?.LOCATION_ID !== undefined ? watchAllFields?.LOCATION_ID?.LOCATION_ID : null,
            ASSETGROUP_ID: watchAllFields?.ASSETGROUP_ID !== undefined ? watchAllFields?.ASSETGROUP_ID?.ASSETGROUP_ID : null,
            ASSETTYPE_ID: watchAllFields?.ASSETTYPE_ID !== undefined ? watchAllFields?.ASSETTYPE_ID?.ASSETTYPE_ID : null
        }

        if (payload?.ASSETTYPE_ID !== undefined) {
            const res = await callPostAPI(ENDPOINTS?.GET_ASSETNAME, payload)
            setAssetOption(res?.ASSETLIST)
        }
    }

    useEffect(() => {
        if (watchAllFields?.ASSETGROUP_ID) {
            const dataField: any = options?.assetType?.filter((f: any) => f.ASSETGROUP_ID === watchAllFields?.ASSETGROUP_ID?.ASSETGROUP_ID)
            setType(dataField)
            setValue("ASSETTYPE_ID", "");
            setValue("ASSETNAME", "");
        }
    }, [watchAllFields?.ASSETGROUP_ID])

    useEffect(() => {
        if (watchAllFields?.ASSETTYPE_ID !== "" || watchAllFields?.ASSETTYPE_ID !== null) {
            (async function () {
                await getOptionFilter()
            })()
        }

    }, [watchAllFields?.ASSETTYPE_ID])



    const getFilterPPM = async () => {
        let month: any = moment(new Date()).format("MM");
        let year: any = moment(new Date()).format('YYYY')
        let firstDate = moment(new Date(year, parseInt(month) - 1, 1)).format("MM-DD-YYYY");
        let lastDate = moment(new Date(year, parseInt(month), 1)).format("MM-DD-YYYY");
        await getOptions(firstDate, lastDate);
    }

    useEffect(() => {
        if (watchAllFields?.ASSETNAME !== "") {
            (async function () {
                await getFilterPPM()
            })()
        }
    }, [watchAllFields?.ASSETNAME])


    useEffect(() => {
        (async function () {
            let month: any = moment(new Date()).format("MM");
            let year: any = moment(new Date()).format('YYYY')
            let firstDate = moment(new Date(year, parseInt(month) - 1, 1)).format("MM-DD-YYYY");
            let lastDate = moment(new Date(year, parseInt(month), 1)).format("MM-DD-YYYY");
            await getOptions(firstDate, lastDate);
        })()
    }, [])

    const getMasterDetails = async () => {
        const res1 = await callPostAPI(ENDPOINTS.LOCATION_HIERARCHY_LIST, null);
        const res2 = await callPostAPI(
            ENDPOINTS.GETASSETMASTEROPTIONS,
            { ASSETTYPE: "P", },
            props?.functionCode
        );
        if (res1?.FLAG === 1) {
            setlocationtypeOptions(res1?.LOCATIONHIERARCHYLIST);
            setOptions({
                assetGroup: res2?.ASSESTGROUPLIST,
                assetType: res2?.ASSESTTYPELIST,
            })
        }
    }
    const handleViewChange = (view: any) => {
        setCurrentView(view)

    };
    const categories = [
        { name: 'Immediate', key: 'I', color: "#F5BCBC" },
        { name: 'Urgent', key: 'U', color: "#FBEBE9" },
        { name: 'Normal', key: 'N', color: "#FDF6E7" },
        { name: 'Low', key: 'L', color: "#E8F7FD" }
    ];
    const [selectedCategories, setSelectedCategories] = useState([categories[1]]);

    const onCategoryChange = (e: any) => {
        let _selectedCategories = [...selectedCategories];
        if (e.checked)
            _selectedCategories.push(e.value);
        else
            _selectedCategories = _selectedCategories.filter(category => category.key !== e.value.key);
        setSelectedCategories(_selectedCategories);
    };


    const groupedEvents = [
        {
            date: "Thursday, 13 March 2025",
            events: [
                {
                    time: "11:30 AM",
                    duration: "4h 30m",
                    title: "Blowdown Check",
                    description:
                        "Pneumatic Actuated Diaphragm Valve HCL Diluting Tank to HCL Dosing Pump 2 - DN15\nOverhaul Maintenance\nOccurs every week",
                },
            ],
        },
        {
            date: "Thursday, 13 May 2025",
            events: [
                {
                    time: "11:30 AM",
                    duration: "4h 30m",
                    title: "Blowdown Check",
                    description:
                        "Pneumatic Actuated Diaphragm Valve HCL Diluting Tank to HCL Dosing Pump 2 - DN15\nOverhaul Maintenance\nOccurs every week",
                },
                {
                    time: "11:30 AM",
                    duration: "4h 30m",
                    title: "Blowdown Check",
                    description:
                        "Pneumatic Actuated Diaphragm Valve HCL Diluting Tank to HCL Dosing Pump 2 - DN15\nOverhaul Maintenance\nOccurs every week",
                },
            ],
        },
    ];

    const CustomAgendaEvent = (event: any) => {
        return (
            <div className="">
                {groupedEvents.map((group, i) => (
                    <div key={i} className="mb-[20px]">
                        <div className="Text_Primary Header_Text agenda-date-heading">
                            {group.date}
                            {/* {format(group.date, "EEEE, dd MMMM yyyy")} */}
                        </div>
                        {group.events.map((event, j) => (
                            <div key={j} className="flex items-start gap-4 mb-4 relative mx-[24px] my-[10px] pl-2 border-left">
                                {/* <div className="absolute left-0 top-2 w-2 h-2 bg-red-500 rounded-full" /> */}
                                <div className=" w-24">
                                    <div className='Text_Primary Header_Text'>{event.time}</div>
                                    <div className="Text_Secondary Helper_Text ">{event.duration}</div>
                                </div>
                                <div className="flex-1 text-sm">
                                    <div className="Text_Primary Header_Text">{event.title}</div>
                                    <div className="mt-1 Text_Secondary Helper_Text ">
                                        {event.description}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        );
    }


    // const CustomAgendaEvent = (event: any) => {
    //     const start: any = new Date(event.start);
    //     const end: any = new Date(event.end);

    //     const durationMs = end - start;
    //     const hours = Math.floor(durationMs / (1000 * 60 * 60));
    //     const minutes = Math.floor((durationMs / (1000 * 60)) % 60);
    //     const duration = `${hours}h ${minutes}m`;

    //     return (
    //         <div style={{ borderLeft: '3px solid #ff5a5f', paddingLeft: '10px' }}>
    //             <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>{event.title}</div>
    //             <div style={{ fontSize: '0.9rem', color: '#333', marginTop: 4 }}>
    //                 {event.desc}
    //             </div>
    //             <div style={{ fontSize: '0.85rem', color: '#888', marginTop: 6 }}>
    //                 <div>{duration}</div>
    //                 <div>Overhaul Maintenance</div>
    //                 <div>Occurs every week</div>
    //             </div>
    //         </div>
    //         // <>
    //         //     <strong>{event.title}</strong>
    //         //     <div style={{ marginTop: "0.5rem", color: "#555" }}>
    //         //         {event?.description?.split("\n").map((line: any, index: any) => (
    //         //             <div key={index}>{line}</div>
    //         //         ))}
    //         //     </div></>

    //     );
    // };


    const CustomAgendaTime = (event: any) => {
        const time = new Date(event.start).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        });

        return (
            <span style={{ fontWeight: 'bold', color: '#222', fontSize: '0.95rem' }}>
                {time}
            </span>
        );
    };


    const expandAll = () => {
        let _expandedKeys = {};

        for (let node of nodes) {
            expandNode(node, _expandedKeys);
        }

        setExpandedKeys(_expandedKeys);
        setnodecollapse(true)
    };

    const collapseAll = () => {
        setExpandedKeys({});
        setnodecollapse(false)

    };



    const expandNode = (node: any, _expandedKeys: TreeExpandedKeysType) => {
        if (node.children && node.children.length) {
            ;
            _expandedKeys[node.key] = true;

            for (let child of node.children) {
                expandNode(child, _expandedKeys);
            }
        }
    };

    const searchTree = (query: any) => {
        if (!query) {
            setFilteredData(nodes);
        } else {
            const filtered = filterNodes(nodes, query);
            setFilteredData(filtered);
        }
    };

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

    const handleSearchChange = (e: any) => {
        const query = e.target.value;
        setSearchQuery(query);
        searchTree(query);
        expandAll()
    };

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
    const nodeTemplate: any = (node: any, options: any) => {
        let label = <b>{node.label}</b>;
        if (node.url) {
            label = (
                <a
                    href={node.url}
                    className="text-700 hover:text-primary cursor-pointer"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {node.label}
                </a>
            );
        }

        return (
            <div className="flex gap-3 flex-wrap">
                {node.is_asset === 1 ? (<>
                    <div className="imagefolder1">
                    </div>
                </>) : (<>
                    <div className="imagefolder2"></div>
                </>)}
                <div>
                    <label style={{ cursor: "pointer" }}>{node.label}</label>
                </div>
            </div>
        );
    };

    const getEquimentHierarchy = async () => {
        try {
            const payload = {
                ASSET_EQUIPMENT_ID: 0,

            };

            const res = await callPostAPI(ENDPOINTS.GET_HIERARCHY_FOLDER_LIST, payload);
            if (res?.FLAG === 1) {

                setNodes(res?.EQUIPMENTHIERARCHYLIST);
                setFilteredData(res?.EQUIPMENTHIERARCHYLIST)
            } else {
                toast?.error(res?.MSG);
            }

        } catch (error: any) {
            toast?.error(error.message);
        }
    };

    const sidebarcustomHeader: any = (
        <div className=" gap-2">
            <p className="Helper_Text Menu_Active">Scheduled Maintenance /</p>
            <h6 className="sidebarHeaderText mb-2">Resume Approval Request</h6>
        </div>
    );

    useEffect(() => {
        (async function () {
            await getMasterDetails()
        })()
    }, [])

    useEffect(() => {
        if (currentMenu?.FUNCTION_CODE) {
            (async function () {
                await getEquimentHierarchy()

            })();
        }
    }, [currentMenu]);

    // priyanka code end

    return (
        <>


            {!showForm ?
                <section className="w-full">
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Card className="fixedContainer">
                            <div className="flex justify-between" >
                                <div>
                                    <p className="Helper_Text Menu_Active flex mb-1 flex flex-col">
                                        Maintenance /
                                    </p>
                                    <h6 className="Text_Primary Main_Header_Text mb-1">
                                        Scheduled Maintenance
                                    </h6>
                                    <p className="flex flex-col Helper_Text">

                                    </p>
                                </div>
                                <div>
                                    <Buttons
                                        className="Primary_Button me-2"
                                        label={"Add Schedule"}
                                        onClick={() => {
                                            navigate(PATH.ADD_PPMSCHEDULE)
                                            setShowForm(true)
                                        }}
                                    />
                                </div>
                            </div>
                        </Card>
                        <div className="h-24"></div>
                        <Card className='main-component'>
                            <div className="mt-1 grid grid-cols-1  md:grid-cols-6 lg:grid-cols-6">
                                <div className='col-span-2 p-[8px] border-r border-gray-200'>
                                    {/* <div>  <Calendar value={date} onChange={(e) => setDate(e.value)} 
                            inline showWeek /></div> */}
                                    <div className="calendar-component">
                                        <PrimeCalendar
                                            value={startDate}
                                            onChange={(e) => setDate(e.value as Date)}
                                            showIcon
                                            // overlayVisible={visible}
                                            onFocus={() => setVisible(true)}
                                            onBlur={() => setVisible(false)}
                                            className="w-full"
                                            // dateTemplate={weekdayHeaderTemplate}
                                            inline
                                        />
                                    </div>
                                    <div className='px-[20px] py-[12px] flex flex-wrap justify-between'>
                                        <label className="Text_Primary Header_Text ">
                                            Filter By
                                        </label>
                                        <label className="Menu_Active Input_Label ">
                                            <i className="pi pi-check me-2"></i>All Selected
                                        </label>
                                    </div>
                                    <div className="">
                                        <Accordion activeIndex={0}>
                                            <AccordionTab header="Equipment (5152)">
                                                <div>
                                                    <div className="flex align-items-center">
                                                        <Checkbox inputId="ingredient1" name="pizza" value="Cheese" onChange={(e: any) => setChecked(e.checked)} checked={checked} />
                                                        <label htmlFor="ingredient1" className="ml-2">All Select</label>
                                                    </div>
                                                    <hr className='w-full border-gray-200 mt-2'></hr>
                                                    <div className='mt-2'>
                                                        <IconField iconPosition="left">
                                                            {/* <InputIcon className="pi pi-search"> </InputIcon> */}
                                                            <InputText placeholder="Search Equipment" onClick={(e: any) =>
                                                                showEquipmentlist(true)
                                                            } />
                                                        </IconField>
                                                        <Dialog
                                                            visible={visibleEquipmentlist}
                                                            style={{ width: "650px", height: "600px" }}
                                                            className="dialogBoxTreeStyle"
                                                            onHide={() => {
                                                                if (!visibleEquipmentlist) return;
                                                                showEquipmentlist(false);
                                                            }}
                                                        >
                                                            <div className="serviceEquipment">
                                                                <div className=" px-2 py-4   flex w-full gap-3 justify-between">
                                                                    <div className="w-4/5">
                                                                        <IconField iconPosition="left">
                                                                            <InputIcon className="pi pi-search">
                                                                                {" "}
                                                                            </InputIcon>
                                                                            <InputText
                                                                                type="search"
                                                                                placeholder="Search"
                                                                            />
                                                                        </IconField>
                                                                    </div>

                                                                    <div className="w-1/5">
                                                                        <Button
                                                                            type="button"
                                                                            className="Secondary_Button"
                                                                            label={
                                                                                nodecollapse ? "Collapse All" : "Expand All"
                                                                            }
                                                                            onClick={
                                                                                nodecollapse ? collapseAll : expandAll
                                                                            }
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className=" serviceHeirarchy">
                                                                    <Tree
                                                                        value={filteredData}
                                                                        selectionMode="single"
                                                                        selectionKeys={selectedKey}
                                                                        nodeTemplate={nodeTemplate}
                                                                        // onNodeClick={async (e: any) => {
                                                                        //     if (e?.node?.is_asset === 1) {
                                                                        //         setSelectedKey(e.node.key);
                                                                        //         showEquipmentlist(false);
                                                                        //         setSelectedEquipment(
                                                                        //             selectedKey,
                                                                        //             e.node.key,
                                                                        //             e.node
                                                                        //         );
                                                                        //         await getAssetDetailsList(e.node.key);
                                                                        //     } else {
                                                                        //         toast.error(
                                                                        //             "Clicked on a folder node, please select equipment."
                                                                        //         );
                                                                        //     }
                                                                        // }}
                                                                        filterPlaceholder="Search"
                                                                        dragdropScope="demo"
                                                                        onDragDrop={(e: TreeDragDropEvent) =>
                                                                            setNodes(e.value)
                                                                        }
                                                                        expandedKeys={expandedKeys}
                                                                        onToggle={(e: any) => setExpandedKeys(e.value)}
                                                                        className="w-full "
                                                                    />
                                                                    {/* <div className="w-40 mt-5">
                                                                                        <Button
                                                                                          type="button"
                                                                                          className="Secondary_Button"
                                                                                          label={
                                                                                            nodecollapse ? "Collapse All" : "Expand All"
                                                                                          }
                                                                                          onClick={
                                                                                            nodecollapse ? collapseAll : expandAll
                                                                                          }
                                                                                        />
                                                                                      </div> */}
                                                                </div>
                                                            </div>
                                                        </Dialog>
                                                    </div>
                                                </div>
                                            </AccordionTab>
                                            <AccordionTab header="Type of work">
                                            </AccordionTab>
                                            <AccordionTab header="Priority (4)">
                                                <div className="flex align-items-center">
                                                    <Checkbox inputId="ingredient1" name="pizza" value="Cheese" onChange={(e: any) => setChecked(e.checked)} checked={checked} />
                                                    <label htmlFor="ingredient1" className="ml-2">All Select</label>
                                                </div>
                                                <hr className='w-full border-gray-200 mt-2'></hr>
                                                <div className="flex flex-col gap-3 mt-2">
                                                    {categories.map((category) => {
                                                        return (
                                                            <div key={category.key} className="flex gap-3 w-full justify-between">
                                                                <div className="flex align-items-center">
                                                                    <Checkbox inputId={category.key} name="category" value={category} onChange={onCategoryChange} checked={selectedCategories.some((item) => item.key === category.key)} />
                                                                    <label htmlFor={category.key} className="ml-2">
                                                                        {category.name}
                                                                    </label>
                                                                </div>
                                                                <i className='pi pi-circle-fill mt-2' style={{ color: category.color }}></i>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </AccordionTab>

                                        </Accordion>
                                    </div>
                                </div>
                                <div className='col-span-4'>
                                    <div>
                                        <div className="search-bar mt-4 mr-2 ml-2">
                                            <IconField>
                                                {/* <span className='pi pi-search mx-2 ml-6' >
                                            </span> */}
                                                <InputIcon className="pi pi-times"> </InputIcon>
                                                <InputText placeholder="Search keywords" />
                                            </IconField>
                                        </div>
                                        <div className="thin-line"></div>
                                    </div>

                                    <div className="mt-3" style={{ height: "530pt" }}>
                                        <DnDCalendar
                                            events={scheduleData}
                                            localizer={localizer}
                                            allDayMaxRows={7}
                                            popup={true}
                                            resizable
                                            selectable
                                            formats={{
                                                timeGutterFormat: timeGutterFormat
                                            }}
                                            components={{
                                                toolbar: CustomToolbar,
                                                timeGutterHeader: CustomTimeGutterHeader,
                                                timeSlotWrapper: CustomTimeSlotWrapper,
                                                agenda: {
                                                    event: CustomAgendaEvent,
                                                    // time: CustomAgendaTime,
                                                }, // Works across views including agenda
                                            }}
                                            views={['month', 'week', 'day', 'agenda']}
                                            onNavigate={async (date: any) => {
                                                await statusOfMonth(date);
                                            }}
                                            onSelectEvent={(event: any) => handleSelectedEvent(event)}
                                            onEventDrop={onEventDrop}
                                        // onEventResize={onEventResize}
                                        />
                                    </div>

                                    <Sidebar visible={visibleSidebar}
                                        onHide={() => setVisibleSidebar(false)}
                                        header={sidebarcustomHeader}
                                        className="w-[600px]"
                                        position="right"
                                    >
                                        <div className='flex flex-col gap-[36px]'>
                                            <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2">
                                                <div className="">
                                                    <label className="Text_Secondary Helper_Text  ">
                                                        Type of Work
                                                    </label>
                                                    <p className="Text_Primary Alert_Title">
                                                        Text123
                                                    </p>
                                                </div>
                                                <div className="">
                                                    <label className="Text_Secondary Helper_Text  ">
                                                        Priority
                                                    </label>
                                                    <p className="Text_Primary Alert_Title">
                                                        Text123
                                                    </p>
                                                </div>
                                                <div className="">
                                                    <label className="Text_Secondary Helper_Text  ">
                                                        Date & Time
                                                    </label>
                                                    <p className="Text_Primary Alert_Title">
                                                        19/03/2025, 10:45AM
                                                    </p>
                                                    <p className="Text_Secondary Alert_Title">
                                                        Occurs every 2 weeks
                                                    </p>
                                                </div>
                                                <div className="">
                                                    <label className="Text_Secondary Helper_Text  ">
                                                        Requestor
                                                    </label>
                                                    <p className="Text_Primary Alert_Title">
                                                        Text1235
                                                    </p>
                                                </div>
                                                <div className="col-span-2">
                                                    <label className="Text_Secondary Helper_Text  ">
                                                        Description
                                                    </label>
                                                    <p className="Text_Primary Alert_Title">
                                                        Text123
                                                    </p>
                                                </div>

                                            </div>
                                            <div className=''>
                                                <label className="Text_Primary Header_Text ">
                                                    Equipment Summary
                                                </label>

                                                <div className="flex flex-col gap-6 equpmentContainer">

                                                    <div>
                                                        <label className="Text_Secondary Helper_Text">
                                                            Equipment Name
                                                        </label>
                                                        <p className="Text_Primary Helper_Text  ">
                                                            Pneumatic Actuated Diaphragm Valve HCL Diluting Tank to HCL Dosing Pump 2 - DN15
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <label className="Text_Secondary Helper_Text">
                                                            Equipment Type
                                                        </label>
                                                        <p className="Text_Primary Helper_Text  ">
                                                            Instrumentation Chain Conveyor  Boiler Ash Handling System
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <label className="Text_Secondary Helper_Text">
                                                            Location
                                                        </label>
                                                        <p className="Text_Primary Helper_Text  ">
                                                            DSWMC WTEP Boiler House Line 1  13.0 m
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <Button
                                                    type="button"
                                                    label="View Schedule"
                                                    className="Secondary_Button mr-2 "
                                                />
                                                <Button
                                                    type="button"
                                                    label="Edit Schedule"
                                                    className="Primary_Button "
                                                />
                                            </div>
                                        </div>
                                    </Sidebar>
                                </div>
                            </div>
                        </Card>
                    </form>
                </section>
                :
                <PPMAddForm
                    setShowForm={setShowForm}
                    getOptions={getOptions}

                />}
        </>


    )
}

export default InfraNewPPMSchedule
