import axios from 'axios';

export const CREATE_ADMIN_REQUEST = 'CREATE_ADMIN_REQUEST';
export const CREATE_ADMIN_SUCCESS = 'CREATE_ADMIN_SUCCESS';
export const CREATE_ADMIN_FAIL = 'CREATE_ADMIN_FAIL';

export const createAdmin = (adminData: { username: string; password: string }) => {
  return async (dispatch: any) => {
    dispatch({ type: CREATE_ADMIN_REQUEST });

    try {


      const endpoint = {
        url: "https://qdf1tp45h1.execute-api.ap-south-1.amazonaws.com/dev/admin/create",
      };
      const apiKey = import.meta.env.VITE_API_KEY;

      const response = await axios.post(
        endpoint.url,
        {
          username: adminData.username,
          password: adminData.password,
        },
        {
          headers: {
            "x-api-key": apiKey,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Admin created:", response.data);

      dispatch({
        type: CREATE_ADMIN_SUCCESS,
        payload: response.data.message,
      });
    } catch (error: any) {
      console.error("Admin creation failed:", error.response?.data || error.message);

      dispatch({
        type: CREATE_ADMIN_FAIL,
        payload: error.response?.data?.message || error.message,
      });
    }
  };
};