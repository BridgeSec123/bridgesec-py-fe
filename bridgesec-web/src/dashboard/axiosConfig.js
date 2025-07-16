import axios from 'axios';

const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

const baseURL=import.meta.env.VITE_FIREBASE_API_BASE_URL;
// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: baseURL, 
  timeout: 30000, 
});


axiosInstance.interceptors.request.use((config) => {
  //config.headers['Timezone'] = timezone;
  //config.headers['Content-Type'] = '*'; 
  const oktaTokenStorage = localStorage.getItem('okta-token-storage');
  let token=JSON.parse(oktaTokenStorage);  
  
  if (token.accessToken) {
    config.headers.Authorization = `Bearer ${token.accessToken}`;
    
  }
  return config;
}, (error) => {
  
  return Promise.reject(error);
});

axiosInstance.interceptors.response.use(
  (response) => {
  return response; 
  },
  (error) => { 
   return Promise.reject(error); 
  }

);

export default axiosInstance;
