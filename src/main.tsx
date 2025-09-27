import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './globals.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_relativeSplatPath: true }}>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)