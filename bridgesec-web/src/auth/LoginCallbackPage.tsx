import { User } from '@/@types/auth';
import cookiesStorage from '@/utils/cookiesStorage';
import { jwtDecode } from 'jwt-decode';
import { useEffect, useState } from 'react';
import { authProvider } from './AuthProvider';
import { useSessionUser } from '@/store/authStore';

const LoginCallbackPage = () => {  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  let user = useSessionUser((state) => state.user);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const accessToken = await cookiesStorage.getItem('access_token');
         //const userData = JSON.parse(atob(accessToken.split('.')[1]));         
        // console.log("user :: "+user.email);
        const sessionId = await cookiesStorage.getItem('sessionid');
        

        if (!accessToken) {          
          throw new Error('No access token found in cookies');
        } else {          
          const decodedToken = jwtDecode<User>(accessToken);          
          user.email=decodedToken.email;    
          //console.log("user :: "+user)   ;
          authProvider.handleSignIn({ accessToken: accessToken}, user);
          //localStorage.setItem("sessionUser", JSON.stringify(user));
          cookiesStorage.removeItem('access_token');
          cookiesStorage.removeItem('sessionid');
          cookiesStorage.removeItem('csrftoken');           
          authProvider.redirect()

        }

      } catch (err) {
        console.error('Error processing Okta callback:', err);
        setError('Failed to authenticate. Please try again.');
        setLoading(false);
      }
    };

    handleCallback();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return <div>Processing authentication...</div>;
};

export default LoginCallbackPage;