import { createSlice } from '@reduxjs/toolkit';

const scheduleGroupReducer = createSlice({
    name: 'scheduleGroup',
    initialState: [] as any[],
    reducers: {
        // define your reducers here
        setScheduleGroup: (state, action) => {
            state.push(action.payload);
        },
        clearScheduleGroup: (state) => {
            state.length = 0;
        },


    },
});
export const { setScheduleGroup, clearScheduleGroup } = scheduleGroupReducer.actions

export default scheduleGroupReducer.reducer;
