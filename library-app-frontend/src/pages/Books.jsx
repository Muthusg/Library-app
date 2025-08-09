import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

function Books() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [issuedCount, setIssuedCount] = useState(0);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 8;

  useEffect(() => {
    fetchBooks();
    fetchIssuedCount();
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, category]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/books", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setBooks(res.data);
    } catch (err) {
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
      console.error("Error fetching issued books count:", err);
    }
  };

  const issueBook = async (id) => {
    if (issuedCount >= 3) {
      toast.error("You can issue a maximum of 3 books. Return a book first.");
      return;
    }
    try {
      await axios.post(
        `http://localhost:5000/books/${id}/issue`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      toast.success("Book issued successfully");
      await fetchBooks();
      await fetchIssuedCount();
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
      await fetchBooks();
      await fetchIssuedCount();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to return book");
    }
  };

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(search.toLowerCase()) ||
      book.author.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category ? book.category === category : true;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(books.map((b) => b.category).filter(Boolean))];

  // Pagination calculations
  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);
  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);

  // Pagination handlers
  const goToNextPage = () => {
    setCurrentPage((page) => Math.min(page + 1, totalPages));
  };

  const goToPrevPage = () => {
    setCurrentPage((page) => Math.max(page - 1, 1));
  };

  const goToPage = (pageNum) => {
    setCurrentPage(pageNum);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Browse Books</h1>

      {/* Search & Category Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by title or author..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md w-full md:w-1/2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md w-full md:w-1/4 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Remaining book count */}
      <div className="mb-4 text-gray-700 text-lg">
        Remaining books you can issue:{" "}
        <span className="font-bold">{3 - issuedCount}</span>
      </div>

      {/* Books Grid */}
      {loading ? (
        <p>Loading books...</p>
      ) : currentBooks.length === 0 ? (
        <p>No books found.</p>
      ) : (
        <>
          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {currentBooks.map((book) => {
              const availableCopies = book.totalCopies - (book.issuedCopies || 0);
              const isIssuedByUser = book.issuedByUser || false; // backend flag
              const dueDate = book.dueDate
                ? new Date(book.dueDate).toLocaleDateString()
                : null;

              return (
                <div
                  key={book._id}
                  className="relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition transform hover:-translate-y-1 cursor-pointer flex flex-col"
                >
                  {/* Cover Image */}
                  {book.cover ? (
                    <img
                      src={book.cover}
                      alt={book.title}
                      className="rounded-t-2xl w-full h-56 object-cover"
                    />
                  ) : (
                    <div className="rounded-t-2xl w-full h-56 bg-gray-200 flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}

                  {/* Ribbon if Issued */}
                  {isIssuedByUser && dueDate && (
                    <div className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg select-none">
                      Due: {dueDate}
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-5 flex flex-col flex-grow">
                    <h2
                      className="text-xl font-semibold mb-1 text-gray-800 truncate"
                      title={book.title}
                    >
                      {book.title}
                    </h2>
                    <p
                      className="text-sm text-gray-600 mb-2 truncate"
                      title={book.author}
                    >
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

                    {/* Due date inside card */}
                    {isIssuedByUser && dueDate && (
                      <p className="text-sm text-red-600 font-semibold mb-4">
                        Return by: {dueDate}
                      </p>
                    )}

                    {/* Buttons */}
                    <div className="mt-auto flex space-x-2">
                      {isIssuedByUser ? (
                        <button
                          onClick={() => returnBook(book._id)}
                          className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-xl font-semibold transition"
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
                              : "bg-blue-600 hover:bg-blue-700"
                          }`}
                          title={
                            issuedCount >= 3
                              ? "Return a book to issue more"
                              : availableCopies <= 0
                              ? "No copies available"
                              : ""
                          }
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

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8 space-x-3">
              <button
                onClick={goToPrevPage}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-md ${
                  currentPage === 1
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                Prev
              </button>

              {/* Page numbers */}
              {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    className={`px-4 py-2 rounded-md ${
                      currentPage === pageNum
                        ? "bg-blue-800 text-white font-bold"
                        : "bg-blue-200 text-blue-800 hover:bg-blue-300"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={goToNextPage}
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
