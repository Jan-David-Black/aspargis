import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { Auth0Provider } from "@auth0/auth0-react";
import AuthApolloProvider from './auth/AuthApolloProvider';
import * as serviceWorkerRegistration from './util/serviceWorkerRegistration';
import reportWebVitals from './util/reportWebVitals';
import App from "./App";
import Header from "./components/Header";

import {BrowserRouter as Router} from "react-router-dom";


ReactDOM.render(
  (
    <Auth0Provider
      domain="dev-leodorh9.us.auth0.com"
      clientId="VPe92gUMGhq9WHnHljMB6p0OIN0pf2bA"
      redirectUri={window.location.origin}
      audience="https://aspargis.de"
      scope="read:current_user update:current_user_metadata"
      cacheLocation="localstorage"
      useRefreshTokens={true}
    >
      <Router>
        <Header/>
        <AuthApolloProvider><App/></AuthApolloProvider>
      </Router>
    </Auth0Provider>
  ),
  document.getElementById('root')
);

serviceWorkerRegistration.register();  
reportWebVitals();