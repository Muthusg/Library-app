import React, { useEffect, useState } from "react";
import API from "../../api";  // adjust if needed
import toast from "react-hot-toast";

export default function IssuedBooks({ refreshTrigger }) {
  const [issuedBooks, setIssuedBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchIssuedBooks = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/admin/issued-books");
      // data expected format: array of users with their issuedBooks populated
      // Flatten into a list of issued book entries for easier display
      const booksList = [];
      data.forEach(user => {
        user.issuedBooks.forEach(book => {
          booksList.push({
            id: book._id,
            title: book.title,
            user: user.username,
            date: book.issuedDate || "N/A",  // adjust if you store issue date
          });
        });
      });
      setIssuedBooks(booksList);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch issued books");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssuedBooks();
  }, [refreshTrigger]);  // refetch when refreshTrigger changes

  if (loading) return <div>Loading issued books...</div>;

  if (issuedBooks.length === 0)
    return <div>No books have been issued.</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Issued Books</h2>
      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="w-full border-collapse">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-3 text-left">Title</th>
              <th className="p-3 text-left">User</th>
              <th className="p-3 text-center">Issued Date</th>
            </tr>
          </thead>
          <tbody>
            {issuedBooks.map((book) => (
              <tr key={book.id} className="border-b">
                <td className="p-3">{book.title}</td>
                <td className="p-3">{book.user}</td>
                <td className="p-3 text-center">{book.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
