import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../navigation/Sidebar';
import Header from '../navigation/Header';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
    return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-secondary-50 to-secondary-100">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      {/* Content area */}
      <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        {/* Header */}
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        
        {/* Main content */}
        <main className="flex-grow p-4 sm:p-6 md:p-8 animate-fade-in">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
        
        {/* Footer */}
        <footer className="p-4 bg-white border-t border-secondary-200 shadow-inner">
          <div className="max-w-7xl mx-auto flex justify-between items-center text-sm text-secondary-500">
            <p>© {new Date().getFullYear()} HealthPulse Analytics. All rights reserved.</p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-primary-600 transition-colors">Privacy</a>
              <a href="#" className="hover:text-primary-600 transition-colors">Terms</a>
              <a href="#" className="hover:text-primary-600 transition-colors">Contact</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout;
