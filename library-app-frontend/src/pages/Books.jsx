import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

function Books() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [issuedCount, setIssuedCount] = useState(0);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 8;

  useEffect(() => {
    fetchBooks();
    fetchIssuedCount();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, category]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `http://localhost:5000/books?t=${Date.now()}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setBooks(res.data || []);
    } catch {
      toast.error("Failed to load books");
    } finally {
      setLoading(false);
    }
  };

  const fetchIssuedCount = async () => {
    try {
      const res = await axios.get("http://localhost:5000/books/mybooks", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setIssuedCount(res.data.length);
    } catch (err) {
      console.error(err);
    }
  };

  const issueBook = async (id) => {
    if (issuedCount >= 3) {
      toast.error("You can issue a maximum of 3 books.");
      return;
    }
    try {
      await axios.post(
        `http://localhost:5000/books/${id}/issue`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      toast.success("Book issued successfully");
      fetchBooks();
      fetchIssuedCount();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to issue book");
    }
  };

  const returnBook = async (id) => {
    try {
      await axios.post(
        `http://localhost:5000/books/${id}/return`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      toast.success("Book returned successfully");
      fetchBooks();
      fetchIssuedCount();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to return book");
    }
  };

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title?.toLowerCase().includes(search.toLowerCase()) ||
      book.author?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category ? book.category === category : true;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(books.map((b) => b.category).filter(Boolean))];
  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);
  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 min-h-screen">
      <h1 className="text-4xl font-extrabold mb-6 text-gray-800 tracking-tight">
        📚 Browse Books
      </h1>

      {/* Search & Category */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by title or author..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg w-full md:w-1/2 focus:ring-2 focus:ring-blue-400 shadow-md"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg w-full md:w-1/4 focus:ring-2 focus:ring-blue-400 shadow-md"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4 text-gray-700 text-lg font-medium">
        Remaining books you can issue:{" "}
        <span className="font-bold text-blue-600">{3 - issuedCount}</span>
      </div>

      {/* Books Grid */}
      {loading ? (
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-lg animate-pulse h-80"></div>
          ))}
        </div>
      ) : currentBooks.length === 0 ? (
        <p className="text-gray-500">No books found.</p>
      ) : (
        <>
          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {currentBooks.map((book) => {
              const availableCopies = book.totalCopies - (book.issuedCopies || 0);
              const isIssuedByUser = book.issuedByUser || false;
              const dueDate = book.dueDate
                ? new Date(book.dueDate).toLocaleDateString()
                : null;

              return (
                <div
                  key={book._id}
                  className="relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition transform hover:-translate-y-1 overflow-hidden flex flex-col border border-gray-100"
                >
                  {book.cover ? (
                    <img
                      src={`${book.cover}?t=${Date.now()}`}
                      alt={book.title}
                      onError={(e) => (e.target.src = "/default-cover.png")}
                      className="rounded-t-2xl w-full h-56 object-cover transition-transform duration-300 hover:scale-105"
                    />
                  ) : (
                    <img
                      src="/default-cover.png"
                      alt="No cover"
                      className="rounded-t-2xl w-full h-56 object-cover"
                    />
                  )}

                  {isIssuedByUser && dueDate && (
                    <div className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                      Due: {dueDate}
                    </div>
                  )}

                  <div className="p-5 flex flex-col flex-grow">
                    <h2 className="text-lg font-semibold mb-1 text-gray-800 truncate" title={book.title}>
                      {book.title}
                    </h2>
                    <p className="text-sm text-gray-600 mb-2 truncate" title={book.author}>
                      by {book.author}
                    </p>
                    {book.category && (
                      <p className="text-xs font-medium text-blue-600 uppercase mb-3">
                        {book.category}
                      </p>
                    )}
                    <p className="text-sm text-gray-700 mb-2">
                      <span className="font-bold">{availableCopies}</span> copies available
                    </p>

                    {isIssuedByUser && dueDate && (
                      <p className="text-sm text-red-600 font-semibold mb-4">
                        Return by: {dueDate}
                      </p>
                    )}

                    <div className="mt-auto flex space-x-2">
                      {isIssuedByUser ? (
                        <button
                          onClick={() => returnBook(book._id)}
                          className="w-full bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white py-2 rounded-xl font-semibold transition"
                        >
                          Return Book
                        </button>
                      ) : (
                        <button
                          onClick={() => issueBook(book._id)}
                          disabled={issuedCount >= 3 || availableCopies <= 0}
                          className={`w-full py-2 rounded-xl font-semibold text-white transition ${
                            issuedCount >= 3 || availableCopies <= 0
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800"
                          }`}
                        >
                          Issue Book
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8 space-x-3">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-md ${
                  currentPage === 1
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                Prev
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-4 py-2 rounded-md ${
                    currentPage === i + 1
                      ? "bg-blue-800 text-white font-bold"
                      : "bg-blue-200 text-blue-800 hover:bg-blue-300"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-md ${
                  currentPage === totalPages
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Books;
