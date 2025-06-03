import React, { useState, useEffect } from "react";

const UserUrls = ({ user }) => {
  const [urls, setUrls] = useState([]);
  const [error, setError] = useState("");
  const API_BASE_URL = "https://linkify-0cce.onrender.com";

  useEffect(() => {
    const fetchUserUrls = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/user/urls`, {
          headers: {
            Authorization: `Bearer ${user.token}`, // Send token for authentication
          },
        });
        const data = await response.json();
        if (response.ok) {
          setUrls(data.urls);
        } else {
          setError(data.error);
        }
      } catch (err) {
        setError("Failed to fetch URLs.");
      }
    };

    fetchUserUrls();
  }, [user]);

  const fetchAnalytics = async (shortCode) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${shortCode}/analytics`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        alert(JSON.stringify(data, null, 2)); // Show analytics in a dialog or modal
      } else {
        alert("Failed to fetch analytics: " + data.error);
      }
    } catch (err) {
      alert("Failed to fetch analytics.");
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Your URLs</h2>
      {error && <p className="text-red-500">{error}</p>}
      <ul className="space-y-4">
        {urls.map((url) => (
          <li key={url.shortCode} className="bg-gray-800 p-4 rounded">
            <p>
              <strong>Original URL:</strong> {url.longUrl}
            </p>
            <p>
              <strong>Short URL:</strong>{" "}
              <a
                href={url.shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 underline"
              >
                {url.shortUrl}
              </a>
            </p>
            <button
              className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
              onClick={() => fetchAnalytics(url.shortCode)}
            >
              View Analytics
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserUrls;
