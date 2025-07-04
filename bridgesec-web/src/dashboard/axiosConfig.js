import axios from 'axios';

// Retrieve the user's timezone using Intl API
const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_FIREBASE_API_BASE_URL, // Set your API's base URL (update as needed)
  timeout: 30000, // Set a timeout for requests (optional)
});

// Add a request interceptor to set the timezone header globally
axiosInstance.interceptors.request.use((config) => {
  config.headers['Timezone'] = timezone;
  //config.headers['Content-Type'] = '*'; // Add the timezone header
  const oktaTokenStorage = localStorage.getItem('okta-token-storage');
  let token=JSON.parse(oktaTokenStorage);
  //console.log("claims :: ", token.claims?.aud);
  if (token?.accessToken) {
    config.headers.Authorization = `Bearer ${token?.accessToken}`;
  } else {
    console.warn('idToken is not found in the okta-token-storage');
  }
  return config;
}, (error) => {
  // Handle request errors
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
