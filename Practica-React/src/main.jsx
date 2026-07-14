import './index.css';
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google'
  const ClientID = import.meta.env.VITE_GOOGLE_CLIENT_KEY;
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId = {ClientID}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)
