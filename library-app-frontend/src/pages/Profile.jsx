import React, { useState, useEffect, useRef, useCallback } from "react";
import toast from "react-hot-toast";
import API from "../api";

function Profile() {
  const [user, setUser] = useState({
    username: "",
    email: "",
    profilePic: "",
  });

  const [editData, setEditData] = useState({
    username: "",
    email: "",
    password: "",
    profilePic: null,
  });

  const [mode, setMode] = useState("view");
  const fileInputRef = useRef(null);

  const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

  // Build image URL with cache-busting
  const getImageUrl = (path) => {
    if (!path) return "/images/new-default.jpeg";
    return path.startsWith("http")
      ? path
      : `${API_BASE}${path}?t=${Date.now()}`;
  };

  // Use useCallback to stabilize the fetchProfile function
  const fetchProfile = useCallback(async () => {
    try {
      const res = await API.get("/auth/profile", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      setUser({
        ...res.data,
        profilePic: getImageUrl(res.data.profilePic),
      });

      setEditData({
        username: res.data.username,
        email: res.data.email,
        password: "",
        profilePic: null,
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to load profile");
    }
  }, [API_BASE]); // dependency is API_BASE since getImageUrl uses it

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  // Instant preview on file select
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setEditData({ ...editData, profilePic: file });
      setUser({ ...user, profilePic: URL.createObjectURL(file) });
    }
  };

  // Remove profile picture
  const handleRemovePicture = async () => {
    try {
      await API.delete("/auth/profile/picture", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      setUser({ ...user, profilePic: "/default-avatar.png" });
      setEditData({ ...editData, profilePic: null });

      toast.success("Profile picture removed");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error removing profile picture");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("username", editData.username);
      formData.append("email", editData.email);
      if (editData.password) formData.append("password", editData.password);
      if (editData.profilePic) {
        formData.append("profilePic", editData.profilePic); // matches backend multer field
      }

      const res = await API.put("/auth/profile", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      // Update state with cache-busted image URL
      setUser({
        ...res.data,
        profilePic: res.data.profilePic
          ? getImageUrl(res.data.profilePic)
          : "/default-avatar.png",
      });

      setMode("view");
      setEditData({
        username: res.data.username,
        email: res.data.email,
        password: "",
        profilePic: null,
      });

      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error updating profile");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-500 p-6 flex items-center relative">
          <div className="relative">
            <img
              src={user.profilePic || "/images/new-default.jpeg"}
              alt="Profile"
              className="w-28 h-28 rounded-full border-4 border-white object-cover"
            />
            {mode === "edit" && (
              <>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  ref={fileInputRef}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow hover:bg-gray-100"
                  title="Change Profile Image"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-700"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2v-6a2 2 0 00-2 2H5a2 2 0 00-2 2v6a2 2 0 002 2z"
                    />
                  </svg>
                </button>

                {/* Remove Picture Button */}
                <button
                  type="button"
                  onClick={handleRemovePicture}
                  className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full shadow hover:bg-red-600"
                  title="Remove Profile Image"
                >
                  ✕
                </button>
              </>
            )}
          </div>

          <div className="ml-6 text-white">
            <h1 className="text-2xl font-bold">{user.username}</h1>
            <p className="text-sm opacity-90">{user.email}</p>
          </div>

          {mode === "view" && (
            <button
              onClick={() => setMode("edit")}
              className="ml-auto bg-white text-blue-600 font-semibold px-4 py-2 rounded-lg shadow hover:bg-gray-100"
            >
              Edit Profile
            </button>
          )}
        </div>

        {/* Edit Form */}
        {mode === "edit" && (
          <div className="p-6 border-t border-gray-200">
            <form className="space-y-4" onSubmit={handleUpdate}>
              <div>
                <label className="block font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={editData.username}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={editData.email}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={editData.password}
                  onChange={handleChange}
                  placeholder="Leave blank to keep current password"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div className="flex space-x-4 mt-4">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("view");
                    setEditData({
                      username: user.username,
                      email: user.email,
                      password: "",
                      profilePic: null,
                    });
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
