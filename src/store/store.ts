
import { configureStore } from '@reduxjs/toolkit';
import scheduleTaskListReducer from './scheduleTaskListStore';
import scheduleGroupReducer from "./scheduleGroup";
import scheduleLocationReducer from './schedulelocation';
import filterGroupReducer from "./filterstore";
import configureStatusColorReducer from './configureStatusColor';
import ServicefilterGroupReducer from "./ServiceRequestFilterStore"
const store = configureStore({
    reducer: {
        scheduleTaskList: scheduleTaskListReducer,
        scheduleGroup: scheduleGroupReducer,
        scheduleLocation: scheduleLocationReducer,
        filterGroup:filterGroupReducer,
        statusColorGroup:configureStatusColorReducer,
        serviceGroupFilter:ServicefilterGroupReducer
    },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export default store;
