
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage' // defaults to localStorage for web
import { combineReducers } from 'redux';
import scheduleTaskListReducer from './scheduleTaskListStore';
import { configureStore } from '@reduxjs/toolkit';
import filterGroupReducer from "./filterstore";

const persistConfig = {
    key: 'root',
    storage,
}
const rootReducer = combineReducers({
    scheduleTaskList: scheduleTaskListReducer,
    // Add more reducers here if you have other slices
});

const persistedReducer = persistReducer(persistConfig, rootReducer)

// Create and configure the store
const store = configureStore({
    reducer: persistedReducer,
    // other middleware or options, if needed
});

const persistor = persistStore(store);

export { store, persistor };