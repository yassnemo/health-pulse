import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { 
  Bars3Icon, 
  BellIcon, 
  Cog6ToothIcon,
  UserIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

const Header = ({ sidebarOpen, setSidebarOpen }) => {
  const { currentUser, logout } = useAuth();
  
  // Handle logout
  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        {/* Left side - Mobile menu button & title */}
        <div className="flex items-center">
          <button
            type="button"
            className="lg:hidden text-secondary-500 hover:text-secondary-900 focus:outline-none"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
          <h1 className="ml-3 text-xl font-semibold text-secondary-900">HealthPulse Analytics</h1>
        </div>
        
        {/* Right side - Notifications and user menu */}
        <div className="flex items-center">
          {/* Notifications dropdown */}
          <Menu as="div" className="relative inline-block text-left">
            <div>
              <Menu.Button className="relative p-2 text-secondary-500 rounded-full hover:bg-secondary-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                <span className="sr-only">View notifications</span>
                <BellIcon className="h-6 w-6" aria-hidden="true" />
                {/* Notification badge */}
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-danger-500 ring-2 ring-white" />
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
              <Menu.Items className="absolute right-0 mt-2 w-80 origin-top-right divide-y divide-secondary-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                <div className="px-4 py-3">
                  <p className="text-sm font-medium text-secondary-900">Recent Alerts</p>
                </div>
                
                {/* Sample notifications */}
                <div className="py-1">
                  <Menu.Item>
                    <a href="#" className="block px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100">
                      <p className="font-medium">High Risk Alert</p>
                      <p className="text-xs text-secondary-500">Patient #12345 showing signs of deterioration</p>
                    </a>
                  </Menu.Item>
                  <Menu.Item>
                    <a href="#" className="block px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100">
                      <p className="font-medium">Lab Result Available</p>
                      <p className="text-xs text-secondary-500">CBC results ready for Patient #54321</p>
                    </a>
                  </Menu.Item>
                </div>
                
                {/* View all link */}
                <div className="py-1">
                  <Menu.Item>
                    <a href="/alerts" className="block px-4 py-2 text-sm text-primary-600 hover:bg-secondary-100">
                      View all alerts
                    </a>
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
          
          {/* User dropdown */}
          <Menu as="div" className="relative ml-3">
            <div>
              <Menu.Button className="flex items-center max-w-xs text-sm bg-white rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                <span className="sr-only">Open user menu</span>
                <div className="h-8 w-8 rounded-full bg-primary-700 flex items-center justify-center text-white">
                  {currentUser?.name ? currentUser.name.charAt(0) : <UserIcon className="h-5 w-5" />}
                </div>
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
              <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                <div className="px-4 py-2 border-b border-secondary-100">
                  <p className="text-sm font-medium text-secondary-900">{currentUser?.name || 'User'}</p>
                  <p className="text-xs text-secondary-500">{currentUser?.email || ''}</p>
                </div>
                
                <Menu.Item>
                  {({ active }) => (
                    <a
                      href="/settings"
                      className={`${
                        active ? 'bg-secondary-100' : ''
                      } flex items-center px-4 py-2 text-sm text-secondary-700`}
                    >
                      <Cog6ToothIcon className="mr-3 h-5 w-5 text-secondary-500" aria-hidden="true" />
                      Settings
                    </a>
                  )}
                </Menu.Item>
                
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={handleLogout}
                      className={`${
                        active ? 'bg-secondary-100' : ''
                      } flex w-full items-center px-4 py-2 text-sm text-secondary-700`}
                    >
                      <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 text-secondary-500" aria-hidden="true" />
                      Logout
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
    </header>
  );
};

export default Header;
