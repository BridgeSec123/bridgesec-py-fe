import React, { useEffect } from 'react';

const LoginPage = () => {
  useEffect(() => {
    const handleLogin = async () => {
      try {
        window.location.href = 'http://localhost:8000/okta/login/';
        
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