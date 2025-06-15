import axios from 'axios';

export const CREATE_ADMIN_REQUEST = 'CREATE_ADMIN_REQUEST';
export const CREATE_ADMIN_SUCCESS = 'CREATE_ADMIN_SUCCESS';
export const CREATE_ADMIN_FAIL = 'CREATE_ADMIN_FAIL';

export const createAdmin = (adminData: { username: string; password: string }) => {
  return async (dispatch: any, getState: any) => {
    try {
      dispatch({ type: CREATE_ADMIN_REQUEST });

      const token = getState().auth?.token || localStorage.getItem('authToken');
      const baseUrl = import.meta.env.VITE_API_27INFINITY_IN; 
      const apiKey = import.meta.env.VITE_API_KEY;

      const response = await axios.post(`${baseUrl}/admin`, adminData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'x-api-key': apiKey,
        },
      });

      dispatch({
        type: CREATE_ADMIN_SUCCESS,
        payload: response.data.message,
      });
    } catch (error: any) {
      dispatch({
        type: CREATE_ADMIN_FAIL,
        payload: error.response?.data?.message || error.message,
      });
    }
  };
};