// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import AppRoutes from './routes';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { SidebarProvider } from './contexts/SidebarContext';
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import Footer from './components/common/Footer';
import './assets/scss/main.scss';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <NotificationProvider>
          <SidebarProvider>
            <Router>
              <div className="app-container">
                <Navbar />
                <div className="main-container">
                  <Sidebar />
                  <main className="content">
                    <AppRoutes />
                  </main>
                </div>
                <Footer />
              </div>
            </Router>
          </SidebarProvider>
        </NotificationProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;