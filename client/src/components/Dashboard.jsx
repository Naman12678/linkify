import React, { useState } from 'react';
import { LogOut, Link, BarChart3, Settings, Plus, Menu, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AppFeatures from './AppFeatures';
import UserUrls from './UserUrls';
import Analytics from './Analytics';

const Dashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('shorten');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const tabs = [
    { id: 'shorten', label: 'Shorten URL', icon: Plus },
    { id: 'urls', label: 'My URLs', icon: Link },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'shorten':
        return <AppFeatures user={user} />;
      case 'urls':
        return <UserUrls user={user} />;
      case 'analytics':
        return <Analytics user={user} />;
      case 'settings':
        return <UserSettings user={user} />;
      default:
        return <AppFeatures user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header */}
      <header className="bg-gray-900/90 backdrop-blur-lg border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Link className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Linkify</h1>
                <p className="text-xs text-gray-400 hidden sm:block">URL Shortener</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-1">
              {tabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? 'text-white' : 'text-gray-400'}`} />
                  <span>{tab.label}</span>
                </motion.button>
              ))}
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {/* Desktop User Menu */}
              <div className="relative hidden md:block">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-all duration-200"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {user.email?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium truncate max-w-32">
                      {user.email?.split('@')[0] || 'User'}
                    </p>
                    <p className="text-xs text-gray-400">Free Plan</p>
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </button>

                {/* User Dropdown */}
                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-700 py-2"
                    >
                      <div className="px-4 py-2 border-b border-gray-700">
                        <p className="text-sm text-white font-medium truncate">
                          {user.email || 'User'}
                        </p>
                        <p className="text-xs text-gray-400">Free Plan</p>
                      </div>
                      <button
                        onClick={onLogout}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden text-gray-400 hover:text-white p-2"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-gray-800/95 backdrop-blur-lg border-t border-gray-700"
            >
              <div className="px-4 py-4 space-y-2">
                {tabs.map((tab) => (
                  <motion.button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <tab.icon className={`h-5 w-5 ${activeTab === tab.id ? 'text-white' : 'text-gray-400'}`} />
                    <span className="font-medium">{tab.label}</span>
                  </motion.button>
                ))}
                
                {/* Mobile User Info */}
                <div className="border-t border-gray-700 pt-4 mt-4">
                  <div className="flex items-center space-x-3 px-4 py-2">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {user.email?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-medium truncate">
                        {user.email || 'User'}
                      </p>
                      <p className="text-gray-400 text-sm">Free Plan</p>
                    </div>
                  </div>
                  <button
                    onClick={onLogout}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-all duration-200 mt-2"
                  >
                    <LogOut className="h-5 w-5" />
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white">
            {tabs.find(tab => tab.id === activeTab)?.label || 'Dashboard'}
          </h2>
          <p className="text-gray-400 mt-1">
            Welcome back, {user.email?.split('@')[0] || 'User'}
          </p>
        </div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderContent()}
        </motion.div>
      </main>
    </div>
  );
};

// Settings Component
const UserSettings = ({ user }) => {
  const [profile, setProfile] = useState({
    email: user.email || '',
    name: user.name || '',
    notifications: true,
    analytics: true
  });

  const handleSave = () => {
    alert('Settings saved successfully!');
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="bg-gray-800/50 backdrop-blur-lg rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-semibold text-white mb-4">Profile Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile(prev => ({...prev, email: e.target.value}))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Display Name
            </label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile(prev => ({...prev, name: e.target.value}))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your name"
            />
          </div>
        </div>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-lg rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-semibold text-white mb-4">Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Email Notifications</p>
              <p className="text-gray-400 text-sm">Receive updates about your links</p>
            </div>
            <button
              onClick={() => setProfile(prev => ({...prev, notifications: !prev.notifications}))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                profile.notifications ? 'bg-blue-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  profile.notifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Analytics Tracking</p>
              <p className="text-gray-400 text-sm">Enable detailed link analytics</p>
            </div>
            <button
              onClick={() => setProfile(prev => ({...prev, analytics: !prev.analytics}))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                profile.analytics ? 'bg-blue-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  profile.analytics ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <button 
        onClick={handleSave} 
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
      >
        Save Changes
      </button>
    </div>
  );
};

export default Dashboard;