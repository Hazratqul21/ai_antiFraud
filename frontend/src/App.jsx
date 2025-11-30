import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import Register from './components/Register';
import MainApp from './components/MainApp';
import CompetitionSubmission from './components/CompetitionSubmission';
import DemoDashboard from './components/DemoDashboard';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes - Competition Submission is now the landing page */}
          <Route path="/" element={<CompetitionSubmission />} />
          <Route path="/demo" element={<DemoDashboard />} />
          
          {/* Auth routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes - Full app with backend */}
          <Route
            path="/app/*"
            element={
              <ProtectedRoute>
                <MainApp />
              </ProtectedRoute>
            }
          />

          {/* Redirect old routes */}
          <Route path="/about" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
