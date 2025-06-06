import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Calendar, 
  TrendingUp, 
  Eye, 
  AlertCircle,
  Loader,
  Globe,
  Smartphone,
  Monitor,
  Clock,
  ExternalLink,
  Users
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const Analytics = ({ user }) => {
  const [analytics, setAnalytics] = useState(null);
  const [urls, setUrls] = useState([]);
  const [selectedUrl, setSelectedUrl] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [timeRange, setTimeRange] = useState("7d");

  const API_BASE_URL = "https://linkify-0cce.onrender.com";
  //const API_BASE_URL = "http://localhost:5000";

  // Colors for charts
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

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
      const response = await fetch(`${API_BASE_URL}/${selectedUrl}/analytics?timeRange=${timeRange}`, {
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
  }, [selectedUrl, timeRange]);

  const selectedUrlData = urls.find(url => url.shortCode === selectedUrl);

  const StatCard = ({ title, value, icon: Icon, color = "blue" }) => (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
        <div className={`p-3 bg-${color}-500/20 rounded-lg`}>
          <Icon className={`h-6 w-6 text-${color}-400`} />
        </div>
      </div>
    </div>
  );

  const ChartCard = ({ title, children, icon: Icon }) => (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center gap-2 mb-4">
        {Icon && <Icon className="h-5 w-5 text-blue-400" />}
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>
      {children}
    </div>
  );

  return (
    <div className="space-y-6 p-6 bg-gray-900 min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
        <p className="text-gray-400">Track the performance of your shortened links</p>
      </div>

      {/* URL Selector */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select URL to analyze
            </label>
            <select
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedUrl}
              onChange={(e) => setSelectedUrl(e.target.value)}
            >
              <option value="">Choose a URL...</option>
              {urls.map((url) => (
                <option key={url.shortCode} value={url.shortCode}>
                  {url.shortUrl}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Time Range
            </label>
            <select
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              title="Total Clicks" 
              value={analytics.totalClicks || 0} 
              icon={Eye} 
              color="blue" 
            />
            <StatCard 
              title="Filtered Clicks" 
              value={analytics.filteredClicks || 0} 
              icon={TrendingUp} 
              color="green" 
            />
            <StatCard 
              title="Created" 
              value={selectedUrlData ? new Date(selectedUrlData.createdAt).toLocaleDateString() : 'N/A'} 
              icon={Calendar} 
              color="purple" 
            />
            <StatCard 
              title="Unique Visitors" 
              value={analytics.filteredClicks || 0} 
              icon={Users} 
              color="orange" 
            />
          </div>

          {/* URL Details */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <ExternalLink className="h-5 w-5" />
              URL Details
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Short Code</p>
                  <p className="text-white font-mono bg-gray-700 px-2 py-1 rounded">{analytics.shortCode}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Time Range</p>
                  <p className="text-white capitalize">{timeRange === 'all' ? 'All Time' : `Last ${timeRange.replace('d', ' days')}`}</p>
                </div>
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
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid gap-6">
            {/* Daily Clicks Chart */}
            {analytics.dailyClicks && analytics.dailyClicks.length > 0 && (
              <ChartCard title="Click Trends Over Time" icon={TrendingUp}>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics.dailyClicks}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#9CA3AF"
                        fontSize={12}
                      />
                      <YAxis stroke="#9CA3AF" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '6px',
                          color: '#F3F4F6'
                        }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="clicks" 
                        stroke="#3B82F6" 
                        strokeWidth={2}
                        dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Hourly Distribution */}
              {analytics.hourlyClicks && analytics.hourlyClicks.length > 0 && (
                <ChartCard title="Clicks by Hour" icon={Clock}>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.hourlyClicks}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis 
                          dataKey="hour" 
                          stroke="#9CA3AF"
                          fontSize={12}
                        />
                        <YAxis stroke="#9CA3AF" fontSize={12} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1F2937', 
                            border: '1px solid #374151',
                            borderRadius: '6px',
                            color: '#F3F4F6'
                          }} 
                        />
                        <Bar dataKey="clicks" fill="#10B981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </ChartCard>
              )}

              {/* Top Referrers */}
              {analytics.topReferrers && analytics.topReferrers.length > 0 && (
                <ChartCard title="Top Referrers" icon={Globe}>
                  <div className="space-y-3">
                    {analytics.topReferrers.slice(0, 5).map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-gray-300 truncate flex-1">{item.referrer}</span>
                        <div className="flex items-center gap-2">
                          <div 
                            className="h-2 bg-blue-500 rounded"
                            style={{ 
                              width: `${(item.count / analytics.topReferrers[0].count) * 100}px`,
                              minWidth: '20px'
                            }}
                          />
                          <span className="text-white font-medium w-8 text-right">{item.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ChartCard>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Device Types */}
              {analytics.topDevices && analytics.topDevices.length > 0 && (
                <ChartCard title="Device Types" icon={Smartphone}>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analytics.topDevices}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          dataKey="count"
                          nameKey="device"
                        >
                          {analytics.topDevices.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1F2937', 
                            border: '1px solid #374151',
                            borderRadius: '6px',
                            color: '#F3F4F6'
                          }} 
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 space-y-2">
                    {analytics.topDevices.map((item, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-gray-300">{item.device}: {item.count}</span>
                      </div>
                    ))}
                  </div>
                </ChartCard>
              )}

              {/* Top Browsers */}
              {analytics.topBrowsers && analytics.topBrowsers.length > 0 && (
                <ChartCard title="Top Browsers" icon={Monitor}>
                  <div className="space-y-3">
                    {analytics.topBrowsers.slice(0, 5).map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-gray-300">{item.browser}</span>
                        <div className="flex items-center gap-2">
                          <div 
                            className="h-2 bg-green-500 rounded"
                            style={{ 
                              width: `${(item.count / Math.max(...analytics.topBrowsers.map(b => b.count))) * 60}px`,
                              minWidth: '10px'
                            }}
                          />
                          <span className="text-white font-medium w-8 text-right">{item.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ChartCard>
              )}

              {/* Operating Systems */}
              {analytics.topOperatingSystems && analytics.topOperatingSystems.length > 0 && (
                <ChartCard title="Operating Systems" icon={Monitor}>
                  <div className="space-y-3">
                    {analytics.topOperatingSystems.slice(0, 5).map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-gray-300">{item.os}</span>
                        <div className="flex items-center gap-2">
                          <div 
                            className="h-2 bg-purple-500 rounded"
                            style={{ 
                              width: `${(item.count / Math.max(...analytics.topOperatingSystems.map(o => o.count))) * 60}px`,
                              minWidth: '10px'
                            }}
                          />
                          <span className="text-white font-medium w-8 text-right">{item.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ChartCard>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg p-8 text-center border border-gray-700">
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
        <div className="flex items-center space-x-2 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <span className="text-red-400">{error}</span>
        </div>
      )}
    </div>
  );
};

export default Analytics;