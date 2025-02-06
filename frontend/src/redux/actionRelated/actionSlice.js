import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    materials: [],  // Ensure materials is defined
    loading: false,
    error: null,
};

const materialSlice = createSlice({
    name: 'material',
    initialState,
    reducers: {
        getRequest: (state) => {
            state.loading = true;
        },
        getSuccess: (state, action) => {
            state.materials = action.payload;
            state.loading = false;
        },
        getFailed: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },
        uploadSuccess: (state, action) => {
            state.materials.push(action.payload);
            state.loading = false;
        },
        uploadFailed: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },
        deleteSuccess: (state, action) => {
            state.materials = state.materials.filter((material) => material._id !== action.payload);
            state.loading = false;
        },
        deleteFailed: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },
    },
});

export const {
    getRequest,
    getSuccess,
    getFailed,
    uploadSuccess,
    uploadFailed,
    deleteSuccess,
    deleteFailed,
} = materialSlice.actions;

export const materialReducer = materialSlice.reducer;
