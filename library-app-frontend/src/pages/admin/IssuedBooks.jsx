import React, { useEffect, useState } from "react";
import API from "../../api";
import toast from "react-hot-toast";

export default function IssuedBooks({ refreshTrigger }) {
  const [issuedBooks, setIssuedBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchIssuedBooks = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/admin/issue-history");

      const booksList = data.map(item => ({
        id: item._id,
        title: item.book?.title || "Unknown",
        cover: item.book?.cover || "/default-cover.jpg",
        user: item.issuedBy?.username || "Unknown",
        email: item.issuedBy?.email || "N/A",
        issuedDate: item.issuedDate ? new Date(item.issuedDate).toLocaleDateString() : "N/A",
        returnedDate: item.returnedDate ? new Date(item.returnedDate).toLocaleDateString() : "Not returned",
      }));

      setIssuedBooks(booksList);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch issued books");
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = async () => {
    if (!window.confirm("Are you sure you want to clear all issue history?")) return;

    try {
      await API.delete("/admin/issue-history/clear");
      toast.success("Issue history cleared");
      fetchIssuedBooks(); // refresh list
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to clear history");
    }
  };

  useEffect(() => {
    fetchIssuedBooks();
  }, [refreshTrigger]);

  if (loading) return <div>Loading issued books...</div>;
  if (issuedBooks.length === 0) return <div>No books have been issued.</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Issued Books History</h2>
        <button
          onClick={clearHistory}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Clear History
        </button>
      </div>

      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="w-full border-collapse">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-3">Cover</th>
              <th className="p-3">Title</th>
              <th className="p-3">User</th>
              <th className="p-3">Email</th>
              <th className="p-3 text-center">Issued Date</th>
              <th className="p-3 text-center">Returned Date</th>
            </tr>
          </thead>
          <tbody>
            {issuedBooks.map(book => (
              <tr key={book.id} className="border-b">
                <td className="p-3">
                  <img src={book.cover} alt={book.title} className="w-12 h-16 object-cover rounded" />
                </td>
                <td className="p-3">{book.title}</td>
                <td className="p-3">{book.user}</td>
                <td className="p-3">{book.email}</td>
                <td className="p-3 text-center">{book.issuedDate}</td>
                <td className="p-3 text-center">{book.returnedDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
