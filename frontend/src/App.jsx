import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { 
  WelcomePage, 
  LoginPage, 
  SignupPage, 
  PhonePage, 
  OtpPage 
} from './pages/AuthPages';
import { DashboardPage } from './pages/Dashboard';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="app-container">
            <Routes>
              {/* Auth Routes */}
              <Route path="/" element={<WelcomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/phone" element={<PhonePage />} />
              <Route path="/otp" element={<OtpPage />} />
              
              {/* Application Dashboard */}
              <Route path="/dashboard" element={<DashboardPage />} />
              
              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
