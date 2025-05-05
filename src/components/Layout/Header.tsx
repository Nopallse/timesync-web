import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import UserProfile from '../Auth/UserProfile';

const Header: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="bg-white shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold text-blue-600">TimeSync</span>
            </Link>
            
            {isAuthenticated && (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  to="/dashboard"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive('/dashboard')
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/create-meeting"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive('/create-meeting')
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  Create Meeting
                </Link>
                <Link
                    to="/meetings"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                        isActive('/meetings')
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                    >
                    Meetings
                </Link>
              </div>
            )}
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
                {isAuthenticated ? (
                    <UserProfile />
                ) : (
                    <Link to="/login" className="text-sm font-medium text-gray-500 hover:text-gray-700">
                    Login
                    </Link>
                )}
            </div>
        </div>
        </nav>
    </header>
    );
}

export default Header;
