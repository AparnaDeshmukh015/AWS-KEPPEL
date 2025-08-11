import { createSlice, PayloadAction  } from '@reduxjs/toolkit';
interface Filter {
    value: any;
    matchMode: string;
}

interface FiltersState {
    ASSIGN_NAME: Filter;
    global: Filter;
    WO_TYPE: Filter;
    SUB_STATUS_DESC: Filter;
    LOCATION_DESCRIPTION: Filter;
    SEVERITY: Filter;
    TEAM_ID: Filter;
    WO_NO: Filter;
    STATUS_DESC: Filter;
    REPORTED_NAME: Filter;
    WO_DATE: Filter;
    WO_START:Filter;
    WO_END:Filter;
}
const initialState: FiltersState = {
     
      ASSIGN_NAME: { value: null, matchMode: 'in' },
      global: { value: null, matchMode: 'contains' },
      WO_TYPE: { value: null, matchMode: 'in' },
      SUB_STATUS_DESC: { value: null, matchMode: 'in' },
      LOCATION_DESCRIPTION: { value: null, matchMode: 'in' },
      SEVERITY: { value: null, matchMode: 'in' },
      TEAM_ID: { value: null, matchMode: 'in' },
      WO_NO: { value: null, matchMode: 'in' },
      STATUS_DESC: { value: null, matchMode: 'in' },
      REPORTED_NAME: { value: null, matchMode: 'in' },
      WO_DATE: { value: null, matchMode: 'in' },
      WO_START:{ value: null, matchMode: 'in' },
      WO_END:{ value: null, matchMode: 'in' },
  };
const filterGroupReducer = createSlice({
    name: 'filterGroup',
    initialState,
    reducers: {
        // define your reducers here
        updateFilter: (state, action: PayloadAction<{ key: string; value: any }>) => {
            const { key, value } = action.payload;
            if (state[key as keyof FiltersState]) {
              state[key as keyof FiltersState].value = value;
            }
          },
          clearFilters: (state) => {
            // // Iterate over each key and reset its value to null
            // Object.keys(initialState).forEach((key) => {
            //   state[key as keyof FiltersState].value = initialState[key as keyof FiltersState].value;
            // });
           Object.assign(state, JSON.parse(JSON.stringify(initialState)));
          },
        // clearFilterGroup: (state) => {
        //     state.length = 0;
        // },


    },
});
export const { updateFilter,clearFilters } = filterGroupReducer.actions

export default filterGroupReducer.reducer;