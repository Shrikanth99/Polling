import axios from 'axios';
import {BASE_URL} from './api_Paths'

const axiosInstance = axios.create({
    baseURL : BASE_URL,
    timeout: 100000,
    headers : {
        "Content-Type": "application/json",
        Accept : "application/json",
    },
});

// Request Interceptor
axiosInstance.interceptors.request.use((config) => {
    const accessToken = localStorage.getItem('token')
    if(accessToken){
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
},
    (error) => {
        return Promise.reject(error)
    }
);

// response interceptor

axiosInstance.interceptors.response.use((response) => {
    return response;
},
    (error) => {
        if(error.response){
            if(error.response.status === 401){
                console.error('Unauthorized! redirecting to login...');
                localStorage.removeItem('token'); // Remove invalid token
                window.location.href = '/login';
            }else if( error.response.status === 500){
                console.error('Server error. Please try againi later');
            }
        } else if (error.request) {
            console.error("No response from server. Please check your internet connection.")
        } else if( error.code === 'ECONNABORTED'){
            console.error("Request timeout. Please Try again");
        } else {
            // Other errors
            console.error("Error in setting up request:", error);
        }
        return Promise.reject(error);
    }

);

export default axiosInstance;