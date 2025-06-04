import React, { useState, useEffect } from 'react';
import { 
  Link, 
  Copy, 
  ExternalLink, 
  BarChart3, 
  Calendar, 
  TrendingUp, 
  Eye, 
  QrCode,
  Clock,
  Globe,
  Trash2,
  RefreshCw,
  Download,
  Share2,
  AlertCircle,
  CheckCircle,
  Loader
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Enhanced Analytics Component
const Analytics = ({ user }) => {
  const [analytics, setAnalytics] = useState(null);
  const [urls, setUrls] = useState([]);
  const [selectedUrl, setSelectedUrl] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [timeRange, setTimeRange] = useState("7d");

  const API_BASE_URL = "https://linkify-0cce.onrender.com";

  useEffect(() => {
    fetchUserUrls();
  }, [user]);

  const fetchUserUrls = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/urls`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setUrls(data.urls || []);
        if (data.urls && data.urls.length > 0) {
          setSelectedUrl(data.urls[0].shortCode);
        }
      }
    } catch (err) {
      setError("Failed to fetch URLs.");
    }
  };

  const fetchAnalytics = async () => {
    if (!selectedUrl) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/${selectedUrl}/analytics`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setAnalytics(data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Failed to fetch analytics.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedUrl) {
      fetchAnalytics();
    }
  }, [selectedUrl]);

  const totalClicks = analytics?.clicks || 0;
  const selectedUrlData = urls.find(url => url.shortCode === selectedUrl);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Analytics Dashboard</h1>
        <p className="text-gray-400">Track the performance of your shortened links</p>
      </div>

      {/* URL Selector */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select URL to analyze
            </label>
            <select
              className="input-field"
              value={selectedUrl}
              onChange={(e) => setSelectedUrl(e.target.value)}
            >
              <option value="">Choose a URL...</option>
              {urls.map((url) => (
                <option key={url.shortCode} value={url.shortCode}>
                  {url.shortUrl} - {url.clicks || 0} clicks
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Time Range
            </label>
            <select
              className="input-field"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="all">All time</option>
            </select>
          </div>
        </div>
      </div>

      {/* Analytics Content */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : selectedUrl && analytics ? (
        <div className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Clicks</p>
                  <p className="text-2xl font-bold text-white">{totalClicks}</p>
                </div>
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <Eye className="h-6 w-6 text-blue-400" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Created</p>
                  <p className="text-lg font-semibold text-white">
                    {selectedUrlData ? new Date(selectedUrlData.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <Calendar className="h-6 w-6 text-green-400" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Status</p>
                  <p className="text-lg font-semibold text-green-400">Active</p>
                </div>
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-purple-400" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* URL Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4">URL Details</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-400">Short Code</p>
                <p className="text-white font-mono">{analytics.shortCode}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Original URL</p>
                <a
                  href={analytics.longUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline break-all"
                >
                  {analytics.longUrl}
                </a>
              </div>
              <div className="flex flex-wrap gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Created: </span>
                  <span className="text-white">
                    {new Date(analytics.createdAt).toLocaleString()}
                  </span>
                </div>
                {analytics.expiresAt && (
                  <div>
                    <span className="text-gray-400">Expires: </span>
                    <span className="text-white">
                      {new Date(analytics.expiresAt).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Click History Placeholder */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Click History</h3>
            <div className="bg-gray-800 rounded-lg p-8 text-center">
              <BarChart3 className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">
                Detailed click analytics will be available soon
              </p>
            </div>
          </motion.div>
        </div>
      ) : (
        <div className="card p-8 text-center">
          <BarChart3 className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No Analytics Available</h3>
          <p className="text-gray-400">
            {urls.length === 0 
              ? 'Create some short links to see analytics'
              : 'Select a URL to view its analytics'
            }
          </p>
        </div>
      )}

      {error && (
        <div className="flex items-center space-x-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <span className="text-red-400">{error}</span>
        </div>
      )}
    </div>
  );
};

// Export all components for use in Dashboard
export default Analytics;