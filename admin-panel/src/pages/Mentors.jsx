import React, { useState, useEffect } from "react";
import { initializeApp, getApps } from "firebase/app";
import { Facebook, Twitter, Instagram } from 'lucide-react';
import {
  getDatabase,
  ref,
  push,
  update,
  remove,
  onValue,
} from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCXXSPIcBmSjKYdDTqDkIxrbrsXgKCBG0A",
  authDomain: "src-register-c9557.firebaseapp.com",
  databaseURL: "https://src-register-c9557-default-rtdb.firebaseio.com",
  projectId: "src-register-c9557",
  storageBucket: "src-register-c9557.appspot.com",
  messagingSenderId: "204628060906",
  appId: "1:204628060906:web:78e4dea997a51d991d4593",
  measurementId: "G-6YCC168SGW",
};

const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getDatabase(app);

// Cloudinary helper function for image upload
const uploadImageToCloudinary = async (imageFile) => {
  if (!imageFile || typeof imageFile === 'string') return imageFile;

  const imageData = new FormData();
  imageData.append("file", imageFile);
  imageData.append("upload_preset", "MentorsImages"); // Use appropriate preset name

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/dasjafuhc/image/upload`,
      {
        method: "POST",
        body: imageData,
      }
    );
    
    if (!response.ok) {
      throw new Error(`Cloudinary upload failed with status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.secure_url || null;
  } catch (error) {
    console.error("Image upload error:", error);
    return null;
  }
};

const Mentors = () => {
  const initialFormData = {
    name: "",
    role: "",
    facebook: "",
    twitter: "",
    instagram: ""
  };

  const [formData, setFormData] = useState(initialFormData);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mentors, setMentors] = useState([]);
  const [editingMentorId, setEditingMentorId] = useState(null);

  useEffect(() => {
    const mentorsRef = ref(db, "mentors");
    onValue(mentorsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const mentorsList = Object.entries(data).map(([id, mentor]) => ({
          id,
          ...mentor,
        }));
        setMentors(mentorsList);
      } else {
        setMentors([]);
      }
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
      setImage(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Upload image to Cloudinary if there's a new image
      let imageUrl = null;
      if (image) {
        imageUrl = await uploadImageToCloudinary(image);
        if (!imageUrl) {
          throw new Error("Failed to upload image to Cloudinary");
        }
      } else if (imagePreview && typeof imagePreview === 'string') {
        // If editing and no new image selected, use existing preview
        imageUrl = imagePreview;
      }

      const mentorData = { 
        ...formData, 
        imageUrl: imageUrl,
        social: {
          facebook: formData.facebook,
          twitter: formData.twitter,
          instagram: formData.instagram
        }
      };
      
      // Remove the individual social fields from the top level
      delete mentorData.facebook;
      delete mentorData.twitter;
      delete mentorData.instagram;

      if (editingMentorId) {
        await update(ref(db, `mentors/${editingMentorId}`), mentorData);
        console.log("Mentor updated successfully");
        setEditingMentorId(null);
      } else {
        await push(ref(db, "mentors"), mentorData);
        console.log("Mentor added successfully");
      }
      
      // Reset form
      setFormData(initialFormData);
      setImage(null);
      setImagePreview(null);
    } catch (error) {
      console.error("Mentor operation error:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (mentor) => {
    setFormData({
      name: mentor.name,
      role: mentor.role,
      facebook: mentor.social?.facebook || "",
      twitter: mentor.social?.twitter || "",
      instagram: mentor.social?.instagram || ""
    });
    setImagePreview(mentor.imageUrl);
    setEditingMentorId(mentor.id);
    // Reset image state since we're using the existing image
    setImage(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this mentor?")) {
      try {
        await remove(ref(db, `mentors/${id}`));
        console.log("Mentor deleted successfully");
      } catch (error) {
        console.error("Mentor deletion error:", error);
        alert(`Error deleting mentor: ${error.message}`);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
          {editingMentorId ? "Edit Mentor" : "Add New Mentor"}
        </h2>
        
        {/* Name Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter mentor name"
            required
            className="w-full p-2 border rounded-lg"
          />
        </div>
        
        {/* Role/Position Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
          <input
            name="role"
            value={formData.role}
            onChange={handleChange}
            placeholder="Enter position "
            required
            className="w-full p-2 border rounded-lg"
          />
        </div>
        
        {/* Social Media Links Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-800">Social Media Links</h3>
          
          {/* Facebook */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
              <Facebook className="w-4 h-4 mr-2" /> Facebook
            </label>
            <input
              name="facebook"
              value={formData.facebook}
              onChange={handleChange}
              placeholder="Facebook profile URL"
              className="w-full p-2 border rounded-lg"
            />
          </div>
          
          {/* Twitter */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
              <Twitter className="w-4 h-4 mr-2" /> Twitter
            </label>
            <input
              name="twitter"
              value={formData.twitter}
              onChange={handleChange}
              placeholder="Twitter profile URL"
              className="w-full p-2 border rounded-lg"
            />
          </div>
          
          {/* Instagram */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
              <Instagram className="w-4 h-4 mr-2" /> Instagram
            </label>
            <input
              name="instagram"
              value={formData.instagram}
              onChange={handleChange}
              placeholder="Instagram profile URL"
              className="w-full p-2 border rounded-lg"
            />
          </div>
        </div>
        
        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="w-full p-2 border rounded-lg"
          />
          {imagePreview && (
            <div className="mt-2">
              <img
                src={imagePreview}
                alt="Mentor Preview"
                className="w-32 h-32 object-cover rounded-full mx-auto"
              />
            </div>
          )}
        </div>
      
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
        >
          {loading
            ? "Saving Mentor..."
            : editingMentorId
            ? "Update Mentor"
            : "Add Mentor"}
        </button>
      </form>
      
      {/* Mentors List */}
      <div className="mt-8 w-full max-w-2xl">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Our Mentors</h2>
        {mentors.length === 0 ? (
          <p className="text-center text-gray-500">No mentors added yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {mentors.map((mentor) => (
              <div
                key={mentor.id}
                className="bg-white p-4 rounded-lg shadow-md flex items-center"
              >
                {/* Mentor Image */}
                <div className="flex-shrink-0 mr-4">
                  {mentor.imageUrl ? (
                    <img
                      src={mentor.imageUrl}
                      alt={mentor.name}
                      className="w-16 h-16 object-cover rounded-full"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/api/placeholder/64/64"; // Fallback image
                      }}
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-gray-500">{mentor.name.charAt(0)}</span>
                    </div>
                  )}
                </div>
                
                {/* Mentor Info */}
                <div className="flex-grow">
                  <h3 className="text-lg font-semibold">{mentor.name}</h3>
                  <p className="text-gray-600 text-sm">{mentor.role}</p>
                  
                  {/* Social Links */}
                  <div className="flex space-x-2 mt-1">
                    {mentor.social?.facebook && (
                      <a 
                        href={mentor.social.facebook} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-500 hover:text-blue-600"
                      >
                        <Facebook className="w-4 h-4" />
                      </a>
                    )}
                    {mentor.social?.twitter && (
                      <a 
                        href={mentor.social.twitter} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-500 hover:text-blue-400"
                      >
                        <Twitter className="w-4 h-4" />
                      </a>
                    )}
                    {mentor.social?.instagram && (
                      <a 
                        href={mentor.social.instagram} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-500 hover:text-pink-600"
                      >
                        <Instagram className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex-shrink-0 flex ml-4">
                  <button
                    onClick={() => handleEdit(mentor)}
                    className="bg-yellow-500 text-white p-1 rounded-lg hover:bg-yellow-600 mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(mentor.id)}
                    className="bg-red-500 text-white p-1 rounded-lg hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Mentors;