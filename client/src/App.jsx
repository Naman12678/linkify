import React, { useState } from "react";
import Auth from "./Auth";
import AppFeatures from "./AppFeatures";
import UserUrls from "./UserUrls.jsx"; // New component to manage user's old URLs

const App = () => {
  const [user, setUser] = useState(null); // Authentication state
  const [view, setView] = useState("features"); // "features" or "urls"

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  React.useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  if (!user) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center">
      <header className="w-full flex justify-between items-center p-4 bg-gray-800">
        <h1 className="text-2xl font-bold">
          Welcome, <span className="text-blue-400">{user.email}</span>
        </h1>
        <button
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
          onClick={handleLogout}
        >
          Logout
        </button>
      </header>
      <nav className="flex justify-center space-x-4 mt-4">
        <button
          className={`px-4 py-2 rounded ${
            view === "features" ? "bg-blue-500" : "bg-gray-700"
          } hover:bg-blue-600 transition`}
          onClick={() => setView("features")}
        >
          Features
        </button>
        <button
          className={`px-4 py-2 rounded ${
            view === "urls" ? "bg-blue-500" : "bg-gray-700"
          } hover:bg-blue-600 transition`}
          onClick={() => setView("urls")}
        >
          My URLs
        </button>
      </nav>
      <main className="flex-grow w-full max-w-4xl mt-6">
        {view === "features" ? <AppFeatures user={user} /> : <UserUrls user={user} />}
      </main>
    </div>
  );
};

export default App;
