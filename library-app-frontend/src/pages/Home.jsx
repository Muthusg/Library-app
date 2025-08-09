import React from "react";

import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <>
      
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">Welcome to My Library</h1>
        <img
          src="/library1.jpg"
          alt="Library"
          className="w-full h-80 object-cover rounded-lg shadow-md mb-6"
        />
        <p className="text-lg text-gray-700 mb-6">
          Explore thousands of books, borrow your favorites, and enjoy reading.
        </p>
        <button
          onClick={() => navigate("/books")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-md transition"
        >
          Browse Books
        </button>
      </div>
    </>
  );
}

export default Home;
