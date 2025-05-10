import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../navigation/Sidebar';
import Header from '../navigation/Header';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <div className="flex h-screen overflow-hidden bg-secondary-50">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      {/* Content area */}
      <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        {/* Header */}
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        
        {/* Main content */}
        <main className="flex-grow p-4 sm:p-6 md:p-8">
          <Outlet />
        </main>
        
        {/* Footer */}
        <footer className="p-4 bg-white border-t border-secondary-200">
          <div className="text-sm text-center text-secondary-500">
            <p>© {new Date().getFullYear()} HealthPulse Analytics. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout;
