import React, { useEffect } from 'react';
import { useOktaAuth } from '@okta/okta-react';
import { useNavigate } from 'react-router-dom';
import { authProvider } from './AuthProvider';

const LoginCallbackPage = () => {
  const { oktaAuth } = useOktaAuth();
  const navigate = useNavigate();

  // useEffect(() => {
    const handleAuthentication = async () => {
      try {
        //console.log("oktaAuth :: "+oktaAuth)
        
        if (oktaAuth.token.isLoginRedirect()) {
        const tokenResponse = await oktaAuth.token.parseFromUrl(); 
        await oktaAuth.tokenManager.setTokens(tokenResponse.tokens);
        const accessToken = tokenResponse.tokens?.accessToken;        
        const idToken = tokenResponse.tokens.idToken; 
        // Log tokens for debugging (optional)
        console.log("Access Token:", accessToken);
        //console.log("ID Token:", idToken);

        if (tokenResponse.tokens.accessToken) {
          //await new Promise(resolve => setTimeout(resolve, 200));
          console.log(oktaAuth.isAuthenticated());
          let user=null;
          if (oktaAuth.isAuthenticated()) {
            user = await oktaAuth.getUser(); 
            console.log("userInfo :: ", user); 
        }
           //var sessionuser=localStorage.getItem("sessionUser");
           //const user = JSON.parse(sessionuser);
          //const user = await oktaAuth?.getUser();
          // Handle sign-in with your auth provider
          authProvider.handleSignIn(accessToken, user);

          // Store tokens and user information in local storage (or your state management)
           localStorage.setItem("okta-token-storage", JSON.stringify(accessToken));
           localStorage.setItem("sessionUser", JSON.stringify(user));

          authProvider.redirect(); 
        }
      }else{
        console.log("not redirect")
      }
      } catch (err) {
        console.error('Error handling Okta redirect callback', err);
        
      }
    };
    useEffect(() => {
    handleAuthentication();
  }, [oktaAuth]);

  return <div>Loading...</div>;
};

export default LoginCallbackPage;