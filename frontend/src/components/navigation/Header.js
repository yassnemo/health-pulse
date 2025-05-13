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
    <header className="bg-white shadow-card animate-slide-down">
      <div className="px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
        {/* Left side - Mobile menu button & title */}
        <div className="flex items-center">
          <button
            type="button"
            className="lg:hidden p-2 rounded-full text-secondary-500 hover:text-secondary-900 hover:bg-secondary-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
          <h1 className="ml-3 text-xl font-bold bg-gradient-to-r from-primary-700 to-accent-600 bg-clip-text text-transparent">
            HealthPulse Analytics
          </h1>
        </div>
        
        {/* Right side - Notifications and user menu */}
        <div className="flex items-center space-x-3">
          {/* Notifications dropdown */}
          <Menu as="div" className="relative inline-block text-left">
            <div>
              <Menu.Button className="relative p-2 text-secondary-500 rounded-full hover:bg-secondary-100 transition-all duration-150 hover:shadow-inner focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                <span className="sr-only">View notifications</span>
                <BellIcon className="h-6 w-6" aria-hidden="true" />
                {/* Notification badge */}
                <span className="absolute top-0 right-0 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-danger-500 ring-2 ring-white"></span>
                </span>
              </Menu.Button>
            </div>            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-150"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 mt-2 w-80 origin-top-right divide-y divide-secondary-100 rounded-xl bg-white shadow-card ring-1 ring-secondary-200 focus:outline-none z-10 overflow-hidden">
                <div className="px-4 py-3 bg-gradient-to-r from-primary-50 to-accent-50 border-b border-secondary-200">
                  <p className="text-sm font-bold text-secondary-900 flex items-center">
                    <BellIcon className="h-5 w-5 mr-2 text-primary-500" aria-hidden="true" />
                    Recent Alerts
                  </p>
                </div>
                
                {/* Sample notifications */}
                <div className="divide-y divide-secondary-100">
                  <Menu.Item>
                    {({ active }) => (
                      <a href="#" className={`${active ? 'bg-secondary-50' : ''} block px-4 py-3 text-sm transition-colors duration-150`}>
                        <div className="flex">
                          <div className="flex-shrink-0 mr-3">
                            <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-danger-100">
                              <ExclamationTriangleIcon className="h-5 w-5 text-danger-600" aria-hidden="true" />
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-secondary-900">High Risk Alert</p>
                            <p className="text-xs text-secondary-500 mt-1">Patient #12345 showing signs of deterioration</p>
                            <p className="text-xs text-secondary-400 mt-1">5 minutes ago</p>
                          </div>
                        </div>
                      </a>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <a href="#" className={`${active ? 'bg-secondary-50' : ''} block px-4 py-3 text-sm transition-colors duration-150`}>
                        <div className="flex">
                          <div className="flex-shrink-0 mr-3">
                            <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-primary-100">
                              <svg className="h-5 w-5 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-secondary-900">Lab Result Available</p>
                            <p className="text-xs text-secondary-500 mt-1">CBC results ready for Patient #54321</p>
                            <p className="text-xs text-secondary-400 mt-1">25 minutes ago</p>
                          </div>
                        </div>
                      </a>
                    )}
                  </Menu.Item>
                </div>
                
                {/* View all link */}
                <div className="py-2 bg-secondary-50">
                  <Menu.Item>
                    {({ active }) => (
                      <a 
                        href="/alerts" 
                        className={`${active ? 'bg-secondary-100' : ''} block px-4 py-2 text-sm text-center font-medium text-primary-600 hover:text-primary-800 transition-colors`}
                      >
                        View all alerts
                        <svg className="inline-block w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </a>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
            {/* User dropdown */}
          <Menu as="div" className="relative ml-3">
            <div>
              <Menu.Button className="flex items-center max-w-xs text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-150 hover:shadow-md">
                <span className="sr-only">Open user menu</span>
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-600 to-accent-600 shadow-inner flex items-center justify-center text-white font-bold text-lg">
                  {currentUser?.name ? currentUser.name.charAt(0) : <UserIcon className="h-5 w-5" />}
                </div>
              </Menu.Button>
            </div>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-150"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl bg-white overflow-hidden shadow-card ring-1 ring-secondary-200 focus:outline-none z-10">
                <div className="bg-gradient-to-r from-primary-50 to-accent-50 px-4 py-3 border-b border-secondary-200">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-600 to-accent-600 shadow-inner flex items-center justify-center text-white font-bold text-lg mr-3">
                      {currentUser?.name ? currentUser.name.charAt(0) : <UserIcon className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-secondary-900">{currentUser?.name || 'User'}</p>
                      <p className="text-xs text-secondary-600">{currentUser?.email || ''}</p>
                    </div>
                  </div>
                  <div className="mt-2 text-xs bg-primary-100 text-primary-800 rounded-md px-2 py-1">
                    <span className="font-medium">{currentUser?.role || 'User'}</span> account
                  </div>
                </div>
                
                <Menu.Item>
                  {({ active }) => (
                    <a
                      href="/settings"
                      className={`${
                        active ? 'bg-secondary-50' : ''
                      } flex items-center px-4 py-3 text-sm text-secondary-700 hover:text-primary-700 transition-colors`}
                    >
                      <Cog6ToothIcon className="mr-3 h-5 w-5 text-secondary-500" aria-hidden="true" />
                      Settings
                    </a>
                  )}
                </Menu.Item>
                
                <div className="border-t border-secondary-100">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={handleLogout}
                        className={`${
                          active ? 'bg-secondary-50' : ''
                        } flex w-full items-center px-4 py-3 text-sm text-secondary-700 hover:text-danger-700 transition-colors`}
                      >
                        <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 text-secondary-500" aria-hidden="true" />
                        Logout
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
    </header>
  );
};

export default Header;
