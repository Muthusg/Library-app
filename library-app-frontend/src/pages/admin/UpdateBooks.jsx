import React, { useState, useEffect } from "react";
import API from "../../api"; // your axios instance
import toast from "react-hot-toast";

export default function UpdateBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    "Fiction",
    "Classic",
    "Romance",
    "Dystopian",
    "Fantasy",
    "Adventure",
    "Children",
    "Drama",
    "Historical",
    "Non-fiction"
  ];

  const [form, setForm] = useState({
    id: null,
    title: "",
    author: "",
    category: "",
    totalCopies: "",
    description: "",
    coverUrl: "",
    coverFile: null,
  });

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/books");
      setBooks(data);
    } catch (err) {
      toast.error("Failed to fetch books");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "coverFile") {
      setForm((prev) => ({ ...prev, coverFile: files[0] || null }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const uploadImage = async (file) => {
    if (!file) return "";
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await API.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data.url || "";
    } catch (err) {
      toast.error("Image upload failed");
      return "";
    }
  };

  const resetForm = () => {
    setForm({
      id: null,
      title: "",
      author: "",
      category: "",
      totalCopies: "",
      description: "",
      coverUrl: "",
      coverFile: null,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim() || !form.author.trim() || !form.totalCopies) {
      toast.error("Please fill in title, author and total copies");
      return;
    }

    // ✅ Safe trimming
    let cover = "";
    if (typeof form.coverUrl === "string") {
      cover = form.coverUrl.trim();
    }

    if (form.coverFile) {
      const uploadedUrl = await uploadImage(form.coverFile);
      if (!uploadedUrl) return;
      cover = uploadedUrl;
    }

    const bookData = {
      title: form.title.trim(),
      author: form.author.trim(),
      category: form.category || "Fiction",
      totalCopies: Number(form.totalCopies),
      description: form.description.trim(),
      cover: cover,
    };

    try {
      if (form.id) {
        await API.put(`/books/${form.id}`, bookData);
        toast.success("Book updated successfully");
      } else {
        await API.post("/books", bookData);
        toast.success("Book added successfully");
      }
      resetForm();
      fetchBooks();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save book");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this book?")) return;

    try {
      await API.delete(`/books/${id}`);
      toast.success("Book deleted");
      fetchBooks();
    } catch (err) {
      toast.error("Failed to delete book");
    }
  };

  const handleEdit = (book) => {
    setForm({
      id: book._id,
      title: book.title || "",
      author: book.author || "",
      category: book.category || "",
      totalCopies: book.totalCopies || "",
      description: book.description || "",
      coverUrl: book.cover || "",
      coverFile: null,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6">
        {form.id ? "Edit Book" : "Add New Book"}
      </h2>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-lg shadow-md mb-8"
      >
        <input
          type="text"
          name="title"
          placeholder="Title *"
          value={form.title}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />
        <input
          type="text"
          name="author"
          placeholder="Author *"
          value={form.author}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />

        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        >
          <option value="" disabled>
            Select Category
          </option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <input
          type="number"
          name="totalCopies"
          placeholder="Total Copies *"
          min="1"
          value={form.totalCopies}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />

        <input
          type="text"
          name="coverUrl"
          placeholder="Image URL (optional)"
          value={form.coverUrl}
          onChange={handleChange}
          className="border p-2 rounded col-span-2"
        />

        <input
          type="file"
          name="coverFile"
          accept="image/*"
          onChange={handleChange}
          className="border p-2 rounded col-span-2"
        />

        <textarea
          name="description"
          placeholder="Description (optional)"
          value={form.description}
          onChange={handleChange}
          className="border p-2 rounded col-span-4"
          rows="3"
        />

        <div className="col-span-4 text-right">
          {form.id && (
            <button
              type="button"
              onClick={resetForm}
              className="mr-4 bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded"
          >
            {form.id ? "Save Changes" : "Add Book"}
          </button>
        </div>
      </form>

      {loading ? (
        <div>Loading books...</div>
      ) : books.length === 0 ? (
        <div>No books found.</div>
      ) : (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="w-full border-collapse">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-3 text-left">Title</th>
                <th className="p-3 text-left">Author</th>
                <th className="p-3 text-left">Category</th>
                <th className="p-3 text-center">Total Copies</th>
                <th className="p-3 text-center">Issued Copies</th>
                <th className="p-3 text-left">Description</th>
                <th className="p-3 text-left">Cover</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => (
                <tr key={book._id} className="border-b">
                  <td className="p-3">{book.title}</td>
                  <td className="p-3">{book.author}</td>
                  <td className="p-3">{book.category}</td>
                  <td className="p-3 text-center">{book.totalCopies}</td>
                  <td className="p-3 text-center">
                    {book.issuedCopies || 0}
                  </td>
                  <td className="p-3">{book.description || "-"}</td>
                  <td className="p-3">
                    {book.cover ? (
                      <img
                        src={book.cover}
                        alt={book.title}
                        className="w-16 h-20 object-cover rounded"
                      />
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => handleEdit(book)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(book._id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
