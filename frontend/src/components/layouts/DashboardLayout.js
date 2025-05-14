import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../navigation/Sidebar';
import Header from '../navigation/Header';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
    return (
    <div className="flex h-screen overflow-hidden bg-theme-background"> {/* Updated background */}
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      {/* Content area */}
      <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        {/* Header */}
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        
        {/* Main content */}
        {/* Ensure main content area also has theme-background if not inheriting transparently */}
        <main className="flex-grow p-4 sm:p-6 md:p-8 animate-fade-in bg-theme-background">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
        
        {/* Footer */}
        <footer className="p-4 bg-theme-panel border-t border-theme-border shadow-inner"> {/* Updated footer style */}
          <div className="max-w-7xl mx-auto flex justify-between items-center text-sm text-theme-text-secondary"> {/* Updated footer text color */}
            <p>© {new Date().getFullYear()} HealthPulse Analytics. All rights reserved.</p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-theme-primary-accent transition-colors">Privacy</a> {/* Updated link hover color */}
              <a href="#" className="hover:text-theme-primary-accent transition-colors">Terms</a> {/* Updated link hover color */}
              <a href="#" className="hover:text-theme-primary-accent transition-colors">Contact</a> {/* Updated link hover color */}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout;
