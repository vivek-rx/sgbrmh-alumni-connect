import React from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { Navbar } from './components/Navbar'
import { Footer } from './components/Footer'
import Home from './pages/Home'
import AlumniDirectory from './pages/AlumniDirectory'
import Jobs from './pages/Jobs'
import Events from './pages/Events'
import Profile from './pages/Profile'
import ProfileView from './pages/ProfileView'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Callback from './pages/auth/Callback'
import Admin from './pages/Admin'
import AdminDashboard from './pages/AdminDashboard'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  const location = useLocation();
  console.log('🚀 App: Rendering with route:', location.pathname);
  
  // Environment variables check on app startup
  console.log('🔧 App Startup Env Check:', {
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
    hasSupabaseKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
    supabaseKeyLength: import.meta.env.VITE_SUPABASE_ANON_KEY?.length || 0,
    supabaseKeyPreview: import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 30) + '...',
    mode: import.meta.env.MODE,
    dev: import.meta.env.DEV,
    prod: import.meta.env.PROD,
    allEnvKeys: Object.keys(import.meta.env).filter(key => key.startsWith('VITE_'))
  });
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/alumni" element={<AlumniDirectory />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/events" element={<Events />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
          <Route path="/auth/callback" element={<Callback />} />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile/:id" 
            element={
              <ProtectedRoute>
                <ProfileView />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute adminOnly>
                <Admin />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/dashboard" 
            element={<AdminDashboard />} 
          />
        </Routes>
      </main>
      <Footer />
      <Toaster position="top-right" />
    </div>
  )
}

export default App