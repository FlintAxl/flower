import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Search from './Search';
import { getUser, logout } from '../../Utils/helpers';

// Header.jsx
// Updated: Light mode = purple/white, Dark mode = black background with purple highlights.

const Header = ({ cartItems }) => {
  const [user, setUser] = useState({});
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem('theme');
    return stored ? stored === 'dark' : true;
  });
  const navigate = useNavigate();

  const logoutHandler = () => {
    logout(() => {
      setUser(null);
      navigate('/');
    });
    toast.success('Logged out successfully', { position: 'bottom-right' });
    setIsDropdownOpen(false);
  };

  const toggleDropdown = () => setIsDropdownOpen((prev) => !prev);

  useEffect(() => {
    setUser(getUser());
  }, []);

  useEffect(() => {
    const handleAuthChange = () => setUser(getUser());
    window.addEventListener('authChange', handleAuthChange);
    const interval = setInterval(() => setUser(getUser()), 1000);
    return () => {
      window.removeEventListener('authChange', handleAuthChange);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    const shouldBeDark = stored ? stored === 'dark' : true;
    document.documentElement.classList.toggle('dark', shouldBeDark);
    document.body.classList.toggle('dark', shouldBeDark);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.dropdown-container')) setIsDropdownOpen(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
    document.body.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
    window.dispatchEvent(new Event('themeChange'));
  };

  return (
    <header className="bg-purple-50 dark:bg-black text-purple-800 dark:text-white shadow-md sticky top-0 z-50">
      <nav className="flex flex-wrap items-center justify-between px-6 py-4">

        {/* Logo */}
        <Link to="/" className="flex items-center space-x-3 sm:space-x-4 group">
          <div className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-white dark:bg-black rounded-full overflow-hidden shadow-md hover:shadow-lg transform group-hover:scale-105 transition-all duration-300 border-2 border-purple-300 dark:border-purple-400">
            <img src="/images/Botany & Co.png" alt="Botany & Co Logo" className="w-full h-full object-cover rounded-full" />
          </div>
          <span className="text-2xl sm:text-3xl font-[DancingScript] text-purple-800 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors duration-300">
            Botany & Co
          </span>
        </Link>

        {/* Right Section */}
        <div className="flex items-center space-x-5 text-purple-800 dark:text-white">
          <button
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-full border border-purple-300 dark:border-purple-700 bg-white dark:bg-black text-purple-800 dark:text-white hover:bg-purple-100 dark:hover:bg-purple-800/60 transition"
          >
            <span className="text-sm">{isDark ? 'Dark' : 'Light'}</span>
            <span className="text-lg">{isDark ? '🌙' : '☀️'}</span>
          </button>

          {user ? (
            <div className="relative dropdown-container">
              <button
                onClick={toggleDropdown}
                className="flex items-center space-x-2 bg-white/90 dark:bg-purple-800/80 text-purple-800 dark:text-white px-3 py-2 rounded-full hover:opacity-95 transition-all duration-200 border border-purple-200 dark:border-purple-700"
              >
                <img src={user.avatar && user.avatar.url} alt={user && user.name} className="w-8 h-8 rounded-full border-2 border-white dark:border-black/50" />
                <span className="font-medium text-purple-800 dark:text-white">{user && user.name}</span>
                <svg className={`w-4 h-4 text-purple-800 dark:text-white transform transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-black text-purple-800 dark:text-white rounded-xl shadow-lg transition-all duration-200 border border-purple-200 dark:border-purple-700/40">
                  {user && user.role === 'admin' && (
                    <Link to="dashboard" className="block px-4 py-2 hover:bg-purple-50 dark:hover:bg-purple-800/60 rounded-t-xl" onClick={() => setIsDropdownOpen(false)}>
                      Dashboard
                    </Link>
                  )}
                  <Link to="/orders/me" className="block px-4 py-2 hover:bg-purple-50 dark:hover:bg-purple-800/60" onClick={() => setIsDropdownOpen(false)}>
                    Orders
                  </Link>
                  <Link to="/me" className="block px-4 py-2 hover:bg-purple-50 dark:hover:bg-purple-800/60" onClick={() => setIsDropdownOpen(false)}>
                    Profile
                  </Link>
                  <button onClick={logoutHandler} className="w-full text-left text-red-500 px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/40 rounded-b-xl">
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="bg-white dark:bg-purple-800 text-purple-800 dark:text-white px-4 py-2 rounded-full hover:bg-purple-50 dark:hover:bg-purple-700 transition-all duration-200 border border-purple-200 dark:border-purple-700">
              Login
            </Link>
          )}

          <Link to="/cart" className="flex items-center space-x-2 bg-white dark:bg-black px-3 py-2 rounded-full shadow-sm hover:shadow-md transition-all duration-200 border border-purple-200 dark:border-purple-700/40">
            <span className="font-medium text-purple-800 dark:text-white">Cart</span>
            <span className="bg-purple-300 dark:bg-purple-600 text-purple-900 dark:text-white font-semibold rounded-full px-2 py-0.5 text-sm">
              {cartItems ? cartItems.length : 0}
            </span>
          </Link>
        </div>
      </nav>

      <div className="block md:hidden px-4 pb-3">
        <Search />
      </div>
    </header>
  );
};

export default Header;
