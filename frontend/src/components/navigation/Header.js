import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { 
  Bars3Icon, 
  BellIcon, 
  Cog6ToothIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const Header = ({ sidebarOpen, setSidebarOpen }) => {
  const { currentUser, logout } = useAuth();
  
  // Handle logout
  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-theme-panel shadow-card sticky top-0 z-30"> {/* Use theme-panel and ensure it's sticky */}
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 -mb-px">
          {/* Left side - Mobile menu button & title */}
          <div className="flex items-center">
            <button
              type="button"
              className="lg:hidden p-1.5 rounded-md text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-border focus:outline-none focus:ring-2 focus:ring-inset focus:ring-theme-primary-accent transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>
            {/* Desktop Title - Hidden on mobile, shown on larger screens if sidebar is not the primary title carrier */}
            <h1 className="hidden lg:block ml-3 text-xl font-semibold text-theme-text-primary">
              HealthPulse Analytics
            </h1>
          </div>
          
          {/* Right side - Notifications and user menu */}
          <div className="flex items-center space-x-3">
            {/* Notifications dropdown */}
            <Menu as="div" className="relative inline-block text-left">
              <div>
                <Menu.Button className="relative p-1.5 rounded-full text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-primary-accent">
                  <span className="sr-only">View notifications</span>
                  <BellIcon className="h-6 w-6" aria-hidden="true" />
                  <span className="absolute top-0 right-0 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-theme-danger opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-theme-danger ring-1 ring-theme-panel"></span>
                  </span>
                </Menu.Button>
              </div>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 mt-2 w-80 origin-top-right rounded-md bg-theme-panel shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                  <div className="px-4 py-3 border-b border-theme-border">
                    <p className="text-sm font-semibold text-theme-text-primary flex items-center">
                      <BellIcon className="h-5 w-5 mr-2 text-theme-primary-accent" aria-hidden="true" />
                      Recent Alerts
                    </p>
                  </div>
                  <div className="divide-y divide-theme-border max-h-80 overflow-y-auto">
                    {/* Sample notifications - replace with dynamic data */}
                    <Menu.Item>
                      {({ active }) => (
                        <a href="#" className={`${active ? 'bg-theme-border' : ''} block px-4 py-3 text-sm transition-colors`}>
                          <div className="flex">
                            <div className="flex-shrink-0 mr-3">
                              <span className={`inline-flex items-center justify-center h-8 w-8 rounded-full bg-red-100`}>
                                <ExclamationTriangleIcon className={`h-5 w-5 text-theme-danger`} aria-hidden="true" />
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-theme-text-primary">High Risk Alert</p>
                              <p className="text-xs text-theme-text-secondary mt-0.5">Patient #12345 showing signs of deterioration.</p>
                              <p className="text-xs text-gray-400 mt-0.5">5 minutes ago</p>
                            </div>
                          </div>
                        </a>
                      )}
                    </Menu.Item>
                    {/* Add more Menu.Items here */}
                  </div>
                  <div className="px-4 py-2 border-t border-theme-border">
                    <a href="/alerts" className="block text-center text-sm font-medium text-theme-primary-accent hover:text-theme-primary-hover">
                      View All Alerts
                    </a>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>

            {/* Profile dropdown */}
            <Menu as="div" className="relative inline-block text-left">
              <div>
                <Menu.Button className="flex items-center rounded-full bg-theme-panel text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-primary-accent">
                  <span className="sr-only">Open user menu</span>
                  {/* Placeholder for user avatar */}
                  <UserIcon className="h-8 w-8 rounded-full text-theme-text-secondary bg-theme-border p-1" />
                </Menu.Button>
              </div>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-theme-panel shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                  <div className="px-4 py-3 border-b border-theme-border">
                    <p className="text-sm font-semibold text-theme-text-primary">
                      {currentUser?.name || 'User Name'}
                    </p>
                    <p className="text-xs text-theme-text-secondary truncate">
                      {currentUser?.email || 'user@example.com'}
                    </p>
                  </div>
                  <div className="py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <a
                          href="/settings"
                          className={`${active ? 'bg-theme-border' : ''} group flex items-center px-4 py-2 text-sm text-theme-text-primary transition-colors`}
                        >
                          <Cog6ToothIcon className="mr-3 h-5 w-5 text-theme-text-secondary group-hover:text-theme-text-primary" aria-hidden="true" />
                          Settings
                        </a>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={handleLogout}
                          className={`${active ? 'bg-theme-border' : ''} group flex w-full items-center px-4 py-2 text-sm text-theme-text-primary transition-colors`}
                        >
                          <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 text-theme-text-secondary group-hover:text-theme-text-primary" aria-hidden="true" />
                          Sign out
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
