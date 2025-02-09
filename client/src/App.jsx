import React, { useState } from "react";

function App() {
  const [longUrl, setLongUrl] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [error, setError] = useState("");
  const [analytics, setAnalytics] = useState(null);

  const API_BASE_URL = "https://linkify-0cce.onrender.com";

  const handleShorten = async () => {
    setError("");
    setShortUrl("");
    setQrCode("");
    setAnalytics(null);

    if (!longUrl) {
      setError("Please enter a valid URL.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ longUrl, customCode, expiresAt }),
      });

      const data = await response.json();

      if (response.ok) {
        setShortUrl(data.shortUrl);
        setQrCode(data.qrCode);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Failed to shorten the URL. Please try again later.");
    }
  };

  const handleAnalytics = async () => {
    if (!shortUrl) {
      setError("No short URL available for analytics.");
      return;
    }

    try {
      const shortCode = shortUrl.split("/").pop(); // Extract short code from URL
      const response = await fetch(`${API_BASE_URL}/${shortCode}/analytics`);

      const data = await response.json();

      if (response.ok) {
        setAnalytics(data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Failed to fetch analytics. Please try again later.");
    }
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center px-4">
      <h1 className="text-4xl font-bold mb-8 text-center">
        Welcome to <span className="text-blue-500">Linkify</span>
      </h1>
      <div className="bg-gray-800 shadow-md rounded-lg p-6 w-full max-w-md">
        <input
          type="text"
          placeholder="Enter your long URL"
          className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md mb-4 text-white focus:ring-2 focus:ring-blue-500"
          value={longUrl}
          onChange={(e) => setLongUrl(e.target.value)}
        />
        <input
          type="text"
          placeholder="Enter custom code (optional)"
          className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md mb-4 text-white focus:ring-2 focus:ring-blue-500"
          value={customCode}
          onChange={(e) => setCustomCode(e.target.value)}
        />
        <input
          type="datetime-local"
          placeholder="Expiration date (optional)"
          className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md mb-4 text-white focus:ring-2 focus:ring-blue-500"
          value={expiresAt}
          onChange={(e) => setExpiresAt(e.target.value)}
        />
        <button
          className="w-full p-3 bg-blue-500 text-white rounded-md font-bold hover:bg-blue-600 transition-all"
          onClick={handleShorten}
        >
          Shorten URL
        </button>

        {error && <p className="text-red-500 mt-4">{error}</p>}
        {shortUrl && (
          <div className="mt-4">
            <p className="text-green-500">
              Shortened URL:{" "}
              <a href={shortUrl} className="underline" target="_blank" rel="noopener noreferrer">
                {shortUrl}
              </a>
            </p>
            {qrCode && (
              <div className="mt-4">
                <h3 className="text-lg font-bold">QR Code:</h3>
                <img src={qrCode} alt="QR Code" className="mt-2" />
              </div>
            )}
          </div>
        )}

        {shortUrl && (
          <button
            className="w-full p-3 bg-gray-700 text-white rounded-md font-bold mt-4 hover:bg-gray-600 transition-all"
            onClick={handleAnalytics}
          >
            View Analytics
          </button>
        )}

        {analytics && (
          <div className="mt-4">
            <h3 className="text-lg font-bold">Analytics:</h3>
            <ul className="list-disc pl-5">
              <li>Short Code: {analytics.shortCode}</li>
              <li>Original URL: {analytics.longUrl}</li>
              <li>Clicks: {analytics.clicks}</li>
              <li>Created At: {new Date(analytics.createdAt).toLocaleString()}</li>
              {analytics.expiresAt && (
                <li>Expires At: {new Date(analytics.expiresAt).toLocaleString()}</li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
