import React, { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import API from "../api";

function Profile() {
  const [user, setUser] = useState({
    username: "",
    email: "",
    profileImage: "",
  });

  const [editData, setEditData] = useState({
    username: "",
    email: "",
    password: "",
    profileImage: null,
  });

  const [mode, setMode] = useState("view");
  const fileInputRef = useRef(null);

  const API_BASE =
    process.env.REACT_APP_API_BASE || "http://localhost:5000"; // Backend base URL

  // Helper to generate a cache-busting image URL
  const getImageUrl = (path) => {
    if (!path) return "/default-avatar.png";
    return `${API_BASE}/${path}?t=${Date.now()}`;
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await API.get("/auth/profile", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      const updatedProfile = {
        ...res.data,
        profileImage: getImageUrl(res.data.profileImage),
      };

      setUser(updatedProfile);
      setEditData({
        username: updatedProfile.username,
        email: updatedProfile.email,
        password: "",
        profileImage: null,
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to load profile");
    }
  };

  const handleChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setEditData({ ...editData, profileImage: e.target.files[0] });
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("username", editData.username);
      formData.append("email", editData.email);
      if (editData.password) formData.append("password", editData.password);
      if (editData.profileImage) {
        formData.append("profileImage", editData.profileImage);
      }

      const res = await API.put("/auth/profile", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      const updatedUser = {
        ...res.data,
        profileImage: getImageUrl(res.data.profileImage),
      };

      setUser(updatedUser);
      setMode("view");
      setEditData({
        username: updatedUser.username,
        email: updatedUser.email,
        password: "",
        profileImage: null,
      });

      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Error updating profile");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">My Profile</h1>

        {mode === "view" && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center space-x-6 mb-6 relative">
              <img
                src={user.profileImage}
                alt="Profile"
                className="w-24 h-24 rounded-full border border-gray-300 object-cover"
              />
              <button
                onClick={() => setMode("edit")}
                className="ml-auto bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Edit Profile
              </button>
            </div>
            <div>
              <h2 className="text-xl font-semibold">{user.username}</h2>
              <p className="text-gray-600">{user.email}</p>
            </div>
          </div>
        )}

        {mode === "edit" && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="flex items-center space-x-6 mb-6 relative">
                <img
                  src={
                    editData.profileImage
                      ? URL.createObjectURL(editData.profileImage)
                      : user.profileImage
                  }
                  alt="Profile"
                  className="w-24 h-24 rounded-full border border-gray-300 object-cover"
                />
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
                  className="absolute left-16 top-16 bg-gray-200 rounded-full p-2 hover:bg-gray-300"
                  aria-label="Upload profile image"
                  title="Change Profile Image"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-gray-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2z"
                    />
                  </svg>
                </button>
              </div>

              <div>
                <label className="block font-medium text-gray-700">Username</label>
                <input
                  type="text"
                  name="username"
                  value={editData.username}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={editData.email}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700">New Password</label>
                <input
                  type="password"
                  name="password"
                  value={editData.password}
                  onChange={handleChange}
                  placeholder="Leave blank to keep current password"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                />
              </div>

              <div className="flex space-x-4">
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
                      profileImage: null,
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
