import { createSlice } from '@reduxjs/toolkit';

const scheduleLocationReducer = createSlice({
    name: 'scheduleLocation',
    initialState: [] as any[],
    reducers: {
        // define your reducers here
        setScheduleLocation: (state, action) => {
            state.push(action.payload);
        },
        clearScheduleLocation: (state) => {
            state.length = 0;
        },


    },
});

export const { setScheduleLocation, clearScheduleLocation } = scheduleLocationReducer.actions



export default scheduleLocationReducer.reducer;
