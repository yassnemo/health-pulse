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
  
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Patients', href: '/patients', icon: UserGroupIcon },
    { name: 'High Risk Patients', href: '/high-risk', icon: ExclamationTriangleIcon },
    { name: 'Alerts', href: '/alerts', icon: BellIcon },
    { name: 'Settings', href: '/settings', icon: Cog6ToothIcon }
  ];
  
  const adminNavigation = [
    { name: 'Users', href: '/admin/users', icon: UserIcon },
    { name: 'Audit Logs', href: '/admin/audit-logs', icon: ClipboardDocumentListIcon },
  ];

  const NavItem = ({ item }) => (
    <NavLink
      to={item.href}
      className={({ isActive }) =>
        `flex items-center px-3 py-2.5 rounded-md text-sm font-medium mb-1 transition-colors duration-150 ease-in-out
        ${isActive
          ? 'bg-theme-primary-accent text-white shadow-sm' // Active state: themed blue background, white text
          : 'text-theme-text-secondary hover:bg-theme-primary-accent/10 hover:text-theme-primary-accent' // Inactive: gray text, light blue hover
        }`
      }
    >
      {({ isActive }) => (
        <>
          <item.icon 
            className={`h-5 w-5 mr-3 flex-shrink-0 ${isActive ? 'text-white' : 'text-theme-text-secondary group-hover:text-theme-primary-accent'}`} 
            aria-hidden="true" 
          />
          <span className={`${isActive ? 'font-semibold' : 'font-medium'}`}>{item.name}</span>
        </>
      )}
    </NavLink>
  );

  const sidebarContent = (
    <div className="flex flex-col flex-1 h-full">
      {/* Logo / Header */}
      <div className="flex items-center justify-center h-16 flex-shrink-0 px-4 border-b border-theme-border">
        <Link to="/dashboard" className="flex items-center group">
          <img
            className="h-11 w-auto" 
            src={logo}
            alt="HealthPulse Analytics"
          />
          {/* The span containing "HealthPulse" text has been removed */}
        </Link>
      </div>
      {/* Navigation */}
      <nav className="mt-5 flex-1 px-2 space-y-1">
        {navigation.map((item) => (
          <NavItem key={item.name} item={item} />
        ))}
        
        {currentUser && currentUser.role === 'admin' && (
          <div className="pt-6 mt-6 border-t border-theme-border">
            <h3 className="px-3 mb-2 text-xs font-semibold text-theme-text-secondary uppercase tracking-wider">
              Admin Controls
            </h3>
            <div className="space-y-1">
              {adminNavigation.map((item) => (
                <NavItem key={item.name} item={item} />
              ))}
            </div>
          </div>
        )}
      </nav>
      {/* User info - Simplified for a cleaner look */}
      <div className="flex-shrink-0 border-t border-theme-border p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            {/* Placeholder for user avatar or icon */}
            <UserIcon className="h-8 w-8 rounded-full text-theme-text-secondary bg-theme-border p-1" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-theme-text-primary">
              {currentUser?.name || 'User'}
            </p>
            <p className="text-xs font-medium text-theme-text-secondary group-hover:text-theme-text-link">
              {currentUser?.role === 'admin' ? 'Administrator' : currentUser?.role || 'View Profile'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile sidebar */}
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog as="div" className="fixed inset-0 flex z-40 lg:hidden" onClose={setSidebarOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-600 bg-opacity-75" /> {/* Standard overlay */}
          </Transition.Child>
          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-theme-panel shadow-xl">
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
                    <XMarkIcon className="h-6 w-6 text-theme-text-primary" aria-hidden="true" />
                  </button>
                </div>
              </Transition.Child>
              {sidebarContent}
            </div>
          </Transition.Child>
          <div className="flex-shrink-0 w-14" aria-hidden="true">
            {/* Dummy element to force sidebar to shrink to fit close icon */}
          </div>
        </Dialog>
      </Transition.Root>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64 border-r border-theme-border bg-theme-panel">
          {sidebarContent}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
