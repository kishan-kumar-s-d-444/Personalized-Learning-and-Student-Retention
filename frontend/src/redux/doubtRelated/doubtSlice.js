import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const BASE_URL = "http://localhost:5000";

// Async thunks for doubt-related actions
export const createDoubt = createAsyncThunk(
    'doubt/createDoubt',
    async (doubtData, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${BASE_URL}/doubt/add`, doubtData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const fetchDoubts = createAsyncThunk(
    'doubt/fetchDoubts',
    async ({ userId, userType }, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${BASE_URL}/doubt/get`, { 
                params: { userId, userType } 
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const fetchConversation = createAsyncThunk(
    'doubt/fetchConversation',
    async ({ senderId, receiverId }, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${BASE_URL}/doubt/conversation/${senderId}/${receiverId}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

const doubtSlice = createSlice({
    name: 'doubt',
    initialState: {
        doubts: [],
        conversation: [],
        loading: false,
        error: null
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Create Doubt Cases
            .addCase(createDoubt.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createDoubt.fulfilled, (state, action) => {
                state.loading = false;
                state.doubts.push(action.payload);
                state.error = null;
            })
            .addCase(createDoubt.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to create doubt';
            })
            
            // Fetch Doubts Cases
            .addCase(fetchDoubts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDoubts.fulfilled, (state, action) => {
                state.loading = false;
                state.doubts = action.payload;
                state.error = null;
            })
            .addCase(fetchDoubts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch doubts';
            })
            
            // Fetch Conversation Cases
            .addCase(fetchConversation.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchConversation.fulfilled, (state, action) => {
                state.loading = false;
                state.conversation = action.payload;
                state.error = null;
            })
            .addCase(fetchConversation.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch conversation';
            });
    }
});

export default doubtSlice.reducer;
