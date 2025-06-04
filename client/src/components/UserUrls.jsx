import { useState, useEffect } from 'react';
import { 
  Link, 
  Copy, 
  ExternalLink, 
  Calendar, 
  Eye, 
  Clock,
  Trash2,
  RefreshCw,
  AlertCircle,
  Loader
} from 'lucide-react';
import { motion } from 'framer-motion';

// Enhanced UserUrls Component
const UserUrls = ({ user }) => {
  const [urls, setUrls] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  
  const API_BASE_URL = "https://linkify-0cce.onrender.com";

  useEffect(() => {
    fetchUserUrls();
  }, [user]);

  const fetchUserUrls = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/user/urls`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setUrls(data.urls || []);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Failed to fetch URLs.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      setError("Failed to copy to clipboard");
    }
  };

  const deleteUrl = async (shortCode) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${shortCode}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      if (response.ok) {
        setUrls(urls.filter(url => url.shortCode !== shortCode));
      }
    } catch (err) {
      setError("Failed to delete URL");
    }
  };

  const filteredUrls = urls.filter(url =>
    url.longUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
    url.shortCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedUrls = [...filteredUrls].sort((a, b) => {
    if (sortBy === 'clicks') return b.clicks - a.clicks;
    if (sortBy === 'createdAt') return new Date(b.createdAt) - new Date(a.createdAt);
    return 0;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">My URLs</h1>
          <p className="text-gray-400">Manage all your shortened links</p>
        </div>
        <button
          onClick={fetchUserUrls}
          className="btn-secondary flex items-center space-x-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search URLs..."
              className="input-field"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="input-field"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="createdAt">Sort by Date</option>
            <option value="clicks">Sort by Clicks</option>
          </select>
        </div>
      </div>

      {/* URLs List */}
      <div className="space-y-4">
        {error && (
          <div className="flex items-center space-x-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <span className="text-red-400">{error}</span>
          </div>
        )}

        {sortedUrls.length === 0 ? (
          <div className="card p-8 text-center">
            <Link className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No URLs Found</h3>
            <p className="text-gray-400">
              {searchTerm ? 'Try adjusting your search terms' : 'Create your first short link to get started'}
            </p>
          </div>
        ) : (
          sortedUrls.map((url, index) => (
            <motion.div
              key={url.shortCode}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card p-6 hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Link className="h-4 w-4 text-blue-400" />
                    <span className="text-sm text-gray-400">Original URL</span>
                  </div>
                  <p className="text-white truncate">{url.longUrl}</p>
                  
                  <div className="flex items-center space-x-2">
                    <ExternalLink className="h-4 w-4 text-green-400" />
                    <span className="text-sm text-gray-400">Short URL</span>
                  </div>
                  <a
                    href={url.shortUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 underline"
                  >
                    {url.shortUrl}
                  </a>

                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Eye className="h-4 w-4" />
                      <span>{url.clicks || 0} clicks</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(url.createdAt).toLocaleDateString()}</span>
                    </div>
                    {url.expiresAt && (
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>Expires {new Date(url.expiresAt).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => copyToClipboard(url.shortUrl)}
                    className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                    title="Copy link"
                  >
                    <Copy className="h-4 w-4 text-gray-400" />
                  </button>
                  <button
                    onClick={() => window.open(url.shortUrl, '_blank')}
                    className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                    title="Open link"
                  >
                    <ExternalLink className="h-4 w-4 text-gray-400" />
                  </button>
                  <button
                    onClick={() => deleteUrl(url.shortCode)}
                    className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors"
                    title="Delete link"
                  >
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
export default UserUrls