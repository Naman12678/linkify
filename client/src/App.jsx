import React, { useState } from "react";

function App() {
  const [longUrl, setLongUrl] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState("");

  const handleShorten = async () => {
    setError("");
    setShortUrl("");
    setSuggestions([]);

    if (!longUrl) {
      setError("Please enter a valid URL.");
      return;
    }

    try {
      // Update the endpoint to the deployed backend URL
      const response = await fetch(`https://linkify-1-0ja9.onrender.com/shorten`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ longUrl, customCode }),
      });

      const data = await response.json();

      if (response.ok) {
        setShortUrl(data.shortUrl);
      } else {
        setError(data.error);
        setSuggestions(data.suggestions || []);
      }
    } catch (err) {
      setError("Failed to shorten the URL. Please try again later.");
    }
  };

  return (
    <div className="bg-gradient-to-br from-primary to-secondary min-h-screen flex flex-col items-center justify-center px-4">
      <h1 className="text-4xl font-display text-white mb-8 text-center">
        Welcome to <span className="font-bold">Linkify</span> 🌟
      </h1>
      <p className="text-lg text-white mb-4 text-center">
        Shorten your links and make them memorable.
      </p>

      <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md">
        <input
          type="text"
          placeholder="Enter your long URL"
          className="w-full p-3 border border-gray-300 rounded-md mb-4 focus:outline-primary"
          value={longUrl}
          onChange={(e) => setLongUrl(e.target.value)}
        />
        <input
          type="text"
          placeholder="Enter custom code (optional)"
          className="w-full p-3 border border-gray-300 rounded-md mb-4 focus:outline-primary"
          value={customCode}
          onChange={(e) => setCustomCode(e.target.value)}
        />
        <button
          className="w-full p-3 bg-primary text-white rounded-md font-bold hover:bg-secondary transition-all"
          onClick={handleShorten}
        >
          Shorten URL
        </button>
        {error && <p className="text-red-500 mt-4">{error}</p>}
        {shortUrl && (
          <p className="text-green-500 mt-4">
            Shortened URL:{" "}
            <a href={shortUrl} className="underline" target="_blank" rel="noopener noreferrer">
              {shortUrl}
            </a>
          </p>
        )}
        {suggestions.length > 0 && (
          <div className="mt-4">
            <h3 className="text-lg font-bold">Suggestions:</h3>
            <ul className="list-disc pl-5 text-blue-500">
              {suggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
