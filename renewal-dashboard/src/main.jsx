import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { RenewalProvider } from './context/RenewalContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <RenewalProvider>
          <App />
        </RenewalProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
