import { useState } from 'react';
import { 
  Link, 
  Copy, 
  ExternalLink, 
  Calendar, 
  Globe,
  Download,
  AlertCircle,
  CheckCircle,
  Loader
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';


const AppFeatures = ({ user }) => {
  const [longUrl, setLongUrl] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const API_BASE_URL = "https://linkify-0cce.onrender.com";
  const handleShorten = async () => {
    setError("");
    setSuccess("");
    setShortUrl("");
    setQrCode("");
    setIsLoading(true);

    if (!longUrl) {
      setError("Please enter a valid URL.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/shorten`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ longUrl, customCode, expiresAt }),
      });

      const data = await response.json();

      if (response.ok) {
        setShortUrl(data.shortUrl);
        setQrCode(data.qrCode);
        setSuccess("URL shortened successfully!");
        // Reset form
        setLongUrl("");
        setCustomCode("");
        setExpiresAt("");
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Failed to shorten the URL. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setError("Failed to copy to clipboard");
    }
  };

  const downloadQR = () => {
    const link = document.createElement('a');
    link.href = qrCode;
    link.download = 'qr-code.png';
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Create Short Link</h1>
        <p className="text-gray-400">Transform your long URLs into short, shareable links</p>
      </div>

      {/* URL Shortener Form */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6 space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Long URL *
          </label>
          <div className="relative">
            <Globe className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="url"
              placeholder="https://example.com/very-long-url"
              className="input-field pl-10"
              value={longUrl}
              onChange={(e) => setLongUrl(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Custom Code (Optional)
            </label>
            <input
              type="text"
              placeholder="my-custom-link"
              className="input-field"
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Expiration Date (Optional)
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="datetime-local"
                className="input-field pl-10"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleShorten}
          disabled={isLoading}
          className="btn-primary w-full flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <>
              <Loader className="h-5 w-5 animate-spin" />
              <span>Shortening...</span>
            </>
          ) : (
            <>
              <Link className="h-5 w-5" />
              <span>Shorten URL</span>
            </>
          )}
        </button>

        {/* Error/Success Messages */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center space-x-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
            >
              <AlertCircle className="h-5 w-5 text-red-400" />
              <span className="text-red-400">{error}</span>
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center space-x-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg"
            >
              <CheckCircle className="h-5 w-5 text-green-400" />
              <span className="text-green-400">{success}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Result */}
      <AnimatePresence>
        {shortUrl && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="card p-6 space-y-4"
          >
            <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <span>Your Short Link is Ready!</span>
            </h3>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <a
                  href={shortUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline truncate flex-1"
                >
                  {shortUrl}
                </a>
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={copyToClipboard}
                    className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                    title="Copy to clipboard"
                  >
                    {copied ? (
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    ) : (
                      <Copy className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                  <button
                    onClick={() => window.open(shortUrl, '_blank')}
                    className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                    title="Open link"
                  >
                    <ExternalLink className="h-4 w-4 text-gray-400" />
                  </button>
                </div>
              </div>
            </div>

            {qrCode && (
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="bg-white p-4 rounded-lg">
                  <img src={qrCode} alt="QR Code" className="w-32 h-32" />
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-medium mb-2">QR Code</h4>
                  <p className="text-gray-400 text-sm mb-3">
                    Scan this QR code to access your short link
                  </p>
                  <button
                    onClick={downloadQR}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download QR</span>
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AppFeatures;