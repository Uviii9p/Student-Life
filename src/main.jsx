import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import './styles.css'
import './responsive.css'
import './utilities.css'
import './premium-pages.css'
import './timetable-assignments.css'
import './profile-premium.css'
import './dashboard-premium.css'
import './notes-premium.css'
import { AppProvider } from './context/AppContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AppProvider>
  </React.StrictMode>,
)
