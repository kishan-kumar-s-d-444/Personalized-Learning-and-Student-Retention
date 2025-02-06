import axios from 'axios';
import {
    getRequest,
    getSuccess,
    getFailed,
    uploadSuccess,
    uploadFailed,
    deleteSuccess,
    deleteFailed,
} from './actionSlice';

const REACT_APP_BASE_URL = "http://localhost:5000";

export const uploadMaterial = (formData) => async (dispatch) => {
    try {
        dispatch(getRequest());
        const response = await axios.post(`${REACT_APP_BASE_URL}/materials/upload`, formData);
        dispatch(uploadSuccess(response.data));
    } catch (error) {
        dispatch(uploadFailed(error.message));
    }
};

export const getMaterials = (sclassId) => async (dispatch) => {
    try {
        dispatch(getRequest());
        const response = await axios.get(`${REACT_APP_BASE_URL}/materials/${sclassId}`);
        dispatch(getSuccess(response.data));
    } catch (error) {
        dispatch(getFailed(error.message));
    }
};

export const deleteMaterial = (id) => async (dispatch) => {
    try {
        dispatch(getRequest());
        await axios.delete(`${REACT_APP_BASE_URL}/materials/${id}`);
        dispatch(deleteSuccess(id));
    } catch (error) {
        dispatch(deleteFailed(error.message));
    }
};





