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
        flex items-center px-4 py-2 rounded-md text-sm font-medium
        ${isActive
          ? 'bg-primary-700 text-white'
          : 'text-secondary-100 hover:bg-primary-600 hover:text-white'
        }
      `}
    >
      <item.icon className="mr-3 flex-shrink-0 h-6 w-6" aria-hidden="true" />
      {item.name}
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
                  <Link to="/dashboard">
                    <img
                      className="h-10 w-auto"
                      src={logo}
                      alt="HealthPulse Analytics"
                    />
                  </Link>
                </div>
                
                {/* Navigation */}
                <nav className="mt-5 px-2 space-y-1">
                  {navigation.map((item) => (
                    <NavItem key={item.name} item={item} />
                  ))}
                  
                  {/* Admin nav section */}
                  {currentUser && currentUser.role === 'admin' && (
                    <div className="pt-4 mt-4 border-t border-primary-700">
                      <h3 className="px-3 text-xs font-semibold text-secondary-300 uppercase tracking-wider">
                        Admin
                      </h3>
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
              <div className="flex-shrink-0 flex border-t border-primary-700 p-4">
                <div className="flex items-center">
                  <div className="bg-primary-900 rounded-full p-1">
                    <UserIcon className="h-6 w-6 text-secondary-100" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <p className="text-base font-medium text-white">{currentUser?.name || 'User'}</p>
                    <p className="text-sm font-medium text-primary-300">{currentUser?.role || ''}</p>
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
          <div className="flex flex-col h-0 flex-1 bg-primary-800">
            {/* Logo */}
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <Link to="/dashboard">
                  <img
                    className="h-10 w-auto"
                    src={logo}
                    alt="HealthPulse Analytics"
                  />
                </Link>
              </div>
              
              {/* Navigation */}
              <nav className="mt-5 flex-1 px-2 space-y-1">
                {navigation.map((item) => (
                  <NavItem key={item.name} item={item} />
                ))}
                
                {/* Admin nav section */}
                {currentUser && currentUser.role === 'admin' && (
                  <div className="pt-4 mt-4 border-t border-primary-700">
                    <h3 className="px-3 text-xs font-semibold text-secondary-300 uppercase tracking-wider">
                      Admin
                    </h3>
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
            <div className="flex-shrink-0 flex border-t border-primary-700 p-4">
              <div className="flex items-center">
                <div className="bg-primary-900 rounded-full p-1">
                  <UserIcon className="h-6 w-6 text-secondary-100" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <p className="text-base font-medium text-white">{currentUser?.name || 'User'}</p>
                  <p className="text-sm font-medium text-primary-300">{currentUser?.role || ''}</p>
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
