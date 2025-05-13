import React, { Fragment } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Dialog, Transition } from '@headlessui/react';
import {
  HomeIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  BellIcon,
  Cog6ToothIcon,
  UserIcon,
  ClipboardDocumentListIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import logo from '../../assets/logo.svg';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const { currentUser } = useAuth();
  
  // Navigation items
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Patients', href: '/patients', icon: UserGroupIcon },
    { name: 'High Risk Patients', href: '/high-risk', icon: ExclamationTriangleIcon },
    { name: 'Alerts', href: '/alerts', icon: BellIcon },
    { name: 'Settings', href: '/settings', icon: Cog6ToothIcon }
  ];
  
  // Admin-only navigation items
  const adminNavigation = [
    { name: 'Users', href: '/admin/users', icon: UserIcon },
    { name: 'Audit Logs', href: '/admin/audit-logs', icon: ClipboardDocumentListIcon },
  ];
    // Nav item component
  const NavItem = ({ item }) => (
    <NavLink
      to={item.href}
      className={({ isActive }) => `
        flex items-center px-4 py-2.5 rounded-lg text-sm font-medium mb-1
        transition-all duration-150
        ${isActive
          ? 'bg-primary-600 text-white shadow-md translate-x-1'
          : 'text-secondary-100 hover:bg-primary-700/30 hover:text-white hover:translate-x-1'
        }
      `}
    >
      {({ isActive }) => (
        <>
          <div className={`rounded-md p-1.5 mr-3 flex-shrink-0 ${isActive ? 'bg-white/20' : 'bg-primary-700/30'}`}>
            <item.icon className="h-5 w-5" aria-hidden="true" />
          </div>
          <span>{item.name}</span>
          {isActive && (
            <span className="ml-auto w-1 h-5 rounded-full bg-accent-400"></span>
          )}
        </>
      )}
    </NavLink>
  );

  return (
    <>
      {/* Mobile sidebar */}
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog as="div" className="fixed inset-0 flex z-40 lg:hidden" onClose={setSidebarOpen}>
          {/* Overlay */}
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-secondary-600 bg-opacity-75" />
          </Transition.Child>
          
          {/* Sidebar */}
          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-primary-800">
              {/* Close button */}
              <Transition.Child
                as={Fragment}
                enter="ease-in-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in-out duration-300"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="absolute top-0 right-0 -mr-12 pt-2">
                  <button
                    type="button"
                    className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className="sr-only">Close sidebar</span>
                    <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                  </button>
                </div>
              </Transition.Child>
                {/* Sidebar content */}
              <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                {/* Logo */}
                <div className="flex-shrink-0 flex items-center px-4">
                  <Link 
                    to="/dashboard" 
                    className="flex items-center"
                  >
                    <div className="bg-white/10 p-2 rounded-xl shadow-inner">
                      <img
                        className="h-10 w-auto animate-float"
                        src={logo}
                        alt="HealthPulse Analytics"
                      />
                    </div>
                    <span className="ml-2 text-white text-lg font-bold">HealthPulse</span>
                  </Link>
                </div>
                    {/* Navigation */}
              <nav className="mt-8 px-3 space-y-1">
                {navigation.map((item) => (
                  <NavItem key={item.name} item={item} />
                ))}
                
                {/* Admin nav section */}
                {currentUser && currentUser.role === 'admin' && (
                  <div className="pt-6 mt-6 border-t border-primary-700/50">
                    <div className="flex items-center px-3 mb-2">
                      <div className="h-8 w-1 bg-accent-500 rounded-full mr-2"></div>
                      <h3 className="text-xs font-bold text-accent-300 uppercase tracking-wider">
                        Admin Controls
                      </h3>
                    </div>
                    <div className="mt-2 space-y-1">
                      {adminNavigation.map((item) => (
                        <NavItem key={item.name} item={item} />
                      ))}
                    </div>
                  </div>
                )}
              </nav>
              </div>
                  {/* User info */}
            <div className="flex-shrink-0 border-t border-primary-700/50 p-4">
              <div className="flex items-center bg-primary-900/50 rounded-xl p-3 shadow-inner">
                <div className="bg-gradient-to-br from-primary-600 to-accent-600 rounded-full p-1.5 shadow-md">
                  <UserIcon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <p className="text-base font-semibold text-white">{currentUser?.name || 'User'}</p>
                  <div className="flex items-center mt-0.5">
                    <span className="h-2 w-2 bg-success-400 rounded-full animate-pulse-subtle"></span>
                    <p className="text-xs font-medium text-primary-200 ml-1.5">
                      {currentUser?.role === 'admin' ? 'Administrator' : currentUser?.role || 'Online'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            </div>
          </Transition.Child>
        </Dialog>
      </Transition.Root>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 bg-primary-800">            {/* Logo */}
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <Link 
                  to="/dashboard" 
                  className="flex items-center"
                >
                  <div className="bg-white/10 p-2 rounded-xl shadow-inner">
                    <img
                      className="h-10 w-auto animate-float"
                      src={logo}
                      alt="HealthPulse Analytics"
                    />
                  </div>
                  <span className="ml-2 text-white text-lg font-bold">HealthPulse</span>
                </Link>
              </div>
              
              {/* Navigation */}
              <nav className="mt-8 flex-1 px-3 space-y-1">
                {navigation.map((item) => (
                  <NavItem key={item.name} item={item} />
                ))}
                
                {/* Admin nav section */}
                {currentUser && currentUser.role === 'admin' && (
                  <div className="pt-6 mt-6 border-t border-primary-700/50">
                    <div className="flex items-center px-3 mb-2">
                      <div className="h-8 w-1 bg-accent-500 rounded-full mr-2"></div>
                      <h3 className="text-xs font-bold text-accent-300 uppercase tracking-wider">
                        Admin Controls
                      </h3>
                    </div>
                    <div className="mt-2 space-y-1">
                      {adminNavigation.map((item) => (
                        <NavItem key={item.name} item={item} />
                      ))}
                    </div>
                  </div>
                )}
              </nav>
            </div>
              {/* User info */}
            <div className="flex-shrink-0 border-t border-primary-700/50 p-4">
              <div className="flex items-center bg-primary-900/50 rounded-xl p-3 shadow-inner">
                <div className="bg-gradient-to-br from-primary-600 to-accent-600 rounded-full p-1.5 shadow-md">
                  <UserIcon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <p className="text-base font-semibold text-white">{currentUser?.name || 'User'}</p>
                  <div className="flex items-center mt-0.5">
                    <span className="h-2 w-2 bg-success-400 rounded-full animate-pulse-subtle"></span>
                    <p className="text-xs font-medium text-primary-200 ml-1.5">
                      {currentUser?.role === 'admin' ? 'Administrator' : currentUser?.role || 'Online'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
