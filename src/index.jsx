import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import FHIR from 'fhirclient';

const root = createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

FHIR.oauth2.authorize({
  clientId: 'whatever',
  scope: 'launch/patient patient/*.write patient/*.read',
  redirectUri: window.location.origin + '/oauth-callback',
  iss: 'https://launch.smarthealthit.org/v/r4/fhir',
  fhirServiceUrl: 'https://launch.smarthealthit.org/v/r4/fhir'
});