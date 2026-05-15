import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { RenewalProvider } from './context/RenewalContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <RenewalProvider>
        <App />
      </RenewalProvider>
    </AuthProvider>
  </React.StrictMode>,
)
