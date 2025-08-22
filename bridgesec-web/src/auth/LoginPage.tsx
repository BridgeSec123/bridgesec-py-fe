import React, { useEffect } from 'react';

const LoginPage = () => {
  useEffect(() => {
    const handleLogin = async () => {
      try {
        const baseURL=import.meta.env.VITE_FIREBASE_API_BASE_URL;
        window.location.href = `${baseURL}/okta/login/`;
        
      } catch (err) {
        console.error('Error redirecting to Okta login', err);
      }
    };

    handleLogin();
  }, []);

  return (
    <div>
      <strong>Redirecting to Okta...</strong>
    </div>
  );
};

export default LoginPage;