import React, { useState } from "react";

const Auth = ({ onAuthSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = "https://linkify-0cce.onrender.com";

  const toggleMode = () => {
    setError("");
    setIsSignUp(!isSignUp);
  };

  const handleAuth = async () => {
    setLoading(true);
    setError("");

    try {
      const endpoint = isSignUp ? "/auth/register" : "/auth/login";
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        onAuthSuccess(data); // Pass user data to parent component
      } else {
        setError(data.error || "Authentication failed.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-gray-800 p-6 rounded-md text-white">
      <h2 className="text-2xl font-bold mb-4">{isSignUp ? "Sign Up" : "Sign In"}</h2>

      <input
        type="email"
        placeholder="Email"
        className="w-full p-3 mb-3 rounded bg-gray-700"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={loading}
      />
      <input
        type="password"
        placeholder="Password"
        className="w-full p-3 mb-3 rounded bg-gray-700"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={loading}
      />

      {error && <p className="text-red-500 mb-3">{error}</p>}

      <button
        onClick={handleAuth}
        disabled={loading}
        className="w-full bg-blue-600 py-3 rounded font-semibold hover:bg-blue-700 transition"
      >
        {loading ? "Please wait..." : isSignUp ? "Sign Up" : "Sign In"}
      </button>

      <p
        className="my-3 text-center cursor-pointer text-blue-400"
        onClick={toggleMode}
      >
        {isSignUp
          ? "Already have an account? Sign In"
          : "Don't have an account? Sign Up"}
      </p>
    </div>
  );
};

export default Auth;
