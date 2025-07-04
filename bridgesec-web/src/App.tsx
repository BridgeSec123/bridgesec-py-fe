import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Theme from '@/components/template/Theme'
import Layout from '@/components/layouts'
import { AuthProvider } from '@/auth'
import Views from '@/views'
import appConfig from './configs/app.config'
import './locales'
import { SecureRoute, Security } from '@okta/okta-react'
import { oktaConfig } from './configs/okta.config'
import { OktaAuth, OktaAuthOptions } from '@okta/okta-auth-js';
import SignIn from './views/auth/SignIn'
import LoginPage from './auth/LoginPage'
import Dashboard from './dashboard/Dashboard'
import LoginCallbackPage from './auth/LoginCallbackPage'
import JsonDiff from './dashboard/JsonDiff'

if (appConfig.enableMock) {
    import('./mock')
}
const oktaAuth = new OktaAuth(oktaConfig);
const restoreOriginalUri = async (_oktaAuth:any, originalUri:any) => {
    window.location.replace(originalUri || '/dashboard');
  };

function App() {
    return (
      <Theme>
        <BrowserRouter>
          <Security oktaAuth={oktaAuth} restoreOriginalUri={restoreOriginalUri}>
            <AuthProvider>
              <Layout>
                  <Views />
              </Layout>
            </AuthProvider>
          </Security>
        </BrowserRouter>
      </Theme>
    );
  }
  
  export default App;