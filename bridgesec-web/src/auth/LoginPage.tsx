import React, { useEffect } from 'react';
import { useOktaAuth } from '@okta/okta-react';

const LoginPage = () => {
  const { oktaAuth } = useOktaAuth();

  const handleLogin = async () => {
    try {
      await oktaAuth.signInWithRedirect({
        originalUri: window.location.href+"/dashboard", // current url
      });
    } catch (err) {
      console.error('Error redirecting to Okta sign-in page', err);
    }
  };

  useEffect(() => {
    handleLogin();
  }, []); 

  return (
    <div>
      <strong>Redirecting to Okta...</strong>
    </div>
  );
};

export default LoginPage;
