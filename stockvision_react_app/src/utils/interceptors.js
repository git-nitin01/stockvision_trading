import axios from 'axios'
import { store } from '../store/index'

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL + '/stockvision/api'
});

export const setupInterceptor = () => {
  axiosInstance.interceptors.request.use((config)=>{
    const token = store.getState().auth?.token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config;
  }, (error) => {
    return Promise.reject(error);
  })
}

export default axiosInstance
