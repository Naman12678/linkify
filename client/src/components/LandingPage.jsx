import React, { useState } from 'react';
import { Link, Zap, BarChart3, Shield, Globe, ChevronDown, Menu, X, Star, Users, Clock, Smartphone } from 'lucide-react';
import { motion } from 'framer-motion';

const LandingPage = ({ onGetStarted }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const features = [
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Shorten URLs in milliseconds with our optimized infrastructure"
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Track clicks, locations, devices, and more with detailed insights"
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your data is encrypted and protected with enterprise-grade security"
    },
    {
      icon: Globe,
      title: "Global CDN",
      description: "Fast redirects worldwide with our global content delivery network"
    }
  ];

  const stats = [
    { number: "50M+", label: "URLs Shortened" },
    { number: "1B+", label: "Clicks Tracked" },
    { number: "99.9%", label: "Uptime" },
    { number: "180+", label: "Countries" }
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <motion.header 
        className="relative z-50 bg-black/20 backdrop-blur-lg border-b border-white/10"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Link className="h-8 w-8 text-blue-400" />
              <span className="text-2xl font-bold text-white">Linkify</span>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
              <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</a>
              <a href="#about" className="text-gray-300 hover:text-white transition-colors">About</a>
              <button 
                onClick={onGetStarted}
                className="btn-primary"
              >
                Get Started
              </button>
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <motion.div 
              className="md:hidden mt-4 pb-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <nav className="flex flex-col space-y-4">
                <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
                <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</a>
                <a href="#about" className="text-gray-300 hover:text-white transition-colors">About</a>
                <button 
                  onClick={onGetStarted}
                  className="btn-primary w-full"
                >
                  Get Started
                </button>
              </nav>
            </motion.div>
          )}
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <motion.h1 
              className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Shorten URLs with
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> Style</span>
            </motion.h1>
            
            <motion.p 
              className="text-xl lg:text-2xl text-gray-300 mb-10 leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Transform long, messy URLs into clean, trackable links. 
              Get powerful analytics and boost your click-through rates.
            </motion.p>

            <motion.div 
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <button 
                onClick={onGetStarted}
                className="btn-primary text-lg px-8 py-4 animate-pulse-glow"
              >
                Start Shortening Now
              </button>
              <button className="btn-secondary text-lg px-8 py-4">
                Watch Demo
              </button>
            </motion.div>

            {/* URL Demo */}
            <motion.div 
              className="glass-morphism rounded-2xl p-8 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-gray-400">
                  <span className="text-red-400">Before:</span>
                  <span className="text-sm break-all">https://example.com/very-long-url-that-nobody-wants-to-share?utm_source=social&utm_medium=facebook</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-400">After:</span>
                  <span className="text-blue-400 font-semibold">linkify.io/abc123</span>
                  <button className="text-gray-400 hover:text-white transition-colors">
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 floating-animation">
          <div className="w-4 h-4 bg-blue-400 rounded-full opacity-60"></div>
        </div>
        <div className="absolute top-40 right-20 floating-animation" style={{ animationDelay: '2s' }}>
          <div className="w-6 h-6 bg-purple-400 rounded-full opacity-40"></div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-black/20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div 
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="text-3xl lg:text-4xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-6">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Everything you need to manage, track, and optimize your shortened URLs
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                className="card p-6 text-center hover:bg-gray-700/50 transition-all duration-300 group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <feature.icon className="h-12 w-12 text-blue-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600/20 to-purple-600/20">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of users who trust Linkify for their URL shortening needs
            </p>
            <button 
              onClick={onGetStarted}
              className="btn-primary text-lg px-8 py-4 animate-bounce-gentle"
            >
              Create Your Account
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/40 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Link className="h-6 w-6 text-blue-400" />
              <span className="text-xl font-bold text-white">Linkify</span>
            </div>
            <div className="text-gray-400 text-center md:text-right">
              <p>&copy; 2024 Linkify. All rights reserved.</p>
              <p className="text-sm mt-1">Made with ❤️ for better links</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage