import { createSlice } from '@reduxjs/toolkit';

const scheduleTaskListReducer = createSlice({
    name: 'scheduleTaskList',
    initialState: [] as any[],
    reducers: {
        // define your reducers here
        setScheduleTaskList: (state, action) => {
            state.push(action.payload);
        },
        clearScheduleTaskList: (state) => {
            state.length = 0;
        },
        upsertScheduleTask: (state, action) => {
            const { SCHEDULE_ID, ...updatedTask } = action.payload;
            const existingTaskIndex = state.findIndex(task => task.SCHEDULE_ID === SCHEDULE_ID);

            if (existingTaskIndex !== -1) {
                // Update the existing task
                state[existingTaskIndex] = { ...state[existingTaskIndex], ...updatedTask };
            } else {
                // Push the new task if SCHEDULE_ID is not found
                state.push(action.payload);
            }
        },
    },
});

export const { setScheduleTaskList, clearScheduleTaskList, upsertScheduleTask } = scheduleTaskListReducer.actions

export default scheduleTaskListReducer.reducer;