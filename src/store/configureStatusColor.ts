import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const configureStatusColorReducer = createSlice({
    name: 'configureStausColor',
    initialState: [] as any[],
    reducers: {
        // define your reducers here
        updatedConfigureColor: (state, action: PayloadAction<any[]>) => {
            return action.payload;
          },
        clearConfigureColor: (state) => {
            state.length = 0;
        },


    },
});

export const { updatedConfigureColor, clearConfigureColor } = configureStatusColorReducer.actions



export default configureStatusColorReducer.reducer;
