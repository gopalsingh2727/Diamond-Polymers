import axios from 'axios';

export const CREATE_ADMIN_REQUEST = 'CREATE_ADMIN_REQUEST';
export const CREATE_ADMIN_SUCCESS = 'CREATE_ADMIN_SUCCESS';
export const CREATE_ADMIN_FAIL = 'CREATE_ADMIN_FAIL';

export const createAdmin = (adminData: { username: string; password: string }) => async (dispatch: any, getState: any) => {
  try {
    dispatch({ type: CREATE_ADMIN_REQUEST });

    // Get token from Redux state or localStorage
    const token = getState().auth?.token || localStorage.getItem("authToken");

    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    };

    const { data } = await axios.post('http://localhost:3000/dev/admin/create', adminData, config);

    dispatch({
      type: CREATE_ADMIN_SUCCESS,
      payload: data.message,
    });
  } catch (error: any) {
    dispatch({
      type: CREATE_ADMIN_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};